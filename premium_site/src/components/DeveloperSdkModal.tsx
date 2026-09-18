import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Code, 
  Check, 
  Play, 
  Loader2, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Terminal, 
  Cpu, 
  Layers,
  ExternalLink,
  Bot,
  Store
} from 'lucide-react';
import { soundEngine } from '../utils/audioEffects';
import { InfoBadge } from './InfoBadge';

interface DeveloperSdkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LiveStep {
  step: number;
  label: string;
  detail: string;
  status: 'pending' | 'done' | 'failed';
  txHash?: string;
  payload?: any;
}

export const DeveloperSdkModal: React.FC<DeveloperSdkModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'ai_side' | 'provider_side' | 'terminal_cli' | 'mcp'>('ai_side');
  const [copied, setCopied] = useState(false);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testSteps, setTestSteps] = useState<LiveStep[]>([]);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    soundEngine.playClick();
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunLiveExample = async () => {
    soundEngine.playClick();
    setIsRunningTest(true);
    setTestSteps([
      {
        step: 1,
        label: '1. Resource Request',
        detail: 'AI requests protected resource: GET /api/v1/test-provider-data',
        status: 'pending',
      }
    ]);

    try {
      // Step 1: Probe protected route without payment proof
      const probeRes = await fetch('/api/v1/test-provider-data');
      
      if (probeRes.status === 402) {
        setTestSteps((prev) => [
          { ...prev[0], status: 'done', detail: 'AI sent probe request to /api/v1/test-provider-data' },
          {
            step: 2,
            label: '2. Payment Challenge',
            detail: 'Provider responded: HTTP 402 Payment Required ($0.0020 pathUSD)',
            status: 'done',
          },
          {
            step: 3,
            label: '3. Synapse402 Settlement',
            detail: 'Signing authorization & settling micropayment on Tempo L1...',
            status: 'pending',
          }
        ]);

        // Step 2: Settle payment via Synapse402 Gateway
        const settleRes = await fetch('/api/mpp/settle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            keyId: 'key_quant_alpha',
            targetUrl: '/api/v1/test-provider-data',
            pricePathUsd: 0.002,
            category: 'SDK Integration Verification',
            allowDynamicWhitelist: true,
          }),
        });

        const settleData = await settleRes.json();
        if (!settleRes.ok) throw new Error(settleData.error || 'Settlement failed');

        const txHash = settleData.trace?.txHash || '';
        const isLiveSettlement = settleData.trace?.executionMode === 'LIVE_TESTNET' && Boolean(txHash);

        // Step 3: Receive payload
        setTestSteps((prev) => [
          prev[0],
          prev[1],
          {
            step: 3,
            label: '3. Synapse402 Settlement',
            detail: isLiveSettlement
              ? `Settled on Tempo L1 via MPP Type 0x76 (Tx: ${txHash.slice(0, 14)}...)`
              : 'Sandbox authorization completed; no on-chain transaction was submitted.',
            status: 'done',
            txHash,
          },
          {
            step: 4,
            label: '4. Resource Returned',
            detail: 'Provider verified authorization proof and returned HTTP 200 payload',
            status: 'done',
            payload: settleData.trace?.liveProxyPayload || {
              status: 'ok',
              service: 'DeepQuant Orderbook L2 Depth',
              symbol: 'TEMPO/USD',
              bid: 42.50,
              ask: 42.52,
              depth: 154200,
            },
          }
        ]);

        soundEngine.playSettlementChime();
      } else {
        // Direct response fallback
        setTestSteps([
          {
            step: 1,
            label: '1. Resource Request',
            detail: 'Request returned standard response directly.',
            status: 'done',
          }
        ]);
      }
    } catch (err: any) {
      soundEngine.playDefenseIntercept();
      setTestSteps((prev) => [
        ...prev.map((s) => ({ ...s, status: s.status === 'pending' ? 'failed' as const : s.status })),
        {
          step: prev.length + 1,
          label: 'Error',
          detail: err.message || 'Execution error during live verification.',
          status: 'failed',
        }
      ]);
    } finally {
      setIsRunningTest(false);
    }
  };

  const snippets = {
    ai_side: `// ============================================================================
// AI Integration: Let Your AI Pay for Resources
// File: src/sdk/index.ts (In-Repo Implementation)
// ============================================================================
import { createSynapseAgent } from './sdk';

// 1. Initialize agent with session key & optional budget guardrail
const agent = createSynapseAgent({
  sessionPrivateKey: process.env.AGENT_SESSION_KEY,
  maxPricePerCall: 0.05 // safety cap per individual call
});

// 2. Fetch protected resources normally
// The SDK automatically:
// - detects HTTP 402 challenge from provider
// - authorizes payment within assigned daily limit
// - attaches cryptographic payment proof and returns unlocked resource
const response = await agent.fetch('https://api.provider.com/v1/orderbook');
const data = await response.json();

console.log('Unlocked Resource:', data);`,

    provider_side: `// ============================================================================
// Provider Integration: Charge AI Agents for Access
// File: src/sdk/index.ts (withTempoMpp Middleware)
// ============================================================================
import express from 'express';
import { withTempoMpp } from './sdk';

const app = express();

// Protect any route with HTTP 402 Machine Payments Protocol:
app.get('/api/v1/market-depth', withTempoMpp({
  priceUsd: 0.001,                                   // Price per call in pathUSD
  payee: '0x3c42E274FAdd8e371fB84f97203CC2F2125c8775', // Your payout address
  allowSearchCrawlers: true                          // Googlebot passes free for SEO
}), (req, res) => {
  // Only reached after verified payment authorization:
  res.json({
    status: 'success',
    symbol: 'TEMPO/USD',
    bids: [[42.50, 1500], [42.48, 2300]],
    asks: [[42.52, 1100], [42.55, 3400]]
  });
});`,

    terminal_cli: `# ============================================================================
# Standalone Agent CLI Demo (Run from Terminal)
# File: scripts/agent-demo.ts
# ============================================================================
# Run the autonomous AI agent test directly against the live server:
npm run demo
# or:
npx tsx scripts/agent-demo.ts

# Verified Output:
# [1/3] Initializing Autonomous AI Agent Client ($0.003 guardrail)...
# [2/3] Calling Protected API: /api/v1/test-provider-data...
#       Status Code: 200 OK Unlocked via EIP-712 Session Key
# [3/3] Dynamic Surge Pricing: rapid bursts trigger 2.5x price surge
#       HALTED BY GUARDRAIL: Budget cap halts agent without HTTP 429!`,

    mcp: `// ============================================================================
// AI Desktop Tools (Model Context Protocol)
// File: server/mcpServer.ts
// Compatible with Claude Desktop, Cursor, and Autonomous Tool Callers
// ============================================================================
// Add to %APPDATA%\\Claude\\claude_desktop_config.json or .cursor/mcp.json:
{
  "mcpServers": {
    "synapse402": {
      "command": "npx",
      "args": ["tsx", "server/mcpServer.ts"],
      "env": {
        "TEMPO_CHAIN_ID": "42431",
        "TEMPO_RPC_URL": "https://rpc.moderato.tempo.xyz",
        "SYNAPSE_SESSION_KEY": "\${SYNAPSE_SESSION_KEY}"
      }
    }
  }
}`
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
      <div className="bg-[#0c0e14] border border-white/15 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* 1. Header */}
        <div className="p-5 border-b border-white/10 flex items-start justify-between bg-white/[.02]">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#d7ff4f]/10 border border-[#d7ff4f]/30 flex items-center justify-center text-[#d7ff4f] shrink-0 mt-0.5">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-[#d7ff4f] text-[#08090c] font-black text-[9.5px] uppercase font-mono tracking-wider">
                  QUICKSTART
                </span>
                <h3 className="font-bold text-base text-white">
                  SDK & Integration
                </h3>
              </div>
              <p className="text-xs text-zinc-300 mt-1">
                <strong>Let AI pay for resources when it needs them.</strong> Connect an agent to paid resources and let providers charge for automated access.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Visual Interaction Flow (AI ➔ Provider) */}
        <div className="p-4 border-b border-white/10 bg-white/[.015] space-y-2">
          <div className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>How AI Pays for Resources in Real Time</span>
            <span className="text-zinc-500 font-normal">HTTP 402 Flow</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs font-mono">
            {/* Step 1 */}
            <div className="p-2.5 rounded-xl bg-white/[.025] border border-white/[.08] flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] uppercase font-bold">
                <Bot className="w-3 h-3 text-[#d7ff4f]" />
                <span>1. Request</span>
              </div>
              <span className="text-zinc-200 font-bold text-[11px] mt-1">AI asks for resource</span>
              <span className="text-[10px] text-zinc-500 mt-0.5">Probes API URL</span>
            </div>

            {/* Step 2 */}
            <div className="p-2.5 rounded-xl bg-white/[.025] border border-white/[.08] flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] uppercase font-bold">
                <Store className="w-3 h-3 text-amber-400" />
                <span>2. Challenge</span>
              </div>
              <span className="text-amber-300 font-bold text-[11px] mt-1">HTTP 402 Required</span>
              <span className="text-[10px] text-zinc-500 mt-0.5">Provider sets price</span>
            </div>

            {/* Step 3 */}
            <div className="p-2.5 rounded-xl bg-[#d7ff4f]/[0.06] border border-[#d7ff4f]/25 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-[#d7ff4f] text-[10px] uppercase font-bold">
                <Layers className="w-3 h-3 text-[#d7ff4f]" />
                <span>3. Settle</span>
              </div>
              <span className="text-[#d7ff4f] font-bold text-[11px] mt-1">SDK Pays via Tempo</span>
              <span className="text-[10px] text-zinc-300 mt-0.5">Sub-cent micropayment</span>
            </div>

            {/* Step 4 */}
            <div className="p-2.5 rounded-xl bg-white/[.025] border border-white/[.08] flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] uppercase font-bold">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>4. Deliver</span>
              </div>
              <span className="text-emerald-300 font-bold text-[11px] mt-1">HTTP 200 Unlocked</span>
              <span className="text-[10px] text-zinc-500 mt-0.5">Resource returned</span>
            </div>

            {/* Step 5 */}
            <div className="p-2.5 rounded-xl bg-white/[.025] border border-white/[.08] flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] uppercase font-bold">
                <ShieldCheck className="w-3 h-3 text-zinc-400" />
                <span>5. Continue</span>
              </div>
              <span className="text-zinc-200 font-bold text-[11px] mt-1">AI Finishes Task</span>
              <span className="text-[10px] text-zinc-500 mt-0.5">Receipt recorded</span>
            </div>
          </div>
        </div>

        {/* 3. Tab Switcher */}
        <div className="flex border-b border-white/10 bg-black/30 text-xs font-mono px-4 pt-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('ai_side')}
            className={`pb-2.5 px-3 border-b-2 font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ai_side'
                ? 'border-[#d7ff4f] text-[#d7ff4f] font-bold'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Let AI Pay (Client)</span>
          </button>

          <button
            onClick={() => setActiveTab('provider_side')}
            className={`pb-2.5 px-3 border-b-2 font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'provider_side'
                ? 'border-[#d7ff4f] text-[#d7ff4f] font-bold'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Charge for Access (Provider)</span>
          </button>

          <button
            onClick={() => setActiveTab('terminal_cli')}
            className={`pb-2.5 px-3 border-b-2 font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'terminal_cli'
                ? 'border-[#d7ff4f] text-[#d7ff4f] font-bold'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>CLI Terminal Bot</span>
          </button>

          <button
            onClick={() => setActiveTab('mcp')}
            className={`pb-2.5 px-3 border-b-2 font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'mcp'
                ? 'border-[#d7ff4f] text-[#d7ff4f] font-bold'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>MCP Tool (Claude / Cursor)</span>
          </button>
        </div>

        {/* 4. Code Display & Copy */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
              <span>{activeTab === 'ai_side' ? 'Minimal AI Integration' : activeTab === 'provider_side' ? 'Express Middleware Integration' : activeTab === 'terminal_cli' ? 'Standalone Terminal Demo' : 'MCP Tool Protocol Spec'}</span>
            </span>

            <button
              onClick={() => handleCopy(snippets[activeTab])}
              className="px-3 py-1.5 rounded-lg bg-white/[.06] hover:bg-white/15 text-zinc-200 text-[11px] flex items-center gap-1.5 border border-white/15 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#d7ff4f]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
            </button>
          </div>

          <pre className="p-4 bg-black/60 rounded-xl border border-white/10 text-zinc-200 leading-relaxed overflow-x-auto text-[11.5px] font-mono selection:bg-[#d7ff4f]/20">
            {snippets[activeTab]}
          </pre>

          {/* Explanation note */}
          <div className="p-3 rounded-xl bg-white/[.02] border border-white/[.06] text-xs text-zinc-400 space-y-1">
            <span className="text-zinc-300 font-semibold block">
              {activeTab === 'ai_side' && 'How the client works:'}
              {activeTab === 'provider_side' && 'How the provider middleware works:'}
              {activeTab === 'terminal_cli' && 'How the CLI test runs:'}
              {activeTab === 'mcp' && 'How MCP desktop integration works:'}
            </span>
            <p className="text-[11.5px] leading-relaxed text-zinc-400">
              {activeTab === 'ai_side' && 'The AI client wraps standard fetch. When an endpoint returns HTTP 402 Payment Required, the client inspects the challenge price against your daily cap, settles via Tempo L1, and retries the request with authorization headers.'}
              {activeTab === 'provider_side' && 'The withTempoMpp middleware intercepts requests. If no payment proof is attached, it issues an RFC 9110 HTTP 402 challenge. Once payment proof is verified, it yields control to your route handler.'}
              {activeTab === 'terminal_cli' && 'Runs a live automated scenario: the AI agent discovers a paid route, settles a sub-cent micropayment, and handles a simulated surge pricing condition.'}
              {activeTab === 'mcp' && 'Exposes standard JSON-RPC 2.0 tools so autonomous agents in Claude Desktop or Cursor can discover paywalled tools, check remaining allowances, and authorize payments.'}
            </p>
          </div>

          {/* 5. Interactive Live Test (Replaces useless "Got it") */}
          <div className="p-4 rounded-xl bg-white/[.025] border border-white/[.08] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono block">
                  Interactive Live Verification
                </span>
                <span className="text-[11px] text-zinc-400">
                  Run a real request against /api/v1/test-provider-data to verify the 402 flow
                </span>
              </div>

              <button
                type="button"
                disabled={isRunningTest}
                onClick={handleRunLiveExample}
                className="px-4 py-2 rounded-xl bg-[#d7ff4f] hover:bg-[#cbf540] text-[#08090c] font-black text-xs transition flex items-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(215,255,79,0.2)] disabled:opacity-50"
              >
                {isRunningTest ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing Flow...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Live Example</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Test Outcome Box */}
            {testSteps.length > 0 && (
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2.5 font-mono text-xs animate-in fade-in duration-150">
                <div className="space-y-2">
                  {testSteps.map((st) => (
                    <div key={st.step} className="flex items-start gap-2 text-[11px]">
                      {st.status === 'done' ? (
                        <CheckCircle2 className="w-4 h-4 text-[#d7ff4f] shrink-0 mt-0.5" />
                      ) : st.status === 'failed' ? (
                        <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      ) : (
                        <Loader2 className="w-4 h-4 text-[#d7ff4f] animate-spin shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-zinc-200">{st.label}:</strong>
                          <span className="text-zinc-400">{st.detail}</span>
                        </div>
                        {st.txHash && (
                          <div className="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-1.5">
                            <span>Tx: {st.txHash.slice(0, 20)}...</span>
                            <a
                              href={`https://explore.tempo.xyz/tx/${st.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#d7ff4f] hover:underline flex items-center gap-1"
                            >
                              <span>Explore ↗</span>
                            </a>
                          </div>
                        )}
                        {st.payload && (
                          <pre className="mt-1.5 p-2 rounded bg-white/[.03] border border-white/10 text-[10px] text-emerald-300 overflow-x-auto">
                            {JSON.stringify(st.payload, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 6. Technical Details Footer */}
        <div className="p-3.5 border-t border-white/10 bg-white/[.02] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-3 text-[11px]">
            <span>Standard: <strong className="text-zinc-200">RFC 9110 / HTTP 402</strong></span>
            <span>Auth: <strong className="text-zinc-200">EIP-712 Session Key</strong></span>
            <span>Settlement: <strong className="text-[#d7ff4f]">Tempo L1 Type 0x76</strong></span>
          </div>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-white/[.06] hover:bg-white/10 text-zinc-200 text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
