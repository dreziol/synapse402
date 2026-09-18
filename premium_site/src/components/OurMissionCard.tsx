import React from 'react';
import { ShieldAlert, Zap, ShieldCheck, ArrowRight, Target, CreditCard, XCircle, Clock, CheckCircle2, Lock } from 'lucide-react';
import { InfoBadge } from './InfoBadge';

interface OurMissionCardProps {
  onJumpToDemo?: () => void;
}

export const OurMissionCard: React.FC<OurMissionCardProps> = ({ onJumpToDemo }) => {
  return (
    <section 
      aria-label="Our Mission"
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 p-5 sm:p-6"
    >
      {/* Header bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/[.08] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05] border border-white/10 text-zinc-300">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[.22em] text-[#d7ff4f]">
              Core Project Mission
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Why Synapse402 Exists: Turning blocked requests into paid access
            </h2>
          </div>
        </div>

        {onJumpToDemo && (
          <button
            onClick={onJumpToDemo}
            className="flex items-center gap-1.5 rounded-lg bg-[#d7ff4f]/10 border border-[#d7ff4f]/30 px-3 py-1 text-xs font-semibold text-[#d7ff4f] hover:bg-[#d7ff4f] hover:text-[#08090c] transition cursor-pointer"
          >
            <span>Walk through one payment</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* 3 Pillars: Problem, Solution, Protection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        
        {/* Pillar 1: The Problem */}
        <div className="rounded-xl border border-white/10 bg-black/50 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/5 border border-white/10 text-zinc-300">
                <ShieldAlert className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
                1. The Problem
              </span>
            </div>
            <h3 className="text-xs font-semibold text-white mb-2">
              Websites Waste Millions Blocking AI Bots
            </h3>
            <ul className="space-y-2 text-[11px] text-zinc-300">
              <li className="flex items-start gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                <span><strong>403 Forbidden Walls:</strong> Sites block bots and earn $0 revenue.</span>
              </li>
              <li className="flex items-start gap-2">
                <CreditCard className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                <span><strong>No Credit Cards:</strong> AI bots can't pass CAPTCHAs or enter CVVs.</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                <span><strong>Expensive Retainers:</strong> $50/mo subscriptions fail for micro-data.</span>
              </li>
            </ul>
          </div>
          <div className="mt-3 pt-2 border-t border-rose-500/15 text-[10px] font-mono text-zinc-300/80">
            Outcome: Dead 403 walls & zero income
          </div>
        </div>

        {/* Pillar 2: The Solution */}
        <div className="rounded-xl border border-[#d7ff4f]/25 bg-zinc-950/70 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#d7ff4f]/10 border border-[#d7ff4f]/30 text-[#d7ff4f]">
                <Zap className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-bold text-[#d7ff4f] uppercase tracking-wider font-mono">
                2. The Solution
              </span>
            </div>
            <h3 className="text-xs font-semibold text-white mb-2 flex items-center justify-between">
              <span>0.1¢ Micro-Payment Gateway</span>
              <InfoBadge
                title="HTTP 402 + Tempo L1"
                text="Replaces a blind 403 block with a payment request. The service can state a price, and the backend confirms the payment status before delivery."
              />
            </h3>
            <ul className="space-y-2 text-[11px] text-zinc-300">
              <li className="flex items-start gap-2">
                <Zap className="w-3.5 h-3.5 text-[#d7ff4f] shrink-0 mt-0.5" />
                <span><strong>0.1¢ Access:</strong> Replace 403 blocks with pay-per-request.</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-[#d7ff4f] shrink-0 mt-0.5" />
                <span><strong>Fast rule check:</strong> the request is checked before the service returns its data.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#d7ff4f] shrink-0 mt-0.5" />
                <span><strong>Pay per approved request:</strong> the service receives the configured price minus any displayed route fee.</span>
              </li>
            </ul>
          </div>
          <div className="mt-3 pt-2 border-t border-[#d7ff4f]/15 text-[10px] font-mono text-[#d7ff4f]/80">
            Benefit: Pay only for exact data delivered
          </div>
        </div>

        {/* Pillar 3: The Protection */}
        <div className="rounded-xl border border-white/10 bg-zinc-950/70 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.05] border border-white/10 text-zinc-300">
                <ShieldCheck className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">
                3. The Protection
              </span>
            </div>
            <h3 className="text-xs font-semibold text-white mb-2 flex items-center justify-between">
              <span>Controlled Accounts with Hard Limits</span>
              <InfoBadge
                title="EIP-712 & Merkle Tree Guardrails"
                text="Enforced by SynapseVault.sol smart contracts on Tempo Moderato (42431). Bots cannot exceed their allocated daily cap or pay unapproved vendors."
              />
            </h3>
            <ul className="space-y-2 text-[11px] text-zinc-300">
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-300 shrink-0 mt-0.5" />
                <span><strong>Hard Daily Caps:</strong> Set strict $5/day budgets per bot.</span>
              </li>
              <li className="flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 text-zinc-300 shrink-0 mt-0.5" />
                <span><strong>Approved Whitelist:</strong> Merkle checks prevent unapproved calls.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-zinc-300 shrink-0 mt-0.5" />
                <span><strong>$0 Overdraft:</strong> Smart contract policy — zero overspending allowed.</span>
              </li>
            </ul>
          </div>
          <div className="mt-3 pt-2 border-t border-white/10 text-[10px] font-mono text-zinc-400">
            Safety: Zero financial exposure risk
          </div>
        </div>

      </div>
    </section>
  );
};
