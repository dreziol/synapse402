import { TEMPO_DEFAULT_FEE_TOKEN_SYMBOL, TEMPO_EXPLORER_URL } from '../config/network';
import React, { useState } from 'react';
import { X, Wallet, ExternalLink, Copy, Check, ShieldCheck, RefreshCw, LogOut } from 'lucide-react';
import { soundEngine } from '../utils/audioEffects';
import { formatFeeTokenBalance } from '../utils/formatters';
import { InfoBadge } from './InfoBadge';

interface WalletConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string | null;
  isRealWalletConnected: boolean;
  onConnectRealWallet: () => void;
  onDisconnectToDemo: () => void;
  networkName: string;
  networkMode?: 'LIVE_TESTNET' | 'RESILIENT_SANDBOX';
  relayerAddress?: string | null;
  vaultAddress?: string | null;
  walletBalances?: { pathUsd: number; feeTokenBalance: number; feeTokenAddress: string; feeTokenSymbol: string; vaultTvl: number; isSessionKeyRegistered: boolean; sessionStatus: string } | null;
  executionPreference?: 'LIVE_TESTNET' | 'RESILIENT_SANDBOX';
  onChangeExecutionPreference?: (mode: 'LIVE_TESTNET' | 'RESILIENT_SANDBOX') => void;
  liveAvailable?: boolean;
}

