import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { SynapsePaymentStatus, SettlementRequest, SettlementResult, SharedJobBudget, MissionBudgetConfig } from './types';
import { executeSynapseSettlement } from './paymentPipeline';
import { LivePaymentEvent } from '../types/synapse402';
import { ScopedSessionKey } from '../types/synapse';

interface SynapseStateContextType {
  jobBudget: SharedJobBudget;
  setJobBudgetLimit: (jobId: string, maxBudgetUsd: number, config?: MissionBudgetConfig) => void;
  recordJobExpense: (jobId: string, amountUsd: number, isLiveConfirmed?: boolean) => void;
  resetJobBudget: (jobId: string, maxBudgetUsd: number, config?: MissionBudgetConfig) => void;
  latestReceipts: LivePaymentEvent[];
  activeStatus: SynapsePaymentStatus;
  executePayment: (req: SettlementRequest) => Promise<SettlementResult>;
  activeKey: ScopedSessionKey | null;
  setActiveKey: (key: ScopedSessionKey | null) => void;
}

const SynapseStateContext = createContext<SynapseStateContextType | undefined>(undefined);

const DEFAULT_JOB: SharedJobBudget = {
  jobId: 'flagship_sol_analysis',
  maxBudgetUsd: 0.0050,
  spentUsd: 0,
  settledSpendUsd: 0,
  plannedSpendUsd: 0,
  remainingUsd: 0.0050,
  activePlan: 'FULL',
  retainedSteps: ['SOL/USDT Market Brief Pipeline (5 Steps)'],
};

