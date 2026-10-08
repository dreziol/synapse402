// Ensure stdout is strictly reserved for JSON-RPC 2.0 when invoked in Stdio mode (Claude Desktop / Cursor)
if (typeof process !== 'undefined' && process.argv && process.argv.some(a => a.includes('mcpServer') || a === '--stdio')) {
  console.log = (...args: any[]) => {
    process.stderr.write(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n');
  };
}

import { Request, Response } from 'express';
import { synapseEngine, sha256, isSafeProviderUrl, safeProviderFetch } from './synapseCore';

// Keep a short-lived copy of the completed provider response so an MCP
// caller retrying the same idempotency key does not replay a single-use
// provider credential and receive a misleading second 402.
const MCP_RESULT_REPLAY_TTL_MS = 15 * 60 * 1000;
const mcpResultReplayCache = new Map<string, { expiresAt: number; result: any }>();
const MAX_PROVIDER_RESPONSE_BYTES = 1_000_000;

async function readProviderText(response: globalThis.Response, maxBytes = MAX_PROVIDER_RESPONSE_BYTES): Promise<string> {
  const declaredLength = Number(response.headers.get('content-length') || 0);
  if (declaredLength > maxBytes) {
    try { await response.body?.cancel(); } catch { /* best effort */ }
    return `[provider response truncated at ${maxBytes} bytes]`;
  }
  if (!response.body?.getReader) {
    return (await response.text()).slice(0, maxBytes);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (!value) continue;
      const remaining = maxBytes - total;
      if (remaining <= 0) {
        await reader.cancel();
        return `${decoder.decode(Buffer.concat(chunks as any), { stream: false })}\n[provider response truncated]`;
      }
      const chunk = value.byteLength > remaining ? value.slice(0, remaining) : value;
      chunks.push(chunk);
      total += chunk.byteLength;
      if (value.byteLength > remaining) {
        await reader.cancel();
        break;
      }
    }
  } finally {
    reader.releaseLock();
  }
  return decoder.decode(Buffer.concat(chunks as any), { stream: false })
    + (total >= maxBytes ? '\n[provider response truncated]' : '');
}

// JSON-RPC clients sometimes serialize booleans as strings. Treat only an
// explicit true value as evaluation mode so malformed or omitted flags cannot
// silently widen a demo call into a live payment.
const parseEvaluationFlag = (value: unknown): boolean => {
  // Evaluation is the safe default. Live settlement is an explicit opt-in,
  // and the HTTP route separately authorizes that opt-in before this tool runs.
  if (value === false) return false;
  if (typeof value === 'string' && value.trim().toLowerCase() === 'false') return false;
  return true;
};

// =======================================================================
// Model Context Protocol (MCP) JSON-RPC 2.0 Server Specification
// Official Anthropic & Open Source Agent Tool Standard for Tempo L1 MPP
// =======================================================================

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export const SYNAPSE_MCP_TOOLS: McpToolDefinition[] = [
  {
    name: 'synapse_call_paid_api',
    description: 'Autonomous HTTP 402 paywall solver. Checks the budget and approved endpoint, then settles on Tempo L1 only when live chain access is available; otherwise returns an explicit evaluation trace.',
    inputSchema: {
      type: 'object',
      properties: {
        keyId: {
          type: 'string',
          description: 'Exact session key ID (e.g. key_000001) used for this payment.',
        },
        targetUrl: {
          type: 'string',
          description: 'The approved endpoint URL to query (for example the local evaluation snapshot /api/v1/data/stock-orderbook or a separately configured external provider).',
        },
        maxBudgetPathUsd: {
          type: 'number',
          description: 'Maximum authorized cost in pathUSD for this call.',
        },
        proofOfExecutionRequired: {
          type: 'boolean',
          description: 'If true, require a successful provider retry and record its response digest; the 402 settlement itself happens before that retry.',
        },
        evaluationOnly: {
          type: 'boolean',
          description: 'When true, run the plan without sending a live chain transaction or changing live balances.',
        },
        jobBudgetPathUsd: {
          type: 'number',
          description: 'Maximum total payment for this one job; layered over the reusable rule.',
        },
        idempotencyKey: {
          type: 'string',
          description: 'Optional stable request/job key. Reuse it when retrying after a lost response.',
        },
      },
      required: ['keyId', 'targetUrl'],
    },
  },
  {
    name: 'synapse_batch_swarm_settle',
    description: 'Multi-agent work runner: a lead agent assigns approved steps to specialized workers and records each planned payment; a live Tempo batch is used only when chain access is available.',
    inputSchema: {
      type: 'object',
      properties: {
        leadAgentKeyId: {
          type: 'string',
          description: 'Session key ID of the Lead Agent funding the swarm.',
        },
        taskDescription: {
          type: 'string',
          description: 'The complex goal to decompose across sub-agents.',
        },
        subcontractors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              role: { type: 'string' },
              targetUrl: { type: 'string' },
              costPathUsd: { type: 'number' },
            },
            required: ['role', 'targetUrl', 'costPathUsd'],
          },
        },
        evaluationOnly: {
          type: 'boolean',
          description: 'When true, prepare every step without sending live chain transactions.',
        },
        jobBudgetPathUsd: {
          type: 'number',
          description: 'Maximum total payment for this one job. The batch is rejected before the first step if it exceeds this amount.',
        },
        jobId: {
          type: 'string',
          description: 'Stable mission identifier used to group this batch\'s receipts across the product.',
        },
      },
      required: ['leadAgentKeyId', 'taskDescription', 'subcontractors'],
    },
  },
  {
    name: 'synapse_check_agent_budget',
    description: 'Inspects available pathUSD balance, remaining 2D Nonce, and whitelisted Merkle root for a delegated session key.',
    inputSchema: {
      type: 'object',
      properties: {
        keyId: {
          type: 'string',
          description: 'Session key ID to query.',
        },
      },
      required: ['keyId'],
    },
  },
  {
    name: 'synapse_list_monetized_services',
    description: 'Lists available HTTP 402 data and AI endpoints in the registry; each result states whether settlement is live or evaluation-only.',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Optional filter by category (e.g. "Market Data", "Academic & Legal", "AI / LLM Inferences").',
        },
      },
    },
  },
];

