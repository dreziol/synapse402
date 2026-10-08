import React, { useState } from 'react';
import { X, ShieldCheck, Check, Copy, ExternalLink, Cpu, Database, ArrowRight, Package, Zap } from 'lucide-react';
import { soundEngine } from '../utils/audioEffects';
import { InfoBadge } from './InfoBadge';
import { TEMPO_CHAIN_ID, TEMPO_RECEIVER_ADDRESS, TEMPO_VAULT_ADDRESS } from '../config/network';

const DEMO_PAYMENT_RECEIVER = TEMPO_RECEIVER_ADDRESS;

interface CryptoInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  traceData: {
    txHash?: string;
    executionMode?: 'LIVE_TESTNET' | 'RESILIENT_SANDBOX' | 'FAILED_REVERT';
    agentName?: string;
    serviceUrl?: string;
    amountUsd?: number;
    latencyMs?: number;
    blockNumber?: number;
    nonce2D?: string;
    eip712Signature?: string;
    merkleProof?: string[];
    merkleRoot?: string;
    domainHash?: string;
    tip20Memo?: string;
    iso20022Remittance?: {
      standard: string;
      costCenter: string;
      categoryCode: string;
      invoiceDigest: string;
    };
    eip712DomainSeparator?: string;
    eip712StructHash?: string;
    liveProxyPayload?: any;
    status?: string;
    receiptVerified?: boolean;
    providerDataStatus?: 'EVALUATION_FIXTURE' | 'UPSTREAM_RESPONSE';
  } | null;
}

