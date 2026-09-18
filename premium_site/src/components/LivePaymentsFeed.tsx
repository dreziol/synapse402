import React, { useState } from 'react';
import { LivePaymentEvent } from '../types/synapse402';
import { Activity, ExternalLink, Zap, Clock, FileText, Download, ShieldCheck, Loader2, Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { soundEngine } from '../utils/audioEffects';
import { InfoBadge } from './InfoBadge';

interface LivePaymentsFeedProps {
  events: LivePaymentEvent[];
  onInspectEvent?: (event: LivePaymentEvent) => void;
  onRefresh?: () => void;
}

const SIMULATION_SCENARIOS = [
  {
    keyId: 'key_cortex_research',
    agentName: 'Knowledge Retrieval Bot',
    targetUrl: 'https://api.vector-index.io/v1/embeddings/query',
    serviceName: 'Enterprise Vector DB Context',
    price: 0.0010,
    category: 'Vector Search',
    deliverable: 'Vector Index Query (quarterly_liquidity_model) — 3 verified chunks retrieved with 0.942 cosine similarity in 11ms.',
  },
  {
    keyId: 'key_quant_alpha',
    agentName: 'Reasoning Inference Bot',
    targetUrl: 'https://api.deepseek.com/v1/chat/completions',
    serviceName: 'DeepSeek R1 Reasoning Compute Gate',
    price: 0.0020,
    category: 'AI Inference',
    deliverable: 'DeepSeek R1 Reasoning Token Stream — 890 tokens returned (124 t/s). Executed optimal allocation trace.',
  },
  {
    keyId: 'key_polyglot_translator',
    agentName: 'Web Research Bot',
    targetUrl: 'https://api.scrape-proxy.dev/v1/scrape',
    serviceName: 'Headless Web Scraping Gateway',
    price: 0.0015,
    category: 'Data Extraction',
    deliverable: 'Headless Scraping Gateway (news.ycombinator.com) — 48.2 KB clean markdown extracted (0ms Captcha).',
  },
  {
    keyId: 'key_sec_audit',
    agentName: 'Code Security Bot',
    targetUrl: 'https://api.sandbox-python.dev/v1/run',
    serviceName: 'Isolated Python Cloud Sandbox',
    price: 0.0025,
    category: 'Cloud Sandbox',
    deliverable: 'Python 3.11 Isolated Container (cnt_safe_9842a) — All test assertions passed with exit code 0.',
  },
];

export const LivePaymentsFeed: React.FC<LivePaymentsFeedProps> = ({ events, onInspectEvent, onRefresh }) => {
  const [isTriggering, setIsTriggering] = useState(false);
  const [copiedSimHash, setCopiedSimHash] = useState(false);
  const [scenarioIndex, setScenarioIndex] = useState(0);
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

  const filterTabs = [
    { id: 'ALL', label: 'All Bot Payments' },
    { id: 'FINANCE', label: 'Finance & Quants' },
    { id: 'RESEARCH', label: 'Market Research' },
    { id: 'SECURITY', label: 'Security & Code' },
    { id: 'INFERENCE', label: 'AI Inference' },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const filteredEvents = (events || []).filter((ev) => {
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
    const t0 = performance.now();
    const scenario = SIMULATION_SCENARIOS[scenarioIndex % SIMULATION_SCENARIOS.length];
    setScenarioIndex((prev) => prev + 1);

    try {
      const res = await fetch('/api/mpp/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyId: scenario.keyId,
          targetUrl: scenario.targetUrl,
          pricePathUsd: scenario.price,
          category: scenario.category,
          allowDynamicWhitelist: true,
        }),
      });
      const latency = Math.round(performance.now() - t0);
      const data = await res.json().catch(() => null);
      if (res.ok) {
        const liveConfirmed = data?.trace?.executionMode === 'LIVE_TESTNET'
          && data?.trace?.status === 'SETTLED'
          && typeof data?.trace?.txHash === 'string'
          && data.trace.txHash.startsWith('0x');
        if (liveConfirmed) soundEngine.playSettlementChime();
        setSimulationResult({
          txHash: liveConfirmed ? data.trace.txHash : '',
          liveConfirmed,
          agentName: scenario.agentName,
          serviceName: scenario.serviceName,
          costUsd: scenario.price,
          latencyMs: latency || 135,
          deliverable: scenario.deliverable,
        });
        if (onRefresh) onRefresh();
      } else {
        soundEngine.playDefenseIntercept();
      }
    } catch {
      soundEngine.playDefenseIntercept();
    } finally {
      setIsTriggering(false);
    }
  };
  return (
    <section id="section-live-payments-feed" className="space-y-4 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl bg-[#0c0e14]/90 border border-white/10 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-[#d7ff4f] text-[#08090c] font-black text-[10px] tracking-wider uppercase">
              PAYMENTS HISTORY
            </span>
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

          <span className="px-2.5 py-1.5 rounded-lg bg-white/[.03] border border-white/10 text-zinc-400 font-mono text-xs">
            Tempo Testnet (42431)
          </span>

          <button
            onClick={handleTriggerMicropayment}
            disabled={isTriggering}
            className="px-4 py-2 rounded-xl bg-[#d7ff4f] hover:bg-[#cbf540] text-[#08090c] font-black text-xs flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            title="Run the payment flow; a chain receipt appears only after live confirmation"
          >
            {isTriggering ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Checking Payment...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-current text-[#08090c]" />
                <span>Test payment flow</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interactive Simulation Result Card */}
      {simulationResult && (
        <div className="p-4 rounded-xl bg-white/[.03] backdrop-blur-md border border-white/[.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.05] text-[#d7ff4f] border border-white/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#d7ff4f]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Payment activity</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-zinc-300 border border-white/10 font-bold">
                  {simulationResult.liveConfirmed ? 'Confirmed on Tempo L1' : 'Evaluation response'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {simulationResult.liveConfirmed ? 'Confirmed ' : 'Planned '}<strong className="text-white font-mono">${simulationResult.costUsd.toFixed(4)} USD</strong> for [<strong className="text-zinc-200">{simulationResult.agentName}</strong>] and returned <strong className="text-white">{simulationResult.serviceName}</strong>.{simulationResult.liveConfirmed ? ' The chain receipt is available below.' : ' No blockchain transaction was submitted.'}
              </p>
              <div className="mt-1.5 p-2.5 rounded bg-black/40 border border-white/10 text-[10.5px] font-sans text-zinc-300 leading-snug space-y-1">
                <div className="flex items-center justify-between text-[9px] font-mono uppercase font-bold text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-[#d7ff4f]" />
                    <span>Production Execution Outcome:</span>
                  </span>
                  <span className="text-zinc-500 font-mono text-[10px]">{simulationResult.liveConfirmed ? 'CHAIN RECEIPT CONFIRMED' : 'EVALUATION ONLY'}</span>
                </div>
                <p className="text-zinc-200 text-[11px] font-mono">
                  Production Deliverable: {simulationResult.deliverable}
                </p>
                <span className="text-[9.5px] text-zinc-400 block font-sans mt-1">
                  <strong className="text-zinc-300">What this proves:</strong> {simulationResult.liveConfirmed ? 'Confirms the payment trace on Tempo L1.' : 'Shows the payment flow and provider response without claiming a chain receipt.'} It does not independently verify external provider data accuracy.
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
              href="https://explore.tempo.xyz"
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

      {/* Receipts Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[10.5px] font-mono uppercase text-zinc-400 font-bold mr-1">Filter by Bot:</span>
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
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#d7ff4f] text-[#08090c] font-bold shadow-sm'
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

      {/* Live Table */}
      <div className="bg-white/[.03] backdrop-blur-md border border-white/[.08] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-white/[.02] border-b border-white/[.08] text-zinc-400 text-[11px] uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">AI Agent</th>
                <th className="py-3 px-4">What it bought</th>
                <th className="py-3 px-4">Provider</th>
                <th className="py-3 px-4 font-mono">Amount</th>
                <th className="py-3 px-4 font-mono">Status</th>
                <th className="py-3 px-4 text-center">Proof / Receipt</th>
                <th className="py-3 px-4 text-right">Time</th>
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
                  const isLiveConfirmed = event.executionMode === 'LIVE_TESTNET'
                    && event.status === 'SETTLED'
                    && typeof event.txHash === 'string'
                    && event.txHash.startsWith('0x');
                  
                  // Bulletproof service name sanitize
                  let cleanServiceName = event.serviceName || '';
                  if (!cleanServiceName || cleanServiceName.startsWith('MPP:') || cleanServiceName.startsWith('SLA_REFUND:') || cleanServiceName.startsWith('pacs.008') || cleanServiceName.includes('REFUND_') || cleanServiceName.includes('HTTP 400 Error')) {
                    const ep = (event.serviceUrl || '').toLowerCase();
                    if (ep.includes('binance') || ep.includes('depth') || ep.includes('orderbook') || ep.includes('fin-depth')) {
                      cleanServiceName = isVoidedOrZero ? 'Market Depth (Orderbook Data) — Voided' : 'Market Depth (Orderbook Data)';
                    } else if (ep.includes('academic') || ep.includes('licensing') || ep.includes('paper')) {
                      cleanServiceName = isVoidedOrZero ? 'Licensed Research Paper — Voided' : 'Licensed Research Paper (Nature Physics)';
                    } else if (ep.includes('sec') || ep.includes('10k') || ep.includes('filing')) {
                      cleanServiceName = isVoidedOrZero ? 'Audited Financial Statements — Voided' : 'Audited Financial Statements (10-K)';
                    } else if (ep.includes('deepseek')) {
                      cleanServiceName = isVoidedOrZero ? 'DeepSeek R1 Reasoning — Voided' : 'DeepSeek R1 Reasoning Inference';
                    } else if (ep.includes('sandbox') || ep.includes('python')) {
                      cleanServiceName = isVoidedOrZero ? 'Isolated Python Cloud Sandbox — Voided' : 'Isolated Python Cloud Sandbox';
                    } else {
                      cleanServiceName = isVoidedOrZero ? 'Upstream Service (Payment Voided)' : 'HTTP 402 Monetized Resource';
                    }
                  }

                  // Derive clean provider name and host
                  const ep = (event.serviceUrl || '').toLowerCase();
                  let providerName = 'API Provider';
                  let providerHost = 'api.partner.io';
                  if (ep.includes('binance') || ep.includes('market-depth')) {
                    providerName = 'Market Depth Mesh';
                    providerHost = 'api.market-depth-mesh.io';
                  } else if (ep.includes('nature') || ep.includes('academic') || ep.includes('paper')) {
                    providerName = 'Nature Research';
                    providerHost = 'nature.com';
                  } else if (ep.includes('sec') || ep.includes('edgar')) {
                    providerName = 'SEC EDGAR';
                    providerHost = 'sec.gov';
                  } else if (ep.includes('deepseek')) {
                    providerName = 'DeepSeek AI';
                    providerHost = 'api.deepseek.com';
                  } else if (ep.includes('sandbox') || ep.includes('python')) {
                    providerName = 'Cloud Sandbox';
                    providerHost = 'compute.internal';
                  } else if (ep.includes('adroll') || ep.includes('meta') || ep.includes('google')) {
                    providerName = 'Ad Exchange';
                    providerHost = 'ad-network.net';
                  } else if (ep.includes('crm') || ep.includes('hubspot')) {
                    providerName = 'CRM Gateway';
                    providerHost = 'api.hubspot.com';
                  } else {
                    try {
                      if (event.serviceUrl && event.serviceUrl.startsWith('http')) {
                        const u = new URL(event.serviceUrl);
                        providerName = u.hostname.replace('api.', '').split('.')[0].toUpperCase();
                        providerHost = u.hostname;
                      }
                    } catch {
                      // fallback
                    }
                  }

                  return (
                    <tr key={event.id} className="hover:bg-white/[.04] transition-colors">
                      {/* AI Agent */}
                      <td className="py-3 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#d7ff4f]"></span>
                          <span className="truncate max-w-[140px]">{event.agentName || 'Market Research Bot'}</span>
                        </div>
                      </td>

                      {/* What it bought */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-white">{cleanServiceName}</div>
                        <div className="text-[10.5px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors truncate max-w-[240px]" title={event.serviceUrl}>
                          {event.serviceUrl}
                        </div>
                      </td>

                      {/* Provider */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-zinc-200">{providerName}</div>
                        <div className="text-[10.5px] font-mono text-zinc-500 truncate max-w-[160px]">
                          {providerHost}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4">
                        {isVoidedOrZero ? (
                          <span className="px-2.5 py-0.5 rounded bg-white/[0.04] text-zinc-400 font-mono border border-white/10 text-[11px]">
                            Voided ($0.00)
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded bg-[#d7ff4f]/10 text-[#d7ff4f] font-mono font-bold border border-[#d7ff4f]/30 text-[11px]">
                            ${Number(event.amountUsd || 0).toFixed(4)} USD
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-semibold ${
                            isLiveConfirmed
                              ? 'bg-[#d7ff4f]/10 text-[#d7ff4f] border border-[#d7ff4f]/30'
                              : isVoidedOrZero
                              ? 'bg-white/[0.04] text-zinc-400 border border-white/10'
                              : 'bg-white/[0.04] text-zinc-300 border border-white/10'
                          }`}>
                            {isLiveConfirmed ? 'ON-CHAIN' : isVoidedOrZero ? 'VOIDED' : 'EVALUATION'}
                          </span>
                          <span className="text-zinc-500 text-[10px]">
                            {event.latencyMs}ms
                          </span>
                        </div>
                      </td>

                      {/* Proof / Receipt */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {onInspectEvent && (
                            <button
                              onClick={() => {
                                soundEngine.playClick();
                                onInspectEvent(event);
                              }}
                              className="px-2.5 py-1 rounded bg-white/[.04] hover:bg-white/10 border border-white/15 text-[10px] text-[#d7ff4f] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                              title="Inspect cryptographic receipt"
                            >
                              <FileText className="w-3 h-3 text-[#d7ff4f]" />
                              <span>Inspect</span>
                            </button>
                          )}
                          {event.txHash && event.txHash.length > 14 && (
                            <span className="text-[10px] font-mono text-zinc-500 hidden xl:inline">
                              {event.txHash.slice(0, 6)}...{event.txHash.slice(-4)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-4 text-right text-zinc-400 font-mono text-[11px]">
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
