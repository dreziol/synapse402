import { ethers } from 'ethers';
import { canonicalEndpointHash } from '../shared/endpointHash';
import { tempoPayeeAmountMicro, verifyTempoPaymentReceipt } from '../shared/tempoReceipt';
import { TEMPO_CHAIN_ID, TEMPO_RPC_URL, TEMPO_VAULT_ADDRESS, TEMPO_PATHUSD_ADDRESS } from '../config/network';

/**
 * Configuration options for the Synapse402 Autonomous AI Agent SDK Client.
 */
export interface SynapseAgentConfig {
  /** Private key of the delegated session key. When omitted, the gateway-managed delegated signer is used. */
  sessionPrivateKey?: string;
  /** Active session key ID registered on Synapse Vault (defaults to primary testnet agent) */
  keyId?: string;
  /** Gateway endpoint URL (e.g. http://localhost:3001 or production gateway) */
  gatewayUrl?: string;
  /** Hard cap limit per single HTTP 402 paywall settlement in pathUSD (e.g. 0.05) */
  maxPricePerCall?: number;
  /** Permit dynamic domain registration only when explicitly enabled (off by default). */
  autoDynamicWhitelist?: boolean;
  /** Whether to use asynchronous non-blocking settlement queue on Tempo L1 (sub-15ms HTTP 200 response) */
  asyncRelay?: boolean;
  /** Execution mode: 'LIVE_TESTNET' for real Tempo L1 transactions, 'EVALUATION' for sandbox testing. Defaults to EVALUATION unless mode or SYNAPSE_LIVE explicitly opts into live payment. */
  mode?: 'LIVE_TESTNET' | 'EVALUATION';
  /** Stable caller/job id reused when a response is lost and the request is retried. */
  idempotencyKey?: string;
}

/**
 * Parsed HTTP 402 challenge header following RFC 9110 and Tempo MPP standard.
 */
export interface TempoPaymentChallenge {
  realm: string;
  asset: string;
  minPrice: number;
  recipient: string;
}

export interface TempoMppReplayStore {
  get(key: string): number | undefined;
  set(key: string, expiry: number): void;
  delete(key: string): void;
  entries(): IterableIterator<[string, number]>;
}

/**
 * Result returned after autonomous EIP-712 settlement.
 */
export interface TempoSettlementResult {
  status: 'SETTLED' | 'EVALUATION_ONLY' | 'VOIDED' | 'FAILED' | 'REFUNDED';
  traceId: string;
  txHash: string | null;
  costPathUsd: number;
  latencyMs: number;
  blockHeight: number;
  memoPayload: string;
  iso20022Standard: string;
}

/**
 * Autonomous AI Agent Client that wraps standard `fetch` with automated
 * HTTP 402 Paywall interception and Tempo L1 Type 0x76 micro-settlement.
 * If a sessionPrivateKey is supplied, the client performs prepare → EIP-712
 * sign → settle. Without one, the configured gateway-managed delegated signer
 * performs the signing and the returned trace identifies that signer.
 */
export class SynapseAgentClient {
  private wallet: ethers.Wallet | ethers.HDNodeWallet;
  private keyId: string;
  private gatewayUrl: string;
  private maxPrice: number;
  private autoWhitelist: boolean;
  private asyncRelay: boolean;
  private readonly clientSigns: boolean;
  private readonly configuredIdempotencyKey?: string;
  private readonly executionMode: 'LIVE_TESTNET' | 'EVALUATION';
  private last2DNonce: string = '0x01:0x0000';
  private localSequenceNonce: number = 0;

  constructor(config: SynapseAgentConfig = {}) {
    const sessionKey = config.sessionPrivateKey || (typeof process !== 'undefined' && process.env?.SYNAPSE_SESSION_KEY ? process.env.SYNAPSE_SESSION_KEY : undefined);
    this.wallet = sessionKey
      ? new ethers.Wallet(sessionKey)
      : ethers.Wallet.createRandom();
    this.clientSigns = Boolean(sessionKey);
    this.executionMode = config.mode
      || (typeof process !== 'undefined' && process.env?.SYNAPSE_LIVE === 'true'
        ? 'LIVE_TESTNET'
        : 'EVALUATION');
    this.keyId = config.keyId || 'key_quant_alpha';
    this.gatewayUrl = (config.gatewayUrl || 'http://localhost:3001').replace(/\/$/, '');
    this.maxPrice = config.maxPricePerCall ?? 0.05;
    // Unknown destinations must fail closed. A caller may opt into dynamic
    // registration for a controlled evaluation, but production clients never
    // widen their Merkle allowlist implicitly.
    this.autoWhitelist = config.autoDynamicWhitelist ?? false;
    this.asyncRelay = config.asyncRelay ?? false;
    this.configuredIdempotencyKey = config.idempotencyKey?.trim() || undefined;
  }

  /**
   * Returns the last confirmed 2D Nonce processed by this agent client.
   */
  public get nonce(): string {
    return this.last2DNonce;
  }

