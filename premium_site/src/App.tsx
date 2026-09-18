import React, { useState, useEffect, useRef } from 'react';
import { AgentAccount, LivePaymentEvent, MonetizedApiEndpoint } from './types/synapse402';
import { DashboardWallet } from './components/DashboardWallet';
import { LivePaymentsFeed } from './components/LivePaymentsFeed';
import { ApiMonetizationPortal } from './components/ApiMonetizationPortal';
import { JuryInteractiveDemo } from './components/JuryInteractiveDemo';
import { CreateAgentModal } from './components/CreateAgentModal';
import { DepositModal } from './components/DepositModal';
import { CryptoInspectorModal } from './components/CryptoInspectorModal';
import { DeveloperSdkModal } from './components/DeveloperSdkModal';
import { WalletConnectionModal } from './components/WalletConnectionModal';
import { ProtocolArchitecture } from './components/ProtocolArchitecture';
import { ExecutiveThesisBanner } from './components/ExecutiveThesisBanner';
import { NetworkTelemetryRibbon } from './components/NetworkTelemetryRibbon';
import { MultiAgentSwarmView } from './components/MultiAgentSwarmView';
import { AgentMissionsView } from './components/AgentMissionsView';
import { AutoPilotTourBar, TOUR_STEPS } from './components/AutoPilotTourBar';
import { soundEngine } from './utils/audioEffects';
import { formatTempoGas } from './utils/formatters';
import { InfoBadge } from './components/InfoBadge';
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'live' | 'monetize' | 'demo' | 'missions' | 'architecture' | 'swarm'>('demo');
  const [swarmSubView, setSwarmSubView] = useState<'swarm' | 'stream' | 'mcp' | 'reality'>('swarm');

  const [userBalanceUsd, setUserBalanceUsd] = useState(0);
  const [blockHeight, setBlockHeight] = useState(0);
  const [networkInfo, setNetworkInfo] = useState<{
    status: string;
    networkMode: 'LIVE_TESTNET' | 'RESILIENT_SANDBOX';
    blockHeight: number;
    rpcLatencyMs: number;
    isOnline: boolean;
  }>({
    status: 'checking',
    networkMode: 'RESILIENT_SANDBOX',
    blockHeight: 0,
    rpcLatencyMs: 0,
    isOnline: false,
  });

  const [vaultMetrics, setVaultMetrics] = useState<{
    totalVaultLiquidity: number;
    availableUnreservedLiquidity: number;
    reservedAgentBudgets: number;
    totalVolumeSettledPathUsd: number;
    totalTransactionsCount: number;
    protocolFeeRevenuePathUsd: number;
    blockHeight: number;
  } | null>(null);

  // Web3 Wallet Connection State
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isRealWalletConnected, setIsRealWalletConnected] = useState(false);
  const [walletBalances, setWalletBalances] = useState<{
    address: string;
    pathUsd: number;
    tempo: number;
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
          setWalletAddress(userAddr);
          setIsRealWalletConnected(true);
          fetch(`/api/wallet/balance?address=${userAddr}`)
            .then((r) => r.json())
            .then((wb) => {
              if (wb && typeof wb.pathUsd === 'number') {
                setWalletBalances(wb);
              }
            })
            .catch(() => {});
          try {
            await eth.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xa5bf' }],
            });
          } catch (switchError: any) {
            if (switchError.code === 4902) {
              await eth.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0xa5bf',
                    chainName: 'Tempo Moderato Testnet',
                    nativeCurrency: { name: 'TEMPO', symbol: 'TEMPO', decimals: 18 },
                    rpcUrls: ['https://rpc.moderato.tempo.xyz'],
                    blockExplorerUrls: ['https://explore.tempo.xyz'],
                  },
                ],
              });
            }
          }
        }
      } else {
        if (typeof window !== 'undefined') {
          alert('MetaMask was not detected in your browser.\n\nInstall MetaMask to test live wallet signing, or continue in evaluation mode without a blockchain transaction.');
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
        if (chainIdHex.toLowerCase() !== '0xa5bf') {
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
      dailyLimitUsd: 50.0,
      spentTodayUsd: 0,
      status: 'ACTIVE',
      sessionKey: '',
      avatarColor: 'bg-[#d7ff4f]/20 text-[#d7ff4f]',
    },
    {
      id: 'key_cortex_research',
      name: 'Market Research Bot',
      role: 'Autonomous news analysis & company research reports',
      dailyLimitUsd: 35.0,
      spentTodayUsd: 0,
      status: 'ACTIVE',
      sessionKey: '',
      avatarColor: 'bg-white/10 text-white',
    },
    {
      id: 'key_sec_audit',
      name: 'Code Security Bot',
      role: 'Code vulnerability scanning in safe cloud sandboxes',
      dailyLimitUsd: 25.0,
      spentTodayUsd: 0,
      status: 'ACTIVE',
      sessionKey: '',
      avatarColor: 'bg-[#d7ff4f]/20 text-[#d7ff4f]',
    },
    {
      id: 'key_vision_craft',
      name: 'Image Processing Bot',
      role: 'On-demand image processing & visual object analysis',
      dailyLimitUsd: 20.0,
      spentTodayUsd: 0,
      status: 'ACTIVE',
      sessionKey: '',
      avatarColor: 'bg-white/10 text-white',
    },
    {
      id: 'key_chronicle_news',
      name: 'Article Reader Bot',
      role: 'Pay-per-article news digest without recurring subscriptions',
      dailyLimitUsd: 15.0,
      spentTodayUsd: 0,
      status: 'ACTIVE',
      sessionKey: '',
      avatarColor: 'bg-[#d7ff4f]/20 text-[#d7ff4f]',
    },
    {
      id: 'key_polyglot_translator',
      name: 'Document Translator Bot',
      role: 'Pay-per-page technical document translation',
      dailyLimitUsd: 25.0,
      spentTodayUsd: 0,
      status: 'ACTIVE',
      sessionKey: '',
      avatarColor: 'bg-white/10 text-white',
    },
  ]);

  // 2. Live Payments Feed State (Populated dynamically from backend traces & live payments)
  const [liveEvents, setLiveEvents] = useState<LivePaymentEvent[]>([]);

  // 3. Monetized API Endpoints
  const [monetizedEndpoints, setMonetizedEndpoints] = useState<MonetizedApiEndpoint[]>([
    {
      id: 'ep_deepseek',
      title: 'Example LLM Inference Service',
      endpointUrl: 'https://api.deepseek.com/v1/chat/completions',
      pricePerCallUsd: 0.0008,
      category: 'AI / LLM Inferences',
      totalEarnedUsd: 0,
      totalCalls: 0,
      integrationSnippet: `import { withTempoMpp } from './sdk';\n\n// Pay-per-token LLM inference on Tempo L1 with zero retainers\napp.post('/v1/chat/completions', withTempoMpp({ priceUsd: 0.0008, payee: '0xYourWallet' }), handler);`,
    },
    {
      id: 'ep_scraper_paywall',
      title: 'Example licensed article access',
      endpointUrl: 'https://news-provider.media/api/scrape/clean-markdown',
      pricePerCallUsd: 0.001,
      category: 'Web Data & Scraping',
      totalEarnedUsd: 0,
      totalCalls: 0,
      integrationSnippet: `import { withTempoMpp } from './sdk';\n\n// Turn bot crawler traffic into instant revenue instead of empty 403 blocks\napp.get('/api/scrape/*', withTempoMpp({ priceUsd: 0.001, payee: '0xYourWallet' }), (req, res) => {\n  res.json({ title: 'Unblocked Clean Content', format: 'markdown', costUsd: 0.001 });\n});`,
    },
    {
      id: 'ep_1',
      title: 'Example document translation service',
      endpointUrl: 'https://api.translate-provider.io/v2/document/instant',
      pricePerCallUsd: 0.001,
      category: 'Language AI',
      totalEarnedUsd: 0,
      totalCalls: 0,
      integrationSnippet: `import { withTempoMpp } from './sdk';\n\napp.post('/v2/document/instant', withTempoMpp({ priceUsd: 0.001, payee: '0xYourWallet' }), handler);`,
    },
    {
      id: 'ep_2',
      title: 'Example image processing service',
      endpointUrl: 'https://api.vision-neural.ai/v1/remove-bg',
      pricePerCallUsd: 0.002,
      category: 'Computer Vision',
      totalEarnedUsd: 0,
      totalCalls: 0,
      integrationSnippet: `import { withTempoMpp } from './sdk';\n\napp.post('/v1/remove-bg', withTempoMpp({ priceUsd: 0.002, payee: '0xYourWallet' }), handler);`,
    },
    {
      id: 'ep_3',
      title: 'Example media access service',
      endpointUrl: 'https://api.news-dispatch.net/v1/article/unlock',
      pricePerCallUsd: 0.001,
      category: 'Publishing / Media',
      totalEarnedUsd: 0,
      totalCalls: 0,
      integrationSnippet: `import { withTempoMpp } from './sdk';\n\napp.get('/v1/article/unlock', withTempoMpp({ priceUsd: 0.001, payee: '0xYourWallet' }), handler);`,
    },
    {
      id: 'ep_4',
      title: 'Example Python sandbox service',
      endpointUrl: 'https://api.sandbox-python.dev/v1/containers/exec',
      pricePerCallUsd: 0.005,
      category: 'Code Execution',
      totalEarnedUsd: 0,
      totalCalls: 0,
      integrationSnippet: `import { withTempoMpp } from './sdk';\n\napp.post('/v1/containers/exec', withTempoMpp({ priceUsd: 0.005, payee: '0xYourWallet' }), handler);`,
    },
    {
      id: 'ep_5',
      title: 'Example structured web extraction service',
      endpointUrl: 'https://api.stealth-crawler.net/v1/scrape',
      pricePerCallUsd: 0.003,
      category: 'Web Data & Scraping',
      totalEarnedUsd: 0,
      totalCalls: 0,
      integrationSnippet: `import { withTempoMpp } from './sdk';\n\napp.post('/v1/scrape', withTempoMpp({ priceUsd: 0.003, payee: '0xYourWallet' }), handler);`,
    },
    {
      id: 'ep_6',
      title: 'Example voice synthesis service',
      endpointUrl: 'https://api.voice-neural.io/v1/synthesize',
      pricePerCallUsd: 0.004,
      category: 'Voice & Speech',
      totalEarnedUsd: 0,
      totalCalls: 0,
      integrationSnippet: `import { withTempoMpp } from './sdk';\n\napp.post('/v1/synthesize', withTempoMpp({ priceUsd: 0.004, payee: '0xYourWallet' }), handler);`,
    },
    {
      id: 'ep_7',
      title: 'Example travel availability feed',
      endpointUrl: 'https://api.gds-flights.network/v1/fares',
      pricePerCallUsd: 0.002,
      category: 'Travel / GDS Data',
      totalEarnedUsd: 0,
      totalCalls: 0,
      integrationSnippet: `import { withTempoMpp } from './sdk';\n\napp.get('/v1/fares', withTempoMpp({ priceUsd: 0.002, payee: '0xYourWallet' }), handler);`,
    },
    {
      id: 'ep_8',
      title: 'Example identity risk check',
      endpointUrl: 'https://api.identity-risk.shield/v1/verify',
      pricePerCallUsd: 0.005,
      category: 'Compliance & KYC',
      totalEarnedUsd: 0,
      totalCalls: 0,
      integrationSnippet: `import { withTempoMpp } from './sdk';\n\napp.post('/v1/verify', withTempoMpp({ priceUsd: 0.005, payee: '0xYourWallet' }), handler);`,
    },
  ]);

  // Modals
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isCreateAgentOpen, setIsCreateAgentOpen] = useState(false);

  // Auto-Pilot Guided Tour State
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const [demoAutoRun, setDemoAutoRun] = useState<{
    id: number;
    preset: 'deepseek' | 'vision' | 'article' | 'translate' | 'sec' | 'scrape' | 'voice' | 'flight' | 'kyc' | 'aapl' | 'crypto' | 'custom';
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

  const runTourAction = () => {
    soundEngine.playClick();
    if (tourStepIndex === 0) {
      setActiveTab('demo');
      setDemoAutoRun({
        id: Date.now(),
        preset: 'deepseek',
        fault: 'none',
        url: 'https://api.deepseek.com/v1/chat/completions',
        cost: 0.0008,
        category: 'DeepSeek LLM Inference',
      });
    } else if (tourStepIndex === 1) {
      setActiveTab('demo');
      setDemoAutoRun({
        id: Date.now(),
        preset: 'custom',
        fault: 'non_whitelist',
        url: 'https://api.rogue-drainer.xyz/v1/exploit',
        cost: 0.05,
        category: 'Malicious Probe',
      });
    } else if (tourStepIndex === 2) {
      setActiveTab('demo');
      setDemoAutoRun({
        id: Date.now(),
        preset: 'custom',
        fault: 'server_500',
        url: 'https://api.unreliable-upstream.internal/v1/generate',
        cost: 0.002,
        category: 'Upstream SLA Void Test',
      });
    } else if (tourStepIndex === 3) {
      setActiveTab('live');
      setSelectedTraceForInspector(liveEvents[0] || null);
      setIsInspectorOpen(true);
    } else if (tourStepIndex === 4) {
      setActiveTab('dashboard');
      setIsCreateAgentOpen(true);
    } else if (tourStepIndex === 5) {
      setActiveTab('monetize');
      setTimeout(() => {
        const testBtn = document.getElementById('btn-test-paywall-ep-1') || document.querySelector('[id^="btn-test-paywall-"]');
        if (testBtn) (testBtn as HTMLButtonElement).click();
      }, 100);
    } else if (tourStepIndex === 6) {
      setActiveTab('swarm');
      setSwarmSubView('swarm');
      setTimeout(() => {
        const swarmBtn = document.getElementById('btn-execute-swarm-batch');
        if (swarmBtn) (swarmBtn as HTMLButtonElement).click();
      }, 100);
    } else if (tourStepIndex === 7) {
      setActiveTab('architecture');
      setTimeout(() => {
        const archBtn = document.getElementById('btn-inspect-deployment');
        if (archBtn) (archBtn as HTMLButtonElement).click();
      }, 100);
    }
  };

  const startTour = () => {
    soundEngine.playClick();
    setIsTourActive(true);
    navigateTourStep(0);
  };

  const stopTour = () => {
    soundEngine.playClick();
    setIsTourActive(false);
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
            dailyLimitUsd: k.totalBudgetPathUsd,
            spentTodayUsd: k.currentSpentPathUsd,
            status: k.status === 'ACTIVE' ? 'ACTIVE' : 'PAUSED',
            sessionKey: k.sessionPublicKey,
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

    // 3. Fetch traces
    fetch('/api/mpp/traces')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.traces) {
          const loadedTraces = data.traces.map((t: any) => {
            const rawEp = t.targetEndpoint || t.targetUrl || '';
            const ep = rawEp
              .replace(/^https?:\/\/127\.0\.0\.1(:\d+)?/i, 'https://api.synapse402.network')
              .replace(/^https?:\/\/localhost(:\d+)?/i, 'https://api.synapse402.network');
            
            const isVoided = t.status === 'VOIDED' || t.status === 'REFUNDED' || (t.costPathUsd === 0 && (String(t.memoPayload || '').startsWith('SLA_REFUND') || rawEp.includes('500') || rawEp.includes('mock')));
            const voidSuffix = isVoided ? ' (Payment Voided)' : '';

            // Clean service name resolution
            let friendlyServiceName = '';
            if (t.serviceName && !t.serviceName.startsWith('MPP:') && !t.serviceName.startsWith('SLA_REFUND:') && !t.serviceName.startsWith('pacs.008')) {
              friendlyServiceName = t.serviceName;
            } else if (ep.includes('corporate-registry')) {
              friendlyServiceName = 'Entity Knowledge Graph API';
            } else if (ep.includes('sec-filings') || ep.includes('sec.gov') || ep.includes('10k') || ep.includes('sec-data-mirror')) {
              friendlyServiceName = 'Audited Financial Statements (10-K)';
            } else if (ep.includes('beneficial-ownership')) {
              friendlyServiceName = 'Corporate Ownership Graph API';
            } else if (ep.includes('credit-rating')) {
              friendlyServiceName = 'Commercial Risk & Solvency API';
            } else if (ep.includes('court-dockets')) {
              friendlyServiceName = 'Legal Compliance & Liens DB';
            } else if (ep.includes('sanctions-check') || ep.includes('sanctions') || ep.includes('compliance') || ep.includes('identity')) {
              friendlyServiceName = 'Global Sanctions & KYC Registry';
            } else if (ep.includes('adverse-media')) {
              friendlyServiceName = 'Global News & Media Wire';
            } else if (ep.includes('clearance-dossier')) {
              friendlyServiceName = 'Apex Due Diligence Clearance Gateway';
            } else if (ep.includes('tiktok-trends')) {
              friendlyServiceName = 'TikTok Viral Trend Signal API';
            } else if (ep.includes('x-trends')) {
              friendlyServiceName = 'X / Twitter Real-Time Sentiment Feed';
            } else if (ep.includes('competitor-ads')) {
              friendlyServiceName = 'Ad Intelligence & Benchmark DB';
            } else if (ep.includes('flux-render')) {
              friendlyServiceName = 'Flux Neural Concept & Layout Generator';
            } else if (ep.includes('music-beats')) {
              friendlyServiceName = 'Licensed Dynamic Audio Track API';
            } else if (ep.includes('deepseek')) {
              friendlyServiceName = 'DeepSeek R1 Reasoning Inference';
            } else if (ep.includes('academic') || ep.includes('semanticscholar')) {
              friendlyServiceName = 'Licensed Research Paper (Nature Physics)';
            } else if (ep.includes('translate') || ep.includes('deepl')) {
              friendlyServiceName = 'DeepL Translation Engine';
            } else if (ep.includes('vision') || ep.includes('remove-bg') || ep.includes('upscale')) {
              friendlyServiceName = 'Alpha Matte & Image Optimization';
            } else if (ep.includes('news') || ep.includes('article') || ep.includes('reuters')) {
              friendlyServiceName = 'Decentralized Media Micro-License';
            } else if (ep.includes('sandbox') || ep.includes('containers') || ep.includes('python-sandbox')) {
              friendlyServiceName = 'Isolated Python Cloud Sandbox';
            } else if (ep.includes('scrape') || ep.includes('stealth')) {
              friendlyServiceName = 'Residential Stealth Scraper';
            } else if (ep.includes('voice') || ep.includes('synthesize')) {
              friendlyServiceName = 'Studio Neural Voiceover Engine';
            } else if (ep.includes('flight') || ep.includes('gds') || ep.includes('fares')) {
              friendlyServiceName = 'Amadeus Flight GDS Cache';
            } else if (ep.includes('binance') || ep.includes('orderbook') || ep.includes('fin-depth') || ep.includes('stock-orderbook')) {
              friendlyServiceName = 'Market Depth (Orderbook Data)';
            } else if (ep.includes('crypto-skew')) {
              friendlyServiceName = 'Crypto Skew Macro Feed';
            } else {
              friendlyServiceName = 'HTTP 402 Monetized Resource';
            }

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

            return {
              id: t.id,
              agentName: resolvedAgentName,
              serviceName: friendlyServiceName,
              serviceUrl: ep.startsWith('http') ? ep : `https://api.synapse402.network${ep.startsWith('/') ? '' : '/'}${ep}`,
              amountUsd: t.costPathUsd || 0,
              latencyMs: t.latencyMs || 80,
              timestamp: t.timestamp ? new Date(t.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString(),
            txHash: t.txHash || '',
              executionMode: t.executionMode || 'RESILIENT_SANDBOX',
              status: isVoided ? 'VOIDED' : (t.status || (t.executionMode === 'LIVE_TESTNET' ? 'SETTLED' : 'SIMULATED_PASS')),
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
            blockHeight: typeof status.blockHeight === 'number' ? status.blockHeight : 0,
            rpcLatencyMs: typeof status.rpcLatencyMs === 'number' ? status.rpcLatencyMs : 0,
            isOnline: true,
          });
        }
      })
      .catch(() => {
        setNetworkInfo((prev) => ({ ...prev, status: 'offline', isOnline: false }));
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
      const r = await fetch('/api/vault/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const metrics = await r.json();
      if (metrics) {
        setUserBalanceUsd(typeof metrics?.totalVaultLiquidity === 'number' ? metrics.totalVaultLiquidity : 0);
      }
    } catch (err) {
      console.error('Deposit failed', err);
    }
  };

  const handleCreateAgent = (newAgent: AgentAccount) => {
    fetch('/api/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentName: newAgent.name,
        role: newAgent.role,
        maxPerCallPathUsd: newAgent.dailyLimitUsd * 0.1, // limit max per call to 10%
        totalBudgetPathUsd: newAgent.dailyLimitUsd,
        whitelistedDomains: [
          'https://api.deepseek.com/v1/chat/completions',
          'https://news-provider.media/api/scrape/clean-markdown',
          'https://api.translate-provider.io/v2/document/instant',
          'https://api.vision-neural.ai/v1/remove-bg',
          'https://api.news-dispatch.net/v1/article/unlock',
          'https://api.sandbox-python.dev/v1/containers/exec',
          'https://api.stealth-crawler.net/v1/scrape',
          'https://api.voice-neural.io/v1/synthesize',
          'https://api.gds-flights.network/v1/fares',
          'https://api.identity-risk.shield/v1/verify',
          'https://api.binance.com/api/v3/depth',
          'https://data.sec.gov/api/xbrl/companyfacts',
        ],
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
            dailyLimitUsd: k.totalBudgetPathUsd,
            spentTodayUsd: k.currentSpentPathUsd,
            status: k.status === 'ACTIVE' ? 'ACTIVE' : 'PAUSED',
            sessionKey: k.sessionPublicKey,
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
      await fetch('/api/endpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ep),
      });
      refreshBackendData();
    } catch (e) {
      console.error('Failed to save endpoint:', e);
    }
  };

  const handleSimulateDemoPayments = (newEvents: LivePaymentEvent[], totalCost: number) => {
    if (newEvents && newEvents.length > 0) {
      setLiveEvents((prev) => [...newEvents, ...prev]);
    }
    const confirmedCost = (newEvents || [])
      .filter((event) => event.status === 'SETTLED' && event.executionMode === 'LIVE_TESTNET' && Boolean(event.txHash))
      .reduce((sum, event) => sum + (event.amountUsd || 0), 0);
    if (confirmedCost > 0) {
      setUserBalanceUsd((prev) => Math.max(0, Number((prev - confirmedCost).toFixed(4))));
    }
    refreshBackendData();
  };

  return (
    <div id="synapse-root" className="synapse-app min-h-screen bg-[#11161f] text-[#f5f5f2] font-sans selection:bg-[#d7ff4f]/20 selection:text-white">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-40 [background-image:radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.03),transparent_70%)]" />
      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden w-[270px] shrink-0 border-r border-white/[.08] bg-[#0d1017]/95 px-5 py-6 lg:flex lg:flex-col">
          <div className="mb-10 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#d7ff4f] text-[11px] font-black tracking-[-.08em] text-[#08090c] shadow-sm">402</div>
            <div><div className="text-[14px] font-semibold tracking-[-.04em] text-white">synapse<span className="text-[#d7ff4f]">402</span></div><div className="mt-0.5 text-[9px] uppercase tracking-[.2em] text-zinc-500">payment operating system</div></div>
          </div>
          <div className="mb-3 px-2 text-[9px] font-semibold uppercase tracking-[.22em] text-zinc-500">Workspace</div>
          <nav className="space-y-2" aria-label="Primary navigation">
            {[
              { id: 'demo', label: 'Payment walkthrough', subtitle: 'See one job from start to finish', icon: Sparkles },
              { id: 'missions', label: 'AI Missions', subtitle: 'Choose a job for the agent', icon: Compass },
              { id: 'dashboard', label: 'Bots & Budgets', subtitle: 'Set limits for your agents', icon: Wallet },
              { id: 'swarm', label: 'AI Workforce', subtitle: 'The team that does the job', icon: Layers, isEpicenter: true, dot: true },
              { id: 'monetize', label: 'Earn from Bots', subtitle: 'Add a service agents can use', icon: Store },
              { id: 'live', label: 'Payment Receipts', subtitle: 'Check where the money went', icon: Activity },
              { id: 'architecture', label: 'How It Works', subtitle: 'See the full payment path', icon: Layers },
            ].map(({ id, label, subtitle, icon: Icon, isEpicenter, dot }) => {
              const isSelected = activeTab === id;

              if (isEpicenter) {
                return (
                  <div key={id} className="py-1 relative z-20">
                    <button
                      id="nav-tab-swarm-epicenter"
                      onClick={() => {
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
                            <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-md font-black tracking-wider ${
                              isSelected ? 'bg-black text-[#d7ff4f]' : 'bg-[#d7ff4f] text-[#08090c]'
                            }`}>
                              CORE
                            </span>
                          </div>
                          {subtitle && (
                            <span className={`text-[10px] font-mono leading-tight mt-0.5 ${isSelected ? 'text-[#08090c]/80 font-semibold' : 'text-zinc-400'}`}>
                              {subtitle}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="relative flex h-2 w-2 shrink-0 ml-2">
                        {!isSelected && <span className="absolute inline-flex h-full w-full rounded-full bg-[#d7ff4f] opacity-60 animate-ping" />}
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${isSelected ? 'bg-[#08090c]' : 'bg-[#d7ff4f]'}`}></span>
                      </span>
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
                    <span className="flex flex-col text-left truncate">
                      <span>{label}</span>
                      {subtitle && <span className={`text-[10px] font-mono font-normal ${isSelected ? 'text-[#d7ff4f]/70' : 'text-zinc-400'}`}>· {subtitle}</span>}
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
          <div className="mt-auto p-4 border-t border-white/[.08] space-y-3 bg-white/[.01] rounded-2xl">
            <div className="flex items-center justify-between text-[11px] text-white/50">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Tempo Moderato
              </span>
              <span className="font-mono text-[10px] text-white/40">Chain 42431</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-white/50">
              <span>Account Balance</span>
              <span className="font-mono text-white font-semibold">${Number(userBalanceUsd || 0).toFixed(2)}</span>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 flex flex-col">
          <header className="border-b border-white/[.08] bg-[#0d1017]/90 backdrop-blur-xl shrink-0 relative">
            <div className="flex h-[76px] items-center justify-between gap-4 px-5 sm:px-8">
              <div className="flex items-center gap-3 lg:hidden">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#d7ff4f] text-[10px] font-black text-[#08090c]">402</div>
                <span className="text-sm font-semibold">synapse<span className="text-[#d7ff4f]">402</span></span>
              </div>
              <div className="hidden lg:flex items-center gap-3.5">
                <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-[#d7ff4f] text-[11px] font-black tracking-[-.08em] text-[#08090c] border border-[#d7ff4f]/30">
                  <span>402</span>
                  <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d7ff4f] border border-[#08090c]"></span>
                  </span>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[.20em] text-zinc-400 font-mono font-semibold flex items-center gap-1.5">
                    <span className="text-white">Tempo L1</span>
                    <span className="text-white/30">•</span>
                    <span>AI jobs with spending limits</span>
                  </div>
                  <h1 className="mt-0.5 text-[17px] font-semibold tracking-[-.03em] flex items-center gap-2">
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
                        ? 'Bots & Budgets — Set limits for your agents'
                        : activeTab === 'live'
                         ? 'Payment receipts — What was requested and confirmed'
                        : activeTab === 'monetize'
                         ? 'Earn from agents — Let a service charge per request'
                        : 'How Synapse402 Works — From a goal to a finished job'}
                    </span>
                    <span className="text-xs text-zinc-400 font-normal font-sans hidden xl:inline">
                      {activeTab === 'demo'
                         ? (networkInfo.networkMode === 'LIVE_TESTNET' ? '— Live proof of the spending limit on Tempo L1' : '— Evaluation only; no blockchain transaction was submitted')
                        : activeTab === 'architecture'
                         ? '— How people, agents, and providers share one payment flow'
                         : '— Give an agent a job and pay only for approved steps'}
                    </span>
                  </h1>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={startTour}
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    isTourActive
                      ? 'bg-[#d7ff4f] text-[#08090c] border-[#d7ff4f] font-black shadow-[0_0_15px_rgba(215,255,79,0.3)] scale-[1.02]'
                      : 'border-[#d7ff4f]/40 bg-[#d7ff4f]/10 text-[#d7ff4f] hover:bg-[#d7ff4f]/20 hover:border-[#d7ff4f] shadow-[0_0_12px_rgba(215,255,79,0.1)]'
                  }`}
                  title="Run 15-Second Guided Auto-Pilot Tour"
                >
                  <Play className={`h-3 w-3 fill-current ${isTourActive ? 'text-[#08090c]' : 'text-[#d7ff4f]'}`} />
                  <span>{isTourActive ? 'Tour Active' : 'Auto-Pilot Tour'}</span>
                </button>
                <button 
                  onClick={() => setIsSdkModalOpen(true)} 
                  className="hidden rounded-full border border-[#d7ff4f]/30 bg-[#d7ff4f]/[0.06] hover:bg-[#d7ff4f]/15 hover:border-[#d7ff4f]/60 px-4 py-2 text-[11px] font-bold text-white hover:text-[#d7ff4f] transition items-center sm:flex shadow-[0_0_10px_rgba(215,255,79,0.06)]"
                >
                  <Code2 className="mr-2 h-3.5 w-3.5 text-[#d7ff4f]" />SDK
                </button>
                <button 
                  onClick={() => { setSelectedTraceForInspector(liveEvents[0] || null); setIsInspectorOpen(true); }} 
                  className="hidden rounded-full border border-[#d7ff4f]/30 bg-[#d7ff4f]/[0.06] hover:bg-[#d7ff4f]/15 hover:border-[#d7ff4f]/60 px-4 py-2 text-[11px] font-bold text-white hover:text-[#d7ff4f] transition items-center md:flex shadow-[0_0_10px_rgba(215,255,79,0.06)]"
                >
                  <ShieldCheck className="mr-2 h-3.5 w-3.5 text-[#d7ff4f]" />Audit
                </button>
                {isRealWalletConnected ? (
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-mono tracking-wider uppercase ${
                      networkInfo.isOnline && networkInfo.networkMode === 'LIVE_TESTNET'
                        ? 'border-[#d7ff4f]/30 bg-[#d7ff4f]/10 text-[#d7ff4f]'
                        : networkInfo.isOnline
                          ? 'border-amber-300/30 bg-amber-300/10 text-amber-200'
                          : networkInfo.status === 'checking'
                            ? 'border-white/15 bg-white/[0.04] text-zinc-400'
                            : 'border-red-500/30 bg-red-500/10 text-red-400'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        networkInfo.isOnline && networkInfo.networkMode === 'LIVE_TESTNET'
                          ? 'bg-[#d7ff4f]'
                          : networkInfo.isOnline
                            ? 'bg-amber-300'
                            : networkInfo.status === 'checking' ? 'bg-zinc-400' : 'bg-red-400'
                      }`} />
                      {networkInfo.isOnline && networkInfo.networkMode === 'LIVE_TESTNET' ? 'TEMPO LIVE' : networkInfo.isOnline ? 'SANDBOX' : networkInfo.status === 'checking' ? 'CHECKING' : 'OFFLINE'}
                    </span>
                    <button 
                      onClick={() => setIsWalletModalOpen(true)} 
                      className="rounded-lg border border-white/15 bg-white/[.04] px-3.5 py-1.5 text-[11px] font-mono text-zinc-200 transition hover:border-white/30"
                    >
                      {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Wallet'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <a
                      href={networkInfo.networkMode === 'LIVE_TESTNET' && blockHeight > 0 ? `https://explore.tempo.xyz/block/${blockHeight}` : undefined}
                      target="_blank"
                      rel="noreferrer"
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-mono font-medium tracking-wider transition hover:brightness-125 ${
                        networkInfo.isOnline && networkInfo.networkMode === 'LIVE_TESTNET'
                          ? 'border-[#d7ff4f]/30 bg-[#d7ff4f]/[0.08] text-[#d7ff4f] hover:bg-[#d7ff4f]/15'
                          : networkInfo.isOnline
                            ? 'border-amber-300/30 bg-amber-300/10 text-amber-200'
                            : networkInfo.status === 'checking'
                              ? 'border-white/15 bg-white/[0.04] text-zinc-400'
                              : 'border-red-500/30 bg-red-500/10 text-red-400'
                      }`}
                      title={networkInfo.isOnline && networkInfo.networkMode === 'LIVE_TESTNET' ? `Tempo L1 Testnet (42431) • Block ${blockHeight} • ${networkInfo.rpcLatencyMs}ms (Click to view in Tempo Explorer)` : networkInfo.isOnline ? 'Connected to the fallback network; no live blockchain write is active.' : 'Backend is offline'}
                    >
                      <span className="relative flex h-2 w-2">
                        {networkInfo.isOnline && networkInfo.networkMode === 'LIVE_TESTNET' ? (
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#d7ff4f]"></span>
                        ) : (
                          <span className={`relative inline-flex h-2 w-2 rounded-full ${networkInfo.isOnline ? 'bg-amber-300' : networkInfo.status === 'checking' ? 'bg-zinc-400' : 'bg-red-400'}`}></span>
                        )}
                      </span>
                      <span>{networkInfo.isOnline && networkInfo.networkMode === 'LIVE_TESTNET' ? `TEMPO BLOCK #${blockHeight}` : networkInfo.isOnline ? 'SANDBOX' : networkInfo.status === 'checking' ? 'CHECKING' : 'OFFLINE'}</span>
                    </a>
                    <button 
                      onClick={() => setIsWalletModalOpen(true)} 
                      disabled={isConnectingWallet} 
                      className="rounded-lg bg-[#d7ff4f] hover:bg-[#cbf540] px-3.5 py-1.5 text-[11px] font-black text-[#08090c] tracking-tight transition cursor-pointer shadow-[0_0_15px_rgba(215,255,79,0.25)] border border-[#d7ff4f]"
                    >
                      {isConnectingWallet ? 'Connecting...' : 'Connect Wallet'}
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto border-t border-white/[.06] px-5 py-2.5 lg:hidden">
              {[
                { id: 'demo', label: 'Payment walkthrough' },
                { id: 'swarm', label: 'AI Workforce' },
                { id: 'monetize', label: 'Earn from Bots' },
                { id: 'dashboard', label: 'Bots & Budgets' },
                { id: 'live', label: 'Receipts' },
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
          <main className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto">
            {isTourActive && (
              <AutoPilotTourBar
                currentStepIndex={tourStepIndex}
                isPaused={false}
                onTogglePause={() => {}}
                onNext={handleNextTourStep}
                onPrev={handlePrevTourStep}
                onStop={stopTour}
                onTriggerAction={runTourAction}
                onStepSelect={navigateTourStep}
              />
            )}
            {/* Global Telemetry Strip (Hidden on demo, live receipts, missions, and bots & budgets for focused views) */}
            {activeTab !== 'demo' && activeTab !== 'live' && activeTab !== 'missions' && activeTab !== 'dashboard' && activeTab !== 'architecture' && (
              <section className="grid gap-4 sm:grid-cols-3">
                {/* Card 1: Treasury Balance */}
                <div className="rounded-2xl border border-white/[.08] bg-white/[.03] backdrop-blur-md p-4 sm:p-5 flex items-center justify-between shadow-sm">
                  <div>
                    <div className="text-[11px] text-zinc-400 font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                      <span>{isRealWalletConnected ? 'Treasury Pool' : 'Evaluation balance'}</span>
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
                      {isRealWalletConnected ? 'MetaMask' : 'Tempo Testnet'}
                    </span>
                    {isRealWalletConnected && (
                      <div className="text-[10px] font-mono text-zinc-400 mt-1.5">
                        {formatTempoGas(walletBalances?.tempo)} TEMPO Gas
                      </div>
                    )}
                  </div>
                </div>

                {/* Card 2: Instant Payments */}
                <div className="rounded-2xl border border-white/[.08] bg-white/[.03] backdrop-blur-md p-4 sm:p-5 flex items-center justify-between shadow-sm">
                  <div>
                    <div className="text-[11px] text-zinc-400 font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d7ff4f]"></span>
                      <span>Recorded Payments</span>
                    </div>
                    <div className="text-2xl font-mono font-bold tracking-tight text-white mt-1">
                      {(vaultMetrics?.totalTransactionsCount || 0).toLocaleString()} <span className="text-xs text-zinc-500 font-normal">{networkInfo.networkMode === 'LIVE_TESTNET' ? 'confirmed' : 'planned'}</span>
                    </div>
                  </div>
                  <span className="text-[10.5px] font-mono px-2 py-0.5 rounded border border-[#d7ff4f]/20 text-[#d7ff4f] bg-[#d7ff4f]/10 font-medium">
                    {networkInfo.networkMode === 'LIVE_TESTNET' && vaultMetrics?.totalTransactionsCount ? 'Live activity' : 'Evaluation data'}
                  </span>
                </div>

                {/* Card 3: AI Spending Limits */}
                <div className="rounded-2xl border border-white/[.08] bg-white/[.03] backdrop-blur-md p-4 sm:p-5 flex items-center justify-between shadow-sm">
                  <div>
                    <div className="text-[11px] text-zinc-400 font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d7ff4f]"></span>
                      <span>Configured session keys</span>
                    </div>
                    <div className="text-2xl font-mono font-bold tracking-tight text-white mt-1">
                      {agents.filter((a) => a.status === 'ACTIVE').length} / {agents.length} <span className="text-xs text-zinc-500 font-normal">configured</span>
                    </div>
                  </div>
                  <span className="text-[10.5px] font-mono px-2 py-0.5 rounded border border-[#d7ff4f]/20 text-[#d7ff4f] bg-[#d7ff4f]/10 font-medium">
                    Hard Budgets
                  </span>
                </div>
              </section>
            )}

            {/* Main Interactive Workspace Container */}
            <div className="rounded-2xl border border-white/[.08] bg-white/[.025] backdrop-blur-md p-5 sm:p-6 lg:p-8 shadow-xl">
              {activeTab === 'demo' && <JuryInteractiveDemo currentBlockHeight={blockHeight} vaultTvl={userBalanceUsd} onSimulatePayments={handleSimulateDemoPayments} onNavigateToTab={(tab, sub) => { setActiveTab(tab); if (sub) setSwarmSubView(sub); }} isRealWalletConnected={isRealWalletConnected} walletAddress={walletAddress} agents={agents} autoRunTrigger={demoAutoRun} />}
              {activeTab === 'missions' && (
                <AgentMissionsView 
                  onMissionSettled={(events, cost) => handleSimulateDemoPayments(events, cost)} 
                  agents={agents} 
                  userBalanceUsd={userBalanceUsd} 
                />
              )}
              {activeTab === 'dashboard' && <DashboardWallet userBalanceUsd={userBalanceUsd} agents={agents} onOpenDeposit={() => setIsDepositOpen(true)} onOpenCreateAgent={() => setIsCreateAgentOpen(true)} onToggleAgentStatus={handleToggleAgentStatus} isRealWalletConnected={isRealWalletConnected} networkMode={networkInfo.networkMode} walletAddress={walletAddress} walletBalances={walletBalances} vaultMetrics={vaultMetrics} />}
              {activeTab === 'live' && <LivePaymentsFeed events={liveEvents} onInspectEvent={(event) => { setSelectedTraceForInspector(event); setIsInspectorOpen(true); }} onRefresh={refreshBackendData} />}
              {activeTab === 'monetize' && <ApiMonetizationPortal endpoints={monetizedEndpoints} onAddEndpoint={handleAddMonetizedEndpoint} walletAddress={walletAddress} />}
              {activeTab === 'swarm' && <MultiAgentSwarmView onSwarmSettled={refreshBackendData} initialSubView={swarmSubView} onSubViewChange={setSwarmSubView} />}
              {activeTab === 'architecture' && <ProtocolArchitecture />}
            </div>
          </main>
        </div>
      </div>
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onDeposit={handleDeposit}
        isRealWalletConnected={isRealWalletConnected}
        walletAddress={walletAddress}
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
        walletBalances={walletBalances}
      />
    </div>
  );
}