export async function processMcpRequest(body: any): Promise<{ status: number; body: any }> {
  const { jsonrpc, id, method, params } = body || {};

  if (jsonrpc !== '2.0' || !method) {
    return {
      status: 400,
      body: {
        jsonrpc: '2.0',
        id: id || null,
        error: { code: -32600, message: 'Invalid Request: jsonrpc 2.0 and method are required.' },
      },
    };
  }

  try {
    switch (method) {
      // 1. MCP Initialization Handshake
      case 'initialize':
        return {
          status: 200,
          body: {
            jsonrpc: '2.0',
            id,
            result: {
              protocolVersion: '2024-11-05',
              capabilities: {
                tools: { listChanged: false },
                resources: { subscribe: false, listChanged: false },
                prompts: { listChanged: false },
              },
              serverInfo: {
                name: 'synapse402-tempo-mcp-server',
                version: '1.2.0',
                description: 'MCP gateway for budgeted agent work and HTTP 402 service access; live Tempo settlement is optional.',
              },
            },
          },
        };

      // 2. Tools Discovery
      case 'tools/list':
        return {
          status: 200,
          body: {
            jsonrpc: '2.0',
            id,
            result: {
              tools: SYNAPSE_MCP_TOOLS,
            },
          },
        };

      // 3. Tool Execution Call
      case 'tools/call': {
        const toolName = params?.name;
        const toolArgs = params?.arguments || {};

        if (!toolName) {
          return {
            status: 400,
            body: {
              jsonrpc: '2.0',
              id,
              error: { code: -32602, message: 'Missing tool name in tools/call arguments.' },
            },
          };
        }

        const callResult = await executeMcpTool(toolName, toolArgs);
        return {
          status: 200,
          body: {
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: typeof callResult === 'string' ? callResult : JSON.stringify(callResult, null, 2),
                },
              ],
              isError: false,
            },
          },
        };
      }

      // 4. Ping / Health
      case 'ping':
        return {
          status: 200,
          body: { jsonrpc: '2.0', id, result: {} },
        };

      default:
        return {
          status: 404,
          body: {
            jsonrpc: '2.0',
            id,
            error: { code: -32601, message: `Method '${method}' not found.` },
          },
        };
    }
  } catch (err: any) {
    return {
      status: 500,
      body: {
        jsonrpc: '2.0',
        id,
        error: { code: -32000, message: err.message || 'Internal MCP Server Execution Error' },
      },
    };
  }
}

// Handles HTTP Express JSON-RPC 2.0 MCP requests
export async function handleMcpJsonRpc(req: Request, res: Response) {
  const result = await processMcpRequest(req.body);
  return res.status(result.status).json(result.body);
}

