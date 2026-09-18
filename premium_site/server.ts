import * as dotenv from 'dotenv';
dotenv.config({ quiet: true } as any);

import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { synapseEngine } from './server/synapseCore';
import { handleMcpJsonRpc, SYNAPSE_MCP_TOOLS, executeMcpTool } from './server/mcpServer';
import { handleStreamInference } from './server/streamServer';
import { withTempoMpp } from './src/sdk';

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const invoiceStore = new Map<string, { amountPathUsd: number; memo: string; createdAt: string; isSettled: boolean }>();

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Idempotency-Key, X-Tempo-MPP-Signature, X-Tempo-Nonce-2D, X-Tempo-Cost-PathUSD, X-Admin-Key');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: '2mb' }));

// ==========================================
// REST API Routes
// ==========================================

// 1. Network & Health
app.get('/api/health', (req: Request, res: Response) => {
  const metrics = synapseEngine.getMetrics();
  res.json({
    status: 'ok',
    network: 'Tempo Moderato Testnet',
    chainId: 42431,
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
  const { amount } = req.body;
  const depositNum = Number(amount);
  if (amount === undefined || !Number.isFinite(depositNum) || depositNum <= 0) {
    return res.status(400).json({ error: 'Valid positive deposit amount is required.' });
  }
  if (depositNum > 1000) {
    return res.status(400).json({ error: 'Deposit amount exceeds maximum demo limit ($1,000 pathUSD).' });
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
  const { agentName, role, maxPerCallPathUsd, totalBudgetPathUsd, whitelistedDomains } = req.body;

  if (!agentName || maxPerCallPathUsd === undefined || totalBudgetPathUsd === undefined) {
    return res.status(400).json({ error: 'Missing required parameters (agentName, maxPerCallPathUsd, totalBudgetPathUsd).' });
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
    ? whitelistedDomains
    : String(whitelistedDomains || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

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

app.patch('/api/keys/:id/toggle', (req: Request, res: Response) => {
  const updatedKey = synapseEngine.toggleKeyStatus(req.params.id);
  if (!updatedKey) {
    return res.status(404).json({ error: 'Key not found.' });
  }
  res.json({ key: updatedKey });
});

const requireAdminAuth = (req: Request, res: Response, next: any) => {
  const adminKey = process.env.ADMIN_KEY || process.env.SYNAPSE_ADMIN_KEY;
  if (!adminKey) {
    return res.status(503).json({ error: 'Administrative controls are disabled until ADMIN_KEY is configured.' });
  }
  const provided = (req.headers['x-admin-key'] as string) || (req.headers['authorization']?.startsWith('Bearer ') ? req.headers['authorization'].slice(7) : undefined);
  if (!provided || provided !== adminKey) {
    return res.status(401).json({ error: '401 Unauthorized: Invalid or missing X-Admin-Key.' });
  }
  next();
};

app.delete('/api/keys/:id', requireAdminAuth, (req: Request, res: Response) => {
  const removed = synapseEngine.removeKey(req.params.id);
  if (!removed) {
    return res.status(404).json({ error: 'Key not found.' });
  }
  res.json({ success: true, removedId: req.params.id });
});

app.post('/api/mpp/reset', requireAdminAuth, (req: Request, res: Response) => {
  const { keyId } = req.body || {};
  const result = synapseEngine.resetDemoState(keyId ? String(keyId) : undefined);
  res.json(result);
});

// 4. Live Type 0x76 Traces
app.get('/api/mpp/traces', (req: Request, res: Response) => {
  res.json({ traces: synapseEngine.getTraces() });
});

// 4b. Prepare EIP-712 MPP Authorization (For Connected MetaMask Judges & Agents)
app.post('/api/mpp/prepare', async (req: Request, res: Response) => {
  const { keyId, targetUrl, pricePathUsd, signerAddress, channelId } = req.body;
  if (!targetUrl || pricePathUsd === undefined) {
    return res.status(400).json({ error: 'targetUrl and pricePathUsd are required.' });
  }
  try {
    const prepared = await synapseEngine.prepareAuthorization({
      keyId: keyId ? String(keyId).trim() : undefined,
      signerAddress: signerAddress ? String(signerAddress).trim() : undefined,
      targetUrl: String(targetUrl).trim(),
      pricePathUsd: Number(pricePathUsd),
      channelId: channelId !== undefined ? Number(channelId) : undefined,
    });
    res.json(prepared);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to prepare EIP-712 authorization.' });
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
  } = req.body;

  if (!targetUrl || pricePathUsd === undefined) {
    return res.status(400).json({ error: 'targetUrl and pricePathUsd are required.' });
  }

  const effectiveKeyId = keyId !== undefined ? String(keyId).trim() : (synapseEngine.getKeys()[0]?.id || 'key_quant_alpha');

  const price = Number(pricePathUsd);
  if (!Number.isFinite(price) || price <= 0) {
    return res.status(400).json({ error: 'pricePathUsd must be a positive finite number.' });
  }

  const idempotencyKey = (req.headers['idempotency-key'] as string) || req.body.idempotencyKey;

  try {
    const result = await synapseEngine.settle402(
      effectiveKeyId,
      String(targetUrl).trim(),
      price,
      category,
      {
        simulateFailure: Boolean(simulateFailure),
        allowDynamicWhitelist: Boolean(allowDynamicWhitelist),
        corruptSignature: Boolean(corruptSignature),
        idempotencyKey: idempotencyKey ? String(idempotencyKey).trim() : undefined,
        customSig: customSig ? String(customSig).trim() : undefined,
        signerAddress: signerAddress ? String(signerAddress).trim() : undefined,
        channelId: channelId !== undefined ? Number(channelId) : undefined,
        nonce: nonce !== undefined ? Number(nonce) : undefined,
        validBefore: validBefore !== undefined ? Number(validBefore) : undefined,
        asyncRelay: Boolean(asyncRelay || req.headers['x-tempo-async-relay'] === 'true'),
      }
    );
    res.json({
      status: result.status || 'SETTLED',
      trace: result.trace,
      updatedKey: result.updatedKey,
      blockHeight: result.blockHeight,
    });
  } catch (error: any) {
    const msg = error.message || 'Payment execution failed.';
    let statusCode = 400;
    if (msg.startsWith('401') || msg.includes('Unauthorized') || msg.includes('signature invalid')) statusCode = 401;
    else if (msg.startsWith('403') || msg.includes('Forbidden')) statusCode = 403;
    else if (msg.startsWith('404') || msg.includes('Not Found')) statusCode = 404;
    else if (msg.startsWith('429') || msg.includes('Too Many Requests') || msg.includes('Rate limit')) statusCode = 429;
    else if (msg.startsWith('400') || msg.includes('Bad Request')) statusCode = 400;
    else if (msg.includes('budget') || msg.includes('insufficient') || msg.includes('402')) statusCode = 402;
    else statusCode = 400;
    res.status(statusCode).json({ error: msg });
  }
});

// 5a. Local Mock 500 Error Endpoint (for SLA Void test — no external dependency)
app.all('/api/v1/mock-500', (req: Request, res: Response) => {
  res.status(500).json({ error: 'Internal Server Error', detail: 'Upstream service unavailable (simulated SLA failure)' });
});

// 5b. Monetized Endpoints Store
app.get('/api/endpoints', (req: Request, res: Response) => {
  res.json({ endpoints: synapseEngine.getEndpoints() });
});

app.post('/api/endpoints', (req: Request, res: Response) => {
  const { title, endpointUrl, pricePerCallUsd, category } = req.body;
  if (!title || !endpointUrl || pricePerCallUsd === undefined) {
    return res.status(400).json({ error: 'title, endpointUrl, and pricePerCallUsd are required.' });
  }
  const ep = synapseEngine.addEndpoint({
    title: String(title).trim(),
    endpointUrl: String(endpointUrl).trim(),
    pricePerCallUsd: Number(pricePerCallUsd),
    category: category ? String(category).trim() : 'General API',
  });
  res.status(201).json({ endpoint: ep });
});

// 5c. SynapseMPPReceiver On-Chain Merchant Invoicing
app.post('/api/mpp/invoices', (req: Request, res: Response) => {
  const { amountPathUsd, memo } = req.body;
  const invoiceId = '0x' + crypto.randomBytes(32).toString('hex');
  const amount = Number(amountPathUsd || 0.005);
  const invoiceMemo = memo || 'pacs.008|merchant_invoice';
  const createdAt = new Date().toISOString();
  invoiceStore.set(invoiceId, { amountPathUsd: amount, memo: invoiceMemo, createdAt, isSettled: false });
  res.json({
    status: 'CREATED',
    invoiceId,
    receiverContract: process.env.TEMPO_RECEIVER_ADDRESS || '0xfCEb1a2633881c19283836a2E17Ba25E612724A0',
    amountRequiredPathUsd: amount,
    memo: invoiceMemo,
    isSettled: false,
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
    receiverContract: process.env.TEMPO_RECEIVER_ADDRESS || '0xfCEb1a2633881c19283836a2E17Ba25E612724A0',
    amountRequiredPathUsd: invoice.amountPathUsd,
    isSettled: invoice.isSettled,
    settledAt: invoice.isSettled ? Date.now() : null,
    memo: invoice.memo,
    createdAt: invoice.createdAt,
  });
});

// 6. Official Model Context Protocol (MCP) JSON-RPC 2.0 Server Endpoint
// Compatible with Claude Desktop, Cursor, and Autonomous AI Agent Tool Callers
app.post('/api/mcp', handleMcpJsonRpc);

app.get('/api/mcp/manifest', (req: Request, res: Response) => {
  res.json({
    schema_version: 'v1',
    name_for_model: 'synapse402_tempo_gateway',
    name_for_human: 'Synapse402 Tempo L1 MPP Gateway',
    description_for_model: 'Autonomous HTTP 402 paywall solver and multi-agent swarm settlement engine on Tempo L1 using EIP-712 scoped session keys.',
    description_for_human: 'Connects AI models (Claude, Cursor) to paywalled APIs via Tempo L1 native micropayments.',
    protocol: 'Model Context Protocol (MCP) 2024-11-05',
    transport: 'HTTP JSON-RPC 2.0',
    endpoint: '/api/mcp',
    tools: SYNAPSE_MCP_TOOLS,
  });
});

// 7. Multi-Agent Swarm Execution Endpoint
app.post('/api/swarm/execute', async (req: Request, res: Response) => {
  const { leadKeyId, taskDescription, subcontractors } = req.body;
  try {
    const result = await executeMcpTool('synapse_batch_swarm_settle', {
      leadAgentKeyId: leadKeyId,
      taskDescription,
      subcontractors,
    });
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Swarm execution failed' });
  }
});

// 8. Pay-per-Streamed-Token (SSE) Endpoint
// Off-chain token counting ($0.00002/token) with atomic batch settlement on Tempo L1 upon completion/abort
app.get('/api/stream/inference', handleStreamInference);
app.post('/api/stream/inference', handleStreamInference);

// 9. Live Test Provider Route Protected by withTempoMpp Middleware
app.get(
  '/api/v1/test-provider-data',
  withTempoMpp({
    priceUsd: 0.002,
    payee: process.env.TEMPO_RECEIVER_ADDRESS || '0xfCEb1a2633881c19283836a2E17Ba25E612724A0',
  }),
  (req: Request, res: Response) => {
    res.setHeader('X-Tempo-Settled', '0x76');
    res.json({
      status: 'ok',
      unlocked: true,
      service: 'DeepQuant Orderbook L2 Depth',
      signer: process.env.TEMPO_RECEIVER_ADDRESS || '0xfCEb1a2633881c19283836a2E17Ba25E612724A0',
      microCreditUsd: 0.002,
      asset: 'pathUSD',
      payload: {
        symbol: 'TEMPO/USD',
        bid: 42.50,
        ask: 42.52,
        depth: 154200,
        timestamp: Date.now(),
      },
    });
  }
);

// 10. Rate-Limiting via Price (Dynamic 402 Surge Pricing for Bot Defense)
app.get(
  '/api/v1/surge-demo',
  withTempoMpp({
    priceUsd: 0.001,
    payee: process.env.TEMPO_RECEIVER_ADDRESS || '0xfCEb1a2633881c19283836a2E17Ba25E612724A0',
    surgePricing: {
      windowMs: 4000,
      maxBeforeSurge: 2,
      multiplier: 2.5,
    },
  }),
  (req: Request, res: Response) => {
    res.setHeader('X-Tempo-Settled', '0x76');
    res.json({
      status: 'ok',
      unlocked: true,
      service: 'Surge Protection Endpoint',
      signer: '0x71C839a9E841D8B4e21a8904cB2e3Ac992cE25a9',
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
// 11. Real HTTP 402 Paywalled Services (No external mocks)
// ==========================================
const localPayee = process.env.TEMPO_RECEIVER_ADDRESS || '0xfCEb1a2633881c19283836a2E17Ba25E612724A0';

// Service 1: AI Market Analysis ($0.0008)
app.all(
  '/api/v1/data/ai-market-analysis',
  withTempoMpp({ priceUsd: 0.0008, payee: localPayee }),
  (req: Request, res: Response) => {
    res.setHeader('X-Tempo-Settled', '0x76');
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

// Service 2: Live Stock & Forex Orderbook ($0.0010)
app.all(
  '/api/v1/data/stock-orderbook',
  withTempoMpp({ priceUsd: 0.0010, payee: localPayee }),
  (req: Request, res: Response) => {
    res.setHeader('X-Tempo-Settled', '0x76');
    const basePrice = 175.40;
    res.json({
      status: 'ok',
      service: 'High-Frequency AAPL/USD Orderbook L2 Depth',
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

// Service 3: Python Risk Sandbox ($0.0050)
app.all(
  '/api/v1/data/python-sandbox',
  withTempoMpp({ priceUsd: 0.0050, payee: localPayee }),
  (req: Request, res: Response) => {
    res.setHeader('X-Tempo-Settled', '0x76');
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
  withTempoMpp({ priceUsd: 0.0010, payee: localPayee }),
  (req: Request, res: Response) => {
    res.setHeader('X-Tempo-Settled', '0x76');
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
  withTempoMpp({ priceUsd: 0.0005, payee: localPayee }),
  (req: Request, res: Response) => {
    res.setHeader('X-Tempo-Settled', '0x76');
    res.json({
      status: 'ok',
      service: 'Neural Vision Processing Pipeline',
      costUsd: 0.0005,
      deliverable: 'PNG Transparent Cutout (200 OK)',
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
  withTempoMpp({ priceUsd: 0.0020, payee: localPayee }),
  (req: Request, res: Response) => {
    res.setHeader('X-Tempo-Settled', '0x76');
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
  withTempoMpp({ priceUsd: 0.0020, payee: localPayee }),
  (req: Request, res: Response) => {
    res.setHeader('X-Tempo-Settled', '0x76');
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
  withTempoMpp({ priceUsd: 0.0015, payee: localPayee }),
  (req: Request, res: Response) => {
    res.setHeader('X-Tempo-Settled', '0x76');
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
  withTempoMpp({ priceUsd: 0.0015, payee: localPayee }),
  (req: Request, res: Response) => {
    res.setHeader('X-Tempo-Settled', '0x76');
    res.json({
      status: 'ok',
      service: 'Commercial Credit Bureau API',
      entity: 'Apex Foundry Ltd',
      creditScore: '88/100 (Investment Grade A-)',
      dpo: '34 Days',
      defaults: 0,
      costUsd: 0.0015,
      timestamp: Date.now(),
    });
  }
);

app.all(
  '/api/v1/due-diligence/court-dockets',
  withTempoMpp({ priceUsd: 0.0015, payee: localPayee }),
  (req: Request, res: Response) => {
    res.setHeader('X-Tempo-Settled', '0x76');
    res.json({
      status: 'ok',
      service: 'PACER Federal & State Court Dockets API',
      entity: 'Apex Foundry Ltd',
      activeLawsuits: 0,
      taxLiens: 0,
      clearanceStatus: 'CLEARED',
      costUsd: 0.0015,
      timestamp: Date.now(),
    });
  }
);

app.all(
  '/api/v1/due-diligence/sanctions-check',
  withTempoMpp({ priceUsd: 0.0020, payee: localPayee }),
  (req: Request, res: Response) => {
    res.setHeader('X-Tempo-Settled', '0x76');
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
  withTempoMpp({ priceUsd: 0.0015, payee: localPayee }),
  (req: Request, res: Response) => {
    res.setHeader('X-Tempo-Settled', '0x76');
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
  withTempoMpp({ priceUsd: 0.0040, payee: localPayee }),
  (req: Request, res: Response) => {
    res.setHeader('X-Tempo-Settled', '0x76');
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
  withTempoMpp({ priceUsd: 0.0010, payee: localPayee }),
  (req: Request, res: Response) => {
    res.setHeader('X-Tempo-Settled', '0x76');
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

// Service 6: Upstream Fault Simulation Endpoint (HTTP 500 for SLA Void/Refund verification)
app.all('/api/v1/mock-500', (_req: Request, res: Response) => {
  res.status(500).json({ error: 'Internal Server Error (Simulated Fault Injection for SLA Verification)' });
});

// ==========================================
// Vite Middleware / SPA Fallback
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
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
    const distPath = fs.existsSync(path.join(__dirname, 'index.html'))
      ? __dirname
      : (fs.existsSync(path.join(process.cwd(), 'dist', 'index.html'))
          ? path.join(process.cwd(), 'dist')
          : path.join(__dirname, '..', 'dist'));

    app.use(express.static(distPath, {
      maxAge: '1d',
      etag: true,
    }));
    app.get('*', (req: Request, res: Response) => {
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

startServer();
