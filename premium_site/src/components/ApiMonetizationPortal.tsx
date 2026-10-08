import { TEMPO_EXPLORER_URL, tempoTransactionUrl } from '../config/network';
import React, { useState } from 'react';
import { MonetizedApiEndpoint } from '../types/synapse402';
import { Store, Plus, Copy, Check, Code2, Play, Loader2, CheckCircle2, ExternalLink, ArrowRightLeft, Coins, Sparkles, Zap, Flame, ShieldAlert, RefreshCw, ShieldCheck, DollarSign, Globe, Palette, FileText, Mic, Plane, TrendingUp, BarChart3, Box } from 'lucide-react';
import { soundEngine } from '../utils/audioEffects';
import { InfoBadge } from './InfoBadge';
import { useSynapseState } from '../shared/SynapseStateContext';

interface ApiMonetizationPortalProps {
  endpoints: MonetizedApiEndpoint[];
  onAddEndpoint: (endpoint: { title: string; endpointUrl: string; pricePerCallUsd: number; category: string }) => Promise<boolean>;
  walletAddress?: string | null;
  executionMode?: 'LIVE_TESTNET' | 'RESILIENT_SANDBOX';
}

export const ApiMonetizationPortal: React.FC<ApiMonetizationPortalProps> = ({
  endpoints,
  onAddEndpoint,
  walletAddress = null,
  executionMode = 'RESILIENT_SANDBOX',
}) => {
  const { executePayment } = useSynapseState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [testingEndpointId, setTestingEndpointId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; status: number; txHash?: string; receiptVerified?: boolean; message: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAllEndpoints, setShowAllEndpoints] = useState(false);
  const [localStats, setLocalStats] = useState<Record<string, { calls: number; earned: number }>>({});
  const [saveError, setSaveError] = useState<string | null>(null);

  // Dynamic Surge Pricing / Burst Protection Simulator State
  const [isSurgeTesting, setIsSurgeTesting] = useState(false);
  const [surgeLogs, setSurgeLogs] = useState<Array<{ callNumber: number; costUsd: number; surgeActive: boolean; multiplier: number; status: number }>>([]);

  // Monetization Projection Calculator State
  const [calcMonthlyRequests, setCalcMonthlyRequests] = useState<number>(500000);
  const [calcPricePerRequest, setCalcPricePerRequest] = useState<number>(0.002);

  // CoinGlass opportunity calculator: illustrative request volume, not a partnership claim.
  const [coinglassRequests, setCoinglassRequests] = useState<number>(100000);
  const coinglassPricePerQuery = 0.002;
  const coinglassGrossRevenue = coinglassRequests * coinglassPricePerQuery;
  const coinglassProtocolFee = coinglassGrossRevenue * 0.001;
  const coinglassProviderPayout = coinglassGrossRevenue - coinglassProtocolFee;

  const handleRunSurgeDemo = async () => {
    soundEngine.playClick();
    setIsSurgeTesting(true);
    setSurgeLogs([]);

    const newLogs: Array<{ callNumber: number; costUsd: number; surgeActive: boolean; multiplier: number; status: number }> = [];

    for (let i = 1; i <= 5; i++) {
      try {
        const res = await fetch('/api/v1/surge-demo');
        const data = await res.json();
        const costUsd = Number(data.costPathUsd ?? data.effectivePrice ?? data.minPrice ?? 0.001);
        const surgeMultiplier = Number(data.surgeMultiplier ?? (costUsd / 0.001));
        newLogs.push({
          callNumber: i,
          costUsd: Number.isFinite(costUsd) ? costUsd : 0.001,
          surgeActive: Boolean(data.surgeActive) || costUsd > 0.001,
          multiplier: Number.isFinite(surgeMultiplier) ? surgeMultiplier : 1,
          status: res.status,
        });
        setSurgeLogs([...newLogs]);
        if (data.surgeActive) {
          soundEngine.playSettlementChime();
        }
        await new Promise((r) => setTimeout(r, 85));
      } catch (e: any) {
        // Fallback
      }
    }
    setIsSurgeTesting(false);
  };

  // Form State
  const [title, setTitle] = useState('');
  const [endpointUrl, setEndpointUrl] = useState('');
  const [pricePerCallUsd, setPricePerCallUsd] = useState('0.002');
  const [category, setCategory] = useState('Market Data');

  const getPricingModel = (ep: MonetizedApiEndpoint) => {
    const url = ep.endpointUrl.toLowerCase();
    if (url.includes('translate')) return 'Pay-per-document (on-demand)';
    if (url.includes('vision') || url.includes('remove-bg')) return 'Pay-per-image (on-demand)';
    if (url.includes('article') || url.includes('news')) return 'Pay-per-article (on-demand)';
    if (url.includes('containers') || url.includes('python')) return 'Pay-per-execution (on-demand)';
    if (url.includes('scrape') || url.includes('stealth')) return 'Pay-per-scrape (on-demand)';
    if (url.includes('synthesize') || url.includes('voice')) return 'Pay-per-second (on-demand)';
    if (url.includes('fares') || url.includes('flights')) return 'Pay-per-lookup (on-demand)';
    if (url.includes('verify') || url.includes('identity')) return 'Pay-per-check (on-demand)';
    if (url.includes('binance') || url.includes('market-depth')) return 'Pay-per-query (on-demand)';
    if (url.includes('sec-edgar') || url.includes('sec-data-mirror')) return 'Pay-per-filing (on-demand)';
    return 'Pay-per-call (on-demand)';
  };

  const getRealisticComparison = (ep: MonetizedApiEndpoint) => {
    const url = ep.endpointUrl.toLowerCase();
    if (url.includes('translate')) return { old: '$25/mo Translation SaaS plan', gain: 'Pay per document ($0 idle cost)' };
    if (url.includes('vision') || url.includes('remove-bg')) return { old: '$35/mo Image AI SaaS', gain: 'Pay per image ($0 idle cost)' };
    if (url.includes('article') || url.includes('news') || url.includes('scrape')) return { old: '$49/mo Scraping proxy retainer', gain: 'Authorized structured markdown ($0 dead retainer)' };
    if (url.includes('containers') || url.includes('python')) return { old: '$30/mo Cloud VM retainer', gain: 'Zero idle server burn' };
    if (url.includes('synthesize') || url.includes('voice')) return { old: '$25/mo Voice AI SaaS tier', gain: 'Pay per second (zero credit expiry)' };
    if (url.includes('fares') || url.includes('flights')) return { old: '$500+ Enterprise Flight Data tier', gain: 'Instant programmatic lookup' };
    if (url.includes('verify') || url.includes('identity')) return { old: '$50/mo KYC provider tier', gain: 'Zero monthly retainer' };
    if (url.includes('binance') || url.includes('orderbook') || url.includes('market-depth')) return { old: '$29/mo licensed depth feed', gain: 'Pay only for normalized/deep snapshots' };
    if (url.includes('sec-edgar') || url.includes('sec-data-mirror')) return { old: '$49/mo Financial filing feed', gain: 'Pay per parsed financial filing' };
    return { old: '$20–$50/mo SaaS plan', gain: 'Pay per call (Zero idle subscription cost)' };
  };

  const renderDeliveredIcon = (iconName: string) => {
    switch (iconName) {
      case 'Globe': return <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
      case 'Palette': return <Palette className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
      case 'FileText': return <FileText className="w-3.5 h-3.5 text-zinc-200 shrink-0" />;
      case 'Code2': return <Code2 className="w-3.5 h-3.5 text-violet-400 shrink-0" />;
      case 'Mic': return <Mic className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />;
      case 'Plane': return <Plane className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'ShieldCheck': return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'TrendingUp': return <TrendingUp className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
      case 'BarChart3': return <BarChart3 className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
      default: return <Box className="w-3.5 h-3.5 text-zinc-400 shrink-0" />;
    }
  };

  const getDeliveredData = (ep: MonetizedApiEndpoint) => {
    const url = ep.endpointUrl.toLowerCase();
    if (url.includes('translate')) return {
      type: 'Translated Document',
      detail: 'German ➔ English: "Machine commerce with pay-per-request access and no human checkout."',
      iconName: 'Globe',
    };
    if (url.includes('vision') || url.includes('remove-bg')) return {
      type: 'Transparent Image PNG',
      detail: 'High-Res Alpha Cutout (transparent background extracted, 0 artifacts)',
      iconName: 'Palette',
    };
    if (url.includes('article') || url.includes('news') || url.includes('scrape')) return {
      type: 'Full-Text Article',
      detail: '"Global Machine Economy Transition 2026: AI agents request micro-services per call under strict budget guardrails."',
      iconName: 'FileText',
    };
    if (url.includes('containers') || url.includes('python')) return {
      type: 'Python Container Output',
      detail: 'Container Exited 0: Python script executed cleanly in isolated sandbox. All test assertions passed. No runtime errors detected.',
      iconName: 'Code2',
    };
    if (url.includes('synthesize') || url.includes('voice')) return {
      type: 'Neural Audio Clip',
      detail: 'PCM WAV 24kHz (4.2s speech synthesized): "Payment authorized within the configured budget."',
      iconName: 'Mic',
    };
    if (url.includes('fares') || url.includes('flights')) return {
      type: 'Example GDS Itinerary',
      detail: 'Example fare response: JFK ➔ SFO | Non-Stop | Class Y (availability returned by the connected provider)',
      iconName: 'Plane',
    };
    if (url.includes('verify') || url.includes('identity')) return {
      type: 'Compliance & Sanctions Report',
      detail: 'Example compliance payload • live sanctions lookup is not run in this demo.',
      iconName: 'ShieldCheck',
    };
    if (url.includes('binance') || url.includes('orderbook') || url.includes('market-depth')) return {
      type: 'Example L2 Orderbook Snapshot',
      detail: 'Example normalized depth: AAPL/USD bids and asks with a calculated spread; public spot data is not presented as paid.',
      iconName: 'TrendingUp',
    };
    if (url.includes('sec-edgar') || url.includes('sec-data-mirror')) return {
      type: 'Example Filing Digest',
      detail: 'Example normalized filing metrics; the connected provider may charge for licensed parsing or enrichment.',
      iconName: 'BarChart3',
    };
    return {
      type: 'API Structured Data',
      detail: 'Structured payload delivered; a chain receipt appears only after live settlement.',
      iconName: 'Box',
    };
  };

  const handleTestEndpoint = async (ep: MonetizedApiEndpoint) => {
    soundEngine.playClick();
    setTestingEndpointId(ep.id);
    setTestResult(null);

    try {
      const settleRes = await executePayment({
        keyId: 'key_quant_alpha',
        targetUrl: ep.endpointUrl,
        pricePathUsd: ep.pricePerCallUsd,
        category: ep.category,
        evaluationOnly: executionMode !== 'LIVE_TESTNET',
        jobId: `earn_${ep.id}_${Date.now()}`,
        jobBudgetPathUsd: ep.pricePerCallUsd,
        serviceName: ep.title,
        providerName: ep.endpointUrl,
      });
      const isLiveSettlement = settleRes.status === 'CONFIRMED'
        && typeof settleRes.txHash === 'string'
        && /^0x[a-fA-F0-9]{64}$/.test(settleRes.txHash);
      if (isLiveSettlement) soundEngine.playSettlementChime();
      setLocalStats((prev) => {
        const current = prev[ep.id] || { calls: ep.totalCalls, earned: ep.totalEarnedUsd };
        return {
          ...prev,
          [ep.id]: {
            calls: current.calls + (isLiveSettlement ? 1 : 0),
            earned: Number((current.earned + (isLiveSettlement ? ep.pricePerCallUsd : 0)).toFixed(4)),
          },
        };
      });
      setTestResult({
        id: ep.id,
        status: 200,
        txHash: settleRes.txHash || undefined,
        receiptVerified: isLiveSettlement,
        message: isLiveSettlement
          ? `HTTP 200 OK • Settled on Tempo L1 (${Number.isFinite(Number(settleRes.latencyMs)) ? Number(settleRes.latencyMs) : 0}ms)`
          : 'HTTP 200 OK • Evaluation response returned; no chain transaction was submitted',
      });
    } catch (err: any) {
      soundEngine.playDefenseIntercept();
      setTestResult({
        id: ep.id,
        status: 402,
        message: err?.message || 'Payment execution failed',
      });
    } finally {
      setTestingEndpointId(null);
    }
  };

  const handleCopy = (id: string, text: string) => {
    soundEngine.playClick();
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !endpointUrl || !pricePerCallUsd) return;

    soundEngine.playClick();

    setSaveError(null);
    const saved = await onAddEndpoint({
      title,
      endpointUrl,
      pricePerCallUsd: parseFloat(pricePerCallUsd),
      category,
    });
    if (!saved) {
      setSaveError('The route was not saved. Check the API response and try again.');
      return;
    }

    setTitle('');
    setEndpointUrl('');
    setPricePerCallUsd('0.002');
    setIsModalOpen(false);
  };

  return (
    <section id="section-api-monetization" className="space-y-6 font-sans">
      {/* Header */}
      <div className="ui-section relative isolate overflow-hidden bg-white/[.03] backdrop-blur-md border border-white/[.08] rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <svg aria-hidden="true" className="pointer-events-none absolute inset-x-[-8%] bottom-[-30%] h-[90%] w-[116%] opacity-25" viewBox="0 0 1200 360" fill="none" preserveAspectRatio="none">
          {[0, 1, 2, 3, 4, 5].map((offset) => (
            <path key={offset} d={`M-20 ${258 - offset * 22} C 110 ${120 + offset * 10}, 180 ${350 - offset * 8}, 330 ${205 + offset * 8} S 520 ${80 + offset * 20}, 690 ${225 - offset * 5} S 900 ${370 - offset * 9}, 1220 ${140 + offset * 14}`} stroke="#b6e84a" strokeOpacity={0.22 + offset * 0.025} strokeWidth="2" />
          ))}
        </svg>
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center flex-wrap gap-1">
            <span>Let agents pay for a structured response</span>
            <InfoBadge
              title="How this works"
              text="A service can return a payment request for machine access. The connected backend confirms the payment status before the payload is treated as paid."
            />
          </h3>
          <p className="ui-explainer text-sm text-zinc-300 mt-1 max-w-2xl leading-relaxed font-sans">
            Most sites treat automated traffic as a threat and return a 403, so an agent cannot finish the job. Add a small payment gate with the SDK: an approved agent can request structured access, the service states its price, and the rules decide whether the request can continue. The figures below are examples; a payment is presented as confirmed only when the backend returns a trace.
          </p>
        </div>

        <div className="relative z-10 self-start md:self-auto">
          <button
            id="btn-register-api-endpoint"
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 bg-[#d7ff4f] hover:bg-[#cbf540] text-[#08090c] font-black text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(215,255,79,0.25)] border border-[#d7ff4f]"
          >
            <Plus className="w-4 h-4 text-[#08090c]" />
            <span>+ Add route to demo</span>
          </button>
          <p className="text-[10px] text-zinc-500 mt-1 max-w-[15rem]">
            Adds a sample route to this dashboard; it does not install middleware in your server.
          </p>
        </div>
      </div>

      {/* The page follows one exchange: a provider prices a route, an agent requests it, and a receipt records any confirmed payment. */}
      <div className="ui-explainer bg-white/[0.02] border border-white/10 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-[#d7ff4f]" />
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wide">
              How the service and agent fit together
            </h4>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-zinc-400 border border-white/10">
              One request, one price, one receipt
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] font-sans">
          <div className="ui-meta bg-white/[.025] p-3.5 rounded-lg border border-white/[.08] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#f5f5f2]">
              <div className="w-6 h-6 rounded bg-[#d7ff4f]/10 text-[#d7ff4f] flex items-center justify-center shrink-0">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <span>Provider sets a price</span>
              <InfoBadge
                title="What the provider does"
                text="Lets a service answer an approved paid request instead of maintaining user accounts. In live mode the configured Treasury relayer submits the approved settlement and returns a receipt."
              />
            </div>
            <p className="text-zinc-300 text-[11px] leading-relaxed">
              Set a per-request price and protect the route with the middleware. A live settlement uses the configured relayer; the provider receives a receipt for the request.
            </p>
          </div>

          <div className="ui-meta bg-white/[.025] p-3.5 rounded-lg border border-white/[.08] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#f5f5f2]">
              <div className="w-6 h-6 rounded bg-[#d7ff4f]/10 text-[#d7ff4f] flex items-center justify-center shrink-0">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span>Agent requests access</span>
              <InfoBadge
                title="What the agent does"
                text="Agents purchase niche data on demand without human accounts, monthly retainers, or credit card forms."
              />
            </div>
            <p className="text-zinc-300 text-[11px] leading-relaxed">
              The agent answers the HTTP 402 challenge within its job limit and receives <strong>structured JSON</strong> when the route is approved. No checkout form or recurring account is needed.
            </p>
          </div>

          <div className="ui-meta bg-white/[.025] p-3.5 rounded-lg border border-white/[.08] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#f5f5f2]">
              <div className="w-6 h-6 rounded bg-[#d7ff4f]/10 text-[#d7ff4f] flex items-center justify-center shrink-0">
                <Coins className="w-3.5 h-3.5" />
              </div>
              <span>Payment is recorded</span>
              <InfoBadge
                title="What the receipt proves"
                text="Small per-request prices make machine-to-machine access practical; exact chain fees are shown only for a confirmed live trace."
              />
            </div>
            <p className="text-zinc-300 text-[11px] leading-relaxed">
              The gateway checks the job limit and provider route first. Only a confirmed Tempo trace is shown as settled; otherwise the request stays an evaluation record.
            </p>
          </div>
        </div>
      </div>

      <div className="py-1 text-center" aria-hidden="true">
        <span className="inline-flex items-center gap-2 border-y border-[#d7ff4f]/20 py-2 text-xs sm:text-sm font-mono font-black uppercase tracking-[0.12em] text-[#d7ff4f]">01 · CoinGlass Provider Case Study · Without vs With Synapse402 SDK</span>
      </div>

      {/* Concrete provider story: unified comparison & revenue simulator */}
      <div className="rounded-2xl border border-[#d7ff4f]/25 bg-[#d7ff4f]/[.04] p-4 sm:p-6 space-y-5 shadow-[0_12px_40px_rgba(0,0,0,.14)]">
        <div className="flex items-start gap-3 border-b border-white/10 pb-4">
          <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#d7ff4f]/15 text-[#d7ff4f] border border-[#d7ff4f]/25">
            <Store className="h-[18px] w-[18px]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-base font-black uppercase tracking-wide text-white">CoinGlass Provider Opportunity (Case Study)</h4>
              <span className="rounded border border-amber-300/25 bg-amber-300/10 px-2 py-0.5 text-[9px] font-mono font-bold uppercase text-amber-200">Illustrative Model</span>
            </div>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-zinc-300">
              CoinGlass does not have the Synapse402 SDK, so the AI cannot buy only the liquidation data it needs. If CoinGlass added the SDK, the AI could pay a small amount for this single request, and CoinGlass could earn additional revenue from machine users who would not buy a full recurring API subscription.
            </p>
          </div>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/[.22] p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Current State · Without Synapse402</span>
              <span className="rounded bg-rose-500/15 border border-rose-500/30 px-1.5 py-0.5 text-[9px] font-mono font-bold text-rose-300">BLOCKED</span>
            </div>
            <p className="text-xs leading-relaxed text-zinc-300">
              Liquidation query needed by AI agent → no per-query payment path → agent cannot justify a full enterprise subscription for one check → request aborted.
            </p>
            <div className="pt-2 border-t border-white/[0.06] text-xs font-mono text-amber-200 font-bold">
              Provider Revenue: $0.00 (lost machine traffic)
            </div>
          </div>

          <div className="rounded-xl border border-[#d7ff4f]/30 bg-[#d7ff4f]/[.06] p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#d7ff4f]">Next State · With Synapse402 SDK</span>
              <span className="rounded bg-[#d7ff4f]/20 border border-[#d7ff4f]/40 px-1.5 py-0.5 text-[9px] font-mono font-bold text-[#d7ff4f]">MONETIZED</span>
            </div>
            <p className="text-xs leading-relaxed text-zinc-200">
              AI requests liquidation route → HTTP 402 challenge → agent signs sub-cent Tempo payment ($0.002) → structured data returned immediately.
            </p>
            <div className="pt-2 border-t border-[#d7ff4f]/20 text-xs font-mono text-[#d7ff4f] font-bold">
              Provider Revenue: $0.0020 per query (net automated income)
            </div>
          </div>
        </div>

        {/* Interactive Revenue Simulator */}
        <div className="rounded-xl border border-white/10 bg-black/[.18] p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-2.5">
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Simulated Machine Query Revenue</span>
              <span className="ml-2 text-[10px] text-zinc-400 font-mono">(at $0.0020 / request)</span>
            </div>
            <span className="text-xs font-mono font-black text-[#d7ff4f]">{coinglassRequests.toLocaleString()} queries/mo</span>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr] lg:items-center pt-1">
            <div>
              <input
                aria-label="Illustrative CoinGlass monthly liquidation queries"
                type="range"
                min="10000"
                max="1000000"
                step="10000"
                value={coinglassRequests}
                onChange={(event) => setCoinglassRequests(Number(event.target.value))}
                className="w-full accent-[#d7ff4f]"
              />
              <div className="mt-1 flex justify-between text-[10px] font-mono text-zinc-500">
                <span>10k queries</span>
                <span>500k</span>
                <span>1M queries</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-white/10 bg-black/[.25] p-2.5">
                <div className="text-[10px] uppercase tracking-wide text-zinc-400">Gross</div>
                <div className="mt-0.5 text-base font-black text-white">${coinglassGrossRevenue.toFixed(2)}</div>
              </div>
              <div className="rounded-xl border border-[#d7ff4f]/30 bg-[#d7ff4f]/[.08] p-2.5">
                <div className="text-[10px] uppercase tracking-wide text-[#d7ff4f]">Provider Net</div>
                <div className="mt-0.5 text-base font-black text-[#d7ff4f]">${coinglassProviderPayout.toFixed(2)}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/[.25] p-2.5">
                <div className="text-[10px] uppercase tracking-wide text-zinc-400">0.1% Fee</div>
                <div className="mt-0.5 text-base font-black text-zinc-300">${coinglassProtocolFee.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <p className="text-[11px] leading-relaxed text-zinc-400 border-t border-white/[0.06] pt-2.5">
            In this model, CoinGlass would add the Synapse402 middleware to its own API and expose a priced liquidation route. AI agents buy only the specific liquidation snapshot they need. That SDK connection turns otherwise-lost automated demand into useful partner traffic and request-level revenue; it does not claim CoinGlass is already integrated.
          </p>
        </div>

        {/* Provider Ecosystem */}
        <div className="rounded-xl border border-white/10 bg-black/[.12] px-3.5 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-[11px] font-black uppercase tracking-[0.14em] text-white">Universal Machine Economy Ecosystem</div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wide text-[#d7ff4f]">Open to any API or Web Service</div>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">CoinGlass is one worked case study. The same SDK route can sell any useful API response to an agent, one request at a time.</p>
          <div className="mt-2.5 flex flex-wrap gap-2 text-[10px] font-semibold text-zinc-200">
            <span className="rounded-full border border-[#d7ff4f]/30 bg-[#d7ff4f]/10 px-2.5 py-1 text-[#d7ff4f]">Data providers</span>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-2.5 py-1">AI services</span>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-2.5 py-1">Research tools</span>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-2.5 py-1">Content platforms</span>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-2.5 py-1">Compute services</span>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-2.5 py-1">Specialist APIs</span>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-2.5 py-1 text-zinc-400">+ any paid machine service</span>
          </div>
        </div>
      </div>

      <div className="pt-1 text-center" aria-hidden="true">
        <span className="inline-flex items-center gap-2 border-y border-[#d7ff4f]/20 py-2 text-xs sm:text-sm font-mono font-black uppercase tracking-[0.12em] text-[#d7ff4f]">02 · Implementation · Add the SDK route in provider code</span>
      </div>

      {/* Middleware integration guide */}
      <div className="space-y-2">
        <div className="rounded-xl border border-[#d7ff4f]/25 bg-[#d7ff4f]/[.04] px-4 py-3 text-center">
          <div className="text-[10px] font-black uppercase tracking-widest text-[#d7ff4f]">What this code means for CoinGlass</div>
          <p className="mx-auto mt-1 max-w-4xl text-xs leading-relaxed text-zinc-300">This is the integration point: CoinGlass would add the Synapse402 middleware to its own code, expose a priced liquidation route, and let useful AI agents request that data automatically. That creates a partner route where machine demand can become request-level revenue instead of being blocked or left unserved.</p>
        </div>
        <div className="bg-white/[.03] backdrop-blur-md border border-white/[.08] rounded-xl p-5 text-xs space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-white/[.08] pb-2">
            <span className="text-zinc-100 font-semibold flex items-center gap-2">
              <Code2 className="w-4 h-4 text-zinc-200" />
              <span>Node.js HTTP 402 middleware example</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-zinc-300 text-[10.5px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10">
                Node.js example
              </span>
              <button
                type="button"
                onClick={() => handleCopy('middleware_code', `import { withTempoMpp } from './sdk';\n\n// Human HTML stays on /articles/:id; this JSON route is paid for every request.\napp.get('/api/articles/:id', withTempoMpp({\n  priceUsd: 0.001,\n  payee: '${walletAddress || '0xYourWallet'}',\n  surgePricing: { windowMs: 4000, maxBeforeSurge: 2, multiplier: 2.5 }\n}), (req, res) => {\n  res.json({ title: 'Unblocked Content', markdown: '# Clean Extracted Content' });\n});`)}
                className="px-2 py-0.5 rounded text-[10.5px] font-mono bg-white/[0.06] hover:bg-white/15 text-zinc-300 hover:text-white border border-white/10 transition flex items-center gap-1 cursor-pointer"
              >
                {copiedId === 'middleware_code' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-[#d7ff4f] font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-zinc-400" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick copy callout */}
          <div className="bg-white/[.03] border border-white/[.08] rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="px-2 py-0.5 rounded bg-[#d7ff4f] text-[#08090c] font-black text-[10px] font-mono uppercase shrink-0">
                Middleware example
              </span>
              <code className="text-xs font-mono text-zinc-200 whitespace-nowrap">
              <span className="text-zinc-200">app</span>.<span className="text-zinc-300">use</span>('<span className="text-[#d7ff4f]">/api/data</span>', <span className="text-[#d7ff4f]">withTempoMpp</span>({'{'} <span className="text-zinc-300">priceUsd</span>: <span className="text-zinc-200">0.002</span>, <span className="text-zinc-300">payee</span>: '<span className="text-[#d7ff4f]">{walletAddress || '0xYourWallet'}</span>' {'}'}));
              </code>
            </div>
            <span className="text-[10px] font-mono text-zinc-200/80 shrink-0">Simple route setup</span>
          </div>

          {/* Developer Code Block with Syntax Highlighting */}
          <div aria-label="SDK integration code example" className="relative bg-[#0a1015] p-4 rounded-lg border border-[#d7ff4f]/35 text-xs font-mono overflow-x-auto leading-relaxed space-y-1 shadow-[inset_0_2px_0_rgba(215,255,79,.65)]">
            <div className="mb-3 flex items-center justify-between gap-3 border-b border-[#d7ff4f]/20 pb-2 not-italic">
              <span className="rounded bg-[#d7ff4f] px-2 py-1 text-[10px] font-black uppercase tracking-wide text-[#08090c]">SDK integration code</span>
              <span className="text-[10px] font-sans font-semibold text-zinc-500">Provider adds this to its own server</span>
            </div>
            <div>
              <span className="text-zinc-200 font-bold">import</span> {'{ '}
              <span className="text-[#d7ff4f]">withTempoMpp</span>
              {' }'} <span className="text-zinc-200 font-bold">from</span> <span className="text-[#d7ff4f]">'./sdk'</span>;
            </div>
            <div className="text-zinc-500 italic pt-1">
              // Stop burning cash on WAF defense — convert bot traffic into paid API revenue:
            </div>
            <div>
              <span className="text-zinc-500 italic">// Human HTML stays on /articles/:id; this JSON route is paid for every request.</span>
            </div>
            <div>
              <span className="text-zinc-200">app</span>.<span className="text-zinc-300">get</span>(<span className="text-[#d7ff4f]">'/api/articles/:id'</span>, <span className="text-[#d7ff4f]">withTempoMpp</span>({'{'}
            </div>
            <div className="pl-4">
              <span className="text-zinc-300">priceUsd</span>: <span className="text-zinc-200">0.001</span>,
            </div>
            <div className="pl-4">
              <span className="text-zinc-300">payee</span>: <span className="text-[#d7ff4f]">'{walletAddress || '0xYourWallet'}'</span>,
            </div>
            <div className="pl-4">
              <span className="text-zinc-300">surgePricing</span>: {'{ '}
              <span className="text-zinc-300">windowMs</span>: <span className="text-zinc-200">4000</span>, <span className="text-zinc-300">maxBeforeSurge</span>: <span className="text-zinc-200">2</span>, <span className="text-zinc-300">multiplier</span>: <span className="text-zinc-200">2.5</span>
              {' }'} <span className="text-zinc-500 italic">// Dynamic bot crawl surge protection</span>
            </div>
            <div>
              {'}'}), (<span className="text-zinc-200">req</span>, <span className="text-zinc-200">res</span>) =&gt; {'{'}
            </div>
            <div className="pl-4">
              <span className="text-zinc-200">res</span>.<span className="text-zinc-300">json</span>({'{'} <span className="text-zinc-300">title</span>: <span className="text-[#d7ff4f]">'Unblocked Content'</span>, <span className="text-zinc-300">markdown</span>: <span className="text-[#d7ff4f]">'# Clean Extracted Content\nStructured for AI agents.'</span> {'}'});
            </div>
            <div>
              {'}'});
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Publisher Monetization Calculator (What Would I Earn?) */}
      <div className="api-calc-panel rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-400/10 text-sky-300 border border-sky-300/25">
              <DollarSign className="w-4 h-4 text-sky-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  Publisher Monetization Calculator (Illustrative Estimate)
                </span>
                <span className="px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-300 border border-white/15 text-[9px] font-mono font-bold">
                  COST ESTIMATOR
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Calculate how much revenue your blocked bot traffic generates when converted into paid machine access. The estimate shows why per-request pricing can be better than paying for idle traffic.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">
            0.1% Platform Fee • Zero Setup Cost
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Controls */}
          <div className="api-calc-controls space-y-3 p-4 rounded-xl">
            <div>
              <div className="flex justify-between text-xs text-zinc-300 mb-1">
                <span>Monthly Blocked Machine Requests:</span>
                <strong className="font-mono text-white">{calcMonthlyRequests.toLocaleString()} reqs</strong>
              </div>
              <input
                type="range"
                min="50000"
                max="5000000"
                step="50000"
                value={calcMonthlyRequests}
                onChange={(e) => setCalcMonthlyRequests(Number(e.target.value))}
                className="w-full accent-sky-300 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                <span>50k</span>
                <span>1M</span>
                <span>2.5M</span>
                <span>5M reqs/mo</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-zinc-300 mb-1">
                <span>Price per Machine Request:</span>
                <strong className="font-mono text-violet-200">${calcPricePerRequest.toFixed(4)} ({((calcPricePerRequest)*100).toFixed(1)}¢)</strong>
              </div>
              <input
                type="range"
                min="0.0005"
                max="0.0100"
                step="0.0005"
                value={calcPricePerRequest}
                onChange={(e) => setCalcPricePerRequest(Number(e.target.value))}
                className="w-full accent-violet-300 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                <span>$0.0005 (0.05¢)</span>
                <span>$0.0020 (0.2¢)</span>
                <span>$0.0100 (1.0¢)</span>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="api-calc-results grid grid-cols-3 gap-2 text-center p-4 rounded-xl flex items-center">
            <div className="p-2.5 rounded-lg bg-sky-400/[.06] border border-sky-300/20">
              <span className="text-[10px] uppercase font-mono text-sky-100/70 block">Est. Gross Revenue</span>
              <span className="text-sm sm:text-base font-black font-mono text-sky-100 mt-1 block">
                ${(calcMonthlyRequests * calcPricePerRequest).toFixed(2)}
              </span>
              <span className="text-[9px] text-zinc-500 font-mono mt-0.5 block">/month</span>
            </div>

            <div className="p-2.5 rounded-lg bg-amber-300/[.05] border border-amber-200/15">
              <span className="text-[10px] uppercase font-mono text-amber-100/65 block">Est. Server Compute (Illustrative)</span>
              <span className="text-sm sm:text-base font-black font-mono text-amber-100/75 mt-1 block">
                -${(calcMonthlyRequests * 0.0003).toFixed(2)}
              </span>
              <span className="text-[9px] text-zinc-500 font-mono mt-0.5 block">illustrative assumption ($0.0003/req)</span>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-300/[0.08] border border-emerald-300/35 shadow-[0_0_15px_rgba(52,211,153,0.12)]">
              <span className="text-[10px] uppercase font-mono text-emerald-200/90 font-bold block">Est. Net Benefit</span>
              <span className="text-sm sm:text-base font-black font-mono text-emerald-200 mt-1 block">
                +${Math.max(0, (calcMonthlyRequests * calcPricePerRequest) - (calcMonthlyRequests * 0.0003) - (calcMonthlyRequests * calcPricePerRequest * 0.001)).toFixed(2)}
              </span>
              <span className="text-[9px] text-emerald-200/80 font-mono mt-0.5 block font-bold">after hosting & 0.1% fee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Surge Defense & Burst Protection Simulator Card */}
      <div className="api-surge-panel rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-orange-300/10 text-orange-200 border border-orange-300/30">
              <Flame className="w-4 h-4 text-orange-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-100 font-mono uppercase tracking-wider">
                  Dynamic Surge Pricing & Burst Protection
                </span>
                <span className="px-1.5 py-0.5 rounded bg-orange-300/15 text-orange-200 border border-orange-300/30 text-[9px] font-mono font-bold">
                  BURST TEST
                </span>
              </div>
              <p className="text-[11px] text-orange-100/65 mt-0.5">
                When automated requests surge, Synapse402 dynamically raises price per request: low-value scraping is rate-filtered while high-priority queries continue executing. This demo showcases the dynamic price adaptation rule before enabling it on a live route.
              </p>
            </div>
          </div>

          <button
            id="btn-simulate-surge-burst"
            onClick={handleRunSurgeDemo}
            disabled={isSurgeTesting}
            className="px-4 py-2.5 bg-[#d7ff4f] hover:bg-[#cbf540] text-[#08090c] font-black text-xs rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer shrink-0 shadow-[0_0_15px_rgba(215,255,79,0.25)] border border-[#d7ff4f]"
          >
            {isSurgeTesting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#08090c]" />
                <span>Firing 5 Rapid Requests...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-current text-[#08090c]" />
                <span>Test High-Traffic Burst (5 Requests)</span>
              </>
            )}
          </button>
        </div>

        {/* Provider response preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 px-1">
            <span>PROVIDER RESPONSE PREVIEW (sample route):</span>
            <span className="text-orange-200 font-bold">
              Base Price: $0.0010 • Surge Multiplier: 2.5x per burst
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 font-mono text-xs">
            {[1, 2, 3, 4, 5].map((reqNum) => {
              const log = surgeLogs.find((l) => l.callNumber === reqNum);
              return (
                <div
                  key={reqNum}
                  className={`api-surge-preview p-3 rounded-lg border transition-all ${
                    log
                      ? log.surgeActive
                        ? 'bg-orange-300/15 border-orange-300/55'
                        : 'bg-white/[0.04] border-white/15'
                      : 'bg-white/[.025] border-white/[.08] text-zinc-600'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-zinc-400 font-semibold">Req #{reqNum}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      log ? (log.surgeActive ? 'bg-orange-300' : 'bg-white') : 'bg-zinc-700'
                    }`} />
                  </div>

                  <div className="text-sm font-black font-mono">
                    {log ? (
                      <span className={log.surgeActive ? 'text-orange-200' : 'text-white'}>
                        ${log.costUsd.toFixed(4)}
                      </span>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </div>

                  <div className="mt-1 text-[9px] font-mono">
                    {log ? (
                      log.surgeActive ? (
                        <span className="text-orange-200 font-bold flex items-center gap-1">
                          <Flame className="w-2.5 h-2.5" />
                          <span>{log.multiplier}x Surge</span>
                        </span>
                      ) : (
                        <span className="text-zinc-300 font-medium">Standard Base</span>
                      )
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-lg bg-white/[.025] border border-white/[.08] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-sans text-zinc-300">
              <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-orange-200 shrink-0" />
              <span>
                <strong>Publisher Protection (simulated scenario):</strong> Normal bots pay $0.0010. Spammers and sudden bursts trigger dynamic exponential pricing, helping ensure server bandwidth remains economically viable.
              </span>
            </div>
            {surgeLogs.length > 0 && (
              <span className="font-mono font-bold text-orange-200 text-xs shrink-0">
                Projected payout in burst: ${(surgeLogs.reduce((acc, l) => acc + l.costUsd, 0)).toFixed(4)} USD
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Registered Endpoints Grid */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-[#d7ff4f] text-[#08090c] font-black text-[10px] tracking-wider uppercase">
              STEP 2
            </span>
            <span className="text-xs font-bold text-white tracking-wide">Active Monetized API Endpoints & Revenue</span>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            {endpoints.length} Active Services Available
          </span>
        </div>

        <p className="px-1 text-[11px] text-zinc-400">
          Each card is a sample provider route an agent could call. The response is a demo preview; only a confirmed Tempo receipt proves that a payment settled.
        </p>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {['All', 'Language AI', 'Computer Vision', 'Publishing / Media', 'Code Execution', 'Web Data & Scraping', 'Voice & Speech', 'Travel / GDS Data', 'Compliance & KYC', 'Market Depth', 'Academic & Legal']
            .filter((c) => c === 'All' || endpoints.some((e) => e.category === c))
            .map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#d7ff4f] text-[#08090c] font-bold shadow-sm'
                    : 'bg-white/[.04] text-zinc-400 hover:text-zinc-200 border border-white/[.06]'
                }`}
              >
                {cat}
              </button>
            ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(selectedCategory === 'All' ? (showAllEndpoints ? endpoints : endpoints.slice(0, 4)) : endpoints.filter((ep) => ep.category === selectedCategory)).map((ep) => {
          const totalCalls = (localStats[ep.id]?.calls ?? ep.totalCalls);
          const grossEarned = totalCalls * (ep.pricePerCallUsd || 0.001);
          const protocolFee = grossEarned * 0.001; // 0.1% protocol fee
          const netEarned = grossEarned * 0.999; // 99.9% seller payout
          const pricingModel = getPricingModel(ep);
          const comp = getRealisticComparison(ep);

          return (
          <div
            key={ep.id}
            className="ui-interactive bg-white/[.03] backdrop-blur-md border border-white/[.08] hover:border-white/20 rounded-xl p-5 shadow-sm flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded bg-white/[.04] text-zinc-300 text-xs font-medium border border-white/[.08]">
                  {ep.category}
                </span>
                <span className="text-[#d7ff4f] font-mono font-semibold text-xs bg-[#d7ff4f]/[.08] px-2 py-0.5 rounded border border-[#d7ff4f]/30">
                  ${Number(ep.pricePerCallUsd || 0).toFixed(4)} / call
                </span>
              </div>

              <h4 className="font-semibold text-sm text-zinc-100 mb-1">{ep.title}</h4>
              <div className="flex items-center gap-1.5 mb-2">
                <div className="text-xs text-zinc-400 font-mono bg-white/[.025] px-2.5 py-1.5 rounded-lg border border-white/[.08] truncate flex-1">
                  {ep.endpointUrl}
                </div>
                <span className={`text-[9px] font-mono px-1.5 py-1 rounded border shrink-0 ${ep.id === 'ep_demo_local' ? 'bg-[#d7ff4f]/10 border-[#d7ff4f]/30 text-[#d7ff4f]' : 'bg-white/5 border-white/10 text-zinc-400'}`}>
                  {ep.id === 'ep_demo_local' ? 'Protected local demo route' : 'Demo Provider route'}
                </span>
              </div>

              {/* Realistic Comparative Advantage Box */}
              <div className="mb-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] space-y-1.5 text-[11px] font-mono">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Traditional:</span>
                  <span className="text-zinc-500 line-through text-[10.5px]">{comp.old}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Synapse402:</span>
                  <span className="text-[#d7ff4f] font-bold text-[11px]">${Number(ep.pricePerCallUsd || 0).toFixed(4)} / call</span>
                </div>
                <div className="pt-1 border-t border-white/[0.06] text-[10px] text-[#d7ff4f] font-sans flex items-center gap-1 font-medium">
                  <Check className="w-3 h-3 text-[#d7ff4f] shrink-0" />
                  <span>{comp.gain}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-white/[.025] p-2.5 rounded-lg border border-white/[.08]">
                <div>
                  <span className="text-zinc-400 text-xs block">Sample calls</span>
                  <span className="text-zinc-100 font-bold font-mono text-sm">{totalCalls.toLocaleString()}</span>
                  <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">
                    Gross: ${grossEarned.toFixed(2)}
                  </span>
                </div>
                <div>
                    <span className="text-zinc-400 text-xs block">Sample payout</span>
                  <span className="text-[#d7ff4f] font-bold font-mono text-sm">${netEarned.toFixed(2)}</span>
                  <span className="text-[10px] text-zinc-500 font-mono block mt-0.5" title="0.1% protocol fee">
                    Fee (0.1%): ${protocolFee.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-4 pt-3 border-t border-white/[.08] space-y-2">
              <div className="flex items-center gap-2">
                <button
                  id={`btn-test-paywall-${ep.id}`}
                  type="button"
                  onClick={() => handleTestEndpoint(ep)}
                  disabled={testingEndpointId === ep.id}
                  className="flex-1 py-2 rounded-lg bg-[#d7ff4f] hover:bg-[#cbf540] text-[#08090c] font-mono text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  {testingEndpointId === ep.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#08090c]" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current text-[#08090c]" />
                  )}
                  <span>{testingEndpointId === ep.id ? 'Running test...' : 'Test paywall'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy(ep.id, ep.integrationSnippet)}
                  className="py-2 px-3 rounded-lg bg-white/[.04] hover:bg-[#1e2630] text-[#f5f5f2] border border-white/15 font-mono text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Copy middleware example"
                >
                  {copiedId === ep.id ? (
                    <Check className="w-3.5 h-3.5 text-[#d7ff4f]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-white/50" />
                  )}
                  <span>{copiedId === ep.id ? 'Copied' : 'Copy SDK'}</span>
                </button>
              </div>

              {testResult?.id === ep.id && (
                <div className={`p-2.5 rounded-lg border text-[11px] font-mono space-y-1.5 animate-in fade-in duration-200 ${
                  testResult.status === 200
                    ? 'bg-[#d7ff4f]/10 border-[#d7ff4f]/30 text-[#d7ff4f]'
                    : 'bg-white/10 border-white/20 text-white'
                }`}>
                  <div className="flex items-center gap-1.5 font-bold">
                    {testResult.status === 200 ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-[#d7ff4f] shrink-0" />
                    ) : (
                      <ShieldAlert className="w-3.5 h-3.5 text-white shrink-0" />
                    )}
                    <span className="truncate">{testResult.message}</span>
                  </div>

                  {testResult.status === 200 && (() => {
                    const delivered = getDeliveredData(ep);
                    return (
                      <div className="pt-2 border-t border-[#d7ff4f]/20 space-y-2 text-[10px]">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-zinc-400 block font-sans uppercase">{testResult.receiptVerified ? 'CONFIRMED EARNED:' : 'QUOTED PRICE / PROJECTED PAYOUT:'}</span>
                            <span className="text-[#d7ff4f] font-bold font-mono text-xs">
                              {testResult.receiptVerified ? '+' : 'Quoted '} ${Number(ep.pricePerCallUsd || 0.001).toFixed(4)} USD
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-zinc-400 block font-sans uppercase">DELIVERABLE:</span>
                            <span className="text-white font-bold flex items-center justify-end gap-1">
                              {renderDeliveredIcon(delivered.iconName)}
                              <span>{delivered.type}</span>
                            </span>
                          </div>
                        </div>

                        {/* Concrete Deliverable Content Box */}
                        <div className="p-2.5 rounded-lg bg-white/[.03] border border-[#d7ff4f]/30 text-zinc-200 font-sans text-[10.5px] leading-relaxed space-y-1">
                          <div className="flex items-center justify-between text-[9px] font-mono uppercase font-bold text-[#d7ff4f]">
                            <span className="flex items-center gap-1">
                              <Zap className="w-3 h-3 text-[#d7ff4f]" />
                              <span>Example execution outcome:</span>
                            </span>
                            <span className="text-zinc-400">
                              {testResult.receiptVerified ? '&lt;150ms • confirmed Tempo receipt' : 'Evaluation • no chain receipt'}
                            </span>
                          </div>
                          <p className="text-zinc-200 text-[11px] font-mono">
                            {delivered.detail}
                          </p>
                          <span className="text-[9.5px] text-zinc-400 block font-sans">
                            In production, an approved agent can retrieve the paid payload after the payment status is confirmed; the service records its configured price of +${Number(ep.pricePerCallUsd || 0.001).toFixed(4)}.
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {testResult.receiptVerified && testResult.txHash && (
                    <div className="pt-1.5 border-t border-white/[.08] flex items-center justify-between gap-2 text-[10px] font-mono">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-zinc-400">Proof:</span>
                        <span className="text-[#d7ff4f] truncate">{testResult.txHash.slice(0, 10)}...{testResult.txHash.slice(-6)}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopy('tx_proof_' + ep.id, testResult.txHash)}
                          className="px-2 py-0.5 rounded bg-white/[0.06] hover:bg-white/10 text-zinc-300 hover:text-white transition cursor-pointer"
                        >
                          {copiedId === 'tx_proof_' + ep.id ? (
                            <span className="text-[#d7ff4f] font-bold">Copied!</span>
                          ) : (
                            <span>Copy Hash</span>
                          )}
                        </button>
                        <a
                          href={tempoTransactionUrl(testResult.txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-400 hover:text-white flex items-center gap-1 hover:underline"
                        >
                          <span>Tempo Explorer</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
      </div>
      {selectedCategory === 'All' && endpoints.length > 4 && (
        <button
          type="button"
          onClick={() => setShowAllEndpoints((open) => !open)}
          className="mx-auto block rounded-xl border border-white/15 bg-white/[.04] px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/[.08] hover:text-white transition cursor-pointer"
        >
          {showAllEndpoints ? 'Show fewer provider routes' : `Show all ${endpoints.length} provider routes`}
        </button>
      )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white/[.03] backdrop-blur-md border border-white/[.08] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-[#f5f5f2]">Monetize Your API with HTTP 402</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Add one route and choose its price. In this demo, a confirmed payment goes to the shared SynapseMPPReceiver gateway; a production integration can configure the provider's payee.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-white/50 block mb-1">API Service Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Licensed normalized market depth"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/[.04] border border-white/[.08] rounded-lg p-2 text-[#f5f5f2] outline-none focus:border-[#d7ff4f]"
                />
              </div>

              <div>
                <label className="text-white/50 block mb-1">Target API URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://my-api.com/v1/orderbook"
                  value={endpointUrl}
                  onChange={(e) => setEndpointUrl(e.target.value)}
                  className="w-full bg-white/[.04] border border-white/[.08] rounded-lg p-2 text-[#f5f5f2] outline-none focus:border-[#d7ff4f]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-white/50 block mb-1">Price / Call ($)</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={pricePerCallUsd}
                    onChange={(e) => setPricePerCallUsd(e.target.value)}
                    className="w-full bg-white/[.04] border border-white/[.08] rounded-lg p-2 text-[#f5f5f2] outline-none focus:border-[#d7ff4f]"
                  />
                </div>

                <div>
                  <label className="text-white/50 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white/[.04] border border-white/[.08] rounded-lg p-2 text-[#f5f5f2] outline-none focus:border-[#d7ff4f]"
                  >
                    <option value="Web Data & Scraping">Web Data & Scraping (Scraper Paywall)</option>
                    <option value="Market Data">Market Data</option>
                    <option value="AI / LLM Inferences">AI / LLM Inferences</option>
                    <option value="Publishing / Media">Publishing / Media</option>
                    <option value="Academic & Legal">Academic & Legal</option>
                    <option value="Blockchain Analytics">Blockchain Analytics</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white/[.04] text-white/50 rounded-lg hover:bg-[#1e2630] border border-white/[.08]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#d7ff4f] text-[#0c0f12] font-bold rounded-lg hover:bg-[#bce63b]"
                >
                  Add route to demo
                </button>
              </div>
              {saveError && <p className="text-xs text-red-300 pt-1">{saveError}</p>}
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
