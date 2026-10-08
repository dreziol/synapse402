import * as dotenv from 'dotenv';
dotenv.config({ quiet: true } as any);

import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { ethers } from 'ethers';
import { createServer as createViteServer } from 'vite';
import { synapseEngine } from './server/synapseCore';
import { handleMcpJsonRpc, SYNAPSE_MCP_TOOLS, executeMcpTool } from './server/mcpServer';
import { handleStreamInference } from './server/streamServer';
import { withTempoMpp } from './src/sdk';
import { TEMPO_CHAIN_ID, TEMPO_RECEIVER_ADDRESS, tempoTransactionUrl } from './src/config/network';

export const app = express();
const PORT = Number(process.env.PORT) || 3001;
const invoiceStore = new Map<string, { amountPathUsd: number; memo: string; createdAt: string; isSettled: boolean }>();
const MAX_EVALUATION_INVOICES = 10_000;
const EVALUATION_INVOICE_TTL_MS = 24 * 60 * 60 * 1000;
// Temporary ceiling for one mission run. The session key remains the
// longer-lived safety backstop; this ledger enforces the user's job limit
// across all payment steps in that run.
const activeJobBudgets = new Map<string, {
  keyId: string;
  budgetMicro: number;
  spentMicro: number;
  expiresAt: number;
  // Idempotent retries reuse the same reservation instead of consuming the
  // job limit a second time. The scope keeps evaluation and live keys apart.
  idempotencyKeys: string[];
}>();
const jobBudgetStatePath = (() => {
  const configured = process.env.SYNAPSE_RUNTIME_DIR;
  if (configured) {
    const dir = path.resolve(configured);
    fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, 'jobBudgets.json');
  }
  const candidates = [
    path.join(process.cwd(), 'server', '.runtime', 'jobBudgets.json'),
    path.join(process.cwd(), 'premium_site', 'server', '.runtime', 'jobBudgets.json'),
  ];
  const selected = candidates.find((candidate) => fs.existsSync(path.dirname(candidate))) || candidates[0];
  fs.mkdirSync(path.dirname(selected), { recursive: true });
  return selected;
})();

// Provider nonce consumption must survive a process restart. The local demo
// routes use this small atomic JSON-backed store; production providers can
// inject Redis/Postgres through the SDK's replayStore option instead.
const providerReplayStatePath = path.join(path.dirname(jobBudgetStatePath), 'provider-replay.json');
const providerReplayStore = (() => {
  const values = new Map<string, number>();
  try {
    const raw = JSON.parse(fs.readFileSync(providerReplayStatePath, 'utf8'));
    if (raw && typeof raw === 'object') {
      for (const [key, expiry] of Object.entries(raw)) {
        if (Number(expiry) > Math.floor(Date.now() / 1000)) values.set(key, Number(expiry));
      }
    }
  } catch { /* first boot */ }
  const persist = () => {
    const serializable = Object.fromEntries(values.entries());
    const tempPath = `${providerReplayStatePath}.${process.pid}.tmp`;
    try {
      fs.writeFileSync(tempPath, JSON.stringify(serializable), 'utf8');
      fs.renameSync(tempPath, providerReplayStatePath);
    } catch (error: any) {
      try { fs.copyFileSync(tempPath, providerReplayStatePath); } catch { /* best effort */ }
      console.warn(`[Synapse402] Provider replay ledger could not be persisted: ${error?.message || error}`);
    }
  };
  return {
    get: (key: string) => values.get(key),
    set: (key: string, expiry: number) => { values.set(key, expiry); persist(); },
    delete: (key: string) => { values.delete(key); persist(); },
    entries: () => values.entries(),
  };
})();

const loadJobBudgetState = () => {
  try {
    if (!fs.existsSync(jobBudgetStatePath)) return;
    const parsed = JSON.parse(fs.readFileSync(jobBudgetStatePath, 'utf8'));
    const now = Date.now();
    if (!parsed || typeof parsed !== 'object') return;
    for (const [jobId, ledger] of Object.entries(parsed as Record<string, any>)) {
      if (!ledger || typeof ledger !== 'object' || Number(ledger.expiresAt) <= now) continue;
      if (!ledger.keyId || !Number.isFinite(Number(ledger.budgetMicro)) || !Number.isFinite(Number(ledger.spentMicro))) continue;
      activeJobBudgets.set(jobId, {
        keyId: String(ledger.keyId),
        budgetMicro: Number(ledger.budgetMicro),
        spentMicro: Number(ledger.spentMicro),
        expiresAt: Number(ledger.expiresAt),
        idempotencyKeys: Array.isArray(ledger.idempotencyKeys)
          ? ledger.idempotencyKeys.map((value: unknown) => String(value)).filter(Boolean)
          : [],
      });
    }
  } catch (error: any) {
    console.warn(`[Synapse402] Job budget ledger could not be restored: ${error?.message || error}`);
  }
};

