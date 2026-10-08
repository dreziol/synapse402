/** Canonical Tempo transaction links shared by the app, gateway, and CLI. */
// Tempo Moderato testnet (chainId 42431). Keep receipt links on testnet;
// the unqualified explorer host returns 404 for this project's transactions.
export const TEMPO_EXPLORER_URL = 'https://explore.testnet.tempo.xyz';

/** @param {string} hash */
export const tempoTransactionUrl = (hash) => `${TEMPO_EXPLORER_URL}/tx/${hash}`;
