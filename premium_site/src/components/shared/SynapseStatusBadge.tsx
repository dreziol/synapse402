import React from 'react';
import { SynapsePaymentStatus } from '../../shared/types';
import { Check, AlertCircle, Clock, ShieldAlert, Ban } from 'lucide-react';

interface SynapseStatusBadgeProps {
  status: SynapsePaymentStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const SynapseStatusBadge: React.FC<SynapseStatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const configs: Record<SynapsePaymentStatus, {
    bg: string;
    border: string;
    text: string;
    dot: string;
    label: string;
    icon?: React.ReactNode;
  }> = {
    CONFIRMED: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      dot: 'bg-emerald-400',
      label: 'CONFIRMED',
      icon: <Check className="w-3 h-3 text-emerald-400" />,
    },
    LIVE: {
      bg: 'bg-[#d7ff4f]/10',
      border: 'border-[#d7ff4f]/30',
      text: 'text-[#d7ff4f]',
      dot: 'bg-[#d7ff4f] animate-pulse',
      label: 'LIVE ON-CHAIN',
    },
    PENDING: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      dot: 'bg-amber-400 animate-ping',
      label: 'PENDING',
      icon: <Clock className="w-3 h-3 text-amber-400 animate-spin" />,
    },
    DEMO: {
      bg: 'bg-zinc-500/10',
      border: 'border-white/10',
      text: 'text-zinc-300',
      dot: 'bg-zinc-400',
      label: 'DEMO / EVAL',
    },
    FAILED: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      text: 'text-rose-400',
      dot: 'bg-rose-400',
      label: 'FAILED',
      icon: <AlertCircle className="w-3 h-3 text-rose-400" />,
    },
    REJECTED: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      dot: 'bg-red-400',
      label: 'REJECTED',
      icon: <ShieldAlert className="w-3 h-3 text-red-400" />,
    },
    VOIDED: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-300',
      dot: 'bg-amber-300',
      label: 'VOIDED · NOT CHARGED',
      icon: <Ban className="w-3 h-3 text-amber-300" />,
    },
  };

  const current = configs[status] || configs.DEMO;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono font-medium uppercase tracking-wider backdrop-blur-md ${current.bg} ${current.border} ${current.text} ${sizeClasses} ${className}`}
    >
      {current.icon || <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />}
      {current.label}
    </span>
  );
};