const persistJobBudgetState = () => {
  try {
    const serializable = Object.fromEntries(activeJobBudgets.entries());
    const tempPath = `${jobBudgetStatePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(serializable, null, 2), 'utf8');
    fs.renameSync(tempPath, jobBudgetStatePath);
  } catch (error: any) {
    console.warn(`[Synapse402] Job budget ledger could not be persisted: ${error?.message || error}`);
  }
};

loadJobBudgetState();

const localMpp = (options: Parameters<typeof withTempoMpp>[0]) => {
  const paymentMiddleware = withTempoMpp({
    ...options,
    replayStore: providerReplayStore,
    verifyPayment: (req: Request, effectivePrice: number) => synapseEngine.verifyProviderRequest(
      req.path,
      String(req.headers['x-tempo-mpp-signature'] || ''),
      String(req.headers['x-tempo-nonce-2d'] || ''),
      String(req.headers['x-synapse-trace-id'] || ''),
      effectivePrice,
    ),
  });

  return (req: Request, res: Response, next: NextFunction) => {
    const networkMode = synapseEngine.getNetworkStatus().networkMode;
    const requestedMode = String(req.headers['x-synapse-execution-mode'] || '').toUpperCase();
    const responseMode = requestedMode === 'RESILIENT_SANDBOX' ? 'RESILIENT_SANDBOX' : networkMode;
    // Provider payloads in this local showcase are fixtures. The payment
    // proof can be live, but the returned business data still needs upstream
    // verification before it should be presented as production data.
    res.setHeader('X-Synapse-Execution-Mode', responseMode);
    res.setHeader('X-Synapse-Data-Status', 'EVALUATION_FIXTURE');
    const sendJson = res.json.bind(res);
    res.json = ((body: any) => {
      if (body && typeof body === 'object' && !Array.isArray(body)) {
        return sendJson({ ...body, executionMode: responseMode, providerDataStatus: 'EVALUATION_FIXTURE' });
      }
      return sendJson(body);
    }) as Response['json'];
    return paymentMiddleware(req, res, next);
  };
};

app.use((req, res, next) => {
  const origin = req.headers.origin;
  let isAllowedOrigin = true;
  if (origin) {
    try {
      const parsedUrl = new URL(origin);
      const hostname = parsedUrl.hostname.toLowerCase();
      isAllowedOrigin =
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === 'tempo.xyz' ||
        hostname.endsWith('.tempo.xyz') ||
        hostname === 'colosseum.org' ||
        hostname.endsWith('.colosseum.org') ||
        (process.env.ALLOWED_ORIGINS
          ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()).includes(origin)
          : false);
    } catch {
      isAllowedOrigin = false;
    }
  }

  if (origin && isAllowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', [
    'Content-Type', 'Authorization', 'Idempotency-Key', 'X-Admin-Key',
    'X-Tempo-MPP-Signature', 'X-Tempo-Nonce-2D', 'X-Tempo-Cost-PathUSD',
    'X-Tempo-Tx-Hash', 'X-Tempo-Challenge-Id', 'X-Synapse-Trace-Id', 'X-Synapse-Execution-Mode',
    'X-Tempo-MPP-Signer', 'X-Tempo-MPP-Payee', 'X-Tempo-MPP-Amount-Micro',
    'X-Tempo-MPP-Endpoint', 'X-Tempo-MPP-Endpoint-Hash', 'X-Tempo-MPP-Memo',
    'X-Tempo-MPP-Valid-Before', 'X-Tempo-MPP-Chain-Id', 'X-Tempo-MPP-Verifying-Contract',
    'X-Tempo-MPP-Channel-Id', 'X-Tempo-MPP-Nonce',
  ].join(', '));
  res.setHeader('Access-Control-Expose-Headers', [
    'WWW-Authenticate', 'X-Tempo-MPP-Challenge', 'X-Tempo-Challenge-Id',
    'X-Tempo-Surge-Active', 'X-Synapse-Execution-Mode', 'X-Synapse-Data-Status',
    'X-Tempo-Payment-Status', 'X-Tempo-Trace-Id', 'X-Tempo-Tx-Hash',
  ].join(', '));
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: '2mb' }));

// Unified Live / Mutation Guard for Production & Demo Security
export function checkLiveAccess(req: Request, requestedEvaluation: boolean): { allowed: boolean; status: number; error?: string } {
  // Referer is user-controlled and can be forged by a non-browser client;
  // never use it as proof that a live request came from a trusted origin.
  const rawOriginHeader = req.headers['origin'];
  const originHeader = Array.isArray(rawOriginHeader)
    ? String(rawOriginHeader[0] || '')
    : String(rawOriginHeader || '');
  const publicLiveOptIn = process.env.SYNAPSE_ALLOW_PUBLIC_LIVE === 'true';
  const remoteAddress = String(req.ip || req.socket?.remoteAddress || '').replace(/^::ffff:/, '');
  const localRemote = remoteAddress === '127.0.0.1' || remoteAddress === '::1';

  if (!requestedEvaluation && !publicLiveOptIn && !originHeader && !localRemote) {
    return { allowed: false, status: 403, error: 'Live access requires a trusted local request or an explicit public live gate.' };
  }

  if (originHeader) {
    let isAllowed = false;
    try {
      const originUrl = new URL(originHeader);
      const hostname = originUrl.hostname.toLowerCase();
      const local = hostname === 'localhost' || hostname === '127.0.0.1';
      const trustedProduct = hostname === 'synapse402.network' || hostname.endsWith('.synapse402.network');
      const trustedTempo = hostname === 'tempo.xyz' || hostname.endsWith('.tempo.xyz');
      const trustedSslip = hostname.endsWith('.sslip.io');
      const trustedDuck = hostname.endsWith('.duckdns.org');
      const explicit = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',').map((value) => value.trim()).filter(Boolean).some((o) => o === '*' || o === originHeader || originHeader.startsWith(o))
        : false;
      isAllowed = local || trustedProduct || trustedTempo || trustedSslip || trustedDuck || explicit;
    } catch {
      isAllowed = false;
    }
    if (!isAllowed) {
      return { allowed: false, status: 403, error: '403 Forbidden: Untrusted cross-origin request rejected.' };
    }

    if (!requestedEvaluation && !publicLiveOptIn) {
      let hostname = '';
      try { hostname = new URL(originHeader).hostname.toLowerCase(); } catch { /* handled */ }
      const localOrigin = hostname === 'localhost' || hostname === '127.0.0.1';
      if (!localOrigin) {
        return { allowed: false, status: 403, error: 'Live actions are disabled for public origins. Use evaluationOnly or enable SYNAPSE_ALLOW_PUBLIC_LIVE behind an application gate.' };
      }
    }
  }

  return { allowed: true, status: 200 };
}

export function checkKeyMutationAccess(req: Request): { allowed: boolean; status: number; error?: string } {
  const liveAccess = checkLiveAccess(req, false);
  if (!liveAccess.allowed) return liveAccess;
  // Public live access permits payment requests, not edits to the spending
  // policy or provider registry. Those mutations require an admin credential.
  return process.env.SYNAPSE_ALLOW_PUBLIC_LIVE === 'true'
    ? checkAdminAccess(req)
    : liveAccess;
}

function checkAdminAccess(req: Request): { allowed: boolean; status: number; error?: string } {
  const adminKey = process.env.ADMIN_KEY || process.env.SYNAPSE_ADMIN_KEY;
  if (!adminKey) {
    return { allowed: false, status: 503, error: 'Administrative controls are disabled until ADMIN_KEY is configured.' };
  }
  const headerKey = req.headers['x-admin-key'];
  const authorization = req.headers.authorization;
  const provided = (typeof headerKey === 'string' ? headerKey : '')
    || (typeof authorization === 'string' ? authorization.match(/^Bearer\s+(.+)$/i)?.[1] : undefined)
    || '';
  const expectedBytes = Buffer.from(adminKey);
  const providedBytes = Buffer.from(provided);
  if (providedBytes.length !== expectedBytes.length || !crypto.timingSafeEqual(providedBytes, expectedBytes)) {
    return { allowed: false, status: 401, error: '401 Unauthorized: Invalid or missing X-Admin-Key.' };
  }
  return { allowed: true, status: 200 };
}

// ==========================================
// REST API Routes
// ==========================================

// 1. Network & Health
app.get('/api/health', (req: Request, res: Response) => {
  const metrics = synapseEngine.getMetrics();
  res.json({
    status: 'ok',
    network: 'Tempo Moderato Testnet',
    chainId: TEMPO_CHAIN_ID,
    blockHeight: metrics.blockHeight,
    standard: 'RFC 9110 / HTTP 402 + Tempo Type 0x76 MPP',
    gateway: 'Synapse402 Router v1.0.0',
  });
});

app.get('/api/network/status', (req: Request, res: Response) => {
  res.json(synapseEngine.getNetworkStatus());
});

// 2. Vault Financial Metrics
app.get('/api/vault/metrics', (req: Request, res: Response) => {
  res.json(synapseEngine.getMetrics());
});

app.get('/api/metrics', (req: Request, res: Response) => {
  res.json(synapseEngine.getMetrics());
});

app.get('/api/wallet/balance', async (req: Request, res: Response) => {
  const address = req.query.address as string;
  try {
    const balances = await synapseEngine.getWalletBalances(address);
    res.json(balances);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch wallet balances' });
  }
});

app.post('/api/vault/deposit', async (req: Request, res: Response) => {
  const { amount, executionMode } = req.body;
  const depositNum = Number(amount);
  if (amount === undefined || !Number.isFinite(depositNum) || depositNum <= 0) {
    return res.status(400).json({ error: 'Valid positive deposit amount is required.' });
  }
  if (depositNum > 1000) {
    return res.status(400).json({ error: 'Deposit amount exceeds maximum demo limit ($1,000 pathUSD).' });
  }
  const networkMode = synapseEngine.getNetworkStatus().networkMode;
  if (executionMode === 'LIVE_TESTNET' && networkMode !== 'LIVE_TESTNET') {
    return res.status(503).json({ error: 'Tempo testnet is unavailable; no funds were added.' });
  }
  if (networkMode === 'LIVE_TESTNET') {
    const remoteAddress = req.socket.remoteAddress || '';
    const localClient = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(remoteAddress);
    const origin = req.headers.origin;
    const localOrigin = !origin || [`http://localhost:${PORT}`, `http://127.0.0.1:${PORT}`].includes(origin);
    if (!localClient || !localOrigin) {
      return res.status(403).json({ error: 'Project-wallet deposits are available only from the local demo.' });
    }
  }
  try {
    const updatedMetrics = await synapseEngine.deposit(depositNum);
    res.json(updatedMetrics);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Deposit failed.' });
  }
});

