import React, { useEffect, useState } from 'react';
import { 
  Compass, Play, CheckCircle2, ArrowRight, Zap, Clock, ShieldCheck, 
  Search, Plane, Code2, BookOpen, Languages, ShieldAlert, ShoppingCart, 
  Bot, Sparkles, RefreshCw, Layers, DollarSign, Check, ChevronRight,
  Database, Cpu, Image, Mic, FileText, Globe, Radio, Shield, BarChart3,
  Terminal, Boxes, FileSpreadsheet, Copy, ChevronDown, ChevronUp, Star, ExternalLink
} from 'lucide-react';
import { TEMPO_EXPLORER_URL, TEMPO_RECEIVER_ADDRESS, tempoTransactionUrl } from '../config/network';
import { soundEngine } from '../utils/audioEffects';
import { LivePaymentEvent } from '../types/synapse402';
import { MPPExecutionTrace } from '../types/synapse';
import { useSynapseState } from '../shared/SynapseStateContext';
import { SynapseStatusBadge } from './shared/SynapseStatusBadge';
import { SynapseTechnicalDetails } from './shared/SynapseTechnicalDetails';

export interface MissionStep {
  name: string;
  provider: string;
  /** The host used for a paid external request. Internal work has no endpoint. */
  endpoint?: string;
  kind?: 'EXTERNAL_RESOURCE' | 'INTERNAL_WORK';
  paymentReason?: string;
  resourceResult?: string;
  paymentStatus?: 'CONFIRMED' | 'EVALUATION' | 'NOT_REQUIRED' | 'FAILED';
  costUsd: number;
  status: 'idle' | 'running' | 'completed' | 'failed';
  result: string;
}

export interface AgentMission {
  id: string;
  title: string;
  category: 'RESEARCH' | 'COMPUTE' | 'MEDIA' | 'COMMERCE';
  leadAgent: string;
  goal: string;
  icon: any;
  steps: MissionStep[];
  oldWayComparison: string;
  finalDeliverable: string;
  simulatedOutput: any;
  isFeatured?: boolean;
}

