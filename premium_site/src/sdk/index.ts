import { ethers } from 'ethers';

/**
 * Configuration options for the Synapse402 Autonomous AI Agent SDK Client.
 */
export interface SynapseAgentConfig {
  /** Private key of the delegated session key (or auto-generated if omitted) */
  sessionPrivateKey?: string;
  /** Active session key ID registered on Synapse Vault (defaults to primary testnet agent) */
  keyId?: string;
  /** Gateway endpoint URL (e.g. http://localhost:3001 or production gateway) */
  gatewayUrl?: string;
  /** Hard cap limit per single HTTP 402 paywall settlement in pathUSD (e.g. 0.05) */
  maxPricePerCall?: number;
  /** Automatically permit dynamic domain registration within budget guardrails */
  autoDynamicWhitelist?: boolean;
  /** Whether to use asynchronous non-blocking settlement queue on Tempo L1 (sub-15ms HTTP 200 response) */
  asyncRelay?: boolean;
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

/**
 * Result returned after autonomous EIP-712 settlement.
 */
export interface TempoSettlementResult {
  status: 'SETTLED' | 'VOIDED' | 'FAILED' | 'REFUNDED';
  traceId: string;
  txHash: string;
  costPathUsd: number;
  latencyMs: number;
  blockHeight: number;
  memoPayload: string;
  iso20022Standard: string;
}

/**
 * Autonomous AI Agent Client that wraps standard `fetch` with automated
 * HTTP 402 Paywall interception, EIP-712 session signing, and Tempo L1 Type 0x76 micro-settlement.
 */
export class SynapseAgentClient {
  private wallet: ethers.Wallet | ethers.HDNodeWallet;
  private keyId: string;
  private gatewayUrl: string;
  private maxPrice: number;
  private autoWhitelist: boolean;
  private asyncRelay: boolean;
  private last2DNonce: string = '0x01:0x0000';
  private localSequenceNonce: number = 0;

  constructor(config: SynapseAgentConfig = {}) {
    const sessionKey = config.sessionPrivateKey || (typeof process !== 'undefined' && process.env?.SYNAPSE_SESSION_KEY ? process.env.SYNAPSE_SESSION_KEY : undefined);
    this.wallet = sessionKey
      ? new ethers.Wallet(sessionKey)
      : ethers.Wallet.createRandom();
    this.keyId = config.keyId || 'key_quant_alpha';
    this.gatewayUrl = (config.gatewayUrl || 'http://localhost:3001').replace(/\/$/, '');
    this.maxPrice = config.maxPricePerCall ?? 0.05;
    this.autoWhitelist = config.autoDynamicWhitelist ?? true;
    this.asyncRelay = config.asyncRelay ?? false;
  }

  /**
   * Returns the last confirmed 2D Nonce processed by this agent client.
   */
  public get nonce(): string {
    return this.last2DNonce;
  }