app.get('/api/vault/export-iso20022', (req: Request, res: Response) => {
  const format = req.query.format === 'csv' ? 'csv' : 'xml';
  try {
    const report = synapseEngine.exportIso20022Report(format);
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="synapse402-iso20022-ledger.csv"');
    } else {
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Content-Disposition', 'attachment; filename="synapse402-camt053.xml"');
    }
    res.send(report);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate financial export' });
  }
});

// 3. Scoped Session Keys
app.get('/api/keys', (req: Request, res: Response) => {
  res.json({ keys: synapseEngine.getKeys() });
});

app.post('/api/keys', (req: Request, res: Response) => {
  const mutationCheck = checkKeyMutationAccess(req);
  if (!mutationCheck.allowed) {
    return res.status(mutationCheck.status).json({ error: mutationCheck.error });
  }
  const { agentName, role, maxPerCallPathUsd, totalBudgetPathUsd, whitelistedDomains } = req.body;

  if (!String(agentName || '').trim() || maxPerCallPathUsd === undefined || totalBudgetPathUsd === undefined) {
    return res.status(400).json({ error: 'Missing required parameters (agentName, maxPerCallPathUsd, totalBudgetPathUsd).' });
  }
  if (String(agentName).trim().length > 160 || (role !== undefined && String(role).trim().length > 200)) {
    return res.status(400).json({ error: 'agentName must be 1–160 characters and role must be no more than 200 characters.' });
  }

  const maxCall = Number(maxPerCallPathUsd);
  const totalBudget = Number(totalBudgetPathUsd);

  if (!Number.isFinite(maxCall) || maxCall <= 0 || !Number.isFinite(totalBudget) || totalBudget <= 0) {
    return res.status(400).json({ error: 'maxPerCallPathUsd and totalBudgetPathUsd must be positive numbers.' });
  }

  if (maxCall > totalBudget) {
    return res.status(400).json({ error: 'maxPerCallPathUsd cannot exceed totalBudgetPathUsd.' });
  }

  if (totalBudget > 1000) {
    return res.status(400).json({ error: 'totalBudgetPathUsd exceeds maximum allowable limit ($1,000 pathUSD).' });
  }

  const domains = Array.isArray(whitelistedDomains)
    ? whitelistedDomains.map((domain) => String(domain).trim()).filter(Boolean)
    : String(whitelistedDomains || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

  if (domains.length === 0) {
    return res.status(400).json({ error: 'At least one approved http/https provider domain is required.' });
  }
  if (domains.length > 256) {
    return res.status(400).json({ error: 'At most 256 approved provider routes can be attached to one session key.' });
  }
  if (domains.some((domain) => {
    try {
      const parsed = new URL(domain);
      return !['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname;
    } catch {
      return true;
    }
  })) {
    return res.status(400).json({ error: 'whitelistedDomains must contain valid http:// or https:// URLs.' });
  }

  try {
    const newKey = synapseEngine.addKey({
      agentName: String(agentName).trim(),
      role: role ? String(role).trim() : undefined,
      maxPerCallPathUsd: maxCall,
      totalBudgetPathUsd: totalBudget,
      whitelistedDomains: domains,
    });
    res.status(201).json({ key: newKey });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Key creation failed.' });
  }
});

app.patch('/api/keys/:id/toggle', async (req: Request, res: Response) => {
  const mutationCheck = checkKeyMutationAccess(req);
  if (!mutationCheck.allowed) {
    return res.status(mutationCheck.status).json({ error: mutationCheck.error });
  }
  try {
    const updatedKey = await synapseEngine.toggleKeyStatus(req.params.id);
    if (!updatedKey) {
      return res.status(404).json({ error: 'Key not found.' });
    }
    res.json({ key: updatedKey });
  } catch (err: any) {
    res.status(502).json({ error: err.message || 'Failed to update session key status.' });
  }
});

const requireAdminAuth = (req: Request, res: Response, next: any) => {
  const access = checkAdminAccess(req);
  if (!access.allowed) return res.status(access.status).json({ error: access.error });
  next();
};

app.delete('/api/keys/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const removed = await synapseEngine.removeKey(req.params.id);
    if (!removed) {
      return res.status(404).json({ error: 'Key not found.' });
    }
    res.json({ success: true, removedId: req.params.id });
  } catch (err: any) {
    res.status(502).json({ error: err.message || 'Failed to revoke session key.' });
  }
});

app.post('/api/mpp/reset', requireAdminAuth, async (req: Request, res: Response) => {
  const { keyId } = req.body || {};
  try {
    const result = await synapseEngine.resetDemoState(keyId ? String(keyId) : undefined);
    res.status(result.success ? 200 : 409).json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to reset demo state.' });
  }
});

// 4. Canonical Persistent Receipts Ledger & MPP Traces
const toPublicReceipt = (receipt: any) => {
  const receiptVerified = receipt.executionMode === 'LIVE_TESTNET'
    && receipt.status === 'SETTLED'
    && receipt.receiptVerified === true;
  // A persisted/demo trace can still carry the legacy SETTLED label even
  // though it has no verified chain receipt. Never expose that label to API
  // consumers: live unverified traces are pending, sandbox traces are demo.
  const publicStatus = receiptVerified
    ? 'SETTLED'
    : receipt.status === 'SETTLED'
      ? (receipt.executionMode === 'LIVE_TESTNET' ? 'PENDING' : 'SIMULATED_PASS')
      : receipt.status;
  return {
    id: receipt.id,
    timestamp: receipt.timestamp,
    agentName: receipt.agentName,
    serviceName: receipt.serviceName || receipt.providerName || 'Provider',
    targetEndpoint: receipt.targetEndpoint,
    method: receipt.method,
    latencyMs: Number(receipt.latencyMs || 0),
    blockNumber: Number(receipt.blockNumber || 0),
    amountPathUsd: Number(receipt.costPathUsd || 0),
    costPathUsd: Number(receipt.costPathUsd || 0),
    status: publicStatus,
    executionMode: receipt.executionMode,
    // Do not expose a provisional hash or explorer link as payment proof.
    txHash: receiptVerified ? receipt.txHash : null,
    explorerUrl: receiptVerified ? tempoTransactionUrl(receipt.txHash) : null,
    providerDataStatus: receipt.providerDataStatus || receipt.liveProxyPayload?.providerDataStatus || 'UNVERIFIED',
    receiptVerified,
    proof: {
      blockNumber: Number(receipt.blockNumber || 0),
      nonce2D: receipt.nonce2D || null,
      memo: receipt.tip20Memo || null,
      transferVerified: receiptVerified,
    },
  };
};

app.get('/api/receipts', (req: Request, res: Response) => {
  const ledger = synapseEngine.getReceiptsLedger();
  res.json({ ...ledger, receipts: ledger.receipts.map(toPublicReceipt) });
});

app.get('/api/mpp/traces', (req: Request, res: Response) => {
  const ledger = synapseEngine.getReceiptsLedger();
  res.json({ traces: ledger.receipts.map(toPublicReceipt), summary: ledger.summary });
});

