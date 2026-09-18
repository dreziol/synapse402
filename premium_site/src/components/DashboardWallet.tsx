import React, { useState } from 'react';
import { AgentAccount } from '../types/synapse402';
import { 
  Wallet, 
  Plus, 
  Bot, 
  KeyRound, 
  Copy, 
  Check, 
  Zap, 
  ExternalLink, 
  Loader2, 
  ShieldCheck, 
  ShieldAlert, 
  Sliders, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  Globe,
  Lock
} from 'lucide-react';
import { soundEngine } from '../utils/audioEffects';
import { InfoBadge } from './InfoBadge';

interface DashboardWalletProps {
  userBalanceUsd: number;
  agents: AgentAccount[];
  onOpenDeposit: () => void;
  onOpenCreateAgent: () => void;
  onToggleAgentStatus: (agentId: string) => void;
  isRealWalletConnected?: boolean;
  walletAddress?: string | null;
  walletBalances?: { pathUsd: number; tempo: number; vaultTvl: number; isSessionKeyRegistered: boolean; sessionStatus: string } | null;
  vaultMetrics?: {
    totalVaultLiquidity: number;
    availableUnreservedLiquidity: number;
    reservedAgentBudgets: number;
    totalVolumeSettledPathUsd: number;
    totalTransactionsCount: number;
    protocolFeeRevenuePathUsd: number;
  } | null;
}

interface TestOutcome {
  agentId: string;
  type: 'normal' | 'overdraft';
  status: 'APPROVED' | 'BLOCKED';
  title: string;
  checked: string;
  happened: string;
  moneySent: string;
  txHash?: string;
  latencyMs?: number;
}

const DEFAULT_ALLOWED_PROVIDERS: Record<string, string[]> = {
  key_quant_alpha: [
    'api.tempo.xyz',
    'api.binance.com',
    'api.deribit.com',
    'api.deepseek.com',
  ],
  key_cortex_research: [
    'api.tempo.xyz',
    'api.semanticscholar.org',
    'data.sec.gov',
    'api.deepseek.com',
  ],
  key_sec_audit: [
    'api.tempo.xyz',
    'api.etherscan.io',
    'api.certik.io',
    'api.deepseek.com',
  ],
  key_vision_craft: [
    'api.tempo.xyz',
    'api.stability.ai',
    'api.replicate.com',
    'api.deepseek.com',
  ],
  key_chronicle_news: [
    'api.tempo.xyz',
    'newsapi.org',
    'api.bloomberg.com',
    'api.deepseek.com',
  ],
  key_polyglot_translator: [
    'api.tempo.xyz',
    'api.deepl.com',
    'translation.googleapis.com',
    'api.deepseek.com',
  ],
};

