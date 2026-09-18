import React, { useState, useEffect } from 'react';
import { 
  Play, X, ChevronRight, ChevronLeft, Sparkles, ShieldAlert, 
  FileText, Wallet, Check, AlertTriangle, Store, Cpu, Layers, 
  Minimize2, Maximize2, MoveHorizontal 
} from 'lucide-react';
import { soundEngine } from '../utils/audioEffects';

export interface TourStep {
  step: number;
  total: number;
  title: string;
  tag: string;
  description: string;
  what: string;
  why: string;
  result: string;
  tab: 'demo' | 'dashboard' | 'live' | 'monetize' | 'swarm' | 'architecture';
  icon: React.ComponentType<{ className?: string }>;
  targetElementId: string;
  actionLabel: string;
  subView?: 'swarm' | 'stream' | 'mcp';
}

export const TOUR_STEPS: TourStep[] = [
  {
    step: 1,
    total: 8,
    title: 'The AI Economy: 0.1¢ Micropayment (No 403 Blocks)',
    tag: 'STEP 1 / 8',
    description: 'Websites replace Cloudflare 403 blocks with 0.1¢ monetization (Google AdSense for AI bots). Bots buy clean data on-demand on Tempo L1.',
    what: 'Bot requests data -> Pays 0.1¢ in <15ms -> Receives clean JSON payload directly into memory with zero CAPTCHAs.',
    why: 'Buyers pay on-demand ($0 idle monthly retainers). Websites earn 99.9% of payment instead of burning bandwidth on 403 blocks.',
    result: 'Delivered: Live AI data in 14ms. Spend: $0.0008. Publisher payout: 99.9% (0.1% protocol fee). Gas: <$0.00002.',
    tab: 'demo',
    targetElementId: 'demo-action-box',
    actionLabel: 'Run Payment',
    icon: Sparkles,
  },
  {
    step: 2,
    total: 8,
    title: 'Rogue Website & Drainer Interception',
    tag: 'STEP 2 / 8',
    description: 'Malicious prompt attempts to drain funds to rogue host. Approved Merkle whitelist blocks it in <3ms.',
    what: 'Attacker injects untrusted URL (api.rogue-drainer.xyz) -> Protocol intercepts before debit occurs.',
    why: 'Treasury protection: Prevents runaway bot prompt injections from draining enterprise crypto wallets.',
    result: 'Blocked: $0.00 debited. Exact attack reason logged in audit receipt ($0.00 net loss).',
    tab: 'demo',
    targetElementId: 'demo-test-matrix',
    actionLabel: 'Run Attack Test',
    icon: ShieldAlert,
  },
  {
    step: 3,
    total: 8,
    title: 'Crash Auto-Refund (Atomic SLA Protection)',
    tag: 'STEP 3 / 8',
    description: 'Third-party API server crashes with HTTP 500. Synapse402 auto-refunds escrowed funds in 12ms.',
    what: 'Bot authorizes payment -> Upstream server fails to deliver payload -> Escrow refunded automatically.',
    why: 'Cryptographic SLA: Ensures bot operators never pay when external vendors experience downtime or timeouts ($0.00 Lost).',
    result: 'Refunded: HTTP 500 caught, $0.00 debited, zero lost budget on failed vendor requests.',
    tab: 'demo',
    targetElementId: 'demo-pipeline-section',
    actionLabel: 'Test Crash Auto-Refund',
    icon: AlertTriangle,
  },
  {
    step: 4,
    total: 8,
    title: 'Itemized Receipts & Unlocked Payload Proof',
    tag: 'STEP 4 / 8',
    description: 'Click any receipt to inspect the exact data delivered to the bot for 0.1¢, with zero guesswork.',
    what: 'Bot received this exact file/payload (stock depth, article text, or AI analysis) and only 0.1¢ was debited.',
    why: 'Proves the bot received tangible data for its 0.1¢ with $0.00 wasted on dead retainers, backed by instant corporate accounting receipts.',
    result: 'Delivered: Purchased payload unlocked in memory, debited exactly $0.0010 USD, Tempo gas: <$0.00002.',
    tab: 'live',
    targetElementId: 'section-live-payments-feed',
    actionLabel: 'Inspect Receipt',
    icon: FileText,
  },
  {
    step: 5,
    total: 8,
    title: 'Autonomous Agent Budgets & Scoped Daily Limits',
    tag: 'STEP 5 / 8',
    description: 'Assign scoped session keys with hard daily budget caps ($5–$25/day) to prevent runaway bot spending.',
    what: 'Each AI bot receives a dedicated session key that auto-freezes once its daily cap is reached.',
    why: 'Prevents infinite billing loops: agents can never exceed their authorized department allowance.',
    result: 'Budget capped: Real-time spend tracking with automatic lock when quota exhausted.',
    tab: 'dashboard',
    targetElementId: 'section-agent-wallet-budget',
    actionLabel: 'Create Session Key',
    icon: Wallet,
  },
  {
    step: 6,
    total: 8,
    title: 'Turn Bot Crawlers into Direct Revenue',
    tag: 'STEP 6 / 8',
    description: 'Monetize crawler traffic via 2 lines of middleware: bots get clean data, you earn 99.9% of payment (0.1% protocol fee).',
    what: 'Visiting AI bot receives clean data payload, and website owner receives instant $0.0010 deposited directly into wallet.',
    why: 'Bypasses credit cards (which fail on sub-dollar amounts due to 30¢ minimum fee) and monetizes AI bot traffic with 99.9% seller payout (0.1% protocol fee).',
    result: 'Delivered: +$0.0010 deposited to merchant wallet (99.9% to seller); bot downloaded clean article without CAPTCHA blocks.',
    tab: 'monetize',
    targetElementId: 'section-api-monetization',
    actionLabel: 'Test Merchant Paywall',
    icon: Store,
  },
  {
    step: 7,
    total: 8,
    title: 'AI Workforce: 20 Mission Units',
    tag: 'STEP 7 / 8',
    description: 'Lead AI coordinates 12 creative workers and buys data from 7 media providers on Tempo L1.',
    what: 'Workforce executes tasks concurrently, paying per-request on Tempo L1 with zero monthly retainers.',
    why: 'Replaces thousands in agency fees and SaaS retainers with pay-as-you-go micro-settlements.',
    result: '20 units delivered complete business package for $0.0245 under $0.0500 budget cap.',
    tab: 'swarm',
    subView: 'swarm',
    targetElementId: 'section-swarm-view',
    actionLabel: 'Execute Workforce Mission',
    icon: Cpu,
  },
  {
    step: 8,
    total: 8,
    title: 'Tempo L1 Parallel Engine (2D Nonces)',
    tag: 'STEP 8 / 8',
    description: 'Engineered specifically for Tempo with independent channels so bots never block each other.',
    what: '2D Nonce channels allow parallel transaction streaming with zero sequence collisions.',
    why: 'Tempo sub-cent fees (<$0.00002) make bot commerce economically viable vs credit cards.',
    result: 'Smart contracts live on Tempo Moderato (Chain ID: 42431).',
    tab: 'architecture',
    targetElementId: 'architecture-specs-section',
    actionLabel: 'Verify Architecture',
    icon: Layers,
  },
];