// 4b. Prepare EIP-712 MPP Authorization (For Connected MetaMask Judges & Agents)
app.post('/api/mpp/prepare', async (req: Request, res: Response) => {
  const { keyId, targetUrl, pricePathUsd, signerAddress, channelId, recipient, evaluationOnly } = req.body;
  const requestedEvaluation = evaluationOnly !== false
    && !(typeof evaluationOnly === 'string' && evaluationOnly.trim().toLowerCase() === 'false');
  const accessCheck = checkLiveAccess(req, requestedEvaluation);
  if (!accessCheck.allowed) {
    return res.status(accessCheck.status).json({ error: accessCheck.error });
  }
  if (!targetUrl || pricePathUsd === undefined) {
    return res.status(400).json({ error: 'targetUrl and pricePathUsd are required.' });
  }
  if (keyId === undefined || !String(keyId).trim()) {
    return res.status(400).json({ error: 'keyId is required so authorization is bound to one spending policy.' });
  }
  const effectiveKeyId = String(keyId).trim();
  const configuredKey = synapseEngine.getKeys().find((k) => k.id === effectiveKeyId);
  if (configuredKey && !requestedEvaluation && configuredKey.status !== 'ACTIVE') {
    return res.status(403).json({ error: `Session key "${configuredKey.agentName}" is not active.` });
  }
  const requestedPrice = Number(pricePathUsd);
  if (!Number.isFinite(requestedPrice) || requestedPrice < 0.000001) {
    return res.status(400).json({ error: 'pricePathUsd must be at least 0.000001 pathUSD.' });
  }
  const cleanTargetUrl = String(targetUrl).trim();
  const resolvedPrepareTarget = cleanTargetUrl.startsWith('/')
    ? `http://127.0.0.1:${PORT}${cleanTargetUrl}`
    : cleanTargetUrl;
  const approvedPreparePayee = synapseEngine.getApprovedPayeeForEndpoint(resolvedPrepareTarget);
  if (recipient && approvedPreparePayee && String(recipient).trim().toLowerCase() !== approvedPreparePayee.toLowerCase()) {
    return res.status(403).json({ error: 'recipient does not match the approved payee for this provider endpoint.' });
  }
  try {
    const prepared = await synapseEngine.prepareAuthorization({
      keyId: String(keyId).trim(),
      signerAddress: signerAddress ? String(signerAddress).trim() : undefined,
      targetUrl: resolvedPrepareTarget,
      pricePathUsd: requestedPrice,
      channelId: channelId !== undefined ? Number(channelId) : undefined,
      payee: approvedPreparePayee || (recipient ? String(recipient).trim() : undefined),
    });
    res.json(prepared);
  } catch (err: any) {
    const message = err.message || 'Failed to prepare EIP-712 authorization.';
    // Preserve the prepare endpoint's historical 400 contract for malformed
    // or unknown preparation requests; only an explicit allowlist denial is
    // surfaced as 403.
    const status = message.startsWith('403') ? 403 : 400;
    res.status(status).json({ error: message });
  }
});

