import React, { useState } from 'react';
import { 
  Compass, Play, CheckCircle2, ArrowRight, Zap, Clock, ShieldCheck, 
  Search, Plane, Code2, BookOpen, Languages, ShieldAlert, ShoppingCart, 
  Bot, Sparkles, RefreshCw, Layers, DollarSign, Check, ChevronRight,
  Database, Cpu, Image, Mic, FileText, Globe, Radio, Shield, BarChart3,
  Terminal, Boxes, FileSpreadsheet, Copy, ChevronDown, ChevronUp, Star
} from 'lucide-react';
import { soundEngine } from '../utils/audioEffects';
import { LivePaymentEvent } from '../types/synapse402';

export interface MissionStep {
  name: string;
  provider: string;
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

export const MISSIONS_DATA: AgentMission[] = [
  // ----------------------------------------------------
  // CATEGORY 1: RESEARCH (4 MISSIONS)
  // ----------------------------------------------------
  {
    id: 'mission_paywall',
    title: 'Research Paper Access',
    category: 'RESEARCH',
    leadAgent: 'Academic Reader Bot',
    goal: 'Resolve a paper, request licensed access, and return the document in agent-ready format.',
    icon: BookOpen,
    isFeatured: true,
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
      { name: 'Verify paper license', provider: 'api.academic-licensing.org (Sample provider)', costUsd: 0.0005, status: 'idle', result: 'Micro-License Signed' },
      { name: 'Download full text (Markdown)', provider: 'api.academic-licensing.org (Sample provider)', costUsd: 0.0005, status: 'idle', result: 'Full Paper Streamed (4.8k words)' },
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
      totalCostUsd: 0.0033,
      settlementTimeMs: 24,
      status: 'MISSION_SUCCESS',
    },
    steps: [
      { name: 'Normalize licensed filing tables', provider: 'api.financial-normalizer.io (Sample provider)', costUsd: 0.0015, status: 'idle', result: 'Financial Tables Parsed' },
      { name: 'Review licensed L2 snapshot', provider: 'api.market-depth.net (Sample provider)', costUsd: 0.0010, status: 'idle', result: 'Example depth matrix reviewed' },
      { name: 'Run valuation model', provider: 'api.deepseek.com (Sample provider)', costUsd: 0.0008, status: 'idle', result: 'Fair Value Estimated ($245.80)' },
    ],
  },
  {
    id: 'mission_commodities',
    title: 'Global Freight & Metals Check',
    category: 'RESEARCH',
    leadAgent: 'Macro Intelligence Bot',
    goal: 'Compare licensed freight and metals reference feeds, then score supply chain risk.',
    icon: Globe,
    oldWayComparison: 'Enterprise commodities terminal ($25k/yr contract); pay only for the licensed checks used',
    finalDeliverable: 'Logistics index report with copper pricing and bottleneck warnings',
    simulatedOutput: {
      balticDryIndex: 1842,
      copperSpotUsd: '$4.12/lb',
      freightCostIndex: '+2.4%',
      bottleneckRisk: 'Low',
      totalCostUsd: 0.0035,
      status: 'MISSION_SUCCESS',
    },
    steps: [
      { name: 'Review licensed freight index', provider: 'api.freight-intelligence.net (Sample provider)', costUsd: 0.0015, status: 'idle', result: 'Vessel Density Parsed' },
      { name: 'Review licensed metals reference', provider: 'api.metals-spot.io (Sample provider)', costUsd: 0.0010, status: 'idle', result: 'LME Quotes Ingested' },
      { name: 'Score supply risk', provider: 'api.deepseek.com (Sample provider)', costUsd: 0.0010, status: 'idle', result: 'Supply Chain Score Generated' },
    ],
  },
  {
    id: 'mission_crypto_skew',
    title: 'Market Liquidity & Spread Analysis',
    category: 'RESEARCH',
    leadAgent: 'Market Depth Bot',
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
      totalCostUsd: 0.0025,
      status: 'MISSION_SUCCESS',
    },
    steps: [
      { name: 'Review licensed spot depth snapshot', provider: 'api.market-depth-mesh.io (Sample provider)', costUsd: 0.0008, status: 'idle', result: 'Example spot depth reviewed' },
      { name: 'Review licensed derivatives snapshot', provider: 'api.derivatives-depth.io (Sample provider)', costUsd: 0.0012, status: 'idle', result: 'Example derivatives depth mapped' },
      { name: 'Compute spread discrepancy', provider: 'api.deepseek.com (Sample provider)', costUsd: 0.0005, status: 'idle', result: 'Spread Discrepancy Calculated' },
    ],
  },

  // ----------------------------------------------------
  // CATEGORY 2: CODE & COMPUTE (4 MISSIONS)
  // ----------------------------------------------------
  {
    id: 'mission_sandbox',
    title: 'Run Untrusted Code in Cloud Sandbox',
    category: 'COMPUTE',
    leadAgent: 'Code Security Bot',
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
      { name: 'Provision sandbox runtime', provider: 'api.sandbox-python.dev (Sandbox Provider)', costUsd: 0.0025, status: 'idle', result: 'Runtime Ready (Python 3.11)' },
      { name: 'Run & profile script', provider: 'api.sandbox-python.dev (Sandbox Provider)', costUsd: 0.0025, status: 'idle', result: 'Execution Complete (Exit Code 0)' },
    ],
  },
  {
    id: 'mission_mesh_3d',
    title: 'Convert 3D Model & Check Geometry',
    category: 'COMPUTE',
    leadAgent: '3D Geometry Bot',
    goal: 'Compile raw 3D mesh to GLTF format and calculate bounding boxes.',
    icon: Layers,
    oldWayComparison: 'Pay only per 3D compile — no idle GPU capacity',
    finalDeliverable: 'Compiled GLTF model with pre-calculated bounding coordinates',
    simulatedOutput: {
      meshFormat: 'GLTF 2.0 Binary',
      verticesCount: 142000,
      occlusionCulling: 'PASS',
      totalCostUsd: 0.0045,
      status: 'MISSION_SUCCESS',
    },
    steps: [
      { name: 'Compile raw mesh to GLTF', provider: 'api.mesh-compiler.net (Sample provider)', costUsd: 0.0025, status: 'idle', result: 'GLTF Asset Generated (142k verts)' },
      { name: 'Extract bounding box matrix', provider: 'api.mesh-compiler.net (Sample provider)', costUsd: 0.0020, status: 'idle', result: 'Bounding Box Matrix Verified' },
    ],
  },
  {
    id: 'mission_smart_contract_audit',
    title: 'Smart Contract Security Check',
    category: 'COMPUTE',
    leadAgent: 'Security Auditor Bot',
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
      { name: 'Run bytecode analyzer', provider: 'api.contract-analyzer.io (Sample provider)', costUsd: 0.0020, status: 'idle', result: 'Static Analysis Clean' },
      { name: 'Check invariant proofs', provider: 'api.smt-solver.io (Sample provider)', costUsd: 0.0020, status: 'idle', result: '32/32 Formal Invariants Proven' },
    ],
  },
  {
    id: 'mission_sql_optimizer',
    title: 'Optimize Slow Database Query',
    category: 'COMPUTE',
    leadAgent: 'Database Architect Bot',
    goal: 'Analyze query plan, test index changes, and output faster query rewrite.',
    icon: Database,
    oldWayComparison: 'Enterprise APM monitoring subscription ($80/mo)',
    finalDeliverable: 'Rewritten SQL plan with index recommendations and benchmark',
    simulatedOutput: {
      originalCost: 4520.12,
      optimizedCost: 112.40,
      latencyReduction: '88.4%',
      indexRecommendation: 'CREATE INDEX idx_settlement_2d ON trades(nonce_2d, block)',
      totalCostUsd: 0.0030,
      status: 'MISSION_SUCCESS',
    },
    steps: [
      { name: 'Evaluate query execution plan', provider: 'api.query-plan.dev (Sample provider)', costUsd: 0.0015, status: 'idle', result: 'Query Plan Trees Evaluated' },
      { name: 'Generate optimized rewrite patch', provider: 'api.query-plan.dev (Sample provider)', costUsd: 0.0015, status: 'idle', result: 'Rewrite Patch Generated (<15ms)' },
    ],
  },

  // ----------------------------------------------------
  // CATEGORY 3: MEDIA & VOICE (4 MISSIONS)
  // ----------------------------------------------------
  {
    id: 'mission_translate',
    title: 'Translate Technical Documentation',
    category: 'MEDIA',
    leadAgent: 'Document Translator Bot',
    goal: 'Translate technical API documentation into German and Japanese in parallel.',
    icon: Languages,
    oldWayComparison: 'Translation agency contract or monthly translation subscription',
    finalDeliverable: 'Bilingual markdown documentation package',
    simulatedOutput: {
      sourceLang: 'EN',
      targetLangs: ['DE', 'JA'],
      translatedParagraphs: 48,
      accuracyScore: '99.4%',
      totalCostUsd: 0.0020,
      status: 'MISSION_SUCCESS',
    },
    steps: [
      { name: 'German technical translation', provider: 'api.translate-provider.io (Sample provider)', costUsd: 0.0010, status: 'idle', result: 'German Syntax Ingested' },
      { name: 'Japanese grammar localization', provider: 'api.translate-provider.io (Sample provider)', costUsd: 0.0010, status: 'idle', result: 'Japanese Natural Flow Verified' },
    ],
  },
  {
    id: 'mission_vision_upscale',
    title: 'Extract Image Background & Alpha Matte',
    category: 'MEDIA',
    leadAgent: 'Vision Production Bot',
    goal: 'Extract clean transparent alpha matte and optimize image resolution.',
    icon: Image,
    oldWayComparison: '$30–$50/mo graphic tool subscriptions',
    finalDeliverable: 'High-resolution transparent PNG asset ready for web layout',
    simulatedOutput: {
      originalResolution: '1024x1024',
      targetResolution: '2048x2048 (Enhanced)',
      matteAccuracy: '99.8%',
      outputFormat: 'PNG (Alpha Clean)',
      totalCostUsd: 0.0040,
      status: 'MISSION_SUCCESS',
    },
    steps: [
      { name: 'Extract subject alpha matte', provider: 'api.vision-neural.ai (Sample provider)', costUsd: 0.0020, status: 'idle', result: 'Alpha Matte Extracted (0 artifacts)' },
      { name: 'Enhance asset resolution', provider: 'api.vision-neural.ai (Sample provider)', costUsd: 0.0020, status: 'idle', result: 'High-Res Bitmap Synthesized (2048x2048)' },
    ],
  },
  {
    id: 'mission_voice_tts',
    title: 'Generate Voiceover & Timed Subtitles',
    category: 'MEDIA',
    leadAgent: 'Audio Voiceover Bot',
    goal: 'Generate realistic voice narration from text and align subtitle timing.',
    icon: Mic,
    oldWayComparison: '$22/mo voice AI subscription with expiring credits',
    finalDeliverable: 'Studio-quality MP3 audio track and WebVTT subtitle file',
    simulatedOutput: {
      voiceModel: 'Neural TTS Voice v2',
      durationSeconds: 34.2,
      samplingRate: '48kHz Stereo',
      subtitlesAligned: true,
      totalCostUsd: 0.0045,
      status: 'MISSION_SUCCESS',
    },
    steps: [
      { name: 'Synthesize voiceover audio', provider: 'api.voice-neural.io (Sample provider)', costUsd: 0.0025, status: 'idle', result: '48kHz Master Audio Rendered' },
      { name: 'Align subtitle timing', provider: 'api.voice-neural.io (Sample provider)', costUsd: 0.0020, status: 'idle', result: 'Subtitle Timing Mapped (0 drift)' },
    ],
  },
  {
    id: 'mission_ocr_tabular',
    title: 'Extract Data from Invoice Image',
    category: 'MEDIA',
    leadAgent: 'Document Parser Bot',
    goal: 'Read invoice image, extract line items, and convert to clean JSON schema.',
    icon: FileSpreadsheet,
    oldWayComparison: 'Pay only per document — no minimum monthly commitments',
    finalDeliverable: 'Structured JSON accounting data ready for ERP upload',
    simulatedOutput: {
      detectedEntities: 24,
      confidenceScore: '99.9%',
      tableRowsParsed: 18,
      currency: 'USD',
      totalCostUsd: 0.0025,
      status: 'MISSION_SUCCESS',
    },
    steps: [
      { name: 'OCR invoice document', provider: 'api.neural-ocr.io (Sample provider)', costUsd: 0.0015, status: 'idle', result: 'Text & Table Cells Segmented' },
      { name: 'Compile structured JSON schema', provider: 'api.neural-ocr.io (Sample provider)', costUsd: 0.0010, status: 'idle', result: 'Verified JSON Ledger Produced' },
    ],
  },

  // ----------------------------------------------------
  // CATEGORY 4: BUSINESS & COMMERCE (5 MISSIONS)
  // ----------------------------------------------------
  {
    id: 'mission_travel',
    title: 'Check Flight & Hotel Availability',
    category: 'COMMERCE',
    leadAgent: 'Travel Coordinator Bot',
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
      { name: 'Review flight availability example', provider: 'api.flights-gds.global (Sample provider)', costUsd: 0.0020, status: 'idle', result: 'Example flight options prepared' },
      { name: 'Review hotel availability example', provider: 'api.lodging-inventory.io (Sample provider)', costUsd: 0.0020, status: 'idle', result: 'Example room options prepared' },
    ],
  },
  {
    id: 'mission_kyc',
    title: 'Verify Sanctions & Watchlist Status',
    category: 'COMMERCE',
    leadAgent: 'Compliance Auditor Bot',
    goal: 'Check company or entity against global sanctions and watchlists.',
    icon: ShieldAlert,
    oldWayComparison: '$2–$5 per manual compliance check via bureau',
    finalDeliverable: 'Compliance review report with evaluation findings',
    simulatedOutput: {
      checkType: 'Global Sanctions & Watchlists',
      riskScore: 0.01,
      flags: 0,
      evaluationProofId: 'eval_kyc_9482',
      totalCostUsd: 0.0030,
      status: 'MISSION_SUCCESS',
    },
    steps: [
      { name: 'Review sanctions & watchlist example', provider: 'api.compliance-audit.io (Sample provider)', costUsd: 0.0015, status: 'idle', result: 'Example watchlist result prepared' },
      { name: 'Verify audit credentials', provider: 'api.compliance-audit.io (Sample provider)', costUsd: 0.0015, status: 'idle', result: 'Signature checked in evaluation' },
    ],
  },
  {
    id: 'mission_commerce',
    title: 'Generate Invoice & Pay Merchant',
    category: 'COMMERCE',
    leadAgent: 'Commerce Merchant Bot',
    goal: 'Issue machine-readable invoice and settle payment directly to merchant.',
    icon: ShoppingCart,
    oldWayComparison: 'Credit card checkout with 30¢ + 3% merchant processing fee',
    finalDeliverable: 'Merchant invoice record with payment proof when a live wallet is connected',
    simulatedOutput: {
      merchantId: 'mcht_synapse_402',
      invoiceId: 'inv_8941_tempo',
      standard: 'Digital Settlement Receipt',
      settlementSpeedMs: 14,
      totalCostUsd: 0.0035,
      status: 'MISSION_SUCCESS',
    },
    steps: [
      { name: 'Issue machine invoice', provider: 'api.checkout-engine.io (Sample provider)', costUsd: 0.0015, status: 'idle', result: 'Invoice Issued (<15ms)' },
      { name: 'Authorize micro-settlement', provider: 'api.checkout-engine.io (Sample provider)', costUsd: 0.0020, status: 'idle', result: 'Payment step approved within the cap' },
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
      { name: 'Read solar telemetry example', provider: 'api.smart-grid.network (Sample provider)', costUsd: 0.0018, status: 'idle', result: 'Example telemetry loaded (14.5 kWh)' },
      { name: 'Issue green carbon certificate', provider: 'api.carbon-registry.org (Sample provider)', costUsd: 0.0020, status: 'idle', result: 'Green certificate prepared for review' },
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
      sanctionsCheck: 'Passed (0 Flags)',
      settlementSpeedMs: 14,
      totalCostUsd: 0.0045,
      status: 'MISSION_SUCCESS',
    },
    steps: [
      { name: 'Compare supplier examples', provider: 'api.supplier-catalog.io (Sample provider)', costUsd: 0.0015, status: 'idle', result: '3 supplier options prepared' },
      { name: 'Review compliance example', provider: 'api.compliance-audit.io (Sample provider)', costUsd: 0.0015, status: 'idle', result: 'Example rules result prepared' },
      { name: 'Prepare micro-purchase order', provider: 'api.checkout-engine.io (Sample provider)', costUsd: 0.0015, status: 'idle', result: 'Purchase order prepared for review' },
    ],
  },
];

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
    narrative: 'Academic Reader Bot resolved DOI 10.1038/s41586-024-07142-9, prepared a $0.0010 micro-license request, and returned the paper metadata in clean Markdown without a subscription lock-in.',
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
      { label: 'Invariants Verified', value: '32 / 32 Proven', note: 'Z3 Formal Solver' },
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
      { label: 'Latency Reduction', value: '88.4% Faster', note: 'Benchmark Confirmed' },
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
      { label: 'Accuracy Score', value: '99.4%', note: 'Neural Grammar Engine' },
      { label: 'Turnaround', value: '380 ms', note: 'Instant Parallel Delivery' },
    ],
    actionRecommendation: 'Commit localized markdown files directly into multi-lingual docs repository.',
  },
  mission_vision_upscale: {
    documentTitle: 'High-Res Alpha Matte & Asset Delivery Certificate',
    badge: 'Neural Image Processing',
    narrative: 'Applied neural alpha matting to cleanly separate foreground subject from complex background with 99.8% edge precision, generating a clean high-resolution transparent PNG layout asset.',
    metrics: [
      { label: 'Input Resolution', value: '1024 x 1024', note: 'Original Source' },
      { label: 'Target Output', value: '2048 x 2048', note: 'Enhanced Asset' },
      { label: 'Matte Precision', value: '99.8%', note: 'Zero Edge Fringe' },
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
      { label: 'Confirmed Total', value: '$840.00 USD', note: 'Lowest Available Rate' },
      { label: 'Chain Latency', value: '31 ms', note: 'Multi-Endpoint Chain' },
    ],
    actionRecommendation: 'Itinerary confirmed and calendar entries synched to executive travel schedule.',
  },
  mission_kyc: {
    documentTitle: 'International Sanctions & Compliance Verification Certificate',
    badge: 'Automated Compliance Check',
    narrative: 'Queried the configured sanctions, PEP, and watchlist feeds. The evaluation returned no adverse flags (Risk Score: 0.01); a live wallet is required for an on-chain certificate.',
    metrics: [
      { label: 'Watchlists Checked', value: 'Global Sanctions', note: 'OFAC, EU, UN, UK' },
      { label: 'Adverse Hits', value: '0 Flags (Clean)', note: 'Complete Match Clear' },
      { label: 'Risk Score', value: '0.01 / 1.00', note: 'Minimal Compliance Risk' },
      { label: 'Proof status', value: 'Evaluation only', note: 'No chain receipt until a wallet confirms payment' },
    ],
    actionRecommendation: 'Review the clear evaluation result before onboarding. A live compliance certificate requires a connected wallet.',
  },
  mission_commerce: {
    documentTitle: 'Digital Settlement Receipt & Merchant Invoice',
    badge: 'Machine-to-Merchant Micro-Checkout',
    narrative: 'Issued a machine-readable invoice and recorded the requested payment step. The walkthrough shows the invoice, policy decision, and any confirmed trace without inventing a settlement.',
    metrics: [
      { label: 'Invoice ID', value: 'inv_8941_tempo', note: 'Programmatic Invoice' },
      { label: 'Merchant ID', value: 'mcht_synapse_402', note: 'Verified Merchant' },
      { label: 'Payment status', value: 'Trace-dependent', note: 'Shown when confirmed' },
      { label: 'Interchange Fee', value: '$0.00', note: 'Zero Interchange Loss' },
    ],
    actionRecommendation: 'Review the invoice and release it for payment when a live wallet is connected.',
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
      { label: 'Compliance Audit', value: 'Passed (0 Flags)', note: 'Watchlist Clean' },
      { label: 'Payment Step', value: '$0.0015', note: 'Budget checked before purchase' },
    ],
    actionRecommendation: 'Purchase order prepared for review. A live wallet is required before funds move on-chain.',
  },
};