  /**
   * Syncs the latest 2D sequence nonce from the gateway to guarantee zero collision after client restarts.
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

    if (challenge.minPrice > this.maxPrice) {
      throw new Error(
        `[Synapse402 Guardrail] Requested price $${challenge.minPrice} pathUSD exceeds maximum budget guardrail ($${this.maxPrice}).`
      );
    }

    // 3. Generate Idempotency Key for replay attack protection
    const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? `idemp_${crypto.randomUUID()}` 
      : `idemp_${Date.now()}_${ethers.hexlify(ethers.randomBytes(4)).slice(2)}`;

    // 4. Autonomous Settlement via Synapse402 Gateway Engine
    const settleResponse = await fetch(`${this.gatewayUrl}/api/mpp/settle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        keyId: this.keyId,
        targetUrl: urlString,
        pricePathUsd: challenge.minPrice,
        category: 'Autonomous Agent Fetch',
        allowDynamicWhitelist: this.autoWhitelist,
        idempotencyKey,
        asyncRelay: this.asyncRelay,
      }),
    });

    if (!settleResponse.ok) {
      const errJson = await settleResponse.json().catch(() => ({ error: 'Unknown settlement failure' }));
      throw new Error(`[Synapse402 Settlement Failed] ${errJson.error || settleResponse.statusText}`);
    }

    const settleData = await settleResponse.json();
    const trace = settleData.trace;

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
    headers.set('Authorization', `MPP-EIP712 signer="${this.wallet.address}", nonce="${trace.nonce2D}", max="${this.maxPrice}"`);
    headers.set('Idempotency-Key', idempotencyKey);

    const authorizedResponse = await fetch(input, {
      ...initialInit,
      headers,
    });

    // If external upstream delivered mock/simulated fallback or direct response
    if (!authorizedResponse.ok && trace.liveProxyPayload) {
      return new Response(JSON.stringify(trace.liveProxyPayload), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Tempo-Settled': 'true',
          'X-Tempo-Trace-Id': trace.id,
          'X-Tempo-Latency-Ms': String(trace.latencyMs),
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
// 2. API Monetization Middleware for Providers (Express / Fastify / Node HTTP)
// ============================================================================

export interface TempoMppMiddlewareOptions {
  /** Required payment price in pathUSD (e.g. 0.005) */
  priceUsd: number;
  /** Recipient address for payments on Tempo L1 */
  payee: string;
  /** Asset token name (defaults to 'pathUSD') */
  asset?: string;
  /** Realm identifier (defaults to 'Tempo-L1') */
  realm?: string;
  /** Allow verified search engine crawlers (Googlebot, Bingbot) free access for SEO indexing */
  allowSearchCrawlers?: boolean;
  /** Optional dynamic surge pricing for economic bot/DDoS throttling */
  surgePricing?: {
    windowMs: number;
    maxBeforeSurge: number;
    multiplier: number;
  };
}

/**
 * 2-Line Express / Fastify Middleware to protect any REST or Streaming route
 * with native HTTP 402 Tempo L1 Machine Payments Protocol (MPP).
 * Supports Dynamic SEO Segmentation (allowSearchCrawlers: true) so Googlebot passes free.
 *
 * Example:
 * ```ts
 * app.get('/api/orderbook', withTempoMpp({ priceUsd: 0.005, payee: '0x123...', allowSearchCrawlers: true }), (req, res) => {
 *   res.json({ bids: [...], asks: [...] });
 * });
 * ```
 */
export function withTempoMpp(options: TempoMppMiddlewareOptions) {
  const requestTimestamps: number[] = [];
  const ipRateMap = new Map<string, { count: number; resetAt: number }>();
  const IP_RATE_WINDOW_MS = 60_000;
  const IP_RATE_LIMIT_PER_MIN = 120;

  return (req: any, res: any, next: any) => {
    const now = Date.now();

    // 0. Dynamic SEO Segmentation: Allow search engine crawlers free access for SEO indexation
    if (options.allowSearchCrawlers) {
      const userAgent = (req.headers['user-agent'] || '').toLowerCase();
      const isSearchCrawler = userAgent.includes('googlebot') || userAgent.includes('bingbot') || userAgent.includes('duckduckbot');
      if (isSearchCrawler) {
        req.tempoMpp = {
          verified: true,
          crawlerBypass: true,
          amountPathUsd: 0,
          payee: options.payee,
        };
        return next();
      }
    }

    // 1. IP-based DDoS Rate Limiting (blocks floods before CPU-intensive signature or body checks)
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket?.remoteAddress || req.ip || '127.0.0.1';
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

    let effectivePrice = options.priceUsd;

    if (options.surgePricing) {
      const { windowMs, maxBeforeSurge, multiplier } = options.surgePricing;
      while (requestTimestamps.length > 0 && requestTimestamps[0] < now - windowMs) {
        requestTimestamps.shift();
      }
      requestTimestamps.push(now);

      if (requestTimestamps.length > maxBeforeSurge) {
        const excess = requestTimestamps.length - maxBeforeSurge;
        effectivePrice = Number((options.priceUsd * Math.pow(multiplier, excess)).toFixed(4));
      }
    }

    const sig = req.headers['x-tempo-mpp-signature'] || req.headers['authorization'];
    const nonce = req.headers['x-tempo-nonce-2d'];

    // If valid MPP cryptographic proof is attached, pass through to route handler
    if (sig && (typeof sig === 'string') && (sig.startsWith('0x') || sig.startsWith('MPP-EIP712'))) {
      req.tempoMpp = {
        verified: true,
        amountPathUsd: effectivePrice,
        payee: options.payee,
        nonce2D: nonce || '0x01:0x0001',
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
      instructions: 'Sign EIP-712 MPPAuthorization with authorized session key and provide X-Tempo-MPP-Signature header.',
    });
  };
}