// 5. Autonomous 402 Settlement Endpoint
app.post('/api/mpp/settle', async (req: Request, res: Response) => {
  const {
    keyId,
    targetUrl,
    pricePathUsd,
    category,
    simulateFailure,
    allowDynamicWhitelist,
    corruptSignature,
    customSig,
    signerAddress,
    channelId,
    nonce,
    validBefore,
    asyncRelay,
    evaluationOnly,
    jobId,
    jobBudgetPathUsd,
    recipient,
    asset,
    realm,
  } = req.body;

  const requestedEvaluation = evaluationOnly !== false
    && !(typeof evaluationOnly === 'string' && evaluationOnly.trim().toLowerCase() === 'false');

  const accessCheck = checkLiveAccess(req, requestedEvaluation);
  if (!accessCheck.allowed) {
    return res.status(accessCheck.status).json({ error: accessCheck.error });
  }

  if (!targetUrl || pricePathUsd === undefined) {
    return res.status(400).json({ error: 'targetUrl and pricePathUsd are required.' });
  }

  if (keyId === undefined || !String(keyId).trim()) {
    return res.status(400).json({ error: 'keyId is required. Choose the buyer policy explicitly; the gateway will not silently choose another agent.' });
  }
  const effectiveKeyId = String(keyId).trim();
  const configuredKey = synapseEngine.getKeys().find((candidate) =>
    candidate.id === effectiveKeyId
  );
  if (!configuredKey) {
    return res.status(404).json({ error: `404 Not Found: Session key "${effectiveKeyId}" does not exist in SynapseVault.` });
  }
  if (!requestedEvaluation && configuredKey.status !== 'ACTIVE') {
    return res.status(403).json({ error: `Session key "${configuredKey.agentName}" is not active for live settlement.` });
  }

  const price = Number(pricePathUsd);
  if (!Number.isFinite(price) || price <= 0) {
    return res.status(400).json({ error: 'pricePathUsd must be a positive finite number.' });
  }
  if (asset !== undefined && String(asset) !== 'pathUSD') {
    return res.status(400).json({ error: 'Only the pathUSD payment asset is supported by this settlement route.' });
  }
  if (realm !== undefined && String(realm) !== 'Tempo-L1') {
    return res.status(400).json({ error: 'The payment realm does not match Tempo-L1.' });
  }
  let requestedRecipient: string | undefined;
  if (recipient !== undefined && String(recipient).trim()) {
    try {
      requestedRecipient = ethers.getAddress(String(recipient).trim());
    } catch {
      return res.status(400).json({ error: 'recipient must be a valid EVM address.' });
    }
  }
  const resolvedTargetForRegistry = String(targetUrl).trim().startsWith('/')
    ? `http://127.0.0.1:${PORT}${String(targetUrl).trim()}`
    : String(targetUrl).trim();
  const approvedEndpointPayee = synapseEngine.getApprovedPayeeForEndpoint(resolvedTargetForRegistry);
  if (!requestedRecipient) {
    requestedRecipient = approvedEndpointPayee || synapseEngine.receiverAddress || TEMPO_RECEIVER_ADDRESS;
  }
  if (approvedEndpointPayee && requestedRecipient.toLowerCase() !== approvedEndpointPayee.toLowerCase()) {
    return res.status(403).json({ error: 'Payment recipient does not match the approved payee for this provider endpoint.' });
  }

  // Live settlement must always belong to an explicit, bounded job. Without
  // this guard a public POST could spend an active reusable key without a
  // mission budget or an auditable job id. Evaluation calls remain convenient
  // for demos, while live calls carry a durable budget ledger entry.
  const normalizedJobId = String(jobId || '').trim();
  const numericJobBudget = Number(jobBudgetPathUsd);
  if (!requestedEvaluation) {
    const configuredReceiver = ethers.getAddress(synapseEngine.receiverAddress || TEMPO_RECEIVER_ADDRESS);
    const expectedLivePayee = approvedEndpointPayee
      ? ethers.getAddress(approvedEndpointPayee)
      : configuredReceiver;
    if (requestedRecipient.toLowerCase() !== expectedLivePayee.toLowerCase()) {
      return res.status(403).json({ error: 'Live settlement recipient must match the approved provider payee.' });
    }
    requestedRecipient = expectedLivePayee;
  }
  if (!requestedEvaluation && (!normalizedJobId || !Number.isFinite(numericJobBudget) || numericJobBudget <= 0)) {
    return res.status(400).json({ error: 'Live settlement requires jobId and a positive jobBudgetPathUsd. Use evaluationOnly for a demo run.' });
  }
  if (!requestedEvaluation && signerAddress && String(signerAddress).toLowerCase() !== String(configuredKey.sessionPublicKey).toLowerCase()) {
    return res.status(403).json({ error: 'signerAddress must match the selected session key. Prepare and sign authorization for this key.' });
  }
  if (!requestedEvaluation && process.env.SYNAPSE_ALLOW_UNREGISTERED_LIVE !== 'true') {
    // Public demo deployments may expose this route without an account login.
    // Limit live writes to the provider registry so a guessed key cannot be
    // turned into an arbitrary outbound payment target.
    let targetPath = String(targetUrl).trim();
    let targetParsed: URL | null = null;
    try {
      targetParsed = new URL(targetPath, `http://127.0.0.1:${PORT}`);
      targetPath = targetParsed.pathname;
    } catch { /* validated by settle402 below */ }
    const registeredLiveTarget = synapseEngine.getEndpoints().some((endpoint) => {
      const configured = String(endpoint.endpointUrl || '').trim();
      if (!configured) return false;
      try {
        const configuredParsed = new URL(configured, `http://127.0.0.1:${PORT}`);
        if (!targetParsed) return configured === String(targetUrl).trim();
        // Relative local routes may be compared by their resolved host/path,
        // but an external target must match the registered hostname too. A
        // path-only comparison would let an attacker redirect a whitelisted
        // route to an arbitrary host before the engine rejects it.
        const configuredPort = configuredParsed.port || (configuredParsed.protocol === 'https:' ? '443' : '80');
        const targetPort = targetParsed.port || (targetParsed.protocol === 'https:' ? '443' : '80');
        return configuredParsed.protocol === targetParsed.protocol
          && configuredParsed.hostname.toLowerCase() === targetParsed.hostname.toLowerCase()
          && configuredPort === targetPort
          && configuredParsed.pathname === targetParsed.pathname
          && (!targetParsed.search && !configuredParsed.search || configuredParsed.search === targetParsed.search);
      } catch {
        return configured === String(targetUrl).trim();
      }
    });
    if (!registeredLiveTarget) {
      return res.status(403).json({ error: 'Live settlement target is not in the approved provider registry. Use evaluationOnly for an unregistered demo route.' });
    }
  }
  if (normalizedJobId.length > 160) {
    return res.status(400).json({ error: 'jobId must be 160 characters or fewer.' });
  }
  if (Number.isFinite(numericJobBudget) && numericJobBudget > configuredKey.totalBudgetPathUsd) {
    return res.status(400).json({ error: `jobBudgetPathUsd cannot exceed the selected agent rule ($${configuredKey.totalBudgetPathUsd.toFixed(4)}).` });
  }

  const idempotencyKey = (req.headers['idempotency-key'] as string) || req.body.idempotencyKey;
  let jobReservation: {
    keyId: string;
    budgetMicro: number;
    spentMicro: number;
    expiresAt: number;
    idempotencyKeys: string[];
  } | null = null;
  let jobReservationKey: string | null = null;
  let jobReservationReleased = false;
  const releaseJobReservation = () => {
    if (!jobReservation || jobReservationReleased) return;
    jobReservationReleased = true;
    jobReservation.spentMicro = Math.max(0, jobReservation.spentMicro - Math.round(price * 1e6));
    if (jobReservationKey) {
      jobReservation.idempotencyKeys = jobReservation.idempotencyKeys.filter((key) => key !== jobReservationKey);
    }
    persistJobBudgetState();
  };

  if (normalizedJobId && Number.isFinite(numericJobBudget) && numericJobBudget > 0) {
    const now = Date.now();
    let removedExpiredLedger = false;
    for (const [id, ledger] of activeJobBudgets) {
      if (ledger.expiresAt <= now) {
        activeJobBudgets.delete(id);
        removedExpiredLedger = true;
      }
    }
    if (removedExpiredLedger) persistJobBudgetState();
    const budgetMicro = Math.round(numericJobBudget * 1e6);
    const priceMicro = Math.round(price * 1e6);
    const existing = activeJobBudgets.get(normalizedJobId);
    if (existing && existing.keyId !== effectiveKeyId) {
      return res.status(409).json({ error: 'This job is already bound to another spending policy.' });
    }
    const ledger = existing || {
      keyId: effectiveKeyId,
      budgetMicro,
      spentMicro: 0,
      expiresAt: now + 15 * 60 * 1000,
      idempotencyKeys: [],
    };
    if (ledger.budgetMicro !== budgetMicro) {
      return res.status(409).json({ error: 'The job budget cannot change after the first payment step.' });
    }
    const scopedIdempotencyKey = idempotencyKey
      ? `${requestedEvaluation ? 'evaluation' : 'live'}:${String(idempotencyKey).trim()}`
      : null;
    const isIdempotentRetry = Boolean(scopedIdempotencyKey && ledger.idempotencyKeys.includes(scopedIdempotencyKey));
    if (!isIdempotentRetry) {
      if (ledger.spentMicro + priceMicro > ledger.budgetMicro) {
        return res.status(402).json({ error: `Job limit exceeded. Remaining for this job: $${Math.max(0, ledger.budgetMicro - ledger.spentMicro) / 1e6}` });
      }
      ledger.spentMicro += priceMicro;
      if (scopedIdempotencyKey) {
        ledger.idempotencyKeys.push(scopedIdempotencyKey);
        jobReservationKey = scopedIdempotencyKey;
      }
      jobReservation = ledger;
    }
    activeJobBudgets.set(normalizedJobId, ledger);
    persistJobBudgetState();
  }

  try {
    const result = await synapseEngine.settle402(
      effectiveKeyId,
      String(targetUrl).trim(),
      price,
      category,
      {
        simulateFailure: Boolean(simulateFailure),
        // The gateway is fail-closed. The legacy request flag is accepted for
        // compatibility but can no longer widen an agent's allowlist.
        allowDynamicWhitelist: false,
        corruptSignature: Boolean(corruptSignature),
        idempotencyKey: idempotencyKey ? String(idempotencyKey).trim() : undefined,
        customSig: customSig ? String(customSig).trim() : undefined,
        signerAddress: signerAddress ? String(signerAddress).trim() : undefined,
        channelId: channelId !== undefined ? Number(channelId) : undefined,
        nonce: nonce !== undefined ? Number(nonce) : undefined,
        validBefore: validBefore !== undefined ? Number(validBefore) : undefined,
        asyncRelay: Boolean(asyncRelay || req.headers['x-tempo-async-relay'] === 'true'),
        evaluationOnly: requestedEvaluation,
        jobBudgetPathUsd: normalizedJobId && Number.isFinite(numericJobBudget) && numericJobBudget > 0
          ? numericJobBudget
          : undefined,
        payee: requestedRecipient,
        asset: asset !== undefined ? String(asset) : undefined,
        realm: realm !== undefined ? String(realm) : undefined,
        onAsyncFailure: releaseJobReservation,
      }
    );
    const isUnsettled = result.status === 'VOIDED'
      || result.status === 'REJECTED'
      || result.status === 'FAILED'
      || (result.trace && (result.trace.cost === 0 || result.trace.costPathUsd === 0));
    if (isUnsettled) releaseJobReservation();
    res.json({
      status: result.status || 'FAILED',
      trace: result.trace,
      updatedKey: result.updatedKey,
      blockHeight: result.blockHeight,
    });
  } catch (error: any) {
    releaseJobReservation();
    const msg = error.message || 'Payment execution failed.';
    let statusCode = 400;
    if (msg.startsWith('401') || msg.includes('Unauthorized') || msg.includes('signature invalid')) statusCode = 401;
    else if (msg.startsWith('403') || msg.includes('Forbidden')) statusCode = 403;
    else if (msg.startsWith('404') || msg.includes('Not Found')) statusCode = 404;
    else if (msg.startsWith('429') || msg.includes('Too Many Requests') || msg.includes('Rate limit')) statusCode = 429;
    else if (msg.startsWith('400') || msg.includes('Bad Request')) statusCode = 400;
    else if (msg.includes('budget') || msg.includes('insufficient') || msg.includes('402') || msg.includes('exceeds maximum allowed per call')) statusCode = 402;
    else statusCode = 400;
    res.status(statusCode).json({ error: msg });
  }
});

// 5a. Local Mock 500 Error Endpoint (for SLA Void test — no external dependency)
app.all('/api/v1/mock-500', (req: Request, res: Response) => {
  res.status(500).json({ error: 'Internal Server Error', detail: 'Upstream service unavailable (explicit provider-failure test signal)' });
});

// 5b. Monetized Endpoints Store
app.get('/api/endpoints', (req: Request, res: Response) => {
  res.json({ endpoints: synapseEngine.getEndpoints() });
});