function getDeliveredPayload(traceData: any) {
  const isLiveConfirmed = traceData?.executionMode === 'LIVE_TESTNET'
    && traceData?.status === 'SETTLED'
    && traceData?.receiptVerified === true
    && typeof traceData?.txHash === 'string'
    && /^0x[a-fA-F0-9]{64}$/.test(traceData.txHash);
  const isSampleProvider = traceData?.providerDataStatus !== 'UPSTREAM_RESPONSE';
  const amountSettledUsd = isLiveConfirmed && Number.isFinite(Number(traceData?.amountUsd))
    ? Number(traceData?.amountUsd)
    : 0;
  if (traceData?.liveProxyPayload) {
    return {
      title: isSampleProvider ? 'Demo Provider Response' : (isLiveConfirmed ? 'Delivered Response Body' : 'Evaluation Response Preview'),
      type: isSampleProvider ? 'Demo Provider Response' : 'Upstream Provider Response',
      alternative: isLiveConfirmed
        ? (isSampleProvider ? 'Tempo confirms payment only. This result is a demo fixture, not a live external-provider response.' : 'Tempo confirms payment and this response came from the upstream provider.')
        : 'Shows an evaluation preview; no confirmed chain receipt is claimed.',
      content: typeof traceData.liveProxyPayload === 'object' 
        ? JSON.stringify(traceData.liveProxyPayload, null, 2) 
        : String(traceData.liveProxyPayload),
    };
  }

  const url = (traceData?.serviceUrl || '').toLowerCase();
  const agent = (traceData?.agentName || '').toLowerCase();

  if (url.includes('rogue') || url.includes('drainer')) {
    return {
      title: 'Security Interception Log',
      type: 'Blocked Attack Vector',
      alternative: 'Blocked before any debit',
      content: JSON.stringify({
        status: 'BLOCKED_BY_WHITELIST',
        attemptedEndpoint: traceData?.serviceUrl || 'https://api.rogue-drainer.xyz',
        fundsDebited: '$0.0000',
        action: 'Request dropped before on-chain debit',
        reason: 'Host not present in Merkle whitelist root'
      }, null, 2),
    };
  }

  if (url.includes('sol') || agent.includes('sol')) {
    return {
      title: isLiveConfirmed ? 'Delivered SOL/USDT Level 2 Orderbook' : 'Evaluation SOL/USDT Orderbook Preview',
      type: 'Market Data Snapshot (Amberdata Demo)',
      alternative: 'Example L2 depth snapshot for one machine request',
      content: JSON.stringify({
        ticker: 'SOL/USDT',
        status: isLiveConfirmed ? 'DELIVERED' : 'EVALUATION',
        bids: [
          { price: 148.45, size: 124.5, exchange: 'Amberdata-Demo' },
          { price: 148.40, size: 280.1, exchange: 'Amberdata-Demo' },
          { price: 148.25, size: 1050.4, exchange: 'Amberdata-Demo' }
        ],
        asks: [
          { price: 148.55, size: 142.0, exchange: 'Amberdata-Demo' },
          { price: 148.60, size: 318.5, exchange: 'Amberdata-Demo' },
          { price: 148.75, size: 987.0, exchange: 'Amberdata-Demo' }
        ],
        spreadUsd: 0.10,
        liquidityDepthUsd: 428900,
        paymentStatus: isLiveConfirmed ? 'CONFIRMED' : 'NOT_SUBMITTED'
      }, null, 2),
    };
  }

  if (url.includes('aapl') || url.includes('orderbook') || agent.includes('crypto') || agent.includes('arbitrage')) {
    return {
      title: isLiveConfirmed ? 'Delivered AAPL/USD Level 2 Orderbook' : 'Evaluation AAPL/USD Orderbook Preview',
      type: 'Market Data Snapshot',
      alternative: 'Example provider response for one request',
      content: JSON.stringify({
        ticker: 'AAPL/USD',
        status: isLiveConfirmed ? 'DELIVERED' : 'EVALUATION',
        bids: [
          { price: 231.42, size: 850, exchange: 'NASDAQ' },
          { price: 231.40, size: 1420, exchange: 'BATS' },
          { price: 231.38, size: 2100, exchange: 'ARCA' }
        ],
        asks: [
          { price: 231.43, size: 400, exchange: 'NASDAQ' },
          { price: 231.45, size: 980, exchange: 'EDGX' },
          { price: 231.48, size: 1800, exchange: 'IEX' }
        ],
        spreadUsd: 0.01,
        liquidityDepthUsd: 1245900,
        paymentStatus: isLiveConfirmed ? 'CONFIRMED' : 'NOT_SUBMITTED'
      }, null, 2),
    };
  }

  if (url.includes('scrape') || url.includes('news') || agent.includes('scraper') || agent.includes('research')) {
    return {
      title: isLiveConfirmed ? 'Clean Extracted Full-Text Article' : 'Evaluation Article Preview',
      type: isLiveConfirmed ? 'Scraped Web Article (Markdown)' : 'Demo Provider Response (Markdown)',
      alternative: 'Example provider response for one request',
      content: JSON.stringify({
        status: isLiveConfirmed ? 'EXTRACTED_CLEAN_MARKDOWN' : 'EVALUATION_PREVIEW',
        sourceUrl: 'https://tech-wire.news/briefs/fed-liquidity-surge',
        headline: 'Fed Open Market Desk Injects $4.2B in Overnight Liquidity Facilities',
        author: 'E. Vance, Senior Financial Correspondent',
        wordCount: 842,
        cleanContentSnippet: 'The Federal Reserve Open Market Trading Desk conducted overnight repo operations totaling $4.2 billion, maintaining effective policy rates within the target band of 4.50-4.75%...',
        tokenCount: 940,
        unlockedBytes: 14280
      }, null, 2),
    };
  }

  if (url.includes('python') || url.includes('sandbox') || agent.includes('quant')) {
    return {
      title: isLiveConfirmed ? 'Sandboxed Python Container Execution Output' : 'Evaluation Python Output Preview',
      type: isLiveConfirmed ? 'Monte Carlo & Sharpe Ratio Calculation' : 'Sample Calculation Response',
      alternative: 'Example provider response for one request',
      content: JSON.stringify({
        containerStatus: isLiveConfirmed ? 'TERMINATED_OK' : 'EVALUATION_PREVIEW',
        exitCode: 0,
        runtimeMs: 38,
        stdout: [
          'Calculated 10,000 Monte Carlo Portfolio Paths',
          'Sharpe Ratio (Annualized): 2.41',
          'Value at Risk (95% VaR 1-day): 1.18%',
          'Maximum Expected Drawdown: -3.42%'
        ],
        unlockedPayloadBytes: 2048
      }, null, 2),
    };
  }

  if (url.includes('lingo') || url.includes('translate')) {
    return {
      title: 'Bilingual Translation Output',
      type: 'Machine Translation Stream',
      alternative: 'Example provider response for one request',
      content: JSON.stringify({
        engine: 'LingoStream Neural v4',
        sourceLanguage: 'ka (Georgian)',
        targetLanguage: 'en (English)',
        inputText: 'Autonomous agent swarm settles 0.1¢ per inference request on Tempo L1.',
        translatedText: 'Network of autonomous agents pays 0.1 cents per request.',
        bleuScore: 97.4
      }, null, 2),
    };
  }

  return {
    title: isLiveConfirmed ? 'Delivered Upstream Machine Payload' : 'Evaluation Response Preview',
    type: isLiveConfirmed ? 'Authenticated Micro-Service Data' : 'Demo Provider Response',
    alternative: isLiveConfirmed ? 'Shows the result returned for this paid request' : 'Shows the response shape without claiming a live provider result',
    content: JSON.stringify({
      service: traceData?.serviceUrl || '/api/v1/data/stock-orderbook',
      agent: traceData?.agentName || 'Synapse402 Agent',
      deliveredAt: new Date().toISOString(),
      amountSettledUsd,
      status: isLiveConfirmed ? 'DELIVERY_CONFIRMED' : 'EVALUATION_ONLY'
    }, null, 2),
  };
}

