import { ScopedSessionKey, MPPExecutionTrace } from '../types/synapse';
import { LivePaymentEvent } from '../types/synapse402';

/**
 * Pillar 2: Canonical Synapse Payment Status Model
 * Unifies DEMO, LIVE, PENDING, CONFIRMED, FAILED, and REJECTED states across all pages.
 */
export type SynapsePaymentStatus = 'DEMO' | 'LIVE' | 'PENDING' | 'CONFIRMED' | 'FAILED' | 'REJECTED' | 'VOIDED';

/**
 * Settlement request payload used by the unified payment pipeline.
 */
export interface SettlementRequest {
  /** Explicit spending policy; payment code must never select a key implicitly. */
  keyId: string;
  targetUrl: string;
  pricePathUsd: number;
  category?: string;
  jobId?: string;
  jobBudgetPathUsd?: number;
  evaluationOnly?: boolean;
  asyncRelay?: boolean;
  allowDynamicWhitelist?: boolean;
  idempotencyKey?: string;
  recipient?: string;
  asset?: string;
  realm?: string;
  serviceName?: string;
  providerName?: string;
  simulateFailure?: boolean;
  corruptSignature?: boolean;
  customSig?: string;
  subcontractors?: Array<{
    id: string;
    role: string;
    shortName: string;
    targetUrl: string;
    costPathUsd: number;
  }>;
}

/**
 * Canonical result returned by the single payment pipeline.
 */
export interface SettlementResult {
  status: SynapsePaymentStatus;
  trace: MPPExecutionTrace;
  updatedKey?: ScopedSessionKey;
  blockHeight?: number;
  txHash?: string | null;
  explorerUrl?: string;
  costPathUsd: number;
  latencyMs: number;
  nonce2D?: string;
  error?: string;
}

/**
 * Shared Job and Budget ledger state.
 */
export interface SharedJobBudget {
  jobId: string;
  maxBudgetUsd: number;
  spentUsd: number;
  settledSpendUsd: number;
  plannedSpendUsd: number;
  remainingUsd: number;
  activePlan: 'FULL' | 'REDUCED' | 'INSUFFICIENT';
  prunedSteps?: string[];
  retainedSteps?: string[];
}

export interface MissionBudgetConfig {
  minBudgetUsd?: number;
  fullBudgetUsd?: number;
  title?: string;
  prunedSteps?: string[];
  retainedSteps?: string[];
}

/**
 * Normalizes any backend trace or live event status to one of the 6 canonical states.
 */
export function normalizeSynapseStatus(
  input: string | MPPExecutionTrace | LivePaymentEvent | undefined | null
): SynapsePaymentStatus {
  if (!input) return 'DEMO';

  // Handle object input
  if (typeof input === 'object') {
    const ev = input as any;
    if (ev.status === 'REJECTED' || ev.executionMode === 'FAILED_REVERT') return 'REJECTED';
    if (ev.status === 'FAILED') return 'FAILED';
    if (ev.status === 'VOIDED') return 'VOIDED';
    if (ev.status === 'REFUNDED') return 'FAILED';
    if (ev.status === 'PENDING' || ev.executionMode === 'LIVE_TESTNET_PENDING_CONFIRMATION') return 'PENDING';
    
    // Live confirmed on-chain
    if (
      (ev.executionMode === 'LIVE_TESTNET' || ev.paymentMode === 'LIVE_TESTNET') &&
      ev.receiptVerified === true
    ) {
      return 'CONFIRMED';
    }

    if (ev.executionMode === 'LIVE_TESTNET') return 'LIVE';
    if (ev.status === 'SIMULATED_PASS' || ev.executionMode === 'RESILIENT_SANDBOX' || ev.paymentMode === 'DEMO') {
      return 'DEMO';
    }
    // Unknown backend states are never evidence of a confirmed payment.
    return 'DEMO';
  }

  // Handle string input
  const str = String(input).toUpperCase().trim();
  switch (str) {
    case 'CONFIRMED':
      return 'CONFIRMED';
    // A bare SETTLED string carries no receipt proof. Object inputs must
    // include receiptVerified=true before the UI can show confirmation.
    case 'SETTLED':
      return 'PENDING';
    case 'LIVE':
    case 'LIVE_TESTNET':
      return 'LIVE';
    case 'PENDING':
    case 'LIVE_TESTNET_PENDING_CONFIRMATION':
      return 'PENDING';
    case 'REJECTED':
      return 'REJECTED';
    case 'FAILED':
    case 'FAILED_REVERT':
      return 'FAILED';
    case 'VOIDED':
      return 'VOIDED';
    case 'REFUNDED':
      return 'FAILED';
    case 'DEMO':
    case 'SIMULATED_PASS':
    case 'RESILIENT_SANDBOX':
    default:
      return 'DEMO';
  }
}
