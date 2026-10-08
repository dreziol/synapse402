import React from 'react';
import { useSynapseState } from '../../shared/SynapseStateContext';
import { SynapseStatusBadge } from './SynapseStatusBadge';
import { ShieldCheck, Activity } from 'lucide-react';

interface SynapseMetaBarProps {
  className?: string;
  showJobId?: boolean;
}

export const SynapseMetaBar: React.FC<SynapseMetaBarProps> = ({
  className = '',
  showJobId = false,
}) => {
  const { jobBudget, activeStatus } = useSynapseState();

  const planBadges: Record<'FULL' | 'REDUCED' | 'INSUFFICIENT', { label: string; color: string }> = {
    FULL: { label: 'FULL PLAN', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
    REDUCED: { label: 'REDUCED PLAN', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
    INSUFFICIENT: { label: 'BUDGET BLOCKED', color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' },
  };

  const currentPlan = planBadges[jobBudget.activePlan] || planBadges.FULL;

  return (
    <div className={`p-3 rounded-xl border border-white/10 bg-[#0c0e14] flex flex-wrap items-center justify-between gap-3 text-xs ${className}`}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-zinc-400 font-mono">
          <Activity className="w-3.5 h-3.5 text-[#d7ff4f]" />
          <span>Pipeline:</span>
        </div>
        <SynapseStatusBadge status={activeStatus} size="sm" />
        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-medium ${currentPlan.color}`}>
          {currentPlan.label}
        </span>
      </div>

      <div className="flex items-center gap-4 font-mono">
        {showJobId && (
          <div className="hidden sm:flex items-center gap-1.5 text-zinc-500 text-[11px]">
            <span>Job:</span>
            <span className="text-zinc-300 truncate max-w-[120px]">{jobBudget.jobId}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500 text-[11px]">Spent:</span>
          <span className="text-zinc-300 font-bold">${jobBudget.spentUsd.toFixed(4)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500 text-[11px]">Remaining:</span>
          <span className="text-[#d7ff4f] font-bold">${jobBudget.remainingUsd.toFixed(4)}</span>
        </div>

        <div className="hidden md:flex items-center gap-1 text-[11px] text-zinc-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Tempo L1</span>
        </div>
      </div>
    </div>
  );
};
