import * as dotenv from 'dotenv';
import { Request, Response } from 'express';
import crypto from 'crypto';
import net from 'net';
import { lookup as dnsLookup } from 'node:dns/promises';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ethers } from 'ethers';
import {
  TEMPO_CHAIN_ID,
  tempoTransactionUrl,
  TEMPO_PATHUSD_ADDRESS,
  TEMPO_RECEIVER_ADDRESS,
  TEMPO_RPC_URL,
  TEMPO_VAULT_ADDRESS,
} from '../src/config/network';
import { canonicalEndpointHash } from '../src/shared/endpointHash';
import { tempoPayeeAmountMicro, verifyTempoPaymentReceipt as verifyTempoPaymentReceiptProof } from '../src/shared/tempoReceipt';
import { CANONICAL_PROVIDER_REGISTRY } from '../src/config/providerRegistry';

declare const __dirname: string | undefined;
const currentDir = (() => {
  if (typeof __dirname !== 'undefined') return __dirname;
  try {
    const metaUrl = new Function('return import.meta.url')();
    return path.dirname(fileURLToPath(metaUrl));
  } catch {
    return process.cwd();
  }
})();

// Keep credentials in the ignored runtime directory during local development.
// A caller may override this path for a deployment environment.
const candidateEnvPaths = [
  process.env.SYNAPSE_ENV_FILE,
  path.join(currentDir, '.runtime', 'relayer.env'),
  path.join(process.cwd(), 'server', '.runtime', 'relayer.env'),
  path.join(process.cwd(), 'premium_site', 'server', '.runtime', 'relayer.env'),
  path.join(currentDir, '..', '.env'),
  path.join(process.cwd(), 'premium_site', '.env'),
  path.join(process.cwd(), '.env'),
].filter(Boolean) as string[];

for (const envCandidate of candidateEnvPaths) {
  try {
    if (fs.existsSync(envCandidate)) {
      dotenv.config({ path: envCandidate, override: true, quiet: true } as any);
    }
  } catch {}
}

// Runtime ledgers live outside the source tree's tracked files. A clean
// checkout therefore starts from deterministic seeds, while a running local
// instance still keeps receipts and idempotency data across restarts.
const runtimeDirectory = (() => {
  const configured = typeof process !== 'undefined' ? process.env.SYNAPSE_RUNTIME_DIR : undefined;
  const dir = configured ? path.resolve(configured) : path.join(process.cwd(), 'server', '.runtime');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
})();

import { StandardMerkleTree } from '@openzeppelin/merkle-tree';

// Real SHA-256 Hashing helper
export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// OpenZeppelin StandardMerkleTree wrapper matching SynapseVault.sol
export class MerkleTree {
  public tree: StandardMerkleTree<[string]>;
  public leaves: string[];

  constructor(domains: string[]) {
    const cleanDomains = domains.map(d => d.toLowerCase().trim()).filter(Boolean);
    const uniqueDomains = Array.from(new Set(cleanDomains.length > 0 ? cleanDomains : ['https://api.tempo.xyz']));
    this.leaves = uniqueDomains;
    this.tree = StandardMerkleTree.of(uniqueDomains.map(d => [d]), ['string']);
  }

  public getRoot(): string {
    return this.tree.root;
  }

  public getProof(domain: string): string[] {
    const target = domain.toLowerCase().trim();
    for (const [i, v] of this.tree.entries()) {
      if (v[0] === target) {
        return this.tree.getProof(i);
      }
    }
    return [];
  }

  public getLeafHash(domain: string): string {
    const target = domain.toLowerCase().trim();
    // Keep the engine and provider SDK on the same StandardMerkleTree leaf
    // binding (double-keccak over ABI-encoded, normalized endpoint text).
    return canonicalEndpointHash(target);
  }

  public static verifyProof(leaf: string, proof: string[], root: string): boolean {
    return StandardMerkleTree.verify(root, ['string'], [leaf], proof);
  }
}

export interface ScopedSessionKeyRecord {
  id: string;
  agentId: string;
  agentName: string;
  role: string;
  sessionPublicKey: string;
  delegatedBy: string;
  maxPerCallPathUsd: number;
  totalBudgetPathUsd: number;
  currentSpentPathUsd: number;
  whitelistedDomains: string[];
  status: 'ACTIVE' | 'PAUSED' | 'DEPLETED' | 'REVOKED';
  validBeforeTimestamp: number;
  channelId: number;
  sequenceNonce: number;
  lastActive: string;
  merkleRoot: string;
  channelNonces?: Record<number, number>;
}

// Smart Contract ABIs for Live Tempo L1 Interaction
export const SYNAPSE_VAULT_ABI = [
  "constructor(address _token, address _initialOwner)",
  "event Deposited(address indexed depositor, uint256 amount)",
  "event Withdrawn(address indexed owner, address indexed recipient, uint256 amount)",
  "event SessionKeyRegistered(address indexed sessionKey, uint256 maxPerCall, uint256 totalBudget, uint256 validBefore, bytes32 merkleRoot)",
  "event SessionKeyStatusUpdated(address indexed sessionKey, uint8 status)",
  "event SessionBudgetUpdated(address indexed sessionKey, uint256 newTotalBudget, uint256 newMaxPerCall)",
  "event SessionMerkleRootUpdated(address indexed sessionKey, bytes32 oldMerkleRoot, bytes32 newMerkleRoot)",
  "event PaymentSettled(address indexed sessionKey, address indexed payee, uint256 amount, uint64 channelId, uint64 nonce, bytes32 indexed memo, string endpoint)",
  "function deposit(uint256 amount) external",
  "function withdraw(address recipient, uint256 amount) external",
  "function registerSessionKey(address sessionKey, uint256 maxPerCall, uint256 totalBudget, uint256 validBefore, bytes32 merkleRoot) external",
  "function resetDemoSession(address sessionKey, uint256 maxPerCall, uint256 totalBudget, uint256 validBefore, bytes32 merkleRoot) external",
  "function setSessionStatus(address sessionKey, uint8 newStatus) external",
  "function updateSessionBudget(address sessionKey, uint256 newTotalBudget, uint256 newMaxPerCall) external",
  "function updateSessionMerkleRoot(address sessionKey, bytes32 newMerkleRoot) external",
  "function settle402Payment((address sessionKey, uint64 channelId, uint64 nonce, address payee, uint256 amount, string endpoint, bytes32[] merkleProof, bytes32 memo, uint256 deadline, bytes signature) p) external",
  "function getRemainingBudget(address sessionKey) external view returns (uint256)",
  "function totalVaultBalance() external view returns (uint256)",
  "function lastNonce(address sessionKey, uint64 channelId) external view returns (uint64)",
  "function sessionKeys(address sessionKey) external view returns (uint256 maxPerCall, uint256 totalBudget, uint256 currentSpent, uint256 validBefore, bytes32 merkleRoot, uint8 status)",
  "function paymentToken() external view returns (address)",
  "function owner() external view returns (address)"
];

export const SYNAPSE_RECEIVER_ABI = [
  "constructor(address _acceptedToken, address _owner)",
  "event InvoiceCreated(bytes32 indexed invoiceId, address indexed merchant, uint256 amountRequired)",
  "event InvoiceSettled(bytes32 indexed invoiceId, address indexed payer, address indexed merchant, uint256 amount, bytes32 memo, uint256 timestamp)",
  "function createInvoice(bytes32 invoiceId, uint256 amountRequired) external",
  "function settleInvoice(bytes32 invoiceId, bytes32 memo) external",
  "function isInvoicePaid(bytes32 invoiceId) external view returns (bool, address, uint256)"
];

export const TIP20_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)"
];

export interface MPPTraceRecord {
  id: string;
  timestamp: string;
  blockNumber: number;
  agentId: string;
  agentName: string;
  /** Stable mission identifier used to group receipts from one job. */
  jobId?: string;
  /** Provider label supplied by the backend record; never inferred in the UI from a URL. */
  providerName?: string;
  targetEndpoint: string;
  method: 'GET' | 'POST';
  costPathUsd: number;
  latencyMs: number;
  httpStatusBefore: 402;
  httpStatusAfter: number;
  challengeHeader: string;
  authAuthorizationHeader: string;
  eip712Signature: string;
  txHash: string;
  /** Canonical chain explorer link for the active network. */
  explorerUrl?: string;
  executionMode: 'LIVE_TESTNET' | 'RESILIENT_SANDBOX' | 'FAILED_REVERT';
  tempoTxType?: '0x76';
  nonce2D: string;
  memoPayload: string;
  routerFeePathUsd: number;
  tip20Memo: string;
  iso20022Remittance: {
    standard: 'ISO-20022 pacs.008.001.08';
    costCenter: string;
    categoryCode: string;
    invoiceDigest: string;
  };
  merkleProof: string[];
  merkleRoot: string;
  domainHash: string;
  eip712DomainSeparator: string;
  eip712StructHash: string;
  /** Signed fields forwarded to a provider so its middleware can verify the
   * EIP-712 credential instead of trusting a signature-shaped header. */
  mppCredential?: {
    signer: string;
    channelId: number;
    nonce: number;
    payee: string;
    amountMicro: string;
    endpoint: string;
    endpointHash: string;
    memo: string;
    validBefore: number;
    chainId: number;
    verifyingContract: string;
  };
  liveProxyPayload?: any;
  sanctionsCompliance: {
    status: 'UNVERIFIED' | 'FLAGGED';
    policy: string;
    checkedAt: string;
  };
  complianceVerification?: {
    status: 'CLEARED' | 'UNVERIFIED' | 'FLAGGED';
    policy: string;
    checkedAt: string;
  };
  isIdempotentCacheHit?: boolean;
  status?: 'SETTLED' | 'FAILED' | 'SIMULATED_PASS' | 'PENDING' | 'VOIDED' | 'REJECTED' | 'REFUNDED';
  /** True only after the canonical receipt verifier accepted the TIP-20 transfer. */
  receiptVerified?: boolean;
  /** Canonical provider-data provenance; independent from payment proof. */
  providerDataStatus?: 'EVALUATION_FIXTURE' | 'UPSTREAM_RESPONSE' | 'CACHED_TRACE_PAYLOAD' | 'PAYMENT_PENDING' | 'UNVERIFIED';
}

const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;
const isVerifiedTxHash = (value: unknown): value is string =>
  typeof value === 'string' && /^0x[a-fA-F0-9]{64}$/.test(value);

const LEGACY_ALLOWLIST_ARTIFACTS = [
  '127.0.0.1:',
  'localhost:',
  'httpstat.us',
  'non-existent-domain',
  'unreliable-upstream',
];

export const isBlockedOutboundHostname = (hostname: string): boolean => {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '');
  if (!host || host === 'localhost' || host.endsWith('.localhost') || host === 'metadata.google.internal') return true;
  if (host === '0.0.0.0' || host === '::' || host === '::1' || host === '169.254.169.254') return true;
  const ipVersion = net.isIP(host);
  if (ipVersion === 4) {
    const octets = host.split('.').map(Number);
    const [a, b] = octets;
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
  }
  if (ipVersion === 6) {
    const mappedIpv4 = host.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/)?.[1];
    if (mappedIpv4) return isBlockedOutboundHostname(mappedIpv4);
    // WHATWG URL canonicalizes ::ffff:127.0.0.1 to ::ffff:7f00:1.
    // Decode that hexadecimal IPv4-mapped form before applying the private
    // network checks, otherwise it becomes an SSRF bypass.
    const mappedHex = host.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i);
    if (mappedHex) {
      const first = Number.parseInt(mappedHex[1], 16);
      const second = Number.parseInt(mappedHex[2], 16);
      const mapped = `${first >>> 8}.${first & 255}.${second >>> 8}.${second & 255}`;
      return isBlockedOutboundHostname(mapped);
    }
    return host === '::1' || host.startsWith('fc') || host.startsWith('fd') || host.startsWith('fe80:');
  }
  return false;
};

export const isBlockedOutboundUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    return isBlockedOutboundHostname(parsed.hostname);
  } catch {
    return true;
  }
};

/**
 * Shared outbound target guard used before any gateway/provider fetch. Local
 * targets are limited to the gateway's known demo routes; every other target
 * must be public and use http(s).
 */
export function isSafeProviderUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    const port = parsed.port || (parsed.protocol === 'https:' ? '443' : '80');
    const gatewayPort = String(process.env.PORT || 3001);
    const local = parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost';
    const localPrefixes = [
      '/api/v1/data/', '/api/v1/due-diligence/', '/api/v1/media/',
      '/api/v1/market/',
      '/api/v1/test-provider-data', '/api/v1/mock-500', '/api/v1/surge-demo',
      '/api/stream/inference',
    ];
    if (local) {
      return port === gatewayPort && localPrefixes.some((prefix) => parsed.pathname === prefix.replace(/\/$/, '') || parsed.pathname.startsWith(prefix));
    }
    return !isBlockedOutboundHostname(parsed.hostname);
  } catch {
    return false;
  }
}

/**
 * Fetch a provider route without following an unvalidated redirect. Public
 * hostnames are resolved before every request and every resolved address must
 * remain outside private, loopback, link-local, and metadata ranges. Local
 * requests are allowed only for the gateway's finite demo-route allowlist.
 */
export async function safeProviderFetch(value: string, init: globalThis.RequestInit = {}, maxRedirects = 5): Promise<globalThis.Response> {
  let current = new URL(value);
  const visited = new Set<string>();
  let requestInit: globalThis.RequestInit = { ...init, headers: init.headers ? new Headers(init.headers) : undefined };
  const sensitiveHeaders = [
    'authorization', 'proxy-authorization', 'cookie', 'set-cookie', 'x-api-key', 'x-auth-token',
    'idempotency-key', 'x-tempo-mpp-signature', 'x-tempo-mpp-signer', 'x-tempo-mpp-payee',
    'x-tempo-mpp-amount-micro', 'x-tempo-mpp-endpoint', 'x-tempo-mpp-endpoint-hash',
    'x-tempo-mpp-memo', 'x-tempo-mpp-valid-before', 'x-tempo-mpp-chain-id',
    'x-tempo-mpp-verifying-contract', 'x-tempo-mpp-channel-id', 'x-tempo-mpp-nonce',
    'x-tempo-tx-hash', 'x-synapse-trace-id', 'x-tempo-challenge-id',
  ];
  for (let hop = 0; hop <= maxRedirects; hop += 1) {
    const currentUrl = current.toString();
    if (visited.has(currentUrl)) throw new Error('Provider redirect loop detected.');
    visited.add(currentUrl);
    if (!isSafeProviderUrl(currentUrl)) throw new Error('Provider target is not an approved public or local demo route.');

    const isLocalGateway = (current.hostname === '127.0.0.1' || current.hostname === 'localhost');
    if (!isLocalGateway) {
      const addresses = await dnsLookup(current.hostname, { all: true, verbatim: true });
      if (!addresses.length || addresses.some((entry) => isBlockedOutboundHostname(entry.address))) {
        throw new Error('Provider hostname resolves to a private, link-local, or metadata address.');
      }
    }

    const response = await fetch(currentUrl, { ...requestInit, redirect: 'manual' });
    if (![301, 302, 303, 307, 308].includes(response.status)) return response;
    const location = response.headers.get('location');
    try { await response.body?.cancel(); } catch { /* best effort */ }
    if (!location) return response;
    const next = new URL(location, currentUrl);
    if (next.origin !== current.origin && requestInit.headers) {
      const safeHeaders = new Headers(requestInit.headers);
      for (const header of sensitiveHeaders) safeHeaders.delete(header);
      requestInit = { ...requestInit, headers: safeHeaders };
    }
    current = next;
  }
  throw new Error(`Provider redirect limit exceeded (${maxRedirects}).`);
}

const normalizeAllowlistEntries = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const entries: string[] = [];
  for (const raw of value) {
    if (typeof raw !== 'string') continue;
    const entry = raw.trim();
    if (!entry || entry.length > 2048) continue;
    const lower = entry.toLowerCase();
    if (LEGACY_ALLOWLIST_ARTIFACTS.some((artifact) => lower.includes(artifact))) continue;
    let canonical = entry;
    try {
      // Relative entries are reserved for the gateway's finite local demo
      // routes. Everything else must be an explicit public http(s) URL; do
      // not preserve malformed strings from an old state file.
      const isRelativeLocal = entry.startsWith('/');
      const parsed = isRelativeLocal
        ? new URL(entry, `http://127.0.0.1:${process.env.PORT || 3001}`)
        : new URL(entry);
      if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) continue;
      if (isRelativeLocal) {
        if (!isSafeProviderUrl(parsed.toString())) continue;
        canonical = `${parsed.pathname.replace(/\/+$/, '') || '/'}${parsed.search}`;
      } else {
        if (isBlockedOutboundHostname(parsed.hostname) || parsed.hash) continue;
        canonical = `${parsed.protocol}//${parsed.host}${parsed.pathname.replace(/\/+$/, '') || '/'}${parsed.search}`;
      }
    } catch {
      continue;
    }
    const dedupeKey = canonical.toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    entries.push(canonical);
  }
  return entries;
};

/** Match a request to the exact host/port/query and an approved route prefix. */
const findMatchingAllowlistEntry = (targetUrl: string, allowlist: string[]): string | null => {
  let target: URL;
  try { target = new URL(targetUrl, `http://127.0.0.1:${process.env.PORT || 3001}`); } catch { return null; }
  for (const entry of allowlist) {
    try {
      const configured = new URL(entry, `http://127.0.0.1:${process.env.PORT || 3001}`);
      const targetPort = target.port || (target.protocol === 'https:' ? '443' : '80');
      const configuredPort = configured.port || (configured.protocol === 'https:' ? '443' : '80');
      if (configured.protocol !== target.protocol
        || configured.hostname.toLowerCase() !== target.hostname.toLowerCase()
        || configuredPort !== targetPort) continue;
      if ((target.search || configured.search) && target.search !== configured.search) continue;
      const configuredPath = configured.pathname.replace(/\/+$/, '') || '/';
      const targetPath = target.pathname.replace(/\/+$/, '') || '/';
      if (configuredPath === '/' || targetPath === configuredPath || targetPath.startsWith(`${configuredPath}/`)) return entry;
    } catch {
      // Invalid legacy entries are ignored; normalization removes them on load.
    }
  }
  return null;
};

/**
 * Executes an RPC call with exponential backoff retry and per-attempt timeout.
 * Guarantees resilience against transient network latency, RPC throttling, or dropped packets.
 */
