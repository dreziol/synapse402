import { TEMPO_CHAIN_ID, TEMPO_DEFAULT_FEE_TOKEN_SYMBOL, TEMPO_EXPLORER_URL, TEMPO_RPC_URL, tempoTransactionUrl } from './config/network';
import React, { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { AgentAccount, LivePaymentEvent, MonetizedApiEndpoint } from './types/synapse402';
const DashboardWallet = lazy(() => import('./components/DashboardWallet').then((module) => ({ default: module.DashboardWallet })));
const LivePaymentsFeed = lazy(() => import('./components/LivePaymentsFeed').then((module) => ({ default: module.LivePaymentsFeed })));
const ApiMonetizationPortal = lazy(() => import('./components/ApiMonetizationPortal').then((module) => ({ default: module.ApiMonetizationPortal })));
const JuryInteractiveDemo = lazy(() => import('./components/JuryInteractiveDemo').then((module) => ({ default: module.JuryInteractiveDemo })));
const CreateAgentModal = lazy(() => import('./components/CreateAgentModal').then((module) => ({ default: module.CreateAgentModal })));
const DepositModal = lazy(() => import('./components/DepositModal').then((module) => ({ default: module.DepositModal })));
const CryptoInspectorModal = lazy(() => import('./components/CryptoInspectorModal').then((module) => ({ default: module.CryptoInspectorModal })));
const DeveloperSdkModal = lazy(() => import('./components/DeveloperSdkModal').then((module) => ({ default: module.DeveloperSdkModal })));
const WalletConnectionModal = lazy(() => import('./components/WalletConnectionModal').then((module) => ({ default: module.WalletConnectionModal })));
const ProtocolArchitecture = lazy(() => import('./components/ProtocolArchitecture').then((module) => ({ default: module.ProtocolArchitecture })));
import { ExecutiveThesisBanner } from './components/ExecutiveThesisBanner';
import { NetworkTelemetryRibbon } from './components/NetworkTelemetryRibbon';
const MultiAgentSwarmView = lazy(() => import('./components/MultiAgentSwarmView').then((module) => ({ default: module.MultiAgentSwarmView })));
const AgentMissionsView = lazy(() => import('./components/AgentMissionsView').then((module) => ({ default: module.AgentMissionsView })));
import { AutoPilotTourBar, TOUR_STEPS } from './components/AutoPilotTourBar';
import { soundEngine } from './utils/audioEffects';
import { formatFeeTokenBalance } from './utils/formatters';
import { InfoBadge } from './components/InfoBadge';
import { CANONICAL_PROVIDER_REGISTRY, CANONICAL_PROVIDER_URLS } from './config/providerRegistry';
import { 
  Bot, 
  Activity, 
  Store, 
  Play, 
  Layers, 
  ShieldCheck, 
  Sparkles,
  Code2,
  Cpu,
  Radio,
  Wallet,
  Compass
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'live' | 'monetize' | 'demo' | 'missions' | 'architecture' | 'swarm'>('missions');
  const [swarmSubView, setSwarmSubView] = useState<'swarm' | 'stream' | 'mcp' | 'reality'>('swarm');

  const [userBalanceUsd, setUserBalanceUsd] = useState(0);
  const [blockHeight, setBlockHeight] = useState(0);
  const [networkInfo, setNetworkInfo] = useState<{
    status: string;
    networkMode: 'LIVE_TESTNET' | 'RESILIENT_SANDBOX';
    networkModeReason: string;
    blockHeight: number;
    rpcLatencyMs: number;
    isOnline: boolean;
    relayerAddress: string | null;
    vaultAddress: string | null;
    canSettleLive: boolean;
    vaultAdminReason: string;
  }>({
    status: 'checking',
    networkMode: 'RESILIENT_SANDBOX',
    networkModeReason: 'Checking Tempo RPC connectivity…',
    blockHeight: 0,
    rpcLatencyMs: 0,
    isOnline: false,
    relayerAddress: null,
    vaultAddress: null,
    canSettleLive: false,
    vaultAdminReason: 'Checking vault owner authorization…',
  });
  const [executionPreference, setExecutionPreference] = useState<'LIVE_TESTNET' | 'RESILIENT_SANDBOX'>('LIVE_TESTNET');

  const [vaultMetrics, setVaultMetrics] = useState<{
    totalVaultLiquidity: number;
    availableUnreservedLiquidity: number;
    reservedAgentBudgets: number;
    totalVolumeSettledPathUsd: number;
    totalTransactionsCount: number;
    protocolFeeRevenuePathUsd: number;
    blockHeight: number;
  } | null>(null);

  const [receiptSummary, setReceiptSummary] = useState<{
    confirmedPaymentsCount: number;
    evaluationEventsCount: number;
    voidedEventsCount: number;
    totalReceiptsCount: number;
    totalVolumeSettledPathUsd: number;
  }>({
    confirmedPaymentsCount: 0,
    evaluationEventsCount: 0,
    voidedEventsCount: 0,
    totalReceiptsCount: 0,
    totalVolumeSettledPathUsd: 0,
  });

  // Web3 Wallet Connection State
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isRealWalletConnected, setIsRealWalletConnected] = useState(false);
  const [walletBalances, setWalletBalances] = useState<{
    address: string;
    pathUsd: number;
    feeTokenBalance: number;
    feeTokenAddress: string;
    feeTokenSymbol: string;
    vaultTvl: number;
    isSessionKeyRegistered: boolean;
    sessionStatus: string;
  } | null>(null);

  // Inspector & SDK Modals
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [selectedTraceForInspector, setSelectedTraceForInspector] = useState<any>(null);
  const [isSdkModalOpen, setIsSdkModalOpen] = useState(false);

  const connectRealWallet = async () => {
    setIsConnectingWallet(true);
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const eth = (window as any).ethereum;
        const accounts = await eth.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          const userAddr = accounts[0];
          try {
            await eth.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${TEMPO_CHAIN_ID.toString(16)}` }],
            });
          } catch (switchError: any) {
            if (switchError.code === 4902) {
              await eth.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: `0x${TEMPO_CHAIN_ID.toString(16)}`,
                    chainName: 'Tempo Moderato Testnet',
                    // Tempo has no native gas coin. EIP-3085 still asks wallets
                    // for currency metadata, so use the network's USD fee-token
                    // label and explain that the actual fee token is selectable.
                    nativeCurrency: { name: 'USD', symbol: 'USD', decimals: 6 },
                    rpcUrls: [TEMPO_RPC_URL],
                    blockExplorerUrls: [TEMPO_EXPLORER_URL],
                  },
                ],
              });
            }
            else {
              throw switchError;
            }
          }
          setWalletAddress(userAddr);
          setIsRealWalletConnected(true);
          // Connecting a real wallet is an explicit choice to use the live path.
          setExecutionPreference('LIVE_TESTNET');
          fetch(`/api/wallet/balance?address=${userAddr}`)
            .then((r) => r.json())
            .then((wb) => {
              if (wb && typeof wb.pathUsd === 'number') {
                setWalletBalances(wb);
              }
            })
            .catch(() => {});
        }
      } else {
        if (typeof window !== 'undefined') {
          alert('MetaMask was not detected in your browser.\n\nThe live Treasury relayer can still submit approved payments. Install MetaMask only if you want to connect a personal wallet; evaluation mode remains available without a blockchain transaction.');
        }
      }
    } catch (err) {
      console.warn('MetaMask connection rejected or cancelled:', err);
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const disconnectToDemo = () => {
    setWalletAddress(null);
    setIsRealWalletConnected(false);
    setWalletBalances(null);
    // Keep the fallback choice explicit instead of leaving the app on a live path
    // after the user switches away from the connected wallet.
    setExecutionPreference('RESILIENT_SANDBOX');
    setIsWalletModalOpen(false);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const eth = (window as any).ethereum;
      const handleAccounts = (accounts: string[]) => {
        if (accounts && accounts.length > 0) {
          const newAddr = accounts[0];
          setWalletAddress(newAddr);
          setIsRealWalletConnected(true);
          fetch(`/api/wallet/balance?address=${newAddr}`)
            .then((r) => r.json())
            .then((wb) => {
              if (wb && typeof wb.pathUsd === 'number') setWalletBalances(wb);
            })
            .catch(() => {});
        } else {
          disconnectToDemo();
        }
      };

      const handleChain = (chainIdHex: string) => {
        if (chainIdHex.toLowerCase() !== `0x${TEMPO_CHAIN_ID.toString(16)}`) {
          console.warn(`[Synapse402] MetaMask switched to non-Tempo chain: ${chainIdHex}`);
        }
      };

      eth.on?.('accountsChanged', handleAccounts);
      eth.on?.('chainChanged', handleChain);

      return () => {
        eth.removeListener?.('accountsChanged', handleAccounts);
        eth.removeListener?.('chainChanged', handleChain);
      };
    }
  }, []);

  const [agents, setAgents] = useState<AgentAccount[]>([
    {
      id: 'key_quant_alpha',
      name: 'Crypto Market Bot',
      role: 'Approved market snapshots & orderbook depth',
      reusableCapUsd: 50.0,
      cumulativeUsageUsd: 0,
      status: 'ACTIVE',
      sessionKey: '',
      avatarColor: 'bg-[#d7ff4f]/20 text-[#d7ff4f]',
    },
    {
      id: 'key_cortex_research',
      name: 'Market Research Bot',
      role: 'Autonomous news analysis & company research reports',
      reusableCapUsd: 35.0,
      cumulativeUsageUsd: 0,
      status: 'ACTIVE',
      sessionKey: '',
      avatarColor: 'bg-white/10 text-white',
    },
    {
      id: 'key_sec_audit',
      name: 'Code Security Bot',
      role: 'Code vulnerability scanning in safe cloud sandboxes',
      reusableCapUsd: 25.0,
      cumulativeUsageUsd: 0,
      status: 'ACTIVE',
      sessionKey: '',
      avatarColor: 'bg-[#d7ff4f]/20 text-[#d7ff4f]',
    },
    {
      id: 'key_vision_craft',
      name: 'Image Processing Bot',
      role: 'On-demand image processing & visual object analysis',
      reusableCapUsd: 20.0,
      cumulativeUsageUsd: 0,
      status: 'ACTIVE',
      sessionKey: '',
      avatarColor: 'bg-white/10 text-white',
    },
    {
      id: 'key_chronicle_news',
      name: 'Article Reader Bot',
      role: 'Pay-per-article news digest without recurring subscriptions',
      reusableCapUsd: 15.0,
      cumulativeUsageUsd: 0,
      status: 'ACTIVE',
      sessionKey: '',
      avatarColor: 'bg-[#d7ff4f]/20 text-[#d7ff4f]',
    },
    {
      id: 'key_polyglot_translator',
      name: 'Document Translator Bot',
      role: 'Pay-per-page technical document translation',
      reusableCapUsd: 25.0,
      cumulativeUsageUsd: 0,
      status: 'ACTIVE',
      sessionKey: '',
      avatarColor: 'bg-white/10 text-white',
    },
  ]);

  // 2. Live Payments Feed State (Populated dynamically from backend traces & live payments)
  const [liveEvents, setLiveEvents] = useState<LivePaymentEvent[]>([]);

  // Provider routes come from the shared canonical registry. The backend may
  // append a configured provider, but the UI never invents a second catalog.
  const [monetizedEndpoints, setMonetizedEndpoints] = useState<MonetizedApiEndpoint[]>(
    CANONICAL_PROVIDER_REGISTRY.map((ep) => ({
      ...ep,
      totalEarnedUsd: 0,
      totalCalls: 0,
      integrationSnippet: `import { withTempoMpp } from './sdk';\n\napp.get('${ep.endpointUrl.replace(/^https?:\/\/[^/]+/, '') || '/'}', withTempoMpp({ priceUsd: ${ep.pricePerCallUsd}, payee: '0xYourWallet' }), handler);`,
    })),
  );
  // Modals
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isCreateAgentOpen, setIsCreateAgentOpen] = useState(false);

  // Guided tour state: it explains and highlights actions. It never starts a
  // payment or workforce run behind the user's back.
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const [isTourPaused, setIsTourPaused] = useState(true);
  // Keep the narrator floating over the navigation rail so the product canvas
  // stays full-width and its right-side cards remain visible.
  const [tourDockSide, setTourDockSide] = useState<'right' | 'left'>('left');
  const [demoAutoRun, setDemoAutoRun] = useState<{
    id: number;
    preset: 'market_depth' | 'ai_reasoning' | 'deepseek' | 'vision' | 'article' | 'translate' | 'sec' | 'scrape' | 'voice' | 'flight' | 'kyc' | 'aapl' | 'crypto' | 'custom';
    fault: 'none' | 'bad_sig' | 'non_whitelist' | 'overdraft' | 'server_500' | 'idempotent';
    url?: string;
    cost?: number;
    category?: string;
  } | null>(null);

  const navigateTourStep = (index: number) => {
    setTourStepIndex(index);
    const step = TOUR_STEPS[index];
    if (step) {
      if (activeTab !== step.tab) {
        setActiveTab(step.tab);
      }
      if (step.subView) {
        setSwarmSubView(step.subView);
      }
    }
  };

  const clickTourTarget = (selector: string, onClicked?: () => void) => {
    let attempts = 0;
    const findAndClick = () => {
      const target = document.querySelector(selector) as HTMLButtonElement | null;
      if (target && !target.disabled) {
        target.click();
        onClicked?.();
        return;
      }
      attempts += 1;
      if (attempts < 20) window.setTimeout(findAndClick, 100);
    };
    window.setTimeout(findAndClick, 100);
  };

  const runTourAction = () => {
    soundEngine.playClick();
    if (tourStepIndex === 0) {
      setActiveTab('missions');
      clickTourTarget('#tour-sol-mission');
    } else if (tourStepIndex === 1) {
      setActiveTab('swarm');
      setSwarmSubView('swarm');
      clickTourTarget('#tour-sol-analysis-job', () => {
        window.setTimeout(() => clickTourTarget('#btn-execute-swarm-batch'), 180);
      });
    } else if (tourStepIndex === 2) {
      setActiveTab('demo');
      setDemoAutoRun({ id: Date.now(), preset: 'market_depth', fault: 'none', url: 'https://demo-market-data.synapse402.network/v1/market-depth', cost: 0.001, category: 'Premium market depth' });
    } else if (tourStepIndex === 3) {
      setActiveTab('demo');
      setDemoAutoRun({ id: Date.now(), preset: 'custom', fault: 'non_whitelist', url: 'https://api.rogue-drainer.xyz/v1/exploit', cost: 0.05, category: 'Unapproved provider' });
    } else if (tourStepIndex === 4) {
      setActiveTab('dashboard');
    } else if (tourStepIndex === 5) {
      setActiveTab('monetize');
    } else if (tourStepIndex === 6) {
      setActiveTab('live');
    } else if (tourStepIndex === 7) {
      setActiveTab('architecture');
    }
  };

  const startTour = () => {
    soundEngine.playClick();
    setIsTourActive(true);
    setIsTourPaused(true);
    navigateTourStep(0);
  };

  const stopTour = () => {
    soundEngine.playClick();
    setIsTourActive(false);
    setIsTourPaused(true);
  };

  const handleNextTourStep = () => {
    if (tourStepIndex < TOUR_STEPS.length - 1) {
      navigateTourStep(tourStepIndex + 1);
    } else {
      stopTour();
    }
  };

  const handlePrevTourStep = () => {
    if (tourStepIndex > 0) {
      navigateTourStep(tourStepIndex - 1);
    }
  };

  // Load and synchronize state from backend
  const refreshBackendData = () => {
    // 1. Fetch metrics
    fetch('/api/vault/metrics')
      .then((r) => r.json())
      .then((metrics) => {
        if (metrics) {
          setVaultMetrics(metrics);
          setUserBalanceUsd(metrics.totalVaultLiquidity ?? 0);
          setBlockHeight(typeof metrics.blockHeight === 'number' ? metrics.blockHeight : 0);
        }
      })
      .catch((err) => console.error('Error loading metrics:', err));

    // 2. Fetch keys
    fetch('/api/keys')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.keys) {
          const loadedAgents = data.keys.map((k: any) => ({
            id: k.id,
            name: k.agentName,
            role: k.role,
            reusableCapUsd: k.totalBudgetPathUsd,
            cumulativeUsageUsd: k.currentSpentPathUsd,
            status: k.status === 'ACTIVE' ? 'ACTIVE' : 'PAUSED',
            sessionKey: k.sessionPublicKey,
            validBeforeTimestamp: Number(k.validBeforeTimestamp),
            avatarColor: k.status === 'ACTIVE'
              ? 'bg-[#d7ff4f]/20 text-[#d7ff4f]'
              : 'bg-white/10 text-white',
            merkleRoot: k.merkleRoot,
            whitelistedDomains: Array.isArray(k.whitelistedDomains) ? k.whitelistedDomains : [],
          }));
          setAgents(loadedAgents);
        }
      })
      .catch((err) => console.error('Error loading keys:', err));

    // 3. Fetch canonical receipts & summary
    fetch('/api/receipts')
      .then((r) => r.json())
      .catch(() => fetch('/api/mpp/traces').then((r) => r.json()))
      .then((data) => {
        if (data && data.summary) {
          setReceiptSummary({
            confirmedPaymentsCount: Number(data.summary.confirmedPaymentsCount || 0),
            evaluationEventsCount: Number(data.summary.evaluationEventsCount || 0),
            voidedEventsCount: Number(data.summary.voidedEventsCount || 0),
            totalReceiptsCount: Number(data.summary.totalReceiptsCount || 0),
            totalVolumeSettledPathUsd: Number(data.summary.totalVolumeSettledPathUsd || 0),
          });
        }
        const rawReceipts = data?.receipts || data?.traces;
        if (Array.isArray(rawReceipts)) {
          const loadedTraces = rawReceipts.map((t: any) => {
            // Keep the provider address that actually handled the request. The
            // local provider payload is more truthful than the old public alias
            // that made internal demo routes look like external services.
            const rawEp = t.targetEndpoint || t.targetUrl || '';
            const payloadEp = typeof t.liveProxyPayload?.endpoint === 'string' ? t.liveProxyPayload.endpoint : '';
            const ep = payloadEp || rawEp;
            // Older fixture records lacked provenance. Treat an unlabelled
            // historical payload as a sample unless the server explicitly
            // says it came from a live upstream response.
            const providerDataStatus = t.providerDataStatus === 'UPSTREAM_RESPONSE'
              ? 'UPSTREAM_RESPONSE'
              : 'EVALUATION_FIXTURE';
            
            const isVoided = t.status === 'VOIDED' || t.status === 'REFUNDED' || (t.costPathUsd === 0 && (String(t.memoPayload || '').startsWith('SLA_REFUND') || rawEp.includes('500') || rawEp.includes('mock')));
            const voidSuffix = isVoided ? ' (Payment Voided)' : '';

            // Provider identity comes from the backend record. Never invent a
            // brand or service name by parsing a URL; unlabelled history is a
            // neutral demo record for the jury.
            let friendlyServiceName = providerDataStatus === 'EVALUATION_FIXTURE'
              ? 'Demo Provider response'
              : (t.providerName || t.serviceName || 'Configured provider');

            if (isVoided && !friendlyServiceName.includes('Voided')) {
              friendlyServiceName = `${friendlyServiceName}${voidSuffix}`;
            }

            // Agent Name Resolution
            let resolvedAgentName = t.agentName;
            if (!resolvedAgentName || resolvedAgentName === 'Crypto Market Bot' || resolvedAgentName === 'AI Agent' || resolvedAgentName === 'AlphaArb-HFT') {
              if (ep.includes('academic') || ep.includes('semanticscholar')) resolvedAgentName = 'Academic Reader Bot';
              else if (ep.includes('sec') || ep.includes('10k') || ep.includes('filings')) resolvedAgentName = 'Equity Research Quant';
              else if (ep.includes('deepseek')) resolvedAgentName = 'Reasoning Inference Bot';
              else if (ep.includes('sandbox') || ep.includes('container') || ep.includes('python-sandbox')) resolvedAgentName = 'Code Security Bot';
              else if (ep.includes('vision') || ep.includes('remove-bg') || ep.includes('upscale')) resolvedAgentName = 'Vision Production Bot';
              else if (ep.includes('voice') || ep.includes('synthesize')) resolvedAgentName = 'Audio Voiceover Bot';
              else if (ep.includes('compliance') || ep.includes('identity') || ep.includes('sanctions')) resolvedAgentName = 'Compliance Auditor Bot';
              else if (ep.includes('translate') || ep.includes('deepl')) resolvedAgentName = 'Polyglot Translator';
              else if (ep.includes('binance') || ep.includes('orderbook') || ep.includes('stock-orderbook') || ep.includes('fin-depth')) resolvedAgentName = 'Market Research Bot';
              else if (ep.includes('media/')) resolvedAgentName = 'Campaign Director Bot';
              else resolvedAgentName = t.agentName || 'Market Research Bot';
            }

            // Never surface a partial, synthetic, or stale hash as payment proof.
            // A receipt is linkable only when it is a full transaction hash and
            // the payload was verified on Tempo (or reconstructed from a chain event).
            const isTxHash = (value: unknown): value is string => typeof value === 'string' && /^0x[a-fA-F0-9]{64}$/.test(value);
            const normalizedPayloadTxHash = isTxHash(t.liveProxyPayload?.txHash)
              ? t.liveProxyPayload.txHash
              : '';
            const chainBackfill = t.liveProxyPayload?.backfilledFromChain === true
              || String(t.complianceVerification?.policy || '').toLowerCase().includes('chain receipt verified');
            const candidateTxHash = isTxHash(t.txHash)
              ? t.txHash
              : (chainBackfill ? normalizedPayloadTxHash : '');
            const receiptVerified = t.receiptVerified === true
              && Boolean(candidateTxHash)
              && isTxHash(candidateTxHash);
            const normalizedTxHash = receiptVerified ? candidateTxHash : '';
            const normalizedExecutionMode = receiptVerified || t.executionMode === 'LIVE_TESTNET'
              ? 'LIVE_TESTNET'
              : (t.executionMode || 'RESILIENT_SANDBOX');
            const rawStatus = t.status || (normalizedExecutionMode === 'LIVE_TESTNET' ? 'PENDING' : 'SIMULATED_PASS');
            const normalizedStatus = isVoided
              ? 'VOIDED'
              : (!receiptVerified && rawStatus === 'SETTLED' && normalizedExecutionMode === 'LIVE_TESTNET' ? 'PENDING' : rawStatus);

            return {
              id: t.id,
              agentName: resolvedAgentName,
              serviceName: friendlyServiceName,
              providerName: t.providerName || (providerDataStatus === 'EVALUATION_FIXTURE' ? 'Demo Provider' : 'Configured provider'),
              serviceUrl: ep.startsWith('http') ? ep : `https://api.synapse402.network${ep.startsWith('/') ? '' : '/'}${ep}`,
              amountUsd: t.costPathUsd || 0,
              // Keep the persisted measurement honest; an absent value is
              // unknown, not an invented provider latency.
              latencyMs: Number(t.latencyMs || 0),
              timestamp: t.timestamp ? new Date(t.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString(),
              txHash: normalizedTxHash,
              receiptVerified,
              providerDataStatus,
              // Always derive this link from the verified hash and the one
              // configured explorer host. Persisted/provider-supplied URLs
              // can point at an old network and must not override it.
              explorerUrl: receiptVerified ? tempoTransactionUrl(normalizedTxHash) : undefined,
              executionMode: normalizedExecutionMode,
              paymentMode: normalizedExecutionMode === 'LIVE_TESTNET' ? 'LIVE_TESTNET' : 'DEMO',
              status: normalizedStatus,
              blockNumber: t.blockNumber,
              merkleProof: t.merkleProof,
              merkleRoot: t.merkleRoot,
              tip20Memo: t.tip20Memo,
              iso20022Remittance: t.iso20022Remittance,
              domainHash: t.domainHash,
              nonce2D: t.nonce2D,
              eip712Signature: t.eip712Signature,
              eip712DomainSeparator: t.eip712DomainSeparator,
              eip712StructHash: t.eip712StructHash,
              challengeHeader: t.challengeHeader,
              authAuthorizationHeader: t.authAuthorizationHeader,
              liveProxyPayload: t.liveProxyPayload,
              complianceVerification: t.complianceVerification,
              sanctionsCompliance: t.sanctionsCompliance,
            };
          });
          setLiveEvents(loadedTraces);
        }
      })
      .catch((err) => console.error('Error loading traces:', err));

    // 4. Fetch live network status (block height & real connectivity)
    fetch('/api/network/status')
      .then((r) => r.json())
      .then((status) => {
        if (status && status.status === 'ok') {
          if (status.blockHeight) setBlockHeight(status.blockHeight);
          setNetworkInfo({
            status: status.status,
            networkMode: status.networkMode || 'RESILIENT_SANDBOX',
            networkModeReason: typeof status.networkModeReason === 'string'
              ? status.networkModeReason
              : 'Tempo RPC status is unavailable; evaluation mode may be active.',
            blockHeight: typeof status.blockHeight === 'number' ? status.blockHeight : 0,
            rpcLatencyMs: typeof status.rpcLatencyMs === 'number' ? status.rpcLatencyMs : 0,
            isOnline: true,
            relayerAddress: typeof status.relayerAddress === 'string' ? status.relayerAddress : null,
            vaultAddress: typeof status.vaultAddress === 'string' ? status.vaultAddress : null,
            canSettleLive: status.canSettleLive === true,
            vaultAdminReason: typeof status.vaultAdminReason === 'string'
              ? status.vaultAdminReason
              : 'Vault owner authorization could not be verified.',
          });
        }
      })
      .catch(() => {
        setNetworkInfo((prev) => ({ ...prev, status: 'offline', isOnline: false, relayerAddress: null, canSettleLive: false }));
      });

    // 5. Fetch persisted monetized endpoints
    fetch('/api/endpoints')
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.endpoints) && data.endpoints.length > 0) {
          const loadedEps = data.endpoints.map((ep: any) => ({
            id: ep.id,
            title: ep.title,
            endpointUrl: ep.endpointUrl,
            pricePerCallUsd: ep.pricePerCallUsd,
            category: ep.category,
            totalEarnedUsd: typeof ep.totalEarnedUsd === 'number' ? ep.totalEarnedUsd : 0.00,
            totalCalls: typeof ep.totalCalls === 'number' ? ep.totalCalls : 0,
            integrationSnippet: `import { withTempoMpp } from './sdk';\n\napp.get('${
              ep.endpointUrl.replace(/https?:\/\/[^/]+/, '') || '/'
            }', withTempoMpp({ priceUsd: ${ep.pricePerCallUsd}, payee: '0xYourWallet' }), handler);`,
          }));
          setMonetizedEndpoints(loadedEps);
        }
      })
      .catch(() => {});

    // 6. Fetch connected wallet on-chain balances
    if (walletAddress) {
      fetch(`/api/wallet/balance?address=${walletAddress}`)
        .then((r) => r.json())
        .then((wb) => {
          if (wb && typeof wb.pathUsd === 'number') {
            setWalletBalances(wb);
          }
        })
        .catch(() => {});
    }
  };

  React.useEffect(() => {
    refreshBackendData();
    // Refresh periodically every 4 seconds to keep tabs synchronized in realtime!
    const interval = setInterval(refreshBackendData, 4000);
    return () => clearInterval(interval);
  }, [walletAddress]);

  // Handlers
  const handleDeposit = async (amount: number) => {
    try {
      if (amount === 0) {
        await refreshBackendData();
        return;
      }
      const r = await fetch('/api/vault/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, executionMode: effectiveNetworkMode }),
      });
      const metrics = await r.json();
      if (!r.ok) throw new Error(metrics?.error || 'Deposit failed');
      if (metrics) {
        setUserBalanceUsd(typeof metrics?.totalVaultLiquidity === 'number' ? metrics.totalVaultLiquidity : 0);
      }
      return metrics;
    } catch (err) {
      console.error('Deposit failed', err);
      throw err;
    }
  };

  const handleCreateAgent = (newAgent: AgentAccount) => {
    fetch('/api/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentName: newAgent.name,
        role: newAgent.role,
        maxPerCallPathUsd: newAgent.reusableCapUsd * 0.1, // limit max per call to 10%
        totalBudgetPathUsd: newAgent.reusableCapUsd,
        whitelistedDomains: CANONICAL_PROVIDER_URLS,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.key) {
          const k = data.key;
          const formatted: AgentAccount = {
            id: k.id,
            name: k.agentName,
            role: k.role,
            reusableCapUsd: k.totalBudgetPathUsd,
            cumulativeUsageUsd: k.currentSpentPathUsd,
            status: k.status === 'ACTIVE' ? 'ACTIVE' : 'PAUSED',
            sessionKey: k.sessionPublicKey,
            validBeforeTimestamp: Number(k.validBeforeTimestamp),
            avatarColor: newAgent.avatarColor || 'bg-[#d7ff4f]/20 text-[#d7ff4f]',
            merkleRoot: k.merkleRoot,
            whitelistedDomains: Array.isArray(k.whitelistedDomains) ? k.whitelistedDomains : [],
          };
          setAgents((prev) => [formatted, ...prev]);
          refreshBackendData();
        }
      })
      .catch((err) => console.error('Error creating key:', err));
  };

  const handleToggleAgentStatus = (agentId: string) => {
    fetch(`/api/keys/${agentId}/toggle`, {
      method: 'PATCH',
    })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.key) {
          setAgents((prev) =>
            prev.map((a) => {
              if (a.id === agentId) {
                return { ...a, status: data.key.status === 'ACTIVE' ? 'ACTIVE' : 'PAUSED' };
              }
              return a;
            })
          );
          refreshBackendData();
        }
      })
      .catch((err) => console.error('Error toggling key status:', err));
  };

  const handleAddMonetizedEndpoint = async (ep: {
    title: string;
    endpointUrl: string;
    pricePerCallUsd: number;
    category: string;
  }) => {
    try {
      const response = await fetch('/api/endpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ep),
      });
      if (!response.ok) {
        console.error('Failed to save endpoint:', await response.text());
        return false;
      }
      refreshBackendData();
      return true;
    } catch (e) {
      console.error('Failed to save endpoint:', e);
      return false;
    }
  };

  const handleSimulateDemoPayments = (newEvents: LivePaymentEvent[], totalCost: number) => {
    if (newEvents && newEvents.length > 0) {
      setLiveEvents((prev) => [...newEvents, ...prev]);
    }
    const confirmedCost = (newEvents || [])
      .filter((event) => event.status === 'SETTLED' && event.executionMode === 'LIVE_TESTNET' && event.receiptVerified === true && /^0x[a-fA-F0-9]{64}$/.test(event.txHash || ''))
      .reduce((sum, event) => sum + (event.amountUsd || 0), 0);
    if (confirmedCost > 0) {
      setUserBalanceUsd((prev) => Math.max(0, Number((prev - confirmedCost).toFixed(4))));
    }
    refreshBackendData();
  };

  // The configured treasury wallet is the default live mode. MetaMask is an
  // optional personal wallet connection; evaluation remains available when
  // the backend is offline or explicitly reports sandbox mode.
  const effectiveNetworkMode: 'LIVE_TESTNET' | 'RESILIENT_SANDBOX' =
    executionPreference === 'LIVE_TESTNET'
      && (networkInfo.networkMode === 'LIVE_TESTNET' || networkInfo.status === 'checking')
      ? 'LIVE_TESTNET'
      : 'RESILIENT_SANDBOX';
  const treasuryWalletConnected = networkInfo.isOnline
    && effectiveNetworkMode === 'LIVE_TESTNET'
    && Boolean(networkInfo.relayerAddress);

  return (
    <div id="synapse-root" className="synapse-app min-h-screen bg-[#11161f] text-[#f5f5f2] font-sans selection:bg-[#d7ff4f]/20 selection:text-white">
      <div className="sticky top-0 z-[60] mx-3 mb-2 flex min-h-10 w-[calc(100%-1.5rem)] flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-b-xl border-x border-b-2 border-white/[.10] border-b-emerald-300/65 bg-[#171c22] px-5 py-2.5 text-center font-mono text-[10px] leading-tight text-zinc-300 shadow-[0_4px_18px_rgba(0,0,0,0.24)] sm:mx-5 sm:w-[calc(100%-2.5rem)] sm:text-[11px]">
        <span className="inline-flex items-center gap-1.5 font-black tracking-[.08em] text-[#d7ff4f]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#d7ff4f]" />
          LIVE DEMO
        </span>
        <span className="text-white/20">|</span>
        <span>Real payments on Tempo Testnet</span>
        <span className="text-white/20">|</span>
        <span>Dedicated pre-funded wallet connected</span>
        <span className="text-white/20">|</span>
        <span>External provider responses are simulated</span>
      </div>
      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden w-[270px] shrink-0 border-r border-white/[.08] bg-[#0d1017]/95 px-5 py-6 lg:flex lg:flex-col">
          <div className="mb-10 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#d7ff4f] text-[11px] font-black tracking-[-.08em] text-[#08090c] shadow-sm">402</div>
            <div><div className="text-[14px] font-semibold tracking-[-.04em] text-white">synapse<span className="text-[#d7ff4f]">402</span></div><div className="mt-0.5 text-[9px] uppercase tracking-[.2em] text-zinc-500">economic guardrails for ai</div></div>
          </div>
          <div className="mb-3 px-2 text-[9px] font-semibold uppercase tracking-[.22em] text-zinc-500">Workspace</div>
          <nav className="space-y-2" aria-label="Primary navigation">
            {[
              { id: 'missions', label: 'AI Missions', subtitle: 'Choose a job for the agent', icon: Compass },
              { id: 'demo', label: 'Payment walkthrough', subtitle: 'See how AI payments and safety rules behave', icon: Sparkles },
              { id: 'monetize', label: 'Earn from Providers', subtitle: 'Add a route agents can use', icon: Store },
              { id: 'swarm', label: 'AI Workforce', subtitle: 'The team that does the job', icon: Layers, isEpicenter: true, dot: true },
              { id: 'live', label: 'Payment Receipts', subtitle: 'Check where the money went', icon: Activity },
              { id: 'dashboard', label: 'Spending Controls', subtitle: 'Advanced safety rules', icon: Wallet },
              { id: 'architecture', label: 'How It Works', subtitle: 'See the full payment path', icon: Layers },
            ].map(({ id, label, subtitle, icon: Icon, isEpicenter, dot }) => {
              const isSelected = activeTab === id;

              if (isEpicenter) {
                return (
                  <div key={id} className="py-1 relative z-20">
                    <button
                      id="nav-tab-swarm-epicenter"
                      onClick={(event) => {
                        soundEngine.playClick();
                        setActiveTab(id as any);
                      }}
                      className={`w-[calc(100%+14px)] flex items-center justify-between p-3.5 rounded-2xl transition-all group cursor-pointer border translate-x-2 shadow-xl hover:translate-x-2.5 ${
                        isSelected
                          ? 'bg-[#d7ff4f] text-[#08090c] font-black shadow-[0_0_32px_rgba(215,255,79,0.55)] border-[#d7ff4f] scale-[1.03]'
                          : 'bg-white/[.04] hover:bg-white/[.08] border-white/15 hover:border-[#d7ff4f]/50 text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-black/20 text-[#08090c]' : 'bg-[#d7ff4f] text-[#08090c] shadow-sm'
                        }`}>
                          <Icon className="w-4 h-4 shrink-0 stroke-[2.5]" />
                        </div>
                        <div className="flex flex-col text-left min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-black text-[13.5px] ${isSelected ? 'text-[#08090c]' : 'text-white'}`}>{label}</span>
                          </div>
                          {subtitle && (
                            <span className={`text-[10px] font-mono leading-tight mt-0.5 ${isSelected ? 'text-[#08090c]/80 font-semibold' : 'text-zinc-400'}`}>
                              {subtitle}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  </div>
                );
              }

              return (
                <button
                  key={id}
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveTab(id as any);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-all group cursor-pointer ${
                    isSelected
                      ? 'bg-[#d7ff4f]/10 text-[#d7ff4f] font-bold border border-[#d7ff4f]/30 shadow-[0_0_15px_rgba(215,255,79,0.1)]'
                      : 'text-white/60 hover:text-white hover:bg-white/[.04]'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isSelected ? 'text-[#d7ff4f]' : 'text-white/40 group-hover:text-white/70'}`} />
                    <span className="flex min-w-0 flex-1 flex-col text-left">
                      <span className="truncate">{label}</span>
                      {subtitle && <span className={`block min-w-0 truncate text-[10px] font-mono font-normal ${isSelected ? 'text-[#d7ff4f]/70' : 'text-zinc-400'}`}>· {subtitle}</span>}
                    </span>
                  </span>
                  {dot && (
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d7ff4f]"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer info in sidebar */}
          <div className="mt-auto px-2 py-3 border-t border-white/[.08] text-[10px] text-white/45">
            <span className="inline-flex items-center gap-1.5" title="Network and chain details are available in Wallet details">
              <span className={`w-1.5 h-1.5 rounded-full ${effectiveNetworkMode === 'LIVE_TESTNET' ? 'bg-[#d7ff4f]' : 'bg-amber-300'}`} />
              {effectiveNetworkMode === 'LIVE_TESTNET' ? 'Tempo testnet' : 'Sandbox'}
            </span>
          </div>
        </aside>

        <div className="min-w-0 flex-1 flex flex-col">
          <header className="border-b border-white/[.08] bg-[#0d1017]/95 backdrop-blur-xl shrink-0 relative z-50">
            <div className="flex min-h-[76px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-3 sm:px-8">
              <div className="flex items-center gap-3 lg:hidden">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#d7ff4f] text-[10px] font-black text-[#08090c]">402</div>
                <span className="text-sm font-semibold">synapse<span className="text-[#d7ff4f]">402</span></span>
              </div>
              <div className="hidden min-w-0 flex-[1_1_420px] items-center gap-3.5 lg:flex">
                <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-[#d7ff4f] text-[11px] font-black tracking-[-.08em] text-[#08090c] border border-[#d7ff4f]/30">
                  <span>402</span>
                  <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d7ff4f] border border-[#08090c]"></span>
                  </span>
                </div>
                <div className="min-w-0 max-w-[620px]">
                  <div className="text-[10px] uppercase tracking-[.20em] text-zinc-400 font-mono font-semibold flex items-center gap-1.5">
                    <span className="text-white">Tempo L1</span>
                    <span className="text-white/30">•</span>
                    <span>AI jobs with spending limits</span>
                  </div>
                  <h1 className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[17px] font-semibold tracking-[-.03em]">
                    <span>
                      {activeTab === 'demo'
                        ? 'Payment walkthrough — See how an AI payment works'
                        : activeTab === 'missions'
                        ? 'AI Missions — What jobs can you give to an AI workforce?'
                        : activeTab === 'swarm' && swarmSubView === 'reality'
                        ? 'Reality Check — Traditional Scraping vs Synapse402'
                         : activeTab === 'swarm' && swarmSubView === 'stream'
                         ? 'Payment stream — Watch each approved step'
                        : activeTab === 'swarm' && swarmSubView === 'mcp'
                        ? 'AI Desktop Tools (MCP) — Local agent integration'
                        : activeTab === 'swarm'
                         ? 'AI Workforce — One job split across specialist steps'
                        : activeTab === 'dashboard'
                        ? 'Spending Controls — Advanced safety rules'
                        : activeTab === 'live'
                         ? 'Payment receipts — What was requested and confirmed'
                        : activeTab === 'monetize'
                         ? 'Earn from agents — Let a service charge per request'
                        : 'How Synapse402 Works — From a goal to a finished job'}
                    </span>
                    <span className="hidden basis-full text-xs font-normal text-zinc-400 font-sans xl:block">
                      {activeTab === 'demo'
                         ? (effectiveNetworkMode === 'LIVE_TESTNET' ? '— Live proof of the spending limit on Tempo L1' : '— Evaluation only; no blockchain transaction was submitted')
                        : activeTab === 'architecture'
                         ? '— How people, agents, and providers share one payment flow'
                        : activeTab === 'monetize'
                         ? '— Give an agent a job and pay only for approved steps; let services earn per request'
                        : '— Give an AI worker a job and a budget. It buys approved resources when needed and returns the finished result with payment proof.'}
                    </span>
                  </h1>
                </div>
              </div>
              <div className="ml-auto flex w-full max-w-full flex-wrap items-center justify-end gap-2 lg:w-auto lg:max-w-[740px]">
                <button
                  onClick={startTour}
                  className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    isTourActive
                      ? 'bg-[#d7ff4f] text-[#08090c] border-[#d7ff4f] font-black shadow-[0_0_15px_rgba(215,255,79,0.3)] scale-[1.02]'
                      : 'border-[#d7ff4f]/40 bg-[#d7ff4f]/10 text-[#d7ff4f] hover:bg-[#d7ff4f]/20 hover:border-[#d7ff4f] shadow-[0_0_12px_rgba(215,255,79,0.1)]'
                  }`}
                  title="Open Judge Mode"
                >
                  <Play className={`h-3 w-3 fill-current ${isTourActive ? 'text-[#08090c]' : 'text-[#d7ff4f]'}`} />
                  <span>{isTourActive ? 'Judge Mode Active' : 'Judge Mode'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSdkModalOpen(true)}
                  className="rounded-full border border-white/15 bg-white/[0.04] hover:bg-white/[0.09] hover:border-[#d7ff4f]/50 px-3.5 py-1.5 text-xs font-mono font-bold text-zinc-200 hover:text-[#d7ff4f] transition cursor-pointer flex items-center gap-1.5 shadow-sm shrink-0"
                  title="Open SDK & Integration documentation"
                >
                  <Code2 className="h-3.5 w-3.5 text-[#d7ff4f]" />
                  <span>SDK &amp; Integration</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const latestTrace = liveEvents[0];
                    if (!latestTrace) {
                      setActiveTab('live');
                      return;
                    }
                    setSelectedTraceForInspector(latestTrace);
                    setIsInspectorOpen(true);
                  }}
                  disabled={liveEvents.length === 0}
                  className={`hidden sm:flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-mono font-medium transition shrink-0 ${
                    liveEvents.length > 0
                      ? 'border-white/15 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/30 text-zinc-300 hover:text-white cursor-pointer'
                      : 'border-white/5 bg-white/[0.01] text-zinc-600 cursor-not-allowed opacity-50'
                  }`}
                  title={liveEvents.length > 0 ? 'Audit latest cryptographic receipt' : 'Run a payment first to open receipt'}
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-[#d7ff4f]" />
                  <span>Receipt Audit</span>
                </button>
                {isRealWalletConnected || treasuryWalletConnected ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-mono tracking-wider uppercase ${
                      effectiveNetworkMode === 'LIVE_TESTNET'
                        ? 'border-[#d7ff4f]/30 bg-[#d7ff4f]/10 text-[#d7ff4f]'
                        : networkInfo.isOnline
                          ? 'border-amber-300/30 bg-amber-300/10 text-amber-200'
                          : networkInfo.status === 'checking'
                            ? 'border-white/15 bg-white/[0.04] text-zinc-400'
                            : 'border-red-500/30 bg-red-500/10 text-red-400'
                    } whitespace-nowrap`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        effectiveNetworkMode === 'LIVE_TESTNET'
                          ? 'bg-[#d7ff4f]'
                          : networkInfo.isOnline
                            ? 'bg-amber-300'
                            : networkInfo.status === 'checking' ? 'bg-zinc-400' : 'bg-red-400'
                      }`} />
                      {effectiveNetworkMode === 'LIVE_TESTNET' ? (networkInfo.canSettleLive ? 'TEMPO TESTNET' : 'TESTNET · READ ONLY') : networkInfo.isOnline ? 'SANDBOX' : networkInfo.status === 'checking' ? 'CHECKING' : 'OFFLINE'}
                    </span>
                    {treasuryWalletConnected && (
                      <span className="hidden xl:inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#d7ff4f]/25 bg-[#d7ff4f]/[.06] px-2.5 py-1.5 text-[10px] font-mono font-semibold tracking-wide text-[#d7ff4f] whitespace-nowrap">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#d7ff4f]" />
                        DEDICATED WALLET CONNECTED
                      </span>
                    )}
                    <button 
                      onClick={() => setIsWalletModalOpen(true)} 
                      aria-label="Open wallet details and run mode settings"
                      title="Open Wallet details"
                      className="shrink-0 whitespace-nowrap rounded-lg border border-white/15 bg-white/[.04] px-3.5 py-1.5 text-[11px] font-mono text-zinc-200 transition hover:border-white/30"
                    >
                      {walletAddress
                        ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                        : treasuryWalletConnected
                        ? `${networkInfo.relayerAddress!.slice(0, 6)}...${networkInfo.relayerAddress!.slice(-4)}`
                        : 'Wallet'}
                    </button>
                  </div>
                ) : (
                  <div className="flex shrink-0 items-center gap-2">
                    <a
                      href={effectiveNetworkMode === 'LIVE_TESTNET' && blockHeight > 0 ? `${TEMPO_EXPLORER_URL}/block/${blockHeight}` : undefined}
                      target="_blank"
                      rel="noreferrer"
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-mono font-medium tracking-wider transition hover:brightness-125 ${
                        effectiveNetworkMode === 'LIVE_TESTNET'
                          ? 'border-[#d7ff4f]/30 bg-[#d7ff4f]/[0.08] text-[#d7ff4f] hover:bg-[#d7ff4f]/15'
                          : networkInfo.isOnline
                            ? 'border-amber-300/30 bg-amber-300/10 text-amber-200'
                            : networkInfo.status === 'checking'
                              ? 'border-white/15 bg-white/[0.04] text-zinc-400'
                              : 'border-red-500/30 bg-red-500/10 text-red-400'
                      }`}
                      title={effectiveNetworkMode === 'LIVE_TESTNET' ? `${networkInfo.canSettleLive ? `Tempo L1 Testnet (42431) • Block ${blockHeight} • ${networkInfo.rpcLatencyMs}ms` : networkInfo.vaultAdminReason} (Click to view in Tempo Explorer)` : networkInfo.isOnline ? networkInfo.networkModeReason : 'Backend is offline'}
                    >
                      <span className="relative flex h-2 w-2">
                        {effectiveNetworkMode === 'LIVE_TESTNET' ? (
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#d7ff4f]"></span>
                        ) : (
                          <span className={`relative inline-flex h-2 w-2 rounded-full ${networkInfo.isOnline ? 'bg-amber-300' : networkInfo.status === 'checking' ? 'bg-zinc-400' : 'bg-red-400'}`}></span>
                        )}
                      </span>
                      <span>{effectiveNetworkMode === 'LIVE_TESTNET' ? (networkInfo.canSettleLive ? `TEMPO TESTNET · #${blockHeight}` : 'TEMPO TESTNET · READ ONLY') : networkInfo.isOnline ? 'SANDBOX' : networkInfo.status === 'checking' ? 'CHECKING' : 'OFFLINE'}</span>
                    </a>
                    <button 
                      onClick={() => setIsWalletModalOpen(true)} 
                      disabled={isConnectingWallet} 
                      className="rounded-lg bg-[#d7ff4f] hover:bg-[#cbf540] px-3.5 py-1.5 text-[11px] font-black text-[#08090c] tracking-tight transition cursor-pointer shadow-[0_0_15px_rgba(215,255,79,0.25)] border border-[#d7ff4f]"
                    >
                      Wallet details
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="mobile-scrollbar-hidden flex gap-2 overflow-x-auto border-t border-white/[.06] px-5 py-2.5 lg:hidden">
              {[
                { id: 'missions', label: 'AI Missions' },
                { id: 'demo', label: 'Payment walkthrough' },
                { id: 'monetize', label: 'Earn from Providers' },
                { id: 'swarm', label: 'AI Workforce' },
                { id: 'live', label: 'Receipts' },
                { id: 'dashboard', label: 'Spending Controls' },
                { id: 'architecture', label: 'How It Works' },
              ].map(({ id, label }) => {
                const isSelected = id === 'stream' 
                  ? (activeTab === 'swarm' && swarmSubView === 'stream')
                  : id === 'reality'
                  ? (activeTab === 'swarm' && swarmSubView === 'reality')
                  : id === 'mcp'
                  ? (activeTab === 'swarm' && swarmSubView === 'mcp')
                  : id === 'swarm'
                  ? (activeTab === 'swarm' && swarmSubView === 'swarm')
                  : activeTab === id;

                return (
                  <button 
                    key={id} 
                    onClick={() => {
                      if (id === 'stream') {
                        setActiveTab('swarm');
                        setSwarmSubView('stream');
                      } else if (id === 'reality') {
                        setActiveTab('swarm');
                        setSwarmSubView('reality');
                      } else if (id === 'mcp') {
                        setActiveTab('swarm');
                        setSwarmSubView('mcp');
                      } else if (id === 'swarm') {
                        setActiveTab('swarm');
                        setSwarmSubView('swarm');
                      } else {
                        setActiveTab(id as any);
                      }
                    }} 
                    className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-white font-bold text-[#08090c] border-white shadow-sm' 
                        : 'bg-white/[.04] text-zinc-300 border-white/10 hover:bg-white/[.08] hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </header>
          <main className={`w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto ${isTourActive ? `judge-main-active judge-dock-${tourDockSide}` : ''}`}>
            {isTourActive && (
              <div className="judge-tour-slot">
                <AutoPilotTourBar
                  currentStepIndex={tourStepIndex}
                  isPaused={isTourPaused}
                  onTogglePause={() => setIsTourPaused((paused) => !paused)}
                  onNext={handleNextTourStep}
                  onPrev={handlePrevTourStep}
                  onStop={stopTour}
                  onTriggerAction={runTourAction}
                  onStepSelect={navigateTourStep}
                  executionMode={effectiveNetworkMode}
                  dockSide={tourDockSide}
                  onDockSideChange={setTourDockSide}
                />
              </div>
            )}
            <div className={isTourActive ? 'judge-app-slot' : undefined}>
            {/* Global Telemetry Strip (Hidden on demo, live receipts, missions, and bots & budgets for focused views) */}
            {activeTab !== 'demo' && activeTab !== 'live' && activeTab !== 'missions' && activeTab !== 'dashboard' && activeTab !== 'architecture' && (
              <section className="grid gap-4 sm:grid-cols-3">
                {/* Card 1: Treasury Balance */}
                <div className="rounded-2xl border border-white/[.08] bg-white/[.03] backdrop-blur-md p-4 sm:p-5 flex items-center justify-between shadow-sm">
                  <div>
                    <div className="text-[11px] text-zinc-400 font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                      <span>{isRealWalletConnected || treasuryWalletConnected ? 'Shared balance' : 'Evaluation balance'}</span>
                    </div>
                    <div className="text-2xl font-mono font-bold tracking-tight text-white mt-1">
                      ${Number(userBalanceUsd || 0).toFixed(2)} <span className="text-xs text-zinc-500 font-normal">USD</span>
                    </div>
                    {isRealWalletConnected && walletAddress && (
                      <div className="text-[10px] font-mono text-zinc-400 mt-1 truncate max-w-[160px]">
                        Account: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-[10.5px] font-mono px-2 py-0.5 rounded border border-white/10 text-zinc-400 bg-white/[0.02]">
                      {isRealWalletConnected ? 'MetaMask' : treasuryWalletConnected ? 'Settlement relayer' : 'Evaluation'}
                    </span>
                    {isRealWalletConnected && (
                      <div className="text-[10px] font-mono text-zinc-400 mt-1.5">
                        {formatFeeTokenBalance(walletBalances?.feeTokenBalance)} {walletBalances?.feeTokenSymbol || TEMPO_DEFAULT_FEE_TOKEN_SYMBOL} fee token
                      </div>
                    )}
                  </div>
                </div>

                {/* Card 2: Instant Payments */}
                <div className="rounded-2xl border border-white/[.08] bg-white/[.03] backdrop-blur-md p-4 sm:p-5 flex items-center justify-between shadow-sm">
                  <div>
                    <div className="text-[11px] text-zinc-400 font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d7ff4f]"></span>
                      <span title="Completed live receipts verified on Tempo testnet">Recorded Payments (receipts)</span>
                    </div>
                    <div className="text-2xl font-mono font-bold tracking-tight text-white mt-1" aria-live="polite">
                      {(receiptSummary.confirmedPaymentsCount || vaultMetrics?.totalTransactionsCount || 0).toLocaleString()} <span className="text-xs text-zinc-500 font-normal">confirmed</span>
                    </div>
                    {receiptSummary.evaluationEventsCount > 0 && (
                      <div className="text-[10px] font-mono text-zinc-400 mt-1">
                        +{receiptSummary.evaluationEventsCount} evaluation runs
                      </div>
                    )}
                  </div>
                  <span className="text-[10.5px] font-mono px-2 py-0.5 rounded border border-[#d7ff4f]/20 text-[#d7ff4f] bg-[#d7ff4f]/10 font-medium">
                    {receiptSummary.confirmedPaymentsCount > 0 ? 'Live verified' : 'Ready'}
                  </span>
                </div>

                {/* Card 3: AI Spending Limits */}
                <div className="rounded-2xl border border-white/[.08] bg-white/[.03] backdrop-blur-md p-4 sm:p-5 flex items-center justify-between shadow-sm">
                  <div>
                    <div className="text-[11px] text-zinc-400 font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d7ff4f]"></span>
                      <span title="Optional reusable permissions; a normal mission uses its own one-time maximum">Advanced safety rules</span>
                    </div>
                    <div className="text-2xl font-mono font-bold tracking-tight text-white mt-1">
                      {agents.filter((a) => a.status === 'ACTIVE').length} <span className="text-xs text-zinc-500 font-normal">available</span>
                    </div>
                  </div>
                  <span className="text-[10.5px] font-mono px-2 py-0.5 rounded border border-[#d7ff4f]/20 text-[#d7ff4f] bg-[#d7ff4f]/10 font-medium">
                    Optional controls
                  </span>
                </div>
              </section>
            )}

            {/* Main Interactive Workspace Container */}
            <div className={`rounded-2xl border border-white/[.08] bg-white/[.025] backdrop-blur-md shadow-xl ${activeTab === 'monetize' ? 'p-2 sm:p-3 lg:p-4' : 'p-5 sm:p-6 lg:p-8'}`}>
              <Suspense fallback={(
                <div role="status" aria-live="polite" className="flex min-h-64 items-center justify-center gap-3 text-sm text-zinc-300">
                  <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-[#d7ff4f]/30 border-t-[#d7ff4f]" />
                  <span>Loading selected workspace…</span>
                </div>
              )}>
              {activeTab === 'demo' && <JuryInteractiveDemo currentBlockHeight={blockHeight} vaultTvl={userBalanceUsd} onSimulatePayments={handleSimulateDemoPayments} onNavigateToTab={(tab, sub) => { setActiveTab(tab); if (sub) setSwarmSubView(sub); }} isRealWalletConnected={isRealWalletConnected} networkMode={effectiveNetworkMode} walletAddress={walletAddress} agents={agents} autoRunTrigger={demoAutoRun} />}
              {activeTab === 'missions' && (
                <AgentMissionsView 
                  onMissionSettled={(events, cost) => handleSimulateDemoPayments(events, cost)} 
                  agents={agents} 
                  userBalanceUsd={userBalanceUsd} 
                  executionMode={effectiveNetworkMode}
                  canSettleLive={networkInfo.canSettleLive}
                  vaultAdminReason={networkInfo.vaultAdminReason}
                />
              )}
              {activeTab === 'dashboard' && <DashboardWallet userBalanceUsd={userBalanceUsd} agents={agents} onOpenDeposit={() => setIsDepositOpen(true)} onOpenCreateAgent={() => setIsCreateAgentOpen(true)} onToggleAgentStatus={handleToggleAgentStatus} isRealWalletConnected={isRealWalletConnected} networkMode={effectiveNetworkMode} walletAddress={walletAddress} walletBalances={walletBalances} vaultMetrics={vaultMetrics} onRefresh={refreshBackendData} />}
              {activeTab === 'live' && <LivePaymentsFeed events={liveEvents} summary={receiptSummary} executionMode={effectiveNetworkMode} onInspectEvent={(event) => { setSelectedTraceForInspector(event); setIsInspectorOpen(true); }} onRefresh={refreshBackendData} onNavigateToTab={(tab) => setActiveTab(tab)} />}
              {activeTab === 'monetize' && <ApiMonetizationPortal endpoints={monetizedEndpoints} onAddEndpoint={handleAddMonetizedEndpoint} walletAddress={walletAddress} executionMode={effectiveNetworkMode} />}
              {activeTab === 'swarm' && <MultiAgentSwarmView agents={agents} onSwarmSettled={refreshBackendData} initialSubView={swarmSubView} onSubViewChange={setSwarmSubView} executionMode={effectiveNetworkMode} />}
              {activeTab === 'architecture' && <ProtocolArchitecture />}
              </Suspense>
            </div>
            </div>
          </main>
        </div>
      </div>
      <Suspense fallback={null}>
        <DepositModal
          isOpen={isDepositOpen}
          onClose={() => setIsDepositOpen(false)}
          onDeposit={handleDeposit}
          isRealWalletConnected={isRealWalletConnected}
          walletAddress={walletAddress}
          networkMode={effectiveNetworkMode}
        />
        <CreateAgentModal isOpen={isCreateAgentOpen} onClose={() => setIsCreateAgentOpen(false)} onCreate={handleCreateAgent} />
        <CryptoInspectorModal isOpen={isInspectorOpen} onClose={() => setIsInspectorOpen(false)} traceData={selectedTraceForInspector} />
        <DeveloperSdkModal isOpen={isSdkModalOpen} onClose={() => setIsSdkModalOpen(false)} />
        <WalletConnectionModal
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
          walletAddress={walletAddress}
          isRealWalletConnected={isRealWalletConnected}
          onConnectRealWallet={connectRealWallet}
          onDisconnectToDemo={disconnectToDemo}
          networkName="Tempo Moderato Testnet (42431)"
          networkMode={effectiveNetworkMode}
          relayerAddress={effectiveNetworkMode === 'LIVE_TESTNET' ? networkInfo.relayerAddress : null}
          vaultAddress={networkInfo.vaultAddress}
          walletBalances={walletBalances}
          executionPreference={executionPreference}
          onChangeExecutionPreference={setExecutionPreference}
          liveAvailable={networkInfo.isOnline && networkInfo.networkMode === 'LIVE_TESTNET' && Boolean(networkInfo.relayerAddress)}
        />
      </Suspense>
    </div>
  );
}
