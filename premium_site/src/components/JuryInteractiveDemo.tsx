import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, RotateCcw, 
  ShieldCheck, Check, 
  Copy, Globe, Layers,
  Bot, ArrowLeftRight, Terminal, CheckCheck,
  Zap, ArrowRight, ChevronDown
} from 'lucide-react';
import { LivePaymentEvent } from '../types/synapse402';
import { soundEngine } from '../utils/audioEffects';

interface DemoAgent {
  id: string;
  name: string;
  role: string;
  dailyLimitUsd: number;
  spentTodayUsd: number;
}

interface DemoResource {
  id: string;
  name: string;
  costUsd: number;
  provider: string;
  sampleSummary: string;
  simulatedData: Record<string, any>;
}

interface ScenarioDefinition {
  id: string;
  ruleKey: 'normal' | 'over_budget' | 'unapproved_provider' | 'tampered_payment' | 'provider_failure' | 'duplicate_request';
  title: string;
  tag: string;
  tagStyle: string;
  description: string;
  outcomeType: 'SUCCESS' | 'BLOCKED' | 'REJECTED' | 'VOIDED' | 'CACHED';
  outcomeLabel: string;
  presetAgentId: string;
  presetResourceId: string;
  customTargetDomain?: string;
}

const DEMO_AGENTS: DemoAgent[] = [
  { id: 'key_quant_alpha', name: 'Market Data Agent', role: 'Approved market data snapshots & feeds', dailyLimitUsd: 50.00, spentTodayUsd: 0.000 },
  { id: 'key_cortex_research', name: 'Lead Research Agent', role: 'Private documents & approved sources on-demand', dailyLimitUsd: 50.00, spentTodayUsd: 0.000 },
  { id: 'key_sec_audit', name: 'Audit Agent', role: 'Smart contract vulnerability scanning', dailyLimitUsd: 25.00, spentTodayUsd: 0.000 },
  { id: 'key_polyglot_translator', name: 'Translator Agent', role: 'Technical document translation', dailyLimitUsd: 25.00, spentTodayUsd: 0.000 },
];

const DEMO_RESOURCES: DemoResource[] = [
  {
    id: 'res_market_depth',
    name: 'Licensed market snapshot',
    costUsd: 0.0010,
    provider: 'api.market-depth-mesh.io',
    sampleSummary: 'Example normalized L2 snapshot (licensed provider)',
    simulatedData: { symbol: 'ETH/pathUSD', price: '$2,640.50', sampleSpread: '$0.02', depthBids: 1420 },
  },
  {
    id: 'res_ai_reasoning',
    name: 'AI Answer',
    costUsd: 0.0008,
    provider: 'api.deepseek.com',
    sampleSummary: 'High-speed reasoning inference',
    simulatedData: { answer: 'Optimal delivery route calculated. Transit latency reduced by 14%.', latency: '180ms' },
  },
  {
    id: 'res_vector_search',
    name: 'Document Search',
    costUsd: 0.0010,
    provider: 'api.vector-index.io',
    sampleSummary: 'Semantic search across private index',
    simulatedData: { found: 3, topMatchScore: '94%', searchLatency: '11ms', index: 'financial_reports' },
  },
  {
    id: 'res_python_compute',
    name: 'Code Run',
    costUsd: 0.0025,
    provider: 'api.sandbox-python.dev',
    sampleSummary: 'Isolated cloud sandbox execution',
    simulatedData: { result: 'All test assertions passed cleanly', exitCode: 0, executionTime: '12ms', memory: '18MB' },
  },
];

const PRODUCTION_SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'sc_normal',
    ruleKey: 'normal',
    title: '1. Pay & Receive',
    tag: 'SUCCESS',
    tagStyle: 'text-[#d7ff4f] bg-[#d7ff4f]/10 border-[#d7ff4f]/30',
    description: 'The agent requests a private document search → the rules approve the cost → the result and payment status are returned.',
    outcomeType: 'SUCCESS',
    outcomeLabel: 'Response preview (no chain payment)',
    presetAgentId: 'key_cortex_research',
    presetResourceId: 'res_vector_search',
  },
  {
    id: 'sc_budget',
    ruleKey: 'over_budget',
    title: '2. Over Budget',
    tag: 'BLOCKED',
    tagStyle: 'text-zinc-300 bg-white/[0.04] border-white/10',
    description: 'The agent asks for more than its limit → blocked before payment → $0 spent.',
    outcomeType: 'BLOCKED',
    outcomeLabel: 'Blocked ($0.00 spent)',
    presetAgentId: 'key_quant_alpha',
    presetResourceId: 'res_market_depth',
  },
  {
    id: 'sc_whitelist',
    ruleKey: 'unapproved_provider',
    title: '3. Unapproved Provider',
    tag: 'BLOCKED',
    tagStyle: 'text-zinc-300 bg-white/[0.04] border-white/10',
    description: 'The agent tries an unapproved provider → blocked before payment → $0 spent.',
    outcomeType: 'BLOCKED',
    outcomeLabel: 'Blocked ($0.00 spent)',
    presetAgentId: 'key_quant_alpha',
    presetResourceId: 'res_market_depth',
    customTargetDomain: 'api.rogue-drainer.xyz',
  },
  {
    id: 'sc_tamper',
    ruleKey: 'tampered_payment',
    title: '4. Tampered Payment',
    tag: 'REJECTED',
    tagStyle: 'text-zinc-300 bg-white/[0.04] border-white/10',
    description: 'The payment details are changed → verification fails → $0 transferred.',
    outcomeType: 'REJECTED',
    outcomeLabel: 'Rejected ($0.00 transferred)',
    presetAgentId: 'key_sec_audit',
    presetResourceId: 'res_python_compute',
  },
  {
    id: 'sc_failure',
    ruleKey: 'provider_failure',
    title: '5. Provider Failure',
    tag: 'VOIDED',
    tagStyle: 'text-zinc-300 bg-white/[0.04] border-white/10',
    description: 'The provider fails → payment is cancelled before settlement → $0 lost.',
    outcomeType: 'VOIDED',
    outcomeLabel: 'Not Settled ($0.00 lost)',
    presetAgentId: 'key_cortex_research',
    presetResourceId: 'res_ai_reasoning',
    customTargetDomain: 'api.unreliable-provider.net',
  },
  {
    id: 'sc_duplicate',
    ruleKey: 'duplicate_request',
    title: '6. Duplicate Request',
    tag: 'CACHED',
    tagStyle: 'text-zinc-300 bg-white/[0.04] border-white/10',
    description: 'The same request is sent again → the saved result is reused → no extra charge.',
    outcomeType: 'CACHED',
    outcomeLabel: 'Cached ($0.00 additional)',
    presetAgentId: 'key_polyglot_translator',
    presetResourceId: 'res_vector_search',
  },
];

