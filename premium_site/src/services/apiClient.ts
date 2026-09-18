import { ScopedSessionKey, PaywalledEndpoint, MPPExecutionTrace, VaultMetrics } from '../types/synapse';

export async function fetchVaultMetrics(): Promise<VaultMetrics> {
  const res = await fetch('/api/vault/metrics');
  if (!res.ok) throw new Error('Failed to fetch vault metrics');
  return res.json();
}

export async function fetchScopedKeys(): Promise<ScopedSessionKey[]> {
  const res = await fetch('/api/keys');
  if (!res.ok) throw new Error('Failed to fetch scoped keys');
  const data = await res.json();
  return data.keys;
}

export async function createScopedKey(payload: {
  agentName: string;
  role: string;
  maxPerCallPathUsd: number;
  totalBudgetPathUsd: number;
  whitelistedDomains: string[];
}): Promise<ScopedSessionKey> {
  const res = await fetch('/api/keys', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to issue key');
  }
  const data = await res.json();
  return data.key;
}

export async function toggleKeyStatusOnServer(keyId: string): Promise<ScopedSessionKey> {
  const res = await fetch(`/api/keys/${keyId}/toggle`, { method: 'PATCH' });
  if (!res.ok) throw new Error('Failed to toggle key status');
  const data = await res.json();
  return data.key;
}

export async function fetchTraces(): Promise<MPPExecutionTrace[]> {
  const res = await fetch('/api/mpp/traces');
  if (!res.ok) throw new Error('Failed to fetch traces');
  const data = await res.json();
  return data.traces;
}

export async function settlePaymentOnServer(
  keyId: string,
  targetUrl: string,
  pricePathUsd: number,
  category: string
): Promise<{ trace: MPPExecutionTrace; updatedKey: ScopedSessionKey; blockHeight: number }> {
  const res = await fetch('/api/mpp/settle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keyId, targetUrl, pricePathUsd, category }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Settlement failed');
  }

  return res.json();
}
