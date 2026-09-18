/**
 * Safely formats TEMPO native gas balance.
 * Prevents BigInt / Wei saturation overflow into scientific notation (e.g. e+57)
 * and formats clean, human-readable numbers like "1,000.00" or "50.00".
 */
export function formatTempoGas(bal: number | undefined | null): string {
  if (bal === undefined || bal === null || !Number.isFinite(bal)) {
    return '0.00';
  }
  // If a testnet faucet saturation balance somehow arrives (>10,000), cap at 1,000.00
  if (bal > 10000) {
    return '1,000.00';
  }
  return bal.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
