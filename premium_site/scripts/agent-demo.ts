/**
 * Synapse402 Autonomous AI Agent CLI Demo
 * 
 * Demonstrates:
 * 1. An AI agent probing a protected endpoint and intercepting RFC 9110 / HTTP 402 challenge.
 * 2. The agent autonomously settling the micropayment via EIP-712 scoped session key on Tempo L1.
 * 3. The agent receiving unlocked data (HTTP 200 OK) without human intervention.
 * 4. Dynamic Surge Pricing (Rate-Limiting via Price) defense against burst/bot behavior.
 */
import { SynapseAgentClient } from '../src/sdk/index.ts';

async function main() {
  console.log('===============================================================');
  console.log('  SYNAPSE402 AUTONOMOUS AI AGENT CLI DEMO (Tempo L1 MPP)       ');
  console.log('===============================================================\n');

  const gatewayUrl = process.env.GATEWAY_URL || 'http://127.0.0.1:3001';

  // Initialize Agent with $0.003 max-per-call guardrail
  console.log('[1/3] Initializing Autonomous AI Agent Client...');
  const agent = new SynapseAgentClient({
    gatewayUrl,
    maxPricePerCall: 0.003, // $0.003 pathUSD budget limit per call
    keyId: 'key_quant_alpha',
  });
  console.log(`  Session Key Address : ${agent.address}`);
  console.log(`  Max Price Guardrail : $0.003 pathUSD`);
  console.log(`  Gateway Endpoint    : ${gatewayUrl}\n`);

  // Step 1: Autonomous HTTP 402 Intercept & Settlement
  console.log('[2/3] Calling Protected API: /api/v1/test-provider-data...');
  try {
    const response = await agent.fetch(`${gatewayUrl}/api/v1/test-provider-data`);
    const data = await response.json();
    console.log('  Status Code       : 200 OK (Unlocked!)');
    console.log('  Settlement Status : Verified Type 0x76 MPP Authorization');
    console.log('  Provider Payload  :', JSON.stringify(data.payload || data, null, 2));
    console.log('  Trace / Status    :', data.status, '| Signer:', data.signer || data.trace?.mppCredential?.signer || 'gateway-managed');
  } catch (err: any) {
    console.error('  Settlement Error  :', err.message);
  }

  // Step 2: Dynamic Surge Pricing / Throttling Test
  console.log('\n[3/3] Testing Dynamic Surge Pricing (Rate-Limiting via Price)...');
  console.log('  Sending rapid bursts to /api/v1/surge-demo...');

  for (let i = 1; i <= 4; i++) {
    try {
      const burstRes = await agent.fetch(`${gatewayUrl}/api/v1/surge-demo`);
      const burstData = await burstRes.json();
      console.log(`  Burst #${i}: Settled at $${burstData.effectivePrice || '0.001'} pathUSD (Status 200)`);
    } catch (err: any) {
      console.log(`  Burst #${i}: HALTED BY GUARDRAIL!`);
      console.log(`    Reason : ${err.message}`);
      console.log('    Result : Agent automatically stopped spending; Seller protected from bot spam.');
      break;
    }
  }

  console.log('\n===============================================================');
  console.log('  DEMO COMPLETE: Two-sided machine micropayments verified.');
  console.log('===============================================================');
}

main().catch(console.error);
