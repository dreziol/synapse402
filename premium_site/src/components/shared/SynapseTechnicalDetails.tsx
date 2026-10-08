import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check, Terminal } from 'lucide-react';

interface SynapseTechnicalDetailsProps {
  signature?: string;
  nonce2D?: string;
  merkleRoot?: string;
  merkleProof?: string[];
  memoPayload?: string;
  tip20Memo?: string;
  iso20022Standard?: string;
  className?: string;
  defaultExpanded?: boolean;
}

export const SynapseTechnicalDetails: React.FC<SynapseTechnicalDetailsProps> = ({
  signature,
  nonce2D,
  merkleRoot,
  merkleProof,
  memoPayload,
  tip20Memo,
  iso20022Standard = 'ISO-20022 pacs.008.001.08',
  className = '',
  defaultExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (key: string, text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(key);
      setTimeout(() => setCopiedField(null), 1800);
    }
  };

  return (
    <div className={`rounded-xl border border-white/10 bg-[#0c0e14] overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#d7ff4f]" />
          <span className="text-xs font-mono font-medium text-zinc-200 uppercase tracking-wider">
            Cryptographic Proofs & 2D Nonce
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-zinc-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zinc-400" />
        )}
      </button>

      {expanded && (
        <div className="p-4 pt-1 border-t border-white/5 space-y-3 font-mono text-xs">
          {nonce2D && (
            <div className="flex items-center justify-between gap-2 p-2 rounded bg-black/40 border border-white/5">
              <span className="text-zinc-500 text-[11px] shrink-0">2D Nonce (Lane:Seq)</span>
              <span className="text-[#d7ff4f] text-[11px] font-bold truncate">{nonce2D}</span>
            </div>
          )}

          {signature && (
            <div className="p-2 rounded bg-black/40 border border-white/5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-[11px]">EIP-712 Signature</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('sig', signature)}
                  className="text-zinc-400 hover:text-white flex items-center gap-1 text-[10px]"
                >
                  {copiedField === 'sig' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  Copy
                </button>
              </div>
              <p className="text-zinc-400 text-[10px] break-all leading-relaxed">
                {signature}
              </p>
            </div>
          )}

          {merkleRoot && (
            <div className="flex items-center justify-between gap-2 p-2 rounded bg-black/40 border border-white/5">
              <span className="text-zinc-500 text-[11px] shrink-0">Merkle Root</span>
              <span className="text-zinc-300 text-[11px] truncate">{merkleRoot}</span>
            </div>
          )}

          {merkleProof && merkleProof.length > 0 && (
            <div className="p-2 rounded bg-black/40 border border-white/5 space-y-1">
              <span className="text-zinc-500 text-[11px] block">Merkle Proof ({merkleProof.length} hops)</span>
              <div className="space-y-0.5 max-h-24 overflow-y-auto">
                {merkleProof.map((h, i) => (
                  <div key={i} className="text-zinc-400 text-[10px] truncate">
                    {i}: {h}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 p-2 rounded bg-black/40 border border-white/5">
            <span className="text-zinc-500 text-[11px] shrink-0">Audit Standard</span>
            <span className="text-sky-400 text-[10px]">{iso20022Standard}</span>
          </div>

          {(tip20Memo || memoPayload) && (
            <div className="flex items-center justify-between gap-2 p-2 rounded bg-black/40 border border-white/5">
              <span className="text-zinc-500 text-[11px] shrink-0">Transfer Memo</span>
              <span className="text-zinc-300 text-[10px] truncate">{tip20Memo || memoPayload}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
