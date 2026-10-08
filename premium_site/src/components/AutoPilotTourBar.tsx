import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Play, Pause, X, ChevronRight, ChevronLeft, ShieldAlert,
  FileText, Wallet, Store, Cpu, Layers, Minimize2, Maximize2,
  MoveHorizontal, CircleDollarSign,
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
  log: string;
  tab: 'demo' | 'missions' | 'dashboard' | 'live' | 'monetize' | 'swarm' | 'architecture';
  icon: React.ComponentType<{ className?: string }>;
  targetElementId: string;
  actionLabel: string;
  subView?: 'swarm' | 'stream' | 'mcp';
  substeps?: TourSubstep[];
}

interface TourSubstep {
  title: string;
  description: string;
  result: string;
  targetElementId: string;
}

export const TOUR_STEPS: TourStep[] = [
  { step: 1, total: 8, title: 'Choose one job and one cap', tag: 'STEP 1 / 8', description: 'Pick the SOL/USDT brief. You set the maximum; the Lead Agent chooses the allowed steps.', what: 'One job. One cap. The system handles routing and keeps every request inside that limit.', why: 'You control the outcome and the maximum without configuring every worker.', result: 'Ready: SOL/USDT brief · cap $0.005', log: 'Selected job, maximum budget, and approved inputs.', tab: 'missions', targetElementId: 'tour-sol-mission', actionLabel: 'Open SOL job', icon: Wallet },
  { step: 2, total: 8, title: 'Watch the Lead Agent run it', tag: 'STEP 2 / 8', description: 'The Lead Agent moves from free market data to local analysis, one paid depth input, and the final brief.', what: 'Lead Agent → free market data → local analysis → Amberdata depth → CoinGlass gap → final brief.', why: 'Free inputs are used first; payment happens only for an approved extra input.', result: 'One market brief with zones, momentum, paid depth, and the missing liquidation context.', log: 'Pipeline states, worker outputs, and one shared job maximum.', tab: 'swarm', subView: 'swarm', targetElementId: 'tour-sol-lead-agent', actionLabel: 'Show workforce', icon: Cpu, substeps: [
    { title: 'Lead Agent', description: 'Sets the order, checks the cap, and directs every worker.', result: 'Current: Lead Agent · coordinating', targetElementId: 'tour-sol-lead-agent' },
    { title: 'Market Data · FREE', description: 'Free public candles and volume start the job.', result: 'Current: market data · FREE · $0', targetElementId: 'tour-sol-bybit-free' },
    { title: 'Local Analysis · FREE', description: 'Trend, zones, and volatility are calculated locally for $0.', result: 'Current: Local Analysis · FREE · $0', targetElementId: 'tour-sol-local-analysis' },
    { title: 'Amberdata · PAID', description: 'One approved market-depth snapshot costs $0.001.', result: 'Current: Amberdata · PAID · $0.001', targetElementId: 'tour-sol-amberdata-depth' },
    { title: 'CoinGlass · NO ROUTE', description: 'The AI needs this liquidation query, but CoinGlass needs to add our SDK before it can become a purchase.', result: 'Current: CoinGlass · no data · $0 revenue', targetElementId: 'tour-sol-coinglass-skipped' },
    { title: 'Final Market Brief', description: 'The Lead Agent combines the available evidence and flags the missing liquidation data.', result: 'Current: Final Report · ready to review', targetElementId: 'tour-sol-final-report' },
  ] },
  { step: 3, total: 8, title: 'Show the payment moment', tag: 'STEP 3 / 8', description: 'A premium resource states its price, the rules check the job limit, and the agent can continue after approval.', what: 'Need resource → price → rule check → payment → resource received → work continues.', why: 'The agent does not stop for a human checkout or a new subscription.', result: 'The payment walkthrough shows the approved request and its returned resource.', log: 'Resource price, policy decision, payment state, and response.', tab: 'demo', targetElementId: 'execution-stage', actionLabel: 'Show payment flow', icon: CircleDollarSign },
  { step: 4, total: 8, title: 'Show that rules cannot be bypassed', tag: 'STEP 4 / 8', description: 'One compact safety view covers the outcomes that protect the shared balance.', what: 'Over budget → blocked · unapproved provider → blocked · invalid payment → rejected · duplicate → no second charge.', why: 'Economic autonomy does not mean unlimited spending.', result: 'The safety matrix shows the request outcome and the amount protected.', log: 'Rule result, reason, and confirmed debit amount.', tab: 'demo', targetElementId: 'demo-test-matrix', actionLabel: 'Show safety rules', icon: ShieldAlert },
  { step: 5, total: 8, title: 'Use controls when work repeats', tag: 'STEP 5 / 8', description: 'One maximum is enough for a normal mission. Reusable rules are for recurring or background work.', what: 'Shared balance, reusable limit, approved providers, and active or paused rules are visible together.', why: 'A company can tighten repeated work without forcing every normal mission through manual setup.', result: 'The spending controls explain the simple path and the advanced path separately.', log: 'Balance, reusable rule, provider allowlist, and rule state.', tab: 'dashboard', targetElementId: 'section-agent-wallet-budget', actionLabel: 'Show controls', icon: Wallet },
  { step: 6, total: 8, title: 'Show why providers would join', tag: 'STEP 6 / 8', description: 'CoinGlass is the concrete provider opportunity: the request is useful, but there is no machine payment route yet.', what: 'Without the SDK: one liquidation query → no purchase → no data → $0. With the SDK: query → small payment → data → provider revenue.', why: 'Synapse402 adds an additional per-request channel for customers who would not buy a full API subscription.', result: 'The provider view shows the SDK as an opportunity, not a claimed partnership or guaranteed revenue.', log: 'Route, price example, provider response, and revenue state.', tab: 'monetize', targetElementId: 'section-api-monetization', actionLabel: 'Show provider opportunity', icon: Store },
  { step: 7, total: 8, title: 'Leave a payment record', tag: 'STEP 7 / 8', description: 'Receipts show what was bought, the amount, the status, and the Tempo Explorer link when a payment is confirmed.', what: 'Payment proof identifies the transaction; provider output remains labelled live, sample, or demo.', why: 'A receipt proves payment, not the authenticity of an external sample response.', result: 'The receipt table makes spending and evidence easy to audit.', log: 'Resource, amount, provider label, status, tx hash, and Explorer link.', tab: 'live', targetElementId: 'section-live-payments-feed', actionLabel: 'Show receipts', icon: FileText },
  { step: 8, total: 8, title: 'Zoom out: the product loop', tag: 'STEP 8 / 8', description: 'The same pattern scales from one narrow job to more providers and longer-running machine work.', what: 'Job + budget → AI works → needs resource → rules check → pay or block → result → receipt.', why: 'SOL is the example; the payment layer can later serve other machine-paid resources.', result: 'The architecture view closes with a realistic path from today’s loop to broader provider access.', log: 'Configured network, contracts, payment proof, and roadmap context.', tab: 'architecture', targetElementId: 'architecture-specs-section', actionLabel: 'Show the roadmap', icon: Layers },
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
  executionMode?: 'LIVE_TESTNET' | 'RESILIENT_SANDBOX';
  dockSide?: 'right' | 'left';
  onDockSideChange?: (side: 'right' | 'left') => void;
}