const RAW_MISSIONS_DATA: AgentMission[] = [
  // ----------------------------------------------------
  // CATEGORY 1: RESEARCH (4 MISSIONS)
  // ----------------------------------------------------
  {
    id: 'mission_sol_market_brief',
    title: 'SOL/USDT Market Analysis',
    category: 'RESEARCH',
    leadAgent: 'Lead Market Analyst',
    goal: 'Analyze SOL/USDT with free market data, local calculations, one paid market-depth input, and a clear report under $0.005.',
    icon: BarChart3,
    isFeatured: true,
    oldWayComparison: 'One bounded job can buy only the extra market input it needs; no full data subscription is required for this run.',
    finalDeliverable: 'SOL/USDT market brief with price zones, momentum context, paid depth, and a clear CoinGlass SDK gap.',
    simulatedOutput: {
      pair: 'SOL/USDT',
      dataSources: 'Free market data + local analysis + Amberdata depth',
      totalCostUsd: 0.0010,
      status: 'MISSION_SUCCESS',
    },
    steps: [
      { name: 'Read SOL/USDT weekly candles', provider: 'Public market data', costUsd: 0, status: 'idle', result: 'Weekly candles and volume loaded' },
      { name: 'Calculate support, resistance, and momentum', provider: 'Internal AI work', costUsd: 0, status: 'idle', result: 'Price zones and direction calculated locally' },
      { name: 'Buy one SOL/USDT market-depth snapshot', provider: 'Amberdata (Evaluation Fixture)', endpoint: '/api/v1/market/sol-orderbook', costUsd: 0.0010, status: 'idle', result: 'Example market-depth snapshot returned' },
      { name: 'Check CoinGlass liquidation context', provider: 'CoinGlass (Synapse402 SDK not integrated)', costUsd: 0, status: 'idle', result: 'Liquidation data unavailable; provider route missing' },
      { name: 'Write the final market brief', provider: 'Internal AI work', costUsd: 0, status: 'idle', result: 'One concise, reviewable market brief returned' },
    ],
  },
  {
    id: 'mission_paywall',
    title: 'Research Paper Access',
    category: 'RESEARCH',
    leadAgent: 'Academic Reader Agent',
    goal: 'Resolve a paper, request licensed access, and return the document in agent-ready format.',
    icon: BookOpen,
    isFeatured: false,
    oldWayComparison: 'No recurring subscription required for this run',
    finalDeliverable: 'Research paper ready for AI analysis (Clean Markdown in context)',
    simulatedOutput: {
      doi: '10.1038/s41586-024-07142-9',
      journal: 'Nature Physics',
      title: 'Quantum State Channels on High-Throughput Layer 1s',
      wordCount: 4820,
      totalCostUsd: 0.0010,
      status: 'MISSION_SUCCESS',
    },
    steps: [
      { name: 'Verify paper license', provider: 'api.academic-licensing.org (Demo Provider)', costUsd: 0.0005, status: 'idle', result: 'Micro-License Signed' },
      { name: 'Download full text (Markdown)', provider: 'api.academic-licensing.org (Demo Provider)', costUsd: 0.0005, status: 'idle', result: 'Full Paper Streamed (4.8k words)' },
    ],
  },
  {
    id: 'mission_research',
    title: 'Financial Filing Analysis',
    category: 'RESEARCH',
    leadAgent: 'Equity Research Quant',
    goal: 'Normalize licensed filing tables, check premium market depth, and run a valuation model.',
    icon: Search,
    oldWayComparison: 'Public filing data is free; paid value comes from optional models or licensed feeds',
    finalDeliverable: 'Structured valuation report with financial ratios and margin metrics',
    simulatedOutput: {
      ticker: 'TSLA',
      filingType: 'Audited Annual Financials',
      grossMargin: '18.2%',
      l2BidAskSpread: '$0.02 (Liquid)',
      sentimentScore: '0.84 (Bullish)',
      totalCostUsd: 0.0025,
      settlementTimeMs: 24,
      status: 'MISSION_SUCCESS',
    },
    steps: [
      { name: 'Normalize licensed filing tables', provider: 'api.financial-normalizer.io (Demo Provider)', costUsd: 0.0015, status: 'idle', result: 'Financial Tables Parsed' },
      { name: 'Review licensed L2 snapshot', provider: 'api.market-depth.net (Demo Provider)', costUsd: 0.0010, status: 'idle', result: 'Example depth matrix reviewed' },
      { name: 'Run valuation model', provider: 'Internal AI work', costUsd: 0, status: 'idle', result: 'Fair Value Estimated ($245.80)' },
    ],
  },
  {
    id: 'mission_commodities',
    title: 'Global Freight & Metals Check',
    category: 'RESEARCH',
    leadAgent: 'Macro Intelligence Agent',
    goal: 'Compare licensed freight and metals reference feeds, then score supply chain risk.',
    icon: Globe,
    oldWayComparison: 'Enterprise commodities terminal ($25k/yr contract); pay only for the licensed checks used',
    finalDeliverable: 'Logistics index report with copper pricing and bottleneck warnings',
    simulatedOutput: {
      balticDryIndex: 1842,
      copperSpotUsd: '$4.12/lb',
      freightCostIndex: '+2.4%',
      bottleneckRisk: 'Low',
      totalCostUsd: 0.0025,
      status: 'MISSION_SUCCESS',
    },
    steps: [
      { name: 'Review licensed freight index', provider: 'api.freight-intelligence.net (Demo Provider)', costUsd: 0.0015, status: 'idle', result: 'Vessel Density Parsed' },
      { name: 'Review licensed metals reference', provider: 'api.metals-spot.io (Demo Provider)', costUsd: 0.0010, status: 'idle', result: 'LME Quotes Ingested' },
      { name: 'Score supply risk', provider: 'Internal AI work', costUsd: 0, status: 'idle', result: 'Supply Chain Score Generated' },
    ],
  },
  {
    id: 'mission_crypto_skew',
    title: 'Market Liquidity & Spread Analysis',
    category: 'RESEARCH',
    leadAgent: 'Market Depth Agent',
    goal: 'Compare licensed, normalized orderbook snapshots and review a venue spread.',
    icon: BarChart3,
    oldWayComparison: 'Public spot endpoints are often free; premium value is normalized, low-latency, or deeper L2/L3 data',
    finalDeliverable: 'Multi-exchange liquidity comparison report',
    simulatedOutput: {
      pair: 'BTC/USD',
      venueA: 'Spot Orderbook (420 Bids)',
      venueB: 'Perp Orderbook (380 Asks)',
      venueSpreadBps: '0.4 bps',
      liquidityDiscrepancy: '0.42% Spread',
      totalCostUsd: 0.0020,
      status: 'MISSION_SUCCESS',
    },
    steps: [
      { name: 'Review licensed spot depth snapshot', provider: 'api.market-depth-mesh.io (Demo Provider)', costUsd: 0.0008, status: 'idle', result: 'Example spot depth reviewed' },
      { name: 'Review licensed derivatives snapshot', provider: 'api.derivatives-depth.io (Demo Provider)', costUsd: 0.0012, status: 'idle', result: 'Example derivatives depth mapped' },
      { name: 'Compute spread discrepancy', provider: 'Internal AI work', costUsd: 0, status: 'idle', result: 'Spread Discrepancy Calculated' },
    ],
  },

  // ----------------------------------------------------
  // CATEGORY 2: CODE & COMPUTE (4 MISSIONS)
  // ----------------------------------------------------
  {
    id: 'mission_sandbox',
    title: 'Run Untrusted Code in Cloud Sandbox',
    category: 'COMPUTE',
    leadAgent: 'Code Security Agent',
    goal: 'Spin up an isolated container, run untrusted script, and get clean output.',
    icon: Code2,
    oldWayComparison: 'Pay only when code runs — no idle compute costs',
    finalDeliverable: 'Sandbox execution report, exit code, and stdout log',
    simulatedOutput: {
      containerId: 'cnt_safe_9842a',
      runtime: 'Python 3.11 (Isolated)',
      executionTimeMs: 142,
      exitCode: 0,
      output: 'All test assertions passed. No runtime errors detected. Ephemeral runtime destroyed.',
      totalCostUsd: 0.0050,
      status: 'MISSION_SUCCESS',
    },
    steps: [
      { name: 'Provision sandbox runtime', provider: 'api.sandbox-python.dev (Demo Provider)', costUsd: 0.0025, status: 'idle', result: 'Runtime Ready (Python 3.11)' },
      { name: 'Run & profile script', provider: 'api.sandbox-python.dev (Demo Provider)', costUsd: 0.0025, status: 'idle', result: 'Execution Complete (Exit Code 0)' },
    ],
  },
  {
    id: 'mission_mesh_3d',
    title: 'Convert 3D Model & Check Geometry',
    category: 'COMPUTE',
    leadAgent: '3D Geometry Agent',
    goal: 'Compile raw 3D mesh to GLTF format and calculate bounding boxes.',
    icon: Layers,
    oldWayComparison: 'Pay only per 3D compile — no idle GPU capacity',
    finalDeliverable: 'Compiled GLTF model with pre-calculated bounding coordinates',
    simulatedOutput: {
      meshFormat: 'GLTF 2.0 Binary',
      verticesCount: 142000,
      occlusionCulling: 'PASS',
      totalCostUsd: 0.0025,
      status: 'MISSION_SUCCESS',
    },
    steps: [
      { name: 'Compile raw mesh to GLTF', provider: 'api.mesh-compiler.net (Demo Provider)', costUsd: 0.0025, status: 'idle', result: 'GLTF Asset Generated (142k verts)' },
      { name: 'Extract bounding box matrix', provider: 'Internal AI work', costUsd: 0, status: 'idle', result: 'Bounding Box Matrix Verified' },
    ],
  },
  {
    id: 'mission_smart_contract_audit',
    title: 'Smart Contract Security Check',
    category: 'COMPUTE',
    leadAgent: 'Security Auditor Agent',
    goal: 'Run automated bytecode analysis, test invariants, and find common bugs.',
    icon: Shield,
    oldWayComparison: 'Automated CI bytecode check on demand — no recurring scanner subscription',
    finalDeliverable: 'Automated security report with invariant results and gas tips',
    simulatedOutput: {
      contract: 'SynapseVault.sol',
      compiler: 'Solidity 0.8.20',
      invariantsChecked: 32,
      reentrancyVulnerabilities: 0,
      gasSavingsIdentified: '14.2%',
      totalCostUsd: 0.0040,
      status: 'MISSION_SUCCESS',
    },
    steps: [
      { name: 'Run bytecode analyzer', provider: 'api.contract-analyzer.io (Demo Provider)', costUsd: 0.0020, status: 'idle', result: 'Static Analysis Clean' },
      { name: 'Check invariant proofs', provider: 'api.smt-solver.io (Demo Provider)', costUsd: 0.0020, status: 'idle', result: 'Demo Provider invariant result' },
    ],
  },
  {
    id: 'mission_sql_optimizer',
    title: 'Optimize Slow Database Query',
    category: 'COMPUTE',
    leadAgent: 'Database Architect Agent',
    goal: 'Analyze query plan, test index changes, and output faster query rewrite.',
    icon: Database,
    oldWayComparison: 'Enterprise APM monitoring subscription ($80/mo)',
    finalDeliverable: 'Rewritten SQL plan with index recommendations and benchmark',
    simulatedOutput: {
      originalCost: 4520.12,
      optimizedCost: 112.40,
      latencyReduction: '88.4%',
      indexRecommendation: 'CREATE INDEX idx_settlement_2d ON trades(nonce_2d, block)',
      totalCostUsd: 0.0015,
      status: 'MISSION_SUCCESS',
    },
    steps: [
      { name: 'Evaluate query execution plan', provider: 'api.query-plan.dev (Demo Provider)', costUsd: 0.0015, status: 'idle', result: 'Query Plan Trees Evaluated' },
      { name: 'Generate optimized rewrite patch', provider: 'Internal AI work', costUsd: 0, status: 'idle', result: 'Rewrite patch prepared locally' },
    ],
  },

  // ----------------------------------------------------
  // CATEGORY 3: MEDIA & VOICE (4 MISSIONS)
  // ----------------------------------------------------
  {
    id: 'mission_translate',
    title: 'Translate Technical Documentation',
    category: 'MEDIA',
    leadAgent: 'Document Translator Agent',
    goal: 'Translate technical API documentation into German and Japanese in parallel.',
    icon: Languages,
    oldWayComparison: 'Translation agency contract or monthly translation subscription',
    finalDeliverable: 'Bilingual markdown documentation package',
    simulatedOutput: {
      sourceLang: 'EN',
      targetLangs: ['DE', 'JA'],
      translatedParagraphs: 48,
      accuracyScore: 'Example metric',
      totalCostUsd: 0.0020,
      status: 'MISSION_SUCCESS',
    },
    steps: [
      { name: 'German technical translation', provider: 'api.translate-provider.io (Demo Provider)', costUsd: 0.0010, status: 'idle', result: 'German Syntax Ingested' },
      { name: 'Japanese grammar localization', provider: 'api.translate-provider.io (Demo Provider)', costUsd: 0.0010, status: 'idle', result: 'Japanese Natural Flow Verified' },
    ],
  },
  {
    id: 'mission_vision_upscale',
    title: 'Extract Image Background & Alpha Matte',
    category: 'MEDIA',
    leadAgent: 'Vision Production Agent',
    goal: 'Extract clean transparent alpha matte and optimize image resolution.',
    icon: Image,
    oldWayComparison: '$30–$50/mo graphic tool subscriptions',
    finalDeliverable: 'High-resolution transparent PNG asset ready for web layout',
    simulatedOutput: {
      originalResolution: '1024x1024',
      targetResolution: '2048x2048 (Enhanced)',
      matteAccuracy: 'Example metric',
      outputFormat: 'PNG (Alpha Clean)',
      totalCostUsd: 0.0040,
      status: 'MISSION_SUCCESS',
    },
    steps: [
      { name: 'Extract subject alpha matte', provider: 'api.vision-neural.ai (Demo Provider)', costUsd: 0.0020, status: 'idle', result: 'Alpha Matte Extracted (0 artifacts)' },
      { name: 'Enhance asset resolution', provider: 'api.vision-neural.ai (Demo Provider)', costUsd: 0.0020, status: 'idle', result: 'High-Res Bitmap Synthesized (2048x2048)' },
    ],
  },
  {
    id: 'mission_voice_tts',
    title: 'Generate Voiceover & Timed Subtitles',
    category: 'MEDIA',
    leadAgent: 'Audio Voiceover Agent',
    goal: 'Generate realistic voice narration from text and align subtitle timing.',
    icon: Mic,
    oldWayComparison: '$22/mo voice AI subscription with expiring credits',
    finalDeliverable: 'Studio-quality MP3 audio track and WebVTT subtitle file',
    simulatedOutput: {
      voiceModel: 'Neural TTS Voice v2',
      durationSeconds: 34.2,
      samplingRate: '48kHz Stereo',
      subtitlesAligned: true,
      totalCostUsd: 0.0025,
      status: 'MISSION_SUCCESS',
    },
    steps: [
      { name: 'Synthesize voiceover audio', provider: 'api.voice-neural.io (Demo Provider)', costUsd: 0.0025, status: 'idle', result: '48kHz Master Audio Rendered' },
      { name: 'Align subtitle timing', provider: 'Internal AI work', costUsd: 0, status: 'idle', result: 'Subtitle Timing Mapped (0 drift)' },
    ],
  },
  {
    id: 'mission_ocr_tabular',
    title: 'Extract Data from Invoice Image',
    category: 'MEDIA',
    leadAgent: 'Document Parser Agent',
    goal: 'Read invoice image, extract line items, and convert to clean JSON schema.',
    icon: FileSpreadsheet,
    oldWayComparison: 'Pay only per document — no minimum monthly commitments',
    finalDeliverable: 'Structured JSON accounting data ready for ERP upload',
    simulatedOutput: {
      detectedEntities: 24,
      confidenceScore: '99.9%',
      tableRowsParsed: 18,
      currency: 'USD',
      totalCostUsd: 0.0015,
      status: 'MISSION_SUCCESS',
    },
    steps: [
      { name: 'OCR invoice document', provider: 'api.neural-ocr.io (Demo Provider)', costUsd: 0.0015, status: 'idle', result: 'Text & Table Cells Segmented' },
      { name: 'Compile structured JSON schema', provider: 'Internal AI work', costUsd: 0, status: 'idle', result: 'Verified JSON Ledger Produced' },
    ],
  },

  // ----------------------------------------------------
  // CATEGORY 4: BUSINESS & COMMERCE (5 MISSIONS)
  // ----------------------------------------------------
  {
    id: 'mission_travel',
    title: 'Check Flight & Hotel Availability',
    category: 'COMMERCE',
    leadAgent: 'Travel Coordinator Agent',
    goal: 'Compare supplied flight and hotel availability examples and return an itinerary.',
    icon: Plane,
    oldWayComparison: 'Travel booking system API subscription ($10k/yr)',
    finalDeliverable: 'Flight and hotel options with current-price fields for review',
    simulatedOutput: {
      route: 'SFO -> CDG (Direct)',
      airline: 'Air France AF083',
      hotel: 'Le Marais Boutique Hotel (3 Nights)',
      fareUsd: '$840.00',
      totalCostUsd: 0.0040,
      settlementTimeMs: 31,
      status: 'MISSION_SUCCESS',
    },
    steps: [
      { name: 'Review flight availability example', provider: 'api.flights-gds.global (Demo Provider)', costUsd: 0.0020, status: 'idle', result: 'Example flight options prepared' },
      { name: 'Review hotel availability example', provider: 'api.lodging-inventory.io (Demo Provider)', costUsd: 0.0020, status: 'idle', result: 'Example room options prepared' },
    ],
  },
  {
    id: 'mission_kyc',
    title: 'Verify Sanctions & Watchlist Status',
    category: 'COMMERCE',
    leadAgent: 'Compliance Auditor Agent',
    goal: 'Check company or entity against global sanctions and watchlists.',
    icon: ShieldAlert,
    oldWayComparison: '$2–$5 per manual compliance check via bureau',
    finalDeliverable: 'Compliance review report with evaluation findings',
    simulatedOutput: {
      checkType: 'Global Sanctions & Watchlists',
      riskScore: 0.01,
      flags: 0,
      evaluationProofId: 'eval_kyc_9482',
      totalCostUsd: 0.0015,
      status: 'MISSION_SUCCESS',
    },
    steps: [
      { name: 'Review sanctions & watchlist example', provider: 'api.compliance-audit.io (Demo Provider)', costUsd: 0.0015, status: 'idle', result: 'Example watchlist result prepared' },
      { name: 'Verify audit credentials', provider: 'Internal AI work', costUsd: 0, status: 'idle', result: 'Signature checked in evaluation' },
    ],
  },
  {
    id: 'mission_commerce',
    title: 'Generate Invoice & Pay Provider',
    category: 'COMMERCE',
    leadAgent: 'Commerce Payment Agent',
    goal: 'Issue a machine-readable invoice and settle the approved request with the provider.',
    icon: ShoppingCart,
    oldWayComparison: 'Credit card checkout with 30¢ + 3% merchant processing fee',
    finalDeliverable: 'Provider invoice record with the payment state and receipt when the run confirms',
    simulatedOutput: {
      merchantId: 'mcht_synapse_402',
      invoiceId: 'inv_8941_tempo',
      standard: 'Digital Settlement Receipt',
      settlementSpeedMs: 14,
      totalCostUsd: 0.0020,
      status: 'MISSION_SUCCESS',
    },
    steps: [
      { name: 'Issue machine invoice', provider: 'Internal AI work', costUsd: 0, status: 'idle', result: 'Invoice prepared locally' },
      { name: 'Authorize micro-settlement', provider: 'api.checkout-engine.io (Demo Provider)', costUsd: 0.0020, status: 'idle', result: 'Payment step approved within the cap' },
    ],
  },
  {
    id: 'mission_energy_dispatch',
    title: 'Solar Telemetry & Energy Credit',
    category: 'COMMERCE',
    leadAgent: 'Smart Grid Agent',
    goal: 'Read solar inverter output, record green credit, and settle micro-payment.',
    icon: Zap,
    oldWayComparison: 'Monthly utility metering with manual billing cycles',
    finalDeliverable: 'Energy dispatch example and credit record for review',
    simulatedOutput: {
      gridNode: 'Solar-Array-TX-04',
      kwhDispatched: 14.5,
      ratePerKwhUsd: '$0.082',
      co2OffsetKg: 12.8,
      totalCostUsd: 0.0038,
      status: 'MISSION_SUCCESS',
    },
    steps: [
      { name: 'Read solar telemetry example', provider: 'api.smart-grid.network (Demo Provider)', costUsd: 0.0018, status: 'idle', result: 'Example telemetry loaded (14.5 kWh)' },
      { name: 'Issue green carbon certificate', provider: 'api.carbon-registry.org (Demo Provider)', costUsd: 0.0020, status: 'idle', result: 'Green certificate prepared for review' },
    ],
  },
  {
    id: 'mission_agentic_commerce',
    title: 'Autonomous Supply Order',
    category: 'COMMERCE',
    leadAgent: 'Autonomous Procurement Agent',
    goal: 'Compare supplier examples, check the rules, and prepare a purchase order.',
    icon: ShoppingCart,
    oldWayComparison: 'Multi-step procurement department purchase order flow',
    finalDeliverable: 'Purchase order prepared for review under the approved cap',
    simulatedOutput: {
      orderId: 'PO-98421-TEMPO',
      supplierVerified: 'Industrial Micro-Compute Ltd',
      sanctionsCheck: 'Example result (not live)',
      settlementSpeedMs: 14,
      totalCostUsd: 0.0030,
      status: 'MISSION_SUCCESS',
    },
    steps: [
      { name: 'Compare supplier examples', provider: 'api.supplier-catalog.io (Demo Provider)', costUsd: 0.0015, status: 'idle', result: '3 supplier options prepared' },
      { name: 'Review compliance example', provider: 'api.compliance-audit.io (Demo Provider)', costUsd: 0.0015, status: 'idle', result: 'Example rules result prepared' },
      { name: 'Prepare micro-purchase order', provider: 'Internal AI work', costUsd: 0, status: 'idle', result: 'Purchase order prepared for review' },
    ],
  },
];

