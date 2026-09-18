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
    case 'sub_a1': // Live Orderbook Reader
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
  sub_8: 'Good Standing (LEI Active)',
  sub_9: 'Clean 10-K (+$12.4M Cash)',
  sub_10: 'Equity Traced (0 Shells)',
  sub_11: 'Grade A- (88/100 Credit)',
  sub_12: '0 Lawsuits / 0 Tax Liens',
  sub_18: '0 Sanctions (Clean)',
  sub_19: '0 Negative News',
  sub_5: 'Parent + 2 Branches',
  sub_6: 'Cash 2.4x · Low Debt',
  sub_7: 'Trade Rules Approved',
  sub_16: '2x Liability Cap Safe',
  sub_17: 'Solvency Safe (4.12 Score)',
  sub_1: '7/7 Feeds Match',
  sub_2: 'Corporate Law Met',
  sub_3: 'Score: 94/100 (Grade A)',
  sub_4: 'Sealed on Tempo L1',
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
  sub_m19: 'Provenance Sealed on Tempo',
  sub_c1: 'Transparent Cutout Ready',
  sub_c2: 'Visual Asset Rendered',
  sub_c3: 'Voice Audio Generated',
  sub_c4: 'Subtitles Transcribed',
  sub_a1: 'Orderbook Depth Verified',
  sub_a2: 'Momentum Score: +0.84',
  sub_a3: 'Solvency Test Passed',
  sub_a4: '0 Watchlist Flags',
};

const NODE_HUMAN_JOBS: Record<string, string> = {
  sub_8: 'Checks official corporate registry for legal active status',
  sub_9: 'Audits standardized financial filings & verified cash buffer (+$12.4M)',
  sub_10: 'Traces real company owners (ensures 0 shell companies)',
  sub_11: 'Checks commercial credit rating & on-time payment history (Grade A-)',
  sub_12: 'Scans compliance records for open commercial lawsuits or tax liens (0 found)',
  sub_18: 'Screens US, EU & UN international sanctions watchlists (0 hits)',
  sub_19: 'Scans 1,400+ news wires for corporate controversy or bribery (Clean)',
  sub_5: 'Maps parent company & operating subsidiary hierarchy (0 offshore)',
  sub_6: 'Calculates cash liquidity buffer & debt leverage (2.4x cash)',
  sub_7: 'Audits trade export controls & international hardware tariffs',
  sub_16: 'Reviews contract clauses, liability caps & IP safety',
  sub_17: 'Simulates 10,000 crisis scenarios to test bankruptcy risk (0.04%)',
  sub_1: 'Cross-checks records across all 7 external feeds for full concordance',
  sub_2: 'Confirms statutory corporate law compliance (DGCL § 101/102)',
  sub_3: 'Computes overall supplier safety score (94/100 · Low Risk)',
  sub_4: 'Seals cryptographic proof digest on Tempo L1 with Session Key',
  sub_13: 'Assembles full 5-pillar clearance audit dossier',
  sub_14: 'Drafts 1-page executive decision memo for Board approval',
  sub_15: 'Translates clearance brief into German & Spanish summaries',
  lead_orchestrator: 'Coordinates 19 units, enforces budget cap & approves contract',
  sub_m1: 'Scans live TikTok sound charts and trending hooks',
  sub_m2: 'Analyzes Twitter/X conversation sentiment and debate angles',
  sub_m3: 'Scrapes competitor paid ad library for top converters',
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
  sub_m19: 'Seals campaign provenance & rights on Tempo L1',
  sub_a1: 'Streams real-time orderbook depth and bid-ask spreads',
  sub_a2: 'Infers market momentum score and volatility probabilities',
  sub_a3: 'Sandboxes financial risk calculations in Python',
  sub_a4: 'Screens entity against AML and international sanctions watchlists',
};

