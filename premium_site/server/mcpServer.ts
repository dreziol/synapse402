// Ensure stdout is strictly reserved for JSON-RPC 2.0 when invoked in Stdio mode (Claude Desktop / Cursor)
if (typeof process !== 'undefined' && process.argv && process.argv.some(a => a.includes('mcpServer') || a === '--stdio')) {
  console.log = (...args: any[]) => {
    process.stderr.write(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n');
  };
}

import { Request, Response } from 'express';
import { synapseEngine, sha256 } from './synapseCore';

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
          description: 'Session key ID (e.g. key_000001) or leave empty for default active agent.',
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
          description: 'If true, locks payment into Escrow and settles only upon valid HTTP 200 + response hash match.',
        },
        evaluationOnly: {
          type: 'boolean',
          description: 'When true, run the plan without sending a live chain transaction or changing live balances.',
        },
      },
      required: ['targetUrl'],
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
      },
      required: ['taskDescription', 'subcontractors'],
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
  const activeKey = keys.find((k) => k.status === 'ACTIVE') || keys[0];

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

  switch (name) {
    case 'synapse_call_paid_api': {
      const keyId = args.keyId || activeKey?.id;
      const targetUrl = normalizeTargetUrl(args.targetUrl);
      const maxBudget = Number(args.maxBudgetPathUsd || 0.002);
      const proofOfExecution = args.proofOfExecutionRequired !== false;
      const evaluationOnly = args.evaluationOnly === true;

      if (!keyId) {
        throw new Error('No active session key available for payment authorization.');
      }
      if (!targetUrl || !/^https?:\/\//i.test(targetUrl)) {
        throw new Error('targetUrl is required.');
      }

      // 1. Proof-of-Execution Escrow Hold: Validate budget before firing request
      const key = keys.find((k) => k.id === keyId);
      if (!key) throw new Error(`Key ${keyId} not found.`);
      if (key.currentSpentPathUsd + maxBudget > key.totalBudgetPathUsd) {
        throw new Error(`Escrow Pre-Auth Failed: Insufficient pathUSD budget (Remaining: $${(key.totalBudgetPathUsd - key.currentSpentPathUsd).toFixed(4)}).`);
      }

      // 2. Perform live settlement through Synapse Engine with strict Merkle whitelist enforcement
      const settlement = await synapseEngine.settle402(keyId, targetUrl, maxBudget, 'MCP Tool Execution', {
        allowDynamicWhitelist: false,
        asyncRelay: true,
        evaluationOnly,
      });

      // 3. Compute Proof of Execution Check
      const executionDigest = sha256(JSON.stringify(settlement.trace.liveProxyPayload || settlement.trace.id));
      const liveConfirmed = settlement.trace.executionMode === 'LIVE_TESTNET'
        && settlement.trace.status === 'SETTLED'
        && typeof settlement.trace.txHash === 'string'
        && settlement.trace.txHash.startsWith('0x');

      return {
        status: liveConfirmed ? 'SUCCESS' : 'EVALUATION',
        standard: 'Model Context Protocol (MCP) + Tempo MPP',
        proofOfExecution: {
          escrowStatus: liveConfirmed ? 'SETTLED_AND_RELEASED' : 'EVALUATION_ONLY',
          executionDigest: `0x${executionDigest}`,
          escrowVerified: liveConfirmed && proofOfExecution,
          voidProtection: 'Active (Pre-settlement void, zero cost charged on 5xx failure)',
        },
        settlement: {
          txType: liveConfirmed ? 'Tempo Type 0x76 (Native MPP)' : 'Evaluation payment plan',
          costPathUsd: settlement.trace.costPathUsd,
          blockHeight: settlement.blockHeight,
          executionMode: settlement.trace.executionMode,
          txHash: liveConfirmed ? settlement.trace.txHash : null,
          nonce2D: settlement.trace.nonce2D,
          eip712Signature: settlement.trace.eip712Signature,
          tip20Memo: settlement.trace.tip20Memo,
          complianceStatus: settlement.trace.sanctionsCompliance?.status || settlement.trace.complianceVerification?.status || 'CLEARED',
        },
        endpointResponse: settlement.trace.liveProxyPayload || {
          message: liveConfirmed
            ? `Deliverable from ${targetUrl} was received after the confirmed payment.`
            : `Evaluation response prepared for ${targetUrl}; no chain payment was submitted.`,
          timestamp: new Date().toISOString(),
        },
      };
    }

    case 'synapse_batch_swarm_settle': {
      const keys = synapseEngine.getKeys();
      const leadKey = (args.leadAgentKeyId ? keys.find((k) => k.id === args.leadAgentKeyId) : null) || activeKey || keys[0];
      if (!leadKey) throw new Error('No active lead agent session key found in vault.');
      const leadKeyId = leadKey.id;

      const taskDescription = args.taskDescription === undefined
        ? 'Multi-Agent Swarm Collaborative Computation'
        : String(args.taskDescription).trim();
      if (!taskDescription || taskDescription.length > 5000) {
        throw new Error('taskDescription must be 1–5,000 characters.');
      }
      const subcontractors = (Array.isArray(args.subcontractors) && args.subcontractors.length > 0)
        ? args.subcontractors
        : [
            { id: 'sub_1', role: 'Image Cutout & Background Removal', shortName: 'Image Cutout', targetUrl: '/api/v1/test-provider-data', costPathUsd: 0.0005 },
            { id: 'sub_2', role: '4K Super-Resolution Upscaler', shortName: '4K Upscaler', targetUrl: '/api/v1/test-provider-data', costPathUsd: 0.0005 },
            { id: 'sub_3', role: 'Web Page Data Scraper', shortName: 'Web Scraper', targetUrl: '/api/v1/data/stock-orderbook', costPathUsd: 0.0005 },
            { id: 'sub_4', role: 'Financial Paywall Research Reader', shortName: 'Paywall Unlocker', targetUrl: '/api/v1/data/unlocked-article', costPathUsd: 0.0005 },
          ];
      if (subcontractors.length > 64) {
        throw new Error('A swarm batch can contain at most 64 approved steps.');
      }
      const evaluationOnly = args.evaluationOnly === true;

      const totalBatchCost = subcontractors.reduce((acc: number, s: any) => {
        const c = Number(s?.costPathUsd ?? s?.costUsd ?? s?.cost ?? s?.priceUsd ?? s?.pricePathUsd ?? 0.0005);
        return acc + (Number.isFinite(c) ? c : 0);
      }, 0);
      const totalBudget = Number.isFinite(leadKey.totalBudgetPathUsd) ? leadKey.totalBudgetPathUsd : 0;
      const currentSpent = Number.isFinite(leadKey.currentSpentPathUsd) ? leadKey.currentSpentPathUsd : 0;
      const remainingBudget = Math.max(0, totalBudget - currentSpent);
      if (totalBatchCost > remainingBudget) {
        throw new Error(`Batch subcontracting aborted: Insufficient budget. Required $${totalBatchCost.toFixed(4)}, remaining $${remainingBudget.toFixed(4)}.`);
      }

      // 1. Upfront Pre-Validation: verify all subcontractors before dispatching any payment
      for (let i = 0; i < subcontractors.length; i++) {
        const sub = subcontractors[i];
        if (!sub || typeof sub !== 'object') {
          throw new Error(`Batch subcontracting aborted: Subcontractor #${i + 1} is invalid.`);
        }
        const role = sub.role ? String(sub.role).trim() : `Subcontractor-${i + 1}`;
        const rawCost = sub.costPathUsd ?? sub.costUsd ?? sub.cost ?? sub.priceUsd ?? sub.pricePathUsd ?? 0.0005;
        const subCost = Number(rawCost);
        if (!Number.isFinite(subCost) || subCost <= 0) {
          throw new Error(`Batch subcontracting aborted: Subcontractor #${i + 1} (${role}) has invalid cost ($${rawCost}).`);
        }
        if (leadKey.maxPerCallPathUsd && subCost > leadKey.maxPerCallPathUsd) {
          throw new Error(`Batch subcontracting aborted: Subcontractor #${i + 1} (${role}) cost ($${subCost}) exceeds maxPerCall limit ($${leadKey.maxPerCallPathUsd}).`);
        }
        const subUrl = normalizeTargetUrl(sub.targetUrl || sub.endpointUrl || sub.url || '');
        if (!subUrl || !/^https?:\/\//i.test(subUrl)) {
          throw new Error(`Batch subcontracting aborted: Subcontractor #${i + 1} (${role}) must specify a valid http/https targetUrl.`);
        }
      }

      const batchId = `swarm_batch_${Date.now()}`;
      const results = [];
      let settledSum = 0;
      const settledTraces: any[] = [];

      try {
        for (let i = 0; i < subcontractors.length; i++) {
          const sub = subcontractors[i];
          const subCost = Number(sub.costPathUsd ?? sub.costUsd ?? sub.cost ?? sub.priceUsd ?? sub.pricePathUsd ?? 0.0005);
          const subUrl = normalizeTargetUrl(sub.targetUrl || sub.endpointUrl || sub.url || '');
          const allowDynamic = args.allowDynamicWhitelist !== undefined
            ? Boolean(args.allowDynamicWhitelist)
            : Boolean(sub.allowDynamicWhitelist ?? true);
          const subSettlement = await synapseEngine.settle402(leadKeyId, subUrl, subCost, `Swarm: ${sub.role || 'Worker'}`, {
            allowDynamicWhitelist: allowDynamic,
            asyncRelay: true,
            evaluationOnly,
          });
          settledSum += subCost;
          settledTraces.push(subSettlement.trace);
          results.push({
            subcontractorRole: sub.role || `Worker-${i + 1}`,
            targetEndpoint: subUrl,
            settledCostPathUsd: subCost,
            traceId: subSettlement.trace.id,
            nonce2D: subSettlement.trace.nonce2D,
            proofHash: sha256(`SWARM:${batchId}:${sub.role || i}:${subCost}`),
          });
        }
      } catch (execErr: any) {
        // Rollback atomic reservations for all already-dispatched subcontractors in this batch
        if (settledSum > 0) {
          leadKey.currentSpentPathUsd = Math.max(0, Math.round((leadKey.currentSpentPathUsd - settledSum) * 1e6) / 1e6);
          if (leadKey.currentSpentPathUsd < leadKey.totalBudgetPathUsd) {
            leadKey.status = 'ACTIVE';
          }
          settledTraces.forEach((t) => {
            t.executionMode = 'FAILED_REVERT';
            t.status = 'REJECTED';
            t.httpStatusAfter = 500;
          });
        }
        throw new Error(`Swarm batch execution failed and rolled back: ${execErr.message}`);
      }

      // A pending async relay has a provisional hash, but it is not a receipt.
      // Only expose a batch chain hash after every requested step has a confirmed live trace.
      const allLiveSettled = settledTraces.length === subcontractors.length && settledTraces.every(
        (t) => t.executionMode === 'LIVE_TESTNET' && t.status === 'SETTLED' && typeof t.txHash === 'string' && t.txHash.startsWith('0x')
      );
      const primaryTxHash = allLiveSettled ? settledTraces[0].txHash : '';

      return {
        swarmBatchId: batchId,
        task: taskDescription,
        batchExecution: {
          batchType: primaryTxHash ? 'Tempo 0x76 Pipelined Subcontracting' : 'Evaluation payment plan',
          subcontractorCount: subcontractors.length,
          totalCostPathUsd: Number(totalBatchCost.toFixed(5)),
          escrowSettlement: allLiveSettled ? 'ALL_DELIVERABLES_VERIFIED' : 'EVALUATION_PLAN_ONLY',
          txHash: primaryTxHash || null,
        },
        dispatchedWorkers: results,
      };
    }

    case 'synapse_check_agent_budget': {
      const targetKeyId = args.keyId || activeKey?.id;
      const key = keys.find((k) => k.id === targetKeyId) || activeKey;
      if (!key) throw new Error('Key not found.');

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
      const allServices = [
        {
          id: 'ep_binance',
          name: 'Example L2 Market Snapshot',
          url: '/api/v1/data/stock-orderbook',
          pricePathUsd: 0.001,
          category: 'Market Data',
          latency: '39ms',
        },
        {
          id: 'ep_sec',
          name: 'SEC EDGAR 10-K Real-Time Stream',
          url: 'https://api.sec.gov/filings/10k/structured',
          pricePathUsd: 0.0015,
          category: 'Academic & Legal',
          latency: '156ms',
        },
        {
          id: 'ep_vector',
          name: 'LLM Multi-Agent Vector Embedding',
          url: 'https://api.vector-agent.mesh/v1/embeddings',
          pricePathUsd: 0.003,
          category: 'AI / LLM Inferences',
          latency: '142ms',
        },
        {
          id: 'ep_audit',
          name: 'Bytecode Decompiler & Vulnerability Fuzzer',
          url: 'https://api.secaudit.ai/v1/fuzz',
          pricePathUsd: 0.005,
          category: 'Bytecode Audit',
          latency: '210ms',
        },
      ];

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