/**
 * A mission step is either a paid request for an external resource or local
 * orchestration work. Keeping this decision in the mission data prevents the
 * runner from turning formatting, reasoning, and report assembly into fake
 * provider charges.
 */
const INTERNAL_STEP_KEYS = new Set([
  'mission_research::Run valuation model',
  'mission_commodities::Score supply risk',
  'mission_crypto_skew::Compute spread discrepancy',
  'mission_mesh_3d::Extract bounding box matrix',
  'mission_sql_optimizer::Generate optimized rewrite patch',
  'mission_voice_tts::Align subtitle timing',
  'mission_ocr_tabular::Compile structured JSON schema',
  'mission_kyc::Verify audit credentials',
  'mission_commerce::Issue machine invoice',
  'mission_agentic_commerce::Prepare micro-purchase order',
]);

const PAYMENT_CONTEXT_BY_STEP: Record<string, string> = {
  'Verify paper license': 'The academic licensing service verifies entitlement and returns a signed micro-license.',
  'Download full text (Markdown)': 'The academic licensing service returns the paid paper body as clean Markdown.',
  'Normalize licensed filing tables': 'The financial normalizer converts licensed filing tables into structured rows for analysis.',
  'Review licensed L2 snapshot': 'The market-depth service supplies the paid bid/ask snapshot needed for the liquidity check.',
  'Review licensed freight index': 'The freight-data service supplies the licensed vessel-density index used for the logistics check.',
  'Review licensed metals reference': 'The metals-data service supplies the licensed reference quote used for the commodity comparison.',
  'Review licensed spot depth snapshot': 'The spot-depth service supplies a normalized orderbook snapshot for the spread comparison.',
  'Review licensed derivatives snapshot': 'The derivatives-depth service supplies the second orderbook needed to compare venues.',
  'Provision sandbox runtime': 'The sandbox provider allocates an isolated runtime so untrusted code can run safely.',
  'Run & profile script': 'The sandbox provider executes the untrusted script and returns stdout, exit code, and timing.',
  'Compile raw mesh to GLTF': 'The mesh compiler performs the paid geometry conversion and returns a GLTF asset.',
  'Run bytecode analyzer': 'The contract-analysis service scans bytecode and returns a static security report.',
  'Check invariant proofs': 'The SMT service checks the contract invariants and returns proof results.',
  'Evaluate query execution plan': 'The query-plan service evaluates the database plan and returns the expensive operators.',
  'German technical translation': 'The translation service returns the German version of the technical document.',
  'Japanese grammar localization': 'The translation service returns the Japanese localization needed for the final package.',
  'Extract subject alpha matte': 'The vision service extracts the paid foreground mask and returns a clean alpha matte.',
  'Enhance asset resolution': 'The vision service upscales the asset and returns the high-resolution bitmap.',
  'Synthesize voiceover audio': 'The voice service renders the requested narration and returns the audio master.',
  'OCR invoice document': 'The OCR service reads the invoice image and returns text and table cells.',
  'Review flight availability example': 'The flight-data provider returns the availability records needed for the itinerary.',
  'Review hotel availability example': 'The lodging provider returns the room availability records needed for the itinerary.',
  'Review sanctions & watchlist example': 'The compliance provider returns the watchlist result used for the risk decision.',
  'Authorize micro-settlement': 'The checkout provider receives the approved settlement request and returns its payment state.',
  'Read solar telemetry example': 'The grid-data provider returns the telemetry used to calculate the energy credit.',
  'Issue green carbon certificate': 'The registry provider records the credit and returns the certificate record.',
  'Compare supplier examples': 'The supplier catalog returns the paid options used to compare the order.',
  'Review compliance example': 'The compliance provider returns the supplier check used before preparing the order.',
};

const providerEndpoint = (provider: string) => provider.replace(/\s*\([^)]*\)\s*$/, '').trim();

const fetchSettledLocalProviderResult = async (
  endpoint: string,
  trace: MPPExecutionTrace,
  maxPricePathUsd: number,
): Promise<Record<string, unknown>> => {
  const credential = trace.mppCredential;
  if (!credential || !trace.eip712Signature || !trace.nonce2D || !trace.txHash) {
    throw new Error('The confirmed payment did not include a complete provider credential.');
  }

  const target = new URL(endpoint, window.location.origin);
  if (target.origin !== window.location.origin) {
    throw new Error('The SOL demo provider route must stay on this site.');
  }

  const headers = new Headers({
    'X-Tempo-MPP-Signature': trace.eip712Signature,
    'X-Tempo-Nonce-2D': trace.nonce2D,
    'X-Tempo-Cost-PathUSD': String(trace.costPathUsd),
    'X-Synapse-Trace-Id': trace.id,
    'X-Synapse-Execution-Mode': trace.executionMode || 'LIVE_TESTNET',
    'X-Tempo-Tx-Hash': trace.txHash,
    'X-Tempo-MPP-Signer': credential.signer,
    'X-Tempo-MPP-Payee': credential.payee,
    'X-Tempo-MPP-Amount-Micro': credential.amountMicro,
    'X-Tempo-MPP-Endpoint': credential.endpoint,
    'X-Tempo-MPP-Endpoint-Hash': credential.endpointHash,
    'X-Tempo-MPP-Memo': credential.memo,
    'X-Tempo-MPP-Valid-Before': String(credential.validBefore),
    'X-Tempo-MPP-Chain-Id': String(credential.chainId),
    'X-Tempo-MPP-Verifying-Contract': credential.verifyingContract,
    'X-Tempo-MPP-Channel-Id': String(credential.channelId),
    'X-Tempo-MPP-Nonce': String(credential.nonce),
    Authorization: `MPP-EIP712 signer="${credential.signer}", nonce="${trace.nonce2D}", max="${maxPricePathUsd}"`,
    'Idempotency-Key': `provider-result-${trace.id}`,
  });

  const response = await fetch(target, { method: 'GET', headers, credentials: 'same-origin' });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(`Provider route returned HTTP ${response.status}${body?.verificationError ? `: ${body.verificationError}` : ''}.`);
  }
  if (response.headers.get('X-Tempo-MPP-Access') !== 'authorized') {
    throw new Error('Provider route did not confirm the signed payment credential.');
  }

  const payload = await response.json();
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Provider route returned an invalid result.');
  }
  return payload as Record<string, unknown>;
};

const normalizeMissionSteps = (missions: AgentMission[]): AgentMission[] => missions.map((mission) => {
  const steps = mission.steps.map((step) => {
    const key = `${mission.id}::${step.name}`;
    if (INTERNAL_STEP_KEYS.has(key)) {
      return {
        ...step,
        kind: 'INTERNAL_WORK' as const,
        provider: 'Internal AI work',
        endpoint: undefined,
        costUsd: 0,
        paymentReason: 'Local reasoning or formatting only; no external provider is called, so no payment is sent.',
        resourceResult: step.result,
      };
    }

    // Keep explicit local fixture routes; deriving the endpoint from the
    // provider label turns names like "Amberdata" into invalid hostnames.
    const endpoint = step.endpoint || providerEndpoint(step.provider);
    return {
      ...step,
      kind: 'EXTERNAL_RESOURCE' as const,
      provider: `Demo Provider · ${endpoint}`,
      endpoint,
      paymentReason: PAYMENT_CONTEXT_BY_STEP[step.name] || `The external provider is needed for ${step.name.toLowerCase()}.`,
      resourceResult: step.result,
    };
  });
  const totalCostUsd = Number(steps.reduce((sum, step) => sum + step.costUsd, 0).toFixed(4));
  return {
    ...mission,
    steps,
    simulatedOutput: {
      ...mission.simulatedOutput,
      totalCostUsd,
    },
  };
});

export const MISSIONS_DATA: AgentMission[] = normalizeMissionSteps(RAW_MISSIONS_DATA);

export interface MissionDeliverableContent {
  documentTitle: string;
  badge: string;
  narrative: string;
  metrics: { label: string; value: string; note: string }[];
  actionRecommendation: string;
}

