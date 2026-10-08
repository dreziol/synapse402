import { TEMPO_CHAIN_ID, TEMPO_EXPLORER_URL, TEMPO_VAULT_ADDRESS, tempoTransactionUrl } from '../config/network';
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
  Lock,
  ChevronDown
} from 'lucide-react';
import { soundEngine } from '../utils/audioEffects';
import { InfoBadge } from './InfoBadge';
import { useSynapseState } from '../shared/SynapseStateContext';

interface DashboardWalletProps {
  userBalanceUsd: number;
  agents: AgentAccount[];
  onOpenDeposit: () => void;
  onOpenCreateAgent: () => void;
  onToggleAgentStatus: (agentId: string) => void;
  isRealWalletConnected?: boolean;
  networkMode?: 'LIVE_TESTNET' | 'RESILIENT_SANDBOX';
  walletAddress?: string | null;
  walletBalances?: { pathUsd: number; feeTokenBalance: number; feeTokenAddress: string; feeTokenSymbol: string; vaultTvl: number; isSessionKeyRegistered: boolean; sessionStatus: string } | null;
  vaultMetrics?: {
    totalVaultLiquidity: number;
    availableUnreservedLiquidity: number;
    reservedAgentBudgets: number;
    totalVolumeSettledPathUsd: number;
    totalTransactionsCount: number;
    protocolFeeRevenuePathUsd: number;
  } | null;
  onRefresh?: () => void;
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
  receiptVerified?: boolean;
  latencyMs?: number;
}

