import { SettlementRequest, SettlementResult, normalizeSynapseStatus } from './types';
import { MPPExecutionTrace } from '../types/synapse';
import { LivePaymentEvent } from '../types/synapse402';

import { tempoTransactionUrl } from '../config/network';

/**
 * Pillar 3: Unified Synapse Payment Pipeline
 * Every view (Walkthrough, Missions, Swarm, Monetization) routes payments through this canonical function.
 */
export async function executeSynapseSettlement(req: SettlementRequest): Promise<SettlementResult> {
  const t0 = performance.now();

  const cleanUrl = req.targetUrl.trim();
  const price = Number(req.pricePathUsd);
  if (!cleanUrl) {
    throw new Error('Payment target URL is required.');
  }
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error('Valid positive price in pathUSD is required.');
  }
  const keyId = String(req.keyId || '').trim();
  if (!keyId) {
    throw new Error('A session key is required; payment cannot silently choose another spending policy.');
  }

  // Canonical idempotency key ensuring safe retries
  const idempotencyKey = req.idempotencyKey || `syn_idemp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  // Default to evaluation if not explicitly requested as live
  const evaluationOnly = req.evaluationOnly ?? true;
  const jobId = req.jobId || `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const jobBudgetPathUsd = req.jobBudgetPathUsd ?? price;

  const payload: Record<string, any> = {
    keyId,
    targetUrl: cleanUrl,
    pricePathUsd: price,
    category: req.category || 'Synapse Autonomous Settlement',
    evaluationOnly,
    asyncRelay: req.asyncRelay ?? false,
    allowDynamicWhitelist: req.allowDynamicWhitelist ?? false,
    idempotencyKey,
    jobId,
    jobBudgetPathUsd,
  };

  if (req.recipient) payload.recipient = req.recipient;
  if (req.asset) payload.asset = req.asset;
  if (req.realm) payload.realm = req.realm;
  if (req.simulateFailure !== undefined) payload.simulateFailure = req.simulateFailure;
  if (req.corruptSignature !== undefined) payload.corruptSignature = req.corruptSignature;
  if (req.customSig !== undefined) payload.customSig = req.customSig;

  let response: Response;
  try {
    response = await fetch('/api/mpp/settle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(payload),
    });
  } catch (netErr: any) {
    const latencyMs = Math.round(performance.now() - t0);
    throw new Error(`Network failure during settlement: ${netErr?.message || netErr}`);
  }

  const latencyMs = Math.round(performance.now() - t0);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: `HTTP ${response.status} settlement failure` }));
    const errorMsg = errorBody.error || errorBody.message || 'Settlement failed';
    const err: any = new Error(errorMsg);
    err.status = response.status;
    err.responseBody = errorBody;
    throw err;
  }

  const data = await response.json();
  const trace: MPPExecutionTrace = data.trace;
  const updatedKey = data.updatedKey;
  const blockHeight = data.blockHeight || trace.blockNumber || 0;
  const txHash = trace.txHash && /^0x[a-fA-F0-9]{64}$/.test(trace.txHash) ? trace.txHash : null;
  const explorerUrl = txHash ? tempoTransactionUrl(txHash) : undefined;

  const normalizedStatus = normalizeSynapseStatus(trace);

  const result: SettlementResult = {
    status: normalizedStatus,
    trace,
    updatedKey,
    blockHeight,
    txHash,
    explorerUrl,
    costPathUsd: trace.costPathUsd ?? price,
    latencyMs: trace.latencyMs || latencyMs,
    nonce2D: trace.nonce2D,
  };

  // Broadcast event across windows and components so LivePaymentsFeed receives it instantly
  try {
    const liveEvent: LivePaymentEvent = {
      id: trace.id,
      agentName: trace.agentName,
      serviceName: req.serviceName || req.category || 'Synapse Machine Service',
      providerName: req.providerName || trace.targetEndpoint,
      serviceUrl: trace.targetEndpoint,
      amountUsd: trace.costPathUsd,
      latencyMs: result.latencyMs,
      timestamp: trace.timestamp || new Date().toISOString(),
      txHash: txHash || '',
      receiptVerified: trace.receiptVerified === true,
      explorerUrl,
      executionMode: trace.executionMode as LivePaymentEvent['executionMode'],
      paymentMode: evaluationOnly ? 'DEMO' : 'LIVE_TESTNET',
      status: trace.receiptVerified === true && trace.status === 'SETTLED'
        ? 'SETTLED'
        : (evaluationOnly ? 'SIMULATED_PASS' : 'PENDING'),
      blockNumber: blockHeight,
      merkleProof: trace.merkleProof,
      merkleRoot: trace.merkleRoot,
      tip20Memo: trace.tip20Memo,
      iso20022Remittance: trace.iso20022Remittance,
      nonce2D: trace.nonce2D,
      eip712Signature: trace.eip712Signature,
    };

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('synapse:settlement', { detail: liveEvent }));
      window.dispatchEvent(new CustomEvent('synapse:budget-update', {
        detail: {
          jobId,
          spentDelta: trace.costPathUsd,
          updatedKey,
        },
      }));
    }
  } catch (eventErr) {
    console.debug('[Synapse Payment Pipeline] Event dispatch ignored:', eventErr);
  }

  return result;
}