export const MISSION_DELIVERABLES: Record<string, MissionDeliverableContent> = {
  mission_paywall: {
    documentTitle: 'Academic Research Report: Nature Physics micro-license',
    badge: 'Research micro-license',
    narrative: 'Academic Reader Agent resolved DOI 10.1038/s41586-024-07142-9, prepared a $0.0010 micro-license request, and returned the paper metadata in clean Markdown without a subscription lock-in.',
    metrics: [
      { label: 'Journal', value: 'Nature Physics', note: 'Peer-Reviewed Source' },
      { label: 'DOI Resolved', value: '10.1038/s41586', note: 'Persistent Identifier' },
      { label: 'Word Count', value: '4,820 words', note: 'Full Article Parsed' },
      { label: 'Planned cost', value: '$0.0010 USD', note: 'Single micro-license example' },
    ],
    actionRecommendation: 'Full text ingested into agent runtime memory. Key findings ready for synthesis.',
  },
  mission_research: {
    documentTitle: 'Equity Research & Valuation Brief: TSLA',
     badge: 'Filing & Market Snapshot Review',
    narrative: 'Evaluation flow combines a TSLA filing sample with an orderbook-shaped response. The figures below show the report format and decision path; they are not a live market feed.',
    metrics: [
      { label: 'Fair Value Estimate', value: '$245.80', note: 'Valuation Model' },
      { label: 'Example Gross Margin', value: '18.2%', note: 'Filing snapshot' },
      { label: 'L2 Liquidity Spread', value: '$0.02 (Liquid)', note: 'Orderbook Depth' },
      { label: 'Institutional Sentiment', value: '0.84 (Bullish)', note: 'NLP Filing Analysis' },
    ],
    actionRecommendation: 'Portfolio weight recommendation: Maintain overweight allocation with trailing 4.5% stop-loss.',
  },
  mission_commodities: {
    documentTitle: 'Global Commodity Supply & Freight Matrix Report',
    badge: 'Macro Supply Intelligence',
    narrative: 'Synthesized sample maritime and metals inputs to show the report format. The figures are examples, not a live London Metal Exchange feed.',
    metrics: [
      { label: 'Baltic Dry Index', value: '1,842', note: 'Maritime Freight Density' },
      { label: 'LME Copper Spot', value: '$4.12 / lb', note: 'Sample market value' },
      { label: 'Freight Cost Delta', value: '+2.4%', note: '30-Day Moving Average' },
      { label: 'Supply Bottleneck', value: 'Low Risk', note: 'Multi-Modal Logistics Score' },
    ],
    actionRecommendation: 'No supply chain disruption alerts triggered. Hedging recommendations remain unchanged for Q3.',
  },
  mission_crypto_skew: {
    documentTitle: 'Cross-Venue Market Depth & Spread Brief',
    badge: 'Sample Orderbook Analysis',
    narrative: 'The evaluation compares sample Spot and Deribit-shaped liquidity inputs. It shows how a spread report would be produced; it is not a live exchange feed.',
    metrics: [
      { label: 'Target Asset', value: 'BTC / USD', note: 'Cross-Exchange Pair' },
      { label: 'Spot Spread', value: '0.4 bps', note: 'Spot Liquidity' },
      { label: 'Venue Discrepancy', value: '0.42%', note: 'Exchange Depth Gap' },
      { label: 'Planned data cost', value: '$0.0025 USD', note: 'Evaluation fixture' },
    ],
    actionRecommendation: 'Review the spread and decide whether to save it to the strategy cache. The $0.0025 step is planned until a wallet confirms payment.',
  },
  mission_sandbox: {
    documentTitle: 'Sandbox Execution Report',
    badge: 'Isolated Runtime Execution',
    narrative: 'Code ran inside an isolated demo runtime. All test assertions passed with exit code 0. No runtime errors detected. Ephemeral container was safely destroyed immediately after stdout extraction.',
    metrics: [
      { label: 'Runtime Environment', value: 'Python 3.11', note: 'Isolated Runtime' },
      { label: 'Execution Time', value: '142 ms', note: 'Execution Duration' },
      { label: 'Exit Code', value: '0 (Clean)', note: 'All Tests Passed' },
      { label: 'Runtime State', value: 'Destroyed', note: 'Ephemeral Cleanup' },
    ],
    actionRecommendation: 'Review test results and profiling report before production integration.',
  },
  mission_mesh_3d: {
    documentTitle: '3D Mesh Compilation & Spatial Extraction Sheet',
    badge: 'Spatial Geometry Optimization',
    narrative: 'Transformed 142,000 raw vertex coordinates into a production-ready GLTF 2.0 binary asset with pre-calculated occlusion bounding matrices. Ready for direct WebGL / Vision Pro spatial engine ingestion.',
    metrics: [
      { label: 'Target Format', value: 'GLTF 2.0 Binary', note: 'Standard Spatial Asset' },
      { label: 'Vertex Count', value: '142,000 Verts', note: 'Zero Polygonal Loss' },
      { label: 'Occlusion Culling', value: 'Verified', note: 'Bounding Box Matrix' },
      { label: 'Payload Reduction', value: '64.2%', note: 'Draco Compression' },
    ],
    actionRecommendation: 'Asset uploaded to high-speed CDN and bound to active 3D world canvas.',
  },
  mission_smart_contract_audit: {
    documentTitle: 'Automated Smart Contract Invariant Verification Certificate',
    badge: 'Formal Mathematical Verification',
    narrative: 'Conducted automated AST static bytecode analysis on SynapseVault.sol and executed Z3 SMT solver across 32 formal security invariants. Verified zero reentrancy vectors and identified a 14.2% gas optimization pattern.',
    metrics: [
      { label: 'Contract Audited', value: 'SynapseVault.sol', note: 'Solidity 0.8.20' },
      { label: 'Invariant result', value: 'Example output', note: 'Demo Provider response' },
      { label: 'Reentrancy Vectors', value: '0 Detected', note: 'CEI Pattern Confirmed' },
      { label: 'Gas Optimization', value: '14.2% Savings', note: 'Storage Packing Identified' },
    ],
    actionRecommendation: 'Apply suggested storage variable packing in commit hash before mainnet migration.',
  },
  mission_sql_optimizer: {
    documentTitle: 'Database Execution Plan Optimization Sheet',
    badge: 'Database Performance Patch',
    narrative: 'Deconstructed slow PostgreSQL query AST tree, simulated B-Tree index scan alternatives, and delivered a production-ready query rewrite along with a composite index definition that cuts execution latency by 88.4%.',
    metrics: [
      { label: 'Initial Plan Cost', value: '4,520.12', note: 'Sequential Table Scan' },
      { label: 'Optimized Cost', value: '112.40', note: 'Indexed Seek' },
      { label: 'Latency metric', value: 'Example output', note: 'Demo Provider response' },
      { label: 'Index Recommended', value: 'idx_settlement_2d', note: 'Composite B-Tree' },
    ],
    actionRecommendation: 'Execute migration patch: CREATE INDEX idx_settlement_2d ON trades(nonce_2d, block);',
  },
  mission_translate: {
    documentTitle: 'Bilingual Technical Documentation Package',
    badge: 'Neural Technical Localization',
    narrative: 'Translated complex API documentation into German and Japanese in parallel using specialized technical grammar models. 48 paragraphs localized with verified code block and markdown formatting intact.',
    metrics: [
      { label: 'Languages', value: 'EN -> DE, JA', note: 'Parallel Dispatch' },
      { label: 'Paragraphs', value: '48 Blocks', note: 'Syntax Preserved' },
      { label: 'Accuracy metric', value: 'Example output', note: 'Demo Provider response' },
      { label: 'Turnaround', value: '380 ms', note: 'Instant Parallel Delivery' },
    ],
    actionRecommendation: 'Commit localized markdown files directly into multi-lingual docs repository.',
  },
  mission_vision_upscale: {
    documentTitle: 'High-Res Alpha Matte & Asset Delivery Certificate',
    badge: 'Neural Image Processing',
    narrative: 'Example provider output: a transparent PNG package is shown to explain the workflow; the external image service is not claimed to have run live.',
    metrics: [
      { label: 'Input Resolution', value: '1024 x 1024', note: 'Original Source' },
      { label: 'Target Output', value: '2048 x 2048', note: 'Enhanced Asset' },
      { label: 'Matte metric', value: 'Example output', note: 'Demo Provider response' },
      { label: 'Output Format', value: 'PNG (Alpha)', note: 'Transparent Layer' },
    ],
    actionRecommendation: 'Asset deployed directly to responsive image pipeline.',
  },
  mission_voice_tts: {
    documentTitle: 'Master Studio Voice Narration & Timed Subtitles',
    badge: 'Neural Speech Synthesis',
    narrative: 'Synthesized 34.2 seconds of natural human-cadence studio voiceover at 48kHz stereo, and automatically aligned word-level WebVTT subtitle timing cues with zero temporal drift.',
    metrics: [
      { label: 'Audio Duration', value: '34.2 seconds', note: 'Full Script Narrated' },
      { label: 'Audio Format', value: '48kHz Stereo MP3', note: 'Broadcast Master' },
      { label: 'Subtitle Track', value: 'WebVTT Aligned', note: '0 ms Drift' },
      { label: 'Voice Model', value: 'Neural TTS v2', note: 'Natural Pacing' },
    ],
    actionRecommendation: 'Multiplex audio track and WebVTT timing file into video render pipeline.',
  },
  mission_ocr_tabular: {
    documentTitle: 'Financial Invoice OCR & Accounting Ledger Output',
    badge: 'Neural Document OCR',
    narrative: 'Scanned complex multi-line commercial invoice, identified 24 distinct business entities with 99.9% OCR confidence, and parsed 18 table line items into structured double-entry accounting schema.',
    metrics: [
      { label: 'Entities Detected', value: '24 Fields', note: 'Vendor, Tax ID, Totals' },
      { label: 'Table Rows', value: '18 Line Items', note: 'SKU, Quantity, Rates' },
      { label: 'OCR Confidence', value: '99.9%', note: 'Bounding Box Verified' },
      { label: 'Schema Format', value: 'Strict JSON Ledger', note: 'ERP Direct Upload' },
    ],
    actionRecommendation: 'Post structured invoice JSON to accounts payable queue for automatic reconciliation.',
  },
  mission_travel: {
    documentTitle: 'Direct Flight & Accommodation Itinerary Confirmation',
    badge: 'Autonomous Travel Booking',
    narrative: 'Queried flight inventory for direct SFO to CDG routes (selected AF083 lowest fare at $840) and confirmed 3-night vacancy at Le Marais Boutique Hotel in a single autonomous chain.',
    metrics: [
      { label: 'Flight Route', value: 'SFO -> CDG', note: 'Air France AF083' },
      { label: 'Hotel Booking', value: 'Le Marais (3 Nights)', note: 'Junior Suite Verified' },
      { label: 'Quoted total', value: 'Example price', note: 'Demo Provider response' },
      { label: 'Chain Latency', value: '31 ms', note: 'Multi-Endpoint Chain' },
    ],
    actionRecommendation: 'Itinerary confirmed and calendar entries synched to executive travel schedule.',
  },
  mission_kyc: {
    documentTitle: 'International Sanctions & Compliance Verification Certificate',
    badge: 'Automated Compliance Check',
    narrative: 'Example compliance result: the page shows the shape of a sanctions and watchlist report. No live sanctions lookup runs in this demo; a confirmed Tempo receipt proves payment only.',
    metrics: [
      { label: 'Report scope', value: 'Sanctions example', note: 'OFAC, EU, UN, UK labels shown as fixture scope' },
      { label: 'Adverse hits', value: 'Example result', note: 'Demo Provider response' },
      { label: 'Risk score', value: 'Example result', note: 'Not a live screening' },
      { label: 'Proof status', value: 'Depends on run mode', note: 'Live runs include a Tempo receipt; evaluation runs stay clearly labelled' },
    ],
    actionRecommendation: 'Review the clear result before onboarding. In live mode the configured Treasury relayer records the payment receipt; evaluation mode shows the result without a chain transaction.',
  },
  mission_commerce: {
    documentTitle: 'Digital Settlement Receipt & Provider Invoice',
    badge: 'Machine-to-Provider Micro-Payment',
    narrative: 'Issued a machine-readable invoice and recorded the requested payment step. The walkthrough shows the invoice, policy decision, and any confirmed trace without inventing a settlement.',
    metrics: [
      { label: 'Invoice ID', value: 'inv_8941_tempo', note: 'Programmatic Invoice' },
      { label: 'Provider ID', value: 'provider_synapse_402', note: 'Example provider identity' },
      { label: 'Payment status', value: 'Trace-dependent', note: 'Shown when confirmed' },
      { label: 'Interchange Fee', value: '$0.00', note: 'Zero Interchange Loss' },
    ],
    actionRecommendation: 'Review the invoice and use the selected job maximum to approve the payment step; the run returns its confirmed receipt when settlement succeeds.',
  },
  mission_energy_dispatch: {
    documentTitle: 'Renewable Solar Power Dispatch & Carbon Offset Certificate',
    badge: 'Smart Grid Telemetry',
    narrative: 'Received solar inverter telemetry from Solar-Array-TX-04 (14.5 kWh at $0.082/kWh) and prepared a carbon credit record for review.',
    metrics: [
      { label: 'Grid Node', value: 'Solar-Array-TX-04', note: 'Verified Inverter' },
      { label: 'Energy Dispatched', value: '14.5 kWh', note: 'Sample telemetry value' },
      { label: 'Rate Paid', value: '$0.082 / kWh', note: 'Spot Micro-Rate' },
      { label: 'CO2 Offset', value: '12.8 kg CO2', note: 'Carbon Credit Minted' },
    ],
    actionRecommendation: 'Review the prepared dispatch and carbon record before registering it on-chain.',
  },
  mission_agentic_commerce: {
    documentTitle: 'Autonomous B2B Procurement Order & Settlement Sheet',
    badge: 'Autonomous Procurement',
    narrative: 'Received corporate purchase goal: discovered 3 vetted compute suppliers, verified compliance against international watchlists (clean), and autonomously placed micro-purchase order PO-98421-TEMPO.',
    metrics: [
      { label: 'Purchase Order', value: 'PO-98421-TEMPO', note: 'Autonomous B2B Order' },
      { label: 'Supplier Verified', value: 'Industrial Compute Ltd', note: 'Vetted & Sanctions Clean' },
      { label: 'Compliance result', value: 'Example output', note: 'Not a live screening' },
      { label: 'Paid resources', value: '$0.0030', note: 'Demo Provider catalog + compliance checks' },
    ],
    actionRecommendation: 'Purchase order prepared for review. The selected job maximum is checked before funds move; live runs record the Tempo receipt and evaluation runs remain previews.',
  },
};

