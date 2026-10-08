import React, { useState } from 'react';
import { SynapsePaymentStatus } from '../../shared/types';
import { SynapseStatusBadge } from './SynapseStatusBadge';
import { ExternalLink, Copy, Check } from 'lucide-react';
import { tempoTransactionUrl } from '../../config/network';

interface SynapseResultCardProps {
  status: SynapsePaymentStatus;
  amountUsd: number;
  txHash?: string | null;
  blockNumber?: number;
  latencyMs?: number;
  serviceName?: string;
  providerName?: string;
  className?: string;
}

export const SynapseResultCard: React.FC<SynapseResultCardProps> = ({
  status,
  amountUsd,
  txHash,
  blockNumber,
  latencyMs,
  serviceName,
  providerName,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const explorerUrl = txHash ? tempoTransactionUrl(txHash) : null;

  const handleCopy = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className={`p-4 rounded-xl border border-white/10 bg-[#0c0e14] ${className}`}>
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <SynapseStatusBadge status={status} />
          {serviceName && (
            <span className="text-xs text-zinc-300 font-medium">
              {serviceName}
            </span>
          )}
        </div>
        <div className="text-right">
          <span className="text-sm font-mono font-bold text-[#d7ff4f]">
            ${amountUsd.toFixed(4)} pathUSD
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        {blockNumber !== undefined && blockNumber > 0 && (
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase font-mono">Block</span>
            <span className="font-mono text-zinc-300">#{blockNumber}</span>
          </div>
        )}
        {latencyMs !== undefined && (
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase font-mono">Latency</span>
            <span className="font-mono text-zinc-300">{latencyMs}ms</span>
          </div>
        )}
        {providerName && (
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase font-mono">Provider</span>
            <span className="font-mono text-zinc-300 truncate block">{providerName}</span>
          </div>
        )}
      </div>

      {txHash && (
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Tx:</span>
            <span className="text-xs font-mono text-zinc-400 truncate">
              {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => handleCopy(txHash)}
              title="Copy Tx Hash"
              className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            {explorerUrl && (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noreferrer"
                title="View on Tempo Explorer"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono border border-[#d7ff4f]/30 bg-[#d7ff4f]/10 text-[#d7ff4f] hover:bg-[#d7ff4f]/20 transition-colors"
              >
                Explorer
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
