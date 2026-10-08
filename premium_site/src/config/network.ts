/** Tempo links are shared with the plain Node CLI through this JS module. */
import { TEMPO_EXPLORER_URL, tempoTransactionUrl } from './tempoExplorer.mjs';
export { TEMPO_EXPLORER_URL, tempoTransactionUrl };

// Canonical Tempo Moderato deployment configuration. Server code may still
// override RPC/payee secrets through environment variables, but the public
// chain, token, and contract identities come from this single source.
export const TEMPO_CHAIN_ID = 42431;
export const TEMPO_RPC_URL = 'https://rpc.moderato.tempo.xyz';
export const TEMPO_PATHUSD_ADDRESS = '0x9aa3ef4B60B6e3c440711658ee05780e236ac714';
/** Tempo fees are paid in a selectable USD-denominated TIP-20 token. */
export const TEMPO_DEFAULT_FEE_TOKEN_ADDRESS = TEMPO_PATHUSD_ADDRESS;
export const TEMPO_DEFAULT_FEE_TOKEN_SYMBOL = 'pathUSD';
export const TEMPO_VAULT_ADDRESS = '0x3c42E274FAdd8e371fB84f97203CC2F2125c8775';
export const TEMPO_RECEIVER_ADDRESS = '0xfCEb1a2633881c19283836a2E17Ba25E612724A0';

// Canonical transaction, address, and block URLs for Tempo Explorer
export const tempoAddressUrl = (address: string) => `${TEMPO_EXPLORER_URL}/address/${address}`;
export const tempoBlockUrl = (block: number | string) => `${TEMPO_EXPLORER_URL}/block/${block}`;