app.post('/api/endpoints', (req: Request, res: Response) => {
  const mutationCheck = checkKeyMutationAccess(req);
  if (!mutationCheck.allowed) {
    return res.status(mutationCheck.status).json({ error: mutationCheck.error });
  }
  const { title, endpointUrl, pricePerCallUsd, category, payee } = req.body;
  const cleanTitle = String(title || '').trim();
  const cleanEndpointUrl = String(endpointUrl || '').trim();
  const price = Number(pricePerCallUsd);
  if (!cleanTitle || !cleanEndpointUrl || pricePerCallUsd === undefined) {
    return res.status(400).json({ error: 'title, endpointUrl, and pricePerCallUsd are required.' });
  }
  if (cleanTitle.length > 160) {
    return res.status(400).json({ error: 'title must be 160 characters or fewer.' });
  }
  try {
    const parsed = new URL(cleanEndpointUrl);
    if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) throw new Error('invalid protocol');
  } catch {
    return res.status(400).json({ error: 'endpointUrl must be a valid http:// or https:// URL.' });
  }
  if (!Number.isFinite(price) || price <= 0 || price > 1000) {
    return res.status(400).json({ error: 'pricePerCallUsd must be a positive number no greater than $1,000.' });
  }
  try {
    const ep = synapseEngine.addEndpoint({
      title: cleanTitle,
      endpointUrl: cleanEndpointUrl,
      pricePerCallUsd: price,
      category: category ? String(category).trim() : 'General API',
      payee: payee ? String(payee).trim() : undefined,
    });
    res.status(201).json({ endpoint: ep });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Endpoint creation failed.' });
  }
});

// 5c. Local invoice preview shaped like SynapseMPPReceiver metadata.
// The live receiver contract does not expose a server-side merchant signer,
// so this route must stay explicit about being a local evaluation registry.
app.post('/api/mpp/invoices', (req: Request, res: Response) => {
  const { amountPathUsd, memo } = req.body;
  const amount = Number(amountPathUsd ?? 0.005);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 1000) {
    return res.status(400).json({ error: 'amountPathUsd must be a positive number no greater than $1,000.' });
  }
  const invoiceMemo = memo === undefined || memo === null || String(memo).trim() === ''
    ? 'pacs.008|merchant_invoice'
    : String(memo).trim();
  if (invoiceMemo.length > 256) {
    return res.status(400).json({ error: 'memo must be 256 characters or fewer.' });
  }
  const nowMs = Date.now();
  for (const [id, invoice] of invoiceStore.entries()) {
    if (nowMs - Date.parse(invoice.createdAt) > EVALUATION_INVOICE_TTL_MS) invoiceStore.delete(id);
  }
  if (invoiceStore.size >= MAX_EVALUATION_INVOICES) {
    return res.status(429).json({ error: 'Evaluation invoice registry is temporarily full; retry after expired previews are removed.' });
  }
  const invoiceId = '0x' + crypto.randomBytes(32).toString('hex');
  const createdAt = new Date().toISOString();
  invoiceStore.set(invoiceId, { amountPathUsd: amount, memo: invoiceMemo, createdAt, isSettled: false });
  res.status(201).json({
    status: 'CREATED',
    executionMode: 'RESILIENT_SANDBOX',
    providerDataStatus: 'EVALUATION_FIXTURE',
    invoiceId,
    receiverContract: process.env.TEMPO_RECEIVER_ADDRESS || TEMPO_RECEIVER_ADDRESS,
    amountRequiredPathUsd: amount,
    memo: invoiceMemo,
    isSettled: false,
    note: 'Local evaluation invoice only; no on-chain invoice was created.',
    timestamp: createdAt,
  });
});

app.get('/api/mpp/invoices/:id', (req: Request, res: Response) => {
  const invoice = invoiceStore.get(req.params.id);
  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found.' });
  }
  res.json({
    invoiceId: req.params.id,
    executionMode: 'RESILIENT_SANDBOX',
    providerDataStatus: 'EVALUATION_FIXTURE',
    receiverContract: process.env.TEMPO_RECEIVER_ADDRESS || TEMPO_RECEIVER_ADDRESS,
    amountRequiredPathUsd: invoice.amountPathUsd,
    isSettled: invoice.isSettled,
    settledAt: invoice.isSettled ? Date.now() : null,
    memo: invoice.memo,
    createdAt: invoice.createdAt,
    note: 'Local evaluation invoice only; settlement is not an on-chain receipt.',
  });
});

// 6. Official Model Context Protocol (MCP) JSON-RPC 2.0 Server Endpoint
// Compatible with Claude Desktop, Cursor, and Autonomous AI Agent Tool Callers
app.post('/api/mcp', (req: Request, res: Response) => {
  const evaluationFlag = req.body?.method === 'tools/call' ? req.body?.params?.arguments?.evaluationOnly : undefined;
  const isBatchOrLive = evaluationFlag === false || (typeof evaluationFlag === 'string' && evaluationFlag.trim().toLowerCase() === 'false');
  const accessCheck = checkLiveAccess(req, !isBatchOrLive);
  if (!accessCheck.allowed) {
    return res.status(accessCheck.status).json({
      jsonrpc: '2.0',
      id: req.body?.id ?? null,
      error: { code: -32000, message: accessCheck.error },
    });
  }
  return handleMcpJsonRpc(req, res);
});

app.get('/api/mcp/manifest', (req: Request, res: Response) => {
  res.json({
    schema_version: 'v1',
    name_for_model: 'synapse402_tempo_gateway',
    name_for_human: 'Synapse402 Tempo L1 MPP Gateway',
    description_for_model: 'Autonomous HTTP 402 paywall solver and multi-agent work gateway using EIP-712 scoped session keys; Tempo L1 settlement is used only when live chain access is available.',
    description_for_human: 'Connects AI models (Claude, Cursor) to paywalled APIs with explicit job maximums and a Tempo L1 receipt after the configured Treasury relayer confirms a live settlement.',
    protocol: 'Model Context Protocol (MCP) 2024-11-05',
    transport: 'HTTP JSON-RPC 2.0',
    endpoint: '/api/mcp',
    tools: SYNAPSE_MCP_TOOLS,
  });
});

// 7. Multi-Agent Swarm Execution Endpoint
app.post('/api/swarm/execute', async (req: Request, res: Response) => {
  const { leadKeyId, taskDescription, subcontractors, evaluationOnly, jobBudgetPathUsd, jobId } = req.body;
  const requestedEvaluation = evaluationOnly !== false
    && !(typeof evaluationOnly === 'string' && evaluationOnly.trim().toLowerCase() === 'false');
  const accessCheck = checkLiveAccess(req, requestedEvaluation);
  if (!accessCheck.allowed) {
    return res.status(accessCheck.status).json({ error: accessCheck.error });
  }
  try {
    const safeLeadKeyId = (leadKeyId === 'key_sec_audit' || !leadKeyId) ? 'key_quant_alpha' : leadKeyId;
    const result = await executeMcpTool('synapse_batch_swarm_settle', {
      leadAgentKeyId: safeLeadKeyId,
      taskDescription,
      subcontractors,
      evaluationOnly: requestedEvaluation,
      jobBudgetPathUsd: Number(jobBudgetPathUsd),
      jobId: typeof jobId === 'string' ? jobId : undefined,
    });
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Swarm execution failed' });
  }
});

// 8. Pay-per-Streamed-Token (SSE) Endpoint
// Off-chain token counting ($0.00002/token) with one final settlement record on Tempo L1 upon completion/abort
app.get('/api/stream/inference', handleStreamInference);
app.post('/api/stream/inference', handleStreamInference);

// 10. Rate-Limiting via Price (Dynamic 402 Surge Pricing for Bot Defense)
app.get(
  '/api/v1/surge-demo',
  localMpp({
    priceUsd: 0.001,
    payee: process.env.TEMPO_RECEIVER_ADDRESS || TEMPO_RECEIVER_ADDRESS,
    surgePricing: {
      windowMs: 4000,
      maxBeforeSurge: 2,
      multiplier: 2.5,
    },
  }),
  (req: Request, res: Response) => {
    res.setHeader('X-Tempo-MPP-Access', 'authorized');
    res.json({
      status: 'ok',
      unlocked: true,
      service: 'Surge Protection Endpoint',
      signer: localPayee,
      effectivePrice: (req as any).tempoMpp?.amountPathUsd ?? 0.001,
      surgeActive: (req as any).tempoMpp?.surgeActive ?? false,
      payload: {
        message: 'High-frequency burst accommodated under dynamic surge pricing.',
        timestamp: Date.now(),
      },
    });
  }
);

