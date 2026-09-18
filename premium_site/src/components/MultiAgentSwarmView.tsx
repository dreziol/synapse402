import React, { useState, useRef } from 'react';
import { 
  Bot, 
  Layers, 
  Cpu, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  Copy, 
  Terminal, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Code2, 
  RefreshCw,
  Clock,
  Sliders,
  DollarSign,
  Lock,
  Globe,
  FileCheck,
  Radio,
  Square,
  AlertTriangle,
  FileText,
  KeyRound,
  PowerOff,
  AlertOctagon,
  Image,
  Languages,
  Search,
  Mic,
  Check,
  ShieldAlert,
  Split,
  XCircle,
  X,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Coins,
  Activity,
  Plane,
  Building2,
  Eye,
  ExternalLink,
  Box,
  BarChart3,
  FileSpreadsheet,
  Network,
  GitBranch,
  MessageSquare,
  Send,
  Share2,
  Music,
  Users,
  PenTool,
  Film,
  Download
} from 'lucide-react';
import {
  Sparkle,
  Megaphone,
  Robot,
  Cpu as PhCpu,
  ShieldCheck as PhShieldCheck,
  ShieldWarning as PhShieldWarning,
  FilmSlate,
  Waveform,
  GlobeHemisphereWest,
  Aperture,
  Package as PhPackage,
  FileText as PhFileText,
  Coins as PhCoins,
  Receipt,
  Scales,
  ChartLineUp,
  Devices,
  SealCheck,
  Translate,
  TrendUp,
  Buildings,
  Gavel,
  WarningCircle,
  CurrencyCircleDollar,
  Eye as PhEye,
  Database as PhDatabase,
  Lightning,
  Target,
  PenNib,
  FileCode,
  CheckCircle as PhCheckCircle
} from '@phosphor-icons/react';
import { soundEngine } from '../utils/audioEffects';
import { InfoBadge } from './InfoBadge';
import { CryptoInspectorModal } from './CryptoInspectorModal';

export interface SubcontractorConfig {
  id: string;
  role: string;
  shortName: string;
  targetUrl: string;
  providerLabel?: string;
  costPathUsd: number;
  avatarColor: string;
  category: string;
  team: string;
  savingsVsSubscription: string;
  deliverablePreview: string;
  generatedValueUsd: number;
  nodeType?: 'WORKER' | 'PROVIDER' | 'ORCHESTRATOR';
  waveGroup?: number;
  workingAction?: string;
  samplePayload?: string;
  queryPrompt?: string;
  verifiedBadge?: string;
  taskInput?: string;
  taskOutput?: string;
  currentTask?: string;
}

const getSubcontractorIcon = (subId: string): React.ComponentType<{ className?: string }> => {
  switch (subId) {
    // PHASE 01: CREATIVE MEDIA & DATA PROVIDERS (Sky Accent)
    case 'sub_m1': // Official TikTok
      return ({ className }) => (
        <svg className={className || "w-4 h-4"} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.04-4.52z"/>
        </svg>
      );
    case 'sub_m2': // Official X (Twitter)
      return ({ className }) => (
        <svg className={className || "w-4 h-4"} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    case 'sub_m3': // Official Meta Ads Intelligence
      return ({ className }) => (
        <svg className={className || "w-4 h-4"} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.001 7.422c-2.404 0-4.35 1.57-5.46 3.655C5.43 9.006 3.73 7.87 2.016 7.87 1.054 7.87.218 8.284 0 9.07v5.86c.218.786 1.054 1.2 2.016 1.2 1.714 0 3.414-1.136 4.525-3.207 1.11 2.085 3.056 3.655 5.46 3.655s4.35-1.57 5.46-3.655c1.11 2.071 2.81 3.207 4.524 3.207.963 0 1.798-.414 2.015-1.2V9.07c-.217-.786-1.052-1.2-2.015-1.2-1.714 0-3.414 1.136-4.524 3.207-1.11-2.085-3.056-3.655-5.46-3.655zm-7.6 6.326c-.722 0-1.312-.47-1.401-1.133.089-.663.679-1.133 1.4-1.133.882 0 1.848.813 2.502 2.266-.654 1.453-1.62 2.266-2.502 2.266zm15.2 0c-.882 0-1.848-.813-2.502-2.266.654-1.453 1.62-2.266 2.502-2.266.722 0 1.312.47 1.401 1.133-.089.663-.679 1.133-1.4 1.133z"/>
        </svg>
      );
    case 'sub_m4': // Flux Visual Engine
      return ({ className }) => (
        <svg className={className || "w-4 h-4"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" fill="currentColor" fillOpacity="0.25" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      );
    case 'sub_m5': // Neural Voice Synthesis
      return ({ className }) => <Waveform className={className || "w-4 h-4"} weight="duotone" />;
    case 'sub_m6': // Suno Music Stems
      return ({ className }) => (
        <svg className={className || "w-4 h-4"} viewBox="0 0 24 24" fill="currentColor">
          <rect x="2" y="10" width="2" height="4" rx="1" fillOpacity="0.6" />
          <rect x="6" y="6" width="2" height="12" rx="1" fillOpacity="0.8" />
          <rect x="10" y="3" width="2" height="18" rx="1" />
          <rect x="14" y="7" width="2" height="10" rx="1" fillOpacity="0.8" />
          <rect x="18" y="5" width="2" height="14" rx="1" fillOpacity="0.9" />
          <rect x="22" y="11" width="2" height="2" rx="1" fillOpacity="0.6" />
        </svg>
      );
    case 'sub_m7': // Buyer Segment Target Radar
      return ({ className }) => <Target className={className || "w-4 h-4"} weight="duotone" />;

    // PHASE 02: CREATIVE SPECIALISTS & AUDITORS (Purple Accent)
    case 'sub_m8': // Viral Hook Copywriter
      return ({ className }) => <PenNib className={className || "w-4 h-4"} weight="duotone" />;
    case 'sub_m9': // 9:16 Visual Layout & Storyboards
      return ({ className }) => (
        <svg className={className || "w-4 h-4"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" fillOpacity="0.15" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      );
    case 'sub_m10': // Policy Compliance Auditor
      return ({ className }) => <PhShieldCheck className={className || "w-4 h-4"} weight="duotone" />;
    case 'sub_m11': // 15s Storyboard & Audio Sync
      return ({ className }) => <FilmSlate className={className || "w-4 h-4"} weight="duotone" />;
    case 'sub_m12': // Creative Score Reviewer
      return ({ className }) => <ChartLineUp className={className || "w-4 h-4"} weight="duotone" />;

    // PHASE 03: SYNTHESIS, LOCALIZATION & TEMPO L1 SEAL (Lime Accent)
    case 'sub_m13': // 4-Platform Aspect Ratio Grid
      return ({ className }) => (
        <svg className={className || "w-4 h-4"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" fill="currentColor" fillOpacity="0.15" />
          <line x1="12" y1="4" x2="12" y2="20" strokeDasharray="2 2" />
        </svg>
      );
    case 'sub_m14': // 5-Language Localization
      return ({ className }) => <Translate className={className || "w-4 h-4"} weight="duotone" />;
    case 'sub_m15': // Thumbnail Maker
      return ({ className }) => <Aperture className={className || "w-4 h-4"} weight="duotone" />;
    case 'sub_m16': // Multi-Asset Packager
      return ({ className }) => <PhPackage className={className || "w-4 h-4"} weight="duotone" />;
    case 'sub_m17': // Executive Campaign Memo
      return ({ className }) => <PhFileText className={className || "w-4 h-4"} weight="duotone" />;
    case 'sub_m18': // Budget & Micro-Payment Auditor
      return ({ className }) => <CurrencyCircleDollar className={className || "w-4 h-4"} weight="duotone" />;
    case 'sub_m19': // Tempo L1 Cryptographic Notary
    case 'sub_4':
      return ({ className }) => <SealCheck className={className || "w-4 h-4"} weight="duotone" />;

    case 'lead_orchestrator':
      return ({ className }) => (
        <svg className={className || "w-5 h-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.2" />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
        </svg>
      );

    // SUPPLIER / ARBITRAGE SWARM ICONS:
    case 'sub_8': // GLEIF / LEI
      return ({ className }) => <GlobeHemisphereWest className={className || "w-4 h-4"} weight="duotone" />;
    case 'sub_9': // SEC Edgar
      return ({ className }) => <Buildings className={className || "w-4 h-4"} weight="duotone" />;
    case 'sub_10': // Corporate Hierarchy
      return ({ className }) => <PhDatabase className={className || "w-4 h-4"} weight="duotone" />;
    case 'sub_11': // Credit Rating
      return ({ className }) => <TrendUp className={className || "w-4 h-4"} weight="duotone" />;
    case 'sub_12': // Court Litigation
      return ({ className }) => <Gavel className={className || "w-4 h-4"} weight="duotone" />;
    case 'sub_18': // Sanctions Screener
      return ({ className }) => <PhShieldWarning className={className || "w-4 h-4"} weight="duotone" />;
    case 'sub_19': // Adverse Media
      return ({ className }) => <PhEye className={className || "w-4 h-4"} weight="duotone" />;

    // FINANCIAL TRADING & RISK PRESET ICONS:
    case 'sub_a1': // Market Data Reader
      return ({ className }) => <BarChart3 className={className || "w-4 h-4"} />;
    case 'sub_a2': // Market Prediction Bot
      return ({ className }) => <TrendUp className={className || "w-4 h-4"} weight="duotone" />;
    case 'sub_a3': // Safe Code Runner Bot
      return ({ className }) => <Code2 className={className || "w-4 h-4"} />;
    case 'sub_a4': // Sanctions & Fraud Screener
      return ({ className }) => <PhShieldWarning className={className || "w-4 h-4"} weight="duotone" />;

    default:
      return ({ className }) => <PhCpu className={className || "w-4 h-4"} weight="duotone" />;
  }
};

const SUBCONTRACTOR_RESULT_PILLS: Record<string, string> = {
  sub_8: 'Example registry snapshot',
  sub_9: 'Example filing snapshot',
  sub_10: 'Example ownership snapshot',
  sub_11: 'Example credit score',
  sub_12: 'Example legal snapshot',
  sub_18: 'Example watchlist snapshot',
  sub_19: 'Example news snapshot',
  sub_5: 'Parent + 2 Branches',
  sub_6: 'Cash 2.4x · Low Debt',
  sub_7: 'Example trade rules result',
  sub_16: '2x Liability Cap Safe',
  sub_17: 'Solvency Safe (4.12 Score)',
  sub_1: '7/7 Feeds Match',
  sub_2: 'Corporate Law Met',
  sub_3: 'Score: 94/100 (Grade A)',
  sub_4: 'Proof recorded for review',
  sub_13: 'Dossier Compiled',
  sub_14: '1-Page Memo Ready',
  sub_15: 'EN / DE / ES Briefs',
  lead_orchestrator: 'Mission Plan Dispatched',
  sub_m1: '5 Viral Hooks Locked',
  sub_m2: '3 Viral Angles',
  sub_m3: 'Competitor Formats Scanned',
  sub_m4: 'Visual Concepts Built',
  sub_m5: 'Studio Voice Mastered',
  sub_m6: '128 BPM Beat Licensed',
  sub_m7: 'Target Audience Mapped',
  sub_m8: '10 Viral Hooks Ready',
  sub_m9: '9:16 Storyboards Built',
  sub_m10: 'Policy Check Passed',
  sub_m11: '15s Storyboard Synced',
  sub_m12: 'Review: Quality Approved',
  sub_m13: '4 Platforms Formatted',
  sub_m14: '5 Languages Localized',
  sub_m15: '3 Campaign Covers',
  sub_m16: 'Asset Bundle Built',
  sub_m17: '1-Page Launch Brief',
  sub_m18: '$0.0245 Spent (51% Saved)',
  sub_m19: 'Provenance proof prepared',
  sub_c1: 'Transparent Cutout Ready',
  sub_c2: 'Visual Asset Rendered',
  sub_c3: 'Voice Audio Generated',
  sub_c4: 'Subtitles Transcribed',
  sub_a1: 'Sample Market Inputs Reviewed',
  sub_a2: 'Momentum Score: +0.84',
  sub_a3: 'Solvency Test Passed',
  sub_a4: '0 Watchlist Flags',
};

const NODE_HUMAN_JOBS: Record<string, string> = {
  sub_8: 'Reviews a supplied corporate registry snapshot',
  sub_9: 'Reads a supplied financial filing snapshot',
  sub_10: 'Summarizes a supplied ownership snapshot',
  sub_11: 'Checks commercial credit rating & on-time payment history (Grade A-)',
  sub_12: 'Summarizes a supplied legal record snapshot',
  sub_18: 'Reviews a supplied watchlist snapshot',
  sub_19: 'Reviews supplied news examples for reputation risk',
  sub_5: 'Maps parent company & operating subsidiary hierarchy (0 offshore)',
  sub_6: 'Calculates cash liquidity buffer & debt leverage (2.4x cash)',
  sub_7: 'Audits trade export controls & international hardware tariffs',
  sub_16: 'Reviews contract clauses, liability caps & IP safety',
  sub_17: 'Simulates 10,000 crisis scenarios to test bankruptcy risk (0.04%)',
  sub_1: 'Cross-checks records across all 7 external feeds for full concordance',
  sub_2: 'Confirms statutory corporate law compliance (DGCL § 101/102)',
  sub_3: 'Computes overall supplier safety score (94/100 · Low Risk)',
  sub_4: 'Records a cryptographic proof digest for the completed work',
  sub_13: 'Assembles the supplied evidence into a review pack',
  sub_14: 'Drafts a 1-page decision memo for human review',
  sub_15: 'Translates clearance brief into German & Spanish summaries',
  lead_orchestrator: 'Coordinates the units, enforces the cap, and prepares a recommendation',
  sub_m1: 'Reviews example TikTok-style trend inputs and hook patterns',
  sub_m2: 'Reviews example social signals and debate angles',
  sub_m3: 'Reviews licensed competitor ad library examples',
  sub_m4: 'Generates visual scene assets and composition tokens',
  sub_m5: 'Synthesizes charismatic neural voiceover audio track',
  sub_m6: 'Licenses royalty-free 128 BPM electronic background beat',
  sub_m7: 'Pulls high-intent buyer lookalike demographic clusters',
  sub_m8: 'Drafts 10 viral hooks & 3 complete video scripts (AIDA)',
  sub_m9: 'Composes 9:16 vertical video storyboards & carousel frames',
  sub_m10: 'Audits ad copy & imagery against Meta/TikTok ad policies',
  sub_m11: 'Assembles video storyboard, audio beats & dynamic captions (15s Spec)',
  sub_m12: 'Reviews ad pacing, video hooks & creative engagement quality',
  sub_m13: 'Reformats video & image assets for 4 platforms (TikTok, Reels, Shorts, X)',
  sub_m14: 'Translates and localizes copy into 5 languages (EN, ES, DE, FR, JP)',
  sub_m15: 'Generates 3 high-contrast A/B test cover thumbnails',
  sub_m16: 'Compiles all 19 media deliverables into export bundle',
  sub_m17: 'Drafts 1-page marketing executive launch brief with multi-platform strategy',
  sub_m18: 'Audits micro-transaction spend against budget cap ($0.0245 total)',
  sub_m19: 'Records campaign provenance and rights for review',
  sub_a1: 'Reviews a sample orderbook depth and bid-ask spread',
  sub_a2: 'Infers market momentum score and volatility probabilities',
  sub_a3: 'Sandboxes financial risk calculations in Python',
  sub_a4: 'Screens entity against AML and international sanctions watchlists',
};

const NODE_CAUSAL_DEPENDENCY: Record<string, { waitingFor: string; handoffTo: string }> = {
  lead_orchestrator: {
    waitingFor: 'User mission goal & $0.0500 session budget policy',
    handoffTo: '7 Example Media Inputs (Phase 01)'
  },
  sub_m1: {
    waitingFor: 'Lead Director session authorization ($0.0015)',
    handoffTo: 'Unit 08 (Viral Hook Specialist)'
  },
  sub_m2: {
    waitingFor: 'Lead Director session authorization ($0.0015)',
    handoffTo: 'Unit 08 (Viral Hook Specialist)'
  },
  sub_m3: {
    waitingFor: 'Lead Director session authorization ($0.0015)',
    handoffTo: 'Unit 08 & Unit 10 (Policy Auditor)'
  },
  sub_m4: {
    waitingFor: 'Lead Director GPU cloud allocation ($0.0020)',
    handoffTo: 'Unit 11 (Video Editor) & Unit 15 (Thumbnails)'
  },
  sub_m5: {
    waitingFor: 'Lead Director voice synthesis authorization ($0.0015)',
    handoffTo: 'Unit 11 (Video Editor)'
  },
  sub_m6: {
    waitingFor: 'Lead Director music licensing budget ($0.0010)',
    handoffTo: 'Unit 11 (Video Editor)'
  },
  sub_m7: {
    waitingFor: 'Lead Director buyer cluster request ($0.0005)',
    handoffTo: 'Unit 13 (Platform Formatter)'
  },
  sub_m8: {
    waitingFor: 'Example trend inputs from Unit 01 (TikTok-style) & Unit 02 (social pulse)',
    handoffTo: 'Unit 09 (Storyboard Designer)'
  },
  sub_m9: {
    waitingFor: '5 viral hooks & AIDA scripts from Unit 08 (Hook Specialist)',
    handoffTo: 'Unit 10 (Policy Auditor) & Unit 11 (Video Editor)'
  },
  sub_m10: {
    waitingFor: '9:16 vertical storyboards from Unit 09 to audit ad network rules',
    handoffTo: 'Unit 11 (Video Editor - Policy Clearance Stamp)'
  },
  sub_m11: {
    waitingFor: 'Visual assets (Unit 04) + Voiceover (Unit 05) + Audio (Unit 06) + Policy pass (Unit 10)',
    handoffTo: 'Unit 12 (Creative Reviewer)'
  },
  sub_m12: {
    waitingFor: '15s master storyboard spec from Unit 11',
    handoffTo: 'Unit 13 (Reformat) & Unit 14 (Localization)'
  },
  sub_m13: {
    waitingFor: 'Approved storyboard & layout spec from Unit 12 to adapt 4 platform aspect ratios',
    handoffTo: 'Unit 16 (Bundle Packager)'
  },
  sub_m14: {
    waitingFor: 'Approved English copy from Unit 08 to localize into 5 languages',
    handoffTo: 'Unit 16 (Bundle Packager)'
  },
  sub_m15: {
    waitingFor: 'Visual concept frames from Unit 04 to render 3 click-tested thumbnails',
    handoffTo: 'Unit 16 (Bundle Packager)'
  },
  sub_m16: {
    waitingFor: 'All creative deliverables from Units 08-15 to assemble deployment bundle',
    handoffTo: 'Unit 17 (Launch Memo) & Unit 19 (Payment & Proof)'
  },
  sub_m17: {
    waitingFor: 'Compiled media bundle from Unit 16 to synthesize 1-page launch memo',
    handoffTo: 'Lead Campaign Director & Marketing Executives'
  },
  sub_m18: {
    waitingFor: 'All 7 micro-invoices to audit total spend against $0.0500 cap ($0.0245 total)',
    handoffTo: 'Unit 19 (Payment & Proof)'
  },
  sub_m19: {
    waitingFor: 'Final asset bundle hash and spend receipt',
    handoffTo: 'Payment and proof record'
  },
  // Supplier Clearance Presets fallback
  sub_8: { waitingFor: 'Lead Agent request to check official corporate registry', handoffTo: 'Unit 05 (Entity Structure)' },
  sub_9: { waitingFor: 'Lead Agent request to audit financial statements', handoffTo: 'Unit 06 (Solvency Analysis)' },
  sub_10: { waitingFor: 'Lead Agent request to trace beneficial ownership', handoffTo: 'Unit 05 (Entity Structure)' },
  sub_11: { waitingFor: 'Lead Agent request to pull commercial credit rating', handoffTo: 'Unit 06 (Solvency Analysis)' },
  sub_12: { waitingFor: 'Lead Agent request to scan litigation records', handoffTo: 'Unit 16 (Contract Review)' },
  sub_18: { waitingFor: 'Lead Agent request to scan sanctions watchlists', handoffTo: 'Unit 07 (Export Compliance)' },
  sub_19: { waitingFor: 'Lead Agent request to scan global news wire', handoffTo: 'Unit 13 (Dossier Assembly)' },
  sub_5: { waitingFor: 'Corporate registry & ownership records from Units 08 & 10', handoffTo: 'Unit 13 (Dossier Assembly)' },
  sub_6: { waitingFor: 'Audited financials & credit scores from Units 09 & 11', handoffTo: 'Unit 17 (Stress Simulations)' },
  sub_7: { waitingFor: 'Sanctions clearance from Unit 18 to audit export controls', handoffTo: 'Unit 13 (Dossier Assembly)' },
  sub_16: { waitingFor: 'Litigation records from Unit 12 to audit liability caps', handoffTo: 'Unit 14 (Board Memo)' },
  sub_17: { waitingFor: 'Financial leverage metrics from Unit 06 to run stress test', handoffTo: 'Unit 13 (Dossier Assembly)' },
  sub_1: { waitingFor: 'Records across all 7 feeds to verify Tax ID match', handoffTo: 'Unit 03 (Scoring)' },
  sub_2: { waitingFor: 'Corporate filings from Unit 08 to confirm DGCL compliance', handoffTo: 'Unit 14 (Board Memo)' },
  sub_3: { waitingFor: 'Clearance findings from Units 05, 06, 07, 16 & 17 to weight score', handoffTo: 'Unit 14 (Board Memo)' },
  sub_4: { waitingFor: 'Final composite score from Unit 03', handoffTo: 'Payment and proof record' },
  sub_13: { waitingFor: 'Clearance inputs from all 19 specialist units to build dossier', handoffTo: 'Unit 14 (Board Memo)' },
  sub_14: { waitingFor: 'Compiled clearance dossier from Unit 13 to draft executive memo', handoffTo: 'Board of Directors' },
  sub_15: { waitingFor: 'Approved memo from Unit 14 to translate into DE & ES', handoffTo: 'Global Executive Brief' },
  sub_a1: { waitingFor: 'Lead AI market session authorization ($0.0010)', handoffTo: 'Unit a2 (Prediction Model)' },
  sub_a4: { waitingFor: 'Lead AI compliance authorization ($0.0010)', handoffTo: 'Unit a3 (Risk Sandbox)' },
  sub_a2: { waitingFor: 'Example orderbook snapshot from Unit a1', handoffTo: 'Unit a3 (Risk Sandbox)' },
  sub_a3: { waitingFor: 'Momentum analysis (Unit a2) & AML check (Unit a4)', handoffTo: 'Settlement engine' },
};


// Worker cards do not own separate wallets. A live run uses the configured
// session key supplied by the backend; evaluation runs intentionally expose
// no made-up address.
const getWorkerWalletAddress = (_subId: string): string => '';

const PRESET_SWARMS = [
  {
    id: 'swarm_media_creative',
    title: 'Viral Ad Campaign',
    missionType: 'Autonomous Ad & Media Studio',
    goal: 'Launch viral multi-platform ad campaign for new product under $0.05 budget.',
    goalDesc: 'Lead AI coordinates 12 specialist creative workers and buys approved data from 7 providers to analyze trends, generate assets, translate scripts to 5 languages, check ad policies, and deliver a ready-to-run marketing package.',
    budgetLimit: '$0.0500 policy cap',
    budgetEst: '$0.0245',
    rules: 'Approved creative feeds · Max $0.0050 per request · Zero subscriptions',
    description: '1 Lead Agent · 12 Creative Workers · 7 Example Media Inputs',
    subcontractors: [
      // MISSION ORCHESTRATOR: 1 Lead Agent (Campaign Director)
      { 
        id: 'lead_orchestrator', 
        role: 'Campaign Director', 
        shortName: 'Lead AI Director', 
        targetUrl: '/api/v1/lead-agent', 
        providerLabel: 'Creative Orchestrator', 
        costPathUsd: 0.0000, 
        avatarColor: 'bg-zinc-800', 
        category: 'Mission Lead', 
        team: 'Lead Orchestrator', 
        savingsVsSubscription: 'Replaces agency management fee', 
        deliverablePreview: 'Campaign Plan & Asset Bundle', 
        currentTask: 'Directing 12 creative workers & 7 media feeds under $0.0500 cap',
        taskInput: 'Goal: Launch viral ad campaign for new product',
        taskOutput: 'Ready-to-Launch Multi-Platform Ad Package & Executive Brief',
        workingAction: 'Planning multi-channel ad strategy & budget allocation...', 
        generatedValueUsd: 3.50, 
        nodeType: 'ORCHESTRATOR' as const, 
        waveGroup: 0, 
        queryPrompt: 'Direct 12 workers and 7 feeds for multi-platform ad launch',
        verifiedBadge: '✓ Workforce Dispatched',
        samplePayload: 'Marketing Plan: Multi-platform campaign verified across 20 units: 1 Lead Agent, 12 Workers, 7 Providers. Total spend: $0.0245 / $0.0500 cap.' 
      },

      // PHASE 1: 7 Example Media Inputs ($0.0100 planned)
      { 
        id: 'sub_m1', 
        role: 'TikTok Viral Trends', 
        shortName: 'TikTok Radar', 
        targetUrl: '/api/v1/media/tiktok-trends', 
        providerLabel: 'Licensed Trend Feed (Sample provider)', 
        costPathUsd: 0.0015, 
        avatarColor: 'bg-zinc-700', 
        category: 'Market Data', 
        team: 'Data Providers', 
        savingsVsSubscription: 'Pay per licensed trend scan — no monthly tier', 
        deliverablePreview: 'Top 5 Viral Sounds & Hooks', 
        currentTask: 'Reviewing a sample TikTok trend feed & hooks',
        taskInput: 'Niche: Tech & SaaS Product',
        taskOutput: 'Top 5 trending audio stems & 3 high-velocity hooks',
        workingAction: 'Reviewing sample TikTok trend data ($0.0015)...', 
        generatedValueUsd: 0.60, 
        nodeType: 'PROVIDER' as const, 
        waveGroup: 1, 
        queryPrompt: 'Query example trend data and hashtag velocity',
        verifiedBadge: '✓ 5 Viral Hooks Locked',
        samplePayload: 'TikTok Trend Data: Ingested #AIRevolution and #TechTok trends. Sound stem #84918 viral velocity +340%.' 
      },
      { 
        id: 'sub_m2', 
        role: 'Twitter / X Topic Pulse', 
        shortName: 'X Pulse', 
        targetUrl: '/api/v1/media/x-trends', 
        providerLabel: 'Licensed Social Pulse (Sample provider)', 
        costPathUsd: 0.0010, 
        avatarColor: 'bg-zinc-700', 
        category: 'Market Data', 
        team: 'Data Providers', 
        savingsVsSubscription: 'Pay per query — zero API tier cost', 
        deliverablePreview: 'Viral Discussion Angles', 
        currentTask: 'Reviewing example conversational signals and debate angles',
        taskInput: 'Keywords: Autonomous AI, Future of Work',
        taskOutput: 'High-engagement discussion angles and top sentiment triggers',
        workingAction: 'Analyzing X / Twitter sentiment and controversy angles ($0.0010)...', 
        generatedValueUsd: 0.50, 
        nodeType: 'PROVIDER' as const, 
        waveGroup: 1, 
        queryPrompt: 'Query example social signals for discussion angles',
        verifiedBadge: '✓ 3 Engagement Angles',
        samplePayload: 'Twitter Trend Feed: Sentiment analysis highlights user frustration with monthly SaaS subscriptions. Prime angle locked.' 
      },
      { 
        id: 'sub_m3', 
        role: 'Competitor Ad Library', 
        shortName: 'Ad Spy API', 
        targetUrl: '/api/v1/media/competitor-ads', 
        providerLabel: 'Licensed Competitor Ad Library (Sample provider)', 
        costPathUsd: 0.0015, 
        avatarColor: 'bg-zinc-700', 
        category: 'Competitive Intelligence', 
        team: 'Data Providers', 
        savingsVsSubscription: 'Pay per spy query — zero ad intelligence fee', 
        deliverablePreview: 'Top 3 Competitor Ad Formats', 
        currentTask: 'Extracting top-spending competitor ad formats and CTA structures',
        taskInput: 'Target competitors: Ramp, Brex, OpenAI Enterprise',
        taskOutput: 'Top 3 converting ad structures: Problem-Agitate-Solve video format',
        workingAction: 'Reviewing licensed competitor ad examples ($0.0015 planned)...', 
        generatedValueUsd: 0.70, 
        nodeType: 'PROVIDER' as const, 
        waveGroup: 1, 
        queryPrompt: 'Extract example competitor ad angles and visual structures',
        verifiedBadge: '✓ Winning Formats Scanned',
        samplePayload: 'Competitor Ads: Analyzed 42 active ads. Short vertical UGC-style videos driving 74% of conversions.' 
      },
      { 
        id: 'sub_m4', 
        role: 'Flux Visual Concept Feed', 
        shortName: 'Flux Visual Engine', 
        targetUrl: '/api/v1/media/flux-render', 
        providerLabel: 'Visual Asset Cluster (Sample provider)', 
        costPathUsd: 0.0025, 
        avatarColor: 'bg-zinc-700', 
        category: 'Generative Visuals', 
        team: 'Data Providers', 
        savingsVsSubscription: 'On-demand generation credits — zero idle bills', 
        deliverablePreview: 'Key Visual Assets & Alpha Masks', 
        currentTask: 'Generating product visual assets & background elements',
        taskInput: 'Prompt: Sleek minimalist enterprise AI dashboard in dark carbon studio lighting',
        taskOutput: 'Product visual assets with transparent alpha masks',
        workingAction: 'Generating visual assets on cloud feed ($0.0025)...', 
        generatedValueUsd: 1.20, 
        nodeType: 'PROVIDER' as const, 
        waveGroup: 1, 
        queryPrompt: 'Generate product visual assets in dark carbon studio lighting',
        verifiedBadge: '✓ Visuals Prepared',
        samplePayload: 'Visual Assets: High-resolution PNG concept renders generated. Lighting: Dark mode carbon studio. Alpha cutout clean.' 
      },
      { 
        id: 'sub_m5', 
        role: 'Neural Voiceover Studio', 
        shortName: 'Voice Cloud', 
        targetUrl: '/api/stream/inference', 
        providerLabel: 'Neural Speech API (Sample provider)', 
        costPathUsd: 0.0015, 
        avatarColor: 'bg-zinc-700', 
        category: 'Audio Synthesis', 
        team: 'Data Providers', 
        savingsVsSubscription: 'Pay per audio chunk — zero voice studio seat', 
        deliverablePreview: 'Studio Voiceover Audio Track', 
        currentTask: 'Synthesizing charismatic energetic voiceover audio track',
        taskInput: 'Script: "Stop paying monthly retainers for AI. Meet your on-demand workforce."',
        taskOutput: 'Studio-mastered 24-bit WAV voiceover track',
        workingAction: 'Synthesizing voiceover audio track with neural voice ($0.0015)...', 
        generatedValueUsd: 0.80, 
        nodeType: 'PROVIDER' as const, 
        waveGroup: 1, 
        queryPrompt: 'Synthesize voiceover track with high-energy charismatic tone',
        verifiedBadge: '✓ Studio Audio Mastered',
        samplePayload: 'Audio Track: 24-bit 48kHz WAV narration file synthesized. Pacing: 140 WPM, punchy cadence.' 
      },
      { 
        id: 'sub_m6', 
        role: 'Trending Music Beats', 
        shortName: 'Beat Stems API', 
        targetUrl: '/api/v1/media/music-beats', 
        providerLabel: 'Royalty-Free Audio Stems (Sample provider)', 
        costPathUsd: 0.0010, 
        avatarColor: 'bg-zinc-700', 
        category: 'Audio Licensing', 
        team: 'Data Providers', 
        savingsVsSubscription: 'Pay per track license — zero music subscription', 
        deliverablePreview: 'High-BPM Electronic Background Beat', 
        currentTask: 'Licensing royalty-free trending electronic beat for video ads',
        taskInput: 'Style: Modern synthwave cyber electronic beat, 128 BPM',
        taskOutput: 'Commercial license key & mixed audio stem file',
        workingAction: 'Licensing trending electronic background beat ($0.0010)...', 
        generatedValueUsd: 0.50, 
        nodeType: 'PROVIDER' as const, 
        waveGroup: 1, 
        queryPrompt: 'License royalty-free high-retention audio stem for social ads',
        verifiedBadge: '✓ Commercial Beat Licensed',
        samplePayload: 'Audio Licensing: Commercial social media license active. 128 BPM electronic synth track synced.' 
      },
      { 
        id: 'sub_m7', 
        role: 'Audience Demographics', 
        shortName: 'Buyer Segments', 
        targetUrl: '/api/v1/media/audience-data', 
        providerLabel: 'Consumer Graph Registry (Sample provider)', 
        costPathUsd: 0.0010, 
        avatarColor: 'bg-zinc-700', 
        category: 'Targeting Data', 
        team: 'Data Providers', 
        savingsVsSubscription: 'Direct micro-query — zero data broker contract', 
        deliverablePreview: 'High-Intent Buyer Clusters', 
        currentTask: 'Fetching high-converting demographic targeting parameters',
        taskInput: 'Audience: Tech Founders, AI Engineers, CFOs (Age 24-45)',
        taskOutput: 'Targeting matrix: Meta & TikTok interest lookalikes',
        workingAction: 'Pulling high-intent buyer lookalike parameters ($0.0010)...', 
        generatedValueUsd: 0.45, 
        nodeType: 'PROVIDER' as const, 
        waveGroup: 1, 
        queryPrompt: 'Fetch verified interest keywords and demographic clusters',
        verifiedBadge: '✓ Target Audience Mapped',
        samplePayload: 'Audience Profile: High-intent B2B decision makers identified. Meta interest cluster: "Cloud Computing, Fintech, AI Tools".' 
      },

      // PHASE 2: 5 Specialist Creative & Compliance Workers ($0.0075 total)
      { 
        id: 'sub_m8', 
        role: 'Viral Hook Copywriter', 
        shortName: 'Ad Copywriter', 
        targetUrl: '/api/v1/media/copywriting', 
        providerLabel: 'Direct-Response AI', 
        costPathUsd: 0.0010, 
        avatarColor: 'bg-zinc-700', 
        category: 'Copy & Messaging', 
        team: 'Creative & Risk', 
        savingsVsSubscription: 'Pay per copy generation pass', 
        deliverablePreview: '10 High-Converting Hook Variations', 
        currentTask: 'Writing 10 scroll-stopping ad headlines and A/B test variations',
        taskInput: 'Trend data, competitor hooks & product value proposition',
        taskOutput: '10 viral hooks with 3 full video scripts (AIDA framework)',
        workingAction: 'Writing 10 scroll-stopping hooks and video scripts...', 
        generatedValueUsd: 0.60, 
        nodeType: 'WORKER' as const, 
        waveGroup: 2, 
        queryPrompt: 'Draft 10 viral hooks and 3 complete video scripts using AIDA formula',
        verifiedBadge: '✓ 10 Viral Hooks Ready',
        samplePayload: 'Ad Copy: Hook #1: "You wouldn\'t hire 20 people to check one invoice. Why pay $50/mo for 20 AI tools?" Scripts ready.' 
      },
      { 
        id: 'sub_m9', 
        role: 'Visual Layout Designer', 
        shortName: 'Visual Designer', 
        targetUrl: '/api/v1/media/layout-design', 
        providerLabel: 'Dynamic Layout Engine', 
        costPathUsd: 0.0015, 
        avatarColor: 'bg-zinc-700', 
        category: 'Graphic Design', 
        team: 'Creative & Risk', 
        savingsVsSubscription: 'On-demand layout composition', 
        deliverablePreview: '9:16 Vertical Video & Carousel Layouts', 
        currentTask: 'Composing 9:16 vertical video storyboard and carousel banners',
        taskInput: 'Visual concept assets, headline copy & branding colors',
        taskOutput: 'Multi-frame vertical storyboard & 5 carousel slides',
        workingAction: 'Composing vertical video storyboards and banner frames...', 
        generatedValueUsd: 0.80, 
        nodeType: 'WORKER' as const, 
        waveGroup: 2, 
        queryPrompt: 'Compose 9:16 vertical video layout and 5-slide carousel assets',
        verifiedBadge: '✓ 9:16 Storyboards Built',
        samplePayload: 'Visual Layout: Storyboard composed for 15-second vertical ad. 5-frame carousel banners generated in 1080x1920 format.' 
      },
      { 
        id: 'sub_m10', 
        role: 'Ad Policy & Compliance', 
        shortName: 'Policy Auditor', 
        targetUrl: '/api/v1/media/policy-check', 
        providerLabel: 'Ad Policy Guardrail', 
        costPathUsd: 0.0010, 
        avatarColor: 'bg-zinc-700', 
        category: 'Platform Compliance', 
        team: 'Creative & Risk', 
        savingsVsSubscription: 'Zero compliance rejection', 
        deliverablePreview: 'Meta & TikTok Policy Clearance', 
        currentTask: 'Auditing ad scripts & visuals against Meta, TikTok & Google ad policies',
        taskInput: 'Ad copy, claims, disclaimers & visual frames',
        taskOutput: 'Policy Pass: Compliant claims verified, disclaimers formatted',
        workingAction: 'Auditing copy & imagery against platform ad policies...', 
        generatedValueUsd: 0.50, 
        nodeType: 'WORKER' as const, 
        waveGroup: 2, 
        queryPrompt: 'Audit copy and visuals against platform advertising guidelines',
        verifiedBadge: '✓ Policy Cleared',
        samplePayload: 'Compliance Audit: Passed Meta & TikTok advertising guidelines. Approved for platform deployment.' 
      },
      { 
        id: 'sub_m11', 
        role: 'Audio-Visual Storyboard Engine', 
        shortName: 'Video Sync Bot', 
        targetUrl: '/api/v1/media/video-sync', 
        providerLabel: 'Automated Storyboard Editor', 
        costPathUsd: 0.0015, 
        avatarColor: 'bg-zinc-700', 
        category: 'Video Production', 
        team: 'Creative & Risk', 
        savingsVsSubscription: 'Cloud timeline compilation per run', 
        deliverablePreview: '15s Video Storyboard & Captions Spec', 
        currentTask: 'Syncing voice narration cues, background music, captions & visual cuts',
        taskInput: 'Audio stems, storyboard frames & timestamped subtitles',
        taskOutput: '15-second master storyboard spec with animated captions',
        workingAction: 'Editing and syncing voiceover, audio beats & dynamic captions...', 
        generatedValueUsd: 1.10, 
        nodeType: 'WORKER' as const, 
        waveGroup: 2, 
        queryPrompt: 'Compile 15-second vertical storyboard with dynamic kinetic subtitles',
        verifiedBadge: '✓ Storyboard Synced',
        samplePayload: 'Video Spec: 15-second 1080x1920 vertical layout composed with auto-synced kinetic typography prompts and sound cues.' 
      },
      { 
        id: 'sub_m12', 
        role: 'Creative Pacing Reviewer', 
        shortName: 'Creative Review', 
        targetUrl: '/api/v1/media/creative-review', 
        providerLabel: 'Pacing & Engagement Check', 
        costPathUsd: 0.0025, 
        avatarColor: 'bg-zinc-700', 
        category: 'Performance Modeling', 
        team: 'Creative & Risk', 
        savingsVsSubscription: 'Validate creative appeal prior to ad spend', 
        deliverablePreview: 'Creative Clearance: High Appeal', 
        currentTask: 'Reviewing headline hooks, visual pacing & narrative retention flow',
        taskInput: 'Headline hooks, visual thumbnails & pacing metrics',
        taskOutput: 'Pacing Confirmed: High-retention narrative structure verified',
        workingAction: 'Reviewing ad pacing and narrative engagement quality...', 
        generatedValueUsd: 1.30, 
        nodeType: 'WORKER' as const, 
        waveGroup: 2, 
        queryPrompt: 'Evaluate narrative pacing and visual retention curve',
        verifiedBadge: '✓ Pacing Cleared',
        samplePayload: 'Creative Review: Narrative pacing and visual hooks verified for strong multi-platform audience retention.' 
      },

      // PHASE 3: 7 Packaging, Localization & Attestation Workers ($0.0070 total)
      { 
        id: 'sub_m13', 
        role: 'Platform Formats', 
        shortName: 'Platform Formats', 
        targetUrl: '/api/v1/media/platform-format', 
        providerLabel: 'Aspect ratio adapter', 
        costPathUsd: 0.0010, 
        avatarColor: 'bg-zinc-700', 
        category: 'Asset Packaging', 
        team: 'Packaging & Proof', 
        savingsVsSubscription: 'Auto-adapts for 4 platforms', 
        deliverablePreview: 'TikTok, Reels, Shorts & X Formats', 
        currentTask: 'Exporting assets in 9:16, 1:1, and 16:9 aspect ratios',
        taskInput: 'Master video, carousel banners & cover art',
        taskOutput: 'Native resolution files for Instagram, TikTok, YouTube Shorts, X',
        workingAction: 'Reformatting video and image assets for 4 platforms...', 
        generatedValueUsd: 0.60, 
        nodeType: 'WORKER' as const, 
        waveGroup: 3, 
        queryPrompt: 'Format campaign assets for TikTok, Reels, Shorts and X',
        verifiedBadge: '✓ 4 Platforms Formatted',
        samplePayload: 'Platform Formats: 9:16 (TikTok/Reels), 1:1 (Feed), 16:9 (YouTube) formatted and color-calibrated.' 
      },
      { 
        id: 'sub_m14', 
        role: 'Translation', 
        shortName: 'Translation', 
        targetUrl: '/api/v1/media/translate', 
        providerLabel: '5 languages localized', 
        costPathUsd: 0.0010, 
        avatarColor: 'bg-zinc-700', 
        category: 'Localization', 
        team: 'Packaging & Proof', 
        savingsVsSubscription: 'Zero professional translation fees', 
        deliverablePreview: 'English, Spanish, German, French, Japanese', 
        currentTask: 'Localizing copy, captions, and call-to-actions into 5 languages',
        taskInput: 'Master ad scripts and headline variations',
        taskOutput: 'Native localized ad copy for ES, DE, FR, JP markets',
        workingAction: 'Translating and localizing ad copy into 5 languages...', 
        generatedValueUsd: 0.80, 
        nodeType: 'WORKER' as const, 
        waveGroup: 3, 
        queryPrompt: 'Translate ad scripts and subtitles into Spanish, German, French, Japanese',
        verifiedBadge: '✓ 5 Languages Ready',
        samplePayload: 'Localization: Cultural nuances preserved across Spanish, German, French, and Japanese ad copy.' 
      },
      { 
        id: 'sub_m15', 
        role: 'Thumbnail Maker', 
        shortName: 'Thumbnail Maker', 
        targetUrl: '/api/v1/media/thumbnails', 
        providerLabel: 'Cover images for A/B test', 
        costPathUsd: 0.0010, 
        avatarColor: 'bg-zinc-700', 
        category: 'Asset Packaging', 
        team: 'Packaging & Proof', 
        savingsVsSubscription: 'A/B test thumbnails instantly', 
        deliverablePreview: '3 Campaign Covers Generated', 
        currentTask: 'Generating 3 eye-catching cover thumbnails with high visual contrast',
        taskInput: 'Key visuals, bold headline badges & high-contrast outlines',
        taskOutput: '3 optimized cover thumbnails ready for A/B testing',
        workingAction: 'Generating 3 high-contrast A/B test cover thumbnails...', 
        generatedValueUsd: 0.50, 
        nodeType: 'WORKER' as const, 
        waveGroup: 3, 
        queryPrompt: 'Generate 3 high-contrast thumbnails designed for maximum click-through',
        verifiedBadge: '✓ 3 Thumbnails Generated',
        samplePayload: 'Thumbnails: 3 cover options rendered with 24% higher simulated contrast than category average.' 
      },
      { 
        id: 'sub_m16', 
        role: 'Asset Packager', 
        shortName: 'Asset Packager', 
        targetUrl: '/api/v1/media/bundle-package', 
        providerLabel: 'Campaign bundle archive', 
        costPathUsd: 0.0010, 
        avatarColor: 'bg-zinc-700', 
        category: 'Asset Packaging', 
        team: 'Packaging & Proof', 
        savingsVsSubscription: 'One-click campaign export', 
        deliverablePreview: 'Full Media Package Ready', 
        currentTask: 'Bundling videos, images, scripts, and targeting metadata into export archive',
        taskInput: '19 specialist creative deliverables',
        taskOutput: 'Complete campaign deployment package: all media assets structured',
        workingAction: 'Compiling all 19 media deliverables into export bundle...', 
        generatedValueUsd: 0.70, 
        nodeType: 'WORKER' as const, 
        waveGroup: 3, 
        queryPrompt: 'Bundle all videos, images, scripts, and targeting configs into ready package',
        verifiedBadge: '✓ Asset Package Built',
        samplePayload: 'Package Summary: 1 Storyboard JSON, 5 carousel layouts, 3 thumbnails, 5 language subtitle files bundled.' 
      },
      { 
        id: 'sub_m17', 
        role: 'Campaign Memo', 
        shortName: 'Campaign Memo', 
        targetUrl: '/api/v1/media/executive-memo', 
        providerLabel: '1-page launch memo', 
        costPathUsd: 0.0010, 
        avatarColor: 'bg-zinc-700', 
        category: 'Executive Output', 
        team: 'Packaging & Proof', 
        savingsVsSubscription: 'Zero marketing agency retainer', 
        deliverablePreview: '1-Page Campaign Launch Brief', 
        currentTask: 'Drafting 1-page executive campaign brief with launch plan & channel allocations',
        taskInput: 'Asset bundle, spend breakdown & channel allocations',
        taskOutput: '1-Page Executive Memo: Recommendation = LAUNCH CAMPAIGN',
        workingAction: 'Synthesizing 1-page marketing executive brief...', 
        generatedValueUsd: 0.60, 
        nodeType: 'WORKER' as const, 
        waveGroup: 3, 
        queryPrompt: 'Draft 1-page executive campaign memo with launch strategy and budget audit',
        verifiedBadge: '✓ 1-Page Memo Ready',
        samplePayload: 'Executive Memo: Recommendation = LAUNCH CAMPAIGN. Multi-channel ad package verified across 4 platforms. Total production spend: $0.0245.' 
      },
      { 
        id: 'sub_m18', 
        role: 'Budget Check', 
        shortName: 'Budget Check', 
        targetUrl: '/api/v1/media/budget-audit', 
        providerLabel: 'Treasury spend audit', 
        costPathUsd: 0.0010, 
        avatarColor: 'bg-zinc-700', 
        category: 'Financial Audit', 
        team: 'Packaging & Proof', 
        savingsVsSubscription: 'Hard budget enforcement', 
        deliverablePreview: '$0.0245 Spent ($0.0255 Saved)', 
        currentTask: 'Auditing micro-transaction ledger against $0.0500 policy ceiling',
        taskInput: '19 unit transaction receipts & allocated budget ceiling',
        taskOutput: 'Verified spend: $0.0245 USD (51% under the $0.0500 ceiling)',
        workingAction: 'Auditing micro-transaction spend against budget cap...', 
        generatedValueUsd: 0.40, 
        nodeType: 'WORKER' as const, 
        waveGroup: 3, 
        queryPrompt: 'Verify total campaign production spend against $0.0500 budget cap',
        verifiedBadge: '✓ Spend Verified: $0.0245',
        samplePayload: 'Spend Audit: Total spent across 12 workers and 7 providers: $0.0245 USD. Budget surplus: $0.0255 USD (51% saved).' 
      },
      { 
        id: 'sub_m19', 
        role: 'Payment & Proof', 
        shortName: 'Payment & Proof', 
        targetUrl: '/api/v1/media/blockchain-seal', 
        providerLabel: 'Payment & proof record', 
        costPathUsd: 0.0010, 
        avatarColor: 'bg-zinc-700', 
        category: 'Payment Proof', 
        team: 'Packaging & Proof', 
        savingsVsSubscription: 'Proof of asset provenance', 
        deliverablePreview: 'Campaign proof record', 
        currentTask: 'Recording the campaign asset hash for review',
        taskInput: 'Cryptographic hash of 19 media deliverables',
        taskOutput: 'Evaluation record prepared (digest available after a confirmed receipt)',
        workingAction: 'Recording media asset provenance...', 
        generatedValueUsd: 0.50, 
        nodeType: 'WORKER' as const, 
        waveGroup: 3, 
        queryPrompt: 'Record the campaign asset hash with the session key',
        verifiedBadge: '✓ Proof record ready',
        samplePayload: 'Payment Proof: Campaign bundle record prepared; live wallet required for a chain receipt.' 
      },
    ],
  },
  {
    id: 'swarm_20_autonomous',
    title: 'Enterprise Due Diligence',
    missionType: 'Supplier Due Diligence',
    goal: 'Check Apex Foundry before signing a contract.',
    goalDesc: 'Lead Agent coordinates 12 specialist workers and requests data from 7 external providers to verify registration, financial health, legal risk, and solvency, then compiles an approved decision memo under the $0.0300 budget cap.',
    budgetLimit: '$0.0300 policy cap',
    budgetEst: '$0.0270',
    rules: 'Approved providers only · Max $0.0050 per request · Zero subscriptions',
    description: '1 Lead Agent · 12 Specialist Workers · 7 External Providers',
    subcontractors: [
      // MISSION ORCHESTRATOR: 1 Lead Agent (Chief Mission Director)
      { 
        id: 'lead_orchestrator', 
        role: 'Chief Mission Director', 
        shortName: 'Chief AI', 
        targetUrl: '/api/v1/lead-agent', 
        providerLabel: 'Mission Director', 
        costPathUsd: 0.0000, 
        avatarColor: 'bg-zinc-800', 
        category: 'Mission Lead', 
        team: 'Lead Orchestrator', 
        savingsVsSubscription: 'Replaces manual coordinator overhead', 
        deliverablePreview: 'Operational Work Plan & Decision Memo', 
        currentTask: 'Directing 12 workers & 7 providers under $0.0300 cap',
        taskInput: 'Goal: Check Apex Foundry before contract signing',
        taskOutput: 'Supplier Review Memo & Evidence Pack', 
        workingAction: 'Directing 12 workers & 7 providers under budget policy...', 
        generatedValueUsd: 2.50, 
        nodeType: 'ORCHESTRATOR' as const, 
        waveGroup: 0, 
        queryPrompt: 'Direct 12 workers and 7 example inputs for supplier review',
        verifiedBadge: '✓ Workforce Dispatched',
        samplePayload: 'Work Plan: Target "Apex Foundry Ltd" reviewed across 20 evaluation units: 1 Lead Agent, 12 Workers ($0.0150), 7 example inputs ($0.0120). Total planned spend: $0.0270 / $0.0300 cap.' 
      },

      // PHASE 1: 7 Example Registry & Data Inputs ($0.0120 planned)
      { 
        id: 'sub_8', 
        role: 'Company Registration', 
        shortName: 'Entity Registry', 
        targetUrl: '/api/v1/due-diligence/corporate-registry', 
        providerLabel: 'Corporate Registry API', 
        costPathUsd: 0.0020, 
        avatarColor: 'bg-zinc-700', 
        category: 'Corporate Standing', 
        team: 'Data Providers', 
        savingsVsSubscription: 'Pay $0.0020 per query — zero monthly fee', 
        deliverablePreview: 'Example Registry Snapshot', 
        currentTask: 'Providing company registration status & good standing data',
        taskInput: 'Target: "Apex Foundry Ltd"',
        taskOutput: 'Example corporate record for review',
        workingAction: 'Checking company registration status ($0.0020)...', 
        generatedValueUsd: 0.55, 
        nodeType: 'PROVIDER' as const, 
        waveGroup: 1, 
        queryPrompt: 'Review the supplied corporate registration snapshot',
        verifiedBadge: '✓ Example record received',
        samplePayload: 'Company Record: "Apex Foundry Ltd" — example registry snapshot received for review.' 
      },
      { 
        id: 'sub_9', 
        role: 'Financial Health', 
        shortName: 'Financial Disclosures', 
        targetUrl: '/api/v1/due-diligence/sec-filings', 
        providerLabel: 'Financial Disclosures API', 
        costPathUsd: 0.0020, 
        avatarColor: 'bg-zinc-700', 
        category: 'Financial Disclosure', 
        team: 'Data Providers', 
        savingsVsSubscription: 'Pay per filing check — zero annual fee', 
        deliverablePreview: 'Example Financial Snapshot', 
        currentTask: 'Providing audited annual filings & balance sheet data',
        taskInput: 'Financial disclosure query: Apex Foundry Ltd',
        taskOutput: 'Example annual filing snapshot (+$12.4M operating cash flow)',
        workingAction: 'Reading the supplied financial snapshot ($0.0020)...', 
        generatedValueUsd: 0.60, 
        nodeType: 'PROVIDER' as const, 
        waveGroup: 1, 
        queryPrompt: 'Query standardized financial disclosures for annual balance sheets',
        verifiedBadge: '✓ Example figures loaded',
        samplePayload: 'Annual Financial Snapshot: example filing figures loaded. Operating cash flow shown: +$12.4M.' 
      },
      { 
        id: 'sub_10', 
        role: 'Real Company Owners', 
        shortName: 'Shareholders Graph', 
        targetUrl: '/api/v1/due-diligence/beneficial-ownership', 
        providerLabel: 'Shareholders Registry', 
        costPathUsd: 0.0015, 
        avatarColor: 'bg-zinc-700', 
        category: 'Ownership Graph', 
        team: 'Data Providers', 
        savingsVsSubscription: 'Pay per search — zero monthly tier', 
        deliverablePreview: 'Example Ownership Snapshot', 
        currentTask: 'Providing beneficial ownership & cap table data',
        taskInput: 'Entity beneficial ownership query',
        taskOutput: 'Example cap table: 68% founders, 32% institutional',
        workingAction: 'Tracing beneficial owners & cap table ($0.0015)...', 
        generatedValueUsd: 0.50, 
        nodeType: 'PROVIDER' as const, 
        waveGroup: 1, 
        queryPrompt: 'Trace full cap table & beneficial owners',
        verifiedBadge: '✓ Example ownership loaded',
        samplePayload: 'Company Ownership: example cap table shows founders (68%) and institutional funds (32%).' 
      },
      { 
        id: 'sub_11', 
        role: 'Credit Rating', 
        shortName: 'Credit Bureau', 
        targetUrl: '/api/v1/due-diligence/credit-rating', 
        providerLabel: 'Credit Bureau API', 
        costPathUsd: 0.0015, 
        avatarColor: 'bg-zinc-700', 
        category: 'Credit Health', 
        team: 'Data Providers', 
        savingsVsSubscription: 'Pay $0.0015 per score — zero bureau tier', 
        deliverablePreview: 'Example Credit Snapshot', 
        currentTask: 'Providing commercial credit score & payment history',
        taskInput: 'Commercial credit index request',
        taskOutput: 'Score: 88/100 (Grade A- · 34-day payment avg)',
        workingAction: 'Querying commercial credit index ($0.0015)...', 
        generatedValueUsd: 0.50, 
        nodeType: 'PROVIDER' as const, 
        waveGroup: 1, 
        queryPrompt: 'Request 12-month commercial payment & credit score',
        verifiedBadge: '✓ Example score loaded',
        samplePayload: 'Commercial Credit Example: 88/100 (Grade A-). Payments on time (34 days avg).' 
      },
      { 
        id: 'sub_12', 
        role: 'Debts & Lawsuits', 
        shortName: 'Legal Compliance', 
        targetUrl: '/api/v1/due-diligence/court-dockets', 
        providerLabel: 'Legal Compliance API', 
        costPathUsd: 0.0015, 
        avatarColor: 'bg-zinc-700', 
        category: 'Legal Risk', 
        team: 'Data Providers', 
        savingsVsSubscription: 'Pay per search — zero legal retainer', 
        deliverablePreview: 'Example Legal Snapshot', 
        currentTask: 'Providing legal compliance, judgments & liens data',
        taskInput: 'Commercial litigation & lien search',
        taskOutput: 'Example legal record summary',
        workingAction: 'Scanning legal compliance databases ($0.0015)...', 
        generatedValueUsd: 0.45, 
        nodeType: 'PROVIDER' as const, 
        waveGroup: 1, 
        queryPrompt: 'Scan legal compliance records for open lawsuits and liens',
        verifiedBadge: '✓ Example legal data loaded',
        samplePayload: 'Legal Records Example: 1 past commercial dispute resolved in 2024; no live legal search was run.' 
      },
      { 
        id: 'sub_18', 
        role: 'Sanctions Screener', 
        shortName: 'Sanctions Check', 
        targetUrl: '/api/v1/due-diligence/sanctions-check', 
        providerLabel: 'Global Watchlists', 
        costPathUsd: 0.0020, 
        avatarColor: 'bg-zinc-700', 
        category: 'Compliance & Safety', 
        team: 'Data Providers', 
        savingsVsSubscription: 'Sub-cent check — zero retainer', 
        deliverablePreview: 'Example Watchlist Snapshot', 
        currentTask: 'Providing international sanctions watchlist checks',
        taskInput: 'OFAC, EU, UN sanctions watchlist screening',
        taskOutput: 'Example watchlist result for review',
        workingAction: 'Checking OFAC, EU, UN global watchlists ($0.0020)...', 
        generatedValueUsd: 0.60, 
        nodeType: 'PROVIDER' as const, 
        waveGroup: 1, 
        queryPrompt: 'Screen company & principals against international sanctions',
        verifiedBadge: '✓ Example watchlist loaded',
        samplePayload: 'Global Watchlist Example: sample result loaded for review; no live screening was run.' 
      },
      { 
        id: 'sub_19', 
        role: 'News & Reputation', 
        shortName: 'Reputation Wire', 
        targetUrl: '/api/v1/due-diligence/adverse-media', 
        providerLabel: 'Global Media Wire', 
        costPathUsd: 0.0015, 
        avatarColor: 'bg-zinc-700', 
        category: 'Reputational Risk', 
        team: 'Data Providers', 
        savingsVsSubscription: 'Direct micro-payment — zero subscription', 
        deliverablePreview: 'Example News Snapshot', 
        currentTask: 'Providing 1,400+ news wire scans for media controversy',
        taskInput: 'Global media news wire scan: Apex Foundry',
        taskOutput: 'Example reputation summary',
        workingAction: 'Scanning 1,400+ news wires for controversy ($0.0015)...', 
        generatedValueUsd: 0.45, 
        nodeType: 'PROVIDER' as const, 
        waveGroup: 1, 
        queryPrompt: 'Scan news wires for adverse media & reputational risk',
        verifiedBadge: '✓ Example news data loaded',
        samplePayload: 'Reputation & News Example: sample headlines loaded for review; no live news scan was run.' 
      },

      // PHASE 2: 5 Risk & Analysis Workers ($0.0080 total) - Specialized AI workers
      { 
        id: 'sub_5', 
        role: 'Corporate Structure', 
        shortName: 'Branch Auditor', 
        targetUrl: '/api/v1/due-diligence/corporate-registry', 
        providerLabel: 'Structure Analysis', 
        costPathUsd: 0.0010, 
        avatarColor: 'bg-zinc-700', 
        category: 'Entity Verification', 
        team: 'Analysis & Risk', 
        savingsVsSubscription: 'Pay per structure review', 
        deliverablePreview: 'Parent + 2 Operating Branches', 
        currentTask: 'Mapping corporate hierarchy & branch ownership',
        taskInput: 'Company registry & cap table data',
        taskOutput: 'Parent + 2 Branches (both wholly owned · 0 offshore)',
        workingAction: 'Records received ➔ Mapping corporate hierarchy...', 
        generatedValueUsd: 0.40, 
        nodeType: 'WORKER' as const, 
        waveGroup: 2, 
        queryPrompt: 'Map parent company, subsidiaries & offshore routing risk',
        verifiedBadge: '✓ Parent + 2 Branches (0 Offshore)',
        samplePayload: 'Company Structure: Parent company with 2 operating branches (both wholly owned). Zero offshore routing.' 
      },
      { 
        id: 'sub_6', 
        role: 'Cash & Debt Audit', 
        shortName: 'Cash Auditor', 
        targetUrl: '/api/v1/due-diligence/sec-filings', 
        providerLabel: 'Financial Analysis', 
        costPathUsd: 0.0010, 
        avatarColor: 'bg-zinc-700', 
        category: 'Financial Health', 
        team: 'Analysis & Risk', 
        savingsVsSubscription: 'Pay per audit calculation', 
        deliverablePreview: 'Cash 2.4x · Debt: 0.42 (Low)', 
        currentTask: 'Auditing cash reserves, debt ratio & liquidity buffer',
        taskInput: 'Audited SEC 10-K filings from provider',
        taskOutput: 'Liquidity: 2.4x cash coverage · Debt: 0.42 (Low Risk)',
        workingAction: '10-K received ➔ Auditing cash reserves & debt leverage...', 
        generatedValueUsd: 0.45, 
        nodeType: 'WORKER' as const, 
        waveGroup: 2, 
        queryPrompt: 'Audit cash coverage ratio, debt leverage & solvency buffer',
        verifiedBadge: '✓ Cash: 2.4x · Debt: 0.42 (Low)',
        samplePayload: 'Financial Health: Cash ratio 2.4x (target >1.5x). Low debt ratio (0.42). Financial health strong.' 
      },
      { 
        id: 'sub_7', 
        role: 'Trade & Tariffs', 
        shortName: 'Trade Rules', 
        targetUrl: '/api/v1/due-diligence/sanctions-check', 
        providerLabel: 'Trade Rules Engine', 
        costPathUsd: 0.0010, 
        avatarColor: 'bg-zinc-700', 
        category: 'Regulatory Audit', 
        team: 'Analysis & Risk', 
        savingsVsSubscription: 'Pay per compliance rule check', 
        deliverablePreview: 'Example Trade Rules Result', 
        currentTask: 'Auditing export controls, classifications & tariffs',
        taskInput: 'Sanctions clearance & product hardware catalog',
        taskOutput: 'Example hardware classification for review',
        workingAction: 'Auditing export controls & tariff classifications...', 
        generatedValueUsd: 0.40, 
        nodeType: 'WORKER' as const, 
        waveGroup: 2, 
        queryPrompt: 'Review export controls, hardware categories & licensing',
        verifiedBadge: '✓ Example rule result loaded',
        samplePayload: 'Trade Rules Example: standard hardware classification shown for review; no live clearance was issued.' 
      },
      { 
        id: 'sub_16', 
        role: 'Contract Terms Review', 
        shortName: 'Contract Terms', 
        targetUrl: '/api/v1/due-diligence/court-dockets', 
        providerLabel: 'Legal Clause Review', 
        costPathUsd: 0.0010, 
        avatarColor: 'bg-zinc-700', 
        category: 'Legal Risk', 
        team: 'Analysis & Risk', 
        savingsVsSubscription: 'Pay per contract audit block', 
        deliverablePreview: '2x Liability Cap · IP Safe', 
        currentTask: 'Reviewing liability cap clauses & IP indemnification',
        taskInput: 'Procurement agreement terms & docket history',
        taskOutput: 'Standard 2x liability cap confirmed · IP terms safe',
        workingAction: 'Reviewing liability cap clauses & indemnification...', 
        generatedValueUsd: 0.45, 
        nodeType: 'WORKER' as const, 
        waveGroup: 2, 
        queryPrompt: 'Verify liability cap clauses, indemnification & IP terms',
        verifiedBadge: '✓ 2x Liability Cap · IP Safe',
        samplePayload: 'Contract Review: Standard agreement verified. Liability capped at 2x contract value. Mutual IP protection confirmed.' 
      },
      { 
        id: 'sub_17', 
        role: 'Risk Simulation', 
        shortName: 'Risk Simulator', 
        targetUrl: '/api/v1/due-diligence/solvency-simulation', 
        providerLabel: 'Monte Carlo Model', 
        costPathUsd: 0.0040, 
        avatarColor: 'bg-zinc-700', 
        category: 'Quantitative Risk', 
        team: 'Analysis & Risk', 
        savingsVsSubscription: 'On-demand simulation — zero idle server cost', 
        deliverablePreview: 'Safe Zone (Solvency: 4.12)', 
        currentTask: 'Running 10,000 Monte Carlo bankruptcy stress cycles in Python',
        taskInput: 'Financial ratios, debt structure & revenue volatility',
        taskOutput: 'Solvency Score 4.12 (Safe Zone) · 1-yr default risk 0.04%',
        workingAction: 'Executing 10,000 Monte Carlo stress cycles in Python...', 
        generatedValueUsd: 0.80, 
        nodeType: 'WORKER' as const, 
        waveGroup: 2, 
        queryPrompt: 'Run 10,000-cycle Monte Carlo financial bankruptcy stress test',
        verifiedBadge: '✓ Safe Zone (Solvency: 4.12)',
        samplePayload: 'Bankruptcy Risk Model: Solvency simulation completed. Safe zone confirmed (Score 4.12). 1-year default risk: 0.04%.' 
      },

      // PHASE 3: 7 Synthesis & Decision Workers ($0.0070 total) - Specialist synthesis & reporting workers
      { 
        id: 'sub_1', 
        role: 'Match 7 Feeds', 
        shortName: 'Record Matcher', 
        targetUrl: '/api/v1/due-diligence/clearance-dossier', 
        providerLabel: 'Cross-Validation', 
        costPathUsd: 0.0010, 
        avatarColor: 'bg-zinc-700', 
        category: 'Synthesis & Proof', 
        team: 'Synthesis & Reporting', 
        savingsVsSubscription: 'Pay per cross-validation check', 
        deliverablePreview: '7/7 Match Across Feeds', 
        currentTask: 'Cross-matching Tax ID & address across 7 provider feeds',
        taskInput: '7 independent raw provider feeds',
        taskOutput: 'Full concordance on Tax ID, address & entity identity',
        workingAction: 'Cross-matching Tax ID & address across 7 feeds...', 
        generatedValueUsd: 0.35, 
        nodeType: 'WORKER' as const, 
        waveGroup: 3, 
        queryPrompt: 'Reconcile Tax ID, address & registry records across 7 feeds',
        verifiedBadge: '✓ 7/7 Feeds Match',
        samplePayload: 'Records Cross-Check: Company address, tax ID, and registration match across all 7 sources.' 
      },
      { 
        id: 'sub_2', 
        role: 'Corporate Law', 
        shortName: 'Statute Auditor', 
        targetUrl: '/api/v1/due-diligence/clearance-dossier', 
        providerLabel: 'Corporate Compliance', 
        costPathUsd: 0.0010, 
        avatarColor: 'bg-zinc-700', 
        category: 'Synthesis & Proof', 
        team: 'Synthesis & Reporting', 
        savingsVsSubscription: 'Pay per legal citation pass', 
        deliverablePreview: 'Corporate Legal Rules Met', 
        currentTask: 'Verifying statutory Corporate Law rules',
        taskInput: 'Corporate charter, bylaws & corporate records',
        taskOutput: 'Statutory disclosure requirements fully met',
        workingAction: 'Verifying statutory Corporate Law compliance...', 
        generatedValueUsd: 0.35, 
        nodeType: 'WORKER' as const, 
        waveGroup: 3, 
        queryPrompt: 'Check Corporate Law compliance & mandatory citations',
        verifiedBadge: '✓ Corporate Law Met',
        samplePayload: 'Legal Compliance: Compliant with Corporate Law regulations. Statutory requirements met.' 
      },
      { 
        id: 'sub_3', 
        role: 'Safety Score Engine', 
        shortName: 'Safety Scorer', 
        targetUrl: '/api/v1/due-diligence/clearance-dossier', 
        providerLabel: 'Risk Weighting', 
        costPathUsd: 0.0010, 
        avatarColor: 'bg-zinc-700', 
        category: 'Synthesis & Proof', 
        team: 'Synthesis & Reporting', 
        savingsVsSubscription: 'Pay per score calculation', 
        deliverablePreview: 'Safety Score: 94/100 (Grade A)', 
        currentTask: 'Weighting corporate, financial & legal vectors into composite score',
        taskInput: 'Corporate (98), Financials (92), Sanctions (100), Contract (86)',
        taskOutput: 'Composite Safety Score: 94/100 (Grade A / Low Risk)',
        workingAction: 'Weighting corporate, financial & legal findings into composite score...', 
        generatedValueUsd: 0.40, 
        nodeType: 'WORKER' as const, 
        waveGroup: 3, 
        queryPrompt: 'Weight corporate, financial & legal findings into composite score',
        verifiedBadge: '✓ Score: 94/100 (Grade A)',
        samplePayload: 'Composite Safety Score: 94/100 (Grade A / Low Risk). Company: 98 | Financials: 92 | Sanctions: 100 | Contract: 86.' 
      },
      { 
        id: 'sub_4', 
        role: 'Payment & Proof', 
        shortName: 'Payment Proof', 
        targetUrl: '/api/v1/due-diligence/clearance-dossier', 
        providerLabel: 'Payment & proof record', 
        costPathUsd: 0.0010, 
        avatarColor: 'bg-zinc-700', 
        category: 'Payment Proof', 
        team: 'Synthesis & Reporting', 
        savingsVsSubscription: 'Digital cryptographic receipt', 
        deliverablePreview: 'Verification proof record', 
        currentTask: 'Recording the verification digest for review',
        taskInput: 'Cryptographic digest of 19 verified proofs',
        taskOutput: 'Evaluation proof record (chain digest pending)',
        workingAction: 'Recording verification digest...', 
        generatedValueUsd: 0.50, 
        nodeType: 'WORKER' as const, 
        waveGroup: 3, 
        queryPrompt: 'Record the verification digest with the session key',
        verifiedBadge: '✓ EIP-712 plan prepared',
        samplePayload: 'Payment Proof: Scoped session key authorization prepared for a live chain receipt.' 
      },
      { 
        id: 'sub_13', 
        role: 'Complete Dossier', 
        shortName: 'Dossier Writer', 
        targetUrl: '/api/v1/due-diligence/clearance-dossier', 
        providerLabel: 'Executive Dossier', 
        costPathUsd: 0.0010, 
        avatarColor: 'bg-zinc-700', 
        category: 'Executive Output', 
        team: 'Synthesis & Reporting', 
        savingsVsSubscription: 'Pay per dossier compilation', 
        deliverablePreview: 'Clearance Dossier Ready', 
        currentTask: 'Compiling 19 deliverables into audit-ready executive dossier',
        taskInput: '19 verified deliverable specifications & proof records',
        taskOutput: 'Evaluation clearance dossier ready for review',
        workingAction: 'Assembling 19 specialist proofs into executive dossier...', 
        generatedValueUsd: 0.50, 
        nodeType: 'WORKER' as const, 
        waveGroup: 3, 
        queryPrompt: 'Compile 19 deliverables into audit-ready executive dossier',
        verifiedBadge: '✓ Dossier Compiled',
        samplePayload: 'Executive Supplier Clearance Dossier: "Apex Foundry Ltd" — evaluation recommendation prepared for contract review. All 19 sample checks passed.' 
      },
      { 
        id: 'sub_14', 
        role: '1-Page Board Memo', 
        shortName: 'Board Memo Writer', 
        targetUrl: '/api/v1/due-diligence/clearance-dossier', 
        providerLabel: 'C-Suite Synthesizer', 
        costPathUsd: 0.0010, 
        avatarColor: 'bg-zinc-700', 
        category: 'Executive Output', 
        team: 'Synthesis & Reporting', 
        savingsVsSubscription: 'Pay per decision memo', 
        deliverablePreview: '1-Page Board Decision Memo', 
        currentTask: 'Drafting 1-page C-Suite decision memo with terms & recommendation',
        taskInput: 'Clearance dossier, financial metrics & safety score',
        taskOutput: '1-Page Executive Memo: Recommendation = REVIEW',
        workingAction: 'Drafting 1-page C-Suite decision memo with terms & recommendation...', 
        generatedValueUsd: 0.45, 
        nodeType: 'WORKER' as const, 
        waveGroup: 3, 
        queryPrompt: 'Synthesize 1-page decision memo with recommendation & terms',
        verifiedBadge: '✓ 1-Page Memo Ready',
        samplePayload: 'Executive Decision Memo: Recommendation = REVIEW. The memo summarizes the supplied example inputs.' 
      },
      { 
        id: 'sub_15', 
        role: 'Trilingual Briefings', 
        shortName: 'Multilingual Briefs', 
        targetUrl: '/api/v1/due-diligence/clearance-dossier', 
        providerLabel: 'Localization', 
        costPathUsd: 0.0010, 
        avatarColor: 'bg-zinc-700', 
        category: 'Executive Output', 
        team: 'Synthesis & Reporting', 
        savingsVsSubscription: 'Multi-language localization', 
        deliverablePreview: 'English, Spanish & German Briefs', 
        currentTask: 'Translating executive briefing into German & Spanish',
        taskInput: 'Executive decision memo in English',
        taskOutput: 'Trilingual Briefs: English, German & Spanish executive summaries',
        workingAction: 'Translating executive briefing into German & Spanish...', 
        generatedValueUsd: 0.40, 
        nodeType: 'WORKER' as const, 
        waveGroup: 3, 
        queryPrompt: 'Translate executive briefing into German & Spanish',
        verifiedBadge: '✓ EN / DE / ES Briefs',
        samplePayload: 'Translated Summaries: German ("Lieferantenprüfung genehmigt"), Spanish ("Autorización aprobada").' 
      },
    ],
  },
  {
    id: 'swarm_arbitrage',
    title: 'Market Data Comparison',
    missionType: 'Premium Market Data Review',
    goal: 'Compare sample market snapshots, test a prediction model, and run risk checks in Python.',
    goalDesc: 'Lead AI coordinates example market inputs, a prediction model, and safe code execution within a fixed budget.',
    budgetLimit: '$0.0100 policy cap',
    budgetEst: '$0.0060',
    rules: 'Approved data examples · Max $0.0030 per request · Zero subscriptions',
    description: 'Lead AI compares sample market inputs, models the spread, and checks a proposed trade plan within a fixed budget. No trade is sent in this evaluation.',
    subcontractors: [
      { 
        id: 'lead_orchestrator', 
        role: 'Lead Market Comparison Director', 
        shortName: 'Lead Quant AI', 
        targetUrl: '/api/v1/lead-agent', 
        providerLabel: 'Trading Orchestrator', 
        costPathUsd: 0.0000, 
        avatarColor: 'bg-zinc-800', 
        category: 'Mission Lead', 
        team: 'Lead Orchestrator', 
        savingsVsSubscription: 'Zero recurring quant management fees', 
        deliverablePreview: 'Market Comparison & Risk Report', 
        currentTask: 'Coordinating example market inputs, prediction model & execution sandbox under $0.0100 cap',
        taskInput: 'Goal: Compare sample market snapshots and review risk',
        taskOutput: 'Market Comparison Report and Risk Notes',
        workingAction: 'Orchestrating example inputs and checking slippage tolerance...', 
        generatedValueUsd: 2.00, 
        nodeType: 'ORCHESTRATOR' as const, 
        waveGroup: 0, 
        queryPrompt: 'Coordinate market feeds, prediction model and safe execution sandbox',
        verifiedBadge: '✓ Mission Orchestrated',
        samplePayload: 'Market Comparison Plan: review the TEMPO/USD sample spread across two example venues. No trade submitted. Budget allocated: $0.0060.' 
      },
      { id: 'sub_a1', role: 'Market Data Reader', shortName: 'Orderbook', targetUrl: '/api/v1/data/stock-orderbook', providerLabel: 'Example L2 Market Feed', costPathUsd: 0.001, avatarColor: 'bg-zinc-700', category: 'Market Data', team: 'Market Analysis', savingsVsSubscription: 'Evaluation fixture — no live exchange claim', deliverablePreview: 'Sample Orderbook Depth Matrix', workingAction: 'Reviewing market snapshot...', generatedValueUsd: 0.80, nodeType: 'PROVIDER', waveGroup: 1 },
      { id: 'sub_a2', role: 'Market Prediction Bot', shortName: 'Market Prediction', targetUrl: '/api/v1/data/ai-market-analysis', providerLabel: 'Example Prediction Model', costPathUsd: 0.002, avatarColor: 'bg-zinc-700', category: 'AI Inferences', team: 'Market Analysis', savingsVsSubscription: 'Evaluation fixture — no live model claim', deliverablePreview: 'Market Momentum Score & Analysis', workingAction: 'Running example model...', generatedValueUsd: 2.50, nodeType: 'WORKER', waveGroup: 2 },
      { id: 'sub_a3', role: 'Safe Code Runner Bot', shortName: 'Code Runner', targetUrl: '/api/v1/data/python-sandbox', providerLabel: 'Python Execution Sandbox API', costPathUsd: 0.002, avatarColor: 'bg-zinc-700', category: 'Code Execution', team: 'Security & Code', savingsVsSubscription: 'Ephemeral sandbox — zero idle server cost', deliverablePreview: 'Verified Financial Risk Calculations', workingAction: 'Sandboxing verification script...', generatedValueUsd: 1.50, nodeType: 'WORKER', waveGroup: 3 },
      { id: 'sub_a4', role: 'Sanctions & Fraud Screener', shortName: 'Sanctions Check', targetUrl: '/api/v1/test-provider-data', providerLabel: 'Sanctions Screening API', costPathUsd: 0.001, avatarColor: 'bg-zinc-700', category: 'Compliance & Safety', team: 'Security & Code', savingsVsSubscription: 'Sub-cent check — zero compliance retainer', deliverablePreview: 'Official AML & Sanctions Clearance', workingAction: 'Checking sanctions watchlist...', generatedValueUsd: 1.20, nodeType: 'PROVIDER', waveGroup: 1 },
    ],
  },
];

export function MultiAgentSwarmView({ 
  onSwarmSettled,
  initialSubView = 'swarm',
  onSubViewChange
}: { 
  onSwarmSettled?: () => void;
  initialSubView?: 'swarm' | 'stream' | 'mcp' | 'reality';
  onSubViewChange?: (val: 'swarm' | 'stream' | 'mcp' | 'reality') => void;
}) {
  const [subView, setSubViewInternal] = useState<'swarm' | 'stream' | 'mcp' | 'reality'>(initialSubView);

  React.useEffect(() => {
    if (initialSubView) {
      setSubViewInternal(initialSubView);
    }
  }, [initialSubView]);

  const setSubView = (val: 'swarm' | 'stream' | 'mcp' | 'reality') => {
    setSubViewInternal(val);
    if (onSubViewChange) onSubViewChange(val);
  };
  const [selectedPreset, setSelectedPreset] = useState(PRESET_SWARMS[0]);
  const [customDirective, setCustomDirective] = useState<string>((PRESET_SWARMS[0] as any).goal || 'Investigate this supplier before we sign the contract.');
  const [selectedSubId, setSelectedSubId] = useState<string>(PRESET_SWARMS[0].subcontractors[0].id);
  const [settledWorkerIds, setSettledWorkerIds] = useState<Set<string>>(new Set());
  const [isExecuting, setIsExecuting] = useState(false);
  const [workerLiveStates, setWorkerLiveStates] = useState<Record<string, { status: 'STANDBY' | 'REQUESTING' | 'PAYING' | 'DONE'; displayNote: string }>>({});
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const [agentDialogues, setAgentDialogues] = useState<Array<{
    id: string;
    fromName: string;
    fromRole: string;
    toName: string;
    message: string;
    stepType: 'DIRECTIVE' | 'HTTP_402' | 'TEMPO_SETTLE' | 'DATA_PAYLOAD' | 'SYNTHESIS' | 'APPROVAL';
    timestamp: string;
    costUsd?: number;
    highlightBadge?: string;
    nodeId?: string;
  }>>([]);
  const [swarmViewMode, setSwarmViewMode] = useState<'saas' | 'pipeline' | 'topology' | 'grid'>('saas');
  const [lastBatchResult, setLastBatchResult] = useState<any>(null);
  const batchTxHash = lastBatchResult?.batchExecution?.txHash || '';
  const evaluationCopy = (value: string, confirmed = Boolean(batchTxHash)) => confirmed ? value : value
    .replace(/\bpaid\b/gi, 'planned')
    .replace(/\bdelivered\b/gi, 'prepared')
    .replace(/\bverified\b/gi, 'reported')
    .replace(/\bconfirmed\b/gi, 'reported')
    .replace(/settled on Tempo L1/gi, 'planned for live settlement')
    .replace(/settling at <15ms latency/gi, 'checked against the payment policy')
    .replace(/on Tempo L1/gi, 'after a live wallet is connected')
    .replace(/Tempo L1/gi, 'the live settlement network');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedDossier, setCopiedDossier] = useState(false);
  const [copiedMemo, setCopiedMemo] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [selectedTraceForInspector, setSelectedTraceForInspector] = useState<any>(null);

  const inspectWorkerCryptoProof = (worker: SubcontractorConfig) => {
    soundEngine.playClick();
    const workerAddr = getWorkerWalletAddress(worker.id);
    setSelectedTraceForInspector({
      id: `swarm_${worker.id}_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      agentName: worker.shortName || worker.role,
      serviceName: worker.providerLabel || worker.role,
      serviceUrl: worker.targetUrl || 'https://api.market-data.io',
      amountUsd: worker.costPathUsd,
      latencyMs: 0,
      // Worker-level proof is not returned by the batch endpoint yet.
      // Keep this inspector explicitly synthetic instead of fabricating a tx/proof.
      status: 'SIMULATED_PASS',
      blockNumber: 0,
      txHash: '',
      sessionKey: workerAddr,
      authAuthorizationHeader: '',
      domainHash: '',
      merkleRoot: '',
      merkleProof: [],
      nonce2D: '',
      tip20Memo: `SWARM_EXEC::${worker.id.toUpperCase()}`,
      deliverablePreview: worker.taskOutput || worker.deliverablePreview || worker.samplePayload || 'Verified deliverable delivered via HTTP 402 payment channel.',
    });
    setIsInspectorOpen(true);
  };

  const [activeStageNum, setActiveStageNum] = useState<number>(0);
  const [actualExecutionTimeSec, setActualExecutionTimeSec] = useState<number>(24.8);
  const batchStartTimeRef = useRef<number>(0);
  const [phaseExpanded, setPhaseExpanded] = useState<Record<number, boolean>>({ 1: false, 2: false, 3: false });
  const [activeConsoleTab, setActiveConsoleTab] = useState<'summary' | 'inspector' | 'receipt' | 'logs'>('summary');
  const [visibleStageFilter, setVisibleStageFilter] = useState<number | 'all'>('all');
  const [showOnChainLedger, setShowOnChainLedger] = useState(true);
  const [selectedLedgerFilter, setSelectedLedgerFilter] = useState<'all' | 'providers' | 'workers'>('all');
  const [selectedDeliverablePreview, setSelectedDeliverablePreview] = useState<{
    title: string;
    badge: string;
    content: string;
  } | null>(null);

  // Transaction Ledger & Dialogue auto-scroll (internal container scroll only, zero viewport jump)
  const ledgerContainerRef = useRef<HTMLDivElement>(null);
  const dialogueContainerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (ledgerContainerRef.current) {
      ledgerContainerRef.current.scrollTop = ledgerContainerRef.current.scrollHeight;
    }
  }, [executionLog]);

  React.useEffect(() => {
    if (dialogueContainerRef.current) {
      dialogueContainerRef.current.scrollTop = dialogueContainerRef.current.scrollHeight;
    }
  }, [agentDialogues]);

  // Reality Check (403 WAF Block vs 200 Synapse402 Pass) State
  const [realityTarget, setRealityTarget] = useState('/api/v1/data/stock-orderbook');
  const [realityPrice, setRealityPrice] = useState(0.001);
  const [isRealityTesting, setIsRealityTesting] = useState(false);
  const [scraperResult, setScraperResult] = useState<any>(null);
  const [synapseResult, setSynapseResult] = useState<any>(null);

  // SSE Streaming State
  const [streamTopic, setStreamTopic] = useState<'tempo_arbitrage' | 'sec_audit' | 'general_ai'>('tempo_arbitrage');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamTokens, setStreamTokens] = useState<string[]>([]);
  const [streamCost, setStreamCost] = useState(0);
  const [streamNonce, setStreamNonce] = useState('0x01:0x0001');
  const [streamStatus, setStreamStatus] = useState<string>('IDLE');
  const [streamTraceInfo, setStreamTraceInfo] = useState<any>(null);
  const streamLiveConfirmed = Boolean(
    streamTraceInfo?.paymentStatus === 'SETTLED' &&
    streamTraceInfo?.executionMode === 'LIVE_TESTNET' &&
    typeof streamTraceInfo?.txHash === 'string' &&
    streamTraceInfo.txHash.startsWith('0x')
  );
  const abortControllerRef = useRef<AbortController | null>(null);

  // MCP Interactive Tester State
  const [mcpMethod, setMcpMethod] = useState<'tools/list' | 'tools/call'>('tools/call');
  const [mcpToolName, setMcpToolName] = useState('synapse_call_paid_api');
  const [mcpTargetUrl, setMcpTargetUrl] = useState('/api/v1/data/stock-orderbook');
  const [mcpMaxCost, setMcpMaxCost] = useState('0.002');
  const [mcpResponse, setMcpResponse] = useState<any>(null);
  const [isMcpTesting, setIsMcpTesting] = useState(false);

  const copyToClipboard = (text: string, keyName: string) => {
    const doSet = () => {
      setCopiedKey(keyName);
      setTimeout(() => setCopiedKey(null), 2500);
    };

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text)
        .then(doSet)
        .catch(() => {
          try {
            const el = document.createElement('textarea');
            el.value = text;
            el.setAttribute('readonly', '');
            el.style.position = 'fixed';
            el.style.opacity = '0';
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            doSet();
          } catch (e) {
            console.warn('Clipboard fallback failed', e);
          }
        });
    } else {
      try {
        const el = document.createElement('textarea');
        el.value = text;
        el.setAttribute('readonly', '');
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        doSet();
      } catch (e) {
        console.warn('Clipboard fallback failed', e);
      }
    }
  };

  // Emergency Kill Switch State
  const [isEmergencyFrozen, setIsEmergencyFrozen] = useState(false);
  const isEmergencyFrozenRef = useRef(false);

  const handleEmergencyKillSwitch = () => {
    soundEngine.playDefenseIntercept();
    setIsEmergencyFrozen(true);
    isEmergencyFrozenRef.current = true;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsExecuting(false);
    setIsStreaming(false);
    setExecutionLog((prev) => [
      `[STOP] Emergency Stop engaged. All autonomous nodes halted immediately.`,
      `[SAFE] All payment steps frozen. Zero unverified funds transferred.`,
      ...prev
    ]);
  };

  const handleUnfreezeSwarm = () => {
    soundEngine.playClick();
    setIsEmergencyFrozen(false);
    isEmergencyFrozenRef.current = false;
    setExecutionLog((prev) => [
      `[${new Date().toLocaleTimeString()}] [SECURITY AUDIT] CFO re-authorized agent operations. Normal execution restored.`,
      ...prev
    ]);
  };

  // Swarm Batch Execution Handler
  const handleRunSwarmBatch = async () => {
    soundEngine.playClick();
    batchStartTimeRef.current = Date.now();
    setIsExecuting(true);
    setExecutionLog([]);
    setAgentDialogues([]);
    setLastBatchResult(null);
    setSettledWorkerIds(new Set());
    const initialWaitStates: Record<string, { status: 'STANDBY'; displayNote: string }> = {};
    selectedPreset.subcontractors.forEach((s) => {
      initialWaitStates[s.id] = {
        status: 'STANDBY',
        displayNote: NODE_CAUSAL_DEPENDENCY[s.id]?.waitingFor
          ? `Waiting for: ${NODE_CAUSAL_DEPENDENCY[s.id].waitingFor}`
          : 'Standby for task delegation'
      };
    });
    setWorkerLiveStates(initialWaitStates);

    const addLog = (msg: string) => {
      setExecutionLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    const addDialogue = (dialogue: {
      fromName: string;
      fromRole: string;
      toName: string;
      message: string;
      stepType: 'DIRECTIVE' | 'HTTP_402' | 'TEMPO_SETTLE' | 'DATA_PAYLOAD' | 'SYNTHESIS' | 'APPROVAL';
      costUsd?: number;
      highlightBadge?: string;
      nodeId?: string;
    }) => {
      setAgentDialogues((prev) => [
        ...prev,
        {
          ...dialogue,
          id: `dlg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          timestamp: new Date().toLocaleTimeString(),
        }
      ]);
    };

    try {
      addLog(`[ORCHESTRATOR] Received Mission: "${selectedPreset.title}"`);
      addLog(selectedPreset.id === 'swarm_arbitrage'
        ? `[BUDGET] Bounded Treasury Card pre-authorized. Allocating $${(selectedPreset.subcontractors.reduce((acc, s) => acc + s.costPathUsd, 0)).toFixed(4)} USD budget across market feeds, prediction model, and execution sandbox.`
        : `[BUDGET] Bounded Treasury Card pre-authorized. Allocating $${(selectedPreset.subcontractors.reduce((acc, s) => acc + s.costPathUsd, 0)).toFixed(4)} USD budget across 12 workers and 7 providers.`
      );

      addDialogue({
        fromName: selectedPreset.id === 'swarm_media_creative' ? 'Campaign Director' : selectedPreset.id === 'swarm_arbitrage' ? 'Trading Desk Lead' : 'Lead Orchestrator',
        fromRole: 'Unit 01 (Lead Agent)',
        toName: selectedPreset.id === 'swarm_media_creative' ? 'Creative Workforce (12 Workers · 7 Providers)' : selectedPreset.id === 'swarm_arbitrage' ? 'Quantitative Workforce (4 Units)' : 'Autonomous Workforce (12 Workers · 7 Providers)',
        message: selectedPreset.id === 'swarm_media_creative' 
          ? 'Campaign launched: Producing viral ad bundle for new product. $0.0245 allocated under the $0.0500 budget cap.'
          : selectedPreset.id === 'swarm_arbitrage'
          ? 'Market Comparison mission launched: Scanning cross-venue liquidity, predicting momentum & executing in sandbox. $0.0060 allocated under the $0.0100 budget cap.'
          : 'Mission launched: Investigating Apex Foundry Ltd before contract signing. $0.0270 allocated under the $0.0300 budget cap.',
        stepType: 'DIRECTIVE',
        highlightBadge: 'Mission Initialized',
        nodeId: 'lead_orchestrator'
      });

      const payableSubs = selectedPreset.subcontractors.filter(s => s.costPathUsd > 0);
      const resp = await fetch('/api/swarm/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskDescription: selectedPreset.title,
          subcontractors: payableSubs,
          evaluationOnly: true,
        }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || 'Swarm execution failed');
      }
      const confirmedWorkers = Array.isArray(data?.dispatchedWorkers) ? data.dispatchedWorkers : [];
      if (!data?.batchExecution || confirmedWorkers.length !== payableSubs.length) {
        throw new Error('Swarm response did not confirm every requested worker payment.');
      }
      const confirmedCost = Number(data.batchExecution.totalCostPathUsd);
      const requestedCost = payableSubs.reduce((sum, worker) => sum + worker.costPathUsd, 0);
      if (!Number.isFinite(confirmedCost) || Math.abs(confirmedCost - requestedCost) > 0.000001) {
        throw new Error('Swarm response cost does not match the requested worker budget.');
      }
      const liveSettlementConfirmed = data.batchExecution.escrowSettlement === 'ALL_DELIVERABLES_VERIFIED';

      const allIds = new Set<string>();

      if (selectedPreset.subcontractors.length === 20) {
        // Step 0: Lead Agent initializes and plans the mission
        setActiveStageNum(0);
        setPhaseExpanded({ 1: true, 2: false, 3: false });
        setWorkerLiveStates((prev) => ({
          ...prev,
          lead_orchestrator: { 
            status: 'REQUESTING', 
            displayNote: selectedPreset.id === 'swarm_media_creative'
              ? 'Planning multi-channel ad strategy & budget allocation...'
              : 'Directing workforce & enforcing budget policy...' 
          }
        }));
        setSelectedSubId('lead_orchestrator');
        addLog(`▶ [PLANNING] ${selectedPreset.id === 'swarm_media_creative' ? 'Campaign Director' : 'Lead Agent'} coordinating workforce for: "${selectedPreset.title}"`);
        await new Promise((resolve) => setTimeout(resolve, 1100));
        allIds.add('lead_orchestrator');
        setSettledWorkerIds(new Set(allIds));
        setWorkerLiveStates((prev) => ({
          ...prev,
          lead_orchestrator: { 
            status: 'DONE', 
            displayNote: selectedPreset.id === 'swarm_media_creative'
              ? '✓ Strategy Approved: 12 Workers & 7 Providers Active'
              : '✓ Operational Plan Dispatched: 12 Workers & 7 Providers Active' 
          }
        }));
        addLog(`  ✓ [Lead Director] Operational plan approved. Dispatched to Phase 1 Data & Media Feeds.`);
        
        addDialogue({
          fromName: selectedPreset.id === 'swarm_media_creative' ? 'Campaign Director' : 'Lead Orchestrator',
          fromRole: 'Unit 01 (Lead Agent)',
          toName: selectedPreset.id === 'swarm_media_creative' ? 'Phase 1: 7 Example Media Inputs' : 'Phase 1: 7 Example Data Inputs',
          message: selectedPreset.id === 'swarm_media_creative'
            ? 'Requesting example trend inputs, licensed media assets, voice, music and audience data from 7 providers ($0.0100 planned).'
            : 'Requesting example registry, filing, ownership, credit and sanctions inputs from 7 providers ($0.0120 planned).',
          stepType: 'DIRECTIVE',
          highlightBadge: 'Phase 01 Dispatched',
          nodeId: 'lead_orchestrator'
        });

        await new Promise((resolve) => setTimeout(resolve, 600));

        const waveStages = selectedPreset.id === 'swarm_media_creative' ? [
          {
            stageNum: 1,
            name: '01 — Prepare Example Trends, Ads & Media Inputs ($0.0100)',
            subConfigs: [
              { 
                id: 'sub_m1', startDelay: 0, workTime: 2200, 
                queryMsg: 'Reviewing example TikTok-style trend inputs and hook patterns...',
                responseMsg: '5 example sound patterns and hook angles prepared ($0.0015 planned).',
                badge: '5 Viral Hooks'
              },
              { 
                id: 'sub_m2', startDelay: 900, workTime: 2400,
                queryMsg: 'Reviewing example social signals and debate triggers...',
                responseMsg: 'Example conversation hooks and angles prepared ($0.0010 planned).',
                badge: '3 Viral Angles'
              },
              { 
                id: 'sub_m3', startDelay: 1800, workTime: 2400,
                queryMsg: 'Comparing an example competitor ad set...',
                responseMsg: 'Example ad set compared: short vertical video selected ($0.0015 planned).',
                badge: 'Competitor Ads Scanned'
              },
              { 
                id: 'sub_m4', startDelay: 2700, workTime: 2800,
                queryMsg: 'Generating product visual concept assets...',
                responseMsg: 'Clean product visual assets prepared ($0.0025 planned).',
                badge: 'Visuals Prepared'
              },
              { 
                id: 'sub_m5', startDelay: 3500, workTime: 2400,
                queryMsg: 'Synthesizing charismatic neural voiceover track...',
                responseMsg: 'Studio narration audio prepared ($0.0015 planned).',
                badge: 'Studio Voice Mastered'
              },
              { 
                id: 'sub_m6', startDelay: 4200, workTime: 2200,
                queryMsg: 'Licensing royalty-free trending electronic music stem...',
                responseMsg: 'Commercial-use music stem licensed and synced ($0.0010 planned).',
                badge: '128 BPM Beat Licensed'
              },
              { 
                id: 'sub_m7', startDelay: 5000, workTime: 2400,
                queryMsg: 'Fetching high-intent buyer demographic lookalikes...',
                responseMsg: 'Example audience segment mapped ($0.0010 planned).',
                badge: 'Target Audience Mapped'
              },
            ],
          },
          {
            stageNum: 2,
            name: '02 — Produce Visuals, Scriptwriting & Policy Audit',
            subConfigs: [
              { 
                id: 'sub_m8', startDelay: 0, workTime: 2400,
                queryMsg: 'Drafting 10 viral hooks & 3 AIDA video scripts...',
                responseMsg: '10 viral hooks & 3 full video scripts completed.',
                badge: '10 Viral Hooks'
              },
              { 
                id: 'sub_m9', startDelay: 1000, workTime: 2600,
                queryMsg: 'Composing 9:16 vertical video storyboards & carousel assets...',
                responseMsg: '9:16 storyboards & 5-slide carousel assets built.',
                badge: '9:16 Storyboards'
              },
              { 
                id: 'sub_m10', startDelay: 2000, workTime: 2400,
                queryMsg: 'Auditing copy & imagery against standard ad policy rules...',
                responseMsg: 'Policy check passed: 0 checklist violations (Simulated Review).',
                badge: 'Policy Passed'
              },
              { 
                id: 'sub_m11', startDelay: 3000, workTime: 2700,
                queryMsg: 'Syncing voiceover prompts, beats, kinetic captions & timing cues...',
                responseMsg: '15-second storyboard spec and audio cue sync completed.',
                badge: 'Storyboard Ready'
              },
              { 
                id: 'sub_m12', startDelay: 1500, workTime: 4200,
                queryMsg: 'Evaluating creative engagement and brand compliance...',
                responseMsg: 'Evaluation complete: Creative assets verified against brand standards.',
                badge: 'Review: Approved'
              },
            ],
          },
          {
            stageNum: 3,
            name: '03 — Format, Localize & Deliver Campaign Bundle',
            subConfigs: [
              { 
                id: 'sub_m13', startDelay: 0, workTime: 2200,
                queryMsg: 'Reformatting assets for TikTok, Reels, Shorts & X...',
                responseMsg: '4 native aspect ratios generated (9:16, 1:1, 16:9).',
                badge: '4 Formats Ready'
              },
              { 
                id: 'sub_m14', startDelay: 900, workTime: 2400,
                queryMsg: 'Translating scripts & subtitles to Spanish, German, French, Japanese...',
                responseMsg: 'Localized copy ready across 5 major global languages.',
                badge: '5 Languages'
              },
              { 
                id: 'sub_m15', startDelay: 1800, workTime: 2200,
                queryMsg: 'Generating 3 high-contrast click-tested cover thumbnails...',
                responseMsg: '3 high-contrast cover thumbnails generated.',
                badge: '3 Thumbnails'
              },
              { 
                id: 'sub_m16', startDelay: 2700, workTime: 2400,
                queryMsg: 'Bundling all media assets, subtitles & targeting into deployment package...',
                responseMsg: 'Complete campaign deployment package assembled.',
                badge: 'Package Ready'
              },
              { 
                id: 'sub_m17', startDelay: 3500, workTime: 2400,
                queryMsg: 'Drafting 1-page executive campaign memo with launch strategy...',
                responseMsg: '1-Page Campaign Launch Brief ready.',
                badge: '1-Page Memo'
              },
              { 
                id: 'sub_m18', startDelay: 4200, workTime: 2200,
                queryMsg: 'Auditing micro-transaction spend against $0.0500 budget cap...',
                responseMsg: 'Spend audit verified: $0.0245 total of $0.0500 budget cap.',
                badge: 'Spend: $0.0245'
              },
              { 
                id: 'sub_m19', startDelay: 2000, workTime: 4500,
                queryMsg: 'Recording campaign asset proof...',
                responseMsg: 'Campaign provenance record prepared for review.',
                badge: 'Proof record ready'
              },
            ],
          }
        ] : [
          {
            stageNum: 1,
            name: '01 — Prepare 7 Example Registry Inputs ($0.0120)',
            subConfigs: [
              { 
                id: 'sub_8', startDelay: 0, workTime: 2200, 
                 queryMsg: 'Reading the supplied corporate registry snapshot...',
                 responseMsg: 'Example registry result received ($0.0020 planned).',
                 badge: 'Registry example ready'
              },
              { 
                id: 'sub_9', startDelay: 900, workTime: 2400,
                 queryMsg: 'Reading the supplied annual filing snapshot...',
                 responseMsg: 'Example financial result received ($0.0020 planned).',
                 badge: 'Filing example ready'
              },
              { 
                id: 'sub_10', startDelay: 1800, workTime: 2400,
                 queryMsg: 'Summarizing the supplied ownership snapshot...',
                 responseMsg: 'Example ownership result prepared (68% founders, 32% funds) ($0.0015 planned).',
                 badge: 'Ownership example ready'
              },
              { 
                id: 'sub_11', startDelay: 2600, workTime: 2200,
                queryMsg: 'Checking commercial credit rating and payment track record...',
                responseMsg: 'Evaluation result: Grade A- risk score (88/100) ($0.0015 planned).',
                badge: 'Risk Score: 88/100'
              },
              { 
                id: 'sub_12', startDelay: 3500, workTime: 2400,
                 queryMsg: 'Reading the supplied legal record snapshot...',
                 responseMsg: 'Example legal result prepared for review ($0.0015 planned).',
                 badge: 'Legal example ready'
              },
              { 
                id: 'sub_18', startDelay: 4200, workTime: 2400,
                 queryMsg: 'Reading the supplied watchlist snapshot...',
                 responseMsg: 'Example watchlist result prepared for review ($0.0020 planned).',
                 badge: 'Watchlist example ready'
              },
              { 
                id: 'sub_19', startDelay: 5000, workTime: 2200,
                 queryMsg: 'Reviewing the supplied news examples...',
                 responseMsg: 'Example reputation result prepared for review ($0.0015 planned).',
                 badge: 'News example ready'
              },
            ],
          },
          {
            stageNum: 2,
            name: '02 — Run AI Risk & Solvency Audit ($0.0080)',
            subConfigs: [
              { 
                id: 'sub_5', startDelay: 0, workTime: 2400,
                queryMsg: 'Mapping parent company, subsidiaries & branch offices...',
                responseMsg: 'Structure verified: 1 parent + 2 branches (0 offshore risk).',
                badge: 'Parent + 2 Branches'
              },
              { 
                id: 'sub_6', startDelay: 1000, workTime: 2400,
                queryMsg: 'Calculating cash coverage ratio and debt leverage...',
                responseMsg: 'Financial health strong: 2.4x cash buffer, low debt (0.42).',
                badge: 'Cash: 2.4x · Low Debt'
              },
              { 
                id: 'sub_7', startDelay: 2000, workTime: 2400,
                queryMsg: 'Auditing export controls, classifications & tariffs...',
                 responseMsg: 'Example trade-rule result prepared for review.',
                 badge: 'Trade example ready'
              },
              { 
                id: 'sub_16', startDelay: 3000, workTime: 2500,
                queryMsg: 'Reviewing liability caps and contract clauses...',
                responseMsg: 'Contract terms safe: 2x liability cap confirmed, IP terms protected.',
                badge: '2x Liability Cap Safe'
              },
              { 
                id: 'sub_17', startDelay: 1500, workTime: 4200,
                queryMsg: 'Executing 10,000 Monte Carlo bankruptcy stress simulations...',
                responseMsg: 'Simulation passed: Solvency Score 4.12 (Safe Zone). 1-yr default risk: 0.04%.',
                badge: 'Solvency Safe (4.12)'
              },
            ],
          },
          {
            stageNum: 3,
            name: '03 — Synthesize Executive Decision Memo ($0.0070)',
            subConfigs: [
              { 
                id: 'sub_1', startDelay: 0, workTime: 2200,
                queryMsg: 'Cross-validating Tax ID & registration across all 7 feeds...',
                responseMsg: '7/7 registry match on Tax ID, address & registration across all sources.',
                badge: '7/7 Feeds Match'
              },
              { 
                id: 'sub_2', startDelay: 900, workTime: 2400,
                queryMsg: 'Checking statutory Corporate Law compliance...',
                responseMsg: 'Statutory compliance approved: Corporate disclosure met with citations.',
                badge: 'Corporate Law Met'
              },
              { 
                id: 'sub_3', startDelay: 1800, workTime: 2200,
                queryMsg: 'Weighting corporate, financial & legal findings into composite score...',
                responseMsg: 'Composite Safety Score calculated: 94 / 100 (Grade A / Low Risk).',
                badge: 'Safety Score: 94/100'
              },
              { 
                id: 'sub_4', startDelay: 2600, workTime: 2200,
                queryMsg: 'Signing cryptographic attestation digest...',
                responseMsg: 'Attestation record prepared with the scoped session key.',
                badge: 'Attestation ready'
              },
              { 
                id: 'sub_13', startDelay: 3500, workTime: 2400,
                queryMsg: 'Compiling 19 verified specialist proofs into Executive Dossier...',
                responseMsg: 'Evaluation dossier assembled for review.',
                badge: 'Dossier Compiled'
              },
              { 
                id: 'sub_14', startDelay: 4200, workTime: 2200,
                queryMsg: 'Synthesizing 1-page C-Suite decision memo with terms & recommendation...',
                 responseMsg: '1-Page review memo ready: Recommendation = REVIEW.',
                 badge: 'Review memo ready'
              },
              { 
                id: 'sub_15', startDelay: 2000, workTime: 4500,
                queryMsg: 'Translating executive briefing into German and Spanish...',
                responseMsg: 'Trilingual summaries ready: English, German & Spanish executive briefs.',
                badge: 'EN / DE / ES Briefs'
              },
            ],
          }
        ];

        for (const stage of waveStages) {
          if (isEmergencyFrozenRef.current) {
            addLog(`[HALTED] Emergency Kill Switch engaged. Zero unverified funds transferred.`);
            break;
          }
          setActiveStageNum(stage.stageNum);
          
          // Progressive disclosure: expand active phase, collapse completed phases
          if (stage.stageNum === 1) {
            setPhaseExpanded({ 1: true, 2: false, 3: false });
            setWorkerLiveStates((prev) => ({
              ...prev,
              lead_orchestrator: { 
                status: 'REQUESTING', 
                displayNote: selectedPreset.id === 'swarm_media_creative'
                  ? 'Directing 7 example media inputs and funding rules...'
                  : 'Directing 7 Example Media Inputs & funding micro-channels...' 
              }
            }));
          } else if (stage.stageNum === 2) {
            setPhaseExpanded({ 1: false, 2: true, 3: false });
            setWorkerLiveStates((prev) => ({
              ...prev,
              lead_orchestrator: { 
                status: 'REQUESTING', 
                displayNote: selectedPreset.id === 'swarm_media_creative'
                  ? 'Dispatching media assets to 5 Creative & Compliance Specialists...'
                  : 'Dispatching verified records to 5 Risk Specialists...' 
              }
            }));
          } else if (stage.stageNum === 3) {
            setPhaseExpanded({ 1: false, 2: false, 3: true });
            setWorkerLiveStates((prev) => ({
              ...prev,
              lead_orchestrator: { 
                status: 'REQUESTING', 
                displayNote: selectedPreset.id === 'swarm_media_creative'
                  ? 'Directing 7 Packaging Units to finalize media bundle & sign on Tempo...'
                  : 'Directing 7 Synthesis Units to compile Board Memo...' 
              }
            }));
          }

          addLog(`▶ [${stage.name}]`);

          // Run all nodes in the stage concurrently with staggered offsets
          await Promise.all(
            stage.subConfigs.map(async (cfg) => {
              if (isEmergencyFrozenRef.current) return;
              const sub = selectedPreset.subcontractors.find((s) => s.id === cfg.id);
              if (!sub) return;

              // Step 1: Initial stagger delay before requesting
              if (cfg.startDelay > 0) {
                await new Promise((resolve) => setTimeout(resolve, cfg.startDelay));
              }
              if (isEmergencyFrozenRef.current) return;

              // Emit request dialogue
              addDialogue({
                fromName: selectedPreset.id === 'swarm_media_creative' ? 'Campaign Director' : 'Lead Agent',
                fromRole: 'Unit 01 (Lead Agent)',
                toName: sub.role,
                message: cfg.queryMsg,
                stepType: 'DIRECTIVE',
                costUsd: sub.costPathUsd,
                nodeId: sub.id
              });

              // Step 2: Transition to REQUESTING...
              setWorkerLiveStates((prev) => ({
                ...prev,
                [cfg.id]: { status: 'REQUESTING', displayNote: sub.workingAction || 'Processing...' }
              }));
              setSelectedSubId(cfg.id);

              // Work duration phase
              await new Promise((resolve) => setTimeout(resolve, cfg.workTime));
              if (isEmergencyFrozenRef.current) return;

              // Step 3: Transition to PAYING $X.XXXX
              if (liveSettlementConfirmed) soundEngine.playSettlementChime();
              setWorkerLiveStates((prev) => ({
                ...prev,
                [cfg.id]: { status: 'PAYING', displayNote: `Checking $${sub.costPathUsd.toFixed(4)} USD payment...` }
              }));
              await new Promise((resolve) => setTimeout(resolve, 900));
              if (isEmergencyFrozenRef.current) return;

              // Step 4: Transition to DONE (✓ Delivered)
              allIds.add(cfg.id);
              setSettledWorkerIds(new Set(allIds));
              setWorkerLiveStates((prev) => ({
                ...prev,
                [cfg.id]: { status: 'DONE', displayNote: `${liveSettlementConfirmed ? '✓ Delivered' : '✓ Result prepared'}: ${SUBCONTRACTOR_RESULT_PILLS[cfg.id] || sub.deliverablePreview}` }
              }));
              const wAddr = getWorkerWalletAddress(sub.id);
              const shortAddr = wAddr ? `${wAddr.slice(0, 6)}...${wAddr.slice(-4)}` : 'evaluation session key';
              const nonceNum = (sub.id.charCodeAt(0) * 17) + 1042;
              addLog(`  ✓ [${sub.shortName || sub.role}] Planned $${sub.costPathUsd.toFixed(4)} USD ➔ ${shortAddr} · Request checked · ${liveSettlementConfirmed ? 'Delivered' : 'Result prepared'}: ${SUBCONTRACTOR_RESULT_PILLS[cfg.id] || sub.deliverablePreview}`);

              // Emit response dialogue
              addDialogue({
                fromName: sub.role,
                fromRole: sub.nodeType === 'PROVIDER' ? 'Data Agent' : 'Specialist Agent',
                toName: selectedPreset.id === 'swarm_media_creative' ? 'Campaign Director' : 'Lead Agent',
                message: evaluationCopy(cfg.responseMsg, liveSettlementConfirmed),
                stepType: sub.nodeType === 'PROVIDER' ? 'HTTP_402' : 'DATA_PAYLOAD',
                costUsd: sub.costPathUsd,
                highlightBadge: cfg.badge,
                nodeId: sub.id
              });
            })
          );

          if (isEmergencyFrozenRef.current) break;
          // Stage handover pause & message
          if (stage.stageNum === 1) {
            if (selectedPreset.id === 'swarm_media_creative') {
              addLog(`➔ [HANDOFF] 7 Example Media Inputs prepared trends, competitor references & visual assets ($0.0100 planned) ➔ Routed to 5 Creative Specialists.`);
              addDialogue({
                fromName: 'Campaign Director',
                fromRole: 'Unit 01 (Lead Agent)',
                toName: 'Phase 2: 5 Creative & Compliance Specialists',
            message: 'All 7 trend and visual inputs received ($0.0100 planned). Relaying to 5 Creative Specialists for copywriting, video sync, and policy clearance.',
                stepType: 'DATA_PAYLOAD',
                highlightBadge: '7 Feeds Relayed'
              });
            } else {
              addLog(`➔ [HANDOFF] 7 Data Agents prepared example registry, filing & sanctions inputs ($0.0120 planned) ➔ Routed to Phase 2 Risk Analysts.`);
              addDialogue({
                fromName: 'Lead Orchestrator',
                fromRole: 'Unit 01 (Lead Agent)',
                toName: 'Phase 2: 5 AI Risk Specialists',
            message: 'All 7 example registry inputs prepared ($0.0120 planned). Relaying to 5 AI Risk Specialists to analyze debt, compliance, and solvency.',
                stepType: 'DATA_PAYLOAD',
                highlightBadge: '7 Datasets Relayed'
              });
            }
            await new Promise((resolve) => setTimeout(resolve, 1800));
          } else if (stage.stageNum === 2) {
            if (selectedPreset.id === 'swarm_media_creative') {
              addLog(`➔ [HANDOFF] Copywriting, video sync & policy audit passed ($0.0075 spent) ➔ Relaying to 7 Multi-Platform Packaging Units.`);
              addDialogue({
                fromName: 'Campaign Director',
                fromRole: 'Unit 01 (Lead Agent)',
                toName: 'Phase 3: 7 Packaging & Localization Specialists',
                message: 'Creative assets cleared ($0.0075): 10 hooks ready, video synced, platform guidelines verified. Relaying to 7 Packaging Units for 5-language localization & blockchain sealing.',
                stepType: 'DATA_PAYLOAD',
                highlightBadge: 'Creative Cleared'
              });
            } else {
              addLog(`➔ [HANDOFF] Financial solvency and risk evaluation completed ($0.0080 planned) ➔ Relaying the result to Phase 3 Synthesis.`);
              addDialogue({
                fromName: 'Lead Orchestrator',
                fromRole: 'Unit 01 (Lead Agent)',
                toName: 'Phase 3: 7 Synthesis & Attestation Specialists',
                message: 'Risk & solvency modeling verified ($0.0080). Relaying to 7 Synthesis Specialists for Board Memo compilation and cryptographic sealing.',
                stepType: 'DATA_PAYLOAD',
                highlightBadge: 'Risk Models Cleared'
              });
            }
            await new Promise((resolve) => setTimeout(resolve, 1800));
          }
        }

        // Final Lead Agent Clearance & Synthesis
        if (!isEmergencyFrozenRef.current) {
          if (selectedPreset.id === 'swarm_media_creative') {
            setWorkerLiveStates((prev) => ({
              ...prev,
              lead_orchestrator: { status: 'DONE', displayNote: '✓ Campaign Ready: Viral Ad Package Complete' }
            }));
            addLog(`▶ [FINAL SYNTHESIS] Campaign Director compiled all 19 specialist deliverables.`);
            addLog(`[DECISION] Marketing Campaign READY TO LAUNCH. Visual assets, 10 hooks & 5 languages verified.`);
            addLog(`[PACKAGE] 15s storyboard spec, 5-language scripts, 3 high-contrast thumbnails, and 1-page campaign memo compiled.`);

            addDialogue({
              fromName: 'Campaign Director',
              fromRole: 'Unit 01 (Lead Agent)',
              toName: 'Human Reviewer / Marketing Team',
              message: 'Mission flow complete: multi-platform campaign plan is ready to review. Planned spend: $0.0245 under the $0.0500 limit.',
              stepType: 'APPROVAL',
              highlightBadge: 'CAMPAIGN READY ($0.0245)',
              costUsd: 0.0245,
              nodeId: 'lead_orchestrator'
            });
          } else {
            setWorkerLiveStates((prev) => ({
              ...prev,
              lead_orchestrator: { status: 'DONE', displayNote: '✓ Evaluation recommendation ready: Apex Foundry Ltd' }
            }));
            addLog(`▶ [FINAL SYNTHESIS] Lead Agent compiled all 19 specialist deliverables.`);
            addLog(`[DECISION] Evaluation recommendation ready for "Apex Foundry Ltd" contract review. Composite sample score: 94/100 (Low Risk).`);
            addLog(`[DOSSIER] Executive clearance report, C-Suite decision memo, and trilingual briefs compiled.`);

            addDialogue({
              fromName: 'Lead Orchestrator',
              fromRole: 'Unit 01 (Lead Agent)',
              toName: 'Executive Procurement Board',
              message: 'Mission flow complete: supplier clearance plan is ready to review. Planned spend: $0.0270 under the $0.0300 limit.',
              stepType: 'APPROVAL',
              highlightBadge: 'REVIEW RECOMMENDED (94/100)',
              costUsd: 0.0270,
              nodeId: 'lead_orchestrator'
            });
          }
        }
        setActiveStageNum(4);
        setPhaseExpanded({ 1: true, 2: true, 3: true });
      } else {
        // Fallback for smaller swarms (e.g. Market Trading & Risk Market Comparison)
        allIds.add('lead_orchestrator');
        setSettledWorkerIds(new Set(allIds));
        setWorkerLiveStates((prev) => ({
          ...prev,
          lead_orchestrator: { status: 'DONE', displayNote: liveSettlementConfirmed ? '✓ Market check settled on Tempo L1' : '✓ Market check completed in evaluation' }
        }));
        for (let i = 0; i < selectedPreset.subcontractors.length; i++) {
          if (isEmergencyFrozenRef.current) break;
          const sub = selectedPreset.subcontractors[i];
          if (sub.id === 'lead_orchestrator') continue;
          setActiveStageNum(sub.waveGroup || 1);
          
          addDialogue({
            fromName: 'Trading Desk Lead',
            fromRole: 'Lead Agent',
            toName: sub.shortName,
            message: `Executing task: ${sub.role} via ${sub.targetUrl}`,
            stepType: 'DIRECTIVE',
            costUsd: sub.costPathUsd,
            nodeId: sub.id
          });

          setWorkerLiveStates((prev) => ({ ...prev, [sub.id]: { status: 'REQUESTING', displayNote: 'Requesting...' } }));
          await new Promise((resolve) => setTimeout(resolve, 350));
          if (isEmergencyFrozenRef.current) break;
          if (liveSettlementConfirmed) soundEngine.playSettlementChime();
          setWorkerLiveStates((prev) => ({ ...prev, [sub.id]: { status: 'PAYING', displayNote: `Paying $${sub.costPathUsd.toFixed(4)}` } }));
          await new Promise((resolve) => setTimeout(resolve, 350));
          if (isEmergencyFrozenRef.current) break;
          allIds.add(sub.id);
          setSettledWorkerIds(new Set(allIds));
          setSelectedSubId(sub.id);
          setWorkerLiveStates((prev) => ({ ...prev, [sub.id]: { status: 'DONE', displayNote: liveSettlementConfirmed ? '✓ Delivered' : '✓ Result prepared' } }));
          addLog(`  ✓ [${sub.shortName}] ${liveSettlementConfirmed ? 'Delivered' : 'Result prepared'}: ${sub.deliverablePreview} • ${liveSettlementConfirmed ? 'Paid' : 'Planned'} $${sub.costPathUsd.toFixed(4)}`);

          addDialogue({
            fromName: sub.shortName,
            fromRole: sub.nodeType === 'PROVIDER' ? 'Data Provider' : 'Worker Bot',
            toName: 'Trading Desk Lead',
            message: `${liveSettlementConfirmed ? 'Delivered output' : 'Prepared result preview'}: ${sub.deliverablePreview}. Planned payment: $${sub.costPathUsd.toFixed(4)} USD.`,
            stepType: 'DATA_PAYLOAD',
            costUsd: sub.costPathUsd,
            highlightBadge: liveSettlementConfirmed ? '✓ Delivered' : '✓ Prepared',
            nodeId: sub.id
          });
        }
        addDialogue({
          fromName: 'Trading Desk Lead',
          fromRole: 'Unit 01 (Lead Agent)',
          toName: 'Trading Desk Operator',
          message: 'Market check complete: price differences and risk were reviewed. Planned spend: $0.0060 under the $0.0100 limit.',
          stepType: 'APPROVAL',
            highlightBadge: liveSettlementConfirmed ? 'MARKET REPORT READY ($0.0060)' : 'MARKET REVIEW ($0.0060)',
          costUsd: 0.0060,
          nodeId: 'lead_orchestrator'
        });
        setActiveStageNum(4);
        setPhaseExpanded({ 1: true, 2: true, 3: true });
      }

      const totalBatchCost = data.batchExecution?.totalCostPathUsd ?? 0.01;
      const elapsedMs = Date.now() - (batchStartTimeRef.current || Date.now());
      const finalSec = Math.max(1.0, Number((elapsedMs / 1000).toFixed(1)));
      setActualExecutionTimeSec(finalSec);

      addLog(`[COMPLETED] All ${selectedPreset.subcontractors.length} deliverables ${liveSettlementConfirmed ? 'verified and received' : 'prepared for review'} in ${finalSec}s.`);
      addLog(`[SETTLEMENT] ${liveSettlementConfirmed ? 'Confirmed' : 'Planned'} $${totalBatchCost.toFixed(4)} USD across ${selectedPreset.subcontractors.length} work steps${liveSettlementConfirmed ? ' on Tempo L1.' : ' in the evaluation flow.'}`);
      addLog(`[COMPLETE] Executed strictly within approved policy limits. ${selectedPreset.id === 'swarm_media_creative' ? 'Campaign expense receipt' : selectedPreset.id === 'swarm_arbitrage' ? 'Market comparison receipt' : 'Supplier audit receipt'} generated.`);
      setLastBatchResult(data);
      if (liveSettlementConfirmed) soundEngine.playSettlementChime();
      if (onSwarmSettled) onSwarmSettled();
    } catch (err: any) {
      addLog(`[ERR] Execution Stopped: ${err.message}`);
      soundEngine.playDefenseIntercept();
    } finally {
      setIsExecuting(false);
    }
  };

  // Reality Check (403 WAF Block vs 200 Synapse402 Pass) Execution Handler
  const handleRunRealityCheck = async () => {
    soundEngine.playClick();
    setIsRealityTesting(true);
    setScraperResult(null);
    setSynapseResult(null);

    const t0 = Date.now();

    // 1. Run Standard Scraper simulation (Hits protected route without payment)
    const runScraper = async () => {
      try {
        const res = await fetch(realityTarget, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 ScraperBot/1.0',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          }
        });
        const duration = Date.now() - t0 + 85;
        return {
          status: 403,
          durationMs: duration,
          blockedReason: 'Cloudflare WAF / Anti-Bot Security Intercept',
          rawSnippet: '<!DOCTYPE html><html><head><title>403 Forbidden - Access Denied</title></head><body><h1>Attention Required! | Cloudflare</h1><p>Checking your browser before accessing the website. Ray ID: 8f92c10842...</p></body></html>',
          dataReceivedBytes: 0,
          publisherRevenue: '$0.0000 (Wasted bandwidth & WAF bill)',
          botCost: '$0.00 direct + $49/mo wasted residential proxy cost',
          outcome: 'BLOCKED'
        };
      } catch (err: any) {
        return {
          status: 403,
          durationMs: Date.now() - t0 + 120,
          blockedReason: 'WAF Intercept: Connection Dropped / CAPTCHA Enforced',
          rawSnippet: 'HTTP 403 Forbidden: Autonomous bot fingerprint detected by edge security filter.',
          dataReceivedBytes: 0,
          publisherRevenue: '$0.0000',
          botCost: '0 bytes data',
          outcome: 'BLOCKED'
        };
      }
    };

    // 2. Run Synapse402 payment flow (live settlement only when a wallet is available)
    const runSynapse = async () => {
      const settleStart = Date.now();
      try {
        const res = await fetch('/api/mpp/settle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetUrl: realityTarget,
            pricePathUsd: realityPrice,
            category: 'Market Data & Scraping',
            allowDynamicWhitelist: true,
            evaluationOnly: true,
          }),
        });
        const settleDuration = Date.now() - settleStart;
        const data = await res.json();
        if (res.ok && ['SETTLED', 'SIMULATED_PASS'].includes(data?.trace?.status)) {
          if (data.trace.status === 'SETTLED') soundEngine.playSettlementChime();
          return {
            status: 200,
            durationMs: data.trace?.latencyMs || Math.max(14, settleDuration),
            txHash: data.trace?.txHash || '',
            executionMode: data.trace?.executionMode || 'RESILIENT_SANDBOX',
            costUsd: realityPrice,
            publisherEarned: data.trace.status === 'SETTLED'
              ? `$${(realityPrice * 0.999).toFixed(6)} USD (99.9% to seller after 0.1% fee)`
              : `$${(realityPrice * 0.999).toFixed(6)} USD planned (evaluation only)`,
            payload: data.trace.liveProxyPayload || null,
            dataReceivedBytes: data.trace.liveProxyPayload ? JSON.stringify(data.trace.liveProxyPayload).length : 0,
            outcome: 'UNLOCKED'
          };
        } else {
          return {
            status: res.status,
            durationMs: settleDuration,
            error: data.error || 'Settlement failed',
            outcome: 'FAILED'
          };
        }
      } catch (err: any) {
        return {
          status: 500,
          durationMs: Date.now() - settleStart,
          error: err.message,
          outcome: 'FAILED'
        };
      }
    };

    const [scraper, synapse] = await Promise.all([runScraper(), runSynapse()]);
    setScraperResult(scraper);
    setSynapseResult(synapse);
    setIsRealityTesting(false);
    if (onSwarmSettled) onSwarmSettled();
  };

  // SSE Stream Execution Handler
  const handleStartSseStream = async () => {
    setIsStreaming(true);
    setStreamTokens([]);
    setStreamCost(0);
    setStreamNonce('0x01:0x0001');
    setStreamStatus('STREAMING_ACTIVE');
    setStreamTraceInfo(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(`/api/stream/inference?topic=${streamTopic}&pricePerToken=0.00002`, {
        signal: controller.signal,
      });

      if (!response.body) {
        throw new Error('ReadableStream not supported by response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const rawJson = line.replace('data: ', '').trim();
            if (!rawJson) continue;
            try {
              const eventData = JSON.parse(rawJson);
              if (eventData.event === 'TOKEN_CHUNK') {
                setStreamTokens((prev) => [...prev, eventData.token]);
                setStreamCost(eventData.cumulativeCostPathUsd);
                setStreamNonce(eventData.nonce2D);
              } else if (eventData.event === 'STREAM_COMPLETED') {
                setStreamStatus('STREAM_COMPLETED_SUCCESS');
                setStreamTraceInfo(eventData);
                if (onSwarmSettled) onSwarmSettled();
              } else if (eventData.event === 'STREAM_ABORTED_BY_CLIENT') {
                setStreamStatus('STREAM_ABORTED_ZERO_LEAKAGE');
                setStreamTraceInfo(eventData);
                if (onSwarmSettled) onSwarmSettled();
              }
            } catch (e) {
              console.error('SSE JSON parse error', e);
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setStreamStatus('STREAM_ABORTED_ZERO_LEAKAGE');
        if (onSwarmSettled) onSwarmSettled();
      } else {
        setStreamStatus(`ERROR: ${err.message}`);
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleAbortStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // MCP Interactive Handler
  const handleTestMcp = async () => {
    setIsMcpTesting(true);
    setMcpResponse(null);

    try {
      const payload: any = {
        jsonrpc: '2.0',
        id: `req_${Date.now()}`,
        method: mcpMethod,
      };

      if (mcpMethod === 'tools/call') {
        payload.params = {
          name: mcpToolName,
          arguments:
            mcpToolName === 'synapse_call_paid_api'
              ? {
                  targetUrl: mcpTargetUrl,
                  maxBudgetPathUsd: Number(mcpMaxCost),
                  proofOfExecutionRequired: true,
                  // The in-app MCP playground is an evaluation surface. Keep it
                  // from spending a real relayer balance when the RPC is live.
                  evaluationOnly: true,
                }
              : mcpToolName === 'synapse_check_agent_budget'
              ? {}
              : { category: 'Market Data' },
        };
      }

      const resp = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      setMcpResponse(data);
      if (onSwarmSettled) onSwarmSettled();
    } catch (err: any) {
      setMcpResponse({ error: err.message });
    } finally {
      setIsMcpTesting(false);
    }
  };

  const mcpGatewayUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/mcp` : 'https://api.synapse402.network/api/mcp';

  const claudeDesktopConfigJson = JSON.stringify(
    {
      mcpServers: {
        synapse402_tempo: {
          command: 'npx',
          args: ['tsx', 'server/mcpServer.ts', '--gateway', mcpGatewayUrl],
          env: {
            TEMPO_SESSION_KEY: '${SYNAPSE_SESSION_KEY}',
            TEMPO_CHAIN_ID: '42431',
          },
        },
      },
    },
    null,
    2
  );

  const cursorMcpConfigJson = JSON.stringify(
    {
      name: 'Synapse402-Tempo-MPP',
      url: mcpGatewayUrl,
      transport: 'http-jsonrpc',
      description: 'Autonomous HTTP 402 paywall solver with budgeted swarm payments',
    },
    null,
    2
  );

  const plannedCostUsd = selectedPreset.subcontractors.reduce((total, item) => total + item.costPathUsd, 0);
  const budgetCapUsd = Number(String(selectedPreset.budgetLimit || '').match(/[0-9]+(?:\.[0-9]+)?/)?.[0] || 0.05);
  const remainingBudgetUsd = Math.max(0, budgetCapUsd - plannedCostUsd);
  const plannedBudgetPercent = budgetCapUsd > 0 ? Math.round((plannedCostUsd / budgetCapUsd) * 100) : 0;

  return (
    <div id="section-swarm-view" className="space-y-6">
      {/* Sub-Header Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[.08] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#f5f5f2] flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#d7ff4f]" />
              AI Workforce — Mission walkthrough
            </h2>
            <span className="px-2 py-0.5 rounded bg-[#d7ff4f]/15 text-[#d7ff4f] border border-[#d7ff4f]/30 text-[10px] font-mono font-bold">
              EVALUATION
            </span>
          </div>
          <p className="text-xs text-white/50 mt-0.5">
            One goal. One spending cap. Follow how mission units are coordinated under human guardrails.
          </p>
          <p className="text-[11px] text-amber-200/80 mt-1">
            Evaluation mode: job outputs are examples until a live wallet confirms a receipt.
          </p>
        </div>

        {/* View Switcher: 4 Clean Modes */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[.04] border border-white/10 text-xs font-mono flex-wrap">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setSubView('swarm');
            }}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              subView === 'swarm'
                ? 'bg-[#d7ff4f] text-[#08090c] font-bold shadow-[0_0_15px_rgba(215,255,79,0.25)]'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>AI Workforce</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setSubView('reality');
            }}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              subView === 'reality'
                ? 'bg-[#d7ff4f] text-[#08090c] font-bold shadow-[0_0_15px_rgba(215,255,79,0.25)]'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>What gets blocked</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setSubView('stream');
            }}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              subView === 'stream'
                ? 'bg-[#d7ff4f] text-[#08090c] font-bold shadow-[0_0_15px_rgba(215,255,79,0.25)]'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Payment stream</span>
            <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
              subView === 'stream' ? 'bg-black/25 text-[#08090c]' : 'bg-white/5 text-[#d7ff4f]'
            }`}>FLOW</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setSubView('mcp');
            }}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              subView === 'mcp'
                ? 'bg-[#d7ff4f] text-[#08090c] font-bold shadow-[0_0_15px_rgba(215,255,79,0.25)]'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Developer tools</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: AGENT SWARM (AGENT HIRES AGENT) */}
      {subView === 'swarm' && (
        <div className="space-y-6">
          {/* 1. HERO AREA: Mission Objective & Dispatch Panel */}
          <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-[#d7ff4f]/[0.08] via-white/[.035] to-transparent backdrop-blur-md border border-[#d7ff4f]/25 shadow-[0_22px_70px_rgba(0,0,0,0.26)] space-y-5 relative overflow-hidden">
            
            {/* Top Bar: Eyebrow + Preset Selector */}
            <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2 shrink-0">
                <span className="w-2 h-2 rounded-full bg-[#d7ff4f] shadow-[0_0_10px_rgba(215,255,79,0.4)]" aria-hidden="true" />
                <span className="text-[11px] font-mono font-bold tracking-widest text-[#d7ff4f] uppercase">
                  CHOOSE A JOB • SET A LIMIT • REVIEW THE RESULT
                </span>
              </div>

              {/* Mission Presets / Jobs Selector */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/10 flex-wrap">
                <span className="text-[10px] font-mono text-zinc-400 uppercase px-2 hidden sm:inline font-semibold shrink-0">Scenario:</span>
                {PRESET_SWARMS.map((preset) => {
                  const isSelected = selectedPreset.id === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      disabled={isExecuting}
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedPreset(preset as any);
                        setCustomDirective((preset as any).goal || preset.title);
                        setSelectedSubId(preset.subcontractors[0].id);
                        setSettledWorkerIds(new Set());
                        setWorkerLiveStates({});
                        setActiveStageNum(0);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-[#d7ff4f] text-[#08090c] font-bold shadow-[0_0_15px_rgba(215,255,79,0.3)]'
                          : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 shrink-0" />
                      <span className="whitespace-nowrap">{preset.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold whitespace-nowrap shrink-0 ${
                        isSelected ? 'bg-black/25 text-[#08090c]' : 'bg-white/10 text-zinc-300'
                      }`}>
                        {preset.budgetEst || '$0.0245'} · {preset.subcontractors.length} steps
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Mission Goal & Sub-info (8 cols) */}
              <div className="lg:col-span-8 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#d7ff4f]/15 text-[#d7ff4f] border border-[#d7ff4f]/30">
                      {selectedPreset.id === 'swarm_media_creative' ? 'SOCIAL AD CAMPAIGN' : selectedPreset.id === 'swarm_arbitrage' ? 'MARKET DEPTH & SPREAD ANALYSIS' : 'ENTERPRISE DUE DILIGENCE'}
                    </span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.08]">
                     Give an AI agent a job.<br />
                     <span className="text-[#d7ff4f]">Set the spending limit.</span>
                  </h1>
                  <div className="mt-3 max-w-4xl border-l-2 border-[#d7ff4f] bg-[#d7ff4f]/[0.05] rounded-r-xl px-4 py-3 text-base sm:text-lg font-semibold font-sans normal-case tracking-normal leading-snug text-white">
                   <strong className="text-[#d7ff4f]">Example job:</strong> choose a scenario to see one lead agent split the work, control spending, and return the finished result.
                  </div>
                  <div className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed mt-3 max-w-3xl space-y-2">
                    {selectedPreset.id === 'swarm_media_creative' ? (
                      <>
                        <p className="text-white font-medium text-sm sm:text-base leading-snug">
                           This example run uses a $0.05 budget cap so the payment flow is easy to inspect.
                        </p>
                        <p className="text-zinc-400 text-xs sm:text-[13px] leading-relaxed">
                           The plan estimates <strong className="text-[#d7ff4f] font-mono">$0.0245</strong>. In the connected product, the person sets the budget for the job.
                        </p>
                      </>
                    ) : selectedPreset.id === 'swarm_arbitrage' ? (
                      <>
                        <p className="text-white font-medium text-sm sm:text-base leading-snug">
                            One lead agent compares two example market snapshots and prepares a report.
                        </p>
                        <p className="text-zinc-400 text-xs sm:text-[13px] leading-relaxed">
                           This example is planned at <strong className="text-[#d7ff4f] font-mono">$0.0060</strong>; the person sets the limit in a real run.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-white font-medium text-sm sm:text-base leading-snug">
                           One lead agent combines supplied records and prepares a review memo.
                        </p>
                        <p className="text-zinc-400 text-xs sm:text-[13px] leading-relaxed">
                           This example stays under the <strong className="text-[#d7ff4f] font-mono">$0.0300</strong> cap; a real job uses the person’s chosen budget.
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-zinc-300 pt-1">
                  <div className="flex items-center gap-1.5">
                     <span className="text-zinc-500 uppercase text-[11px]">Example budget:</span>
                    <span className="font-bold text-[#d7ff4f]">
                      {selectedPreset.budgetLimit || '$0.0500 USD'}
                    </span>
                     <span className="text-[10.5px] text-zinc-400">(set by the person in a real run)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <span className="text-zinc-500 uppercase text-[11px]">Payment:</span>
                    <span className={`font-bold ${batchTxHash ? 'text-[#d7ff4f]' : 'text-zinc-300'}`}>
                       {batchTxHash ? 'payment confirmed' : 'evaluation only · no live payment'}
                    </span>
                  </div>
                </div>

                <div className="relative flex items-center pt-1">
                  <span className="absolute left-3.5 text-[#d7ff4f] text-[10.5px] font-mono uppercase font-bold tracking-wider">TASK:</span>
                  <input
                    type="text"
                    value={customDirective}
                    disabled={isExecuting}
                    onChange={(e) => setCustomDirective(e.target.value)}
                     placeholder="Describe the job the agent should complete..."
                    className="w-full pl-16 pr-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 focus:border-[#d7ff4f] focus:outline-none text-white text-xs font-sans transition"
                  />
                </div>
              </div>

              {/* Main Action Card & Quick Explainer (4 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-3 justify-center lg:pt-4">
                <button
                  id="btn-execute-swarm-batch"
                  onClick={handleRunSwarmBatch}
                  disabled={isExecuting || isEmergencyFrozen}
                  className="w-full px-6 py-4 rounded-2xl bg-gradient-to-b from-[#d7ff4f] to-[#b8eb1e] hover:from-[#e2ff6b] hover:to-[#d7ff4f] text-[#08090c] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all shadow-[0_4px_25px_rgba(215,255,79,0.3),inset_0_1px_0_rgba(255,255,255,0.4)] border border-[#d7ff4f] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
                >
                  {isExecuting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin text-[#08090c]" />
                         <span>Running job ({settledWorkerIds.size}/{selectedPreset.subcontractors.length})...</span>
                    </>
                  ) : settledWorkerIds.size === selectedPreset.subcontractors.length && settledWorkerIds.size > 0 ? (
                    <>
                      <RefreshCw className="w-5 h-5 text-[#08090c]" />
                       <span>Run again ↺</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current text-[#08090c]" />
                      <span>
                        {selectedPreset.id === 'swarm_media_creative'
                           ? 'Run campaign · $0.0245 →'
                          : selectedPreset.id === 'swarm_arbitrage'
                           ? 'Run market check · $0.0060 →'
                           : 'Run due diligence · $0.0270 →'}
                      </span>
                    </>
                  )}
                </button>

                {/* Dynamic On-Chain Execution Telemetry Card */}
                {isExecuting ? (
                  <div className="p-3.5 rounded-xl bg-white/[.03] backdrop-blur-md border border-[#d7ff4f]/40 space-y-2 text-left font-mono shadow-[0_0_20px_rgba(215,255,79,0.15)]">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#d7ff4f]">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d7ff4f] opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d7ff4f]" />
                        </span>
                        <span>Checking the payment plan</span>
                      </span>
                      <span className="text-[10px] text-zinc-400 font-sans">processing</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.08]">
                      <span className="text-zinc-400">Planned spend:</span>
                      <span className="text-white font-bold font-mono">
                        ${Array.from(settledWorkerIds).reduce<number>((acc, id) => acc + (selectedPreset.subcontractors.find(x => x.id === id)?.costPathUsd || 0), 0).toFixed(4)} USD
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10.5px] text-zinc-400">
                      <span>Confirmed Units:</span>
                      <span className="text-[#d7ff4f] font-bold">
                        {settledWorkerIds.size} / {selectedPreset.subcontractors.length} Steps checked
                      </span>
                    </div>
                  </div>
                ) : settledWorkerIds.size === selectedPreset.subcontractors.length && settledWorkerIds.size > 0 ? (
                  <div className="p-3.5 rounded-xl bg-white/[.03] backdrop-blur-md border border-[#d7ff4f]/40 space-y-2 text-left font-mono shadow-[0_0_20px_rgba(215,255,79,0.1)]">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#d7ff4f]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#d7ff4f]" />
                        <span>{batchTxHash ? 'Settled On-Chain (Tempo L1)' : 'Completed in evaluation'}</span>
                      </span>
                      <a
                        href={batchTxHash ? `https://explore.tempo.xyz/tx/${batchTxHash}` : undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-[#d7ff4f] hover:underline flex items-center gap-0.5"
                      >
                        <span>Explorer ↗</span>
                      </a>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.08]">
                      <span className="text-zinc-400">{batchTxHash ? 'Total transferred:' : 'Total planned:'}</span>
                      <span className="text-[#d7ff4f] font-bold font-mono">
                        ${selectedPreset.subcontractors.reduce((acc, s) => acc + s.costPathUsd, 0).toFixed(4)} USD
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedDeliverablePreview({
                          title: selectedPreset.id === 'swarm_media_creative' 
                            ? 'Campaign Launch Dossier & 5 Assets' 
                            : selectedPreset.id === 'swarm_arbitrage'
                            ? 'Market Comparison Report'
                            : 'Board Clearance Dossier & Audit Report',
                          badge: 'MISSION COMPLETE · READY TO DEPLOY',
                          content: selectedPreset.id === 'swarm_media_creative'
                            ? `EXECUTIVE BRIEF: MULTI-PLATFORM AD CAMPAIGN LAUNCH\nMission: Multi-Platform Organic & Paid Ad Launch Under $0.05 Budget\nStatus: REVIEW READY (ON-CHAIN TRACE DEPENDS ON LIVE WALLET)\nPlanned Cost: $0.0245 under the $0.0500 policy cap\n\nKey Deliverables:\n1. 15s Video Storyboard & Timing Spec.\n2. Marketing hooks and visual concepts.\n3. Multi-platform layout and language variants.\n\nSummary:\nThe evaluation flow coordinates the work and records the planned payment steps. A live wallet is required for a confirmed Tempo L1 receipt.`
                            : selectedPreset.id === 'swarm_arbitrage'
                            ? `MARKET RISK SUMMARY:\n\n• Planned data cost: $0.0060 USD\n• Example spread: 0.42% price difference across sample venues\n• Status: REVIEW READY${batchTxHash ? ' · ATOMIC SETTLEMENT CONFIRMED' : ' · EVALUATION FLOW'}\n• A live wallet is required for a confirmed Tempo L1 receipt.`
                            : `EXECUTIVE BOARD CLEARANCE DOSSIER:\n\nTarget Entity: Apex Global Logistics B.V.\nRecommendation: REVIEW RECOMMENDED\nRisk Rating: Grade A (evaluation result)\n\nAudit Trail:\n• 19 registry and intelligence steps planned\n• Planned spend: $0.0270 USD (under the $0.0300 budget cap)\n• Delivery proof is available in this evaluation; a live wallet is required for a Tempo receipt.`
                        });
                      }}
                      className="w-full mt-2 py-2 px-3 rounded-lg bg-[#d7ff4f]/20 hover:bg-[#d7ff4f]/30 border border-[#d7ff4f]/40 text-[#d7ff4f] font-mono text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm active:scale-95"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Open Finished Deliverables (5 Assets)</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-white/[.025] backdrop-blur-md border border-white/10 space-y-1 text-left font-mono">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#d7ff4f]">
                      <Zap className="w-3.5 h-3.5 text-[#d7ff4f]" />
                      <span>What happens</span>
                    </div>
                    <p className="text-[11px] text-zinc-300 font-sans leading-snug">
                       The lead agent plans approved steps, checks the limit, and returns the result.
                    </p>
                  </div>
                )}

                {isEmergencyFrozen && (
                  <button
                    onClick={handleUnfreezeSwarm}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#d7ff4f]/20 hover:bg-[#d7ff4f]/30 border border-[#d7ff4f]/40 text-[#d7ff4f] font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resume Operations</span>
                  </button>
                )}
              </div>
            </div>

            {/* 3-STEP EXECUTION MECHANICS (THE SIMPLE IDEA) DIRECTLY UNDER GOAL & DISPATCH */}
            <div className="pt-4 border-t border-white/[0.08] grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 01 */}
              <div className="p-3.5 rounded-2xl bg-white/[.025] backdrop-blur-md border border-white/10 flex items-start gap-3 hover:border-white/20 transition-all">
                <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-300 shrink-0 mt-0.5">
                  <span className="text-xs font-mono font-bold text-[#d7ff4f]">01</span>
                </div>
                <div>
                    <h4 className="text-xs font-bold text-white tracking-tight">1. Agent plans the steps</h4>
                  <p className="text-[11px] text-zinc-400 font-sans mt-0.5 leading-relaxed">
                     It chooses approved APIs, sites, or other agents for the job.
                  </p>
                </div>
              </div>

              {/* 02 */}
              <div className="p-3.5 rounded-2xl bg-white/[.025] backdrop-blur-md border border-white/10 flex items-start gap-3 hover:border-[#d7ff4f]/30 transition-all">
                <div className="w-7 h-7 rounded-lg bg-[#d7ff4f]/10 border border-[#d7ff4f]/30 flex items-center justify-center text-[#d7ff4f] shrink-0 mt-0.5">
                  <span className="text-xs font-mono font-bold text-[#d7ff4f]">02</span>
                </div>
                <div>
                    <h4 className="text-xs font-bold text-white tracking-tight">2. Rules check the spend</h4>
                  <p className="text-[11px] text-zinc-400 font-sans mt-0.5 leading-relaxed">
                     Every step must fit the limit and approved provider list.
                  </p>
                </div>
              </div>

              {/* 03 */}
              <div className="p-3.5 rounded-2xl bg-white/[.025] backdrop-blur-md border border-white/10 flex items-start gap-3 hover:border-[#d7ff4f]/30 transition-all">
                <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-300 shrink-0 mt-0.5">
                  <span className="text-xs font-mono font-bold text-[#d7ff4f]">03</span>
                </div>
                <div>
                    <h4 className="text-xs font-bold text-white tracking-tight">3. You review the result</h4>
                  <p className="text-[11px] text-zinc-400 font-sans mt-0.5 leading-relaxed">
                     The finished package comes back to you; a wallet is needed for a live receipt.
                  </p>
                </div>
              </div>
            </div>

            {/* DELIVERABLES PREVIEW BAR */}
            <div className="deliverables-preview-bar pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#d7ff4f]">Finished Deliverables:</span>
              </div>
              <div className="deliverables-strip flex flex-wrap items-center gap-2 text-[11px] text-zinc-300">
                {selectedPreset.id === 'swarm_media_creative' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedDeliverablePreview({
                          title: '15s Video Storyboard & Script Specification',
                          badge: 'DELIVERABLE 01 · PRODUCTION BLUEPRINT',
                          content: `15-SECOND VIDEO TIMELINE & BLUEPRINT SPEC:\n[00:00 - 00:03] HOOK: Visual problem cut showing monthly SaaS burn vs pay-per-request access.\n[00:03 - 00:08] CORE: Synapse402 Session Key enforcing a hard $0.05 budget.\n[00:08 - 00:12] PROOF: 19 payment steps checked before the final package is returned.\n[00:12 - 00:15] CTA: "Give your AI a budget. Let it finish the job."\n\nSpecs:\n• Target Aspect Ratio: 9:16 Vertical (Reels / TikTok / Shorts)\n• Audio Stem: 128 BPM electronic stem + transcript cues\n• Color Grading: Rec.709 Master Guidelines\n\n* Realistic Note: Dedicated neural video rendering requires external GPU pipelines ($0.50–$2.00). Synapse402 generates the validated script, scene graph, and parameters under the $0.05 budget.`
                        });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 hover:border-[#d7ff4f]/50 hover:bg-white/[0.08] flex items-center gap-1.5 transition cursor-pointer text-left"
                    >
                      <Film className="w-3.5 h-3.5 text-[#d7ff4f]" />
                      <span className="font-semibold text-white">15s Storyboard</span>
                      <span className="text-zinc-500">(9:16 Spec)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedDeliverablePreview({
                          title: '10 Ad Copy Hooks (AIDA Framework)',
                          badge: 'DELIVERABLE 02 · HIGH CONVERSION HOOKS',
                          content: `10 AD COPY HOOKS FOR HIGH-ENGAGEMENT SOCIAL CHANNELS:\n\n1. "Stop paying $600/month in SaaS subscriptions for tools your team touches once a week."\n2. "What if your AI bot had its own bank card with a strict $0.05 limit?"\n3. "Coordinate a full competitive audit across 7 registries under a $0.05 cap."\n4. "Why SaaS companies hate pay-per-request: they can't charge you for idle seats."\n5. "Autonomous AI is here, but CFOs are terrified of infinite loop billing. Here is the fix."\n6. "1 lead agent, 12 workers, 7 data feeds — one controlled work package."\n7. "Don't give AI an unlimited credit card. Give it a cryptographic session key."\n8. "Every API call signed. Every cent accounted for. Zero overdraft possible."\n9. "The end of monthly subscription bloat: Pay 0.1¢ per request or pay nothing."\n10. "Instant micro-payments on Tempo L1 when a live wallet is connected."`
                        });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 hover:border-[#d7ff4f]/50 hover:bg-white/[0.08] flex items-center gap-1.5 transition cursor-pointer text-left"
                    >
                      <PenTool className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-semibold text-white">10 Ad Hooks</span>
                      <span className="text-zinc-500">(AIDA)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedDeliverablePreview({
                          title: 'Visual Assets & Platform Cover Templates',
                          badge: 'DELIVERABLE 03 · CREATIVE ASSETS',
                          content: `ASSET MANIFEST & TEMPLATES:\n\n• Hero Asset 01: Minimalist Dark Carbon Studio Layout with Neon Electric Lime Accent.\n• Storyboard Frame 02: 9:16 Vertical Carousel Composition (Alpha cutout mask).\n• YouTube / LinkedIn Cover: 1200x628 High-CTR Minimalist Headline Banner.\n• Meta Ad Storyboard: 1:1 Square Multi-Card Carousel Specification.\n• Color Tokens: DCI-P3 Mastered · Lossless WebP + Alpha.`
                        });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 hover:border-[#d7ff4f]/50 hover:bg-white/[0.08] flex items-center gap-1.5 transition cursor-pointer text-left"
                    >
                      <Image className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-semibold text-white">Visual Concepts & 3 Covers</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedDeliverablePreview({
                          title: 'Campaign Localization Matrix (5 Languages)',
                          badge: 'DELIVERABLE 04 · MULTI-REGION MATRIX',
                          content: `LOCALIZED AD COPY (5 LANGUAGES):\n\n• EN (English): "Stop burning $600/mo on unused SaaS retainers. Pay 0.1¢ per request with Synapse402 on Tempo L1."\n• ES (Spanish): "Deja de quemar $600/mes en suscripciones inactivas. Paga 0.1¢ por solicitud en Tempo L1."\n• DE (German): "Verschwenden Sie keine 600 $/Monat mehr für ungenutzte Abos. Zahlen Sie 0,1¢ pro Anfrage auf Tempo L1."\n• FR (French): "Arrêtez de gaspiller 600 $/mois en abonnements inutilisés. Payez 0,1¢ par requête sur Tempo L1."\n• JA (Japanese): "使われていない月額サブスクに月600ドルを浪費するのはやめましょう。Tempo L1上でリクエストごとに0.1¢の支払いを。"`
                        });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 hover:border-[#d7ff4f]/50 hover:bg-white/[0.08] flex items-center gap-1.5 transition cursor-pointer text-left"
                    >
                      <Globe className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-semibold text-white">5 Languages</span>
                      <span className="text-zinc-500">(ES/DE/FR/JA)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedDeliverablePreview({
                          title: '1-Page Launch Memo & Board Briefing',
                          badge: 'DELIVERABLE 05 · EXECUTIVE MEMO',
                          content: `EXECUTIVE BRIEF: MULTI-PLATFORM AD CAMPAIGN LAUNCH\nMission: Multi-Platform Organic & Paid Ad Launch Under $0.05 Budget\nStatus: REVIEW READY (ON-CHAIN TRACE DEPENDS ON LIVE WALLET)\nPlanned Cost: $0.0245 under the $0.0500 policy cap\n\nKey Deliverables:\n1. 15s Video Storyboard & Neural Narration Prompts.\n2. Marketing hooks and visual concepts.\n3. Multi-platform layout and language variants.\n\nPractical note: the evaluation flow coordinates the work; a live wallet is required for a confirmed Tempo L1 receipt.`
                        });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#d7ff4f]/10 border border-[#d7ff4f]/30 hover:bg-[#d7ff4f]/20 hover:border-[#d7ff4f]/60 flex items-center gap-1.5 text-[#d7ff4f] transition cursor-pointer text-left"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#d7ff4f]" />
                      <span className="font-bold">1-Page Launch Memo</span>
                    </button>
                  </>
                ) : selectedPreset.id === 'swarm_arbitrage' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedDeliverablePreview({
                          title: 'Sample Orderbook Depth Matrix',
                          badge: 'DELIVERABLE 01 · EVALUATION INPUT',
                          content: `SAMPLE L2 ORDERBOOK DEPTH MATRIX (CROSS-EXCHANGE):\n\n• Venue A (Uniswap v3 TEMPO/USD pool): Example depth $420,000 within 0.15% band.\n• Venue B (Curve TEMPO/USD pool): Example depth $380,000 within 0.15% band.\n• Example spread: +0.48% across sample pools.\n• Planned evaluation cost: $0.0010 (requires a live wallet for settlement).\n• This screen demonstrates the report format; it is not a live trading signal.`
                        });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 hover:border-[#d7ff4f]/50 hover:bg-white/[0.08] flex items-center gap-1.5 transition cursor-pointer text-left"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-[#d7ff4f]" />
                      <span className="font-semibold text-white">Orderbook Depth</span>
                      <span className="text-zinc-500">(L2 Matrix)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedDeliverablePreview({
                          title: 'Market Momentum & Risk Score',
                          badge: 'DELIVERABLE 02 · QUANT MODEL',
                          content: `MOMENTUM & SLIPPAGE TOLERANCE REPORT:\n\n• Momentum Vector: +0.84 (Strong Bullish Continuation)\n• Volatility Skew (15m): 1.12 standard deviations\n• Max Allowed Slippage: 0.15%\n• Execution Safe Window: 42ms\n• Planned data cost: $0.0020 USD (chain receipt requires a live wallet)`
                        });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 hover:border-[#d7ff4f]/50 hover:bg-white/[0.08] flex items-center gap-1.5 transition cursor-pointer text-left"
                    >
                      <Zap className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-semibold text-white">Momentum Score</span>
                      <span className="text-zinc-500">(+0.84)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedDeliverablePreview({
                          title: 'Python Financial Risk Sandbox',
                          badge: 'DELIVERABLE 03 · CLOUD SANDBOX',
                          content: `PYTHON CLOUD SANDBOX EXECUTION LOG:\n\n>>> import numpy as np\n>>> import scipy.stats as si\n>>> slippage_risk = calculate_slippage(depth_a, depth_b, size=3000)\n>>> print(slippage_risk)\n{'expected_slippage_bps': 4.2, 'max_drawdown_risk': 0.001, 'status': 'PASS_THRESHOLD'}\n\nExecution Time: 8.4ms · Cost: $0.0020 USD · Result: APPROVED`
                        });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 hover:border-[#d7ff4f]/50 hover:bg-white/[0.08] flex items-center gap-1.5 transition cursor-pointer text-left"
                    >
                      <Code2 className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-semibold text-white">Python Risk Sandbox</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedDeliverablePreview({
                          title: 'AML & Sanctions Screening Digest',
                          badge: 'DELIVERABLE 04 · COMPLIANCE CLEARANCE',
                          content: `SANCTIONS & FRAUD SCREENING DIGEST:\n\n• Target: configured counterparty records\n• OFAC / EU Sanctions Hits: 0 (evaluation result)\n• Mixer intersection check: no match in the sample response\n• Counterparty Risk Grade: evaluation result\n• Chain proof: available only after a live wallet confirms the run`
                        });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 hover:border-[#d7ff4f]/50 hover:bg-white/[0.08] flex items-center gap-1.5 transition cursor-pointer text-left"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-semibold text-white">AML / Sanctions Clean</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedDeliverablePreview({
                          title: 'Evaluation Payment Record',
                          badge: 'DELIVERABLE 05 · EVALUATION RECORD',
                          content: `MARKET COMPARISON PAYMENT RECORD:\n\n• Planned provider spend: $0.0060 USD\n• Status: ${batchTxHash ? 'SETTLEMENT CONFIRMED' : 'EVALUATION FLOW'}\n• No trade was submitted. A live wallet is required for a confirmed Tempo L1 receipt.`
                        });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#d7ff4f]/10 border border-[#d7ff4f]/30 hover:bg-[#d7ff4f]/20 hover:border-[#d7ff4f]/60 flex items-center gap-1.5 text-[#d7ff4f] transition cursor-pointer text-left"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#d7ff4f]" />
                      <span className="font-bold">Evaluation Record</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedDeliverablePreview({
                          title: 'Example Entity Record',
                          badge: 'DELIVERABLE 01 · EXAMPLE INPUT',
                          content: `ENTITY RECORD EXAMPLE:\n\n• Entity Name: Apex Global Logistics B.V.\n• Registry identifier: 5493001KJTIIGC8Y1R12\n• Source: supplied evaluation snapshot\n• Purpose: show what a paid provider can return\n• Live verification: not run in this demo`
                        });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 hover:border-[#d7ff4f]/50 hover:bg-white/[0.08] flex items-center gap-1.5 transition cursor-pointer text-left"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#d7ff4f]" />
                      <span className="font-semibold text-white">Example Entity Record</span>
                      <span className="text-zinc-500">(sample)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedDeliverablePreview({
                          title: 'Example Financial Snapshot',
                          badge: 'DELIVERABLE 02 · EXAMPLE INPUT',
                          content: `FINANCIAL SNAPSHOT EXAMPLE:\n\n• Cash & Equivalents: +$12,450,000 USD\n• Total Debt / Equity Ratio: 0.42\n• Working Capital: +$8.2M USD\n• Source: supplied evaluation snapshot\n• Live audit: not run in this demo`
                        });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 hover:border-[#d7ff4f]/50 hover:bg-white/[0.08] flex items-center gap-1.5 transition cursor-pointer text-left"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-semibold text-white">+$12.4M Cash</span>
                      <span className="text-zinc-500">(sample)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedDeliverablePreview({
                          title: 'Example Watchlist Snapshot',
                          badge: 'DELIVERABLE 03 · EXAMPLE INPUT',
                          content: `WATCHLIST EXAMPLE:\n\n• OFAC SDN List: sample result\n• EU Consolidated Financial Sanctions: sample result\n• UK HMT Sanctions: sample result\n• Source: supplied evaluation snapshot\n• Live screening: not run in this demo`
                        });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 hover:border-[#d7ff4f]/50 hover:bg-white/[0.08] flex items-center gap-1.5 transition cursor-pointer text-left"
                    >
                      <Lock className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-semibold text-white">Example Watchlist</span>
                      <span className="text-zinc-500">(sample)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedDeliverablePreview({
                          title: 'Solvency & Altman Z-Score Model',
                          badge: 'DELIVERABLE 04 · SOLVENCY SAFE ZONE',
                          content: `ALTMAN Z-SCORE FINANCIAL HEALTH:\n\n• Composite Score: 4.12 (Well above 2.99 Safe Zone boundary)\n• Liquidity Coverage: 2.8x standard benchmark\n• Default Probability (12 months): 0.04%\n• Rating Equivalent: Standard & Poor's A-`
                        });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 hover:border-[#d7ff4f]/50 hover:bg-white/[0.08] flex items-center gap-1.5 transition cursor-pointer text-left"
                    >
                      <Activity className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-semibold text-white">Solvency: 4.12</span>
                      <span className="text-zinc-500">(Safe Zone)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedDeliverablePreview({
                          title: '1-Page Board Clearance Dossier',
                          badge: 'DELIVERABLE 05 · BOARD CLEARANCE',
                          content: `EXECUTIVE BOARD CLEARANCE DOSSIER:\n\nTarget Entity: Apex Global Logistics B.V.\nRecommendation: REVIEW RECOMMENDED\nRisk Rating: Grade A (Low Risk / 94/100 Composite Score)\n\nAudit Trail:\n• 19 independent registry & intelligence calls planned\n• Planned spend: $0.0270 USD under the $0.0300 budget cap\n• Cryptographic proof is produced only for a confirmed live run`
                        });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#d7ff4f]/10 border border-[#d7ff4f]/30 hover:bg-[#d7ff4f]/20 hover:border-[#d7ff4f]/60 flex items-center gap-1.5 text-[#d7ff4f] transition cursor-pointer text-left"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#d7ff4f]" />
                      <span className="font-bold">1-Page Board Memo</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* FULL-WIDTH ASSEMBLY LINE */}
          <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 shadow-sm transition-all duration-500 ${
            isExecuting 
              ? 'bg-white/[.04] backdrop-blur-md border-[#d7ff4f]/40 ring-1 ring-[#d7ff4f]/20 shadow-[0_0_50px_rgba(215,255,79,0.06)]' 
              : 'bg-white/[.03] backdrop-blur-md border-white/[.08]'
          }`}>



            {/* ON-CHAIN SETTLEMENT STATUS BAR */}
            <div className="rounded-xl bg-white/[.025] border border-white/[.08] p-3 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-2 h-2 rounded-full bg-[#d7ff4f]" />
                  <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#d7ff4f]" />
                    <span>Tempo L1 Native Settlement</span>
                  </span>
                  <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 font-mono">
                    Chain ID 42431 · Type 0x76 MPP
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-[11px] text-zinc-300 font-mono">
                  <span className="text-zinc-400">Status:</span>
                        <span className="text-[#d7ff4f] font-bold">
                    {settledWorkerIds.size === selectedPreset.subcontractors.length && settledWorkerIds.size > 0
                      ? (batchTxHash ? `${selectedPreset.subcontractors.filter(s => s.costPathUsd > 0).length} payments confirmed on-chain` : `${selectedPreset.subcontractors.filter(s => s.costPathUsd > 0).length} payment steps completed in evaluation`)
                      : isExecuting
                      ? `${settledWorkerIds.size} payment steps completed...`
                      : 'Standby'}
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-white">
                    {batchTxHash ? 'Spent' : 'Planned'}: <strong className="text-[#d7ff4f] font-mono">${Array.from(settledWorkerIds).reduce<number>((acc, id) => acc + (selectedPreset.subcontractors.find(x => x.id === id)?.costPathUsd || 0), 0).toFixed(4)}</strong> USD
                  </span>
                </div>
              </div>
            </div>

            {/* 1. PROMINENT CURRENT ACTION HEARTBEAT BAR */}
            <div className={`p-4 rounded-xl border transition-all duration-300 ${
              isEmergencyFrozen
                ? 'bg-white/[0.04] border-white/30 text-zinc-300'
                : isExecuting
                ? 'bg-white/[0.06] border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.08)]'
                : settledWorkerIds.size === selectedPreset.subcontractors.length && settledWorkerIds.size > 0
                ? 'bg-white/[0.04] border-white/20'
                : 'bg-white/[0.02] border-white/10'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    isEmergencyFrozen
                      ? 'bg-zinc-500'
                      : isExecuting
                      ? 'bg-[#d7ff4f] animate-pulse shadow-[0_0_10px_#d7ff4f]'
                      : settledWorkerIds.size === selectedPreset.subcontractors.length && settledWorkerIds.size > 0
                      ? 'bg-[#d7ff4f]'
                      : 'bg-zinc-600'
                  }`} />
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">
                      {isEmergencyFrozen
                        ? 'EMERGENCY STOP'
                        : isExecuting
                        ? 'CURRENT STEP'
                        : settledWorkerIds.size === selectedPreset.subcontractors.length && settledWorkerIds.size > 0
                        ? 'MISSION COMPLETE'
                        : 'STATUS'}
                    </span>
                    <div className="text-xs sm:text-sm font-bold text-white font-mono mt-0.5 truncate">
                      {isEmergencyFrozen ? (
                        'Operations halted. All cards frozen.'
                      ) : isExecuting ? (
                        activeStageNum === 0 ? (
                          selectedPreset.id === 'swarm_media_creative'
                            ? 'Lead Agent: Planning viral ad campaign and delegating creative tasks...'
                            : selectedPreset.id === 'swarm_arbitrage'
                            ? 'Lead Agent: Planning market comparison and allocating feed queries...'
                            : 'Lead Agent: Planning supplier review and delegating tasks...'
                        ) : activeStageNum === 4 ? (
                          selectedPreset.id === 'swarm_media_creative'
                            ? 'Lead Agent: Packaging ad creatives, videos & 1-page launch memo...'
                            : selectedPreset.id === 'swarm_arbitrage'
                            ? 'Lead Agent: Verifying the evaluation record...'
                            : 'Lead Agent: Compiling deliverables into final clearance memo...'
                        ) : (() => {
                          const activeNode = selectedPreset.subcontractors.find(s => workerLiveStates[s.id]?.status === 'REQUESTING' || workerLiveStates[s.id]?.status === 'PAYING');
                          if (activeNode) {
                            const liveState = workerLiveStates[activeNode.id];
                            return (
                              <span>
                                <span className="text-white font-bold">
                                  [{activeNode.shortName || activeNode.role}]
                                </span>{' '}
                                &mdash; {liveState?.displayNote || activeNode.workingAction || 'Working...'}
                              </span>
                            );
                          }
                          return `Phase 0${activeStageNum}: Active across nodes...`;
                        })()
                      ) : settledWorkerIds.size === selectedPreset.subcontractors.length && settledWorkerIds.size > 0 ? (
                        selectedPreset.id === 'swarm_media_creative' ? (
                          <span>
                            Campaign <strong className="text-white">"Multi-Platform Ad Creative Package"</strong> {batchTxHash ? 'READY' : 'PLAN READY'} • {batchTxHash ? 'Spent' : 'Planned'}: <strong className="text-white">$0.0245 USD</strong> ({batchTxHash ? '19 payments settled on Tempo L1' : '19 payment steps completed in evaluation'})
                          </span>
                        ) : selectedPreset.id === 'swarm_arbitrage' ? (
                          <span>
                            Liquidity Audit <strong className="text-white">{batchTxHash ? 'COMPLETE' : 'REVIEW READY'}</strong> • {batchTxHash ? 'Verified spread' : 'Sample spread'}: <strong className="text-white">0.42% Discrepancy</strong> (Data Cost: $0.0060 USD)
                          </span>
                        ) : (
                          <span>
                            Supplier <strong className="text-white">"Apex Foundry Ltd"</strong> REVIEW READY • Sample score: <strong className="text-white">Grade A (Low Risk)</strong>
                          </span>
                        )
                      ) : (
                        `${selectedPreset.subcontractors.length} Mission Units ready (${selectedPreset.description || '1 Lead · 12 Workers · 7 Providers'}) under ${selectedPreset.budgetLimit || '$0.050 USD'} budget.`
                      )}
                    </div>
                  </div>
                </div>

                {/* Spent & Budget Indicator */}
                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 text-xs font-mono">
                  <span className="px-3 py-1 rounded-lg bg-black/40 border border-white/10 text-zinc-300">
                    {batchTxHash ? 'Spent' : 'Planned'}: <strong className="text-[#d7ff4f]">${Array.from(settledWorkerIds).reduce<number>((acc, id) => acc + (selectedPreset.subcontractors.find(x => x.id === id)?.costPathUsd || 0), 0).toFixed(4)}</strong> / {selectedPreset.id === 'swarm_media_creative' ? '$0.050 USD' : selectedPreset.id === 'swarm_arbitrage' ? '$0.010 USD' : '$0.030 USD'}
                  </span>
                </div>
              </div>
            </div>

            {/* VIEW MODE SWITCHER & CONTROLS */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-1 pb-1 text-xs font-mono text-zinc-400 border-b border-white/[0.06] pb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10.5px] uppercase text-zinc-400 font-semibold tracking-wider flex items-center gap-1.5">
                  <Network className="w-3.5 h-3.5 text-[#d7ff4f]" />
                  Workforce View Mode:
                </span>
                <div className="flex items-center p-0.5 rounded-lg bg-black/50 border border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setSwarmViewMode('saas');
                    }}
                    className={`px-3 py-1 rounded-md text-[11px] font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                      swarmViewMode === 'saas'
                        ? 'bg-[#d7ff4f] text-[#08090c] font-bold shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>3-Phase Tree</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setSwarmViewMode('pipeline');
                    }}
                    className={`px-3 py-1 rounded-md text-[11px] font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                      swarmViewMode === 'pipeline'
                        ? 'bg-[#d7ff4f] text-[#08090c] font-bold shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Causal Pipeline</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setSwarmViewMode('grid');
                    }}
                    className={`px-3 py-1 rounded-md text-[11px] font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                      swarmViewMode === 'grid'
                        ? 'bg-[#d7ff4f] text-[#08090c] font-bold shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Detailed Unit Cards</span>
                  </button>
                </div>
              </div>

              {selectedPreset.subcontractors.length === 20 && swarmViewMode === 'grid' && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setPhaseExpanded({ 1: true, 2: true, 3: true });
                    }}
                    className="px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-[10.5px] text-zinc-300 transition cursor-pointer border border-white/10"
                  >
                    Expand All (20 Cards)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setPhaseExpanded({ 1: false, 2: false, 3: false });
                    }}
                    className="px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-[10.5px] text-zinc-300 transition cursor-pointer border border-white/10"
                  >
                    Collapse Summary
                  </button>
                </div>
              )}
            </div>

            {/* 3-PHASE WORKFORCE HIERARCHY */}
            {(() => {
              const is20BotSwarm = selectedPreset.subcontractors.length === 20;

              if (is20BotSwarm) {
                const leadUnit = selectedPreset.subcontractors.find(s => s.id === 'lead_orchestrator') || selectedPreset.subcontractors[0];
                const isLeadSettled = settledWorkerIds.has('lead_orchestrator');
                const isLeadActive = isExecuting && (activeStageNum === 0 || activeStageNum === 4);

                const STAGE_CONFIGS = selectedPreset.id === 'swarm_media_creative' ? [
                  {
                    stageNum: 1,
                    title: '01 — GATHER TRENDS & MEDIA FEEDS',
                    subtitle: '7 example provider steps ($0.0100) · Uses sample trend, visual and audio inputs',
                    flowText: '7 provider steps prepared ($0.0100) ➔ Relayed to 5 Creative Specialists',
                    summaryText: 'Sample trend inputs reviewed · Ad angles drafted · Visual assets prepared · Voice and music examples aligned · Audience notes mapped',
                  },
                  {
                    stageNum: 2,
                    title: '02 — PRODUCE & AUDIT ADS',
                    subtitle: '5 Specialist Creative & Compliance Workers ($0.0075) · Writes copy, syncs video & verifies policy',
                    flowText: 'Ad copy & video layouts verified ($0.0075) ➔ Relayed to Packaging Units',
                    summaryText: '10 Viral Hooks Ready · 9:16 Storyboards Built · Policy Check Passed · 15s Storyboard Synced · Brand Review Approved',
                  },
                  {
                    stageNum: 3,
                    title: '03 — PACKAGE, LOCALIZE & SEAL',
                    subtitle: '7 Packaging, Localization & Tempo L1 Seal Units ($0.0070) · Adapts 4 platforms & translates 5 languages',
                    flowText: 'Campaign package assembled ($0.0070) ➔ Signed ad deployment package delivered',
                    summaryText: '4 Native Ratios Formatted · 5 Languages Localized · 3 Campaign Covers · Full Asset Bundle · 1-Page Memo Ready · $0.0245 Planned',
                  },
                ] : [
                  {
                    stageNum: 1,
                    title: '01 — FIND THE FACTS',
                    subtitle: '7 example registry steps ($0.0120) · Shows how filings, credit and sanctions checks fit together',
                    flowText: '7 registry steps prepared ($0.0120) ➔ Relayed to 5 AI Risk Specialists',
                    summaryText: 'Registry snapshot · Filing snapshot · Ownership summary · Credit example · Legal and watchlist examples',
                  },
                  {
                    stageNum: 2,
                    title: '02 — CHECK THE RISK',
                    subtitle: '5 Specialist AI Analysts ($0.0080) · Audits solvency, debt leverage & contract clauses',
                    flowText: 'Example risk calculations prepared ($0.0080) ➔ Relayed to decision specialists',
                    summaryText: 'Structure example · Cash and debt examples · Trade rules example · Contract terms example · Stress-test example',
                  },
                  {
                    stageNum: 3,
                    title: '03 — MAKE THE DECISION',
                    subtitle: '7 synthesis workers & optional payment record ($0.0070) · Compiles a 1-page review memo',
                    flowText: 'Review memo compiled ($0.0070) ➔ Evidence pack returned to the human',
                    summaryText: 'Inputs compared · Rules summarized · Review score calculated · Evidence pack · 1-page memo ready',
                  },
                ];

                const stageElements = STAGE_CONFIGS.map((stageCfg) => {
                  const stageSubs = selectedPreset.subcontractors.filter((s) => s.waveGroup === stageCfg.stageNum);
                  const isStageActive = isExecuting && activeStageNum === stageCfg.stageNum;
                  const allStageSettled = stageSubs.length > 0 && stageSubs.every((s) => settledWorkerIds.has(s.id));
                  const stageCostTotal = stageSubs.reduce((acc, s) => acc + s.costPathUsd, 0).toFixed(4);
                  const isPending = isExecuting && activeStageNum < stageCfg.stageNum;
                  const isExpanded = phaseExpanded[stageCfg.stageNum] ?? true;

                  if (!isExpanded) {
                    return (
                      <div
                        key={stageCfg.stageNum}
                        id={`stage-block-${stageCfg.stageNum}`}
                        className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          allStageSettled
                            ? 'bg-white/[0.03] border-white/15'
                            : isStageActive
                            ? 'bg-white/[.04] border-[#d7ff4f]/40 ring-1 ring-[#d7ff4f]/20'
                            : 'bg-white/[0.015] border-white/[0.06] opacity-70'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                            allStageSettled
                              ? 'bg-white/10 text-white'
                              : isStageActive
                              ? 'bg-[#d7ff4f]/20 text-[#d7ff4f] animate-pulse'
                              : 'bg-white/[0.05] text-zinc-500'
                          }`}>
                            {allStageSettled ? (
                              <CheckCircle2 className="w-4 h-4 text-[#d7ff4f]" />
                            ) : isStageActive ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Lock className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                                allStageSettled
                                  ? 'bg-white/10 text-white border border-white/20'
                                  : isStageActive
                                  ? 'bg-[#d7ff4f]/15 text-[#d7ff4f] border-[#d7ff4f]/30'
                                  : 'bg-white/[0.04] text-zinc-500 border border-white/[0.08]'
                              }`}>
                                PHASE 0{stageCfg.stageNum} {allStageSettled ? 'COMPLETE' : isStageActive ? 'RUNNING' : 'STANDBY'}
                              </span>
                              <span className="text-xs font-bold text-white font-mono truncate">
                                {stageCfg.title}
                              </span>
                              <span className="text-[11px] font-mono text-[#d7ff4f]">
                                (${stageCostTotal} USD • {stageSubs.length} Units)
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 font-sans truncate mt-0.5">
                              {allStageSettled ? stageCfg.summaryText : stageCfg.subtitle}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.playClick();
                            setPhaseExpanded(prev => ({ ...prev, [stageCfg.stageNum]: true }));
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 text-xs font-mono transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
                        >
                          <span>Show {stageSubs.length} Cards</span>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  }

                  return (
                    <React.Fragment key={stageCfg.stageNum}>
                      <div id={`stage-block-${stageCfg.stageNum}`} className={`rounded-2xl p-4 sm:p-5 border transition-all duration-500 ${
                        isStageActive 
                          ? 'bg-white/[.04] border-[#d7ff4f]/50 ring-2 ring-[#d7ff4f]/30 shadow-[0_0_35px_rgba(215,255,79,0.08)]' 
                          : allStageSettled 
                          ? 'bg-white/[0.02] border-white/15 opacity-95' 
                          : isPending
                          ? 'bg-white/[0.008] border-white/[0.04] opacity-35'
                          : 'bg-white/[0.015] border-white/[0.06]'
                      }`}>
                        {/* Stage Header */}
                        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 mb-3.5 border-b border-white/[0.06]">
                          <div className="flex items-center gap-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
                              isStageActive 
                                ? 'bg-[#d7ff4f]/15 text-[#d7ff4f] border-[#d7ff4f]/40 animate-pulse' 
                                : allStageSettled
                                ? 'bg-white/10 text-white border-white/20'
                                : 'bg-white/[0.05] text-zinc-400 border-white/10'
                            }`}>
                              PHASE 0{stageCfg.stageNum}
                            </span>
                            <div>
                              <span className="text-xs sm:text-sm font-bold text-white block tracking-tight">{stageCfg.title}</span>
                              <span className="text-[11px] text-zinc-400 font-sans hidden sm:block">{stageCfg.subtitle}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-[#d7ff4f] font-bold px-2.5 py-1 rounded bg-black/40 border border-white/[0.08]">
                              ${stageCostTotal} USD
                            </span>
                            {isStageActive && (
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#d7ff4f]/20 text-[#d7ff4f] border border-[#d7ff4f]/40 animate-pulse flex items-center gap-1">
                                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                <span>WORKING IN PARALLEL</span>
                              </span>
                            )}
                            {allStageSettled && (
                              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-white/10 text-white border border-white/20 flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5 text-[#d7ff4f]" />
                                <span>Phase Complete</span>
                              </span>
                            )}
                            {isPending && (
                              <span className="text-[10px] font-mono text-zinc-500 px-2 py-0.5 rounded bg-white/[0.02] border border-white/[0.05] flex items-center gap-1.5">
                                <Lock className="w-2.5 h-2.5 text-zinc-500" />
                                <span>Standby (Awaiting Phase 0{stageCfg.stageNum - 1})</span>
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                soundEngine.playClick();
                                setPhaseExpanded(prev => ({ ...prev, [stageCfg.stageNum]: false }));
                              }}
                              className="p-1 rounded-md hover:bg-white/10 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                              title="Collapse phase"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Stage Content: PROVIDER vs WORKER Card Styling */}
                        <div className={`grid gap-3.5 ${
                          stageSubs.length === 5 
                            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5' 
                            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                        }`}>
                          {stageSubs.map((sub) => {
                            const isSettled = settledWorkerIds.has(sub.id);
                            const isSelected = selectedSubId === sub.id;
                            const liveState = workerLiveStates[sub.id];
                            const isRequesting = liveState?.status === 'REQUESTING';
                            const isPaying = liveState?.status === 'PAYING';
                            const isBusy = isRequesting || isPaying;
                            const isProvider = sub.nodeType === 'PROVIDER';
                            const NodeIcon = getSubcontractorIcon(sub.id);

                            return (
                              <button
                                key={sub.id}
                                type="button"
                                onClick={() => {
                                  soundEngine.playClick();
                                  setSelectedSubId(sub.id);
                                  setActiveConsoleTab('inspector');
                                }}
                                className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer relative flex flex-col justify-between min-h-[118px] group ${
                                  isSelected
                                    ? 'bg-white/[0.09] border-[#d7ff4f]/50 ring-2 ring-[#d7ff4f]/50 shadow-xl'
                                    : isBusy
                                    ? 'bg-[#d7ff4f]/[0.08] border-[#d7ff4f] ring-2 ring-[#d7ff4f]/50 shadow-[0_0_20px_rgba(215,255,79,0.25)] scale-[1.02] z-10'
                                    : isSettled
                                    ? 'bg-white/[0.025] hover:bg-white/[0.05] border-white/15 hover:border-white/30'
                                    : isPending
                                    ? 'bg-white/[0.01] border-white/[0.04] opacity-45'
                                    : 'bg-white/[0.02] hover:bg-white/[0.04] border-white/[0.08] hover:border-white/20'
                                }`}
                              >
                                {/* Top Row: Role Type (PROVIDER / WORKER), Source & Price */}
                                <div className="flex items-center justify-between gap-1.5 w-full">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                                      isSettled
                                        ? 'bg-emerald-500/15 text-emerald-300'
                                        : isBusy
                                        ? 'bg-[#d7ff4f]/20 text-[#d7ff4f]'
                                        : isProvider
                                        ? 'bg-white/5 text-zinc-300'
                                        : 'bg-white/5 text-zinc-300'
                                    }`}>
                                      <NodeIcon className="w-3 h-3" />
                                    </div>
                                    <span className={`px-1.5 py-0.2 rounded text-[8.5px] font-mono font-bold tracking-wider uppercase truncate ${
                                      isProvider ? 'bg-white/5 text-zinc-300 border border-white/10' : 'bg-white/5 text-zinc-300 border border-white/10'
                                    }`}>
                                      {isProvider ? 'PROVIDER' : 'WORKER'}
                                    </span>
                                    <span className="text-[9px] text-zinc-400 truncate hidden sm:inline">
                                      • {sub.providerLabel}
                                    </span>
                                  </div>

                                  <span className={`text-[11px] font-mono font-bold shrink-0 ${
                                    isSettled ? 'text-zinc-200' : isProvider ? 'text-zinc-300' : 'text-zinc-300'
                                  }`}>
                                    ${sub.costPathUsd.toFixed(4)}
                                  </span>
                                </div>

                                {/* Middle: Human-Friendly Title & Dynamic Work Context */}
                                <div className="w-full my-2 space-y-0.5">
                                  <span className="text-xs font-bold text-white block truncate tracking-tight">
                                    {isProvider ? (sub.shortName || sub.role) : sub.role}
                                  </span>
                                  <span className={`text-[10.5px] block truncate font-sans ${
                                    isSettled ? 'text-emerald-300 font-medium' : isBusy ? 'text-[#d7ff4f]' : 'text-zinc-300'
                                  }`}>
                                    {isSettled
                                       ? (batchTxHash
                                         ? (sub.verifiedBadge || SUBCONTRACTOR_RESULT_PILLS[sub.id] || sub.deliverablePreview)
                                         : `Prepared: ${sub.deliverablePreview}`)
                                      : isBusy
                                      ? (liveState?.displayNote || sub.workingAction)
                                      : (NODE_HUMAN_JOBS[sub.id] || sub.deliverablePreview)}
                                  </span>
                                </div>

                                {/* Bottom Row: Dynamic Status / Verification Badge */}
                                <div className="w-full pt-2 border-t border-white/[0.06] text-[10px] font-mono flex items-center justify-between gap-1">
                                  {isRequesting ? (
                                    <span className="text-[#d7ff4f] flex items-center gap-1 font-semibold truncate animate-pulse">
                                      <RefreshCw className="w-2.5 h-2.5 animate-spin shrink-0" />
                                      <span className="truncate">{sub.workingAction || 'Checking...'}</span>
                                    </span>
                                  ) : isPaying ? (
                                    <span className="text-[#d7ff4f] flex items-center gap-1 font-bold truncate">
                                      <Zap className="w-2.5 h-2.5 shrink-0 animate-bounce" />
                                      <span className="truncate">Payment approved (${sub.costPathUsd.toFixed(4)})</span>
                                    </span>
                                  ) : isSettled ? (
                                    <div className="flex items-center justify-between w-full gap-1">
                                      <span className="text-zinc-300 flex items-center gap-1 shrink-0 font-semibold">
                                        <CheckCircle2 className="w-2.5 h-2.5 text-[#d7ff4f]" />
                                         <span>{batchTxHash ? 'Delivered' : 'Prepared'}</span>
                                      </span>
                                      <span className="px-1.5 py-0.2 rounded text-[8.5px] font-mono font-bold bg-[#d7ff4f]/15 text-[#d7ff4f] border border-[#d7ff4f]/30 truncate max-w-[140px]" title={sub.verifiedBadge || SUBCONTRACTOR_RESULT_PILLS[sub.id] || sub.deliverablePreview}>
                                        {batchTxHash
                                          ? (sub.verifiedBadge || SUBCONTRACTOR_RESULT_PILLS[sub.id] || sub.deliverablePreview)
                                          : `Sample output · ${sub.deliverablePreview}`}
                                      </span>
                                    </div>
                                  ) : isPending ? (
                                    <span className="text-zinc-500 truncate">Standby</span>
                                  ) : (
                                    <div className="flex items-center justify-between w-full text-zinc-400">
                                      <span className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                                        <span>Waiting</span>
                                      </span>
                                      <span className="text-[9.5px] font-mono text-zinc-500">
                                        {isProvider ? 'Data Feed' : 'Specialist'}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Handover Data Conduit between phases */}
                      {stageCfg.stageNum < 3 && (
                        <div className="flex items-center justify-center py-1 text-xs font-mono text-zinc-400">
                          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition-all ${
                            allStageSettled
                              ? 'bg-white/[0.04] border-white/15 text-zinc-300 shadow-sm'
                              : isStageActive
                              ? 'bg-[#d7ff4f]/10 border-[#d7ff4f]/30 text-[#d7ff4f] animate-pulse'
                              : 'bg-white/[0.02] border-white/[0.06] text-zinc-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${allStageSettled ? 'bg-[#d7ff4f]' : isStageActive ? 'bg-[#d7ff4f]' : 'bg-zinc-600'}`} />
                            <span className="text-[10.5px] font-medium">
                              {stageCfg.flowText}
                            </span>
                          </div>
                        </div>
                      )}

                    </React.Fragment>
                  );
                });

                return (
                  <>
                    {/* 0. PRIMARY ENTERPRISE SAAS WORKFLOW (CLEAN 3-STAGE B2B BUSINESS BOARD) */}
                    {swarmViewMode === 'saas' ? (
                      <div className="space-y-6">
                        <div className="rounded-2xl bg-white/[.025] border border-white/[0.09] p-5 sm:p-7 shadow-sm space-y-6">
                          
                          {/* 1. TOP SUMMARY PILL BAR */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono pb-3 border-b border-white/[0.06]">
                            <div className="flex items-center gap-4 flex-wrap">
                              <span className="flex items-center gap-1.5 text-zinc-300">
                                <span className="w-2 h-2 rounded-full bg-zinc-300" />
                                <span>1 Lead Agent</span>
                              </span>
                              <span className="flex items-center gap-1.5 text-zinc-300">
                                <span className="w-2 h-2 rounded-full bg-[#d7ff4f]" />
                                <span>12 Workers</span>
                              </span>
                              <span className="flex items-center gap-1.5 text-zinc-300">
                                <span className="w-2 h-2 rounded-full bg-zinc-500" />
                                <span>7 Providers</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-400 font-mono text-[11px]">
                                Budget Cap: <span className="text-[#d7ff4f] font-bold font-mono">{selectedPreset.budgetLimit || '$0.0500 USD'}</span>
                              </span>
                              <span className="text-zinc-600">·</span>
                              <span className="text-zinc-400 font-mono text-[11px]">
                                Max/Call: <span className="text-white font-bold font-mono">$0.0050</span>
                              </span>
                            </div>
                          </div>

                          {/* 2. LEAD AGENT CARD (TOP CENTER) */}
                          <div className="flex justify-center pt-1">
                            <div className={`w-full max-w-xl p-4 sm:p-5 rounded-2xl bg-white/[.04] border shadow-sm flex items-center justify-between gap-3 relative z-10 transition-all duration-300 ${
                              isExecuting
                                ? 'border-[#d7ff4f]/40 shadow-[0_0_30px_rgba(215,255,79,0.2)] ring-1 ring-[#d7ff4f]/30'
                                : 'border-white/[0.06] hover:border-white/12'
                            }`}>
                              <div className="flex items-center gap-3.5 min-w-0">
                                <div className="relative">
                                  {isExecuting && (
                                    <span className="absolute -inset-1 rounded-2xl bg-white/5 animate-ping opacity-60 pointer-events-none" />
                                  )}
                                  <div className={`p-2.5 rounded-xl border shrink-0 transition-all ${
                                    isExecuting
                                      ? 'bg-white/5 border-[#d7ff4f]/40 text-white shadow-[0_0_20px_rgba(215,255,79,0.2)]'
                                      : 'bg-white/5 border-white/10 text-zinc-300 shadow-[0_0_15px_rgba(215,255,79,0.2)]'
                                  }`}>
                                    <Bot className="w-6 h-6" />
                                  </div>
                                </div>
                                <div className="min-w-0">
                                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-300 font-bold flex items-center gap-1.5 mb-0.5">
                                    <span>LEAD AGENT</span>
                                    {isExecuting && (
                                      <span className="px-1.5 py-0.2 rounded text-[8.5px] font-mono bg-white/5 text-zinc-300 border border-white/10 font-extrabold animate-pulse">
                                        DISPATCHING
                                      </span>
                                    )}
                                  </span>
                                  <h3 className="text-base font-bold text-white truncate">
                                    {selectedPreset.id === 'swarm_media_creative' ? 'Campaign Director' : selectedPreset.id === 'swarm_arbitrage' ? 'Market Review Orchestrator' : 'Lead Mission Coordinator'}
                                  </h3>
                                  <p className="text-[11px] text-zinc-400 truncate">
                                    {selectedPreset.id === 'swarm_media_creative' 
                                      ? 'Coordinates the job, controls spending, and combines the results.'
                                      : selectedPreset.id === 'swarm_arbitrage'
                                      ? 'Coordinates 2 market feeds, 1 prediction model, and 1 execution sandbox under cap.'
                                      : 'Coordinates 12 workers and 7 feeds, controls spending, and delivers final dossier.'}
                                  </p>
                                </div>
                              </div>

                              <div className="shrink-0">
                                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 border transition-all ${
                                  isExecuting
                                    ? 'bg-white/5 text-white border-[#d7ff4f]/40 shadow-[0_0_15px_rgba(215,255,79,0.2)]'
                                    : settledWorkerIds.size > 0
                                    ? 'bg-[#d7ff4f]/15 text-[#d7ff4f] border border-[#d7ff4f]/30'
                                    : 'bg-white/5 text-white border-white/10'
                                }`}>
                                  {isExecuting ? (
                                    <>
                                      <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-300 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-300"></span>
                                      </span>
                                      <span>DELEGATING</span>
                                      <RefreshCw className="w-3 h-3 animate-spin text-zinc-300" />
                                    </>
                                  ) : settledWorkerIds.size > 0 ? (
                                    <>
                                      <Check className="w-3 h-3 text-[#d7ff4f]" />
                                      <span>COORDINATED</span>
                                    </>
                                  ) : (
                                    <>
                                      <span>READY</span>
                                      <ArrowRight className="w-3 h-3" />
                                    </>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* DISPATCH FLOW CONNECTOR TO 3 PIPELINE STAGES */}
                          <div className="flex items-center justify-center my-3 relative z-0">
                            <div className={`flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/[.035] border shadow-sm text-[11px] font-mono transition-all duration-300 ${
                              isExecuting ? 'border-[#d7ff4f]/40 ring-1 ring-[#d7ff4f]/20' : 'border-white/[0.06]'
                            }`}>
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${isExecuting ? 'bg-[#d7ff4f] animate-ping' : 'bg-[#d7ff4f]'}`} />
                                <span className="font-bold text-white tracking-wide text-[10.5px]">
                                  {isExecuting ? 'PARALLEL WORKFLOW ACTIVE' : '3-PHASE EXECUTION FLOW'}
                                </span>
                              </div>
                              <span className="text-zinc-600 hidden sm:inline">|</span>
                              <div className="hidden sm:flex items-center gap-2 text-zinc-400 text-[10px]">
                                <span className="text-zinc-300 font-medium">01 Data Feeds</span>
                                <ArrowRight className="w-3 h-3 text-zinc-600" />
                                <span className="text-zinc-300 font-medium">02 Production</span>
                                <ArrowRight className="w-3 h-3 text-zinc-600" />
                                <span className="text-[#d7ff4f] font-medium">03 Packaging</span>
                              </div>
                              <ArrowDown className={`w-3.5 h-3.5 text-[#d7ff4f] ${isExecuting ? 'animate-bounce' : 'opacity-70'}`} />
                            </div>
                          </div>

                          {/* 3. THE 3 PHASE COLUMNS */}
                          {(() => {
                            const phase1Subs = selectedPreset.subcontractors.filter(s => s.waveGroup === 1);
                            const phase2Subs = selectedPreset.subcontractors.filter(s => s.waveGroup === 2);
                            const phase3Subs = selectedPreset.subcontractors.filter(s => s.waveGroup === 3);

                            const phase1Settled = phase1Subs.length > 0 && phase1Subs.every(s => settledWorkerIds.has(s.id));
                            const phase2Settled = phase2Subs.length > 0 && phase2Subs.every(s => settledWorkerIds.has(s.id));
                            const phase3Settled = phase3Subs.length > 0 && phase3Subs.every(s => settledWorkerIds.has(s.id));

                            return (
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                                
                                {/* COLUMN 1: PHASE 01 · EXTERNAL PROVIDERS */}
                                <div className={`rounded-2xl bg-white/[.025] border p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-sm transition-all duration-500 ${
                                  isExecuting && activeStageNum === 1
                                    ? 'border-[#d7ff4f]/50 shadow-[0_0_30px_rgba(215,255,79,0.15)] ring-1 ring-[#d7ff4f]/30 animate-active-provider'
                                    : 'border-white/[0.06] hover:border-white/10'
                                }`}>
                                  <div>
                                    <div className="border-b border-white/[0.06] pb-3 mb-3">
                                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#d7ff4f] uppercase tracking-wider mb-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#d7ff4f]" />
                                        <span>01 · GET THE RESOURCES</span>
                                      </div>
                                      <h4 className="text-sm font-bold text-white">
                                        {selectedPreset.id === 'swarm_media_creative' ? '7 Example Media Inputs' : selectedPreset.id === 'swarm_arbitrage' ? '2 Example Market Inputs' : '7 Example Registry Inputs'}
                                      </h4>
                                      <p className="text-[11px] text-zinc-400 mt-0.5">
                                        {selectedPreset.id === 'swarm_media_creative' ? '7 providers supply data and media services' : selectedPreset.id === 'swarm_arbitrage' ? '2 sample feeds provide market-shaped inputs for the evaluation' : '7 example registry inputs cover entity, legal, and financial checks'}
                                      </p>
                                    </div>

                                    <div className="space-y-2">
                                      {phase1Subs.map((sub, idx) => {
                                        const isSettled = settledWorkerIds.has(sub.id);
                                        const isBusy = workerLiveStates[sub.id]?.status === 'REQUESTING' || workerLiveStates[sub.id]?.status === 'PAYING';
                                        const SubIcon = getSubcontractorIcon(sub.id);
                                        const workerAddr = getWorkerWalletAddress(sub.id);
                                        return (
                                          <div
                                            key={sub.id}
                                            onClick={() => { soundEngine.playClick(); setSelectedSubId(sub.id); setActiveConsoleTab('inspector'); }}
                                            className={`p-2.5 rounded-xl border text-xs font-mono transition-all duration-200 cursor-pointer flex flex-col gap-1.5 ${
                                              isBusy
                                                ? 'bg-[#d7ff4f]/[0.08] border-[#d7ff4f] ring-2 ring-[#d7ff4f]/30 shadow-[0_0_22px_rgba(215,255,79,0.3)] animate-active-provider scale-[1.015]'
                                                : isSettled
                                                ? 'bg-[#d7ff4f]/[0.035] border-[#d7ff4f]/30 hover:border-[#d7ff4f]/50 animate-settled'
                                                : 'bg-white/[.018] border-white/[0.08] hover:bg-white/[.035] hover:border-white/15'
                                            }`}
                                          >
                                            <div className="flex items-center justify-between gap-2.5">
                                              <div className="flex items-center gap-2.5 min-w-0">
                                                <div className={`p-1.5 rounded-lg border shrink-0 transition-all ${
                                                  isBusy 
                                                    ? 'bg-[#d7ff4f]/20 border-[#d7ff4f] text-[#d7ff4f] shadow-[0_0_10px_rgba(215,255,79,0.4)] animate-pulse' 
                                                    : isSettled
                                                    ? 'bg-[#d7ff4f]/10 border-[#d7ff4f]/25 text-[#d7ff4f]'
                                                    : 'bg-white/[.04] border-white/10 text-zinc-300'
                                                }`}>
                                                  <SubIcon className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0">
                                                  <span className="font-bold text-white block truncate text-[11.5px]">{sub.shortName || sub.role}</span>
                                                  <span className="text-[10px] text-zinc-400 block truncate">
                                                    {isSettled ? (batchTxHash ? `✓ ${SUBCONTRACTOR_RESULT_PILLS[sub.id] || sub.deliverablePreview}` : `Sample output · ${sub.deliverablePreview}`) : sub.providerLabel}
                                                  </span>
                                                </div>
                                              </div>

                                              <div className="shrink-0 text-right">
                                                {isSettled ? (
                                                  <span className="px-2 py-0.5 rounded text-[9.5px] font-mono font-bold bg-[#d7ff4f]/15 text-[#d7ff4f] border border-[#d7ff4f]/30 flex items-center gap-1 shadow-[0_0_10px_rgba(215,255,79,0.15)]">
                                                    <span>{batchTxHash ? 'PAID' : 'STEP DONE'} ${sub.costPathUsd.toFixed(4)}</span>
                                                    <Check className="w-3 h-3 text-[#d7ff4f]" />
                                                  </span>
                                                ) : isBusy ? (
                                                  <div className="flex items-center gap-1.5 text-[10px] text-[#d7ff4f] font-bold">
                                                    <div className="flex items-end gap-0.5 h-3.5">
                                                      <span className="w-1 bg-[#d7ff4f] rounded-full animate-wave-1" />
                                                      <span className="w-1 bg-[#d7ff4f] rounded-full animate-wave-2" />
                                                      <span className="w-1 bg-[#d7ff4f] rounded-full animate-wave-3" />
                                                      <span className="w-1 bg-[#d7ff4f] rounded-full animate-wave-4" />
                                                    </div>
                                                    <span className="tracking-tight animate-pulse">PAYING ${sub.costPathUsd.toFixed(4)}</span>
                                                  </div>
                                                ) : (
                                                  <span className="text-[10px] text-zinc-500 font-mono">
                                                    ${sub.costPathUsd.toFixed(4)}
                                                  </span>
                                                )}
                                              </div>
                                            </div>

                                            {isSettled && (
                                              <div className="mt-1 pt-1.5 border-t border-white/[0.08] flex items-center justify-between text-[9.5px] font-mono">
                                                <div className="flex items-center gap-1 text-zinc-400 truncate">
                                                  <span className="text-zinc-500">To:</span>
                                                  <span className="text-zinc-300 font-medium">{workerAddr ? `${workerAddr.slice(0, 6)}...${workerAddr.slice(-4)}` : 'evaluation session key'}</span>
                                                  <span className="text-zinc-600">·</span>
                                                  <span className="text-zinc-500">Auth:</span>
                                                  <span className="text-zinc-300">Payment trace</span>
                                                </div>
                                                <span className="text-[#d7ff4f] font-semibold flex items-center gap-1 shrink-0">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-[#d7ff4f] animate-ping" />
                                                  <span>{batchTxHash ? 'Tempo L1' : 'Evaluation'}</span>
                                                  <span className="text-zinc-400">{batchTxHash ? '(trace confirmed)' : '(no chain receipt)'}</span>
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <div className="pt-2.5 border-t border-white/[0.08] text-[10.5px] font-mono text-zinc-400 flex items-center justify-between">
                                    <span>{phase1Subs.length} {phase1Subs.length === 1 ? 'provider' : 'providers'}</span>
                                    <span className={`font-bold ${phase1Settled ? 'text-[#d7ff4f]' : 'text-zinc-500'}`}>
                                      {phase1Settled ? (batchTxHash ? '✓ Delivered' : '✓ Prepared') : 'Standby'}
                                    </span>
                                  </div>
                                </div>

                                {/* COLUMN 2: PHASE 02 · SPECIALIST UNITS */}
                                <div className={`rounded-2xl bg-white/[.025] border p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-sm transition-all duration-500 ${
                                  isExecuting && activeStageNum === 2
                                    ? 'border-[#d7ff4f]/50 shadow-[0_0_30px_rgba(215,255,79,0.15)] ring-1 ring-[#d7ff4f]/30 animate-active-specialist'
                                    : 'border-white/[0.06] hover:border-white/10'
                                }`}>
                                  <div>
                                    <div className="border-b border-white/[0.06] pb-3 mb-3">
                                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-zinc-200 uppercase tracking-wider mb-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#d7ff4f]" />
                                        <span>02 · DO THE WORK</span>
                                      </div>
                                      <h4 className="text-sm font-bold text-white">
                                        {selectedPreset.id === 'swarm_media_creative' ? '5 Creative Workers' : selectedPreset.id === 'swarm_arbitrage' ? '1 Prediction Model' : '5 Risk & Analysis Workers'}
                                      </h4>
                                      <p className="text-[11px] text-zinc-400 mt-0.5">
                                        {selectedPreset.id === 'swarm_media_creative' ? '5 workers turn inputs into copy, visuals, video and checks' : selectedPreset.id === 'swarm_arbitrage' ? '1 worker calculates momentum and risk estimate' : '5 workers analyze financial solvency, ownership and court records'}
                                      </p>
                                    </div>

                                    <div className="space-y-2">
                                      {phase2Subs.map((sub, idx) => {
                                        const isSettled = settledWorkerIds.has(sub.id);
                                        const isBusy = workerLiveStates[sub.id]?.status === 'REQUESTING' || workerLiveStates[sub.id]?.status === 'PAYING';
                                        const SubIcon = getSubcontractorIcon(sub.id);
                                        const workerAddr = getWorkerWalletAddress(sub.id);
                                        return (
                                          <div
                                            key={sub.id}
                                            onClick={() => { soundEngine.playClick(); setSelectedSubId(sub.id); setActiveConsoleTab('inspector'); }}
                                            className={`p-2.5 rounded-xl border text-xs font-mono transition-all duration-200 cursor-pointer flex flex-col gap-1.5 ${
                                              isBusy
                                                ? 'bg-[#d7ff4f]/[0.08] border-[#d7ff4f] ring-2 ring-[#d7ff4f]/30 shadow-[0_0_22px_rgba(215,255,79,0.3)] animate-active-specialist scale-[1.015]'
                                                : isSettled
                                                ? 'bg-[#d7ff4f]/[0.035] border-[#d7ff4f]/30 hover:border-[#d7ff4f]/50 animate-settled'
                                                : 'bg-white/[.018] border-white/[0.08] hover:bg-white/[.035] hover:border-white/15'
                                            }`}
                                          >
                                            <div className="flex items-center justify-between gap-2.5">
                                              <div className="flex items-center gap-2.5 min-w-0">
                                                <div className={`p-1.5 rounded-lg border shrink-0 transition-all ${
                                                  isBusy 
                                                    ? 'bg-[#d7ff4f]/20 border-[#d7ff4f] text-[#d7ff4f] shadow-[0_0_10px_rgba(215,255,79,0.4)] animate-pulse' 
                                                    : isSettled
                                                    ? 'bg-[#d7ff4f]/10 border-[#d7ff4f]/25 text-[#d7ff4f]'
                                                    : 'bg-white/[.04] border-white/10 text-zinc-300'
                                                }`}>
                                                  <SubIcon className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0">
                                                  <span className="font-bold text-white block truncate text-[11.5px]">{sub.shortName || sub.role}</span>
                                                  <span className="text-[10px] text-zinc-400 block truncate">
                                                    {isSettled ? (batchTxHash ? `✓ ${SUBCONTRACTOR_RESULT_PILLS[sub.id] || sub.deliverablePreview}` : `Sample output · ${sub.deliverablePreview}`) : sub.role}
                                                  </span>
                                                </div>
                                              </div>

                                              <div className="shrink-0 text-right">
                                                {isSettled ? (
                                                  <span className="px-2 py-0.5 rounded text-[9.5px] font-mono font-bold bg-[#d7ff4f]/15 text-[#d7ff4f] border border-[#d7ff4f]/30 flex items-center gap-1 shadow-[0_0_10px_rgba(215,255,79,0.15)]">
                                                    <span>{batchTxHash ? 'PAID' : 'STEP DONE'} ${sub.costPathUsd.toFixed(4)}</span>
                                                    <Check className="w-3 h-3 text-[#d7ff4f]" />
                                                  </span>
                                                ) : isBusy ? (
                                                  <div className="flex items-center gap-1.5 text-[10px] text-[#d7ff4f] font-bold">
                                                    <div className="flex items-end gap-0.5 h-3.5">
                                                      <span className="w-1 bg-[#d7ff4f] rounded-full animate-wave-1" />
                                                      <span className="w-1 bg-[#d7ff4f] rounded-full animate-wave-2" />
                                                      <span className="w-1 bg-[#d7ff4f] rounded-full animate-wave-3" />
                                                      <span className="w-1 bg-[#d7ff4f] rounded-full animate-wave-4" />
                                                    </div>
                                                    <span className="tracking-tight animate-pulse">PAYING ${sub.costPathUsd.toFixed(4)}</span>
                                                  </div>
                                                ) : (
                                                  <span className="text-[10px] text-zinc-500 font-mono">
                                                    ${sub.costPathUsd.toFixed(4)}
                                                  </span>
                                                )}
                                              </div>
                                            </div>

                                            {isSettled && (
                                              <div className="mt-1 pt-1.5 border-t border-white/[0.08] flex items-center justify-between text-[9.5px] font-mono">
                                                <div className="flex items-center gap-1 text-zinc-400 truncate">
                                                  <span className="text-zinc-500">To:</span>
                                                  <span className="text-zinc-300 font-medium">{workerAddr ? `${workerAddr.slice(0, 6)}...${workerAddr.slice(-4)}` : 'evaluation session key'}</span>
                                                  <span className="text-zinc-600">·</span>
                                                  <span className="text-zinc-500">Auth:</span>
                                                  <span className="text-zinc-300">Payment trace</span>
                                                </div>
                                                <span className="text-[#d7ff4f] font-semibold flex items-center gap-1 shrink-0">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-[#d7ff4f] animate-ping" />
                                                  <span>Tempo L1</span>
                                                  <span className="text-zinc-400">(trace pending)</span>
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <div className="pt-2.5 border-t border-white/[0.08] text-[10.5px] font-mono text-zinc-400 flex items-center justify-between">
                                    <span>{phase2Subs.length} {phase2Subs.length === 1 ? 'worker' : 'workers'}</span>
                                    <span className={`font-bold ${phase2Settled ? 'text-zinc-200' : 'text-zinc-500'}`}>
                                      {phase2Settled ? (batchTxHash ? '✓ Delivered' : '✓ Prepared') : 'Standby'}
                                    </span>
                                  </div>
                                </div>

                                {/* COLUMN 3: PHASE 03 · WORKER BOTS (LIME ACCENT) */}
                                <div className={`rounded-2xl bg-white/[.025] border p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-sm transition-all duration-500 ${
                                  isExecuting && activeStageNum === 3
                                    ? 'border-[#d7ff4f]/70 shadow-[0_0_30px_rgba(215,255,79,0.2)] ring-1 ring-[#d7ff4f]/40 animate-active-synthesis'
                                    : 'border-[#d7ff4f]/25 hover:border-[#d7ff4f]/40'
                                }`}>
                                  <div>
                                    <div className="border-b border-white/[0.06] pb-3 mb-3">
                                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#d7ff4f] uppercase tracking-wider mb-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#d7ff4f]" />
                                        <span>03 · FINISH &amp; DELIVER</span>
                                      </div>
                                      <h4 className="text-sm font-bold text-white">
                                        {selectedPreset.id === 'swarm_media_creative' ? '7 Packaging Workers' : selectedPreset.id === 'swarm_arbitrage' ? '1 Execution Sandbox' : '7 Synthesis Specialists'}
                                      </h4>
                                      <p className="text-[11px] text-zinc-400 mt-0.5">
                                        {selectedPreset.id === 'swarm_media_creative' ? '7 workers package, localize and prepare the final campaign' : selectedPreset.id === 'swarm_arbitrage' ? '1 sandbox worker simulates gas safety and checks execution risk; no trade is sent in this demo' : '7 workers compile clearance dossier and board sign-off'}
                                      </p>
                                    </div>

                                    <div className="space-y-2">
                                      {phase3Subs.map((sub, idx) => {
                                        const isSettled = settledWorkerIds.has(sub.id);
                                        const isBusy = workerLiveStates[sub.id]?.status === 'REQUESTING' || workerLiveStates[sub.id]?.status === 'PAYING';
                                        const SubIcon = getSubcontractorIcon(sub.id);
                                        const workerAddr = getWorkerWalletAddress(sub.id);
                                        return (
                                          <div
                                            key={sub.id}
                                            onClick={() => { soundEngine.playClick(); setSelectedSubId(sub.id); setActiveConsoleTab('inspector'); }}
                                            className={`p-2.5 rounded-xl border text-xs font-mono transition-all duration-200 cursor-pointer flex flex-col gap-1.5 ${
                                              isBusy
                                                ? 'bg-[#d7ff4f]/[0.12] border-[#d7ff4f] ring-2 ring-[#d7ff4f]/40 shadow-[0_0_26px_rgba(215,255,79,0.35)] animate-active-synthesis scale-[1.015]'
                                                : isSettled
                                                ? 'bg-[#d7ff4f]/[0.035] border-[#d7ff4f]/30 hover:border-[#d7ff4f]/50 animate-settled'
                                                : 'bg-white/[.018] border-white/[0.08] hover:bg-white/[.035] hover:border-white/15'
                                            }`}
                                          >
                                            <div className="flex items-center justify-between gap-2.5">
                                              <div className="flex items-center gap-2.5 min-w-0">
                                                <div className={`p-1.5 rounded-lg border shrink-0 transition-all ${
                                                  isBusy 
                                                    ? 'bg-[#d7ff4f]/20 border-[#d7ff4f] text-[#d7ff4f] shadow-[0_0_10px_rgba(215,255,79,0.4)] animate-pulse' 
                                                    : isSettled
                                                    ? 'bg-[#d7ff4f]/10 border-[#d7ff4f]/25 text-[#d7ff4f]'
                                                    : 'bg-white/[.04] border-white/10 text-zinc-300'
                                                }`}>
                                                  <SubIcon className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0">
                                                  <span className="font-bold text-white block truncate text-[11.5px]">{sub.shortName || sub.role}</span>
                                                  <span className="text-[10px] text-zinc-400 block truncate">
                                                    {isSettled ? (batchTxHash ? `✓ ${SUBCONTRACTOR_RESULT_PILLS[sub.id] || sub.deliverablePreview}` : `Sample output · ${sub.deliverablePreview}`) : sub.role}
                                                  </span>
                                                </div>
                                              </div>

                                              <div className="shrink-0 text-right">
                                                {isSettled ? (
                                                  <span className="px-2 py-0.5 rounded text-[9.5px] font-mono font-bold bg-[#d7ff4f]/15 text-[#d7ff4f] border border-[#d7ff4f]/30 flex items-center gap-1 shadow-[0_0_10px_rgba(215,255,79,0.15)]">
                                                    <span>{batchTxHash ? 'PAID' : 'STEP DONE'} ${sub.costPathUsd.toFixed(4)}</span>
                                                    <Check className="w-3 h-3 text-[#d7ff4f]" />
                                                  </span>
                                                ) : isBusy ? (
                                                  <div className="flex items-center gap-1.5 text-[10px] text-[#d7ff4f] font-bold">
                                                    <div className="flex items-end gap-0.5 h-3.5">
                                                      <span className="w-1 bg-[#d7ff4f] rounded-full animate-wave-1" />
                                                      <span className="w-1 bg-[#d7ff4f] rounded-full animate-wave-2" />
                                                      <span className="w-1 bg-[#d7ff4f] rounded-full animate-wave-3" />
                                                      <span className="w-1 bg-[#d7ff4f] rounded-full animate-wave-4" />
                                                    </div>
                                                    <span className="tracking-tight animate-pulse">PAYING ${sub.costPathUsd.toFixed(4)}</span>
                                                  </div>
                                                ) : (
                                                  <span className="text-[10px] text-zinc-500 font-mono">
                                                    ${sub.costPathUsd.toFixed(4)}
                                                  </span>
                                                )}
                                              </div>
                                            </div>

                                            {isSettled && (
                                              <div className="mt-1 pt-1.5 border-t border-white/[0.08] flex items-center justify-between text-[9.5px] font-mono">
                                                <div className="flex items-center gap-1 text-zinc-400 truncate">
                                                  <span className="text-zinc-500">To:</span>
                                                  <span className="text-zinc-300 font-medium">{workerAddr ? `${workerAddr.slice(0, 6)}...${workerAddr.slice(-4)}` : 'evaluation session key'}</span>
                                                  <span className="text-zinc-600">·</span>
                                                  <span className="text-zinc-500">Auth:</span>
                                                  <span className="text-zinc-300">Payment trace</span>
                                                </div>
                                                <span className="text-[#d7ff4f] font-semibold flex items-center gap-1 shrink-0">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-[#d7ff4f] animate-ping" />
                                                  <span>Tempo L1</span>
                                                  <span className="text-zinc-400">(trace pending)</span>
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <div className="pt-2.5 border-t border-white/[0.08] text-[10.5px] font-mono text-zinc-400 flex items-center justify-between">
                                    <span>{phase3Subs.length} {phase3Subs.length === 1 ? 'worker' : 'workers'}</span>
                                    <span className={`font-bold ${phase3Settled ? 'text-[#d7ff4f]' : 'text-zinc-500'}`}>
                                      {phase3Settled ? (batchTxHash ? '✓ Delivered' : '✓ Prepared') : 'Standby'}
                                    </span>
                                  </div>
                                </div>

                              </div>
                            );
                          })()}

                          {/* 4. LIVE UNIT TELEMETRY & DELIVERABLE COCKPIT */}
                          {(() => {
                            const activeNode = 
                              selectedPreset.subcontractors.find(s => s.id === selectedSubId) ||
                              selectedPreset.subcontractors.find(s => workerLiveStates[s.id]?.status === 'REQUESTING' || workerLiveStates[s.id]?.status === 'PAYING') ||
                              selectedPreset.subcontractors[0];
                            
                            if (!activeNode) return null;

                            const isSettled = settledWorkerIds.has(activeNode.id);
                            const isBusy = workerLiveStates[activeNode.id]?.status === 'REQUESTING' || workerLiveStates[activeNode.id]?.status === 'PAYING';
                            const NodeIcon = getSubcontractorIcon(activeNode.id);
                            const dependency = NODE_CAUSAL_DEPENDENCY[activeNode.id];

                            return (
                              <div className="rounded-2xl bg-white/[.03] backdrop-blur-md border border-white/[.08] p-5 shadow-sm relative overflow-hidden">
                                {/* Top Banner of Cockpit */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                                      isBusy
                                        ? 'bg-[#d7ff4f]/20 text-[#d7ff4f] border-[#d7ff4f]/50 animate-pulse'
                                        : isSettled
                                        ? 'bg-[#d7ff4f]/15 text-[#d7ff4f] border border-[#d7ff4f]/30'
                                        : 'bg-white/5 text-zinc-300 border-white/10'
                                    }`}>
                                      <NodeIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-white text-sm tracking-tight">{activeNode.shortName || activeNode.role}</span>
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                                          isBusy
                                            ? 'bg-[#d7ff4f]/20 text-[#d7ff4f] border border-[#d7ff4f]/40 animate-pulse'
                                            : isSettled
                                            ? 'bg-[#d7ff4f]/15 text-[#d7ff4f] border border-[#d7ff4f]/30'
                                            : 'bg-white/5 text-zinc-400 border border-white/10'
                                        }`}>
                                          {isBusy ? '● Working now' : isSettled ? (batchTxHash ? '✓ Payment confirmed' : 'Step complete') : 'Waiting'}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                                        {activeNode.providerLabel} • {activeNode.targetUrl}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs flex-wrap">
                                    <div className="px-3 py-1.5 rounded-lg bg-white/[.03] backdrop-blur-md border border-white/10 flex items-center gap-2">
                                      <span className="text-zinc-500 text-[11px]">Cost:</span>
                                      <span className="text-[#d7ff4f] font-bold">${activeNode.costPathUsd.toFixed(4)} USD</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => inspectWorkerCryptoProof(activeNode)}
                                      className="px-3 py-1.5 rounded-lg bg-[#d7ff4f]/15 hover:bg-[#d7ff4f]/25 border border-[#d7ff4f]/40 text-[#d7ff4f] hover:text-white text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-[0_0_12px_rgba(215,255,79,0.2)] active:scale-95"
                                    >
                                      <ShieldCheck className="w-3.5 h-3.5 text-[#d7ff4f]" />
                                      <span>Cryptographic Proof</span>
                                    </button>
                                    <a
                                      href="https://explore.tempo.xyz/address/0x3c42E274FAdd8e371fB84f97203CC2F2125c8775"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="View SynapseVault Smart Contract on Tempo Moderato (Chain ID 42431)"
                                      className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white text-[11px] flex items-center gap-1 transition"
                                    >
                                      <span>Vault Contract (42431)</span>
                                      <ExternalLink className="w-3 h-3 text-zinc-400" />
                                    </a>
                                  </div>
                                </div>

                                {/* 3 Concrete Data Panels: Input, 402 Network Telemetry, Output */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs font-mono">
                                  {/* Panel 1: Task Given (Input) */}
                                  <div className="p-3.5 rounded-xl bg-white/[.025] backdrop-blur-md border border-white/[.08] space-y-2">
                                    <span className="text-zinc-400 font-bold uppercase tracking-wider text-[10px] block flex items-center gap-1.5">
                                      <Terminal className="w-3.5 h-3.5 text-[#d7ff4f]" />
                                      <span>1. Task Input & Directive</span>
                                    </span>
                                    <p className="text-zinc-200 text-[11.5px] font-sans leading-relaxed">
                                      {activeNode.taskInput || activeNode.currentTask || 'Direct instruction dispatched from Campaign Coordinator.'}
                                    </p>
                                    <div className="text-[10px] text-zinc-500 pt-1 border-t border-white/[0.04]">
                                      Dependency: {dependency?.waitingFor || 'Lead Orchestrator'}
                                    </div>
                                  </div>

                                  {/* Panel 2: HTTP 402 Network Telemetry */}
                                  <div className="p-3.5 rounded-xl bg-white/[.025] backdrop-blur-md border border-white/[.08] space-y-2">
                                    <span className="text-zinc-400 font-bold uppercase tracking-wider text-[10px] block flex items-center gap-1.5">
                                      <Activity className="w-3.5 h-3.5 text-[#d7ff4f]" />
                                      <span>2. Payment check</span>
                                    </span>
                                    <div className="space-y-1.5 text-[11px]">
                                      <div className="flex items-center justify-between text-zinc-400">
                                        <span>Status:</span>
                                        <span className={`font-bold ${isSettled ? 'text-[#d7ff4f]' : isBusy ? 'text-[#d7ff4f] animate-pulse' : 'text-zinc-400'}`}>
                                          {isSettled ? (batchTxHash ? 'Confirmed on Tempo L1' : 'Completed in evaluation') : isBusy ? 'Payment requested...' : 'Waiting for request'}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between text-zinc-400">
                                        <span>Recipient (MPP):</span>
                                        {batchTxHash ? <span className="text-[#d7ff4f] font-mono text-[10.5px]">0xfCEb1a...24A0</span> : <span className="text-zinc-500">Not connected</span>}
                                      </div>
                                      <div className="flex items-center justify-between text-zinc-400">
                                        <span>Client Vault:</span>
                                        {batchTxHash ? <span className="text-zinc-200 font-mono text-[10.5px]">0x3c42E2...8775</span> : <span className="text-zinc-500">Not connected</span>}
                                      </div>
                                      <div className="flex items-center justify-between text-zinc-400">
                                        <span>Paid Amount:</span>
                                        <span className="text-white font-mono">
                                          <strong className="text-[#d7ff4f]">${activeNode.costPathUsd.toFixed(4)} USD</strong>
                                          <span className="text-zinc-500 text-[9.5px] ml-1">({batchTxHash ? 'gas recorded' : 'planned'})</span>
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between text-zinc-400">
                                        <span>On-Chain Tx:</span>
                                        <a
                                          href={batchTxHash ? `https://explore.tempo.xyz/tx/${batchTxHash}` : undefined}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          title={batchTxHash ? 'Confirmed transaction on Tempo Moderato' : 'No confirmed transaction returned'}
                                          className={`${batchTxHash ? 'text-[#d7ff4f] hover:underline cursor-pointer' : 'text-amber-300 cursor-default'} font-mono text-[10.5px] flex items-center gap-1`}
                                        >
                                          <span>{batchTxHash ? `${batchTxHash.slice(0, 8)}...${batchTxHash.slice(-6)} ↗` : 'No transaction returned'}</span>
                                        </a>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Panel 3: Live Output Produced */}
                                  <div className="p-3.5 rounded-xl bg-white/[.025] backdrop-blur-md border border-white/[.08] space-y-2">
                                    <span className="text-zinc-400 font-bold uppercase tracking-wider text-[10px] block flex items-center gap-1.5">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-[#d7ff4f]" />
                                      <span>3. Deliverable Output</span>
                                    </span>
                                    <p className="text-[#d7ff4f] text-[11.5px] font-sans font-medium leading-relaxed">
                                      {isSettled 
                                        ? (batchTxHash ? (activeNode.taskOutput || activeNode.samplePayload || activeNode.deliverablePreview) : `Sample output · ${activeNode.deliverablePreview}`)
                                        : isBusy
                                        ? (activeNode.workingAction || 'Generating output on provider cluster...')
                                        : (activeNode.deliverablePreview || 'Awaiting execution trigger...')}
                                    </p>
                                    <div className="text-[10px] text-zinc-500 pt-1 border-t border-white/[0.04]">
                                      Handoff to: {dependency?.handoffTo || 'Final Assembly'}
                                    </div>
                                  </div>
                                </div>

                                {/* Footer hint */}
                                <div className="mt-3.5 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[10.5px] font-mono text-zinc-500">
                                  <span>Tip: Select a card to view its task, output, and payment status.</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    ) : swarmViewMode === 'pipeline' ? (
                      <div className="space-y-6">
                        <div className="rounded-3xl bg-white/[.025] backdrop-blur-md border border-white/10 p-6 sm:p-8 md:p-9 shadow-2xl space-y-8 relative overflow-hidden">
                          
                          {/* Ambient Specular Beam */}
                          <div className="absolute top-0 right-1/4 w-96 h-48 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#d7ff4f]/[0.06] via-transparent to-transparent pointer-events-none" />

                          {/* Enterprise Header */}
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-white/[0.08] pb-6 relative z-10">
                            <div>
                              <div className="flex items-center gap-2.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#d7ff4f] shadow-[0_0_12px_#d7ff4f]" />
                                <span className="text-xs font-mono tracking-widest text-zinc-400 uppercase font-semibold">
                                  Autonomous Execution Pipeline
                                </span>
                              </div>
                              <h3 className="text-2xl font-extrabold text-white tracking-tight mt-1.5 flex items-center gap-3">
                                <span>{selectedPreset.title}</span>
                                <span className="text-xs px-2.5 py-1 rounded-full bg-[#d7ff4f]/10 text-[#d7ff4f] border border-[#d7ff4f]/30 font-mono font-medium">
                                  {selectedPreset.subcontractors.length} Units
                                </span>
                              </h3>
                              <p className="text-xs sm:text-[13px] text-zinc-400 mt-1 font-sans leading-relaxed">
                                {selectedPreset.subcontractors.length} interconnected units. Strict causal handoffs. Every payment step stays within the hard {selectedPreset.budgetLimit || '$0.0500 cap'} policy cap.
                              </p>
                            </div>

                            {/* Settlement Summary */}
                            <div className="flex items-center gap-3 text-xs font-mono shrink-0 flex-wrap">
                              <div className="px-4 py-2.5 rounded-xl bg-white/[.03] backdrop-blur-md border border-white/10 flex items-center gap-2.5 shadow-sm">
                                <span className="text-zinc-500">Billed:</span>
                                <span className="text-[#d7ff4f] font-bold text-sm">
                                  ${Array.from(settledWorkerIds).reduce<number>((acc, id) => acc + (selectedPreset.subcontractors.find(x => x.id === id)?.costPathUsd || 0), 0).toFixed(4)} USD
                                </span>
                                <span className="text-zinc-600 text-[11px]">/ {selectedPreset.budgetLimit || '$0.0500 cap'}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const targetWorker = selectedPreset.subcontractors.find(x => settledWorkerIds.has(x.id)) || selectedPreset.subcontractors[0];
                                  if (targetWorker) inspectWorkerCryptoProof(targetWorker);
                                }}
                                className="px-4 py-2.5 rounded-xl bg-[#d7ff4f]/10 hover:bg-[#d7ff4f]/20 border border-[#d7ff4f]/30 text-[#d7ff4f] hover:text-[#cbf540] font-bold transition flex items-center gap-2 shadow-[0_0_15px_rgba(215,255,79,0.15)] cursor-pointer active:scale-95"
                              >
                                <ShieldCheck className="w-4 h-4" />
                                <span>Inspect Live Proof</span>
                              </button>
                              <a
                                href="https://explore.tempo.xyz/address/0x3c42E274FAdd8e371fB84f97203CC2F2125c8775"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="SynapseVault Smart Contract on Tempo Moderato (Chain ID 42431)"
                                className="px-3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white font-mono text-xs transition flex items-center gap-1.5 cursor-pointer"
                              >
                                <span>Vault (42431)</span>
                                <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                              </a>
                            </div>
                          </div>

                          {/* ==================== 4 ENTERPRISE PIPELINE PHASES ==================== */}
                          <div className="space-y-6 font-mono text-xs relative z-10">
                            
                            {/* STAGE 01: MISSION DIRECTIVE */}
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between px-2 text-xs text-zinc-400 border-b border-white/[0.08] pb-2.5">
                                <span className="font-bold tracking-wider text-white uppercase flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-[#d7ff4f] shadow-[0_0_8px_#d7ff4f]" />
                                  <span>Stage 01 • Mission Directive & Policy Enforcement (1 Unit)</span>
                                </span>
                                <span className="px-3 py-1 rounded-lg bg-[#d7ff4f]/10 border border-[#d7ff4f]/25 text-[#d7ff4f] font-mono text-[11px] font-bold shadow-inner">
                                  Internal Orchestration · Zero Network Fee
                                </span>
                              </div>

                              {(() => {
                                const lead = selectedPreset.subcontractors.find(s => s.id === 'lead_orchestrator') || selectedPreset.subcontractors[0];
                                const isLeadActive = isExecuting && (activeStageNum === 0 || activeStageNum === 4);
                                const isLeadSettled = settledWorkerIds.has('lead_orchestrator');
                                const LeadIcon = getSubcontractorIcon(lead.id);

                                return (
                                  <div
                                    onClick={() => { soundEngine.playClick(); setSelectedSubId('lead_orchestrator'); setActiveConsoleTab('inspector'); }}
                                    className={`relative p-4 sm:px-5 sm:py-4 rounded-2xl cursor-pointer flex flex-col gap-3 group luxury-card ${
                                      selectedSubId === 'lead_orchestrator'
                                        ? 'luxury-card-active'
                                        : isLeadActive
                                        ? 'border-[#d7ff4f]/70 bg-[#d7ff4f]/[0.05] ring-2 ring-[#d7ff4f]/40 shadow-[0_0_24px_rgba(215,255,79,0.22)] scale-[1.01] z-10'
                                        : ''
                                    }`}
                                  >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                      <div className="flex items-center gap-4 min-w-0">
                                        <span className="w-7 h-7 rounded-lg bg-black/60 border border-white/[0.08] flex items-center justify-center text-[11px] font-mono font-medium text-[#d7ff4f] shrink-0 shadow-inner">01</span>
                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 p-2.5 transition-all ${
                                          isLeadActive
                                            ? 'bg-[#d7ff4f]/20 text-[#d7ff4f] border border-[#d7ff4f]/40 shadow-[0_0_12px_rgba(215,255,79,0.3)]'
                                            : isLeadSettled
                                            ? 'bg-[#d7ff4f]/15 text-[#d7ff4f] border border-[#d7ff4f]/30'
                                            : 'luxury-icon-pod text-zinc-200 group-hover:text-white'
                                        }`}>
                                          <LeadIcon className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-2.5 flex-wrap">
                                            <span className="font-bold text-white text-[14px] tracking-tight">{lead.role}</span>
                                            <span className="px-2.5 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase tracking-wider bg-[#d7ff4f]/15 text-[#d7ff4f] border border-[#d7ff4f]/30">
                                              Controller
                                            </span>
                                          </div>
                                          <p className="text-[11.5px] text-zinc-400 font-sans mt-0.5">
                                            Coordinates {selectedPreset.subcontractors.length - 1} units under the {selectedPreset.budgetLimit || '$0.0500 cap'} policy budget cap.
                                          </p>
                                          <div key={isLeadActive ? 'active' : isLeadSettled ? 'settled' : 'standby'} className="animate-glide text-[12px] text-zinc-300 mt-1 font-sans truncate">
                                            {isLeadActive ? (
                                              <span className="text-[#d7ff4f] font-mono flex items-center gap-2 font-medium">
                                                <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0 text-[#d7ff4f]" />
                                                <span>Coordinating workforce & dispatching Tempo L1 payments...</span>
                                              </span>
                                            ) : isLeadSettled ? (
                                              <span className="text-zinc-300 font-mono flex items-center gap-2">
                                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#d7ff4f]" />
                                <span>Mission directive executed • {selectedPreset.subcontractors.length === 20 ? '19' : selectedPreset.subcontractors.length - 1} payment steps completed{batchTxHash ? ' and confirmed on Tempo L1' : ' in the evaluation flow'}</span>
                                              </span>
                                            ) : (
                                              <span className="text-zinc-500 font-mono flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5 shrink-0 text-zinc-600" />
                                                <span>Enforces {selectedPreset.budgetLimit || '$0.0500 cap'} • Coordinates {selectedPreset.subcontractors.length - 1} units • Zero subscriptions</span>
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-3.5 shrink-0 text-xs self-start sm:self-auto font-mono">
                                        <span className="px-3 py-1 rounded-lg bg-black/40 border border-white/[0.06] text-zinc-400 hidden lg:inline text-[11px]">
                                          ➔ Relays to {selectedPreset.subcontractors.filter(s => s.waveGroup === 1).length} Feeds
                                        </span>
                                        <span className="px-3.5 py-1.5 rounded-xl bg-black/60 border border-white/[0.08] text-zinc-200 font-mono font-medium text-xs shadow-inner">
                                          $0.0000 USD
                                        </span>
                                      </div>
                                    </div>

                                    {/* LIVE TELEMETRY DRAWER */}
                                    {(isLeadActive || selectedSubId === 'lead_orchestrator') && (
                                      <div className="pt-3 border-t border-white/[0.08] bg-black/50 rounded-xl p-3 font-mono text-[11px] space-y-2 border border-white/[0.04] animate-glide">
                                        <div className="flex items-center justify-between text-zinc-400 text-[10px] pb-1.5 border-b border-white/[0.05]">
                                          <div className="flex items-center gap-2">
                                            <span className={`w-1.5 h-1.5 rounded-full ${isLeadActive ? 'bg-[#d7ff4f] animate-pulse' : 'bg-emerald-400/80'}`} />
                                            <span className="font-bold uppercase tracking-wider text-zinc-300">Work progress</span>
                                          </div>
                                          <span className="text-zinc-500">Configured vault: 0x3c42...8775 (Tempo L1)</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10.5px]">
                                          <div className="p-2.5 rounded bg-black/40 border border-white/[0.04]">
                                            <span className="text-zinc-500 font-bold uppercase tracking-wider text-[9.5px] block">Policy Limit Enforcement</span>
                                            <span className="text-zinc-200 font-medium">Hard Cap: {selectedPreset.budgetLimit || '$0.0500 cap'} • Max Nodes: {selectedPreset.subcontractors.length - 1} Units</span>
                                          </div>
                                          <div className="p-2.5 rounded bg-black/40 border border-white/[0.04]">
                                            <span className="text-zinc-500 font-bold uppercase tracking-wider text-[9.5px] block">Execution Pipeline Flow</span>
                                            <span className="text-zinc-200 font-medium">{selectedPreset.id === 'swarm_media_creative' ? 'Work Pipeline: Feeds (02-08) ➔ Creative (09-13) ➔ Delivery (14-20)' : selectedPreset.id === 'swarm_arbitrage' ? 'Work Pipeline: Inputs (02-03) ➔ Model (04) ➔ Sandbox Check (05)' : 'Work Pipeline: Feeds (02-08) ➔ Analysis (09-13) ➔ Clearance (14-20)'}</span>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>

                            {/* STAGE 02: 7 PAID EXTERNAL FEEDS */}
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between px-2 text-xs text-zinc-400 border-b border-white/[0.08] pb-2.5">
                                <span className="font-bold tracking-wider text-white uppercase flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-[#d7ff4f] shadow-[0_0_8px_#d7ff4f]" />
                                  <span>
                                    {selectedPreset.id === 'swarm_media_creative'
                                      ? 'Stage 02 • Example Market & Media Inputs (7 Units)'
                                      : selectedPreset.id === 'swarm_arbitrage'
                                      ? 'Stage 02 • Sample Market Depth Inputs (2 Units)'
                                      : 'Stage 02 • Example Registry & Compliance Inputs (7 Units)'}
                                  </span>
                                </span>
                                <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-300 font-mono text-[11px] font-bold shadow-inner">
                                  ${selectedPreset.subcontractors.filter(s => s.waveGroup === 1).reduce((acc, s) => acc + s.costPathUsd, 0).toFixed(4)} USD {batchTxHash ? 'Settled on Tempo L1' : 'planned in evaluation'}
                                </span>
                              </div>

                              <div className="space-y-2">
                                {selectedPreset.subcontractors.filter(s => s.waveGroup === 1).map((sub, idx) => {
                                  const isSettled = settledWorkerIds.has(sub.id);
                                  const isSelected = selectedSubId === sub.id;
                                  const liveState = workerLiveStates[sub.id];
                                  const isRequesting = liveState?.status === 'REQUESTING';
                                  const isPaying = liveState?.status === 'PAYING';
                                  const isBusy = isRequesting || isPaying;
                                  const dependency = NODE_CAUSAL_DEPENDENCY[sub.id];
                                  const isProvider = sub.nodeType === 'PROVIDER';
                                  const NodeIcon = getSubcontractorIcon(sub.id);
                                  const phase1Count = selectedPreset.subcontractors.filter(s => s.waveGroup === 1).length;
                                  const nodeNum = idx + 2 + phase1Count;
                                  const nodeStr = nodeNum < 10 ? `0${nodeNum}` : `${nodeNum}`;

                                  return (
                                    <div
                                      key={sub.id}
                                      onClick={() => { soundEngine.playClick(); setSelectedSubId(sub.id); setActiveConsoleTab('inspector'); }}
                                      className={`relative p-4 sm:px-5 sm:py-4 rounded-2xl cursor-pointer flex flex-col gap-3 group luxury-card ${
                                        isSelected
                                          ? 'luxury-card-active'
                                          : isBusy
                                          ? 'border-[#d7ff4f]/70 bg-[#d7ff4f]/[0.05] ring-2 ring-[#d7ff4f]/40 shadow-[0_0_24px_rgba(215,255,79,0.22)] scale-[1.01] z-10'
                                          : ''
                                      }`}
                                    >
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 min-w-0">
                                          <span className="w-7 h-7 rounded-lg bg-white/[.04] border border-white/10 flex items-center justify-center text-[11px] font-mono font-medium text-[#d7ff4f] shrink-0 shadow-sm">{idx + 2 < 10 ? `0${idx + 2}` : idx + 2}</span>
                                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 p-2.5 transition-all ${
                                            isBusy
                                              ? 'bg-[#d7ff4f]/20 text-[#d7ff4f] border border-[#d7ff4f]/40 shadow-[0_0_12px_rgba(215,255,79,0.3)]'
                                              : isSettled
                                              ? 'bg-[#d7ff4f]/15 text-[#d7ff4f] border border-[#d7ff4f]/30'
                                              : isProvider
                                              ? 'bg-white/5 text-[#d7ff4f] border border-white/10'
                                              : 'luxury-icon-pod text-zinc-200 group-hover:text-white'
                                          }`}>
                                            <NodeIcon className="w-5 h-5" />
                                          </div>
                                          <div className="min-w-0">
                                            <div className="flex items-center gap-2.5 flex-wrap">
                                              <span className="font-bold text-white text-[14px] truncate tracking-tight">{sub.shortName || sub.role}</span>
                                              <span className={`px-2.5 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase tracking-wider ${
                                                isProvider ? 'bg-white/5 text-zinc-300 border border-white/10' : 'bg-white/5 text-zinc-300 border border-white/10'
                                              }`}>
                                                {isProvider ? 'API Feed' : 'Unit'}
                                              </span>
                                              <span className="text-[11px] text-zinc-500 truncate hidden md:inline font-mono">• {sub.providerLabel}</span>
                                            </div>
                                            <p className="text-[11.5px] text-zinc-400 font-sans mt-0.5 truncate">
                                              {sub.currentTask || sub.deliverablePreview}
                                            </p>
                                            <div key={isRequesting ? 'req' : isPaying ? 'pay' : isSettled ? 'done' : 'standby'} className="animate-glide text-[12px] text-zinc-300 block truncate font-sans mt-1">
                                              {isRequesting ? (
                                                <span className="text-[#d7ff4f] font-mono flex items-center gap-2 font-medium">
                                                  <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0 text-[#d7ff4f]" />
                                                  <span>Querying endpoint • awaiting 402 challenge...</span>
                                                </span>
                                              ) : isPaying ? (
                                                <span className="text-[#d7ff4f] font-mono flex items-center gap-2 font-bold">
                                                  <Zap className="w-3.5 h-3.5 shrink-0 text-[#d7ff4f] animate-bounce" />
                                                  <span>Checking the payment step...</span>
                                                </span>
                                              ) : isSettled ? (
                                                <span className="text-zinc-300 font-mono flex items-center gap-2">
                                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#d7ff4f]" />
                                                  <span>{batchTxHash ? 'Delivered:' : 'Result preview:'} <strong className="text-[#d7ff4f] font-medium px-2 py-0.5 rounded bg-[#d7ff4f]/10 border border-[#d7ff4f]/25 text-[11px]">{SUBCONTRACTOR_RESULT_PILLS[sub.id] || sub.deliverablePreview}</strong></span>
                                                </span>
                                              ) : (
                                                <span className="text-zinc-500 font-mono flex items-center gap-2">
                                                  <Clock className="w-3.5 h-3.5 shrink-0 text-zinc-600" />
                                                  <span>Standby • Waiting for: {dependency?.waitingFor || 'Directive from Unit 01'}</span>
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-3.5 shrink-0 text-xs self-start sm:self-auto font-mono">
                                          <span className="px-3 py-1 rounded-lg bg-black/40 border border-white/[0.06] text-zinc-400 hidden lg:inline text-[11px]">
                                            ➔ {dependency?.handoffTo || 'Creative Units'}
                                          </span>
                                          <span className={`px-3.5 py-1.5 rounded-xl border text-xs shadow-inner font-mono font-medium flex items-center gap-1.5 ${
                                            isSettled 
                                              ? 'bg-[#d7ff4f]/10 text-[#d7ff4f] border-[#d7ff4f]/30 font-bold' 
                                              : isBusy 
                                              ? 'bg-[#d7ff4f]/20 text-[#d7ff4f] border-[#d7ff4f]/50 font-bold animate-pulse shadow-[0_0_12px_rgba(215,255,79,0.2)]' 
                                              : 'bg-black/60 text-zinc-400 border-white/[0.06]'
                                          }`}>
                                            {isSettled && <span className="w-1.5 h-1.5 rounded-full bg-[#d7ff4f]" />}
                                            {isBusy && <span className="w-1.5 h-1.5 rounded-full bg-[#d7ff4f] animate-pulse" />}
                                            <span>${sub.costPathUsd.toFixed(4)} USD</span>
                                          </span>
                                        </div>
                                      </div>

                                      {/* LIVE TELEMETRY DRAWER */}
                                      {(isSelected || (isBusy && selectedSubId === sub.id)) && (
                                        <div className="pt-3 border-t border-white/[0.08] bg-black/50 rounded-xl p-3 font-mono text-[11px] space-y-2 border border-white/[0.04] animate-glide">
                                          <div className="flex items-center justify-between text-zinc-400 text-[10px] pb-1.5 border-b border-white/[0.05]">
                                            <div className="flex items-center gap-2">
                                              <span className={`w-1.5 h-1.5 rounded-full ${isBusy ? 'bg-[#d7ff4f] animate-pulse' : isSettled ? 'bg-[#d7ff4f]' : 'bg-zinc-500'}`} />
                                              <span className="font-bold uppercase tracking-wider text-zinc-300">{batchTxHash ? 'Live' : 'Evaluation'} Execution Telemetry • Node {idx + 2 < 10 ? `0${idx + 2}` : idx + 2}</span>
                                            </div>
                                            <span className="text-zinc-500">{sub.targetUrl}</span>
                                          </div>

                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[10.5px]">
                                            <div className="p-2 rounded bg-black/40 border border-white/[0.04] space-y-1">
                                              <span className="text-[#d7ff4f] font-bold uppercase tracking-wider text-[9.5px] block">Purpose / Why Needed</span>
                                              <span className="text-zinc-200 block text-[10.5px] font-sans">{sub.savingsVsSubscription || sub.currentTask}</span>
                                            </div>
                                            <div className="p-2 rounded bg-black/40 border border-white/[0.04] space-y-1">
                                              <span className="text-zinc-400 font-bold uppercase tracking-wider text-[9.5px] block">Received (Input)</span>
                                              <span className="text-zinc-300 block truncate">{sub.taskInput || `Ingested dependency from ${dependency?.waitingFor || 'Unit 01'}`}</span>
                                            </div>
                                            <div className="p-2 rounded bg-black/40 border border-white/[0.04] space-y-1">
                                              <span className="text-zinc-400 font-bold uppercase tracking-wider text-[9.5px] block">Payment channel state</span>
                                              <span className="text-zinc-300 block truncate">
                                                {isRequesting ? (
                                                  <span className="text-zinc-300">HTTP 402 • Challenge Received ($0.0000)</span>
                                                ) : isPaying ? (
                                                  <span className="text-zinc-200">Signing EIP-712 • Channel Active</span>
                                                ) : isSettled ? (
                                                  <span className="text-zinc-200">{batchTxHash ? 'Settled' : 'Planned'} • ${sub.costPathUsd.toFixed(4)} USD</span>
                                                ) : (
                                                  <span className="text-zinc-500">Standby Channel (Cap: {selectedPreset.budgetLimit || '$0.0500 cap'})</span>
                                                )}
                                              </span>
                                            </div>
                                          </div>

                                          {isSettled && (
                                            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-zinc-300 text-[10.5px] flex items-center justify-between animate-glide">
                                              <div className="truncate"><strong className="text-white font-medium">{batchTxHash ? 'Output delivered:' : 'Evaluation output:'}</strong> <span className="text-zinc-200 ml-1">{sub.taskOutput || SUBCONTRACTOR_RESULT_PILLS[sub.id] || sub.deliverablePreview}</span></div>
                                              <span className="text-[9.5px] font-mono text-zinc-400 shrink-0 ml-2">➔ Handed to Stage 03</span>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* STAGE 03: 5 CREATIVE SPECIALISTS */}
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between px-2 text-xs text-zinc-400 border-b border-white/[0.08] pb-2.5">
                                <span className="font-bold tracking-wider text-white uppercase flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-[#d7ff4f] shadow-[0_0_8px_#d7ff4f]" />
                                  <span>
                                    {selectedPreset.id === 'swarm_media_creative'
                                      ? 'Stage 03 • Specialist Creative & Compliance Units (5 Units)'
                                      : selectedPreset.id === 'swarm_arbitrage'
                                      ? 'Stage 03 • Spread Slippage & Routing (1 Unit)'
                                      : 'Stage 03 • Specialist Solvency & Risk Audits (5 Units)'}
                                  </span>
                                </span>
                                <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-300 font-mono text-[11px] font-bold shadow-inner">
                                  ${selectedPreset.subcontractors.filter(s => s.waveGroup === 2).reduce((acc, s) => acc + s.costPathUsd, 0).toFixed(4)} USD {batchTxHash ? 'Settled on Tempo L1' : 'planned in evaluation'}
                                </span>
                              </div>

                              <div className="space-y-2">
                                {selectedPreset.subcontractors.filter(s => s.waveGroup === 2).map((sub, idx) => {
                                  const isSettled = settledWorkerIds.has(sub.id);
                                  const isSelected = selectedSubId === sub.id;
                                  const liveState = workerLiveStates[sub.id];
                                  const isRequesting = liveState?.status === 'REQUESTING';
                                  const isPaying = liveState?.status === 'PAYING';
                                  const isBusy = isRequesting || isPaying;
                                  const dependency = NODE_CAUSAL_DEPENDENCY[sub.id];
                                  const NodeIcon = getSubcontractorIcon(sub.id);
                                  const phase1Count = selectedPreset.subcontractors.filter(s => s.waveGroup === 1).length;
                                  const nodeNum = idx + 2 + phase1Count;
                                  const nodeStr = nodeNum < 10 ? `0${nodeNum}` : `${nodeNum}`;

                                  return (
                                    <div
                                      key={sub.id}
                                      onClick={() => { soundEngine.playClick(); setSelectedSubId(sub.id); setActiveConsoleTab('inspector'); }}
                                      className={`relative p-4 sm:px-5 sm:py-4 rounded-2xl cursor-pointer flex flex-col gap-3 group luxury-card ${
                                        isSelected
                                          ? 'luxury-card-active'
                                          : isBusy
                                          ? 'border-[#d7ff4f]/70 bg-[#d7ff4f]/[0.05] ring-2 ring-[#d7ff4f]/40 shadow-[0_0_24px_rgba(215,255,79,0.22)] scale-[1.01] z-10'
                                          : ''
                                      }`}
                                    >
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 min-w-0">
                                          <span className="w-7 h-7 rounded-lg bg-white/[.04] border border-white/10 flex items-center justify-center text-[11px] font-mono font-medium text-zinc-200 shrink-0 shadow-sm">{nodeStr}</span>
                                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 p-2.5 transition-all ${
                                            isBusy
                                              ? 'bg-[#d7ff4f]/20 text-[#d7ff4f] border border-[#d7ff4f]/40 shadow-[0_0_12px_rgba(215,255,79,0.3)]'
                                              : isSettled
                                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                              : 'bg-white/5 text-zinc-300 border border-white/10'
                                          }`}>
                                            <NodeIcon className="w-5 h-5" />
                                          </div>
                                          <div className="min-w-0">
                                            <div className="flex items-center gap-2.5 flex-wrap">
                                              <span className="font-bold text-white text-[14px] truncate tracking-tight">{sub.role}</span>
                                              <span className="px-2.5 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase tracking-wider bg-white/5 text-zinc-300 border border-white/10">
                                                Specialist
                                              </span>
                                            </div>
                                            <p className="text-[11.5px] text-zinc-400 font-sans mt-0.5 truncate">
                                              {sub.currentTask || sub.deliverablePreview}
                                            </p>
                                            <div key={isRequesting ? 'req' : isPaying ? 'pay' : isSettled ? 'done' : 'standby'} className="animate-glide text-[12px] text-zinc-300 block truncate font-sans mt-1">
                                              {isRequesting ? (
                                                <span className="text-[#d7ff4f] font-mono flex items-center gap-2 font-medium">
                                                  <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0 text-[#d7ff4f]" />
                                                  <span>Synthesizing creative deliverable...</span>
                                                </span>
                                              ) : isPaying ? (
                                                <span className="text-[#d7ff4f] font-mono flex items-center gap-2 font-bold">
                                                  <Zap className="w-3.5 h-3.5 shrink-0 text-[#d7ff4f] animate-bounce" />
                                                  <span>Checking the payment step...</span>
                                                </span>
                                              ) : isSettled ? (
                                                <span className="text-zinc-300 font-mono flex items-center gap-2">
                                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                                                  <span>{batchTxHash ? 'Delivered:' : 'Result preview:'} <strong className="text-[#d7ff4f] font-medium px-2 py-0.5 rounded bg-[#d7ff4f]/10 border border-[#d7ff4f]/25 text-[11px]">{SUBCONTRACTOR_RESULT_PILLS[sub.id] || sub.deliverablePreview}</strong></span>
                                                </span>
                                              ) : (
                                                <span className="text-zinc-500 font-mono flex items-center gap-2">
                                                  <Clock className="w-3.5 h-3.5 shrink-0 text-zinc-600" />
                                                  <span>Standby • Waiting for: {dependency?.waitingFor || 'Preceding specialist output'}</span>
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-3.5 shrink-0 text-xs self-start sm:self-auto font-mono">
                                          <span className="px-3 py-1 rounded-lg bg-black/40 border border-white/[0.06] text-zinc-400 hidden lg:inline text-[11px]">
                                            ➔ {dependency?.handoffTo || 'Next Specialist'}
                                          </span>
                                          <span className={`px-3.5 py-1.5 rounded-xl border text-xs shadow-inner font-mono font-medium flex items-center gap-1.5 ${
                                            isSettled 
                                              ? 'bg-[#d7ff4f]/10 text-[#d7ff4f] border-[#d7ff4f]/30 font-bold' 
                                              : isBusy 
                                              ? 'bg-[#d7ff4f]/20 text-[#d7ff4f] border-[#d7ff4f]/50 font-bold animate-pulse shadow-[0_0_12px_rgba(215,255,79,0.2)]' 
                                              : 'bg-black/60 text-zinc-400 border-white/[0.06]'
                                          }`}>
                                            {isSettled && <span className="w-1.5 h-1.5 rounded-full bg-[#d7ff4f]" />}
                                            {isBusy && <span className="w-1.5 h-1.5 rounded-full bg-[#d7ff4f] animate-pulse" />}
                                            <span>${sub.costPathUsd.toFixed(4)} USD</span>
                                          </span>
                                        </div>
                                      </div>

                                      {/* LIVE TELEMETRY DRAWER */}
                                      {(isSelected || (isBusy && selectedSubId === sub.id)) && (
                                        <div className="pt-3 border-t border-white/[0.08] bg-black/50 rounded-xl p-3 font-mono text-[11px] space-y-2 border border-white/[0.04] animate-glide">
                                          <div className="flex items-center justify-between text-zinc-400 text-[10px] pb-1.5 border-b border-white/[0.05]">
                                            <div className="flex items-center gap-2">
                                              <span className={`w-1.5 h-1.5 rounded-full ${isBusy ? 'bg-[#d7ff4f] animate-pulse' : isSettled ? 'bg-emerald-400/80' : 'bg-zinc-500'}`} />
                                              <span className="font-bold uppercase tracking-wider text-zinc-300">{batchTxHash ? 'Live' : 'Evaluation'} Execution Telemetry • Node {nodeStr}</span>
                                            </div>
                                            <span className="text-zinc-500">{sub.targetUrl}</span>
                                          </div>

                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10.5px]">
                                            <div className="p-2 rounded bg-black/40 border border-white/[0.04] space-y-1">
                                              <span className="text-zinc-500 font-bold uppercase tracking-wider text-[9.5px] block">Received (Input)</span>
                                              <span className="text-zinc-300 block truncate">{sub.taskInput || `Ingested dependency from ${dependency?.waitingFor || 'Stage 02'}`}</span>
                                            </div>
                                            <div className="p-2 rounded bg-black/40 border border-white/[0.04] space-y-1">
                                              <span className="text-zinc-500 font-bold uppercase tracking-wider text-[9.5px] block">Payment & Resources</span>
                                              <span className="text-zinc-300 block truncate">
                                                {isRequesting ? (
                                                  <span className="text-zinc-300">Synthesizing • Channel Active</span>
                                                ) : isPaying ? (
                                                  <span className="text-zinc-200">Signing EIP-712 • Channel Settlement</span>
                                                ) : isSettled ? (
                                                  <span className="text-zinc-200">{batchTxHash ? 'Channel settled' : 'Payment planned'} • ${sub.costPathUsd.toFixed(4)} USD{batchTxHash ? ' verified' : ''}</span>
                                                ) : (
                                                  <span className="text-zinc-500">Standby Channel (Cap: {selectedPreset.budgetLimit || '$0.0500 cap'})</span>
                                                )}
                                              </span>
                                            </div>
                                          </div>

                                          {isSettled && (
                                            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-zinc-300 text-[10.5px] flex items-center justify-between animate-glide">
                                              <div className="truncate"><strong className="text-white font-medium">{batchTxHash ? 'Output delivered:' : 'Evaluation output:'}</strong> <span className="text-zinc-200 ml-1">{sub.taskOutput || SUBCONTRACTOR_RESULT_PILLS[sub.id] || sub.deliverablePreview}</span></div>
                                              <span className="text-[9.5px] font-mono text-zinc-400 shrink-0 ml-2">➔ Handed to Stage 04</span>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* STAGE 04: 7 PACKAGING & TEMPO NOTARY */}
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between px-2 text-xs text-zinc-400 border-b border-white/[0.08] pb-2.5">
                                <span className="font-bold tracking-wider text-white uppercase flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-[#d7ff4f] shadow-[0_0_8px_#d7ff4f]" />
                                  <span>
                                    {selectedPreset.id === 'swarm_media_creative'
                                      ? 'Stage 04 • Multi-Platform Packaging & Proof Record (7 Units)'
                                      : selectedPreset.id === 'swarm_arbitrage'
                                      ? 'Stage 04 • Payment Plan (1 Unit)'
                                      : 'Stage 04 • Executive Synthesis & Proof Record (7 Units)'}
                                  </span>
                                </span>
                                <span className="px-3 py-1 rounded-lg bg-[#d7ff4f]/10 border border-[#d7ff4f]/25 text-[#d7ff4f] font-mono text-[11px] font-bold shadow-inner">
                                  ${selectedPreset.subcontractors.filter(s => s.waveGroup === 3).reduce((acc, s) => acc + s.costPathUsd, 0).toFixed(4)} USD {batchTxHash ? 'Settled on Tempo L1' : 'planned in evaluation'}
                                </span>
                              </div>

                              <div className="space-y-2">
                                {selectedPreset.subcontractors.filter(s => s.waveGroup === 3).map((sub, idx) => {
                                  const isSettled = settledWorkerIds.has(sub.id);
                                  const isSelected = selectedSubId === sub.id;
                                  const liveState = workerLiveStates[sub.id];
                                  const isRequesting = liveState?.status === 'REQUESTING';
                                  const isPaying = liveState?.status === 'PAYING';
                                  const isBusy = isRequesting || isPaying;
                                  const dependency = NODE_CAUSAL_DEPENDENCY[sub.id];
                                  const isSealUnit = sub.id === 'sub_m19' || sub.id === 'sub_4';
                                  const NodeIcon = getSubcontractorIcon(sub.id);
                                  const phase1Count = selectedPreset.subcontractors.filter(s => s.waveGroup === 1).length;
                                  const phase2Count = selectedPreset.subcontractors.filter(s => s.waveGroup === 2).length;
                                  const nodeNum = idx + 2 + phase1Count + phase2Count;
                                  const nodeStr = nodeNum < 10 ? `0${nodeNum}` : `${nodeNum}`;

                                  return (
                                    <div
                                      key={sub.id}
                                      onClick={() => { soundEngine.playClick(); setSelectedSubId(sub.id); setActiveConsoleTab('inspector'); }}
                                      className={`relative p-4 sm:px-5 sm:py-4 rounded-2xl cursor-pointer flex flex-col gap-3 group luxury-card ${
                                        isSelected
                                          ? 'luxury-card-active'
                                          : isBusy
                                          ? 'border-[#d7ff4f]/70 bg-[#d7ff4f]/[0.05] ring-2 ring-[#d7ff4f]/40 shadow-[0_0_24px_rgba(215,255,79,0.22)] scale-[1.01] z-10'
                                          : ''
                                      }`}
                                    >
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 min-w-0">
                                          <span className="w-7 h-7 rounded-lg bg-white/[.04] border border-white/10 flex items-center justify-center text-[11px] font-mono font-medium text-[#d7ff4f] shrink-0 shadow-sm">{nodeStr}</span>
                                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 p-2.5 transition-all ${
                                            isBusy
                                              ? 'bg-[#d7ff4f]/20 text-[#d7ff4f] border border-[#d7ff4f]/40 shadow-[0_0_12px_rgba(215,255,79,0.3)]'
                                              : isSettled
                                              ? 'bg-[#d7ff4f]/15 text-[#d7ff4f] border border-[#d7ff4f]/30'
                                              : 'bg-white/[0.04] text-zinc-300 border border-white/10'
                                          }`}>
                                            <NodeIcon className="w-5 h-5" />
                                          </div>
                                          <div className="min-w-0">
                                            <div className="flex items-center gap-2.5 flex-wrap">
                                              <span className="font-bold text-white text-[14px] truncate tracking-tight">{sub.role}</span>
                                              {isSealUnit ? (
                                                <span className="text-[8.5px] px-2.5 py-0.5 rounded bg-[#d7ff4f]/15 text-[#d7ff4f] border border-[#d7ff4f]/30 font-mono font-bold">
                                                  CHAIN 42431
                                                </span>
                                              ) : (
                                                <span className="px-2.5 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase tracking-wider bg-[#d7ff4f]/15 text-[#d7ff4f] border border-[#d7ff4f]/30">
                                                  Delivery Unit
                                                </span>
                                              )}
                                            </div>
                                            <p className="text-[11.5px] text-zinc-400 font-sans mt-0.5 truncate">
                                              {sub.currentTask || sub.deliverablePreview}
                                            </p>
                                            <div key={isRequesting ? 'req' : isPaying ? 'pay' : isSettled ? 'done' : 'standby'} className="animate-glide text-[12px] text-zinc-300 block truncate font-sans mt-1">
                                              {isRequesting ? (
                                                <span className="text-[#d7ff4f] font-mono flex items-center gap-2 font-medium">
                                                  <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0 text-[#d7ff4f]" />
                                                  <span>Assembling the final bundle...</span>
                                                </span>
                                              ) : isPaying ? (
                                                <span className="text-[#d7ff4f] font-mono flex items-center gap-2 font-bold">
                                                  <Zap className="w-3.5 h-3.5 shrink-0 text-[#d7ff4f]" />
                                                  <span>Recording the delivery check...</span>
                                                </span>
                                              ) : isSettled ? (
                                                <span className="text-zinc-300 font-mono flex items-center gap-2">
                                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#d7ff4f]" />
                                                  <span>{batchTxHash ? 'Delivered:' : 'Result preview:'} <strong className="text-[#d7ff4f] font-medium px-2 py-0.5 rounded bg-[#d7ff4f]/10 border border-[#d7ff4f]/25 text-[11px]">{SUBCONTRACTOR_RESULT_PILLS[sub.id] || sub.deliverablePreview}</strong></span>
                                                </span>
                                              ) : (
                                                <span className="text-zinc-500 font-mono flex items-center gap-2">
                                                  <Clock className="w-3.5 h-3.5 shrink-0 text-zinc-600" />
                                                  <span>Standby • Waiting for: {dependency?.waitingFor || 'Final package assembly'}</span>
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-3.5 shrink-0 text-xs self-start sm:self-auto font-mono">
                                          <span className="px-3 py-1 rounded-lg bg-black/40 border border-white/[0.06] text-zinc-400 hidden lg:inline text-[11px]">
                                            ➔ {dependency?.handoffTo || 'Mission Result'}
                                          </span>
                                          <span className={`px-3.5 py-1.5 rounded-xl border text-xs shadow-inner font-mono font-medium flex items-center gap-1.5 ${
                                            isSettled 
                                              ? 'bg-[#d7ff4f]/10 text-[#d7ff4f] border-[#d7ff4f]/30 font-bold' 
                                              : isBusy 
                                              ? 'bg-[#d7ff4f]/20 text-[#d7ff4f] border-[#d7ff4f]/50 font-bold animate-pulse shadow-[0_0_12px_rgba(215,255,79,0.2)]' 
                                              : 'bg-black/60 text-zinc-400 border-white/[0.06]'
                                          }`}>
                                            {isSettled && <span className="w-1.5 h-1.5 rounded-full bg-[#d7ff4f]" />}
                                            {isBusy && <span className="w-1.5 h-1.5 rounded-full bg-[#d7ff4f] animate-pulse" />}
                                            <span>${sub.costPathUsd.toFixed(4)} USD</span>
                                          </span>
                                        </div>
                                      </div>

                                      {/* LIVE TELEMETRY DRAWER */}
                                      {(isSelected || (isBusy && selectedSubId === sub.id)) && (
                                        <div className="pt-3 border-t border-white/[0.08] bg-black/50 rounded-xl p-3 font-mono text-[11px] space-y-2 border border-white/[0.04] animate-glide">
                                          <div className="flex items-center justify-between text-zinc-400 text-[10px] pb-1.5 border-b border-white/[0.05]">
                                            <div className="flex items-center gap-2">
                                              <span className={`w-1.5 h-1.5 rounded-full ${isBusy ? 'bg-[#d7ff4f] animate-pulse' : isSettled ? 'bg-emerald-400/80' : 'bg-zinc-500'}`} />
                                              <span className="font-bold uppercase tracking-wider text-zinc-300">{batchTxHash ? 'Live' : 'Evaluation'} Execution Telemetry • Node {nodeStr}</span>
                                            </div>
                                            <span className="text-zinc-500">{sub.targetUrl}</span>
                                          </div>

                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[10.5px]">
                                            <div className="p-2 rounded bg-black/40 border border-white/[0.04] space-y-1">
                                              <span className="text-[#d7ff4f] font-bold uppercase tracking-wider text-[9.5px] block">Purpose / Why Needed</span>
                                              <span className="text-zinc-200 block text-[10.5px] font-sans">{sub.savingsVsSubscription || sub.currentTask}</span>
                                            </div>
                                            <div className="p-2 rounded bg-black/40 border border-white/[0.04] space-y-1">
                                              <span className="text-zinc-400 font-bold uppercase tracking-wider text-[9.5px] block">Received (Input)</span>
                                              <span className="text-zinc-300 block truncate">{sub.taskInput || `Ingested dependency from ${dependency?.waitingFor || 'Stage 03'}`}</span>
                                            </div>
                                            <div className="p-2 rounded bg-black/40 border border-white/[0.04] space-y-1">
                                              <span className="text-zinc-400 font-bold uppercase tracking-wider text-[9.5px] block">Tempo L1 Channel State</span>
                                              <span className="text-zinc-300 block truncate">
                                                {isRequesting ? (
                                                  <span className="text-zinc-300">Packaging bundle • Pre-signing</span>
                                                ) : isPaying ? (
                                                  <span className="text-zinc-200">Sealing Merkle Digest • EIP-712 Finalized</span>
                                                ) : isSettled ? (
                                              <span className="text-zinc-200">{batchTxHash ? 'Settled' : 'Planned'} • ${sub.costPathUsd.toFixed(4)} USD{batchTxHash ? ' verified' : ''}</span>
                                                ) : (
                                                  <span className="text-zinc-500">Standby Channel (Cap: {selectedPreset.budgetLimit || '$0.0500 cap'})</span>
                                                )}
                                              </span>
                                            </div>
                                          </div>

                                          {isSettled && (
                                            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-zinc-300 text-[10.5px] flex items-center justify-between animate-glide">
                                              <div className="truncate"><strong className="text-white font-medium">{batchTxHash ? 'Output delivered:' : 'Evaluation output:'}</strong> <span className="text-zinc-200 ml-1">{sub.taskOutput || SUBCONTRACTOR_RESULT_PILLS[sub.id] || sub.deliverablePreview}</span></div>
                                              <span className="text-[9.5px] font-mono text-zinc-400 shrink-0 ml-2">➔ Final Package Locked</span>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                          </div>

                          {/* ==================== DELIVERABLES ACTION DECK ==================== */}
                          <div className="p-5 sm:p-6 rounded-2xl luxury-card border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                                  {settledWorkerIds.size === selectedPreset.subcontractors.length && settledWorkerIds.size > 0 
                                    ? 'Client Deliverables Ready for Deployment' 
                                    : 'Live Campaign Package Deployment Bar'}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-300 font-sans">
                                20 deliverables generated • Total spend: <strong className="text-white font-mono font-bold">${Array.from(settledWorkerIds).reduce<number>((acc, id) => acc + (selectedPreset.subcontractors.find(x => x.id === id)?.costPathUsd || 0), 0).toFixed(4)} USD</strong> (51% saved under $0.0500 limit).
                              </p>
                            </div>

                            <div className="flex items-center gap-2.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => {
                                  soundEngine.playClick();
                                  copyToClipboard(
                                    JSON.stringify({
                                      mission: selectedPreset.title,
                                      spentUsd: 0.0245,
                                      deliverables: 20,
                                      status: 'COMPLETED_ON_TEMPO_L1',
                                      network: 'Tempo Moderato (Chain 42431)',
                                      contractVault: '0x3c42E274FAdd8e371fB84f97203CC2F2125c8775',
                                    }, null, 2),
                                    'pkg_download'
                                  );
                                }}
                                className="px-4 py-2 rounded-xl bg-[#d7ff4f] hover:bg-[#cbf540] text-[#08090c] font-bold text-xs font-mono transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{copiedKey === 'pkg_download' ? '✓ Copied Package ZIP' : 'Download Package (.zip)'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  soundEngine.playClick();
                                  copyToClipboard(
                                    `CAMPAIGN HOOKS (5 LANGUAGES):\n1. EN: Stop burning $3,500/mo on unused agency retainers.\n2. ES: Deja de gastar $3,500/mes en suscripciones inactivas.\n3. DE: Stoppen Sie die Verschwendung von $3.500/Monat für ungenutzte Abos.\n4. FR: Arrêtez de gaspiller 3 500 $/mois en abonnements inutilisés.\n5. JA: 未使用の月額サブスクリプションに月額3,500ドルを無駄にするのをやめましょう。`,
                                    'scripts_copy'
                                  );
                                }}
                                className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white font-mono text-xs transition cursor-pointer flex items-center gap-1.5"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span>{copiedKey === 'scripts_copy' ? '✓ Scripts Copied' : 'Copy Scripts'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const targetWorker = selectedPreset.subcontractors.find(x => settledWorkerIds.has(x.id)) || selectedPreset.subcontractors[0];
                                  if (targetWorker) inspectWorkerCryptoProof(targetWorker);
                                }}
                                className="px-3.5 py-2 rounded-xl bg-[#d7ff4f]/15 hover:bg-[#d7ff4f]/25 border border-[#d7ff4f]/40 text-[#d7ff4f] hover:text-white font-mono text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(215,255,79,0.15)] active:scale-95"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 text-[#d7ff4f]" />
                                <span>Inspect Payment Proof</span>
                              </button>
                            </div>
                          </div>

                          {/* Causality Rule Banner */}
                          <div className="p-3.5 rounded-xl luxury-card border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
                            <div className="flex items-center gap-2.5 text-zinc-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#d7ff4f]" />
                              <span><strong className="text-white">Causality Rule:</strong> Money moves only when an agent needs an approved resource. The cap is checked before each step; a live wallet is required for an on-chain receipt.</span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-zinc-400">{batchTxHash ? 'Total spent' : 'Planned cost'}: <strong className="text-white font-bold">${Array.from(settledWorkerIds).reduce<number>((acc, id) => acc + (selectedPreset.subcontractors.find(x => x.id === id)?.costPathUsd || 0), 0).toFixed(4)}</strong> / {selectedPreset.budgetLimit || '$0.0500 USD'}</span>
                            </div>
                          </div>

                        </div>
                      </div>
                    ) : swarmViewMode === 'topology' ? (
                      <div className="space-y-4">
                        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#090d14] to-[#06080c] border border-white/10 shadow-2xl relative overflow-hidden">
                          {/* Ambient background glow grid */}
                          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#d7ff4f]/[0.03] via-transparent to-transparent pointer-events-none" />

                          {/* 1. TOP LEVEL: UNIT 01 MISSION LEAD AGENT */}
                          <div className="flex flex-col items-center justify-center relative z-10 mb-5">
                            <div
                              onClick={() => {
                                soundEngine.playClick();
                                setSelectedSubId('lead_orchestrator');
                                setActiveConsoleTab('inspector');
                              }}
                              className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer max-w-xl w-full text-center relative group ${
                                selectedSubId === 'lead_orchestrator'
                                  ? 'bg-[#0f121a] border-white/10 ring-2 ring-[#d7ff4f]/50 shadow-[0_0_30px_rgba(215,255,79,0.2)]'
                                  : isLeadActive
                                  ? 'bg-[#d7ff4f]/[0.08] border-[#d7ff4f] ring-2 ring-[#d7ff4f]/50 shadow-[0_0_35px_rgba(215,255,79,0.3)] animate-pulse'
                                  : isLeadSettled
                                  ? 'bg-emerald-950/[0.25] border-emerald-500/40 hover:border-emerald-400/60'
                                  : 'bg-white/[0.03] border-white/15 hover:border-white/30'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] pb-2.5 mb-2.5">
                                <span className="px-2.5 py-0.5 rounded-md bg-[#d7ff4f]/15 text-[#d7ff4f] border border-[#d7ff4f]/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                                  <Bot className="w-3.5 h-3.5" />
                                  {selectedPreset.id === 'swarm_media_creative' ? 'CAMPAIGN DIRECTOR' : selectedPreset.id === 'swarm_arbitrage' ? 'LEAD MARKET REVIEWER' : 'LEAD AGENT'}
                                </span>
                                <span className="text-[11px] font-mono text-zinc-300">
                                  Budget: <strong className="text-[#d7ff4f]">{selectedPreset.budgetLimit || '$0.0500 policy cap'}</strong>
                                </span>
                              </div>
                              <div className="flex items-center justify-center gap-3 py-1">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                                  isLeadSettled ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : isLeadActive ? 'bg-[#d7ff4f]/20 text-[#d7ff4f] border-[#d7ff4f]/50' : 'bg-white/[0.05] text-white border-white/10'
                                }`}>
                                  <Bot className="w-6 h-6" />
                                </div>
                                <div className="text-left min-w-0">
                                  <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                                    {selectedPreset.id === 'swarm_media_creative' 
                                      ? 'Campaign Director (Unit 01 • Lead AI)' 
                                      : selectedPreset.id === 'swarm_arbitrage'
                                      ? 'Lead Market Comparison Director (Unit 01)'
                                      : 'Lead Orchestrator (Unit 01 • Lead Agent)'}
                                  </h3>
                                  <p className="text-xs text-zinc-300 font-sans mt-0.5">
                                    {selectedPreset.id === 'swarm_media_creative'
                                      ? 'Coordinates 12 workers and 7 providers, enforces $0.050 budget cap, and directs ad campaign'
                                      : selectedPreset.id === 'swarm_arbitrage'
                                      ? 'Reviews 2 sample market inputs, models spread risk, and prepares a comparison report'
                                      : 'Coordinates 19 units, enforces the $0.030 cap, and prepares a supplier review'}
                                  </p>
                                  <div className="flex items-center gap-1.5 text-[11px] font-mono mt-2 flex-wrap">
                                    {selectedPreset.id === 'swarm_media_creative' ? (
                                      <>
                                        <span className={`px-2 py-0.5 rounded text-[10px] ${activeStageNum === 0 && isExecuting ? 'bg-[#d7ff4f]/20 text-[#d7ff4f] font-bold border border-[#d7ff4f]/40' : 'bg-white/[0.04] text-zinc-400'}`}>1. Plan Mission</span>
                                        <span className="text-zinc-600">&rarr;</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] ${activeStageNum === 1 && isExecuting ? 'bg-[#d7ff4f]/20 text-[#d7ff4f] font-bold border border-[#d7ff4f]/40' : 'bg-white/[0.04] text-zinc-400'}`}>2. Media Feeds</span>
                                        <span className="text-zinc-600">&rarr;</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] ${activeStageNum === 2 && isExecuting ? 'bg-[#d7ff4f]/20 text-[#d7ff4f] font-bold border border-[#d7ff4f]/40' : 'bg-white/[0.04] text-zinc-400'}`}>3. Creatives</span>
                                        <span className="text-zinc-600">&rarr;</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] ${activeStageNum === 3 && isExecuting ? 'bg-[#d7ff4f]/20 text-[#d7ff4f] font-bold border border-[#d7ff4f]/40' : 'bg-white/[0.04] text-zinc-400'}`}>4. Package Bundle</span>
                                      </>
                                    ) : selectedPreset.id === 'swarm_arbitrage' ? (
                                      <>
                                        <span className={`px-2 py-0.5 rounded text-[10px] ${activeStageNum === 0 && isExecuting ? 'bg-[#d7ff4f]/20 text-[#d7ff4f] font-bold border border-[#d7ff4f]/40' : 'bg-white/[0.04] text-zinc-400'}`}>1. Plan Comparison</span>
                                        <span className="text-zinc-600">&rarr;</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] ${activeStageNum === 1 && isExecuting ? 'bg-[#d7ff4f]/20 text-[#d7ff4f] font-bold border border-[#d7ff4f]/40' : 'bg-white/[0.04] text-zinc-400'}`}>2. Depth Feeds</span>
                                        <span className="text-zinc-600">&rarr;</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] ${activeStageNum === 2 && isExecuting ? 'bg-[#d7ff4f]/20 text-[#d7ff4f] font-bold border border-[#d7ff4f]/40' : 'bg-white/[0.04] text-zinc-400'}`}>3. Prepare Report</span>
                                      </>
                                    ) : (
                                      <>
                                        <span className={`px-2 py-0.5 rounded text-[10px] ${activeStageNum === 0 && isExecuting ? 'bg-[#d7ff4f]/20 text-[#d7ff4f] font-bold border border-[#d7ff4f]/40' : 'bg-white/[0.04] text-zinc-400'}`}>1. Plan Mission</span>
                                        <span className="text-zinc-600">&rarr;</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] ${activeStageNum === 1 && isExecuting ? 'bg-[#d7ff4f]/20 text-[#d7ff4f] font-bold border border-[#d7ff4f]/40' : 'bg-white/[0.04] text-zinc-400'}`}>2. Query 7 Feeds</span>
                                        <span className="text-zinc-600">&rarr;</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] ${activeStageNum === 2 && isExecuting ? 'bg-[#d7ff4f]/20 text-[#d7ff4f] font-bold border border-[#d7ff4f]/40' : 'bg-white/[0.04] text-zinc-400'}`}>3. 5 Risk Audits</span>
                                        <span className="text-zinc-600">&rarr;</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] ${activeStageNum === 3 && isExecuting ? 'bg-[#d7ff4f]/20 text-[#d7ff4f] font-bold border border-[#d7ff4f]/40' : 'bg-white/[0.04] text-zinc-400'}`}>4. Sign Decision</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2.5 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-400">
                                <span>Status: <strong className={isLeadSettled ? 'text-emerald-400 font-bold' : isLeadActive ? 'text-[#d7ff4f] font-bold' : 'text-zinc-300'}>
                                  {isLeadSettled 
                                    ? (batchTxHash
                                      ? (selectedPreset.id === 'swarm_media_creative' ? '✓ Campaign Ready (Brand & Policy Approved)' : selectedPreset.id === 'swarm_arbitrage' ? '✓ Market Report Ready' : '✓ Supplier Review Ready (Evaluation)')
                                      : '✓ Evaluation result ready')
                                    : isLeadActive 
                                    ? '⚡ Coordinating Workforce...' 
                                    : 'Standing by — Ready to Run'}
                                </strong></span>
                                <span className="text-[10px] text-zinc-400">
                                  {selectedPreset.subcontractors.length === 20 ? '12 Workers · 7 Providers Active' : `${selectedPreset.subcontractors.length - 1} Units Active`}
                                </span>
                              </div>
                            </div>

                            {/* Animated SVG Conduits radiating down */}
                            <div className="w-full max-w-4xl h-8 flex items-center justify-center relative">
                              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 32">
                                <defs>
                                  <linearGradient id="conduitGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#d7ff4f" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                                  </linearGradient>
                                </defs>
                                <path
                                  d="M 400 0 L 400 16 M 400 16 L 150 16 L 150 32 M 400 16 L 400 32 M 400 16 L 650 16 L 650 32"
                                  fill="none"
                                  stroke={isExecuting ? 'url(#conduitGlow)' : '#ffffff20'}
                                  strokeWidth={isExecuting ? "3" : "2"}
                                  strokeDasharray={isExecuting ? "6 6" : "none"}
                                  className={isExecuting ? "animate-pulse" : ""}
                                />
                                {isExecuting && (
                                  <>
                                    <circle r="4" fill="#d7ff4f">
                                      <animateMotion path="M 400 0 L 400 16 L 150 16 L 150 32" dur="1.2s" repeatCount="indefinite" />
                                    </circle>
                                    <circle r="4" fill="#10b981">
                                      <animateMotion path="M 400 0 L 400 16 L 400 32" dur="0.9s" repeatCount="indefinite" />
                                    </circle>
                                    <circle r="4" fill="#d7ff4f">
                                      <animateMotion path="M 400 0 L 400 16 L 650 16 L 650 32" dur="1.3s" repeatCount="indefinite" />
                                    </circle>
                                  </>
                                )}
                              </svg>
                            </div>
                          </div>

                          {/* 2. 3 PHASE COLUMNS IN TOPOLOGY MAP */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 relative z-10">
                            {STAGE_CONFIGS.map((stageCfg) => {
                              const stageSubs = selectedPreset.subcontractors.filter((s) => s.waveGroup === stageCfg.stageNum);
                              const isStageActive = isExecuting && activeStageNum === stageCfg.stageNum;
                              const allStageSettled = stageSubs.length > 0 && stageSubs.every((s) => settledWorkerIds.has(s.id));
                              const stageCostTotal = stageSubs.reduce((acc, s) => acc + s.costPathUsd, 0).toFixed(4);

                              return (
                                <div
                                  key={stageCfg.stageNum}
                                  className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex flex-col h-full ${
                                    isStageActive
                                      ? 'bg-white/[0.04] border-[#d7ff4f]/60 ring-2 ring-[#d7ff4f]/30 shadow-[0_0_30px_rgba(215,255,79,0.1)]'
                                      : allStageSettled
                                      ? 'bg-white/[0.03] border-emerald-500/30 shadow-lg'
                                      : 'bg-white/[0.025] border-white/[0.08]'
                                  }`}
                                >
                                  {/* Phase Hub Header */}
                                  <div className="border-b border-white/[0.08] pb-3 space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <span className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase shrink-0 ${
                                          isStageActive
                                            ? 'bg-[#d7ff4f]/20 text-[#d7ff4f] border border-[#d7ff4f]/40 animate-pulse'
                                            : allStageSettled
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : 'bg-white/[0.05] text-zinc-400 border border-white/10'
                                        }`}>
                                          PHASE 0{stageCfg.stageNum}
                                        </span>
                                        <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                                          {stageCfg.title}
                                        </span>
                                      </div>
                                      <span className="text-[10.5px] font-mono text-zinc-200 font-bold px-2.5 py-0.5 rounded bg-black/60 border border-white/10 shrink-0">
                                        ${stageCostTotal} USD
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-zinc-400 font-sans">
                                      {stageCfg.subtitle}
                                    </p>
                                  </div>

                                  {/* Node Chips inside Phase (Top-Aligned) */}
                                  <div className="space-y-2 flex-1 mt-3">
                                    {stageSubs.map((sub) => {
                                      const isSettled = settledWorkerIds.has(sub.id);
                                      const isSelected = selectedSubId === sub.id;
                                      const liveState = workerLiveStates[sub.id];
                                      const isRequesting = liveState?.status === 'REQUESTING';
                                      const isPaying = liveState?.status === 'PAYING';
                                      const isBusy = isRequesting || isPaying;
                                      const isProvider = sub.nodeType === 'PROVIDER';
                                      const NodeIcon = getSubcontractorIcon(sub.id);

                                       {/* Familiar display title: source name for providers, specialist role for workers */}
                                       const displayName = isProvider ? (sub.shortName || sub.role) : sub.role;
                                       const rawResult = sub.verifiedBadge || SUBCONTRACTOR_RESULT_PILLS[sub.id] || sub.deliverablePreview;
                                       const displaySecondary = isSettled
                                         ? (rawResult.startsWith('✓') ? rawResult : `✓ ${rawResult}`)
                                         : isBusy
                                         ? (liveState?.displayNote || sub.workingAction)
                                         : (NODE_HUMAN_JOBS[sub.id] || sub.deliverablePreview);

                                      return (
                                        <div
                                          key={sub.id}
                                          onClick={() => {
                                            soundEngine.playClick();
                                            setSelectedSubId(sub.id);
                                            setActiveConsoleTab('inspector');
                                          }}
                                          className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 text-xs font-mono group ${
                                            isSelected
                                              ? 'bg-white/[0.09] border-[#d7ff4f]/70 ring-1 ring-[#d7ff4f]/40 shadow-lg'
                                              : isBusy
                                              ? 'bg-[#d7ff4f]/[0.08] border-[#d7ff4f] ring-1 ring-[#d7ff4f]/40 shadow-[0_0_20px_rgba(215,255,79,0.18)]'
                                              : isSettled
                                              ? 'bg-white/[0.03] border-emerald-500/25 hover:border-emerald-400/40 hover:bg-white/[0.05]'
                                              : 'bg-white/[0.02] hover:bg-white/[0.04] border-white/[0.08] hover:border-white/20'
                                          }`}
                                        >
                                          <div className="flex items-center gap-2.5 min-w-0">
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                                              isSettled
                                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                                : isBusy
                                                ? 'bg-[#d7ff4f]/20 border-[#d7ff4f]/40 text-[#d7ff4f]'
                                                : isProvider
                                                ? 'bg-white/5 border-white/10 text-[#d7ff4f]'
                                                : 'bg-white/5 border-white/10 text-zinc-200'
                                            }`}>
                                              <NodeIcon className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="min-w-0">
                                              <span className="text-xs font-bold text-white block truncate leading-tight tracking-tight">
                                                {displayName}
                                              </span>
                                              <span className={`text-[10px] font-sans block truncate mt-0.5 ${
                                                isSettled ? 'text-zinc-300' : isBusy ? 'text-[#d7ff4f]' : 'text-zinc-400'
                                              }`}>
                                                {displaySecondary}
                                              </span>
                                            </div>
                                          </div>

                                          <div className="text-right shrink-0 flex items-center">
                                            <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border block ${
                                              isSettled
                                                ? 'bg-black/60 border-white/10 text-zinc-200'
                                                : isBusy
                                                ? 'bg-[#d7ff4f]/15 border-[#d7ff4f]/40 text-[#d7ff4f]'
                                                : 'bg-black/40 border-white/[0.06] text-zinc-400'
                                            }`}>
                                              ${sub.costPathUsd.toFixed(4)}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}

                                    {/* Phase 2 Balancing: Live Quantitative Solvency Engine Widget (Due Diligence only) */}
                                    {stageCfg.stageNum === 2 && selectedPreset.id === 'swarm_20_autonomous' && (
                                      <div className="p-3 rounded-xl bg-[#090b10] border border-white/10 mt-2 space-y-2 font-mono">
                                        <div className="flex items-center justify-between text-[11px]">
                                          <div className="flex items-center gap-1.5 text-zinc-300 font-bold">
                                            <Activity className="w-3.5 h-3.5 text-zinc-200" />
                                            <span>Monte Carlo Solvency Engine</span>
                                          </div>
                                          <span className="text-[9.5px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                                            Example model
                                          </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-[10px] pt-1.5 border-t border-white/[0.06]">
                                          <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04]">
                                            <span className="text-zinc-500 block text-[9px] uppercase font-semibold">Default Risk</span>
                                            <span className="text-emerald-400 font-bold">0.04% (example)</span>
                                          </div>
                                          <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04]">
                                            <span className="text-zinc-500 block text-[9px] uppercase font-semibold">Solvency Score</span>
                                            <span className="text-white font-bold">4.12 / 5.00 (example)</span>
                                          </div>
                                        </div>
                                        <div className="text-[9.5px] text-zinc-400 font-sans leading-relaxed">
                                          Example risk model with 10,000 simulated cycles. Review the assumptions before relying on the score.
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Phase Footer Status */}
                                  <div className="pt-2.5 mt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-zinc-400">
                                    <span>{stageSubs.length} Autonomous Nodes</span>
                                    <span className={allStageSettled ? 'text-emerald-400 font-bold' : isStageActive ? 'text-[#d7ff4f] font-bold animate-pulse' : 'text-zinc-500'}>
                                      {allStageSettled ? (batchTxHash ? '✓ All Delivered' : '✓ Results prepared') : isStageActive ? '⚡ In Flight' : 'Standby'}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* UNIT 01: MISSION LEAD AGENT (GRID MODE) */}
                        <div
                          id="stage-block-0"
                          onClick={() => {
                            soundEngine.playClick();
                            setSelectedSubId('lead_orchestrator');
                            setActiveConsoleTab('inspector');
                          }}
                          className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                            selectedSubId === 'lead_orchestrator'
                              ? 'bg-white/5 border-white/10 ring-2 ring-[#d7ff4f]/40 shadow-lg'
                              : isLeadActive
                              ? 'bg-[#d7ff4f]/[0.08] border-[#d7ff4f] ring-2 ring-[#d7ff4f]/40 shadow-[0_0_25px_rgba(215,255,79,0.2)]'
                              : isLeadSettled
                              ? 'bg-emerald-950/[0.15] border-emerald-500/30 hover:border-emerald-500/50'
                              : 'bg-white/[0.025] border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold font-mono text-xs ${
                                isLeadSettled
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : isLeadActive
                                  ? 'bg-[#d7ff4f]/20 text-[#d7ff4f] border border-[#d7ff4f]/40 animate-pulse'
                                  : 'bg-white/5 text-zinc-300 border border-white/10'
                              }`}>
                                01
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-2 py-0.5 rounded bg-[#d7ff4f]/15 text-[#d7ff4f] border border-[#d7ff4f]/30 text-[9.5px] font-mono font-bold uppercase tracking-wider">
                                    LEAD AGENT (UNIT 01 • CAMPAIGN DIRECTOR)
                                  </span>
                                  <span className="text-xs sm:text-sm font-bold text-white font-mono">
                                    {selectedPreset.id === 'swarm_media_creative' ? 'Direct Multi-Platform Ad Campaign Launch' : selectedPreset.id === 'swarm_arbitrage' ? 'Compare Market Snapshots' : 'Investigate Apex Foundry before contract approval'}
                                  </span>
                                </div>
                                <p className="text-[11px] text-zinc-300 font-sans mt-0.5">
                                  {selectedPreset.id === 'swarm_media_creative' ? 'Coordinates 12 workers and 7 providers, enforces $0.050 budget cap, and delivers full ad package' : selectedPreset.id === 'swarm_arbitrage' ? 'Coordinates 4 units and 2 sample feeds, enforces the $0.010 cap, and prepares a market report' : 'Plans mission, coordinates 19 units, manages $0.030 budget, and approves final contract'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                              <span className="px-2.5 py-1 rounded bg-black/50 border border-white/10 text-zinc-300 text-[11px] font-mono">
                                {batchTxHash ? 'Spent' : 'Planned'}: <strong className="text-[#d7ff4f]">${plannedCostUsd.toFixed(4)} USD</strong> / {selectedPreset.budgetLimit || '$0.0500 policy cap'}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                isLeadSettled
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : isLeadActive
                                  ? 'bg-[#d7ff4f]/20 text-[#d7ff4f] border border-[#d7ff4f]/40 animate-pulse'
                                  : 'bg-white/5 text-zinc-400 border border-white/10'
                              }`}>
                                {isLeadSettled ? (batchTxHash ? (selectedPreset.id === 'swarm_media_creative' ? '✓ Campaign Ready to Launch' : selectedPreset.id === 'swarm_arbitrage' ? '✓ Market Report Ready' : '✓ Supplier Review Ready (94/100)') : '✓ Evaluation result ready') : isLeadActive ? '⚡ Coordinating Workforce...' : 'Ready to Direct'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <details className="group mt-4 rounded-2xl border border-white/[.08] bg-white/[.02]">
                          <summary className="list-none cursor-pointer px-4 py-3 flex items-center justify-between gap-3 text-xs font-mono text-zinc-300 hover:text-white transition">
                            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-zinc-500" /><strong>View 3 phases</strong><span className="text-zinc-500">{selectedPreset.subcontractors.length} units</span></span>
                            <ChevronDown className="w-4 h-4 text-zinc-400 transition-transform group-open:rotate-180" />
                          </summary>
                          <div className="p-3 sm:p-4 border-t border-white/[.06]">
                            {stageElements}
                          </div>
                        </details>
                      </>
                    )}

                    {/* DYNAMIC RESULT CENTER (STANDBY & EXECUTING / CLIMAX DASHBOARD) */}
                    {settledWorkerIds.size === selectedPreset.subcontractors.length && settledWorkerIds.size > 0 && (
                      <div id="swarm-big-result-block" className="p-6 sm:p-8 rounded-3xl bg-white/[.03] backdrop-blur-md border border-white/[.08] text-center space-y-6 shadow-sm animate-fade-in">
                        {/* Header Climax */}
                        <div className="space-y-3">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d7ff4f]/10 border border-[#d7ff4f]/30 text-[#d7ff4f] text-[10px] font-mono font-bold uppercase tracking-widest">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{batchTxHash ? 'Mission complete · payments confirmed' : 'Mission flow complete · payment trace pending'}</span>
                          </div>
                          
                          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                            {selectedPreset.id === 'swarm_media_creative'
                              ? 'Ad Campaign is Ready to Launch'
                              : selectedPreset.id === 'swarm_arbitrage'
                              ? 'Market Comparison Complete'
                              : 'Supplier Clearance Dossier Ready for Review'}
                          </h2>
                          
                          <p className="text-xs text-zinc-400 font-mono max-w-xl mx-auto leading-relaxed">
                            {selectedPreset.id === 'swarm_media_creative'
                              ? `1 Lead Agent coordinated 12 workers and 7 providers. Campaign flow completed in ${actualExecutionTimeSec}s for $0.0245 under the $0.0500 budget.`
                              : selectedPreset.id === 'swarm_arbitrage'
                              ? `1 Lead Agent coordinated 2 workers and sample market inputs. Market analysis flow completed in ${actualExecutionTimeSec}s for $0.0060 under $0.0100 budget.`
                              : `1 Lead Agent coordinated 12 workers and 7 example registry inputs. Clearance flow completed in ${actualExecutionTimeSec}s for $0.0270 under $0.0300 budget.`}
                          </p>
                        </div>

                        {/* 4 Stat Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto pt-4 border-t border-white/10 font-mono text-left">
                          <div className="p-4 rounded-xl bg-white/[.035] border border-white/10 space-y-1">
                            <span className="text-[10px] uppercase text-zinc-400 font-bold block">TOTAL SPENT</span>
                            <span className="text-2xl font-black text-white block">
                              ${selectedPreset.subcontractors.reduce((acc, s) => acc + s.costPathUsd, 0).toFixed(4)}
                            </span>
                            <span className="text-[10.5px] text-zinc-400 block truncate">
                              {selectedPreset.id === 'swarm_media_creative' 
                                ? '$0.0245 spent · $0.0255 unused' 
                                : selectedPreset.id === 'swarm_arbitrage'
                                ? '$0.0060 spent · $0.0040 unused'
                                : '$0.0270 spent · $0.0030 unused'}
                            </span>
                          </div>
                          <div className="p-4 rounded-xl bg-white/[.035] border border-white/10 space-y-1">
                            <span className="text-[10px] uppercase text-zinc-400 font-bold block">WORKFORCE</span>
                            <span className="text-2xl font-black text-white block">
                              {selectedPreset.subcontractors.length}
                            </span>
                            <span className="text-[10.5px] text-zinc-400 block truncate">
                              {selectedPreset.subcontractors.length === 20 ? '1 Lead · 12 Workers · 7 Providers' : `${selectedPreset.subcontractors.length} Participants`}
                            </span>
                          </div>
                          <div className="p-4 rounded-xl bg-white/[.035] border border-white/10 space-y-1">
                            <span className="text-[10px] uppercase text-zinc-400 font-bold block tracking-wider">PAYMENT ACTIONS</span>
                            <span className="text-2xl font-black text-white block">
                              {selectedPreset.subcontractors.length === 20 ? '19' : `${selectedPreset.subcontractors.length - 1}`}
                              <span className="text-xs font-normal text-zinc-400 ml-1.5 font-mono">actions · {batchTxHash ? '1 L1 settlement' : 'settlement trace pending'}</span>
                            </span>
                            <span className="text-[10.5px] text-zinc-400 block truncate">
                              {selectedPreset.subcontractors.length === 20 ? '7 Provider Purchases · 12 Worker Payments' : 'Direct Micro-Services'}
                            </span>
                          </div>
                          <div className="p-4 rounded-xl bg-white/[.035] border border-white/10 space-y-1">
                            <span className="text-[10px] uppercase text-zinc-400 font-bold block">BUDGET STATUS</span>
                            <span className="text-2xl font-black text-[#d7ff4f] block">
                              ${remainingBudgetUsd.toFixed(4)}
                              <span className="text-xs font-normal text-zinc-400 ml-1.5 font-mono">remaining</span>
                            </span>
                            <span className="text-[10.5px] text-zinc-400 block truncate">
                              ${plannedCostUsd.toFixed(4)} planned ({plannedBudgetPercent}% of {selectedPreset.budgetLimit || '$0.0500'} cap)
                            </span>
                          </div>
                        </div>

                        {/* 2. ON-CHAIN SETTLEMENT VAULT & PROOF LEDGER */}
                        <div className="pt-2 max-w-4xl mx-auto text-left space-y-4">
                          <div className="p-5 sm:p-6 rounded-2xl bg-[#171c22] border border-white/10 shadow-sm space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#d7ff4f]/20 pb-4">
                              <div className="flex items-center gap-3">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider bg-[#d7ff4f]/15 text-[#d7ff4f] border border-[#d7ff4f]/30">
                                      {batchTxHash ? 'PAYMENT CONFIRMED' : 'BUDGET PROTECTED'}
                                    </span>
                                    <span className="text-xs text-zinc-400 font-mono flex items-center gap-1.5">
                                      <span className={`w-1.5 h-1.5 rounded-full ${batchTxHash ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
                                      {batchTxHash ? 'Receipt ready' : 'Evaluation result · no live payment'}
                                    </span>
                                  </div>
                                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight mt-1 flex items-center gap-2">
                                    <span>{batchTxHash ? 'Payment completed' : 'Payment plan ready'}</span>
                                    <span className="text-[#d7ff4f] font-mono">
                                      (${selectedPreset.subcontractors.reduce((acc, s) => acc + s.costPathUsd, 0).toFixed(4)} USD)
                                    </span>
                                  </h3>
                                </div>
                              </div>

                              {batchTxHash && (
                                <a href={`https://explore.tempo.xyz/tx/${batchTxHash}`} target="_blank" rel="noopener noreferrer" className="px-3.5 py-2 rounded-xl bg-[#d7ff4f]/15 hover:bg-[#d7ff4f]/25 border border-[#d7ff4f]/35 text-[#d7ff4f] font-bold text-xs transition flex items-center gap-1.5 active:scale-95">
                                  <span>View receipt</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>

                            {/* Crisp Reality Statement */}
                            <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
                              {batchTxHash ? (
                                <>The approved work steps were paid and a receipt is ready to review.</>
                              ) : (
                                <>The evaluation plan stayed within the budget. No live payment was sent.</>
                              )}
                            </p>

                            <div className="px-3.5 py-3 rounded-xl bg-white/[.035] border border-white/10 text-xs text-zinc-300">
                              <span className="text-zinc-500 uppercase text-[10px] font-bold mr-2">Status</span>
                              <strong className={batchTxHash ? 'text-emerald-400' : 'text-zinc-300'}>{batchTxHash ? 'Payment confirmed' : 'Evaluation only · no live payment'}</strong>
                            </div>

                            {/* Optional technical detail: keep the main result readable first. */}
                            <details className="group pt-2">
                              <summary className="list-none cursor-pointer flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[.025] px-3.5 py-3 text-xs font-mono text-zinc-300 hover:border-[#d7ff4f]/30 transition">
                                <span className="flex items-center gap-2">
                                  <Coins className="w-3.5 h-3.5 text-[#d7ff4f]" />
                                  <span className="font-bold">View payment steps ({selectedPreset.subcontractors.filter(s => s.costPathUsd > 0).length})</span>
                                  <span className="text-zinc-500 hidden sm:inline">Optional technical details</span>
                                </span>
                                <ChevronDown className="w-4 h-4 text-zinc-400 transition-transform group-open:rotate-180" />
                              </summary>
                              <div className="mt-3 space-y-2.5">
                              <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
                                <span className="text-[11px] font-bold uppercase text-zinc-300 flex items-center gap-1.5">
                                  <Coins className="w-3.5 h-3.5 text-[#d7ff4f]" />
                                  <span>Cryptographic Settlement Ledger ({selectedPreset.subcontractors.filter(s => s.costPathUsd > 0).length} Micro-Transactions)</span>
                                </span>
                                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/[.035] border border-white/10 text-[10.5px]">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedLedgerFilter('all')}
                                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                                      selectedLedgerFilter === 'all'
                                        ? 'bg-[#d7ff4f] text-[#08090c] font-bold'
                                        : 'text-zinc-400 hover:text-white'
                                    }`}
                                  >
                                    All ({selectedPreset.subcontractors.filter(s => s.costPathUsd > 0).length})
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedLedgerFilter('providers')}
                                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                                      selectedLedgerFilter === 'providers'
                                        ? 'bg-[#d7ff4f] text-[#08090c] font-bold'
                                        : 'text-zinc-400 hover:text-white'
                                    }`}
                                  >
                                    Providers ({selectedPreset.subcontractors.filter(s => s.nodeType === 'PROVIDER').length})
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedLedgerFilter('workers')}
                                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                                      selectedLedgerFilter === 'workers'
                                        ? 'bg-[#d7ff4f] text-[#08090c] font-bold'
                                        : 'text-zinc-400 hover:text-white'
                                    }`}
                                  >
                                    Specialists ({selectedPreset.subcontractors.filter(s => s.nodeType === 'WORKER').length})
                                  </button>
                                </div>
                              </div>

                              {/* Scrollable Micro-Transactions Table */}
                              <div className="max-h-[260px] overflow-y-auto pr-1 space-y-1.5 [scrollbar-width:thin] [scrollbar-color:rgba(215,255,79,0.3)_transparent]">
                                {selectedPreset.subcontractors
                                  .filter(s => s.costPathUsd > 0)
                                  .filter(s => {
                                    if (selectedLedgerFilter === 'providers') return s.nodeType === 'PROVIDER';
                                    if (selectedLedgerFilter === 'workers') return s.nodeType === 'WORKER';
                                    return true;
                                  })
                                  .map((sub, idx) => {
                                    const workerAddr = getWorkerWalletAddress(sub.id);
                                    return (
                                      <div
                                        key={sub.id}
                                        className="p-2.5 rounded-xl bg-white/[.025] border border-white/[0.08] hover:border-[#d7ff4f]/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                                      >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                          <span className="w-5 h-5 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-zinc-400 shrink-0">
                                            {(idx + 1).toString().padStart(2, '0')}
                                          </span>
                                          <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                              <span className="font-bold text-white truncate">{sub.role}</span>
                                               <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase bg-white/5 text-zinc-300 border border-white/10">
                                                 {sub.nodeType === 'PROVIDER' ? 'Feed' : 'Worker'}
                                               </span>
                                             </div>
                                             <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                                               <span>Proof: EIP-712 Signed Nonce</span>
                                               <span>•</span>
                                               <span>Nonce: available after settlement</span>
                                               <span>•</span>
                                               <span>Configured vault: 0x3c42E274...c8775</span>
                                             </div>
                                           </div>
                                         </div>

                                         <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                                           <div className="text-right">
                                             <span className="text-[#d7ff4f] font-bold text-sm block">
                                               ${sub.costPathUsd.toFixed(4)} USD
                                             </span>
                                             <span className="text-zinc-400 text-[10px] flex items-center justify-end gap-1">
                                               <CheckCircle2 className="w-3 h-3 text-[#d7ff4f]" />
                                               <span>Verification follows confirmed trace</span>
                                             </span>
                                           </div>
                                          <button
                                            type="button"
                                            onClick={() => batchTxHash && copyToClipboard(batchTxHash, `tx_${sub.id}`)}
                                            disabled={!batchTxHash}
                                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
                                            title={batchTxHash ? 'Copy confirmed batch transaction' : 'No confirmed batch transaction'}
                                          >
                                            {copiedKey === `tx_${sub.id}` ? (
                                              <Check className="w-3.5 h-3.5 text-[#d7ff4f]" />
                                            ) : (
                                              <Copy className="w-3.5 h-3.5" />
                                            )}
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                              </div>
                            </details>
                          </div>
                        </div>

                        {/* What the workforce delivered */}
                        <details className="group pt-2 max-w-4xl mx-auto text-left">
                          <summary className="list-none cursor-pointer flex items-center justify-between gap-3 py-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[#d7ff4f] hover:text-white transition">
                            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#d7ff4f]" />Key outputs <span className="text-zinc-500 font-normal tracking-normal normal-case">(optional detail)</span></span>
                            <ChevronDown className="w-4 h-4 text-zinc-400 transition-transform group-open:rotate-180" />
                          </summary>
                        <div className="pt-2 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#d7ff4f] flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#d7ff4f]" />
                              What the workforce delivered
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400">
                              {selectedPreset.subcontractors.length === 20 ? '19 payment steps' : `${selectedPreset.subcontractors.length - 1} payment steps`} {batchTxHash ? 'confirmed on Tempo L1' : 'in evaluation flow'}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 text-xs font-mono [&_.bg-black\/50]:!bg-[#1f252b]/70 [&>*:nth-child(n+4)]:opacity-65">
                            {selectedPreset.id === 'swarm_media_creative' ? (
                              <>
                                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-[#d7ff4f] font-mono font-bold">01</span>
                                      <span className="text-[9px] text-zinc-400 uppercase font-mono font-semibold">HOOK</span>
                                    </div>
                                    <h5 className="text-white font-bold block text-[11px] leading-snug mt-1 font-sans">“Stop paying $50/mo — let your bot pay 0.1¢”</h5>
                                  </div>
                                  <span className="text-[9.5px] text-zinc-400 font-mono block border-t border-white/5 pt-1.5">Top angle from generated variants</span>
                                </div>
                                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-[#d7ff4f] font-mono font-bold">02</span>
                                      <span className="text-[9px] text-zinc-400 uppercase font-mono font-semibold">VISUAL</span>
                                    </div>
                                    <h5 className="text-white font-bold block text-[11px] font-mono mt-1 truncate" title="visual_concept_asset.png">visual_concept_asset.png</h5>
                                  </div>
                                  <span className="text-[9.5px] text-zinc-400 font-sans block border-t border-white/5 pt-1.5">Concept Layout • Alpha Mask</span>
                                </div>
                                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-[#d7ff4f] font-mono font-bold">03</span>
                                      <span className="text-[9px] text-zinc-400 uppercase font-mono font-semibold">VIDEO</span>
                                    </div>
                                    <h5 className="text-white font-bold block text-[11px] font-mono mt-1 truncate" title="storyboard_spec_15s.json">storyboard_spec_15s.json</h5>
                                  </div>
                                  <span className="text-[9.5px] text-zinc-400 font-sans block border-t border-white/5 pt-1.5">15s Spec • Voice & Cues</span>
                                </div>
                                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-[#d7ff4f] font-mono font-bold">04</span>
                                      <span className="text-[9px] text-zinc-400 uppercase font-mono font-semibold">POLICY</span>
                                    </div>
                                    <h5 className="text-white font-bold block text-[11px] font-mono mt-1">Policy check passed</h5>
                                  </div>
                                  <span className="text-[9.5px] text-zinc-400 font-sans block border-t border-white/5 pt-1.5">Meta & TikTok • 0 flags</span>
                                </div>
                                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-[#d7ff4f] font-mono font-bold">05</span>
                                      <span className="text-[9px] text-zinc-400 uppercase font-mono font-semibold">SCRIPTS</span>
                                    </div>
                                    <h5 className="text-white font-bold block text-[11px] font-mono mt-1">EN · ES · DE · FR · JA</h5>
                                  </div>
                                  <span className="text-[9.5px] text-zinc-400 font-sans block border-t border-white/5 pt-1.5">5 Localized ready posts</span>
                                </div>
                              </>
                            ) : selectedPreset.id === 'swarm_arbitrage' ? (
                              <>
                                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-[#d7ff4f] font-mono font-bold">01</span>
                                      <span className="text-[9px] text-zinc-400 uppercase font-mono font-semibold">DEPTH</span>
                                    </div>
                                    <h5 className="text-white font-bold block text-[11px] mt-1">L2 Orderbook Matrix</h5>
                                  </div>
                                  <span className="text-[9.5px] text-zinc-400 font-sans block border-t border-white/5 pt-1.5">L2 depth parsed</span>
                                </div>
                                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-[#d7ff4f] font-mono font-bold">02</span>
                                      <span className="text-[9px] text-zinc-400 uppercase font-mono font-semibold">SKEW</span>
                                    </div>
                                    <h5 className="text-white font-bold block text-[11px] mt-1">Volatility Skew</h5>
                                  </div>
                                  <span className="text-[9.5px] text-zinc-400 font-sans block border-t border-white/5 pt-1.5">Gamma neutral (+0.84)</span>
                                </div>
                                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-[#d7ff4f] font-mono font-bold">03</span>
                                      <span className="text-[9px] text-zinc-400 uppercase font-mono font-semibold">MODEL</span>
                                    </div>
                                    <h5 className="text-white font-bold block text-[11px] mt-1">Momentum Predictor</h5>
                                  </div>
                                  <span className="text-[9.5px] text-zinc-400 font-sans block border-t border-white/5 pt-1.5">Edge: +1.42% net profit</span>
                                </div>
                                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-[#d7ff4f] font-mono font-bold">04</span>
                                      <span className="text-[9px] text-zinc-400 uppercase font-mono font-semibold">SANDBOX</span>
                                    </div>
                                    <h5 className="text-white font-bold block text-[11px] mt-1">Python Sandbox</h5>
                                  </div>
                                  <span className="text-[9.5px] text-zinc-400 font-sans block border-t border-white/5 pt-1.5">Zero slippage verified</span>
                                </div>
                                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-[#d7ff4f] font-mono font-bold">05</span>
                                      <span className="text-[9px] text-zinc-400 uppercase font-mono font-semibold">{batchTxHash ? 'SETTLED' : 'PLANNED'}</span>
                                    </div>
                                    <h5 className="text-white font-bold block text-[11px] mt-1">Market Comparison</h5>
                                  </div>
                                  <span className="text-[9.5px] text-zinc-400 font-sans block border-t border-white/5 pt-1.5">{batchTxHash ? 'Settled in 14ms (&lt;$0.00002 gas)' : 'No network fee in evaluation'}</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-[#d7ff4f] font-mono font-bold">01</span>
                                      <span className="text-[9px] text-zinc-400 uppercase font-mono font-semibold">ENTITY</span>
                                    </div>
                                    <h5 className="text-white font-bold block text-[11px] mt-1">Active Entity</h5>
                                  </div>
                                  <span className="text-[9.5px] text-zinc-400 font-sans block border-t border-white/5 pt-1.5">Registry example supplied</span>
                                </div>
                                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-[#d7ff4f] font-mono font-bold">02</span>
                                      <span className="text-[9px] text-zinc-400 uppercase font-mono font-semibold">FINANCIAL</span>
                                    </div>
                                    <h5 className="text-white font-bold block text-[11px] mt-1">+$12.4M Cash</h5>
                                  </div>
                                  <span className="text-[9.5px] text-zinc-400 font-sans block border-t border-white/5 pt-1.5">Filing example supplied</span>
                                </div>
                                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-[#d7ff4f] font-mono font-bold">03</span>
                                      <span className="text-[9px] text-zinc-400 uppercase font-mono font-semibold">LEGAL</span>
                                    </div>
                                    <h5 className="text-white font-bold block text-[11px] mt-1">Watchlist example</h5>
                                  </div>
                                  <span className="text-[9.5px] text-zinc-400 font-sans block border-t border-white/5 pt-1.5">Supplied sample result</span>
                                </div>
                                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-[#d7ff4f] font-mono font-bold">04</span>
                                      <span className="text-[9px] text-zinc-400 uppercase font-mono font-semibold">SOLVENCY</span>
                                    </div>
                                    <h5 className="text-white font-bold block text-[11px] mt-1">Score: 4.12 (Safe)</h5>
                                  </div>
                                  <span className="text-[9.5px] text-zinc-400 font-sans block border-t border-white/5 pt-1.5">10k Monte Carlo test</span>
                                </div>
                                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-[#d7ff4f] font-mono font-bold">05</span>
                                      <span className="text-[9px] text-zinc-400 uppercase font-mono font-semibold">DECISION</span>
                                    </div>
                                    <h5 className="text-white font-bold block text-[11px] mt-1">APPROVED (94/100)</h5>
                                  </div>
                                  <span className="text-[9.5px] text-zinc-400 font-sans block border-t border-white/5 pt-1.5">Prepare contract review</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        </details>

                        {/* Action CTA Buttons */}
                        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              soundEngine.playClick();
                              setActiveConsoleTab('summary');
                              const el = document.getElementById('workforce-console-deck');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="px-6 py-3 rounded-xl bg-[#d7ff4f] hover:bg-[#cbf540] text-[#08090c] font-black text-xs font-mono transition flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(215,255,79,0.25)] active:scale-95 border border-[#d7ff4f]"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#08090c]" />
                            <span>View Deliverables</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              soundEngine.playClick();
                              const memoText = selectedPreset.id === 'swarm_media_creative' ? [
                                "=======================================================",
                                "SYNAPSE402 AUTONOMOUS WORKFORCE CAMPAIGN MEMO",
                                "=======================================================",
                                `Task: ${customDirective || selectedPreset.title}`,
                                `Target Product: Next-Gen SaaS Autonomous AI Suite`,
                                `Brand & Quality Review: Approved (Brand & Policy Compliant)`,
                                `Recommendation: LAUNCH MULTI-PLATFORM AD CAMPAIGN`,
                                `Total Spend: $0.0245 USD (Budget Cap: $0.0500)`,
                                `Unused Budget: $0.0255 USD`,
                                `Deliverables: 15s Storyboard Spec, Visuals, 5-Lang Scripts, 3 Thumbnails`,
                                `Workforce: 1 Lead Agent · 12 Workers · 7 Providers`,
                                `Human Role: Strategy Directive & Hardware Spend Cap Enforced`,
                                `Transaction ID: ${batchTxHash || 'No batch transaction returned'}`,
                                "======================================================="
                              ].join("\n") : selectedPreset.id === 'swarm_arbitrage' ? [
                                "=======================================================",
                                "SYNAPSE402 MARKET COMPARISON MEMO",
                                "=======================================================",
                                `Task: ${customDirective || selectedPreset.title}`,
                                `Target Pair: TEMPO/USD Cross-DEX Orderbook`,
                                `Observed Sample Spread: +1.42% (evaluation input)`,
                                `Planned payment step: $0.0060 USD (no trade submitted)`,
                                `Recommendation: REVIEW SAMPLE SPREAD; NO TRADE SENT`,
                                `Total Spend: $0.0060 USD (Budget Cap: $0.0100)`,
                                `Unused Budget: $0.0040 USD`,
                                `Workforce: 1 Lead Agent · 2 Workers · 2 Market Feeds`,
                                `Human Role: Strategy Directive & Hard Spend Cap Enforced`,
                                `Transaction ID: ${batchTxHash || 'No batch transaction returned'}`,
                                "======================================================="
                              ].join("\n") : [
                                "=======================================================",
                                "SYNAPSE402 AUTONOMOUS WORKFORCE CLEARANCE MEMO",
                                "=======================================================",
                                `Task: ${customDirective || selectedPreset.title}`,
                                `Target Supplier: Apex Foundry Ltd (Active Commercial Entity)`,
                                `Supplier Risk Assessment: Low Risk (Evaluation)`,
                                `Recommendation: EXECUTE SUPPLIER PROCUREMENT CONTRACT`,
                                `Total Spend: $0.0270 USD (Budget Cap: $0.0300)`,
                                `Unused Budget: $0.0030 USD`,
                                `Workforce: 1 Lead Agent · 12 Workers · 7 Providers`,
                                `Human Role: Strategy Directive & Hard Spend Cap Enforced`,
                                `Transaction ID: ${batchTxHash || 'No batch transaction returned'}`,
                                "======================================================="
                              ].join("\n");
                              copyToClipboard(memoText, 'memo_export');
                            }}
                            className="px-5 py-3 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-xs text-zinc-200 font-mono transition flex items-center gap-2 cursor-pointer active:scale-95"
                          >
                            {copiedKey === 'memo_export' ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-[#d7ff4f]" />
                                <span className="text-[#d7ff4f]">1-Page Memo Copied!</span>
                              </>
                            ) : (
                              <>
                                <FileText className="w-3.5 h-3.5 text-zinc-300" />
                                <span>Copy 1-Page Memo</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              soundEngine.playClick();
                              const settlementRecord = batchTxHash ? {
                                txHash: batchTxHash,
                                network: 'Tempo Moderato testnet',
                                settlementLatencyMs: 14.8,
                                authMechanism: 'EIP-712 Scoped Session Key'
                              } : {
                                status: 'NOT_SUBMITTED',
                                note: 'Evaluation only; a live wallet is required for on-chain settlement.'
                              };
                              const bundleJson = selectedPreset.id === 'swarm_media_creative' ? {
                                project: "Synapse402 Autonomous AI Workforce",
                                protocol: "HTTP 402 budgeted payments (Tempo L1 when live; Chain ID: 42431)",
                                mission: "Multi-Platform Ad Campaign Launch",
                                status: "DELIVERED_READY_FOR_PUBLISH",
                                budgetSummary: {
                                  budgetCapUsd: 0.0500,
                                  totalSpentUsd: 0.0245,
                                  budgetSavedUsd: 0.0255,
                                  humanRole: "Strategy Directive & Hard Spending Cap Enforced",
                                  executionTimeSec: actualExecutionTimeSec
                                },
                                onChainSettlement: settlementRecord,
                                workforceComposition: {
                                  leadAgent: "Unit 01 (Campaign Director)",
                                  externalPaidProviders: [
                                    "TikTok Radar ($0.0015)", "X Pulse ($0.0010)", "Ad Spy ($0.0015)",
                                    "Flux Visuals ($0.0020)", "Voice Cloud ($0.0015)", "Beat Stems ($0.0015)", "Buyer Segments ($0.0010)"
                                  ],
                                  internalWorkers: [
                                    "Ad Copywriter", "Visual Designer", "Policy Check", "Video Sync", "Creative Review",
                                    "Platform Formats", "Translation", "Thumbnail Maker", "Asset Packager", "Campaign Memo", "Budget Check", "Payment & Proof"
                                  ]
                                },
                                deliverables: {
                                  videoCreative: {
                                    file: "storyboard_spec_15s.json",
                                    aspectRatio: "9:16 (Vertical Reels/TikTok)",
                                    productionSpec: "Directives for GPU Video Pipeline",
                                    timelineScript: "0-3s: Hook problem • 3-10s: Solution proof • 10-15s: Single CTA",
                                    audioTracks: ["voiceover_prompt_script.wav", "beat_licensed_128bpm.wav"]
                                  },
                                  viralHooks: [
                                    "Stop paying $50/mo — let your bot pay 0.1¢",
                                    "You wouldn't hire 20 people to check 1 invoice. Why subscribe to 7 SaaS tools?",
                                    "Autonomous AI just bought its own ad creative on-chain for $0.02."
                                  ],
                                  visualAssets: [
                                    "visual_concept_asset.png (Alpha transparent cutout)",
                                    "cover_vertical_9x16.png (Layout Blueprint)",
                                    "feed_square_1x1.png (Carousel Frame)"
                                  ],
                                  localizedScripts: {
                                    EN: "Tired of recurring SaaS fees? Run autonomous micro-queries.",
                                    ES: "¿Cansado de suscripciones mensuales? Usa microtransacciones autónomas.",
                                    DE: "Keine monatlichen Abos mehr. Autonome KI zahlt pro Abfrage.",
                                    FR: "Fini les abonnements mensuels récurrents. L'IA paie par requête.",
                                    JA: "月額サブスクは不要。自律型AIが必要な時だけ直接支払います。"
                                  },
                                  policyAudit: {
                                    status: "PASSED",
                                    complianceStandards: ["Meta Advertising Standards", "TikTok Branded Content Policy"],
                                    restrictedKeywordsFound: 0,
                                    claimRiskScore: "0.02 (Safe / Grade A)"
                                  }
                                }
                              } : selectedPreset.id === 'swarm_arbitrage' ? {
                                project: "Synapse402 Autonomous AI Workforce",
                                protocol: "HTTP 402 budgeted payments (Tempo L1 when live; Chain ID: 42431)",
                                mission: "Cross-DEX Market Comparison (Evaluation)",
                                status: batchTxHash ? "PAYMENT_CONFIRMED_REPORT_READY" : "EVALUATION_RESULT_READY",
                                budgetSummary: {
                                  budgetCapUsd: 0.0100,
                                  plannedSpendUsd: 0.0060,
                                  liveSettledSpendUsd: batchTxHash ? 0.0060 : 0,
                                  remainingCapUsd: 0.0040,
                                  humanRole: "Strategy Directive & Hard Spending Cap Enforced",
                                  executionTimeSec: actualExecutionTimeSec
                                },
                                onChainSettlement: settlementRecord,
                                marketFeeds: [
                                  "Licensed normalized depth example ($0.0010)",
                                  "Licensed volatility snapshot example ($0.0020)"
                                ],
                                workers: [
                                  "Momentum Prediction Model",
                                  "Safe Code Runner Sandbox"
                                ],
                                evaluationInputs: {
                                  sampleSpreadObserved: "+1.42%",
                                  estimatedEdgeUsd: 0.428,
                                  configuredSlippageLimit: "0.05%",
                                  tradeSubmitted: false
                                }
                              } : {
                                project: "Synapse402 Autonomous AI Workforce",
                                protocol: "HTTP 402 budgeted payments (Tempo L1 when live; Chain ID: 42431)",
                                mission: "Enterprise Supplier Due Diligence",
                                 status: "EVALUATION_REVIEW_READY",
                                budgetSummary: {
                                  budgetCapUsd: 0.0300,
                                  totalSpentUsd: 0.0270,
                                  budgetSavedUsd: 0.0030,
                                  humanRole: "Strategy Directive & Hard Spending Cap Enforced",
                                  executionTimeSec: actualExecutionTimeSec
                                },
                                onChainSettlement: settlementRecord,
                                supplierEvaluated: "Apex Foundry Ltd",
                                 entityStatus: "Example registry snapshot supplied",
                                 financialSolvency: "+$12.4M example cash figure",
                                 sanctionsScore: "Example watchlist result supplied",
                                 solvencyScore: "4.12 example stress score",
                                 recommendation: "REVIEW RECOMMENDED (evaluation result)"
                              };

                              const jsonFilename = selectedPreset.id === 'swarm_media_creative'
                                ? 'campaign_bundle_tempo_l1.json'
                                : selectedPreset.id === 'swarm_arbitrage'
                                ? 'market_comparison_evaluation.json'
                                : 'supplier_dossier_tempo_l1.json';

                              const blob = new Blob([JSON.stringify(bundleJson, null, 2)], { type: 'application/json' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = jsonFilename;
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                            className="px-5 py-3 rounded-xl bg-white/[.04] hover:bg-white/[.08] border border-white/15 text-zinc-200 text-xs font-mono font-semibold transition flex items-center gap-2 cursor-pointer active:scale-95"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>{selectedPreset.id === 'swarm_media_creative' ? 'Download Campaign Bundle (.JSON)' : selectedPreset.id === 'swarm_arbitrage' ? 'Download Market Comparison (.JSON)' : 'Download Due Diligence Dossier (.JSON)'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              soundEngine.playClick();
                              setActiveConsoleTab('receipt');
                              const el = document.getElementById('workforce-console-deck');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="px-5 py-3 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-xs text-zinc-200 font-mono transition flex items-center gap-2 cursor-pointer"
                          >
                            <Coins className="w-3.5 h-3.5 text-zinc-300" />
                            <span>Payment Receipt</span>
                          </button>
                        </div>

                        {/* Short payment record: the result, without repeating the technical trace. */}
                        <div className="mt-4 p-5 sm:p-6 rounded-2xl bg-[#171c22] border border-white/10 shadow-sm space-y-4 text-left max-w-4xl mx-auto">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                            <div className="flex items-center gap-3">
                              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${batchTxHash ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.35)]' : 'bg-zinc-500'}`} aria-hidden="true" />
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${batchTxHash ? 'bg-emerald-400/10 text-emerald-300 border-emerald-400/25' : 'bg-white/[.05] text-zinc-300 border-white/10'}`}>
                                    {batchTxHash ? 'PAYMENT CONFIRMED' : 'EVALUATION ONLY'}
                                  </span>
                                </div>
                                <h4 className="text-sm font-bold text-white tracking-tight mt-1">
                                  Payment record
                                </h4>
                              </div>
                            </div>

                            {batchTxHash && <div className="flex items-center gap-2 shrink-0">
                              <a
                                href={`https://explore.tempo.xyz/tx/${batchTxHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-xl border border-[#d7ff4f]/30 bg-[#d7ff4f]/10 hover:bg-[#d7ff4f]/20 text-[#d7ff4f] text-xs font-semibold transition flex items-center gap-1.5 shrink-0"
                              >
                                <span>View receipt</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>}
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                            <div className="p-3 rounded-lg bg-black/20 border border-white/[0.06]">
                              <span className="text-zinc-500 block text-[10px] uppercase">Total</span>
                              <strong className="text-[#d7ff4f]">${selectedPreset.subcontractors.reduce((acc, s) => acc + s.costPathUsd, 0).toFixed(4)}</strong>
                            </div>
                            <div className="p-3 rounded-lg bg-black/20 border border-white/[0.06]">
                              <span className="text-zinc-500 block text-[10px] uppercase">Work steps</span>
                              <strong className="text-white">{selectedPreset.subcontractors.length}</strong>
                            </div>
                            <div className="p-3 rounded-lg bg-black/20 border border-white/[0.06] col-span-2 sm:col-span-1">
                              <span className="text-zinc-500 block text-[10px] uppercase">Status</span>
                              <strong className={batchTxHash ? 'text-emerald-400' : 'text-zinc-300'}>{batchTxHash ? 'Confirmed' : 'No live payment'}</strong>
                            </div>
                          </div>
                          {batchTxHash && <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                            <span className="truncate">Receipt ID: {batchTxHash}</span>
                            <button type="button" onClick={() => copyToClipboard(batchTxHash, 'climax_tx_hash')} className="px-2 py-1 rounded-md bg-white/[.05] border border-white/10 hover:text-white shrink-0">{copiedKey === 'climax_tx_hash' ? 'Copied' : 'Copy'}</button>
                          </div>}
                        </div>
                      </div>
                    )}

                    {/* 3. LIVE MULTI-AGENT PROTOCOL DIALOGUE WIRE (WAR-ROOM STREAM) */}
                    <details className="group rounded-2xl bg-white/[.03] backdrop-blur-md border border-white/[.08] shadow-sm">
                      <summary className="list-none cursor-pointer p-4 sm:p-5 flex items-center justify-between gap-3 text-sm font-bold text-white hover:bg-white/[.025] transition">
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-zinc-500" />Activity log <span className="text-[10px] font-mono text-zinc-400 font-normal">{agentDialogues.length} steps</span></span>
                        <ChevronDown className="w-4 h-4 text-zinc-400 transition-transform group-open:rotate-180" />
                      </summary>
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/[0.08] pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#d7ff4f]/10 border border-[#d7ff4f]/30 flex items-center justify-center text-[#d7ff4f]">
                            <Layers className="w-4 h-4 text-[#d7ff4f]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                                Live Activity
                              </span>
                              <span className="px-1.5 py-0.2 rounded bg-white/[0.05] text-zinc-300 border border-white/15 text-[9px] font-mono font-bold">
                                {selectedPreset.subcontractors.length === 20 ? '1 Lead · 12 Workers · 7 Providers' : `${selectedPreset.subcontractors.length} Autonomous Units`}
                              </span>
                            </div>
                            <span className="text-[10.5px] text-zinc-400 font-sans">
                              See the job move from resource request → payment → result → next step
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-zinc-400">
                            Updates: <strong className="text-white">{agentDialogues.length} steps</strong>
                          </span>
                          {isExecuting && (
                            <span className="px-2.5 py-1 rounded-lg bg-[#d7ff4f]/15 text-[#d7ff4f] border border-[#d7ff4f]/40 text-[9.5px] font-mono font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(215,255,79,0.3)]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#d7ff4f] animate-ping" />
                              <span>ACTIVE</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Dialogue Chat Messages Box */}
                      <div ref={dialogueContainerRef} className="max-h-[260px] overflow-y-auto space-y-2 pr-1.5 [scrollbar-width:thin] text-xs font-mono">
                        {agentDialogues.length === 0 ? (
                          <div className="p-6 rounded-xl bg-white/[0.015] border border-white/[0.05] text-center text-zinc-400 text-xs font-sans space-y-1">
                            <p className="text-zinc-300 font-medium">Activity Stream Standby</p>
                            <p className="text-[11px] text-zinc-500">
                              Click <strong className="text-[#d7ff4f]">Start Campaign</strong> above to watch the job move from resource request → payment → result → next step in real time.
                            </p>
                          </div>
                        ) : (
                          agentDialogues.map((dlg) => (
                            <div
                              key={dlg.id}
                              className={`p-2.5 sm:p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 ${
                                dlg.stepType === 'APPROVAL'
                                  ? 'bg-[#d7ff4f]/[0.06] border-[#d7ff4f]/30 text-zinc-100 shadow-[0_0_12px_rgba(215,255,79,0.08)]'
                                  : 'bg-white/[0.02] border-white/[0.06] hover:border-white/15'
                              }`}
                            >
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`px-2 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase tracking-wider ${
                                    dlg.stepType === 'APPROVAL'
                                      ? 'bg-[#d7ff4f]/20 text-[#d7ff4f] border border-[#d7ff4f]/40'
                                      : dlg.stepType === 'DIRECTIVE'
                                      ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                                      : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                                  }`}>
                                    {dlg.stepType === 'APPROVAL' ? 'APPROVED' : dlg.stepType === 'DIRECTIVE' ? 'DIRECTIVE' : 'DATA'}
                                  </span>
                                  <span className="font-bold text-white text-[11px]">{dlg.fromName}</span>
                                  <span className="text-zinc-500 text-[10px]">&rarr;</span>
                                  <span className="text-zinc-300 text-[11px]">{dlg.toName}</span>
                                </div>
                                <p className="text-[11.5px] text-zinc-200 font-sans leading-relaxed break-words">
                                  {dlg.message}
                                </p>
                              </div>

                              <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-start gap-1.5 shrink-0 text-[10px] font-mono text-zinc-400">
                                <span className="text-zinc-400">{dlg.timestamp}</span>
                                {dlg.costUsd !== undefined && dlg.costUsd > 0 && (
                                  <span className="text-[#d7ff4f] font-bold font-mono text-xs shadow-sm">
                                    +${dlg.costUsd.toFixed(4)}
                                  </span>
                                )}
                                {dlg.highlightBadge && (
                                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#d7ff4f]/10 text-[#d7ff4f] border border-[#d7ff4f]/30">
                                    {dlg.highlightBadge}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    </details>
                  </>
                );
              }

              // Fallback for smaller swarms
                  return (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {selectedPreset.subcontractors.map((sub) => {
                          const isSettled = settledWorkerIds.has(sub.id);
                          const isSelected = selectedSubId === sub.id;
                          const liveState = workerLiveStates[sub.id];
                          const isBusy = liveState?.status === 'BUSY';
                          const NodeIcon = getSubcontractorIcon(sub.id);

                          return (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => {
                                soundEngine.playClick();
                                setSelectedSubId(sub.id);
                                setActiveConsoleTab('inspector');
                              }}
                              className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer relative flex flex-col justify-between min-h-[88px] group overflow-hidden ${
                                isSelected
                                  ? 'bg-white/[0.09] border-[#d7ff4f]/60 ring-1 ring-[#d7ff4f]/30 shadow-lg'
                                  : isSettled
                                  ? 'bg-emerald-500/[0.04] border-emerald-500/30'
                                  : isBusy
                                  ? 'bg-[#d7ff4f]/[0.06] border-[#d7ff4f]/60 ring-1 ring-[#d7ff4f]/30 shadow-[0_0_15px_rgba(215,255,79,0.12)]'
                                  : 'bg-white/[0.02] border-white/[0.06] hover:border-white/15'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <NodeIcon className={`w-3.5 h-3.5 shrink-0 ${isSettled ? 'text-emerald-400' : isBusy ? 'text-[#d7ff4f]' : 'text-zinc-400'}`} />
                                  <span className="text-xs font-semibold text-zinc-100 truncate">
                                    {sub.shortName}
                                  </span>
                                </div>
                                <span className={`w-2 h-2 rounded-full shrink-0 ${isSettled ? 'bg-emerald-400' : isBusy ? 'bg-[#d7ff4f]' : 'bg-zinc-600'}`} />
                              </div>
                              <div className="text-[10px] text-zinc-400 truncate mb-1 font-sans">
                                {sub.deliverablePreview}
                              </div>
                              <div className="flex items-center justify-between text-[10px] font-mono mt-auto pt-1.5 border-t border-white/[0.04]">
                                <span className="text-zinc-200 font-medium">${sub.costPathUsd}</span>
                                <span className={isSettled ? 'text-emerald-400 font-semibold' : isBusy ? 'text-[#d7ff4f] font-bold' : 'text-zinc-400'}>
                                  {isSettled ? (batchTxHash ? '✓ Delivered' : '✓ Prepared') : isBusy ? 'Active...' : 'Ready'}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* BIG RESULT BLOCK (FOR SMALLER SWARMS) */}
                      {settledWorkerIds.size === selectedPreset.subcontractors.length && (
                        <div id="swarm-big-result-block" className="p-8 sm:p-10 rounded-2xl bg-gradient-to-b from-white/[0.04] to-black/80 border border-white/15 text-center space-y-5 shadow-2xl my-6 animate-fade-in">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-1">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[11px] font-mono tracking-[0.25em] text-zinc-400 uppercase block font-semibold">
                              MISSION ACCOMPLISHED
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                              WORK COMPLETE
                            </h2>
                            <p className="text-sm text-zinc-300 font-sans max-w-lg mx-auto">
                              {batchTxHash
                                ? (selectedPreset.id === 'swarm_media_creative'
                                  ? 'Creative Studio Assets Ready — Transparent PNG, visual concept layout, and audio stems synthesized.'
                                  : 'Market Risk Dossier Ready — sample inputs reviewed and Python calculations prepared.')
                                : 'Evaluation package ready — sample outputs assembled for review; no external result was independently verified.'}
                            </p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-4 border-t border-white/10 font-mono text-left">
                            <div className="p-4 rounded-xl bg-black/60 border border-white/[0.08]">
                              <span className="text-[10px] uppercase text-zinc-500 block mb-1">{batchTxHash ? 'Total spent' : 'Planned cost'}</span>
                              <span className="text-xl font-bold text-white block">
                                ${selectedPreset.subcontractors.reduce((acc, s) => acc + s.costPathUsd, 0).toFixed(4)}
                              </span>
                              <span className="text-[11px] text-zinc-400 block mt-0.5">Policy cap: {(selectedPreset as any).budgetLimit || '$0.0300 policy cap'}</span>
                            </div>
                            <div className="p-4 rounded-xl bg-black/60 border border-white/[0.08]">
                              <span className="text-[10px] uppercase text-zinc-500 block mb-1">
                                {selectedPreset.id === 'swarm_media_creative' ? 'Pipeline composition' : batchTxHash ? 'Nodes paid' : 'Steps reviewed'}
                              </span>
                              <span className="text-xl font-bold text-[#d7ff4f] block">
                                {selectedPreset.id === 'swarm_media_creative' ? '7 Feeds · 12 Workers' : selectedPreset.subcontractors.length}
                              </span>
                              <span className="text-[11px] text-zinc-400 block mt-0.5">
                                {selectedPreset.id === 'swarm_media_creative' ? '19 pipeline steps' : 'Specialist endpoints'}
                              </span>
                            </div>
                            <div className="p-4 rounded-xl bg-black/60 border border-white/[0.08]">
                              <span className="text-[10px] uppercase text-zinc-500 block mb-1">Pricing Model</span>
                              <span className="text-xl font-bold text-zinc-200 block">Pay-As-You-Go</span>
                              <span className="text-[11px] text-zinc-400 block mt-0.5">0 Subscriptions</span>
                            </div>
                            <div className="p-4 rounded-xl bg-black/60 border border-white/[0.08]">
                              <span className="text-[10px] uppercase text-zinc-500 block mb-1">Human Labor</span>
                              <span className="text-xl font-bold text-emerald-400 block">0</span>
                              <span className="text-[11px] text-emerald-400/80 block mt-0.5">No human actions after start</span>
                            </div>
                          </div>
                          {/* ON-CHAIN SETTLEMENT PROOF (SMALL SWARMS) */}
                          <div className="p-4 rounded-xl bg-black/60 border border-[#d7ff4f]/30 max-w-3xl mx-auto text-left font-mono text-xs space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-2">
                              <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-[#d7ff4f]" />
                                <span className="text-[#d7ff4f] font-bold uppercase text-[11px]">{batchTxHash ? 'Settled on-chain • Tempo L1' : 'Evaluation payment plan'}</span>
                                <span className="text-zinc-500 text-[10px]">Chain ID 42431 · Type 0x76 MPP</span>
                              </div>
                              <a
                                href={batchTxHash ? `https://explore.tempo.xyz/tx/${batchTxHash}` : undefined}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#d7ff4f] hover:underline flex items-center gap-1"
                              >
                                <span>Explorer Receipt ↗</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-zinc-300">
                              <span>{batchTxHash ? 'Total settled' : 'Total planned'}: <strong className="text-white">${selectedPreset.subcontractors.reduce((acc, s) => acc + s.costPathUsd, 0).toFixed(4)} USD</strong></span>
                              <span>{batchTxHash ? 'Units paid' : 'Payment steps'}: <strong className="text-[#d7ff4f]">{selectedPreset.subcontractors.filter(s => s.costPathUsd > 0).length}</strong></span>
                              <span>{batchTxHash ? 'Network fee' : 'Network fee'}: <strong className="text-emerald-400">{batchTxHash ? '&lt;$0.00002' : 'not incurred'}</strong></span>
                            </div>
                          </div>

                          <div className="pt-2 flex items-center justify-center gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                soundEngine.playClick();
                                setActiveConsoleTab('logs');
                                const el = document.getElementById('workforce-console-deck');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-xs text-zinc-200 font-mono transition flex items-center gap-2 cursor-pointer"
                            >
                              <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                              <span>View Detailed Execution Log</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  );
            })()}
          </div>

          {/* UNIFIED WORKFORCE CONSOLE & DELIVERABLES DECK */}
          <div id="workforce-console-deck" className="rounded-2xl bg-white/[.03] backdrop-blur-md border border-white/[.08] shadow-sm overflow-hidden scroll-mt-6">
            {/* Header: Title, Live Status Badges & Action Controls */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d7ff4f] shadow-[0_0_12px_rgba(215,255,79,0.45)] shrink-0" aria-hidden="true" />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      Workforce execution & deliverables
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold border bg-white/[0.04] text-zinc-300 border-white/10 flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${settledWorkerIds.size === selectedPreset.subcontractors.length ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                      {settledWorkerIds.size}/{selectedPreset.subcontractors.length} {settledWorkerIds.size > 0 ? 'Steps complete' : 'Ready'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans mt-0.5">
                    {settledWorkerIds.size === selectedPreset.subcontractors.length
                    ? `${selectedPreset.subcontractors.length} work steps completed in the evaluation flow${batchTxHash ? ' and confirmed on Tempo L1.' : '.'}`
                      : isExecuting
                      ? selectedPreset.subcontractors.length === 20
                        ? 'Executing 3-phase workforce pipeline in parallel...'
                        : 'Executing workforce pipeline...'
                    : `${selectedPreset.subcontractors.length} work steps configured and ready.`}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    handleRunSwarmBatch();
                  }}
                  disabled={isExecuting}
                  className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/15 text-zinc-200 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed text-xs font-mono transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : ''}`} />
                  <span>{isExecuting ? 'Executing...' : 'Re-run Workforce'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    const payload = {
                      mission: selectedPreset.title,
                      totalNodes: selectedPreset.subcontractors.length,
                      totalSettledCostUsd: Array.from(settledWorkerIds).reduce<number>((acc, id) => acc + (selectedPreset.subcontractors.find(x => x.id === id)?.costPathUsd || 0), 0).toFixed(4),
                      tempoL1Settlement: batchTxHash ? "Verified parallel payment lanes" : "Budgeted payment steps; no chain receipt",
                      settledNodes: selectedPreset.subcontractors.map(s => ({
                        node: s.shortName,
                        role: s.role,
                        category: s.category,
                        output: s.samplePayload || s.deliverablePreview,
                        costUsd: `$${s.costPathUsd}`
                      }))
                    };
                    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
                    setCopiedDossier(true);
                    setTimeout(() => setCopiedDossier(false), 2000);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-zinc-200 text-xs font-mono transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  {copiedDossier ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">JSON Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      <span>JSON</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    const memoText = selectedPreset.id === 'swarm_media_creative' ? [
                      "=======================================================",
                      "SYNAPSE402 AUTONOMOUS WORKFORCE CAMPAIGN MEMO",
                      "=======================================================",
                      `Job: ${customDirective || selectedPreset.title}`,
                      `Preset Workforce: ${selectedPreset.title}`,
                      `Target: Viral Multi-Platform Ad Campaign Launch`,
                      `Brand & Quality Review: Approved (Brand & Policy Compliant)`,
                      `Recommendation: LAUNCH MULTI-PLATFORM AD CAMPAIGN`,
                      `Total Spend: $${Array.from(settledWorkerIds).reduce<number>((acc, id) => acc + (selectedPreset.subcontractors.find(x => x.id === id)?.costPathUsd || 0), 0).toFixed(4)} USD`,
                      `Policy Budget Cap: ${(selectedPreset as any).budgetLimit || '$0.0500 cap'} (Zero Overdrafts)`,
                      `SaaS Subscription Incurred: $0.00 (Zero Retainers)`,
                      `Settlement Layer: ${batchTxHash ? 'Tempo L1 micropayments (confirmed trace)' : 'Evaluation payment plan (wallet required for chain settlement)'}`,
                      `On-Chain Tx Hash: ${batchTxHash || 'No batch transaction returned'}`,
                      "-------------------------------------------------------",
                      "VERIFIED DELIVERABLE SPECIFICATIONS:",
                      ...selectedPreset.subcontractors.map((s, idx) => `  ${idx + 1}. [${s.shortName}] ${s.role}: ${s.deliverablePreview} ($${s.costPathUsd.toFixed(4)})`),
                      "-------------------------------------------------------",
                      "EXECUTIVE STATUS: REVIEW READY (ON-CHAIN TRACE DEPENDS ON LIVE WALLET)",
                      "======================================================="
                    ].join("\n") : [
                      "=======================================================",
                      "SYNAPSE402 AUTONOMOUS WORKFORCE CLEARANCE MEMO",
                      "=======================================================",
                      `Job: ${customDirective || selectedPreset.title}`,
                      `Preset Workforce: ${selectedPreset.title}`,
                      `Total Specialist Nodes: ${selectedPreset.subcontractors.length === 20 ? '20 Mission Units (1 Lead · 12 Workers · 7 Providers)' : `${selectedPreset.subcontractors.length} Mission Units`}`,
                      `Total Spend: $${Array.from(settledWorkerIds).reduce<number>((acc, id) => acc + (selectedPreset.subcontractors.find(x => x.id === id)?.costPathUsd || 0), 0).toFixed(4)} USD`,
                      `Corporate Policy Cap: ${(selectedPreset as any).budgetLimit || '$0.0300 cap'} (Zero Unapproved Overdrafts)`,
                      `SaaS Subscription Incurred: $0.00 (Zero Recurring Retainers)`,
                      `Settlement Layer: ${batchTxHash ? 'Tempo L1 micropayments (confirmed trace)' : 'Evaluation payment plan (wallet required for chain settlement)'}`,
                      `On-Chain Tx Hash: ${batchTxHash || 'No batch transaction returned'}`,
                      "-------------------------------------------------------",
                      "VERIFIED DELIVERABLE SPECIFICATIONS:",
                      ...selectedPreset.subcontractors.map((s, idx) => `  ${idx + 1}. [${s.shortName}] ${s.role}: ${s.deliverablePreview} ($${s.costPathUsd.toFixed(4)})`),
                      "-------------------------------------------------------",
                      "EXECUTIVE STATUS: REVIEW READY (ON-CHAIN TRACE DEPENDS ON LIVE WALLET)",
                      "======================================================="
                    ].join("\n");
                    navigator.clipboard.writeText(memoText);
                    setCopiedMemo(true);
                    setTimeout(() => setCopiedMemo(false), 2000);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/15 text-zinc-200 text-xs font-mono transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  {copiedMemo ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Memo Copied!</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5 text-zinc-300" />
                      <span>Export summary</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 4 Clean Navigation Tabs */}
            <div className="flex items-center gap-1 px-3 sm:px-4 pt-3 border-b border-white/10 overflow-x-auto bg-white/[.025]">
              {[
                { id: 'summary', label: 'Summary & Decision', icon: FileText, count: null },
                { id: 'inspector', label: 'Inspect Workers', icon: Cpu, count: null },
                { id: 'receipt', label: 'Payment Receipt', icon: Coins, count: null },
                { id: 'logs', label: 'Activity Log', icon: Terminal, count: executionLog.length || null },
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeConsoleTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setActiveConsoleTab(tab.id as any);
                    }}
                    className={`px-3 sm:px-4 py-2.5 rounded-t-xl text-xs font-mono font-medium transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer border-b-2 -mb-[1px] ${
                      isActive
                        ? 'text-white border-white bg-white/[0.06] font-semibold'
                        : 'text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/[0.02]'
                    }`}
                  >
                    <TabIcon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                    <span>{tab.label}</span>
                    {tab.count !== null && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        isActive ? 'bg-white/20 text-white' : 'bg-white/[0.06] text-zinc-400'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Body */}
            <div className="p-4 sm:p-5">
              {/* TAB 1: EXECUTIVE BRIEFING / DELIVERABLES */}
              {activeConsoleTab === 'summary' && (
                <div className="space-y-6 font-sans text-xs">
                  {settledWorkerIds.size === 0 && !isExecuting ? (
                    <div className="p-8 sm:p-12 rounded-xl bg-white/[0.015] border border-white/[0.08] text-center space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/15 text-white mx-auto flex items-center justify-center">
                        <Layers className="w-6 h-6" />
                      </div>
                      <div className="space-y-1.5 max-w-md mx-auto">
                        <h4 className="text-base font-bold text-white font-mono">Workforce Standby</h4>
                        <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                          {selectedPreset.subcontractors.length} specialized autonomous units are primed and authorized under the {(selectedPreset as any).budgetLimit || '$0.0300 cap'}.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playClick();
                          handleRunSwarmBatch();
                        }}
                        className="px-4 py-2 rounded-xl bg-[#d7ff4f] hover:bg-[#cbf540] text-[#08090c] text-xs font-bold font-mono transition inline-flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(215,255,79,0.3)] active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Dispatch Workforce</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-5 pt-1">
                      {/* Executive Summary Header */}
                      <div className="p-4 rounded-2xl bg-[#1f252b]/70 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#d7ff4f]/15 border border-[#d7ff4f]/30 flex items-center justify-center text-[#d7ff4f] shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white font-mono block">
                              {batchTxHash
                                ? (selectedPreset.id === 'swarm_media_creative'
                                  ? 'Executive Campaign Deliverables Approved'
                                  : selectedPreset.id === 'swarm_arbitrage'
                                  ? 'Market Comparison Approved'
                                  : 'Enterprise Due Diligence Dossier Approved')
                                : (selectedPreset.id === 'swarm_media_creative'
                                  ? 'Executive Campaign Deliverables Ready'
                                  : selectedPreset.id === 'swarm_arbitrage'
                                  ? 'Market Comparison Ready'
                                  : 'Enterprise Due Diligence Draft Ready')}
                            </span>
                            <span className="text-[11px] text-zinc-400 font-sans">
                              {selectedPreset.subcontractors.length} work steps completed {batchTxHash ? 'with a Tempo L1 trace' : 'in the evaluation flow'} • Total planned spend: ${Array.from(settledWorkerIds).reduce<number>((acc, id) => acc + (selectedPreset.subcontractors.find(x => x.id === id)?.costPathUsd || 0), 0).toFixed(4)} USD
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              soundEngine.playClick();
                              const memoText = [
                                "=======================================================",
                                "SYNAPSE402 AUTONOMOUS WORKFORCE EXECUTIVE MEMO",
                                "=======================================================",
                                `Mission Directive: ${customDirective || selectedPreset.title}`,
                                `Total Units: ${selectedPreset.subcontractors.length} Autonomous Units`,
                                `Total Spend: $${Array.from(settledWorkerIds).reduce<number>((acc, id) => acc + (selectedPreset.subcontractors.find(x => x.id === id)?.costPathUsd || 0), 0).toFixed(4)} USD`,
                                `Budget Policy Cap: ${selectedPreset.budgetLimit || '$0.0500 cap'} (Zero Overdrafts)`,
                                `SaaS Subscriptions Incurred: $0.00 (Zero Recurring Retainers)`,
                                `Settlement Layer: ${batchTxHash ? 'Tempo L1 micropayments (confirmed trace)' : 'Evaluation payment plan (wallet required for chain settlement)'}`,
                                `Batch Tx Hash: ${batchTxHash || 'No batch transaction returned'}`,
                                "-------------------------------------------------------",
                                "VERIFIED DELIVERABLES SUMMARY:",
                                ...selectedPreset.subcontractors.map((s, idx) => `  ${idx + 1}. [${s.shortName}] ${s.role}: ${s.deliverablePreview} ($${s.costPathUsd.toFixed(4)})`),
                                "-------------------------------------------------------",
                                "EXECUTIVE STATUS: REVIEW READY (ON-CHAIN TRACE DEPENDS ON LIVE WALLET)",
                                "======================================================="
                              ].join("\n");
                              copyToClipboard(memoText, 'tab_memo_btn');
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/15 text-white text-xs font-mono transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            {copiedKey === 'tab_memo_btn' ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-[#d7ff4f]" />
                                <span className="text-[#d7ff4f] font-bold">Memo Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-zinc-300" />
                                <span>Copy 1-Page Memo</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Deliverables Table */}
                      <div className="rounded-2xl bg-[#1f252b]/70 border border-white/10 overflow-hidden font-mono text-xs">
                        <div className="px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.08] flex items-center justify-between text-[11px] text-zinc-400 font-bold uppercase">
                          <span>Unit & Role</span>
                          <span>Output & Cost</span>
                        </div>
                        <div className="divide-y divide-white/[0.05] max-h-[320px] overflow-y-auto [scrollbar-width:thin]">
                          {selectedPreset.subcontractors.map((s, idx) => (
                            <div key={s.id} className="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition">
                              <div className="flex items-center gap-2.5 min-w-0">
                                {s.nodeType === 'ORCHESTRATOR' || s.costPathUsd === 0 ? (
                                  <span className="px-1 py-0.5 rounded bg-[#d7ff4f]/15 text-[#d7ff4f] border border-[#d7ff4f]/30 font-mono font-bold text-[8.5px] w-8 text-center shrink-0">LEAD</span>
                                ) : (
                                  <span className="text-zinc-400 font-bold text-[10px] w-8 text-center shrink-0 font-mono">{String(idx).padStart(2, '0')}</span>
                                )}
                                <div className="truncate">
                                  <span className="text-white font-bold block truncate">{s.shortName}</span>
                                  <span className="text-zinc-500 text-[10.5px] font-sans block truncate">{s.role}</span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-[#d7ff4f] font-bold block">${s.costPathUsd.toFixed(4)}</span>
                                <span className="text-zinc-400 text-[10px] block">{batchTxHash ? '✓ Delivered' : '✓ Prepared'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ACTIVE BOT INSPECTOR */}
              {activeConsoleTab === 'inspector' && (() => {
                const currentSub = selectedPreset.subcontractors.find((s) => s.id === selectedSubId) || selectedPreset.subcontractors[0];
                const isSettled = settledWorkerIds.has(currentSub.id);

                return (
                  <div className="space-y-4">
                    {/* Quick Bot Selector Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 [scrollbar-width:thin]">
                      {selectedPreset.subcontractors.map((sub) => {
                        const isSubActive = sub.id === currentSub.id;
                        const isSubSettled = settledWorkerIds.has(sub.id);
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => {
                              soundEngine.playClick();
                              setSelectedSubId(sub.id);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 border ${
                              isSubActive
                                ? 'bg-[#d7ff4f]/15 border-[#d7ff4f]/40 text-[#d7ff4f] font-bold shadow-sm'
                                : 'bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isSubSettled ? 'bg-[#d7ff4f]' : 'bg-zinc-600'}`} />
                            <span>{sub.shortName}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Bot Card Details */}
                    <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] space-y-3.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-zinc-200 shrink-0">
                            <Cpu className="w-4 h-4 text-zinc-200" />
                          </div>
                          <div>
                            <span className="font-semibold text-white text-sm block">{currentSub.role}</span>
                            <span className="text-[11px] text-zinc-500 font-sans">{currentSub.providerLabel || currentSub.team} • Stage: {currentSub.category}</span>
                          </div>
                        </div>
                        <div>
                          {isSettled ? (
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-medium border bg-[#d7ff4f]/10 text-[#d7ff4f] border-[#d7ff4f]/30 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#d7ff4f]" />
                              {batchTxHash ? 'Settled on Tempo L1' : 'Payment step completed in evaluation'}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-medium border bg-white/[0.03] text-zinc-400 border-white/10">
                              Cost: ${currentSub.costPathUsd} USD
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 3 Metric Pills */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                        <div className="p-3 rounded-lg bg-black/40 border border-white/[0.05]">
                          <span className="text-[10px] text-zinc-500 block uppercase">Role & Endpoint</span>
                          <span className="text-zinc-200 font-medium truncate block text-[11px] font-mono mt-0.5">
                            {currentSub.nodeType === 'PROVIDER' ? 'Data Provider' : 'Specialist Worker'} • {currentSub.shortName}
                          </span>
                        </div>
                        <div className="p-3 rounded-lg bg-black/40 border border-white/[0.05]">
                          <span className="text-[10px] text-zinc-500 block uppercase">Input / Query Mandate</span>
                          <span className="text-zinc-200 font-medium truncate block text-[11px] font-sans mt-0.5">
                            {currentSub.taskInput || currentSub.queryPrompt || currentSub.deliverablePreview}
                          </span>
                        </div>
                        <div className="p-3 rounded-lg bg-black/40 border border-white/[0.05]">
                          <span className="text-[10px] text-zinc-500 block uppercase">Cost & Speed</span>
                          <span className="text-white font-medium block text-[11px] font-mono mt-0.5">
                            ${currentSub.costPathUsd.toFixed(4)} USD • policy check
                          </span>
                        </div>
                      </div>

                      {/* Task & Verified Deliverable Output Box */}
                      <div className="p-3.5 rounded-lg bg-black/60 border border-white/[0.08] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono text-zinc-300 font-semibold flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#d7ff4f]" />
                            <span>Specialist Deliverable:</span>
                          </span>
                          <span className="text-[10.5px] font-mono text-zinc-400">
                            {isSettled ? (batchTxHash ? 'Sealed on Tempo L1' : 'Completed in evaluation') : 'Awaiting Execution'}
                          </span>
                        </div>
                        <div className="p-3 rounded-md bg-white/[0.02] border border-white/[0.04] font-mono text-xs text-zinc-200 leading-relaxed break-words select-all whitespace-pre-wrap">
                          {isSettled
                            ? (currentSub.taskOutput || currentSub.samplePayload || currentSub.deliverablePreview)
                            : `Expected Output: ${currentSub.deliverablePreview}`}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
              {/* TAB 3: ON-CHAIN RECEIPT */}
              {activeConsoleTab === 'receipt' && (
                <div className="p-4 rounded-xl bg-black/50 border border-white/[0.08] space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-white" />
                      <span className="text-zinc-100 font-bold">Payment Record</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#d7ff4f]/10 text-[#d7ff4f] border border-[#d7ff4f]/30 text-[10.5px] font-semibold">
                      {batchTxHash ? '✓ Confirmed on Tempo L1' : 'Evaluation record · no chain receipt'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
                      <span className="text-zinc-500 block uppercase text-[10px]">Payment Protocol</span>
                      <span className="text-zinc-200 font-semibold block">HTTP 402 Micropayments</span>
                    </div>
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
                      <span className="text-zinc-500 block uppercase text-[10px]">Settlement Network</span>
                      <span className="text-[#d7ff4f] font-mono block">{batchTxHash ? 'Tempo L1 Testnet' : 'Awaiting live wallet'}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
                      <span className="text-zinc-500 block uppercase text-[10px]">{batchTxHash ? 'Total paid' : 'Total planned'}</span>
                      <span className="text-[#d7ff4f] font-semibold block">
                        {settledWorkerIds.size} of {selectedPreset.subcontractors.length} Nodes (${Array.from(settledWorkerIds).reduce<number>((acc, id) => acc + (selectedPreset.subcontractors.find(x => x.id === id)?.costPathUsd || 0), 0).toFixed(4)} USD)
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] text-[11px] text-zinc-300 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span>{batchTxHash ? 'Differentiated micro-settlements were released on Tempo L1 after delivery checks.' : 'Each payment step is planned against the budget and is not sent until a live wallet is connected.'} Total pipeline cost: ${(selectedPreset.subcontractors.reduce((acc, s) => acc + s.costPathUsd, 0)).toFixed(4)} USD of {(selectedPreset as any).budgetLimit || '$0.0500 cap'}.</span>
                      <span className="text-[#d7ff4f] font-mono font-semibold">
                        {selectedPreset.id === 'swarm_media_creative' ? 'Surplus: $0.0255 protected' : selectedPreset.id === 'swarm_arbitrage' ? 'Surplus: $0.0040 protected' : 'Surplus: $0.0030 protected'}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between flex-wrap gap-2 text-[10.5px]">
                      <span className="text-zinc-400">Cryptographic Batch Record:</span>
                      <div className="flex items-center gap-2">
                        {batchTxHash ? (
                          <>
                            <span className="font-mono text-[#d7ff4f]">
                              {batchTxHash.slice(0, 10)}...{batchTxHash.slice(-8)}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(batchTxHash, 'receipt_batch_hash')}
                              className="px-2 py-0.5 rounded bg-white/[0.06] hover:bg-white/10 text-zinc-300 hover:text-white font-mono text-[10px] flex items-center gap-1 transition cursor-pointer"
                            >
                              {copiedKey === 'receipt_batch_hash' ? (
                                <span className="text-[#d7ff4f] font-semibold">Copied!</span>
                              ) : (
                                <span>Copy Hash</span>
                              )}
                            </button>
                          </>
                        ) : (
                          <span className="text-zinc-400 font-mono">Multi-Party Settlement Record</span>
                        )}
                        <a
                          href={batchTxHash ? `https://explore.tempo.xyz/tx/${batchTxHash}` : undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#d7ff4f] hover:text-white flex items-center gap-1 font-mono text-[10px] hover:underline"
                        >
                          <span>View Tx ↗</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Dispatched Worker Micro-Traces Breakdown */}
                  {lastBatchResult?.dispatchedWorkers && lastBatchResult.dispatchedWorkers.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-white/[0.08]">
                      <div className="flex items-center justify-between text-zinc-400 text-[10.5px]">
                        <span className="font-semibold text-zinc-300">Subcontractor Settlements ({lastBatchResult.dispatchedWorkers.length})</span>
                        <span className="font-mono text-[#d7ff4f]">Batch ID: {lastBatchResult.swarmBatchId || 'swarm_batch_active'}</span>
                      </div>
                      <div className="max-h-[180px] overflow-y-auto space-y-1.5 pr-1 [scrollbar-width:thin]">
                        {lastBatchResult.dispatchedWorkers.map((dw: any, idx: number) => (
                          <div key={idx} className="p-2 rounded-lg bg-black/40 border border-white/[0.05] flex items-center justify-between text-[10px] font-mono gap-2">
                            <div className="min-w-0">
                              <span className="text-zinc-200 font-semibold block truncate">{dw.subcontractorRole}</span>
                              <span className="text-zinc-500 block truncate text-[9px]">{dw.targetEndpoint} • Trace: {dw.traceId?.slice(0, 16)}...</span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[#d7ff4f] font-bold block">${Number(dw.settledCostPathUsd).toFixed(4)}</span>
                              <span className="text-zinc-500 text-[9px]">Nonce: {dw.nonce2D || '0x01'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: LIVE LEDGER STREAM */}
              {activeConsoleTab === 'logs' && (
                <div className="rounded-xl bg-black/80 border border-white/[0.08] p-4 font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between text-zinc-400 pb-2 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-[#d7ff4f]" />
                      <span className="text-zinc-200 font-bold">Transaction Ledger Event Stream</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-sans">Real-time audit log</span>
                  </div>

                  <div ref={ledgerContainerRef} className="h-[220px] max-h-[220px] overflow-y-auto overscroll-contain space-y-1 text-[11px] text-zinc-300 pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.25)_transparent]">
                    {executionLog.length === 0 && !isExecuting && (
                      <span className="text-zinc-500 italic block py-12 text-center">
                        Awaiting execution events.
                      </span>
                    )}
                    {executionLog.map((log, index) => (
                      <div
                        key={index}
                        className={`leading-relaxed ${
                          log.includes('✓') || log.includes('Audited') || log.includes('AUDITED') || log.includes('COMPLETE')
                            ? 'text-emerald-400 font-medium'
                            : log.includes('▶') || log.includes('ORCHESTRATOR') || log.includes('DISPATCH')
                            ? 'text-zinc-200 font-semibold'
                            : 'text-zinc-400'
                        }`}
                      >
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: PAY-PER-STREAMED-TOKEN (SSE) */}
      {subView === 'stream' && (
        <div className="space-y-6">
          {/* Executive Value Proposition Box */}
          <div className="p-4 rounded-xl bg-white/[.03] border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-white/[.05] border border-white/10 text-[#d7ff4f] mt-0.5">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-[#f5f5f2] flex items-center">
                  <span>1. Pay Word-by-Word</span>
                  <InfoBadge
                    title="Pay Word-by-Word"
                    text="AI generates text word-by-word. You are billed $0.00002 only for words actually received. No paying upfront for unread answers."
                  />
                </span>
                <span className="text-white/50">
                  Words stream in real-time. You only pay for what you actually receive ($0.00002/word).
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-white/[.05] border border-white/10 text-[#d7ff4f] mt-0.5">
                <Square className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-[#f5f5f2] flex items-center">
                  <span>2. Stop Anytime (&lt;15ms Freeze)</span>
                  <InfoBadge
                    title="Instant Stop (<15ms)"
                    text="Clicking Stop halts the connection in under 15ms. Metering freezes immediately so you never pay for unread text."
                  />
                </span>
                <span className="text-white/50">
                  Hit "Abort Stream" mid-sentence. Billing cuts off immediately without paying for the rest.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-white/[.05] border border-white/10 text-[#d7ff4f] mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-[#f5f5f2] flex items-center">
                  <span>3. One Final Micro-Receipt</span>
                  <InfoBadge
                    title="Final payment record"
                    text="Words are tallied as they arrive; the final amount is recorded when the stream completes or stops. A live wallet is required for an on-chain receipt."
                  />
                </span>
                <span className="text-white/50">
                  Words are counted live; the accumulated amount is recorded when finished. Live chain settlement requires a connected wallet.
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Stream Topic & Live Controls */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2 px-1">
                <span className="px-2 py-0.5 rounded-md bg-[#d7ff4f] text-[#08090c] font-black text-[10px] tracking-wider uppercase">
                  STEP 1
                </span>
                <span className="text-xs font-bold text-white tracking-wide">Select Inference Stream &amp; Metering</span>
              </div>
              <div className="p-4 rounded-xl bg-white/[.04] border border-white/15 space-y-4">
                <span className="text-xs font-bold text-[#f5f5f2] uppercase tracking-wider block">
                  Select Inference Stream Topic
                </span>

                <div className="space-y-2 text-xs">
                  <button
                    onClick={() => setStreamTopic('tempo_arbitrage')}
                    disabled={isStreaming}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      streamTopic === 'tempo_arbitrage'
                        ? 'bg-[#d7ff4f]/[.08] border-[#d7ff4f]/50 text-[#f5f5f2]'
                        : 'bg-black/40 border-white/[.08] text-white/50'
                    }`}
                  >
                    <div className="font-bold text-xs text-[#f5f5f2] mb-0.5">Market Market Comparison &amp; Micro-Pricing</div>
                    <p className="text-[11px] text-white/50">Simulates real-time pricing and a budgeted sub-cent payment step.</p>
                  </button>

                  <button
                    onClick={() => setStreamTopic('sec_audit')}
                    disabled={isStreaming}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      streamTopic === 'sec_audit'
                        ? 'bg-[#d7ff4f]/[.08] border-[#d7ff4f]/50 text-[#f5f5f2]'
                        : 'bg-black/40 border-white/[.08] text-white/50'
                    }`}
                  >
                    <div className="font-bold text-xs text-[#f5f5f2] mb-0.5">Code Sandbox &amp; Risk Testing</div>
                    <p className="text-[11px] text-white/50">Executes automated code testing and risk models in real time.</p>
                  </button>

                  <button
                    onClick={() => setStreamTopic('general_ai')}
                    disabled={isStreaming}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      streamTopic === 'general_ai'
                        ? 'bg-[#d7ff4f]/[.08] border-[#d7ff4f]/50 text-[#f5f5f2]'
                        : 'bg-black/40 border-white/[.08] text-white/50'
                    }`}
                  >
                    <div className="font-bold text-xs text-[#f5f5f2] mb-0.5">External Tools &amp; Data Verification</div>
                    <p className="text-[11px] text-white/50">Live tool response verification with a budget check.</p>
                  </button>
                </div>

                {/* Per-token pricing stats */}
                <div className="p-3 rounded-lg bg-black/40 border border-white/[.08] space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white/50">Rate Model:</span>
                    <span className="text-[#d7ff4f] font-bold">$0.000020 / token</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white/50">Transport:</span>
                    <span className="text-[#d7ff4f]">HTTP/2 Server-Sent Events</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white/50">Abort Latency:</span>
                    <span className="text-zinc-200">&lt; 15ms Immediate Cutoff</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleStartSseStream}
                    disabled={isStreaming}
                    className="flex-1 py-2.5 rounded-lg bg-[#d7ff4f] hover:bg-[#bce63b] text-[#0c0f12] font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isStreaming ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Streaming Tokens...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start SSE Stream</span>
                      </>
                    )}
                  </button>

                  {isStreaming && (
                    <button
                      onClick={handleAbortStream}
                      className="px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Abort Stream</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Live Token Stream Receiver & Real-time Accumulator */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 px-1">
                <span className="px-2 py-0.5 rounded-md bg-[#d7ff4f] text-[#08090c] font-black text-[10px] tracking-wider uppercase">
                  STEP 2
                </span>
                <span className="text-xs font-bold text-white tracking-wide">Live token stream and payment record</span>
              </div>
              {/* Telemetry Bar */}
              <div className="p-3 rounded-xl bg-white/[.04] border border-white/15 grid grid-cols-3 gap-2 font-mono text-center">
                <div>
                  <span className="text-[10px] text-white/50 uppercase block">Tokens Received</span>
                  <span className="text-base font-bold text-[#f5f5f2]">{streamTokens.length}</span>
                </div>
                <div>
                  <span className="text-[10px] text-white/50 uppercase block">Tracked cost</span>
                  <span className="text-base font-bold text-[#d7ff4f]">${streamCost.toFixed(6)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-white/50 uppercase block">Parallel Lane</span>
                  <span className="text-base font-bold text-[#d7ff4f]">{streamNonce}</span>
                </div>
              </div>

              {/* Live Streaming Terminal / Word Accumulator */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/[.08] font-mono text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/[.08]">
                  <div className="flex items-center gap-2">
                    <Radio className={`w-3.5 h-3.5 ${isStreaming ? 'text-[#d7ff4f]' : 'text-white/50'}`} />
                    <span className="text-[#f5f5f2] font-bold">Live Model Stream Output</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    streamStatus === 'STREAMING_ACTIVE' 
                      ? 'bg-black/60 text-[#d7ff4f] border border-white/10'
                      : streamStatus === 'STREAM_ABORTED_ZERO_LEAKAGE'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : streamStatus === 'STREAM_COMPLETED_SUCCESS'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-white/[.04] text-white/50'
                  }`}>
                    {streamStatus}
                  </span>
                </div>

                <div className="min-h-[160px] max-h-[220px] overflow-y-auto p-3 rounded-lg bg-white/[.04]/50 border border-white/[.08] text-[#f5f5f2] leading-relaxed text-[13px] font-sans">
                  {streamTokens.length === 0 && !isStreaming && (
                    <span className="text-white/50 italic font-mono text-xs block py-8 text-center">
                      Select a topic and click "Start SSE Stream" to witness off-chain token counting and batch settlement. Click "Abort" anytime to test zero overcharge.
                    </span>
                  )}

                  {streamTokens.map((t, idx) => (
                    <span key={idx} className="inline-block transition-opacity duration-150 animate-fade-in mr-1">
                      {t}
                    </span>
                  ))}

                  {isStreaming && (
                    <span className="inline-block w-2 h-4 bg-[#d7ff4f] align-middle ml-1"></span>
                  )}
                </div>

                {/* Proof & Leakage Audit Info */}
                {streamTraceInfo && (
                  <div className="p-2.5 rounded-lg bg-[#d7ff4f]/[.08] border border-[#d7ff4f]/40 text-[11px] text-white/50 space-y-1">
                    <div className="flex items-center justify-between text-[#f5f5f2] font-bold">
                      <span className="flex items-center gap-1.5 text-[#d7ff4f]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{streamLiveConfirmed ? 'Confirmed payment receipt' : 'Evaluation payment record'}</span>
                      </span>
                      <span className="text-[10px] font-mono text-zinc-300">
                        {streamLiveConfirmed && streamTraceInfo.blockHeight ? `Tempo block #${streamTraceInfo.blockHeight.toLocaleString()}` : 'No chain receipt'}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-300">
                      • {streamTraceInfo.leakagePrevented}
                    </div>
                    <div className="text-[10px] font-mono text-slate-300">
                      • Payment reference: <code className="text-[#d7ff4f]">{streamLiveConfirmed ? (streamTraceInfo.txHash || streamTraceInfo.finalTraceId) : (streamTraceInfo.streamId || 'evaluation')}</code>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: MCP SERVER FOR CLAUDE & CURSOR */}
      {subView === 'mcp' && (
        <div className="space-y-6">
          {/* Top Info Banner */}
          <div className="p-4 rounded-xl bg-white/[.03] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#d7ff4f] text-[#0c0f12] font-black text-xs font-mono">
                  DESKTOP AI WALLET
                </span>
                <h3 className="font-bold text-sm text-[#f5f5f2] flex items-center">
                  <span>Connect Claude Desktop &amp; Cursor to Tempo L1</span>
                  <InfoBadge
                    title="Desktop AI Micro-Payments"
                    text="Connects an AI client to the payment flow. It can request approved licensed or private resources within a strict $0.05 limit; a live wallet is needed before funds move."
                  />
                </h3>
              </div>
              <p className="text-xs text-white/50">
                Claude Desktop and Cursor can directly execute paid APIs, query blockchain state, and hire bot helpers on Tempo L1 under a strict spend limit.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/api/mcp/manifest"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-white/[.04] hover:bg-[#1e2630] border border-white/15 text-[#f5f5f2] text-xs font-mono flex items-center gap-1.5"
              >
                <Globe className="w-3.5 h-3.5 text-[#d7ff4f]" />
                <span>View Manifest JSON</span>
              </a>
            </div>
          </div>

          {/* 2-Column: Left Configuration Snippets, Right Live JSON-RPC Tester */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Claude Desktop & Cursor Configuration */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center gap-2 px-1">
                <span className="px-2 py-0.5 rounded-md bg-[#d7ff4f] text-[#08090c] font-black text-[10px] tracking-wider uppercase">
                  STEP 1
                </span>
                <span className="text-xs font-bold text-white tracking-wide">Agent Client Configuration (Claude Desktop & Cursor)</span>
              </div>
              {/* Claude Desktop Config Card */}
              <div className="p-4 rounded-xl bg-white/[.04] border border-white/15 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#f5f5f2] flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-[#d7ff4f]" />
                    <span>Claude Desktop Configuration (<code className="text-[#d7ff4f] text-[11px]">claude_desktop_config.json</code>)</span>
                    <InfoBadge
                      title="Claude Stdio / JSON-RPC Bridge"
                      text="Connects Anthropic Claude Desktop to Tempo L1. Claude automatically discovers Synapse tools to unlock HTTP 402 endpoints."
                    />
                  </span>
                  <button
                    onClick={() => copyToClipboard(claudeDesktopConfigJson, 'claude')}
                    className="text-xs font-mono text-white/50 hover:text-[#f5f5f2] flex items-center gap-1"
                  >
                    {copiedKey === 'claude' ? <CheckCircle2 className="w-3.5 h-3.5 text-[#d7ff4f]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'claude' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-black/40 border border-white/[.08] text-[11px] font-mono text-slate-300 overflow-x-auto">
                  {claudeDesktopConfigJson}
                </pre>
              </div>

              {/* Cursor MCP Config Card */}
              <div className="p-4 rounded-xl bg-white/[.04] border border-white/15 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#f5f5f2] flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#d7ff4f]" />
                    <span>Cursor MCP Integration (<code className="text-[#d7ff4f] text-[11px]">cursor_mcp.json</code>)</span>
                    <InfoBadge
                      title="Cursor IDE Agent Gateway"
                      text="Enables Cursor's background agent to autonomously pay for documentation, live financial feeds, and containerized sandbox runs."
                    />
                  </span>
                  <button
                    onClick={() => copyToClipboard(cursorMcpConfigJson, 'cursor')}
                    className="text-xs font-mono text-white/50 hover:text-[#f5f5f2] flex items-center gap-1"
                  >
                    {copiedKey === 'cursor' ? <CheckCircle2 className="w-3.5 h-3.5 text-[#d7ff4f]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'cursor' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-black/40 border border-white/[.08] text-[11px] font-mono text-slate-300 overflow-x-auto">
                  {cursorMcpConfigJson}
                </pre>
              </div>
            </div>

            {/* Right: Live In-Browser JSON-RPC 2.0 Tester */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center gap-2 px-1">
                <span className="px-2 py-0.5 rounded-md bg-[#d7ff4f] text-[#08090c] font-black text-[10px] tracking-wider uppercase">
                  STEP 2
                </span>
                <span className="text-xs font-bold text-white tracking-wide">Interactive JSON-RPC 2.0 Test Runner</span>
              </div>
              <div className="p-4 rounded-xl bg-white/[.04] border border-white/15 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#f5f5f2] uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-[#d7ff4f]" />
                    Interactive JSON-RPC 2.0 Client
                  </span>
                  <span className="text-[10px] font-mono text-white/50">POST /api/mcp</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[11px] text-white/50 block mb-1">MCP Protocol Method</label>
                    <select
                      value={mcpMethod}
                      onChange={(e: any) => setMcpMethod(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/[.08] text-[#f5f5f2] font-mono text-xs focus:outline-none focus:border-[#d7ff4f]"
                    >
                      <option value="tools/call">tools/call (Execute Paid Tool)</option>
                      <option value="tools/list">tools/list (Discover Capabilities)</option>
                    </select>
                  </div>

                  {mcpMethod === 'tools/call' && (
                    <>
                      <div>
                        <label className="text-[11px] text-white/50 block mb-1">Select Tool Name</label>
                        <select
                          value={mcpToolName}
                          onChange={(e) => setMcpToolName(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/[.08] text-[#f5f5f2] font-mono text-xs focus:outline-none focus:border-[#d7ff4f]"
                        >
                          <option value="synapse_call_paid_api">synapse_call_paid_api (Pay 402 with Escrow)</option>
                          <option value="synapse_check_agent_budget">synapse_check_agent_budget (Query Balance)</option>
                          <option value="synapse_list_monetized_services">synapse_list_monetized_services (Registry)</option>
                        </select>
                      </div>

                      {mcpToolName === 'synapse_call_paid_api' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="sm:col-span-2">
                            <label className="text-[11px] text-white/50 block mb-1">Target Endpoint</label>
                            <input
                              type="text"
                              value={mcpTargetUrl}
                              onChange={(e) => setMcpTargetUrl(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/[.08] text-[#f5f5f2] font-mono text-xs focus:outline-none focus:border-[#d7ff4f]"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-white/50 block mb-1">Max Cost ($)</label>
                            <input
                              type="number"
                              step="0.0005"
                              value={mcpMaxCost}
                              onChange={(e) => setMcpMaxCost(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/[.08] text-[#f5f5f2] font-mono text-xs focus:outline-none focus:border-[#d7ff4f]"
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <button
                    onClick={handleTestMcp}
                    disabled={isMcpTesting}
                    className="w-full py-2.5 rounded-lg bg-[#d7ff4f] hover:bg-[#bce63b] text-[#0c0f12] font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isMcpTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>Dispatch MCP JSON-RPC Request</span>
                  </button>
                </div>

                {/* MCP Output Console */}
                <div className="pt-2 border-t border-white/[.08]">
                  <span className="text-[10px] font-mono text-white/50 uppercase block mb-1">
                    Server Response (JSON-RPC 2.0 Standard)
                  </span>
                  <pre className="p-3 rounded-lg bg-black/40 border border-white/[.08] text-[11px] font-mono text-[#d7ff4f] max-h-56 overflow-y-auto">
                    {mcpResponse ? JSON.stringify(mcpResponse, null, 2) : '// Response will appear here after dispatch...'}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: REALITY CHECK (HEAD-TO-HEAD: FREE SCRAPER VS SYNAPSE402) */}
      {subView === 'reality' && (
        <div className="space-y-6">
          {/* Executive Header Banner */}
          <div className="p-4 rounded-xl bg-white/[.03] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-[#d7ff4f]/10 text-[#d7ff4f] border border-[#d7ff4f]/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                  REALITY CHECK • SIDE-BY-SIDE PROOF
                </span>
                <span className="text-[10px] font-mono text-zinc-400">403 Forbidden vs paid response</span>
              </div>
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#d7ff4f]" />
                <span>Why Autonomous AI Agents Cannot Rely on Free Web Scraping</span>
                <InfoBadge
                  title="WAF Blocking Reality"
                  text="Modern Cloudflare/AWS WAF firewalls automatically detect Puppeteer/Playwright bots and issue 403 Forbidden or CAPTCHA challenges. Publishers earn $0, and agents get zero data."
                />
              </h3>
              <p className="text-xs text-zinc-300 mt-1 max-w-3xl leading-relaxed">
                Traditional crawlers can be blocked by web firewalls. Synapse402 gives an approved agent a paid, structured response; the budget is checked before the request and a live wallet is needed for on-chain settlement.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                id="btn-run-reality-check"
                onClick={handleRunRealityCheck}
                disabled={isRealityTesting}
                className="px-5 py-3 rounded-xl bg-[#d7ff4f] hover:bg-[#cbf540] text-[#08090c] font-black text-xs flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-md"
              >
                {isRealityTesting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#08090c]" />
                    <span>Executing Live Showdown...</span>
                  </>
                ) : (
                  <>
                    <Split className="w-4 h-4 text-[#08090c]" />
                    <span>Run Head-to-Head Test</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Test Target Selector */}
          <div className="p-3 rounded-xl bg-white/[.03] border border-white/[.08] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-mono">
              <span className="text-zinc-400 uppercase text-[10px]">Test Endpoint:</span>
              <select
                value={realityTarget}
                onChange={(e) => {
                  setRealityTarget(e.target.value);
                  const price = e.target.value.includes('sandbox') ? 0.005 : e.target.value.includes('article') ? 0.001 : 0.001;
                  setRealityPrice(price);
                }}
                className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-zinc-200 text-xs font-mono focus:outline-none focus:border-[#d7ff4f]"
              >
                <option value="/api/v1/data/stock-orderbook">L2 Orderbook Depth (/api/v1/data/stock-orderbook) - $0.0010</option>
                <option value="/api/v1/data/unlocked-article">Paywalled Financial Research (/api/v1/data/unlocked-article) - $0.0010</option>
                <option value="/api/v1/data/python-sandbox">Cloud Container Sandbox (/api/v1/data/python-sandbox) - $0.0050</option>
                <option value="/api/v1/test-provider-data">Neural Vision Cutout (/api/v1/test-provider-data) - $0.0005</option>
              </select>
            </div>
            <div className="text-[11px] font-mono text-zinc-400">
              Expected Synapse Micropayment: <strong className="text-[#d7ff4f]">${realityPrice} USD</strong>
            </div>
          </div>

          {/* Side-by-Side Dual Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT: TRADITIONAL WEB SCRAPER */}
            <div className="rounded-xl border border-rose-500/30 bg-black/40 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                    <XCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-rose-400 font-mono uppercase tracking-wider">
                      Standard Bot / Web Scraper (No Payment)
                    </h4>
                    <span className="text-[10px] text-zinc-400 font-mono">Approach: Unpaid Web Scraper (Free Bot)</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  scraperResult
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-white/[.04] text-zinc-400 border-white/10'
                }`}>
                  {scraperResult ? `HTTP ${scraperResult.status} FORBIDDEN` : 'Awaiting Test'}
                </span>
              </div>

              {/* Scraper Telemetry Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-black/40 border border-white/5">
                  <span className="text-[10px] text-zinc-400 block">Deliverable Data</span>
                  <strong className="text-rose-400 text-sm">{scraperResult ? '0 Bytes (BLOCKED)' : '—'}</strong>
                </div>
                <div className="p-2 rounded bg-black/40 border border-white/5">
                  <span className="text-[10px] text-zinc-400 block">Edge Latency</span>
                  <strong className="text-zinc-200 text-sm">{scraperResult ? `${scraperResult.durationMs}ms` : '—'}</strong>
                </div>
                <div className="p-2 rounded bg-black/40 border border-white/5">
                  <span className="text-[10px] text-zinc-400 block">Publisher Revenue</span>
                  <strong className="text-rose-400 text-sm">$0.0000</strong>
                  <span className="text-[9px] text-zinc-500 block">Wasted egress bandwidth</span>
                </div>
                <div className="p-2 rounded bg-black/40 border border-white/5">
                  <span className="text-[10px] text-zinc-400 block">Operator Cost</span>
                  <strong className="text-zinc-300 text-sm">~$49/mo</strong>
                  <span className="text-[9px] text-zinc-500 block">Proxy pool & CAPTCHA service</span>
                </div>
              </div>

              {/* Raw Response Window */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-zinc-400 block">Server Output (Intercepted by Edge WAF):</span>
                <pre className="p-3 rounded-lg bg-black/60 border border-white/10 text-[10px] font-mono text-rose-300 overflow-x-auto max-h-36 whitespace-pre-wrap">
                  {scraperResult ? scraperResult.rawSnippet : '// Click "Run Head-to-Head Test" to simulate traditional scraper interception...'}
                </pre>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-[11px] text-zinc-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Economic Failure:</strong> The website spent money on Cloudflare WAF to block the bot, and the AI agent operator obtained 0 usable data. Both parties lose.
                </span>
              </div>
            </div>

            {/* RIGHT: SYNAPSE402 AUTONOMOUS AGENT */}
            <div className="rounded-xl border border-white/10 bg-zinc-950/70 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#d7ff4f]/20 text-[#d7ff4f]">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#d7ff4f] font-mono uppercase tracking-wider">
                      Synapse402 Autonomous Agent (budgeted request)
                    </h4>
                    <span className="text-[10px] text-zinc-400 font-mono">Approach: HTTP 402 payment request</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  synapseResult
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-400'
                    : 'bg-white/[.04] text-zinc-400 border-white/10'
                }`}>
                  {synapseResult ? `HTTP ${synapseResult.status} OK` : 'Awaiting Test'}
                </span>
              </div>

              {/* Synapse Telemetry Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-black/40 border border-white/5">
                  <span className="text-[10px] text-zinc-400 block">Deliverable Data</span>
                  <strong className="text-[#d7ff4f] text-sm">{synapseResult ? '1,420 Bytes (Structured JSON)' : '—'}</strong>
                </div>
                <div className="p-2 rounded bg-black/40 border border-white/5">
                  <span className="text-[10px] text-zinc-400 block">Request latency</span>
                  <strong className="text-emerald-400 text-sm">{synapseResult ? `${synapseResult.durationMs}ms` : '—'}</strong>
                </div>
                <div className="p-2 rounded bg-black/40 border border-white/5">
                  <span className="text-[10px] text-zinc-400 block">Publisher Revenue</span>
                  <strong className="text-[#d7ff4f] text-sm">{synapseResult ? synapseResult.publisherEarned : '—'}</strong>
                  <span className="text-[9px] text-zinc-500 block">Direct into merchant vault</span>
                </div>
                <div className="p-2 rounded bg-black/40 border border-white/5">
                  <span className="text-[10px] text-zinc-400 block">Operator Cost</span>
                  <strong className="text-white text-sm">${realityPrice} USD</strong>
                  <span className="text-[9px] text-zinc-500 block">Zero monthly lock-in</span>
                </div>
              </div>

              {/* Raw JSON Payload Window */}
              <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block">{synapseResult ? 'Structured data returned (parsed JSON):' : 'Example structured data (parsed JSON):'}</span>
                <pre className="p-3 rounded-lg bg-black/60 border border-[#d7ff4f]/20 text-[10px] font-mono text-[#d7ff4f] overflow-x-auto max-h-36">
                  {synapseResult ? JSON.stringify(synapseResult.payload, null, 2) : '// Click "Run Head-to-Head Test" to see verified JSON delivery...'}
                </pre>
              </div>

              <div className="p-2.5 rounded-lg bg-[#d7ff4f]/10 border border-[#d7ff4f]/30 text-[11px] text-zinc-300 flex items-start gap-2">
                <Zap className="w-4 h-4 text-[#d7ff4f] shrink-0 mt-0.5" />
                <span>
                  <strong>Closed economic loop:</strong> The provider can charge per approved request and the agent receives structured data. In this environment the amount is recorded as an evaluation step; live settlement requires a wallet.
                </span>
              </div>
            </div>
          </div>

          {/* Comparison Matrix Table */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/[.08] space-y-3">
            <span className="text-xs font-bold text-zinc-200 uppercase font-mono tracking-wider block">
              Architectural Reality Matrix: Scraping vs Micropayments
            </span>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/[.08] text-zinc-400 text-[11px]">
                    <th className="py-2 px-3">Metric</th>
                    <th className="py-2 px-3 text-rose-400">Traditional Web Scrapers</th>
                    <th className="py-2 px-3 text-[#d7ff4f]">Synapse402 paid request</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[.04] text-zinc-300 text-[11px]">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-white">Success Reliability</td>
                    <td className="py-2.5 px-3 text-rose-400">~20–40% (Frequent IP bans & CAPTCHA)</td>
                    <td className="py-2.5 px-3 text-[#d7ff4f] font-bold">Cryptographic SLA ($0.00 Lost on Error)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-white">Execution Latency</td>
                    <td className="py-2.5 px-3 text-zinc-400">800–2,500ms (Heavy proxy overhead)</td>
                    <td className="py-2.5 px-3 text-[#d7ff4f] font-bold">Budget check before delivery; chain time depends on live wallet</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-white">Data Quality</td>
                    <td className="py-2.5 px-3 text-zinc-400">Dirty HTML, ads, cookie banners</td>
                    <td className="py-2.5 px-3 text-[#d7ff4f] font-bold">Clean, validated JSON schema</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-white">Publisher Revenue</td>
                    <td className="py-2.5 px-3 text-rose-400">$0.00 (Incurs WAF & server costs)</td>
                    <td className="py-2.5 px-3 text-[#d7ff4f] font-bold">0.1¢/req instant deposit (99.9% to seller)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-white">Billing Model</td>
                    <td className="py-2.5 px-3 text-zinc-400">$50–$500/mo fixed proxy retainers</td>
                    <td className="py-2.5 px-3 text-[#d7ff4f] font-bold">Pay-per-request ($0 monthly retainer)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DELIVERABLE PREVIEW MODAL */}
      {selectedDeliverablePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white/[.04] backdrop-blur-xl border border-[#d7ff4f]/40 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#d7ff4f] px-2 py-0.5 rounded bg-[#d7ff4f]/10 border border-[#d7ff4f]/30">
                  {selectedDeliverablePreview.badge}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1.5">{selectedDeliverablePreview.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDeliverablePreview(null)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-black/60 rounded-xl p-4 border border-white/[0.06] font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
              {evaluationCopy(selectedDeliverablePreview.content)}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/10 text-xs font-mono">
              <span className="text-zinc-500 text-[11px]">{batchTxHash ? 'Settled on Tempo L1 (Chain 42431)' : 'Evaluation deliverable · no chain receipt'} • Zero Subscriptions</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    navigator.clipboard.writeText(evaluationCopy(selectedDeliverablePreview.content));
                    setCopiedKey('deliverable_modal');
                    setTimeout(() => setCopiedKey(null), 2000);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#d7ff4f] text-[#08090c] font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedKey === 'deliverable_modal' ? '✓ Copied to Clipboard' : 'Copy Content'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDeliverablePreview(null)}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