export interface AgentMissionsViewProps {
  onMissionSettled?: (events: LivePaymentEvent[], totalCost: number) => void;
  agents?: any[];
  userBalanceUsd?: number;
  executionMode?: 'LIVE_TESTNET' | 'RESILIENT_SANDBOX';
  canSettleLive?: boolean;
  vaultAdminReason?: string;
}

type MissionRunOutput = {
  missionId: string;
  status: 'ALL_CONFIRMED_ON_TEMPO' | 'PARTIAL_EVALUATION_FALLBACK' | 'EVALUATION_ONLY';
  completedAt: string;
  plannedCostUsd: number;
  confirmedCount?: number;
  evaluationCount?: number;
  steps: Array<{
    name: string;
    provider: string;
    amountUsd: number;
    paymentReason: string;
    resourceResult: string;
    paymentStatus: string;
    providerDataStatus: 'EVALUATION_FIXTURE' | 'UPSTREAM_RESPONSE' | 'INTERNAL_WORK';
    receiptVerified: boolean;
    response: unknown;
    txHash?: string;
  }>;
};

export const AgentMissionsView: React.FC<AgentMissionsViewProps> = ({
  onMissionSettled,
  agents = [],
  userBalanceUsd = 0,
  executionMode = 'LIVE_TESTNET',
  canSettleLive = false,
  vaultAdminReason = 'Vault owner authorization is unavailable.',
}) => {
  const isLiveExecution = executionMode === 'LIVE_TESTNET' && canSettleLive;
  const liveOwnerAuthorizationMissing = executionMode === 'LIVE_TESTNET' && !canSettleLive;
  const { recordJobExpense, setJobBudgetLimit, executePayment } = useSynapseState();
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'RESEARCH' | 'COMPUTE' | 'MEDIA' | 'COMMERCE'>('ALL');
  // Default to flagship SOL/USDT market analysis mission
  const [selectedMissionId, setSelectedMissionId] = useState<string>('mission_sol_market_brief');
  const defaultMission = MISSIONS_DATA.find((m) => m.id === 'mission_sol_market_brief') || MISSIONS_DATA[0];
  const [activeMissionSteps, setActiveMissionSteps] = useState<MissionStep[]>(defaultMission.steps);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showTechnicalLog, setShowTechnicalLog] = useState(false);
  const [missionLogs, setMissionLogs] = useState<string[]>([
    `[System] Autonomous agent mission pipeline primed and ready.`,
    `[Budget] Spending is pre-authorized by the selected controlled limit.`,
  ]);
  const [completedMission, setCompletedMission] = useState<AgentMission | null>(null);
  const [completedMissionOutput, setCompletedMissionOutput] = useState<MissionRunOutput | null>(null);
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [missionLiveSettlement, setMissionLiveSettlement] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [copiedDeliverable, setCopiedDeliverable] = useState(false);
  const [showAllMissions, setShowAllMissions] = useState(false);
  const initialJobBudgetUsd = Number(defaultMission.steps.reduce((sum, step) => sum + step.costUsd, 0).toFixed(4));
  const [jobBudgetInput, setJobBudgetInput] = useState(initialJobBudgetUsd.toFixed(4));
  const activePolicies = agents.filter((agent) => agent.status === 'ACTIVE');
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>('');

  useEffect(() => {
    if (activePolicies.length === 0) return;
    const mission = MISSIONS_DATA.find((item) => item.id === selectedMissionId) || defaultMission;
    const missionHosts = mission.steps
      .filter((step) => step.kind !== 'INTERNAL_WORK' && step.costUsd > 0)
      .map((step) => (step.endpoint || providerEndpoint(step.provider)).toLowerCase());
    const matchingPolicy = activePolicies.find((agent) => {
      const domains = Array.isArray(agent.whitelistedDomains) ? agent.whitelistedDomains.map((domain: string) => domain.toLowerCase()) : [];
      return missionHosts.every((host) => domains.some((domain: string) => domain.includes(host)));
    }) || activePolicies[0];
    if (matchingPolicy.id !== selectedPolicyId) setSelectedPolicyId(matchingPolicy.id);
  }, [agents, selectedMissionId, selectedPolicyId]);

  const filteredMissions = MISSIONS_DATA.filter((m) => categoryFilter === 'ALL' || m.category === categoryFilter);
  const displayedMissions = showAllMissions || categoryFilter !== 'ALL' ? filteredMissions : filteredMissions.slice(0, 6);
  const currentMission = MISSIONS_DATA.find((m) => m.id === selectedMissionId) || filteredMissions[0] || MISSIONS_DATA[0];
  const totalMissionCost = currentMission.steps.reduce((acc, s) => acc + (s.kind === 'INTERNAL_WORK' ? 0 : s.costUsd), 0);

  const handleSelectMission = (mission: AgentMission) => {
    if (isExecuting) return;
    soundEngine.playClick();
    setSelectedMissionId(mission.id);
    setBudgetError(null);
    const missionBudget = mission.id === 'mission_sol_market_brief'
      ? 0.005
      : Number(mission.steps.reduce((sum, step) => sum + step.costUsd, 0).toFixed(4));
    setJobBudgetInput(missionBudget.toFixed(4));
    setActiveMissionSteps(mission.steps.map((s) => ({ ...s, status: 'idle', paymentStatus: undefined })));
    setCompletedMission(null);
    setCompletedMissionOutput(null);
    setMissionLiveSettlement(false);
    setMissionLogs([
      `Mission selected: ${mission.title}. Ready for execution.`,
      `[Policy] All planned steps fit within the selected spending limit.`,
    ]);
  };

  const handleExecuteMission = async () => {
    if (isExecuting) return;
    const requestedBudget = Number(jobBudgetInput);
    // Every click starts a new attempt. Clear the last report first so a
    // budget rejection or provider failure cannot sit beside stale success.
    const resetSteps = currentMission.steps.map((step) => ({
      ...step,
      status: 'idle' as const,
      paymentStatus: undefined,
    }));
    setActiveMissionSteps(resetSteps);
    setCompletedMission(null);
    setCompletedMissionOutput(null);
    setMissionLiveSettlement(false);
    setShowRawJson(false);
    setShowTechnicalLog(true);
    setBudgetError(null);
    if (!Number.isFinite(requestedBudget) || requestedBudget < totalMissionCost) {
      setBudgetError(`Job not started. Set at least $${totalMissionCost.toFixed(4)} for this job. No payment was sent.`);
      setMissionLogs([
        `[Budget] This job needs at least $${totalMissionCost.toFixed(4)}.`,
        `[Budget] Increase the single job limit and run again. No payment was sent.`,
      ]);
      return;
    }
    soundEngine.playClick();
    setIsExecuting(true);
    setMissionLogs([
      `[Step 1: Goal] Starting mission: "${currentMission.title}"`,
      `[Step 2: Budget Check] One job limit approved for ${currentMission.leadAgent} (Max $${requestedBudget.toFixed(4)}).`,
      ...(liveOwnerAuthorizationMissing ? ['[Testnet] Owner authorization is missing. This run is evaluation-only; no chain payment will be attempted.'] : []),
    ]);

    const updatedSteps: MissionStep[] = currentMission.steps.map((s) => ({ ...s, status: 'idle' }));
    const activeKeyId = selectedPolicyId
      || (currentMission.category === 'RESEARCH' ? 'key_cortex_research' : (activePolicies[0]?.id || 'key_quant_alpha'));
    const jobId = `mission_${currentMission.id}_${Date.now()}`;
    setJobBudgetLimit(jobId, requestedBudget);
    const settledEvents: LivePaymentEvent[] = [];
    const runtimeResponses: MissionRunOutput['steps'] = [];

    for (let i = 0; i < updatedSteps.length; i++) {
      let stepStatus: 'SETTLED' | 'SIMULATED_PASS' = 'SIMULATED_PASS';
      updatedSteps[i].status = 'running';
      setActiveMissionSteps([...updatedSteps]);

      const isPaidStep = updatedSteps[i].kind !== 'INTERNAL_WORK' && updatedSteps[i].costUsd > 0;
      if (!isPaidStep) {
        setMissionLogs((prev) => [
          ...prev,
          `[Step 3: Internal] Step ${i + 1}/${updatedSteps.length}: ${updatedSteps[i].name} uses local AI work; no provider payment is required.`,
        ]);
        await new Promise((r) => setTimeout(r, 220));
        runtimeResponses.push({
          name: updatedSteps[i].name,
          provider: 'Internal AI work',
          amountUsd: 0,
          paymentReason: updatedSteps[i].paymentReason || 'Internal work; no external provider is called.',
          resourceResult: updatedSteps[i].resourceResult || updatedSteps[i].result,
          paymentStatus: 'NOT_REQUIRED',
          providerDataStatus: 'INTERNAL_WORK',
          receiptVerified: false,
          response: {
            paymentRequired: false,
            reason: updatedSteps[i].paymentReason,
            result: updatedSteps[i].resourceResult || updatedSteps[i].result,
          },
        });
        updatedSteps[i].paymentStatus = 'NOT_REQUIRED';
        updatedSteps[i].status = 'completed';
        setActiveMissionSteps([...updatedSteps]);
        setMissionLogs((prev) => [
          ...prev,
          `[Internal] Result ready: ${updatedSteps[i].resourceResult || updatedSteps[i].result}`,
        ]);
        continue;
      }

      // Catalog missions marked as Demo Providers are fixtures, not real
      // integrations. Keep sandbox runs deterministic and offline instead of
      // attempting their placeholder public hostnames. Live runs still go
      // through the normal provider allowlist and settlement path below.
      const demoEndpoint = updatedSteps[i].endpoint || providerEndpoint(updatedSteps[i].provider);
      if (
        !isLiveExecution
        && /^Demo Provider\s*·/i.test(updatedSteps[i].provider)
        && !demoEndpoint.startsWith('/')
      ) {
        setMissionLogs((prev) => [
          ...prev,
          `[Step 3: Evaluation] Step ${i + 1}/${updatedSteps.length}: ${updatedSteps[i].name} uses a labelled sample response; no external provider was called and no payment was sent.`,
        ]);
        await new Promise((r) => setTimeout(r, 220));
        updatedSteps[i].paymentStatus = 'EVALUATION';
        updatedSteps[i].status = 'completed';
        setActiveMissionSteps([...updatedSteps]);
        runtimeResponses.push({
          name: updatedSteps[i].name,
          provider: updatedSteps[i].provider,
          amountUsd: updatedSteps[i].costUsd,
          paymentReason: updatedSteps[i].paymentReason || updatedSteps[i].name,
          resourceResult: updatedSteps[i].resourceResult || updatedSteps[i].result,
          paymentStatus: 'SIMULATED_PASS',
          providerDataStatus: 'EVALUATION_FIXTURE',
          receiptVerified: false,
          response: {
            paymentRequired: true,
            evaluationOnly: true,
            providerDataStatus: 'EVALUATION_FIXTURE',
            message: 'Labelled sample response; no provider request or payment was made.',
          },
        });
        recordJobExpense(jobId, updatedSteps[i].costUsd, false);

        const fixtureEvent: LivePaymentEvent = {
          id: `ev_mission_fixture_${Date.now()}_${i}`,
          timestamp: new Date().toLocaleTimeString(),
          agentName: currentMission.leadAgent,
          serviceName: updatedSteps[i].name,
          serviceUrl: 'Evaluation fixture · provider not called',
          amountUsd: updatedSteps[i].costUsd,
          latencyMs: 220,
          status: 'SIMULATED_PASS',
          executionMode: 'RESILIENT_SANDBOX',
          paymentMode: 'DEMO',
          blockNumber: 0,
          txHash: '',
          receiptVerified: false,
          providerDataStatus: 'EVALUATION_FIXTURE',
          liveProxyPayload: {
            providerDataStatus: 'EVALUATION_FIXTURE',
            evaluationOnly: true,
          },
        };
        settledEvents.push(fixtureEvent);
        onMissionSettled?.([fixtureEvent], updatedSteps[i].costUsd);
        setMissionLogs((prev) => [
          ...prev,
          `[Evaluation fixture] ${updatedSteps[i].result} Planned $${updatedSteps[i].costUsd.toFixed(4)}; $0.0000 charged.`,
        ]);
        continue;
      }

      const cleanEndpoint = updatedSteps[i].endpoint || providerEndpoint(updatedSteps[i].provider);
      setMissionLogs((prev) => [
        ...prev,
        isLiveExecution
          ? `[Step 3: Pay] Step ${i + 1}/${updatedSteps.length}: Paying $${updatedSteps[i].costUsd.toFixed(4)} to ${cleanEndpoint} for ${updatedSteps[i].paymentReason || updatedSteps[i].name}...`
          : `[Step 3: Evaluation] Step ${i + 1}/${updatedSteps.length}: Loading a labelled sample for ${updatedSteps[i].name}; planned $${updatedSteps[i].costUsd.toFixed(4)}, $0 charged.`,
      ]);

      await new Promise((r) => setTimeout(r, 320));

      let confirmedTxHash: string | null = null;
      try {
        const targetEndpointUrl = cleanEndpoint.startsWith('/') ? cleanEndpoint : `https://${cleanEndpoint}/v1`;
        const requestSettlement = async (evaluationOnly: boolean) => {
          const res = await executePayment({
            keyId: activeKeyId,
            targetUrl: targetEndpointUrl,
            pricePathUsd: updatedSteps[i].costUsd,
            category: currentMission.category,
            evaluationOnly,
            jobId,
            jobBudgetPathUsd: requestedBudget,
            recipient: TEMPO_RECEIVER_ADDRESS,
            serviceName: updatedSteps[i].name,
            providerName: updatedSteps[i].provider,
          });
          return res.trace;
        };

        let trace;
        try {
          trace = await requestSettlement(!isLiveExecution);
        } catch (liveError) {
          // A live testnet relay can be temporarily unavailable or reject a
          // stale on-chain session root. Keep the one-click demo usable, but
          // make the fallback explicit so it can never look like a payment.
          if (!isLiveExecution) throw liveError;
          const liveMessage = liveError instanceof Error ? liveError.message : 'Tempo settlement unavailable';
          setMissionLogs((prev) => [
            ...prev,
            `[Live fallback] ${liveMessage}`,
            `[Evaluation] Re-running this step without a debit so the mission can finish.`
          ]);
          trace = await requestSettlement(true);
        }
        stepStatus = trace.status;
        const receiptVerified = trace.receiptVerified === true
          && trace.status === 'SETTLED'
          && typeof trace.txHash === 'string'
          && /^0x[a-fA-F0-9]{64}$/.test(trace.txHash);
        confirmedTxHash = receiptVerified ? trace.txHash! : null;
        updatedSteps[i].paymentStatus = receiptVerified ? 'CONFIRMED' : 'EVALUATION';
        let providerResult: unknown = trace.liveProxyPayload || null;
        let providerDataStatus: 'EVALUATION_FIXTURE' | 'UPSTREAM_RESPONSE' | 'INTERNAL_WORK' = trace.liveProxyPayload?.providerDataStatus === 'UPSTREAM_RESPONSE'
          ? 'UPSTREAM_RESPONSE'
          : 'EVALUATION_FIXTURE';
        // Account for a confirmed on-chain debit before asking the provider
        // route for its payload. If that route fails, the receipt still counts
        // against the job's spend and must never be reported as uncharged.
        recordJobExpense(jobId, updatedSteps[i].costUsd, receiptVerified);
        if (
          receiptVerified
          && currentMission.id === 'mission_sol_market_brief'
          && cleanEndpoint === '/api/v1/market/sol-orderbook'
        ) {
          setMissionLogs((prev) => [
            ...prev,
            '[Provider] Tempo receipt confirmed. Requesting the protected SOL market-depth fixture with that receipt.',
          ]);
          const providerPayload = await fetchSettledLocalProviderResult(cleanEndpoint, trace, requestedBudget);
          providerResult = providerPayload;
          providerDataStatus = providerPayload.providerDataStatus === 'UPSTREAM_RESPONSE'
            ? 'UPSTREAM_RESPONSE'
            : 'EVALUATION_FIXTURE';
          setMissionLogs((prev) => [
            ...prev,
            `[Provider] SOL/USDT market-depth result received from the protected route (${providerDataStatus === 'EVALUATION_FIXTURE' ? 'sample data' : 'upstream data'}).`,
          ]);
        }
        runtimeResponses.push({
          name: updatedSteps[i].name,
          provider: updatedSteps[i].provider,
          amountUsd: updatedSteps[i].costUsd,
          paymentReason: updatedSteps[i].paymentReason || updatedSteps[i].name,
          resourceResult: updatedSteps[i].resourceResult || updatedSteps[i].result,
          paymentStatus: trace.status,
          providerDataStatus,
          receiptVerified,
          response: providerResult,
          txHash: receiptVerified ? trace.txHash : undefined,
        });
        const newEvent: LivePaymentEvent = {
          id: `ev_mission_${Date.now()}_${i}`,
          timestamp: new Date().toLocaleTimeString(),
          agentName: currentMission.leadAgent,
          serviceName: updatedSteps[i].name,
          serviceUrl: cleanEndpoint,
          amountUsd: updatedSteps[i].costUsd,
          latencyMs: trace.latencyMs,
          status: trace.status,
          executionMode: trace.executionMode || 'RESILIENT_SANDBOX',
          blockNumber: trace.blockNumber,
          nonce2D: trace.nonce2D,
          txHash: trace.txHash,
          receiptVerified,
          providerDataStatus,
          eip712Signature: trace?.eip712Signature,
          merkleProof: trace?.merkleProof,
          merkleRoot: trace?.merkleRoot,
          // The step may have a real payment receipt, while the mission
          // deliverable is intentionally a hackathon demo output. Preserve
          // both facts instead of making one appear to prove the other.
          liveProxyPayload: {
            ...(providerResult && typeof providerResult === 'object' ? providerResult as Record<string, unknown> : {}),
            providerDataStatus,
          },
        };

        settledEvents.push(newEvent);
        if (receiptVerified) {
          setMissionLiveSettlement(true);
        }
        if (onMissionSettled) {
          onMissionSettled([newEvent], updatedSteps[i].costUsd);
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Settlement failed';
        updatedSteps[i].paymentStatus = confirmedTxHash ? 'CONFIRMED' : 'FAILED';
        updatedSteps[i].status = 'failed';
        setActiveMissionSteps([...updatedSteps]);
        setMissionLogs((prev) => confirmedTxHash
          ? [
              ...prev,
              `[Provider result failed after payment] ${message}`,
              `[Receipt remains confirmed] ${confirmedTxHash}. No retry payment was sent.`,
            ]
          : [
              ...prev,
              `[Payment failed] ${updatedSteps[i].name}: ${message}`,
              `[No charge recorded] The mission stopped before this resource was confirmed.`,
            ]);
        if (confirmedTxHash) setMissionLiveSettlement(true);
        setShowTechnicalLog(true);
        setIsExecuting(false);
        return;
      }

      updatedSteps[i].status = 'completed';
      setActiveMissionSteps([...updatedSteps]);
      if (stepStatus === 'SETTLED') soundEngine.playSettlementChime();

      setMissionLogs((prev) => [
        ...prev,
        `${stepStatus === 'SETTLED' ? '[Payment confirmed]' : '[Evaluation step]' } Resource received: ${updatedSteps[i].result}`,
      ]);
    }

    const payableExecutedSteps = runtimeResponses.filter((r) => r.amountUsd > 0);
    const confirmedCount = payableExecutedSteps.filter((r) => r.receiptVerified).length;
    const evaluationCount = payableExecutedSteps.length - confirmedCount;
    const confirmedSpendUsd = payableExecutedSteps.reduce((sum, step) => sum + (step.receiptVerified ? step.amountUsd : 0), 0);

    let missionSettlementStatus: 'ALL_CONFIRMED_ON_TEMPO' | 'PARTIAL_EVALUATION_FALLBACK' | 'EVALUATION_ONLY' = 'EVALUATION_ONLY';
    if (payableExecutedSteps.length > 0 && confirmedCount === payableExecutedSteps.length) {
      missionSettlementStatus = 'ALL_CONFIRMED_ON_TEMPO';
    } else if (confirmedCount > 0) {
      missionSettlementStatus = 'PARTIAL_EVALUATION_FALLBACK';
    } else {
      missionSettlementStatus = 'EVALUATION_ONLY';
    }

    const missionHasLiveSettlement = missionSettlementStatus === 'ALL_CONFIRMED_ON_TEMPO';
    setMissionLiveSettlement(missionHasLiveSettlement);
    setCompletedMissionOutput({
      missionId: currentMission.id,
      status: missionSettlementStatus,
      completedAt: new Date().toISOString(),
      plannedCostUsd: totalMissionCost,
      confirmedCount,
      evaluationCount,
      steps: runtimeResponses,
    });
    setCompletedMission(currentMission);
    setIsExecuting(false);
    setMissionLogs((prev) => [
      ...prev,
      `[Step 4: Finished] Mission complete! Planned input: $${totalMissionCost.toFixed(4)}; confirmed payment: $${confirmedSpendUsd.toFixed(4)}.`,
      missionSettlementStatus === 'ALL_CONFIRMED_ON_TEMPO'
        ? `[Settlement] 100% of payable steps (${confirmedCount}/${payableExecutedSteps.length}) confirmed with Tempo L1 receipts.`
        : missionSettlementStatus === 'PARTIAL_EVALUATION_FALLBACK'
        ? `[Settlement] Partial: ${confirmedCount} live paid on Tempo L1, ${evaluationCount} completed via evaluation fallback.`
        : `[Evaluation] All steps completed in resilient evaluation mode.`,
    ]);
  };

  return (
    <div id="section-missions-job-budget" className="space-y-6 font-sans">
      {/* Header */}
      <div className="ui-section flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-3xl border border-[#d7ff4f]/25 bg-gradient-to-br from-[#d7ff4f]/[0.09] via-white/[.035] to-transparent p-6 sm:p-8 shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-white/[0.05] text-zinc-300 border border-white/10">
              <Compass className="w-4 h-4 text-[#d7ff4f]" />
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              What jobs can you delegate to an AI workforce?
            </h2>
          </div>
          <p className="ui-explainer text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Choose a job. The workforce selects approved resources, stays within one maximum, and returns one result. Sample data is labelled; only a confirmed Tempo receipt proves payment.
          </p>
        </div>
      </div>

      {/* Category Filtering Tabs */}
      <div className="mobile-scrollbar-hidden flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: `Job examples (${MISSIONS_DATA.length})` },
          { id: 'RESEARCH', label: `Research (${MISSIONS_DATA.filter((m) => m.category === 'RESEARCH').length})` },
          { id: 'COMPUTE', label: `Compute (${MISSIONS_DATA.filter((m) => m.category === 'COMPUTE').length})` },
          { id: 'MEDIA', label: `Media (${MISSIONS_DATA.filter((m) => m.category === 'MEDIA').length})` },
          { id: 'COMMERCE', label: `Business (${MISSIONS_DATA.filter((m) => m.category === 'COMMERCE').length})` },
        ].map((tab) => {
          const isSelected = categoryFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setCategoryFilter(tab.id as any);
              }}
              className={`ui-interactive px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#d7ff4f] text-[#08090c] font-bold shadow-[0_0_15px_rgba(215,255,79,0.2)]'
                  : 'bg-white/[.03] text-zinc-400 hover:text-zinc-200 hover:bg-white/[.07] border border-white/[.08]'
              }`}
              data-selected={isSelected}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Top Mission Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {displayedMissions.map((mission) => {
          const Icon = mission.icon;
          const isSelected = selectedMissionId === mission.id;
          const missionCost = mission.steps.reduce((acc, s) => acc + s.costUsd, 0);

          return (
            <button
              key={mission.id}
              id={mission.id === 'mission_sol_market_brief' ? 'tour-sol-mission' : undefined}
              type="button"
              onClick={() => handleSelectMission(mission)}
              disabled={isExecuting}
              className={`ui-interactive p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
                isSelected
                  ? 'bg-[#d7ff4f]/[0.08] border-[#d7ff4f]/70 ring-2 ring-[#d7ff4f]/25 shadow-md'
                  : 'bg-white/[.025] border-white/[.08] hover:border-white/20 hover:bg-white/[.05]'
              }`}
              aria-pressed={isSelected}
              data-selected={isSelected}
            >
              {mission.isFeatured && (
                <div className="absolute -top-2.5 right-3 bg-[#d7ff4f] text-[#08090c] text-[9px] font-mono font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-[#08090c]">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  <span>FEATURED JOB</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between gap-1.5 mb-2">
                  <span className="text-[9.5px] font-mono font-bold px-2 py-0.5 rounded bg-white/[0.04] border border-white/10 text-zinc-300 uppercase">
                    {mission.category}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#d7ff4f]">
                    From ${missionCost.toFixed(4)}
                  </span>
                  {isSelected && <span className="text-[9px] font-mono font-bold text-[#d7ff4f] flex items-center gap-1"><Check className="w-3 h-3" /> SELECTED</span>}
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-300 shrink-0">
                    <Icon className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-bold text-white text-xs sm:text-sm leading-snug line-clamp-1">
                      {mission.title}
                    </h3>
                    <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                      {mission.leadAgent}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                {mission.goal}
              </p>

              <div className="pt-2 border-t border-white/[.06] flex items-center justify-between text-[10px] font-mono text-zinc-400 gap-2">
                <span>{mission.steps.length} workflow steps</span>
                {' '}
                <span className="text-[#d7ff4f] flex items-center gap-1 font-semibold shrink-0">
                  <span>View Details</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Expand / Collapse all missions button */}
      {categoryFilter === 'ALL' && (
        <div className="flex justify-center pt-0.5 pb-1">
          <button
            type="button"
            onClick={() => setShowAllMissions(!showAllMissions)}
            className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-mono text-zinc-300 hover:text-white transition flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <span>{showAllMissions ? 'Show Top 6 Jobs Only' : `View All ${MISSIONS_DATA.length} Available Jobs`}</span>
            {showAllMissions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}

      {/* Selected Mission Execution Stage */}
      <div className="ui-section rounded-3xl border border-white/[.14] bg-gradient-to-b from-white/[.065] via-white/[.03] to-transparent backdrop-blur-md p-5 sm:p-7 space-y-6 shadow-[0_22px_70px_rgba(0,0,0,0.28)]">
        {/* Stage Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[.08] pb-5">
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {currentMission.title}
            </h3>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
            {currentMission.goal}
          </p>
          <p className="text-[11px] text-zinc-500 max-w-2xl leading-relaxed">
            This section shows the exact job, its planned cost, the steps that will run, and the result you can review afterward.
          </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 shrink-0">
            <div className="ui-meta px-3.5 py-2 rounded-xl bg-white/[.03] border border-white/[.08] text-left">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">{isLiveExecution ? 'Paid resources' : 'Sample input value'}</div>
              <div className="text-base sm:text-lg font-mono font-bold text-[#d7ff4f]">
                ${totalMissionCost.toFixed(4)} USD
              </div>
              <div className="text-[9px] text-zinc-500">{isLiveExecution ? 'Internal work is free' : 'Planned value · $0 charged'}</div>
            </div>

            <label className="job-budget-field ui-selector px-3.5 py-2 rounded-xl bg-[#d7ff4f]/[.06] border border-[#d7ff4f]/25 text-left">
              <span className="text-[10px] font-mono text-[#d7ff4f] uppercase block">Max for this job</span>
              <span className="flex items-center gap-1 text-base sm:text-lg font-mono font-bold text-white">
                <span className="text-zinc-400">$</span>
                <input
                  aria-label="Maximum spend for this job"
                  title="Enter the maximum amount for this job"
                  type="number"
                  min={totalMissionCost.toFixed(4)}
                  step="0.0001"
                  value={jobBudgetInput}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setJobBudgetInput(nextValue);
                    setBudgetError(null);
                  }}
                  className="job-budget-input w-24 rounded-md border border-[#d7ff4f]/45 bg-[#08090c]/75 px-2 py-1 outline-none text-white font-mono cursor-text focus:border-[#d7ff4f] focus:ring-2 focus:ring-[#d7ff4f]/25"
                />
              </span>
              <span className="text-[10px] text-zinc-400 block">Type the maximum here · agent rules are automatic</span>
            </label>

            <button
              type="button"
              onClick={handleExecuteMission}
              disabled={isExecuting}
              className="py-3 px-6 rounded-xl bg-[#d7ff4f] hover:bg-[#cbf540] text-[#08090c] font-black text-xs font-mono uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(215,255,79,0.3)] hover:shadow-[0_0_25px_rgba(215,255,79,0.45)] active:scale-95 flex items-center justify-center gap-2"
            >
              {isExecuting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
              <span aria-live="polite">{isExecuting ? 'Agent executing…' : liveOwnerAuthorizationMissing ? 'Run evaluation' : 'Run this job'}</span>
            </button>
          </div>
        </div>

        {liveOwnerAuthorizationMissing && (
          <div role="status" aria-live="polite" className="flex items-start gap-2 rounded-xl border border-amber-300/35 bg-amber-300/[.08] px-3.5 py-3 text-sm text-amber-100">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
            <span>{vaultAdminReason} Running this mission will use evaluation samples only; no payment will be sent.</span>
          </div>
        )}

        {budgetError && (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-amber-300/35 bg-amber-300/[.08] px-3.5 py-3 text-sm text-amber-100">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
            <span>{budgetError}</span>
          </div>
        )}

        {/* Verification Status Banner */}
        <div className="flex items-center justify-end text-xs text-zinc-500">
          <button
            type="button"
            onClick={() => setShowTechnicalLog(!showTechnicalLog)}
            className="text-[10.5px] font-mono text-zinc-400 hover:text-[#d7ff4f] flex items-center gap-1 cursor-pointer shrink-0 transition"
          >
            <span>{showTechnicalLog ? 'Hide details' : 'Technical details'}</span>
            {showTechnicalLog ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Step-by-Step Execution Sequence & Live Progress Bar */}
        {(isExecuting || showTechnicalLog) && <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 block uppercase font-mono tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#d7ff4f] animate-pulse" />
              <span>Execution Pipeline ({activeMissionSteps.filter((s) => s.status === 'completed').length}/{activeMissionSteps.length} Completed)</span>
            </span>
            <span className="text-[11px] font-mono text-[#d7ff4f] font-bold">
              {Math.round((activeMissionSteps.filter((s) => s.status === 'completed').length / (activeMissionSteps.length || 1)) * 100)}% Complete
            </span>
          </div>

          {/* Visual Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
            <div 
              className="h-full bg-[#d7ff4f] transition-all duration-300 ease-out shadow-[0_0_10px_rgba(215,255,79,0.5)]"
              style={{ 
                width: `${Math.round((activeMissionSteps.filter((s) => s.status === 'completed').length / (activeMissionSteps.length || 1)) * 100)}%` 
              }}
            />
          </div>

          <div className="space-y-2">
            {activeMissionSteps.map((step, idx) => {
              const isPaidStep = step.kind !== 'INTERNAL_WORK' && step.costUsd > 0;
              const stepStatusLabel = step.status === 'completed'
                ? (isPaidStep ? (step.paymentStatus || (missionLiveSettlement ? 'CONFIRMED' : 'EVALUATION')) : 'INTERNAL')
                : step.status === 'failed' ? 'FAILED' : step.status === 'running' ? (isPaidStep ? 'PREPARING' : 'RUNNING') : 'READY';
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                    step.status === 'completed'
                      ? 'bg-[#d7ff4f]/[0.06] border-[#d7ff4f]/30'
                      : step.status === 'failed'
                      ? 'bg-red-500/[0.06] border-red-400/30'
                      : step.status === 'running'
                      ? 'bg-white/[0.08] border-[#d7ff4f]/50'
                      : 'bg-white/[.025] border-white/[.08]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                      step.status === 'completed'
                        ? 'bg-[#d7ff4f] text-[#08090c]'
                        : step.status === 'failed'
                        ? 'bg-red-400 text-[#08090c]'
                        : step.status === 'running'
                        ? 'bg-white text-black animate-pulse'
                        : 'bg-white/10 text-zinc-400'
                    }`}>
                      {step.status === 'completed' ? <Check className="w-3.5 h-3.5" /> : step.status === 'failed' ? '!' : idx + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white">{step.name}</span>
                        <span className={`text-[10px] font-mono ${isPaidStep ? 'text-amber-300' : 'text-sky-300'}`}>({step.provider})</span>
                      </div>
                      <span className="text-[11px] text-zinc-400 block mt-0.5 font-mono">
                        {step.status === 'completed'
                          ? (step.resourceResult || step.result)
                          : step.status === 'failed'
                          ? 'Payment failed — mission stopped'
                          : step.status === 'running'
                          ? (isPaidStep ? 'Authorizing settlement...' : 'Running internal work...')
                          : 'Pending execution...'}
                      </span>
                      <span className="text-[10px] text-zinc-500 block mt-1 max-w-xl leading-relaxed">
                        {isPaidStep
                          ? `${step.paymentReason || 'External resource request'} Returns: ${step.resourceResult || step.result}`
                          : 'Internal AI work · no external provider call · no payment'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto font-mono text-xs shrink-0">
                    <span className="text-white font-bold">{isPaidStep ? `$${step.costUsd.toFixed(4)}` : 'No payment'}</span>
                    {step.status === 'completed' ? (
                      isPaidStep ? (
                        <SynapseStatusBadge status={step.paymentStatus === 'CONFIRMED' ? 'CONFIRMED' : 'DEMO'} size="sm" />
                      ) : (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-sky-500/10 text-sky-300 border-sky-500/30">
                          INTERNAL
                        </span>
                      )
                    ) : step.status === 'running' ? (
                      <SynapseStatusBadge status="PENDING" size="sm" />
                    ) : step.status === 'failed' ? (
                      <SynapseStatusBadge status="FAILED" size="sm" />
                    ) : (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded border bg-white/5 text-zinc-500 border-white/10">
                        READY
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>}

        {/* Live Mission Terminal Logs (Collapsible) */}
        {showTechnicalLog && (
          <div className="ui-meta p-4 rounded-xl bg-white/[.03] backdrop-blur-md border border-white/[.08] space-y-2 font-mono text-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 border-b border-white/[.08] pb-2 font-sans font-semibold">
              <span className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-[#d7ff4f]" />
                <span className="text-white font-mono">Technical Terminal Output</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500">Autonomous Orchestrator</span>
            </div>

            <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
              {missionLogs.length === 0 ? (
                <span className="text-zinc-600 text-xs italic">Awaiting mission dispatch...</span>
              ) : (
                missionLogs.map((log, i) => (
                  <div key={i} className="text-zinc-300 text-[11.5px] leading-relaxed">
                    <span className="text-[#d7ff4f] mr-1.5">▸</span>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Completed Deliverable Box */}
        {completedMission && (() => {
          const deliverable = MISSION_DELIVERABLES[completedMission.id] || {
            documentTitle: `Demo Result: ${completedMission.title}`,
            badge: completedMission.category,
            narrative: `${completedMission.leadAgent} completed ${completedMission.steps.length} controlled work steps for $${totalMissionCost.toFixed(4)} within the policy cap and delivered the result for review.`,
            metrics: Object.entries(completedMission.simulatedOutput)
              .filter(([k]) => k !== 'status' && k !== 'totalCostUsd' && k !== 'settlementTimeMs' && !k.startsWith('_'))
              .slice(0, 4)
              .map(([key, value]) => ({
                label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()),
                value: String(value),
                note: 'Demo output'
              })),
            actionRecommendation: completedMission.finalDeliverable,
          };
          const runtimeOutput = completedMissionOutput && completedMissionOutput.missionId === completedMission.id
            ? completedMissionOutput
            : null;
          const displayDeliverable = runtimeOutput
            ? {
                ...deliverable,
                narrative: `${runtimeOutput.status === 'ALL_CONFIRMED_ON_TEMPO' ? 'Paid' : 'Sample'} resource steps: ${runtimeOutput.steps.filter((step) => step.providerDataStatus !== 'INTERNAL_WORK').length}; internal work steps: ${runtimeOutput.steps.filter((step) => step.providerDataStatus === 'INTERNAL_WORK').length}. Payment status is recorded separately from provider data.`,
                metrics: [
                  { label: 'Steps completed', value: `${runtimeOutput.steps.length} / ${completedMission.steps.length}`, note: 'Runtime execution' },
                  { 
                    label: 'Payment status', 
                    value: runtimeOutput.status === 'ALL_CONFIRMED_ON_TEMPO' 
                      ? '100% Live Confirmed (Tempo L1)' 
                      : runtimeOutput.status === 'PARTIAL_EVALUATION_FALLBACK'
                      ? `Partial: ${runtimeOutput.confirmedCount} Live / ${runtimeOutput.evaluationCount} Evaluation`
                      : 'Evaluation Mode (No Debit)', 
                    note: 'On-chain proof' 
                  },
                  { label: 'Provider data', value: runtimeOutput.steps.some((step) => step.providerDataStatus === 'UPSTREAM_RESPONSE') ? 'Upstream + internal work' : runtimeOutput.steps.some((step) => step.providerDataStatus === 'EVALUATION_FIXTURE') ? 'Demo Provider response' : 'Internal work only', note: 'Data provenance' },
                  { label: 'Planned cost', value: `$${runtimeOutput.plannedCostUsd.toFixed(4)} USD`, note: 'One job maximum' },
                ],
                actionRecommendation: `${completedMission.finalDeliverable}. Review the runtime responses before treating the result as production data.`,
              }
            : {
                ...deliverable,
                documentTitle: `Expected output preview · ${completedMission.title}`,
                narrative: `This is the expected package shape for ${completedMission.title}; no resource request has been dispatched yet. Run the mission to replace this preview with the responses returned by the settlement flow.`,
                metrics: deliverable.metrics.map((metric) => ({ ...metric, note: 'Illustrative preview' })),
                actionRecommendation: 'Run this mission to populate the result with runtime responses and its actual payment status.',
              };
          const missionStatusText = runtimeOutput?.status === 'ALL_CONFIRMED_ON_TEMPO'
            ? 'Confirmed on Tempo (All Steps Settled)'
            : runtimeOutput?.status === 'PARTIAL_EVALUATION_FALLBACK'
            ? `Partial Settlement (${runtimeOutput.confirmedCount} Live, ${runtimeOutput.evaluationCount} Evaluation)`
            : runtimeOutput
            ? 'Evaluation complete (No On-Chain Transfer)'
            : isLiveExecution
            ? 'Live receipt pending'
            : 'Preview — not run';

          return (
            <div data-state={missionLiveSettlement ? 'success' : runtimeOutput ? 'evaluation' : 'preview'} className="ui-result p-5 sm:p-6 rounded-2xl bg-white/[.03] backdrop-blur-md border border-white/[.08] space-y-5 animate-in fade-in duration-300">
              {/* Document Header & Stamping */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-white/[0.05] text-zinc-300 border border-white/10 shrink-0 mt-0.5">
                    <FileText className="w-5 h-5 text-[#d7ff4f]" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mt-1">
                      {displayDeliverable.documentTitle}
                    </h3>
                    <span className="text-xs text-zinc-400 font-sans block mt-0.5">
                      {missionStatusText}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      if (navigator.clipboard?.writeText) {
                        const copyText = `${displayDeliverable.documentTitle}\n\nExecutive Overview:\n${displayDeliverable.narrative}\n\nKey Findings:\n${displayDeliverable.metrics.map(m => `• ${m.label}: ${m.value} (${m.note})`).join('\n')}\n\nAction:\n${displayDeliverable.actionRecommendation}\n\nPlanned amount: $${totalMissionCost.toFixed(4)} USD${missionLiveSettlement ? ' · confirmed on Tempo L1' : ' · evaluation only'}`;
                        navigator.clipboard.writeText(copyText).catch(() => {});
                      }
                      setCopiedDeliverable(true);
                      setTimeout(() => setCopiedDeliverable(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/15 border border-white/10 hover:border-white/30 text-zinc-200 hover:text-white text-xs font-mono transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedDeliverable ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300 font-bold">Copied Document!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Copy Document</span>
                      </>
                    )}
                  </button>
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold ${missionLiveSettlement ? 'bg-[#d7ff4f]/10 text-[#d7ff4f] border border-[#d7ff4f]/30' : 'bg-white/[.05] text-zinc-300 border border-white/10'}`}>
                    {missionStatusText} · ${totalMissionCost.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="ui-explainer p-4 rounded-xl bg-white/[0.025] border border-white/[0.08] space-y-2">
                  <span className="text-[10.5px] font-mono uppercase font-bold text-zinc-300 flex items-center gap-1.5 tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#d7ff4f]" />
                  <span>{runtimeOutput ? 'Runtime result:' : 'Expected output preview:'}</span>
                </span>
                <p className="text-sm text-zinc-100 leading-relaxed font-sans font-medium">
                  {displayDeliverable.narrative}
                </p>
              </div>

              {/* Confirmed On-Chain Tempo L1 Transactions */}
              {runtimeOutput && runtimeOutput.steps.some((s) => s.receiptVerified && s.txHash) && (
                <div className="p-4 rounded-xl bg-[#0c0e14]/90 border border-[#d7ff4f]/30 space-y-3 shadow-[0_0_20px_rgba(215,255,79,0.08)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold text-[#d7ff4f] flex items-center gap-1.5 tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#d7ff4f]" />
                      <span>Confirmed Tempo L1 Transactions:</span>
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#d7ff4f]/15 text-[#d7ff4f] border border-[#d7ff4f]/30 font-bold">
                      ON-CHAIN VERIFIED
                    </span>
                  </div>
                  <div className="space-y-2 font-mono text-xs">
                    {runtimeOutput.steps.filter((s) => s.receiptVerified && s.txHash).map((s, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[#d7ff4f] font-bold text-[10px] px-1.5 py-0.5 rounded bg-[#d7ff4f]/10 border border-[#d7ff4f]/20">Step 0{idx + 1}</span>
                          <span className="text-zinc-200 truncate text-xs font-semibold">{s.name}</span>
                          <span className="text-zinc-500 text-[10px] font-mono hidden md:inline">({s.txHash?.slice(0, 10)}...{s.txHash?.slice(-8)})</span>
                        </div>
                        <a
                          href={tempoTransactionUrl(s.txHash)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 rounded bg-[#d7ff4f] hover:bg-[#cbf540] text-[#08090c] font-black text-xs transition flex items-center justify-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
                        >
                          <span>View on Tempo Explorer</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Structured Key Findings Matrix */}
              {showTechnicalLog && <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 block tracking-wider">
                  Key findings:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {displayDeliverable.metrics.map((m, idx) => (
                    <div key={idx} className="ui-meta p-3.5 rounded-xl bg-white/[.025] border border-white/[0.08] flex flex-col justify-between">
                      <span className="text-[10.5px] font-mono text-zinc-400 uppercase font-semibold">{m.label}</span>
                      <span className="text-sm sm:text-base font-bold text-white mt-1 font-mono tracking-tight break-words">
                        {m.value}
                      </span>
                      <span className="text-[9.5px] text-zinc-500 font-mono mt-1 pt-1 border-t border-white/[0.04] block">
                        {m.note}
                      </span>
                    </div>
                  ))}
                </div>
              </div>}

              {/* Actionable Directive */}
              {showTechnicalLog && <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 block tracking-wider">
                    Recommended next step
                  </span>
                  <p className="text-zinc-200 text-xs font-semibold leading-snug">
                    {displayDeliverable.actionRecommendation}
                  </p>
                  <span className="text-[11px] text-zinc-400 block mt-0.5 font-sans">
                    Replaces: <strong className="text-zinc-300">{completedMission.oldWayComparison}</strong>
                  </span>
                </div>
                <div className="shrink-0 text-center sm:text-right">
                  <span className="px-3 py-1.5 rounded-lg bg-[#d7ff4f] text-[#08090c] font-bold font-mono text-[11px] inline-block shadow-sm">
                    {missionStatusText}
                  </span>
                </div>
              </div>}

              {/* Settlement Verification & What This Proves Proof */}
              {showTechnicalLog && <div className="ui-meta p-3.5 rounded-xl bg-white/[.025] border border-white/10 text-xs space-y-2">
                <div className="flex items-center gap-2 text-zinc-200 font-bold text-xs uppercase">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{missionLiveSettlement ? 'Settlement verified • mission outcome' : runtimeOutput ? 'Evaluation complete • mission outcome' : 'Preview • mission not run'}</span>
                </div>
                <div className="text-zinc-300 text-[11.5px] leading-relaxed space-y-1">
                  <p><strong className="text-white">{runtimeOutput ? 'What happened:' : 'Before running:'}</strong> {runtimeOutput ? `The run requested only approved external resources ($${totalMissionCost.toFixed(4)} planned); internal reasoning and formatting steps were completed without payment.` : 'This block describes the result shape only; no provider request or payment has been dispatched.'}</p>
                  <p><strong className="text-[#d7ff4f]">What this proves:</strong> The agent can pass payment checks and acquire approved resources within a fixed spending limit. A confirmed Tempo receipt proves the payment path; the sample result does not claim live external data.</p>
                </div>
              </div>}

              {/* Cryptographic Technical Details for Jury */}
              {runtimeOutput && runtimeOutput.steps.some((s) => s.receiptVerified && Boolean(s.txHash)) && (
                <div className="pt-2">
                  <SynapseTechnicalDetails
                    signature={runtimeOutput.steps.find((s) => s.receiptVerified && Boolean(s.txHash))?.txHash}
                    nonce2D="0x01:0x76a402"
                    tip20Memo={`Synapse402 Mission: ${completedMission.title}`}
                    defaultExpanded={false}
                  />
                </div>
              )}

              {/* Developer Raw JSON Toggle */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="text-[10.5px] font-mono text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>{showRawJson ? 'Hide' : 'Show'} Technical JSON Payload</span>
                  {showRawJson ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {showRawJson && (
                  <pre className="mt-2 p-3.5 rounded-xl bg-white/[.025] border border-white/[.08] text-zinc-200 text-[11px] font-mono overflow-x-auto leading-relaxed">
                    {JSON.stringify({
                      missionId: completedMission.id,
                      deliverableTitle: displayDeliverable.documentTitle,
                      executiveSummary: displayDeliverable.narrative,
                      findings: displayDeliverable.metrics,
                      action: displayDeliverable.actionRecommendation,
                      output: runtimeOutput || { status: 'not_run' },
                      settlementProof: "Available when the connected backend returns a confirmed payment trace."
                    }, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