  /**
   * Syncs the latest 2D sequence nonce from the gateway to reduce collision
   * risk after client restarts.
   */
  public async syncNonce(): Promise<string> {
    try {
      const res = await fetch(`${this.gatewayUrl}/api/keys`);
      if (res.ok) {
        const data = await res.json();
        const myKey = data.keys?.find((k: any) => k.id === this.keyId);
        if (myKey) {
          this.localSequenceNonce = myKey.sequenceNonce || 0;
          this.last2DNonce = `0x${(myKey.channelId || 1).toString(16).padStart(2, '0')}:0x${this.localSequenceNonce.toString(16).padStart(4, '0')}`;
        }
      }
    } catch (err: any) {
      console.warn('[SynapseAgentClient] Failed to sync 2D nonce with gateway:', err?.message || err);
    }
    return this.last2DNonce;
  }

  /**
   * Address of this client's active delegated session key.
   */
  public get address(): string {
    return this.wallet.address;
  }

  /**
   * Parses standard `WWW-Authenticate: MPP realm="Tempo-L1", asset="pathUSD", minPrice="0.005", recipient="0x..."`
   */
  public parseChallenge(headerValue: string | null): TempoPaymentChallenge {
    if (!headerValue) {
      return {
        realm: 'Tempo-L1',
        asset: 'pathUSD',
        minPrice: 0.001,
        recipient: '0x0000000000000000000000000000000000000000',
      };
    }

    const getParam = (name: string): string => {
      const match = headerValue.match(new RegExp(`${name}="([^"]+)"`, 'i'));
      return match ? match[1] : '';
    };

    const rawMinPrice = getParam('minPrice');
    const parsedMinPrice = rawMinPrice !== '' ? parseFloat(rawMinPrice) : NaN;

    return {
      realm: getParam('realm') || 'Tempo-L1',
      asset: getParam('asset') || 'pathUSD',
      minPrice: Number.isFinite(parsedMinPrice) ? parsedMinPrice : 0.001,
      recipient: getParam('recipient') || '0x0000000000000000000000000000000000000000',
    };
  }

  /**
   * Autonomous fetch wrapper. Intercepts HTTP 402, resolves micropayment via Synapse402
   * gateway on Tempo L1, and returns the unlocked HTTP 200 payload seamlessly.
   */
  public async fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const urlString = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;
    const initialInit = init ? { ...init } : {};

    // 1. Initial Request probe
    const initialResponse = await fetch(input, initialInit);

    // If already successful or not a paywall, return directly
    if (initialResponse.status !== 402) {
      return initialResponse;
    }

    // 2. Intercept RFC 9110 / HTTP 402 Payment Required challenge
    const authHeader = initialResponse.headers.get('WWW-Authenticate') || initialResponse.headers.get('x-tempo-mpp-challenge');
    const challenge = this.parseChallenge(authHeader);
    const challengeId = initialResponse.headers.get('x-tempo-challenge-id');

    if (challenge.minPrice > this.maxPrice) {
      throw new Error(
        `[Synapse402 Guardrail] Requested price $${challenge.minPrice} pathUSD exceeds maximum budget guardrail ($${this.maxPrice}).`
      );
    }
    if (challenge.asset !== 'pathUSD') {
      throw new Error(`[Synapse402 Guardrail] Unsupported payment asset "${challenge.asset}".`);
    }
    if (!ethers.isAddress(challenge.recipient) || ethers.getAddress(challenge.recipient) === ethers.ZeroAddress) {
      throw new Error('[Synapse402 Guardrail] The provider challenge did not include a valid payment recipient.');
    }

    // 3. Generate Idempotency Key for replay attack protection (deterministic fingerprint)
    const requestMethod = (initialInit.method || 'GET').toUpperCase();
    const requestBodyStr = typeof initialInit.body === 'string'
      ? initialInit.body
      : initialInit.body instanceof URLSearchParams
        ? initialInit.body.toString()
        : initialInit.body ? JSON.stringify(initialInit.body) : '';
    const requestHeaders = new Headers(initialInit.headers);
    const callerIdempKey = requestHeaders.get('Idempotency-Key') || requestHeaders.get('idempotency-key');
    const requestFingerprint = `${requestMethod}:${urlString}:${requestBodyStr}`;
    const idempotencyKey = callerIdempKey
      || `idemp_${ethers.id(`${this.configuredIdempotencyKey || 'synapse-job'}:${requestFingerprint}`).slice(2, 34)}`;

