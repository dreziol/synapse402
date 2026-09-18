import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Zap, Volume2, VolumeX, Layers, CheckCircle2, Copy, Check, X, ExternalLink } from 'lucide-react';
import { soundEngine } from '../utils/audioEffects';

interface NetworkTelemetryRibbonProps {
  currentBlock: number;
}

export const NetworkTelemetryRibbon: React.FC<NetworkTelemetryRibbonProps> = ({ currentBlock }) => {
  const [isAudioMuted, setIsAudioMuted] = useState(soundEngine.getMuted());
  const [tickingBlock, setTickingBlock] = useState(currentBlock);
  const [pulseBlock, setPulseBlock] = useState(false);
  const [dynamicLatencyMs, setDynamicLatencyMs] = useState<number>(11);
  const [networkFeeUsd, setNetworkFeeUsd] = useState<string>('0.000018');
  const [networkMode, setNetworkMode] = useState<'LIVE_TESTNET' | 'RESILIENT_SANDBOX'>('RESILIENT_SANDBOX');
  const [isOnline, setIsOnline] = useState(false);
  const [bytecodePresent, setBytecodePresent] = useState(false);
  const [showContractsModal, setShowContractsModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const measureTelemetry = async () => {
      try {
        const res = await fetch('/api/network/status');
        const json = await res.json().catch(() => null);
        if (isMounted && json) {
          setIsOnline(json.status === 'ok');
          setNetworkMode(json.networkMode === 'LIVE_TESTNET' ? 'LIVE_TESTNET' : 'RESILIENT_SANDBOX');
          setBytecodePresent(Boolean(json.vaultBytecodePresent));
          if (typeof json.rpcLatencyMs === 'number') {
            setDynamicLatencyMs(json.rpcLatencyMs);
          }
          if (json.networkFeeUsd) {
            setNetworkFeeUsd(String(json.networkFeeUsd));
          }
        }
      } catch (err: any) {
        console.debug('[NetworkTelemetryRibbon] Telemetry probe notice:', err?.message || err);
      }
    };
    measureTelemetry();
    const timer = setInterval(measureTelemetry, 8000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (currentBlock && currentBlock !== tickingBlock) {
      setTickingBlock(currentBlock);
      setPulseBlock(true);
      const timer = setTimeout(() => setPulseBlock(false), 800);
      return () => clearTimeout(timer);
    }
  }, [currentBlock]);

  const handleToggleSound = () => {
    const newMute = soundEngine.toggleMute();
    setIsAudioMuted(newMute);
    if (!newMute) {
      soundEngine.playSettlementChime();
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    soundEngine.playClick();
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const contracts = [
    { label: 'SynapseVault (Escrow & Policy)', address: '0x3c42E274FAdd8e371fB84f97203CC2F2125c8775', key: 'vault' },
    { label: 'SynapseMPPReceiver (Gateway)', address: '0xfCEb1a2633881c19283836a2E17Ba25E612724A0', key: 'receiver' },
    { label: 'pathUSD (Payment Token)', address: '0x9aa3ef4B60B6e3c440711658ee05780e236ac714', key: 'token' },
  ];

  return (
    <div id="network-telemetry-ribbon" className="border-b border-white/[.08] bg-[#090c0f] px-4 sm:px-6 py-2 relative">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
        
        {/* Left: Simple Live Network Status */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-zinc-400 font-mono">
          
          {/* L1 Block Height */}
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${networkMode === 'LIVE_TESTNET' ? 'bg-[#d7ff4f]' : isOnline ? 'bg-amber-300' : 'bg-red-400'} ${pulseBlock ? 'scale-150 transition-transform' : 'animate-pulse'}`}></span>
            <span>{networkMode === 'LIVE_TESTNET' ? 'Tempo L1 block:' : 'Evaluation block:'}</span>
            <span className="text-[#f5f5f2] font-bold tracking-tight">#{tickingBlock.toLocaleString()}</span>
          </div>

          {/* Speed */}
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#d7ff4f]" />
            <span>Speed:</span>
            <span className="text-[#d7ff4f] font-semibold">{dynamicLatencyMs}ms probe</span>
          </div>

          {/* Protection */}
          <div className="hidden sm:flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#d7ff4f]" />
            <span className="text-[#f5f5f2]">Scoped keys &amp; spending limits</span>
          </div>
        </div>

        {/* Right: Audio Haptic Toggle & Chain ID + Contracts Trigger */}
        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={handleToggleSound}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/[.03] backdrop-blur-md hover:bg-white/[.06] border border-white/15 text-white/50 hover:text-[#f5f5f2] transition-colors"
            title={isAudioMuted ? 'Enable tactile settlement audio' : 'Mute settlement audio'}
          >
            {isAudioMuted ? (
              <>
                <VolumeX className="w-3 h-3 text-[#ff5c5c]" />
                <span className="text-[10px]">Sound Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3 h-3 text-[#d7ff4f]" />
                <span className="text-[10px] text-[#d7ff4f]">Audio FX Active</span>
              </>
            )}
          </button>

          {/* Interactive Testnet Chip */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setShowContractsModal(!showContractsModal);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#d7ff4f]/[.08] text-[#d7ff4f] hover:bg-[#d7ff4f]/20 border border-[#d7ff4f]/30 text-[10px] transition-all cursor-pointer shadow-sm hover:scale-105"
            title={networkMode === 'LIVE_TESTNET' && bytecodePresent ? 'View verified smart contract addresses on Tempo L1' : 'View configured contract addresses; live bytecode verification is unavailable'}
          >
            <CheckCircle2 className="w-3 h-3 text-[#d7ff4f]" />
            <span className="font-bold">Tempo testnet (42431)</span>
            <span className="underline opacity-80 text-[9px]">Contracts ↗</span>
          </button>
        </div>

      </div>

      {/* Verified Contracts Dropdown/Modal */}
      {showContractsModal && (
        <div className="absolute right-4 sm:right-6 top-11 z-50 w-80 sm:w-96 p-4 rounded-xl bg-[#0e1318] border border-[#d7ff4f]/30 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-150 font-mono">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#d7ff4f]"></span>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">{networkMode === 'LIVE_TESTNET' && bytecodePresent ? 'Verified on-chain contracts' : 'Configured contract addresses'}</h4>
            </div>
            <button 
              onClick={() => setShowContractsModal(false)}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 text-[11px]">
            {contracts.map((c) => (
              <div key={c.key} className="p-2.5 rounded-lg bg-white/[.03] border border-white/[.07] space-y-1">
                <div className="text-[10px] text-zinc-400 font-semibold">{c.label}</div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#d7ff4f] text-[10px] truncate">{c.address}</span>
                  <button
                    onClick={() => copyToClipboard(c.address, c.key)}
                    className="px-2 py-0.5 rounded bg-white/[.06] hover:bg-[#d7ff4f]/20 text-zinc-300 hover:text-[#d7ff4f] border border-white/10 text-[10px] flex items-center gap-1 transition-colors shrink-0"
                  >
                    {copiedKey === c.key ? (
                      <>
                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-2.5 h-2.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-zinc-400 pt-1 flex items-center justify-between border-t border-white/10">
            <span>Chain ID: <strong>42431</strong></span>
            <span>Network: <strong>Tempo Moderato</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};
