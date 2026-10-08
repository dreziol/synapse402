import { TEMPO_EXPLORER_URL, tempoTransactionUrl } from '../config/network';
import React, { useState, useEffect } from 'react';
import { TEMPO_RECEIVER_ADDRESS } from '../config/network';
import { 
  CheckCircle2, FileCheck, RotateCcw, 
  ShieldCheck, Check, 
  Copy, Globe, Layers,
  Bot, ArrowLeftRight, ArrowRight, Terminal, CheckCheck,
  Zap, ChevronDown, ExternalLink
} from 'lucide-react';
import { LivePaymentEvent } from '../types/synapse402';
import { soundEngine } from '../utils/audioEffects';
import { useSynapseState } from '../shared/SynapseStateContext';
import { normalizeSynapseStatus } from '../shared/types';
import { SynapseStatusBadge } from './shared/SynapseStatusBadge';
import { SynapseTechnicalDetails } from './shared/SynapseTechnicalDetails';

interface DemoAgent {
  id: string;
  name: string;
  role: string;
  reusableCapUsd: number;
  cumulativeUsageUsd: number;
  sessionKey?: string;
  whitelistedDomains?: string[];
}

interface DemoResource {
  id: string;
  name: string;
  costUsd: number;
  provider: string;
  endpointUrl: string;
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
  { id: 'key_quant_alpha', name: 'Market Data Agent', role: 'Approved market data snapshots & feeds', reusableCapUsd: 50.00, cumulativeUsageUsd: 0.000 },
  { id: 'key_cortex_research', name: 'Lead Research Agent', role: 'Private documents & approved sources on-demand', reusableCapUsd: 50.00, cumulativeUsageUsd: 0.000 },
  { id: 'key_sec_audit', name: 'Audit Agent', role: 'Smart contract vulnerability scanning', reusableCapUsd: 25.00, cumulativeUsageUsd: 0.000 },
  { id: 'key_polyglot_translator', name: 'Translator Agent', role: 'Technical document translation', reusableCapUsd: 25.00, cumulativeUsageUsd: 0.000 },
];

// Only this key is currently registered and ACTIVE in the deployed demo vault.
// Pair the live happy path with its approved local market-data route; keep the
// document-search sample available for evaluation mode.
const LIVE_WALKTHROUGH_AGENT_ID = 'key_quant_alpha';
const LIVE_WALKTHROUGH_RESOURCE_ID = 'res_market_depth';

const DEMO_RESOURCES: DemoResource[] = [
  {
    id: 'res_market_depth',
    name: 'Sample market snapshot',
    costUsd: 0.0010,
    provider: 'Amberdata Demo Integration',
    endpointUrl: '/api/v1/market/sol-orderbook',
    sampleSummary: 'SOL/USDT market-depth evaluation fixture',
    simulatedData: { symbol: 'SOL/USDT', price: '$148.50', spreadBps: 2.1, liquidityScore: 94.8 },
  },
  {
    id: 'res_ai_reasoning',
    name: 'Sample AI answer',
    costUsd: 0.0008,
    provider: 'demo-ai-response.synapse402.network',
    endpointUrl: '/api/v1/data/ai-market-analysis',
    sampleSummary: 'Sample reasoning response',
    simulatedData: { answer: 'Optimal delivery route calculated. Transit latency reduced by 14%.', latency: '180ms' },
  },
  {
    id: 'res_vector_search',
    name: 'Sample document search',
    costUsd: 0.0010,
    provider: 'demo-document-search.synapse402.network',
    endpointUrl: '/api/v1/data/unlocked-article',
    sampleSummary: 'Sample document-search response',
    simulatedData: { found: 3, topMatchScore: '94%', searchLatency: '11ms', index: 'financial_reports' },
  },
  {
    id: 'res_python_compute',
    name: 'Sample code run',
    costUsd: 0.0050,
    provider: 'demo-code-run.synapse402.network',
    endpointUrl: '/api/v1/data/python-sandbox',
    sampleSummary: 'Sample code-execution response',
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
    description: 'Paid resource requested → approved → result returned.',
    outcomeType: 'SUCCESS',
    outcomeLabel: 'Sample response · check receipt status',
    presetAgentId: 'key_cortex_research',
    presetResourceId: 'res_vector_search',
  },
  {
    id: 'sc_budget',
    ruleKey: 'over_budget',
    title: '2. Over Budget',
    tag: 'BLOCKED',
    tagStyle: 'text-zinc-300 bg-white/[0.04] border-white/10',
    description: 'Over the cap → blocked before payment.',
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
    description: 'Unapproved provider → blocked before payment.',
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
    description: 'Payment proof changed → rejected before transfer.',
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
    description: 'A provider-failure signal is received before authorization → payment is not sent.',
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
    description: 'Same request again → saved result reused.',
    outcomeType: 'CACHED',
    outcomeLabel: 'Cached ($0.00 additional)',
    presetAgentId: 'key_polyglot_translator',
    presetResourceId: 'res_vector_search',
  },
];

