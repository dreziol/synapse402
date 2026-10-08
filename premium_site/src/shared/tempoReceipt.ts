import { ethers } from 'ethers';

export interface TempoReceiptLogLike {
  address?: string;
  topics?: readonly string[];
  data?: string;
}

export interface TempoTransferVerificationInput {
  receiptStatus: number | bigint | null | undefined;
  logs: readonly TempoReceiptLogLike[];
  expectedToken: string;
  expectedRecipient: string;
  /** The amount expected to arrive at the recipient, in the token's base unit. */
  expectedAmountMicro: bigint | string | number;
  receiptTo?: string | null;
  expectedPaymentContract?: string;
}

export interface TempoTransferVerificationResult {
  verified: boolean;
  reason?: string;
  matchingTransfer?: { token: string; recipient: string; amountMicro: string };
}

const transferInterface = new ethers.Interface([
  'event Transfer(address indexed from, address indexed to, uint256 value)',
]);

const addressOrNull = (value: unknown): string | null => {
  try {
    return ethers.getAddress(String(value || ''));
  } catch {
    return null;
  }
};

/**
 * The SynapseVault charges a 0.1% protocol fee (PROTOCOL_FEE_BPS = 10, integer division
 * rounding down), matching the on-chain contract `(amount * 10) / 10000`.
 */
export function tempoPayeeAmountMicro(grossAmountMicro: bigint | string | number): bigint {
  const gross = BigInt(grossAmountMicro);
  const fee = (gross * 10n) / 10000n;
  return gross - fee;
}

/**
 * Canonical receipt proof used by the relayer and provider middleware. A
 * successful transaction is insufficient: the expected TIP-20 token must
 * emit a Transfer to the expected payee for the exact expected amount.
 */
export function verifyTempoTransferReceipt(input: TempoTransferVerificationInput): TempoTransferVerificationResult {
  if (Number(input.receiptStatus) !== 1) return { verified: false, reason: 'Transaction receipt is not successful.' };

  const expectedToken = addressOrNull(input.expectedToken);
  const expectedRecipient = addressOrNull(input.expectedRecipient);
  if (!expectedToken || !expectedRecipient) return { verified: false, reason: 'Expected token or recipient is invalid.' };

  if (input.expectedPaymentContract) {
    const expectedContract = addressOrNull(input.expectedPaymentContract);
    const receiptTarget = addressOrNull(input.receiptTo);
    if (!expectedContract || !receiptTarget || expectedContract.toLowerCase() !== receiptTarget.toLowerCase()) {
      return { verified: false, reason: 'Receipt target is not the configured payment contract.' };
    }
  }

  let expectedAmount: bigint;
  try {
    expectedAmount = BigInt(input.expectedAmountMicro);
  } catch {
    return { verified: false, reason: 'Expected payment amount is invalid.' };
  }
  if (expectedAmount < 0n) return { verified: false, reason: 'Expected payment amount cannot be negative.' };

  for (const log of input.logs || []) {
    const token = addressOrNull(log?.address);
    if (!token || token.toLowerCase() !== expectedToken.toLowerCase()) continue;
    try {
      const parsed = transferInterface.parseLog({ topics: Array.from(log.topics || []), data: log.data || '0x' });
      if (!parsed || parsed.name !== 'Transfer') continue;
      const recipient = addressOrNull(parsed.args.to);
      const amount = BigInt(parsed.args.value);
      if (recipient?.toLowerCase() === expectedRecipient.toLowerCase() && amount === expectedAmount) {
        return {
          verified: true,
          matchingTransfer: { token, recipient, amountMicro: amount.toString() },
        };
      }
    } catch {
      // Ignore unrelated or malformed logs and continue searching for the
      // one exact token transfer required by the payment proof.
    }
  }

  return { verified: false, reason: 'No exact TIP-20 Transfer to the expected payee was found.' };
}

// Public canonical name used by payment consumers; the transfer-focused name
// remains as a descriptive compatibility alias for low-level callers.
export const verifyTempoPaymentReceipt = verifyTempoTransferReceipt;