    // 4. Settlement via the gateway. With an explicit delegated key, the SDK
    // signs the exact prepared EIP-712 authorization before submitting it.
    // Without one, the gateway-managed delegated signer is authoritative.
    const isLive = this.executionMode === 'LIVE_TESTNET';
    const settlementBody: Record<string, unknown> = {
      keyId: this.keyId,
      targetUrl: urlString,
      pricePathUsd: challenge.minPrice,
      recipient: challenge.recipient,
      asset: challenge.asset,
      realm: challenge.realm,
      category: 'Autonomous Agent Fetch',
      allowDynamicWhitelist: this.autoWhitelist,
      idempotencyKey,
      asyncRelay: this.asyncRelay,
      evaluationOnly: !isLive,
      // Every live request is scoped to one bounded job. The SDK keeps this
      // internal so callers still choose only their agent and max guardrail.
      jobId: `sdk_${idempotencyKey}`,
      jobBudgetPathUsd: this.maxPrice,
    };

    if (this.clientSigns) {
      const prepareResponse = await fetch(`${this.gatewayUrl}/api/mpp/prepare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyId: this.keyId,
          targetUrl: urlString,
          pricePathUsd: challenge.minPrice,
          recipient: challenge.recipient,
          signerAddress: this.wallet.address,
          evaluationOnly: !isLive,
        }),
      });
      const prepared = await prepareResponse.json().catch(() => null);
      if (!prepareResponse.ok || !prepared?.typedData) {
        throw new Error(`[Synapse402 Authorization Failed] ${prepared?.error || prepareResponse.statusText}`);
      }
      const typedData = prepared.typedData;
      const signTypes = Object.fromEntries(
        Object.entries(typedData.types || {}).filter(([name]) => name !== 'EIP712Domain'),
      ) as Record<string, ethers.TypedDataField[]>;
      const customSig = await this.wallet.signTypedData(typedData.domain, signTypes, typedData.message);
      Object.assign(settlementBody, {
        signerAddress: this.wallet.address,
        customSig,
        channelId: prepared.channelId,
        nonce: prepared.nonce,
        validBefore: prepared.validBefore,
      });
    }

    const settleResponse = await fetch(`${this.gatewayUrl}/api/mpp/settle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(settlementBody),
    });

    if (!settleResponse.ok) {
      const errJson = await settleResponse.json().catch(() => ({ error: 'Unknown settlement failure' }));
      throw new Error(`[Synapse402 Settlement Failed] ${errJson.error || settleResponse.statusText}`);
    }

    const settleData = await settleResponse.json();
    const trace = settleData.trace;

    // Async relays return before the chain receipt exists. Never retry the
    // provider with a payment credential in that state: doing so would let an
    // upstream treat an unconfirmed payment as settled. The caller can retry
    // with the same idempotency key after the receipt is confirmed.
    const liveConfirmed = trace.executionMode === 'LIVE_TESTNET'
      && trace.status === 'SETTLED'
      && trace.receiptVerified === true
      && typeof trace.txHash === 'string'
      && /^0x[a-fA-F0-9]{64}$/.test(trace.txHash);
    const livePending = trace.executionMode === 'LIVE_TESTNET'
      || trace.executionMode === 'LIVE_TESTNET_PENDING_CONFIRMATION';
    if (livePending && !liveConfirmed) {
      return new Response(JSON.stringify({
        error: 'Payment is pending Tempo receipt confirmation.',
        paymentPending: true,
        traceId: trace.id,
        executionMode: trace.executionMode,
      }), {
        status: 202,
        headers: {
          'Content-Type': 'application/json',
          'X-Tempo-Payment-Status': 'PENDING',
          'X-Tempo-Trace-Id': trace.id,
        },
      });
    }

    // Cache latest 2D sequence nonce to avoid reuse collision
    if (trace.nonce2D) {
      this.last2DNonce = trace.nonce2D;
      const parts = trace.nonce2D.split(':');
      if (parts[1]) {
        const seq = parseInt(parts[1], 16);
        if (!isNaN(seq) && seq > this.localSequenceNonce) {
          this.localSequenceNonce = seq;
        }
      }
    }