export const CryptoInspectorModal: React.FC<CryptoInspectorModalProps> = ({
  isOpen,
  onClose,
  traceData,
}) => {
  const [activeTab, setActiveTab] = useState<'deliverable' | 'merkle' | 'eip712' | 'nonce2d' | 'tip20' | 'rawjson'>('deliverable');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    soundEngine.playClick();
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rawDomainHash = traceData?.domainHash || '';
  const liveConfirmed = traceData?.executionMode === 'LIVE_TESTNET'
    && traceData?.status === 'SETTLED'
    && traceData?.receiptVerified === true
    && typeof traceData?.txHash === 'string'
    && /^0x[a-fA-F0-9]{64}$/.test(traceData.txHash);
  const evaluationOnly = !liveConfirmed && traceData?.executionMode !== 'LIVE_TESTNET_PENDING_CONFIRMATION';
  const explicitlyRejected = traceData?.status === 'REJECTED'
    || traceData?.status === 'FAILED_REVERT'
    || traceData?.serviceUrl?.toLowerCase().includes('rogue')
    || traceData?.serviceUrl?.toLowerCase().includes('drainer');
  const isSampleProvider = traceData?.providerDataStatus !== 'UPSTREAM_RESPONSE';
  const displayedAmountUsd = Number.isFinite(Number(traceData?.amountUsd))
    ? Number(traceData?.amountUsd)
    : 0;
  const domainHash = rawDomainHash.startsWith('0x') ? rawDomainHash.slice(2) : rawDomainHash;
  const rawMerkleRoot = traceData?.merkleRoot || '';
  const displayMerkleRoot = rawMerkleRoot ? (rawMerkleRoot.startsWith('0x') ? rawMerkleRoot : `0x${rawMerkleRoot}`) : 'N/A';

  const proofLeaves = traceData?.merkleProof && traceData.merkleProof.length > 0
    ? traceData.merkleProof
    : [];

  const isWhitelisted =
    liveConfirmed &&
    traceData?.status !== 'BLOCKED' &&
    !traceData?.serviceUrl?.toLowerCase().includes('rogue') &&
    !traceData?.serviceUrl?.toLowerCase().includes('drainer') &&
    (traceData as any)?.merkleVerified !== false;

  const eip712Domain = {
    name: 'SynapseVault',
    version: '1.0.0',
    chainId: TEMPO_CHAIN_ID,
    verifyingContract: TEMPO_VAULT_ADDRESS,
  };

  const channelId = traceData?.nonce2D?.startsWith('0x') ? parseInt(traceData.nonce2D.split(':')[0].slice(2), 16) : 1;
  const rawNonce = traceData?.nonce2D ? traceData.nonce2D.split(':')[1] : null;
  const sequenceNonce = rawNonce ? (rawNonce.startsWith('0x') ? parseInt(rawNonce.slice(2), 16) : parseInt(rawNonce, 10) || 0) : 0;

  const effectiveSessionKey = traceData?.sessionKey 
    || traceData?.authAuthorizationHeader?.match(/signer="([^"]+)"/)?.[1]
    || 'Pending / Unspecified';

  const eip712Message = {
    sessionKey: effectiveSessionKey,
    channelId,
    nonce: sequenceNonce,
    payee: DEMO_PAYMENT_RECEIVER,
    amount: Math.round(displayedAmountUsd * 1e6),
    endpointHash: domainHash ? (domainHash.startsWith('0x') ? domainHash : `0x${domainHash}`) : '0x00',
    memo: traceData?.tip20Memo || '0x00',
    validBefore: Math.floor(Date.now() / 1000) + 86400 * 30,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1a2027] backdrop-blur-md border border-white/[.15] w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-white/[.12] flex items-center justify-between bg-white/[.07]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#d7ff4f]/[.08] border border-[#d7ff4f]/30 flex items-center justify-center text-[#d7ff4f]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#f5f5f2] flex items-center">
                <span>{liveConfirmed ? 'Verified Transaction Receipt & Audit Proof' : 'Evaluation Payment Record'}</span>
                <InfoBadge
                  title="Cryptographic Audit Bundle"
                  text={liveConfirmed
                    ? 'A confirmed receipt binds the Merkle whitelist proof, EIP-712 signature, 2D nonce channel, and ISO 20022 memo into one chain record.'
                    : 'This evaluation shows the planned proof fields. They become verifiable after a live run returns a confirmed Tempo receipt.'}
                />
              </h3>
              <p className="text-[11px] text-white/50 font-mono">
                {liveConfirmed ? 'Tempo L1 settlement receipt • ISO 20022 record' : 'No blockchain transaction submitted in this evaluation'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/50 hover:text-[#f5f5f2] hover:bg-[#1e2630] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Receipt Summary Card */}
        <div className="p-4 bg-[#151b22] border-b border-white/[.12] grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-2.5 rounded-lg bg-white/[.055] border border-white/[.10]">
            <span className="text-[10px] text-zinc-400 block font-sans">AGENT & SERVICE</span>
            <span className="font-bold text-[#f5f5f2] text-xs truncate block">{traceData?.agentName || 'AI Research Agent'}</span>
            <span className="text-[10px] text-zinc-400 truncate block">
              {traceData?.serviceUrl
                ? (traceData.serviceUrl.startsWith('/')
                    ? traceData.serviceUrl
                    : (() => { try { return new URL(traceData.serviceUrl).hostname; } catch { return traceData.serviceUrl; } })())
                : '/api/v1/data/stock-orderbook'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-white/[.055] border border-white/[.10]">
            <span className="text-[10px] text-zinc-400 block font-sans">{liveConfirmed ? 'SETTLED AMOUNT' : 'PLANNED AMOUNT'}</span>
            <span className="font-mono font-black text-[#d7ff4f] text-sm">
              ${displayedAmountUsd.toFixed(4)} USD
            </span>
            <span className="text-[10px] text-emerald-400 block font-mono">
              {displayedAmountUsd > 0 ? `${(displayedAmountUsd * 100).toFixed(2)}¢ per request` : 'Amount unavailable'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-white/[.055] border border-white/[.10]">
            <span className="text-[10px] text-zinc-400 block font-sans">GATEWAY & L1 FINALITY</span>
              <span className="font-mono font-bold text-zinc-200 text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
              Gateway authorization
            </span>
            <span className="text-[10px] text-zinc-400 block font-mono">
              {liveConfirmed
                ? (Number(traceData?.blockNumber) > 0 ? `Tempo L1 block #${Number(traceData?.blockNumber)}` : 'Tempo L1 receipt confirmed')
                : 'No chain finality in evaluation'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-white/[.055] border border-white/[.10]">
            <span className="text-[10px] text-zinc-400 block font-sans">RECEIPT STATUS</span>
            <span className={`font-mono font-bold text-xs ${liveConfirmed ? 'text-emerald-300' : 'text-amber-300'}`}>{liveConfirmed ? 'CONFIRMED (200 OK)' : 'EVALUATION RESPONSE'}</span>
            <span className="text-[10px] text-zinc-400 block font-mono">{liveConfirmed ? 'Non-repudiable' : 'Not a chain receipt'}</span>
          </div>
        </div>

        {/* Verification scope disclaimer */}
        <div className="mx-4 my-2.5 p-2.5 rounded-lg bg-white/[.055] border border-white/[.12] text-[11px] text-zinc-300 flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d7ff4f] mt-1 shrink-0"></span>
          <span>
            <strong className="text-zinc-200">What this proves:</strong> {liveConfirmed ? 'Verifies that the micropayment was signed and recorded on Tempo L1.' : 'Shows the signed payment plan and provider response; no chain receipt exists yet.'} In this demo, the recorded payee is the shared SynapseMPPReceiver gateway ({DEMO_PAYMENT_RECEIVER.slice(0, 6)}…{DEMO_PAYMENT_RECEIVER.slice(-4)}), not an external provider wallet. It does not independently verify external provider data accuracy.
          </span>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-white/[.12] bg-[#151b22] text-xs font-mono px-4 pt-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('deliverable')}
            className={`pb-2.5 px-3 border-b-2 font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'deliverable'
                ? 'border-[#d7ff4f] text-[#d7ff4f]'
                : 'border-transparent text-white/50 hover:text-[#f5f5f2]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Unlocked Data Payload</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              {isSampleProvider ? 'DEMO PROVIDER RESPONSE' : liveConfirmed ? 'UPSTREAM RESPONSE' : 'RESPONSE PREVIEW'}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('merkle')}
            className={`pb-2.5 px-3 border-b-2 font-medium transition-all flex items-center gap-1 whitespace-nowrap ${
              activeTab === 'merkle'
                ? 'border-[#d7ff4f] text-[#d7ff4f]'
                : 'border-transparent text-white/50 hover:text-[#f5f5f2]'
            }`}
          >
            <span>Vendor Whitelist Proof</span>
            <InfoBadge
              title="Merkle Tree Membership"
              text="OpenZeppelin StandardMerkleTree proof: compares the canonical double-keccak endpoint leaf against the on-chain Merkle root stored in SynapseVault.sol."
            />
          </button>
          <button
            onClick={() => setActiveTab('eip712')}
            className={`pb-2.5 px-3 border-b-2 font-medium transition-all flex items-center gap-1 whitespace-nowrap ${
              activeTab === 'eip712'
                ? 'border-[#d7ff4f] text-[#d7ff4f]'
                : 'border-transparent text-white/50 hover:text-[#f5f5f2]'
            }`}
          >
            <span>Card Authorization Signature</span>
            <InfoBadge
              title="EIP-712 StructHash Verification"
              text="Verifies the MPPAuthorization typed struct hash signed by the bot's private session key, validating amount, nonce, and recipient on-chain."
            />
          </button>
          <button
            onClick={() => setActiveTab('nonce2d')}
            className={`pb-2.5 px-3 border-b-2 font-medium transition-all flex items-center gap-1 whitespace-nowrap ${
              activeTab === 'nonce2d'
                ? 'border-[#d7ff4f] text-[#d7ff4f]'
                : 'border-transparent text-white/50 hover:text-[#f5f5f2]'
            }`}
          >
            <span>Parallel Payment Lane</span>
            <InfoBadge
              title="Tempo L1 2D Nonce Concurrency"
              text="Uses (channelId, sequenceNonce) tuple to allow parallel settlement across 20+ bots without transaction ordering conflicts or stuck nonces."
            />
          </button>
          <button
            onClick={() => setActiveTab('tip20')}
            className={`pb-2.5 px-3 border-b-2 font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'tip20'
                ? 'border-[#d7ff4f] text-[#d7ff4f]'
                : 'border-transparent text-white/50 hover:text-[#f5f5f2]'
            }`}
          >
            <span>Accounting Receipt</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-[#d7ff4f]/10 text-[#d7ff4f] border border-[#d7ff4f]/30">ISO 20022</span>
            <InfoBadge
              title="ISO 20022 Remittance Matching"
              text="TIP-20 transferWithMemo attaches a 32-byte structured remittance reference based on pacs.008 data for reconciliation and export. It does not replace an accounting integration."
            />
          </button>
          <button
            onClick={() => setActiveTab('rawjson')}
            className={`pb-2.5 px-3 border-b-2 font-medium transition-all whitespace-nowrap ${
              activeTab === 'rawjson'
                ? 'border-[#d7ff4f] text-[#d7ff4f]'
                : 'border-transparent text-white/50 hover:text-[#f5f5f2]'
            }`}
          >
            {'{ }'} Raw Receipt
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono text-zinc-300">
          {activeTab === 'deliverable' && (() => {
            const delivered = getDeliveredPayload(traceData);
            return (
              <div className="space-y-3 font-sans">
                {/* Deliverable Header Card */}
                <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-400 text-black font-mono">
                        DELIVERABLE DELIVERED
                      </span>
                      <span className="text-xs font-bold text-emerald-300">
                        {delivered.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-300 mt-1 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-400 shrink-0 inline-block" />
                      <span><strong>Execution Outcome:</strong> Agent dispatched an HTTP 402 request and {liveConfirmed ? 'settled on Tempo L1 with cryptographic proof.' : 'completed the evaluation flow; no chain transaction was sent in this preview.'} {isSampleProvider ? 'The displayed result is a demo fixture, not a live external-provider response.' : ''}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 block">SaaS Alternative:</span>
                    <span className="text-[11px] font-bold text-[#d7ff4f] font-mono">
                      {delivered.alternative}
                    </span>
                  </div>
                </div>

                {/* Delivered Payload Data View */}
                <div className="p-3 bg-[#20262e] rounded-lg border border-white/[.12] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-200 font-mono">
                      Returned Payload Body (JSON/Content):
                    </span>
                    <button
                      onClick={() => handleCopy(delivered.content)}
                      className="px-2.5 py-1 rounded bg-[#d7ff4f]/15 hover:bg-[#d7ff4f]/25 text-[#d7ff4f] border border-[#d7ff4f]/30 text-[11px] flex items-center gap-1 font-mono transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copied ? 'Copied to Clipboard!' : 'Copy Payload'}</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-[#11161c] rounded border border-white/15 text-[11px] text-[#d7ff4f] font-mono leading-relaxed overflow-x-auto max-h-[220px]">
{delivered.content}
                  </pre>
                </div>

                {/* Economic Value Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-sans">
                  <div className="p-2.5 rounded-lg bg-white/[.055] border border-white/[.10]">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block">Actual Cost Paid</span>
                    <span className={`text-sm font-black font-mono ${liveConfirmed ? 'text-emerald-400' : 'text-zinc-200'}`}>
                      ${(liveConfirmed ? displayedAmountUsd : 0).toFixed(4)} USD
                    </span>
                    {!liveConfirmed && (
                      <span className="text-[10px] text-zinc-400 block mt-0.5 font-mono">
                        Planned request: ${displayedAmountUsd.toFixed(4)} · no transaction sent
                      </span>
                    )}
                    <span className="text-[10px] text-zinc-400 block mt-0.5 font-mono">
                      {liveConfirmed ? 'Tempo network fee recorded with the confirmed settlement' : 'No Tempo network fee was incurred in evaluation'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[.055] border border-white/[.10]">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block">Cost When Idle</span>
                    <span className="text-sm font-black text-[#d7ff4f] font-mono">
                      $0.00 / month
                    </span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">
                      Zero idle subscription waste
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[.055] border border-white/[.10]">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block">Card Fee Problem</span>
                    <span className="text-xs font-bold text-zinc-200">
                      Eliminates 30¢ Swipe Fee
                    </span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">
                      Sub-cent bot micro-pay unlocked
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

          {activeTab === 'merkle' && (
            <div className="space-y-4">
              {evaluationOnly && !explicitlyRejected && (
                <div className="rounded-lg border border-white/10 bg-white/[.04] px-3 py-2 text-[11px] text-zinc-300">
                  Evaluation preview: the request was not verified against an on-chain Merkle root. This is not a whitelist rejection.
                </div>
              )}
              <div className="p-3 bg-[#1f262e] rounded-lg border border-white/[.12] space-y-2">
                <div className="flex items-center justify-between text-[#f5f5f2]">
                  <span className="font-semibold text-xs">Target Domain Leaf Hashing</span>
                  {isWhitelisted ? (
                    <span className="px-2 py-0.5 rounded bg-[#d7ff4f]/[.08] text-[#d7ff4f] text-[10px] border border-[#d7ff4f]/20 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Verified in Whitelist
                    </span>
                  ) : evaluationOnly && !explicitlyRejected ? (
                    <span className="px-2 py-0.5 rounded bg-white/[.04] text-zinc-300 text-[10px] border border-white/10 flex items-center gap-1">
                      Evaluation · not verified on-chain
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] border border-red-500/30 flex items-center gap-1">
                      <X className="w-3 h-3" />
                      Rejected: Host Not in Whitelist
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-white/50 break-all">
                  <span className="text-white/30">Target URL: </span>
                  <span className="text-[#f5f5f2]">{traceData?.serviceUrl || '/api/v1/data/stock-orderbook'}</span>
                </div>
                <div className={`text-[10px] p-2 rounded border break-all ${isWhitelisted ? 'bg-white/[.04] border-white/15 text-[#d7ff4f]' : evaluationOnly && !explicitlyRejected ? 'bg-white/[.04] border-white/10 text-zinc-300' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                  Standard leaf (double-keccak) = {domainHash ? `0x${domainHash}` : 'N/A'}
                </div>
              </div>

              {/* Visual Tree representation */}
              <div className="space-y-2">
                <div className="text-[#f5f5f2] font-semibold text-xs flex items-center justify-between">
                  <span>Merkle Proof Path Resolution</span>
                  <span className="text-[10px] text-white/50">Root Height: 3 Levels</span>
                </div>

                <div className="space-y-2 bg-[#1f262e] p-3.5 rounded-lg border border-white/[.12]">
                  {/* Step 1 */}
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded bg-white/[.04] text-[#f5f5f2] flex items-center justify-center font-bold text-[10px]">
                      L0
                    </span>
                    <div className="flex-1 truncate text-[11px]">
                      <span className="text-white/50">Leaf Hash: </span>
                      <span className="text-[#f5f5f2]">0x{domainHash.slice(0, 18)}...</span>
                    </div>
                    {isWhitelisted ? (
                      <span className="text-[#d7ff4f] text-[10px]">MATCH</span>
                    ) : evaluationOnly && !explicitlyRejected ? (
                      <span className="text-zinc-400 text-[10px]">Not checked in evaluation</span>
                    ) : (
                      <span className="text-red-400 text-[10px] font-bold">NO MATCH (403)</span>
                    )}
                  </div>

                   {/* Step 2 */}
                  {proofLeaves.length > 0 ? (
                    proofLeaves.map((leaf, idx) => {
                      const cleanLeaf = leaf.startsWith('0x') ? leaf.slice(2) : leaf;
                      return (
                        <div key={idx} className="flex items-center gap-3 pl-3 border-l-2 border-white/[.08]">
                          <span className="w-6 h-6 rounded bg-white/[.04] text-[#d7ff4f] flex items-center justify-center font-bold text-[10px]">
                            L{idx + 1}
                          </span>
                          <div className="flex-1 truncate text-[11px]">
                            <span className="text-white/50">Sibling Hash: </span>
                            <span className="text-[#d7ff4f]">0x{cleanLeaf.slice(0, 18)}...</span>
                          </div>
                          <ArrowRight className="w-3 h-3 text-white/30" />
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-[11px] text-zinc-500 pl-3 py-1 font-mono italic">
                      Direct single-leaf verification or no active trace sibling branch.
                    </div>
                  )}

                  {/* Root */}
                  <div className="mt-2 pt-2 border-t border-white/[.08] flex items-center justify-between text-[#f5f5f2]">
                    <span className={isWhitelisted ? 'text-[#d7ff4f] font-bold' : evaluationOnly && !explicitlyRejected ? 'text-zinc-400 font-bold' : 'text-red-400 font-bold'}>
                      Merkle Root Hash:
                    </span>
                    <span className={`text-xs font-semibold truncate max-w-[280px] ${isWhitelisted ? 'text-[#d7ff4f]' : evaluationOnly && !explicitlyRejected ? 'text-zinc-400' : 'text-red-400'}`} title={displayMerkleRoot}>
                      {displayMerkleRoot.slice(0, 18)}... {isWhitelisted ? 'VALID MERKLE PROOF' : evaluationOnly && !explicitlyRejected ? 'NOT VERIFIED IN EVALUATION' : 'PROOF REJECTED (403)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'eip712' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#f5f5f2] font-semibold text-xs">EIP-712 Domain Separator & Type Hash</span>
                <button
                  onClick={() => handleCopy(JSON.stringify({ domain: eip712Domain, message: eip712Message }, null, 2))}
                  className="px-2 py-1 rounded bg-white/[.04] hover:bg-[#1e2630] text-[#f5f5f2] text-[10px] flex items-center gap-1 border border-white/15"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? 'Copied!' : 'Copy Schema'}</span>
                </button>
              </div>

              <pre className="p-3 bg-[#1f262e] rounded-lg border border-white/[.12] text-[11px] text-[#f5f5f2] leading-relaxed overflow-x-auto">
{JSON.stringify(
  {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      MPPAuthorization: [
        { name: 'sessionKey', type: 'address' },
        { name: 'channelId', type: 'uint64' },
        { name: 'nonce', type: 'uint64' },
        { name: 'payee', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'endpointHash', type: 'bytes32' },
        { name: 'memo', type: 'bytes32' },
        { name: 'validBefore', type: 'uint256' },
      ],
    },
    domain: eip712Domain,
    message: eip712Message,
  },
  null,
  2
)}
              </pre>
            </div>
          )}

          {activeTab === 'nonce2d' && (
            <div className="space-y-3 text-xs font-sans">
              <div className="p-4 bg-[#1f262e] rounded-lg border border-white/[.12] space-y-2">
                <h4 className="text-sm font-semibold text-zinc-100">How 2D Nonces Prevent Collisions</h4>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  Traditional EVM transactions use a single linear nonce <code className="text-[#d7ff4f] font-mono">(0, 1, 2...)</code>, which causes bots to block one another if executed in parallel.
                </p>
                <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                  <div className="bg-white/[.03] backdrop-blur-md p-3 rounded-lg border border-white/[.08]">
                    <span className="text-zinc-400 block text-[10px] uppercase font-sans">Channel ID</span>
                    <span className="text-zinc-100 font-bold text-sm font-mono">Channel #{traceData?.nonce2D?.split(':')[0] || '0x01'}</span>
                    <span className="text-zinc-400 block text-[10px] mt-1 font-sans">Dedicated to {traceData?.agentName || 'Active AI Agent'}</span>
                  </div>
                  <div className="bg-white/[.03] backdrop-blur-md p-3 rounded-lg border border-white/[.08]">
                    <span className="text-zinc-400 block text-[10px] uppercase font-sans">Sequence Nonce</span>
                    <span className="text-[#d7ff4f] font-bold text-sm font-mono">{traceData?.nonce2D?.split(':')[1] || '0x01E9'}</span>
                    <span className="text-zinc-400 block text-[10px] mt-1 font-sans">&lt;15ms Engine increment</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tip20' && (
            <div className="space-y-4 text-xs font-mono">
              <div className="p-3.5 bg-[#1f262e] rounded-lg border border-white/[.12] space-y-2.5">
                <div className="flex items-center justify-between text-[#f5f5f2]">
                  <span className="font-semibold text-xs flex items-center gap-1.5">
                    <span className="text-[#d7ff4f]">Tempo L1 TIP-20 Transfer Memo</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[.04] text-white/50 border border-white/15">bytes32</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#d7ff4f]/[.08] text-[#d7ff4f] text-[10px] border border-[#d7ff4f]/20 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Cryptographically Reconciled
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
                  Tempo L1's native TIP-20 standard reserves a 32-byte field in every transfer. Synapse402 puts a payment reference inside the transfer so the result can be matched to the work.
                </p>
                <div className="bg-white/[.04] p-2.5 rounded border border-white/15 space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-white/50">
                    <span>TIP-20 32-Byte Hex Value:</span>
                    <button
                      onClick={() => traceData?.tip20Memo && handleCopy(traceData.tip20Memo)}
                      disabled={!traceData?.tip20Memo}
                      className="text-[#d7ff4f] hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="text-[#d7ff4f] break-all text-[11px] font-semibold">
                    {traceData?.tip20Memo || 'Not available for this trace'}
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-[#1f262e] rounded-lg border border-white/[.12] space-y-2.5">
                <div className="flex items-center justify-between text-[#f5f5f2]">
                  <span className="font-semibold text-xs text-[#f5f5f2]">ISO 20022 Financial Remittance Structure</span>
                  <span className="text-[10px] text-[#d7ff4f] bg-[#d7ff4f]/10 px-2 py-0.5 rounded border border-[#d7ff4f]/30">
                    pacs.008.001.08
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-white/[.04] p-2 rounded border border-white/[.08]">
                    <span className="text-white/50 block text-[10px]">Cost Center Code</span>
                    <span className="text-[#f5f5f2] font-semibold">
                      {traceData?.iso20022Remittance?.costCenter || 'Not available'}
                    </span>
                  </div>
                  <div className="bg-white/[.04] p-2 rounded border border-white/[.08]">
                    <span className="text-white/50 block text-[10px]">Service Category</span>
                    <span className="text-[#f5f5f2] font-semibold">
                      {traceData?.iso20022Remittance?.categoryCode || 'Not available'}
                    </span>
                  </div>
                </div>
                <div className="bg-white/[.04] p-2 rounded border border-white/[.08] space-y-1">
                  <span className="text-white/50 block text-[10px]">Cryptographic Invoice Digest:</span>
                  <span className="text-[#f5f5f2] text-[10px] break-all block font-mono">
                    {traceData?.iso20022Remittance?.invoiceDigest || 'Not available for this trace'}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-300 font-sans">
                  <span className="w-2 h-2 rounded-full bg-[#d7ff4f]"></span>
                  <span>Payment reference: <strong className="text-zinc-100">Structured receipt ready to export</strong></span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rawjson' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#f5f5f2] font-semibold">Raw MPP Settlement Trace</span>
                <button
                  onClick={() => handleCopy(JSON.stringify(traceData || {}, null, 2))}
                  className="px-2 py-1 rounded bg-white/[.04] hover:bg-[#1e2630] text-[#f5f5f2] text-[10px] flex items-center gap-1 border border-white/15"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
                </button>
              </div>
              <pre className="p-3 bg-[#11161c] rounded-lg border border-white/[.12] text-[10px] text-[#d7ff4f] leading-relaxed overflow-x-auto">
{JSON.stringify(traceData || { status: 'No active trace payload selected' }, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[.12] bg-white/[.07] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-white/50">
            <span className={`w-2 h-2 rounded-full ${isWhitelisted ? 'bg-[#d7ff4f]' : evaluationOnly && !explicitlyRejected ? 'bg-zinc-400' : 'bg-red-400 animate-pulse'}`}></span>
            <span>EVM Cryptographic Compatibility: {isWhitelisted ? 'Verified on Tempo L1' : evaluationOnly && !explicitlyRejected ? 'Evaluation only · not checked on-chain' : 'Rejected before settlement'}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#d7ff4f] hover:bg-[#bce63b] text-[#0c0f12] font-semibold transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
