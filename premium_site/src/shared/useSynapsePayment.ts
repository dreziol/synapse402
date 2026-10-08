import { useSynapseState } from './SynapseStateContext';
import { SettlementRequest, SettlementResult, SynapsePaymentStatus } from './types';
import { executeSynapseSettlement } from './paymentPipeline';

export function useSynapsePayment() {
  const state = useSynapseState();

  return {
    ...state,
    executeDirect: executeSynapseSettlement,
  };
}

export { executeSynapseSettlement };
export type { SettlementRequest, SettlementResult, SynapsePaymentStatus };
