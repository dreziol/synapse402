import type { Server } from 'http';
import { createIsolatedTestRuntime } from './isolated-test-runtime';

let GATEWAY_URL = 'http://127.0.0.1:0';
let ephemeralServer: Server | null = null;
let cleanupTestRuntime: (() => void) | null = null;

interface TestResult {
  vector: string;
  expected: string;
  actual: string;
  latencyMs: number;
  passed: boolean;
}

async function runVector(
  name: string,
  fn: () => Promise<{ passed: boolean; actual: string; latencyMs: number; expected: string }>
): Promise<TestResult> {
  const t0 = performance.now();
  try {
    const res = await fn();
    return {
      vector: name,
      expected: res.expected,
      actual: res.actual,
      latencyMs: res.latencyMs || Math.round(performance.now() - t0),
      passed: res.passed,
    };
  } catch (err: any) {
    return {
      vector: name,
      expected: 'Handled without crash',
      actual: `Exception: ${err.message}`,
      latencyMs: Math.round(performance.now() - t0),
      passed: false,
    };
  }
}

async function ensureGatewayActive(): Promise<void> {
  // Always use a clean temporary runtime and the real app. Never send the
  // evaluation suite to the user's daemon or load its wallet configuration.
  cleanupTestRuntime = createIsolatedTestRuntime('synapse402-defense-');
  const { app } = await import('../server');

  await new Promise<void>((resolve) => {
    ephemeralServer = app.listen(0, '127.0.0.1', () => {
      const addr = ephemeralServer?.address();
      if (addr && typeof addr === 'object') {
        GATEWAY_URL = `http://127.0.0.1:${addr.port}`;
        process.env.PORT = String(addr.port);
      }
      resolve();
    });
  });
}

