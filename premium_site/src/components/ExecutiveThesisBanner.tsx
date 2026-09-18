import React, { useState } from 'react';
import { Zap, ArrowRight, ChevronDown, ChevronUp, Lock, CheckCircle2, XCircle, CreditCard, ShieldAlert, AlertTriangle, Coins, ShieldCheck } from 'lucide-react';
import { soundEngine } from '../utils/audioEffects';

interface ExecutiveThesisBannerProps {
  onJumpToDemo: () => void;
  onJumpToArchitecture: () => void;
}

export const ExecutiveThesisBanner: React.FC<ExecutiveThesisBannerProps> = ({
  onJumpToDemo,
  onJumpToArchitecture,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    soundEngine.playClick();
    setIsExpanded(!isExpanded);
  };

  return (
    <div id="executive-thesis-root" className="bg-white/[.03] backdrop-blur-md border border-white/[.08] rounded-xl overflow-hidden shadow-sm transition-all duration-300">
      {/* Top Banner Bar */}
      <div 
        onClick={toggleExpand}
        className="px-4 py-3 bg-gradient-to-r from-[#12171d] via-[#15201d] to-[#12171d] flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-white/[.06] transition-colors border-b border-white/[.08]/60"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#d7ff4f]/[.08] border border-[#d7ff4f]/30 flex items-center justify-center text-[#d7ff4f] shrink-0 font-mono font-bold text-xs shadow-inner">
            <Zap className="w-4 h-4 text-[#d7ff4f]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#f5f5f2] font-sans tracking-tight">
                Synapse402: A payment layer for autonomous work
              </span>
              <span className="hidden md:inline text-[9px] px-2 py-0.5 rounded-full bg-[#d7ff4f]/[.08] text-[#d7ff4f] border border-[#d7ff4f]/30 font-mono font-semibold">
                PAY-AS-YOU-GO vs MONTHLY SUBSCRIPTIONS
              </span>
            </div>
            <p className="text-[11px] text-white/50">
              Websites often block machine traffic, while agents cannot safely use cards or open wallets. Synapse402 gives agents scoped budgets and uses Tempo L1's native micropayment rail so services can request small, traceable payments for the work they return.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto font-mono text-xs">
          <span className="text-[10px] text-[#d7ff4f] font-semibold hidden sm:inline">
            {isExpanded ? 'Collapse Overview' : 'View Executive Overview'}
          </span>
          <div className="w-6 h-6 rounded-md bg-white/[.04] border border-white/15 flex items-center justify-center text-white/50 hover:text-[#f5f5f2]">
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </div>
      </div>

      {/* Expandable Comparison Content (Streamlined to ~150px) */}
      {isExpanded && (
        <div className="p-3 sm:p-4 space-y-3 bg-black/40 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* The Problem: Expensive Plans vs AI Needs */}
            <div className="bg-white/[.02] border border-[#ff5c5c]/20 rounded-lg p-3 space-y-2.5">
              <div className="flex items-center gap-1.5 border-b border-white/[.06] pb-1.5">
                <XCircle className="w-3.5 h-3.5 text-[#ff5c5c]" />
                <h4 className="text-[11px] font-bold text-[#ff5c5c] font-mono uppercase tracking-wider">
                  The Problem: Subscriptions & Credit Cards
                </h4>
              </div>
              <ul className="space-y-2 text-[11px] text-zinc-300 font-sans">
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CreditCard className="w-3 h-3" />
                  </div>
                  <span><strong>Fixed fees:</strong> card minimums make tiny machine requests hard to price.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldAlert className="w-3 h-3" />
                  </div>
                  <span><strong>Blocked machine traffic:</strong> a 403 gives an agent no useful path to complete its task.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-3 h-3" />
                  </div>
                  <span><strong>Open-wallet risk:</strong> an agent loop or bad instruction can spend far beyond the intended job.</span>
                </li>
              </ul>
            </div>

            {/* The Solution: Synapse402 on Tempo L1 */}
            <div className="bg-white/[.02] border border-[#d7ff4f]/25 rounded-lg p-3 space-y-2.5">
              <div className="flex items-center gap-1.5 border-b border-white/[.06] pb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#d7ff4f]" />
                <h4 className="text-[11px] font-bold text-[#d7ff4f] font-mono uppercase tracking-wider">
                  The Solution: Synapse402 on Tempo L1
                </h4>
              </div>
              <ul className="space-y-2 text-[11px] text-zinc-300 font-sans">
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded bg-[#d7ff4f]/10 border border-[#d7ff4f]/30 text-[#d7ff4f] flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-3 h-3" />
                  </div>
                  <span><strong>Small payments:</strong> Tempo L1 makes the per-request rail practical for tiny machine charges.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded bg-[#d7ff4f]/10 border border-[#d7ff4f]/30 text-[#d7ff4f] flex items-center justify-center shrink-0 mt-0.5">
                    <Coins className="w-3 h-3" />
                  </div>
                  <span><strong>Small route fee:</strong> the service keeps the configured share; no fixed card swipe fee is required for the example flow.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded bg-[#d7ff4f]/10 border border-[#d7ff4f]/30 text-[#d7ff4f] flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-3 h-3" />
                  </div>
                  <span><strong>Bounded spending:</strong> daily limits and approved providers keep each agent inside its job.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded bg-[#d7ff4f]/10 border border-[#d7ff4f]/30 text-[#d7ff4f] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <span><strong>Failure is visible:</strong> if a provider fails, the flow marks the request failed instead of claiming a successful payment.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[.06] font-mono text-[10px]">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Lock className="w-3 h-3 text-[#d7ff4f]" />
              <span>SynapseVault.sol smart contract • Zero-custody architecture</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onJumpToArchitecture();
                }}
                className="px-2.5 py-1 rounded bg-white/[.04] hover:bg-white/[.08] border border-white/15 text-zinc-200 text-[10px] transition-colors cursor-pointer"
              >
                Inspect Architecture ➔
              </button>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onJumpToDemo();
                }}
                className="px-2.5 py-1 rounded bg-[#d7ff4f]/10 hover:bg-[#d7ff4f]/20 border border-[#d7ff4f]/40 text-[#d7ff4f] font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Payment walkthrough</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