    // 5. Retry Upstream with Cryptographic Authorization Headers
    const headers = new Headers(initialInit.headers);
    headers.set('X-Tempo-MPP-Signature', trace.eip712Signature);
    headers.set('X-Tempo-Nonce-2D', trace.nonce2D);
    headers.set('X-Tempo-Cost-PathUSD', String(challenge.minPrice));
    headers.set('X-Synapse-Trace-Id', trace.id);
    headers.set('X-Synapse-Execution-Mode', trace.executionMode || 'RESILIENT_SANDBOX');
    if (trace.txHash) {
      headers.set('X-Tempo-Tx-Hash', trace.txHash);
    }
    // Forward the exact signed fields so a provider can independently recover
    // the signer and bind the payment to this amount, route and nonce.
    if (trace.mppCredential) {
      headers.set('X-Tempo-MPP-Signer', trace.mppCredential.signer);
      headers.set('X-Tempo-MPP-Payee', trace.mppCredential.payee);
      headers.set('X-Tempo-MPP-Amount-Micro', trace.mppCredential.amountMicro);
      headers.set('X-Tempo-MPP-Endpoint', trace.mppCredential.endpoint);
      headers.set('X-Tempo-MPP-Endpoint-Hash', trace.mppCredential.endpointHash);
      headers.set('X-Tempo-MPP-Memo', trace.mppCredential.memo);
      headers.set('X-Tempo-MPP-Valid-Before', String(trace.mppCredential.validBefore));
      headers.set('X-Tempo-MPP-Chain-Id', String(trace.mppCredential.chainId));
      headers.set('X-Tempo-MPP-Verifying-Contract', trace.mppCredential.verifyingContract);
      headers.set('X-Tempo-MPP-Channel-Id', String(trace.mppCredential.channelId));
      headers.set('X-Tempo-MPP-Nonce', String(trace.mppCredential.nonce));
    }
    const traceSigner = trace.authAuthorizationHeader?.match(/signer="([^"]+)"/)?.[1]
      || (this.clientSigns ? this.wallet.address : 'gateway-managed');
    headers.set('Authorization', `MPP-EIP712 signer="${traceSigner}", nonce="${trace.nonce2D}", max="${this.maxPrice}"`);
    headers.set('Idempotency-Key', idempotencyKey);
    if (challengeId) headers.set('X-Tempo-Challenge-Id', challengeId);

    const authorizedResponse = await fetch(input, {
      ...initialInit,
      headers,
    });

    // If external upstream delivered mock/simulated fallback or direct response
    if (!authorizedResponse.ok && trace.liveProxyPayload && trace.executionMode !== 'LIVE_TESTNET') {
      return new Response(JSON.stringify(trace.liveProxyPayload), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Tempo-Payment-Status': liveConfirmed ? 'SETTLED' : 'EVALUATION_ONLY',
          'X-Tempo-Trace-Id': trace.id,
          'X-Tempo-Latency-Ms': String(trace.latencyMs),
          ...(liveConfirmed ? { 'X-Tempo-Tx-Hash': trace.txHash } : {}),
        },
      });
    }

    return authorizedResponse;
  }

  /**
   * Convenience helper to perform GET request and parse JSON output.
   */
  public async get<T = any>(url: string, init?: RequestInit): Promise<T> {
    const res = await this.fetch(url, { ...init, method: 'GET' });
    if (!res.ok) {
      throw new Error(`HTTP GET ${url} returned ${res.status}: ${res.statusText}`);
    }
    return res.json();
  }

  /**
   * Convenience helper to perform POST request and parse JSON output.
   */
  public async post<T = any>(url: string, body?: any, init?: RequestInit): Promise<T> {
    const headers = new Headers(init?.headers);
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    const res = await this.fetch(url, {
      ...init,
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      throw new Error(`HTTP POST ${url} returned ${res.status}: ${res.statusText}`);
    }
    return res.json();
  }
}

/**
 * Creates and initializes a Synapse402 Autonomous AI Agent client.
 */
export function createSynapseAgent(config?: SynapseAgentConfig): SynapseAgentClient {
  return new SynapseAgentClient(config);
}

// ============================================================================
// 2. API Monetization Middleware for Providers (Express / Node HTTP)
// ============================================================================

export interface TempoMppCredential {
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
  txHash?: string;
  traceId?: string;
}

export interface TempoMppVerificationResult {
  verified: boolean;
  reason?: string;
  credential?: TempoMppCredential;
}

const TEMPO_MPP_CHAIN_ID = TEMPO_CHAIN_ID;
const TEMPO_MPP_VERIFYING_CONTRACT = TEMPO_VAULT_ADDRESS;

const readHeader = (req: any, name: string): string => {
  const value = req?.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? String(value[0] || '') : String(value || '');
};

const normaliseAddress = (value: string): string | null => {
  try {
    return ethers.getAddress(value);
  } catch {
    return null;
  }
};

export { canonicalEndpointHash } from '../shared/endpointHash';

const endpointHash = canonicalEndpointHash;

const requestMatchesCredentialEndpoint = (req: any, endpoint: string): boolean => {
  try {
    const rawRequestHost = readHeader(req, 'host').trim();
    if (!rawRequestHost) return false;
    const absoluteEndpoint = /^https?:\/\//i.test(endpoint);
    if (!absoluteEndpoint && (!endpoint.startsWith('/') || endpoint.startsWith('//'))) return false;
    const configuredProtocol = String(req?.protocol || (req?.secure ? 'https' : '')).toLowerCase();
    const signed = absoluteEndpoint
      ? new URL(endpoint)
      : new URL(endpoint, `${configuredProtocol || 'http'}://${rawRequestHost}`);
    if (!['http:', 'https:'].includes(signed.protocol)) return false;
    // Parse the Host header through URL so a signed non-default port remains
    // bound to that port. An apex-domain credential must not authorize an
    // unrelated subdomain on the same server.
    const requestProtocol = configuredProtocol;
    if (requestProtocol && `${requestProtocol}:` !== signed.protocol) return false;
    const rawRequestTarget = String(req?.originalUrl || req?.url || '/');
    const requestUrl = new URL(rawRequestTarget, `${signed.protocol}//${rawRequestHost}`);
    const signedPort = signed.port || (signed.protocol === 'https:' ? '443' : '80');
    const requestPort = requestUrl.port || (signed.protocol === 'https:' ? '443' : '80');
    const signedPath = signed.pathname.replace(/\/+$/, '') || '/';
    const hostMatches = requestUrl.hostname.toLowerCase() === signed.hostname.toLowerCase()
      && requestPort === signedPort;
    const requestPath = requestUrl.pathname.replace(/\/+$/, '') || '/';
    const pathMatches = requestPath === signedPath;
    // Query parameters are part of the signed endpoint. A credential for a
    // route without a query must not authorize a different query, because the
    // provider may return different paid data for each parameter.
    const queryMatches = requestUrl.search === signed.search;
    return hostMatches && pathMatches && queryMatches && !signed.hash;
  } catch {
    return false;
  }
};