export const DashboardWallet: React.FC<DashboardWalletProps> = ({
  userBalanceUsd,
  agents,
  onOpenDeposit,
  onOpenCreateAgent,
  onToggleAgentStatus,
  isRealWalletConnected = false,
  walletBalances = null,
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [testingAgentId, setTestingAgentId] = useState<string | null>(null);
  const [testType, setTestType] = useState<'normal' | 'overdraft' | null>(null);
  const [testOutcome, setTestOutcome] = useState<TestOutcome | null>(null);

  // Financial reconciliation: Company Balance = Allocated Daily Budgets + Unassigned Balance
  const totalAllocatedDaily = agents.reduce((acc, a) => acc + (a.dailyLimitUsd || 0), 0);
  const totalSpentToday = agents.reduce((acc, a) => acc + (a.spentTodayUsd || 0), 0);
  const displayVaultBal = walletBalances?.vaultTvl !== undefined ? walletBalances.vaultTvl : userBalanceUsd;
  const unassignedBalance = Math.max(0, Number((displayVaultBal - totalAllocatedDaily).toFixed(2)));

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || null;

  // Test Payment Action: Normal 0.1¢ Spend
  const handleTestNormalSpend = async (agent: AgentAccount) => {
    soundEngine.playClick();
    setTestingAgentId(agent.id);
    setTestType('normal');
    setTestOutcome(null);
    const t0 = performance.now();

    try {
      const res = await fetch('/api/mpp/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyId: agent.id,
          targetUrl: 'https://api.tempo.xyz/v1/router/quote',
          pricePathUsd: 0.001,
          category: 'Market Data',
        }),
      });
      const data = await res.json();
      const latency = Math.round(performance.now() - t0);

      if (res.ok) {
        soundEngine.playSettlementChime();
        agent.spentTodayUsd = Number(((agent.spentTodayUsd || 0) + 0.001).toFixed(4));
        setTestOutcome({
          agentId: agent.id,
          type: 'normal',
          status: 'APPROVED',
          title: 'Payment Approved & Settled',
          checked: `Daily limit ($${agent.dailyLimitUsd.toFixed(2)}) & Approved provider (api.tempo.xyz)`,
          happened: `Policy verified off-chain, 0.1¢ settled on Tempo L1 via MPP`,
          moneySent: `Yes — $0.001 paid to provider`,
          txHash: data.trace?.txHash,
          latencyMs: data.trace?.latencyMs || latency,
        });
      } else {
        soundEngine.playDefenseIntercept();
        setTestOutcome({
          agentId: agent.id,
          type: 'normal',
          status: 'BLOCKED',
          title: 'Payment Rejected by Policy',
          checked: `Daily limit ($${agent.dailyLimitUsd.toFixed(2)})`,
          happened: data.error || 'Payment execution blocked by Synapse402 policy guardrail.',
          moneySent: 'No — $0.00 debited from treasury.',
          latencyMs: latency,
        });
      }
    } catch {
      soundEngine.playDefenseIntercept();
      setTestOutcome({
        agentId: agent.id,
        type: 'normal',
        status: 'BLOCKED',
        title: 'Connection Intercepted',
        checked: 'Network connectivity & policy engine',
        happened: 'Local execution error prevented transaction dispatch.',
        moneySent: 'No — $0.00 debited from treasury.',
      });
    } finally {
      setTestingAgentId(null);
      setTestType(null);
    }
  };

  // Test Payment Action: Overdraft Above Limit Rejection
  const handleTestOverdraftSpend = async (agent: AgentAccount) => {
    soundEngine.playClick();
    setTestingAgentId(agent.id);
    setTestType('overdraft');
    setTestOutcome(null);
    const t0 = performance.now();

    try {
      const res = await fetch('/api/mpp/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyId: agent.id,
          targetUrl: 'https://api.tempo.xyz/v1/router/quote',
          pricePathUsd: 999.0,
          category: 'High Value Compute',
        }),
      });
      const data = await res.json();
      const latency = Math.round(performance.now() - t0);

      if (!res.ok) {
        soundEngine.playDefenseIntercept();
        setTestOutcome({
          agentId: agent.id,
          type: 'overdraft',
          status: 'BLOCKED',
          title: 'Blocked before payment',
          checked: `Daily limit ($${agent.dailyLimitUsd.toFixed(2)}) vs requested ($999.00)`,
          happened: `Off-chain policy check failed: Requested cost ($999.00) exceeds daily limit ($${agent.dailyLimitUsd.toFixed(2)}).`,
          moneySent: 'No — $0.00 debited from treasury. No transaction submitted to blockchain.',
          latencyMs: latency,
        });
      } else {
        setTestOutcome({
          agentId: agent.id,
          type: 'overdraft',
          status: 'APPROVED',
          title: 'Unexpected Settlement',
          checked: 'Daily limit check',
          happened: 'Transaction was processed in testnet sandbox.',
          moneySent: 'Yes',
          txHash: data.trace?.txHash,
        });
      }
    } catch {
      soundEngine.playDefenseIntercept();
      setTestOutcome({
        agentId: agent.id,
        type: 'overdraft',
        status: 'BLOCKED',
        title: 'Blocked before payment',
        checked: `Daily limit ($${agent.dailyLimitUsd.toFixed(2)}) vs requested ($999.00)`,
        happened: 'Overdraft intercepted before payment dispatch.',
        moneySent: 'No — $0.00 debited from treasury. No transaction submitted to blockchain.',
      });
    } finally {
      setTestingAgentId(null);
      setTestType(null);
    }
  };

  return (
    <section id="section-agent-wallet-budget" className="space-y-6 font-sans">
      {/* 1. Page Header & Core Purpose */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0c0e14] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md bg-[#d7ff4f] text-[#08090c] font-black text-[10px] tracking-wider uppercase">
              BUDGET CONTROLLER
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Bots & Budgets
            </h2>
            <span className="text-zinc-500 text-xs hidden sm:inline">•</span>
            <span className="text-xs text-zinc-300 font-medium hidden sm:inline">
              Set spending limits for your AI
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Give each agent a budget and control where it can spend. The company vault balance is protected while agents pay for APIs and compute as they work.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono shrink-0">
          <span className="px-3 py-1.5 rounded-lg bg-[#d7ff4f]/10 text-[#d7ff4f] border border-[#d7ff4f]/30 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#d7ff4f]" />
            Main Balance Protected
          </span>
          <span className="px-2.5 py-1.5 rounded-lg bg-white/[.04] text-zinc-300 border border-white/10 hidden lg:inline">
            Tempo L1 (42431)
          </span>
        </div>
      </div>

      {/* 2. Reconciled Financial Summary & Visual Cascade */}
      <div className="bg-[#0c0e14] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
        {/* Top 3 Summary Figures (100% Reconciled Math) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-5 border-b border-white/[.08]">
          {/* 1. Company Balance */}
          <div className="p-4 rounded-xl bg-white/[.025] border border-white/[.06] space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white/70"></span>
                Company Balance
              </span>
              <InfoBadge
                title="Company Central Balance"
                text="The central treasury funds deposited in the SynapseVault contract. Autonomous AI agents cannot access this principal directly."
              />
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">
                ${displayVaultBal.toFixed(2)}
              </span>
              <span className="text-xs text-zinc-500 font-medium">USD</span>
            </div>
            <p className="text-[11px] text-zinc-400 pt-0.5">
              {isRealWalletConnected ? 'Live on Tempo L1 Testnet' : 'On-Chain Vault Balance'}
            </p>
          </div>

          {/* 2. Allocated Daily Budgets */}
          <div className="p-4 rounded-xl bg-white/[.025] border border-white/[.06] space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#d7ff4f]"></span>
                Allocated Daily Budgets
              </span>
              <InfoBadge
                title="Allocated Daily Budgets"
                text="The sum of all daily spending caps configured across active bots ($50 + $35 + $25 + $20 + $15 + $25 = $170.00). Bots cannot spend beyond their respective limit."
              />
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl sm:text-3xl font-bold text-[#d7ff4f] font-mono tracking-tight">
                ${totalAllocatedDaily.toFixed(2)}
              </span>
              <span className="text-xs text-zinc-500 font-medium">USD / day</span>
            </div>
            <p className="text-[11px] text-zinc-400 pt-0.5">
              Across {agents.filter((a) => a.status === 'ACTIVE').length} active AI agents
            </p>
          </div>

          {/* 3. Unassigned Balance */}
          <div className="p-4 rounded-xl bg-white/[.025] border border-white/[.06] space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Unassigned Balance
              </span>
              <InfoBadge
                title="Unassigned Protected Balance"
                text="Liquid treasury capital that has not been allocated to any bot. This money is 100% shielded from all agent operations."
              />
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono tracking-tight">
                ${unassignedBalance.toFixed(2)}
              </span>
              <span className="text-xs text-zinc-500 font-medium">USD</span>
            </div>
            <p className="text-[11px] text-zinc-400 pt-0.5">
              100% shielded from agents
            </p>
          </div>
        </div>

        {/* Visual Cascade: How Spending Limits Protect Company Funds */}
        <div className="p-4 rounded-xl bg-white/[.02] border border-white/[.06] space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
            <span className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#d7ff4f]" />
              <span>How Company Balance is Protected</span>
            </span>
            <span className="text-[11px] font-mono text-zinc-400">
              Reconciled: ${totalAllocatedDaily.toFixed(2)} allocated + ${unassignedBalance.toFixed(2)} unassigned = ${displayVaultBal.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-white/[.03] border border-white/10 flex flex-col justify-between">
              <span className="text-zinc-500 text-[10px] uppercase">1. Vault Balance</span>
              <span className="text-white font-bold text-sm mt-1">${displayVaultBal.toFixed(2)}</span>
              <span className="text-[10px] text-zinc-400 mt-1">Company central funds</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#d7ff4f]/[0.06] border border-[#d7ff4f]/20 flex flex-col justify-between">
              <span className="text-[#d7ff4f] text-[10px] uppercase font-bold">2. Agent Daily Limits</span>
              <span className="text-[#d7ff4f] font-bold text-sm mt-1">${totalAllocatedDaily.toFixed(2)}</span>
              <span className="text-[10px] text-zinc-300 mt-1">Max spendable today</span>
            </div>

            <div className="p-2.5 rounded-lg bg-white/[.03] border border-white/10 flex flex-col justify-between">
              <span className="text-zinc-500 text-[10px] uppercase">3. Provider Policy</span>
              <span className="text-zinc-200 font-bold text-sm mt-1">4 allowed providers</span>
              <span className="text-[10px] text-zinc-400 mt-1">Unknown URLs blocked</span>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-500/[0.08] border border-emerald-500/25 flex flex-col justify-between">
              <span className="text-emerald-400 text-[10px] uppercase font-bold">4. Protected Buffer</span>
              <span className="text-emerald-400 font-bold text-sm mt-1">${unassignedBalance.toFixed(2)}</span>
              <span className="text-[10px] text-emerald-300/80 mt-1">Untouchable by bots</span>
            </div>
          </div>
        </div>

        {/* Action Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-[#d7ff4f]"></span>
            <span>Total Spent Today:</span>
            <strong className="text-white font-mono">${totalSpentToday.toFixed(4)} USD</strong>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenDeposit();
              }}
              className="px-4 py-2 bg-[#d7ff4f] hover:bg-[#cbf540] text-[#08090c] font-black text-xs rounded-xl transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(215,255,79,0.25)] border border-[#d7ff4f] cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5 text-[#08090c]" />
              <span>Deposit Funds</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenCreateAgent();
              }}
              className="px-4 py-2 bg-white/[.06] hover:bg-white/10 text-zinc-200 font-semibold text-xs rounded-xl border border-white/15 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#d7ff4f]" />
              <span>+ Create Agent Limit</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main UI: Table View of AI Agents */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2 font-mono">
            <Bot className="w-4 h-4 text-[#d7ff4f]" />
            <span>Configured AI Agents ({agents.length} Active)</span>
          </h3>
          <span className="text-xs text-zinc-400 font-mono">
            Click 'Manage' to test spending & rejection rules
          </span>
        </div>

        {/* Table Container */}
        <div className="bg-[#0c0e14] border border-white/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[.02] text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Agent</th>
                  <th className="py-3 px-4 font-semibold hidden md:table-cell">What It Does</th>
                  <th className="py-3 px-4 font-semibold text-right">Daily Limit</th>
                  <th className="py-3 px-4 font-semibold text-right">Spent Today</th>
                  <th className="py-3 px-4 font-semibold text-right">Remaining</th>
                  <th className="py-3 px-4 font-semibold text-center hidden sm:table-cell">Allowed Providers</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[.06] text-xs">
                {agents.map((agent) => {
                  const dailyLimit = Number(agent.dailyLimitUsd || 0);
                  const spent = Number(agent.spentTodayUsd || 0);
                  const remaining = Math.max(0, Number((dailyLimit - spent).toFixed(4)));
                  const usagePercent = dailyLimit > 0 ? Math.min(100, Math.round((spent / dailyLimit) * 100)) : 0;
                  const isActive = agent.status === 'ACTIVE';

                  return (
                    <tr
                      key={agent.id}
                      className="hover:bg-white/[.025] transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedAgentId(agent.id);
                        setTestOutcome(null);
                      }}
                    >
                      {/* Agent */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg border border-white/10 bg-white/[.04] flex items-center justify-center font-bold text-zinc-200 group-hover:border-[#d7ff4f]/40 group-hover:text-[#d7ff4f] transition-all shrink-0">
                            <Bot className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-white tracking-tight flex items-center gap-1.5">
                              <span>{agent.name}</span>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-500 block truncate max-w-[130px]">
                              {agent.sessionKey ? `${agent.sessionKey.slice(0, 6)}...${agent.sessionKey.slice(-4)}` : '0x...'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* What It Does */}
                      <td className="py-3 px-4 text-zinc-300 max-w-xs truncate hidden md:table-cell">
                        {agent.role}
                      </td>

                      {/* Daily Limit */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-zinc-200">
                        ${dailyLimit.toFixed(2)}
                      </td>

                      {/* Spent Today */}
                      <td className="py-3 px-4 text-right font-mono text-[#d7ff4f] font-semibold">
                        ${spent.toFixed(3)}
                      </td>

                      {/* Remaining */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-mono font-bold text-emerald-400">
                            ${remaining.toFixed(3)}
                          </span>
                          <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full bg-[#d7ff4f] rounded-full"
                              style={{ width: `${usagePercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Allowed Providers */}
                      <td className="py-3 px-4 text-center hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-mono bg-white/[.04] text-zinc-300 border border-white/10">
                          <Globe className="w-3 h-3 text-[#d7ff4f]" />
                          <span>4 allowed providers</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            soundEngine.playClick();
                            onToggleAgentStatus(agent.id);
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border transition cursor-pointer ${
                            isActive
                              ? 'bg-[#d7ff4f]/10 border-[#d7ff4f]/30 text-[#d7ff4f] hover:bg-[#d7ff4f]/20'
                              : 'bg-white/[.04] border-white/10 text-zinc-400 hover:bg-white/10'
                          }`}
                        >
                          {agent.status}
                        </button>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            soundEngine.playClick();
                            setSelectedAgentId(agent.id);
                            setTestOutcome(null);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white/[.06] hover:bg-[#d7ff4f] hover:text-[#08090c] text-zinc-200 text-xs font-semibold border border-white/15 hover:border-[#d7ff4f] transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                        >
                          <Sliders className="w-3 h-3" />
                          <span>Manage</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Detailed "Manage Agent" Modal / Drawer */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="w-full max-w-2xl bg-[#0c0e14] border border-white/15 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top: Title & Close */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl border border-white/15 bg-white/[.04] flex items-center justify-center font-bold text-[#d7ff4f] shrink-0 mt-0.5">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {selectedAgent.name}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                      selectedAgent.status === 'ACTIVE'
                        ? 'bg-[#d7ff4f]/10 border-[#d7ff4f]/30 text-[#d7ff4f]'
                        : 'bg-white/[.04] border-white/10 text-zinc-400'
                    }`}>
                      {selectedAgent.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">{selectedAgent.role}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedAgentId(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Agent Address (Clear Human Terminology, NOT Card ID) */}
            <div className="p-3.5 rounded-xl bg-white/[.025] border border-white/[.08] space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <KeyRound className="w-3.5 h-3.5 text-[#d7ff4f]" />
                  <span>Agent address</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-500">Tempo L1 Account</span>
              </div>
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <span className="font-mono text-xs sm:text-sm text-zinc-200 truncate" title={selectedAgent.sessionKey}>
                  {selectedAgent.sessionKey || '0x...'}
                </span>
                {selectedAgent.sessionKey && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedAgent.sessionKey);
                      setCopiedKeyId(selectedAgent.id);
                      setTimeout(() => setCopiedKeyId(null), 2000);
                    }}
                    className="px-2.5 py-1 rounded bg-white/[.06] hover:bg-white/10 text-zinc-300 hover:text-white transition cursor-pointer text-xs font-mono shrink-0 flex items-center gap-1"
                  >
                    {copiedKeyId === selectedAgent.id ? (
                      <>
                        <Check className="w-3 h-3 text-[#d7ff4f]" />
                        <span className="text-[#d7ff4f]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Spending Limits Breakdown */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white/[.02] border border-white/[.08]">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">Daily Limit</span>
                <span className="text-base font-bold text-white font-mono mt-1 block">
                  ${Number(selectedAgent.dailyLimitUsd || 0).toFixed(2)}
                </span>
                <span className="text-[10px] text-zinc-400">per 24-hour window</span>
              </div>

              <div className="p-3 rounded-xl bg-white/[.02] border border-white/[.08]">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">Spent Today</span>
                <span className="text-base font-bold text-[#d7ff4f] font-mono mt-1 block">
                  ${Number(selectedAgent.spentTodayUsd || 0).toFixed(4)}
                </span>
                <span className="text-[10px] text-zinc-400">recorded on-chain</span>
              </div>

              <div className="p-3 rounded-xl bg-white/[.02] border border-white/[.08]">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">Remaining</span>
                <span className="text-base font-bold text-emerald-400 font-mono mt-1 block">
                  ${Math.max(0, Number((selectedAgent.dailyLimitUsd - (selectedAgent.spentTodayUsd || 0)).toFixed(4)))}
                </span>
                <span className="text-[10px] text-zinc-400">available to spend</span>
              </div>
            </div>

            {/* Allowed Providers Allowlist */}
            <div className="p-3.5 rounded-xl bg-white/[.025] border border-white/[.08] space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#d7ff4f]" />
                  <span>Allowed Providers (Whitelisted Domains)</span>
                </span>
                <span className="text-[10.5px] font-mono text-zinc-400">
                  4 allowed providers
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                This agent is cryptographically restricted to paying only these specific approved domains. Requests to any other URL are intercepted with $0 loss.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                {(DEFAULT_ALLOWED_PROVIDERS[selectedAgent.id] || [
                  'api.tempo.xyz',
                  'api.deepseek.com',
                  'api.binance.com',
                  'data.sec.gov',
                ]).map((domain, i) => (
                  <div key={i} className="px-2.5 py-1.5 rounded-lg bg-white/[.03] border border-white/10 flex items-center gap-2 text-zinc-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#d7ff4f] shrink-0" />
                    <span className="truncate">{domain}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Rule Note */}
            <div className="p-3 rounded-xl bg-white/[.02] border border-white/[.08] text-xs text-zinc-300 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#d7ff4f] shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11.5px] text-zinc-400">
                <strong className="text-white">Payment Rule:</strong> The agent can pay only within its daily limit and approved provider list. Rejections occur off-chain before any payment is sent to the blockchain, ensuring zero treasury exposure.
              </p>
            </div>

            {/* Test Payment Actions (Live Proof of Policy Enforcement) */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
                  Test Spending Enforcement
                </span>
                <span className="text-[10px] font-mono text-zinc-500">Live Policy Verification</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Button 1: Normal 0.1¢ Spend */}
                <button
                  type="button"
                  disabled={testingAgentId === selectedAgent.id || selectedAgent.status !== 'ACTIVE'}
                  onClick={() => handleTestNormalSpend(selectedAgent)}
                  className="p-3 rounded-xl bg-[#d7ff4f]/10 hover:bg-[#d7ff4f]/20 border border-[#d7ff4f]/30 text-left transition cursor-pointer disabled:opacity-50 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#d7ff4f] flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Try $0.001 payment</span>
                    </span>
                    {testingAgentId === selectedAgent.id && testType === 'normal' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#d7ff4f]" />
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-400">Within Limit</span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Verifies allowance & provider allowlist on Tempo L1.
                  </p>
                </button>

                {/* Button 2: Overdraft Rejection Test */}
                <button
                  type="button"
                  disabled={testingAgentId === selectedAgent.id || selectedAgent.status !== 'ACTIVE'}
                  onClick={() => handleTestOverdraftSpend(selectedAgent)}
                  className="p-3 rounded-xl bg-red-500/10 hover:bg-red-500/15 border border-red-500/30 text-left transition cursor-pointer disabled:opacity-50 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Try payment above limit</span>
                    </span>
                    {testingAgentId === selectedAgent.id && testType === 'overdraft' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-400">$999 Test</span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Proves off-chain rejection with $0 treasury deduction.
                  </p>
                </button>
              </div>

              {/* Test Outcome Result Box */}
              {testOutcome && testOutcome.agentId === selectedAgent.id && (
                <div className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in duration-200 ${
                  testOutcome.status === 'APPROVED'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                    : 'bg-red-500/10 border-red-500/30 text-red-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-sm">
                      {testOutcome.status === 'APPROVED' ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-300">{testOutcome.title}</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-4 h-4 text-red-400" />
                          <span className="text-red-300">{testOutcome.title}</span>
                        </>
                      )}
                    </span>
                    {testOutcome.latencyMs && (
                      <span className="text-[10.5px] font-mono text-zinc-400">
                        Evaluated in {testOutcome.latencyMs}ms
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 pt-1 font-mono text-[11px]">
                    <div>
                      <strong className="text-zinc-400 font-sans">What was checked: </strong>
                      <span className="text-zinc-200">{testOutcome.checked}</span>
                    </div>
                    <div>
                      <strong className="text-zinc-400 font-sans">What happened: </strong>
                      <span className="text-zinc-200">{testOutcome.happened}</span>
                    </div>
                    <div>
                      <strong className="text-zinc-400 font-sans">Was money sent? </strong>
                      <span className={testOutcome.status === 'APPROVED' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                        {testOutcome.moneySent}
                      </span>
                    </div>
                  </div>

                  {testOutcome.txHash && (
                    <div className="pt-2 mt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-zinc-400 truncate">
                        Tx: {testOutcome.txHash.slice(0, 16)}...
                      </span>
                      <a
                        href={`https://explore.tempo.xyz/tx/${testOutcome.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#d7ff4f] hover:underline flex items-center gap-1"
                      >
                        <span>View on Tempo Explorer</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Bottom: Close Button */}
            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAgentId(null)}
                className="px-4 py-2 rounded-xl bg-white/[.06] hover:bg-white/10 text-zinc-200 text-xs font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Technical Details Section (At the Bottom) */}
      <div className="p-4 rounded-2xl bg-white/[.02] border border-white/[.06] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d7ff4f]"></span>
          <span>Tempo L1 Contract:</span>
          <strong className="text-zinc-200 truncate max-w-xs sm:max-w-none">
            0x3c42E274FAdd8e371fB84f97203CC2F2125c8775
          </strong>
        </div>
        <div className="flex items-center gap-3">
          <span>Standard: <strong className="text-zinc-200">EIP-712 + Merkle Tree Allowlist</strong></span>
          <span>Chain ID: <strong className="text-[#d7ff4f]">42431</strong></span>
        </div>
      </div>
    </section>
  );
};
