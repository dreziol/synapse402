import { TEMPO_EXPLORER_URL, tempoTransactionUrl } from '../config/network';
import React, { useState } from 'react';
import { LivePaymentEvent } from '../types/synapse402';
import { Activity, ExternalLink, Zap, Clock, FileText, Download, ShieldCheck, Loader2, Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { soundEngine } from '../utils/audioEffects';
import { InfoBadge } from './InfoBadge';
import { normalizeSynapseStatus } from '../shared/types';
import { SynapseStatusBadge } from './shared/SynapseStatusBadge';
import { useSynapseState } from '../shared/SynapseStateContext';

interface LivePaymentsFeedProps {
  events: LivePaymentEvent[];
  summary?: {
    confirmedPaymentsCount: number;
    evaluationEventsCount: number;
    voidedEventsCount: number;
    totalReceiptsCount: number;
    totalVolumeSettledPathUsd: number;
  };
  onInspectEvent?: (event: LivePaymentEvent) => void;
  onRefresh?: () => void;
  onNavigateToTab?: (tab: 'demo') => void;
  executionMode?: 'LIVE_TESTNET' | 'RESILIENT_SANDBOX';
}

const SIMULATION_SCENARIOS = [
  {
    keyId: 'key_cortex_research',
    agentName: 'Knowledge Retrieval Agent',
    targetUrl: '/api/v1/data/unlocked-article',
    serviceName: 'Sample document-search provider response',
    price: 0.0010,
    category: 'Research & Data',
    deliverable: 'Example document-search result — 3 sample context chunks for a quarterly liquidity question.',
  },
  {
    keyId: 'key_quant_alpha',
    agentName: 'Reasoning Inference Agent',
    targetUrl: '/api/v1/market/sol-depth',
    serviceName: 'Sample reasoning-provider response',
    price: 0.0020,
    category: 'AI Inference',
    deliverable: 'Example reasoning result — a sample allocation summary used to show the payment flow.',
  },
  {
    keyId: 'key_polyglot_translator',
    agentName: 'Web Research Agent',
    targetUrl: '/api/v1/data/unlocked-article',
    serviceName: 'Sample web-extraction provider response',
    price: 0.0015,
    category: 'Data Extraction',
    deliverable: 'Example extraction result — sample clean text used to show a paid resource response.',
  },
  {
    keyId: 'key_sec_audit',
    agentName: 'Code Security Agent',
    targetUrl: '/api/v1/data/python-sandbox',
    serviceName: 'Sample sandbox-provider response',
    price: 0.0025,
    category: 'Cloud Sandbox',
    deliverable: 'Example sandbox result — sample successful test output used to show the paid step.',
  },
];

export const LivePaymentsFeed: React.FC<LivePaymentsFeedProps> = ({ events, summary, onInspectEvent, onRefresh, onNavigateToTab, executionMode = 'RESILIENT_SANDBOX' }) => {
  const [isTriggering, setIsTriggering] = useState(false);
  const [copiedSimHash, setCopiedSimHash] = useState(false);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [testBudgetInput, setTestBudgetInput] = useState<string>(SIMULATION_SCENARIOS[0].price.toFixed(4));
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'DEMO' | 'VOIDED'>('ALL');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'FINANCE' | 'RESEARCH' | 'SECURITY' | 'INFERENCE'>('ALL');
  const [simulationResult, setSimulationResult] = useState<{
    txHash: string;
    liveConfirmed: boolean;
    agentName: string;
    serviceName: string;
    costUsd: number;
    latencyMs: number;
    deliverable: string;
  } | null>(null);
  const [simulationError, setSimulationError] = useState<string | null>(null);

  const filterTabs = [
    { id: 'ALL', label: 'All Agents' },
    { id: 'FINANCE', label: 'Finance & Quants' },
    { id: 'RESEARCH', label: 'Market Research' },
    { id: 'SECURITY', label: 'Security & Code' },
    { id: 'INFERENCE', label: 'AI Inference' },
  ];

  const isConfirmed = (event: LivePaymentEvent) => event.executionMode === 'LIVE_TESTNET'
    && event.status === 'SETTLED'
    && event.receiptVerified === true
    && typeof event.txHash === 'string'
    && /^0x[a-fA-F0-9]{64}$/.test(event.txHash)
    && event.id !== 'trace_init_001';
  const isLivePending = (event: LivePaymentEvent) => event.executionMode === 'LIVE_TESTNET'
    && !isConfirmed(event)
    && event.status !== 'VOIDED'
    && event.status !== 'REFUNDED'
    && event.status !== 'REJECTED'
    && event.status !== 'FAILED';
  const isLiveFailed = (event: LivePaymentEvent) => event.executionMode === 'FAILED_REVERT'
    || event.status === 'REJECTED'
    || event.status === 'FAILED';
  const isVoidedOrRefunded = (event: LivePaymentEvent) => event.status === 'VOIDED' || event.status === 'REFUNDED';
  const isEvaluation = (event: LivePaymentEvent) => !isConfirmed(event) && !isLivePending(event) && !isLiveFailed(event) && !isVoidedOrRefunded(event);

  const { latestReceipts, executePayment } = useSynapseState();
  const effectiveEvents = React.useMemo(() => {
    const existing = new Set((events || []).map((e) => e.id));
    const newItems = (latestReceipts || []).filter((r) => !existing.has(r.id));
    return [...newItems, ...(events || [])];
  }, [events, latestReceipts]);

  const confirmedCount = summary?.confirmedPaymentsCount ?? effectiveEvents.filter(isConfirmed).length;
  const pendingCount = effectiveEvents.filter(isLivePending).length;
  const evaluationCount = summary?.evaluationEventsCount ?? effectiveEvents.filter(isEvaluation).length;
  const voidedCount = summary?.voidedEventsCount ?? effectiveEvents.filter(isVoidedOrRefunded).length;

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const filteredEvents = effectiveEvents.filter((ev) => {
    if (statusFilter === 'CONFIRMED' && !isConfirmed(ev)) return false;
    if (statusFilter === 'DEMO' && !isEvaluation(ev) && !isLivePending(ev)) return false;
    if (statusFilter === 'VOIDED' && !isVoidedOrRefunded(ev) && !isLiveFailed(ev)) return false;

    if (activeFilter === 'ALL') return true;
    const sName = (ev.serviceName || '').toLowerCase();
    const aName = (ev.agentName || '').toLowerCase();
    if (activeFilter === 'FINANCE') return sName.includes('depth') || sName.includes('orderbook') || aName.includes('quant') || aName.includes('market');
    if (activeFilter === 'RESEARCH') return sName.includes('vector') || sName.includes('news') || sName.includes('article') || aName.includes('research') || aName.includes('reader');
    if (activeFilter === 'SECURITY') return sName.includes('sandbox') || sName.includes('security') || sName.includes('compliance') || aName.includes('security');
    if (activeFilter === 'INFERENCE') return sName.includes('deepseek') || sName.includes('inference') || sName.includes('reasoning') || aName.includes('inference') || aName.includes('cortex');
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + pageSize);

  const handleTriggerMicropayment = async () => {
    soundEngine.playClick();
    setIsTriggering(true);
    setSimulationError(null);
    const t0 = performance.now();
    const scenario = SIMULATION_SCENARIOS[scenarioIndex % SIMULATION_SCENARIOS.length];
    setScenarioIndex((prev) => prev + 1);
    const enteredBudgetUsd = Number(testBudgetInput);
    const effectiveTestBudgetUsd = Number.isFinite(enteredBudgetUsd) && enteredBudgetUsd >= scenario.price
      ? enteredBudgetUsd
      : scenario.price;
    setTestBudgetInput(effectiveTestBudgetUsd.toFixed(4));

    try {
      const settleRes = await executePayment({
        keyId: scenario.keyId,
        targetUrl: scenario.targetUrl,
        pricePathUsd: scenario.price,
        category: scenario.category,
        evaluationOnly: executionMode !== 'LIVE_TESTNET',
        jobId: `receipt_test_${scenario.keyId}_${Date.now()}`,
        jobBudgetPathUsd: effectiveTestBudgetUsd,
        serviceName: scenario.serviceName,
        providerName: scenario.targetUrl,
      });
      const latency = settleRes.latencyMs;
      const liveConfirmed = settleRes.status === 'CONFIRMED'
        && settleRes.trace.receiptVerified === true
        && typeof settleRes.txHash === 'string'
        && /^0x[a-fA-F0-9]{64}$/.test(settleRes.txHash);
      if (liveConfirmed) soundEngine.playSettlementChime();
      setSimulationResult({
        txHash: liveConfirmed ? settleRes.txHash! : '',
        liveConfirmed,
        agentName: scenario.agentName,
        serviceName: scenario.serviceName,
        costUsd: scenario.price,
        // The pipeline already measures wall-clock latency when the trace does
        // not contain a provider-reported value. Never invent a fixed number
        // for a receipt that did not return one.
        latencyMs: Number.isFinite(Number(latency)) ? Number(latency) : 0,
        deliverable: scenario.deliverable,
      });
      if (onRefresh) onRefresh();
    } catch (err: any) {
      soundEngine.playDefenseIntercept();
      setSimulationError(err?.message || 'Payment test could not reach the policy engine.');
    } finally {
      setIsTriggering(false);
    }
  };
  return (
    <section id="section-live-payments-feed" className="space-y-4 font-sans">
      <div className="ui-section flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl bg-[#0c0e14]/90 border border-white/10 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-sm font-bold text-white tracking-tight">
              Payment Receipts
            </h2>
          </div>
          <p className="text-xs text-zinc-300 font-sans leading-relaxed">
            See what your AI requested and what was confirmed.
          </p>
          <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
            Every payment records the resource, amount, provider and transaction proof.
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2 text-[10px] font-mono uppercase tracking-wide">
            <span className="px-2 py-0.5 rounded border border-[#d7ff4f]/30 bg-[#d7ff4f]/10 text-[#d7ff4f]">{confirmedCount} chain-verified</span>
            {pendingCount > 0 && <span className="px-2 py-0.5 rounded border border-amber-300/30 bg-amber-300/10 text-amber-200">{pendingCount} live pending</span>}
            <span className="px-2 py-0.5 rounded border border-white/10 bg-white/[.04] text-zinc-400">{evaluationCount} evaluation</span>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-zinc-500">Payment proof and provider output are separate: a receipt proves the charge; sample or demo output is labelled as such.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-sans">
          {/* Secondary Exports */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-black/40 border border-white/10">
            <a
              href="/api/vault/export-iso20022?format=csv"
              download="synapse402-receipts.csv"
              title="Export spending receipts as CSV"
              className="px-2.5 py-1 rounded-md bg-white/[.05] hover:bg-white/[.1] border border-white/10 text-zinc-300 hover:text-white flex items-center gap-1 font-mono text-[11px] transition-colors"
            >
              <Download className="w-3 h-3 text-zinc-400" />
              <span>Export CSV</span>
            </a>
            <a
              href="/api/vault/export-iso20022?format=xml"
              download="synapse402-receipts.xml"
              title="Export spending receipts as XML"
              className="px-2.5 py-1 rounded-md bg-white/[.05] hover:bg-white/[.1] border border-white/10 text-zinc-300 hover:text-white flex items-center gap-1 font-mono text-[11px] transition-colors"
            >
              <FileText className="w-3 h-3 text-zinc-400" />
              <span>Export XML</span>
            </a>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToTab?.('demo')}
            className="px-4 py-2 rounded-xl bg-[#d7ff4f] hover:bg-[#cbf540] text-[#08090c] font-black text-xs flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            title="Open the payment walkthrough to run a test"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Open payment walkthrough</span>
          </button>
        </div>
      </div>

      {/* Interactive Simulation Result Card */}
      {simulationResult && (
        <div data-state={simulationResult.liveConfirmed ? 'success' : 'evaluation'} className="ui-result p-4 rounded-xl bg-white/[.03] backdrop-blur-md border border-white/[.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.05] text-[#d7ff4f] border border-white/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#d7ff4f]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Payment activity</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-zinc-300 border border-white/10 font-bold">
                  {simulationResult.liveConfirmed ? 'Mode: LIVE_TESTNET · SETTLED' : 'Mode: DEMO · EVALUATION'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {simulationResult.liveConfirmed ? 'Confirmed ' : 'Planned '}<strong className="text-white font-mono">${simulationResult.costUsd.toFixed(4)} USD</strong> for [<strong className="text-zinc-200">{simulationResult.agentName}</strong>].{simulationResult.liveConfirmed ? ' The verified Tempo receipt is available below.' : ' No verified blockchain receipt was returned.'}
              </p>
              <div className="mt-1.5 p-2.5 rounded bg-black/40 border border-white/10 text-[10.5px] font-sans text-zinc-300 leading-snug space-y-1">
                <div className="flex items-center justify-between text-[9px] font-mono uppercase font-bold text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-[#d7ff4f]" />
                    <span>Demo Provider response:</span>
                  </span>
                  <span className="text-zinc-500 font-mono text-[10px]">{simulationResult.liveConfirmed ? 'PAYMENT CONFIRMED' : 'PAYMENT NOT CONFIRMED'}</span>
                </div>
                <p className="text-zinc-200 text-[11px] font-mono">
                  Sample result: {simulationResult.deliverable}
                </p>
                <span className="text-[9.5px] text-zinc-400 block font-sans mt-1">
                  <strong className="text-zinc-300">What this proves:</strong> {simulationResult.liveConfirmed ? 'Tempo confirms this payment trace.' : 'This run has no verified Tempo receipt.'} The result above is sample provider data; it does not claim that an external service answered live.
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs shrink-0">
            {simulationResult.liveConfirmed && <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(simulationResult.txHash);
                setCopiedSimHash(true);
                setTimeout(() => setCopiedSimHash(false), 2000);
              }}
              className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/10 text-zinc-200 border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedSimHash ? (
                <span className="text-[#d7ff4f] font-bold">Hash Copied!</span>
              ) : (
                <span>Copy Receipt Hash</span>
              )}
            </button>}
            {simulationResult.liveConfirmed && <a
              href={tempoTransactionUrl(simulationResult.txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-[#d7ff4f]/15 hover:bg-[#d7ff4f]/25 text-[#d7ff4f] border border-[#d7ff4f]/30 flex items-center gap-1.5 transition-colors"
            >
              <span>Tempo Explorer</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>}
          </div>
        </div>
      )}
      {simulationError && !isTriggering && (
        <div role="alert" className="p-3 rounded-xl border border-red-300/25 bg-red-300/[.06] text-xs text-red-100">
          <strong className="text-red-200">Payment test stopped:</strong> {simulationError} No funds were charged.
        </div>
      )}

      {/* Receipts Filter Bar */}
      <div className="space-y-2 pt-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[10.5px] font-mono uppercase text-zinc-400 font-bold mr-1">Type:</span>
            {[
              { id: 'ALL', label: `All (${effectiveEvents.length})` },
              { id: 'CONFIRMED', label: `Confirmed (${confirmedCount})` },
              { id: 'DEMO', label: `Demo (${evaluationCount})` },
              { id: 'VOIDED', label: `Voided (${voidedCount})` },
            ].map((tab) => {
              const isSelected = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setStatusFilter(tab.id as any);
                    setCurrentPage(1);
                  }}
                  className={`ui-interactive px-2.5 py-1 rounded-lg text-[11px] font-mono transition cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? tab.id === 'CONFIRMED'
                        ? 'bg-[#d7ff4f] text-[#08090c] font-bold shadow-sm'
                        : 'bg-white text-[#08090c] font-bold shadow-sm'
                      : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/10'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <span className="text-xs font-mono text-zinc-400">
            Showing <strong className="text-white">{filteredEvents.length > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + pageSize, filteredEvents.length)}</strong> of {filteredEvents.length} payment receipts <span className="text-zinc-500">(Page {safePage} of {totalPages})</span>
          </span>
        </div>

        {/* Agent Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[10.5px] font-mono uppercase text-zinc-400 font-bold mr-1">Agent:</span>
          {filterTabs.map((tab) => {
            const isSelected = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setActiveFilter(tab.id as any);
                  setCurrentPage(1);
                }}
                className={`ui-interactive px-2.5 py-1 rounded-lg text-[11px] font-mono transition cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-[#d7ff4f]/20 text-[#d7ff4f] border border-[#d7ff4f]/50 font-bold'
                    : 'bg-white/[0.03] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] border border-white/5'
                }`}
                data-selected={isSelected}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Table */}
      <div className="ui-meta bg-white/[.03] backdrop-blur-md border border-white/[.08] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[760px] text-left text-xs font-sans">
            <thead className="bg-white/[.02] border-b border-white/[.08] text-zinc-400 text-[10.5px] uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-2.5 min-w-[105px] w-[125px]">AI Agent</th>
                <th className="py-2.5 px-2.5 min-w-[135px]">What it bought</th>
                <th className="py-2.5 px-2.5 min-w-[110px] w-[120px]">Provider</th>
                <th className="py-2.5 px-2 w-[90px] font-mono">Paid / Plan</th>
                <th className="py-2.5 px-2 w-[125px] font-mono">Status</th>
                <th className="py-2.5 px-2 min-w-[105px] text-center">Proof / Receipt</th>
                <th className="py-2.5 px-2 w-[70px] text-right font-mono">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[.06] text-zinc-300">
              {paginatedEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-zinc-500 font-mono text-xs">
                    No payment receipts found. Trigger a micropayment above to record in ledger.
                  </td>
                </tr>
              ) : (
                paginatedEvents.map((event) => {
                  const isVoidedOrZero = event.amountUsd === 0 || event.status === 'VOIDED' || event.status === 'REFUNDED';
                  const isLiveConfirmed = isConfirmed(event);
                  const isPending = isLivePending(event);
                  const isFailed = isLiveFailed(event);
                  
                  const isSampleProvider = event.providerDataStatus === 'EVALUATION_FIXTURE';
                  const cleanServiceName = event.serviceName || (isSampleProvider ? 'Demo Provider response' : 'Configured provider route');
                  const providerName = event.providerName || (isSampleProvider ? 'Demo Provider' : 'Configured provider');
                  const providerHost = isSampleProvider
                    ? 'Demo response · payment tracked separately'
                    : (() => {
                        try {
                          return event.serviceUrl && event.serviceUrl.startsWith('http')
                            ? new URL(event.serviceUrl).hostname
                            : 'Backend route';
                        } catch {
                          return 'Backend route';
                        }
                      })();

                  return (
                    <tr key={event.id} className="hover:bg-white/[.04] transition-colors">
                      {/* AI Agent */}
                      <td className="py-2.5 px-3 font-semibold text-white whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#d7ff4f] shrink-0"></span>
                          <span className="truncate max-w-[130px]" title={String(event.agentName || 'Market Research Agent')}>
                            {String(event.agentName || 'Market Research Agent').replace(/\bBot\b/g, 'Agent')}
                          </span>
                        </div>
                      </td>

                      {/* What it bought */}
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-white truncate max-w-[220px]" title={cleanServiceName}>
                          {cleanServiceName}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors truncate max-w-[220px]" title={event.serviceUrl}>
                          {(() => {
                            if (!event.serviceUrl) return 'Protected endpoint';
                            try {
                              const parsed = new URL(event.serviceUrl);
                              return (parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost')
                                ? parsed.pathname
                                : `${parsed.hostname}${parsed.pathname}`;
                            } catch {
                              return event.serviceUrl;
                            }
                          })()}
                        </div>
                      </td>

                      {/* Provider */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-medium text-zinc-200 truncate max-w-[130px]" title={providerName}>{providerName}</div>
                        <div className="text-[10px] font-mono text-zinc-500 truncate max-w-[130px]" title={providerHost}>
                          {providerHost}
                        </div>
                        {event.providerDataStatus === 'EVALUATION_FIXTURE' && (
                          <span className="mt-0.5 inline-block rounded border border-amber-300/25 bg-amber-300/[.06] px-1 py-0.2 text-[8px] font-mono font-bold uppercase text-amber-200">
                            Demo Provider
                          </span>
                        )}
                      </td>

                      {/* Paid amount and evaluation plan are shown separately. */}
                      <td className="py-2.5 px-2 whitespace-nowrap">
                        <span className={`inline-block whitespace-nowrap px-1.5 py-0.5 rounded font-mono font-bold border text-[10px] ${isLiveConfirmed ? 'bg-[#d7ff4f]/10 text-[#d7ff4f] border-[#d7ff4f]/30' : 'bg-white/[0.04] text-zinc-300 border-white/10'}`}>
                          ${Number(isLiveConfirmed ? event.amountUsd || 0 : 0).toFixed(4)}
                        </span>
                        <span className="block mt-0.5 text-[8.5px] text-zinc-500 font-mono">
                          {isLiveConfirmed ? 'Paid' : isPending ? `Pending · $${Number(event.amountUsd || 0).toFixed(4)}` : isFailed || isVoidedOrZero ? 'Not charged' : `Plan · $${Number(event.amountUsd || 0).toFixed(4)}`}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-2.5 font-mono whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <SynapseStatusBadge status={normalizeSynapseStatus(event)} size="sm" />
                          <span className="text-[8.5px] px-1.5 py-0.5 rounded font-mono font-semibold bg-white/[.04] text-zinc-400 border border-white/10 shrink-0">
                            {event.paymentMode || (event.executionMode === 'LIVE_TESTNET' ? 'LIVE' : 'DEMO')}
                          </span>
                          <span className="text-zinc-500 text-[9.5px] shrink-0">
                            {event.latencyMs}ms
                          </span>
                        </div>
                      </td>

                      {/* Proof / Receipt */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {onInspectEvent && (
                            <button
                              onClick={() => {
                                soundEngine.playClick();
                                onInspectEvent(event);
                              }}
                              className="px-2 py-0.5 rounded bg-white/[.04] hover:bg-white/10 border border-white/15 text-[10px] text-[#d7ff4f] font-semibold transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                              title="Inspect cryptographic receipt"
                            >
                              <FileText className="w-3 h-3 text-[#d7ff4f]" />
                              <span>Inspect</span>
                            </button>
                          )}
                          {event.txHash && event.txHash.length > 14 && (
                            <>
                              {isLiveConfirmed && (
                                <a
                                  href={tempoTransactionUrl(event.txHash)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-1.5 py-0.5 rounded bg-[#d7ff4f]/15 hover:bg-[#d7ff4f]/25 border border-[#d7ff4f]/30 text-[9.5px] text-[#d7ff4f] font-mono font-bold inline-flex items-center gap-0.5 shrink-0 transition"
                                  title="View receipt on Tempo L1 Explorer"
                                >
                                  <span>Explorer</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </>
                          )}
                          {isPending && !event.txHash && <span className="text-[9.5px] font-mono text-amber-200/80">Confirming...</span>}
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="py-2.5 px-3 text-right text-zinc-400 font-mono text-[10.5px] whitespace-nowrap">
                        {event.timestamp}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls Bar */}
      {filteredEvents.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-white/[.025] border border-white/[.08] text-xs font-mono">
          {/* Left: Rows per page selector */}
          <div className="flex items-center gap-2.5 text-zinc-400">
            <span>Rows per page:</span>
            <div className="flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/10">
              {[10, 15, 25, 50].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                    pageSize === size
                      ? 'bg-[#d7ff4f] text-[#08090c]'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <span className="text-zinc-500 text-[11px]">
              ({startIndex + 1}–{Math.min(startIndex + pageSize, filteredEvents.length)} of {filteredEvents.length})
            </span>
          </div>

          {/* Right: Page Navigation Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setCurrentPage(1);
              }}
              disabled={safePage === 1}
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              title="First Page"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setCurrentPage((p) => Math.max(1, p - 1));
              }}
              disabled={safePage === 1}
              className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1 text-[11px] cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            {/* Page number pills */}
            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pNum: number;
                if (totalPages <= 5) {
                  pNum = i + 1;
                } else if (safePage <= 3) {
                  pNum = i + 1;
                } else if (safePage >= totalPages - 2) {
                  pNum = totalPages - 4 + i;
                } else {
                  pNum = safePage - 2 + i;
                }
                const isActive = pNum === safePage;
                return (
                  <button
                    key={pNum}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setCurrentPage(pNum);
                    }}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                      isActive
                        ? 'bg-[#d7ff4f] text-[#08090c] shadow-sm font-black'
                        : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/10'
                    }`}
                  >
                    {pNum}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setCurrentPage((p) => Math.min(totalPages, p + 1));
              }}
              disabled={safePage === totalPages}
              className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1 text-[11px] cursor-pointer"
              title="Next Page"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setCurrentPage(totalPages);
              }}
              disabled={safePage === totalPages}
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              title="Last Page"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