interface AutoPilotTourBarProps {
  currentStepIndex: number;
  isPaused: boolean;
  onTogglePause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onStop: () => void;
  onTriggerAction?: () => void;
  onStepSelect?: (index: number) => void;
}

export const AutoPilotTourBar: React.FC<AutoPilotTourBarProps> = ({
  currentStepIndex,
  onNext,
  onPrev,
  onStop,
  onTriggerAction,
  onStepSelect,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [dockSide, setDockSide] = useState<'right' | 'left'>('right');

  const currentStep = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0];
  const Icon = currentStep.icon;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  // Auto-scroll and spotlight the target element on step change
  useEffect(() => {
    // Remove previous spotlight
    document.querySelectorAll('.tour-spotlight-active').forEach((el) => {
      el.classList.remove('tour-spotlight-active');
    });

    const timer = setTimeout(() => {
      if (currentStep.targetElementId) {
        const target = document.getElementById(currentStep.targetElementId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          target.classList.add('tour-spotlight-active');
        }
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [currentStepIndex, currentStep.targetElementId]);

  // Cleanup spotlight on unmount
  useEffect(() => {
    return () => {
      document.querySelectorAll('.tour-spotlight-active').forEach((el) => {
        el.classList.remove('tour-spotlight-active');
      });
    };
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onStop();
      else if (e.key === 'ArrowRight') onNext();
      else if (e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, onStop]);

  if (isMinimized) {
    return (
      <aside
        role="dialog"
        aria-label="Interactive Tour Guide (Minimized)"
        className={`fixed bottom-5 z-40 ${dockSide === 'right' ? 'right-5 sm:right-6' : 'left-5 sm:left-6'} flex items-center gap-3 px-4 py-2.5 rounded-full border-2 border-[#d7ff4f]/80 bg-[#0d1017]/95 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.85),0_0_20px_rgba(215,255,79,0.25)] animate-in fade-in duration-200`}
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[#d7ff4f] text-[#08090c] flex items-center justify-center font-black">
            <Icon className="w-3 h-3 text-[#08090c]" />
          </div>
          <span className="text-[11px] font-mono font-bold text-white">
            STEP {currentStep.step}/8: <span className="text-[#d7ff4f]">{currentStep.actionLabel}</span>
          </span>
        </div>

        {onTriggerAction && (
          <button
            onClick={() => {
              soundEngine.playClick();
              onTriggerAction();
            }}
            className="px-2.5 py-1 rounded bg-[#d7ff4f] hover:bg-[#c6f03d] text-[#08090c] font-bold text-[11px] font-mono transition cursor-pointer"
          >
            {currentStep.actionLabel}
          </button>
        )}

        <div className="flex items-center gap-1 border-l border-white/10 pl-2">
          <button
            onClick={() => {
              soundEngine.playClick();
              onPrev();
            }}
            disabled={currentStepIndex === 0}
            className="p-1 rounded text-zinc-300 hover:text-white disabled:opacity-20 cursor-pointer"
            title="Previous Step"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              if (isLastStep) onStop();
              else onNext();
            }}
            className="p-1 rounded text-zinc-300 hover:text-white cursor-pointer"
            title={isLastStep ? 'Finish' : 'Next Step'}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={() => {
            soundEngine.playClick();
            setIsMinimized(false);
          }}
          className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          title="Expand Tour Card"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            soundEngine.playClick();
            onStop();
          }}
          className="p-1 rounded text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
          title="Close Tour"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </aside>
    );
  }

  return (
    <aside
      role="dialog"
      aria-label="Interactive Tour Guide"
      className={`fixed bottom-5 z-40 ${dockSide === 'right' ? 'right-5 sm:right-6' : 'left-5 sm:left-6'} w-[440px] max-w-[calc(100vw-2rem)] rounded-2xl border border-white/15 bg-[#0d1017]/95 backdrop-blur-2xl p-4 sm:p-5 shadow-2xl animate-in slide-in-from-bottom-5 duration-200 font-sans`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#d7ff4f] text-[#08090c] flex items-center justify-center font-black">
            <Icon className="w-4 h-4 text-[#08090c]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#d7ff4f] uppercase">
                GUIDED TOUR
              </span>
              <span className="text-white/30 text-xs">•</span>
              <span className="text-[10px] font-mono text-zinc-400">
                STEP {currentStep.step} OF {currentStep.total}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Flip side button */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setDockSide((prev) => (prev === 'right' ? 'left' : 'right'));
            }}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title={dockSide === 'right' ? 'Dock to Left Side' : 'Dock to Right Side'}
          >
            <MoveHorizontal className="w-3.5 h-3.5" />
          </button>
          {/* Minimize button */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setIsMinimized(true);
            }}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Minimize to Dock Pill"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          {/* Close button */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onStop();
            }}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-white/10 transition cursor-pointer"
            title="Close Tour (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Step Title & Description */}
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-white tracking-tight">
            {currentStep.title}
          </h4>
          <span className="px-2 py-0.5 rounded bg-white/[.05] border border-white/10 text-[10px] font-mono text-zinc-300 uppercase shrink-0">
            {currentStep.tab}
          </span>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed">
          {currentStep.description}
        </p>

        {/* Highlights: Action, Utility, Result */}
        <div className="space-y-1.5 pt-1 text-[11px]">
          <div className="flex items-start gap-1.5 text-zinc-300">
            <span className="text-[#d7ff4f] font-mono font-bold shrink-0">▸</span>
            <span><strong className="text-zinc-100">Action:</strong> {currentStep.what}</span>
          </div>
          <div className="flex items-start gap-1.5 text-zinc-300">
            <span className="text-[#38bdf8] font-mono font-bold shrink-0">▸</span>
            <span><strong className="text-zinc-100">Utility:</strong> {currentStep.why}</span>
          </div>
          <div className="flex items-start gap-1.5 text-zinc-300">
            <span className="text-emerald-400 font-mono font-bold shrink-0">▸</span>
            <span><strong className="text-zinc-100">Result:</strong> {currentStep.result}</span>
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between">
        {/* Progress dots */}
        <div className="flex items-center gap-1.5" title="Click any step dot to jump">
          {TOUR_STEPS.map((s, idx) => (
            <button
              key={s.step}
              type="button"
              onClick={() => {
                soundEngine.playClick();
                if (onStepSelect) onStepSelect(idx);
              }}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentStepIndex
                  ? 'w-5 bg-[#d7ff4f]'
                  : idx < currentStepIndex
                  ? 'w-1.5 bg-[#d7ff4f]/50 hover:bg-[#d7ff4f]/80'
                  : 'w-1.5 bg-white/20 hover:bg-white/40'
              }`}
              title={`Jump to Step ${s.step}: ${s.title}`}
            />
          ))}
        </div>

        {/* Action & Nav Buttons */}
        <div className="flex items-center gap-2 font-mono text-xs">
          {onTriggerAction && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onTriggerAction();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-[#d7ff4f] hover:bg-[#c6f03d] text-[#08090c] font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{currentStep.actionLabel}</span>
            </button>
          )}

          <button
            onClick={() => {
              soundEngine.playClick();
              onPrev();
            }}
            disabled={currentStepIndex === 0}
            className="p-1.5 rounded-lg bg-white/[.05] hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition disabled:opacity-20 cursor-pointer"
            title="Previous Step (Arrow Left)"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              if (isLastStep) {
                onStop();
              } else {
                onNext();
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold flex items-center gap-1 transition cursor-pointer"
            title={isLastStep ? 'Complete Tour' : 'Next Step (Arrow Right)'}
          >
            {isLastStep ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#d7ff4f]" />
                <span>Finish</span>
              </>
            ) : (
              <>
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