async function main() {
  await ensureGatewayActive();

  console.log('\n===============================================================');
  console.log('  SYNAPSE402 AUTOMATED SECURITY & PROTOCOL EVALUATION          ');
  console.log('  Target Gateway: ' + GATEWAY_URL + (ephemeralServer ? ' (Self-Hosted Ephemeral)' : ' (Live Daemon)'));
  console.log('===============================================================\n');

  const results: TestResult[] = [];

  // Vector 1: Clean 402 Micropayment (Happy Path)
  results.push(
    await runVector('1. Clean Micropayment', async () => {
      const t0 = performance.now();
      const res = await fetch(`${GATEWAY_URL}/api/mpp/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyId: 'key_quant_alpha',
          targetUrl: 'https://api.fin-depth.io/v2/aapl/orderbook',
          pricePathUsd: 0.001,
          category: 'Market Data',
          asyncRelay: true,
          evaluationOnly: true,
          jobId: `clean_test_${Date.now()}`,
          jobBudgetPathUsd: 0.005,
        }),
      });
      const latencyMs = Math.round(performance.now() - t0);
      const data = await res.json();
      const passed = res.status === 200 && (data.status === 'SIMULATED_PASS' || data.status === 'SETTLED') && !data.trace?.txHash;
      return {
        expected: 'HTTP 200 SIMULATED_PASS (Valid Evaluation Receipt)',
        actual: `HTTP ${res.status} ${data.status || data.error}`,
        latencyMs,
        passed,
      };
    })
  );

  // Vector 2: Over Budget (Exceeds Job Maximum, Halted Off-Chain)
  results.push(
    await runVector('2. Over Budget Protection', async () => {
      const t0 = performance.now();
      const res = await fetch(`${GATEWAY_URL}/api/mpp/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyId: 'key_quant_alpha',
          targetUrl: 'https://api.fin-depth.io/v2/aapl/orderbook',
          pricePathUsd: 0.006,
          category: 'Market Data',
          evaluationOnly: true,
          jobId: `overbudget_test_${Date.now()}`,
          jobBudgetPathUsd: 0.005,
        }),
      });
      const latencyMs = Math.round(performance.now() - t0);
      const data = await res.json();
      const passed = (res.status === 402 || res.status === 400) && data.error && (data.error.includes('limit') || data.error.includes('budget') || data.error.includes('exceeds'));
      return {
        expected: 'HTTP 402 (Job Limit Exceeded Halt)',
        actual: `HTTP ${res.status} (${data.error?.slice(0, 45) || 'No error'})`,
        latencyMs,
        passed,
      };
    })
  );

  // Vector 3: Non-Whitelisted Provider (Merkle / Policy Reject)
  results.push(
    await runVector('3. Unapproved Provider Defense', async () => {
      const t0 = performance.now();
      const res = await fetch(`${GATEWAY_URL}/api/mpp/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyId: 'key_quant_alpha',
          targetUrl: 'https://api.rogue-drainer.xyz/v1/exploit',
          pricePathUsd: 0.001,
          category: 'Malicious Drain Probe',
          allowDynamicWhitelist: false,
          evaluationOnly: true,
        }),
      });
      const latencyMs = Math.round(performance.now() - t0);
      const data = await res.json();
      const passed = (res.status === 403 || res.status === 400) && data.error && (data.error.includes('whitelist') || data.error.includes('Merkle') || data.error.includes('approved'));
      return {
        expected: 'HTTP 403 (Blocked by Allowlist Merkle Proof)',
        actual: `HTTP ${res.status} (${data.error?.slice(0, 45) || 'No error'})`,
        latencyMs,
        passed,
      };
    })
  );

  // Vector 4: Cryptographic Signature Tamper Defense
  results.push(
    await runVector('4. Signature Tamper Defense', async () => {
      const t0 = performance.now();
      const res = await fetch(`${GATEWAY_URL}/api/mpp/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyId: 'key_quant_alpha',
          targetUrl: 'https://api.fin-depth.io/v2/aapl/orderbook',
          pricePathUsd: 0.001,
          category: 'Market Data',
          corruptSignature: true,
          evaluationOnly: true,
        }),
      });
      const latencyMs = Math.round(performance.now() - t0);
      const data = await res.json();
      const passed = (res.status === 401 || res.status === 403 || res.status === 400) && data.error && (data.error.includes('Signature') || data.error.includes('signature') || data.error.includes('Unauthorized'));
      return {
        expected: 'HTTP 401 (Invalid EIP-712 Signature)',
        actual: `HTTP ${res.status} (${data.error?.slice(0, 45) || 'No error'})`,
        latencyMs,
        passed,
      };
    })
  );

  // Vector 5: Provider Failure (Pre-settlement Voided, $0 Lost)
  results.push(
    await runVector('5. Provider Failure Voided', async () => {
      const t0 = performance.now();
      const res = await fetch(`${GATEWAY_URL}/api/mpp/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyId: 'key_quant_alpha',
          targetUrl: 'https://api.fin-depth.io/v2/aapl/orderbook',
          pricePathUsd: 0.001,
          category: 'Market Data',
          simulateFailure: true,
          evaluationOnly: true,
          jobId: `provider_fail_job_${Date.now()}`,
          jobBudgetPathUsd: 0.005,
        }),
      });
      const latencyMs = Math.round(performance.now() - t0);
      const data = await res.json();
      const passed = res.status === 200 && data.status === 'VOIDED' && data.trace?.status === 'VOIDED' && (data.trace?.cost === 0 || data.trace?.costPathUsd === 0);
      return {
        expected: 'HTTP 200 VOIDED (Pre-settlement Void, $0 Charged)',
        actual: `HTTP ${res.status} status=${data.status} cost=$${data.trace?.cost ?? data.trace?.costPathUsd ?? '?'}`.slice(0, 45),
        latencyMs,
        passed,
      };
    })
  );

  // Vector 6: Idempotency Replay Guard (0 Duplicate Charge, Replay Cached)
  results.push(
    await runVector('6. Idempotency Replay Guard', async () => {
      const idempKey = `idemp_cli_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const jobId = `idemp_job_${Date.now()}`;
      const payload = {
        keyId: 'key_quant_alpha',
        targetUrl: 'https://api.fin-depth.io/v2/aapl/orderbook',
        pricePathUsd: 0.001,
        category: 'Market Data',
        idempotencyKey: idempKey,
        jobId,
        jobBudgetPathUsd: 0.005,
        asyncRelay: true,
        evaluationOnly: true,
      };

      const res1 = await fetch(`${GATEWAY_URL}/api/mpp/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempKey },
        body: JSON.stringify(payload),
      });
      const data1 = await res1.json();

      const t0 = performance.now();
      const res2 = await fetch(`${GATEWAY_URL}/api/mpp/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempKey },
        body: JSON.stringify(payload),
      });
      const latencyMs = Math.round(performance.now() - t0);
      const data2 = await res2.json();

      const sameTraceId = Boolean(data1.trace?.id && data2.trace?.id && data1.trace.id === data2.trace.id);
      const isCacheHit = Boolean(data2.trace?.isIdempotentCacheHit);
      const passed = res2.status === 200 && (data2.status === 'SIMULATED_PASS' || data2.status === 'SETTLED') && sameTraceId && isCacheHit;
      return {
        expected: 'HTTP 200 (Replay Cached, Same Trace, $0 Duplicate Charge)',
        actual: `HTTP ${res2.status} in ${latencyMs}ms (Replay Cached, trace match: ${sameTraceId})`,
        latencyMs,
        passed,
      };
    })
  );

  // Vector 7: Explicit Prepare Key Binding (Unknown key must not fall back)
  results.push(
    await runVector('7. Prepare Key Binding', async () => {
      const t0 = performance.now();
      const res = await fetch(`${GATEWAY_URL}/api/mpp/prepare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyId: `missing_key_${Date.now()}`,
          targetUrl: 'https://api.fin-depth.io/v2/aapl/orderbook',
          pricePathUsd: 0.001,
        }),
      });
      const latencyMs = Math.round(performance.now() - t0);
      const data = await res.json();
      const passed = res.status === 400
        && typeof data.error === 'string'
        && data.error.includes('does not exist');
      return {
        expected: 'HTTP 400 (Unknown explicit key rejected; no fallback)',
        actual: `HTTP ${res.status} (${data.error?.slice(0, 45) || 'No error'})`,
        latencyMs,
        passed,
      };
    })
  );

  // Vector 8: Crawler User-Agent Cannot Bypass a Paid Route
  results.push(
    await runVector('8. Crawler Paywall Guard', async () => {
      const t0 = performance.now();
      const res = await fetch(`${GATEWAY_URL}/api/v1/data/stock-orderbook`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
      });
      const latencyMs = Math.round(performance.now() - t0);
      const data = await res.json();
      const passed = res.status === 402 && data.status === 402;
      return {
        expected: 'HTTP 402 (Crawler-looking User-Agent still needs payment)',
        actual: `HTTP ${res.status} (${data.error || data.status || 'No challenge'})`,
        latencyMs,
        passed,
      };
    })
  );

  console.log('-------------------------------------------------------------------------------------');
  console.log('| VECTOR                     | STATUS | LATENCY | RESULT DETAILS                    |');
  console.log('-------------------------------------------------------------------------------------');

  let allPassed = true;
  for (const r of results) {
    if (!r.passed) allPassed = false;
    const mark = r.passed ? '✓ PASS' : '✕ FAIL';
    const vName = r.vector.padEnd(28);
    const status = mark.padEnd(6);
    const lat = `${r.latencyMs}ms`.padEnd(7);
    const details = r.actual.slice(0, 33).padEnd(33);
    console.log(`| ${vName} | ${status} | ${lat} | ${details} |`);
  }
  console.log('-------------------------------------------------------------------------------------\n');

  if (ephemeralServer) {
    await new Promise<void>((resolve) => ephemeralServer!.close(() => resolve()));
    ephemeralServer = null;
  }
  cleanupTestRuntime?.();
  cleanupTestRuntime = null;

  if (allPassed) {
    console.log(`✓ ALL ${results.length} DEFENSE VECTORS PASSED.`);
    console.log('  Cryptographic integrity, budget caps, and replay filtering are fully operational.\n');
    process.exitCode = 0;
  } else {
    console.error('✕ ONE OR MORE VECTORS FAILED.');
    process.exitCode = 1;
  }
}

main().catch((err) => {
  if (ephemeralServer) {
    try { ephemeralServer.close(); } catch (closeErr: any) {
      console.debug('Ephemeral server close notice:', closeErr?.message);
    }
  }
  cleanupTestRuntime?.();
  console.error('Fatal test error:', err);
  process.exitCode = 1;
  process.exit(1);
});