export interface AgentMissionsViewProps {
  onMissionSettled?: (events: LivePaymentEvent[], totalCost: number) => void;
  agents?: any[];
  userBalanceUsd?: number;
}

export const AgentMissionsView: React.FC<AgentMissionsViewProps> = ({
  onMissionSettled,
  agents = [],
  userBalanceUsd = 0,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'RESEARCH' | 'COMPUTE' | 'MEDIA' | 'COMMERCE'>('ALL');
  // Default to featured paper mission
  const [selectedMissionId, setSelectedMissionId] = useState<string>('mission_paywall');
  const defaultMission = MISSIONS_DATA.find((m) => m.id === 'mission_paywall') || MISSIONS_DATA[0];
  const [activeMissionSteps, setActiveMissionSteps] = useState<MissionStep[]>(defaultMission.steps);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showTechnicalLog, setShowTechnicalLog] = useState(false);
  const [missionLogs, setMissionLogs] = useState<string[]>([
    `[System] Autonomous agent mission pipeline primed and ready.`,
    `[Budget] Spending is pre-authorized by the selected controlled limit.`,
  ]);
  const [completedMission, setCompletedMission] = useState<AgentMission | null>(null);
  const [missionLiveSettlement, setMissionLiveSettlement] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [copiedDeliverable, setCopiedDeliverable] = useState(false);
  const [showAllMissions, setShowAllMissions] = useState(false);

  const filteredMissions = MISSIONS_DATA.filter((m) => categoryFilter === 'ALL' || m.category === categoryFilter);
  const displayedMissions = showAllMissions || categoryFilter !== 'ALL' ? filteredMissions : filteredMissions.slice(0, 6);
  const currentMission = MISSIONS_DATA.find((m) => m.id === selectedMissionId) || filteredMissions[0] || MISSIONS_DATA[0];
  const totalMissionCost = currentMission.steps.reduce((acc, s) => acc + s.costUsd, 0);

  const handleSelectMission = (mission: AgentMission) => {
    if (isExecuting) return;
    soundEngine.playClick();
    setSelectedMissionId(mission.id);
    setActiveMissionSteps(mission.steps.map((s) => ({ ...s, status: 'idle' })));
    setCompletedMission(null);
    setMissionLiveSettlement(false);
    setMissionLogs([
      `Mission selected: ${mission.title}. Ready for execution.`,
      `[Policy] All planned steps fit within the selected spending limit.`,
    ]);
  };

  const handleExecuteMission = async () => {
    if (isExecuting) return;
    soundEngine.playClick();
    setIsExecuting(true);
    setCompletedMission(null);
    setMissionLiveSettlement(false);
    setMissionLogs([
      `[Step 1: Goal] Starting mission: "${currentMission.title}"`,
      `[Step 2: Budget Check] Controlled spending account limit approved for ${currentMission.leadAgent} (Max $${totalMissionCost.toFixed(4)}).`,
    ]);

    const updatedSteps: MissionStep[] = currentMission.steps.map((s) => ({ ...s, status: 'idle' }));
    const activeKeyId = agents && agents.length > 0 ? agents[0].id : 'key_quant_alpha';
    const settledEvents: LivePaymentEvent[] = [];

    for (let i = 0; i < updatedSteps.length; i++) {
      let stepStatus: 'SETTLED' | 'SIMULATED_PASS' = 'SIMULATED_PASS';
      updatedSteps[i].status = 'running';
      setActiveMissionSteps([...updatedSteps]);
      
      const cleanEndpoint = updatedSteps[i].provider.replace(' (Sample provider)', '').replace(' [Simulated API]', '');
      setMissionLogs((prev) => [
        ...prev,
        `[Step 3: Pay] Step ${i + 1}/${updatedSteps.length}: Paying $${updatedSteps[i].costUsd.toFixed(4)} to ${cleanEndpoint}...`,
      ]);

      await new Promise((r) => setTimeout(r, 320));

      try {
        const targetEndpointUrl = `https://${cleanEndpoint}/v1`;
        const res = await fetch('/api/mpp/settle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            keyId: activeKeyId,
            targetUrl: targetEndpointUrl,
            pricePathUsd: updatedSteps[i].costUsd,
            category: currentMission.category,
            allowDynamicWhitelist: true,
            evaluationOnly: true,
          }),
        });
        const settleData = await res.json().catch(() => null);
        if (!res.ok || !settleData?.trace || !['SETTLED', 'SIMULATED_PASS'].includes(settleData.trace.status)) {
          throw new Error(settleData?.error || `Settlement failed (HTTP ${res.status})`);
        }
        const trace = settleData?.trace;
        stepStatus = trace.status;

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
          eip712Signature: trace?.eip712Signature,
          merkleProof: trace?.merkleProof,
          merkleRoot: trace?.merkleRoot,
          liveProxyPayload: currentMission.simulatedOutput,
        };

        settledEvents.push(newEvent);
        if (trace.status === 'SETTLED' && trace.executionMode === 'LIVE_TESTNET' && trace.txHash) {
          setMissionLiveSettlement(true);
        }
        if (onMissionSettled) {
          onMissionSettled([newEvent], updatedSteps[i].costUsd);
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Settlement failed';
        updatedSteps[i].status = 'failed';
        setActiveMissionSteps([...updatedSteps]);
        setMissionLogs((prev) => [
          ...prev,
          `✕ [Payment failed] ${updatedSteps[i].name}: ${message}`,
          `[No charge recorded] The mission stopped before this resource was confirmed.`,
        ]);
        setIsExecuting(false);
        return;
      }

      updatedSteps[i].status = 'completed';
      setActiveMissionSteps([...updatedSteps]);
      if (stepStatus === 'SETTLED') soundEngine.playSettlementChime();

      setMissionLogs((prev) => [
        ...prev,
        `${stepStatus === 'SETTLED' ? '✓ [Payment confirmed]' : '✓ [Evaluation step]' } Resource received: ${updatedSteps[i].result}`,
      ]);
    }

    const missionHasLiveSettlement = settledEvents.some((event) => event.status === 'SETTLED' && event.executionMode === 'LIVE_TESTNET' && Boolean(event.txHash));
    setMissionLiveSettlement(missionHasLiveSettlement);
    setCompletedMission(currentMission);
    setIsExecuting(false);
    setMissionLogs((prev) => [
      ...prev,
      `[Step 4: Finished] Mission complete! Total cost: $${totalMissionCost.toFixed(4)} (0 logins, 0 forms).`,
      `[Complete] Deliverables assembled from the ${missionHasLiveSettlement ? 'confirmed' : 'evaluated'} mission steps.`,
    ]);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-3xl border border-[#d7ff4f]/25 bg-gradient-to-br from-[#d7ff4f]/[0.09] via-white/[.035] to-transparent p-6 sm:p-8 shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#d7ff4f] animate-pulse" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#d7ff4f]">
              PURPOSE OF THIS SCREEN
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-white/[0.05] text-zinc-300 border border-white/10">
              <Compass className="w-4 h-4 text-[#d7ff4f]" />
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              What jobs can you delegate to an AI workforce?
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Choose a job example. The workforce selects the required resources, stays within the budget, and returns a result package.
          </p>
          <div className="mt-3 max-w-4xl border-l-2 border-[#d7ff4f] bg-[#d7ff4f]/[0.05] rounded-r-xl px-4 py-3 text-base sm:text-lg font-semibold font-sans normal-case tracking-normal leading-snug text-white">
             <strong className="text-[#d7ff4f]">Example job:</strong> choose a mission to see what the agent buys, does, and returns.
          </div>
          <p className="text-[11px] text-zinc-500 mt-2 max-w-2xl leading-relaxed">
            Public data is not shown as paid here. Listed costs represent licensed/private data or compute examples; a live receipt appears only when the backend returns one.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-300 bg-white/[.03] px-3 py-1.5 rounded-xl border border-white/[.08]">
          <span className="w-2 h-2 rounded-full bg-[#d7ff4f]" />
          <span>Pay only for what is used • No recurring commitments</span>
        </div>
      </div>

      {/* Category Filtering Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: 'Job examples (17)' },
          { id: 'RESEARCH', label: 'Research (4)' },
          { id: 'COMPUTE', label: 'Compute (4)' },
          { id: 'MEDIA', label: 'Media (4)' },
          { id: 'COMMERCE', label: 'Business (5)' },
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
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#d7ff4f] text-[#08090c] font-bold shadow-[0_0_15px_rgba(215,255,79,0.2)]'
                  : 'bg-white/[.03] text-zinc-400 hover:text-zinc-200 hover:bg-white/[.07] border border-white/[.08]'
              }`}
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
              type="button"
              onClick={() => handleSelectMission(mission)}
              disabled={isExecuting}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
                isSelected
                  ? 'bg-white/[0.08] border-[#d7ff4f]/50 ring-1 ring-[#d7ff4f]/30 shadow-md'
                  : 'bg-white/[.025] border-white/[.08] hover:border-white/20 hover:bg-white/[.05]'
              }`}
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
                <span>{mission.steps.length} resource purchases</span>
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

      {/* Expand / Collapse 17 missions button */}
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
      <div className="rounded-3xl border border-white/[.14] bg-gradient-to-b from-white/[.065] via-white/[.03] to-transparent backdrop-blur-md p-5 sm:p-7 space-y-6 shadow-[0_22px_70px_rgba(0,0,0,0.28)]">
        {/* Stage Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[.08] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/[0.04] border border-white/10 text-zinc-300 uppercase">
                {currentMission.category}
              </span>
              <span className="text-xs font-mono text-zinc-400">• Lead: <strong className="text-white">{currentMission.leadAgent}</strong></span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {currentMission.title}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              {currentMission.goal}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-white/[.03] border border-white/[.08] text-right">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Planned cost</div>
              <div className="text-base sm:text-lg font-mono font-bold text-[#d7ff4f]">
                ${totalMissionCost.toFixed(4)} USD
              </div>
            </div>

            <button
              type="button"
              onClick={handleExecuteMission}
              disabled={isExecuting}
              className="py-3 px-6 rounded-xl bg-[#d7ff4f] hover:bg-[#cbf540] text-[#08090c] font-black text-xs font-mono uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(215,255,79,0.3)] hover:shadow-[0_0_25px_rgba(215,255,79,0.45)] active:scale-95 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{isExecuting ? 'Agent Executing...' : 'Run This Job'}</span>
            </button>
          </div>
        </div>

        {/* 4-Step Plain-Language Value Box: YOU CHOOSE -> WORKFORCE RUNS -> YOU GET -> WHY IT MATTERS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-white/[.02] border border-white/[.06] space-y-1">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase block">01 — YOU CHOOSE</span>
            <p className="text-zinc-200 text-[11.5px] font-semibold leading-snug">
              Choose the job and spending budget.
            </p>
            <span className="text-[10px] text-zinc-400 mt-1 block">0 logins • 0 checkout forms</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[.02] border border-white/[.06] space-y-1">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase block">02 — WORKFORCE RUNS</span>
            <p className="text-zinc-200 text-[11.5px] font-semibold leading-snug">
              Workforce gets required resources and completes steps within budget.
            </p>
            <span className="text-[10px] text-zinc-400 mt-1 block">
              {currentMission.steps.length} resource payments (${totalMissionCost.toFixed(4)} total)
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[.02] border border-white/[.06] space-y-1">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase block">03 — YOU GET</span>
            <p className="text-zinc-200 text-[11.5px] font-semibold leading-snug">
              One result package to review.
            </p>
            <span className="text-[10px] text-zinc-400 mt-1 block">Execution report &amp; output returned</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[.02] border border-white/[.06] space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#d7ff4f] uppercase block">04 — WHY IT MATTERS</span>
            <p className="text-white text-[11.5px] font-semibold leading-snug">
              {currentMission.oldWayComparison}
            </p>
            <span className="text-[10px] text-[#d7ff4f] mt-1 block font-mono">Pay on-demand • No unused recurring subscriptions</span>
          </div>
        </div>

        {/* Verification Status Banner */}
        <div className="p-2.5 px-3.5 rounded-xl bg-white/[.02] border border-white/[.08] flex items-center justify-between gap-2.5 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#d7ff4f] shrink-0" />
            <p className="text-[11px] leading-relaxed text-zinc-300">
              <strong className="text-zinc-200 font-medium">Policy Verification:</strong> Hard spending cap · Cryptographic session proofs · Spending cap enforced by SynapseVault.
            </p>
          </div>
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
        <div className="space-y-3">
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
                      {step.status === 'completed' ? '✓' : step.status === 'failed' ? '!' : idx + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white">{step.name}</span>
                        <span className="text-[10px] font-mono text-zinc-400">({step.provider.replace(' (Sample provider)', ' · sample provider').replace(' (Sample provider)', ' · sample provider').replace(' [Simulated API]', ' · sample provider')})</span>
                      </div>
                      <span className="text-[11px] text-zinc-400 block mt-0.5 font-mono">
                        {step.status === 'completed' ? `✓ ${step.result}` : step.status === 'failed' ? 'Payment failed — mission stopped' : step.status === 'running' ? 'Authorizing settlement...' : 'Pending execution...'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto font-mono text-xs shrink-0">
                    <span className="text-white font-bold">${step.costUsd.toFixed(4)}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      step.status === 'completed'
                        ? 'bg-[#d7ff4f]/20 text-[#d7ff4f] border-[#d7ff4f]/40'
                        : step.status === 'failed'
                        ? 'bg-red-400/20 text-red-300 border-red-400/40'
                        : step.status === 'running'
                        ? 'bg-white/20 text-white border-white/40'
                        : 'bg-white/5 text-zinc-500 border-white/10'
                    }`}>
                        {step.status === 'completed' ? (missionLiveSettlement ? 'CONFIRMED' : 'EVALUATION') : step.status === 'failed' ? 'FAILED' : step.status === 'running' ? 'PREPARING' : 'READY'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Mission Terminal Logs (Collapsible) */}
        {showTechnicalLog && (
          <div className="p-4 rounded-xl bg-white/[.03] backdrop-blur-md border border-white/[.08] space-y-2 font-mono text-xs animate-in fade-in duration-200">
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
            documentTitle: `Verified Intelligence Artifact: ${completedMission.title}`,
            badge: completedMission.category,
            narrative: `${completedMission.leadAgent} completed ${completedMission.steps.length} controlled work steps for $${totalMissionCost.toFixed(4)} within the policy cap and delivered the result for review.`,
            metrics: Object.entries(completedMission.simulatedOutput)
              .filter(([k]) => k !== 'status' && k !== 'totalCostUsd' && k !== 'settlementTimeMs' && !k.startsWith('_'))
              .slice(0, 4)
              .map(([key, value]) => ({
                label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()),
                value: String(value),
                note: 'Verified Machine Output'
              })),
            actionRecommendation: completedMission.finalDeliverable,
          };

          return (
            <div className="p-5 sm:p-6 rounded-2xl bg-white/[.03] backdrop-blur-md border border-white/[.08] space-y-5 animate-in fade-in duration-300">
              {/* Document Header & Stamping */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-white/[0.05] text-zinc-300 border border-white/10 shrink-0 mt-0.5">
                    <FileText className="w-5 h-5 text-[#d7ff4f]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-white/[0.05] text-zinc-300 border border-white/10 text-[10px] font-mono font-bold uppercase tracking-wider">
                        {deliverable.badge}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        AUTH: {completedMission.leadAgent}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mt-1">
                      {deliverable.documentTitle}
                    </h3>
                    <span className="text-xs text-zinc-400 font-sans block mt-0.5">
                      Result assembled (<strong className="text-[#d7ff4f] font-mono">Payment trace shown when confirmed</strong>)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      if (navigator.clipboard?.writeText) {
                        const copyText = `${deliverable.documentTitle}\n\nExecutive Overview:\n${deliverable.narrative}\n\nKey Findings:\n${deliverable.metrics.map(m => `• ${m.label}: ${m.value} (${m.note})`).join('\n')}\n\nAction:\n${deliverable.actionRecommendation}\n\nPlanned amount: $${totalMissionCost.toFixed(4)} USD${missionLiveSettlement ? ' · confirmed on Tempo L1' : ' · evaluation only'}`;
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
                  <span className="px-3 py-1.5 rounded-xl bg-[#d7ff4f]/10 text-[#d7ff4f] border border-[#d7ff4f]/30 text-xs font-mono font-bold">
                    {missionLiveSettlement ? `Paid: $${totalMissionCost.toFixed(4)}` : `Planned: $${totalMissionCost.toFixed(4)}`}
                  </span>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="p-4 rounded-xl bg-white/[0.025] border border-white/[0.08] space-y-2">
                <span className="text-[10.5px] font-mono uppercase font-bold text-zinc-300 flex items-center gap-1.5 tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#d7ff4f]" />
                  <span>Result summary:</span>
                </span>
                <p className="text-sm text-zinc-100 leading-relaxed font-sans font-medium">
                  {deliverable.narrative}
                </p>
              </div>

              {/* Structured Key Findings Matrix */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 block tracking-wider">
                  Key findings:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {deliverable.metrics.map((m, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-white/[.025] border border-white/[0.08] flex flex-col justify-between">
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
              </div>

              {/* Actionable Directive */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 block tracking-wider">
                    Recommended next step
                  </span>
                  <p className="text-zinc-200 text-xs font-semibold leading-snug">
                    {deliverable.actionRecommendation}
                  </p>
                  <span className="text-[11px] text-zinc-400 block mt-0.5 font-sans">
                    Replaces: <strong className="text-zinc-300">{completedMission.oldWayComparison}</strong>
                  </span>
                </div>
                <div className="shrink-0 text-center sm:text-right">
                  <span className="px-3 py-1.5 rounded-lg bg-[#d7ff4f] text-[#08090c] font-bold font-mono text-[11px] inline-block shadow-sm">
                    {missionLiveSettlement ? 'Confirmed on Tempo L1' : 'Evaluation complete · no chain receipt'}
                  </span>
                </div>
              </div>

              {/* Settlement Verification & What This Proves Proof */}
              <div className="p-3.5 rounded-xl bg-white/[.025] border border-white/10 text-xs space-y-2">
                <div className="flex items-center gap-2 text-zinc-200 font-bold text-xs uppercase">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{missionLiveSettlement ? 'Settlement Verified • Mission Outcome' : 'Evaluation Complete • Mission Outcome'}</span>
                </div>
                <div className="text-zinc-300 text-[11.5px] leading-relaxed space-y-1">
                  <p><strong className="text-white">What happened:</strong> The workforce requested the required resources (${totalMissionCost.toFixed(4)} planned), completed execution in an isolated runtime, and returned the result.</p>
                  <p><strong className="text-[#d7ff4f]">What this proves:</strong> The agent can acquire compute and data resources on demand within a fixed spending limit without recurring commitments.</p>
                </div>
              </div>

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
                      deliverableTitle: deliverable.documentTitle,
                      executiveSummary: deliverable.narrative,
                      findings: deliverable.metrics,
                      action: deliverable.actionRecommendation,
                      output: completedMission.simulatedOutput,
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
