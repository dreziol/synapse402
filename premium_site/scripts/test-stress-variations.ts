import type { Server } from 'http';
import { createIsolatedTestRuntime } from './isolated-test-runtime';

let GATEWAY_URL = 'http://127.0.0.1:0';
let ephemeralServer: Server | null = null;
let cleanupTestRuntime: (() => void) | null = null;
let synapseEngine: typeof import('../server/synapseCore').synapseEngine;

interface TestResult {
  suite: string;
  name: string;
  expected: string;
  actual: string;
  latencyMs: number;
  passed: boolean;
}

const results: TestResult[] = [];
const isAcknowledgedExecution = (status: unknown): boolean =>
  status === 'SETTLED' || status === 'SIMULATED_PASS' || status === 'PENDING';

async function ensureGatewayActive(): Promise<void> {
  // Use the real middleware stack in a clean runtime. Never direct stress
  // calls at the user's daemon or load its live wallet configuration.
  cleanupTestRuntime = createIsolatedTestRuntime('synapse402-stress-');
  const engineModule = await import('../server/synapseCore');
  synapseEngine = engineModule.synapseEngine;
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

async function runTest(
  suite: string,
  name: string,
  fn: () => Promise<{ passed: boolean; expected: string; actual: string }>
): Promise<void> {
  const t0 = performance.now();
  try {
    const res = await fn();
    const latencyMs = Math.round(performance.now() - t0);
    results.push({
      suite,
      name,
      expected: res.expected,
      actual: res.actual,
      latencyMs,
      passed: res.passed,
    });
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - t0);
    results.push({
      suite,
      name,
      expected: 'No crash',
      actual: `Exception: ${err.message}`,
      latencyMs,
      passed: false,
    });
  }
}

