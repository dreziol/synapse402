import React, { useState } from 'react';
import { MonetizedApiEndpoint } from '../types/synapse402';
import { Store, Plus, Copy, Check, Code2, Play, Loader2, CheckCircle2, ExternalLink, ArrowRightLeft, Coins, Sparkles, Zap, Flame, ShieldAlert, RefreshCw, ShieldCheck, DollarSign, Globe, Palette, FileText, Mic, Plane, TrendingUp, BarChart3, Box } from 'lucide-react';
import { soundEngine } from '../utils/audioEffects';
import { InfoBadge } from './InfoBadge';

interface ApiMonetizationPortalProps {
  endpoints: MonetizedApiEndpoint[];
  onAddEndpoint: (endpoint: { title: string; endpointUrl: string; pricePerCallUsd: number; category: string }) => void;
  walletAddress?: string | null;
}

export const ApiMonetizationPortal: React.FC<ApiMonetizationPortalProps> = ({
  endpoints,
  onAddEndpoint,
  walletAddress = null,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [testingEndpointId, setTestingEndpointId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; status: number; txHash?: string; message: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [localStats, setLocalStats] = useState<Record<string, { calls: number; earned: number }>>({});

  // Dynamic Surge Pricing / Anti-DDoS Simulator State
  const [isSurgeTesting, setIsSurgeTesting] = useState(false);
  const [surgeLogs, setSurgeLogs] = useState<Array<{ callNumber: number; costUsd: number; surgeActive: boolean; multiplier: number; status: number }>>([]);

  // Monetization Projection Calculator State
  const [calcMonthlyRequests, setCalcMonthlyRequests] = useState<number>(500000);
  const [calcPricePerRequest, setCalcPricePerRequest] = useState<number>(0.002);

  const handleRunSurgeDemo = async () => {
    soundEngine.playClick();
    setIsSurgeTesting(true);
    setSurgeLogs([]);

    const newLogs: Array<{ callNumber: number; costUsd: number; surgeActive: boolean; multiplier: number; status: number }> = [];

    for (let i = 1; i <= 5; i++) {
      try {
        const res = await fetch('/api/v1/surge-demo');
        const data = await res.json();
        newLogs.push({
          callNumber: i,
          costUsd: data.costPathUsd || 0.001,
          surgeActive: Boolean(data.surgeActive),
          multiplier: data.surgeMultiplier || 1,
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
    if (url.includes('binance') || url.includes('orderbook') || url.includes('market-depth')) return { old: '$29/mo Market data feed', gain: 'Pay per query ($0 idle cost)' };
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
      detail: 'German ➔ English: "Machine commerce with instant Tempo settlement executed without human lock-in."',
      iconName: 'Globe',
    };
    if (url.includes('vision') || url.includes('remove-bg')) return {
      type: 'Transparent Image PNG',
      detail: 'High-Res Alpha Cutout (transparent background extracted, 0 artifacts)',
      iconName: 'Palette',
    };
    if (url.includes('article') || url.includes('news') || url.includes('scrape')) return {
      type: 'Full-Text Article',
      detail: '"Global Machine Economy Transition 2026: AI agents settle micro-services per call on Tempo L1 under strict budget guardrails."',
      iconName: 'FileText',
    };
    if (url.includes('containers') || url.includes('python')) return {
      type: 'Python Container Output',
      detail: 'Container Exited 0: Python script executed cleanly in isolated sandbox. All test assertions passed. No runtime errors detected.',
      iconName: 'Code2',
    };
    if (url.includes('synthesize') || url.includes('voice')) return {
      type: 'Neural Audio Clip',
      detail: 'PCM WAV 24kHz (4.2s speech synthesized): "Payment authorized. Transaction confirmed on Tempo L1."',
      iconName: 'Mic',
    };
    if (url.includes('fares') || url.includes('flights')) return {
      type: 'Flight GDS Itinerary',
      detail: 'Delta DL1842: JFK ➔ SFO | Non-Stop | Class Y (12 Seats Available at $412.00)',
      iconName: 'Plane',
    };
    if (url.includes('verify') || url.includes('identity')) return {
      type: 'Compliance & Sanctions Report',
      detail: 'Global Sanctions Screening: Negative • Law Enforcement Notice: Clear • Risk Score: 0.01 (Pass)',
      iconName: 'ShieldCheck',
    };
    if (url.includes('binance') || url.includes('orderbook') || url.includes('market-depth')) return {
      type: 'L2 Orderbook Depth',
      detail: 'AAPL/USD Bids: $175.38 (450 sh) | Asks: $175.42 (320 sh) | Spread: 0.022%',
      iconName: 'TrendingUp',
    };
    if (url.includes('sec-edgar') || url.includes('sec-data-mirror')) return {
      type: 'Audited Financial Digest',
      detail: 'Apple Inc. Operating Metrics: Net Sales $391.0B (+8% YoY), Gross Margin 46.2%, Free Cash Flow $108.8B',
      iconName: 'BarChart3',
    };
    return {
      type: 'API Structured Data',
      detail: 'Verified payload delivered with cryptographic settlement proof.',
      iconName: 'Box',
    };
  };

  const handleTestEndpoint = async (ep: MonetizedApiEndpoint) => {
    soundEngine.playClick();
    setTestingEndpointId(ep.id);
    setTestResult(null);

    try {
      const res = await fetch('/api/mpp/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl: ep.endpointUrl,
          pricePathUsd: ep.pricePerCallUsd,
          category: ep.category,
          allowDynamicWhitelist: true,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        soundEngine.playSettlementChime();
        setLocalStats((prev) => {
          const current = prev[ep.id] || { calls: ep.totalCalls, earned: ep.totalEarnedUsd };
          return {
            ...prev,
            [ep.id]: {
              calls: current.calls + 1,
              earned: Number((current.earned + ep.pricePerCallUsd).toFixed(4)),
            },
          };
        });
        setTestResult({
          id: ep.id,
          status: 200,
          txHash: data.trace?.txHash,
          message: `HTTP 200 OK • Settled on Tempo L1 (${data.trace?.latencyMs || 12}ms)`,
        });
      } else {
        soundEngine.playDefenseIntercept();
        setTestResult({
          id: ep.id,
          status: res.status,
          message: data.error || 'Payment execution failed',
        });
      }
    } catch (err: any) {
      setTestResult({
        id: ep.id,
        status: 500,
        message: err.message || 'Network error',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !endpointUrl || !pricePerCallUsd) return;

    soundEngine.playSettlementChime();

    onAddEndpoint({
      title,
      endpointUrl,
      pricePerCallUsd: parseFloat(pricePerCallUsd),
      category,
    });

    setTitle('');
    setEndpointUrl('');
    setPricePerCallUsd('0.002');
    setIsModalOpen(false);
  };

  return (
    <section id="section-api-monetization" className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-white/[.03] backdrop-blur-md border border-white/[.08] rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#d7ff4f]/10 text-[#d7ff4f] border border-[#d7ff4f]/30 text-xs font-semibold">
              SELLER PLATFORM • Turn Bot Traffic into Revenue
            </span>
          </div>
          <h3 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center flex-wrap gap-1">
            <span>Turn Bot Traffic into Revenue: Charge $0.001 per Request Instead of Blocking with 403 Errors</span>
            <InfoBadge
              title="HTTP 402 Stateless Middleware"
              text="Data providers wrap standard Express/Fastify routes with withTempoMpp(). Every machine request must settle on Tempo L1 with verified EIP-712 payment before receiving the payload."
            />
          </h3>
          <p className="text-sm text-zinc-300 mt-1 max-w-2xl leading-relaxed font-sans">
            Websites spend thousands on bot defense just to return 403 Forbidden ($0 revenue). With 2 lines of middleware, monetize verified AI agents at 0.1¢ per request on Tempo L1 for a <strong className="text-[#d7ff4f]">99.9% seller payout</strong> (0.1% protocol fee), with zero credit card swipe fees, and Google/Bing still index your site for free.
          </p>
        </div>

        <button
          id="btn-register-api-endpoint"
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 bg-[#d7ff4f] hover:bg-[#cbf540] text-[#08090c] font-black text-xs rounded-xl transition-all flex items-center gap-2 self-start md:self-auto cursor-pointer shadow-[0_0_15px_rgba(215,255,79,0.25)] border border-[#d7ff4f]"
        >
          <Plus className="w-4 h-4 text-[#08090c]" />
          <span>+ Monetize an API Route</span>
        </button>
      </div>

      {/* Two-Sided Network Flywheel: Why Sellers & Buyers Both Win */}
      <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-[#d7ff4f]" />
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wide">
              The Two-Sided Market Flywheel (Mutual Economic Incentive)
            </h4>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-zinc-400 border border-white/10">
            How Everyone Wins
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] font-sans">
          <div className="bg-white/[.025] p-3.5 rounded-lg border border-white/[.08] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#f5f5f2]">
              <div className="w-6 h-6 rounded bg-[#d7ff4f]/10 text-[#d7ff4f] flex items-center justify-center shrink-0">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <span>01. Web Publishers</span>
              <InfoBadge
                title="Reverse Proxy Monetization"
                text="Replaces Cloudflare CAPTCHA/403 blocks with automated 0.1¢ monetization. Unlocks instant pathUSD payment on Tempo L1."
              />
            </div>
            <p className="text-zinc-300 text-[11px] leading-relaxed">
              Monetize crawler traffic in 60s with 2 lines of middleware. Turn 403 blocks into <strong>0.1¢/page micropayments</strong> deposited directly to your vault.
            </p>
          </div>

          <div className="bg-white/[.025] p-3.5 rounded-lg border border-white/[.08] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#f5f5f2]">
              <div className="w-6 h-6 rounded bg-[#d7ff4f]/10 text-[#d7ff4f] flex items-center justify-center shrink-0">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span>02. AI Agents &amp; Crawlers</span>
              <InfoBadge
                title="Stateless Micro-Authorization"
                text="Agents purchase niche data on demand without human accounts, monthly retainers, or credit card forms."
              />
            </div>
            <p className="text-zinc-300 text-[11px] leading-relaxed">
              Zero scraping infrastructure overhead or CAPTCHA solving. Bots pay 0.1¢ via HTTP 402 and receive <strong>clean, structured JSON</strong> via authorized access.
            </p>
          </div>

          <div className="bg-white/[.025] p-3.5 rounded-lg border border-white/[.08] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#f5f5f2]">
              <div className="w-6 h-6 rounded bg-[#d7ff4f]/10 text-[#d7ff4f] flex items-center justify-center shrink-0">
                <Coins className="w-3.5 h-3.5" />
              </div>
              <span>03. Mutual Economics</span>
              <InfoBadge
                title="Tempo L1 Type 0x76 Rails"
                text="Zero 30¢ credit card swipe minimums. Sub-cent fees (<$0.00002) make 0.1-cent data calls economically viable."
              />
            </div>
            <p className="text-zinc-300 text-[11px] leading-relaxed">
              Publishers get paid for compute; AI agents get reliable programmatic access. Settled in <strong>&lt;15ms gateway check (~0.5s Tempo L1 block consensus)</strong> with 99.9% seller payout (0.1% protocol fee).
            </p>
          </div>
        </div>
      </div>

      {/* 2-Line Middleware Integration Guide */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <span className="px-2 py-0.5 rounded-md bg-[#d7ff4f] text-[#08090c] font-black text-[10px] tracking-wider uppercase">
            STEP 1
          </span>
          <span className="text-xs font-bold text-white tracking-wide flex items-center">
            <span>Protect Routes with 2-Line Middleware</span>
            <InfoBadge
              title="Dynamic SEO Segmentation & WAF Efficiency"
              text="allowSearchCrawlers: true automatically lets Googlebot and Bingbot pass freely to protect your search ranking, while AI bots and scrapers settle 0.1¢ via Tempo L1."
            />
          </span>
        </div>
        <div className="bg-white/[.03] backdrop-blur-md border border-white/[.08] rounded-xl p-5 text-xs space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-white/[.08] pb-2">
            <span className="text-zinc-100 font-semibold flex items-center gap-2">
              <Code2 className="w-4 h-4 text-zinc-200" />
              <span>2-Line Express / Fastify / Next.js HTTP 402 Middleware</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-zinc-300 text-[10.5px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10">
                Developer SDK
              </span>
              <button
                type="button"
                onClick={() => handleCopy('middleware_code', `import { withTempoMpp } from './sdk';\n\napp.get('/articles/:id', withTempoMpp({\n  priceUsd: 0.001,\n  payee: '${walletAddress || '0xa287550D1c3D277caA59C560230AC840e1Ee58B6'}',\n  allowSearchCrawlers: true,\n  surgePricing: { windowMs: 4000, maxBeforeSurge: 2, multiplier: 2.5 }\n}), (req, res) => {\n  res.json({ title: 'Unblocked Content', markdown: '# Clean Extracted Content' });\n});`)}
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

          {/* Quick Copy 2-Liner Callout */}
          <div className="bg-white/[.03] border border-white/[.08] rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="px-2 py-0.5 rounded bg-[#d7ff4f] text-[#08090c] font-black text-[10px] font-mono uppercase shrink-0">
                2-Line SDK
              </span>
              <code className="text-xs font-mono text-zinc-200 whitespace-nowrap">
                <span className="text-zinc-200">app</span>.<span className="text-zinc-300">use</span>('<span className="text-[#d7ff4f]">/api/data</span>', <span className="text-[#d7ff4f]">withTempoMpp</span>({'{'} <span className="text-zinc-300">priceUsd</span>: <span className="text-zinc-200">0.002</span>, <span className="text-zinc-300">payee</span>: '<span className="text-[#d7ff4f]">{walletAddress || '0xa287550D1c3D277caA59C560230AC840e1Ee58B6'}</span>', <span className="text-zinc-300">allowSearchCrawlers</span>: <span className="text-zinc-200">true</span> {'}'}));
              </code>
            </div>
            <span className="text-[10px] font-mono text-zinc-200/80 shrink-0">Instant Turnkey Monetization</span>
          </div>

          {/* Developer Code Block with Syntax Highlighting */}
          <div className="bg-white/[.02] p-4 rounded-lg border border-white/[.08] text-xs font-mono overflow-x-auto leading-relaxed space-y-1">
            <div>
              <span className="text-zinc-200 font-bold">import</span> {'{ '}
              <span className="text-[#d7ff4f]">withTempoMpp</span>
              {' }'} <span className="text-zinc-200 font-bold">from</span> <span className="text-[#d7ff4f]">'./sdk'</span>;
            </div>
            <div className="text-zinc-500 italic pt-1">
              // Stop burning cash on WAF defense — convert bot traffic into paid API revenue:
            </div>
            <div>
              <span className="text-zinc-200">app</span>.<span className="text-zinc-300">get</span>(<span className="text-[#d7ff4f]">'/articles/:id'</span>, <span className="text-[#d7ff4f]">withTempoMpp</span>({'{'}
            </div>
            <div className="pl-4">
              <span className="text-zinc-300">priceUsd</span>: <span className="text-zinc-200">0.001</span>,
            </div>
            <div className="pl-4">
              <span className="text-zinc-300">payee</span>: <span className="text-[#d7ff4f]">'{walletAddress || '0xa287550D1c3D277caA59C560230AC840e1Ee58B6'}'</span>,
            </div>
            <div className="pl-4">
              <span className="text-zinc-300">allowSearchCrawlers</span>: <span className="text-zinc-200">true</span>, <span className="text-zinc-500 italic">// Googlebot &amp; Bingbot pass free for SEO indexing!</span>
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
      <div className="bg-white/[.03] backdrop-blur-md border border-white/[.08] rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/[0.05] text-[#d7ff4f] border border-white/10">
              <DollarSign className="w-4 h-4 text-[#d7ff4f]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  Publisher Monetization Calculator (Illustrative Estimate)
                </span>
                <span className="px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-300 border border-white/15 text-[9px] font-mono font-bold">
                  SIMULATION ESTIMATOR
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Calculate how much revenue your blocked bot traffic generates when converted into paid machine access.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">
            0.1% Platform Fee • Zero Setup Cost
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Controls */}
          <div className="space-y-3 bg-white/[.025] p-4 rounded-xl border border-white/[.08]">
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
                className="w-full accent-[#d7ff4f] cursor-pointer"
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
                <strong className="font-mono text-[#d7ff4f]">${calcPricePerRequest.toFixed(4)} ({((calcPricePerRequest)*100).toFixed(1)}¢)</strong>
              </div>
              <input
                type="range"
                min="0.0005"
                max="0.0100"
                step="0.0005"
                value={calcPricePerRequest}
                onChange={(e) => setCalcPricePerRequest(Number(e.target.value))}
                className="w-full accent-[#d7ff4f] cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                <span>$0.0005 (0.05¢)</span>
                <span>$0.0020 (0.2¢)</span>
                <span>$0.0100 (1.0¢)</span>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="grid grid-cols-3 gap-2 text-center bg-white/[.025] p-4 rounded-xl border border-white/[.08] flex items-center">
            <div className="p-2.5 rounded-lg bg-white/[.03] border border-white/10">
              <span className="text-[10px] uppercase font-mono text-zinc-400 block">Est. Gross Revenue</span>
              <span className="text-sm sm:text-base font-black font-mono text-white mt-1 block">
                ${(calcMonthlyRequests * calcPricePerRequest).toFixed(2)}
              </span>
              <span className="text-[9px] text-zinc-500 font-mono mt-0.5 block">/month</span>
            </div>

            <div className="p-2.5 rounded-lg bg-white/[.03] border border-white/[.06]">
              <span className="text-[10px] uppercase font-mono text-zinc-400 block">Est. Server Compute</span>
              <span className="text-sm sm:text-base font-black font-mono text-zinc-400 mt-1 block">
                -${(calcMonthlyRequests * 0.0003).toFixed(2)}
              </span>
              <span className="text-[9px] text-zinc-500 font-mono mt-0.5 block">estimated server cost</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#d7ff4f]/[0.08] border border-[#d7ff4f]/30 shadow-[0_0_15px_rgba(215,255,79,0.12)]">
              <span className="text-[10px] uppercase font-mono text-[#d7ff4f]/90 font-bold block">Est. Net Benefit</span>
              <span className="text-sm sm:text-base font-black font-mono text-[#d7ff4f] mt-1 block">
                +${Math.max(0, (calcMonthlyRequests * calcPricePerRequest) - (calcMonthlyRequests * 0.0003) - (calcMonthlyRequests * calcPricePerRequest * 0.001)).toFixed(2)}
              </span>
              <span className="text-[9px] text-[#d7ff4f] font-mono mt-0.5 block font-bold">after hosting & 0.1% fee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Surge Defense & Anti-DDoS Simulator Card */}
      <div className="bg-white/[.03] backdrop-blur-md border border-white/[.08] rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#d7ff4f]/15 text-[#d7ff4f] border border-[#d7ff4f]/30">
              <Flame className="w-4 h-4 text-[#d7ff4f]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-100 font-mono uppercase tracking-wider">
                  Price Goes Up When Traffic Spikes (DDoS Defense)
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#d7ff4f]/20 text-[#d7ff4f] border border-[#d7ff4f]/30 text-[9px] font-mono font-bold">
                  SIMULATED PROTECTION DEMO
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                When automated requests surge, Synapse402 dynamically raises price per request: low-value scraping is filtered out while high-priority queries continue executing.
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
                <span>Simulate High-Traffic Burst (5 Requests)</span>
              </>
            )}
          </button>
        </div>

        {/* Live Burst Response Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 px-1">
            <span>LIVE ENDPOINT RESPONSE TELEMETRY (/api/v1/surge-demo):</span>
            <span className="text-[#d7ff4f] font-bold">
              Base Price: $0.0010 • Surge Multiplier: 2.5x per burst
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 font-mono text-xs">
            {[1, 2, 3, 4, 5].map((reqNum) => {
              const log = surgeLogs.find((l) => l.callNumber === reqNum);
              return (
                <div
                  key={reqNum}
                  className={`p-3 rounded-lg border transition-all ${
                    log
                      ? log.surgeActive
                        ? 'bg-[#d7ff4f]/15 border-[#d7ff4f]/50'
                        : 'bg-white/[0.04] border-white/15'
                      : 'bg-white/[.025] border-white/[.08] text-zinc-600'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-zinc-400 font-semibold">Req #{reqNum}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      log ? (log.surgeActive ? 'bg-[#d7ff4f]' : 'bg-white') : 'bg-zinc-700'
                    }`} />
                  </div>

                  <div className="text-sm font-black font-mono">
                    {log ? (
                      <span className={log.surgeActive ? 'text-[#d7ff4f]' : 'text-white'}>
                        ${log.costUsd.toFixed(4)}
                      </span>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </div>

                  <div className="mt-1 text-[9px] font-mono">
                    {log ? (
                      log.surgeActive ? (
                        <span className="text-[#d7ff4f] font-bold flex items-center gap-1">
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
              <ShieldCheck className="w-4 h-4 text-[#d7ff4f] shrink-0" />
              <span>
                <strong>Publisher Protection (simulated scenario):</strong> Normal bots pay $0.0010. Spammers and sudden bursts trigger dynamic exponential pricing, helping ensure server bandwidth remains economically viable.
              </span>
            </div>
            {surgeLogs.length > 0 && (
              <span className="font-mono font-bold text-[#d7ff4f] text-xs shrink-0">
                Total Earned in Burst: ${(surgeLogs.reduce((acc, l) => acc + l.costUsd, 0)).toFixed(4)} USD
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
        {(selectedCategory === 'All' ? endpoints : endpoints.filter((ep) => ep.category === selectedCategory)).map((ep) => {
          const totalCalls = (localStats[ep.id]?.calls ?? ep.totalCalls);
          const grossEarned = totalCalls * (ep.pricePerCallUsd || 0.001);
          const protocolFee = grossEarned * 0.001; // 0.1% protocol fee
          const netEarned = grossEarned * 0.999; // 99.9% seller payout
          const pricingModel = getPricingModel(ep);
          const comp = getRealisticComparison(ep);

          return (
          <div
            key={ep.id}
            className="bg-white/[.03] backdrop-blur-md border border-white/[.08] hover:border-white/20 rounded-xl p-5 shadow-sm flex flex-col justify-between transition-all"
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
                <span className="text-[9px] font-mono px-1.5 py-1 rounded bg-white/5 border border-white/10 text-zinc-400 shrink-0">
                  Simulated API
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
                  <span>✓</span>
                  <span>{comp.gain}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-white/[.025] p-2.5 rounded-lg border border-white/[.08]">
                <div>
                  <span className="text-zinc-400 text-xs block">Total Calls</span>
                  <span className="text-zinc-100 font-bold font-mono text-sm">{totalCalls.toLocaleString()}</span>
                  <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">
                    Gross: ${grossEarned.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 text-xs block">Net Payout (99.9%)</span>
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
                  <span>{testingEndpointId === ep.id ? 'Settling on L1...' : 'Test 0.1¢ Paywall'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy(ep.id, ep.integrationSnippet)}
                  className="py-2 px-3 rounded-lg bg-white/[.04] hover:bg-[#1e2630] text-[#f5f5f2] border border-white/15 font-mono text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Copy 2-Line Middleware SDK"
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
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#d7ff4f] shrink-0" />
                    ) : (
                      <span className="text-white font-bold shrink-0">✕</span>
                    )}
                    <span className="truncate">{testResult.message}</span>
                  </div>

                  {testResult.status === 200 && (() => {
                    const delivered = getDeliveredData(ep);
                    return (
                      <div className="pt-2 border-t border-[#d7ff4f]/20 space-y-2 text-[10px]">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-zinc-400 block font-sans uppercase">YOU EARNED:</span>
                            <span className="text-[#d7ff4f] font-bold font-mono text-xs">+${Number(ep.pricePerCallUsd || 0.001).toFixed(4)} USD</span>
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
                              <span>Demo Execution Outcome:</span>
                            </span>
                            <span className="text-zinc-400">&lt;150ms VIA TEMPO</span>
                          </div>
                          <p className="text-zinc-200 text-[11px] font-mono">
                            {delivered.detail}
                          </p>
                          <span className="text-[9.5px] text-zinc-400 block font-sans">
                            In production, autonomous agents instantly retrieve paid payload while your merchant vault collects +${Number(ep.pricePerCallUsd || 0.001).toFixed(4)} in realtime.
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {testResult.txHash && (
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
                          href="https://explore.tempo.xyz"
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
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white/[.03] backdrop-blur-md border border-white/[.08] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-[#f5f5f2]">Monetize Your API with HTTP 402</h3>
            
            <form onSubmit={handleSubmit} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-white/50 block mb-1">API Service Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., DeepQuant High-Frequency Orderbook"
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
                  Activate 402 Protection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