export const DashboardWallet: React.FC<DashboardWalletProps> = ({
  userBalanceUsd,
  agents,
  onOpenDeposit,
  onOpenCreateAgent,
  onToggleAgentStatus,
  isRealWalletConnected = false,
  networkMode = 'RESILIENT_SANDBOX',
  walletBalances = null,
  onRefresh,
}) => {
  const { executePayment } = useSynapseState();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [testingAgentId, setTestingAgentId] = useState<string | null>(null);
  const [testType, setTestType] = useState<'normal' | 'overdraft' | null>(null);
  const [testOutcome, setTestOutcome] = useState<TestOutcome | null>(null);

  // Reusable rules are permissions for background agents. They do not divide,
  // reserve, or subtract money from the shared Vault.
  const activeAgents = agents.filter((a) => a.status === 'ACTIVE');
  const displayVaultBal = walletBalances?.vaultTvl !== undefined ? walletBalances.vaultTvl : userBalanceUsd;

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || null;
  // This value comes from the active session key's cumulative on-chain spend,
  // so it is not a calendar-day ledger.
  const spendLabel = networkMode === 'LIVE_TESTNET' ? 'Cap Used' : 'Planned Cap Use';
  const providerHost = (entry: string): string => {
    try { return new URL(entry).hostname.toLowerCase(); } catch { return entry.split('/')[0].toLowerCase(); }
  };
  const configuredProviders = (agent: AgentAccount) => agent.whitelistedDomains || [];
  const allowedProviderCount = (agent: AgentAccount) =>
    new Set(configuredProviders(agent).map(providerHost)).size;
  const shortAgentRole = (agent: AgentAccount) => {
    const role = String(agent.role || '').toLowerCase();
    if (role.includes('market') || role.includes('orderbook')) return 'Market data';
    if (role.includes('research') || role.includes('filing')) return 'Research';
    if (role.includes('security') || role.includes('vulnerab')) return 'Security checks';
    if (role.includes('image') || role.includes('visual')) return 'Image processing';
    if (role.includes('article') || role.includes('news')) return 'Article access';
    if (role.includes('translation') || role.includes('local')) return 'Translation';
    return 'Approved agent work';
  };
  const getTestProvider = (agent: AgentAccount) => {
    return configuredProviders(agent)[0] || '';
  };

  // Test Payment Action: Normal 0.1¢ Spend
  const handleTestNormalSpend = async (agent: AgentAccount) => {
    soundEngine.playClick();
    setTestingAgentId(agent.id);
    setTestType('normal');
    setTestOutcome(null);
    const t0 = performance.now();
    const testProvider = getTestProvider(agent);
    let testProviderHost = testProvider;
    try {
      testProviderHost = new URL(testProvider).hostname;
    } catch {
      // Keep the configured string visible if a legacy fixture has no URL scheme.
    }

    try {
      const settleRes = await executePayment({
        keyId: agent.id,
        targetUrl: testProvider,
        pricePathUsd: 0.001,
        category: 'Market Data',
        evaluationOnly: networkMode !== 'LIVE_TESTNET',
        jobId: `agent_test_${agent.id}_${Date.now()}`,
        jobBudgetPathUsd: Math.max(0.001, agent.reusableCapUsd),
        serviceName: 'Agent approval test',
        providerName: testProviderHost,
      });
      const latency = settleRes.latencyMs;
      onRefresh?.();
      const isLiveSettlement = settleRes.status === 'CONFIRMED'
        && typeof settleRes.txHash === 'string'
        && /^0x[a-fA-F0-9]{64}$/.test(settleRes.txHash);
      if (isLiveSettlement) {
        soundEngine.playSettlementChime();
      }
      setTestOutcome({
        agentId: agent.id,
        type: 'normal',
        status: 'APPROVED',
        title: isLiveSettlement ? 'Payment Approved & Settled' : 'Payment Plan Approved',
        checked: `Reusable cap ($${agent.reusableCapUsd.toFixed(2)}) & approved provider (${testProviderHost})`,
        happened: isLiveSettlement ? 'Policy verified and 0.1¢ settled on Tempo L1 via MPP' : 'Policy verified; evaluation response returned without a chain transaction',
        moneySent: isLiveSettlement ? 'Yes — $0.001 settled through the configured demo receiver' : 'No — payment recorded as an evaluation step',
        txHash: settleRes.txHash || undefined,
        receiptVerified: isLiveSettlement,
        latencyMs: latency,
      });
    } catch (err: any) {
      soundEngine.playDefenseIntercept();
      const errMsg = err?.message || '';
      if (errMsg.includes('exceeds') || errMsg.includes('cap') || errMsg.includes('whitelist') || errMsg.includes('blocked')) {
        setTestOutcome({
          agentId: agent.id,
          type: 'normal',
          status: 'BLOCKED',
          title: 'Blocked before payment',
          checked: `Agent cap ($${agent.reusableCapUsd.toFixed(2)}) & provider access`,
          happened: errMsg,
          moneySent: 'No — $0.00 debited from treasury.',
          latencyMs: Math.round(performance.now() - t0),
        });
      } else {
        setTestOutcome({
          agentId: agent.id,
          type: 'normal',
          status: 'BLOCKED',
          title: 'Connection Intercepted',
          checked: 'Network connectivity & policy engine',
          happened: errMsg || 'Local execution error prevented transaction dispatch.',
          moneySent: 'No — $0.00 debited from treasury.',
        });
      }
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
      // This is expected to throw (policy should block $999 overdraft)
      const settleRes = await executePayment({
        keyId: agent.id,
        targetUrl: getTestProvider(agent),
        pricePathUsd: 999.0,
        category: 'High Value Compute',
        evaluationOnly: networkMode !== 'LIVE_TESTNET',
        jobId: `agent_overdraft_${agent.id}_${Date.now()}`,
        jobBudgetPathUsd: Math.max(0.001, agent.reusableCapUsd),
        serviceName: 'Overdraft safety test',
      });
      // If it somehow succeeds (shouldn't), show as unexpected
      setTestOutcome({
        agentId: agent.id,
        type: 'overdraft',
        status: 'APPROVED',
        title: 'Unexpected Settlement',
        checked: 'Agent cap check',
        happened: 'Transaction was processed in testnet sandbox.',
        moneySent: 'Yes',
        txHash: settleRes.txHash || undefined,
      });
    } catch (err: any) {
      soundEngine.playDefenseIntercept();
      const latency = Math.round(performance.now() - t0);
      setTestOutcome({
        agentId: agent.id,
        type: 'overdraft',
        status: 'BLOCKED',
        title: 'Blocked before payment',
        checked: `Agent cap ($${agent.reusableCapUsd.toFixed(2)}) vs requested ($999.00)`,
        happened: err?.message || `Off-chain policy check failed: Requested cost ($999.00) exceeds the agent cap ($${agent.reusableCapUsd.toFixed(2)}).`,
        moneySent: 'No — $0.00 debited from treasury. No transaction submitted to blockchain.',
        latencyMs: latency,
      });
    } finally {
      setTestingAgentId(null);
      setTestType(null);
    }
  };

  return (
    <section id="section-agent-wallet-budget" className="relative isolate space-y-6 font-sans">
      {/* 1. Page Header & Core Purpose */}
      <div className="ui-section p-5 sm:p-6 rounded-2xl bg-white/[.035] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Spending Controls
            </h2>
            <span className="text-zinc-500 text-xs hidden sm:inline">•</span>
            <span className="text-xs text-zinc-300 font-medium hidden sm:inline">
              Safe defaults for jobs that run in the background
            </span>
          </div>
          <p className="ui-explainer text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Most jobs do not start here. Choose a mission, set one job limit, and run it. These controls protect every job in the background.
          </p>
          <p className="text-[11px] text-zinc-500 max-w-3xl leading-relaxed">
            Flow: shared wallet → one job limit → automatic provider checks → payment only when allowed → receipt.
          </p>
        </div>

      </div>

      <div className="grid gap-3 sm:grid-cols-2" aria-label="Normal mission versus reusable rules">
        <div className="rounded-xl border border-white/10 bg-white/[.025] p-3">
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Normal mission</div>
          <p className="mt-1 text-xs leading-relaxed text-zinc-300">Pick one job, enter one maximum, and run it. This is the default path.</p>
        </div>
        <div className="rounded-xl border border-[#d7ff4f]/25 bg-[#d7ff4f]/[.045] p-3">
          <div className="text-[10px] font-black uppercase tracking-widest text-[#d7ff4f]">Recurring or background work</div>
          <p className="mt-1 text-xs leading-relaxed text-zinc-300">Use a reusable rule only when work repeats; it adds permissions and does not create a second balance.</p>
        </div>
      </div>

      {/* One balance, then the checks that govern its use. */}
      <div className="ui-section relative z-10 bg-[#171d25] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
        {/* Only the Vault card shows money. Rules are deliberately shown as rules. */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-5 border-b border-white/[.08]">
          {/* 1. The single shared balance */}
          <div className="relative z-10 p-4 rounded-xl bg-[#202731] border border-white/[.08] space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white/70"></span>
                  Shared balance
              </span>
              <InfoBadge
                title="Central balance"
                text="One shared balance for every job. A mission spends only the maximum you enter for that job; reusable rules add optional provider and spend permissions for repeated or background work."
              />
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">
                ${displayVaultBal.toFixed(2)}
              </span>
              <span className="text-xs text-zinc-500 font-medium">USD</span>
            </div>
            <p className="text-[11px] text-zinc-400 pt-0.5">
              {networkMode === 'LIVE_TESTNET' ? 'Read from Tempo L1' : 'Evaluation balance · no chain read'}
            </p>
          </div>

          {/* 2. Reusable safety rules: a count, never a second balance */}
          <div className="relative z-10 p-4 rounded-xl bg-[#202731] border border-white/[.08] space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#d7ff4f]"></span>
                  Reusable agent rules
              </span>
              <InfoBadge
                title="Reusable rules"
                text="A reusable rule is a permission for repeated work; it does not reserve money from the shared balance."
              />
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl sm:text-3xl font-bold text-[#d7ff4f] font-mono tracking-tight">
                {activeAgents.length}
              </span>
              <span className="text-xs text-zinc-500 font-medium">active</span>
            </div>
            <p className="text-[11px] text-zinc-400 pt-0.5">
              For repeated or background jobs
            </p>
          </div>

          {/* 3. The check that protects the single balance */}
          <div className="relative z-10 p-4 rounded-xl bg-[#202731] border border-white/[.08] space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Before payment
              </span>
              <InfoBadge
                title="Payment checks"
                text="A mission checks its one-time job maximum. This advanced page checks the reusable cap and approved provider route."
              />
            </div>
            <div className="text-base sm:text-lg font-bold text-emerald-400 tracking-tight pt-2">Job limit + provider checked</div>
            <p className="text-[11px] text-zinc-400 pt-0.5">
              before any payment is sent
            </p>
          </div>
        </div>

        {/* Action Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-sans">
            <span className="w-2 h-2 rounded-full bg-[#d7ff4f]"></span>
              <span>Choose the job and set its maximum on the mission page.</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenDeposit();
              }}
              className="px-4 py-2 bg-white/[.06] hover:bg-white/10 text-zinc-200 font-semibold text-xs rounded-xl transition-all flex items-center gap-2 border border-white/15 cursor-pointer"
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
              <span>Add reusable rule</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Optional advanced UI: recurring rules stay out of the primary job flow. */}
      <details className="ui-meta group rounded-2xl border border-white/10 bg-white/[.02] p-3">
        <summary className="list-none cursor-pointer flex items-center justify-between gap-4 px-1 py-1">
          <div className="flex items-center justify-between gap-4 min-w-0 flex-1">
          <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2 font-mono">
            <Bot className="w-4 h-4 text-[#d7ff4f]" />
            <span>{activeAgents.length} reusable agent rules</span>
          </h3>
          <span className="text-xs text-zinc-400 font-mono text-right max-w-xl">
            Optional permissions for repeated or background runs. Normal missions use their own one-time maximum.
          </span>
          </div>
          <span className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[.04] px-2.5 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-300 group-open:text-[#d7ff4f]">
            Open advanced <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
          </span>
        </summary>

        <div className="space-y-3 pt-3">

        {/* Table Container */}
        <div className="bg-white/[.035] border border-white/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[.035] text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Agent</th>
                  <th className="py-3 px-4 font-semibold hidden md:table-cell">Work</th>
                  <th className="py-3 px-4 font-semibold text-right">Rule limit</th>
                  <th className="py-3 px-4 font-semibold text-right">Used</th>
                  <th className="py-3 px-4 font-semibold text-right">Left</th>
                  <th className="py-3 px-4 font-semibold text-center hidden sm:table-cell">Providers</th>
                  <th className="py-3 px-4 font-semibold text-center">Rule</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[.06] text-xs">
                {agents.map((agent) => {
                  const reusableCap = Number(agent.reusableCapUsd || 0);
                  const cumulativeUsage = Number(agent.cumulativeUsageUsd || 0);
                  const remaining = Math.max(0, Number((reusableCap - cumulativeUsage).toFixed(4)));
                  const usagePercent = reusableCap > 0 ? Math.min(100, Math.round((cumulativeUsage / reusableCap) * 100)) : 0;
                  const isActive = agent.status === 'ACTIVE';

                  return (
                    <tr
                      key={agent.id}
                      className="hover:bg-white/[.045] transition-colors group cursor-pointer"
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
                              <span>{String(agent.name || '').replace(/\bBot\b/g, 'Agent')}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Short work label; full role and address remain in Inspect / Test. */}
                      <td className="py-3 px-4 text-zinc-300 max-w-xs truncate hidden md:table-cell">
                        {shortAgentRole(agent)}
                      </td>

                      {/* Reusable rule limit */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-zinc-200">
                        ${reusableCap.toFixed(2)}
                      </td>

                      {/* Cumulative Used */}
                      <td className="py-3 px-4 text-right font-mono text-[#d7ff4f] font-semibold">
                        ${cumulativeUsage.toFixed(3)}
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
                          <span>{allowedProviderCount(agent)} providers</span>
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
                              ? 'bg-white/[.04] border-white/15 text-zinc-300 hover:bg-white/10'
                              : 'bg-white/[.04] border-white/10 text-zinc-400 hover:bg-white/10'
                          }`}
                        >
                          {isActive ? 'Active' : 'Paused'}
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
      </details>

      {/* 4. Detailed inspection and testing modal */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="w-full max-w-2xl bg-white/[.035] border border-white/15 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
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
                  <p className="text-[11px] text-zinc-500 mt-1">
                    This panel shows what the agent may pay, where it may pay, and how the budget stops unsafe requests.
                  </p>
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
            <div className="p-3.5 rounded-xl bg-white/[.045] border border-white/[.08] space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <KeyRound className="w-3.5 h-3.5 text-[#d7ff4f]" />
                  <span>Agent address</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-500">{isRealWalletConnected ? 'Agent session address' : 'Evaluation address'}</span>
              </div>
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <span className="font-mono text-xs sm:text-sm text-zinc-200 truncate" title={selectedAgent.sessionKey}>
                  {selectedAgent.sessionKey || 'Assigned by gateway after setup'}
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
              {Number.isFinite(Number(selectedAgent.validBeforeTimestamp)) && Number(selectedAgent.validBeforeTimestamp) > 0 && (
                <div className="pt-1 text-[11px] text-zinc-400">
                  <span className="text-zinc-300 font-semibold">Rule expiry:</span>{' '}
                  {new Date(Number(selectedAgent.validBeforeTimestamp) * 1000).toLocaleString()}
                </div>
              )}
            </div>

            {/* Spending Limits Breakdown */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white/[.035] border border-white/[.08]">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">Reusable Rule Limit</span>
                <span className="text-base font-bold text-white font-mono mt-1 block">
                  ${Number(selectedAgent.reusableCapUsd || 0).toFixed(2)}
                </span>
                <span className="text-[10px] text-zinc-400">configured session allowance</span>
              </div>

              <div className="p-3 rounded-xl bg-white/[.035] border border-white/[.08]">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">{spendLabel}</span>
                <span className="text-base font-bold text-[#d7ff4f] font-mono mt-1 block">
                  ${Number(selectedAgent.cumulativeUsageUsd || 0).toFixed(4)}
                </span>
                <span className="text-[10px] text-zinc-400">cumulative active-key usage; chain receipt appears after live settlement</span>
              </div>

              <div className="p-3 rounded-xl bg-white/[.035] border border-white/[.08]">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">Remaining</span>
                <span className="text-base font-bold text-emerald-400 font-mono mt-1 block">
                  ${Math.max(0, Number((selectedAgent.reusableCapUsd - (selectedAgent.cumulativeUsageUsd || 0)).toFixed(4)))}
                </span>
                <span className="text-[10px] text-zinc-400">available to spend</span>
              </div>
            </div>

            {/* Allowed Providers Allowlist */}
            <div className="p-3.5 rounded-xl bg-white/[.045] border border-white/[.08] space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#d7ff4f]" />
                  <span>Allowed provider routes</span>
                </span>
                <span className="text-[10.5px] font-mono text-zinc-400">
                  {allowedProviderCount(selectedAgent)} providers
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                This agent is cryptographically restricted to these approved provider routes. Requests to any other URL are intercepted with $0 loss.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                {configuredProviders(selectedAgent).length > 0 ? configuredProviders(selectedAgent).map((domain, i) => (
                  <div key={i} className="px-2.5 py-1.5 rounded-lg bg-white/[.03] border border-white/10 flex items-center gap-2 text-zinc-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#d7ff4f] shrink-0" />
                    <span className="truncate">{domain}</span>
                  </div>
                )) : <p className="text-[11px] text-zinc-500">Provider routes are still loading from the gateway; no fallback list is shown.</p>}
              </div>
            </div>

            {/* Payment Rule Note */}
            <div className="p-3 rounded-xl bg-white/[.035] border border-white/[.08] text-xs text-zinc-300 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#d7ff4f] shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11.5px] text-zinc-400">
                <strong className="text-white">Payment Rule:</strong> The agent can pay only within its cap and approved provider list. Rejections occur off-chain before any payment is sent to the blockchain, ensuring zero treasury exposure.
              </p>
            </div>

            {/* Test Payment Actions (Live Proof of Policy Enforcement) */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
                  Test Spending Enforcement
                </span>
                <span className="text-[10px] font-mono text-zinc-500">{networkMode === 'LIVE_TESTNET' ? 'Live Tempo policy check' : 'Local policy check'}</span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Run one allowed request and one over-limit request to see the same rule approve useful work and stop unsafe spend before payment.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Button 1: Normal 0.1¢ Spend */}
                <button
                  type="button"
                  disabled={testingAgentId === selectedAgent.id || selectedAgent.status !== 'ACTIVE' || configuredProviders(selectedAgent).length === 0}
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
                    Checks the reusable cap and configured provider route{networkMode === 'LIVE_TESTNET' ? ' before a Tempo payment' : ' in the local policy flow'}.
                  </p>
                </button>

                {/* Button 2: Overdraft Rejection Test */}
                <button
                  type="button"
                  disabled={testingAgentId === selectedAgent.id || selectedAgent.status !== 'ACTIVE' || configuredProviders(selectedAgent).length === 0}
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
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
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

                  {testOutcome.receiptVerified && testOutcome.txHash && (
                    <div className="pt-2 mt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-zinc-400 truncate">
                        Tx: {testOutcome.txHash.slice(0, 16)}...
                      </span>
                      <a
                        href={tempoTransactionUrl(testOutcome.txHash)}
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

      {/* Technical identifiers stay available without competing with the job controls. */}
      <details className="rounded-2xl bg-white/[.025] border border-white/[.06] px-4 py-3 text-xs font-mono text-zinc-400">
        <summary className="cursor-pointer list-none flex items-center justify-between gap-3">
          <span className="font-semibold text-zinc-300">Technical details</span>
          <ChevronDown className="w-4 h-4 text-zinc-500" />
        </summary>
        <div className="pt-3 mt-3 border-t border-white/[.08] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span>Vault contract:</span>
            <strong className="text-zinc-200 truncate max-w-xs sm:max-w-none">
              {TEMPO_VAULT_ADDRESS}
            </strong>
          </div>
          <div className="flex items-center gap-3">
            <span>Standard: <strong className="text-zinc-200">EIP-712 + Merkle allowlist</strong></span>
            <span>Chain: <strong className="text-[#d7ff4f]">{TEMPO_CHAIN_ID}</strong></span>
          </div>
          <span className="w-full text-[10px] text-zinc-500">
            These identifiers show which contract and allowlist enforce the spending boundary.
          </span>
        </div>
      </details>
    </section>
  );
};
