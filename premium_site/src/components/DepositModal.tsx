import { TEMPO_EXPLORER_URL, tempoTransactionUrl } from '../config/network';
import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Wallet, X, ArrowRight, CheckCircle2, Loader2, ExternalLink, Zap } from 'lucide-react';
import { soundEngine } from '../utils/audioEffects';
import { InfoBadge } from './InfoBadge';
import { TEMPO_PATHUSD_ADDRESS, TEMPO_VAULT_ADDRESS } from '../config/network';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (amount: number) => Promise<{ depositTxHash?: string } | void> | void;
  isRealWalletConnected?: boolean;
  walletAddress?: string | null;
  networkMode?: 'LIVE_TESTNET' | 'RESILIENT_SANDBOX';
}

const PATH_USD_ADDRESS = TEMPO_PATHUSD_ADDRESS;
const VAULT_ADDRESS = TEMPO_VAULT_ADDRESS;

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
];

const VAULT_ABI = [
  'function deposit(uint256 amount) external',
  'function totalVaultBalance() external view returns (uint256)',
];

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  onDeposit,
  isRealWalletConnected = false,
  walletAddress = null,
  networkMode = 'RESILIENT_SANDBOX',
}) => {
  const [amount, setAmount] = useState('10.00');
  const isLiveNetwork = networkMode === 'LIVE_TESTNET';
  const [depositMode, setDepositMode] = useState<'instant' | 'metamask'>('instant');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [copiedDepositHash, setCopiedDepositHash] = useState(false);

  if (!isOpen) return null;

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) return;

    soundEngine.playClick();
    setIsProcessing(true);
    setStatusMsg('');
    setTxHash(null);

    try {
      if (depositMode === 'metamask' && (!isRealWalletConnected || !walletAddress)) {
        throw new Error('Connect MetaMask before making a live deposit.');
      }
      let liveChainDeposit = false;
      if (depositMode === 'metamask' && isRealWalletConnected && walletAddress && typeof window !== 'undefined' && (window as any).ethereum) {
        setStatusMsg('Connecting to Tempo L1 via MetaMask...');
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();

        const tokenContract = new ethers.Contract(PATH_USD_ADDRESS, ERC20_ABI, signer);
        const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);

        const amountUnits = ethers.parseUnits(val.toString(), 6);

        // Check allowance
        setStatusMsg('Checking USD allowance...');
        const currentAllowance: bigint = await tokenContract.allowance(walletAddress, VAULT_ADDRESS);

        if (currentAllowance < amountUnits) {
          setStatusMsg('Please confirm USD approval in MetaMask...');
          const txApprove = await tokenContract.approve(VAULT_ADDRESS, amountUnits);
          setStatusMsg('Waiting for approval confirmation on Tempo L1...');
          await txApprove.wait();
        }

        // Execute real on-chain deposit into SynapseVault
        setStatusMsg('Confirming deposit into SynapseVault in MetaMask...');
        const txDeposit = await vaultContract.deposit(amountUnits);
        setTxHash(txDeposit.hash);
        setStatusMsg('Confirming block on Tempo Moderato (42431)...');
        await txDeposit.wait();
        liveChainDeposit = true;
      } else {
        setStatusMsg(isLiveNetwork ? 'Submitting project-wallet deposit to Tempo testnet...' : 'Adding evaluation credit...');
      }

      // Synchronize backend telemetry state
      if (!liveChainDeposit) {
        const result = await onDeposit(val);
        if (isLiveNetwork) {
          const confirmedHash = result && typeof result === 'object' ? result.depositTxHash : undefined;
          if (!confirmedHash || !/^0x[a-fA-F0-9]{64}$/.test(confirmedHash)) {
            throw new Error('Live deposit did not return a confirmed transaction.');
          }
          setTxHash(confirmedHash);
          liveChainDeposit = true;
        }
      } else {
        await onDeposit(0);
      }
      if (liveChainDeposit) {
        soundEngine.playSettlementChime();
        setStatusMsg('Deposit confirmed on Tempo L1 and credited to SynapseVault.');
      } else {
        soundEngine.playClick();
        setStatusMsg('Evaluation credit added locally; no blockchain deposit was submitted.');
      }
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Deposit error:', err);
      if (err?.code === 'ACTION_REJECTED' || err?.message?.includes('user rejected')) {
        setStatusMsg('Transaction was cancelled in MetaMask.');
      } else {
        setStatusMsg(`Deposit failed; no funds were credited: ${err?.message?.slice(0, 60) || 'unknown error'}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans">
      <div className="bg-[#0e1117] border border-white/[.12] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/[.08] pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono text-xs ${
              isRealWalletConnected
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-[#d7ff4f]/[.08] text-[#d7ff4f] border border-[#d7ff4f]/30'
            }`}>
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#f5f5f2] flex items-center">
                <span>{isLiveNetwork ? 'Add testnet funds to SynapseVault' : 'Add evaluation credit'}</span>
                <InfoBadge
                  title="SynapseVault On-Chain Collateral"
                  text={isLiveNetwork ? 'The existing project wallet deposits testnet pathUSD into SynapseVault. A personal wallet is optional.' : 'Evaluation mode updates a local balance only.'}
                />
              </h3>
              <p className="text-[11px] text-zinc-400 font-sans">
                {isLiveNetwork ? 'Use the existing project wallet; no personal MetaMask approval needed' : 'Add local sandbox credit without a wallet transaction'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-[#f5f5f2]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleDepositSubmit} className="space-y-4 font-mono text-xs">
          {/* Method Info */}
          <div className="space-y-1.5">
            <span className="text-zinc-400 font-sans text-[11px] uppercase flex items-center">
              <span>Deposit Pipeline:</span>
              <InfoBadge
                title="Deposit Routing Modes"
                text={isLiveNetwork ? 'Project wallet signs the testnet deposit on the server. MetaMask is optional for a deposit from your personal wallet.' : 'Evaluation mode updates a local balance only.'}
              />
            </span>
            <div className={`grid gap-2 ${isRealWalletConnected ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <button
                type="button"
                onClick={() => setDepositMode('instant')}
                title={isLiveNetwork ? 'Deposit from the existing project wallet' : 'Add local evaluation credit'}
                className={`py-2 px-3 rounded-lg border text-xs font-mono font-semibold transition flex items-center justify-center gap-1.5 ${
                  depositMode === 'instant'
                    ? 'bg-[#d7ff4f]/15 border-[#d7ff4f]/50 text-[#d7ff4f]'
                    : 'bg-black/40 border-white/[.08] text-zinc-400 hover:text-white disabled:opacity-40 disabled:hover:text-zinc-400'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-[#d7ff4f]" />
                <span>{isLiveNetwork ? 'Project wallet' : '1-Click Instant'}</span>
              </button>
              {isRealWalletConnected && (
                <button
                  type="button"
                  onClick={() => setDepositMode('metamask')}
                  title="Sign on-chain deposit with connected wallet"
                  className={`py-2 px-3 rounded-lg border text-xs font-mono font-semibold transition flex items-center justify-center gap-1.5 ${
                    depositMode === 'metamask'
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                      : 'bg-black/40 border-white/[.08] text-zinc-400 hover:text-white'
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>MetaMask Tx</span>
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="text-zinc-400 font-sans block mb-1 text-[11px] uppercase">Deposit Amount (USD)</label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0.01"
                max="250"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-black/40 border border-white/[.08] rounded-lg p-2.5 text-[#f5f5f2] outline-none focus:border-[#d7ff4f] font-mono text-sm"
              />
              <span className="absolute right-3 top-3 text-xs text-zinc-400 font-bold">USD</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono block mt-1">
              Evaluation account limit: $250.00 USD per request
            </span>
          </div>

          <div className="flex gap-2">
            {[5, 10, 25, 50].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset.toFixed(2))}
                className="flex-1 py-1.5 rounded-lg bg-black/40 hover:bg-white/[.06] border border-white/[.08] text-zinc-400 hover:text-[#f5f5f2] font-mono text-[11px]"
              >
                +${preset}
              </button>
            ))}
          </div>

          {statusMsg && (
            <div className={`p-3 rounded-lg border text-xs font-mono flex items-start gap-2 ${
              statusMsg.includes('success') 
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : statusMsg.includes('cancelled') || statusMsg.includes('rejected')
                ? 'bg-[#d7ff4f]/10 border-[#d7ff4f]/30 text-[#d7ff4f]'
                : 'bg-[#d7ff4f]/10 border-[#d7ff4f]/30 text-[#d7ff4f]'
            }`}>
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <div>{statusMsg}</div>
                {txHash && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Tx: {txHash.slice(0, 10)}...{txHash.slice(-6)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(txHash);
                        setCopiedDepositHash(true);
                        setTimeout(() => setCopiedDepositHash(false), 2000);
                      }}
                      className="px-1.5 py-0.5 rounded bg-white/[0.08] hover:bg-white/15 text-zinc-200 text-[10px] font-mono cursor-pointer"
                    >
                      {copiedDepositHash ? <span className="text-emerald-400 font-bold">Copied!</span> : 'Copy'}
                    </button>
                    <a
                      href={txHash.startsWith('0x') ? tempoTransactionUrl(txHash) : TEMPO_EXPLORER_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-[#d7ff4f] hover:underline font-mono flex items-center gap-0.5"
                    >
                      <span>Explorer</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-black/40 p-3 rounded-lg border border-white/[.08] text-xs text-zinc-300 font-sans leading-relaxed">
            {depositMode === 'metamask'
              ? 'Your MetaMask wallet deposits pathUSD into SynapseVault on Tempo Moderato (42431).'
              : isLiveNetwork
              ? 'The existing project wallet deposits testnet pathUSD into SynapseVault. Success appears only after the transaction is confirmed.'
              : 'Evaluation credit updates the local sandbox balance without a wallet transaction.'}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/[.04] text-zinc-400 hover:text-[#f5f5f2] rounded-lg border border-white/[.08] font-sans"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || (depositMode === 'metamask' && !isRealWalletConnected)}
              className="px-5 py-2 bg-[#d7ff4f] hover:bg-[#bce63b] text-[#0c0f12] font-bold rounded-lg shadow-sm flex items-center gap-2 font-sans text-xs disabled:opacity-50"
            >
              {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>
                {isProcessing
                  ? 'Processing Deposit...'
                  : depositMode === 'metamask'
                  ? 'Sign & Deposit via MetaMask'
                  : isLiveNetwork
                  ? 'Add testnet funds'
                  : 'Deposit Instantly (1-Click)'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