export const SynapseStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobBudget, setJobBudget] = useState<SharedJobBudget>(DEFAULT_JOB);
  const [latestReceipts, setLatestReceipts] = useState<LivePaymentEvent[]>([]);
  const [activeStatus, setActiveStatus] = useState<SynapsePaymentStatus>('DEMO');
  const [activeKey, setActiveKey] = useState<ScopedSessionKey | null>(null);

  // Synchronize with server on mount
  useEffect(() => {
    fetch('/api/keys')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.keys?.length) {
          const active = data.keys.find((k: any) => k.status === 'ACTIVE') || data.keys[0];
          setActiveKey(active);
        }
      })
      .catch(() => {});

    // Listen to global settlement events
    const handleSettlementEvent = (e: Event) => {
      const customEvent = e as CustomEvent<LivePaymentEvent>;
      if (customEvent.detail) {
        setLatestReceipts((prev) => [customEvent.detail, ...prev.slice(0, 99)]);
      }
    };

    window.addEventListener('synapse:settlement', handleSettlementEvent);
    return () => {
      window.removeEventListener('synapse:settlement', handleSettlementEvent);
    };
  }, []);

  const setJobBudgetLimit = useCallback((jobId: string, maxBudgetUsd: number, config?: MissionBudgetConfig) => {
    setJobBudget((prev) => {
      let activePlan: 'FULL' | 'REDUCED' | 'INSUFFICIENT' = 'FULL';
      let prunedSteps: string[] = [];
      let retainedSteps: string[] = [];

      if (config) {
        const minBudget = config.minBudgetUsd ?? 0.0010;
        const fullBudget = config.fullBudgetUsd ?? maxBudgetUsd;
        if (maxBudgetUsd < minBudget) {
          activePlan = 'INSUFFICIENT';
        } else if (maxBudgetUsd < fullBudget) {
          activePlan = 'REDUCED';
          prunedSteps = config.prunedSteps || ['Optional Secondary Market Indicators'];
          retainedSteps = config.retainedSteps || ['Core Market Analysis Units'];
        } else {
          activePlan = 'FULL';
          retainedSteps = config.retainedSteps || [`All ${config.title || 'Mission'} Deliverables`];
        }
      } else if (jobId.includes('media') || maxBudgetUsd >= 0.0245) {
        if (maxBudgetUsd < 0.0120) {
          activePlan = 'INSUFFICIENT';
        } else if (maxBudgetUsd < 0.0245) {
          activePlan = 'REDUCED';
          prunedSteps = [
            '5-Language Audio Dubbing & Localization',
            'Multi-Platform Re-encoding (TikTok/Reels/Shorts)',
            'Algorithmic A/B Thumbnails Set',
          ];
          retainedSteps = [
            '4K Master Scene Generation',
            'Voiceover & Dynamic Audio Bed',
            'Real-time Caption Rendering',
          ];
        } else {
          activePlan = 'FULL';
          retainedSteps = ['All 20 Swarm Deliverables'];
        }
      } else {
        activePlan = maxBudgetUsd > 0 ? 'FULL' : 'INSUFFICIENT';
        retainedSteps = ['Approved Mission Deliverables'];
      }

      return {
        jobId,
        maxBudgetUsd,
        spentUsd: prev.jobId === jobId ? prev.spentUsd : 0,
        settledSpendUsd: prev.jobId === jobId ? (prev.settledSpendUsd || 0) : 0,
        plannedSpendUsd: prev.jobId === jobId ? (prev.plannedSpendUsd || 0) : 0,
        remainingUsd: Math.max(0, maxBudgetUsd - (prev.jobId === jobId ? (prev.settledSpendUsd || 0) : 0)),
        activePlan,
        prunedSteps,
        retainedSteps,
      };
    });
  }, []);

  const recordJobExpense = useCallback((jobId: string, amountUsd: number, isLiveConfirmed: boolean = false) => {
    setJobBudget((prev) => {
      // Strict jobId check to prevent cross-job and cross-page budget contamination
      if (prev.jobId && jobId && prev.jobId !== jobId) {
        return prev;
      }
      const newPlanned = Number(((prev.plannedSpendUsd || 0) + amountUsd).toFixed(6));
      const newSettled = isLiveConfirmed
        ? Number(((prev.settledSpendUsd || 0) + amountUsd).toFixed(6))
        : (prev.settledSpendUsd || 0);
      const newSpent = newSettled;
      return {
        ...prev,
        spentUsd: newSpent,
        settledSpendUsd: newSettled,
        plannedSpendUsd: newPlanned,
        remainingUsd: Math.max(0, Number((prev.maxBudgetUsd - newSettled).toFixed(6))),
      };
    });
  }, []);

  const resetJobBudget = useCallback((jobId: string, maxBudgetUsd: number, config?: MissionBudgetConfig) => {
    let activePlan: 'FULL' | 'REDUCED' | 'INSUFFICIENT' = 'FULL';
    if (config) {
      activePlan = maxBudgetUsd < (config.minBudgetUsd ?? 0.0010) ? 'INSUFFICIENT' : (maxBudgetUsd < (config.fullBudgetUsd ?? maxBudgetUsd) ? 'REDUCED' : 'FULL');
    } else if (jobId.includes('media')) {
      activePlan = maxBudgetUsd >= 0.0245 ? 'FULL' : (maxBudgetUsd >= 0.0120 ? 'REDUCED' : 'INSUFFICIENT');
    } else {
      activePlan = maxBudgetUsd > 0 ? 'FULL' : 'INSUFFICIENT';
    }
    setJobBudget({
      jobId,
      maxBudgetUsd,
      spentUsd: 0,
      settledSpendUsd: 0,
      plannedSpendUsd: 0,
      remainingUsd: maxBudgetUsd,
      activePlan,
    });
  }, []);

  const executePayment = useCallback(async (req: SettlementRequest): Promise<SettlementResult> => {
    setActiveStatus('PENDING');
    try {
      const result = await executeSynapseSettlement(req);
      setActiveStatus(result.status);
      if (result.costPathUsd > 0 && !result.trace?.isIdempotentCacheHit) {
        const isConfirmed = result.status === 'CONFIRMED';
        recordJobExpense(req.jobId || jobBudget.jobId, result.costPathUsd, isConfirmed);
      }
      return result;
    } catch (err) {
      setActiveStatus('FAILED');
      throw err;
    }
  }, [jobBudget.jobId, recordJobExpense]);

  const value = useMemo(() => ({
    jobBudget,
    setJobBudgetLimit,
    recordJobExpense,
    resetJobBudget,
    latestReceipts,
    activeStatus,
    executePayment,
    activeKey,
    setActiveKey,
  }), [jobBudget, setJobBudgetLimit, recordJobExpense, resetJobBudget, latestReceipts, activeStatus, executePayment, activeKey]);

  return (
    <SynapseStateContext.Provider value={value}>
      {children}
    </SynapseStateContext.Provider>
  );
};

export function useSynapseState() {
  const ctx = useContext(SynapseStateContext);
  if (!ctx) {
    throw new Error('useSynapseState must be used within a SynapseStateProvider');
  }
  return ctx;
}