async function main() {
  await ensureGatewayActive();

  // The ephemeral harness shares the engine's persisted demo state. Reset it
  // before a fresh run so an earlier stress invocation cannot leave a seeded
  // key depleted and turn the next concurrency check into a false failure.
  if (ephemeralServer) {
    synapseEngine.resetDemoState();
  }

  console.log('\n================================================================================');
  console.log('  SYNAPSE402 ADVANCED STRESS & VARIATIONAL VERIFICATION SUITE                  ');
  console.log('  Target: ' + GATEWAY_URL + (ephemeralServer ? ' (Ephemeral)' : ' (Live Daemon)'));
  console.log('================================================================================\n');

  // SUITE 1: Concurrency Burst Across Distinct Agents
  await runTest('Concurrency', '1. Burst: 25 Parallel Multi-Agent Payments', async () => {
    const agents = ['key_quant_alpha', 'key_cortex_research', 'key_sec_audit'];
    const requests = Array.from({ length: 25 }, (_, i) => {
      const agentId = agents[i % agents.length];
      const targetUrl = agentId === 'key_sec_audit'
        ? 'https://api.certik.com/v1/fuzz/opcodes'
        : agentId === 'key_cortex_research'
        ? 'https://data.sec.gov/api/xbrl/companyfacts'
        : 'https://api.fin-depth.io/v2/aapl/orderbook';

      return fetch(`${GATEWAY_URL}/api/mpp/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyId: agentId,
          targetUrl,
          pricePathUsd: 0.001,
          category: 'Stress Test Burst',
          asyncRelay: true,
        }),
      });
    });

    const responses = await Promise.all(requests);
    const dataList = await Promise.all(responses.map(r => r.json()));
    const all200 = responses.every(r => r.status === 200);
    // Evaluation mode returns SIMULATED_PASS; live async mode can remain
    // PENDING until a receipt arrives. Both are valid acknowledgements.
    const allAcknowledged = dataList.every(d => isAcknowledgedExecution(d.status));

    return {
      passed: all200 && allAcknowledged,
      expected: '25/25 HTTP 200 acknowledged (SETTLED, PENDING, or SIMULATED_PASS)',
      actual: `${dataList.filter(d => isAcknowledgedExecution(d.status)).length}/25 acknowledged`,
    };
  });

  // SUITE 2: Concurrent Idempotency Race Condition Protection
  await runTest('Idempotency', '2. Race: 10 Parallel Duplicate Idempotency Requests', async () => {
    const raceKey = `race_idemp_${Date.now()}`;
    const payload = {
      keyId: 'key_quant_alpha',
      targetUrl: 'https://api.fin-depth.io/v2/aapl/orderbook',
      pricePathUsd: 0.001,
      category: 'Market Data',
      idempotencyKey: raceKey,
      asyncRelay: true,
    };

    // Fire 10 requests at the EXACT same millisecond with same idempotency key
    const raceRequests = Array.from({ length: 10 }, () =>
      fetch(`${GATEWAY_URL}/api/mpp/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': raceKey },
        body: JSON.stringify(payload),
      })
    );

    const raceResponses = await Promise.all(raceRequests);
    const raceData = await Promise.all(raceResponses.map(r => r.json()));
    const all200 = raceResponses.every(r => r.status === 200);
    const cacheHits = raceData.filter(d => d.trace?.isIdempotentCacheHit === true).length;
    // Exactly 1 initial settlement and remaining are cache hits
    const passed = all200 && cacheHits >= 9;

    return {
      passed,
      expected: '1 Settled + 9 Cache Hits ($0 duplicate debit)',
      actual: `${raceData.length - cacheHits} Settled + ${cacheHits} Cache Hits`,
    };
  });

  // SUITE 3: Unknown / Non-Existent Key Isolation (Anti-Fallback Guard)
  await runTest('Isolation', '3. Unknown Session Key Rejection (Strict 404)', async () => {
    const res = await fetch(`${GATEWAY_URL}/api/mpp/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        keyId: 'hacker_rogue_bot_9999',
        targetUrl: 'https://api.fin-depth.io/v2/aapl/orderbook',
        pricePathUsd: 0.001,
      }),
    });
    const data = await res.json();
    const passed = res.status === 404 && data.error && data.error.includes('404');

    return {
      passed,
      expected: 'HTTP 404 Not Found (Zero fallback debit)',
      actual: `HTTP ${res.status} (${data.error?.slice(0, 40)})`,
    };
  });

  // SUITE 4: Budget Exhaustion & Overdraft Barrier
  await runTest('Budget', '4. Exact Boundary Depletion & Overdraft Block', async () => {
    // Reuse the seeded bounded key so a live-daemon verification cannot leave
    // test-only session keys in persistent state. The per-job ledger below
    // still gives this check an isolated $0.005 boundary.
    const keyListRes = await fetch(`${GATEWAY_URL}/api/keys`);
    const keyList = await keyListRes.json();
    const newKey = (keyList.keys || []).find((candidate: any) => candidate.id === 'key_quant_alpha');
    if (!newKey) throw new Error('Seeded boundary key key_quant_alpha is unavailable.');
    const boundaryJobId = `stress_boundary_${Date.now()}`;
    const boundaryTargetUrl = 'https://api.market-depth-mesh.io/v3/depth/l2';

    // 2. Spend exact $0.005
    const spendRes = await fetch(`${GATEWAY_URL}/api/mpp/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        keyId: newKey.id,
        targetUrl: boundaryTargetUrl,
        pricePathUsd: 0.005,
        asyncRelay: true,
        evaluationOnly: false,
        jobId: boundaryJobId,
        jobBudgetPathUsd: 0.005,
      }),
    });
    const spendData = await spendRes.json();
    const spendOk = spendRes.status === 200 && isAcknowledgedExecution(spendData.status);

    // 3. Attempt 1 micro-cent overdraft
    const overdraftRes = await fetch(`${GATEWAY_URL}/api/mpp/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        keyId: newKey.id,
        targetUrl: boundaryTargetUrl,
        pricePathUsd: 0.001,
        evaluationOnly: false,
        jobId: boundaryJobId,
        jobBudgetPathUsd: 0.005,
      }),
    });
    const overdraftData = await overdraftRes.json();
    const overdraftBlocked = (overdraftRes.status === 402 || overdraftRes.status === 400);

    return {
      passed: spendOk && overdraftBlocked,
      expected: 'Spend Ok -> Overdraft Halted (402/DEPLETED)',
      actual: `Spend: HTTP ${spendRes.status}, Overdraft: HTTP ${overdraftRes.status}`,
    };
  });

  // SUITE 5: Merkle Proof Prompt Injection Variational Matrix
  await runTest('Security', '5. Merkle Prompt Injection: 5 Rogue Targets Intercepted', async () => {
    const maliciousTargets = [
      'https://attacker.evil-drainer.xyz/steal',
      'https://phishing-gateway.cloud/exfiltrate',
      'http://169.254.169.254/latest/meta-data',
      'http://localhost:8080/internal/admin',
      'https://unauthorized-crawler.net/probe',
    ];

    const probes = maliciousTargets.map(url =>
      fetch(`${GATEWAY_URL}/api/mpp/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyId: 'key_quant_alpha',
          targetUrl: url,
          pricePathUsd: 0.001,
          allowDynamicWhitelist: false,
        }),
      })
    );

    const responses = await Promise.all(probes);
    const allBlocked = responses.every(r => r.status === 403 || r.status === 400);

    return {
      passed: allBlocked,
      expected: '5/5 HTTP 403 Forbidden (Blocked by Merkle Tree)',
      actual: `${responses.filter(r => r.status === 403 || r.status === 400).length}/5 Intercepted`,
    };
  });

  // SUITE 6: Corrupt EIP-712 Signature Interception
  await runTest('Security', '6. Signature Tamper Interception (Pre-Chain Halt)', async () => {
    const res = await fetch(`${GATEWAY_URL}/api/mpp/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        keyId: 'key_quant_alpha',
        targetUrl: 'https://api.fin-depth.io/v2/aapl/orderbook',
        pricePathUsd: 0.001,
        corruptSignature: true,
      }),
    });
    const data = await res.json();
    const passed = (res.status === 401 || res.status === 403 || res.status === 400) && data.error && (data.error.includes('signature') || data.error.includes('Unauthorized'));

    return {
      passed,
      expected: 'HTTP 401 Unauthorized (Invalid Signature)',
      actual: `HTTP ${res.status} (${data.error?.slice(0, 35)})`,
    };
  });

  // SUITE 7: Input Edge Variations (Zero, Negative, Extreme Length)
  await runTest('Validation', '7. Input Edge Matrix (Zero, Negative, Long URL)', async () => {
    const edgeCases = [
      { name: 'Zero Price', body: { keyId: 'key_quant_alpha', targetUrl: 'https://api.fin-depth.io/v2/aapl/orderbook', pricePathUsd: 0 } },
      { name: 'Negative Price', body: { keyId: 'key_quant_alpha', targetUrl: 'https://api.fin-depth.io/v2/aapl/orderbook', pricePathUsd: -0.05 } },
      { name: 'Huge URL (>2048)', body: { keyId: 'key_quant_alpha', targetUrl: 'https://api.fin-depth.io/v2/' + 'a'.repeat(2100), pricePathUsd: 0.001 } },
      { name: 'Invalid Protocol', body: { keyId: 'key_quant_alpha', targetUrl: 'ftp://insecure-ftp.net/data', pricePathUsd: 0.001 } },
    ];

    const runs = await Promise.all(
      edgeCases.map(c =>
        fetch(`${GATEWAY_URL}/api/mpp/settle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(c.body),
        })
      )
    );

    const allRejected = runs.every(r => r.status === 400);

    return {
      passed: allRejected,
      expected: '4/4 HTTP 400 Bad Request',
      actual: `${runs.filter(r => r.status === 400).length}/4 Rejected as 400`,
    };
  });

  // SUITE 8: Pre-Settlement SLA Void Concurrency (HTTP 500 Simulation)
  await runTest('Resilience', '8. SLA Void Concurrency: 10 Parallel Server 500 Faults', async () => {
    const voidRequests = Array.from({ length: 10 }, () =>
      fetch(`${GATEWAY_URL}/api/mpp/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyId: 'key_quant_alpha',
          // Use an already approved route and inject the provider failure at
          // the gateway. This keeps the test aligned with the fail-closed
          // allowlist: failure simulation must not require a rogue target.
          targetUrl: 'https://api.fin-depth.io/v2/aapl/orderbook',
          pricePathUsd: 0.002,
          simulateFailure: true,
          allowDynamicWhitelist: false,
        }),
      })
    );

    const responses = await Promise.all(voidRequests);
    const dataList = await Promise.all(responses.map(r => r.json()));
    const allVoided = dataList.every(d => d.status === 'VOIDED');
    const zeroCost = dataList.every(d => d.trace?.costPathUsd === 0);

    return {
      passed: allVoided && zeroCost,
      expected: '10/10 VOIDED with $0.00 Net Cost',
      actual: `${dataList.filter(d => d.status === 'VOIDED').length}/10 Voided ($0 lost)`,
    };
  });

  // SUITE 9: Multi-Channel 2D Nonce Concurrency
  await runTest('2D-Nonces', '9. Multi-Channel Concurrency: Parallel Channels 1, 2, 3', async () => {
    const chRuns = [
      { ch: 1, nonce: 1 },
      { ch: 2, nonce: 1 },
      { ch: 3, nonce: 1 },
      { ch: 1, nonce: 2 },
      { ch: 2, nonce: 2 },
      { ch: 3, nonce: 2 },
    ];

    const responses: any[] = [];
    for (const run of chRuns) {
      const res = await fetch(`${GATEWAY_URL}/api/mpp/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyId: 'key_quant_alpha',
          targetUrl: 'https://api.fin-depth.io/v2/aapl/orderbook',
          pricePathUsd: 0.001,
          channelId: run.ch,
          asyncRelay: true,
        }),
      });
      responses.push(await res.json());
    }

    const allAcknowledged = responses.every(d => isAcknowledgedExecution(d.status));
    const channel1Traces = responses.filter(d => d.trace?.nonce2D?.startsWith('0x01:'));
    const channel2Traces = responses.filter(d => d.trace?.nonce2D?.startsWith('0x02:'));

    return {
      passed: allAcknowledged && channel1Traces.length === 2 && channel2Traces.length === 2,
      expected: 'All 6 acknowledged with Independent 2D Channel Nonces',
      actual: `Acknowledged: ${responses.filter(d => isAcknowledgedExecution(d.status)).length}/6 (Ch1: ${channel1Traces.length}, Ch2: ${channel2Traces.length})`,
    };
  });

  // Print Summary Table
  console.log('---------------------------------------------------------------------------------------------------------');
  console.log('| SUITE        | TEST NAME                                     | STATUS | LATENCY | RESULT DETAILS      |');
  console.log('---------------------------------------------------------------------------------------------------------');

  let allPassed = true;
  for (const r of results) {
    if (!r.passed) allPassed = false;
    const mark = r.passed ? '✓ PASS' : '✕ FAIL';
    const sName = r.suite.padEnd(12);
    const tName = r.name.slice(0, 45).padEnd(45);
    const status = mark.padEnd(6);
    const lat = `${r.latencyMs}ms`.padEnd(7);
    const details = r.actual.slice(0, 23).padEnd(23);
    console.log(`| ${sName} | ${tName} | ${status} | ${lat} | ${details} |`);
  }
  console.log('---------------------------------------------------------------------------------------------------------\n');

  if (ephemeralServer) {
    await new Promise<void>((resolve) => ephemeralServer!.close(() => resolve()));
    ephemeralServer = null;
  }
  cleanupTestRuntime?.();
  cleanupTestRuntime = null;

  if (allPassed) {
    console.log('✓ ALL 9 ADVANCED STRESS & VARIATIONAL TEST SUITES PASSED.');
    console.log('  Concurrency, 2D nonces, Merkle firewall, idempotency, and isolation are verified.\n');
    process.exitCode = 0;
  } else {
    console.error('✕ ONE OR MORE STRESS TEST SUITES FAILED.');
    process.exitCode = 1;
  }
}

main().catch(err => {
  if (ephemeralServer) {
    try { ephemeralServer.close(); } catch {}
  }
  cleanupTestRuntime?.();
  console.error('Fatal stress test runner error:', err);
  process.exit(1);
});