interface ExecutionResultState {
  status: 'IDLE' | 'SUCCESS' | 'FAILED' | 'BLOCKED' | 'REJECTED' | 'VOIDED' | 'CACHED';
  txHash?: string;
  receiptVerified?: boolean;
  resourceName?: string;
  resourcePreview?: string;
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
  networkMode?: 'LIVE_TESTNET' | 'RESILIENT_SANDBOX';
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
  networkMode = 'RESILIENT_SANDBOX',
  walletAddress = null,
  agents: externalAgents,
  autoRunTrigger = null,
}) => {
  // Selected Scenario State
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('sc_normal');
  // Keep the happy path visible first. Guardrail scenarios stay available
  // behind “Change scenario” so the page reads as one payment story.
  // Keep the primary story visible first; the full scenario set remains
  // available through the existing “Change scenario” control.
  const [scenarioPickerOpen, setScenarioPickerOpen] = useState(true);
  const activeScenario = PRODUCTION_SCENARIOS.find((s) => s.id === selectedScenarioId) || PRODUCTION_SCENARIOS[0];

  // Agent and Resource selection
  const [selectedAgentId, setSelectedAgentId] = useState<string>(
    networkMode === 'LIVE_TESTNET' && activeScenario.ruleKey === 'normal'
      ? LIVE_WALKTHROUGH_AGENT_ID
      : activeScenario.presetAgentId
  );
  // Use the same live agent accounts as Bots & Budgets when they are available.
  // Keep the local demo list as a fallback so the walkthrough still works while
  // the initial API request is loading or when the app is used offline.
  const syncedAgents: DemoAgent[] = Array.isArray(externalAgents)
    ? externalAgents
      // A depleted/paused key must never be offered as a runnable agent.
      .filter((agent: any) => !agent.status || agent.status === 'ACTIVE')
      .map((agent: any): DemoAgent => ({
        id: String(agent.id ?? agent.keyId ?? ''),
        name: String(agent.name ?? agent.agentName ?? 'Agent'),
        role: String(agent.role ?? 'Approved resources'),
        reusableCapUsd: Number(agent.reusableCapUsd ?? agent.totalBudgetUsd ?? agent.totalBudgetPathUsd ?? 0),
        cumulativeUsageUsd: Number(agent.cumulativeUsageUsd ?? agent.currentSpentUsd ?? agent.currentSpentPathUsd ?? 0),
        sessionKey: String(agent.sessionKey ?? agent.sessionPublicKey ?? ''),
        whitelistedDomains: Array.isArray(agent.whitelistedDomains) ? agent.whitelistedDomains : [],
      }))
      .filter((agent) => agent.id && Number.isFinite(agent.reusableCapUsd))
    : [];
  const availableAgents = syncedAgents.length > 0 ? syncedAgents : DEMO_AGENTS;
  const activeAgent = availableAgents.find((a) => a.id === selectedAgentId)
    || availableAgents.find((a) => a.id === activeScenario.presetAgentId)
    || availableAgents[0];

  const [selectedResourceId, setSelectedResourceId] = useState<string>(
    networkMode === 'LIVE_TESTNET' && activeScenario.ruleKey === 'normal'
      ? LIVE_WALKTHROUGH_RESOURCE_ID
      : activeScenario.presetResourceId
  );
  const activeResource = DEMO_RESOURCES.find((r) => r.id === selectedResourceId) || DEMO_RESOURCES[0];
  const [jobBudgetInput, setJobBudgetInput] = useState<string>(activeResource.costUsd.toFixed(4));

  useEffect(() => {
    setJobBudgetInput(activeResource.costUsd.toFixed(4));
  }, [activeResource.id, activeResource.costUsd]);

  useEffect(() => {
    if (activeScenario.ruleKey !== 'normal') return;
    const liveHappyPath = networkMode === 'LIVE_TESTNET';
    setSelectedAgentId(liveHappyPath ? LIVE_WALKTHROUGH_AGENT_ID : activeScenario.presetAgentId);
    setSelectedResourceId(liveHappyPath ? LIVE_WALKTHROUGH_RESOURCE_ID : activeScenario.presetResourceId);
  }, [networkMode, activeScenario.ruleKey, activeScenario.presetAgentId, activeScenario.presetResourceId]);
 // Every scenario uses the same visible job maximum. Safety scenarios deliberately
 // request more than this value or fail a later policy check, so the jury sees one
 // consistent control instead of a hidden per-agent cap.
 const visibleBudgetUsd = Number(jobBudgetInput) || activeResource.costUsd;

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
  const [showTechnicalResponse, setShowTechnicalResponse] = useState(false);
  const [executionTrace, setExecutionTrace] = useState<any>(null);
  const { recordJobExpense, setJobBudgetLimit, executePayment } = useSynapseState();
  const hasConfirmedTx = executionResult.receiptVerified === true
    && typeof executionResult.txHash === 'string'
    && /^0x[a-fA-F0-9]{64}$/.test(executionResult.txHash);

  // Handle Scenario Selection
  const handleSelectScenario = (sc: ScenarioDefinition) => {
    soundEngine.playClick();
    setSelectedScenarioId(sc.id);
    const liveHappyPath = networkMode === 'LIVE_TESTNET' && sc.ruleKey === 'normal';
    const agentId = liveHappyPath ? LIVE_WALKTHROUGH_AGENT_ID : sc.presetAgentId;
    const resourceId = liveHappyPath ? LIVE_WALKTHROUGH_RESOURCE_ID : sc.presetResourceId;
    setSelectedAgentId(agentId);
    setSelectedResourceId(resourceId);
    const selectedResource = DEMO_RESOURCES.find((resource) => resource.id === resourceId);
    if (selectedResource) setJobBudgetInput(selectedResource.costUsd.toFixed(4));
    setFlowStep(0);
    setShowTechnicalResponse(false);
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
      const triggerResource = autoRunTrigger.preset
        ? DEMO_RESOURCES.find((r) => r.id.includes(autoRunTrigger.preset))
        : undefined;
      if (autoRunTrigger.preset) {
        if (triggerResource) setSelectedResourceId(triggerResource.id);
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
        const liveHappyPath = networkMode === 'LIVE_TESTNET';
        const normalAgent = availableAgents.find((agent) => agent.id === (liveHappyPath ? LIVE_WALKTHROUGH_AGENT_ID : 'key_cortex_research')) || activeAgent;
        const normalResource = liveHappyPath
          ? DEMO_RESOURCES.find((resource) => resource.id === LIVE_WALKTHROUGH_RESOURCE_ID)
          : triggerResource;
        executeNormalPurchase(normalResource || triggerResource, normalAgent);
      }
    }
  }, [autoRunTrigger]);

  useEffect(() => {
    if (executionResult.status === 'IDLE') return;
    const timer = window.setTimeout(() => {
      document.getElementById('execution-result')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [executionResult.status]);

  const executeScenarioById = (scId: string) => {
    const sc = PRODUCTION_SCENARIOS.find((s) => s.id === scId) || PRODUCTION_SCENARIOS[0];
    const liveHappyPath = networkMode === 'LIVE_TESTNET' && sc.ruleKey === 'normal';
    const scenarioAgentId = liveHappyPath ? LIVE_WALKTHROUGH_AGENT_ID : sc.presetAgentId;
    const scenarioResourceId = liveHappyPath ? LIVE_WALKTHROUGH_RESOURCE_ID : sc.presetResourceId;
    const scenarioAgent = availableAgents.find((agent) => agent.id === scenarioAgentId) || activeAgent;
    const scenarioResource = DEMO_RESOURCES.find((resource) => resource.id === scenarioResourceId) || activeResource;
    if (sc.ruleKey === 'normal') {
      executeNormalPurchase(scenarioResource, scenarioAgent);
    } else {
      executeRuleTest(sc.ruleKey, sc.title, sc.customTargetDomain, scenarioAgent, scenarioResource);
    }
  };

  // 1. Pay & Receive (Normal Purchase — Primary Happy Path)
  const executeNormalPurchase = async (resourceOverride?: DemoResource, agentOverride?: DemoAgent) => {
    if (isRunning) return;
    const resource = resourceOverride || activeResource;
    const agent = agentOverride || activeAgent;
    const effectiveJobBudgetUsd = Number(jobBudgetInput);
    if (!Number.isFinite(effectiveJobBudgetUsd) || effectiveJobBudgetUsd < resource.costUsd) {
      setExecutionResult((prev) => ({
        ...prev,
        status: 'BLOCKED',
        httpCode: 402,
        httpLabel: 'Job limit too low',
        scenarioTitle: 'Payment blocked before transfer',
        heroMetric: `$${resource.costUsd.toFixed(4)} needed`,
        whatHappened: `This resource costs $${resource.costUsd.toFixed(4)}, but this job allows only $${Number(effectiveJobBudgetUsd || 0).toFixed(4)}.`,
        systemResponse: 'Increase the job limit and run again.',
        whatThisProves: 'The job limit stops an over-budget payment before any transfer.',
        businessBenefit: 'You choose one maximum for this run; the agent cannot spend above it.',
        payload: null,
        stoppedStepIndex: 2,
        stepBadgeText: 'BLOCKED BEFORE PAYMENT',
      }));
      setFlowStep(3);
      return;
    }
    if (networkMode === 'LIVE_TESTNET') {
      try {
        const keysResponse = await fetch('/api/keys');
        const keysPayload = await keysResponse.json();
        const session = Array.isArray(keysPayload.keys)
          ? keysPayload.keys.find((key: any) => String(key.id) === agent.id)
          : undefined;
        const sessionAddress = String(session?.sessionPublicKey || '');
        const endpoint = new URL(resource.endpointUrl, window.location.origin);
        const endpointAllowed = Array.isArray(session?.whitelistedDomains)
          && session.whitelistedDomains.some((entry: string) => {
            if (entry.startsWith('/')) return entry === endpoint.pathname;
            try {
              const approved = new URL(entry);
              return approved.origin === endpoint.origin
                && (approved.pathname === '/' || endpoint.pathname === approved.pathname || endpoint.pathname.startsWith(`${approved.pathname.replace(/\/$/, '')}/`));
            } catch {
              return false;
            }
          });
        const balanceResponse = sessionAddress
          ? await fetch(`/api/wallet/balance?address=${encodeURIComponent(sessionAddress)}`)
          : null;
        const balance = balanceResponse?.ok ? await balanceResponse.json() : null;
        if (!endpointAllowed || balance?.sessionStatus !== 'ACTIVE') {
          setExecutionResult({
            status: 'BLOCKED',
            httpCode: 403,
            httpLabel: 'Live session or provider route is not active',
            scenarioTitle: 'Payment stopped before settlement',
            heroMetric: '$0.00 charged',
            whatHappened: `${agent.name} cannot pay this provider route with an ACTIVE Tempo session.`,
            systemResponse: 'Choose an ACTIVE session and an approved provider route. No payment was attempted.',
            whatThisProves: 'The walkthrough checks the deployed session and provider allowlist before settlement.',
            businessBenefit: 'An inactive session or unapproved route is stopped before funds can move.',
            payload: null,
            stoppedStepIndex: 2,
            stepBadgeText: 'BLOCKED BEFORE PAYMENT',
          });
          setFlowStep(3);
          return;
        }
      } catch {
        setExecutionResult({
          status: 'BLOCKED',
          httpCode: 503,
          httpLabel: 'Could not verify live session',
          scenarioTitle: 'Payment stopped before settlement',
          heroMetric: '$0.00 charged',
          whatHappened: 'The deployed session status could not be checked.',
          systemResponse: 'The payment was not attempted. Retry after the Tempo session check succeeds.',
          whatThisProves: 'Live payments stay blocked unless the session can be verified on-chain.',
          businessBenefit: 'A status-check failure cannot turn into an unverified payment.',
          payload: null,
          stoppedStepIndex: 2,
          stepBadgeText: 'BLOCKED BEFORE PAYMENT',
        });
        setFlowStep(3);
        return;
      }
    }
    soundEngine.playClick();
    setIsRunning(true);
    setShowTechnicalResponse(false);
    setFlowStep(1); // 01 Request to Provider
    setExecutionResult((prev) => ({ ...prev, status: 'IDLE' }));

    const endpointUrl = resource.endpointUrl || `/api/v1/data/stock-orderbook`;
    let challengePrice = resource.costUsd;
    let challengePayee = TEMPO_RECEIVER_ADDRESS;

    // Step 1: Probe the provider endpoint to trigger the native HTTP 402 challenge
    try {
      const probeRes = await fetch(endpointUrl, { method: 'GET' });
      if (probeRes.status === 402) {
        const header = probeRes.headers.get('WWW-Authenticate') || probeRes.headers.get('x-tempo-mpp-challenge');
        if (header) {
          const read = (name: string) => header.match(new RegExp(`${name}="([^"]+)"`, 'i'))?.[1] || '';
          const p = Number(read('minPrice'));
          const r = read('recipient');
          if (Number.isFinite(p) && p > 0) challengePrice = p;
          if (r) challengePayee = r;
        }
      }
    } catch {
      // Offline fallback
    }

    await new Promise((r) => setTimeout(r, 200));
    setFlowStep(2); // 02 402 Challenge Received

    await new Promise((r) => setTimeout(r, 200));
    setFlowStep(3); // 03 Policy & Budget Check

    await new Promise((r) => setTimeout(r, 200));
    setFlowStep(4); // 04 Payment Credential & Tempo L1 Settlement
    const t0 = performance.now();

    try {
      const settleRes = await executePayment({
        keyId: agent.id,
        targetUrl: endpointUrl,
        pricePathUsd: challengePrice,
        category: 'RESEARCH & DATA',
        allowDynamicWhitelist: false,
        evaluationOnly: networkMode !== 'LIVE_TESTNET',
        jobId: `walkthrough_${resource.id}_${Date.now()}`,
        jobBudgetPathUsd: effectiveJobBudgetUsd,
        recipient: challengePayee,
        serviceName: resource.name,
        providerName: resource.provider,
      });

      const elapsed = settleRes.latencyMs;
      const data = { trace: settleRes.trace };
      setExecutionTrace(settleRes.trace);

      // Step 5: Retry the same provider endpoint with the cryptographic payment credentials to receive the real deliverable
      let deliveredPayload: any = null;
      let providerHttpStatus = 200;
      let providerError = '';
      let providerDelivered = false;
      try {
        const trace = settleRes.trace;
        const idempotencyKey = `walkthrough_${resource.id}_${Date.now()}`;
        const headers: Record<string, string> = {
          'Idempotency-Key': idempotencyKey,
          'X-Tempo-MPP-Signature': trace.eip712Signature || '',
          'X-Tempo-Nonce-2D': trace.nonce2D || '',
          'X-Tempo-Cost-PathUSD': String(trace.costPathUsd || challengePrice),
          'X-Synapse-Trace-Id': trace.id || '',
          'X-Synapse-Execution-Mode': trace.executionMode || 'RESILIENT_SANDBOX',
        };
        if (trace.txHash) headers['X-Tempo-Tx-Hash'] = trace.txHash;
        if (trace.mppCredential) {
          const c = trace.mppCredential;
          headers['X-Tempo-MPP-Signer'] = c.signer || '';
          headers['X-Tempo-MPP-Payee'] = c.payee || challengePayee;
          headers['X-Tempo-MPP-Amount-Micro'] = String(c.amountMicro || Math.round(challengePrice * 1e6));
          headers['X-Tempo-MPP-Endpoint'] = c.endpoint || endpointUrl;
          headers['X-Tempo-MPP-Endpoint-Hash'] = c.endpointHash || '';
          headers['X-Tempo-MPP-Memo'] = c.memo || '';
          headers['X-Tempo-MPP-Valid-Before'] = String(c.validBefore || '');
          headers['X-Tempo-MPP-Chain-Id'] = String(c.chainId || '');
          headers['X-Tempo-MPP-Verifying-Contract'] = c.verifyingContract || '';
          headers['X-Tempo-MPP-Channel-Id'] = String(c.channelId ?? '');
          headers['X-Tempo-MPP-Nonce'] = String(c.nonce ?? '');
        }
        const signer = trace.authAuthorizationHeader?.match(/signer="([^"]+)"/)?.[1] || trace.sessionKey || 'gateway-managed';
        headers['Authorization'] = `MPP-EIP712 signer="${signer}", nonce="${trace.nonce2D || ''}", max="${challengePrice}"`;

        const retryRes = await fetch(endpointUrl, { method: 'GET', headers });
        providerHttpStatus = retryRes.status;
        if (!retryRes.ok) {
          providerError = `Provider returned HTTP ${retryRes.status} ${retryRes.statusText || ''}`.trim();
        } else {
          try {
            deliveredPayload = await retryRes.json();
            providerDelivered = true;
          } catch {
            providerHttpStatus = 502;
            providerError = 'Provider response was not valid JSON.';
          }
        }
      } catch (providerErr) {
        providerHttpStatus = 502;
        providerError = providerErr instanceof Error ? providerErr.message : String(providerErr);
      }

      const hasVerifiedTempoReceipt = settleRes.status === 'CONFIRMED'
        && settleRes.trace.receiptVerified === true
        && typeof settleRes.txHash === 'string'
        && /^0x[a-fA-F0-9]{64}$/.test(settleRes.txHash);
      const isLiveSettlement = hasVerifiedTempoReceipt;
      if (isLiveSettlement) soundEngine.playSettlementChime();
      setFlowStep(providerDelivered ? 5 : 4); // Provider response is complete only after the authenticated retry succeeds.
      setSpentAmount((prev) => prev + (isLiveSettlement ? challengePrice : 0));
      recordJobExpense(`walkthrough_${resource.id}`, challengePrice, isLiveSettlement);

      // Never attach a raw or provisional hash to the visible receipt UI.
      // A link exists only for a receipt the backend has verified on Tempo.
      const realTx = hasVerifiedTempoReceipt ? settleRes.txHash! : '';
      onSimulatePayments([
        {
          id: `ev_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          agentName: agent.name,
          serviceName: resource.name,
          serviceUrl: endpointUrl,
          amountUsd: challengePrice,
          latencyMs: elapsed,
          status: settleRes.trace.status,
          executionMode: settleRes.trace.executionMode || 'RESILIENT_SANDBOX',
          blockNumber: settleRes.trace.blockNumber || currentBlockHeight,
          txHash: realTx || '',
          receiptVerified: hasVerifiedTempoReceipt,
        },
      ], challengePrice);

      setExecutionResult({
        status: providerDelivered ? 'SUCCESS' : 'FAILED',
        txHash: realTx || '',
        receiptVerified: hasVerifiedTempoReceipt,
        resourceName: resource.name,
        resourcePreview: resource.sampleSummary,
        httpCode: providerHttpStatus,
        httpLabel: providerDelivered
          ? (isLiveSettlement ? 'HTTP 200 OK · resource received' : 'HTTP 200 OK · evaluation resource received')
          : `HTTP ${providerHttpStatus} · provider response not received`,
        scenarioTitle: providerDelivered
          ? (isLiveSettlement ? 'Scenario 1: Pay & Receive → 200 OK SUCCESS' : 'Scenario 1: Request approved → resource received')
          : 'Scenario 1: Provider response failed',
        heroMetric: providerDelivered
          ? (isLiveSettlement ? `+$${challengePrice.toFixed(4)} paid` : 'Evaluation delivery · $0.0000 charged')
          : (hasVerifiedTempoReceipt ? `+$${challengePrice.toFixed(4)} charged · no delivery` : '$0.00 charged · no delivery'),
        whatHappened: providerDelivered
          ? (isLiveSettlement
            ? '402 challenge received → policy approved the request → Tempo settlement confirmed → resource delivered.'
            : '402 challenge received → policy approved the evaluation → sample response returned without sending a blockchain transaction.')
          : (hasVerifiedTempoReceipt
            ? 'The payment is confirmed on Tempo, but the provider did not return the requested resource.'
            : 'The provider did not return the requested resource; no payment receipt was confirmed.'),
        systemResponse: providerDelivered
          ? (isLiveSettlement
            ? 'Payment confirmed on Tempo L1; the receipt is available to inspect.'
            : `Evaluation passed. $${challengePrice.toFixed(4)} was planned, $0.0000 was charged, and no chain receipt was created.`)
          : (providerError || `Provider response failed with HTTP ${providerHttpStatus}.`),
        whatThisProves: providerDelivered
          ? (isLiveSettlement
            ? `A confirmed Tempo receipt records $${challengePrice.toFixed(4)} to the shared demo payment receiver within the job limit, and the paid resource is delivered.`
            : 'The request, budget check, and sample delivery were exercised locally. This preview does not prove a Tempo payment or a live provider response.')
          : (hasVerifiedTempoReceipt
            ? 'The payment receipt is confirmed, but the provider result is unavailable. The receipt link shows the settled payment.'
            : 'No provider result or confirmed payment receipt was returned.'),
        businessBenefit: providerDelivered
          ? (isLiveSettlement
            ? 'One job maximum constrained the payment; the receipt makes the settlement auditable.'
            : 'A safe preview demonstrates the request flow without risking funds; live settlement requires a confirmed Tempo receipt.')
          : 'A provider failure is shown as a failed delivery; a confirmed charge remains visible and auditable.',
        payload: {
          statusCode: providerHttpStatus,
          statusText: providerDelivered ? 'OK' : 'Provider response failed',
          ...(providerError ? { error: providerError } : {}),
          unlockedData: deliveredPayload,
          settlement: {
            tempoTxHash: isLiveSettlement ? realTx : '',
            blockNumber: data.trace.blockNumber || currentBlockHeight,
            policyLatencyMs: elapsed,
            costPathUsd: challengePrice,
            protocolFeeUsd: 0.000001,
          }
        },
        stoppedStepIndex: providerDelivered ? 5 : 4,
        stepBadgeText: providerDelivered ? 'COMPLETED' : 'PROVIDER RESPONSE FAILED',
      });
      if (!providerDelivered) setShowTechnicalResponse(true);

    } catch (err) {
      soundEngine.playDefenseIntercept();
      const failure = err as { message?: string; status?: number };
      const failureHttpCode = Number.isInteger(failure.status) ? Number(failure.status) : 502;
      const failureMessage = String(failure.message || 'Payment execution failed.');
      setShowTechnicalResponse(true);
      setExecutionResult({
        status: 'FAILED',
        httpCode: failureHttpCode,
        httpLabel: 'Payment not confirmed',
        scenarioTitle: 'Scenario 1: Settlement failed',
        heroMetric: '$0.00 charged · no delivery',
        whatHappened: `Requested ${resource.name}.`,
        systemResponse: 'Payment could not be confirmed.',
        whatThisProves: 'No confirmed payment, so the request stays unsuccessful.',
        businessBenefit: 'Unconfirmed requests do not appear as successful spend.',
        payload: { status: failureHttpCode, error: failureMessage },
        stoppedStepIndex: 4,
        stepBadgeText: 'FAILED — NO CONFIRMED PAYMENT',
      });
      setFlowStep(4);
    } finally {
      setIsRunning(false);
    }
  };

  // 2-6. Rule Tests
  const executeRuleTest = async (ruleKey: string, scenarioTitle: string, customDomain?: string, agentOverride?: DemoAgent, resourceOverride?: DemoResource) => {
    if (isRunning) return;
    const agent = agentOverride || activeAgent;
    const resource = resourceOverride || activeResource;
    soundEngine.playClick();
    setIsRunning(true);
    setShowTechnicalResponse(false);
    setFlowStep(1);
    setExecutionResult((prev) => ({ ...prev, status: 'IDLE' }));

    await new Promise((r) => setTimeout(r, 200));
    setFlowStep(2); // 02 402 Challenge

    await new Promise((r) => setTimeout(r, 200));

    // SCENARIO 2: Hard Budget Cap Exceeded (Halted at Step 3 Policy Check)
    if (ruleKey === 'over_budget') {
      const requestedAmount = Number((visibleBudgetUsd + 0.05).toFixed(4));
      try {
        await executePayment({
          keyId: agent.id,
          targetUrl: resource.endpointUrl,
          pricePathUsd: requestedAmount,
          category: 'RESEARCH & DATA',
          allowDynamicWhitelist: false,
          evaluationOnly: true,
          jobId: `walkthrough_overbudget_${Date.now()}`,
          jobBudgetPathUsd: visibleBudgetUsd,
          serviceName: resource.name,
          providerName: resource.provider,
        });
      } catch (err: any) {
        soundEngine.playDefenseIntercept();
        setFlowStep(3);
        setExecutionResult({
          status: 'BLOCKED',
          httpCode: err.status || 402,
          httpLabel: 'HTTP 402 Payment Required',
          scenarioTitle: `${scenarioTitle} → BLOCKED`,
          heroMetric: '$0.00 spent · blocked before payment',
          whatHappened: `Requested $${requestedAmount.toFixed(4)} · job maximum $${visibleBudgetUsd.toFixed(4)}.`,
          systemResponse: err.message || 'Job limit exceeded.',
          whatThisProves: 'Stopped before payment. $0.00 spent.',
          businessBenefit: `Hard Policy Enforcement: Exactly $0.00 spent. Runaway agent loops are halted before reaching the chain.`,
          payload: err.responseBody || {
            statusCode: 402,
            error: err.message,
            detail: `Requested call exceeds the job maximum of $${visibleBudgetUsd.toFixed(4)}.`,
            offChainHalt: true,
            tempoFeeTokenCharged: '$0.000000',
            deductedUsd: 0.00,
          },
          stoppedStepIndex: 3,
          stepBadgeText: 'HALTED OFF-CHAIN',
        });
      } finally {
        setIsRunning(false);
      }
      return;
    }

    // SCENARIO 3: Non-Whitelisted Target (Halted at Step 3 Policy Check)
    if (ruleKey === 'unapproved_provider') {
      const domain = customDomain || 'api.rogue-drainer.xyz';
      try {
        await executePayment({
          keyId: agent.id,
          targetUrl: `https://${domain}/v1/exploit`,
          pricePathUsd: resource.costUsd,
          category: 'Malicious Probe',
          allowDynamicWhitelist: false,
          evaluationOnly: true,
          jobId: `walkthrough_rogue_${Date.now()}`,
          jobBudgetPathUsd: visibleBudgetUsd,
          serviceName: 'Rogue Host Probe',
          providerName: domain,
        });
      } catch (err: any) {
        soundEngine.playDefenseIntercept();
        setFlowStep(3);
        setExecutionResult({
          status: 'BLOCKED',
          httpCode: err.status || 403,
          httpLabel: 'HTTP 403 Forbidden',
          scenarioTitle: `${scenarioTitle} → BLOCKED`,
          heroMetric: '$0.00 spent · provider blocked',
          whatHappened: `Target: ${domain}.`,
          systemResponse: err.message || 'Provider is outside the allowlist.',
          whatThisProves: 'Provider blocked before payment. $0.00 spent.',
          businessBenefit: `Zero Malicious Drains: Exactly $0.00 spent. Malicious phishing and prompt injections blocked.`,
          payload: err.responseBody || {
            statusCode: 403,
            error: err.message,
            targetDomain: domain,
            merkleProofValidation: 'FAILED_ROOT_MISMATCH',
            offChainHalt: true,
            deductedUsd: 0.00,
          },
          stoppedStepIndex: 3,
          stepBadgeText: 'HALTED OFF-CHAIN',
        });
      } finally {
        setIsRunning(false);
      }
      return;
    }

    // Pass Step 3 for remaining scenarios
    setFlowStep(3);
    await new Promise((r) => setTimeout(r, 200));

    // SCENARIO 4: Tampered Signature (Rejected at Step 4 Payment Credential)
    if (ruleKey === 'tampered_payment') {
      try {
        await executePayment({
          keyId: agent.id,
          targetUrl: resource.endpointUrl,
          pricePathUsd: resource.costUsd,
          category: 'Security Probe',
          corruptSignature: true,
          evaluationOnly: true,
          jobId: `walkthrough_tamper_${Date.now()}`,
          jobBudgetPathUsd: visibleBudgetUsd,
          serviceName: resource.name,
          providerName: resource.provider,
        });
      } catch (err: any) {
        soundEngine.playDefenseIntercept();
        setFlowStep(4);
        setExecutionResult({
          status: 'REJECTED',
          httpCode: err.status || 401,
          httpLabel: 'HTTP 401 Unauthorized',
          scenarioTitle: `${scenarioTitle} → REJECTED`,
          heroMetric: '$0.00 transferred · verification failed',
          whatHappened: 'Payment proof was changed.',
          systemResponse: err.message || 'Signature check failed before payment.',
          whatThisProves: 'Proof rejected before payment. $0.00 transferred.',
          businessBenefit: `Cryptographic Security: Exactly $0.00 transferred. Tampered proofs are rejected instantly.`,
          payload: err.responseBody || {
            statusCode: 401,
            error: err.message,
            verification: 'FAILED_SIGNATURE_DIGEST_MISMATCH',
            gatewayCheck: 'REJECTED_BEFORE_CHAIN_SUBMIT',
            contractAction: 'NO_SETTLEMENT',
            transferredUsd: 0.00,
          },
          stoppedStepIndex: 4,
          stepBadgeText: 'REJECTED BEFORE SETTLEMENT',
        });
      } finally {
        setIsRunning(false);
      }
      return;
    }

    // Pass Step 4 for Scenarios 5 & 6
    setFlowStep(4);
    await new Promise((r) => setTimeout(r, 200));

    // SCENARIO 5: Explicit Provider-Failure Signal (Pre-settlement Void)
    if (ruleKey === 'provider_failure') {
      try {
        const settleRes = await executePayment({
          keyId: agent.id,
          targetUrl: resource.endpointUrl,
          pricePathUsd: resource.costUsd,
          category: 'Reliability Probe',
          simulateFailure: true,
          evaluationOnly: true,
          jobId: `walkthrough_failure_${Date.now()}`,
          jobBudgetPathUsd: visibleBudgetUsd,
          serviceName: resource.name,
          providerName: resource.provider,
        });
        soundEngine.playDefenseIntercept();
        setFlowStep(5);
        setExecutionResult({
          status: 'VOIDED',
          httpCode: 502,
          httpLabel: 'HTTP 502 Bad Gateway',
          scenarioTitle: `${scenarioTitle} → NOT SETTLED`,
          heroMetric: '$0.00 charged · payment voided',
          whatHappened: 'The route supplied an explicit provider-failure signal before authorization.',
          systemResponse: settleRes.trace?.liveProxyPayload?.error || 'Provider-failure signal received before authorization → payment is not sent.',
          whatThisProves: 'The failure signal stopped authorization before settlement. $0.00 lost.',
          businessBenefit: 'A pre-settlement failure signal keeps a broken provider from receiving payment.',
          payload: settleRes.trace?.liveProxyPayload || {
            statusCode: 502,
            error: 'UPSTREAM_500_SERVER_CRASH',
            settlementAction: 'PAYMENT_VOIDED_BEFORE_SETTLEMENT',
            refundStatus: 'NO_FUNDS_TRANSFERRED',
            lostUsd: 0.00,
          },
          stoppedStepIndex: 5,
          stepBadgeText: 'NOT SETTLED (VOIDED)',
        });
      } catch (err: any) {
        soundEngine.playDefenseIntercept();
        setFlowStep(5);
        setExecutionResult({
          status: 'VOIDED',
          httpCode: err.status || 502,
          httpLabel: 'HTTP 502 Bad Gateway',
          scenarioTitle: `${scenarioTitle} → NOT SETTLED`,
          heroMetric: '$0.00 charged · payment voided',
          whatHappened: 'The route supplied an explicit provider-failure signal before authorization.',
          systemResponse: err.message || 'Payment was voided before settlement.',
          whatThisProves: 'The failure signal stopped authorization before settlement. $0.00 lost.',
          businessBenefit: 'A pre-settlement failure signal keeps a broken provider from receiving payment.',
          payload: err.responseBody || {
            statusCode: 502,
            error: err.message,
            settlementAction: 'PAYMENT_VOIDED_BEFORE_SETTLEMENT',
            refundStatus: 'NO_FUNDS_TRANSFERRED',
            lostUsd: 0.00,
          },
          stoppedStepIndex: 5,
          stepBadgeText: 'NOT SETTLED (VOIDED)',
        });
      } finally {
        setIsRunning(false);
      }
      return;
    }

    // SCENARIO 6: Duplicate Request (Cached at Step 5)
    if (ruleKey === 'duplicate_request') {
      const replayIdempKey = `idem_replay_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const replayJobId = `job_replay_${Date.now()}`;
      try {
        await executePayment({
          keyId: agent.id,
          targetUrl: resource.endpointUrl,
          pricePathUsd: resource.costUsd,
          category: 'RESEARCH & DATA',
          idempotencyKey: replayIdempKey,
          jobId: replayJobId,
          jobBudgetPathUsd: visibleBudgetUsd,
          evaluationOnly: true,
          serviceName: resource.name,
          providerName: resource.provider,
        });

        const res2 = await executePayment({
          keyId: agent.id,
          targetUrl: resource.endpointUrl,
          pricePathUsd: resource.costUsd,
          category: 'RESEARCH & DATA',
          idempotencyKey: replayIdempKey,
          jobId: replayJobId,
          jobBudgetPathUsd: visibleBudgetUsd,
          evaluationOnly: true,
          serviceName: resource.name,
          providerName: resource.provider,
        });

        soundEngine.playSettlementChime();
        setFlowStep(5);
        setExecutionResult({
          status: 'CACHED',
          httpCode: 200,
          httpLabel: 'HTTP 200 OK (Cache Hit)',
          scenarioTitle: `${scenarioTitle} → NO SECOND CHARGE`,
          heroMetric: '$0.00 extra · cached result',
          whatHappened: 'Same request sent twice with identical Idempotency-Key.',
          systemResponse: 'Replay detected → cached trace returned without second charge.',
          whatThisProves: 'Saved result reused. $0.00 extra charge.',
          businessBenefit: `Idempotency Protected: Additional charge: $0.00. Identical retries return stored result.`,
          payload: {
            statusCode: 200,
            servedFromCache: true,
            idempotencyKey: replayIdempKey,
            traceId: res2.trace?.id,
            isIdempotentCacheHit: res2.trace?.isIdempotentCacheHit ?? true,
            cachedPayload: res2.trace?.liveProxyPayload || resource.simulatedData,
            secondChargeUsd: 0.00,
            originalTx: null,
          },
          stoppedStepIndex: 5,
          stepBadgeText: 'CACHED ($0.00 EXTRA)',
        });
      } catch (err: any) {
        soundEngine.playDefenseIntercept();
        setFlowStep(5);
        setExecutionResult({
          status: 'FAILED',
          httpCode: err.status || 500,
          httpLabel: 'HTTP Error',
          scenarioTitle: `${scenarioTitle} → ERROR`,
          heroMetric: '$0.00 charged',
          whatHappened: 'Duplicate request test failed.',
          systemResponse: err.message,
          whatThisProves: 'Execution error occurred.',
          businessBenefit: 'Error handling verified.',
          payload: err.responseBody || null,
          stoppedStepIndex: 5,
          stepBadgeText: 'FAILED',
        });
      } finally {
        setIsRunning(false);
      }
      return;
    }
  };

  const handleReset = () => {
    soundEngine.playClick();
    setFlowStep(0);
    setSpentAmount(0);
    setSelectedScenarioId('sc_normal');
    setScenarioPickerOpen(true);
    const liveHappyPath = networkMode === 'LIVE_TESTNET';
    setSelectedAgentId(liveHappyPath ? LIVE_WALKTHROUGH_AGENT_ID : 'key_cortex_research');
    setSelectedResourceId(liveHappyPath ? LIVE_WALKTHROUGH_RESOURCE_ID : 'res_vector_search');
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

  const readablePreview = activeResource.id === 'res_vector_search'
    ? '3 matching documents found · best match 94%'
    : activeResource.id === 'res_market_depth'
    ? 'Licensed market snapshot returned for review'
    : activeResource.id === 'res_ai_reasoning'
    ? 'Model response returned and ready to use'
    : 'Code finished successfully · all checks passed';
  const resultHeadline = executionResult.status === 'SUCCESS'
    ? 'Resource delivered'
    : executionResult.status === 'BLOCKED'
    ? 'Blocked before payment'
    : executionResult.status === 'REJECTED'
    ? 'Payment rejected'
    : executionResult.status === 'VOIDED'
    ? 'Payment voided'
    : executionResult.status === 'CACHED'
    ? 'Saved result reused'
    : executionResult.status === 'FAILED'
    ? 'Resource not delivered'
    : '';

  return (
    <div className="space-y-7 font-sans text-zinc-200 w-full">
      
      {/* 1. HEADER (QUIET, DIRECT, NO SIMULATOR JARGON) */}
      <div className="ui-section bg-white/[.03] backdrop-blur-md border border-white/[.08] rounded-xl p-6 sm:p-8 space-y-3 relative overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Test how the system handles AI payment scenarios
            </h1>
            <p className="ui-explainer text-sm sm:text-base text-zinc-300/90 max-w-3xl leading-7">
              Pick a scenario and run one request: the system checks the limit, decides whether to pay, and shows the returned result.
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

        {executionResult.status === 'SUCCESS' && (
          hasConfirmedTx ? (
            <a
              href={tempoTransactionUrl(executionResult.txHash)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#d7ff4f] hover:underline"
            >
              View confirmed transaction on Tempo Explorer ↗
            </a>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-500">
              Evaluation preview · no chain transaction
            </span>
          )
        )}
      </div>

      {/* 2. THE SCENARIOS: MAIN FLOW + GUARDRAILS */}
      <div id="demo-test-matrix" className="ui-selector rounded-xl border border-white/[.08] bg-white/[.03] backdrop-blur-md p-4 sm:p-5 shadow-sm space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs font-mono relative z-10">
          <div className="font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#d7ff4f]" />
            <span className="normal-case">Choose a scenario to test</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider shrink-0">Selected: <strong className="text-zinc-300">{activeScenario.title.replace(/^\d+\.\s*/, '')}</strong></span>
            <button type="button" onClick={() => setScenarioPickerOpen((open) => !open)} className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-300 hover:text-[#d7ff4f] cursor-pointer">
              {scenarioPickerOpen ? 'Hide choices' : 'Change scenario'}
              <ChevronDown className={`h-3 w-3 transition-transform ${scenarioPickerOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {scenarioPickerOpen && <p className="ui-explainer mt-2.5 max-w-4xl text-xs sm:text-sm font-sans leading-5 text-zinc-400">
          Choose the case that matches the outcome you want to inspect.
        </p>}

        {!scenarioPickerOpen && <button type="button" onClick={() => setScenarioPickerOpen(true)} className="ui-interactive w-full mt-2.5 rounded-xl border border-[#d7ff4f]/30 bg-[#d7ff4f]/[.035] px-3.5 py-2.5 text-left cursor-pointer hover:bg-[#d7ff4f]/[.07] transition-colors" data-selected="true">
          <span className="text-[9px] font-mono uppercase tracking-wider text-[#d7ff4f]">Selected scenario</span>
          <span className="ml-2 text-sm font-semibold text-zinc-100">{activeScenario.title.replace(/^\d+\.\s*/, '')}</span>
          <span className="ml-2 text-xs text-zinc-400">Click to change</span>
        </button>}

        <p className="ui-explainer mt-3 text-xs sm:text-sm leading-5 text-zinc-400">
          One request moves from <strong className="text-zinc-200">{activeResource.name}</strong> to a cap check, payment decision, and result; the job maximum is the only amount you set.
        </p>

        {scenarioPickerOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PRODUCTION_SCENARIOS.map((sc, idx) => {
              const isSelected = sc.id === selectedScenarioId;
              const isPrimary = sc.id === 'sc_normal';
              const variantLabel: Record<string, string> = {
                sc_normal: 'Approved flow',
                sc_budget: 'Limit check',
                sc_whitelist: 'Access check',
                sc_tamper: 'Integrity check',
                sc_failure: 'Recovery check',
                sc_duplicate: 'Replay check',
              };

              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => handleSelectScenario(sc)}
                  aria-pressed={isSelected}
                  data-selected={isSelected}
                  className={`ui-interactive rounded-xl p-3.5 min-h-[105px] border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#d7ff4f]/[0.08] border-[#d7ff4f] shadow-[0_0_15px_rgba(215,255,79,0.12)] ring-1 ring-[#d7ff4f]/30'
                      : 'bg-[#0c0e14]/80 border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-black tracking-tight shrink-0 ${
                          isSelected
                            ? 'bg-[#d7ff4f] text-[#08090c]'
                            : isPrimary
                            ? 'bg-[#d7ff4f]/15 text-[#d7ff4f] border border-[#d7ff4f]/30'
                            : 'bg-white/[0.06] text-zinc-400 border border-white/10'
                        }`}>
                          {isPrimary ? 'PRIMARY' : String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className={`text-sm font-semibold tracking-tight leading-snug break-words ${
                          isSelected ? 'text-[#d7ff4f]' : 'text-zinc-200'
                        }`}>
                          {sc.title.replace(/^\d+\.\s*/, '')}
                        </span>
                      </div>
                      <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${
                        isSelected
                          ? 'bg-[#d7ff4f]/20 border-[#d7ff4f]/40 text-[#d7ff4f]'
                          : isPrimary
                          ? 'bg-[#d7ff4f]/10 border-[#d7ff4f]/20 text-[#d7ff4f]'
                          : 'bg-white/[0.04] text-zinc-400 border-white/10'
                      }`}>
                        {isSelected ? 'SELECTED' : isPrimary ? 'PRIMARY' : sc.tag}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-zinc-400 leading-relaxed line-clamp-2">{sc.description}</p>
                  </div>
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500">{variantLabel[sc.id] || 'Scenario check'}</span>
                    <span className={`text-[10px] font-mono font-semibold text-right leading-4 ${
                      isSelected ? 'text-[#d7ff4f]' : 'text-zinc-400'
                    }`}>
                      {networkMode === 'LIVE_TESTNET' && sc.id === 'sc_normal'
                        ? 'Tempo receipt → demo response'
                        : sc.outcomeLabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
        </div>

      {/* 3. EXECUTION STAGE: BUYER ➔ RUN CTA ➔ SELLER */}
      <div id="execution-stage" className="ui-section rounded-xl border border-white/[.08] bg-white/[.03] backdrop-blur-md p-5 sm:p-7 shadow-sm space-y-5 relative overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] pb-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Run the selected scenario</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Shared treasury → cap check → approval → result, so payment happens only after the rules pass.</p>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">{activeScenario.title.replace(/^\d+\.\s*/, '')}</span>
        </div>
        {/* Dynamic Motion Stage: Contoured Buyer Card vs Contoured Seller Card */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center relative z-10">
          
          {/* Buyer Card */}
          <div className="ui-meta md:col-span-4 p-5 rounded-xl bg-white/[.025] border border-white/[.08] space-y-3 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-zinc-400" />
                <span>REQUESTER</span>
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-zinc-100 tracking-tight">{activeAgent.name}</span>
                <span className="text-xs font-mono text-[#d7ff4f] font-bold px-2 py-0.5 rounded bg-[#d7ff4f]/10 border border-[#d7ff4f]/20">
                  Job max: ${Number(jobBudgetInput || 0).toFixed(4)}
                </span>
              </div>
              <div className="text-xs text-slate-400 line-clamp-1">One limit for this run; the agent safety rule stays automatic</div>
            </div>

            <div className="p-3 rounded-xl bg-white/[.03] border border-white/[.06] space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300 uppercase text-[9.5px] font-bold">Cap remaining</span>
                <span className="text-white font-bold text-sm">
                  ${Math.max(0, visibleBudgetUsd - (activeScenario.ruleKey === 'over_budget' ? visibleBudgetUsd + 0.01 : spentAmount)).toFixed(4)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#d7ff4f] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (((activeScenario.ruleKey === 'over_budget' ? visibleBudgetUsd + 0.01 : spentAmount) / Math.max(visibleBudgetUsd, 0.0001)) * 100))}%` }}
                />
              </div>
              <div className="text-[10px] font-mono text-slate-500">Job budget from the shared treasury · remaining before payment</div>
            </div>
          </div>

          {/* Central Trigger & Motion Rail */}
          <div className="md:col-span-3 flex flex-col items-center justify-center py-1 space-y-3">
            <div className="w-full max-w-[250px] space-y-2">
              <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-wider text-zinc-500">
                <span>Agent</span>
                <span className="text-[#d7ff4f]">Payment rail</span>
                <span>Resource route</span>
              </div>
              <div className="relative flex items-center justify-center gap-1.5 h-5">
                <span className="absolute left-1 right-1 top-1/2 h-px bg-gradient-to-r from-white/[.08] via-[#d7ff4f]/45 to-white/[.08]" />
                <span className={`relative z-10 h-2 w-2 rounded-full bg-[#d7ff4f] ${isRunning ? 'animate-ping' : ''}`} />
                <span className={`relative z-10 h-3.5 w-3.5 rounded-full border border-[#d7ff4f]/60 bg-[#151b22] flex items-center justify-center ${isRunning ? 'animate-pulse' : ''}`}>
                  <ArrowLeftRight className="w-2.5 h-2.5 text-[#d7ff4f]" />
                </span>
                <span className={`relative z-10 h-2 w-2 rounded-full bg-[#d7ff4f] ${isRunning ? 'animate-ping [animation-delay:300ms]' : ''}`} />
              </div>
            </div>
            {flowStep === 4 ? (
              <div className="px-3.5 py-1.5 rounded-lg bg-[#d7ff4f] text-[#090b10] font-black text-xs font-mono">
                ${activeResource.costUsd.toFixed(4)} Settlement ➔
              </div>
            ) : flowStep === 5 ? (
              <div className="px-3.5 py-1.5 rounded-lg bg-white/[0.06] border border-white/20 text-zinc-100 font-bold text-xs font-mono shadow-sm">
                {activeScenario.ruleKey === 'normal'
                  ? (hasConfirmedTx ? 'Delivered' : 'Done')
                  : '$0.00 Protected'}
              </div>
            ) : (
              <div className="h-5" aria-hidden="true" />
            )}

            <label className="job-budget-field w-full max-w-[250px] rounded-lg border border-[#d7ff4f]/30 bg-[#d7ff4f]/[0.06] px-3 py-2 text-left">
              <span className="block text-[9px] font-mono font-bold uppercase tracking-wider text-[#d7ff4f]">Max for this job</span>
              <span className="flex items-center gap-1 text-sm font-mono font-bold text-white">
                <span className="text-zinc-400">$</span>
                <input
                  aria-label="Maximum spend for this payment job"
                  title="Enter the maximum amount for this payment job"
                  type="number"
                  min={activeResource.costUsd.toFixed(4)}
                  step="0.0001"
                  value={jobBudgetInput}
                  onChange={(event) => setJobBudgetInput(event.target.value)}
                  disabled={isRunning}
                  className="job-budget-input w-full rounded-md border border-[#d7ff4f]/45 bg-[#08090c]/75 px-2 py-1 outline-none text-white font-mono cursor-text focus:border-[#d7ff4f] focus:ring-2 focus:ring-[#d7ff4f]/25"
                />
              </span>
              <span className="block text-[9px] text-zinc-400 mt-0.5">Type the run’s maximum here; the resource price is fixed.</span>
            </label>

            <button
              type="button"
              onClick={() => executeScenarioById(selectedScenarioId)}
              disabled={isRunning}
              className="w-full py-3.5 px-5 rounded-xl bg-[#d7ff4f] hover:bg-[#cbf540] text-[#090b10] font-black text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2 relative overflow-hidden"
            >
              <Zap className="w-4 h-4 fill-current shrink-0" />
              <span>{isRunning ? 'Processing...' : 'Run selected scenario'}</span>
            </button>
            <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider text-zinc-500">
              Results appear below <ChevronDown className="h-3 w-3 text-[#d7ff4f]" />
            </span>
          </div>

          {/* Provider Card (API access terminal) */}
          <div className="ui-meta md:col-span-4 p-5 rounded-xl bg-white/[.025] border border-white/[.08] space-y-3 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-zinc-400" />
                <span>RESOURCE</span>
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-zinc-100 tracking-tight">{activeResource.name}</span>
                <span className="text-lg font-mono font-semibold text-[#d7ff4f]">
                  ${activeResource.costUsd.toFixed(4)}
                </span>
              </div>
              <div className="text-xs text-zinc-400 line-clamp-1">Sample response route · payment proof is shown separately</div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-white/[.03] border border-white/[.08] px-3 py-2 text-[10px] font-mono">
              <span className="text-zinc-500 uppercase font-bold">Access</span>
              <span className="text-[#d7ff4f] font-bold">Approved route</span>
            </div>
          </div>

        </div>

        {/* 5 MPP Pipeline Steps: Official Machine Payments Protocol Sequence */}
        {(isRunning || executionResult.status !== 'IDLE') && (
        <div id="demo-pipeline-section" className="relative pt-5 border-t border-white/[0.06] text-xs font-mono">
          <div className="pointer-events-none absolute hidden sm:block left-[10%] right-[10%] top-[43px] h-px bg-gradient-to-r from-white/[.06] via-[#d7ff4f]/35 to-white/[.06]" />
          <div className="relative grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          
          {/* STEP 1: REQUEST */}
          <div className={`p-2.5 space-y-2 text-center transition-all ${
            flowStep >= 1 ? 'text-white' : 'text-zinc-500'
            }`}>
            <div className="font-semibold flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5">
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-black ${flowStep >= 1 ? 'bg-[#d7ff4f] text-black' : 'bg-white/5 text-zinc-500'}`}>01</span>
                <span>Request</span>
              </span>
              {flowStep >= 1 ? (
                <Check className="w-3.5 h-3.5 text-[#d7ff4f]" />
              ) : (
                null
              )}
            </div>
            <div className="text-[10px] text-zinc-500">Agent asks for a resource</div>
          </div>

          {/* STEP 2: 402 CHALLENGE */}
          <div className={`p-2.5 space-y-2 text-center transition-all ${
            flowStep >= 2 ? 'text-white' : 'text-zinc-500'
          }`}>
            <div className="font-semibold flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5">
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-black ${flowStep >= 2 ? 'bg-[#d7ff4f] text-black' : 'bg-white/5 text-zinc-500'}`}>02</span>
                <span>Payment request</span>
              </span>
              {flowStep >= 2 ? (
                <Check className="w-3.5 h-3.5 text-[#d7ff4f]" />
              ) : (
                null
              )}
            </div>
            <div className="text-[10px] text-zinc-500">Resource route sets the price</div>
          </div>

          {/* STEP 3: POLICY CHECK */}
          <div className={`p-2.5 space-y-2 text-center transition-all ${
            executionResult.stoppedStepIndex === 3
              ? 'text-white'
              : flowStep >= 3
              ? 'text-white'
              : 'text-zinc-600'
          }`}>
            <div className="font-semibold flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5">
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                  executionResult.stoppedStepIndex === 3 ? 'bg-zinc-300 text-black' : flowStep >= 3 ? 'bg-[#d7ff4f] text-black' : 'bg-white/5 text-zinc-500'
                }`}>03</span>
                <span>Spending rules</span>
              </span>
              {executionResult.stoppedStepIndex === 3 ? (
                <span className="text-[9px] font-mono font-bold text-zinc-300 px-1.5 py-0.2 rounded bg-white/10 border border-white/20">BLOCKED</span>
              ) : flowStep >= 3 ? (
                <Check className="w-3.5 h-3.5 text-[#d7ff4f]" />
              ) : (
                null
              )}
            </div>
            <div className="text-[10px] text-zinc-500">Cap and access are checked</div>
          </div>

          {/* STEP 4: PAYMENT */}
          <div className={`p-2.5 space-y-2 text-center transition-all ${
            executionResult.stoppedStepIndex === 3
              ? 'text-zinc-500 opacity-60'
              : executionResult.stoppedStepIndex === 4
              ? 'text-white'
              : flowStep >= 4
              ? 'text-white'
              : 'text-zinc-500'
          }`}>
            <div className="font-semibold flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5">
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                  executionResult.stoppedStepIndex === 4 ? 'bg-zinc-300 text-black' : flowStep >= 4 ? 'bg-[#d7ff4f] text-black' : 'bg-white/5 text-zinc-500'
                }`}>04</span>
                <span>Payment</span>
              </span>
              {executionResult.stoppedStepIndex === 3 ? (
                <span className="text-[9px] text-zinc-600 font-normal">SKIPPED</span>
              ) : executionResult.stoppedStepIndex === 4 ? (
                <span className="text-[9px] font-mono font-bold text-zinc-300 px-1.5 py-0.2 rounded bg-white/10 border border-white/20">REJECTED</span>
              ) : flowStep >= 4 ? (
                <Check className="w-3.5 h-3.5 text-[#d7ff4f]" />
              ) : (
                null
              )}
            </div>
            <div className="text-[10px] text-zinc-500">
              {hasConfirmedTx ? (
                <a href={tempoTransactionUrl(executionResult.txHash)} target="_blank" rel="noreferrer" className="text-[#d7ff4f] hover:underline font-bold inline-flex items-center gap-1">
                  <span>Settled on Tempo</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              ) : (
                'Payment settles after approval'
              )}
            </div>
          </div>

          {/* STEP 5: RESULT */}
          <div className={`p-2.5 space-y-2 text-center transition-all ${
            executionResult.stoppedStepIndex === 3 || executionResult.stoppedStepIndex === 4
              ? 'text-zinc-500 opacity-60'
              : executionResult.status === 'SUCCESS'
              ? 'text-white'
              : executionResult.status === 'CACHED'
              ? 'text-white'
              : executionResult.status !== 'IDLE'
              ? 'text-white'
              : 'text-zinc-500'
          }`}>
            <div className="font-semibold flex items-center justify-between text-sm">
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
                null
              )}
            </div>
            <div className="text-[10px] text-zinc-500">Resource returns to the agent</div>
          </div>
          </div>
        </div>
        )}

        {/* 4. Result: one readable conclusion; technical data stays optional. */}
        {executionResult.status !== 'IDLE' && (
            <div id="execution-result" data-state={executionResult.status.toLowerCase()} className="ui-result p-5 sm:p-7 rounded-2xl bg-white/[.035] backdrop-blur-md border border-[#d7ff4f]/20 space-y-5 text-xs animate-in fade-in shadow-sm">
            
            {/* Top Result Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
              <div className="flex items-start gap-3">
                {executionResult.status === 'SUCCESS' ? (
                  <FileCheck className="w-5 h-5 text-[#d7ff4f] shrink-0" />
                ) : executionResult.status === 'CACHED' ? (
                  <CheckCheck className="w-5 h-5 text-cyan-400 shrink-0" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-zinc-300 shrink-0" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-[9px] font-mono uppercase tracking-[.18em] text-[#d7ff4f]">Result</div>
                    <SynapseStatusBadge
                      status={normalizeSynapseStatus(
                        executionResult.status === 'SUCCESS'
                          ? (hasConfirmedTx ? 'CONFIRMED' : 'DEMO')
                          : executionResult.status === 'CACHED'
                          ? 'DEMO'
                          : executionResult.status === 'BLOCKED' || executionResult.status === 'REJECTED'
                          ? 'REJECTED'
                          : 'FAILED'
                      )}
                      size="sm"
                    />
                  </div>
                  <div className="mt-1 text-xl sm:text-2xl font-semibold tracking-tight text-zinc-100">{resultHeadline}</div>
                  <div className="mt-1 text-sm text-zinc-300">{executionResult.whatThisProves}</div>
                  <div className="mt-2 text-xs font-mono text-zinc-500"><strong className={executionResult.status === 'SUCCESS' ? 'text-[#d7ff4f]' : executionResult.status === 'CACHED' ? 'text-cyan-300' : 'text-zinc-200'}>{executionResult.httpLabel}</strong></div>
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

            {(executionResult.status === 'SUCCESS' || hasConfirmedTx) && (
              <div className="-mt-2 rounded-xl border border-[#d7ff4f]/30 bg-[#0c0e14]/90 p-3.5 shadow-[0_0_20px_rgba(215,255,79,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#d7ff4f]/15 border border-[#d7ff4f]/30 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-[#d7ff4f]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Tempo L1 Settlement</span>
                      <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${hasConfirmedTx ? 'bg-[#d7ff4f]/15 border-[#d7ff4f]/30 text-[#d7ff4f]' : 'bg-sky-300/10 border-sky-300/25 text-sky-200'}`}>
                        {hasConfirmedTx ? 'CONFIRMED ON-CHAIN' : 'EVALUATION ONLY'}
                      </span>
                    </div>
                    {hasConfirmedTx ? (
                      <div className="text-zinc-300 text-[11px] mt-0.5 flex items-center gap-1.5">
                        <span className="text-zinc-500">Tx:</span>
                        <span className="text-zinc-200 font-bold font-mono">{executionResult.txHash?.slice(0, 10)}...{executionResult.txHash?.slice(-8)}</span>
                      </div>
                    ) : (
                      <div className="text-zinc-400 text-[11px] mt-0.5">Evaluation run · offline mode</div>
                    )}
                  </div>
                </div>

                {hasConfirmedTx && (
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={tempoTransactionUrl(executionResult.txHash)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-lg bg-[#d7ff4f] hover:bg-[#cbf540] text-[#08090c] font-black text-xs transition flex items-center gap-1.5 shadow-[0_0_12px_rgba(215,255,79,0.3)] cursor-pointer"
                    >
                      <span>View on Tempo Explorer</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_.65fr] gap-4">
              <div className="rounded-2xl bg-white/[.025] border border-white/[.08] p-5 space-y-5">
                <div>
                  <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-[.18em] text-zinc-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#d7ff4f]" /> Request
                  </div>
                  <p className="mt-2 text-sm font-medium leading-6 text-zinc-200">{executionResult.whatHappened}</p>
                </div>
                <div className="border-t border-white/[.07] pt-4">
                  <div className="text-[9px] font-mono uppercase tracking-[.18em] text-zinc-500">Rule decision</div>
                  <p className="mt-2 text-sm leading-6 text-zinc-300/90">{executionResult.systemResponse}</p>
                </div>
              </div>
              <aside className="rounded-2xl bg-[#d7ff4f]/[0.035] border border-[#d7ff4f]/20 p-5 flex flex-col justify-between gap-5">
                {executionResult.status === 'SUCCESS' ? (
                  <div>
                    <div className="text-[9px] font-mono uppercase tracking-[.18em] text-[#d7ff4f]">Resource returned</div>
                    <div className="mt-2 text-xl font-semibold leading-tight text-zinc-100">{executionResult.resourceName || activeResource.name}</div>
                    <p className="mt-1.5 text-sm leading-6 text-zinc-300">{executionResult.resourcePreview || readablePreview}</p>
                    <div className="mt-4 text-xs font-mono text-[#d7ff4f]">HTTP 200 · ready for the agent</div>
                  </div>
                ) : (
                  <div>
                    <div className="text-[9px] font-mono uppercase tracking-[.18em] text-zinc-400">Result</div>
                    <div className="mt-2 text-xl font-semibold leading-tight text-zinc-100">{resultHeadline}</div>
                    <div className="mt-3 text-xs font-mono text-zinc-300">HTTP {executionResult.httpCode || '—'} · {executionResult.httpLabel || 'No payment sent'}</div>
                  </div>
                )}
              </aside>
            </div>

            {/* Technical evidence is available on demand so the result stays readable. */}
            {executionResult.payload && (
              <div className="rounded-2xl bg-white/[.025] border border-white/[.08] font-mono overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 text-[10.5px]">
                  <span className="font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3 h-3 text-zinc-400" />
                    <span>Technical response</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-500 text-[10px] hidden sm:inline">Optional</span>
                    <button
                    type="button"
                    onClick={() => setShowTechnicalResponse((open) => !open)}
                    className="text-[10px] text-zinc-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{showTechnicalResponse ? 'Hide response' : 'View response data'}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${showTechnicalResponse ? 'rotate-180' : ''}`} />
                    </button>
                    {showTechnicalResponse && (
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
                    )}
                  </div>
                </div>
                {showTechnicalResponse && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-2 border-t border-white/[0.07]">
                    <div className="pt-3 text-[10px] text-zinc-500">
                      {executionResult.status === 'SUCCESS' ? 'HTTP 200 evaluation payload' : 'Server response'}
                    </div>
                    <pre className="p-3 rounded-xl bg-[#202933] text-[11px] text-zinc-100 overflow-x-auto border border-white/[0.10] leading-relaxed">
                      {JSON.stringify(executionResult.payload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {executionTrace && (
              <SynapseTechnicalDetails
                nonce2D={executionTrace.nonce2D}
                signature={executionTrace.eip712Signature}
                merkleRoot={executionTrace.merkleRoot}
                merkleProof={executionTrace.merkleProof}
                tip20Memo={executionTrace.tip20Memo}
                className="mt-3"
              />
            )}

          </div>
        )}

      </div>

      {/* 5. Secondary context: visible, quieter, and clearly below the test itself. */}
      <section className="px-1 py-2 font-sans">
        <p className="text-xs sm:text-sm text-zinc-400 leading-5">
          AI can pay automatically when a request is approved, while spending rules stop payments that should not happen.
        </p>
      </section>

      {/* 5. CLEAN FOOTER LINK TO EARN TAB (NO ROLE CONFUSION) */}
      <div className="p-4 rounded-xl bg-white/[0.025] backdrop-blur-md border border-white/[0.08] flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-400 flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-zinc-500" />
          <span>Offer a paid machine path for approved requests, so useful machine traffic becomes revenue.</span>
        </span>
        <button
          type="button"
          onClick={() => onNavigateToTab?.('monetize')}
          className="text-[#d7ff4f] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
        >
          <span>See Earn from Providers</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

    </div>
  );
};