// Tool Execution Dispatcher
export async function executeMcpTool(name: string, args: any): Promise<any> {
  const keys = synapseEngine.getKeys();

  const normalizeTargetUrl = (raw: string): string => {
    let u = (raw || '').trim();
    if (u.startsWith('/')) {
      const port = process.env.PORT || 3001;
      return `http://127.0.0.1:${port}${u}`;
    }
    if (u && !/^https?:\/\//i.test(u)) {
      return `https://${u}`;
    }
    return u;
  };

  const parsePaymentChallenge = (header: string | null) => {
    if (!header) return null;
    const read = (name: string) => header.match(new RegExp(`${name}="([^"]+)"`, 'i'))?.[1] || '';
    const price = Number(read('minPrice'));
    const payee = read('recipient');
    return Number.isFinite(price) && price > 0 && payee ? { price, payee, asset: read('asset') || 'pathUSD', realm: read('realm') || 'Tempo-L1' } : null;
  };

  const probePaymentChallenge = async (targetUrl: string) => {
    if (!isSafeProviderUrl(targetUrl)) {
      throw new Error('Provider target is not an approved public or local demo route.');
    }
    const response = await safeProviderFetch(targetUrl, { method: 'GET', signal: AbortSignal.timeout(5000) });
    const challenge = parsePaymentChallenge(response.headers.get('WWW-Authenticate') || response.headers.get('x-tempo-mpp-challenge'));
    if (response.status !== 402 || !challenge) {
      await readProviderText(response, 4096);
      throw new Error(`Provider did not return a valid HTTP 402 challenge (HTTP ${response.status}).`);
    }
    const registeredPayee = synapseEngine.getApprovedPayeeForEndpoint(targetUrl);
    if (!registeredPayee) throw new Error('Provider endpoint is not in the approved provider registry.');
    if (challenge.payee.toLowerCase() !== registeredPayee.toLowerCase()) {
      throw new Error('Provider challenge payee does not match the approved endpoint payee.');
    }
    if (challenge.asset !== 'pathUSD' || challenge.realm !== 'Tempo-L1') {
      throw new Error('Provider challenge uses an unsupported payment asset or realm.');
    }
    return { ...challenge, challengeId: response.headers.get('x-tempo-challenge-id'), response };
  };

  const buildProviderHeaders = (trace: any, idempotencyKey: string, maxBudget: number) => {
    const headers = new Headers({ 'Idempotency-Key': idempotencyKey });
    headers.set('X-Tempo-MPP-Signature', trace.eip712Signature || '');
    headers.set('X-Tempo-Nonce-2D', trace.nonce2D || '');
    headers.set('X-Tempo-Cost-PathUSD', String(trace.costPathUsd || 0));
    headers.set('X-Synapse-Trace-Id', trace.id || '');
    headers.set('X-Synapse-Execution-Mode', trace.executionMode || 'RESILIENT_SANDBOX');
    if (trace.receiptVerified === true && trace.txHash) headers.set('X-Tempo-Tx-Hash', trace.txHash);
    if (trace.mppCredential) {
      const c = trace.mppCredential;
      headers.set('X-Tempo-MPP-Signer', c.signer || '');
      headers.set('X-Tempo-MPP-Payee', c.payee || '');
      headers.set('X-Tempo-MPP-Amount-Micro', c.amountMicro || '');
      headers.set('X-Tempo-MPP-Endpoint', c.endpoint || '');
      headers.set('X-Tempo-MPP-Endpoint-Hash', c.endpointHash || '');
      headers.set('X-Tempo-MPP-Memo', c.memo || '');
      headers.set('X-Tempo-MPP-Valid-Before', String(c.validBefore || ''));
      headers.set('X-Tempo-MPP-Chain-Id', String(c.chainId || ''));
      headers.set('X-Tempo-MPP-Verifying-Contract', c.verifyingContract || '');
      headers.set('X-Tempo-MPP-Channel-Id', String(c.channelId ?? ''));
      headers.set('X-Tempo-MPP-Nonce', String(c.nonce ?? ''));
    }
    const signer = trace.authAuthorizationHeader?.match(/signer="([^"]+)"/)?.[1] || 'gateway-managed';
    headers.set('Authorization', `MPP-EIP712 signer="${signer}", nonce="${trace.nonce2D || ''}", max="${maxBudget}"`);
    return headers;
  };

  switch (name) {
    case 'synapse_call_paid_api': {
      const keyId = args.keyId ? String(args.keyId).trim() : '';
      const targetUrl = normalizeTargetUrl(args.targetUrl);
      const maxBudget = args.maxBudgetPathUsd === undefined
        ? 0.002
        : Number(args.maxBudgetPathUsd);
      const proofOfExecution = args.proofOfExecutionRequired !== false;
      const evaluationOnly = parseEvaluationFlag(args.evaluationOnly);

      if (!keyId) {
        throw new Error('keyId is required; payment authorization cannot choose another spending policy.');
      }
      if (!targetUrl || !/^https?:\/\//i.test(targetUrl)) {
        throw new Error('targetUrl is required.');
      }

      // 1. Pre-settlement budget guard: reject before issuing any payment.
      const key = keys.find((k) => k.id === keyId);
      if (!key) throw new Error(`Key ${keyId} not found.`);
      if (!Number.isFinite(maxBudget) || maxBudget <= 0) {
        throw new Error('maxBudgetPathUsd must be a positive finite number.');
      }

      if (!isSafeProviderUrl(targetUrl)) {
        throw new Error('Provider target is not an approved public or local demo route.');
      }
      // 2. Read the provider's actual 402 challenge before authorizing a
      // payment. MCP must never turn the caller's maximum into the price.
      const probeRes = await safeProviderFetch(targetUrl, { method: 'GET', signal: AbortSignal.timeout(5000) });
      const challengeId = probeRes.headers.get('x-tempo-challenge-id');
      if (probeRes.status !== 402) {
        const bodyText = await readProviderText(probeRes);
        let body: any = bodyText;
        try { body = JSON.parse(bodyText); } catch { /* keep text */ }
        return {
          status: 'NO_PAYMENT_REQUIRED',
          standard: 'Model Context Protocol (MCP) + Tempo MPP',
          payment: null,
          endpointResponse: body,
          providerHttpStatus: probeRes.status,
          providerDataStatus: probeRes.headers.get('x-synapse-data-status') || 'UPSTREAM_RESPONSE',
        };
      }
      const challenge = parsePaymentChallenge(probeRes.headers.get('WWW-Authenticate') || probeRes.headers.get('x-tempo-mpp-challenge'));
      if (!challenge) throw new Error('Provider returned HTTP 402 without a valid MPP price/payee challenge.');
      if (challenge.asset !== 'pathUSD') throw new Error(`Unsupported payment asset "${challenge.asset}".`);
      if (challenge.price > maxBudget) throw new Error(`Provider price $${challenge.price.toFixed(6)} exceeds this call maximum $${maxBudget.toFixed(6)}.`);
      if (!/^0x[0-9a-fA-F]{40}$/.test(challenge.payee)) throw new Error('Provider challenge did not include a valid payment recipient.');
      const approvedPayee = synapseEngine.getApprovedPayeeForEndpoint(targetUrl);
      if (!approvedPayee || challenge.payee.toLowerCase() !== approvedPayee.toLowerCase()) {
        throw new Error('Provider challenge payee does not match the approved endpoint payee.');
      }

      const stableKey = String(args.idempotencyKey || `mcp_${sha256(`${keyId}:${targetUrl}:${challenge.price}`).slice(0, 32)}`).trim();
      const jobId = `mcp_job_${stableKey}`.slice(0, 160);
      const requestedJobBudget = Number(args.jobBudgetPathUsd);
      const jobBudget = Number.isFinite(requestedJobBudget) && requestedJobBudget > 0
        ? requestedJobBudget
        : maxBudget;
      if (challenge.price > jobBudget) {
        throw new Error(`Provider price $${challenge.price.toFixed(6)} exceeds this job maximum $${jobBudget.toFixed(6)}.`);
      }

      const replayCacheKey = sha256(`${keyId}:${targetUrl}:${challenge.price}:${stableKey}`);
      const cachedResult = mcpResultReplayCache.get(replayCacheKey);
      if (cachedResult && cachedResult.expiresAt > Date.now()) {
        return { ...cachedResult.result, idempotentReplay: true };
      }
      if (cachedResult) mcpResultReplayCache.delete(replayCacheKey);

      // 3. Settle the challenged price, waiting for live confirmation.
      const settlement = await synapseEngine.settle402(keyId, targetUrl, challenge.price, 'MCP Tool Execution', {
        allowDynamicWhitelist: false,
        asyncRelay: false,
        evaluationOnly,
        payee: challenge.payee,
        asset: challenge.asset,
        realm: challenge.realm,
        idempotencyKey: stableKey,
        jobId,
        jobBudgetPathUsd: jobBudget,
      });

      // 4. Retry the provider with the exact credential and receipt proof.
      const liveConfirmed = settlement.trace.executionMode === 'LIVE_TESTNET'
        && settlement.trace.status === 'SETTLED'
        && settlement.trace.receiptVerified === true
        && typeof settlement.trace.txHash === 'string'
        && /^0x[0-9a-fA-F]{64}$/.test(settlement.trace.txHash);
      const livePending = settlement.trace.executionMode === 'LIVE_TESTNET'
        || settlement.trace.executionMode === 'LIVE_TESTNET_PENDING_CONFIRMATION';
      if (livePending && !liveConfirmed) {
        return {
          status: 'PENDING',
          standard: 'Model Context Protocol (MCP) + Tempo MPP',
          proofOfExecution: {
            escrowStatus: 'PENDING_CONFIRMATION',
            executionDigest: null,
            escrowVerified: false,
            voidProtection: 'Provider retry is withheld until the canonical Tempo receipt is confirmed.',
          },
          settlement: {
            txType: 'Tempo Type 0x76 (Pending Receipt)',
            costPathUsd: challenge.price,
            blockHeight: settlement.blockHeight,
            executionMode: settlement.trace.executionMode,
            txHash: null,
            tip20Memo: settlement.trace.tip20Memo,
            complianceStatus: settlement.trace.sanctionsCompliance?.status || settlement.trace.complianceVerification?.status || 'UNVERIFIED',
          },
          endpointResponse: null,
          providerHttpStatus: 202,
          providerDataStatus: 'PAYMENT_PENDING',
        };
      }
      let providerHttpStatus = 200;
      let providerDataStatus = evaluationOnly ? 'EVALUATION_FIXTURE' : 'UPSTREAM_RESPONSE';
      let providerBody: any;
      // A settlement idempotency hit already has a single-use credential that
      // the provider may correctly reject as a replay. Reuse the gateway's
      // durable trace payload instead of turning a safe retry into a false
      // provider failure or a second payment attempt.
      if (settlement.trace.isIdempotentCacheHit && settlement.trace.liveProxyPayload) {
        providerBody = settlement.trace.liveProxyPayload;
        providerDataStatus = evaluationOnly ? 'EVALUATION_FIXTURE' : 'CACHED_TRACE_PAYLOAD';
      } else {
        const providerHeaders = buildProviderHeaders(settlement.trace, stableKey, maxBudget);
        if (challengeId) providerHeaders.set('X-Tempo-Challenge-Id', challengeId);
        const providerRetry = await safeProviderFetch(targetUrl, { method: 'GET', headers: providerHeaders, signal: AbortSignal.timeout(8000) });
        providerHttpStatus = providerRetry.status;
        providerDataStatus = providerRetry.headers.get('x-synapse-data-status') || providerDataStatus;
        let providerText = await readProviderText(providerRetry);
        providerBody = providerText;
        try { providerBody = JSON.parse(providerText); } catch { /* keep text */ }
        if (!providerRetry.ok) {
          if (evaluationOnly && settlement.trace.liveProxyPayload) {
            providerBody = settlement.trace.liveProxyPayload;
            providerHttpStatus = 200;
            providerDataStatus = 'EVALUATION_FIXTURE';
          } else {
            throw new Error(`Provider retry failed after payment settlement (HTTP ${providerRetry.status}).`);
          }
        }
      }
      const executionDigest = sha256(JSON.stringify(providerBody));

      const result = {
        status: liveConfirmed ? 'SUCCESS' : 'EVALUATION',
        standard: 'Model Context Protocol (MCP) + Tempo MPP',
        proofOfExecution: {
          escrowStatus: liveConfirmed ? 'SETTLED_AND_RELEASED' : 'EVALUATION_ONLY',
          executionDigest: `0x${executionDigest}`,
          escrowVerified: liveConfirmed && proofOfExecution,
          voidProtection: 'Budget checked before settlement; provider retry happens only after the payment credential is issued. Provider failures are surfaced and never relabeled as success.',
        },
        settlement: {
          txType: liveConfirmed ? 'Tempo Type 0x76 (Native MPP)' : 'Evaluation payment plan',
          costPathUsd: challenge.price,
          blockHeight: settlement.blockHeight,
          executionMode: settlement.trace.executionMode,
          txHash: liveConfirmed ? settlement.trace.txHash : null,
          tip20Memo: settlement.trace.tip20Memo,
          complianceStatus: settlement.trace.sanctionsCompliance?.status || settlement.trace.complianceVerification?.status || 'UNVERIFIED',
        },
        endpointResponse: providerBody,
        providerHttpStatus,
        providerDataStatus,
      };
      mcpResultReplayCache.set(replayCacheKey, { expiresAt: Date.now() + MCP_RESULT_REPLAY_TTL_MS, result });
      if (mcpResultReplayCache.size > 1000) {
        const now = Date.now();
        for (const [cacheKey, value] of mcpResultReplayCache.entries()) {
          if (value.expiresAt <= now) mcpResultReplayCache.delete(cacheKey);
        }
      }
      return result;
    }

    case 'synapse_batch_swarm_settle': {
      const keys = synapseEngine.getKeys();
      const requestedLeadKeyId = args.leadAgentKeyId ? String(args.leadAgentKeyId).trim() : '';
      if (!requestedLeadKeyId) throw new Error('leadAgentKeyId is required; the batch cannot choose another spending policy.');
      const leadKey = keys.find((k) => k.id === requestedLeadKeyId);
      if (!leadKey) throw new Error(`Lead session key "${requestedLeadKeyId}" not found.`);
      const leadKeyId = leadKey.id;

      const taskDescription = args.taskDescription === undefined
        ? 'Multi-Agent Swarm Collaborative Computation'
        : String(args.taskDescription).trim();
      if (!taskDescription || taskDescription.length > 5000) {
        throw new Error('taskDescription must be 1–5,000 characters.');
      }
      const subcontractors = (Array.isArray(args.subcontractors) && args.subcontractors.length > 0)
        ? args.subcontractors
        : synapseEngine.getEndpoints()
            .filter((endpoint: any) => String(endpoint.endpointUrl || '').startsWith('/api/'))
            .map((endpoint: any, index: number) => ({
              id: `sub_${index + 1}`,
              role: endpoint.title,
              shortName: endpoint.title,
              targetUrl: endpoint.endpointUrl,
              costPathUsd: endpoint.pricePerCallUsd,
            }));
      if (subcontractors.length > 64) {
        throw new Error('A swarm batch can contain at most 64 approved steps.');
      }
      const evaluationOnly = parseEvaluationFlag(args.evaluationOnly);
      const jobBudgetPathUsd = Number(args.jobBudgetPathUsd);

      // 1. Upfront Pre-Validation: verify all subcontractors before dispatching any payment
      // Probe every route first and use the provider's signed challenge price.
      // Client-supplied costPathUsd is only a display hint; it is never a
      // payment amount and cannot be used to underquote a provider.
      const validatedSubcontractors: Array<{ sub: any; url: string; price: number; payee: string; challengeId?: string }> = [];
      let totalBatchCost = 0;
      for (let i = 0; i < subcontractors.length; i++) {
        const sub = subcontractors[i];
        if (!sub || typeof sub !== 'object') {
          throw new Error(`Batch subcontracting aborted: Subcontractor #${i + 1} is invalid.`);
        }
        const role = sub.role ? String(sub.role).trim() : `Subcontractor-${i + 1}`;
        const subUrl = normalizeTargetUrl(sub.targetUrl || sub.endpointUrl || sub.url || '');
        if (role.length > 200) {
          throw new Error(`Batch subcontracting aborted: ${role.slice(0, 60)} role is too long.`);
        }
        if (subUrl.length > 2048) {
          throw new Error(`Batch subcontracting aborted: ${role} targetUrl exceeds 2048 characters.`);
        }
        if (!subUrl || !/^https?:\/\//i.test(subUrl)) {
          throw new Error(`Batch subcontracting aborted: Subcontractor #${i + 1} (${role}) must specify a valid http/https targetUrl.`);
        }
        let parsedSubUrl: URL;
        try { parsedSubUrl = new URL(subUrl); } catch { throw new Error(`Batch subcontracting aborted: ${role} targetUrl is malformed.`); }
        const allowlisted = leadKey.whitelistedDomains.some((entry: string) => {
          try {
            const allowed = new URL(entry, `http://127.0.0.1:${process.env.PORT || 3001}`);
            const hostMatches = parsedSubUrl.hostname.toLowerCase() === allowed.hostname.toLowerCase();
            const pathMatches = !allowed.pathname || allowed.pathname === '/'
              || parsedSubUrl.pathname === allowed.pathname
              || parsedSubUrl.pathname.startsWith(`${allowed.pathname.replace(/\/$/, '')}/`);
            return hostMatches && pathMatches;
          } catch { return false; }
        }) || synapseEngine.getApprovedPayeeForEndpoint(subUrl) !== null;
        if (!allowlisted) {
          throw new Error(`Batch subcontracting aborted: ${role} is outside the lead agent's approved endpoint allowlist.`);
        }
        let challenge: any;
        try {
          challenge = await probePaymentChallenge(subUrl);
        } catch (probeError: any) {
          throw new Error(`Batch subcontracting aborted: ${role} challenge validation failed: ${probeError?.message || probeError}`);
        }
        const subCost = Number(challenge.price);
        if (!Number.isFinite(subCost) || subCost <= 0) {
          throw new Error(`Batch subcontracting aborted: ${role} returned an invalid price challenge.`);
        }
        if (leadKey.maxPerCallPathUsd && subCost > leadKey.maxPerCallPathUsd) {
          throw new Error(`Batch subcontracting aborted: ${role} price ($${subCost}) exceeds maxPerCall limit ($${leadKey.maxPerCallPathUsd}).`);
        }
        totalBatchCost += subCost;
        validatedSubcontractors.push({ sub, url: subUrl, price: subCost, payee: challenge.payee, challengeId: challenge.challengeId });
      }
      if (Number.isFinite(jobBudgetPathUsd) && jobBudgetPathUsd > 0 && totalBatchCost > jobBudgetPathUsd) {
        throw new Error(`Job limit exceeded: provider challenges total $${totalBatchCost.toFixed(4)}, but this job allows $${jobBudgetPathUsd.toFixed(4)}.`);
      }
      const totalBudget = Number.isFinite(leadKey.totalBudgetPathUsd) ? leadKey.totalBudgetPathUsd : 0;
      const currentSpent = Number.isFinite(leadKey.currentSpentPathUsd) ? leadKey.currentSpentPathUsd : 0;
      const remainingBudget = Math.max(0, totalBudget - currentSpent);
      if (totalBatchCost > remainingBudget) {
        throw new Error(`Batch subcontracting aborted: Insufficient budget. Required $${totalBatchCost.toFixed(4)}, remaining $${remainingBudget.toFixed(4)}.`);
      }

      const batchId = `swarm_batch_${Date.now()}`;
      const missionJobId = String(args.jobId || batchId).trim().slice(0, 160) || batchId;
      const results = [];
      const settledTraces: any[] = [];
      // A batch has one execution mode for every step. A live failure stops the
      // batch with an explicit partial-settlement error; it never silently
      // converts the remaining steps into evaluation records.

      try {
        for (let i = 0; i < validatedSubcontractors.length; i++) {
          const { sub, url: subUrl, price: subCost, payee, challengeId } = validatedSubcontractors[i];
          // MCP calls use the same fail-closed policy as the HTTP gateway.
          // Keep the legacy field in the tool schema for compatibility, but
          // never let a caller widen a session Merkle allowlist at runtime.
          const allowDynamic = false;
          let subSettlement;
          try {
            subSettlement = await synapseEngine.settle402(leadKeyId, subUrl, subCost, `Swarm: ${sub.role || 'Worker'}`, {
              allowDynamicWhitelist: allowDynamic,
              // Wait for each live receipt. A provisional async hash must never
              // be copied onto another worker and presented as its proof.
              asyncRelay: false,
              evaluationOnly,
              jobId: missionJobId,
              idempotencyKey: `${missionJobId}:${sub.id || i}`.slice(0, 200),
              jobBudgetPathUsd: Number.isFinite(jobBudgetPathUsd) && jobBudgetPathUsd > 0 ? jobBudgetPathUsd : undefined,
              payee,
            });
          } catch (liveError: any) {
            console.error(`[Synapse402] Swarm ${evaluationOnly ? 'evaluation' : 'live'} step failed: ${liveError?.message || liveError}`);
            throw new Error(`${evaluationOnly ? 'Evaluation' : 'Live'} swarm step failed for ${sub.role || 'worker'} (${subUrl}): ${liveError?.message || liveError}`);
          }
          settledTraces.push(subSettlement.trace);

          // Provider retry with auth credentials to retrieve real deliverable
          let deliverablePayload: any = null;
          let providerDataStatus = evaluationOnly ? 'EVALUATION_FIXTURE' : 'UPSTREAM_RESPONSE';
          let providerHttpStatus = 200;
          const subLiveConfirmed = subSettlement.trace.executionMode === 'LIVE_TESTNET'
            && subSettlement.trace.status === 'SETTLED'
            && subSettlement.trace.receiptVerified === true
            && typeof subSettlement.trace.txHash === 'string'
            && /^0x[a-fA-F0-9]{64}$/.test(subSettlement.trace.txHash);
          const subLivePending = subSettlement.trace.executionMode === 'LIVE_TESTNET'
            || subSettlement.trace.executionMode === 'LIVE_TESTNET_PENDING_CONFIRMATION';

          if (subLivePending && !subLiveConfirmed) {
            providerHttpStatus = 202;
            providerDataStatus = 'PAYMENT_PENDING';
          } else if (subSettlement.trace.isIdempotentCacheHit && subSettlement.trace.liveProxyPayload) {
            deliverablePayload = subSettlement.trace.liveProxyPayload;
            providerDataStatus = evaluationOnly ? 'EVALUATION_FIXTURE' : 'CACHED_TRACE_PAYLOAD';
          } else {
            try {
              const idempotencyKey = `${missionJobId}:${sub.id || i}`.slice(0, 200);
              const providerHeaders = buildProviderHeaders(subSettlement.trace, idempotencyKey, subCost);
              if (challengeId) providerHeaders.set('X-Tempo-Challenge-Id', challengeId);
              const providerRetry = await safeProviderFetch(subUrl, { method: 'GET', headers: providerHeaders, signal: AbortSignal.timeout(8000) });
              providerHttpStatus = providerRetry.status;
              providerDataStatus = providerRetry.headers.get('x-synapse-data-status') || providerDataStatus;
              const providerText = await readProviderText(providerRetry);
              try { deliverablePayload = JSON.parse(providerText); } catch { deliverablePayload = providerText; }
              if (!providerRetry.ok && evaluationOnly && subSettlement.trace.liveProxyPayload) {
                deliverablePayload = subSettlement.trace.liveProxyPayload;
                providerHttpStatus = 200;
                providerDataStatus = 'EVALUATION_FIXTURE';
              }
            } catch (retryErr: any) {
              if (evaluationOnly && subSettlement.trace.liveProxyPayload) {
                deliverablePayload = subSettlement.trace.liveProxyPayload;
              } else {
                console.warn(`[Synapse402] Deliverable retrieval notice for ${subUrl}: ${retryErr?.message || retryErr}`);
              }
            }
          }

          const isStepLiveConfirmed = subLiveConfirmed;
          const isResourceReceived = providerHttpStatus >= 200 && providerHttpStatus < 300 && deliverablePayload !== null;
          const stepDeliveryStatus = isStepLiveConfirmed
            ? (isResourceReceived ? 'PAYMENT CONFIRMED · RESOURCE RECEIVED' : 'PAYMENT CONFIRMED · RESOURCE FAILED')
            : (isResourceReceived ? 'EVALUATION · RESOURCE PREVIEWED' : 'EVALUATION · RESOURCE FAILED');

          results.push({
            subcontractorRole: sub.role || `Worker-${i + 1}`,
            targetEndpoint: subUrl,
            settledCostPathUsd: subCost,
            traceId: subSettlement.trace.id,
            nonce2D: subSettlement.trace.nonce2D,
            proofHash: sha256(`SWARM:${batchId}:${sub.role || i}:${subCost}`),
            deliverablePayload,
            providerHttpStatus,
            providerDataStatus,
            paymentConfirmed: isStepLiveConfirmed,
            isResourceReceived,
            deliveryStatus: stepDeliveryStatus,
          });
        }
      } catch (execErr: any) {
        // Workers settle sequentially. A chain payment that already settled
        // cannot be undone by changing local counters, so preserve those
        // receipts and report the batch as partially completed.
        const partialSettlement = settledTraces.length > 0;
        const prefix = partialSettlement
          ? `Swarm stopped after ${settledTraces.length}/${subcontractors.length} sequential payments; prior receipts remain settled.`
          : 'Swarm stopped before any payment was settled.';
        throw new Error(`${prefix} ${execErr.message}`);
      }

      // A pending async relay has a provisional hash, but it is not a receipt.
      // Only expose a batch chain hash after every requested step has a confirmed live trace.
      const allLiveSettled = settledTraces.length === subcontractors.length && settledTraces.every(
        (t) => t.executionMode === 'LIVE_TESTNET'
          && t.status === 'SETTLED'
          && t.receiptVerified === true
          && t.liveProxyPayload?.paymentConfirmed === true
          && typeof t.txHash === 'string'
          && /^0x[a-fA-F0-9]{64}$/.test(t.txHash)
      );
      const primaryTxHash = allLiveSettled ? settledTraces[0].txHash : '';
      const allDeliverablesReceived = results.length === subcontractors.length && results.every((r) => r.isResourceReceived);
      const missionStatus = allDeliverablesReceived
        ? (allLiveSettled ? 'MISSION_COMPLETED' : 'EVALUATION_COMPLETED')
        : (allLiveSettled ? 'PARTIAL_DELIVERY_PAYMENT_CONFIRMED' : 'EVALUATION_PARTIAL');

      return {
        swarmBatchId: batchId,
        task: taskDescription,
        batchExecution: {
          batchType: primaryTxHash ? 'Tempo 0x76 Pipelined Subcontracting' : 'Evaluation payment plan',
          subcontractorCount: subcontractors.length,
          executionMode: allLiveSettled ? 'LIVE_TESTNET' : 'RESILIENT_SANDBOX',
          liveSettledCount: allLiveSettled ? settledTraces.length : 0,
          evaluationStepCount: allLiveSettled ? 0 : settledTraces.length,
          txHashes: allLiveSettled ? settledTraces.map((t) => t.txHash).filter(Boolean) : [],
          totalCostPathUsd: Number(totalBatchCost.toFixed(5)),
          escrowSettlement: allLiveSettled ? 'ALL_PAYMENTS_CONFIRMED' : 'EVALUATION_PLAN_ONLY',
          missionStatus,
          allDeliverablesReceived,
          deliverySummary: allDeliverablesReceived
            ? (allLiveSettled ? 'PAYMENT CONFIRMED · RESOURCE RECEIVED' : 'EVALUATION · ALL RESOURCES RECEIVED')
            : (allLiveSettled ? 'PAYMENT CONFIRMED · RESOURCE FAILED' : 'EVALUATION · RESOURCE FAILED'),
          txHash: primaryTxHash || null,
          receiptVerified: allLiveSettled,
          paymentReceiver: synapseEngine.receiverAddress,
        },
        dispatchedWorkers: results,
      };
    }

    case 'synapse_check_agent_budget': {
      const targetKeyId = args.keyId ? String(args.keyId).trim() : '';
      if (!targetKeyId) throw new Error('keyId is required; budget status cannot choose another spending policy.');
      const key = keys.find((k) => k.id === targetKeyId);
      if (!key) throw new Error(`Session key "${targetKeyId}" not found.`);

      return {
        agentId: key.agentId,
        agentName: key.agentName,
        sessionPublicKey: key.sessionPublicKey,
        totalBudgetPathUsd: key.totalBudgetPathUsd,
        currentSpentPathUsd: key.currentSpentPathUsd,
        availableBudgetPathUsd: Number((key.totalBudgetPathUsd - key.currentSpentPathUsd).toFixed(4)),
        channelId: key.channelId,
        sequenceNonce: key.sequenceNonce,
        whitelistedDomains: key.whitelistedDomains,
        merkleRoot: key.merkleRoot,
        status: key.status,
      };
    }

    case 'synapse_list_monetized_services': {
      const allServices = synapseEngine.getEndpoints().map((endpoint: any) => ({
        id: endpoint.id,
        name: endpoint.title,
        url: endpoint.endpointUrl,
        pricePathUsd: endpoint.pricePerCallUsd,
        category: endpoint.category,
        providerLabel: endpoint.demo === true ? 'DEMO PROVIDER' : 'CONFIGURED PROVIDER',
      }));

      const filterCat = args.category;
      const liveSettlementAvailable = synapseEngine.networkMode === 'LIVE_TESTNET';
      return {
        count: filterCat ? allServices.filter((s) => s.category.includes(filterCat)).length : allServices.length,
        executionMode: liveSettlementAvailable ? 'LIVE_TESTNET' : 'RESILIENT_SANDBOX',
        note: 'Registry entries describe the payment route and response shape; provider data still needs upstream verification.',
        services: (filterCat ? allServices.filter((s) => s.category.includes(filterCat)) : allServices).map((service) => ({
          ...service,
          dataStatus: 'PROVIDER_RESPONSE_UNVERIFIED',
          settlementStatus: liveSettlementAvailable ? 'LIVE_SETTLEMENT_AVAILABLE' : 'EVALUATION_ONLY',
        })),
      };
    }

    default:
      throw new Error(`Tool '${name}' not implemented.`);
  }
}

// =======================================================================
// Stdio Transport for Claude Desktop & Cursor
// If invoked directly from CLI (e.g. `npx tsx server/mcpServer.ts`), listens on stdin/stdout
// =======================================================================
if (typeof process !== 'undefined' && process.argv) {
  const isDirectRun = process.argv.some(arg => arg.includes('mcpServer') || arg === '--stdio');
  if (isDirectRun) {
    import('readline').then((readline) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
      });

      rl.on('line', async (line: string) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        try {
          const rpc = JSON.parse(trimmed);
          const { body } = await processMcpRequest(rpc);
          process.stdout.write(JSON.stringify(body) + '\n');
        } catch (err: any) {
          process.stdout.write(JSON.stringify({
            jsonrpc: '2.0',
            id: null,
            error: { code: -32700, message: `Parse error: ${err.message}` },
          }) + '\n');
        }
      });
    });
  }
}
