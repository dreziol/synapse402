import { ethers } from 'ethers';
import { tempoPayeeAmountMicro, verifyTempoPaymentReceipt } from '../src/shared/tempoReceipt';
import { TEMPO_PATHUSD_ADDRESS, TEMPO_VAULT_ADDRESS, TEMPO_RECEIVER_ADDRESS } from '../src/config/network';

const TOKEN = TEMPO_PATHUSD_ADDRESS;
const VAULT = TEMPO_VAULT_ADDRESS;
const PAYEE = TEMPO_RECEIVER_ADDRESS;
const SENDER = '0xa287550D1c3D277caA59C560230AC840e1Ee58B6';
const transferInterface = new ethers.Interface(['event Transfer(address indexed from, address indexed to, uint256 value)']);

const transferLog = (token: string, recipient: string, amount: bigint) => {
  const encoded = transferInterface.encodeEventLog(transferInterface.getEvent('Transfer')!, [SENDER, recipient, amount]);
  return { address: token, topics: encoded.topics, data: encoded.data };
};

const expect = (name: string, passed: boolean, detail: string) => {
  console.log(`${passed ? '✓' : '✕'} ${name}: ${detail}`);
  if (!passed) process.exitCode = 1;
};

const gross = 2000n;
const expectedPayeeAmount = tempoPayeeAmountMicro(gross);
const base = {
  receiptStatus: 1,
  expectedToken: TOKEN,
  expectedRecipient: PAYEE,
  expectedAmountMicro: expectedPayeeAmount,
  receiptTo: VAULT,
  expectedPaymentContract: VAULT,
};

const correct = verifyTempoPaymentReceipt({ ...base, logs: [transferLog(TOKEN, PAYEE, expectedPayeeAmount)] });
expect('A correct token, recipient, and amount confirms', correct.verified, correct.reason || 'confirmed');

const wrongRecipient = verifyTempoPaymentReceipt({ ...base, logs: [transferLog(TOKEN, SENDER, expectedPayeeAmount)] });
expect('B wrong recipient is rejected', !wrongRecipient.verified, wrongRecipient.reason || 'rejected');

const wrongAmount = verifyTempoPaymentReceipt({ ...base, logs: [transferLog(TOKEN, PAYEE, expectedPayeeAmount + 1n)] });
expect('C wrong amount is rejected', !wrongAmount.verified, wrongAmount.reason || 'rejected');

const missingTransfer = verifyTempoPaymentReceipt({ ...base, logs: [] });
expect('D missing Transfer event is rejected', !missingTransfer.verified, missingTransfer.reason || 'rejected');

const wrongToken = verifyTempoPaymentReceipt({ ...base, logs: [transferLog(SENDER, PAYEE, expectedPayeeAmount)] });
expect('F wrong token contract is rejected', !wrongToken.verified, wrongToken.reason || 'rejected');

const wrongContract = verifyTempoPaymentReceipt({ ...base, receiptTo: PAYEE, logs: [transferLog(TOKEN, PAYEE, expectedPayeeAmount)] });
expect('G wrong payment contract is rejected', !wrongContract.verified, wrongContract.reason || 'rejected');

const first = verifyTempoPaymentReceipt({ ...base, logs: [transferLog(TOKEN, PAYEE, expectedPayeeAmount)] });
const retry = verifyTempoPaymentReceipt({ ...base, logs: [transferLog(TOKEN, PAYEE, expectedPayeeAmount)] });
expect('E duplicate/cached proof is deterministic', first.verified && retry.verified && first.matchingTransfer?.amountMicro === retry.matchingTransfer?.amountMicro, 'retries do not create a second proof');

const minimumGross = 1n;
const minNetExpected = tempoPayeeAmountMicro(minimumGross);
const minNet = verifyTempoPaymentReceipt({
  ...base,
  expectedAmountMicro: minNetExpected,
  logs: [transferLog(TOKEN, PAYEE, minNetExpected)],
});
expect('H minimum-unit gross payment verifies its payee transfer', minNet.verified, minNet.reason || 'confirmed');

if (process.exitCode) process.exit(1);