/**
 * Verifies the complete Tempo EIP-712 payment credential sent by
 * SynapseAgentClient. A header that merely starts with `0x` or `MPP-EIP712`
 * is never accepted: the recovered signer, signed amount, recipient,
 * endpoint, expiry, chain and replay nonce must all match this route.
 */
export function verifyTempoMppCredential(
  req: any,
  options: Pick<TempoMppMiddlewareOptions, 'payee' | 'endpointUrl' | 'chainId' | 'verifyingContract'>,
  effectivePrice: number,
  replayCache: TempoMppReplayStore,
): TempoMppVerificationResult {
  const signature = readHeader(req, 'x-tempo-mpp-signature');
  const signerHeader = readHeader(req, 'x-tempo-mpp-signer');
  const payeeHeader = readHeader(req, 'x-tempo-mpp-payee');
  const amountMicro = readHeader(req, 'x-tempo-mpp-amount-micro');
  const endpoint = readHeader(req, 'x-tempo-mpp-endpoint');
  const endpointHashHeader = readHeader(req, 'x-tempo-mpp-endpoint-hash');
  const memo = readHeader(req, 'x-tempo-mpp-memo');
  const validBefore = Number(readHeader(req, 'x-tempo-mpp-valid-before'));
  const chainId = Number(readHeader(req, 'x-tempo-mpp-chain-id'));
  const verifyingContract = readHeader(req, 'x-tempo-mpp-verifying-contract');
  const channelId = Number(readHeader(req, 'x-tempo-mpp-channel-id'));
  const nonce = Number(readHeader(req, 'x-tempo-mpp-nonce'));
  const nonce2D = readHeader(req, 'x-tempo-nonce-2d');
  const txHashHeader = readHeader(req, 'x-tempo-tx-hash') || readHeader(req, 'x-tempo-mpp-tx-hash');
  const traceIdHeader = readHeader(req, 'x-synapse-trace-id');

  const fail = (reason: string): TempoMppVerificationResult => ({ verified: false, reason });
  if (!/^0x[0-9a-f]{130}$/i.test(signature)) return fail('Missing or malformed EIP-712 signature.');
  const signer = normaliseAddress(signerHeader);
  const payee = normaliseAddress(payeeHeader);
  const expectedPayee = normaliseAddress(options.payee);
  const contract = normaliseAddress(verifyingContract);
  const expectedContract = normaliseAddress(options.verifyingContract || TEMPO_MPP_VERIFYING_CONTRACT);
  if (!signer || !payee || !expectedPayee || !contract || !expectedContract) return fail('Credential contains an invalid address.');
  if (payee.toLowerCase() !== expectedPayee.toLowerCase()) return fail('Signed payee does not match this route.');
  if (contract.toLowerCase() !== expectedContract.toLowerCase()) return fail('Credential uses an untrusted verifying contract.');
  if (chainId !== (options.chainId || TEMPO_MPP_CHAIN_ID)) return fail('Credential uses an untrusted chain.');
  if (options.endpointUrl && endpoint.toLowerCase().trim() !== options.endpointUrl.toLowerCase().trim()) return fail('Signed endpoint does not match the configured provider route.');
  if (!endpoint || !requestMatchesCredentialEndpoint(req, endpoint)) return fail('Signed endpoint does not match this request.');
  if (!/^0x[0-9a-f]{64}$/i.test(endpointHashHeader) || endpointHashHeader.toLowerCase() !== endpointHash(endpoint).toLowerCase()) return fail('Endpoint hash does not match the signed endpoint.');
  if (!/^0x[0-9a-f]{64}$/i.test(memo)) return fail('Signed memo is malformed.');
  if (!Number.isSafeInteger(channelId) || channelId < 0 || !Number.isSafeInteger(nonce) || nonce < 0) return fail('Signed nonce is malformed.');
  const expectedNonce2D = `0x${channelId.toString(16).padStart(2, '0')}:0x${nonce.toString(16).padStart(4, '0')}`;
  if (nonce2D.toLowerCase() !== expectedNonce2D.toLowerCase()) return fail('2D nonce header does not match the credential.');
  if (!Number.isSafeInteger(validBefore) || validBefore <= Math.floor(Date.now() / 1000)) return fail('Payment credential is expired.');
  const expectedAmountMicro = BigInt(Math.round(effectivePrice * 1e6));
  let signedAmount: bigint;
  try { signedAmount = BigInt(amountMicro); } catch { return fail('Signed amount is malformed.'); }
  if (signedAmount !== expectedAmountMicro) return fail('Signed amount does not match this route price.');

  const replayKey = `${signer.toLowerCase()}:${channelId}:${nonce}`;
  const previousExpiry = replayCache.get(replayKey);
  if (previousExpiry && previousExpiry > Math.floor(Date.now() / 1000)) return fail('Payment credential was already used.');

  const domain = {
    name: 'SynapseVault',
    version: '1.0.0',
    chainId,
    verifyingContract: contract,
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
  const value = {
    sessionKey: signer,
    channelId,
    nonce,
    payee,
    amount: signedAmount,
    endpointHash: endpointHashHeader,
    memo,
    validBefore,
  };
  let recovered: string;
  try {
    recovered = ethers.verifyTypedData(domain, types, value, signature);
  } catch {
    return fail('EIP-712 signature could not be recovered.');
  }
  if (recovered.toLowerCase() !== signer.toLowerCase()) return fail('Recovered signer does not match the credential.');
  return {
    verified: true,
    credential: {
      signer,
      channelId,
      nonce,
      payee,
      amountMicro,
      endpoint,
      endpointHash: endpointHashHeader,
      memo,
      validBefore,
      chainId,
      verifyingContract: contract,
      txHash: txHashHeader || undefined,
      traceId: traceIdHeader || undefined,
    },
  };
}

export interface TempoMppMiddlewareOptions {
  /** Required payment price in pathUSD (e.g. 0.005) */
  priceUsd: number;
  /** Recipient address for payments on Tempo L1 */
  payee: string;
  /** Canonical provider URL/path used for endpoint binding in the signature. */
  endpointUrl?: string;
  /** Expected chain and vault contract; defaults to Tempo Moderato testnet. */
  chainId?: number;
  verifyingContract?: string;
  /** RPC used to verify the transaction receipt when no trusted gateway verifier is supplied. */
  rpcUrl?: string;
  /** Asset token name (defaults to 'pathUSD') */
  asset?: string;
  /** Realm identifier (defaults to 'Tempo-L1') */
  realm?: string;
  /** Optional dynamic surge pricing for economic bot/DDoS throttling */
  surgePricing?: {
    windowMs: number;
    maxBeforeSurge: number;
    multiplier: number;
  };
  /** Optional gateway-side verification for first-party routes. */
  /** Optional receipt/gateway check. Cryptographic credential verification is always performed first. */
  verifyPayment?: (req: any, effectivePrice: number) => boolean | TempoMppVerificationResult | Promise<boolean | TempoMppVerificationResult>;
  /** Durable nonce store supplied by a provider. In-memory replay state is not safe across restarts. */
  replayStore?: TempoMppReplayStore;
}

/**
 * 2-Line Express / Node HTTP Middleware to protect any REST or Streaming route
 * with native HTTP 402 Tempo L1 Machine Payments Protocol (MPP).
 * Keep any human-facing HTML or documentation route separate from this paid
 * machine-readable route. A User-Agent string is never treated as payment proof.
 *
 * Example:
 * ```ts
 * app.get('/api/orderbook', withTempoMpp({
 *   priceUsd: 0.005,
 *   payee: '0x123...',
 *   endpointUrl: 'https://provider.example/api/orderbook',
 * }), (req, res) => {
 *   res.json({ bids: [...], asks: [...] });
 * });
 * ```
 */
export function withTempoMpp(options: TempoMppMiddlewareOptions) {
  const burstByClient = new Map<string, number[]>();
  const challengeQuotes = new Map<string, { id: string; price: number; expiresAt: number }>();
  const ipRateMap = new Map<string, { count: number; resetAt: number }>();
  const replayCache: TempoMppReplayStore = options.replayStore || new Map<string, number>();
  const IP_RATE_WINDOW_MS = 60_000;
  const IP_RATE_LIMIT_PER_MIN = 120;

  return async (req: any, res: any, next: any) => {
    const now = Date.now();
    for (const [key, quote] of challengeQuotes.entries()) {
      if (quote.expiresAt <= now) challengeQuotes.delete(key);
    }

    // 0. IP-based DDoS Rate Limiting (blocks floods before CPU-intensive signature or body checks)
    // Express' req.ip is the only trusted client identity here; it already
    // applies the application's configured trust-proxy policy. Never let a
    // caller forge a rate-limit bucket with a raw X-Forwarded-For header.
    const clientIp = String(req.ip || req.socket?.remoteAddress || '127.0.0.1');
    const clientRate = ipRateMap.get(clientIp) || { count: 0, resetAt: now + IP_RATE_WINDOW_MS };
    if (now > clientRate.resetAt) {
      clientRate.count = 0;
      clientRate.resetAt = now + IP_RATE_WINDOW_MS;
    }
    clientRate.count++;
    ipRateMap.set(clientIp, clientRate);

    if (clientRate.count > IP_RATE_LIMIT_PER_MIN) {
      res.status(429);
      res.setHeader('Retry-After', '60');
      return res.json({
        error: 'Too Many Requests',
        status: 429,
        message: 'Pre-signature IP rate limit exceeded. Please throttle requests.',
      });
    }

    const quoteKey = String(
      req.headers['x-tempo-challenge-id']
      || req.headers['idempotency-key']
      // A fresh unkeyed request is a new quote and must count toward burst
      // pricing. Retries still reuse the exact quote through the challenge ID.
      || `${clientIp}:${req.method}:${req.originalUrl || req.url}:${now}:${Math.random().toString(36).slice(2, 10)}`,
    );
    const existingQuote = challengeQuotes.get(quoteKey);
    let effectivePrice = existingQuote && existingQuote.expiresAt > now ? existingQuote.price : options.priceUsd;
    let challengeId = existingQuote && existingQuote.expiresAt > now
      ? existingQuote.id
      : `mpp_${now}_${Math.random().toString(36).slice(2, 10)}`;

    if (!existingQuote && options.surgePricing) {
      const { windowMs, maxBeforeSurge, multiplier } = options.surgePricing;
      const clientBursts = burstByClient.get(clientIp) || [];
      while (clientBursts.length > 0 && clientBursts[0] < now - windowMs) {
        clientBursts.shift();
      }
      clientBursts.push(now);
      burstByClient.set(clientIp, clientBursts);

      if (clientBursts.length > maxBeforeSurge) {
        const excess = clientBursts.length - maxBeforeSurge;
        effectivePrice = Number((options.priceUsd * Math.pow(multiplier, excess)).toFixed(4));
      }
    }
    if (!existingQuote) {
      const quote = { id: challengeId, price: effectivePrice, expiresAt: now + 30_000 };
      challengeQuotes.set(quoteKey, quote);
      // The SDK echoes this opaque ID on the retry, so the provider can find
      // the exact quote even when the first request had no Idempotency-Key.
      challengeQuotes.set(challengeId, quote);
    }

    // A signature-shaped header is never proof. Verify the complete typed-data
    // credential (recovery, amount, payee, endpoint, expiry and replay nonce)
    // before allowing the provider handler to run. A custom gateway/receipt
    // check can add policy, but it cannot bypass this cryptographic check.
    for (const [key, expiry] of replayCache.entries()) {
      if (expiry <= Math.floor(now / 1000)) replayCache.delete(key);
    }
    const verification = verifyTempoMppCredential(req, options, effectivePrice, replayCache);
    let gatewayVerified = verification.verified;
    if (gatewayVerified && options.verifyPayment) {
      try {
        const customVerification = await options.verifyPayment(req, effectivePrice);
        gatewayVerified = customVerification === true
          || (typeof customVerification === 'object' && customVerification.verified === true);
        if (!gatewayVerified && !verification.reason) {
          verification.reason = 'Payment verification rejected by custom gateway verification rule.';
        }
      } catch {
        gatewayVerified = false;
        verification.reason = 'Payment verification error during gateway check.';
      }
    }
    if (gatewayVerified && verification.credential?.txHash) {
      // A hash-shaped header is never proof. Even when a gateway supplied an
      // additional policy check, every live credential with a transaction hash
      // must pass the same Tempo receipt and TIP-20 Transfer verifier.
      const txHash = verification.credential?.txHash;
      let receiptConfirmed = false;
      let receiptProofReason = '';
      if (txHash && /^0x[0-9a-fA-F]{64}$/.test(txHash)) {
        try {
          const rpc = options.rpcUrl || (typeof process !== 'undefined' ? process.env?.TEMPO_RPC_URL : undefined) || TEMPO_RPC_URL;
          const provider = new ethers.JsonRpcProvider(rpc, options.chainId || TEMPO_MPP_CHAIN_ID);
          const receipt = await provider.getTransactionReceipt(txHash);
          const expectedContract = normaliseAddress(options.verifyingContract || TEMPO_MPP_VERIFYING_CONTRACT);
          const receiptTarget = receipt?.to ? normaliseAddress(receipt.to) : null;
          const paymentInterface = new ethers.Interface([
            'event PaymentSettled(address indexed sessionKey, address indexed payee, uint256 amount, uint64 channelId, uint64 nonce, bytes32 indexed memo, string endpoint)',
          ]);
          const credential = verification.credential;
          const matchingPayment = receipt?.logs?.some((log: any) => {
            if (!expectedContract || normaliseAddress(log?.address || '')?.toLowerCase() !== expectedContract.toLowerCase()) return false;
            try {
              const parsed = paymentInterface.parseLog({ topics: log.topics, data: log.data });
              if (!parsed || parsed.name !== 'PaymentSettled' || !credential) return false;
              const args = parsed.args as any;
              return String(args.sessionKey).toLowerCase() === credential.signer.toLowerCase()
                && String(args.payee).toLowerCase() === credential.payee.toLowerCase()
                && BigInt(args.amount) === BigInt(credential.amountMicro)
                && Number(args.channelId) === credential.channelId
                && Number(args.nonce) === credential.nonce
                && String(args.memo).toLowerCase() === credential.memo.toLowerCase()
                && canonicalEndpointHash(String(args.endpoint)).toLowerCase() === credential.endpointHash.toLowerCase();
            } catch {
              return false;
            }
          });
          const credentialAmount = credential ? BigInt(credential.amountMicro) : 0n;
          let transferProof = credential && receipt
            ? verifyTempoPaymentReceipt({
              receiptStatus: receipt.status,
              logs: receipt.logs as any,
              expectedToken: (typeof process !== 'undefined' ? process.env?.TEMPO_PATHUSD_ADDRESS : undefined) || TEMPO_PATHUSD_ADDRESS,
              expectedRecipient: credential.payee,
              expectedAmountMicro: tempoPayeeAmountMicro(credentialAmount),
              receiptTo: receipt.to,
              expectedPaymentContract: expectedContract || undefined,
            })
            : { verified: false, reason: 'Tempo transaction receipt is not available or failed to load.' };
          if (!transferProof.verified && credential && receipt) {
            transferProof = verifyTempoPaymentReceipt({
              receiptStatus: receipt.status,
              logs: receipt.logs as any,
              expectedToken: (typeof process !== 'undefined' ? process.env?.TEMPO_PATHUSD_ADDRESS : undefined) || TEMPO_PATHUSD_ADDRESS,
              expectedRecipient: credential.payee,
              expectedAmountMicro: credentialAmount,
              receiptTo: receipt.to,
              expectedPaymentContract: expectedContract || undefined,
            });
          }
          if (!transferProof.verified) receiptProofReason = transferProof.reason || 'TIP-20 Transfer proof did not match.';
          receiptConfirmed = Boolean(
            receipt
            && receipt.status === 1
            && (!expectedContract || receiptTarget?.toLowerCase() === expectedContract.toLowerCase())
            && matchingPayment
            && transferProof.verified,
          );
        } catch {
          receiptConfirmed = false;
        }
      }
      if (!receiptConfirmed) {
        gatewayVerified = false;
        verification.reason = receiptProofReason
          ? `INVALID_PAYMENT_PROOF: ${receiptProofReason}`
          : 'Unconfirmed payment: provider requires a confirmed Tempo receipt or a trusted gateway attestation.';
      }
    }

    if (gatewayVerified && verification.credential) {
      // Mark the credential spent only after the trusted gateway verifier or
      // confirmed chain receipt has passed. A pending receipt must be retryable
      // with the same credential while it is still settling.
      const c = verification.credential;
      replayCache.set(`${c.signer.toLowerCase()}:${c.channelId}:${c.nonce}`, c.validBefore);
      req.tempoMpp = {
        verified: true,
        amountPathUsd: effectivePrice,
        payee: options.payee,
        nonce2D: `0x${verification.credential.channelId.toString(16).padStart(2, '0')}:0x${verification.credential.nonce.toString(16).padStart(4, '0')}`,
        credential: verification.credential,
        surgeActive: effectivePrice > options.priceUsd,
      };
      return next();
    }

    // Otherwise issue standard RFC 9110 / HTTP 402 Challenge
    const asset = options.asset || 'pathUSD';
    const realm = options.realm || 'Tempo-L1';
    const challenge = `MPP realm="${realm}", asset="${asset}", minPrice="${effectivePrice}", recipient="${options.payee}"`;

    res.status(402);
    res.setHeader('WWW-Authenticate', challenge);
    res.setHeader('X-Tempo-MPP-Challenge', challenge);
    res.setHeader('X-Tempo-Challenge-Id', challengeId);
    res.setHeader('X-Tempo-Surge-Active', effectivePrice > options.priceUsd ? 'true' : 'false');
    res.json({
      error: 'Payment Required',
      status: 402,
      protocol: 'RFC 9110 / Tempo Type 0x76 Machine Payments Protocol',
      costPathUsd: effectivePrice,
      basePriceUsd: options.priceUsd,
      surgeActive: effectivePrice > options.priceUsd,
      surgeMultiplier: effectivePrice > options.priceUsd ? Number((effectivePrice / options.priceUsd).toFixed(2)) : 1,
      asset,
      payee: options.payee,
      instructions: 'Send the signed Tempo MPP credential headers returned by the gateway. A signature-shaped header alone is rejected.',
      verificationError: verification.reason || 'Payment credential could not be verified.',
    });
  };
}