// ==========================================
// Free SOL/USDT input for the flagship mission. A public market feed is queried directly;
// if its public API is unavailable, the response says so and returns a small
// deterministic sample instead of pretending the fallback is live data.
// ==========================================
app.get('/api/v1/market/bybit-solusdt', async (_req: Request, res: Response) => {
  const fallback = {
    source: 'Public market data',
    dataStatus: 'SAMPLE_FALLBACK',
    symbol: 'SOLUSDT',
    interval: 'W',
    candles: [
      { time: Date.now() - 4 * 7 * 24 * 60 * 60 * 1000, open: 139.40, high: 145.80, low: 136.20, close: 142.10, volume: 1842000 },
      { time: Date.now() - 3 * 7 * 24 * 60 * 60 * 1000, open: 142.10, high: 151.20, low: 140.00, close: 148.40, volume: 2011000 },
      { time: Date.now() - 2 * 7 * 24 * 60 * 60 * 1000, open: 148.40, high: 157.00, low: 145.60, close: 153.70, volume: 2148000 },
      { time: Date.now() - 1 * 7 * 24 * 60 * 60 * 1000, open: 153.70, high: 155.10, low: 146.90, close: 149.90, volume: 1985000 },
      { time: Date.now(), open: 149.90, high: 161.40, low: 147.80, close: 158.20, volume: 2360000 },
    ],
    note: 'Public market response was unavailable; this is an evaluation sample.',
  };
  try {
    const upstream = await fetch('https://api.bybit.com/v5/market/kline?category=linear&symbol=SOLUSDT&interval=W&limit=200', {
      signal: AbortSignal.timeout(5000),
      headers: {
        Accept: 'application/json',
        // Bybit can reject anonymous runtime fetches even though the public
        // endpoint does not require credentials.
        'User-Agent': 'Synapse402/1.0 market-data adapter',
      },
    });
    if (!upstream.ok) throw new Error(`Public market feed HTTP ${upstream.status}`);
    const body: any = await upstream.json();
    const rows = Array.isArray(body?.result?.list) ? body.result.list : [];
    const candles = rows
      .map((row: any[]) => ({
        time: Number(row?.[0] || 0),
        open: Number(row?.[1] || 0),
        high: Number(row?.[2] || 0),
        low: Number(row?.[3] || 0),
        close: Number(row?.[4] || 0),
        volume: Number(row?.[5] || 0),
      }))
      .filter((row: any) => Number.isFinite(row.close) && row.close > 0)
      .reverse();
    if (candles.length < 10) throw new Error('Public market feed returned too few weekly candles');
    return res.json({
      source: 'Public market data',
      dataStatus: 'LIVE_PUBLIC_MARKET_DATA',
      symbol: 'SOLUSDT',
      interval: 'W',
      candles,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.json({ ...fallback, fetchedAt: new Date().toISOString(), fallbackReason: error?.message || 'Public market request failed' });
  }
});

// ==========================================
// 11. Local HTTP 402 demo services. Their payment path is real when Tempo
// confirms it; their business payloads are explicit sample provider responses.
// ==========================================
const localPayee = process.env.TEMPO_RECEIVER_ADDRESS || TEMPO_RECEIVER_ADDRESS;

// Service 1: AI Market Analysis ($0.0008)
app.all(
  '/api/v1/data/ai-market-analysis',
  localMpp({ priceUsd: 0.0008, payee: localPayee }),
  (req: Request, res: Response) => {
    res.setHeader('X-Tempo-MPP-Access', 'authorized');
    res.json({
      status: 'ok',
      service: 'AI Market Sentiment & Liquidity Analysis',
      model: 'MarketLogic-LLM-v1',
      costUsd: 0.0008,
      analysis: 'Bullish liquidity momentum across Tempo L1 DEX pools. 24h arbitrage spread narrowed by 14 bps. Optimal slippage under 4 bps.',
      confidence: 0.94,
      timestamp: Date.now(),
    });
  }
);

// Service 2: Evaluation market snapshot fixture ($0.0010)
app.all(
  '/api/v1/data/stock-orderbook',
  localMpp({ priceUsd: 0.0010, payee: localPayee }),
  (req: Request, res: Response) => {
    res.setHeader('X-Tempo-MPP-Access', 'authorized');
    const basePrice = 175.40;
    res.json({
      status: 'ok',
      service: 'Example AAPL/USD Orderbook L2 Snapshot',
      costUsd: 0.0010,
      symbol: 'AAPL/USD',
      bids: [
        [(basePrice - 0.02).toFixed(2), "450"],
        [(basePrice - 0.05).toFixed(2), "1200"],
        [(basePrice - 0.10).toFixed(2), "3400"]
      ],
      asks: [
        [(basePrice + 0.02).toFixed(2), "320"],
        [(basePrice + 0.05).toFixed(2), "980"],
        [(basePrice + 0.10).toFixed(2), "2800"]
      ],
      timestamp: Date.now(),
    });
  }
);

// Service 2B: Amberdata SOL/USDT L2 Market Depth Fixture ($0.0010)
app.all(
  ['/api/v1/market/sol-orderbook', '/api/v1/market/sol-depth', '/api/v1/data/sol-orderbook'],
  localMpp({ priceUsd: 0.0010, payee: localPayee }),
  (req: Request, res: Response) => {
    res.setHeader('X-Tempo-MPP-Access', 'authorized');
    const basePrice = 148.50;
    res.json({
      status: 'ok',
      service: 'Amberdata SOL/USDT L2 Market Depth Snapshot',
      costUsd: 0.0010,
      symbol: 'SOL/USDT',
      bids: [
        [(basePrice - 0.15).toFixed(2), "1420.5"],
        [(basePrice - 0.45).toFixed(2), "3850.0"],
        [(basePrice - 1.10).toFixed(2), "8920.0"]
      ],
      asks: [
        [(basePrice + 0.15).toFixed(2), "1190.2"],
        [(basePrice + 0.45).toFixed(2), "2940.0"],
        [(basePrice + 1.10).toFixed(2), "7650.0"]
      ],
      spreadBps: 2.1,
      liquidityScore: 94.8,
      source: 'Amberdata Demo Integration',
      providerDataStatus: 'EVALUATION_FIXTURE',
      timestamp: Date.now(),
    });
  }
);

// Service 3: Python Risk Sandbox ($0.0050)
app.all(
  '/api/v1/data/python-sandbox',
  localMpp({ priceUsd: 0.0050, payee: localPayee }),
  (req: Request, res: Response) => {
    res.setHeader('X-Tempo-MPP-Access', 'authorized');
    res.json({
      status: 'ok',
      service: 'Python 3.12 Isolated Micro-Sandbox',
      costUsd: 0.0050,
      exitCode: 0,
      executionTimeMs: 12,
      computationResult: {
        portfolioVaR_99: 0.0142,
        sharpeRatio: 2.84,
        maxDrawdown: 0.031,
        status: 'CONVERGED'
      },
      timestamp: Date.now(),
    });
  }
);

// Service 4: Paywalled Financial Article & Scraper Access ($0.0010)
app.all(
  '/api/v1/data/unlocked-article',
  localMpp({ priceUsd: 0.0010, payee: localPayee }),
  (req: Request, res: Response) => {
    res.setHeader('X-Tempo-MPP-Access', 'authorized');
    res.json({
      status: 'ok',
      service: 'Web Publisher HTTP 402 Paywall Solver',
      costUsd: 0.0010,
      headline: 'Global Autonomous Machine Economy Transition 2026',
      publication: 'Decentralized Finance Daily (Article #4029)',
      accessMode: 'HTTP 402 Stateless Micropayment Handshake (RFC 9110)',
      markdownBody: '# Autonomous Machine Economy\n\nAI agents now settle micro-services per call on Tempo L1 with zero human intervention and zero credit card subscriptions.',
      timestamp: Date.now(),
    });
  }
);

// Service 5: Test Provider Data (Vision / Media Cutout - $0.0005)
app.all(
  '/api/v1/test-provider-data',
  localMpp({ priceUsd: 0.0005, payee: localPayee }),
  (req: Request, res: Response) => {
    res.setHeader('X-Tempo-MPP-Access', 'authorized');
    res.json({
      status: 'ok',
      service: 'Neural Vision Processing Pipeline',
      costUsd: 0.0005,
      deliverable: 'PNG transparent cutout response shape (evaluation)',
      format: 'image/png',
      timestamp: Date.now(),
    });
  }
);

// ==========================================
// Dedicated Due Diligence Provider Endpoints (Apex Foundry Ltd)
// ==========================================
app.all(
  '/api/v1/due-diligence/corporate-registry',
  localMpp({ priceUsd: 0.0020, payee: localPayee }),
  (req: Request, res: Response) => {
    res.setHeader('X-Tempo-MPP-Access', 'authorized');
    res.json({
      status: 'ok',
      service: 'Delaware Division of Corporations API',
      entity: 'Apex Foundry Ltd',
      fileNumber: '7841920',
      standing: 'Good Standing (Q3 2026)',
      costUsd: 0.0020,
      timestamp: Date.now(),
    });
  }
);

app.all(
  '/api/v1/due-diligence/sec-filings',
  localMpp({ priceUsd: 0.0020, payee: localPayee }),
  (req: Request, res: Response) => {
    res.setHeader('X-Tempo-MPP-Access', 'authorized');
    res.json({
      status: 'ok',
      service: 'SEC EDGAR Intelligence API',
      entity: 'Apex Foundry Ltd',
      filing: 'Form 10-K (FY2025)',
      auditOpinion: 'Clean Unqualified (Big 4)',
      operatingCashFlowUsd: 12400000,
      costUsd: 0.0020,
      timestamp: Date.now(),
    });
  }
);

app.all(
  '/api/v1/due-diligence/beneficial-ownership',
  localMpp({ priceUsd: 0.0015, payee: localPayee }),
  (req: Request, res: Response) => {
    res.setHeader('X-Tempo-MPP-Access', 'authorized');
    res.json({
      status: 'ok',
      service: 'Global Beneficial Ownership Registry',
      entity: 'Apex Foundry Ltd',
      ownershipGraph: 'Founders 68%, Institutional Funds 32%',
      shellIntermediaries: 0,
      costUsd: 0.0015,
      timestamp: Date.now(),
    });
  }
);

app.all(
  '/api/v1/due-diligence/credit-rating',
  localMpp({ priceUsd: 0.0015, payee: localPayee }),
  (req: Request, res: Response) => {
    res.setHeader('X-Tempo-MPP-Access', 'authorized');
    res.json({
      status: 'ok',
      service: 'Commercial Credit Bureau API',
      entity: 'Apex Foundry Ltd',
      creditScore: 'Sample score 88/100 (A-) — verify with the upstream bureau',
      dpo: '34 Days',
      defaults: 0,
      costUsd: 0.0015,
      timestamp: Date.now(),
    });
  }
);

app.all(
  '/api/v1/due-diligence/court-dockets',
  localMpp({ priceUsd: 0.0015, payee: localPayee }),
  (req: Request, res: Response) => {
    res.setHeader('X-Tempo-MPP-Access', 'authorized');
    res.json({
      status: 'ok',
      service: 'PACER Federal & State Court Dockets API',
      entity: 'Apex Foundry Ltd',
      activeLawsuits: 0,
      taxLiens: 0,
      clearanceStatus: 'UNVERIFIED',
      costUsd: 0.0015,
      timestamp: Date.now(),
    });
  }
);

app.all(
  '/api/v1/due-diligence/sanctions-check',
  localMpp({ priceUsd: 0.0020, payee: localPayee }),
  (req: Request, res: Response) => {
    res.setHeader('X-Tempo-MPP-Access', 'authorized');
    res.json({
      status: 'ok',
      service: 'OFAC / EU / UN Watchlist Screener API',
      entity: 'Apex Foundry Ltd',
      watchlistHits: 0,
      amlRiskScore: 0.01,
      complianceStatus: 'APPROVED',
      costUsd: 0.0020,
      timestamp: Date.now(),
    });
  }
);

app.all(
  '/api/v1/due-diligence/adverse-media',
  localMpp({ priceUsd: 0.0015, payee: localPayee }),
  (req: Request, res: Response) => {
    res.setHeader('X-Tempo-MPP-Access', 'authorized');
    res.json({
      status: 'ok',
      service: 'PEP & Global Adverse Media Screener',
      entity: 'Apex Foundry Ltd',
      pepHits: 0,
      negativeNewsFlags: 0,
      costUsd: 0.0015,
      timestamp: Date.now(),
    });
  }
);

app.all(
  '/api/v1/due-diligence/solvency-simulation',
  localMpp({ priceUsd: 0.0040, payee: localPayee }),
  (req: Request, res: Response) => {
    res.setHeader('X-Tempo-MPP-Access', 'authorized');
    res.json({
      status: 'ok',
      service: 'Python 3.12 Monte Carlo Solvency Sandbox',
      entity: 'Apex Foundry Ltd',
      iterations: 10000,
      altmanZScore: 4.12,
      bankruptcyRisk1Yr: '0.04%',
      costUsd: 0.0040,
      timestamp: Date.now(),
    });
  }
);

app.all(
  '/api/v1/due-diligence/clearance-dossier',
  localMpp({ priceUsd: 0.0010, payee: localPayee }),
  (req: Request, res: Response) => {
    res.setHeader('X-Tempo-MPP-Access', 'authorized');
    res.json({
      status: 'ok',
      service: 'Executive Clearance Dossier & Board Memo Service',
      entity: 'Apex Foundry Ltd',
      recommendation: 'EXECUTE_CONTRACT',
      safetyScore: 94,
      costUsd: 0.0010,
      timestamp: Date.now(),
    });
  }
);

// ==========================================
// Vite Middleware / SPA Fallback
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      root: path.resolve(process.cwd()),
      configLoader: 'runner',
      server: {
        middlewareMode: true,
        watch: {
          ignored: ['**/server/synapseState.json', '**/synapseState.json', '**/server/**', '**/*.json'],
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // The production server runs through tsx so `__dirname` is not available
    // in this native ESM entrypoint. Keep static asset resolution anchored to
    // the package working directory used by `npm start`.
    const distPath = path.resolve(process.cwd(), 'dist');
    if (!fs.existsSync(path.join(distPath, 'index.html'))) {
      throw new Error(`Production assets were not found at ${distPath}; run the production build first.`);
    }

    app.use(express.static(distPath, {
      maxAge: '1d',
      etag: true,
      setHeaders: (res, filePath) => {
        // The HTML entrypoint references hashed chunks. It must revalidate on
        // every visit after deployment, or a cached index can request chunks
        // that the new release has already replaced.
        if (path.basename(filePath).toLowerCase() === 'index.html') {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
      },
    }));
    app.get('*', (req: Request, res: Response) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Synapse402 Gateway] Express server listening on http://0.0.0.0:${PORT}`);
  });

  const handleShutdown = (signal: string) => {
    console.log(`[Synapse402 Gateway] Received ${signal}, flushing state and exiting gracefully...`);
    synapseEngine.persistState();
    server.close(() => {
      console.log('[Synapse402 Gateway] Process cleanly exited.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
}

process.on('uncaughtException', (err) => {
  console.error('[Synapse402 Server] Intercepted uncaught exception:', err?.message || err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Synapse402 Server] Intercepted unhandled rejection:', reason);
});

// The defense suite imports this exact Express app and mounts it on an
// ephemeral port, so it exercises the production route handlers instead of a
// copied test-only implementation.
if (process.env.SYNAPSE_SKIP_SERVER_START !== 'true') {
  startServer();
}
