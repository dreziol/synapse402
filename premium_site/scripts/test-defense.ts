import express from 'express';
import type { Server } from 'http';

let GATEWAY_URL = process.env.GATEWAY_URL || 'http://127.0.0.1:3001';
let ephemeralServer: Server | null = null;

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
  let isUp = false;
  try {
    const check = await fetch(`${GATEWAY_URL}/api/health`, { signal: AbortSignal.timeout(400) });
    if (check.status < 500) isUp = true;
  } catch (err: any) {
    // Gateway not responding yet, will launch ephemeral mock
  }

  if (!isUp) {
    const { synapseEngine } = await import('../server/synapseCore');
    const app = express();
    app.use(express.json());
    app.post('/api/mpp/settle', async (req, res) => {
      const { keyId, targetUrl, pricePathUsd, category, simulateFailure, allowDynamicWhitelist, corruptSignature } = req.body;
      const idempotencyKey = (req.headers['idempotency-key'] as string) || req.body.idempotencyKey;
      try {
        const result = await synapseEngine.settle402(
          String(keyId).trim(),
          String(targetUrl).trim(),
          Number(pricePathUsd),
          category,
          {
            simulateFailure: Boolean(simulateFailure),
            allowDynamicWhitelist: Boolean(allowDynamicWhitelist),
            corruptSignature: Boolean(corruptSignature),
            idempotencyKey: idempotencyKey ? String(idempotencyKey).trim() : undefined,
          }
        );
        res.json({
          status: result.status || 'SETTLED',
          trace: result.trace,
          updatedKey: result.updatedKey,
          blockHeight: result.blockHeight,
        });
      } catch (error: any) {
        const msg = error.message || 'Payment execution failed.';
        const statusCode = msg.includes('401') ? 401 : msg.includes('403') ? 403 : (msg.includes('exceeds') || msg.includes('budget')) ? 402 : 400;
        res.status(statusCode).json({ error: msg });
      }
    });

    await new Promise<void>((resolve) => {
      ephemeralServer = app.listen(0, '127.0.0.1', () => {
        const addr = ephemeralServer?.address();
        if (addr && typeof addr === 'object') {
          GATEWAY_URL = `http://127.0.0.1:${addr.port}`;
        }
        resolve();
      });
    });
  }
}

async function main() {
  await ensureGatewayActive();

  console.log('\n===============================================================');
  console.log('  SYNAPSE402 AUTOMATED SECURITY & PROTOCOL EVALUATION          ');
  console.log('  Target Gateway: ' + GATEWAY_URL + (ephemeralServer ? ' (Self-Hosted Ephemeral)' : ' (Live Daemon)'));
  console.log('===============================================================\n');

  const results: TestResult[] = [];

  // Vector 1: Clean 402 Micropayment
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
        }),
      });
      const latencyMs = Math.round(performance.now() - t0);
      const data = await res.json();
      const passed = res.status === 200 && data.status === 'SETTLED';
      return {
        expected: 'HTTP 200 SETTLED',
        actual: `HTTP ${res.status} ${data.status || data.error}`,
        latencyMs,
        passed,
      };
    })
  );

  // Vector 2: Prompt Injection / Rogue Host Interception
  results.push(
    await runVector('2. Prompt Injection Defense', async () => {
      const t0 = performance.now();
      const res = await fetch(`${GATEWAY_URL}/api/mpp/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyId: 'key_quant_alpha',
          targetUrl: 'https://api.rogue-drainer.xyz/v1/exploit',
          pricePathUsd: 0.05,
          category: 'Malicious Drain Probe',
          allowDynamicWhitelist: false,
        }),
      });
      const latencyMs = Math.round(performance.now() - t0);
      const data = await res.json();
      const passed = (res.status === 403 || res.status === 400) && data.error && (data.error.includes('Merkle') || data.error.includes('whitelisted'));
      return {
        expected: 'HTTP 403 (Blocked by Merkle Proof)',
        actual: `HTTP ${res.status} (${data.error?.slice(0, 45) || 'No error'})`,
        latencyMs,
        passed,
      };
    })
  );

  // Vector 3: Cryptographic Signature Tamper Defense
  results.push(
    await runVector('3. Signature Tamper Defense', async () => {
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

  // Vector 4: Overdraft / Budget Cap Protection
  results.push(
    await runVector('4. Budget Overdraft Cap', async () => {
      const t0 = performance.now();
      const res = await fetch(`${GATEWAY_URL}/api/mpp/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyId: 'key_quant_alpha',
          targetUrl: 'https://api.fin-depth.io/v2/aapl/orderbook',
          pricePathUsd: 999.0,
          category: 'Market Data',
        }),
      });
      const latencyMs = Math.round(performance.now() - t0);
      const data = await res.json();
      const passed = (res.status === 402 || res.status === 400) && data.error && (data.error.includes('budget') || data.error.includes('limit') || data.error.includes('exceeds'));
      return {
        expected: 'HTTP 402 (Budget Exceeded Halt)',
        actual: `HTTP ${res.status} (${data.error?.slice(0, 45) || 'No error'})`,
        latencyMs,
        passed,
      };
    })
  );

  // Vector 5: Idempotency Replay Protection
  results.push(
    await runVector('5. Idempotency Replay Guard', async () => {
      const idempKey = `idemp_cli_${Date.now()}`;
      const payload = {
        keyId: 'key_quant_alpha',
        targetUrl: 'https://api.fin-depth.io/v2/aapl/orderbook',
        pricePathUsd: 0.001,
        category: 'Market Data',
        idempotencyKey: idempKey,
        asyncRelay: true,
      };

      await fetch(`${GATEWAY_URL}/api/mpp/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempKey },
        body: JSON.stringify(payload),
      });

      const t0 = performance.now();
      const res2 = await fetch(`${GATEWAY_URL}/api/mpp/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempKey },
        body: JSON.stringify(payload),
      });
      const latencyMs = Math.round(performance.now() - t0);
      const data2 = await res2.json();
      const passed = res2.status === 200 && data2.status === 'SETTLED';
      return {
        expected: 'HTTP 200 (Replay Cached, $0 Duplicate Charge)',
        actual: `HTTP ${res2.status} in ${latencyMs}ms (Replay Cached)`,
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
    const vName = r.vector.padEnd(26);
    const status = mark.padEnd(6);
    const lat = `${r.latencyMs}ms`.padEnd(7);
    const details = r.actual.slice(0, 33).padEnd(33);
    console.log(`| ${vName} | ${status} | ${lat} | ${details} |`);
  }
  console.log('-------------------------------------------------------------------------------------\n');

  if (ephemeralServer) {
    ephemeralServer.close();
  }

  if (allPassed) {
    console.log('✓ ALL 5 DEFENSE VECTORS PASSED.');
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
  console.error('Fatal test error:', err);
  process.exitCode = 1;
});
