#!/usr/bin/env node
/**
 * Synapse402 - Autonomous Agent CLI Runner
 * 
 * Run locally:
 *   node scripts/agent-runner.mjs
 * 
 * Demonstrates an autonomous AI agent encountering HTTP 402,
 * verifying Merkle policy, signing EIP-712 MPP auth, and settling on Tempo L1.
 */

import { tempoTransactionUrl } from '../src/config/tempoExplorer.mjs';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:3001';

async function runAutonomousAgent() {
  console.log('===========================================================');
  console.log('🤖 SYNAPSE402 AUTONOMOUS AGENT RUNNER (TEMPO L1 MPP)');
  console.log('   Network: Tempo Moderato Testnet (Chain ID: 42431)');
  console.log('   RPC:     https://rpc.moderato.tempo.xyz');
  console.log('   Gateway: ' + GATEWAY_URL);
  console.log('===========================================================\n');

  try {
    // 1. Fetch available active session keys
    console.log('1. Checking Agent Delegated Session Key...');
    const keysRes = await fetch(`${GATEWAY_URL}/api/keys`);
    const { keys } = await keysRes.json();
    const activeKey = keys.find(k => k.status === 'ACTIVE') || keys[0];

    if (!activeKey) {
      console.error('❌ No active session key found.');
      process.exit(1);
    }

    console.log(`   [✓] Agent: ${activeKey.agentName} (${activeKey.agentId})`);
    console.log(`   [✓] Session Public Key: ${activeKey.sessionPublicKey}`);
    console.log(`   [✓] Remaining Budget: $${(activeKey.totalBudgetPathUsd - activeKey.currentSpentPathUsd).toFixed(4)} pathUSD`);
    console.log(`   [✓] Whitelisted Merkle Root: ${activeKey.merkleRoot}\n`);

    // 2. Simulate autonomous task needing paywalled data
    const targetUrl = activeKey.whitelistedDomains[0] || 'http://127.0.0.1:3001/api/v1/data/stock-orderbook';
    const costUsd = 0.001;

    console.log(`2. Querying paywalled endpoint: ${targetUrl}`);
    console.log(`   Simulating Autonomous HTTP 402 Challenge Interception...`);

    const start = performance.now();
    const settleRes = await fetch(`${GATEWAY_URL}/api/mpp/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        keyId: activeKey.id,
        targetUrl,
        pricePathUsd: costUsd,
        category: 'Market Depth'
      })
    });

    const elapsed = Math.round(performance.now() - start);
    const data = await settleRes.json();

    if (!settleRes.ok) {
      console.error('❌ Payment Rejected:', data.error);
      process.exit(1);
    }

    const isLive = data.trace.executionMode === 'LIVE_TESTNET';
    console.log(`\n🎉 \x1b[32m[HTTP 200 OK] 402 Paywall Solved in ${elapsed}ms!\x1b[0m`);
    console.log('-----------------------------------------------------------');
    console.log(`   Execution Mode:    \x1b[1m\x1b[36m${data.trace.executionMode}\x1b[0m ${isLive ? '🟢 (Confirmed On-Chain)' : '🟡 (Sandbox)'}`);
    console.log(`   Tempo Tx Hash:     \x1b[33m${data.trace.txHash}\x1b[0m`);
    console.log(`   Tempo L1 Block:    #${data.blockHeight} (Moderato Testnet Chain ID: 42431)`);
    console.log(`   Tx Type:           Tempo Native ${data.trace.tempoTxType} (Sub-second Simplex Finality)`);
    console.log(`   Settled Amount:    $${data.trace.costPathUsd} pathUSD`);
    console.log(`   Protocol Fee:      $${(Number(data.trace.costPathUsd || 0.001) * 0.001).toFixed(6)} pathUSD (0.1% Route Fee)`);
    console.log(`   Net to Seller:     $${(Number(data.trace.costPathUsd || 0.001) * 0.999).toFixed(6)} pathUSD (99.9% Net Payout)`);
    console.log(`   2D Nonce Index:    ${data.trace.nonce2D}`);
    console.log(`   EIP-712 Sig:       ${data.trace.eip712Signature.slice(0, 32)}...`);
    console.log(`   TIP-20 Memo:       ${data.trace.tip20Memo} (ISO 20022 pacs.008)`);
    console.log(`   Sanctions Screen:  ${data.trace.sanctionsCompliance?.policy || 'Not run in this demo'}`);
    console.log(`   Merkle Root:       ${data.trace.merkleRoot ? data.trace.merkleRoot.slice(0, 22) + '...' : 'Wildcard Whitelist'}`);
    const explorerLink = isLive && /^0x[a-fA-F0-9]{64}$/.test(String(data.trace.txHash || ''))
      ? tempoTransactionUrl(data.trace.txHash)
      : 'No chain receipt (evaluation run)';
    console.log(`   Explorer Link:     \x1b[4m${explorerLink}\x1b[0m`);
    console.log('-----------------------------------------------------------');
    console.log('✅ \x1b[32mDeliverable unlocked successfully for Autonomous AI Agent!\x1b[0m\n');

  } catch (err) {
    console.error('❌ Network error contacting Synapse402 gateway:', err.message);
  }
}

runAutonomousAgent();