export const WalletConnectionModal: React.FC<WalletConnectionModalProps> = ({
  isOpen,
  onClose,
  walletAddress,
  isRealWalletConnected,
  onConnectRealWallet,
  onDisconnectToDemo,
  networkName,
  networkMode = 'RESILIENT_SANDBOX',
  relayerAddress = null,
  vaultAddress = null,
  walletBalances = null,
  executionPreference = 'LIVE_TESTNET',
  onChangeExecutionPreference,
  liveAvailable = networkMode === 'LIVE_TESTNET',
}) => {
  const [copied, setCopied] = useState(false);
  const backendLive = networkMode === 'LIVE_TESTNET' && Boolean(relayerAddress);


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
                <span>{isRealWalletConnected ? 'Connected MetaMask Wallet' : backendLive ? 'Tempo Settlement Relayer' : 'Evaluation mode'}</span>
                {!backendLive && <InfoBadge
                  title="Evaluation mode"
                  text="The fallback mode lets judges inspect requests and policy checks without presenting a wallet or chain receipt as real. Connect MetaMask to submit an actual Tempo transaction."
                />}
              </h3>
              <p className="text-[11px] text-zinc-400 font-sans">
                {isRealWalletConnected ? 'Direct on-chain session on Tempo Moderato' : backendLive ? 'Relayer submits approved settlements; funds remain in SynapseVault' : 'No wallet connected; responses stay in evaluation mode'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[.06] transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Evaluation status card */}
        <div className={`p-3.5 rounded-xl border space-y-2.5 ${backendLive ? 'bg-emerald-400/[0.04] border-emerald-300/20' : 'bg-[#d7ff4f]/[0.04] border-[#d7ff4f]/20'}`}>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className={`w-3.5 h-3.5 ${backendLive ? 'text-emerald-300' : 'text-[#d7ff4f]'}`} />
              <span className={`${backendLive ? 'text-emerald-300' : 'text-[#d7ff4f]'} font-mono font-semibold text-[11px]`}>{backendLive ? 'LIVE TREASURY' : 'LOCAL EVALUATION'}</span>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${backendLive ? 'bg-emerald-400/15 text-emerald-300 border border-emerald-300/30' : 'bg-[#d7ff4f]/20 text-[#d7ff4f] border border-[#d7ff4f]/30'}`}>
              {backendLive ? 'REAL SETTLEMENTS' : 'EVALUATION ACCOUNT'}
            </span>
          </div>

          <p className="text-[11px] text-zinc-300 leading-snug">
            {backendLive ? 'The configured relayer submits approved payments through SynapseVault. Confirmed payments include a Tempo Explorer transaction link.' : 'The interface can walk through requests, policy checks, and provider responses locally. It shows a chain receipt only after a connected wallet confirms one.'}
          </p>
        </div>

        {/* Payment mode belongs in the wallet window so the main flow stays focused. */}
        {onChangeExecutionPreference && (
          <div className="p-3.5 rounded-xl bg-black/30 border border-white/[.08] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-mono">RUN MODE</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                {executionPreference === 'LIVE_TESTNET' && liveAvailable ? 'Production selected' : 'Evaluation selected'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onChangeExecutionPreference('LIVE_TESTNET')}
                disabled={!liveAvailable}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition ${executionPreference === 'LIVE_TESTNET' && liveAvailable ? 'bg-[#d7ff4f] text-[#08090c]' : 'border border-white/15 bg-white/[.04] text-zinc-300 hover:text-white'} disabled:cursor-not-allowed disabled:opacity-40`}
              >
                Production / Live
              </button>
              <button
                type="button"
                onClick={() => onChangeExecutionPreference('RESILIENT_SANDBOX')}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition ${executionPreference === 'RESILIENT_SANDBOX' ? 'bg-white/15 text-white' : 'border border-white/15 bg-white/[.04] text-zinc-300 hover:text-white'}`}
              >
                Evaluation / Preview
              </button>
            </div>
            <p className="text-[11px] leading-snug text-zinc-400">
              {executionPreference === 'LIVE_TESTNET' && liveAvailable
                ? 'Production keeps the shared balance in SynapseVault; the settlement relayer submits approved payments and shows the transaction link after confirmation.'
                : 'Evaluation previews the request and result locally. No blockchain transaction is sent.'}
            </p>
          </div>
        )}

        {/* Connected Wallet or Status Card */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/[.08] space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-mono">WALLET STATUS</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
              isRealWalletConnected
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
            }`}>
              {isRealWalletConnected ? 'METAMASK CONNECTED' : backendLive ? 'TREASURY RELAYER ACTIVE' : 'EVALUATION ACCOUNT'}
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
                href={`${TEMPO_EXPLORER_URL}/address/${walletAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white hover:underline font-medium"
              >
                <span>View Your Account on Tempo Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </>
          ) : backendLive && relayerAddress ? (
            <>
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/[.03] border border-white/[.06] font-mono text-xs text-zinc-200">
                <span className="truncate">{relayerAddress}</span>
                <button
                  onClick={() => handleCopy(relayerAddress)}
                  className="px-2.5 py-1 rounded bg-white/[.06] hover:bg-white/[.12] text-zinc-300 hover:text-white flex items-center gap-1 transition shrink-0 text-[11px]"
                >
                  {copied ? <Check className="w-3 h-3 text-[#d7ff4f]" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <a
                href={`${TEMPO_EXPLORER_URL}/address/${relayerAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white hover:underline font-medium"
              >
                <span>View Settlement Relayer on Tempo Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              {vaultAddress && (
                <div className="pt-1.5 border-t border-white/[.06] space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">Shared balance contract</div>
                  <a
                    href={`${TEMPO_EXPLORER_URL}/address/${vaultAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] text-[#d7ff4f] hover:underline font-mono"
                  >
                    <span className="truncate">SynapseVault · {vaultAddress.slice(0, 6)}...{vaultAddress.slice(-4)}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              )}
            </>
          ) : (
            <p className="text-[11px] text-zinc-400">
              Jury does not need MetaMask: production uses SynapseVault as the shared balance, while the relayer submits approved settlements. MetaMask is optional for personal signing.
            </p>
          )}
        </div>

        {/* Network & Protocol Info */}
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between py-1.5 border-b border-white/[.06]">
            <span className="text-zinc-400 font-sans">Network:</span>
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
                <span className="text-zinc-400 font-sans">Selectable fee token:</span>
                <span className="text-zinc-200 font-semibold font-mono">
                  {formatFeeTokenBalance(walletBalances?.feeTokenBalance)} {walletBalances?.feeTokenSymbol || TEMPO_DEFAULT_FEE_TOKEN_SYMBOL}
                </span>
              </div>
              <p className="text-[10px] leading-snug text-zinc-500">
                Tempo has no native gas coin. Network fees use a selectable USD-denominated TIP-20 token; this account shows its pathUSD balance.
              </p>
              <div className="flex justify-between py-1.5 border-b border-white/[.06]">
                <span className="text-zinc-400 font-sans">SynapseVault State:</span>
                <span className="text-emerald-400 font-semibold">
                  {walletBalances?.isSessionKeyRegistered ? 'ACTIVE (Registered on L1)' : 'Auto-Register on 1st Sign'}
                </span>
              </div>
            </>
          )}
          <div className="flex justify-between py-1.5 border-b border-white/[.06]">
            <span className="text-zinc-400 font-sans">Payment status:</span>
            <span className="text-[#d7ff4f] font-semibold">Shown after confirmation</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-white/[.06]">
            <span className="text-zinc-400 font-sans">Spending limit:</span>
            <span className="text-[#d7ff4f] font-semibold text-right">One maximum per job · recurring safety rules are optional</span>
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
          ) : backendLive && executionPreference === 'LIVE_TESTNET' ? (
            <div className="flex-1 rounded-xl border border-[#d7ff4f]/20 bg-[#d7ff4f]/[.06] px-3 py-2.5 text-center text-[11px] leading-snug text-zinc-300">
              Jury demo uses the shared SynapseVault and settlement relayer. No wallet connection or token approval is needed.
            </div>
          ) : (
            <button
              onClick={() => {
                onClose();
                onConnectRealWallet();
              }}
              className="flex-1 py-2.5 rounded-xl bg-[#d7ff4f] hover:bg-[#e2ff73] text-[#11130d] text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{backendLive ? 'Connect My MetaMask (optional)' : 'Connect My MetaMask'}</span>
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
