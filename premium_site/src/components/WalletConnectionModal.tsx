import React, { useState } from 'react';
import { X, Wallet, ExternalLink, Copy, Check, ShieldCheck, RefreshCw, LogOut } from 'lucide-react';
import { soundEngine } from '../utils/audioEffects';
import { formatTempoGas } from '../utils/formatters';
import { InfoBadge } from './InfoBadge';

interface WalletConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string | null;
  isRealWalletConnected: boolean;
  onConnectRealWallet: () => void;
  onDisconnectToDemo: () => void;
  networkName: string;
  walletBalances?: { pathUsd: number; tempo: number; vaultTvl: number; isSessionKeyRegistered: boolean; sessionStatus: string } | null;
}

export const WalletConnectionModal: React.FC<WalletConnectionModalProps> = ({
  isOpen,
  onClose,
  walletAddress,
  isRealWalletConnected,
  onConnectRealWallet,
  onDisconnectToDemo,
  networkName,
  walletBalances = null,
}) => {
  const [copied, setCopied] = useState(false);


  if (!isOpen) return null;

  const handleCopy = (addr: string) => {
    soundEngine.playClick();
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(addr).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans animate-in fade-in duration-150">
      <div className="bg-[#0e1117] border border-white/[.12] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-zinc-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[.08] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
              isRealWalletConnected
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-[#d7ff4f]/20 text-[#d7ff4f] border border-[#d7ff4f]/40'
            }`}>
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center">
                <span>{isRealWalletConnected ? 'Connected MetaMask Wallet' : 'Evaluation mode'}</span>
                <InfoBadge
                  title="Evaluation mode"
                  text="The fallback mode lets judges inspect requests and policy checks without presenting a wallet or chain receipt as real. Connect MetaMask to submit an actual Tempo transaction."
                />
              </h3>
              <p className="text-[11px] text-zinc-400 font-sans">
                {isRealWalletConnected ? 'Direct on-chain session on Tempo Moderato' : 'No wallet connected; responses stay in evaluation mode'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[.06] transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Evaluation status card */}
        <div className="p-3.5 rounded-xl bg-[#d7ff4f]/[0.04] border border-[#d7ff4f]/20 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#d7ff4f]" />
              <span className="text-[#d7ff4f] font-mono font-semibold text-[11px]">LOCAL EVALUATION</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#d7ff4f]/20 text-[#d7ff4f] border border-[#d7ff4f]/30 font-bold">
              EVALUATION ACCOUNT
            </span>
          </div>

          <p className="text-[11px] text-zinc-300 leading-snug">
            The interface can walk through requests, policy checks, and provider responses locally. It shows a chain receipt only after a connected wallet confirms one.
          </p>
        </div>

        {/* Connected Wallet or Status Card */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/[.08] space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-mono">YOUR SESSION STATUS</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
              isRealWalletConnected
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
            }`}>
              {isRealWalletConnected ? 'METAMASK CONNECTED' : 'EVALUATION ACCOUNT'}
            </span>
          </div>

          {isRealWalletConnected && walletAddress ? (
            <>
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/[.03] border border-white/[.06] font-mono text-xs text-zinc-200">
                <span className="truncate">{walletAddress}</span>
                <button
                  onClick={() => handleCopy(walletAddress)}
                  className="px-2.5 py-1 rounded bg-white/[.06] hover:bg-white/[.12] text-zinc-300 hover:text-white flex items-center gap-1 transition shrink-0 text-[11px]"
                >
                  {copied ? <Check className="w-3 h-3 text-[#d7ff4f]" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <a
                href={`https://explore.tempo.xyz/address/${walletAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white hover:underline font-medium"
              >
                <span>View Your Account on Tempo Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </>
          ) : (
            <p className="text-[11px] text-zinc-400">
              Optionally connect your personal MetaMask to sign and settle live EIP-712 micropayments directly from your address.
            </p>
          )}
        </div>

        {/* Network & Protocol Info */}
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between py-1.5 border-b border-white/[.06]">
            <span className="text-zinc-400 font-sans">Active Network:</span>
            <span className="text-zinc-200 font-semibold">{networkName}</span>
          </div>
          {isRealWalletConnected && (
            <>
              <div className="flex justify-between py-1.5 border-b border-white/[.06]">
                <span className="text-zinc-400 font-sans">USD Balance (On-Chain):</span>
                <span className="text-[#d7ff4f] font-semibold font-mono">
                  ${(walletBalances?.pathUsd ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/[.06]">
                <span className="text-zinc-400 font-sans">TEMPO Gas Balance:</span>
                <span className="text-zinc-200 font-semibold font-mono">
                  {formatTempoGas(walletBalances?.tempo)} TEMPO
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/[.06]">
                <span className="text-zinc-400 font-sans">SynapseVault State:</span>
                <span className="text-emerald-400 font-semibold">
                  {walletBalances?.isSessionKeyRegistered ? 'ACTIVE (Registered on L1)' : 'Auto-Register on 1st Sign'}
                </span>
              </div>
            </>
          )}
          <div className="flex justify-between py-1.5 border-b border-white/[.06]">
            <span className="text-zinc-400 font-sans">Settlement Speed:</span>
            <span className="text-[#d7ff4f] font-semibold">Shown after confirmation</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-white/[.06]">
            <span className="text-zinc-400 font-sans">Budget Protection:</span>
            <span className="text-[#d7ff4f] font-semibold">Controlled Accounts with Daily Limits</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {isRealWalletConnected ? (
            <button
              onClick={onDisconnectToDemo}
              className="flex-1 py-2.5 rounded-xl bg-white/[.06] hover:bg-white/[.12] border border-white/15 text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Switch to evaluation account</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                onConnectRealWallet();
              }}
              className="flex-1 py-2.5 rounded-xl bg-[#d7ff4f] hover:bg-[#e2ff73] text-[#11130d] text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Connect My MetaMask</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white/[.04] hover:bg-white/[.08] text-zinc-400 hover:text-white border border-white/[.08] text-xs font-medium transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