async function retryRpc<T>(fn: () => Promise<T>, retries = 3, delayMs = 250, timeoutMs = 3500): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`RPC call timed out after ${timeoutMs}ms`)), timeoutMs)
      );
      return await Promise.race([fn(), timeoutPromise]);
    } catch (err: any) {
      lastError = err;
      if (attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

class SynapseStateEngine {
  private blockHeight: number = 0;
  private vaultTvl: number = 50.0;
  private protocolRevenue: number = 0.0;
  private totalSettlements: number = 0;
  private totalVolume: number = 0.0;

  private keys: Map<string, ScopedSessionKeyRecord> = new Map();
  private traces: MPPTraceRecord[] = [];
  private idempotencyCache: Map<string, { trace: MPPTraceRecord; timestamp: number }> = new Map();
  private inFlightIdempotency: Map<string, Promise<any>> = new Map();
  private settlementLocks: Map<string, Promise<void>> = new Map();
  private endpoints: Array<{ id: string; title: string; endpointUrl: string; pricePerCallUsd: number; category: string; payee?: string; totalCalls?: number; totalEarnedUsd?: number }> = [];
  private walletBalancesCache: Map<string, { data: any; timestamp: number }> = new Map();
  // The local trace ledger is rebuilt from these chain events so a restart or
  // a dropped HTTP response cannot hide a confirmed payment. This cursor is
  // persisted and advances only after a successful read-only RPC scan.
  private lastSettlementScanBlock: number = 0;
  private lastSettlementScanAt: number = 0;
  private settlementScanInFlight: Promise<void> | null = null;

  private get idempotencyStatePath(): string {
    return path.join(path.dirname(this.stateFilePath), 'idempotency.json');
  }

  public provider: ethers.JsonRpcProvider;
  public vaultAddress: string = process.env.TEMPO_VAULT_ADDRESS || TEMPO_VAULT_ADDRESS;
  public receiverAddress: string = process.env.TEMPO_RECEIVER_ADDRESS || TEMPO_RECEIVER_ADDRESS;
  public pathUsdAddress: string = process.env.TEMPO_PATHUSD_ADDRESS || TEMPO_PATHUSD_ADDRESS;
  public chainId: number = TEMPO_CHAIN_ID;

  public vaultContract: ethers.Contract;
  public relayerWallet: ethers.Wallet | ethers.HDNodeWallet;
  private vaultOwnerWallet: ethers.Wallet | ethers.HDNodeWallet | null = null;
  private vaultAdminReady = false;
  private vaultAdminReason = 'Checking vault owner authorization…';
  public networkMode: 'LIVE_TESTNET' | 'RESILIENT_SANDBOX' = 'RESILIENT_SANDBOX';
  public networkModeReason = 'Checking Tempo RPC connectivity…';
  public vaultBytecodePresent: boolean = false;
  public lastMeasuredRpcLatencyMs: number = 14;
  public lastGasPriceGwei: string = '12.4';
  public lastMeasuredFeeUsd: string = '0.000018';
  private relayerTxQueue: Promise<any> = Promise.resolve();

  public async dispatchRelayerTx<T>(action: () => Promise<T>): Promise<T> {
    const next = this.relayerTxQueue.then(() => action());
    this.relayerTxQueue = next.catch(() => {});
    return next;
  }

  constructor() {
    // Tempo Moderato exposes a stable chain ID, but its public RPC can
    // occasionally reject ethers' startup autodetect request. Supplying the
    // known network keeps a transient detection miss from forcing the whole
    // app into RESILIENT_SANDBOX while normal RPC calls are still healthy.
    this.provider = new ethers.JsonRpcProvider(
      process.env.TEMPO_RPC_URL || TEMPO_RPC_URL,
      { name: 'tempo-moderato', chainId: TEMPO_CHAIN_ID },
      { staticNetwork: true },
    );
    
    // Auto-provision relayer wallet (secure random fallback if no private key configured)
    const relayerKey = process.env.TEMPO_RELAYER_KEY || process.env.PRIVATE_KEY;
    if (relayerKey) {
      this.relayerWallet = new ethers.Wallet(relayerKey, this.provider);
    } else {
      // Cryptographically secure random wallet so no publicly known key can be front-run
      this.relayerWallet = ethers.Wallet.createRandom(this.provider);
    }

    const vaultOwnerKey = process.env.TEMPO_VAULT_OWNER_KEY || process.env.TEMPO_OWNER_KEY;
    if (vaultOwnerKey) {
      this.vaultOwnerWallet = new ethers.Wallet(vaultOwnerKey, this.provider);
    }

    // Connect contract instance
    this.vaultContract = new ethers.Contract(this.vaultAddress, SYNAPSE_VAULT_ABI, this.provider);

    const restored = this.loadPersistedState();
    if (!restored) {
      this.seedInitialState();
      this.seedEndpoints();
      this.persistState();
    }
    // Keep persisted live receipts visible while the asynchronous RPC probe
    // runs. If the probe fails, initLiveSync applies the explicit sandbox reset;
    // if it succeeds, receipts and counters are reconciled from Tempo instead
    // of being erased during every server restart.
    if (!restored) {
      this.vaultTvl = 0;
      this.protocolRevenue = 0;
      this.totalSettlements = 0;
      this.totalVolume = 0;
      this.keys.forEach((key) => {
        key.currentSpentPathUsd = 0;
        key.status = 'ACTIVE';
        key.sequenceNonce = 0;
        key.channelNonces = {};
      });
      this.persistState();
    }
    this.initLiveSync();
  }

  private stateFilePath: string = (() => {
    return path.join(runtimeDirectory, 'synapseState.json');
  })();

  private loadPersistedState(): boolean {
    try {
      if (fs.existsSync(this.stateFilePath)) {
        const raw = fs.readFileSync(this.stateFilePath, 'utf-8');
        const data = JSON.parse(raw);
        if (data && Array.isArray(data.keys)) {
          this.vaultTvl = typeof data.vaultTvl === 'number' ? data.vaultTvl : this.vaultTvl;
          this.protocolRevenue = typeof data.protocolRevenue === 'number' ? data.protocolRevenue : this.protocolRevenue;
          this.totalSettlements = typeof data.totalSettlements === 'number' ? data.totalSettlements : this.totalSettlements;
          this.totalVolume = typeof data.totalVolume === 'number' ? data.totalVolume : this.totalVolume;
          this.lastSettlementScanBlock = typeof data.lastSettlementScanBlock === 'number' ? data.lastSettlementScanBlock : 0;
          this.keys.clear();
          let allowlistMigrated = false;
          for (const k of data.keys) {
            const originalAllowlist = Array.isArray(k.whitelistedDomains) ? k.whitelistedDomains : [];
            const cleanedAllowlist = normalizeAllowlistEntries(originalAllowlist);
            const requiredEndpointsByKey: Record<string, string[]> = {
              key_quant_alpha: [
                'https://api.fin-depth.io/v2/aapl/orderbook',
                'https://api.market-depth-mesh.io/v3/depth/l2',
                'https://data.sec.gov/api/xbrl/companyfacts',
                'https://api.certik.com/v1/fuzz/opcodes',
                'https://api.fin-depth.io/v2/sol/orderbook',
                '/api/v1/market/sol-depth',
                '/api/v1/market/sol-orderbook',
                '/api/v1/data/sol-orderbook',
                '/api/v1/test-provider-data',
                '/api/v1/mock-500',
                '/api/v1/surge-demo',
                '/api/stream/inference',
              ],
              key_cortex_research: [
                'https://data.sec.gov/api/xbrl/companyfacts',
              ],
              key_sec_audit: [
                'https://api.certik.com/v1/fuzz/opcodes',
                'https://api.fin-depth.io/v2/aapl/orderbook',
                'https://api.fin-depth.io/v2/sol/orderbook',
                '/api/v1/market/sol-depth',
                '/api/v1/market/sol-orderbook',
                '/api/v1/data/sol-orderbook',
              ],
            };
            const requiredEndpoints = requiredEndpointsByKey[String(k.id)] || [];
            if (requiredEndpoints.length > 0) {
              for (const ep of requiredEndpoints) {
                if (!cleanedAllowlist.includes(ep)) {
                  cleanedAllowlist.push(ep);
                  allowlistMigrated = true;
                }
              }
            }
            if (cleanedAllowlist.length !== originalAllowlist.length || cleanedAllowlist.some((entry, index) => entry !== originalAllowlist[index])) {
              allowlistMigrated = true;
            }
            k.whitelistedDomains = cleanedAllowlist;
            k.merkleRoot = new MerkleTree(cleanedAllowlist).getRoot();
            // Session wallets are derived from a server secret. Migrate legacy
            // public fixture addresses before they can be used for a payment;
            // live settlement will register the migrated key on-chain.
            const derivedAddress = this.getWalletForKey(String(k.id)).address;
            if (ethers.isAddress(derivedAddress) && k.sessionPublicKey !== derivedAddress) {
              k.sessionPublicKey = derivedAddress;
              k.sequenceNonce = 0;
              k.channelNonces = { [k.channelId || 1]: 0 };
            }
            this.keys.set(k.id, k);
          }
          const now = Date.now();
          const persistedIdempotency = Array.isArray(data.idempotencyCache) ? data.idempotencyCache : [];
          for (const item of persistedIdempotency) {
            if (!item || typeof item.key !== 'string' || !item.trace || !Number.isFinite(Number(item.timestamp))) continue;
            if (now - Number(item.timestamp) >= 24 * 60 * 60 * 1000) continue;
            this.idempotencyCache.set(item.key, {
              trace: this.normalizePersistedTrace(item.trace as MPPTraceRecord),
              timestamp: Number(item.timestamp),
            });
          }
          try {
            if (fs.existsSync(this.idempotencyStatePath)) {
              const ledger = JSON.parse(fs.readFileSync(this.idempotencyStatePath, 'utf8'));
              if (Array.isArray(ledger)) {
                for (const item of ledger) {
                  if (!item || typeof item.key !== 'string' || !item.trace || !Number.isFinite(Number(item.timestamp))) continue;
                  if (now - Number(item.timestamp) >= 24 * 60 * 60 * 1000) continue;
                  this.idempotencyCache.set(item.key, {
                    trace: this.normalizePersistedTrace(item.trace as MPPTraceRecord),
                    timestamp: Number(item.timestamp),
                  });
                }
              }
            }
          } catch (ledgerErr: any) {
            console.warn(`[Synapse402 Engine] Idempotency ledger could not be restored: ${ledgerErr?.message || ledgerErr}`);
          }
          const persistedTraces = Array.isArray(data.traces) ? data.traces as MPPTraceRecord[] : [];
          if (persistedTraces.length > 0) {
            // Older records may store a chain hash only inside the payload;
            // normalize them first, then let the canonical receipt verifier
            // promote them to confirmed only after the TIP-20 transfer check.
            this.traces = persistedTraces.map((trace) => this.normalizePersistedTrace(trace));
          }
          const confirmed = this.traces.filter((trace) =>
            trace.executionMode === 'LIVE_TESTNET'
            && trace.status === 'SETTLED'
            && trace.receiptVerified === true
            && isVerifiedTxHash(trace.txHash)
            && trace.id !== 'trace_init_001'
          );
          // Rebuild the aggregate from verified traces. Keeping the larger
          // persisted value would resurrect phantom settlements after a
          // receipt was invalidated or removed during reconciliation.
          this.totalSettlements = confirmed.length;
          this.totalVolume = Number(confirmed.reduce((sum, trace) => sum + Number(trace.costPathUsd || 0), 0).toFixed(6));
          this.protocolRevenue = Number(confirmed.reduce((sum, trace) => sum + Math.max(0.000001, Number(trace.costPathUsd || 0) * 0.001), 0).toFixed(6));
          if (Array.isArray(data.endpoints) && data.endpoints.length > 0) {
            // Rebuild provider counters from confirmed traces. Persisted demo counters
            // must never appear as real earnings or request volume after a restart.
            const confirmed = this.traces.filter((trace) =>
              trace.executionMode === 'LIVE_TESTNET'
              && trace.status === 'SETTLED'
              && trace.receiptVerified === true
              && isVerifiedTxHash(trace.txHash)
            );
            const restoredEndpoints = data.endpoints.map((endpoint: any) => {
              const matching = confirmed.filter((trace) =>
                String(trace.targetEndpoint || '').includes(String(endpoint.endpointUrl || ''))
                || String(endpoint.endpointUrl || '').includes(String(trace.targetEndpoint || ''))
              );
              return {
                ...endpoint,
                totalCalls: matching.length,
                totalEarnedUsd: Number(matching.reduce((sum, trace) => sum + Number(trace.costPathUsd || 0), 0).toFixed(6)),
              };
            });
            this.endpoints = this.mergeCanonicalEndpoints(restoredEndpoints);
            // Restore custom routes, but always make the canonical catalog
            // available so old state files cannot hide a supported demo route.
            for (const canonical of CANONICAL_PROVIDER_REGISTRY) {
              if (!this.endpoints.some((endpoint) => endpoint.id === canonical.id || endpoint.endpointUrl === canonical.endpointUrl)) {
                this.endpoints.push({ ...canonical, totalCalls: 0, totalEarnedUsd: 0 });
              }
            }
            this.persistState();
          } else {
            this.seedEndpoints();
          }
          if (allowlistMigrated) {
            // Persist the cleaned scope so a restart cannot resurrect stale
            // localhost/test-provider entries or duplicate route leaves.
            this.persistState();
          }
          const isStdio = typeof process !== 'undefined' && process.argv && process.argv.some(a => a.includes('mcpServer') || a === '--stdio');
          if (isStdio) {
            console.error(`[Synapse402 Engine] Restored persisted state (${this.keys.size} agents, TVL: $${this.vaultTvl.toFixed(2)})`);
          } else {
            console.log(`[Synapse402 Engine] Restored persisted state (${this.keys.size} agents, TVL: $${this.vaultTvl.toFixed(2)})`);
          }
          return true;
        }
      }
    } catch (err: any) {
      console.warn(`[Synapse402 Engine] Could not load persisted state: ${err?.message}`);
    }
    this.seedEndpoints();
    return false;
  }

  private normalizePersistedTrace(trace: MPPTraceRecord): MPPTraceRecord {
    const payload = trace.liveProxyPayload && typeof trace.liveProxyPayload === 'object'
      ? trace.liveProxyPayload as Record<string, any>
      : null;
    // Old demo snapshots used compliance words such as CLEARED even though no
    // sanctions/KYC provider was queried. Normalize that stale copy on restore
    // so a restart cannot resurrect an unsupported compliance claim.
    const normalizedSanctionsCompliance = {
      ...(trace.sanctionsCompliance || {}),
      status: trace.sanctionsCompliance?.status === 'FLAGGED' ? 'FLAGGED' as const : 'UNVERIFIED' as const,
      policy: 'Example compliance response — no live sanctions or KYC lookup was run',
      checkedAt: trace.sanctionsCompliance?.checkedAt || trace.timestamp || new Date().toISOString(),
    };
    const payloadTxHash = isVerifiedTxHash(payload?.txHash)
      ? payload.txHash
      : '';
    const chainVerified = payload?.backfilledFromChain === true
      || String(trace.complianceVerification?.policy || '').toLowerCase().includes('chain receipt verified');
    if (!isVerifiedTxHash(trace.txHash) && payloadTxHash && chainVerified) {
      return {
        ...trace,
        sanctionsCompliance: normalizedSanctionsCompliance,
        txHash: payloadTxHash,
        explorerUrl: tempoTransactionUrl(payloadTxHash),
        executionMode: 'LIVE_TESTNET',
        status: trace.receiptVerified === true ? 'SETTLED' : 'PENDING',
        receiptVerified: trace.receiptVerified === true,
        blockNumber: Number(payload?.blockNumber || trace.blockNumber || 0),
        liveProxyPayload: {
          ...payload,
          txHash: payloadTxHash,
          explorerUrl: tempoTransactionUrl(payloadTxHash),
          upstreamVerified: false,
          paymentConfirmed: trace.receiptVerified === true,
          providerDataStatus: payload?.providerDataStatus || 'EVALUATION_FIXTURE',
          executionMode: 'LIVE_TESTNET',
        },
      };
    }
    if (isVerifiedTxHash(trace.txHash)) {
      const receiptVerified = trace.receiptVerified === true;
      return {
        ...trace,
        executionMode: 'LIVE_TESTNET',
        status: trace.status === 'VOIDED'
          ? 'VOIDED'
          : (trace.status === 'REFUNDED'
            ? 'REFUNDED'
            : (trace.status === 'FAILED' ? 'FAILED' : (receiptVerified ? 'SETTLED' : 'PENDING'))),
        receiptVerified,
        sanctionsCompliance: normalizedSanctionsCompliance,
        explorerUrl: tempoTransactionUrl(trace.txHash),
        liveProxyPayload: payload
          ? {
            ...payload,
            explorerUrl: tempoTransactionUrl(trace.txHash),
            paymentConfirmed: receiptVerified,
            providerDataStatus: payload.providerDataStatus || 'EVALUATION_FIXTURE',
          }
          : trace.liveProxyPayload,
      };
    }
    // Evaluation/sandbox records must never retain a proof-looking hash or
    // explorer URL. A stale URL makes an unsubmitted payment look like a
    // confirmed chain transaction and leads reviewers to a 404 page.
    return {
      ...trace,
      sanctionsCompliance: normalizedSanctionsCompliance,
      txHash: '',
      explorerUrl: undefined,
      liveProxyPayload: payload
        ? {
          ...payload,
          txHash: undefined,
          explorerUrl: undefined,
          paymentConfirmed: false,
          upstreamVerified: false,
        }
        : trace.liveProxyPayload,
    };
  }

  /** Fetch and verify one Tempo receipt through the shared TIP-20 proof. */
  public async verifyTempoPaymentReceipt(
    txHash: string,
    expectedPayee: string,
    expectedGrossAmountMicro: bigint | string | number,
  ) {
    const receipt = await retryRpc(() => this.provider.getTransactionReceipt(txHash), 3, 250, 8000);
    if (!receipt) return { verified: false, reason: 'Tempo transaction receipt is not available yet.' };
    const netProof = verifyTempoPaymentReceiptProof({
      receiptStatus: receipt.status,
      logs: receipt.logs as any,
      expectedToken: this.pathUsdAddress,
      expectedRecipient: expectedPayee,
      expectedAmountMicro: tempoPayeeAmountMicro(expectedGrossAmountMicro),
      receiptTo: receipt.to,
      expectedPaymentContract: this.vaultAddress,
    });
    if (netProof.verified) return netProof;
    return verifyTempoPaymentReceiptProof({
      receiptStatus: receipt.status,
      logs: receipt.logs as any,
      expectedToken: this.pathUsdAddress,
      expectedRecipient: expectedPayee,
      expectedAmountMicro: BigInt(expectedGrossAmountMicro),
      receiptTo: receipt.to,
      expectedPaymentContract: this.vaultAddress,
    });
  }

  private seedEndpoints(): void {
    this.endpoints = CANONICAL_PROVIDER_REGISTRY.map((entry) => ({
      ...entry,
      totalCalls: 0,
      totalEarnedUsd: 0,
    }));
    return;
  }

  private mergeCanonicalEndpoints(existing: any[]): any[] {
    const legacyIds: Record<string, string> = {
      ep_9: 'ep_demo_market_depth',
      ep_10: 'ep_demo_sec',
      ep_binance: 'ep_demo_market_depth',
      ep_sec: 'ep_demo_sec',
    };
    const byId = new Map<string, any>();
    for (const endpoint of existing) {
      const canonicalId = legacyIds[endpoint.id] || endpoint.id;
      if (!byId.has(canonicalId)) byId.set(canonicalId, endpoint);
    }
    const canonicalIds = new Set(CANONICAL_PROVIDER_REGISTRY.map((entry) => entry.id));
    const canonical = CANONICAL_PROVIDER_REGISTRY.map((entry) => {
      const stored = byId.get(entry.id);
      return {
        ...entry,
        totalCalls: Number(stored?.totalCalls || 0),
        totalEarnedUsd: Number(stored?.totalEarnedUsd || 0),
      };
    });
    const custom = existing.filter((endpoint) => {
      const mappedId = legacyIds[endpoint.id] || endpoint.id;
      return !canonicalIds.has(mappedId) && !Object.prototype.hasOwnProperty.call(legacyIds, endpoint.id);
    });
    return [...canonical, ...custom];
  }

  public getEndpoints() {
    return this.endpoints;
  }

  /** Resolve the payee approved for an exact registered provider route. */
  public getApprovedPayeeForEndpoint(targetUrl: string): string | null {
    const match = this.endpoints.find((endpoint) => findMatchingAllowlistEntry(targetUrl, [endpoint.endpointUrl]) !== null);
    if (!match) return null;
    return match.payee || this.receiverAddress;
  }

  public addEndpoint(ep: { title: string; endpointUrl: string; pricePerCallUsd: number; category: string; payee?: string }) {
    if (this.endpoints.length >= 512) throw new Error('Provider registry is full; remove an unused route before adding another.');
    const title = String(ep.title || '').trim();
    const endpointUrl = String(ep.endpointUrl || '').trim();
    const pricePerCallUsd = Number(ep.pricePerCallUsd);
    if (!title || title.length > 160) throw new Error('Endpoint title must be 1–160 characters.');
    const category = String(ep.category || 'General API').trim() || 'General API';
    if (category.length > 120) throw new Error('Endpoint category must be no more than 120 characters.');
    try {
      const parsed = new URL(endpointUrl);
      if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) throw new Error('invalid protocol');
      if (isBlockedOutboundHostname(parsed.hostname)) throw new Error('private, localhost, link-local, and metadata endpoints are not allowed.');
    } catch {
      throw new Error('endpointUrl must be a valid http:// or https:// URL.');
    }
    if (!Number.isFinite(pricePerCallUsd) || pricePerCallUsd <= 0 || pricePerCallUsd > 1000) {
      throw new Error('pricePerCallUsd must be a positive number no greater than $1,000.');
    }
    let payee = this.receiverAddress;
    if (ep.payee !== undefined && String(ep.payee).trim()) {
      try { payee = ethers.getAddress(String(ep.payee).trim()); }
      catch { throw new Error('payee must be a valid EVM address.'); }
    }
    // A millisecond timestamp alone collides when two providers are added in
    // the same tick. Keep ids readable while adding cryptographic entropy.
    let endpointId = '';
    do {
      endpointId = `ep_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;
    } while (this.endpoints.some((existing) => existing.id === endpointId));
    const newEp = {
      id: endpointId,
      title,
      endpointUrl,
      pricePerCallUsd,
      category,
      payee,
    };
    this.endpoints.unshift(newEp);
    this.persistState();
    return newEp;
  }

  public async resetDemoState(keyId?: string): Promise<{ success: boolean; message: string }> {
    const keysToReset = keyId ? [this.keys.get(keyId)].filter(Boolean) : Array.from(this.keys.values());
    for (const key of keysToReset as ScopedSessionKeyRecord[]) {
      // LIVE state is changed locally only after the explicit reset transaction
      // has been mined. This keeps the local budget from diverging when the
      // chain rejects a reset or the relayer is unavailable.
      if (this.networkMode === 'LIVE_TESTNET') {
        if (!this.vaultBytecodePresent || !this.relayerWallet || !key.sessionPublicKey) {
          return { success: false, message: 'Live reset requires a configured SynapseVault, relayer, and session key.' };
        }
        try {
          const resetBudget = BigInt(Math.round((key.totalBudgetPathUsd || 10) * 1e6));
          const resetMaxPerCall = BigInt(Math.round(Math.min(key.maxPerCallPathUsd || 10, key.totalBudgetPathUsd || 10) * 1e6));
          const resetMerkleRoot = (key.merkleRoot && key.merkleRoot.length === 66)
            ? key.merkleRoot
            : new MerkleTree(key.whitelistedDomains).getRoot();
          const validBefore = BigInt(Math.floor(Date.now() / 1000) + 86400 * 30);
          const adminWallet = await this.getVaultAdminWallet();
          const resetTx = await this.dispatchRelayerTx(async () => {
            const tx = await (this.vaultContract.connect(adminWallet) as any).resetDemoSession(
              key.sessionPublicKey,
              resetMaxPerCall,
              resetBudget,
              validBefore,
              resetMerkleRoot,
              { gasLimit: 1600000 },
            );
            await tx.wait(1);
            return tx;
          });
          console.log(`[Synapse402 Engine] On-chain session key reset confirmed for ${key.sessionPublicKey}: ${resetTx.hash}`);
        } catch (err: any) {
          return { success: false, message: `Live reset failed; local state was left unchanged: ${err?.message || 'unknown error'}` };
        }
      }

      key.currentSpentPathUsd = 0;
      key.status = 'ACTIVE';
      if (this.networkMode !== 'LIVE_TESTNET') {
        key.sequenceNonce = 0;
        key.channelNonces = {};
      }
      (key as any).lastResetAt = Date.now();
    }
    this.persistState();
    return {
      success: true,
      message: this.networkMode === 'LIVE_TESTNET'
        ? 'Live session reset confirmed on-chain and local state synchronized.'
        : 'Demo state successfully reset.'
    };
  }

  public persistState(): void {
    try {
      const dir = path.dirname(this.stateFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data = {
        vaultTvl: this.vaultTvl,
        protocolRevenue: this.protocolRevenue,
        totalSettlements: this.totalSettlements,
        totalVolume: this.totalVolume,
        lastSettlementScanBlock: this.lastSettlementScanBlock,
        keys: Array.from(this.keys.values()),
        // Receipts are the audit ledger. Keep the complete history; UI pages
        // paginate it, but a restart must never silently delete older proof.
        traces: this.traces,
        endpoints: this.endpoints,
        idempotencyCache: Array.from(this.idempotencyCache.entries())
          .filter(([, value]) => Date.now() - value.timestamp < 24 * 60 * 60 * 1000)
          .slice(-2000)
          .map(([key, value]) => ({ key, ...value })),
      };
      try {
        const tmpPath = `${this.stateFilePath}.${process.pid}.tmp`;
        fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
        try {
          fs.renameSync(tmpPath, this.stateFilePath);
        } catch {
          fs.copyFileSync(tmpPath, this.stateFilePath);
          try { fs.unlinkSync(tmpPath); } catch (unlinkErr: any) {
            console.debug(`[Synapse402 Engine] Temp file unlink notice: ${unlinkErr?.message}`);
          }
        }
      } catch (writeErr: any) {
        console.debug(`[Synapse402 Engine] Fallback direct state write: ${writeErr?.message}`);
        fs.writeFileSync(this.stateFilePath, JSON.stringify(data, null, 2), 'utf-8');
      }
      this.persistIdempotencyLedger();
    } catch (err: any) {
      console.warn(`[Synapse402 Engine] Could not persist state: ${err?.message}`);
    }
  }

  private persistIdempotencyLedger(): void {
    try {
      const ledger = Array.from(this.idempotencyCache.entries())
        .filter(([, value]) => Date.now() - value.timestamp < 24 * 60 * 60 * 1000)
        .slice(-2000)
        .map(([key, value]) => ({ key, ...value }));
      const tempPath = `${this.idempotencyStatePath}.${process.pid}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(ledger, null, 2), 'utf-8');
      try { fs.renameSync(tempPath, this.idempotencyStatePath); }
      catch { fs.copyFileSync(tempPath, this.idempotencyStatePath); try { fs.unlinkSync(tempPath); } catch {} }
    } catch (err: any) {
      console.warn(`[Synapse402 Engine] Idempotency ledger could not be persisted: ${err?.message || err}`);
    }
  }

  /**
   * Reconcile the local receipt feed with SynapseVault.PaymentSettled logs.
   * This is intentionally read-only: it never signs, sends, or retries a
   * settlement. It exists so confirmed payments remain visible after a
   * process restart, even if the original HTTP response was lost.
   */
  private async reconcileOnChainSettlements(): Promise<void> {
    if (this.networkMode !== 'LIVE_TESTNET' || !this.vaultBytecodePresent) return;
    if (this.settlementScanInFlight) return this.settlementScanInFlight;

    this.settlementScanInFlight = (async () => {
      try {
        const latest = await retryRpc(() => this.provider.getBlockNumber(), 3, 250, 8000);
        const toBlock = Math.max(0, latest - 2);
        const configuredKeys = Array.from(this.keys.values()).filter((key) => ethers.isAddress(key.sessionPublicKey));
        if (configuredKeys.length === 0 || toBlock <= 0) return;

        const addressToKey = new Map(configuredKeys.map((key) => [key.sessionPublicKey.toLowerCase(), key]));
        const indexedKeys = configuredKeys.map((key) => ethers.zeroPadValue(key.sessionPublicKey, 32));
        const eventTopic = ethers.id('PaymentSettled(address,address,uint256,uint64,uint64,bytes32,string)');
        // A bounded first scan catches settlements made before this server was
        // started; subsequent scans use the persisted cursor and are tiny.
        const fromBlock = this.lastSettlementScanBlock > 0
          ? this.lastSettlementScanBlock + 1
          : Math.max(0, toBlock - 50000);
        if (fromBlock > toBlock) return;

        const existingHashes = new Set(
          this.traces
            .filter((trace) => trace.executionMode === 'LIVE_TESTNET' && trace.receiptVerified === true && trace.txHash?.startsWith('0x'))
            .map((trace) => trace.txHash.toLowerCase()),
        );
        const blockTimestamps = new Map<number, number>();
        const added: MPPTraceRecord[] = [];
        let updatedExisting = 0;
        const chunkSize = 1000;

        for (let cursor = fromBlock; cursor <= toBlock; cursor += chunkSize) {
          const chunkEnd = Math.min(toBlock, cursor + chunkSize - 1);
          const logs = await retryRpc(
            () => this.provider.getLogs({
              address: this.vaultAddress,
              topics: [eventTopic, indexedKeys],
              fromBlock: cursor,
              toBlock: chunkEnd,
            }),
            3,
            250,
            8000,
          );

          for (const log of logs) {
            if (!log.transactionHash) continue;
            const existingTraceByHash = this.traces.find((trace) => trace.txHash?.toLowerCase() === log.transactionHash!.toLowerCase());
            if (existingHashes.has(log.transactionHash.toLowerCase()) && existingTraceByHash?.receiptVerified === true) continue;
            let parsed: any;
            try {
              parsed = this.vaultContract.interface.parseLog({ topics: log.topics as string[], data: log.data });
            } catch {
              continue;
            }
            if (!parsed || parsed.name !== 'PaymentSettled') continue;

            const sessionKey = String(parsed.args.sessionKey || parsed.args[0] || '').toLowerCase();
            const key = addressToKey.get(sessionKey);
            if (!key) continue;

            const amount = BigInt(parsed.args.amount ?? parsed.args[2] ?? 0);
            const payee = String(parsed.args.payee ?? parsed.args[1] ?? '');
            const channelId = Number(parsed.args.channelId ?? parsed.args[3] ?? 0);
            const nonce = Number(parsed.args.nonce ?? parsed.args[4] ?? 0);
            // An async relay can mine before its in-memory callback attaches
            // the tx hash. Match that pending trace by the signed payment
            // identity so chain backfill updates it instead of duplicating it.
            const pendingTrace = this.traces.find((trace) => {
              if (trace.executionMode !== 'LIVE_TESTNET' || trace.status !== 'PENDING' || trace.receiptVerified === true) return false;
              if (trace.txHash) return false;
              const credential = trace.mppCredential;
              if (!credential) return false;
              if (String(credential.signer || '').toLowerCase() !== sessionKey) return false;
              if (Number(credential.channelId) !== channelId || Number(credential.nonce) !== nonce) return false;
              if (String(credential.payee || '').toLowerCase() !== payee.toLowerCase()) return false;
              try {
                return BigInt(credential.amountMicro) === amount;
              } catch {
                return false;
              }
            });
            const existingTrace = existingTraceByHash || pendingTrace;
            const receiptProof = await this.verifyTempoPaymentReceipt(log.transactionHash, payee, amount);
            if (!receiptProof.verified) {
              // PaymentSettled alone is not a payment proof. A successful
              // vault call without the matching TIP-20 transfer is kept out
              // of the confirmed ledger and can be investigated separately.
              console.warn(`[Synapse402 Engine] Ignoring ${log.transactionHash}: ${receiptProof.reason}`);
              continue;
            }
            if (existingTrace) {
              existingTrace.executionMode = 'LIVE_TESTNET';
              existingTrace.status = 'SETTLED';
              existingTrace.receiptVerified = true;
              existingTrace.txHash = log.transactionHash;
              existingTrace.explorerUrl = tempoTransactionUrl(log.transactionHash);
              existingTrace.blockNumber = Number(log.blockNumber || existingTrace.blockNumber || 0);
              if (existingTrace.liveProxyPayload && typeof existingTrace.liveProxyPayload === 'object') {
                existingTrace.liveProxyPayload = {
                  ...existingTrace.liveProxyPayload,
                  txHash: log.transactionHash,
                  explorerUrl: tempoTransactionUrl(log.transactionHash),
                  paymentConfirmed: true,
                  executionMode: 'LIVE_TESTNET',
                };
              }
              existingHashes.add(log.transactionHash.toLowerCase());
              updatedExisting += 1;
              continue;
            }
            const amountUsd = Number(ethers.formatUnits(amount, 6));
            const memo = String(parsed.args.memo ?? parsed.args[5] ?? ethers.ZeroHash);
            const endpoint = String(parsed.args.endpoint ?? parsed.args[6] ?? 'onchain://payment-settled');
            const blockNumber = Number(log.blockNumber || 0);
            let timestampMs = Date.now();
            if (blockNumber > 0) {
              if (!blockTimestamps.has(blockNumber)) {
                try {
                  const block = await retryRpc(() => this.provider.getBlock(blockNumber), 2, 150, 6000);
                  blockTimestamps.set(blockNumber, Number(block?.timestamp || Math.floor(Date.now() / 1000)) * 1000);
                } catch {
                  blockTimestamps.set(blockNumber, timestampMs);
                }
              }
              timestampMs = blockTimestamps.get(blockNumber) || timestampMs;
            }

            const txHash = log.transactionHash;
            const nonce2D = `0x${channelId.toString(16).padStart(2, '0')}:0x${nonce.toString(16).padStart(4, '0')}`;
            const timestamp = new Date(timestampMs).toISOString();
            const trace: MPPTraceRecord = {
              id: `trace_chain_${txHash.slice(2, 18)}`,
              timestamp,
              blockNumber,
              agentId: key.agentId,
              agentName: key.agentName,
              targetEndpoint: endpoint,
              method: 'GET',
              costPathUsd: amountUsd,
              latencyMs: 0,
              httpStatusBefore: 402,
              httpStatusAfter: 200,
              challengeHeader: `MPP realm="Tempo-L1", asset="pathUSD", minPrice="${amountUsd}", recipient="${this.receiverAddress}"`,
              authAuthorizationHeader: `MPP-EIP712 signer="${key.sessionPublicKey}", nonce="${nonce2D}", max="${key.maxPerCallPathUsd}"`,
              eip712Signature: '',
              txHash,
              executionMode: 'LIVE_TESTNET',
              status: 'SETTLED',
              receiptVerified: true,
              providerDataStatus: 'EVALUATION_FIXTURE',
              tempoTxType: '0x76',
              nonce2D,
              memoPayload: `CHAIN_SETTLEMENT:${key.agentName}:${endpoint}:${amountUsd}:pathUSD`,
              routerFeePathUsd: Math.max(0.000001, Number((amountUsd * 0.001).toFixed(6))),
              tip20Memo: memo,
              iso20022Remittance: {
                standard: 'ISO-20022 pacs.008.001.08',
                costCenter: `CC-AI-${key.agentId.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-6) || 'TREASURY'}`,
                categoryCode: 'CHAIN SETTLEMENT',
                invoiceDigest: `0x${sha256(`CHAIN_SETTLEMENT:${txHash}:${amountUsd}:${endpoint}`)}`,
              },
              merkleProof: [],
              merkleRoot: key.merkleRoot || '',
              domainHash: '',
              eip712DomainSeparator: '',
              eip712StructHash: '',
              liveProxyPayload: {
                endpoint,
                status: 200,
                amountPathUsd: amountUsd,
                blockNumber,
                txHash,
                explorerUrl: tempoTransactionUrl(txHash),
                backfilledFromChain: true,
                upstreamVerified: false,
                paymentConfirmed: true,
                providerDataStatus: 'EVALUATION_FIXTURE',
                executionMode: 'LIVE_TESTNET',
              },
              sanctionsCompliance: {
                status: 'UNVERIFIED',
                policy: 'Example compliance check — live sanctions lookup not run',
                checkedAt: timestamp,
              },
              complianceVerification: {
                status: 'UNVERIFIED',
                policy: 'Chain receipt verified from SynapseVault.PaymentSettled',
                checkedAt: timestamp,
              },
            };
            existingHashes.add(txHash.toLowerCase());
            added.push(trace);
          }
        }

        if (added.length > 0 || updatedExisting > 0) {
          this.traces = [...this.traces, ...added].sort((a, b) => {
            if (b.blockNumber !== a.blockNumber) return b.blockNumber - a.blockNumber;
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          }).slice(0, 5000);

          const confirmed = this.traces.filter((trace) =>
            trace.executionMode === 'LIVE_TESTNET' && trace.status === 'SETTLED' && trace.receiptVerified === true && isVerifiedTxHash(trace.txHash),
          );
          this.totalSettlements = confirmed.length;
          this.totalVolume = Number(confirmed.reduce((sum, trace) => sum + Number(trace.costPathUsd || 0), 0).toFixed(6));
          this.protocolRevenue = Number(confirmed.reduce((sum, trace) => sum + Math.max(0.000001, Number(trace.costPathUsd || 0) * 0.001), 0).toFixed(6));
          this.endpoints = this.endpoints.map((endpoint) => {
            const matching = confirmed.filter((trace) =>
              String(trace.targetEndpoint || '').includes(String(endpoint.endpointUrl || ''))
              || String(endpoint.endpointUrl || '').includes(String(trace.targetEndpoint || '')),
            );
            return {
              ...endpoint,
              totalCalls: matching.length,
              totalEarnedUsd: Number(matching.reduce((sum, trace) => sum + Number(trace.costPathUsd || 0), 0).toFixed(6)),
            };
          });
          console.log(`[Synapse402 Engine] Reconciled ${added.length} new and ${updatedExisting} existing PaymentSettled receipt(s) from Tempo.`);
        }

        this.lastSettlementScanBlock = toBlock;
        this.lastSettlementScanAt = Date.now();
        this.persistState();
      } catch (err: any) {
        console.debug(`[Synapse402 Engine] PaymentSettled backfill notice: ${err?.message}`);
      } finally {
        this.settlementScanInFlight = null;
      }
    })();

    return this.settlementScanInFlight;
  }

  private async initLiveSync() {
    try {
      const bn = await this.provider.getBlockNumber();
      if (bn > 0) {
        this.blockHeight = bn;
      }
      const code = await this.provider.getCode(this.vaultAddress);
      this.vaultBytecodePresent = code !== '0x' && code.length > 2;
      await this.refreshVaultAdminStatus();

      // Check if relayer key was explicitly provided AND bytecode is present on-chain
      const hasExplicitKey = Boolean(process.env.TEMPO_RELAYER_KEY || process.env.PRIVATE_KEY);
      if (this.vaultBytecodePresent && hasExplicitKey) {
        this.networkMode = 'LIVE_TESTNET';
        this.networkModeReason = 'Tempo RPC is reachable; the vault contract and relayer are configured.';
        await this.verifyPersistedLiveTraces();
      } else {
        this.networkMode = 'RESILIENT_SANDBOX';
        this.networkModeReason = !this.vaultBytecodePresent
          ? 'Tempo RPC is reachable, but no SynapseVault contract was found at the configured address.'
          : 'Tempo RPC is reachable, but no server relayer key is configured.';
        console.log(`[Synapse402 Engine] Running in RESILIENT_SANDBOX mode (bytecode: ${this.vaultBytecodePresent}, explicitKey: ${hasExplicitKey}). Preserving historical receipts.`);
      }

      await this.syncOnChainState();

      if (this.networkMode === 'LIVE_TESTNET' && this.vaultBytecodePresent) {
        await this.reconcileOnChainSettlements();
      }

      // Do not attach arbitrary chain logs to local traces by array position.
      // A trace is live only when its own settlement call returned a confirmed
      // transaction hash.

      const isStdio = typeof process !== 'undefined' && process.argv && process.argv.some(a => a.includes('mcpServer') || a === '--stdio');
      if (isStdio) {
        console.error(`[Synapse402 Engine] Mode: ${this.networkMode} | Vault: ${this.vaultAddress} (Bytecode: ${this.vaultBytecodePresent ? 'PRESENT' : '0x_EMPTY'}) | Relayer: ${this.relayerWallet.address}`);
      } else {
        console.log(`[Synapse402 Engine] Mode: ${this.networkMode} | Vault: ${this.vaultAddress} (Bytecode: ${this.vaultBytecodePresent ? 'PRESENT' : '0x_EMPTY'}) | Relayer: ${this.relayerWallet.address}`);
      }
    } catch (err: any) {
      this.networkMode = 'RESILIENT_SANDBOX';
      this.networkModeReason = 'Tempo RPC is unavailable from this runtime; evaluation mode is active and the probe will retry automatically.';
      console.warn(`[Synapse402 Engine] Live probe fallback to RESILIENT_SANDBOX: ${err?.message || String(err)} (code=${err?.code || 'unknown'}). Preserving historical receipts.`);
    }

    setInterval(async () => {
      await this.syncOnChainState();
      if (this.networkMode === 'LIVE_TESTNET' && this.vaultBytecodePresent && Date.now() - this.lastSettlementScanAt >= 30000) {
        await this.reconcileOnChainSettlements();
      }
    }, 4000).unref();
  }

  private async verifyPersistedLiveTraces(): Promise<void> {
    const liveTraces = this.traces.filter((trace) =>
      trace.executionMode === 'LIVE_TESTNET'
      && (trace.status === 'SETTLED' || trace.status === 'PENDING')
      && typeof trace.txHash === 'string'
      && trace.txHash.startsWith('0x')
      && trace.receiptVerified !== true
    );
    if (liveTraces.length === 0) return;

    const verified = new Set<string>();
    const verificationErrors = new Set<string>();
    // Keep RPC receipt checks bounded. Sending one request per historical
    // trace at restart makes Tempo's gateway reject the burst with HTTP 413.
    let nextTrace = 0;
    const verifyWorker = async () => {
      while (nextTrace < liveTraces.length) {
        const trace = liveTraces[nextTrace++];
        try {
          const expectedPayee = trace.mppCredential?.payee || this.receiverAddress;
          const proof = await this.verifyTempoPaymentReceipt(
            trace.txHash,
            expectedPayee,
            BigInt(Math.max(1, Math.round(Number(trace.costPathUsd || 0) * 1e6))),
          );
          if (proof.verified) verified.add(trace.id);
          else console.warn(`[Synapse402 Engine] Payment proof rejected for ${trace.id}: ${proof.reason}`);
        } catch (err: any) {
          // A transient RPC error (for example 413 from a provider gateway)
          // is not evidence that a confirmed transaction disappeared.
          verificationErrors.add(trace.id);
          console.debug(`[Synapse402 Engine] Receipt verification notice for ${trace.id}: ${err?.message}`);
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(4, liveTraces.length) }, () => verifyWorker()));

    this.traces = this.traces.map((trace) => {
      if (trace.executionMode !== 'LIVE_TESTNET' || (trace.status !== 'SETTLED' && trace.status !== 'PENDING') || !trace.txHash?.startsWith('0x')) {
        return trace;
      }
      if (verified.has(trace.id)) return { ...trace, receiptVerified: true, status: 'SETTLED' };
      if (verificationErrors.has(trace.id)) return trace;
      return {
        ...trace,
        txHash: '',
        executionMode: 'FAILED_REVERT' as const,
        status: 'FAILED' as const,
        receiptVerified: false,
        blockNumber: 0,
        tempoTxType: undefined,
        liveProxyPayload: trace.liveProxyPayload && typeof trace.liveProxyPayload === 'object'
          ? { ...trace.liveProxyPayload, paymentConfirmed: false, upstreamVerified: false, executionMode: 'FAILED_REVERT', paymentError: 'INVALID_PAYMENT_PROOF' }
          : trace.liveProxyPayload,
      };
    });
    const confirmed = this.traces.filter((trace) =>
      trace.executionMode === 'LIVE_TESTNET'
      && trace.status === 'SETTLED'
      && trace.receiptVerified === true
      && isVerifiedTxHash(trace.txHash),
    );
    this.totalSettlements = confirmed.length;
    this.totalVolume = Number(confirmed.reduce((sum, trace) => sum + Number(trace.costPathUsd || 0), 0).toFixed(6));
    this.protocolRevenue = Number(confirmed.reduce((sum, trace) => sum + Math.max(0.000001, Number(trace.costPathUsd || 0) * 0.001), 0).toFixed(6));
    this.persistState();
  }

  public async syncOnChainState(): Promise<void> {
    try {
      const t0 = Date.now();
      const bn = await this.provider.getBlockNumber();
      const latency = Date.now() - t0;
      if (latency > 0) {
        this.lastMeasuredRpcLatencyMs = Math.max(4, Math.min(latency, 250));
      }
      if (bn > 0) {
        this.blockHeight = bn;
      }

      // Recover from a transient RPC outage. The old implementation switched
      // to RESILIENT_SANDBOX on the first failed probe and never tried to
      // promote the process back to live mode, even after the RPC and deployed
      // vault became reachable again. That made every later payment look like
      // a simulation and removed the transaction link permanently.
      if (this.networkMode !== 'LIVE_TESTNET') {
        try {
          const code = await this.provider.getCode(this.vaultAddress);
          const hasExplicitKey = Boolean(process.env.TEMPO_RELAYER_KEY || process.env.PRIVATE_KEY);
          this.vaultBytecodePresent = code !== '0x' && code.length > 2;
          if (this.vaultBytecodePresent && hasExplicitKey) {
            this.networkMode = 'LIVE_TESTNET';
            this.networkModeReason = 'Tempo RPC recovered; the vault contract and relayer are configured.';
            await this.refreshVaultAdminStatus();
            console.log('[Synapse402 Engine] RPC recovered; promoted to LIVE_TESTNET.');
          }
        } catch (probeErr: any) {
          // Keep the explicit sandbox mode until a later heartbeat succeeds.
          this.networkModeReason = 'Tempo RPC is still unavailable from this runtime; evaluation mode will retry automatically.';
          console.debug(`[Synapse402 Engine] Live recovery probe notice: ${probeErr?.message}`);
        }
      }
      if (this.networkMode === 'LIVE_TESTNET' && this.vaultBytecodePresent) {
        await this.refreshVaultAdminStatus();
      }
      try {
        const feeData = await this.provider.getFeeData();
        if (feeData?.gasPrice) {
          const gwei = Number(ethers.formatUnits(feeData.gasPrice, 'gwei'));
          this.lastGasPriceGwei = gwei.toFixed(2);
          // Standard Tempo MPP Type 0x76 transfer gas ~ 54,490 gas
          const feeUsd = (54490 * Number(feeData.gasPrice)) / 1e18;
          this.lastMeasuredFeeUsd = Math.max(0.000005, feeUsd).toFixed(6);
        }
      } catch (feeErr: any) {
        console.debug(`[Synapse402 Engine] Fee probe notice: ${feeErr?.message}`);
      }

      if (this.networkMode === 'LIVE_TESTNET' && this.vaultBytecodePresent) {
        const onChainBal = await this.vaultContract.totalVaultBalance();
        const balNum = Number(ethers.formatUnits(onChainBal, 6));
        if (Number.isFinite(balNum) && balNum >= 0) {
          this.vaultTvl = balNum;
        }

        // Reconcile session keys with on-chain SynapseVault state
        for (const key of this.keys.values()) {
          if ((key as any).lastResetAt && Date.now() - (key as any).lastResetAt < 25000) {
            continue;
          }
          if (key.sessionPublicKey && ethers.isAddress(key.sessionPublicKey)) {
            try {
              const cfg = await this.vaultContract.sessionKeys(key.sessionPublicKey);
              if (cfg) {
                // In live mode the contract is the source of truth for every
                // session policy field, not just cumulative spend. This keeps
                // the dashboard aligned after an on-chain pause, expiry,
                // budget update, or provider-root change.
                const onChainStatus = Number(cfg.status);
                const statusMap: Record<number, ScopedSessionKeyRecord['status']> = {
                  0: 'REVOKED',
                  1: 'ACTIVE',
                  2: 'PAUSED',
                  3: 'DEPLETED',
                  4: 'REVOKED',
                };
                if (onChainStatus > 0) {
                  key.maxPerCallPathUsd = Number(ethers.formatUnits(cfg.maxPerCall, 6));
                  key.totalBudgetPathUsd = Number(ethers.formatUnits(cfg.totalBudget, 6));
                  key.currentSpentPathUsd = Number(ethers.formatUnits(cfg.currentSpent, 6));
                  key.validBeforeTimestamp = Number(cfg.validBefore);
                  key.merkleRoot = String(cfg.merkleRoot);
                  key.status = statusMap[onChainStatus] || 'PAUSED';
                }
                if (onChainStatus > 0) {
                  const onChainNonce = await this.vaultContract.lastNonce(key.sessionPublicKey, key.channelId);
                  if (Number(onChainNonce) > key.sequenceNonce) {
                    key.sequenceNonce = Number(onChainNonce);
                  }
                }
              }
            } catch (cfgErr: any) {
              console.debug(`[Synapse402 Engine] Key config query notice: ${cfgErr?.message}`);
            }
          }
        }
        this.persistState();
      }
    } catch (err: any) {
      console.warn(`[Synapse402 Engine] Periodic on-chain sync notice: ${err?.message}. Preserving ledger.`);
    }
  }

  public getNetworkStatus() {
    const liveConfirmedTrace = this.networkMode === 'LIVE_TESTNET'
      ? this.traces.find(t => t.executionMode === 'LIVE_TESTNET' && t.status === 'SETTLED' && t.receiptVerified === true && t.txHash && t.txHash.startsWith('0x'))
      : undefined;
    return {
      status: 'ok',
      networkMode: this.networkMode,
      networkModeReason: this.networkModeReason,
      networkName: 'Tempo Moderato Testnet',
      chainId: this.chainId,
      blockHeight: this.blockHeight,
      vaultAddress: this.vaultAddress,
      receiverAddress: this.receiverAddress,
      vaultBytecodePresent: this.vaultBytecodePresent,
      canSettleLive: this.networkMode === 'LIVE_TESTNET' && this.vaultBytecodePresent && Boolean(this.relayerWallet),
      vaultAdminReason: this.vaultAdminReason,
      relayerAddress: this.networkMode === 'LIVE_TESTNET' && this.vaultBytecodePresent
        && Boolean(process.env.PRIVATE_KEY || process.env.TEMPO_RELAYER_KEY)
        ? this.relayerWallet.address
        : null,
      vaultTvl: this.vaultTvl,
      latestTxHash: liveConfirmedTrace?.txHash || null,
      rpcLatencyMs: this.lastMeasuredRpcLatencyMs,
      gasPriceGwei: this.lastGasPriceGwei,
      networkFeeUsd: this.lastMeasuredFeeUsd,
      hasPrivateKeyConfigured: Boolean(process.env.PRIVATE_KEY || process.env.TEMPO_RELAYER_KEY),
      resilientFallbackActive: this.networkMode === 'RESILIENT_SANDBOX',
    };
  }

  private async refreshVaultAdminStatus(): Promise<boolean> {
    try {
      const owner = ethers.getAddress(await this.vaultContract.owner());
      const admin = this.vaultOwnerWallet || this.relayerWallet;
      this.vaultAdminReady = owner.toLowerCase() === admin.address.toLowerCase();
      this.vaultAdminReason = this.vaultAdminReady
        ? 'Vault owner authorization is ready.'
        : 'Live payments are disabled: configure TEMPO_VAULT_OWNER_KEY for the SynapseVault owner. No chain write will be attempted.';
    } catch {
      this.vaultAdminReady = false;
      this.vaultAdminReason = 'Vault owner could not be verified; live payments are disabled until it can be checked.';
    }
    return this.vaultAdminReady;
  }

  private async getVaultAdminWallet(): Promise<ethers.Wallet | ethers.HDNodeWallet> {
    const ready = await this.refreshVaultAdminStatus();
    if (!ready) {
      throw new Error(this.vaultAdminReason);
    }
    return this.vaultOwnerWallet || this.relayerWallet;
  }

  private sessionMasterSecret: string = (() => {
    if (process.env.SYNAPSE_SESSION_MASTER_SECRET) {
      return process.env.SYNAPSE_SESSION_MASTER_SECRET;
    }
    // Derive a stable secret from the server-only relayer key when an explicit
    // session secret is not supplied. Never derive wallets from public key IDs.
    const serverSecret = process.env.TEMPO_RELAYER_KEY || process.env.PRIVATE_KEY;
    if (serverSecret) return serverSecret;
    return crypto.randomBytes(32).toString('hex');
  })();

  private walletCache: Map<string, ethers.Wallet> = new Map();
  public getWalletForKey(keyId: string): ethers.Wallet {
    let w = this.walletCache.get(keyId);
    if (!w) {
      // Match the established baseline derivation: the explicit session secret
      // is preferred, with the configured server-only relayer key as fallback.
      // This keeps existing runtime setups working without requiring a new env var.
      const pk = '0x' + crypto.createHmac('sha256', this.sessionMasterSecret)
        .update(`synapse402:session-wallet:${keyId}`)
        .digest('hex');
      w = new ethers.Wallet(pk);
      this.walletCache.set(keyId, w);
    }
    return w;
  }

  private seedInitialState() {
    const k1: ScopedSessionKeyRecord = {
      id: 'key_quant_alpha',
      agentId: 'agent_alpha_arb',
      agentName: 'AlphaArb-HFT',
      role: 'Sub-second Cross-Venue Arbitrage & Market Neutral Hedging',
      sessionPublicKey: this.getWalletForKey('key_quant_alpha').address,
      delegatedBy: 'Treasury Multisig (Sandbox)',
      maxPerCallPathUsd: 0.005,
      totalBudgetPathUsd: 50.0,
      currentSpentPathUsd: 0,
      whitelistedDomains: [
        'https://api.deepseek.com/v1/chat/completions',
        'https://api.binance.com/api/v3/depth',
        'https://api.deribit.com/api/v2/public/get_order_book',
        'https://api.tempo.xyz/v1/router/quote',
        'https://api.fin-depth.io/v2/aapl/orderbook',
        'https://api.market-depth-mesh.io/v3/depth/l2',
        'https://api.fin-depth.io/v2/sol/orderbook',
        '/api/v1/market/sol-depth',
        '/api/v1/market/sol-orderbook',
        '/api/v1/test-provider-data',
        '/api/v1/mock-500',
        '/api/v1/surge-demo',
        '/api/stream/inference',
        'https://data.sec.gov/api/xbrl/companyfacts',
        'https://api.crypto-skew.network/v1/macro/btc-eth',
      ],
      status: 'ACTIVE',
      validBeforeTimestamp: Math.floor(Date.now() / 1000) + 86400 * 30,
      channelId: 1,
      sequenceNonce: 0,
      lastActive: 'Ready',
      merkleRoot: '',
    };

    const k2: ScopedSessionKeyRecord = {
      id: 'key_cortex_research',
      agentId: 'agent_cortex_ai',
      agentName: 'Cortex-ResearchBot',
      role: 'Autonomous Academic Synthesis & Regulatory Filing Extractor',
      sessionPublicKey: this.getWalletForKey('key_cortex_research').address,
      delegatedBy: 'Treasury Multisig (Sandbox)',
      maxPerCallPathUsd: 0.015,
      totalBudgetPathUsd: 35.0,
      currentSpentPathUsd: 0,
      whitelistedDomains: [
        'https://api.semanticscholar.org/graph/v1/paper/batch',
        'https://data.sec.gov/api/xbrl/companyfacts',
        '/api/v1/data/unlocked-article',
        '/api/v1/data/ai-market-analysis',
      ],
      status: 'ACTIVE',
      validBeforeTimestamp: Math.floor(Date.now() / 1000) + 86400 * 20,
      channelId: 2,
      sequenceNonce: 0,
      lastActive: 'Ready',
      merkleRoot: '',
    };

    const k3: ScopedSessionKeyRecord = {
      id: 'key_sec_audit',
      agentId: 'agent_audit_sec',
      agentName: 'SecAudit-Fuzzer',
      role: 'Continuous Smart Contract Bytecode Vulnerability Scanner',
      sessionPublicKey: this.getWalletForKey('key_sec_audit').address,
      delegatedBy: 'Treasury Multisig (Sandbox)',
      maxPerCallPathUsd: 0.02,
      totalBudgetPathUsd: 25.0,
      currentSpentPathUsd: 0,
      whitelistedDomains: [
        'https://api.certik.com/v1/fuzz/opcodes',
        'https://api.tempo.xyz/v1/router/quote',
        'https://api.fin-depth.io/v2/aapl/orderbook',
        'https://api.fin-depth.io/v2/sol/orderbook',
        '/api/v1/market/sol-depth',
        '/api/v1/market/sol-orderbook',
        '/api/v1/data/python-sandbox',
        'https://data.sec.gov/api/xbrl/companyfacts',
        'https://api.crypto-skew.network/v1/macro/btc-eth',
      ],
      status: 'ACTIVE',
      validBeforeTimestamp: Math.floor(Date.now() / 1000) + 86400 * 14,
      channelId: 3,
      sequenceNonce: 0,
      lastActive: 'Ready',
      merkleRoot: '',
    };

    const k4: ScopedSessionKeyRecord = {
      id: 'key_vision_craft',
      agentId: 'agent_vision_craft',
      agentName: 'VisionCraft-Designer',
      role: 'Autonomous Image Cleanup & Neural Object Segmentation',
      sessionPublicKey: this.getWalletForKey('key_vision_craft').address,
      delegatedBy: 'Treasury Multisig (Sandbox)',
      maxPerCallPathUsd: 0.005,
      totalBudgetPathUsd: 20.0,
      currentSpentPathUsd: 0,
      whitelistedDomains: [
        'https://api.vision-neural.ai/v1/remove-bg',
        'https://cdn.vision-neural.ai',
      ],
      status: 'ACTIVE',
      validBeforeTimestamp: Math.floor(Date.now() / 1000) + 86400 * 30,
      channelId: 4,
      sequenceNonce: 0,
      lastActive: 'Ready',
      merkleRoot: '',
    };

    const k5: ScopedSessionKeyRecord = {
      id: 'key_chronicle_news',
      agentId: 'agent_chronicle_news',
      agentName: 'Chronicle-NewsUnlocker',
      role: 'Real-Time Paywalled Article Digest & Research Extraction',
      sessionPublicKey: this.getWalletForKey('key_chronicle_news').address,
      delegatedBy: 'Treasury Multisig (Sandbox)',
      maxPerCallPathUsd: 0.005,
      totalBudgetPathUsd: 15.0,
      currentSpentPathUsd: 0,
      whitelistedDomains: [
        'https://api.news-dispatch.net/v1/article/unlock',
        'https://api.reuters.com',
      ],
      status: 'ACTIVE',
      validBeforeTimestamp: Math.floor(Date.now() / 1000) + 86400 * 30,
      channelId: 5,
      sequenceNonce: 0,
      lastActive: 'Ready',
      merkleRoot: '',
    };

    const k6: ScopedSessionKeyRecord = {
      id: 'key_polyglot_translator',
      agentId: 'agent_polyglot_translator',
      agentName: 'Polyglot-Translator',
      role: 'Autonomous Neural Document Translation & Localization',
      sessionPublicKey: this.getWalletForKey('key_polyglot_translator').address,
      delegatedBy: 'Treasury Multisig (Sandbox)',
      maxPerCallPathUsd: 0.005,
      totalBudgetPathUsd: 25.0,
      currentSpentPathUsd: 0,
      whitelistedDomains: [
        'https://api.translate-mesh.io/v2/document/instant',
        'https://api.deepl.com',
        '/api/v1/data/unlocked-article',
      ],
      status: 'ACTIVE',
      validBeforeTimestamp: Math.floor(Date.now() / 1000) + 86400 * 30,
      channelId: 6,
      sequenceNonce: 0,
      lastActive: 'Ready',
      merkleRoot: '',
    };

    k1.merkleRoot = new MerkleTree(k1.whitelistedDomains).getRoot();
    k2.merkleRoot = new MerkleTree(k2.whitelistedDomains).getRoot();
    k3.merkleRoot = new MerkleTree(k3.whitelistedDomains).getRoot();
    k4.merkleRoot = new MerkleTree(k4.whitelistedDomains).getRoot();
    k5.merkleRoot = new MerkleTree(k5.whitelistedDomains).getRoot();
    k6.merkleRoot = new MerkleTree(k6.whitelistedDomains).getRoot();

    this.keys.set(k1.id, k1);
    this.keys.set(k2.id, k2);
    this.keys.set(k3.id, k3);
    this.keys.set(k4.id, k4);
    this.keys.set(k5.id, k5);
    this.keys.set(k6.id, k6);

    const mt1 = new MerkleTree(k1.whitelistedDomains);
    const initialTarget = 'https://api.binance.com/api/v3/depth';
    const initMemo = ethers.encodeBytes32String('pacs.008|AlphaArb|0x01:0x0001');
    const wallet1 = this.getWalletForKey(k1.id);
    const seedDomain = {
      name: 'SynapseVault',
      version: '1.0.0',
      chainId: this.chainId,
      verifyingContract: this.vaultAddress,
    };
    const seedTypes = {
      MPPAuthorization: [
        { name: 'sessionKey', type: 'address' },
        { name: 'channelId', type: 'uint64' },
        { name: 'nonce', type: 'uint64' },
        { name: 'payee', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'endpointHash', type: 'bytes32' },
        { name: 'memo', type: 'bytes32' },
        { name: 'validBefore', type: 'uint256' },
      ],
    };
    const seedValue = {
      sessionKey: wallet1.address,
      channelId: 1,
      nonce: 1,
      payee: this.receiverAddress,
      amount: BigInt(Math.round(0.0015 * 1e6)),
      endpointHash: mt1.getLeafHash(k1.whitelistedDomains[0]),
      memo: initMemo,
      validBefore: k1.validBeforeTimestamp,
    };
    const seedStructHash = ethers.TypedDataEncoder.hash(seedDomain, seedTypes, seedValue);
    const seedSig = wallet1.signingKey.sign(seedStructHash).serialized;
    this.traces.push({
      id: 'trace_init_001',
      timestamp: new Date(Date.now() - 1000 * 15).toISOString(),
      blockNumber: 0,
      agentId: k1.agentId,
      agentName: k1.agentName,
      targetEndpoint: initialTarget,
      method: 'GET',
      costPathUsd: 0.0015,
      latencyMs: 138,
      httpStatusBefore: 402,
      httpStatusAfter: 200,
      challengeHeader: `MPP realm="Tempo-L1", asset="pathUSD", minPrice="0.0015", recipient="${this.receiverAddress}"`,
      authAuthorizationHeader: `MPP-EIP712 signer="${k1.sessionPublicKey}", nonce="0x01:0x0001", max="0.005"`,
      eip712Signature: seedSig,
      txHash: '',
      executionMode: 'RESILIENT_SANDBOX',
      status: 'SIMULATED_PASS',
      tempoTxType: undefined,
      nonce2D: '0x01:0x0001',
      memoPayload: 'MPP:AlphaArb-HFT:binance.com:0.0015:pathUSD',
      routerFeePathUsd: 0,
      tip20Memo: initMemo,
      iso20022Remittance: {
        standard: 'ISO-20022 pacs.008.001.08',
        costCenter: 'CC-AI-HFT001',
        categoryCode: 'Market Depth L2',
        invoiceDigest: `0x${sha256('INVOICE:BINANCE-RELAY-34876880-0.0015')}`,
      },
      merkleProof: mt1.getProof(k1.whitelistedDomains[0]),
      merkleRoot: k1.merkleRoot,
      domainHash: mt1.getLeafHash(k1.whitelistedDomains[0]),
      eip712DomainSeparator: sha256('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'),
      eip712StructHash: sha256('MPPAuthorization(address sessionKey,uint64 channelId,uint64 nonce,address payee,uint256 amount,bytes32 endpointHash,bytes32 memo,uint256 validBefore)'),
      sanctionsCompliance: {
        status: 'UNVERIFIED',
        policy: 'Example compliance check — live sanctions lookup not run',
        checkedAt: new Date().toISOString(),
      },
      complianceVerification: {
        status: 'UNVERIFIED',
        policy: 'Example compliance check — live sanctions lookup not run',
        checkedAt: new Date().toISOString(),
      },
    });
  }

  public getReceiptsLedger() {
    // The seeded trace is an implementation seed for the demo engine, not a
    // receipt created by a user job. Keep it available internally for the
    // provider verifier, but never expose it as a payment-history row or count.
    const normalizedTraces = this.traces
      .filter((trace) => trace.id !== 'trace_init_001')
      .map((trace) => this.normalizePersistedTrace(trace));

    // Canonical calculations
    const confirmedReceipts = normalizedTraces.filter((t) =>
      t.executionMode === 'LIVE_TESTNET'
      && t.status === 'SETTLED'
      && t.receiptVerified === true
      && isVerifiedTxHash(t.txHash)
    );

    const evaluationReceipts = normalizedTraces.filter((t) =>
      (t.executionMode !== 'LIVE_TESTNET' || t.status === 'SIMULATED_PASS' || !isVerifiedTxHash(t.txHash))
      && t.status !== 'VOIDED'
      && t.status !== 'REFUNDED'
      && t.status !== 'FAILED'
    );

    const voidedReceipts = normalizedTraces.filter((t) =>
      t.status === 'VOIDED' || t.status === 'REFUNDED' || t.status === 'FAILED'
    );

    const totalVolumeSettled = confirmedReceipts.reduce((sum, t) => sum + Number(t.costPathUsd || 0), 0);
    const totalProtocolFee = confirmedReceipts.reduce((sum, t) => sum + Math.max(0.000001, Number(t.costPathUsd || 0) * 0.001), 0);

    const enrichedTraces = normalizedTraces.map((t) => {
      const ep = (t.targetEndpoint || '').toLowerCase();
      const providerRecord = this.endpoints.find((endpoint) =>
        String(endpoint.endpointUrl || '').toLowerCase().includes(ep)
        || ep.includes(String(endpoint.endpointUrl || '').toLowerCase()),
      );
      const serviceName = t.providerName || providerRecord?.title || 'Demo provider';

      let agentName = t.agentName;
      if (!agentName || agentName === 'Crypto Market Bot' || agentName === 'AI Agent') {
        if (ep.includes('academic') || ep.includes('semanticscholar')) agentName = 'Academic Reader Bot';
        else if (ep.includes('sec') || ep.includes('10k') || ep.includes('filing')) agentName = 'Equity Research Quant';
        else if (ep.includes('deepseek')) agentName = 'Reasoning Inference Bot';
        else if (ep.includes('sandbox') || ep.includes('container') || ep.includes('python-sandbox')) agentName = 'Code Security Bot';
        else if (ep.includes('vision')) agentName = 'Vision Production Bot';
        else if (ep.includes('voice')) agentName = 'Audio Voiceover Bot';
        else if (ep.includes('compliance') || ep.includes('identity')) agentName = 'Compliance Auditor Bot';
        else agentName = 'Market Research Bot';
      }

      return {
        ...t,
        agentName,
        serviceName,
        txHash: isVerifiedTxHash(t.txHash) ? t.txHash : null,
      };
    });

    return {
      summary: {
        confirmedPaymentsCount: confirmedReceipts.length,
        evaluationEventsCount: evaluationReceipts.length,
        voidedEventsCount: voidedReceipts.length,
        totalReceiptsCount: normalizedTraces.length,
        totalTransactionsCount: confirmedReceipts.length,
        totalVolumeSettledPathUsd: Number(totalVolumeSettled.toFixed(4)),
        protocolFeeRevenuePathUsd: Number(totalProtocolFee.toFixed(5)),
        blockHeight: this.blockHeight,
        networkMode: this.networkMode,
      },
      receipts: enrichedTraces,
    };
  }

  public getTraces(): (MPPTraceRecord & { serviceName?: string })[] {
    return this.getReceiptsLedger().receipts as any;
  }

  /** Verify that a first-party provider request came from a trace issued by this gateway. */
  public verifyProviderRequest(pathname: string, signature: string, nonce2D: string, traceId: string, effectivePrice: number): boolean {
    if (!pathname || !signature || !nonce2D || !traceId || !Number.isFinite(effectivePrice)) return false;
    const trace = this.traces.find((candidate) => candidate.id === traceId);
    if (!trace || trace.eip712Signature !== signature || trace.nonce2D !== nonce2D) return false;
    const statusAllowed = trace.executionMode === 'LIVE_TESTNET'
      ? trace.status === 'SETTLED' && trace.receiptVerified === true && isVerifiedTxHash(trace.txHash)
      : trace.executionMode === 'RESILIENT_SANDBOX' && trace.status === 'SIMULATED_PASS';
    if (!statusAllowed || Math.abs(Number(trace.costPathUsd) - effectivePrice) > 0.000001) return false;
    try {
      const tracePath = new URL(trace.targetEndpoint).pathname;
      return tracePath === pathname;
    } catch {
      return trace.targetEndpoint === pathname;
    }
  }

  public async deposit(amount: number) {
    const depositNum = Number(amount);
    if (!Number.isFinite(depositNum) || depositNum <= 0) {
      throw new Error('Deposit amount must be a strictly positive number.');
    }
    if (depositNum > 1000) {
      throw new Error('Deposit amount exceeds maximum demo limit ($1,000 pathUSD).');
    }

    let depositTxHash: string | undefined;
    if (this.networkMode === 'LIVE_TESTNET' && this.vaultBytecodePresent && this.relayerWallet) {
      try {
        await this.dispatchRelayerTx(async () => {
          const parsedAmount = BigInt(Math.round(depositNum * 1e6));
          const fundingWallet = this.vaultOwnerWallet || this.relayerWallet;
          const tip20 = new ethers.Contract(this.pathUsdAddress, TIP20_ABI, fundingWallet);
          const fundingBalance = await tip20.balanceOf(fundingWallet.address);
          if (fundingBalance < parsedAmount) {
            throw new Error('The configured project funding wallet has insufficient pathUSD.');
          }
          const currentAllowance = await tip20.allowance(fundingWallet.address, this.vaultAddress);
          if (currentAllowance < parsedAmount) {
            const approveTx = await (tip20 as any).approve(this.vaultAddress, ethers.MaxUint256, { gasLimit: 300000 });
            await approveTx.wait(1);
          }
          const depTx = await (this.vaultContract.connect(fundingWallet) as any).deposit(parsedAmount, { gasLimit: 500000 });
          const receipt = await depTx.wait(1);
          if (!receipt || receipt.status !== 1) throw new Error('Deposit transaction was not confirmed.');
          depositTxHash = depTx.hash;
          console.log(`[Synapse402 Engine] ✓ Confirmed On-Chain Deposit: ${depTx.hash} (+${depositNum} pathUSD)`);
          const onChainBal = await this.vaultContract.totalVaultBalance();
          this.vaultTvl = Number(ethers.formatUnits(onChainBal, 6));
        });
      } catch (depErr: any) {
        // A live deposit must never be represented by a local number after a
        // failed chain call. Keep the vault unchanged and surface the failure.
        console.warn(`[Synapse402 Engine] Live on-chain deposit failed; no local credit was added: ${depErr?.message}`);
        throw new Error(`Live deposit failed; no funds were credited on-chain. ${depErr?.message || ''}`.trim());
      }
    } else {
      this.vaultTvl = Number((this.vaultTvl + depositNum).toFixed(4));
    }

    this.persistState();
    return { ...this.getMetrics(), depositTxHash };
  }

  public getMetrics() {
    let reserved = 0;
    this.keys.forEach((k) => {
      if (k.status === 'ACTIVE') {
        reserved += Math.max(0, k.totalBudgetPathUsd - k.currentSpentPathUsd);
      }
    });

    const ledger = this.getReceiptsLedger();
    const visibleReceipts = ledger.receipts as Array<{ latencyMs?: number; executionMode?: string; status?: string }>;
    const totalVisible = visibleReceipts.length;
    const measuredResponseLatencies = visibleReceipts
      .map((trace) => Number(trace.latencyMs))
      .filter((latency) => Number.isFinite(latency) && latency >= 0);
    const avgResponseLatency = measuredResponseLatencies.length > 0
      ? Math.round(measuredResponseLatencies.reduce((acc, latency) => acc + latency, 0) / measuredResponseLatencies.length)
      : 0;
    const confirmedReceipts = visibleReceipts.filter((t) => t.executionMode === 'LIVE_TESTNET' && t.status === 'SETTLED' && (t as any).receiptVerified === true);
    const measuredConfirmedLatencies = confirmedReceipts
      .map((trace) => Number(trace.latencyMs))
      .filter((latency) => Number.isFinite(latency) && latency >= 0);
    const avgConfirmedLatency = measuredConfirmedLatencies.length > 0
      ? Math.round(measuredConfirmedLatencies.reduce((acc, latency) => acc + latency, 0) / measuredConfirmedLatencies.length)
      : 0;
    const successRate = totalVisible > 0
      ? Number(((ledger.summary.confirmedPaymentsCount / totalVisible) * 100).toFixed(2))
      : 0;

    const reportedReserved = this.networkMode === 'LIVE_TESTNET' ? reserved : 0;
    return {
      totalVaultLiquidity: Number(this.vaultTvl.toFixed(4)),
      availableUnreservedLiquidity: Math.max(0, Number((this.vaultTvl - reportedReserved).toFixed(4))),
      reservedAgentBudgets: Number(reportedReserved.toFixed(4)),
      totalVolumeSettledPathUsd: ledger.summary.totalVolumeSettledPathUsd,
      totalTransactionsCount: ledger.summary.confirmedPaymentsCount,
      confirmedPaymentsCount: ledger.summary.confirmedPaymentsCount,
      evaluationEventsCount: ledger.summary.evaluationEventsCount,
      voidedEventsCount: ledger.summary.voidedEventsCount,
      totalReceiptsCount: ledger.summary.totalReceiptsCount,
      protocolFeeRevenuePathUsd: ledger.summary.protocolFeeRevenuePathUsd,
      // Response latency is an engine measurement. Finality is reported only
      // for confirmed Tempo receipts; never present sandbox latency as chain
      // finality.
      averageResponseLatencyMs: avgResponseLatency,
      averageFinalityMs: avgConfirmedLatency,
      settlementSuccessRate: successRate,
      blockHeight: this.blockHeight,
      tempoChainId: this.chainId,
      vaultContract: this.vaultAddress,
      receiverContract: this.receiverAddress,
    };
  }

  public async getWalletBalances(address: string) {
    if (!address || typeof address !== 'string' || !ethers.isAddress(address)) {
      return {
        address: address || '',
        pathUsd: 0,
        feeTokenBalance: 0,
        feeTokenAddress: this.pathUsdAddress,
        feeTokenSymbol: 'pathUSD',
        vaultTvl: this.vaultTvl,
        isSessionKeyRegistered: false,
        sessionStatus: 'INACTIVE',
        sessionBudget: 0,
        sessionSpent: 0,
      };
    }
    const cleanAddr = ethers.getAddress(address);
    const cached = this.walletBalancesCache.get(cleanAddr);

    let pathUsdBal = cached?.data?.pathUsd ?? cached?.data?.feeTokenBalance ?? 0;
    let vaultBal = this.vaultTvl;
    let isRegistered = cached?.data?.isSessionKeyRegistered ?? false;
    let sessionStatus = cached?.data?.sessionStatus ?? 'INACTIVE';
    let sessionBudget = cached?.data?.sessionBudget ?? 0;
    let sessionSpent = cached?.data?.sessionSpent ?? 0;

    try {
      const tip20 = new ethers.Contract(this.pathUsdAddress, TIP20_ABI, this.provider);
      const tokenBalBig = await retryRpc(() => tip20.balanceOf(cleanAddr), 3, 200, 3500) as bigint;
      pathUsdBal = Number(tokenBalBig) / 1e6;
    } catch {
      if (cached) pathUsdBal = cached.data.pathUsd;
    }

    try {
      if (this.vaultBytecodePresent) {
        const onChainTotal = await retryRpc(() => this.vaultContract.totalVaultBalance(), 3, 200, 3500) as bigint;
        vaultBal = Number(onChainTotal) / 1e6;
        this.vaultTvl = vaultBal;

        const sessionCfg = await retryRpc(() => this.vaultContract.sessionKeys(cleanAddr), 3, 200, 3500) as any;
        const statusNum = Number(sessionCfg.status);
        if (statusNum === 1) {
          isRegistered = true;
          sessionStatus = 'ACTIVE';
          sessionBudget = Number(sessionCfg.totalBudget) / 1e6;
          sessionSpent = Number(sessionCfg.currentSpent) / 1e6;
        } else if (statusNum === 2) {
          isRegistered = true;
          sessionStatus = 'PAUSED';
        } else if (statusNum === 3) {
          isRegistered = true;
          sessionStatus = 'DEPLETED';
        } else if (statusNum === 4) {
          isRegistered = true;
          sessionStatus = 'REVOKED';
        }
      }
    } catch {
      if (cached) {
        vaultBal = cached.data.vaultTvl;
        isRegistered = cached.data.isSessionKeyRegistered;
        sessionStatus = cached.data.sessionStatus;
      }
    }

    const result = {
      address: cleanAddr,
      pathUsd: pathUsdBal,
      // Tempo has no native gas coin. Fees use a selectable USD-denominated
      // TIP-20 token; pathUSD is the configured payment and fee-token view.
      feeTokenBalance: pathUsdBal,
      feeTokenAddress: this.pathUsdAddress,
      feeTokenSymbol: 'pathUSD',
      vaultTvl: vaultBal,
      isSessionKeyRegistered: isRegistered,
      sessionStatus,
      sessionBudget,
      sessionSpent,
    };

    this.walletBalancesCache.set(cleanAddr, { data: result, timestamp: Date.now() });
    return result;
  }

  public getKeys(): ScopedSessionKeyRecord[] {
    return Array.from(this.keys.values());
  }

  public addKey(params: {
    agentName: string;
    role?: string;
    maxPerCallPathUsd: number;
    totalBudgetPathUsd: number;
    whitelistedDomains: string[];
  }): ScopedSessionKeyRecord {
    if (this.keys.size >= 256) throw new Error('Session-key registry is full; revoke an unused key before adding another.');
    const agentName = String(params.agentName || '').trim();
    const role = String(params.role || 'Autonomous Execution Agent').trim() || 'Autonomous Execution Agent';
    if (!agentName || agentName.length > 160) {
      throw new Error('agentName must be 1–160 characters.');
    }
    if (role.length > 200) {
      throw new Error('role must be no more than 200 characters.');
    }
    const maxCall = Number(params.maxPerCallPathUsd);
    const totalBudget = Number(params.totalBudgetPathUsd);
    if (!Number.isFinite(maxCall) || maxCall <= 0) {
      throw new Error('maxPerCallPathUsd must be a positive finite number.');
    }
    if (!Number.isFinite(totalBudget) || totalBudget <= 0) {
      throw new Error('totalBudgetPathUsd must be a positive finite number.');
    }
    if (maxCall > totalBudget) {
      throw new Error('maxPerCallPathUsd cannot exceed totalBudgetPathUsd.');
    }

    const safeDomains = normalizeAllowlistEntries(params.whitelistedDomains);
    if (safeDomains.length === 0) {
      throw new Error('At least one public http/https provider URL is required; localhost and private-network targets are blocked.');
    }
    if (safeDomains.length > 256) {
      throw new Error('At most 256 approved provider routes can be attached to one session key.');
    }
    let keyId = '';
    do {
      keyId = `key_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;
    } while (this.keys.has(keyId));
    const mt = new MerkleTree(safeDomains);
    const wallet = this.getWalletForKey(keyId);
    const newKey: ScopedSessionKeyRecord = {
      id: keyId,
      agentId: `agent_${agentName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      agentName,
      role,
      sessionPublicKey: wallet.address,
      delegatedBy: 'Treasury Multisig (Sandbox)',
      maxPerCallPathUsd: maxCall,
      totalBudgetPathUsd: totalBudget,
      currentSpentPathUsd: 0,
      whitelistedDomains: safeDomains,
      status: 'ACTIVE',
      validBeforeTimestamp: Math.floor(Date.now() / 1000) + 86400 * 30,
      channelId: this.keys.size + 1,
      sequenceNonce: 1,
      lastActive: 'Just now',
      merkleRoot: mt.getRoot(),
    };

    this.keys.set(keyId, newKey);
    this.persistState();
    return newKey;
  }

  public async toggleKeyStatus(keyId: string): Promise<ScopedSessionKeyRecord | null> {
    const key = this.keys.get(keyId);
    if (!key) return null;

    const nextStatus: ScopedSessionKeyRecord['status'] = key.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    if (this.networkMode === 'LIVE_TESTNET' && this.vaultBytecodePresent && this.relayerWallet && key.sessionPublicKey) {
      try {
        const adminWallet = await this.getVaultAdminWallet();
        const cfg = await this.vaultContract.sessionKeys(key.sessionPublicKey);
        let onChainStatus = Number(cfg.status);
        if (onChainStatus === 0) {
          const root = key.merkleRoot && key.merkleRoot.length === 66 ? key.merkleRoot : new MerkleTree(key.whitelistedDomains).getRoot();
          const regTx = await (this.vaultContract.connect(adminWallet) as any).registerSessionKey(
            key.sessionPublicKey,
            BigInt(Math.round(Math.min(key.maxPerCallPathUsd, key.totalBudgetPathUsd) * 1e6)),
            BigInt(Math.round(key.totalBudgetPathUsd * 1e6)),
            BigInt(key.validBeforeTimestamp),
            root,
            { gasLimit: 1600000 },
          );
          await regTx.wait(1);
          onChainStatus = 1;
        }
        const desiredOnChainStatus = nextStatus === 'ACTIVE' ? 1 : 2;
        if (onChainStatus !== desiredOnChainStatus) {
          const statusTx = await (this.vaultContract.connect(adminWallet) as any).setSessionStatus(
            key.sessionPublicKey,
            desiredOnChainStatus,
            { gasLimit: 300000 },
          );
          await statusTx.wait(1);
        }
      } catch (err: any) {
        throw new Error(`On-chain agent status could not be updated: ${err?.message || 'unknown error'}`);
      }
    }

    key.status = nextStatus;
    this.persistState();
    return key;
  }

  public async removeKey(keyId: string): Promise<boolean> {
    const key = this.keys.get(keyId);
    if (!key) return false;

    // Deleting a local record must not leave an active on-chain signer behind.
    // Revoke first and only remove the local policy after the chain confirms it.
    if (this.networkMode === 'LIVE_TESTNET' && this.vaultBytecodePresent && this.relayerWallet && key.sessionPublicKey) {
      try {
        const adminWallet = await this.getVaultAdminWallet();
        const config = await this.vaultContract.sessionKeys(key.sessionPublicKey);
        const onChainStatus = Number(config.status);
        if (onChainStatus !== 0 && onChainStatus !== 4) {
          const revokeTx = await (this.vaultContract.connect(adminWallet) as any).setSessionStatus(
            key.sessionPublicKey,
            4,
            { gasLimit: 300000 },
          );
          await revokeTx.wait(1);
        }
      } catch (err: any) {
        throw new Error(`On-chain session key revoke failed; local key was kept: ${err?.message || 'unknown error'}`);
      }
    }

    this.keys.delete(keyId);
    this.persistState();
    return true;
  }

  public async prepareAuthorization(params: {
    keyId: string;
    signerAddress?: string;
    targetUrl: string;
    pricePathUsd: number;
    channelId?: number;
    payee?: string;
  }) {
    const cleanKeyId = String(params.keyId || '').trim();
    if (!cleanKeyId) {
      throw new Error('keyId is required so authorization is bound to one spending policy.');
    }
    let key = this.keys.get(cleanKeyId)
      || Array.from(this.keys.values()).find(k => k.id === cleanKeyId || k.agentId === cleanKeyId || k.agentName.toLowerCase() === cleanKeyId.toLowerCase());

    if (!key) {
      throw new Error(`404 Not Found: Session key "${cleanKeyId}" does not exist in SynapseVault.`);
    }

    const price = Number(params.pricePathUsd);
    if (!Number.isFinite(price) || price <= 0) {
      throw new Error('pricePathUsd must be a positive number.');
    }
    let settlementPayee = this.receiverAddress;
    if (params.payee !== undefined && String(params.payee).trim()) {
      try {
        settlementPayee = ethers.getAddress(String(params.payee).trim());
      } catch {
        throw new Error('recipient must be a valid EVM address.');
      }
    }
    let parsedTarget: URL;
    try {
      parsedTarget = new URL(String(params.targetUrl || '').trim());
      if (!['http:', 'https:'].includes(parsedTarget.protocol) || !parsedTarget.hostname) {
        throw new Error('invalid protocol');
      }
    } catch {
      throw new Error('targetUrl must be a valid http:// or https:// URL.');
    }
    if (key.maxPerCallPathUsd > 0 && price > key.maxPerCallPathUsd) {
      throw new Error(`pricePathUsd exceeds this agent's per-call limit of $${key.maxPerCallPathUsd.toFixed(4)}.`);
    }
    if (key.currentSpentPathUsd + price > key.totalBudgetPathUsd) {
      throw new Error(`pricePathUsd exceeds this agent's remaining budget of $${Math.max(0, key.totalBudgetPathUsd - key.currentSpentPathUsd).toFixed(4)}.`);
    }

    const matchedDomain = findMatchingAllowlistEntry(parsedTarget.toString(), key.whitelistedDomains);
    if (!matchedDomain) {
      throw new Error(`403 Forbidden: Target endpoint is not whitelisted for session key "${key.id}".`);
    }

    const effectiveSigner = params.signerAddress
      ? ethers.getAddress(params.signerAddress)
      : this.getWalletForKey(key.id).address;
    // Preparation is part of the selected spending policy. Do not let a
    // caller make the relayer pre-register an unrelated signer or produce a
    // credential that the subsequent settlement route will reject.
    if (effectiveSigner.toLowerCase() !== key.sessionPublicKey.toLowerCase()) {
      throw new Error('signerAddress must match the selected session key.');
    }

    const channelId = params.channelId !== undefined ? Number(params.channelId) : key.channelId;
    if (!Number.isSafeInteger(channelId) || channelId < 0) {
      throw new Error('channelId must be a non-negative safe integer.');
    }
    let nextNonce = key.sequenceNonce + 1;

    // Preparation is read-only. A live session is registered only inside the
    // authenticated settlement path, immediately before the payment attempt.
    if (this.networkMode === 'LIVE_TESTNET' && this.vaultBytecodePresent && this.relayerWallet) {
      try {
        const sessionConfig = await this.vaultContract.sessionKeys(effectiveSigner);
        const onChainNonce = await this.vaultContract.lastNonce(effectiveSigner, channelId);
        nextNonce = Number(onChainNonce) + 1;
      } catch (err: any) {
        console.warn(`[Synapse402 Engine] On-chain session check notice: ${err?.message || err}`);
      }
    }

    const nonce2D = `0x${channelId.toString(16).padStart(2, '0')}:0x${nextNonce.toString(16).padStart(4, '0')}`;
    const parsedAmount = BigInt(Math.max(1, Math.round(price * 1e6)));
    const memoPrefix = `pacs.008|${key.agentName.slice(0, 8)}|${nonce2D}`;
    const memoBytes32 = ethers.encodeBytes32String(memoPrefix.slice(0, 31));

    // Use the same canonical StandardMerkleTree leaf as settlement and the
    // provider SDK. This lowercases/trims the endpoint before the contract's
    // double-keccak leaf calculation, so prepare and settle cannot disagree.
    // Settlement signs the Merkle leaf for the approved route prefix. Keep
    // prepare and settle bound to the same canonical endpoint hash.
    const endpointLeaf = canonicalEndpointHash(matchedDomain);

    const validBefore = Math.floor(Date.now() / 1000) + 86400 * 30;

    const domain = {
      name: 'SynapseVault',
      version: '1.0.0',
      chainId: this.chainId,
      verifyingContract: this.vaultAddress,
    };

    const types = {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      MPPAuthorization: [
        { name: 'sessionKey', type: 'address' },
        { name: 'channelId', type: 'uint64' },
        { name: 'nonce', type: 'uint64' },
        { name: 'payee', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'endpointHash', type: 'bytes32' },
        { name: 'memo', type: 'bytes32' },
        { name: 'validBefore', type: 'uint256' },
      ],
    };

    const message = {
      sessionKey: effectiveSigner,
      channelId,
      nonce: nextNonce,
      payee: settlementPayee,
      amount: parsedAmount.toString(),
      endpointHash: endpointLeaf,
      memo: memoBytes32,
      validBefore,
    };

    return {
      typedData: {
        domain,
        types,
        primaryType: 'MPPAuthorization',
        message,
      },
      effectiveSigner,
      channelId,
      nonce: nextNonce,
      validBefore,
      endpointLeaf,
      memoBytes32,
      targetUrl: parsedTarget.toString(),
      pricePathUsd: price,
      keyId: key.id,
      payee: settlementPayee,
    };
  }

  public async settle402(
    keyId: string,
    targetEndpoint: string,
    pricePathUsd: number,
    endpointCategory?: string,
    options?: {
      simulateFailure?: boolean;
      allowDynamicWhitelist?: boolean;
      idempotencyKey?: string;
      corruptSignature?: boolean;
      customSig?: string;
      signerAddress?: string;
      channelId?: number;
      nonce?: number;
      validBefore?: number;
      asyncRelay?: boolean;
      evaluationOnly?: boolean;
      /** One mission's maximum, layered over the reusable safety rule. */
      jobBudgetPathUsd?: number;
      /** Optional persistent job identifier used by streaming and mission ledgers. */
      jobId?: string;
      /** Recipient from the provider's 402 challenge; defaults to the first-party receiver. */
      payee?: string;
      asset?: string;
      realm?: string;
      /** Called when an async live relay fails after the HTTP response is sent. */
      onAsyncFailure?: () => void;
    }
  ) {
    const requestStartT = performance.now();
    let settlementPayee = this.receiverAddress;
    if (options?.payee !== undefined && String(options.payee).trim()) {
      try {
        settlementPayee = ethers.getAddress(String(options.payee).trim());
      } catch {
        throw new Error('400 Bad Request: payment recipient must be a valid EVM address.');
      }
    }
    if (options?.asset !== undefined && options.asset !== 'pathUSD') {
      throw new Error('400 Bad Request: unsupported payment asset.');
    }
    if (options?.realm !== undefined && options.realm !== 'Tempo-L1') {
      throw new Error('400 Bad Request: payment realm does not match Tempo-L1.');
    }
    const cleanKeyId = String(keyId || '').trim();
    if (!cleanKeyId) {
      throw new Error('400 Bad Request: keyId is required; settlement cannot silently choose another spending policy.');
    }
    let key = this.keys.get(cleanKeyId)
      || Array.from(this.keys.values()).find(k => k.id === cleanKeyId || k.agentId === cleanKeyId || k.agentName.toLowerCase() === cleanKeyId.toLowerCase());
    if (!key) {
      throw new Error(`404 Not Found: Session key "${cleanKeyId}" does not exist in SynapseVault.`);
    }
    if (!key) {
      throw new Error('No active session key available in SynapseVault.');
    }

    // A mission must not spend from, or rewrite, the reusable safety rule.
    // Work against an in-memory job policy instead. The persisted key and its
    // cumulative usage remain the source of truth for recurring controls.
    const requestedJobBudget = Number(options?.jobBudgetPathUsd);
    if (Number.isFinite(requestedJobBudget) && requestedJobBudget > 0) {
      const jobBudget = Math.min(requestedJobBudget, key.totalBudgetPathUsd);
      key = {
        ...key,
        totalBudgetPathUsd: jobBudget,
        maxPerCallPathUsd: Math.min(key.maxPerCallPathUsd, jobBudget),
        currentSpentPathUsd: 0,
        status: 'ACTIVE',
        channelNonces: { ...(key.channelNonces || {}) },
        whitelistedDomains: [...key.whitelistedDomains],
      };
    }

    // Evaluation mode builds a complete trace without consuming the configured
    // key budget, nonce, or provider allow-list. Restore these fields on every
    // exit path so the UI cannot accidentally spend the demo account.
    const evaluationState = options?.evaluationOnly === true
      ? {
          currentSpentPathUsd: key.currentSpentPathUsd,
          status: key.status,
          sequenceNonce: key.sequenceNonce,
          channelNonces: { ...(key.channelNonces || {}) },
          whitelistedDomains: [...key.whitelistedDomains],
          merkleRoot: key.merkleRoot,
          lastActive: key.lastActive,
        }
      : null;
    const restoreEvaluationState = () => {
      if (!evaluationState) return;
      key.currentSpentPathUsd = evaluationState.currentSpentPathUsd;
      key.status = evaluationState.status;
      key.sequenceNonce = evaluationState.sequenceNonce;
      key.channelNonces = { ...evaluationState.channelNonces };
      key.whitelistedDomains = [...evaluationState.whitelistedDomains];
      key.merkleRoot = evaluationState.merkleRoot;
      key.lastActive = evaluationState.lastActive;
    };

    // 0. Idempotency Key Replay Guard
    const effectiveIdempotencyKey = options?.idempotencyKey ? String(options.idempotencyKey).trim() : undefined;
    // Evaluation and live calls must never share an idempotency cache entry.
    // Otherwise a live receipt could be replayed by a later evaluation request.
    const executionScope = options?.evaluationOnly === true ? 'evaluation' : 'live';
    const cacheKey = effectiveIdempotencyKey ? `${key.id}:${executionScope}:${effectiveIdempotencyKey}` : undefined;

    if (cacheKey) {
      const cached = this.idempotencyCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < IDEMPOTENCY_TTL_MS) {
        return {
          trace: { ...cached.trace, isIdempotentCacheHit: true },
          updatedKey: key,
          blockHeight: this.blockHeight,
          status: cached.trace.status === 'SETTLED' ? 'SETTLED' as const
            : cached.trace.status === 'PENDING' ? 'PENDING' as const
            : 'SIMULATED_PASS' as const,
        };
      }

      const inFlight = this.inFlightIdempotency.get(cacheKey);
      if (inFlight) {
        const result = await inFlight;
        return {
          ...result,
          trace: { ...result.trace, isIdempotentCacheHit: true },
        };
      }
    }

    const executeSettlement = async (): Promise<{ trace: MPPTraceRecord; updatedKey: ScopedSessionKeyRecord; blockHeight: number; status: 'SETTLED' | 'FAILED' | 'SIMULATED_PASS' | 'PENDING' | 'REJECTED' | 'VOIDED' }> => {
    if (key.status !== 'ACTIVE') {
      throw new Error(`Key is in status ${key.status}. Payment authorization denied.`);
    }

    const nowSec = Math.floor(Date.now() / 1000);
    if (Number.isFinite(key.validBeforeTimestamp) && key.validBeforeTimestamp <= nowSec) {
      if (!evaluationState) {
        key.status = 'PAUSED';
        this.persistState();
      }
      throw new Error(`403 Forbidden: Agent spending key expired at ${key.validBeforeTimestamp}. Payment blocked before debit.`);
    }

    const price = Number(pricePathUsd);
    if (!Number.isFinite(price) || price <= 0) {
      throw new Error(`Invalid price ${pricePathUsd}. Settlement amount must be a positive finite number.`);
    }

    if (price < 0.000001) {
      throw new Error('400 Bad Request: pricePathUsd is below minimum precision (0.000001 pathUSD / 1 token unit).');
    }

    if (!targetEndpoint || typeof targetEndpoint !== 'string' || (!/^https?:\/\//i.test(targetEndpoint.trim()) && !targetEndpoint.trim().startsWith('/'))) {
      throw new Error('400 Bad Request: targetEndpoint must be a valid http:// or https:// URL.');
    }

    if (targetEndpoint.trim().startsWith('/')) {
      targetEndpoint = `http://127.0.0.1:${process.env.PORT || 3001}${targetEndpoint.trim()}`;
    }

    if (targetEndpoint.length > 2048) {
      throw new Error('400 Bad Request: targetEndpoint exceeds maximum permitted limit of 2048 characters.');
    }

    if (options?.validBefore !== undefined) {
      if (Number(options.validBefore) <= nowSec) {
        throw new Error(`403 Forbidden: Agent spending key authorization has expired. Payment blocked before debit.`);
      }
    }

    // Strict allowlist matching. Providers can explicitly whitelist an apex
    // domain when they want subdomains; a host-specific route must not silently
    // authorize an attacker-controlled subdomain.
    const extractHostAndPath = (urlStr: string) => {
      try {
        const fullUrl = urlStr.startsWith('/')
          ? `http://127.0.0.1:${process.env.PORT || 3001}${urlStr}`
          : urlStr.startsWith('http') ? urlStr : `https://${urlStr}`;
        const u = new URL(fullUrl);
        return {
          hostname: u.hostname.toLowerCase(),
          port: u.port || (u.protocol === 'https:' ? '443' : '80'),
          pathname: u.pathname.replace(/\/+$/, '') || '/',
          search: u.search,
        };
      } catch {
        const clean = urlStr.replace(/^https?:\/\//i, '');
        const parts = clean.split('/');
        const hostParts = parts[0].split(':');
        const host = hostParts[0].toLowerCase();
        const port = hostParts[1] || '443';
        const path = '/' + parts.slice(1).join('/').replace(/\/+$/, '');
        return { hostname: host, port, pathname: path, search: '' };
      }
    };

    const targetInfo = extractHostAndPath(targetEndpoint);
    const localGatewayPort = String(process.env.PORT || 3001);
    // Local provider fixtures are served by this gateway only. Never treat an
    // arbitrary localhost port (for example 8080 or the cloud metadata port)
    // as an approved provider; that would turn the local exception into SSRF.
    // Local demo providers are internal fixtures, but they are still a
    // finite allowlist. Do not let an arbitrary localhost URL widen scope.
    const localGatewayPrefixes = [
      '/api/v1/data/',
      '/api/v1/market/',
      '/api/v1/due-diligence/',
      '/api/v1/media/',
      '/api/v1/test-provider-data',
      '/api/v1/mock-500',
      '/api/v1/surge-demo',
      '/api/stream/inference',
    ];
    const isLocalGatewayTarget =
      (targetInfo.hostname === '127.0.0.1' || targetInfo.hostname === 'localhost')
      && targetInfo.port === localGatewayPort
      && localGatewayPrefixes.some((prefix) => targetInfo.pathname === prefix.replace(/\/$/, '') || targetInfo.pathname.startsWith(prefix));

    if (isBlockedOutboundUrl(targetEndpoint) && !isLocalGatewayTarget) {
      throw new Error('403 Forbidden: private, localhost, link-local, or metadata provider targets are blocked.');
    }

    let matchedDomain = findMatchingAllowlistEntry(targetEndpoint, key.whitelistedDomains);

    // Dynamic registration is an explicit evaluation/test escape hatch only.
    // A local hostname or a Synapse402-owned hostname must never bypass the
    // session Merkle allowlist by itself.
    if (!matchedDomain && options?.allowDynamicWhitelist === true && (evaluationState || options?.simulateFailure === true)) {
      if (price <= key.maxPerCallPathUsd || options?.simulateFailure === true) {
        matchedDomain = targetEndpoint;
      }
    }

    if (!matchedDomain) {
      throw new Error(`403 Forbidden: Host "${targetInfo.hostname}" is NOT whitelisted on approved vendor list. Security guardrail blocked payment — $0.00 debited from treasury.`);
    }

    const cleanTargetDomain = (targetInfo.hostname === '127.0.0.1' || targetInfo.hostname === 'localhost')
      ? 'api.synapse402.network'
      : targetInfo.hostname;

    if (price > key.maxPerCallPathUsd) {
      throw new Error(`Cost ($${price}) exceeds maximum allowed per call ($${key.maxPerCallPathUsd}).`);
    }

    // Velocity Control / Rate-Limit Guard (Protects against runaway agent loops)
    const nowMs = Date.now();
    const rateWindow = (this as any).rateWindows?.get(key.id) || { count: 0, resetAt: nowMs + 60000 };
    if (nowMs > rateWindow.resetAt) {
      rateWindow.count = 0;
      rateWindow.resetAt = nowMs + 60000;
    }
    rateWindow.count += 1;
    if (!evaluationState) {
      if (!(this as any).rateWindows) (this as any).rateWindows = new Map();
      (this as any).rateWindows.set(key.id, rateWindow);
    }

    const maxPerMinute = (key as any).maxPerMinute || 120;
    if (rateWindow.count > maxPerMinute) {
      throw new Error(`429 Too Many Requests: Rate limit of ${maxPerMinute} payments/minute exceeded for agent ${key.agentName}.`);
    }

    // Exact integer micro-units arithmetic (eliminates floating-point drift & precision loss)
    const priceMicro = Math.round(price * 1e6);
    const currentSpentMicro = Math.round(key.currentSpentPathUsd * 1e6);
    const totalBudgetMicro = Math.round(key.totalBudgetPathUsd * 1e6);

    if (currentSpentMicro + priceMicro > totalBudgetMicro) {
      throw new Error(`402 Payment Required: Session budget exceeded. Requested $${price.toFixed(4)}, available budget $${((totalBudgetMicro - currentSpentMicro) / 1e6).toFixed(4)}.`);
    }

    // ATOMIC RESERVATION (Prevents TOCTOU Race Condition):
    // Instantly reserve budget in micro-units before any asynchronous await points.
    // Evaluation requests use the same checks but do not reserve real state.
    if (!evaluationState) {
      key.currentSpentPathUsd = (currentSpentMicro + priceMicro) / 1e6;
      if (key.currentSpentPathUsd >= key.totalBudgetPathUsd) {
        key.status = 'DEPLETED';
      }
    }

    // Cryptographic Merkle Proof & Root matching OpenZeppelin & SynapseVault.sol
    const mt = new MerkleTree(key.whitelistedDomains);
    key.merkleRoot = mt.getRoot();
    const merkleProof = mt.getProof(matchedDomain);
    const domainHash = mt.getLeafHash(matchedDomain);

    // Advance nonce and fetch the latest live block from the sync cache.
    if (this.blockHeight === 0) {
      try {
        const liveBlock = await this.provider.getBlockNumber();
        if (liveBlock > 0) this.blockHeight = liveBlock;
      } catch {
        this.blockHeight = 0;
      }
    }

    // Cryptographic EIP-712 Signature with Real Agent Wallet or Connected Judge Wallet
    const wallet = this.getWalletForKey(key.id);
    const effectiveSigner = options?.signerAddress ? ethers.getAddress(options.signerAddress) : wallet.address;
    const effectiveChannel = options?.channelId !== undefined ? Number(options.channelId) : key.channelId;

    if (!key.channelNonces) key.channelNonces = {};
    if (key.channelNonces[effectiveChannel] === undefined) {
      key.channelNonces[effectiveChannel] = effectiveChannel === key.channelId ? key.sequenceNonce : 0;
    }

    if (this.networkMode === 'LIVE_TESTNET' && this.vaultBytecodePresent && !options?.asyncRelay) {
      try {
        const onChainNonce = await this.vaultContract.lastNonce(effectiveSigner, effectiveChannel);
        key.channelNonces[effectiveChannel] = Number(onChainNonce);
        if (effectiveChannel === key.channelId) {
          key.sequenceNonce = Number(onChainNonce);
        }
      } catch (nonceErr: any) {
        console.debug(`[Synapse402 Engine] Nonce query notice: ${nonceErr?.message}`);
      }
    }

    // Evaluation traces must still carry a unique credential nonce when they
    // are immediately replayed against a provider middleware. Evaluation
    // state is restored after the run, so the reusable key's nonce cannot be
    // advanced; derive a transient 48-bit nonce from the stable job request
    // instead. Idempotent retries return the cached trace before this point.
    const evaluationNonceSeed = effectiveIdempotencyKey || options?.jobId || `${Date.now()}:${requestStartT}`;
    const transientEvaluationNonce = evaluationState
      ? Math.max(1, Number(BigInt(ethers.keccak256(ethers.toUtf8Bytes(`${key.id}:${evaluationNonceSeed}`))) & 0x0000ffffffffffffn))
      : undefined;
    const currentNonce = options?.nonce !== undefined
      ? Number(options.nonce)
      : (transientEvaluationNonce ?? (key.channelNonces[effectiveChannel] + 1));
    key.channelNonces[effectiveChannel] = currentNonce;
    if (effectiveChannel === key.channelId) {
      key.sequenceNonce = currentNonce;
    }
    let nonce2D = `0x${effectiveChannel.toString(16).padStart(2, '0')}:0x${currentNonce.toString(16).padStart(4, '0')}`;

    const domain = {
      name: 'SynapseVault',
      version: '1.0.0',
      chainId: this.chainId,
      verifyingContract: this.vaultAddress,
    };
    const types = {
      MPPAuthorization: [
        { name: 'sessionKey', type: 'address' },
        { name: 'channelId', type: 'uint64' },
        { name: 'nonce', type: 'uint64' },
        { name: 'payee', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'endpointHash', type: 'bytes32' },
        { name: 'memo', type: 'bytes32' },
        { name: 'validBefore', type: 'uint256' },
      ],
    };

    const parsedAmount = BigInt(Math.round(price * 1e6));
    const memoPrefix = `pacs.008|${key.agentName.slice(0, 8)}|${nonce2D}`;
    const memoBytes32 = ethers.encodeBytes32String(memoPrefix.slice(0, 31));

    const eip712Value = {
      sessionKey: effectiveSigner,
      channelId: effectiveChannel,
      nonce: currentNonce,
      payee: settlementPayee,
      amount: parsedAmount,
      endpointHash: domainHash,
      memo: memoBytes32,
      validBefore: options?.validBefore ? Number(options.validBefore) : key.validBeforeTimestamp,
    };

    let sigHex = '';
    const structHash = ethers.TypedDataEncoder.hash(domain, types, eip712Value);

    if (options?.corruptSignature) {
      // Rollback atomic reservation
      if (evaluationState) restoreEvaluationState();
      else {
        key.currentSpentPathUsd = Math.max(0, Math.round(key.currentSpentPathUsd * 1e6 - priceMicro) / 1e6);
        if (key.currentSpentPathUsd < key.totalBudgetPathUsd) key.status = 'ACTIVE';
      }
      const baseSig = options?.customSig || wallet.signingKey.sign(structHash).serialized;
      const corruptedSig = baseSig.slice(0, -2) + (baseSig.slice(-2) === '1b' ? '1c' : '1b');
      let recovered = '0x0000000000000000000000000000000000000000';
      try {
        recovered = ethers.recoverAddress(structHash, corruptedSig);
      } catch {
        recovered = '0xINVALID_SIGNATURE';
      }
      throw new Error(`401 Unauthorized: Payment card signature invalid (forged or tampered card). Security guardrail blocked payment off-chain.`);
    }

    if (options?.customSig) {
      sigHex = options.customSig;
      let recovered = '0x0000000000000000000000000000000000000000';
      try {
        recovered = ethers.recoverAddress(structHash, sigHex);
      } catch {
        recovered = '0xINVALID_SIGNATURE';
      }
      if (recovered.toLowerCase() !== effectiveSigner.toLowerCase()) {
        // Rollback atomic reservation
        if (evaluationState) restoreEvaluationState();
        else {
          key.currentSpentPathUsd = Math.max(0, Math.round(key.currentSpentPathUsd * 1e6 - priceMicro) / 1e6);
          if (key.currentSpentPathUsd < key.totalBudgetPathUsd) key.status = 'ACTIVE';
        }
        throw new Error(`401 Unauthorized: Payment card signature invalid (forged or tampered card). Security guardrail blocked payment off-chain.`);
      }
    } else {
      sigHex = wallet.signingKey.sign(structHash).serialized;
    }

    let eip712DomainSeparator = '';
    let eip712StructHash = '';
    try {
      eip712DomainSeparator = ethers.TypedDataEncoder.hashDomain(domain);
      eip712StructHash = ethers.TypedDataEncoder.hashStruct('MPPAuthorization', types, eip712Value);
    } catch {
      eip712DomainSeparator = sha256('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)');
      eip712StructHash = sha256('MPPAuthorization(address sessionKey,uint64 channelId,uint64 nonce,address payee,uint256 amount,bytes32 endpointHash,bytes32 memo,uint256 validBefore)');
    }

    // Pre-settlement void handler for explicit gateway/provider failure
    // simulations. The engine does not fetch an upstream resource before
    // payment, so it must never claim a refund for an unobserved 5xx response.
    const executePreSettlementVoidRefund = (reason: string, details?: any) => {
      // 1. Rollback atomic reservation on key
      if (evaluationState) {
        restoreEvaluationState();
      } else {
        key.currentSpentPathUsd = Math.max(0, Math.round(key.currentSpentPathUsd * 1e6 - priceMicro) / 1e6);
        if (key.currentSpentPathUsd < key.totalBudgetPathUsd) {
          key.status = 'ACTIVE';
        }
      }

      const refundTrace: MPPTraceRecord = {
        id: `trace_refund_${Date.now()}_${key.sequenceNonce}`,
        timestamp: new Date().toISOString(),
        blockNumber: this.blockHeight,
        agentId: key.agentId,
        agentName: key.agentName,
        targetEndpoint,
        method: 'GET',
        costPathUsd: 0,
        latencyMs: Math.max(1, Math.round(performance.now() - requestStartT)),
        httpStatusBefore: 402,
        httpStatusAfter: 200,
        challengeHeader: `MPP realm="Tempo-L1", asset="pathUSD", minPrice="${price}", recipient="${settlementPayee}"`,
        authAuthorizationHeader: `MPP-EIP712 signer="${wallet.address}", nonce="${nonce2D}", max="${key.maxPerCallPathUsd}"`,
        eip712Signature: sigHex,
        // A pre-settlement void never submits an on-chain transaction.
        // Keep the receipt explicit instead of inventing a transaction hash.
        txHash: '',
        executionMode: 'RESILIENT_SANDBOX',
        status: 'VOIDED',
        providerDataStatus: 'EVALUATION_FIXTURE',
        tempoTxType: undefined,
        nonce2D,
        memoPayload: `SLA_REFUND:${reason.slice(0, 30)}:${cleanTargetDomain}:REFUND_${price}_pathUSD`,
        routerFeePathUsd: 0,
        tip20Memo: ethers.encodeBytes32String(`SLA_REFUND|${nonce2D}`),
        iso20022Remittance: {
          standard: 'ISO-20022 pacs.008.001.08',
          costCenter: `CC-AI-${key.agentId.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-6) || 'TREASURY'}`,
          categoryCode: 'SLA Void & Refund',
          invoiceDigest: `0x${sha256(`REFUND_DIGEST:${cleanTargetDomain}:${price}:${Date.now()}`)}`,
        },
        merkleProof,
        merkleRoot: key.merkleRoot,
        domainHash,
        eip712DomainSeparator,
        eip712StructHash,
        liveProxyPayload: {
          error: reason,
          slaStatus: 'PRE_SETTLEMENT_VOID_EXECUTED',
          refundAmountPathUsd: price,
          penaltyAssessedPathUsd: 0.0000,
          ledgerNote: 'Pre-settlement Void (Gateway Level) executed. Zero on-chain debit, $0 lost from SynapseVault.',
          details: details || null,
        },
        sanctionsCompliance: {
          status: 'UNVERIFIED',
          policy: 'Example compliance check — live sanctions lookup not run',
          checkedAt: new Date().toISOString(),
        },
        complianceVerification: {
          status: 'UNVERIFIED',
          policy: 'Example compliance check — live sanctions lookup not run',
          checkedAt: new Date().toISOString(),
        },
      };

      this.traces.unshift(refundTrace);
      this.persistState();
      return {
        trace: refundTrace,
        updatedKey: key,
        blockHeight: this.blockHeight,
        status: 'VOIDED' as const,
      };
    };

    // 1. Explicit Simulated Failure check (for UI Fault Injection & Tests)
    if (options?.simulateFailure) {
      return executePreSettlementVoidRefund('Explicit provider-failure signal (pre-settlement simulation)');
    }

    // 2. Payment-first semantics: this gateway issues the signed payment
    // credential and the agent performs the provider request once afterward.
    // The gateway deliberately does not fetch targetEndpoint itself; doing so
    // before settlement could leak a paid resource, and doing it again after
    // settlement would execute POST/action providers twice.
    let liveProxyPayload: any = null;
    // Payment confirmation and provider-data provenance are independent facts.
    // A Tempo receipt can be real even when this hackathon uses a fixture for
    // the provider payload; callers must be able to tell those cases apart.
    let providerDataStatus: 'EVALUATION_FIXTURE' | 'UPSTREAM_RESPONSE' = 'EVALUATION_FIXTURE';
    key.lastActive = 'Just now';

    // A showcase request may inspect the full payment plan without spending the
    // relayer's live funds. Live settlement is opt-in for callers that explicitly
    // request it; evaluation mode never mutates chain-backed financial metrics.
    const liveSettlementEnabled = this.networkMode === 'LIVE_TESTNET'
      && this.vaultBytecodePresent
      && Boolean(this.relayerWallet)
      && options?.evaluationOnly !== true;

    // Metrics are committed only after a confirmed live receipt. A pending
    // relay is not revenue and must not inflate provider counters.
    const routerFeeMicro = priceMicro > 0 ? Math.max(1, Math.round(priceMicro * 0.001)) : 0;

    // High-Fidelity Data Provider Fallback for Financial AI Agents
    if (!liveProxyPayload) {
      if (cleanTargetDomain.includes('deepseek')) {
        liveProxyPayload = {
          model: 'deepseek-chat-v3',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: 'Market depth analysis: Liquidity is concentrated within +/-0.15% spread on Tempo L1 with optimal slippage under 4 bps.'
              },
              finish_reason: 'stop'
            }
          ],
          usage: { prompt_tokens: 48, completion_tokens: 32, total_tokens: 80 },
          verifiedFee: `$${price.toFixed(4)} USD`,
          savingsVsSubscription: 'Replaced $20/mo OpenAI/DeepSeek plan with a $0.0008 on-demand call',
          checksum: sha256(`${targetEndpoint}:${this.blockHeight}`),
          timestamp: Date.now(),
          upstreamVerified: false,
          paymentConfirmed: false,
        };
      } else if (cleanTargetDomain.includes('vision') || cleanTargetDomain.includes('remove-bg')) {
        liveProxyPayload = {
          task: 'IMAGE_SEGMENTATION_BACKGROUND_REMOVAL',
          model: 'BiRefNet-General-v2',
          inputDimensions: '1920x1080',
          outputMaskUrl: 'https://cdn.vision-neural.ai/masks/84f97203.png',
          transparentPngUrl: 'https://cdn.vision-neural.ai/processed/84f97203_cutout.png',
          settledCost: `$${price.toFixed(4)} USD`,
          savingsVsSubscription: 'Replaced monthly graphic design subscription with a $0.0020 on-demand micro-call',
          checksum: sha256(`${targetEndpoint}:${this.blockHeight}`),
          timestamp: Date.now(),
          upstreamVerified: false,
          paymentConfirmed: false,
        };
      } else if (cleanTargetDomain.includes('news') || cleanTargetDomain.includes('article') || cleanTargetDomain.includes('dispatch')) {
        liveProxyPayload = {
          headline: 'Global Autonomous Logistics Transition 2026',
          sourcePublication: 'The Decentralized Chronicle (Paywalled Article #4029)',
          fullTextAccess: 'UNLOCKED via HTTP 402 Stateless Handshake',
          readingTimeMin: 6,
          verifiedPublisherPayout: `$${price.toFixed(4)} USD`,
          savingsVsSubscription: 'Bypassed $40/mo publisher paywall for single-article read',
          checksum: sha256(`${targetEndpoint}:${this.blockHeight}`),
          timestamp: Date.now(),
          upstreamVerified: false,
          paymentConfirmed: false,
        };
      } else if (cleanTargetDomain.includes('translate') || cleanTargetDomain.includes('polyglot')) {
        liveProxyPayload = {
          sourceLanguage: 'German (de)',
          targetLanguage: 'English (en)',
          tokensTranslated: 842,
          bleuScore: 0.942,
          verifiedFee: `$${price.toFixed(4)} USD`,
          savingsVsSubscription: 'Zero human login. Replaced $50/mo enterprise translation plan',
          checksum: sha256(`${targetEndpoint}:${this.blockHeight}`),
          timestamp: Date.now(),
          upstreamVerified: false,
          paymentConfirmed: false,
        };
      } else if (cleanTargetDomain.includes('sandbox') || cleanTargetDomain.includes('containers')) {
        liveProxyPayload = {
          environment: 'Python 3.12 Isolated Micro-Sandbox',
          executionStatus: 'SUCCESS (Exit Code 0)',
          computeMemory: '64MB ephemeral container',
          codeExecuted: 'def analyze_risk(portfolio):\n    return {"var_99": 0.0142, "sharpe": 2.84}',
          runtimeResult: { var_99: 0.0142, sharpe: 2.84, status: 'CONVERGED' },
          verifiedFee: `$${price} USD`,
          savingsVsSubscription: 'Replaced $50/mo AWS server base cost with ephemeral $0.0050 execution',
          checksum: sha256(`${targetEndpoint}:${this.blockHeight}`),
          timestamp: Date.now(),
          upstreamVerified: false,
          paymentConfirmed: false,
        };
      } else if (cleanTargetDomain.includes('scrape') || cleanTargetDomain.includes('crawler')) {
        liveProxyPayload = {
          targetHost: 'commodity-exchange.ch',
          antiBotProtection: 'Cloudflare Turnstile (Bypassed)',
          residentialProxyNode: 'US-East-Ashburn-ISP',
          extractedData: { spotCopperPerTon: 9420.50, warehouseStockIndex: 'LME-Grade-A' },
          verifiedFee: `$${price.toFixed(4)} USD`,
          savingsVsSubscription: 'Replaced $100/mo BrightData scraper subscription',
          checksum: sha256(`${targetEndpoint}:${this.blockHeight}`),
          timestamp: Date.now(),
          upstreamVerified: false,
          paymentConfirmed: false,
        };
      } else if (cleanTargetDomain.includes('voice') || cleanTargetDomain.includes('synthesize')) {
        liveProxyPayload = {
          ttsEngine: 'Neural-TTS-Turbo-v2',
          audioDurationSec: 5.4,
          sampleRateHz: 44100,
          audioCdnStream: 'https://cdn.voice-neural.io/v1/streams/402_voice_out.mp3',
          verifiedFee: `$${price.toFixed(4)} USD`,
          savingsVsSubscription: 'Replaced fixed monthly voice tier with $0.0040 on-demand micro-call',
          checksum: sha256(`${targetEndpoint}:${this.blockHeight}`),
          timestamp: Date.now(),
          upstreamVerified: false,
          paymentConfirmed: false,
        };
      } else if (cleanTargetDomain.includes('flight') || cleanTargetDomain.includes('fares')) {
        liveProxyPayload = {
          gdsGlobalDistribution: 'Amadeus NDC 17.2',
          itinerary: 'SFO -> FRA (Flight LH455)',
          lowestFareUsd: 612.40,
          seatsAvailableInClass: 3,
          seatLockStatus: 'CONFIRMED_HOLD_15MIN',
          verifiedFee: `$${price.toFixed(4)} USD`,
          savingsVsSubscription: 'Replaced $200/mo Amadeus GDS terminal licensing fee',
          checksum: sha256(`${targetEndpoint}:${this.blockHeight}`),
          timestamp: Date.now(),
          upstreamVerified: false,
          paymentConfirmed: false,
        };
      } else if (cleanTargetDomain.includes('identity') || cleanTargetDomain.includes('verify')) {
        liveProxyPayload = {
          screeningService: 'Example compliance response (sample provider)',
          riskScore: 'Example score (not a live screening)',
          pepMatch: false,
          interpolRedNotice: 'Example result (not a live lookup)',
          isoRemittanceAuditDigest: memoBytes32,
          verifiedFee: `$${price.toFixed(4)} USD`,
          savingsVsSubscription: 'Replaced $150/mo Persona/Trulioo base contract with $0.0050 verification',
          checksum: sha256(`${targetEndpoint}:${this.blockHeight}`),
          timestamp: Date.now(),
          upstreamVerified: false,
          paymentConfirmed: false,
        };
      } else if (cleanTargetDomain.includes('binance') || cleanTargetDomain.includes('depth') || cleanTargetDomain.includes('orderbook') || targetEndpoint.toLowerCase().includes('aapl') || targetEndpoint.toLowerCase().includes('sol')) {
        const isSol = cleanTargetDomain.includes('sol') || targetEndpoint.toLowerCase().includes('sol');
        const isAapl = cleanTargetDomain.includes('aapl') || targetEndpoint.toLowerCase().includes('aapl');
        const basePrice = isSol ? 148.50 : (isAapl ? 172.50 : 64250.00);
        const symbol = isSol ? 'SOL/USDT' : (isAapl ? 'AAPL/USD' : 'BTC/pathUSD');
        liveProxyPayload = {
          symbol,
          baseAsset: isSol ? 'SOL' : (isAapl ? 'AAPL' : 'BTC'),
          quoteAsset: isSol ? 'USDT' : (isAapl ? 'USD' : 'pathUSD'),
          sequence: key.sequenceNonce,
          bids: [
            [(basePrice - 0.05).toFixed(2), isSol ? "124.50" : "12.450"],
            [(basePrice - 0.10).toFixed(2), isSol ? "280.10" : "28.110"],
            [(basePrice - 0.25).toFixed(2), isSol ? "1050.40" : "105.400"]
          ],
          asks: [
            [(basePrice + 0.05).toFixed(2), isSol ? "142.00" : "14.200"],
            [(basePrice + 0.10).toFixed(2), isSol ? "318.50" : "31.850"],
            [(basePrice + 0.25).toFixed(2), isSol ? "987.00" : "98.700"]
          ],
          checksum: sha256(`${targetEndpoint}:${this.blockHeight}`),
          timestamp: Date.now(),
          upstreamVerified: false,
          paymentConfirmed: false,
          providerDataStatus: 'EVALUATION_FIXTURE',
        };
      } else if (cleanTargetDomain.includes('sec') || cleanTargetDomain.includes('edgar')) {
        liveProxyPayload = {
          filingType: '10-K',
          company: 'Technology Holdings Inc.',
          item1A_RiskSummary: 'Example normalized filing field; no live sanctions or market verification is claimed.',
          isoDigest: memoBytes32,
          upstreamVerified: false,
          paymentConfirmed: false,
        };
      } else if (cleanTargetDomain.includes('academic') || cleanTargetDomain.includes('licensing') || cleanTargetDomain.includes('paper')) {
        liveProxyPayload = {
          doi: '10.1038/s41586-024-07142-9',
          journal: 'Nature Physics',
          title: 'Quantum State Channels on High-Throughput Layer 1s',
          wordCount: '4,820 words',
          licenseType: 'Single-Agent Read Micro-License',
          verifiedFee: `$${price.toFixed(4)} USD`,
          savingsVsSubscription: 'Bypassed $35/mo publisher paywall for single-agent read',
          upstreamVerified: false,
          paymentConfirmed: false,
        };
      } else {
        liveProxyPayload = {
          endpoint: targetEndpoint,
          status: 200,
          deliveredAt: new Date().toISOString(),
          bytesDelivered: 1024,
          upstreamVerified: false,
          paymentConfirmed: false,
        };
      }
    }

    if (liveProxyPayload && typeof liveProxyPayload === 'object') {
      liveProxyPayload = {
        ...liveProxyPayload,
        providerDataStatus,
        upstreamVerified: false,
        paymentConfirmed: false,
      };
    }

    // Dual-Mode Execution: Attempt live on-chain settlement if in LIVE_TESTNET mode
    const deterministicTxHash = `0x${sha256(`tempo:tx:${sigHex}:${nonce2D}:${this.blockHeight}`)}`;
    let actualTxHash = deterministicTxHash;
    let actualExecutionMode: 'LIVE_TESTNET' | 'RESILIENT_SANDBOX' = liveSettlementEnabled ? 'LIVE_TESTNET' : 'RESILIENT_SANDBOX';
    const initialStatus = actualExecutionMode === 'LIVE_TESTNET' ? 'SETTLED' : 'SIMULATED_PASS';

    const sanitizedTargetEndpoint = targetEndpoint
      .replace(/^https?:\/\/127\.0\.0\.1(:\d+)?/i, 'https://api.synapse402.network')
      .replace(/^https?:\/\/localhost(:\d+)?/i, 'https://api.synapse402.network');

    // Payloads are useful in both modes, but only a confirmed live trace is a chain proof.
    if ((actualExecutionMode !== 'LIVE_TESTNET' || options?.asyncRelay) && liveProxyPayload && typeof liveProxyPayload === 'object') {
      // Keep evaluation output useful without presenting fixture values as a
      // confirmed payment, fee, or provider result. The UI can still show the
      // returned shape, but every proof-like field is explicitly provisional.
      const evaluationPayload = { ...liveProxyPayload } as Record<string, any>;
      if (evaluationPayload.verifiedFee !== undefined) {
        evaluationPayload.quotedFee = evaluationPayload.verifiedFee;
        delete evaluationPayload.verifiedFee;
      }
      if (evaluationPayload.settledCost !== undefined) {
        evaluationPayload.quotedCost = evaluationPayload.settledCost;
        delete evaluationPayload.settledCost;
      }
      if (evaluationPayload.verifiedPublisherPayout !== undefined) {
        evaluationPayload.illustrativePublisherPayout = evaluationPayload.verifiedPublisherPayout;
        delete evaluationPayload.verifiedPublisherPayout;
      }
      if (evaluationPayload.savingsVsSubscription !== undefined) {
        evaluationPayload.illustrativeComparison = evaluationPayload.savingsVsSubscription;
        delete evaluationPayload.savingsVsSubscription;
      }
      if (evaluationPayload.seatLockStatus === 'CONFIRMED_HOLD_15MIN') {
        evaluationPayload.seatLockStatus = 'SAMPLE_HOLD_STATUS';
      }
      if (evaluationPayload.antiBotProtection === 'Cloudflare Turnstile (Bypassed)') {
        evaluationPayload.antiBotProtection = 'SAMPLE_PROVIDER_RESPONSE';
      }
      liveProxyPayload = {
        ...evaluationPayload,
        evaluationOnly: true,
        paymentConfirmed: false,
        upstreamVerified: false,
        executionMode: actualExecutionMode === 'LIVE_TESTNET' ? 'LIVE_TESTNET_PENDING_CONFIRMATION' : 'RESILIENT_SANDBOX',
      };
    }

    const matchedProvider = this.endpoints.find(e => targetEndpoint.includes(e.endpointUrl) || e.endpointUrl.includes(targetEndpoint));
    const providerName = matchedProvider?.title || 'Demo provider';
    const trace: MPPTraceRecord = {
      id: `trace_${Date.now()}_${key.sequenceNonce}`,
      timestamp: new Date().toISOString(),
      blockNumber: this.blockHeight,
      agentId: key.agentId,
      agentName: key.agentName,
      jobId: options?.jobId,
      providerName,
      targetEndpoint: sanitizedTargetEndpoint,
      method: endpointCategory === 'Academic Graph' || endpointCategory === 'Bytecode Audit' ? 'POST' : 'GET',
      costPathUsd: price,
      latencyMs: Math.max(1, Math.round(performance.now() - requestStartT)),
      httpStatusBefore: 402,
      httpStatusAfter: 200,
      challengeHeader: `MPP realm="Tempo-L1", asset="pathUSD", minPrice="${price}", recipient="${settlementPayee}"`,
      authAuthorizationHeader: `MPP-EIP712 signer="${wallet.address}", nonce="${nonce2D}", max="${key.maxPerCallPathUsd}"`,
      eip712Signature: sigHex,
      // A sandbox evaluation has no blockchain transaction. Keep this empty so
      // clients cannot mistake a deterministic placeholder for a real receipt.
      // Async relay stays pending until the relayer returns the real hash.
      // Never expose the deterministic placeholder as a transaction receipt.
      txHash: actualExecutionMode === 'LIVE_TESTNET' && !options?.asyncRelay ? actualTxHash : '',
      executionMode: actualExecutionMode,
      status: initialStatus as any,
      providerDataStatus,
      tempoTxType: actualExecutionMode === 'LIVE_TESTNET' ? '0x76' : undefined,
      nonce2D,
      memoPayload: `MPP:${key.agentName}:${cleanTargetDomain}:${price}:pathUSD`,
      routerFeePathUsd: routerFeeMicro / 1e6,
      tip20Memo: memoBytes32,
      iso20022Remittance: {
        standard: 'ISO-20022 pacs.008.001.08',
        costCenter: `CC-AI-${key.agentId.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-6) || 'TREASURY'}`,
        categoryCode: endpointCategory || 'Micro-Data Service',
        invoiceDigest: `0x${sha256(`INVOICE:${cleanTargetDomain}:${price}:${Date.now()}`)}`,
      },
      merkleProof,
      merkleRoot: key.merkleRoot,
      domainHash,
      eip712DomainSeparator,
      eip712StructHash,
      mppCredential: {
        signer: effectiveSigner,
        channelId: effectiveChannel,
        nonce: currentNonce,
        payee: settlementPayee,
        amountMicro: parsedAmount.toString(),
        // Sign the canonical allowlisted route. The provider middleware accepts
        // child paths under that route, while the endpoint hash and URL stay
        // internally consistent for EIP-712 verification.
        endpoint: matchedDomain || targetEndpoint,
        endpointHash: domainHash,
        memo: memoBytes32,
        validBefore: options?.validBefore ? Number(options.validBefore) : key.validBeforeTimestamp,
        chainId: this.chainId,
        verifyingContract: this.vaultAddress,
      },
      liveProxyPayload,
      sanctionsCompliance: {
        status: 'UNVERIFIED',
        policy: 'Example compliance check — live sanctions lookup not run',
        checkedAt: new Date().toISOString(),
      },
      complianceVerification: {
        status: 'UNVERIFIED',
        policy: 'Example compliance check — live sanctions lookup not run',
        checkedAt: new Date().toISOString(),
      },
    };

      if (liveSettlementEnabled) {
      const executeRelayerSettlement = async () => {
        // Register only a never-seen session. Existing sessions must use the
        // spend-preserving root update path below, even when paused/depleted.
        let settlementMerkleProof = merkleProof;
        let settlementDomainHash = domainHash;
        let settlementEndpoint = matchedDomain || targetEndpoint;
        try {
          const sessionConfig = await this.vaultContract.sessionKeys(effectiveSigner);
          const regBudget = BigInt(Math.round((key.totalBudgetPathUsd || 10) * 1e6));
          const regMaxPerCall = BigInt(Math.round(Math.min(key.maxPerCallPathUsd || 10, key.totalBudgetPathUsd || 10) * 1e6));
          const trueMerkleRoot = new MerkleTree(key.whitelistedDomains).getRoot();
          key.merkleRoot = trueMerkleRoot;
          const regMerkleRoot = trueMerkleRoot;
          let sessionStatus = Number(sessionConfig.status);

          if (sessionStatus === 0) {
            console.log(`[Synapse402 Engine] Registering new session key ${effectiveSigner} on-chain in SynapseVault...`);
            const adminWallet = await this.getVaultAdminWallet();
            const regTx = await (this.vaultContract.connect(adminWallet) as any).registerSessionKey(
              effectiveSigner,
              regMaxPerCall,
              regBudget,
              BigInt(Math.floor(Date.now() / 1000) + 86400 * 60),
              regMerkleRoot,
              { gasLimit: 1600000 }
            );
            await regTx.wait(1);
            console.log(`[Synapse402 Engine] Registered ${effectiveSigner} in SynapseVault: ${regTx.hash}`);
            sessionStatus = 1;
            settlementMerkleProof = merkleProof;
          } else if (sessionStatus !== 1) {
            throw new Error(`The deployed session is not ACTIVE (status ${sessionStatus}); settlement is blocked.`);
          } else if (String(sessionConfig.merkleRoot).toLowerCase() !== String(regMerkleRoot).toLowerCase()) {
            console.log(`[Synapse402 Engine] Updating session merkle root on-chain for ${effectiveSigner}...`);
            const adminWallet = await this.getVaultAdminWallet();
            const updateTx = await (this.vaultContract.connect(adminWallet) as any).updateSessionMerkleRoot(
              effectiveSigner,
              regMerkleRoot,
              { gasLimit: 500000 }
            );
            await updateTx.wait(1);
            settlementMerkleProof = merkleProof;
          }
        } catch (regErr: any) {
          const reason = String(regErr?.message || regErr || 'unknown policy sync error');
          console.error(`[Synapse402 Engine] Live policy sync failed; refusing settlement: ${reason}`);
          throw new Error(`Live settlement aborted because the deployed session policy could not be synchronized: ${reason}`);
        }

        let executionNonce = BigInt(currentNonce);
        try {
          const onChainNonce = await this.vaultContract.lastNonce(effectiveSigner, effectiveChannel);
          const nextNonceFromChain = BigInt(onChainNonce) + 1n;
          executionNonce = options?.nonce !== undefined ? BigInt(options.nonce) : nextNonceFromChain;
        } catch (nonceErr: any) {
          console.debug(`[Synapse402 Engine] Live execution nonce query notice: ${nonceErr?.message}`);
        }

        key.channelNonces[effectiveChannel] = Number(executionNonce);
        if (effectiveChannel === key.channelId) {
          key.sequenceNonce = Number(executionNonce);
        }
        nonce2D = `0x${effectiveChannel.toString(16).padStart(2, '0')}:0x${Number(executionNonce).toString(16).padStart(4, '0')}`;
        trace.nonce2D = nonce2D;

        let liveSig = sigHex;
        if (!options?.customSig) {
          const liveEip712Value = {
            sessionKey: effectiveSigner,
            channelId: effectiveChannel,
            nonce: executionNonce,
            payee: settlementPayee,
            amount: parsedAmount,
            endpointHash: settlementDomainHash,
            memo: memoBytes32,
            validBefore: options?.validBefore ? Number(options.validBefore) : key.validBeforeTimestamp,
          };
          try {
            liveSig = await wallet.signTypedData(domain, types, liveEip712Value);
          } catch {
            const structHash = ethers.TypedDataEncoder.hash(domain, types, liveEip712Value);
            liveSig = wallet.signingKey.sign(structHash).serialized;
          }
          sigHex = liveSig;
          trace.eip712Signature = sigHex;
        }

        const paymentParams = {
          sessionKey: effectiveSigner,
          channelId: BigInt(effectiveChannel),
          nonce: executionNonce,
          payee: settlementPayee,
          amount: parsedAmount,
          endpoint: settlementEndpoint,
          merkleProof: settlementMerkleProof || [],
          memo: memoBytes32,
          deadline: BigInt(options?.validBefore ? Number(options.validBefore) : key.validBeforeTimestamp),
          signature: liveSig,
        };

        const txPromise = (async () => {
          const tx = await (this.vaultContract.connect(this.relayerWallet) as any).settle402Payment(paymentParams, { gasLimit: 1200000 });
          const receipt = await tx.wait(1);
          return { tx, receipt };
        })();
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('On-chain execution timeout on Tempo L1')), 120000));
        const res: any = await Promise.race([txPromise, timeoutPromise]);
        if (res?.tx?.hash && res?.receipt?.status === 1) {
          const receiptProof = await this.verifyTempoPaymentReceipt(
            res.tx.hash,
            settlementPayee,
            parsedAmount,
          );
          if (!receiptProof.verified) {
            throw new Error(`INVALID_PAYMENT_PROOF: ${receiptProof.reason || 'TIP-20 Transfer proof did not match.'}`);
          }
          actualTxHash = res.tx.hash;
          actualExecutionMode = 'LIVE_TESTNET';
          trace.txHash = res.tx.hash;
          trace.explorerUrl = tempoTransactionUrl(res.tx.hash);
          trace.executionMode = 'LIVE_TESTNET';
          trace.status = 'SETTLED';
          trace.receiptVerified = true;
          if (trace.liveProxyPayload && typeof trace.liveProxyPayload === 'object') {
            trace.liveProxyPayload = {
              ...trace.liveProxyPayload,
              txHash: res.tx.hash,
              explorerUrl: tempoTransactionUrl(res.tx.hash),
              paymentConfirmed: true,
              receiptVerified: true,
              upstreamVerified: trace.liveProxyPayload.upstreamVerified === true,
              executionMode: 'LIVE_TESTNET',
            };
          }
          console.log(`[Synapse402 Engine] ✓ Confirmed On-Chain Settlement: ${actualTxHash} (Block: ${res.receipt.blockNumber}, Gas: ${res.receipt.gasUsed})`);
          try {
            const onChainBal = await this.vaultContract.totalVaultBalance();
            this.vaultTvl = Number(ethers.formatUnits(onChainBal, 6));
          } catch (tvlErr: any) {
            console.debug(`[Synapse402 Engine] Post-settlement TVL query notice: ${tvlErr?.message}`);
          }
          this.persistState();
        } else {
          console.warn(`[Synapse402 Engine] On-chain tx status not 1: status=${res?.receipt?.status}`);
          throw new Error(`On-chain transaction failed on Tempo L1 (status: ${res?.receipt?.status})`);
        }
      };

      if (options?.asyncRelay) {
        // Async relay for burst traffic. The response stays PENDING until the
        // background queue confirms or rejects the Tempo transaction.
        this.dispatchRelayerTx(async () => {
          try {
            await executeRelayerSettlement();
            if (trace.executionMode === 'LIVE_TESTNET' && trace.status === 'SETTLED' && trace.receiptVerified === true && isVerifiedTxHash(trace.txHash)) {
              this.protocolRevenue = Math.round((this.protocolRevenue * 1e6) + routerFeeMicro) / 1e6;
              this.totalVolume = Math.round((this.totalVolume * 1e6) + priceMicro) / 1e6;
              this.vaultTvl = Math.max(0, Math.round((this.vaultTvl * 1e6) - priceMicro)) / 1e6;
              this.totalSettlements += 1;
              const confirmedProvider = this.endpoints.find((endpoint) =>
                String(endpoint.endpointUrl || '').includes(String(targetEndpoint || ''))
                || String(targetEndpoint || '').includes(String(endpoint.endpointUrl || '')),
              );
              if (confirmedProvider) {
                confirmedProvider.totalCalls = (confirmedProvider.totalCalls || 0) + 1;
                confirmedProvider.totalEarnedUsd = Number(((confirmedProvider.totalEarnedUsd || 0) + pricePathUsd).toFixed(4));
              }
              this.persistState();
            }
          } catch (err: any) {
            console.error(`[Synapse402 Engine] Background async relay failed: ${err?.message}`);
            try { options?.onAsyncFailure?.(); } catch (callbackErr: any) {
              console.warn(`[Synapse402 Engine] Async failure callback notice: ${callbackErr?.message || callbackErr}`);
            }
            // Release the reserved key budget when the background relay fails.
            key.currentSpentPathUsd = Math.max(0, Math.round(key.currentSpentPathUsd * 1e6 - priceMicro) / 1e6);
            if (key.currentSpentPathUsd < key.totalBudgetPathUsd) {
              key.status = 'ACTIVE';
            }
            // These aggregate metrics are updated only after a confirmed
            // receipt. A failed async relay therefore has nothing to roll
            // back; subtracting here would erase an earlier real settlement.
            trace.executionMode = 'FAILED_REVERT';
            trace.txHash = '';
            trace.receiptVerified = false;
            trace.status = String(err?.message || '').includes('INVALID_PAYMENT_PROOF') ? 'FAILED' : 'REJECTED';
            trace.httpStatusAfter = 500;
            trace.liveProxyPayload = trace.liveProxyPayload && typeof trace.liveProxyPayload === 'object'
              ? { ...trace.liveProxyPayload, paymentConfirmed: false, receiptVerified: false, ...(trace.status === 'FAILED' ? { paymentError: 'INVALID_PAYMENT_PROOF' } : {}), executionMode: 'FAILED_REVERT' }
              : trace.liveProxyPayload;
            this.persistState();
          }
        });
        trace.status = 'PENDING';
      } else {
        try {
          await this.dispatchRelayerTx(executeRelayerSettlement);
        } catch (err: any) {
          const rawErr = String(err?.message || 'Transaction reverted');
          const cleanErr = (() => {
            const nestedReason = err?.reason
              || err?.shortMessage
              || err?.info?.error?.message
              || err?.error?.message
              || err?.cause?.reason
              || err?.cause?.shortMessage;
            if (nestedReason) return String(nestedReason).slice(0, 180);
            if (rawErr.includes('INVALID_2D_NONCE')) return 'Tempo L1 2D Nonce mismatch on-chain';
            if (rawErr.includes('EndpointNotWhitelisted')) return 'Target endpoint not whitelisted in Merkle root';
            if (rawErr.includes('CALL_EXCEPTION') || rawErr.includes('reverted')) return 'Tempo L1 on-chain settlement reverted';
            return rawErr.slice(0, 100);
          })();
          console.error(`[Synapse402 Engine] On-chain settlement error: ${cleanErr}`);
          if (rawErr.includes('INVALID_PAYMENT_PROOF')) {
            // The transaction may be mined while the payment proof is wrong
            // (for example a blocked or redirected transfer). Surface a
            // durable failed result; never turn that hash into a receipt.
            trace.txHash = '';
            trace.explorerUrl = undefined;
            trace.executionMode = 'FAILED_REVERT';
            trace.status = 'FAILED';
            trace.receiptVerified = false;
            trace.httpStatusAfter = 500;
            trace.liveProxyPayload = trace.liveProxyPayload && typeof trace.liveProxyPayload === 'object'
              ? { ...trace.liveProxyPayload, paymentConfirmed: false, receiptVerified: false, paymentError: 'INVALID_PAYMENT_PROOF', executionMode: 'FAILED_REVERT' }
              : { paymentConfirmed: false, receiptVerified: false, paymentError: 'INVALID_PAYMENT_PROOF', executionMode: 'FAILED_REVERT' };
          } else {
            // Do not leave the deterministic placeholder hash and initial
            // SETTLED status on a live trace when the relay itself failed.
            trace.txHash = '';
            trace.explorerUrl = undefined;
            trace.executionMode = 'FAILED_REVERT';
            trace.status = 'FAILED';
            trace.receiptVerified = false;
            trace.httpStatusAfter = 500;
            trace.liveProxyPayload = trace.liveProxyPayload && typeof trace.liveProxyPayload === 'object'
              ? { ...trace.liveProxyPayload, paymentConfirmed: false, receiptVerified: false, executionMode: 'FAILED_REVERT' }
              : { paymentConfirmed: false, receiptVerified: false, executionMode: 'FAILED_REVERT' };
          }
          if (this.networkMode === 'LIVE_TESTNET') {
            key.currentSpentPathUsd = Math.max(0, Math.round(key.currentSpentPathUsd * 1e6 - priceMicro) / 1e6);
            if (key.currentSpentPathUsd < key.totalBudgetPathUsd) {
              key.status = 'ACTIVE';
            }
            this.persistState();
            if (!rawErr.includes('INVALID_PAYMENT_PROOF')) {
              throw new Error(`Tempo L1 on-chain settlement failed: ${cleanErr}`);
            }
          }
          actualExecutionMode = 'RESILIENT_SANDBOX';
        }
      }
    }

    restoreEvaluationState();

    const confirmedLiveSettlement = trace.executionMode === 'LIVE_TESTNET'
      && trace.status === 'SETTLED'
      && trace.receiptVerified === true
      && isVerifiedTxHash(trace.txHash);
    if (confirmedLiveSettlement && liveSettlementEnabled) {
      this.protocolRevenue = Math.round((this.protocolRevenue * 1e6) + routerFeeMicro) / 1e6;
      this.totalVolume = Math.round((this.totalVolume * 1e6) + priceMicro) / 1e6;
      this.vaultTvl = Math.max(0, Math.round((this.vaultTvl * 1e6) - priceMicro)) / 1e6;
      this.totalSettlements += 1;
    }

    // Dynamically update matching seller endpoint stats only for confirmed
    // receipts, never for evaluation or PENDING relay traces.
    const matchedEp = matchedProvider;
    if (matchedEp && confirmedLiveSettlement) {
      matchedEp.totalCalls = (matchedEp.totalCalls || 0) + 1;
      matchedEp.totalEarnedUsd = Number(((matchedEp.totalEarnedUsd || 0) + pricePathUsd).toFixed(4));
    }

    this.traces.unshift(trace);
    this.persistState();

    if (cacheKey) {
      if (this.idempotencyCache.size > 1000) {
        const now = Date.now();
        for (const [k, v] of this.idempotencyCache.entries()) {
          if (now - v.timestamp > IDEMPOTENCY_TTL_MS) {
            this.idempotencyCache.delete(k);
          }
        }
      }
      this.idempotencyCache.set(cacheKey, { trace, timestamp: Date.now() });
      // Persist the replay record atomically with the in-memory result so a
      // process restart cannot turn the same idempotency key into a second charge.
      this.persistState();
    }

      return {
        trace,
        updatedKey: key,
        blockHeight: this.blockHeight,
        status: trace.status === 'SETTLED' || trace.status === 'PENDING' || trace.status === 'REJECTED' || trace.status === 'FAILED'
          ? trace.status
          : 'SIMULATED_PASS',
      };
    };

    const runExclusive = async () => {
      const previous = this.settlementLocks.get(key!.id) || Promise.resolve();
      let release!: () => void;
      const gate = new Promise<void>((resolve) => { release = resolve; });
      const queued = previous.then(() => gate);
      this.settlementLocks.set(key!.id, queued);
      await previous;
      try {
        return await executeSettlement();
      } finally {
        release();
        if (this.settlementLocks.get(key!.id) === queued) this.settlementLocks.delete(key!.id);
      }
    };

    if (cacheKey) {
      const executionPromise = runExclusive();
      this.inFlightIdempotency.set(cacheKey, executionPromise);
      try {
        return await executionPromise;
      } finally {
        this.inFlightIdempotency.delete(cacheKey);
      }
    }

    return await runExclusive();
  }

  public exportIso20022Report(format: 'csv' | 'xml'): string {
    // A financial export is a settlement ledger, not a workflow/debug dump.
    // Evaluation, pending and failed traces must never appear as booked money.
    const confirmedTraces = this.traces
      .filter((trace) => trace.id !== 'trace_init_001')
      .map((trace) => this.normalizePersistedTrace(trace))
      .filter((trace) => trace.executionMode === 'LIVE_TESTNET'
        && trace.status === 'SETTLED'
        && trace.receiptVerified === true
        && isVerifiedTxHash(trace.txHash));
    const csvEscape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const xmlEscape = (value: unknown) => String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    if (format === 'csv') {
      const headers = ['RecordID', 'Timestamp', 'BlockNumber', 'AgentID', 'AgentName', 'TargetEndpoint', 'CostPathUSD', 'RouterFeePathUSD', '2DNonce', 'EIP712Signature', 'TIP20Memo_Bytes32', 'ISO20022_Standard', 'CostCenter', 'CategoryCode', 'InvoiceDigest', 'Compliance_Status'];
      const rows = confirmedTraces.map(t => [
        t.id,
        t.timestamp,
        t.blockNumber,
        t.agentId,
        t.agentName,
        t.targetEndpoint,
        t.costPathUsd,
        t.routerFeePathUsd,
        t.nonce2D,
        t.eip712Signature,
        t.tip20Memo,
        t.iso20022Remittance?.standard || 'ISO-20022 pacs.008.001.08',
        t.iso20022Remittance?.costCenter || 'TREASURY',
        t.iso20022Remittance?.categoryCode || 'Data',
        t.iso20022Remittance?.invoiceDigest || '',
        t.sanctionsCompliance?.status || t.complianceVerification?.status || 'UNVERIFIED'
      ].map(csvEscape).join(','));
      return [headers.join(','), ...rows].join('\n');
    } else {
      // ISO 20022 camt.053.001.08 XML Statement
      const entriesXml = confirmedTraces.slice(0, 50).map(t => `
      <Ntry>
        <NtryRef>${xmlEscape(t.id)}</NtryRef>
        <Amt Ccy="pathUSD">${t.costPathUsd.toFixed(6)}</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <Sts>BOOK</Sts>
        <BookgDt><DtTm>${xmlEscape(t.timestamp)}</DtTm></BookgDt>
        <AcctSvcrRef>TEMPO-L1-BLK-${xmlEscape(t.blockNumber)}</AcctSvcrRef>
        <NtryDtls>
          <TxDtls>
            <Refs>
              <EndToEndId>${xmlEscape(t.nonce2D)}</EndToEndId>
              <TxId>${xmlEscape(t.eip712Signature.slice(0, 32))}</TxId>
            </Refs>
            <RmtInf>
              <Ustrd>${xmlEscape(t.tip20Memo)}</Ustrd>
            </RmtInf>
            <RltdPties>
              <Dbtr><Nm>${xmlEscape(t.agentName)}</Nm></Dbtr>
              <Cdtr><Nm>${xmlEscape(t.targetEndpoint)}</Nm></Cdtr>
            </RltdPties>
          </TxDtls>
        </NtryDtls>
      </Ntry>`).join('');

      return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.08">
  <BkToCstmrStmt>
    <GrpHdr>
      <MsgId>SYNAPSE402-STMT-${Date.now()}</MsgId>
      <CreDtTm>${new Date().toISOString()}</CreDtTm>
    </GrpHdr>
    <Stmt>
      <Id>STMT-SYNAPSE402-TEMPO-42431</Id>
      <Acct>
        <Id><Othr><Id>${this.vaultAddress}</Id></Othr></Id>
        <Ccy>pathUSD</Ccy>
      </Acct>
      <Bal>
        <Tp><CdOrPrtry><Cd>CLBD</Cd></CdOrPrtry></Tp>
        <Amt Ccy="pathUSD">${this.vaultTvl.toFixed(4)}</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Dt><DtTm>${new Date().toISOString()}</DtTm></Dt>
      </Bal>
      ${entriesXml}
    </Stmt>
  </BkToCstmrStmt>
</Document>`;
    }
  }
}

export const synapseEngine = new SynapseStateEngine();
