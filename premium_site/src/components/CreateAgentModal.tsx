import React, { useState } from 'react';
import { Bot, X } from 'lucide-react';
import { ethers } from 'ethers';
import { AgentAccount } from '../types/synapse402';
import { soundEngine } from '../utils/audioEffects';
import { InfoBadge } from './InfoBadge';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (agent: AgentAccount) => void;
}

export const CreateAgentModal: React.FC<CreateAgentModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [dailyLimit, setDailyLimit] = useState('1.50');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLimit = parseFloat(dailyLimit);
    if (!name || isNaN(parsedLimit) || parsedLimit <= 0) return;

    const colors = [
      'bg-[#d7ff4f]',
      'bg-white/90',
      'bg-zinc-300',
      'bg-zinc-400',
      'bg-[#d8ff63]',
      'bg-white/80',
    ];
    // Cryptographically generate a real Secp256k1 keypair using ethers
    const newWallet = ethers.Wallet.createRandom();
    const sessionKey = newWallet.address;
    const avatarColor = colors[Math.abs(parseInt(sessionKey.slice(2, 6), 16)) % colors.length];

    const newAgent: AgentAccount = {
      id: `agent_${Date.now()}`,
      name,
      role: role || 'Autonomous Micro-Agent',
      dailyLimitUsd: parseFloat(dailyLimit),
      spentTodayUsd: 0,
      status: 'ACTIVE',
      sessionKey,
      avatarColor,
    };

    onCreate(newAgent);
    setName('');
    setRole('');
    setDailyLimit('1.50');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white/[.03] backdrop-blur-md border border-white/[.08] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/[.08] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#d7ff4f]/[.08] border border-[#d7ff4f]/30 flex items-center justify-center text-[#d7ff4f]">
              <Bot className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-[#f5f5f2] flex items-center">
              <span>Create Agent Spending Account</span>
              <InfoBadge
                title="EIP-712 Session Key Delegation"
                text="Generates an isolated Secp256k1 keypair bound to SynapseVault with a hard daily spending limit and validBefore expiration."
              />
            </h3>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-[#f5f5f2]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="text-zinc-400 font-sans block mb-1 text-[11px] uppercase font-medium">Agent Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Crypto Research Bot"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/40 border border-white/[.08] rounded-lg p-2.5 text-[#f5f5f2] outline-none focus:border-[#d7ff4f] font-sans text-xs"
            />
          </div>

          <div>
            <label className="text-zinc-400 font-sans block mb-1 text-[11px] uppercase font-medium">Agent Role / Description</label>
            <input
              type="text"
              placeholder="e.g. High-frequency market sentiment analyzer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-black/40 border border-white/[.08] rounded-lg p-2.5 text-[#f5f5f2] outline-none focus:border-[#d7ff4f] font-sans text-xs"
            />
          </div>

          <div>
            <label className="text-zinc-400 font-sans block mb-1 text-[11px] uppercase font-medium">Daily Spending Limit (USD)</label>
            <input
              type="number"
              step="0.1"
              required
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
              className="w-full bg-black/40 border border-white/[.08] rounded-lg p-2.5 text-[#f5f5f2] outline-none focus:border-[#d7ff4f] text-xs"
            />
          </div>

          <div className="bg-black/40 p-3 rounded-lg border border-white/[.08] text-xs text-zinc-300 leading-relaxed font-sans">
            <strong className="text-zinc-100">Smart Contract Protection:</strong> The generated session key is constrained by <code className="text-[#d7ff4f]">SynapseVault.sol</code> on Tempo. The bot cannot spend more than this daily limit.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/[.04] text-zinc-400 font-sans hover:text-[#f5f5f2] rounded-lg border border-white/[.08]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#d7ff4f] text-[#0c0f12] font-bold rounded-lg hover:bg-[#bce63b]"
            >
              Create Agent Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