export const AutoPilotTourBar: React.FC<AutoPilotTourBarProps> = ({ currentStepIndex, isPaused, onTogglePause, onNext, onPrev, onStop, onTriggerAction, onStepSelect, executionMode = 'RESILIENT_SANDBOX', dockSide = 'right', onDockSideChange }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [targetReady, setTargetReady] = useState(true);
  const [workforceSubstepIndex, setWorkforceSubstepIndex] = useState(0);
  const autoActionStepRef = useRef<number | null>(null);
  const previousStepRef = useRef(currentStepIndex);
  const currentStep = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0];
  const narrationStep = targetReady || currentStepIndex === 0 ? currentStep : TOUR_STEPS[currentStepIndex - 1] || currentStep;
  const Icon = narrationStep.icon;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;
  const isLiveMode = executionMode === 'LIVE_TESTNET';
  const activeSubstep = currentStep.substeps?.[workforceSubstepIndex];
  const activeTargetElementId = activeSubstep?.targetElementId || currentStep.targetElementId;
  const isWorkforceSubstep = currentStepIndex === 1 && Boolean(activeSubstep);
  const displayTitle = activeSubstep?.title || narrationStep.title;
  const displayDescription = activeSubstep?.description || narrationStep.description;
  const displayResult = activeSubstep?.result || narrationStep.result;
  const progress = useMemo(() => ((currentStepIndex + 1) / TOUR_STEPS.length) * 100, [currentStepIndex]);

  useEffect(() => { setWorkforceSubstepIndex(0); }, [currentStepIndex]);

  useEffect(() => {
    document.querySelectorAll('.tour-spotlight-active').forEach((el) => el.classList.remove('tour-spotlight-active'));
    setTargetReady(false);
    let readyTimer: number | undefined;
    const timer = window.setTimeout(() => {
      const target = document.getElementById(activeTargetElementId);
      if (target) {
        window.scrollTo({ left: 0, behavior: 'auto' });
        // Keep the split layout anchored horizontally; only pan vertically to
        // the active card so the narrator column never hides the workspace.
        const workforceAnchorId = currentStepIndex === 1
          ? (workforceSubstepIndex === 0 ? 'tour-sol-lead-agent' : 'tour-sol-bybit-free')
          : activeTargetElementId;
        const scrollTarget = document.getElementById(workforceAnchorId) || target;
        scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        target.classList.add('tour-spotlight-active');
        readyTimer = window.setTimeout(() => {
          const latestRect = scrollTarget.getBoundingClientRect();
          const viewportTop = window.innerHeight * 0.28;
          if (latestRect.top < viewportTop || latestRect.bottom > window.innerHeight * 0.78) {
            const scrollHost = document.scrollingElement || document.documentElement;
            scrollHost.scrollTo({ top: Math.max(0, scrollHost.scrollTop + latestRect.top - viewportTop), behavior: 'smooth' });
          }
          setTargetReady(true);
        }, 620);
      } else {
        setTargetReady(true);
      }
    }, 220);
    return () => { window.clearTimeout(timer); if (readyTimer) window.clearTimeout(readyTimer); };
  }, [currentStepIndex, activeTargetElementId]);

  useEffect(() => () => { document.querySelectorAll('.tour-spotlight-active').forEach((el) => el.classList.remove('tour-spotlight-active')); }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onStop();
      if (event.key === 'ArrowRight') onNext();
      if (event.key === 'ArrowLeft') onPrev();
      if (event.key === ' ') { event.preventDefault(); onTogglePause(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, onStop, onTogglePause]);

  useEffect(() => {
    if (isPaused || isLastStep) return;
    // The workforce step needs a little longer so the real pipeline can
    // finish and the final brief is visible before the story moves on.
    const hasMoreWorkforceSubsteps = currentStepIndex === 1 && Boolean(currentStep.substeps && workforceSubstepIndex < currentStep.substeps.length - 1);
    const stepDelayMs = currentStepIndex === 1 ? 5200 : currentStepIndex === 2 ? 14000 : 12000;
    const timer = window.setTimeout(() => {
      if (hasMoreWorkforceSubsteps) setWorkforceSubstepIndex((index) => index + 1);
      else onNext();
    }, stepDelayMs);
    return () => window.clearTimeout(timer);
  }, [isPaused, isLastStep, currentStepIndex, currentStep.substeps, workforceSubstepIndex, onNext]);

  // In evaluation mode, automatic playback performs the safe demo action so
  // the judge sees the real page move. Live mode remains manual by design.
  useEffect(() => {
    if (previousStepRef.current !== currentStepIndex) {
      previousStepRef.current = currentStepIndex;
      autoActionStepRef.current = null;
    }
  }, [currentStepIndex]);

  useEffect(() => {
    if (isPaused || isLiveMode || !onTriggerAction || ![1, 2, 3].includes(currentStepIndex)) return;
    const timer = window.setTimeout(() => {
      if (autoActionStepRef.current === currentStepIndex) return;
      autoActionStepRef.current = currentStepIndex;
      onTriggerAction();
    }, 900);
    return () => window.clearTimeout(timer);
  }, [isPaused, isLiveMode, currentStepIndex]);

  const runAction = () => { soundEngine.playClick(); if ([1, 2, 3].includes(currentStepIndex)) autoActionStepRef.current = currentStepIndex; onTriggerAction?.(); };
  const next = () => {
    soundEngine.playClick();
    if (currentStepIndex === 1 && currentStep.substeps && workforceSubstepIndex < currentStep.substeps.length - 1) {
      setWorkforceSubstepIndex((index) => index + 1);
      return;
    }
    isLastStep ? onStop() : onNext();
  };
  const prev = () => {
    soundEngine.playClick();
    if (currentStepIndex === 1 && workforceSubstepIndex > 0) {
      setWorkforceSubstepIndex((index) => index - 1);
      return;
    }
    onPrev();
  };

  if (isMinimized) return (
    <aside role="dialog" aria-label="Judge Mode (minimized)" className={`fixed bottom-5 z-50 ${dockSide === 'right' ? 'right-5' : 'left-5'} flex items-center gap-3 rounded-full border border-[#d7ff4f]/60 bg-[#0d1017]/95 px-4 py-2.5 shadow-2xl backdrop-blur-xl`}>
      <span className="h-2 w-2 rounded-full bg-[#d7ff4f] shadow-[0_0_12px_rgba(215,255,79,.7)]" /><span className="text-[11px] font-bold text-white">{currentStep.tag} · {currentStep.title}</span>
      <button type="button" onClick={next} className="rounded-lg bg-[#d7ff4f] px-2 py-1 text-[10px] font-bold text-[#08090c]">Next</button>
      <button type="button" onClick={() => setIsMinimized(false)} className="text-zinc-400 hover:text-white" title="Expand Judge Mode"><Maximize2 className="h-4 w-4" /></button>
      <button type="button" onClick={onStop} className="text-zinc-400 hover:text-white" title="Exit Judge Mode"><X className="h-4 w-4" /></button>
    </aside>
  );

  return (
    <>
    <aside role="dialog" aria-busy={!targetReady} aria-label="Synapse402 Judge Mode" className={`judge-mode-panel fixed top-4 z-50 ${dockSide === 'right' ? 'right-4' : 'left-4'} w-[min(26vw,380px)] max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-3xl border border-white/20 bg-[#0d1219]/96 p-4 shadow-[0_24px_80px_rgba(0,0,0,.7)] backdrop-blur-2xl font-sans sm:p-5`}>
        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d7ff4f] text-[#08090c]"><Icon className="h-5 w-5" /></div><div><div className="text-[11px] font-black uppercase tracking-[.22em] text-[#d7ff4f]">SYNAPSE402 · JUDGE MODE</div><div className="mt-1 text-xs text-zinc-400">Follow the product loop · {currentStep.tag}</div></div></div>
          <div className="flex items-center gap-1"><button type="button" onClick={() => onDockSideChange?.(dockSide === 'right' ? 'left' : 'right')} className="rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-white" title="Move panel"><MoveHorizontal className="h-4 w-4" /></button><button type="button" onClick={() => setIsMinimized(true)} className="rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-white" title="Minimize"><Minimize2 className="h-4 w-4" /></button><button type="button" onClick={onStop} className="rounded-lg p-2 text-zinc-400 hover:text-white" title="Exit Judge Mode"><X className="h-4 w-4" /></button></div>
        </div>
        <div className="mt-5 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-400"><span>{currentStep.tag}{isWorkforceSubstep ? ` · ${workforceSubstepIndex + 1}/${currentStep.substeps?.length || 0}` : ''}</span><span>{Math.round(progress)}% complete</span></div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#d7ff4f] transition-all duration-500" style={{ width: `${progress}%` }} /></div>
        <section className={`mt-5 ${isWorkforceSubstep ? 'space-y-2' : 'space-y-3'}`}><h2 className="text-xl font-black leading-tight tracking-tight text-white sm:text-2xl">{displayTitle}</h2><p className="text-[13px] leading-relaxed text-zinc-300">{displayDescription}</p>{!isWorkforceSubstep && <><div className="rounded-2xl border border-[#d7ff4f]/25 bg-[#d7ff4f]/[.07] p-3"><div className="flex items-start gap-2 text-[13px] font-semibold leading-relaxed text-white"><span className="mt-1 text-[#d7ff4f]">●</span><span>{narrationStep.what}</span></div></div><div className="rounded-xl border border-emerald-300/20 bg-emerald-300/[.05] p-3"><span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">{currentStepIndex === 0 ? 'READY TO RUN' : 'RESULT'}</span><p className="mt-1 text-xs leading-relaxed text-zinc-200">{currentStepIndex === 0 ? 'SOL/USDT analysis · max spend $0.005' : narrationStep.result}</p></div></>}{isWorkforceSubstep && <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/[.05] p-3"><span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">CURRENT</span><p className="mt-1 text-xs leading-relaxed text-zinc-200">{displayResult}</p></div>}</section>
        {!isWorkforceSubstep && (isLiveMode ? <div className="mt-5 rounded-xl border border-amber-300/25 bg-amber-300/[.06] p-3 text-xs leading-relaxed text-amber-100">Live proof is manual. Judge Mode will not send a payment by itself.</div> : <div className="mt-5 rounded-xl border border-sky-300/20 bg-sky-300/[.05] p-3 text-xs leading-relaxed text-sky-100">Evaluation mode: inspect the real flow without sending a blockchain payment.</div>)}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4"><button type="button" onClick={onTogglePause} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[.06] px-3 py-2 text-xs font-semibold text-white hover:bg-white/10">{isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}{isPaused ? 'Play automatically' : 'Pause tour'}</button>{onTriggerAction && (!isWorkforceSubstep || workforceSubstepIndex === 0) && <button type="button" onClick={runAction} className="inline-flex items-center gap-2 rounded-xl bg-[#d7ff4f] px-3 py-2 text-xs font-black text-[#08090c] hover:bg-[#c6f03d]"><Play className="h-3.5 w-3.5 fill-current" />{isLiveMode && currentStepIndex === 1 ? 'Run live workforce proof' : isLiveMode && currentStepIndex === 2 ? 'Run live proof' : currentStepIndex === 1 ? 'Run evaluation workforce' : currentStep.actionLabel}</button>}<button type="button" onClick={prev} disabled={currentStepIndex === 0 && workforceSubstepIndex === 0} className="rounded-xl border border-white/10 bg-white/[.04] p-2 text-zinc-300 hover:text-white disabled:opacity-30" title="Back"><ChevronLeft className="h-4 w-4" /></button><button type="button" onClick={next} className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-white/[.10] px-3 py-2 text-xs font-semibold text-white hover:bg-white/15">{isLastStep ? 'Finish' : 'Next'}<ChevronRight className="h-4 w-4" /></button></div>
        <div className="mt-4 grid grid-cols-8 gap-1.5" aria-label="Judge Mode progress">{TOUR_STEPS.map((step, index) => <button key={step.step} type="button" onClick={() => onStepSelect?.(index)} title={step.title} className={`h-1.5 rounded-full transition-all ${index === currentStepIndex ? 'bg-[#d7ff4f]' : index < currentStepIndex ? 'bg-[#d7ff4f]/45' : 'bg-white/15 hover:bg-white/30'}`} />)}</div>
      </aside>
    </>
  );
};