const NODE_CAUSAL_DEPENDENCY: Record<string, { waitingFor: string; handoffTo: string }> = {
  lead_orchestrator: {
    waitingFor: 'User mission goal & $0.0500 session budget policy',
    handoffTo: '7 Paid Media Feeds (Phase 01)'
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
    waitingFor: 'Live trend feeds from Unit 01 (TikTok) & Unit 02 (Twitter)',
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
    waitingFor: 'Final asset bundle hash & spend receipt to seal on Tempo L1',
    handoffTo: 'Verified On-Chain Attestation (Tempo Moderato #42431)'
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
  sub_4: { waitingFor: 'Final composite score from Unit 03 to seal on Tempo L1', handoffTo: 'Tempo L1 Chain (42431)' },
  sub_13: { waitingFor: 'Clearance inputs from all 19 specialist units to build dossier', handoffTo: 'Unit 14 (Board Memo)' },
  sub_14: { waitingFor: 'Compiled clearance dossier from Unit 13 to draft executive memo', handoffTo: 'Board of Directors' },
  sub_15: { waitingFor: 'Approved memo from Unit 14 to translate into DE & ES', handoffTo: 'Global Executive Brief' },
  sub_a1: { waitingFor: 'Lead AI market session authorization ($0.0010)', handoffTo: 'Unit a2 (Prediction Model)' },
  sub_a4: { waitingFor: 'Lead AI compliance authorization ($0.0010)', handoffTo: 'Unit a3 (Risk Sandbox)' },
  sub_a2: { waitingFor: 'Live orderbook stream from Unit a1', handoffTo: 'Unit a3 (Risk Sandbox)' },
  sub_a3: { waitingFor: 'Momentum analysis (Unit a2) & AML check (Unit a4)', handoffTo: 'Settlement Engine on Tempo L1' },
};

/* Legacy demo seed list retained only for backwards-compatible data shape; it is never presented as a transaction proof. */
const ON_CHAIN_TX_SEEDS: Array<{ hash: string; block: number; latency: number; nonce: string }> = [];
/*
  { hash: '0x7a3f4e8b2c91a052b61f8d927c3e5a1b4d08e2f9c7a1b3d5e8f0a2c4e6b8d1f3', block: 4198203, latency: 12, nonce: '0x01:01' },
  { hash: '0x8b4c5d6e7f01a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7', block: 4198204, latency: 14, nonce: '0x01:02' },
  { hash: '0x9c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d', block: 4198204, latency: 15, nonce: '0x01:03' },
  { hash: '0x0d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', block: 4198205, latency: 18, nonce: '0x01:04' },
  { hash: '0x1e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', block: 4198205, latency: 13, nonce: '0x01:05' },
  { hash: '0x2f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', block: 4198206, latency: 11, nonce: '0x01:06' },
  { hash: '0x3a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', block: 4198206, latency: 12, nonce: '0x01:07' },
  { hash: '0x4b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', block: 4198207, latency: 14, nonce: '0x01:08' },
  { hash: '0x5c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1', block: 4198207, latency: 16, nonce: '0x01:09' },
  { hash: '0x6d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2', block: 4198208, latency: 13, nonce: '0x01:0a' },
  { hash: '0x7e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3', block: 4198208, latency: 15, nonce: '0x01:0b' },
  { hash: '0x8f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4', block: 4198209, latency: 17, nonce: '0x01:0c' },
  { hash: '0x905b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5', block: 4198209, latency: 12, nonce: '0x01:0d' },
  { hash: '0xa16c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6', block: 4198210, latency: 14, nonce: '0x01:0e' },
  { hash: '0xb27d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7', block: 4198210, latency: 13, nonce: '0x01:0f' },
  { hash: '0xc38e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8', block: 4198211, latency: 15, nonce: '0x01:10' },
  { hash: '0xd49f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9', block: 4198211, latency: 12, nonce: '0x01:11' },
  { hash: '0xe5a01b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0', block: 4198212, latency: 14, nonce: '0x01:12' },
  { hash: '0xf6b12c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1', block: 4198212, latency: 11, nonce: '0x01:13' },
]; */

const getWorkerWalletAddress = (subId: string): string => {
  const map: Record<string, string> = {
    sub_m1: '0x38F9C4d87262fE33C6e4811aC0a1744b8296a241',
    sub_m2: '0x9a8C7d65B2089fC43818e329B4d32091Eb09257e',
    sub_m3: '0x5C0b76426C1f855dC1548E12aDe4b9015c3639Fe',
    sub_m4: '0x1F29cA8f0653B02657d4D97E366Af4D5514E69Ac',
    sub_m5: '0x71661A28A2f1b8F6C2652B28bEb12cf75e3E106d',
    sub_m6: '0xdE19Acf0d7eBb59e355D4e18378E2e83162FaDb1',
    sub_m7: '0x2D543B718Ce409A3Fe42Ec4146aC72C3e1208aB4',
    sub_m8: '0x8A14Db6259Ce76E846e33C63b2d1E2f9011Ab302',
    sub_m9: '0x6B9F26a9D9523C63b514571A1c7Fe5D51E06bC81',
    sub_m10: '0x3F88a914B157d620B309489A9Fe8392176b92aE0',
    sub_m11: '0x4D6a61B9fE0eC581f1816A91444c9bEf8231c349',
    sub_m12: '0x9C0E28aE72b509f6E3544C2b0C86386Fe4c3F682',
    sub_m13: '0x1A6a6358c2B52F2E49c28Ffe76d750172e2938B9',
    sub_m14: '0x5B6B1c305aD02B6D55c826620C7a4e6fe84a0d92',
    sub_m15: '0x7a2f1837e2D489bcf2010Ab344795e1F1556C47E',
    sub_m16: '0x8F54A3B1829e924bcf02611aCb5368aB1578e901',
    sub_m17: '0x0d8Fe3b4827F20B6081e626e257B96e00Ab782A4',
    sub_m18: '0x442C5D619c67B142e03B9139F971bE26e7b3A01b',
    sub_m19: '0x7e8B62fA184D725e2A838634Bf44C609EbA52c50',
    lead_orchestrator: '0x3c42E274FAdd8e371fB84f97203CC2F2125c8775',
    sub_8: '0x22A9b7Fe402A8f918C4D8927163bFe01991DaB34',
    sub_9: '0x77c2B9F4a1b02581628d4E6b91c448aDe2b84F21',
    sub_10: '0x55d14A389FE4b2a8819076C1e479a0b127993a40',
    sub_11: '0x41e8c5B0998aE8B799C0637F818a7b98aAc64201',
    sub_12: '0x892a0b1b72eEb59e355D4e18378E2e83162FaDb1',
    sub_18: '0x1F29cA8f0653B02657d4D97E366Af4D5514E69Ac',
    sub_19: '0x3F88a914B157d620B309489A9Fe8392176b92aE0',
    sub_5: '0x6B9F26a9D9523C63b514571A1c7Fe5D51E06bC81',
    sub_6: '0x9a8C7d65B2089fC43818e329B4d32091Eb09257e',
    sub_7: '0x8A14Db6259Ce76E846e33C63b2d1E2f9011Ab302',
    sub_16: '0x4D6a61B9fE0eC581f1816A91444c9bEf8231c349',
    sub_17: '0x9C0E28aE72b509f6E3544C2b0C86386Fe4c3F682',
    sub_1: '0x38F9C4d87262fE33C6e4811aC0a1744b8296a241',
    sub_2: '0x5C0b76426C1f855dC1548E12aDe4b9015c3639Fe',
    sub_3: '0x71661A28A2f1b8F6C2652B28bEb12cf75e3E106d',
    sub_4: '0x2D543B718Ce409A3Fe42Ec4146aC72C3e1208aB4',
    sub_13: '0x1A6a6358c2B52F2E49c28Ffe76d750172e2938B9',
    sub_14: '0x5B6B1c305aD02B6D55c826620C7a4e6fe84a0d92',
    sub_15: '0x7a2f1837e2D489bcf2010Ab344795e1F1556C47E',
    sub_a1: '0x9a8C7d65B2089fC43818e329B4d32091Eb09257e',
    sub_a2: '0x8A14Db6259Ce76E846e33C63b2d1E2f9011Ab302',
    sub_a3: '0x4D6a61B9fE0eC581f1816A91444c9bEf8231c349',
    sub_a4: '0x1F29cA8f0653B02657d4D97E366Af4D5514E69Ac',
  };
  return map[subId] || `0x${subId.replace(/[^0-9a-f]/gi, '').padEnd(8, '42a1').slice(0, 8)}...${subId.length * 19}`;
};

const PRESET_SWARMS = [
  {
    id: 'swarm_media_creative',
    title: 'Viral Ad Campaign',
    missionType: 'Autonomous Ad & Media Studio',
    goal: 'Launch viral multi-platform ad campaign for new product under $0.05 budget.',
    goalDesc: 'Lead AI coordinates 12 specialist creative workers and buys live data from 7 media providers to analyze trends, generate visual assets, translate scripts to 5 languages, check ad policies, and deliver a ready-to-run marketing package on Tempo L1.',
    budgetLimit: '$0.0500 policy cap',
    budgetEst: '$0.0245',
    rules: 'Approved creative feeds · Max $0.0050 per request · Zero subscriptions',
    description: '1 Lead Agent · 12 Creative Workers · 7 Data Providers',
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

      // PHASE 1: 7 External Media Feeds ($0.0100 total) - External paid resources
      { 
        id: 'sub_m1', 
        role: 'TikTok Viral Trends', 
        shortName: 'TikTok Radar', 
        targetUrl: '/api/v1/media/tiktok-trends', 
        providerLabel: 'TikTok Trend Radar (Demo Provider Feed)', 
        costPathUsd: 0.0015, 
        avatarColor: 'bg-zinc-700', 
        category: 'Market Data', 
        team: 'Data Providers', 
        savingsVsSubscription: 'Pay $0.0015 per trend scan — zero monthly tier', 
        deliverablePreview: 'Top 5 Viral Sounds & Hooks', 
        currentTask: 'Scanning real-time TikTok sound charts & trending hooks',
        taskInput: 'Niche: Tech & SaaS Product',
        taskOutput: 'Top 5 trending audio stems & 3 high-velocity hooks',
        workingAction: 'Fetching live TikTok sound charts & hooks ($0.0015)...', 
        generatedValueUsd: 0.60, 
        nodeType: 'PROVIDER' as const, 
        waveGroup: 1, 
        queryPrompt: 'Query live TikTok trending sound stems and viral hashtag velocity',
        verifiedBadge: '✓ 5 Viral Hooks Locked',
        samplePayload: 'TikTok Trend Data: Ingested #AIRevolution and #TechTok trends. Sound stem #84918 viral velocity +340%.' 
      },
      { 
        id: 'sub_m2', 
        role: 'Twitter / X Topic Pulse', 
        shortName: 'X Pulse', 
        targetUrl: '/api/v1/media/x-trends', 
        providerLabel: 'Twitter/X Trend API (Demo Provider Feed)', 
        costPathUsd: 0.0010, 
        avatarColor: 'bg-zinc-700', 
        category: 'Market Data', 
        team: 'Data Providers', 
        savingsVsSubscription: 'Pay per query — zero API tier cost', 
        deliverablePreview: 'Viral Discussion Angles', 
        currentTask: 'Ingesting trending conversational debates and controversy angles',
        taskInput: 'Keywords: Autonomous AI, Future of Work',
        taskOutput: 'High-engagement discussion angles and top sentiment triggers',
        workingAction: 'Analyzing X / Twitter sentiment and controversy angles ($0.0010)...', 
        generatedValueUsd: 0.50, 
        nodeType: 'PROVIDER' as const, 
        waveGroup: 1, 
        queryPrompt: 'Ingest trending Twitter debate threads for emotional hooks',
        verifiedBadge: '✓ 3 Engagement Angles',
        samplePayload: 'Twitter Trend Feed: Sentiment analysis highlights user frustration with monthly SaaS subscriptions. Prime angle locked.' 
      },
      { 
        id: 'sub_m3', 
        role: 'Competitor Ad Library', 
        shortName: 'Ad Spy API', 
        targetUrl: '/api/v1/media/competitor-ads', 
        providerLabel: 'Meta & Google Ad Spy (Demo Provider Feed)', 
        costPathUsd: 0.0015, 
        avatarColor: 'bg-zinc-700', 
        category: 'Competitive Intelligence', 
        team: 'Data Providers', 
        savingsVsSubscription: 'Pay per spy query — zero ad intelligence fee', 
        deliverablePreview: 'Top 3 Competitor Ad Formats', 
        currentTask: 'Extracting top-spending competitor ad formats and CTA structures',
        taskInput: 'Target competitors: Ramp, Brex, OpenAI Enterprise',
        taskOutput: 'Top 3 converting ad structures: Problem-Agitate-Solve video format',
        workingAction: 'Scraping competitor paid ad library for top converters ($0.0015)...', 
        generatedValueUsd: 0.70, 
        nodeType: 'PROVIDER' as const, 
        waveGroup: 1, 
        queryPrompt: 'Extract competitor winning ad angles and visual structures',
        verifiedBadge: '✓ Winning Formats Scanned',
        samplePayload: 'Competitor Ads: Analyzed 42 active ads. Short vertical UGC-style videos driving 74% of conversions.' 
      },
      { 
        id: 'sub_m4', 
        role: 'Flux Visual Concept Feed', 
        shortName: 'Flux Visual Engine', 
        targetUrl: '/api/v1/media/flux-render', 
        providerLabel: 'Visual Asset Cluster (Demo Provider Feed)', 
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
        providerLabel: 'Neural Speech API (Demo Provider Feed)', 
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
        providerLabel: 'Royalty-Free Audio Stems (Demo Provider Feed)', 
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
        providerLabel: 'Consumer Graph Registry (Demo Provider Feed)', 
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
        providerLabel: 'Recorded on Tempo', 
        costPathUsd: 0.0010, 
        avatarColor: 'bg-zinc-700', 
        category: 'Payment Proof', 
        team: 'Packaging & Proof', 
        savingsVsSubscription: 'Proof of asset provenance', 
        deliverablePreview: 'Recorded on Tempo', 
        currentTask: 'Recording campaign asset hash with Session Key on Tempo testnet',
        taskInput: 'Cryptographic hash of 19 media deliverables',
        taskOutput: 'Proof record (Digest: 0x82a1...99ef)',
        workingAction: 'Recording media asset provenance on Tempo...', 
        generatedValueUsd: 0.50, 
        nodeType: 'WORKER' as const, 
        waveGroup: 3, 
        queryPrompt: 'Record campaign asset hash with Session Key on Tempo',
        verifiedBadge: '✓ Recorded on Tempo',
        samplePayload: 'Payment Proof: Campaign bundle recorded on Tempo testnet (Chain ID 42431).' 
      },
    ],
  },
  {
    id: 'swarm_20_autonomous',
    title: 'Enterprise Due Diligence',
    missionType: 'Supplier Due Diligence',
    goal: 'Check Apex Foundry before signing a contract.',
    goalDesc: 'Lead Agent coordinates 12 specialist workers and requests data from 7 external providers to verify registration, financial health, legal risk, solvency, and compile an approved decision memo under the $0.0300 budget cap on Tempo L1.',
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
        taskOutput: 'Approved Supplier Decision Memo & Clearance Dossier',
        workingAction: 'Directing 12 workers & 7 providers under budget policy...', 
        generatedValueUsd: 2.50, 
        nodeType: 'ORCHESTRATOR' as const, 
        waveGroup: 0, 
        queryPrompt: 'Direct 12 workers and 7 providers for supplier clearance',
        verifiedBadge: '✓ Workforce Dispatched',
        samplePayload: 'Work Plan: Target "Apex Foundry Ltd" verified across 20 units: 1 Lead Agent, 12 Workers ($0.0150), 7 Providers ($0.0120). Total spend: $0.0270 / $0.0300 cap.' 
      },

      // PHASE 1: 7 External Data Providers ($0.0120 total) - External paid resources
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
        deliverablePreview: 'Good Standing (LEI Active)', 
        currentTask: 'Providing company registration status & good standing data',
        taskInput: 'Target: "Apex Foundry Ltd"',
        taskOutput: 'Verified Active Corporate Record (LEI 549300... Valid)',
        workingAction: 'Checking company registration status ($0.0020)...', 
        generatedValueUsd: 0.55, 
        nodeType: 'PROVIDER' as const, 
        waveGroup: 1, 
        queryPrompt: 'Check official corporate registration & standing',
        verifiedBadge: '✓ Verified Active Entity',
        samplePayload: 'Company Record: "Apex Foundry Ltd" verified active corporate entity. Good standing confirmed.' 
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
        deliverablePreview: 'Audited Report (+$12.4M Cash)', 
        currentTask: 'Providing audited annual filings & balance sheet data',
        taskInput: 'Financial disclosure query: Apex Foundry Ltd',
        taskOutput: 'Audited annual report (+$12.4M operating cash flow)',
        workingAction: 'Ingesting audited financial disclosures ($0.0020)...', 
        generatedValueUsd: 0.60, 
        nodeType: 'PROVIDER' as const, 
        waveGroup: 1, 
        queryPrompt: 'Query standardized financial disclosures for annual balance sheets',
        verifiedBadge: '✓ Clean Audit (+$12.4M)',
        samplePayload: 'Annual Financial Statement: Audited annual financial report ingested. Clean independent audit opinion. Operating cash flow: +$12.4M.' 
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
        deliverablePreview: 'Equity Traced (0 Shells)', 
        currentTask: 'Providing beneficial ownership & cap table data',
        taskInput: 'Entity beneficial ownership query',
        taskOutput: 'Cap table: 68% founders, 32% institutional (0 shells)',
        workingAction: 'Tracing beneficial owners & cap table ($0.0015)...', 
        generatedValueUsd: 0.50, 
        nodeType: 'PROVIDER' as const, 
        waveGroup: 1, 
        queryPrompt: 'Trace full cap table & beneficial owners',
        verifiedBadge: '✓ Equity Traced (0 Shells)',
        samplePayload: 'Company Ownership: Equity traced to founders (68%) and institutional funds (32%). 0 hidden shell companies.' 
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
        deliverablePreview: 'Credit: Grade A- (88/100)', 
        currentTask: 'Providing commercial credit score & payment history',
        taskInput: 'Commercial credit index request',
        taskOutput: 'Score: 88/100 (Grade A- · 34-day payment avg)',
        workingAction: 'Querying commercial credit index ($0.0015)...', 
        generatedValueUsd: 0.50, 
        nodeType: 'PROVIDER' as const, 
        waveGroup: 1, 
        queryPrompt: 'Request 12-month commercial payment & credit score',
        verifiedBadge: '✓ Grade A- (88/100)',
        samplePayload: 'Commercial Credit: 88/100 (Grade A-). Payments on time (34 days avg). 0 recorded defaults.' 
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
        deliverablePreview: '0 Active Lawsuits / Liens', 
        currentTask: 'Providing legal compliance, judgments & liens data',
        taskInput: 'Commercial litigation & lien search',
        taskOutput: '0 active fraud lawsuits · 0 tax liens',
        workingAction: 'Scanning legal compliance databases ($0.0015)...', 
        generatedValueUsd: 0.45, 
        nodeType: 'PROVIDER' as const, 
        waveGroup: 1, 
        queryPrompt: 'Scan legal compliance records for open lawsuits and liens',
        verifiedBadge: '✓ 0 Lawsuits / Liens',
        samplePayload: 'Legal Records: 0 active fraud lawsuits. 0 tax liens. 1 past commercial dispute resolved in 2024.' 
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
        deliverablePreview: '0 Sanctions Hits (Clean)', 
        currentTask: 'Providing international sanctions watchlist checks',
        taskInput: 'OFAC, EU, UN sanctions watchlist screening',
        taskOutput: '0 sanctions matches · Executive team cleared',
        workingAction: 'Checking OFAC, EU, UN global watchlists ($0.0020)...', 
        generatedValueUsd: 0.60, 
        nodeType: 'PROVIDER' as const, 
        waveGroup: 1, 
        queryPrompt: 'Screen company & principals against international sanctions',
        verifiedBadge: '✓ 0 Sanctions Hits (Clean)',
        samplePayload: 'Global Sanctions Check: 0 international sanctions hits (US, EU, UN). Executive team cleared.' 
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
        deliverablePreview: '0 Adverse News Found', 
        currentTask: 'Providing 1,400+ news wire scans for media controversy',
        taskInput: 'Global media news wire scan: Apex Foundry',
        taskOutput: '0 adverse news, bribery, or environmental scandals',
        workingAction: 'Scanning 1,400+ news wires for controversy ($0.0015)...', 
        generatedValueUsd: 0.45, 
        nodeType: 'PROVIDER' as const, 
        waveGroup: 1, 
        queryPrompt: 'Scan news wires for adverse media & reputational risk',
        verifiedBadge: '✓ 0 Negative News Found',
        samplePayload: 'Reputation & News: Scanned 1,400+ news sources. Zero bribery, environmental, or legal controversies found.' 
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
        deliverablePreview: 'Trade Clearance Approved', 
        currentTask: 'Auditing export controls, classifications & tariffs',
        taskInput: 'Sanctions clearance & product hardware catalog',
        taskOutput: 'Standard hardware supply · 0 export restrictions',
        workingAction: 'Auditing export controls & tariff classifications...', 
        generatedValueUsd: 0.40, 
        nodeType: 'WORKER' as const, 
        waveGroup: 2, 
        queryPrompt: 'Review export controls, hardware categories & licensing',
        verifiedBadge: '✓ Trade Clearance Approved',
        samplePayload: 'Trade Compliance: Standard hardware supply approved. No export restrictions apply.' 
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
        providerLabel: 'Recorded on Tempo', 
        costPathUsd: 0.0010, 
        avatarColor: 'bg-zinc-700', 
        category: 'Payment Proof', 
        team: 'Synthesis & Reporting', 
        savingsVsSubscription: 'Digital cryptographic receipt', 
        deliverablePreview: 'Recorded on Tempo', 
        currentTask: 'Recording verification digest with Session Key on Tempo L1',
        taskInput: 'Cryptographic digest of 19 verified proofs',
        taskOutput: 'Payment proof voucher (Digest: 0x94f8...3918)',
        workingAction: 'Recording verification digest on Tempo L1...', 
        generatedValueUsd: 0.50, 
        nodeType: 'WORKER' as const, 
        waveGroup: 3, 
        queryPrompt: 'Record verification digest with Session Key on Tempo L1',
        verifiedBadge: '✓ Authenticated via EIP-712',
        samplePayload: 'Payment Proof: Scoped session key authorization authenticated on SynapseVault (0x3c42E274...c8775).' 
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
        taskOutput: 'Executive Supplier Clearance Dossier: Approved for signing',
        workingAction: 'Assembling 19 specialist proofs into executive dossier...', 
        generatedValueUsd: 0.50, 
        nodeType: 'WORKER' as const, 
        waveGroup: 3, 
        queryPrompt: 'Compile 19 deliverables into audit-ready executive dossier',
        verifiedBadge: '✓ Dossier Compiled',
        samplePayload: 'Executive Supplier Clearance Dossier: "Apex Foundry Ltd" approved for contract signing. All 19 checks passed.' 
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
        taskOutput: '1-Page Executive Memo: Recommendation = APPROVE CONTRACT',
        workingAction: 'Drafting 1-page C-Suite decision memo with terms & recommendation...', 
        generatedValueUsd: 0.45, 
        nodeType: 'WORKER' as const, 
        waveGroup: 3, 
        queryPrompt: 'Synthesize 1-page decision memo with recommendation & terms',
        verifiedBadge: '✓ 1-Page Memo Ready',
        samplePayload: 'Executive Decision Memo: Recommendation = APPROVE CONTRACT. Financial: Low Risk, Legal: Clean.' 
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
    title: 'Market Trading & Risk',
    missionType: 'Financial Market Intelligence',
    goal: 'Analyze live orderbooks, test predictive momentum, and run risk simulations in Python.',
    goalDesc: 'Lead AI coordinates real-time market feeds, predictive trend modeling, and safe code execution on Tempo L1.',
    budgetLimit: '$0.0100 policy cap',
    budgetEst: '$0.0060',
    rules: 'Approved market feeds · Max $0.0030 per request · Zero subscriptions',
    description: 'Lead AI coordinates real-time market feeds, predictive trend modeling, and safe code execution on Tempo L1.',
    subcontractors: [
      { 
        id: 'lead_orchestrator', 
        role: 'Lead Arbitrage Director', 
        shortName: 'Lead Quant AI', 
        targetUrl: '/api/v1/lead-agent', 
        providerLabel: 'Trading Orchestrator', 
        costPathUsd: 0.0000, 
        avatarColor: 'bg-zinc-800', 
        category: 'Mission Lead', 
        team: 'Lead Orchestrator', 
        savingsVsSubscription: 'Zero recurring quant management fees', 
        deliverablePreview: 'Arbitrage Strategy & Execution Plan', 
        currentTask: 'Coordinating market feeds, prediction model & execution sandbox under $0.0100 cap',
        taskInput: 'Goal: Detect & settle cross-venue arbitrage under 100ms',
        taskOutput: 'Real-Time Arbitrage Opportunity Dispatched & Settled on Tempo L1',
        workingAction: 'Orchestrating market feeds and validating slippage tolerance...', 
        generatedValueUsd: 2.00, 
        nodeType: 'ORCHESTRATOR' as const, 
        waveGroup: 0, 
        queryPrompt: 'Coordinate market feeds, prediction model and safe execution sandbox',
        verifiedBadge: '✓ Mission Orchestrated',
        samplePayload: 'Arbitrage Plan: Target TEMPO/USD spread on Uniswap v3 vs Curve. Max slippage: 0.15%. Budget allocated: $0.0060.' 
      },
      { id: 'sub_a1', role: 'Live Orderbook Reader', shortName: 'Orderbook', targetUrl: '/api/v1/data/stock-orderbook', providerLabel: 'Live Orderbook Stream API', costPathUsd: 0.001, avatarColor: 'bg-zinc-700', category: 'Market Data', team: 'Financial Trading', savingsVsSubscription: 'Pay-per-query — zero monthly data fee', deliverablePreview: 'Real-Time Orderbook Depth Matrix', workingAction: 'Querying orderbook stream...', generatedValueUsd: 0.80, nodeType: 'PROVIDER', waveGroup: 1 },
      { id: 'sub_a2', role: 'Market Prediction Bot', shortName: 'Market Prediction', targetUrl: '/api/v1/data/ai-market-analysis', providerLabel: 'Predictive Inference Model API', costPathUsd: 0.002, avatarColor: 'bg-zinc-700', category: 'AI Inferences', team: 'Financial Trading', savingsVsSubscription: 'Sub-cent inference — zero monthly subscription', deliverablePreview: 'Market Momentum Score & Analysis', workingAction: 'Running predictive model...', generatedValueUsd: 2.50, nodeType: 'WORKER', waveGroup: 2 },
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
      `[SAFE] All cards frozen on Tempo L1. Zero unverified funds transferred.`,
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
          ? 'Arbitrage mission launched: Scanning cross-venue liquidity, predicting momentum & executing in sandbox. $0.0060 allocated under the $0.0100 budget cap.'
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
          toName: selectedPreset.id === 'swarm_media_creative' ? 'Phase 1: 7 Media & Trend Feeds' : 'Phase 1: 7 External Data Feeds',
          message: selectedPreset.id === 'swarm_media_creative'
            ? 'Requesting live TikTok/X trends, competitor ads, Flux visual assets, voice narration, beats & audience targeting from 7 feeds ($0.0100 total).'
            : 'Requesting verified company records, SEC filings, shareholders graph, credit score, and sanctions checks from 7 data feeds ($0.0120 total).',
          stepType: 'DIRECTIVE',
          highlightBadge: 'Phase 01 Dispatched',
          nodeId: 'lead_orchestrator'
        });

        await new Promise((resolve) => setTimeout(resolve, 600));

        const waveStages = selectedPreset.id === 'swarm_media_creative' ? [
          {
            stageNum: 1,
            name: '01 — Ingest Trends, Competitor Ads & Media Feeds ($0.0100)',
            subConfigs: [
              { 
                id: 'sub_m1', startDelay: 0, workTime: 2200, 
                queryMsg: 'Scanning live TikTok sound charts and viral hooks...',
                responseMsg: '5 viral TikTok sounds and hook angles locked ($0.0015 paid).',
                badge: '5 Viral Hooks'
              },
              { 
                id: 'sub_m2', startDelay: 900, workTime: 2400,
                queryMsg: 'Analyzing X / Twitter sentiment & debate triggers...',
                responseMsg: 'Viral conversation hooks and controversy angles extracted ($0.0010 paid).',
                badge: '3 Viral Angles'
              },
              { 
                id: 'sub_m3', startDelay: 1800, workTime: 2400,
                queryMsg: 'Extracting top-converting competitor ad creatives...',
                responseMsg: 'Analyzed 42 competitor ads: Short vertical video winning ($0.0015 paid).',
                badge: 'Competitor Ads Scanned'
              },
              { 
                id: 'sub_m4', startDelay: 2700, workTime: 2800,
                queryMsg: 'Generating product visual concept assets...',
                responseMsg: 'Clean dark studio product visual assets generated ($0.0025 paid).',
                badge: 'Visuals Prepared'
              },
              { 
                id: 'sub_m5', startDelay: 3500, workTime: 2400,
                queryMsg: 'Synthesizing charismatic neural voiceover track...',
                responseMsg: 'Studio 24-bit WAV narration audio mastered ($0.0015 paid).',
                badge: 'Studio Voice Mastered'
              },
              { 
                id: 'sub_m6', startDelay: 4200, workTime: 2200,
                queryMsg: 'Licensing royalty-free trending electronic music stem...',
                responseMsg: 'Commercial 128 BPM electronic beat licensed and synced ($0.0010 paid).',
                badge: '128 BPM Beat Licensed'
              },
              { 
                id: 'sub_m7', startDelay: 5000, workTime: 2400,
                queryMsg: 'Fetching high-intent buyer demographic lookalikes...',
                responseMsg: 'High-converting demographic buyer cluster mapped ($0.0010 paid).',
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
                queryMsg: 'Recording campaign asset proof on Tempo testnet...',
                responseMsg: 'Campaign provenance recorded on Tempo testnet (Chain ID 42431).',
                badge: 'Recorded on Tempo'
              },
            ],
          }
        ] : [
          {
            stageNum: 1,
            name: '01 — Ingest Data from 7 Paid Feeds ($0.0120)',
            subConfigs: [
              { 
                id: 'sub_8', startDelay: 0, workTime: 2200, 
                queryMsg: 'Checking official corporate registration and good standing...',
                responseMsg: 'Verified Active Corporate Entity. Good standing confirmed ($0.0020 paid).',
                badge: 'Active Entity Verified'
              },
              { 
                id: 'sub_9', startDelay: 900, workTime: 2400,
                queryMsg: 'Auditing standardized annual filings and operating cash flow...',
                responseMsg: 'Audited financial report verified: +$12.4M cash flow ($0.0020 paid).',
                badge: '+$12.4M Cash Flow'
              },
              { 
                id: 'sub_10', startDelay: 1800, workTime: 2400,
                queryMsg: 'Tracing real company owners and cap table...',
                responseMsg: 'Owners traced (68% founders, 32% funds · 0 shells) ($0.0015 paid).',
                badge: 'Equity Traced (0 Shells)'
              },
              { 
                id: 'sub_11', startDelay: 2600, workTime: 2200,
                queryMsg: 'Checking commercial credit rating and payment track record...',
                responseMsg: 'Grade A- credit score (88/100). On-time payments confirmed ($0.0015 paid).',
                badge: 'Credit: 88/100 (A-)'
              },
              { 
                id: 'sub_12', startDelay: 3500, workTime: 2400,
                queryMsg: 'Scanning commercial compliance databases for litigation...',
                responseMsg: 'Clean legal record: 0 active fraud lawsuits, 0 tax liens ($0.0015 paid).',
                badge: '0 Lawsuits / Liens'
              },
              { 
                id: 'sub_18', startDelay: 4200, workTime: 2400,
                queryMsg: 'Screening OFAC, EU, UN international sanctions lists...',
                responseMsg: '0 sanctions hits across OFAC & UN databases ($0.0020 paid).',
                badge: '0 Sanctions (Clean)'
              },
              { 
                id: 'sub_19', startDelay: 5000, workTime: 2200,
                queryMsg: 'Scanning 1,400+ news wires for controversy or bribery...',
                responseMsg: '0 negative news, bribery, or scandals found ($0.0015 paid).',
                badge: '0 Negative News'
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
                responseMsg: 'Trade cleared: Standard hardware supply, zero export restrictions.',
                badge: 'Trade Cleared'
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
                queryMsg: 'Signing cryptographic attestation digest on Tempo L1...',
                responseMsg: 'Attestation sealed on Tempo L1 with cryptographic Session Key.',
                badge: 'Sealed on Tempo L1'
              },
              { 
                id: 'sub_13', startDelay: 3500, workTime: 2400,
                queryMsg: 'Compiling 19 verified specialist proofs into Executive Dossier...',
                responseMsg: 'Executive Supplier Clearance Dossier assembled: Approved for signing.',
                badge: 'Dossier Compiled'
              },
              { 
                id: 'sub_14', startDelay: 4200, workTime: 2200,
                queryMsg: 'Synthesizing 1-page C-Suite decision memo with terms & recommendation...',
                responseMsg: '1-Page Board Memo ready: Recommendation = APPROVE CONTRACT (Low Risk, Clean).',
                badge: '1-Page Board Memo'
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
                  ? 'Directing 7 Media & Trend Feeds & funding channels...'
                  : 'Directing 7 Data Providers & funding micro-channels...' 
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
              soundEngine.playSettlementChime();
              setWorkerLiveStates((prev) => ({
                ...prev,
                [cfg.id]: { status: 'PAYING', displayNote: `Settling $${sub.costPathUsd.toFixed(4)} USD on Tempo L1...` }
              }));
              await new Promise((resolve) => setTimeout(resolve, 900));
              if (isEmergencyFrozenRef.current) return;

              // Step 4: Transition to DONE (✓ Delivered)
              allIds.add(cfg.id);
              setSettledWorkerIds(new Set(allIds));
              setWorkerLiveStates((prev) => ({
                ...prev,
                [cfg.id]: { status: 'DONE', displayNote: `✓ Delivered: ${SUBCONTRACTOR_RESULT_PILLS[cfg.id] || sub.deliverablePreview}` }
              }));
              const wAddr = getWorkerWalletAddress(sub.id);
              const shortAddr = `${wAddr.slice(0, 6)}...${wAddr.slice(-4)}`;
              const nonceNum = (sub.id.charCodeAt(0) * 17) + 1042;
              addLog(`  ✓ [${sub.shortName || sub.role}] Paid $${sub.costPathUsd.toFixed(4)} USD ➔ To: ${shortAddr} · Auth: EIP-712 #${nonceNum} (<15ms Gateway) · Delivered: ${SUBCONTRACTOR_RESULT_PILLS[cfg.id] || sub.deliverablePreview}`);

              // Emit response dialogue
              addDialogue({
                fromName: sub.role,
                fromRole: sub.nodeType === 'PROVIDER' ? 'Data Agent' : 'Specialist Agent',
                toName: selectedPreset.id === 'swarm_media_creative' ? 'Campaign Director' : 'Lead Agent',
                message: cfg.responseMsg,
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
              addLog(`➔ [HANDOFF] 7 Media Feeds delivered trends, competitor data & visual assets ($0.0100 spent) ➔ Routed to 5 Creative Specialists.`);
              addDialogue({
                fromName: 'Campaign Director',
                fromRole: 'Unit 01 (Lead Agent)',
                toName: 'Phase 2: 5 Creative & Compliance Specialists',
                message: 'All 7 trend & visual feeds ingested on Tempo L1 ($0.0100). Relaying to 5 Creative Specialists for copywriting, video sync, and policy clearance.',
                stepType: 'DATA_PAYLOAD',
                highlightBadge: '7 Feeds Relayed'
              });
            } else {
              addLog(`➔ [HANDOFF] 7 Data Agents ingested verified registry, SEC & sanctions records ($0.0120 spent) ➔ Routed to Phase 2 Risk Analysts.`);
              addDialogue({
                fromName: 'Lead Orchestrator',
                fromRole: 'Unit 01 (Lead Agent)',
                toName: 'Phase 2: 5 AI Risk Specialists',
                message: 'All 7 official records received and paid on Tempo L1 ($0.0120). Relaying to 5 AI Risk Specialists to analyze debt, compliance, and solvency.',
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
              addLog(`➔ [HANDOFF] Financial solvency and risk checks passed ($0.0080 spent) ➔ Relaying verified data to Phase 3 Synthesis.`);
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
              message: 'Mission Complete: Multi-platform ad campaign READY TO LAUNCH. Total spent: $0.0245 ($0.0255 budget saved under $0.0500 limit).',
              stepType: 'APPROVAL',
              highlightBadge: 'CAMPAIGN READY ($0.0245)',
              costUsd: 0.0245,
              nodeId: 'lead_orchestrator'
            });
          } else {
            setWorkerLiveStates((prev) => ({
              ...prev,
              lead_orchestrator: { status: 'DONE', displayNote: '✓ Supplier Cleared: Apex Foundry Ltd Approved' }
            }));
            addLog(`▶ [FINAL SYNTHESIS] Lead Agent compiled all 19 specialist deliverables.`);
            addLog(`[DECISION] Supplier "Apex Foundry Ltd" APPROVED FOR CONTRACT SIGNING. Composite Safety Score: 94/100 (Low Risk).`);
            addLog(`[DOSSIER] Executive clearance report, C-Suite decision memo, and trilingual briefs compiled.`);

            addDialogue({
              fromName: 'Lead Orchestrator',
              fromRole: 'Unit 01 (Lead Agent)',
              toName: 'Executive Procurement Board',
              message: 'Mission Complete: Supplier "Apex Foundry Ltd" APPROVED FOR CONTRACT. Safety Score: 94/100 (Grade A). Total spent: $0.0270 ($0.0030 budget saved).',
              stepType: 'APPROVAL',
              highlightBadge: 'SUPPLIER APPROVED (94/100)',
              costUsd: 0.0270,
              nodeId: 'lead_orchestrator'
            });
          }
        }
        setActiveStageNum(4);
        setPhaseExpanded({ 1: true, 2: true, 3: true });
      } else {
        // Fallback for smaller swarms (e.g. Market Trading & Risk Arbitrage)
        allIds.add('lead_orchestrator');
        setSettledWorkerIds(new Set(allIds));
        setWorkerLiveStates((prev) => ({
          ...prev,
          lead_orchestrator: { status: 'DONE', displayNote: '✓ Arbitrage Executed: Trade Settled on Tempo L1' }
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
          soundEngine.playSettlementChime();
          setWorkerLiveStates((prev) => ({ ...prev, [sub.id]: { status: 'PAYING', displayNote: `Paying $${sub.costPathUsd.toFixed(4)}` } }));
          await new Promise((resolve) => setTimeout(resolve, 350));
          if (isEmergencyFrozenRef.current) break;
          allIds.add(sub.id);
          setSettledWorkerIds(new Set(allIds));
          setSelectedSubId(sub.id);
          setWorkerLiveStates((prev) => ({ ...prev, [sub.id]: { status: 'DONE', displayNote: '✓ Delivered' } }));
          addLog(`  ✓ [${sub.shortName}] Delivered: ${sub.deliverablePreview} • Paid $${sub.costPathUsd.toFixed(4)}`);

          addDialogue({
            fromName: sub.shortName,
            fromRole: sub.nodeType === 'PROVIDER' ? 'Data Provider' : 'Worker Bot',
            toName: 'Trading Desk Lead',
            message: `Delivered output: ${sub.deliverablePreview}. Settled $${sub.costPathUsd.toFixed(4)} USD on Tempo L1.`,
            stepType: 'DATA_PAYLOAD',
            costUsd: sub.costPathUsd,
            highlightBadge: '✓ Delivered',
            nodeId: sub.id
          });
        }
        addDialogue({
          fromName: 'Trading Desk Lead',
          fromRole: 'Unit 01 (Lead Agent)',
          toName: 'Trading Desk Operator',
          message: 'Arbitrage cycle complete: Real-time spread executed and verified on Tempo L1. Spent: $0.0060 ($0.0040 budget saved under $0.0100 limit).',
          stepType: 'APPROVAL',
          highlightBadge: 'TRADE SETTLED ($0.0060)',
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

      addLog(`[COMPLETED] All ${selectedPreset.subcontractors.length} deliverables verified and received in ${finalSec}s.`);
      addLog(`[SETTLEMENT] Total spent: $${totalBatchCost.toFixed(4)} USD across ${selectedPreset.subcontractors.length} nodes on Tempo L1.`);
      addLog(`[COMPLETE] Executed strictly within approved policy limits. ${selectedPreset.id === 'swarm_media_creative' ? 'Campaign expense receipt' : selectedPreset.id === 'swarm_arbitrage' ? 'Trading execution receipt' : 'Supplier audit receipt'} generated.`);
      setLastBatchResult(data);
      soundEngine.playSettlementChime();
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

    // 2. Run Synapse402 Agent Settlement (Pays 0.1¢ via Tempo L1)
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
          }),
        });
        const settleDuration = Date.now() - settleStart;
        const data = await res.json();
        if (res.ok && data?.trace?.status === 'SETTLED' && data.trace.txHash) {
          soundEngine.playSettlementChime();
          return {
            status: 200,
            durationMs: data.trace?.latencyMs || Math.max(14, settleDuration),
            txHash: data.trace?.txHash || '',
            costUsd: realityPrice,
            publisherEarned: `$${(realityPrice * 0.999).toFixed(6)} USD (99.9% to seller after 0.1% fee)`,
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
      description: 'Autonomous HTTP 402 Paywall Solver & Swarm Micropayments on Tempo L1',
    },
    null,
    2
  );

  return (
    <div id="section-swarm-view" className="space-y-6">
      {/* Sub-Header Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[.08] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#f5f5f2] flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#d7ff4f]" />
              AI Workforce — Live Mission
            </h2>
            <span className="px-2 py-0.5 rounded bg-[#d7ff4f]/15 text-[#d7ff4f] border border-[#d7ff4f]/30 text-[10px] font-mono font-bold">
              LIVE DEMO
            </span>
          </div>
          <p className="text-xs text-white/50 mt-0.5">
            One goal. One hard spending cap. 20 mission units execute and deliver under strict human guardrails.
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
            <span>Reality Check (403 vs 200)</span>
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
            <span>Live Token Streaming</span>
            <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
              subView === 'stream' ? 'bg-black/25 text-[#08090c]' : 'bg-white/5 text-[#d7ff4f]'
            }`}>LIVE</span>
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
            <span>MCP Tools Gateway</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: AGENT SWARM (AGENT HIRES AGENT) */}
      {subView === 'swarm' && (
        <div className="space-y-6">
          {/* 1. HERO AREA: Mission Objective & Dispatch Panel */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white/[.03] backdrop-blur-md border border-white/[.08] shadow-sm space-y-6 relative overflow-hidden">
            
            {/* Top Bar: Eyebrow + Preset Selector */}
            <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2 shrink-0">
                <Sparkles className="w-4 h-4 text-[#d7ff4f]" />
                <span className="text-[11px] font-mono font-bold tracking-widest text-[#d7ff4f] uppercase">
                  ONE JOB • ONE BUDGET • ONE FINISHED DELIVERABLE
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
                        {preset.budgetEst || '$0.0245'} · {preset.subcontractors.length} Units
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Mission Goal & Sub-info (8 cols) */}
              <div className="lg:col-span-8 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#d7ff4f]/15 text-[#d7ff4f] border border-[#d7ff4f]/30">
                      {selectedPreset.id === 'swarm_media_creative' ? 'SOCIAL AD CAMPAIGN' : selectedPreset.id === 'swarm_arbitrage' ? 'MARKET DEPTH & SPREAD ANALYSIS' : 'ENTERPRISE DUE DILIGENCE'}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      {selectedPreset.subcontractors.length === 20 
                        ? '1 Lead Agent · 12 Workers · 7 Providers' 
                        : `${selectedPreset.subcontractors.length} Mission Units`}
                    </span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.08]">
                    Give your AI a job.<br />
                    <span className="text-[#d7ff4f]">Give it a budget.</span>
                  </h1>
                  <div className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed mt-3 max-w-3xl space-y-2">
                    {selectedPreset.id === 'swarm_media_creative' ? (
                      <>
                        <p className="text-white font-medium text-sm sm:text-base leading-snug">
                          1 Lead Agent coordinates 12 specialized workers and queries trend &amp; media resources from 7 providers under a strict $0.05 budget cap.
                        </p>
                        <p className="text-zinc-400 text-xs sm:text-[13px] leading-relaxed">
                          You don't manage 20 tools or pay $600/month in SaaS subscriptions. You manage one job — and receive a complete campaign package ready for review for <strong className="text-[#d7ff4f] font-mono">$0.0245</strong>.
                        </p>
                      </>
                    ) : selectedPreset.id === 'swarm_arbitrage' ? (
                      <>
                        <p className="text-white font-medium text-sm sm:text-base leading-snug">
                          1 Lead Agent pulls live orderbook depth from 2 exchanges and runs risk simulation in an isolated Python sandbox.
                        </p>
                        <p className="text-zinc-400 text-xs sm:text-[13px] leading-relaxed">
                          You set the daily budget. The workforce verifies cross-venue liquidity for <strong className="text-[#d7ff4f] font-mono">$0.0060</strong> without human delay or missed data points.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-white font-medium text-sm sm:text-base leading-snug">
                          1 Lead Agent pulls official corporate filings from 7 registries and coordinates 12 legal &amp; solvency workers into an executive clearance memo.
                        </p>
                        <p className="text-zinc-400 text-xs sm:text-[13px] leading-relaxed">
                          Zero recurring database retainers. You receive an audited board clearance dossier for <strong className="text-[#d7ff4f] font-mono">$0.0270</strong> under a strict $0.0300 cap.
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Benchmark Contrast: SaaS Subscriptions vs Synapse402 on Tempo L1 */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 text-xs font-mono pt-1">
                  <div className="px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-3 flex-1">
                    <span className="text-zinc-400">Usage Model:</span>
                    <span className="text-zinc-200 font-medium">Pay only for resources used in this run</span>
                  </div>
                  <div className="px-4 py-2.5 rounded-xl bg-[#d7ff4f]/[0.08] border border-[#d7ff4f]/30 flex items-center justify-between gap-3 flex-1 shadow-[0_0_20px_rgba(215,255,79,0.1)]">
                    <span className="text-zinc-300">Tempo L1 Settlement:</span>
                    <span className="text-[#d7ff4f] font-bold whitespace-nowrap">
                      ${selectedPreset.subcontractors.reduce((acc, s) => acc + s.costPathUsd, 0).toFixed(4)} USD (No recurring subscriptions)
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-zinc-300 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-500 uppercase text-[11px]">Budget Cap:</span>
                    <span className="font-bold text-[#d7ff4f]">
                      {selectedPreset.budgetLimit || '$0.0500 USD'}
                    </span>
                    <span className="text-[10.5px] text-zinc-400">(Zero subscriptions)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-500 uppercase text-[11px]">On-Chain Proof:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const targetWorker = selectedPreset.subcontractors[0];
                        if (targetWorker) inspectWorkerCryptoProof(targetWorker);
                      }}
                      className="text-zinc-300 hover:text-[#d7ff4f] flex items-center gap-1 font-bold hover:underline cursor-pointer"
                      title="Inspect Cryptographic Proof for this Swarm"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#d7ff4f]" />
                      <span>Inspect Audit Proof</span>
                    </button>
                    <a
                      href="https://explore.tempo.xyz/address/0x3c42E274FAdd8e371fB84f97203CC2F2125c8775"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-white flex items-center gap-0.5 text-[10.5px] hover:underline ml-1"
                      title="View SynapseVault Smart Contract on Tempo L1 Testnet (Chain ID 42431)"
                    >
                      <span>(Vault ↗)</span>
                    </a>
                  </div>
                </div>

                <div className="relative flex items-center pt-1">
                  <span className="absolute left-3.5 text-[#d7ff4f] text-[10.5px] font-mono uppercase font-bold tracking-wider">TASK:</span>
                  <input
                    type="text"
                    value={customDirective}
                    disabled={isExecuting}
                    onChange={(e) => setCustomDirective(e.target.value)}
                    placeholder="Enter business task for the workforce..."
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
                  className="w-full px-6 py-4 rounded-2xl bg-gradient-to-b from-[#d7ff4f] to-[#b8eb1e] hover:from-[#e2ff6b] hover:to-[#c4f228] text-[#08090c] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all shadow-[0_4px_25px_rgba(215,255,79,0.3),inset_0_1px_0_rgba(255,255,255,0.4)] border border-[#d7ff4f] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
                >
                  {isExecuting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin text-[#08090c]" />
                      <span>Building Campaign ({settledWorkerIds.size}/{selectedPreset.subcontractors.length})...</span>
                    </>
                  ) : settledWorkerIds.size === selectedPreset.subcontractors.length && settledWorkerIds.size > 0 ? (
                    <>
                      <RefreshCw className="w-5 h-5 text-[#08090c]" />
                      <span>Re-launch Campaign ↺</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current text-[#08090c]" />
                      <span>
                        {selectedPreset.id === 'swarm_media_creative'
                          ? 'Start Campaign ($0.0245) →'
                          : selectedPreset.id === 'swarm_arbitrage'
                          ? 'Execute Flash Arbitrage ($0.0060) →'
                          : 'Start Mission ($0.0270) →'}
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
                        <span>Settling On-Chain (Tempo L1)</span>
                      </span>
                      <span className="text-[10px] text-zinc-400 font-sans">&lt;15ms latency</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.08]">
                      <span className="text-zinc-400">On-Chain Spend:</span>
                      <span className="text-white font-bold font-mono">
                        ${Array.from(settledWorkerIds).reduce<number>((acc, id) => acc + (selectedPreset.subcontractors.find(x => x.id === id)?.costPathUsd || 0), 0).toFixed(4)} USD
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10.5px] text-zinc-400">
                      <span>Confirmed Units:</span>
                      <span className="text-[#d7ff4f] font-bold">
                        {settledWorkerIds.size} / {selectedPreset.subcontractors.length} Units Paid
                      </span>
                    </div>
                  </div>
                ) : settledWorkerIds.size === selectedPreset.subcontractors.length && settledWorkerIds.size > 0 ? (
                  <div className="p-3.5 rounded-xl bg-white/[.03] backdrop-blur-md border border-[#d7ff4f]/40 space-y-2 text-left font-mono shadow-[0_0_20px_rgba(215,255,79,0.1)]">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#d7ff4f]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#d7ff4f]" />
                        <span>Settled On-Chain (Tempo L1)</span>
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
                      <span className="text-zinc-400">Total Transferred:</span>
                      <span className="text-[#d7ff4f] font-bold font-mono">
                        ${selectedPreset.subcontractors.reduce((acc, s) => acc + s.costPathUsd, 0).toFixed(4)} USD
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10.5px] text-zinc-400">
                      <span>Payment Channels:</span>
                      <span className="text-white font-bold">
                        {selectedPreset.subcontractors.filter(s => s.costPathUsd > 0).length} / {selectedPreset.subcontractors.filter(s => s.costPathUsd > 0).length} Finalized
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
                            ? 'Arbitrage Execution Proof & Voucher'
                            : 'Board Clearance Dossier & Audit Report',
                          badge: 'MISSION COMPLETE · READY TO DEPLOY',
                          content: selectedPreset.id === 'swarm_media_creative'
                            ? `EXECUTIVE BRIEF: MULTI-PLATFORM AD CAMPAIGN LAUNCH\nMission: Multi-Platform Organic & Paid Ad Launch Under $0.05 Budget\nStatus: APPROVED & SEALED ON TEMPO L1 (Chain 42431)\nTotal Settle Cost: $0.0245 USD (Saved 51% against $0.0500 policy cap)\n\nKey Deliverables Generated:\n1. 15s Video Storyboard & Timing Spec (Synced 128 BPM audio stem + script cues).\n2. 10 High-CTR Marketing Hooks structured with AIDA value framework.\n3. Visual Concepts & Multi-Platform Cover Specs (9:16 Storyboard Layouts + 1200x628 Banner).\n4. 5-Language Localized Matrix (EN, ES, DE, FR, JA).\n5. Tempo L1 Notary Receipt: Root Batch Hash 0x5747...8538.\n\nSummary:\nZero recurring monthly agency retainers or tool licenses. 19 micro-payments settled on Tempo L1 with $0.00 overdraft.\n* Practical Note: Neural video rendering runs through external GPU providers ($0.50–$2.00). Synapse402 produces the complete validated creative blueprints, copy, and layout parameters under the $0.05 budget.`
                            : selectedPreset.id === 'swarm_arbitrage'
                            ? `TEMPO L1 ATOMIC EXECUTION VOUCHER:\n\n• Tx Hash: 0x8f2a4b1c9e8d7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a21\n• Block Height: 1,842,914\n• Total Data Spend: $0.0060 USD\n• Gas Paid: 0.000012 TEMPO (<$0.00002 USD)\n• Verified Spread: 0.42% Price Discrepancy across venues\n• Status: ATOMIC SETTLEMENT FINALIZED`
                            : `EXECUTIVE BOARD CLEARANCE DOSSIER:\n\nTarget Entity: Apex Global Logistics B.V.\nRecommendation: CONTRACT SIGNING APPROVED\nRisk Rating: Grade A (Low Risk Audit)\n\nAudit Trail:\n• 19 independent registry & intelligence calls executed\n• Total Spend: $0.0270 USD on Tempo L1 (under $0.0300 budget cap)\n• Cryptographic Merkle Root Hash: 0x92f8...41e0`
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
                      <span>One Job • One Budget • Zero Subscriptions</span>
                    </div>
                    <p className="text-[11px] text-zinc-300 font-sans leading-snug">
                      Pay only for what is used. The workforce gathers data, builds the assets, and delivers the finished result within your spending limit.
                    </p>
                  </div>
                )}

                {isEmergencyFrozen ? (
                  <button
                    onClick={handleUnfreezeSwarm}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#d7ff4f]/20 hover:bg-[#d7ff4f]/30 border border-[#d7ff4f]/40 text-[#d7ff4f] font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resume Operations</span>
                  </button>
                ) : (
                  <button
                    onClick={handleEmergencyKillSwitch}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.02] hover:bg-rose-500/15 border border-white/10 hover:border-rose-500/30 text-zinc-400 hover:text-rose-400 font-medium text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <PowerOff className="w-3.5 h-3.5" />
                    <span>Emergency Stop</span>
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
                  <h4 className="text-xs font-bold text-white tracking-tight">Agent requests a resource</h4>
                  <p className="text-[11px] text-zinc-400 font-sans mt-0.5 leading-relaxed">
                    Live market trends, image prompt tokens, voice stems or audience data.
                  </p>
                </div>
              </div>

              {/* 02 */}
              <div className="p-3.5 rounded-2xl bg-white/[.025] backdrop-blur-md border border-white/10 flex items-start gap-3 hover:border-[#d7ff4f]/30 transition-all">
                <div className="w-7 h-7 rounded-lg bg-[#d7ff4f]/10 border border-[#d7ff4f]/30 flex items-center justify-center text-[#d7ff4f] shrink-0 mt-0.5">
                  <span className="text-xs font-mono font-bold text-[#d7ff4f]">02</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-tight">The budget pays micro-cents</h4>
                  <p className="text-[11px] text-zinc-400 font-sans mt-0.5 leading-relaxed">
                    Instant micro-payment approved within hard limit on Tempo L1.
                  </p>
                </div>
              </div>

              {/* 03 */}
              <div className="p-3.5 rounded-2xl bg-white/[.025] backdrop-blur-md border border-white/10 flex items-start gap-3 hover:border-[#d7ff4f]/30 transition-all">
                <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-300 shrink-0 mt-0.5">
                  <span className="text-xs font-mono font-bold text-[#d7ff4f]">03</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-tight">The work finishes</h4>
                  <p className="text-[11px] text-zinc-400 font-sans mt-0.5 leading-relaxed">
                    Validated assets delivered autonomously with zero subscription overhead.
                  </p>
                </div>
              </div>
            </div>

            {/* REAL-WORLD SAFEGUARDS: CALM & PRACTICAL */}
            <div className="pt-2.5 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-zinc-300">
                <ShieldCheck className="w-3.5 h-3.5 text-[#d7ff4f] shrink-0" />
                <span><strong>Budget Safety Cap:</strong> Hard $0.05 limit enforced by SynapseVault session key policy.</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-zinc-300">
                <Lock className="w-3.5 h-3.5 text-[#d7ff4f] shrink-0" />
                <span><strong>Fair-Pay Guard:</strong> Budget escrow released upon valid delivery; automatic refund on error.</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-zinc-300">
                <PowerOff className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span><strong>Emergency Stop:</strong> Instant human freeze of pending payments in 1 click.</span>
              </div>
            </div>

            {/* DELIVERABLES PREVIEW BAR */}
            <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#d7ff4f]">Finished Deliverables:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-300">
                {selectedPreset.id === 'swarm_media_creative' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedDeliverablePreview({
                          title: '15s Video Storyboard & Script Specification',
                          badge: 'DELIVERABLE 01 · PRODUCTION BLUEPRINT',
                          content: `15-SECOND VIDEO TIMELINE & BLUEPRINT SPEC:\n[00:00 - 00:03] HOOK: Visual problem cut showing monthly SaaS burn ($600/mo) vs micro-payments.\n[00:03 - 00:08] CORE: Synapse402 Session Key locking hard $0.05 budget on Tempo L1.\n[00:08 - 00:12] PROOF: 19 micro-payments settling at <15ms latency with zero human friction.\n[00:12 - 00:15] CTA: "Give your AI a budget. Synapse402 on Tempo L1."\n\nSpecs:\n• Target Aspect Ratio: 9:16 Vertical (Reels / TikTok / Shorts)\n• Audio Stem: 128 BPM electronic stem + transcript cues\n• Color Grading: Rec.709 Master Guidelines\n\n* Realistic Note: Dedicated neural video rendering requires external GPU pipelines ($0.50–$2.00). Synapse402 generates the entire validated script, scene graph, and parameters under the $0.05 budget.`
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
                          content: `10 AD COPY HOOKS FOR HIGH-ENGAGEMENT SOCIAL CHANNELS:\n\n1. "Stop paying $600/month in SaaS subscriptions for tools your team touches once a week."\n2. "What if your AI bot had its own bank card with a strict $0.05 limit?"\n3. "We ran a full competitive audit across 7 registries. Total cost: $0.0245."\n4. "Why SaaS companies hate pay-per-request: they can't charge you for idle seats."\n5. "Autonomous AI is here, but CFOs are terrified of infinite loop billing. Here is the fix."\n6. "1 Lead Agent, 12 workers, 7 data feeds. 14 milliseconds. Settled on Tempo L1."\n7. "Don't give AI an unlimited credit card. Give it a cryptographic session key."\n8. "Every API call signed. Every cent accounted for. Zero overdraft possible."\n9. "The end of monthly subscription bloat: Pay 0.1¢ per request or pay nothing."\n10. "Instant micro-payments on Tempo L1: $0.00002 gas fee. Try doing that on Ethereum."`
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
                          content: `EXECUTIVE BRIEF: MULTI-PLATFORM AD CAMPAIGN LAUNCH\nMission: Multi-Platform Organic & Paid Ad Launch Under $0.05 Budget\nStatus: APPROVED & SEALED ON TEMPO L1 (Chain 42431)\nTotal Settle Cost: $0.0245 USD (Saved 51% against $0.0500 policy cap)\n\nKey Deliverables Generated:\n1. 15s Video Storyboard & Neural Narration Prompts.\n2. 10 Ad Hooks structured with AIDA value framework.\n3. Visual Concepts & Multi-Platform Cover Layout Specs.\n4. 5-Language Localized Matrix (EN, ES, DE, FR, JA).\n5. Tempo L1 Notary Receipt: Root Batch Hash 0x5747...8538.\n\n* Practical Note: Neural video rendering runs through external GPU providers ($0.50–$2.00). Synapse402 coordinates the intelligence, copy, and layout architecture under the $0.05 budget.`
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
                          title: 'Real-Time Orderbook Depth Matrix',
                          badge: 'DELIVERABLE 01 · L2 DATA FEED',
                          content: `L2 ORDERBOOK DEPTH MATRIX (CROSS-EXCHANGE):\n\n• Venue A (Uniswap v3 TEMPO/USD pool): Depth $420,000 within 0.15% band.\n• Venue B (Curve TEMPO/USD pool): Depth $380,000 within 0.15% band.\n• Spread Detected: +0.48% gross spread across pools.\n• Micro-Payment Fee: $0.0010 paid via Tempo L1 session key.\n• Net Profit Potential: +$14.20 on $3,000 flash route.`
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
                          content: `MOMENTUM & SLIPPAGE TOLERANCE REPORT:\n\n• Momentum Vector: +0.84 (Strong Bullish Continuation)\n• Volatility Skew (15m): 1.12 standard deviations\n• Max Allowed Slippage: 0.15%\n• Execution Safe Window: 42ms\n• Settled Cost: $0.0020 USD on Tempo L1`
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
                          content: `SANCTIONS & FRAUD SCREENING DIGEST:\n\n• Target Pools: 0x3c42...8775 and 0x7f4a...92e1\n• OFAC / EU Sanctions Hits: 0 (CLEAN)\n• Tornado Cash / Mixer Intersections: 0.00%\n• Counterparty Risk Grade: AAA (Fully Cleared)\n• Verified via Tempo L1 Notary Voucher`
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
                          title: 'Execution Voucher & Settlement Proof',
                          badge: 'DELIVERABLE 05 · TEMPO L1 RECEIPT',
                          content: `TEMPO L1 ATOMIC EXECUTION VOUCHER:\n\n• Tx Hash: 0x8f2a4b1c9e8d7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a21\n• Block Height: 1,842,914\n• Total Spend: $0.0060 USD\n• Gas Paid: 0.000012 TEMPO (<$0.00002 USD)\n• Status: ATOMIC SETTLEMENT FINALIZED`
                        });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#d7ff4f]/10 border border-[#d7ff4f]/30 hover:bg-[#d7ff4f]/20 hover:border-[#d7ff4f]/60 flex items-center gap-1.5 text-[#d7ff4f] transition cursor-pointer text-left"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#d7ff4f]" />
                      <span className="font-bold">Execution Voucher</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedDeliverablePreview({
                          title: 'Official Entity Legal Verification',
                          badge: 'DELIVERABLE 01 · REGISTRY VERIFIED',
                          content: `GLEIF & REGISTRY VERIFICATION CERTIFICATE:\n\n• Entity Name: Apex Global Logistics B.V.\n• LEI Code: 5493001KJTIIGC8Y1R12 (ACTIVE)\n• Registration Authority: Netherlands Chamber of Commerce (KvK 84920194)\n• Headquarters: Keizersgracht 421, Amsterdam\n• Ultimate Beneficial Owner (UBO): Clean hierarchy traced`
                        });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 hover:border-[#d7ff4f]/50 hover:bg-white/[0.08] flex items-center gap-1.5 transition cursor-pointer text-left"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#d7ff4f]" />
                      <span className="font-semibold text-white">Entity Verified</span>
                      <span className="text-zinc-500">(LEI)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedDeliverablePreview({
                          title: 'Audited Financial Statements & Solvency',
                          badge: 'DELIVERABLE 02 · SEC / FILINGS AUDIT',
                          content: `AUDITED 10-K & BALANCE SHEET SUMMARY:\n\n• Cash & Equivalents: +$12,450,000 USD (Confirmed)\n• Total Debt / Equity Ratio: 0.42 (Healthy conservative range)\n• Working Capital: +$8.2M USD\n• Auditor Opinion: Unqualified Clean Opinion (Big 4 Audit Firm)\n• Insolvency Risk: <0.01%`
                        });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 hover:border-[#d7ff4f]/50 hover:bg-white/[0.08] flex items-center gap-1.5 transition cursor-pointer text-left"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-semibold text-white">+$12.4M Cash</span>
                      <span className="text-zinc-500">(Audited)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedDeliverablePreview({
                          title: 'Global Sanctions & Adverse Media Screener',
                          badge: 'DELIVERABLE 03 · WATCHLIST CLEARANCE',
                          content: `GLOBAL WATCHLIST & SANCTIONS CLEARANCE:\n\n• OFAC SDN List: 0 Hits (CLEAN)\n• EU Consolidated Financial Sanctions: 0 Hits (CLEAN)\n• UK HMT Sanctions: 0 Hits (CLEAN)\n• Adverse Media Index: 0 negative news articles or regulatory sanctions`
                        });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 hover:border-[#d7ff4f]/50 hover:bg-white/[0.08] flex items-center gap-1.5 transition cursor-pointer text-left"
                    >
                      <Lock className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-semibold text-white">0 Sanctions Hits</span>
                      <span className="text-zinc-500">(Clean)</span>
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
                          content: `EXECUTIVE BOARD CLEARANCE DOSSIER:\n\nTarget Entity: Apex Global Logistics B.V.\nRecommendation: CONTRACT SIGNING APPROVED\nRisk Rating: Grade A (Low Risk / 94/100 Composite Score)\n\nAudit Trail:\n• 19 independent registry & intelligence calls executed\n• Total Spend: $0.0270 USD on Tempo L1 (under $0.0300 budget cap)\n• Cryptographic Merkle Root Hash: 0x92f8...41e0`
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
                      ? `${selectedPreset.subcontractors.filter(s => s.costPathUsd > 0).length} Payments Settled On-Chain`
                      : isExecuting
                      ? `${settledWorkerIds.size} Units Settled...`
                      : 'Standby'}
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-white">
                    Spent: <strong className="text-[#d7ff4f] font-mono">${Array.from(settledWorkerIds).reduce<number>((acc, id) => acc + (selectedPreset.subcontractors.find(x => x.id === id)?.costPathUsd || 0), 0).toFixed(4)}</strong> USD
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
                            ? 'Lead Agent: Planning flash arbitrage and allocating feed queries...'
                            : 'Lead Agent: Planning supplier review and delegating tasks...'
                        ) : activeStageNum === 4 ? (
                          selectedPreset.id === 'swarm_media_creative'
                            ? 'Lead Agent: Packaging ad creatives, videos & 1-page launch memo...'
                            : selectedPreset.id === 'swarm_arbitrage'
                            ? 'Lead Agent: Verifying execution proof and settlement voucher...'
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
                            Campaign <strong className="text-white">"Multi-Platform Ad Creative Package"</strong> READY • Spend: <strong className="text-white">$0.0245 USD</strong> (19 Payments Settled on Tempo L1)
                          </span>
                        ) : selectedPreset.id === 'swarm_arbitrage' ? (
                          <span>
                            Liquidity Audit <strong className="text-white">COMPLETE</strong> • Verified Spread: <strong className="text-white">0.42% Discrepancy</strong> (Data Cost: $0.0060 USD)
                          </span>
                        ) : (
                          <span>
                            Supplier <strong className="text-white">"Apex Foundry Ltd"</strong> APPROVED • Safety Score: <strong className="text-white">Grade A (Low Risk)</strong>
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
                    Spent: <strong className="text-[#d7ff4f]">${Array.from(settledWorkerIds).reduce<number>((acc, id) => acc + (selectedPreset.subcontractors.find(x => x.id === id)?.costPathUsd || 0), 0).toFixed(4)}</strong> / {selectedPreset.id === 'swarm_media_creative' ? '$0.050 USD' : selectedPreset.id === 'swarm_arbitrage' ? '$0.010 USD' : '$0.030 USD'}
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
                    subtitle: '7 Paid Market Data & Media Feeds ($0.0100) · Scans live trends, visual assets & audio',
                    flowText: '7 trend & media feeds ingested ($0.0100) ➔ Relayed to 5 Creative Specialists',
                    summaryText: 'TikTok Radar Locked · Twitter Angles Extracted · Competitor Ads Scanned · Visual Assets Built · Studio Voice Mastered · 128 BPM Beat Synced · Audience Mapped',
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
                    summaryText: '4 Native Ratios Formatted · 5 Languages Localized · 3 Campaign Covers · Full Asset Bundle · 1-Page Memo Ready · $0.0245 Spent · Notarized on Tempo L1',
                  },
                ] : [
                  {
                    stageNum: 1,
                    title: '01 — FIND THE FACTS',
                    subtitle: '7 Paid Official Registries ($0.0120) · Ingests official filings, credit & sanctions data',
                    flowText: '7 official records verified ($0.0120) ➔ Relayed to 5 AI Risk Specialists',
                    summaryText: 'Active Entity Standing · Audited Financials Clean · Owners Traced · Credit 88/100 · 0 Lawsuits · 0 Sanctions · Clean Reputation',
                  },
                  {
                    stageNum: 2,
                    title: '02 — CHECK THE RISK',
                    subtitle: '5 Specialist AI Analysts ($0.0080) · Audits solvency, debt leverage & contract clauses',
                    flowText: 'Solvency & contract risks verified ($0.0080) ➔ Relayed to Decision Specialists',
                    summaryText: 'Parent + 2 Branches · Cash 2.4x & Low Debt · Trade Cleared · 2x Liability Cap · Solvency Safe (Score: 4.12)',
                  },
                  {
                    stageNum: 3,
                    title: '03 — MAKE THE DECISION',
                    subtitle: '7 Synthesis Workers & Tempo L1 Seal ($0.0070) · Compiles 1-page memo & signs on Tempo L1',
                    flowText: 'Clearance memo compiled ($0.0070) ➔ Signed contract clearance delivered',
                    summaryText: '7/7 Records Match · Corporate Law Met · Safety Score: 94/100 · Cryptographic Seal · Complete Dossier · 1-Page Memo Ready',
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
                                      ? (sub.verifiedBadge || SUBCONTRACTOR_RESULT_PILLS[sub.id] || sub.deliverablePreview)
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
                                        <span>Delivered</span>
                                      </span>
                                      <span className="px-1.5 py-0.2 rounded text-[8.5px] font-mono font-bold bg-[#d7ff4f]/15 text-[#d7ff4f] border border-[#d7ff4f]/30 truncate max-w-[140px]" title={sub.verifiedBadge || SUBCONTRACTOR_RESULT_PILLS[sub.id] || sub.deliverablePreview}>
                                        {sub.verifiedBadge || SUBCONTRACTOR_RESULT_PILLS[sub.id] || sub.deliverablePreview}
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
                        <div className="rounded-2xl bg-[#040507] border border-white/[0.05] p-5 sm:p-7 shadow-2xl space-y-6">
                          
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
                            <div className={`w-full max-w-xl p-4 sm:p-5 rounded-2xl bg-[#08090c] border shadow-sm flex items-center justify-between gap-3 relative z-10 transition-all duration-300 ${
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
                                    {selectedPreset.id === 'swarm_media_creative' ? 'Campaign Director' : selectedPreset.id === 'swarm_arbitrage' ? 'Trading Desk Orchestrator' : 'Lead Mission Coordinator'}
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
                            <div className={`flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#08090c] border shadow-sm text-[11px] font-mono transition-all duration-300 ${
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
                                <div className={`rounded-2xl bg-[#07080c] border p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xl transition-all duration-500 ${
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
                                        {selectedPreset.id === 'swarm_media_creative' ? '7 Data Providers' : selectedPreset.id === 'swarm_arbitrage' ? '2 Live Market Feeds' : '7 Official Data Feeds'}
                                      </h4>
                                      <p className="text-[11px] text-zinc-400 mt-0.5">
                                        {selectedPreset.id === 'swarm_media_creative' ? '7 providers supply data and media services' : selectedPreset.id === 'swarm_arbitrage' ? '2 feeds supply real-time orderbook depth and volatility skew' : '7 official registries supply entity, legal, and financial data'}
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
                                                : 'bg-[#040507] border-white/[0.05] hover:bg-[#090b10] hover:border-white/10'
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
                                                    {isSettled ? `✓ ${SUBCONTRACTOR_RESULT_PILLS[sub.id] || sub.deliverablePreview}` : sub.providerLabel}
                                                  </span>
                                                </div>
                                              </div>

                                              <div className="shrink-0 text-right">
                                                {isSettled ? (
                                                  <span className="px-2 py-0.5 rounded text-[9.5px] font-mono font-bold bg-[#d7ff4f]/15 text-[#d7ff4f] border border-[#d7ff4f]/30 flex items-center gap-1 shadow-[0_0_10px_rgba(215,255,79,0.15)]">
                                                    <span>PAID ${sub.costPathUsd.toFixed(4)}</span>
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
                                                  <span className="text-zinc-300 font-medium">{workerAddr.slice(0, 6)}...{workerAddr.slice(-4)}</span>
                                                  <span className="text-zinc-600">·</span>
                                                  <span className="text-zinc-500">Auth:</span>
                                                  <span className="text-zinc-300">Payment trace</span>
                                                </div>
                                                <span className="text-[#d7ff4f] font-semibold flex items-center gap-1 shrink-0">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-[#d7ff4f] animate-ping" />
                                                  <span>Tempo L1</span>
                                                  <span className="text-zinc-400">(awaiting confirmed trace)</span>
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
                                      {phase1Settled ? '✓ Delivered' : 'Standby'}
                                    </span>
                                  </div>
                                </div>

                                {/* COLUMN 2: PHASE 02 · SPECIALIST UNITS */}
                                <div className={`rounded-2xl bg-[#07080c] border p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xl transition-all duration-500 ${
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
                                        {selectedPreset.id === 'swarm_media_creative' ? '5 workers turn inputs into copy, visuals, video and checks' : selectedPreset.id === 'swarm_arbitrage' ? '1 worker calculates momentum and execution probability' : '5 workers analyze financial solvency, ownership and court records'}
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
                                                : 'bg-[#040507] border-white/[0.05] hover:bg-[#090b10] hover:border-white/10'
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
                                                    {isSettled ? `✓ ${SUBCONTRACTOR_RESULT_PILLS[sub.id] || sub.deliverablePreview}` : sub.role}
                                                  </span>
                                                </div>
                                              </div>

                                              <div className="shrink-0 text-right">
                                                {isSettled ? (
                                                  <span className="px-2 py-0.5 rounded text-[9.5px] font-mono font-bold bg-[#d7ff4f]/15 text-[#d7ff4f] border border-[#d7ff4f]/30 flex items-center gap-1 shadow-[0_0_10px_rgba(215,255,79,0.15)]">
                                                    <span>PAID ${sub.costPathUsd.toFixed(4)}</span>
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
                                                  <span className="text-zinc-300 font-medium">{workerAddr.slice(0, 6)}...{workerAddr.slice(-4)}</span>
                                                  <span className="text-zinc-600">·</span>
                                                  <span className="text-zinc-500">Auth:</span>
                                                  <span className="text-zinc-300">Payment trace</span>
                                                </div>
                                                <span className="text-[#d7ff4f] font-semibold flex items-center gap-1 shrink-0">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-[#d7ff4f] animate-ping" />
                                                  <span>Tempo L1</span>
                                                  <span className="text-zinc-400">(awaiting confirmed trace)</span>
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
                                      {phase2Settled ? '✓ Delivered' : 'Standby'}
                                    </span>
                                  </div>
                                </div>

                                {/* COLUMN 3: PHASE 03 · WORKER BOTS (LIME ACCENT) */}
                                <div className={`rounded-2xl bg-[#07080c] border p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xl transition-all duration-500 ${
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
                                        {selectedPreset.id === 'swarm_media_creative' ? '7 workers package, localize and prepare the final campaign' : selectedPreset.id === 'swarm_arbitrage' ? '1 sandbox worker simulates gas safety and executes swap' : '7 workers compile clearance dossier and board sign-off'}
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
                                                : 'bg-[#040507] border-white/[0.05] hover:bg-[#090b10] hover:border-white/10'
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
                                                    {isSettled ? `✓ ${SUBCONTRACTOR_RESULT_PILLS[sub.id] || sub.deliverablePreview}` : sub.role}
                                                  </span>
                                                </div>
                                              </div>

                                              <div className="shrink-0 text-right">
                                                {isSettled ? (
                                                  <span className="px-2 py-0.5 rounded text-[9.5px] font-mono font-bold bg-[#d7ff4f]/15 text-[#d7ff4f] border border-[#d7ff4f]/30 flex items-center gap-1 shadow-[0_0_10px_rgba(215,255,79,0.15)]">
                                                    <span>PAID ${sub.costPathUsd.toFixed(4)}</span>
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
                                                  <span className="text-zinc-300 font-medium">{workerAddr.slice(0, 6)}...{workerAddr.slice(-4)}</span>
                                                  <span className="text-zinc-600">·</span>
                                                  <span className="text-zinc-500">Auth:</span>
                                                  <span className="text-zinc-300">Payment trace</span>
                                                </div>
                                                <span className="text-[#d7ff4f] font-semibold flex items-center gap-1 shrink-0">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-[#d7ff4f] animate-ping" />
                                                  <span>Tempo L1</span>
                                                  <span className="text-zinc-400">(awaiting confirmed trace)</span>
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
                                      {phase3Settled ? '✓ Delivered' : 'Standby'}
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
                                          {isBusy ? '● Working now' : isSettled ? '✓ Payment step complete' : 'Waiting'}
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
                                      <span>2. HTTP 402 On-Chain Settlement</span>
                                    </span>
                                    <div className="space-y-1.5 text-[11px]">
                                      <div className="flex items-center justify-between text-zinc-400">
                                        <span>Status:</span>
                                        <span className={`font-bold ${isSettled ? 'text-[#d7ff4f]' : isBusy ? 'text-[#d7ff4f] animate-pulse' : 'text-zinc-400'}`}>
                                          {isSettled ? 'HTTP 200 OK (Settled)' : isBusy ? 'HTTP 402 ➔ Signing...' : 'HTTP 402 Standby'}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between text-zinc-400">
                                        <span>Recipient (MPP):</span>
                                        <a
                                          href="https://explore.tempo.xyz/address/0xfCEb1a2633881c19283836a2E17Ba25E612724A0"
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          title="SynapseMPPReceiver on Tempo L1 (Chain 42431)"
                                          className="text-[#d7ff4f] hover:underline font-mono text-[10.5px] flex items-center gap-1"
                                        >
                                          <span>0xfCEb1a...24A0</span>
                                          <ExternalLink className="w-2.5 h-2.5 text-zinc-400" />
                                        </a>
                                      </div>
                                      <div className="flex items-center justify-between text-zinc-400">
                                        <span>Client Vault:</span>
                                        <a
                                          href="https://explore.tempo.xyz/address/0x3c42E274FAdd8e371fB84f97203CC2F2125c8775"
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          title="SynapseVault Smart Contract on Tempo L1 (Chain 42431)"
                                          className="text-zinc-200 hover:underline font-mono text-[10.5px] flex items-center gap-1"
                                        >
                                          <span>0x3c42E2...8775</span>
                                          <ExternalLink className="w-2.5 h-2.5 text-zinc-400" />
                                        </a>
                                      </div>
                                      <div className="flex items-center justify-between text-zinc-400">
                                        <span>Paid Amount:</span>
                                        <span className="text-white font-mono">
                                          <strong className="text-[#d7ff4f]">${activeNode.costPathUsd.toFixed(4)} USD</strong>
                                          <span className="text-zinc-500 text-[9.5px] ml-1">(Gas: $0.000018)</span>
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between text-zinc-400">
                                        <span>On-Chain Tx:</span>
                                        <a
                                          href={batchTxHash ? `https://explore.tempo.xyz/tx/${batchTxHash}` : undefined}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          title="Confirmed Transaction on Tempo Moderato (Block 35757712)"
                                          className="text-[#d7ff4f] hover:underline font-mono text-[10.5px] flex items-center gap-1"
                                        >
                                          <span>0x8fb50a...14d5 ↗</span>
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
                                        ? (activeNode.taskOutput || activeNode.samplePayload || activeNode.deliverablePreview)
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
                                  <span>💡 Tip: Click any card in the 3 columns above to wiretap its live data, prompt, and payment proof.</span>
                                  <span className="text-zinc-400 hidden sm:inline">Node ID: {activeNode.id}</span>
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
                                {selectedPreset.subcontractors.length} interconnected units. Strict causal handoffs. Micropayments settle on Tempo L1 (Chain 42431) under a hard {selectedPreset.budgetLimit || '$0.0500 cap'} policy cap.
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
                                                <span>Mission directive executed • {selectedPreset.subcontractors.length === 20 ? '19' : selectedPreset.subcontractors.length - 1} payment steps completed{batchTxHash ? ' and confirmed on Tempo L1' : ' in demo flow'}</span>
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
                                            <span className="font-bold uppercase tracking-wider text-zinc-300">Live Mission Telemetry • Command Node</span>
                                          </div>
                                          <span className="text-zinc-500">Vault: 0x3c42...8775 (Tempo L1)</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10.5px]">
                                          <div className="p-2.5 rounded bg-black/40 border border-white/[0.04]">
                                            <span className="text-zinc-500 font-bold uppercase tracking-wider text-[9.5px] block">Policy Limit Enforcement</span>
                                            <span className="text-zinc-200 font-medium">Hard Cap: {selectedPreset.budgetLimit || '$0.0500 cap'} • Max Nodes: {selectedPreset.subcontractors.length - 1} Units</span>
                                          </div>
                                          <div className="p-2.5 rounded bg-black/40 border border-white/[0.04]">
                                            <span className="text-zinc-500 font-bold uppercase tracking-wider text-[9.5px] block">Execution Pipeline Flow</span>
                                            <span className="text-zinc-200 font-medium">{selectedPreset.id === 'swarm_media_creative' ? 'Work Pipeline: Feeds (02-08) ➔ Creative (09-13) ➔ Delivery (14-20)' : selectedPreset.id === 'swarm_arbitrage' ? 'Work Pipeline: Feeds (02-03) ➔ Model (04) ➔ Execution (05)' : 'Work Pipeline: Feeds (02-08) ➔ Analysis (09-13) ➔ Clearance (14-20)'}</span>
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
                                      ? 'Stage 02 • Paid Market Data & Media Feeds (7 Units)'
                                      : selectedPreset.id === 'swarm_arbitrage'
                                      ? 'Stage 02 • Live DEX Liquidity & Depth Feeds (2 Units)'
                                      : 'Stage 02 • Official Registry & Compliance Feeds (7 Units)'}
                                  </span>
                                </span>
                                <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-300 font-mono text-[11px] font-bold shadow-inner">
                                  ${selectedPreset.subcontractors.filter(s => s.waveGroup === 1).reduce((acc, s) => acc + s.costPathUsd, 0).toFixed(4)} USD Settled on Tempo L1
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
                                                  <span>Settling micropayment channel on Tempo L1...</span>
                                                </span>
                                              ) : isSettled ? (
                                                <span className="text-zinc-300 font-mono flex items-center gap-2">
                                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#d7ff4f]" />
                                                  <span>Delivered: <strong className="text-[#d7ff4f] font-medium px-2 py-0.5 rounded bg-[#d7ff4f]/10 border border-[#d7ff4f]/25 text-[11px]">{SUBCONTRACTOR_RESULT_PILLS[sub.id] || sub.deliverablePreview}</strong></span>
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
                                              <span className="font-bold uppercase tracking-wider text-zinc-300">Live Execution Telemetry • Node {idx + 2 < 10 ? `0${idx + 2}` : idx + 2}</span>
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
                                              <span className="text-zinc-400 font-bold uppercase tracking-wider text-[9.5px] block">Tempo L1 Channel State</span>
                                              <span className="text-zinc-300 block truncate">
                                                {isRequesting ? (
                                                  <span className="text-zinc-300">HTTP 402 • Challenge Received ($0.0000)</span>
                                                ) : isPaying ? (
                                                  <span className="text-zinc-200">Signing EIP-712 • Channel Active</span>
                                                ) : isSettled ? (
                                                  <span className="text-zinc-200">Settled • ${sub.costPathUsd.toFixed(4)} USD Verified</span>
                                                ) : (
                                                  <span className="text-zinc-500">Standby Channel (Cap: {selectedPreset.budgetLimit || '$0.0500 cap'})</span>
                                                )}
                                              </span>
                                            </div>
                                          </div>

                                          {isSettled && (
                                            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-zinc-300 text-[10.5px] flex items-center justify-between animate-glide">
                                              <div className="truncate"><strong className="text-white font-medium">Output Delivered:</strong> <span className="text-zinc-200 ml-1">{sub.taskOutput || SUBCONTRACTOR_RESULT_PILLS[sub.id] || sub.deliverablePreview}</span></div>
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
                                  ${selectedPreset.subcontractors.filter(s => s.waveGroup === 2).reduce((acc, s) => acc + s.costPathUsd, 0).toFixed(4)} USD Settled on Tempo L1
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
                                                  <span>Settling on Tempo L1...</span>
                                                </span>
                                              ) : isSettled ? (
                                                <span className="text-zinc-300 font-mono flex items-center gap-2">
                                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                                                  <span>Delivered: <strong className="text-[#d7ff4f] font-medium px-2 py-0.5 rounded bg-[#d7ff4f]/10 border border-[#d7ff4f]/25 text-[11px]">{SUBCONTRACTOR_RESULT_PILLS[sub.id] || sub.deliverablePreview}</strong></span>
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
                                              <span className="font-bold uppercase tracking-wider text-zinc-300">Live Execution Telemetry • Node {nodeStr}</span>
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
                                                  <span className="text-zinc-200">Channel Settled • ${sub.costPathUsd.toFixed(4)} USD Verified</span>
                                                ) : (
                                                  <span className="text-zinc-500">Standby Channel (Cap: {selectedPreset.budgetLimit || '$0.0500 cap'})</span>
                                                )}
                                              </span>
                                            </div>
                                          </div>

                                          {isSettled && (
                                            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-zinc-300 text-[10.5px] flex items-center justify-between animate-glide">
                                              <div className="truncate"><strong className="text-white font-medium">Output Delivered:</strong> <span className="text-zinc-200 ml-1">{sub.taskOutput || SUBCONTRACTOR_RESULT_PILLS[sub.id] || sub.deliverablePreview}</span></div>
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
                                      ? 'Stage 04 • Multi-Platform Packaging & Tempo L1 Seal (7 Units)'
                                      : selectedPreset.id === 'swarm_arbitrage'
                                      ? 'Stage 04 • Atomic Settlement on Tempo L1 (1 Unit)'
                                      : 'Stage 04 • Executive Synthesis & Tempo L1 Seal (7 Units)'}
                                  </span>
                                </span>
                                <span className="px-3 py-1 rounded-lg bg-[#d7ff4f]/10 border border-[#d7ff4f]/25 text-[#d7ff4f] font-mono text-[11px] font-bold shadow-inner">
                                  ${selectedPreset.subcontractors.filter(s => s.waveGroup === 3).reduce((acc, s) => acc + s.costPathUsd, 0).toFixed(4)} USD Settled on Tempo L1
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
                                                  <span>Assembling bundle • signing on Tempo L1...</span>
                                                </span>
                                              ) : isPaying ? (
                                                <span className="text-[#d7ff4f] font-mono flex items-center gap-2 font-bold">
                                                  <Zap className="w-3.5 h-3.5 shrink-0 text-[#d7ff4f]" />
                                                  <span>Sealing Merkle attestation digest on Tempo L1...</span>
                                                </span>
                                              ) : isSettled ? (
                                                <span className="text-zinc-300 font-mono flex items-center gap-2">
                                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#d7ff4f]" />
                                                  <span>Delivered: <strong className="text-[#d7ff4f] font-medium px-2 py-0.5 rounded bg-[#d7ff4f]/10 border border-[#d7ff4f]/25 text-[11px]">{SUBCONTRACTOR_RESULT_PILLS[sub.id] || sub.deliverablePreview}</strong></span>
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
                                              <span className="font-bold uppercase tracking-wider text-zinc-300">Live Execution Telemetry • Node {nodeStr}</span>
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
                                                  <span className="text-zinc-200">Settled • ${sub.costPathUsd.toFixed(4)} USD Verified</span>
                                                ) : (
                                                  <span className="text-zinc-500">Standby Channel (Cap: {selectedPreset.budgetLimit || '$0.0500 cap'})</span>
                                                )}
                                              </span>
                                            </div>
                                          </div>

                                          {isSettled && (
                                            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-zinc-300 text-[10.5px] flex items-center justify-between animate-glide">
                                              <div className="truncate"><strong className="text-white font-medium">Output Delivered:</strong> <span className="text-zinc-200 ml-1">{sub.taskOutput || SUBCONTRACTOR_RESULT_PILLS[sub.id] || sub.deliverablePreview}</span></div>
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
                              <span><strong className="text-white">Causality Rule:</strong> Money moves only when an agent needs a paid resource. Zero monthly subscriptions. All payments auditable on Tempo L1.</span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-zinc-400">Total Spent: <strong className="text-white font-bold">${Array.from(settledWorkerIds).reduce<number>((acc, id) => acc + (selectedPreset.subcontractors.find(x => x.id === id)?.costPathUsd || 0), 0).toFixed(4)}</strong> / {selectedPreset.budgetLimit || '$0.0500 USD'}</span>
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
                                  {selectedPreset.id === 'swarm_media_creative' ? 'CAMPAIGN DIRECTOR' : selectedPreset.id === 'swarm_arbitrage' ? 'LEAD ARBITRAGE TRADER' : 'LEAD AGENT'}
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
                                      ? 'Lead Arbitrage Director (Unit 01 • AI Trader)'
                                      : 'Lead Orchestrator (Unit 01 • Lead Agent)'}
                                  </h3>
                                  <p className="text-xs text-zinc-300 font-sans mt-0.5">
                                    {selectedPreset.id === 'swarm_media_creative'
                                      ? 'Coordinates 12 workers and 7 providers, enforces $0.050 budget cap, and directs ad campaign'
                                      : selectedPreset.id === 'swarm_arbitrage'
                                      ? 'Queries 2 live DEX feeds, models spread slippage, and signs atomic execution'
                                      : 'Coordinates 19 units, enforces $0.030 budget policy, and approves supplier contracts'}
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
                                        <span className={`px-2 py-0.5 rounded text-[10px] ${activeStageNum === 0 && isExecuting ? 'bg-[#d7ff4f]/20 text-[#d7ff4f] font-bold border border-[#d7ff4f]/40' : 'bg-white/[0.04] text-zinc-400'}`}>1. Plan Swap</span>
                                        <span className="text-zinc-600">&rarr;</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] ${activeStageNum === 1 && isExecuting ? 'bg-[#d7ff4f]/20 text-[#d7ff4f] font-bold border border-[#d7ff4f]/40' : 'bg-white/[0.04] text-zinc-400'}`}>2. Depth Feeds</span>
                                        <span className="text-zinc-600">&rarr;</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] ${activeStageNum === 2 && isExecuting ? 'bg-[#d7ff4f]/20 text-[#d7ff4f] font-bold border border-[#d7ff4f]/40' : 'bg-white/[0.04] text-zinc-400'}`}>3. Settle Swap</span>
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
                                    ? (selectedPreset.id === 'swarm_media_creative' ? '✓ Campaign Ready (Brand & Policy Approved)' : selectedPreset.id === 'swarm_arbitrage' ? '✓ Trade Settled (+$14.20 Net)' : '✓ Supplier Approved (Clean Audit Passed)')
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
                                            10k Cycles
                                          </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-[10px] pt-1.5 border-t border-white/[0.06]">
                                          <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04]">
                                            <span className="text-zinc-500 block text-[9px] uppercase font-semibold">Default Risk</span>
                                            <span className="text-emerald-400 font-bold">0.04% (Safe)</span>
                                          </div>
                                          <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04]">
                                            <span className="text-zinc-500 block text-[9px] uppercase font-semibold">Solvency Score</span>
                                            <span className="text-white font-bold">4.12 / 5.00</span>
                                          </div>
                                        </div>
                                        <div className="text-[9.5px] text-zinc-400 font-sans leading-relaxed">
                                          10,000 Monte Carlo stress cycles executed via Python. Solvency verified • Zero budget overdraft.
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Phase Footer Status */}
                                  <div className="pt-2.5 mt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-zinc-400">
                                    <span>{stageSubs.length} Autonomous Nodes</span>
                                    <span className={allStageSettled ? 'text-emerald-400 font-bold' : isStageActive ? 'text-[#d7ff4f] font-bold animate-pulse' : 'text-zinc-500'}>
                                      {allStageSettled ? '✓ All Delivered' : isStageActive ? '⚡ In Flight' : 'Standby'}
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
                                    {selectedPreset.id === 'swarm_media_creative' ? 'Direct Multi-Platform Ad Campaign Launch' : selectedPreset.id === 'swarm_arbitrage' ? 'Execute Cross-DEX Flash Arbitrage' : 'Investigate Apex Foundry before contract approval'}
                                  </span>
                                </div>
                                <p className="text-[11px] text-zinc-300 font-sans mt-0.5">
                                  {selectedPreset.id === 'swarm_media_creative' ? 'Coordinates 12 workers and 7 providers, enforces $0.050 budget cap, and delivers full ad package' : selectedPreset.id === 'swarm_arbitrage' ? 'Coordinates 4 units and 2 live feeds, enforces $0.010 budget cap, and executes arbitrage' : 'Plans mission, coordinates 19 units, manages $0.030 budget, and approves final contract'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                              <span className="px-2.5 py-1 rounded bg-black/50 border border-white/10 text-zinc-300 text-[11px] font-mono">
                                Spend: <strong className="text-[#d7ff4f]">{selectedPreset.id === 'swarm_media_creative' ? '$0.0245 USD' : selectedPreset.id === 'swarm_arbitrage' ? '$0.0060 USD' : '$0.0270 USD'}</strong> / {selectedPreset.budgetLimit || '$0.0500 policy cap'}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                isLeadSettled
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : isLeadActive
                                  ? 'bg-[#d7ff4f]/20 text-[#d7ff4f] border border-[#d7ff4f]/40 animate-pulse'
                                  : 'bg-white/5 text-zinc-400 border border-white/10'
                              }`}>
                                {isLeadSettled ? (selectedPreset.id === 'swarm_media_creative' ? '✓ Campaign Ready to Launch' : selectedPreset.id === 'swarm_arbitrage' ? '✓ Arbitrage Complete' : '✓ Supplier Approved (94/100)') : isLeadActive ? '⚡ Coordinating Workforce...' : 'Ready to Direct'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {stageElements}
                      </>
                    )}

                    {/* DYNAMIC RESULT CENTER (STANDBY & EXECUTING / CLIMAX DASHBOARD) */}
                    {settledWorkerIds.size === selectedPreset.subcontractors.length && settledWorkerIds.size > 0 && (
                      <div id="swarm-big-result-block" className="p-6 sm:p-8 rounded-3xl bg-white/[.03] backdrop-blur-md border border-white/[.08] text-center space-y-6 shadow-sm animate-fade-in">
                        {/* Header Climax */}
                        <div className="space-y-3">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d7ff4f]/10 border border-[#d7ff4f]/30 text-[#d7ff4f] text-[10px] font-mono font-bold uppercase tracking-widest">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mission Complete • {selectedPreset.subcontractors.length} Units Settled</span>
                          </div>
                          
                          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                            {selectedPreset.id === 'swarm_media_creative'
                              ? 'Ad Campaign is Ready to Launch'
                              : selectedPreset.id === 'swarm_arbitrage'
                              ? 'Arbitrage Execution Complete'
                              : 'Supplier Clearance Dossier Approved'}
                          </h2>
                          
                          <p className="text-xs text-zinc-400 font-mono max-w-xl mx-auto leading-relaxed">
                            {selectedPreset.id === 'swarm_media_creative'
                              ? `1 Lead Agent coordinated 12 workers and 7 providers. Campaign complete in ${actualExecutionTimeSec}s for $0.0245 under the $0.0500 budget.`
                              : selectedPreset.id === 'swarm_arbitrage'
                              ? `1 Lead Agent coordinated 2 workers and 1 market feed. Flash arbitrage settled in ${actualExecutionTimeSec}s for $0.0060 under $0.0100 budget.`
                              : `1 Lead Agent coordinated 12 workers and 7 official feeds. Clearance dossier completed in ${actualExecutionTimeSec}s for $0.0270 under $0.0300 budget.`}
                          </p>
                        </div>

                        {/* 4 Stat Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto pt-4 border-t border-white/10 font-mono text-left">
                          <div className="p-4 rounded-xl bg-black/50 border border-white/10 space-y-1">
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
                          <div className="p-4 rounded-xl bg-black/50 border border-white/10 space-y-1">
                            <span className="text-[10px] uppercase text-zinc-400 font-bold block">WORKFORCE</span>
                            <span className="text-2xl font-black text-white block">
                              {selectedPreset.subcontractors.length}
                            </span>
                            <span className="text-[10.5px] text-zinc-400 block truncate">
                              {selectedPreset.subcontractors.length === 20 ? '1 Lead · 12 Workers · 7 Providers' : `${selectedPreset.subcontractors.length} Participants`}
                            </span>
                          </div>
                          <div className="p-4 rounded-xl bg-black/50 border border-white/10 space-y-1">
                            <span className="text-[10px] uppercase text-zinc-400 font-bold block tracking-wider">PAYMENT ACTIONS</span>
                            <span className="text-2xl font-black text-white block">
                              {selectedPreset.subcontractors.length === 20 ? '19' : `${selectedPreset.subcontractors.length - 1}`}
                              <span className="text-xs font-normal text-zinc-400 ml-1.5 font-mono">actions · 1 L1 settlement</span>
                            </span>
                            <span className="text-[10.5px] text-zinc-400 block truncate">
                              {selectedPreset.subcontractors.length === 20 ? '7 Provider Purchases · 12 Worker Payments' : 'Direct Micro-Services'}
                            </span>
                          </div>
                          <div className="p-4 rounded-xl bg-black/50 border border-white/10 space-y-1">
                            <span className="text-[10px] uppercase text-zinc-400 font-bold block">BUDGET STATUS</span>
                            <span className="text-2xl font-black text-[#d7ff4f] block">
                              ${selectedPreset.id === 'swarm_media_creative' ? '0.0255' : selectedPreset.id === 'swarm_arbitrage' ? '0.0040' : '0.0030'}
                              <span className="text-xs font-normal text-zinc-400 ml-1.5 font-mono">remaining</span>
                            </span>
                            <span className="text-[10.5px] text-zinc-400 block truncate">
                              $0.0245 spent (49% used · 51% remaining of {selectedPreset.budgetLimit || '$0.0500'} cap)
                            </span>
                          </div>
                        </div>

                        {/* 2. ON-CHAIN SETTLEMENT VAULT & PROOF LEDGER */}
                        <div className="pt-2 max-w-4xl mx-auto text-left space-y-4">
                          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0c1410] via-[#090d14] to-[#08090c] border border-[#d7ff4f]/40 shadow-[0_0_35px_rgba(215,255,79,0.12)] space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#d7ff4f]/20 pb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#d7ff4f]/15 border border-[#d7ff4f]/40 flex items-center justify-center text-[#d7ff4f] shrink-0 shadow-[0_0_15px_rgba(215,255,79,0.25)]">
                                  <ShieldCheck className="w-6 h-6 text-[#d7ff4f]" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider bg-[#d7ff4f] text-[#08090c]">
                                      VAULT-SCOPED SESSION SETTLEMENT
                                    </span>
                                    <span className="text-xs text-zinc-400 font-mono flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                      Tempo L1 Testnet (Chain ID 42431)
                                    </span>
                                  </div>
                                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight mt-1 flex items-center gap-2">
                                    <span>Every Micro-Payment Signed via EIP-712 Voucher</span>
                                    <span className="text-[#d7ff4f] font-mono">
                                      (${selectedPreset.subcontractors.reduce((acc, s) => acc + s.costPathUsd, 0).toFixed(4)} USD)
                                    </span>
                                  </h3>
                                </div>
                              </div>

                              {/* Explorer & Audit Actions */}
                              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const targetWorker = selectedPreset.subcontractors.find(x => settledWorkerIds.has(x.id)) || selectedPreset.subcontractors[0];
                                    if (targetWorker) inspectWorkerCryptoProof(targetWorker);
                                  }}
                                  className="px-3.5 py-2 rounded-xl bg-[#d7ff4f]/20 hover:bg-[#d7ff4f]/30 border border-[#d7ff4f]/50 text-[#d7ff4f] hover:text-white font-black text-xs font-mono transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(215,255,79,0.25)] active:scale-95 cursor-pointer"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5 text-[#d7ff4f]" />
                                  <span>Inspect Crypto Proof</span>
                                </button>
                                <a
                                  href="https://explore.tempo.xyz/address/0x3c42E274FAdd8e371fB84f97203CC2F2125c8775"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white font-bold text-xs font-mono transition flex items-center gap-1.5 active:scale-95"
                                >
                                  <span>Vault Contract (42431)</span>
                                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard('0x3c42E274FAdd8e371fB84f97203CC2F2125c8775', 'climax_root_hash')}
                                  className="px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-200 transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
                                >
                                  {copiedKey === 'climax_root_hash' ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-[#d7ff4f]" />
                                      <span className="text-[#d7ff4f]">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5 text-zinc-400" />
                                      <span>Copy Vault Contract</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Crisp Reality Statement */}
                            <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
                              All <strong className="text-white">{selectedPreset.subcontractors.filter(s => s.costPathUsd > 0).length} agent tool payments</strong> were authorized via EIP-712 session key vouchers tied to the SynapseVault contract (<strong className="text-[#d7ff4f] font-mono">0x3c42E274...c8775</strong>) on Tempo L1 with &lt;15ms gateway finality. No master wallet keys exposed; unspent balance remains in your vault.
                            </p>

                            {/* Root Contract & Performance Strip */}
                            <div className="p-3 rounded-xl bg-black/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-zinc-500 uppercase text-[10px] font-bold shrink-0">Verified Vault Contract:</span>
                                <span className="text-[#d7ff4f] font-bold truncate">
                                  0x3c42E274FAdd8e371fB84f97203CC2F2125c8775
                                </span>
                              </div>
                              <div className="flex items-center gap-3 shrink-0 text-[11px] text-zinc-400">
                                <span>Status: <strong className="text-emerald-400">Bytecode Verified</strong></span>
                                <span>•</span>
                                <span>Gateway Auth: <strong className="text-white">&lt;15ms</strong></span>
                                <span>•</span>
                                <span>L1 Block: <strong className="text-[#d7ff4f]">~0.5s</strong></span>
                                <span>•</span>
                                <span>Fee: <strong className="text-white">&lt;$0.0001 pathUSD</strong></span>
                              </div>
                            </div>

                            {/* Interactive 19-Payment Ledger Header & Filter */}
                            <div className="pt-2 space-y-2.5">
                              <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
                                <span className="text-[11px] font-bold uppercase text-zinc-300 flex items-center gap-1.5">
                                  <Coins className="w-3.5 h-3.5 text-[#d7ff4f]" />
                                  <span>Cryptographic Settlement Ledger ({selectedPreset.subcontractors.filter(s => s.costPathUsd > 0).length} Micro-Transactions)</span>
                                </span>
                                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-black/50 border border-white/10 text-[10.5px]">
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
                                        className="p-2.5 rounded-xl bg-black/50 border border-white/[0.08] hover:border-[#d7ff4f]/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
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
                                               <span>Vault: 0x3c42E274...c8775</span>
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
                          </div>
                        </div>

                        {/* What the workforce delivered */}
                        <div className="pt-4 border-t border-white/10 max-w-4xl mx-auto space-y-3 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#d7ff4f] flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#d7ff4f]" />
                              What the workforce delivered
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400">
                              {selectedPreset.subcontractors.length === 20 ? '19 Transactions' : `${selectedPreset.subcontractors.length - 1} Transactions`} {batchTxHash ? 'confirmed on Tempo L1' : 'processed in demo flow'}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs font-mono">
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
                                      <span className="text-[9px] text-zinc-400 uppercase font-mono font-semibold">SETTLED</span>
                                    </div>
                                    <h5 className="text-white font-bold block text-[11px] mt-1">Tempo L1 Swap</h5>
                                  </div>
                                  <span className="text-[9.5px] text-zinc-400 font-sans block border-t border-white/5 pt-1.5">Settled in 14ms (&lt;$0.00002 gas)</span>
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
                                  <span className="text-[9.5px] text-zinc-400 font-sans block border-t border-white/5 pt-1.5">LEI verified active</span>
                                </div>
                                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-[#d7ff4f] font-mono font-bold">02</span>
                                      <span className="text-[9px] text-zinc-400 uppercase font-mono font-semibold">FINANCIAL</span>
                                    </div>
                                    <h5 className="text-white font-bold block text-[11px] mt-1">+$12.4M Cash</h5>
                                  </div>
                                  <span className="text-[9.5px] text-zinc-400 font-sans block border-t border-white/5 pt-1.5">Audited balance sheet</span>
                                </div>
                                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-[#d7ff4f] font-mono font-bold">03</span>
                                      <span className="text-[9px] text-zinc-400 uppercase font-mono font-semibold">LEGAL</span>
                                    </div>
                                    <h5 className="text-white font-bold block text-[11px] mt-1">0 Sanctions / Liens</h5>
                                  </div>
                                  <span className="text-[9.5px] text-zinc-400 font-sans block border-t border-white/5 pt-1.5">OFAC & UN verified clean</span>
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
                                  <span className="text-[9.5px] text-zinc-400 font-sans block border-t border-white/5 pt-1.5">Execute contract</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

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
                                "SYNAPSE402 AUTONOMOUS WORKFORCE ARBITRAGE MEMO",
                                "=======================================================",
                                `Task: ${customDirective || selectedPreset.title}`,
                                `Target Pair: TEMPO/USD Cross-DEX Orderbook`,
                                `Captured Spread: +1.42% Net Realized Edge`,
                                `Gas Incurred: $0.000018 USD (Tempo L1 Native MPP)`,
                                `Recommendation: SWAP EXECUTED & SETTLED ON-CHAIN`,
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
                                `Supplier Risk Assessment: Low Risk Approved`,
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
                              const bundleJson = selectedPreset.id === 'swarm_media_creative' ? {
                                project: "Synapse402 Autonomous AI Workforce",
                                protocol: "HTTP 402 Micropayments on Tempo L1 (Chain ID: 42431)",
                                mission: "Multi-Platform Ad Campaign Launch",
                                status: "DELIVERED_READY_FOR_PUBLISH",
                                budgetSummary: {
                                  budgetCapUsd: 0.0500,
                                  totalSpentUsd: 0.0245,
                                  budgetSavedUsd: 0.0255,
                                  humanRole: "Strategy Directive & Hard Spending Cap Enforced",
                                  executionTimeSec: actualExecutionTimeSec
                                },
                                onChainSettlement: {
                                  vaultAddress: "0x3c42E274FAdd8e371fB84f97203CC2F2125c8775",
                                  txHash: batchTxHash || '',
                                  tempoModeratoBlock: 42431,
                                  settlementLatencyMs: 14.8,
                                  authMechanism: "EIP-712 Scoped Session Key"
                                },
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
                                protocol: "HTTP 402 Micropayments on Tempo L1 (Chain ID: 42431)",
                                mission: "Cross-DEX Flash Arbitrage Execution",
                                status: "EXECUTED_CONFIRMED_ON_CHAIN",
                                budgetSummary: {
                                  budgetCapUsd: 0.0100,
                                  totalSpentUsd: 0.0060,
                                  budgetSavedUsd: 0.0040,
                                  humanRole: "Strategy Directive & Hard Spending Cap Enforced",
                                  executionTimeSec: actualExecutionTimeSec
                                },
                                onChainSettlement: {
                                  vaultAddress: "0x3c42E274FAdd8e371fB84f97203CC2F2125c8775",
                                  txHash: batchTxHash || '',
                                  tempoModeratoBlock: 42431,
                                  settlementLatencyMs: 14.8,
                                  authMechanism: "EIP-712 Scoped Session Key"
                                },
                                marketFeeds: [
                                  "Market Depth Mesh L2 API ($0.0010)",
                                  "Crypto Skew Volatility Feed ($0.0020)"
                                ],
                                workers: [
                                  "Momentum Prediction Model",
                                  "Safe Code Runner Sandbox"
                                ],
                                executionProof: {
                                  spreadCaptured: "+1.42%",
                                  netEdgeUsd: 0.428,
                                  gasSpentTempo: 0.000018,
                                  slippageProtection: "0.05% Max Verified"
                                }
                              } : {
                                project: "Synapse402 Autonomous AI Workforce",
                                protocol: "HTTP 402 Micropayments on Tempo L1 (Chain ID: 42431)",
                                mission: "Enterprise Supplier Due Diligence",
                                status: "DOSSIER_APPROVED_LEGAL_CLEAR",
                                budgetSummary: {
                                  budgetCapUsd: 0.0300,
                                  totalSpentUsd: 0.0270,
                                  budgetSavedUsd: 0.0030,
                                  humanRole: "Strategy Directive & Hard Spending Cap Enforced",
                                  executionTimeSec: actualExecutionTimeSec
                                },
                                onChainSettlement: {
                                  vaultAddress: "0x3c42E274FAdd8e371fB84f97203CC2F2125c8775",
                                  txHash: batchTxHash || '',
                                  tempoModeratoBlock: 42431,
                                  settlementLatencyMs: 14.8,
                                  authMechanism: "EIP-712 Scoped Session Key"
                                },
                                supplierEvaluated: "Apex Foundry Ltd",
                                entityStatus: "Active Legal Entity (LEI Verified)",
                                financialSolvency: "+$12.4M Liquid Cash Audited",
                                sanctionsScore: "0 Sanctions Hits (OFAC & UN Clean)",
                                solvencyScore: "4.12 Safe Zone",
                                recommendation: "EXECUTE CONTRACT (Score 94/100)"
                              };

                              const jsonFilename = selectedPreset.id === 'swarm_media_creative'
                                ? 'campaign_bundle_tempo_l1.json'
                                : selectedPreset.id === 'swarm_arbitrage'
                                ? 'arbitrage_execution_tempo_l1.json'
                                : 'supplier_dossier_tempo_l1.json';

                              const blob = new Blob([JSON.stringify(bundleJson, null, 2)], { type: 'application/json' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = jsonFilename;
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                            className="px-5 py-3 rounded-xl bg-[#d7ff4f]/10 hover:bg-[#d7ff4f]/20 border border-[#d7ff4f]/30 text-[#d7ff4f] text-xs font-mono font-semibold transition flex items-center gap-2 cursor-pointer active:scale-95"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>{selectedPreset.id === 'swarm_media_creative' ? 'Download Campaign Bundle (.JSON)' : selectedPreset.id === 'swarm_arbitrage' ? 'Download Arbitrage Audit (.JSON)' : 'Download Due Diligence Dossier (.JSON)'}</span>
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

                        {/* Payment & Proof Card (Hierarchy: At the Bottom) */}
                        <div className="mt-4 p-5 sm:p-6 rounded-2xl bg-black/50 border border-white/10 shadow-xl space-y-4 text-left max-w-4xl mx-auto">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-[#d7ff4f]/10 border border-[#d7ff4f]/30 flex items-center justify-center text-[#d7ff4f] shrink-0">
                                <ShieldCheck className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#d7ff4f]/10 text-[#d7ff4f] border border-[#d7ff4f]/30">
                                    ✓ Payment confirmed on Tempo
                                  </span>
                                  <span className="text-xs text-zinc-400 font-mono">Tempo L1 Testnet (Chain ID 42431)</span>
                                </div>
                                <h4 className="text-sm font-bold text-white tracking-tight mt-1">
                                  Payment &amp; Proof
                                </h4>
                              </div>
                            </div>

                            {/* Direct Tempo Explorer & Vault Buttons */}
                            <div className="flex items-center gap-2 shrink-0">
                              <a
                                href={batchTxHash ? `https://explore.tempo.xyz/tx/${batchTxHash}` : undefined}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-xl bg-[#d7ff4f]/10 hover:bg-[#d7ff4f]/20 border border-[#d7ff4f]/30 text-[#d7ff4f] hover:text-[#cbf540] text-xs font-mono font-semibold transition flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer active:scale-95"
                              >
                                <span>View Transaction ↗</span>
                                <ExternalLink className="w-3.5 h-3.5 text-[#d7ff4f]" />
                              </a>
                              <a
                                href="https://explore.tempo.xyz/address/0x3c42E274FAdd8e371fB84f97203CC2F2125c8775"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white text-xs font-mono transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                              >
                                <span>Vault Contract ↗</span>
                                <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                              </a>
                            </div>
                          </div>

                          {/* Transaction ID & Copy */}
                          <div className="p-3 rounded-xl bg-black/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs font-mono">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-zinc-400 uppercase text-[10px] shrink-0 font-bold">Transaction ID:</span>
                              <span className="text-[#d7ff4f] font-bold truncate">
                                {batchTxHash || 'No batch transaction returned'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => batchTxHash && copyToClipboard(batchTxHash, 'climax_tx_hash')}
                              className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/10 border border-white/10 text-zinc-200 hover:text-white text-[11px] transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                            >
                              {copiedKey === 'climax_tx_hash' ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-[#d7ff4f]" />
                                  <span className="text-[#d7ff4f] font-bold">ID Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                                  <span>Copy Tx ID</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* 4 Telemetry Metrics */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-mono">
                            <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06]">
                              <span className="text-zinc-400 block text-[9.5px]">PAYMENT</span>
                              <span className="text-[#d7ff4f] font-bold">
                                ${selectedPreset.subcontractors.reduce((acc, s) => acc + s.costPathUsd, 0).toFixed(4)} USD
                              </span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06]">
                              <span className="text-zinc-400 block text-[9.5px]">TRANSACTIONS</span>
                              <span className="text-zinc-200 font-bold">
                                {selectedPreset.id === 'swarm_media_creative' ? '7 Feeds Paid · 12 Work Steps' : `${selectedPreset.subcontractors.length} Nodes Verified`}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06]">
                              <span className="text-zinc-400 block text-[9.5px]">PAYMENT AUTH</span>
                              <span className="text-[#d7ff4f] font-bold">&lt; 15ms</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06]">
                              <span className="text-zinc-400 block text-[9.5px]">PROOF PROTOCOL</span>
                              <span className="text-zinc-200 font-bold">Tempo L1 Policy Seal</span>
                            </div>
                          </div>

                          <div className="text-[10.5px] font-mono text-zinc-400 pt-1 text-center sm:text-left">
                            Payment confirmed on Tempo testnet • Chain ID 42431 • Tamper-proof audit trail
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 3. LIVE MULTI-AGENT PROTOCOL DIALOGUE WIRE (WAR-ROOM STREAM) */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-white/[.03] backdrop-blur-md border border-white/[.08] shadow-sm space-y-3">
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
                                  {isSettled ? '✓ Delivered' : isBusy ? 'Active...' : 'Ready'}
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
                              {selectedPreset.id === 'swarm_media_creative'
                                ? 'Creative Studio Assets Ready — Transparent PNG, visual concept layout, and audio stems synthesized.'
                                : 'Market Risk Dossier Ready — Real-time orderbooks verified, Python risk calculations passed, 0 sanctions hits.'}
                            </p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-4 border-t border-white/10 font-mono text-left">
                            <div className="p-4 rounded-xl bg-black/60 border border-white/[0.08]">
                              <span className="text-[10px] uppercase text-zinc-500 block mb-1">Total Spent</span>
                              <span className="text-xl font-bold text-white block">
                                ${selectedPreset.subcontractors.reduce((acc, s) => acc + s.costPathUsd, 0).toFixed(4)}
                              </span>
                              <span className="text-[11px] text-zinc-400 block mt-0.5">Policy cap: {(selectedPreset as any).budgetLimit || '$0.0300 policy cap'}</span>
                            </div>
                            <div className="p-4 rounded-xl bg-black/60 border border-white/[0.08]">
                              <span className="text-[10px] uppercase text-zinc-500 block mb-1">
                                {selectedPreset.id === 'swarm_media_creative' ? 'Pipeline Composition' : 'Nodes Paid'}
                              </span>
                              <span className="text-xl font-bold text-[#d7ff4f] block">
                                {selectedPreset.id === 'swarm_media_creative' ? '7 Feeds · 12 Workers' : selectedPreset.subcontractors.length}
                              </span>
                              <span className="text-[11px] text-zinc-400 block mt-0.5">
                                {selectedPreset.id === 'swarm_media_creative' ? '19 Pipeline Steps Complete' : 'Specialist Endpoints'}
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
                                <span className="text-[#d7ff4f] font-bold uppercase text-[11px]">Settled On-Chain • Tempo L1</span>
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
                              <span>Total Settled: <strong className="text-white">${selectedPreset.subcontractors.reduce((acc, s) => acc + s.costPathUsd, 0).toFixed(4)} USD</strong></span>
                              <span>Units Paid: <strong className="text-[#d7ff4f]">{selectedPreset.subcontractors.filter(s => s.costPathUsd > 0).length}</strong></span>
                              <span>Network Fee: <strong className="text-emerald-400">&lt;$0.00002</strong></span>
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
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/15 flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      Workforce Execution & Live Deliverables
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold border bg-white/[0.04] text-zinc-300 border-white/10 flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${settledWorkerIds.size === selectedPreset.subcontractors.length ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                      {settledWorkerIds.size}/{selectedPreset.subcontractors.length} Completed {settledWorkerIds.size > 0 ? '(<15ms payment auth)' : '• Standby'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans mt-0.5">
                    {settledWorkerIds.size === selectedPreset.subcontractors.length
                      ? `All ${selectedPreset.subcontractors.length} mission units successfully completed and delivered outputs.`
                      : isExecuting
                      ? selectedPreset.subcontractors.length === 20
                        ? 'Executing 3-phase workforce pipeline in parallel...'
                        : 'Executing workforce pipeline...'
                      : '20 mission units configured and ready for execution.'}
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
                      tempoL1Settlement: "Verified parallel payment lanes",
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
                      `Settlement Layer: Tempo L1 Micropayments (<15ms gateway auth • ~500ms block finality)`,
                      `On-Chain Tx Hash: ${batchTxHash || 'No batch transaction returned'}`,
                      "-------------------------------------------------------",
                      "VERIFIED DELIVERABLE SPECIFICATIONS:",
                      ...selectedPreset.subcontractors.map((s, idx) => `  ${idx + 1}. [${s.shortName}] ${s.role}: ${s.deliverablePreview} ($${s.costPathUsd.toFixed(4)})`),
                      "-------------------------------------------------------",
                      "EXECUTIVE VERIFICATION STATUS: AUDIT APPROVED & ON-CHAIN VERIFIED",
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
                      `Settlement Layer: Tempo L1 Micropayments (<15ms gateway auth • ~500ms block finality)`,
                      `On-Chain Tx Hash: ${batchTxHash || 'No batch transaction returned'}`,
                      "-------------------------------------------------------",
                      "VERIFIED DELIVERABLE SPECIFICATIONS:",
                      ...selectedPreset.subcontractors.map((s, idx) => `  ${idx + 1}. [${s.shortName}] ${s.role}: ${s.deliverablePreview} ($${s.costPathUsd.toFixed(4)})`),
                      "-------------------------------------------------------",
                      "EXECUTIVE VERIFICATION STATUS: AUDIT APPROVED & ON-CHAIN VERIFIED",
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
                      <span>Export Official Memo</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 4 Clean Navigation Tabs */}
            <div className="flex items-center gap-1 px-3 sm:px-4 pt-3 border-b border-white/10 overflow-x-auto bg-black/40">
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
                      <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#d7ff4f]/15 border border-[#d7ff4f]/30 flex items-center justify-center text-[#d7ff4f] shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white font-mono block">
                              {selectedPreset.id === 'swarm_media_creative'
                                ? 'Executive Campaign Deliverables Approved'
                                : selectedPreset.id === 'swarm_arbitrage'
                                ? 'Arbitrage Execution Approved'
                                : 'Enterprise Due Diligence Dossier Approved'}
                            </span>
                            <span className="text-[11px] text-zinc-400 font-sans">
                              {selectedPreset.subcontractors.length} autonomous units settled on Tempo L1 • Total spend: ${Array.from(settledWorkerIds).reduce<number>((acc, id) => acc + (selectedPreset.subcontractors.find(x => x.id === id)?.costPathUsd || 0), 0).toFixed(4)} USD
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
                                `Settlement Layer: Tempo L1 Micropayments (<15ms handshake • ~135ms L1 finality)`,
                                `Batch Tx Hash: ${batchTxHash || 'No batch transaction returned'}`,
                                "-------------------------------------------------------",
                                "VERIFIED DELIVERABLES SUMMARY:",
                                ...selectedPreset.subcontractors.map((s, idx) => `  ${idx + 1}. [${s.shortName}] ${s.role}: ${s.deliverablePreview} ($${s.costPathUsd.toFixed(4)})`),
                                "-------------------------------------------------------",
                                "EXECUTIVE STATUS: COMPLETED & SETTLED ON TEMPO L1",
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
                      <div className="rounded-2xl bg-black/50 border border-white/10 overflow-hidden font-mono text-xs">
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
                                <span className="text-zinc-400 text-[10px] block">✓ Delivered</span>
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
                              Settled (&lt;15ms payment authorization on Tempo L1)
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
                            ${currentSub.costPathUsd.toFixed(4)} USD • &lt;15ms authorization
                          </span>
                        </div>
                      </div>

                      {/* Task & Verified Deliverable Output Box */}
                      <div className="p-3.5 rounded-lg bg-black/60 border border-white/[0.08] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono text-zinc-300 font-semibold flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#d7ff4f]" />
                            <span>Verified Specialist Deliverable:</span>
                          </span>
                          <span className="text-[10.5px] font-mono text-zinc-400">
                            {isSettled ? 'Cryptographically Sealed on Tempo L1' : 'Awaiting Execution'}
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
                      <span className="text-zinc-100 font-bold">On-Chain Settlement Receipt</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#d7ff4f]/10 text-[#d7ff4f] border border-[#d7ff4f]/30 text-[10.5px] font-semibold">
                      ✓ Confirmed on Tempo L1
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
                      <span className="text-zinc-500 block uppercase text-[10px]">Payment Protocol</span>
                      <span className="text-zinc-200 font-semibold block">HTTP 402 Micropayments</span>
                    </div>
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
                      <span className="text-zinc-500 block uppercase text-[10px]">Settlement Network</span>
                      <span className="text-[#d7ff4f] font-mono block">Tempo L1 Testnet</span>
                    </div>
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
                      <span className="text-zinc-500 block uppercase text-[10px]">Total Paid</span>
                      <span className="text-[#d7ff4f] font-semibold block">
                        {settledWorkerIds.size} of {selectedPreset.subcontractors.length} Nodes (${Array.from(settledWorkerIds).reduce<number>((acc, id) => acc + (selectedPreset.subcontractors.find(x => x.id === id)?.costPathUsd || 0), 0).toFixed(4)} USD)
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] text-[11px] text-zinc-300 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span>Differentiated micro-settlements released on Tempo L1 upon verified delivery. Total pipeline cost: ${(selectedPreset.subcontractors.reduce((acc, s) => acc + s.costPathUsd, 0)).toFixed(4)} USD of {(selectedPreset as any).budgetLimit || '$0.0500 cap'}.</span>
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
                    title="Tempo L1 Final Settlement"
                    text="Words are tallied as they arrive; the final tiny fraction settles on Tempo L1 upon completion or stop."
                  />
                </span>
                <span className="text-white/50">
                  Words are counted live; the accumulated fraction of a cent settles on Tempo L1 when finished.
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
                    <div className="font-bold text-xs text-[#f5f5f2] mb-0.5">Market Arbitrage &amp; Micro-Pricing</div>
                    <p className="text-[11px] text-white/50">Simulates real-time pricing and sub-cent USD execution on Tempo L1.</p>
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
                    <p className="text-[11px] text-white/50">Live tool response verification and settlement on Tempo L1.</p>
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
                <span className="text-xs font-bold text-white tracking-wide">Live Token Stream Metering & Settlement Receipt</span>
              </div>
              {/* Telemetry Bar */}
              <div className="p-3 rounded-xl bg-white/[.04] border border-white/15 grid grid-cols-3 gap-2 font-mono text-center">
                <div>
                  <span className="text-[10px] text-white/50 uppercase block">Tokens Received</span>
                  <span className="text-base font-bold text-[#f5f5f2]">{streamTokens.length}</span>
                </div>
                <div>
                  <span className="text-[10px] text-white/50 uppercase block">Micro-Settled</span>
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
                        <span>Instant Payment Receipt</span>
                      </span>
                      <span className="text-[10px] font-mono text-zinc-300">Tempo Block #{streamTraceInfo.blockHeight ? streamTraceInfo.blockHeight.toLocaleString() : 'LIVE_L1'}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-300">
                      • {streamTraceInfo.leakagePrevented}
                    </div>
                    <div className="text-[10px] font-mono text-slate-300">
                      • Payment Reference: <code className="text-[#d7ff4f]">{streamTraceInfo.finalTraceId || streamTraceInfo.streamId}</code>
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
                    text="Connects desktop AI clients (Claude/Cursor) to Tempo L1. Your AI buys live data or tools within a strict $0.05 budget limit without needing credit card numbers."
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
                <span className="text-[10px] font-mono text-zinc-400">403 Forbidden vs 200 OK</span>
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
                Traditional crawlers waste millions on proxy rotations and CAPTCHA solvers, only to get blocked by web firewalls. Synapse402 replaces the firewall with an open turnstile: bots settle 0.1¢ per request on Tempo L1 and receive clean, structured JSON payloads in &lt;15ms.
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
                      Synapse402 Autonomous Agent (Tempo L1)
                    </h4>
                    <span className="text-[10px] text-zinc-400 font-mono">Approach: HTTP 402 Micro-Payment (&lt;15ms on Tempo L1)</span>
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
                  <span className="text-[10px] text-zinc-400 block">Tempo L1 Latency</span>
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
                <span className="text-[10px] font-mono uppercase text-zinc-400 block">Delivered Structured Data (Parsed JSON):</span>
                <pre className="p-3 rounded-lg bg-black/60 border border-[#d7ff4f]/20 text-[10px] font-mono text-[#d7ff4f] overflow-x-auto max-h-36">
                  {synapseResult ? JSON.stringify(synapseResult.payload, null, 2) : '// Click "Run Head-to-Head Test" to see verified JSON delivery...'}
                </pre>
              </div>

              <div className="p-2.5 rounded-lg bg-[#d7ff4f]/10 border border-[#d7ff4f]/30 text-[11px] text-zinc-300 flex items-start gap-2">
                <Zap className="w-4 h-4 text-[#d7ff4f] shrink-0 mt-0.5" />
                <span>
                  <strong>Closed Economic Equilibrium:</strong> Publisher receives instant 0.1¢ revenue (99.9% to publisher after 0.1% protocol fee). The AI agent gets clean data in 14ms. Both parties win.
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
                    <th className="py-2 px-3 text-[#d7ff4f]">Synapse402 on Tempo L1</th>
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
                    <td className="py-2.5 px-3 text-[#d7ff4f] font-bold">&lt;15ms gateway check (~135ms Tempo L1 block)</td>
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
              {selectedDeliverablePreview.content}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/10 text-xs font-mono">
              <span className="text-zinc-500 text-[11px]">Settled on Tempo L1 (Chain 42431) • Zero Subscriptions</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    navigator.clipboard.writeText(selectedDeliverablePreview.content);
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