interface ExecutionResultState {
  status: 'IDLE' | 'SUCCESS' | 'FAILED' | 'BLOCKED' | 'REJECTED' | 'VOIDED' | 'CACHED';
  httpCode: number;
  httpLabel: string;
  scenarioTitle: string;
  heroMetric: string;
  whatHappened: string;
  systemResponse: string;
  whatThisProves: string;
  businessBenefit: string;
  payload: Record<string, any> | null;
  stoppedStepIndex: number;
  stepBadgeText: string;
}

interface JuryInteractiveDemoProps {
  onSimulatePayments: (newEvents: LivePaymentEvent[], totalCost: number) => void;
  onNavigateToTab?: (tab: 'dashboard' | 'live' | 'monetize' | 'demo' | 'architecture' | 'swarm', subView?: 'swarm' | 'stream' | 'mcp' | 'reality') => void;
  currentBlockHeight?: number;
  vaultTvl?: number;
  isRealWalletConnected?: boolean;
  walletAddress?: string | null;
  agents?: any[];
  autoRunTrigger?: { id: number; preset: string; fault: string; url?: string; cost?: number; category?: string; } | null;
}

export const JuryInteractiveDemo: React.FC<JuryInteractiveDemoProps> = ({
  onSimulatePayments,
  onNavigateToTab,
  currentBlockHeight = 0,
  vaultTvl = 244.44,
  isRealWalletConnected = false,
  walletAddress = null,
  agents: externalAgents,
  autoRunTrigger = null,
}) => {
  // Selected Scenario State
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('sc_normal');
  const activeScenario = PRODUCTION_SCENARIOS.find((s) => s.id === selectedScenarioId) || PRODUCTION_SCENARIOS[0];

  // Agent and Resource selection
  const [selectedAgentId, setSelectedAgentId] = useState<string>(activeScenario.presetAgentId);
  const activeAgent = DEMO_AGENTS.find((a) => a.id === selectedAgentId) || DEMO_AGENTS[0];

  const [selectedResourceId, setSelectedResourceId] = useState<string>(activeScenario.presetResourceId);
  const activeResource = DEMO_RESOURCES.find((r) => r.id === selectedResourceId) || DEMO_RESOURCES[0];

  // Pipeline flow states
  const [isRunning, setIsRunning] = useState(false);
  const [flowStep, setFlowStep] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [spentAmount, setSpentAmount] = useState<number>(0);

  // Result State with 4 Core Human Anchors
  const [executionResult, setExecutionResult] = useState<ExecutionResultState>({
    status: 'IDLE',
    httpCode: 0,
    httpLabel: '',
    scenarioTitle: '',
    heroMetric: '',
    whatHappened: '',
    systemResponse: '',
    whatThisProves: '',
    businessBenefit: '',
    payload: null,
    stoppedStepIndex: 0,
    stepBadgeText: '',
  });

  // Copy state
  const [copiedJson, setCopiedJson] = useState(false);

  // Handle Scenario Selection
  const handleSelectScenario = (sc: ScenarioDefinition) => {
    soundEngine.playClick();
    setSelectedScenarioId(sc.id);
    setSelectedAgentId(sc.presetAgentId);
    setSelectedResourceId(sc.presetResourceId);
    setFlowStep(0);
    setExecutionResult({
      status: 'IDLE',
      httpCode: 0,
      httpLabel: '',
      scenarioTitle: '',
      heroMetric: '',
      whatHappened: '',
      systemResponse: '',
      whatThisProves: '',
      businessBenefit: '',
      payload: null,
      stoppedStepIndex: 0,
      stepBadgeText: '',
    });
  };

  // Auto-run trigger support
  useEffect(() => {
    if (autoRunTrigger) {
      if (autoRunTrigger.preset) {
        const found = DEMO_RESOURCES.find((r) => r.id.includes(autoRunTrigger.preset));
        if (found) setSelectedResourceId(found.id);
      }
      if (autoRunTrigger.fault && autoRunTrigger.fault !== 'none' && autoRunTrigger.fault !== 'normal') {
        const faultMap: Record<string, string> = {
          bad_sig: 'sc_tamper',
          non_whitelist: 'sc_whitelist',
          overdraft: 'sc_budget',
          server_500: 'sc_failure',
          idempotent: 'sc_duplicate',
        };
        const mappedScenarioId = faultMap[autoRunTrigger.fault] || 'sc_normal';
        setSelectedScenarioId(mappedScenarioId);
        executeScenarioById(mappedScenarioId);
      } else {
        setSelectedScenarioId('sc_normal');
        executeNormalPurchase();
      }
    }
  }, [autoRunTrigger]);

  const executeScenarioById = (scId: string) => {
    const sc = PRODUCTION_SCENARIOS.find((s) => s.id === scId) || PRODUCTION_SCENARIOS[0];
    if (sc.ruleKey === 'normal') {
      executeNormalPurchase();
    } else {
      executeRuleTest(sc.ruleKey, sc.title, sc.customTargetDomain);
    }
  };

  // 1. Pay & Receive (Normal Purchase — Primary Happy Path)
  const executeNormalPurchase = async () => {
    if (isRunning) return;
    soundEngine.playClick();
    setIsRunning(true);
    setFlowStep(1); // 01 Request
    setExecutionResult((prev) => ({ ...prev, status: 'IDLE' }));

    await new Promise((r) => setTimeout(r, 200));
    setFlowStep(2); // 02 402 Challenge

    await new Promise((r) => setTimeout(r, 200));
    setFlowStep(3); // 03 Policy Check

    await new Promise((r) => setTimeout(r, 200));
    setFlowStep(4); // 04 Payment Credential
    const t0 = performance.now();

    try {
      const res = await fetch('/api/mpp/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyId: activeAgent.id,
          targetUrl: `https://${activeResource.provider}/v1/resource`,
          pricePathUsd: activeResource.costUsd,
          category: 'RESEARCH & DATA',
          allowDynamicWhitelist: true,
          evaluationOnly: true,
        }),
      });
      const elapsed = Math.max(11, Math.round(performance.now() - t0));
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.trace || !['SETTLED', 'SIMULATED_PASS'].includes(data.trace.status)) {
        throw new Error(data?.error || `Settlement failed (HTTP ${res.status})`);
      }

      const isLiveSettlement = data.trace.status === 'SETTLED' && data.trace.executionMode === 'LIVE_TESTNET' && Boolean(data.trace.txHash);
      if (isLiveSettlement) soundEngine.playSettlementChime();
      setFlowStep(5); // 05 Result
      setSpentAmount((prev) => prev + (isLiveSettlement ? activeResource.costUsd : 0));

      const realTx = data.trace.txHash;
      onSimulatePayments([
        {
          id: `ev_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          agentName: activeAgent.name,
          serviceName: activeResource.name,
          serviceUrl: `https://${activeResource.provider}`,
          amountUsd: activeResource.costUsd,
          latencyMs: elapsed,
          status: data.trace.status,
          executionMode: data.trace.executionMode || 'RESILIENT_SANDBOX',
          blockNumber: data.trace.blockNumber || currentBlockHeight,
          txHash: realTx || '',
        },
      ], activeResource.costUsd);

      setExecutionResult({
        status: 'SUCCESS',
        httpCode: 200,
        httpLabel: isLiveSettlement ? 'HTTP 200 OK' : 'HTTP 200 OK · evaluation response',
        scenarioTitle: isLiveSettlement ? 'Scenario 1: Pay & Receive → 200 OK SUCCESS' : 'Scenario 1: Request approved → preview returned',
        heroMetric: `${isLiveSettlement ? `+$${activeResource.costUsd.toFixed(4)} Paid` : `Planned $${activeResource.costUsd.toFixed(4)} payment step`} · ${isLiveSettlement ? 'Resource delivered' : 'Resource preview returned'} (${isLiveSettlement ? 'L1 confirmed' : 'no chain write'})`,
        whatHappened: `Agent requested "${activeResource.name}" from ${activeResource.provider} for $${activeResource.costUsd.toFixed(4)}.`,
        systemResponse: `Provider returned an HTTP 402 challenge. The gateway checked the policy and returned the resource; ${isLiveSettlement ? 'the payment is confirmed on Tempo L1.' : 'this evaluation did not submit a blockchain transaction.'}`,
        whatThisProves: `An AI agent can independently acquire a paid resource via HTTP 402 without manual card checkout.`,
        businessBenefit: `Autonomous operation unlocked within spending limits. The provider receives the configured amount when the confirmed trace is available.`,
        payload: {
          statusCode: 200,
          statusText: 'OK',
          unlockedData: activeResource.simulatedData,
          settlement: {
            tempoTxHash: isLiveSettlement ? realTx : '',
            blockNumber: data.trace.blockNumber || currentBlockHeight,
            policyLatencyMs: elapsed,
            costPathUsd: activeResource.costUsd,
            protocolFeeUsd: 0.000001,
          }
        },
        stoppedStepIndex: 5,
        stepBadgeText: 'COMPLETED',
      });

    } catch (err) {
      soundEngine.playDefenseIntercept();
      const message = err instanceof Error ? err.message : 'Settlement failed';
      setExecutionResult({
        status: 'FAILED',
        httpCode: 502,
        httpLabel: 'Payment not confirmed',
        scenarioTitle: 'Scenario 1: Settlement failed',
        heroMetric: '$0.00 charged · Resource not delivered',
        whatHappened: `The agent requested "${activeResource.name}" but settlement could not be confirmed.`,
        systemResponse: message,
        whatThisProves: 'The walkthrough reports an unconfirmed payment instead of claiming success.',
        businessBenefit: 'Unconfirmed requests do not appear as successful spend.',
        payload: null,
        stoppedStepIndex: 4,
        stepBadgeText: 'FAILED — NO CONFIRMED PAYMENT',
      });
      setFlowStep(4);
    } finally {
      setIsRunning(false);
    }
  };

  // 2-6. Rule Tests
  const executeRuleTest = async (ruleKey: string, scenarioTitle: string, customDomain?: string) => {
    if (isRunning) return;
    soundEngine.playClick();
    setIsRunning(true);
    setFlowStep(1);
    setExecutionResult((prev) => ({ ...prev, status: 'IDLE' }));

    await new Promise((r) => setTimeout(r, 200));
    setFlowStep(2); // 02 402 Challenge

    await new Promise((r) => setTimeout(r, 200));

    // SCENARIO 2: Hard Budget Cap Exceeded (Halted at Step 3 Policy Check)
    if (ruleKey === 'over_budget') {
      soundEngine.playDefenseIntercept();
      setFlowStep(3);
      setExecutionResult({
        status: 'BLOCKED',
        httpCode: 403,
        httpLabel: 'HTTP 403 Forbidden',
        scenarioTitle: `${scenarioTitle} → BLOCKED`,
        heroMetric: '$0.00 Spent · Overdraft Blocked Off-Chain',
        whatHappened: `Agent requested $50.01 with a $50.00 spending cap.`,
        systemResponse: `Gateway policy engine halted request off-chain before payment credential generation. No blockchain transaction submitted.`,
        whatThisProves: `Spending limits are enforced off-chain before any payment credential or blockchain transaction can occur.`,
        businessBenefit: `Hard Policy Enforcement: Exactly $0.00 spent. Runaway agent loops are halted before reaching the chain.`,
        payload: {
          statusCode: 403,
          error: 'BUDGET_CAP_EXCEEDED',
          detail: `Requested call exceeds key spending cap of $${activeAgent.dailyLimitUsd.toFixed(2)}.`,
          offChainHalt: true,
          tempoGasCharged: '$0.000000',
          deductedUsd: 0.00,
        },
        stoppedStepIndex: 3,
        stepBadgeText: 'HALTED OFF-CHAIN',
      });
      setIsRunning(false);
      return;
    }

    // SCENARIO 3: Non-Whitelisted Target (Halted at Step 3 Policy Check)
    if (ruleKey === 'unapproved_provider') {
      soundEngine.playDefenseIntercept();
      setFlowStep(3);
      const domain = customDomain || 'api.rogue-drainer.xyz';
      setExecutionResult({
        status: 'BLOCKED',
        httpCode: 403,
        httpLabel: 'HTTP 403 Forbidden',
        scenarioTitle: `${scenarioTitle} → BLOCKED`,
        heroMetric: '$0.00 Spent · Unapproved Target Dropped',
        whatHappened: `Agent attempted to spend money on unapproved domain "${domain}" outside the provider allowlist.`,
        systemResponse: `Allowlist validation failed. Request dropped off-chain before payment signing. Zero payment submitted.`,
        whatThisProves: `The agent cannot be tricked by prompt injection into funding unauthorized destinations.`,
        businessBenefit: `Zero Malicious Drains: Exactly $0.00 spent. Malicious phishing and prompt injections blocked.`,
        payload: {
          statusCode: 403,
          error: 'NON_WHITELISTED_DOMAIN',
          targetDomain: domain,
          merkleProofValidation: 'FAILED_ROOT_MISMATCH',
          offChainHalt: true,
          deductedUsd: 0.00,
        },
        stoppedStepIndex: 3,
        stepBadgeText: 'HALTED OFF-CHAIN',
      });
      setIsRunning(false);
      return;
    }

    // Pass Step 3 for remaining scenarios
    setFlowStep(3);
    await new Promise((r) => setTimeout(r, 200));

    // SCENARIO 4: Tampered Signature (Rejected at Step 4 Payment Credential)
    if (ruleKey === 'tampered_payment') {
      soundEngine.playDefenseIntercept();
      setFlowStep(4);
      setExecutionResult({
        status: 'REJECTED',
        httpCode: 401,
        httpLabel: 'HTTP 401 Unauthorized',
        scenarioTitle: `${scenarioTitle} → REJECTED`,
        heroMetric: '$0.00 Transferred · Signature Rejected',
        whatHappened: `Amount or signature altered, causing an EIP-712 credential mismatch.`,
        systemResponse: `Gateway verified cryptographic signature and rejected execution before settlement. No payment transferred.`,
        whatThisProves: `Altered transactions and signature tampering cannot compromise agent funds.`,
        businessBenefit: `Cryptographic Security: Exactly $0.00 transferred. Tampered proofs are rejected instantly.`,
        payload: {
          statusCode: 401,
          error: 'ECDSA_INVALID_SIG',
          verification: 'FAILED_SIGNATURE_DIGEST_MISMATCH',
          gatewayCheck: 'REJECTED_BEFORE_CHAIN_SUBMIT',
          contractAction: 'NO_SETTLEMENT',
          transferredUsd: 0.00,
        },
        stoppedStepIndex: 4,
        stepBadgeText: 'REJECTED BEFORE SETTLEMENT',
      });
      setIsRunning(false);
      return;
    }

    // Pass Step 4 for Scenarios 5 & 6
    setFlowStep(4);
    await new Promise((r) => setTimeout(r, 200));

    // SCENARIO 5: Provider 500 Crash (Payment Voided Before Settlement at Step 5)
    if (ruleKey === 'provider_failure') {
      soundEngine.playDefenseIntercept();
      setFlowStep(5);
      const domain = customDomain || 'api.unreliable-provider.net';
      setExecutionResult({
        status: 'VOIDED',
        httpCode: 502,
        httpLabel: 'HTTP 502 Bad Gateway',
        scenarioTitle: `${scenarioTitle} → NOT SETTLED`,
        heroMetric: '$0.00 Debited · Payment Voided Before Settlement',
        whatHappened: `Upstream server at ${domain} crashed (HTTP 500) and failed to deliver data.`,
        systemResponse: `Provider failed before settlement. Gateway detected upstream error and voided the payment. Zero funds transferred.`,
        whatThisProves: `Money is settled only upon successful resource delivery (No deliverable, no pay).`,
        businessBenefit: `Zero Wasted Spend: Exactly $0.00 debited. You never pay for broken links or crashed servers.`,
        payload: {
          statusCode: 502,
          error: 'UPSTREAM_500_SERVER_CRASH',
          upstreamHost: domain,
          settlementAction: 'PAYMENT_VOIDED_BEFORE_SETTLEMENT',
          refundStatus: 'NO_FUNDS_TRANSFERRED',
          lostUsd: 0.00,
        },
        stoppedStepIndex: 5,
        stepBadgeText: 'NOT SETTLED (VOIDED)',
      });
      setIsRunning(false);
      return;
    }

    // SCENARIO 6: Duplicate Request (Cached at Step 5)
    if (ruleKey === 'duplicate_request') {
      soundEngine.playSettlementChime();
      setFlowStep(5);
      setExecutionResult({
        status: 'CACHED',
        httpCode: 200,
        httpLabel: 'HTTP 200 OK (Cache Hit)',
        scenarioTitle: `${scenarioTitle} → NO SECOND CHARGE`,
        heroMetric: 'Additional Charge: $0.00 · Idempotency Cache Hit',
        whatHappened: `The exact same request was re-sent within the idempotency window.`,
        systemResponse: `Gateway matched idempotency key and returned cached deliverable without charging again.`,
        whatThisProves: `Accidental bot retries and network loops never cause duplicate billing.`,
        businessBenefit: `Idempotency Protected: Additional charge: $0.00. Identical retries return stored result.`,
        payload: {
          statusCode: 200,
          servedFromCache: true,
          idempotencyKey: 'idem_replay_guard_829402',
          cachedPayload: activeResource.simulatedData,
          secondChargeUsd: 0.00,
          originalTx: null,
        },
        stoppedStepIndex: 5,
        stepBadgeText: 'CACHED ($0.00 EXTRA)',
      });
      setIsRunning(false);
      return;
    }
  };

  const handleReset = () => {
    soundEngine.playClick();
    setFlowStep(0);
    setSpentAmount(0);
    setSelectedScenarioId('sc_normal');
    setSelectedAgentId('key_cortex_research');
    setSelectedResourceId('res_vector_search');
    setExecutionResult({
      status: 'IDLE',
      httpCode: 0,
      httpLabel: '',
      scenarioTitle: '',
      heroMetric: '',
      whatHappened: '',
      systemResponse: '',
      whatThisProves: '',
      businessBenefit: '',
      payload: null,
      stoppedStepIndex: 0,
      stepBadgeText: '',
    });
  };

  const currentProviderHost = activeScenario.customTargetDomain || activeResource.provider;

  return (
    <div className="space-y-7 font-sans text-zinc-200 w-full">
      
      {/* 1. HEADER (QUIET, DIRECT, NO SIMULATOR JARGON) */}
      <div className="bg-[#151b23] border border-white/[.09] rounded-3xl p-6 sm:p-8 space-y-3 relative overflow-hidden shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#d7ff4f]" />
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#d7ff4f]">
                PAYMENT SCENARIO TESTS
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Test how the system handles AI payment scenarios
            </h1>
             <p className="text-sm sm:text-base text-zinc-300 max-w-3xl leading-relaxed">
               This is a demo simulation. Pick a scenario to see how the agent, provider, and payment system react.
             </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            disabled={isRunning}
            className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/15 text-slate-200 hover:text-white transition cursor-pointer flex items-center gap-1.5 text-xs font-mono shrink-0 self-start sm:self-auto shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset</span>
          </button>
        </div>

        {executionResult.txHash && executionResult.status === 'SUCCESS' && (
          <a
            href={`https://explore.tempo.xyz/tx/${executionResult.txHash}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#d7ff4f] hover:underline"
          >
            Open confirmed payment on Tempo Explorer ↗
          </a>
        )}
      </div>

      {/* 2. THE SCENARIOS: MAIN FLOW + GUARDRAILS */}
      <div className="rounded-3xl border border-white/[.09] bg-[#121820] p-5 sm:p-7 shadow-[0_18px_60px_rgba(0,0,0,0.18)] space-y-5 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 text-xs font-mono relative z-10">
          <div>
            <div className="font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#d7ff4f]" />
              <span>CHOOSE A SCENARIO TO TEST</span>
            </div>
            <div className="mt-3 max-w-4xl border-l-2 border-zinc-500 bg-white/[0.035] rounded-r-xl px-4 py-3 text-base sm:text-lg font-semibold font-sans normal-case tracking-normal leading-snug text-white">
               <strong className="text-[#d7ff4f]">Demo:</strong> pick a case. In the full version, tell the agent what you need. It picks the team and steps.
            </div>
          </div>
          <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider">6 scenarios · 1 payment flow</span>
        </div>

        {(() => {
          const happySc = PRODUCTION_SCENARIOS.find((scenario) => scenario.id === 'sc_normal')!;
          const isSelected = selectedScenarioId === happySc.id;
          return (
            <button
              type="button"
              onClick={() => handleSelectScenario(happySc)}
              className={`w-full rounded-xl border p-4 text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#1b232d] border-white/15 border-l-4 border-l-[#d7ff4f] shadow-sm'
                  : 'bg-white/[0.025] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded bg-[#d7ff4f]/15 text-[#d7ff4f] border border-[#d7ff4f]/25 font-mono text-[10px] font-black">PRIMARY DEMO</span>
                  <span className="text-sm font-black text-white">{happySc.title}</span>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-white/[.05] text-zinc-300 border-white/10">
                  {executionResult.status === 'SUCCESS' && executionResult.txHash ? 'SUCCESS' : 'READY'}
                </span>
              </div>
              <p className="mt-2 text-xs text-zinc-300 leading-relaxed">{happySc.description}</p>
            </button>
          );
        })()}
        {/* Secondary cases stay available without competing with the main flow. */}
        <details open={false} className="group space-y-2 pt-3 border-t border-white/[0.06]">
          <summary className="cursor-pointer list-none rounded-xl border border-white/10 bg-white/[0.035] hover:bg-white/[0.06] hover:border-[#d7ff4f]/30 px-3.5 py-3 text-[11px] font-mono uppercase tracking-wider text-zinc-200 font-bold flex items-center justify-between gap-3 transition">
            <span className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/[0.06] border border-white/10 text-zinc-300">
                <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
              </span>
              <span>
                <span className="block">OPEN SAFETY SCENARIOS</span>
                <span className="mt-0.5 block text-[10px] normal-case tracking-normal font-sans font-normal text-zinc-500">See what gets blocked, rejected, cancelled, or reused</span>
              </span>
            </span>
            <span className="text-[10px] normal-case tracking-normal text-zinc-400 shrink-0">5 cases · Open</span>
          </summary>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PRODUCTION_SCENARIOS.filter((sc) => sc.id !== 'sc_normal').map((sc, idx) => {
              const isSelected = sc.id === selectedScenarioId;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => handleSelectScenario(sc)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer space-y-2 relative group ${
                    isSelected
                      ? 'bg-white/[.08] border-[#d7ff4f] shadow-[0_0_20px_rgba(215,255,79,0.2)] ring-1 ring-[#d7ff4f]/60 backdrop-blur-sm'
                      : 'bg-white/[.02] hover:bg-white/[.05] border-white/[.08] hover:border-white/20 backdrop-blur-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-black tracking-tight ${
                        isSelected ? 'bg-[#d7ff4f] text-[#08090c]' : 'bg-white/[0.06] text-zinc-400 border border-white/10'
                      }`}>
                        0{idx + 2}
                      </span>
                      <span className={`text-xs font-black tracking-tight truncate ${isSelected ? 'text-[#d7ff4f]' : 'text-zinc-200'}`}>
                        {sc.title}
                      </span>
                    </div>
                    <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${
                      isSelected ? 'bg-[#d7ff4f]/20 text-[#d7ff4f] border-[#d7ff4f]/40' : sc.tagStyle
                    }`}>
                      {sc.tag}
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-300 font-sans leading-relaxed line-clamp-2">
                    {sc.description}
                  </p>

                  <div className="text-[10px] font-mono pt-1.5 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-zinc-500 uppercase text-[8.5px] font-bold">Outcome</span>
                    <span className="text-zinc-300 font-semibold truncate max-w-[170px]">
                      {sc.outcomeLabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </details>
      </div>

      {/* 3. EXECUTION STAGE: BUYER ➔ RUN CTA ➔ SELLER */}
      <div className="rounded-3xl border border-white/[.09] bg-[#151b23] p-5 sm:p-7 shadow-[0_22px_70px_rgba(0,0,0,0.22)] space-y-5 relative overflow-hidden">
        {/* Dynamic Motion Stage: Contoured Buyer Card vs Contoured Seller Card */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center relative z-10">
          
          {/* Buyer Card */}
          <div className="md:col-span-4 p-5 rounded-xl bg-[#1b222c] border border-white/[.08] space-y-3 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-zinc-400" />
                <span>AI AGENT</span>
              </span>
              <span className="text-[9.5px] font-mono font-bold px-2 py-0.5 rounded border border-white/10 text-zinc-300 bg-white/[0.04]">
                {flowStep === 5 ? (executionResult.txHash ? '✓ SETTLED' : '✓ PREPARED') : flowStep >= 1 ? 'AUTHORIZING' : 'READY'}
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-base font-black text-white tracking-tight">{activeAgent.name}</span>
                <span className="text-xs font-mono text-[#d7ff4f] font-bold px-2 py-0.5 rounded bg-[#d7ff4f]/10 border border-[#d7ff4f]/20 shadow-[0_0_10px_rgba(215,255,79,0.15)]">
                  Job limit: ${activeAgent.dailyLimitUsd.toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-slate-300 line-clamp-1">{activeAgent.role}</div>
            </div>

            <div className="p-3 rounded-xl bg-white/[.03] border border-white/[.06] space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300 uppercase text-[9.5px] font-bold">Remaining limit</span>
                <span className="text-white font-bold text-sm">
                  ${(activeAgent.dailyLimitUsd - (activeScenario.ruleKey === 'over_budget' ? 50.00 : spentAmount)).toFixed(2)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#d7ff4f] rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(215,255,79,0.5)]"
                  style={{ width: `${Math.min(100, (((activeScenario.ruleKey === 'over_budget' ? 50.00 : spentAmount) / activeAgent.dailyLimitUsd) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span>Spent Today: <strong className="text-zinc-100 font-semibold">${(activeScenario.ruleKey === 'over_budget' ? 50.00 : spentAmount).toFixed(4)}</strong></span>
                <span>Approved providers only</span>
              </div>
            </div>
          </div>

          {/* Central Trigger & Motion Rail */}
          <div className="md:col-span-3 flex flex-col items-center justify-center py-1 space-y-3">
            {flowStep === 4 ? (
              <div className="px-3.5 py-1.5 rounded-lg bg-[#d7ff4f] text-[#090b10] font-black text-xs font-mono shadow-[0_0_20px_rgba(215,255,79,0.45)] animate-pulse">
                ${activeResource.costUsd.toFixed(4)} Settlement ➔
              </div>
            ) : flowStep === 5 ? (
              <div className="px-3.5 py-1.5 rounded-lg bg-white/[0.06] border border-white/20 text-zinc-100 font-bold text-xs font-mono shadow-sm">
                {activeScenario.ruleKey === 'normal'
                  ? (executionResult.txHash ? '✓ Delivered (<15ms check)' : '✓ Result prepared')
                  : '✓ $0.00 Protected'}
              </div>
            ) : (
              <div className="text-slate-300 text-xs font-mono flex items-center gap-1.5">
                <ArrowLeftRight className="w-3.5 h-3.5 text-zinc-500" />
                <span className="font-semibold text-slate-200">Payment step</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => executeScenarioById(selectedScenarioId)}
              disabled={isRunning}
              className="w-full py-3.5 px-5 rounded-xl bg-[#d7ff4f] hover:bg-[#cbf540] text-[#090b10] font-black text-xs font-mono uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_24px_rgba(215,255,79,0.35),inset_0_1px_0_rgba(255,255,255,0.5),0_4px_16px_rgba(0,0,0,0.5)] hover:shadow-[0_0_36px_rgba(215,255,79,0.55),inset_0_1px_0_rgba(255,255,255,0.6)] hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-2 relative overflow-hidden"
            >
              <Zap className="w-4 h-4 fill-current shrink-0" />
              <span>{isRunning ? 'Processing...' : 'Run selected flow'}</span>
            </button>
          </div>

          {/* Seller Card (API Merchant Terminal Motif) */}
          <div className="md:col-span-4 p-5 rounded-xl bg-[#1b222c] border border-white/[.08] space-y-3 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-zinc-400" />
                <span>EXAMPLE PROVIDER</span>
              </span>
                <span className="text-[9.5px] font-mono font-bold text-[#d7ff4f] px-2 py-0.5 rounded bg-[#d7ff4f]/10 border border-[#d7ff4f]/30 shadow-[0_0_10px_rgba(215,255,79,0.15)]">
                {executionResult.status === 'SUCCESS' ? 'RESPONSE READY' : 'REQUEST NEEDS APPROVAL'}
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-base font-black text-white tracking-tight">{activeResource.name}</span>
                <span className="text-base font-mono font-black text-[#d7ff4f]">
                  ${activeResource.costUsd.toFixed(4)}
                </span>
              </div>
              <div className="text-xs text-zinc-400 line-clamp-1">{activeResource.sampleSummary}</div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#11161d] border border-white/[0.08] space-y-1 text-xs font-mono">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-zinc-500 uppercase font-bold">API Endpoint</span>
                <span className="text-zinc-300 font-medium truncate max-w-[140px]">{currentProviderHost}</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-zinc-500 uppercase font-bold">Access status</span>
                <span className="text-[#d7ff4f] font-bold">Protected · ready</span>
              </div>
            </div>
          </div>

        </div>

        {/* 5 MPP Pipeline Steps: Official Machine Payments Protocol Sequence */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 border-t border-white/[0.06] text-xs font-mono">
          
          {/* STEP 1: REQUEST */}
          <div className={`p-3 rounded-xl border space-y-1 transition-all ${
            flowStep >= 1 ? 'bg-white/[0.04] border-[#d7ff4f]/40 text-white shadow-sm' : 'bg-[#121820] border-white/[0.05] text-zinc-600'
          }`}>
            <div className="font-bold flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5">
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-black ${flowStep >= 1 ? 'bg-[#d7ff4f] text-black' : 'bg-white/5 text-zinc-500'}`}>01</span>
                <span>Request</span>
              </span>
              {flowStep >= 1 ? (
                <Check className="w-3.5 h-3.5 text-[#d7ff4f]" />
              ) : (
                <span className="text-[9px] text-zinc-600 font-normal">IDLE</span>
              )}
            </div>
            <div className="text-[10px] text-zinc-400">AI requests resource</div>
          </div>

          {/* STEP 2: 402 CHALLENGE */}
          <div className={`p-3 rounded-xl border space-y-1 transition-all ${
            flowStep >= 2 ? 'bg-white/[0.04] border-[#d7ff4f]/40 text-white shadow-sm' : 'bg-[#121820] border-white/[0.05] text-zinc-600'
          }`}>
            <div className="font-bold flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5">
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-black ${flowStep >= 2 ? 'bg-[#d7ff4f] text-black' : 'bg-white/5 text-zinc-500'}`}>02</span>
                <span>Payment request</span>
              </span>
              {flowStep >= 2 ? (
                <Check className="w-3.5 h-3.5 text-[#d7ff4f]" />
              ) : (
                <span className="text-[9px] text-zinc-600 font-normal">WAITING</span>
              )}
            </div>
            <div className="text-[10px] text-zinc-400">Provider asks for payment</div>
          </div>

          {/* STEP 3: POLICY CHECK */}
          <div className={`p-3 rounded-xl border space-y-1 transition-all ${
            executionResult.stoppedStepIndex === 3
              ? 'bg-white/[0.04] border-white/20 text-white shadow-sm'
              : flowStep >= 3
              ? 'bg-white/[0.04] border-[#d7ff4f]/40 text-white shadow-sm'
              : 'bg-[#121820] border-white/[0.05] text-zinc-600'
          }`}>
            <div className="font-bold flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5">
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                  executionResult.stoppedStepIndex === 3 ? 'bg-zinc-300 text-black' : flowStep >= 3 ? 'bg-[#d7ff4f] text-black' : 'bg-white/5 text-zinc-500'
                }`}>03</span>
                <span>Spending rules</span>
              </span>
              {executionResult.stoppedStepIndex === 3 ? (
                <span className="text-[9px] font-mono font-bold text-zinc-300 px-1.5 py-0.2 rounded bg-white/10 border border-white/20">✕ BLOCKED</span>
              ) : flowStep >= 3 ? (
                <Check className="w-3.5 h-3.5 text-[#d7ff4f]" />
              ) : (
                <span className="text-[9px] text-zinc-600 font-normal">WAITING</span>
              )}
            </div>
            <div className="text-[10px] text-zinc-400">
              {executionResult.stoppedStepIndex === 3 ? 'Spending limit enforced' : 'Budget and provider checked'}
            </div>
          </div>

          {/* STEP 4: PAYMENT */}
          <div className={`p-3 rounded-xl border space-y-1 transition-all ${
            executionResult.stoppedStepIndex === 3
              ? 'bg-[#121820] border-white/[0.04] text-zinc-600 opacity-50'
              : executionResult.stoppedStepIndex === 4
              ? 'bg-white/[0.04] border-white/20 text-white shadow-sm'
              : flowStep >= 4
              ? 'bg-white/[0.04] border-[#d7ff4f]/40 text-white shadow-sm'
              : 'bg-[#121820] border-white/[0.05] text-zinc-600'
          }`}>
            <div className="font-bold flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5">
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                  executionResult.stoppedStepIndex === 4 ? 'bg-zinc-300 text-black' : flowStep >= 4 ? 'bg-[#d7ff4f] text-black' : 'bg-white/5 text-zinc-500'
                }`}>04</span>
                <span>Payment</span>
              </span>
              {executionResult.stoppedStepIndex === 3 ? (
                <span className="text-[9px] text-zinc-600 font-normal">SKIPPED</span>
              ) : executionResult.stoppedStepIndex === 4 ? (
                <span className="text-[9px] font-mono font-bold text-zinc-300 px-1.5 py-0.2 rounded bg-white/10 border border-white/20">✕ REJECTED</span>
              ) : flowStep >= 4 ? (
                <Check className="w-3.5 h-3.5 text-[#d7ff4f]" />
              ) : (
                <span className="text-[9px] text-zinc-600 font-normal">WAITING</span>
              )}
            </div>
            <div className="text-[10px] text-zinc-400">
              {executionResult.stoppedStepIndex === 3
                ? 'Payment not attempted'
                : executionResult.stoppedStepIndex === 4
                ? 'Credential verification failed'
                : 'Payment authorization verified'}
            </div>
          </div>

          {/* STEP 5: RESULT */}
          <div className={`p-3 rounded-xl border space-y-1 transition-all ${
            executionResult.stoppedStepIndex === 3 || executionResult.stoppedStepIndex === 4
              ? 'bg-[#121820] border-white/[0.03] text-zinc-600 opacity-50'
              : executionResult.status === 'SUCCESS'
              ? 'bg-white/[0.04] border-[#d7ff4f] text-white shadow-[0_0_15px_rgba(215,255,79,0.15)]'
              : executionResult.status === 'CACHED'
              ? 'bg-white/[0.04] border-white/20 text-white'
              : executionResult.status !== 'IDLE'
              ? 'bg-white/[0.03] border-white/20 text-white'
              : 'bg-[#121820] border-white/[0.05] text-zinc-600'
          }`}>
            <div className="font-bold flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5">
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                  executionResult.status === 'SUCCESS' ? 'bg-[#d7ff4f] text-black' : executionResult.status !== 'IDLE' ? 'bg-zinc-300 text-black' : 'bg-white/5 text-zinc-500'
                }`}>05</span>
                <span>Result</span>
              </span>
              {executionResult.stoppedStepIndex === 3 || executionResult.stoppedStepIndex === 4 ? (
                <span className="text-[9px] text-zinc-600 font-normal">SKIPPED</span>
              ) : executionResult.status === 'SUCCESS' ? (
                <Check className="w-3.5 h-3.5 text-[#d7ff4f]" />
              ) : executionResult.status === 'CACHED' ? (
                <span className="text-[9px] font-bold text-zinc-300 px-1.5 py-0.2 rounded bg-white/10 border border-white/20">CACHED</span>
              ) : executionResult.status === 'VOIDED' ? (
                <span className="text-[9px] font-bold text-zinc-300 px-1.5 py-0.2 rounded bg-white/10 border border-white/20">⤾ VOIDED</span>
              ) : executionResult.status !== 'IDLE' ? (
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-300" />
              ) : (
                <span className="text-[9px] text-zinc-600 font-normal">WAITING</span>
              )}
            </div>
            <div className="text-[10px] text-zinc-400">
              {executionResult.stoppedStepIndex === 3 || executionResult.stoppedStepIndex === 4
                ? 'No funds transferred'
                : executionResult.status === 'SUCCESS'
                ? (executionResult.payload?.settlement?.tempoTxHash ? '200 OK + L1 receipt' : '200 OK · evaluation response')
                : executionResult.status === 'CACHED'
                ? 'Cached ($0.00 extra)'
                : executionResult.status === 'VOIDED'
                ? '500 Crash: $0.00 debited'
                : 'Awaiting execution'}
            </div>
          </div>

        </div>

        {/* 4. DYNAMIC RESULT CARD (WITH EXPLICIT "WHAT THIS PROVES" ANCHOR) */}
        {executionResult.status !== 'IDLE' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#1a2028] border border-white/[0.10] space-y-5 text-xs animate-in fade-in shadow-xl">
            
            {/* Top Result Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                {executionResult.status === 'SUCCESS' ? (
                  <CheckCircle2 className="w-5 h-5 text-[#d7ff4f] shrink-0" />
                ) : executionResult.status === 'CACHED' ? (
                  <CheckCheck className="w-5 h-5 text-cyan-400 shrink-0" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-zinc-300 shrink-0" />
                )}
                <div>
                  <div className="font-mono text-base font-bold text-white flex items-center gap-2">
                    <span>{executionResult.scenarioTitle}</span>
                  </div>
                  <div className="text-xs font-mono text-zinc-400 mt-0.5">
                    Status: <strong className={executionResult.status === 'SUCCESS' ? 'text-[#d7ff4f]' : executionResult.status === 'CACHED' ? 'text-cyan-300' : 'text-zinc-200'}>{executionResult.httpLabel}</strong>
                  </div>
                </div>
              </div>

              {/* Authoritative Hero Metric Badge */}
              <div className="text-right shrink-0">
                <div className={`text-xs font-mono font-bold px-3.5 py-1.5 rounded-xl border shadow-sm ${
                  executionResult.status === 'SUCCESS'
                    ? 'border-[#d7ff4f]/40 bg-[#d7ff4f]/10 text-[#d7ff4f]'
                    : executionResult.status === 'CACHED'
                    ? 'border-cyan-500/30 bg-cyan-950/40 text-cyan-300'
                    : 'border-white/15 bg-white/[0.04] text-white'
                }`}>
                  {executionResult.heroMetric}
                </div>
              </div>
            </div>

            {/* 4 Core Human Anchors: WHAT HAPPENED ➔ SYSTEM RESPONSE ➔ WHAT THIS PROVES ➔ BUSINESS BENEFIT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider block font-bold">
                  1. What Happened
                </span>
                <p className="text-zinc-300 text-xs leading-relaxed">{executionResult.whatHappened}</p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider block font-bold">
                  2. System Response
                </span>
                <p className="text-zinc-300 text-xs leading-relaxed">{executionResult.systemResponse}</p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                <span className="text-zinc-400 font-mono text-[10px] uppercase tracking-wider block font-bold">
                  3. What This Proves
                </span>
                <p className="text-zinc-200 text-xs leading-relaxed font-medium">{executionResult.whatThisProves}</p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-[#d7ff4f]/[0.02] border border-[#d7ff4f]/25 space-y-1.5">
                <span className="text-[#d7ff4f] font-mono text-[10px] uppercase tracking-wider block font-bold">
                  4. Business Benefit
                </span>
                <p className="text-white font-semibold text-xs leading-relaxed">{executionResult.businessBenefit}</p>
              </div>
            </div>

            {/* Returned payload: keep it readable without a separate black terminal block. */}
            {executionResult.payload && (
              <div className="p-4 sm:p-5 rounded-2xl bg-[#1a2028] border border-white/[0.08] space-y-2 font-mono">
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3 h-3 text-[#d7ff4f]" />
                    <span>
                      {executionResult.status === 'SUCCESS' ? 'HTTP 200 Payload Delivered' : 'Server Machine Response (Verified)'}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(executionResult.payload, null, 2));
                      soundEngine.playClick();
                      setCopiedJson(true);
                      setTimeout(() => setCopiedJson(false), 2000);
                    }}
                    className="text-[10px] text-zinc-500 hover:text-white transition flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-2.5 h-2.5" />
                    <span>{copiedJson ? 'Copied JSON' : 'Copy JSON'}</span>
                  </button>
                </div>

                <pre className="p-2.5 rounded-lg bg-[#11161d] text-[11px] text-zinc-300 overflow-x-auto border border-white/[0.08] leading-relaxed">
                  {JSON.stringify(executionResult.payload, null, 2)}
                </pre>
              </div>
            )}

            {/* AI CONTINUES (WHAT THIS PAYMENT ENABLED) */}
            {executionResult.status === 'SUCCESS' && (
              <div className="p-3 rounded-xl bg-[#d7ff4f]/[0.03] border border-[#d7ff4f]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#d7ff4f] shrink-0" />
                  <span className="font-bold text-[#d7ff4f]">AI CONTINUES:</span>
                  <span className="text-zinc-200 font-sans">
                    {activeResource.id === 'res_market_depth'
                      ? 'Example market snapshot reviewed → no live trade was executed.'
                      : activeResource.id === 'res_ai_reasoning'
                      ? 'Example model response returned → the result is ready for review.'
                      : activeResource.id === 'res_vector_search'
                      ? '3 matching private documents found → Lead Research Agent prepared the result.'
                      : 'Evaluation result prepared → no live settlement was submitted.'}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono shrink-0 font-semibold uppercase tracking-wider">
                  ✓ Result ready
                </span>
              </div>
            )}

          </div>
        )}

      </div>

      {/* 4. WHY THIS MATTERS (4 HUMAN BUSINESS PERSPECTIVES) */}
      <div className="rounded-3xl border border-white/[.08] bg-[#0e1318] p-5 sm:p-7 shadow-sm space-y-3.5 font-sans relative overflow-hidden">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d7ff4f] shadow-[0_0_8px_rgba(215,255,79,0.8)]" />
            <span>Why This Matters In The Real World</span>
          </span>
          <span className="text-zinc-400 text-[10.5px] font-mono bg-white/[0.03] px-2 py-0.5 rounded border border-white/10">Real-World Utility</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-xl bg-white/[.025] hover:bg-white/[.05] border border-white/[.08] hover:border-white/20 transition-all space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-white font-black text-xs">
                <Bot className="w-3.5 h-3.5 text-[#d7ff4f]" />
                <span>Agent owners</span>
              </div>
              <span className="text-[9px] font-mono font-bold text-[#d7ff4f] bg-[#d7ff4f]/10 border border-[#d7ff4f]/30 px-1.5 py-0.5 rounded">
                NO MANUAL CHECKOUT
              </span>
            </div>
            <p className="text-zinc-300 text-[11.5px] leading-relaxed">
              Agents buy paid data feeds and private web resources autonomously without human credit card checkouts.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[.025] hover:bg-white/[.05] border border-white/[.08] hover:border-white/20 transition-all space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-white font-black text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-300" />
                <span>People who set limits</span>
              </div>
              <span className="text-[9px] font-mono font-bold text-zinc-200 bg-white/10 border border-white/20 px-1.5 py-0.5 rounded">
                HARD CAPS
              </span>
            </div>
            <p className="text-zinc-300 text-[11.5px] leading-relaxed">
              Hard daily spending caps stop runaway agent loops off-chain. Unauthorized requests are rejected before payment.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[.025] hover:bg-white/[.05] border border-white/[.08] hover:border-white/20 transition-all space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-white font-black text-xs">
                <Globe className="w-3.5 h-3.5 text-zinc-400" />
                <span>Website Owners</span>
              </div>
              <span className="text-[9px] font-mono font-bold text-zinc-300 bg-white/[0.06] border border-white/10 px-1.5 py-0.5 rounded">
                PAY PER REQUEST
              </span>
            </div>
            <p className="text-zinc-300 text-[11.5px] leading-relaxed">
              Instead of returning an empty block, a service can ask an agent to pay for the exact resource it requests.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[.025] hover:bg-white/[.05] border border-white/[.08] hover:border-white/20 transition-all space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-white font-black text-xs">
                <Zap className="w-3.5 h-3.5 text-[#d7ff4f]" />
                <span>Rules + payment</span>
              </div>
              <span className="text-[9px] font-mono font-bold text-[#d7ff4f] bg-[#d7ff4f]/10 border border-[#d7ff4f]/30 px-1.5 py-0.5 rounded">
                RULE CHECK + RECEIPT
              </span>
            </div>
            <p className="text-zinc-300 text-[11.5px] leading-relaxed">
              Policy check happens before delivery; a live on-chain confirmation and receipt appear only when the backend provides them.
            </p>
          </div>
        </div>
      </div>

      {/* 5. CLEAN FOOTER LINK TO EARN TAB (NO ROLE CONFUSION) */}
      <div className="p-4 rounded-xl bg-white/[0.025] backdrop-blur-md border border-white/[0.08] flex items-center justify-between text-xs font-mono">
        <span className="text-zinc-400 flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-zinc-500" />
          <span>Website owner looking to earn from AI visits instead of blocking them with empty 403 errors?</span>
        </span>
        <button
          type="button"
          onClick={() => onNavigateToTab?.('monetize')}
          className="text-[#d7ff4f] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
        >
          <span>See Earn from Bots</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

    </div>
  );
};
