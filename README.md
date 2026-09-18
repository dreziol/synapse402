# Synapse402 — Budget-Controlled Micropayments for AI Agents on Tempo L1

> **Autonomous AI agents purchase APIs and web data on-demand with strict daily spending limits and sub-cent payments.**  
> Built for the **Colosseum Crypto World's Fair** (Tempo L1 Track).  
> Standards: **HTTP 402 + Tempo Native Micropayments (Type 0x76) + EIP-712 Scoped Session Keys**.

[![Solidity Test Suite](https://img.shields.io/badge/Hardhat%20Tests-13%2F13%20Passing-brightgreen)](contracts/test/SynapseVault.test.ts)
[![Security Defense Vectors](https://img.shields.io/badge/Defense%20Vectors-5%2F5%20Passing-brightgreen)](premium_site/scripts/test-defense.ts)
[![Tempo L1](https://img.shields.io/badge/Network-Tempo%20Moderato%20(42431)-blue)](https://explore.tempo.xyz)
[![Payment Speed](https://img.shields.io/badge/Payment%20Speed-%3C15ms%20local%20%7C%20~135ms%20on--chain-orange)](#)
[![Budget Safety](https://img.shields.io/badge/Budget%20Protection-Pre-settlement%20void-brightgreen)](#)
[![Fee Policy](https://img.shields.io/badge/Fee%20Policy-0.1%25%20Route%20Fee-green)](#)

---

## ⚡ 1-Line CLI Verification

Run the entire verification suite (Solidity smart contracts + Defense Gateway vectors) directly from the repository root:
```bash
npm test
```
Or verify the 5 security and payment defense vectors against the live Tempo L1 gateway:
```bash
npm run test:defense
```

---

## 🚀 Platform Capabilities and Proof Modes

| System Capability | Architecture / Standard | Realized Performance |
|:---|:---|:---|
| **1-Click Interactive Demo** | 6 Production Payment Scenarios | Instant testing of happy path, over-budget caps, Merkle allowlists, signature tampering, provider 500 failure, and idempotency replay. |
| **AI Workforce** | 20 Participants (1 Lead Agent · 12 Workers · 7 Providers) | The evaluation flow splits one job into approved work steps and keeps the plan under a hard cap. A connected wallet is required before any step becomes a confirmed Tempo receipt. |
| **2-Line Publisher SDK** | Express / Node Middleware (`withTempoMpp`) | Websites turn bot scraping into 0.1¢ revenue instead of paying WAFs to return 403 Forbidden. Googlebot passes free. |
| **2-Line Agent Client SDK** | Lightweight Wrapper (`createSynapseAgent`) | Intercepts HTTP 402, signs via delegated EIP-712 session key, and settles on Tempo L1 in <15ms without human checkout. |
| **Dynamic Surge Defense** | Anti-DDoS Pricing Middleware | Autonomous 2.5x–6.3x price scaling during scraper floods, protecting servers while maximizing publisher profit. |
| **Reality Check (403 vs 200)** | Side-by-Side WAF Verification | Live head-to-head proof: Free scraping hits **403 Forbidden** (0 bytes data), while Synapse402 settles in 14ms (**200 OK**). |
| **Zero-Loss Escrow Path** | Pre-Settlement Escrow Void | If the upstream returns HTTP 500 before settlement, the gateway voids the payment before debit; the failure path is covered by the automated tests. |
| **Sub-Cent Micropayments** | Tempo L1 Type 0x76 Native MPP | The UI shows the planned sub-cent step; a connected wallet and reachable Tempo testnet are required for a confirmed receipt and measured latency. |
| **Defense Evaluation** | Merkle Allowlist + EIP-712 + 2D Nonce | 5/5 automated attack defense vectors verified passing (`npm run test:defense`). |
| **Anthropic MCP Server** | Model Context Protocol + JSON-RPC 2.0 | Standardized tools (`synapse_call_paid_api`, `synapse_batch_swarm_settle`) for Claude & Cursor. |
| **Pay-Per-Streamed-Token** | SSE Token Accounting ($0.00002/tok) | Off-chain token tracking with atomic batch settlement upon completion or early client abort. |

---

## 1. The Problem: Subscriptions Don't Work for Autonomous AI

When humans use 5 or 10 popular APIs, they buy monthly subscriptions ($20–$100/mo) and paste API keys into `.env`. 

For autonomous AI agents, that model fails completely:

1. **Negative Fee Ratio (30,000% Overhead on Visa/Stripe):** Traditional credit card processors charge a fixed ~$0.30 swipe fee + 2.9%. Buying a single $0.001 data point incurs a 30,000% fee penalty. Sub-cent machine payments are mathematically impossible on traditional payment rails.
2. **Subscription Waste:** An AI agent needing occasional lookups across 30 different niche providers cannot maintain 30 separate $30/mo subscriptions ($900/month in idle capacity waste).
3. **WAF Negative Margin:** Websites spend money paying Cloudflare and WAF services per 1,000 bot requests just to return 403 Forbidden ($0 revenue, burning cash).
4. **Runaway Spending & Hack Risks:** Giving an AI agent an uncapped corporate credit card or raw private key is dangerous. A single prompt injection, infinite loop, or rogue command can drain an entire company budget in seconds.

### The Synapse402 Solution
Synapse402 does **not** replace APIs — APIs remain the pipe through which data flows.  
Synapse402 **replaces the manual credit card checkout, monthly retainers, and exposed secret keys** with an automated, sub-cent pay-per-request protocol layer on **Tempo L1** (backed by Stripe & Paradigm).

Companies deposit funds once into a secure treasury vault and delegate scoped session keys to each AI bot with strict daily spending limits and approved vendor allowlists. One request = one sub-cent payment. Zero monthly waste.

---

## 2. ⚡ The 2-Line SDK Quickstart

### A. For Web Publishers & API Providers (Earn from Bots)
Turn bot crawlers and AI scrapers into instant paying customers with 2 lines of Express middleware:

```typescript
import express from 'express';
import { withTempoMpp } from '@synapse402/sdk';

const app = express();

// Protect any route with HTTP 402 + Dynamic SEO Segmentation:
app.get('/api/v1/market-feed', withTempoMpp({
  priceUsd: 0.0010,                                  // 0.1¢ per request
  payee: '0xfCEb1a2633881c19283836a2E17Ba25E612724A0',
  allowSearchCrawlers: true                          // Googlebot & Bingbot pass free for SEO!
}), (req, res) => {
  res.json({ status: 'success', depth: [142.5, 143.1, 141.8] });
});
```

### B. For AI Bot Developers (Autonomous Purchasing)
Allow your AI bot to purchase paid resources autonomously with hard spending caps and zero human intervention:

```typescript
import { createSynapseAgent } from '@synapse402/sdk';

// 2 Lines: Automatically detects HTTP 402, validates budget, signs EIP-712, settles on Tempo L1:
const agent = createSynapseAgent({ sessionKey: process.env.AGENT_SESSION_KEY });
const liveData = await agent.fetch('https://api.provider.com/api/v1/market-feed');

console.log('Unlocked Data:', await liveData.json());
```

---

## 3. Payment Walkthrough (6 Guardrail Scenarios)

The **Payment walkthrough** tab shows how agents, budget controllers, providers, and settlement rails respond under 6 real-world conditions. It runs in evaluation mode by default; the UI only claims a chain receipt when a live wallet returns one:

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ 1. Bot Requests │  ──>  │ 2. Policy Check │  ──>  │ 3. Settlement   │  ──>  │ 4. Result       │
│     Resource    │       │   (Limit & Merkle│      │   (<15ms Tempo) │       │   (Zero-Loss SLA│
└─────────────────┘       └─────────────────┘       └─────────────────┘       └─────────────────┘
```

1. **`1. Pay & Receive` (READY):** AI needs market depth ($0.0010) $\rightarrow$ policy checks the request $\rightarrow$ a live wallet can settle it on Tempo L1 and return the data (**HTTP 200 OK**).
2. **`2. Over Budget` (BLOCKED):** AI attempts to exceed daily limit ($50 cap) $\rightarrow$ halted off-chain at Step 2 (**$0.00 spent**).
3. **`3. Unapproved Provider` (BLOCKED):** Prompt injection directs bot to unknown domain outside Merkle allowlist $\rightarrow$ halted off-chain at Step 2 (**$0.00 spent**).
4. **`4. Invalid Payment` (REJECTED):** Price spoofing or signature tampering detected $\rightarrow$ reverted on-chain at Step 3 (**$0.00 spent**).
5. **`5. Provider Failure` (VOIDED):** Provider server crashes with HTTP 500 $\rightarrow$ atomic rollback voids escrow (**$0.00 lost guarantee**).
6. **`6. Duplicate Request` (CACHED):** Accidental network retry $\rightarrow$ cached response served via idempotency key (**$0.00 duplicate fee**).

---

## 3. Why Every Stakeholder Wins

| Stakeholder | Before Synapse402 | With Synapse402 on Tempo L1 | Concrete Benefit |
|:---|:---|:---|:---|
| **AI Company / Buyer** | Overpays $500/mo in unused flat subscriptions; risks wallet drain if bot is tricked. | Bots pay per-call ($0.0010 standard) with a hard daily ceiling ($25/day). | **Pay only for what is used** + mathematically zero wallet drain. |
| **Data Provider / Seller** | Burns cash on WAF 403 blocks (Negative Margin) or faces 30¢ swipe minimums. | Adds 2 lines of middleware with SEO crawler bypass; earns 0.1¢/call. | **Turns negative margin into 95% net profit** + Googlebot passes free. |
| **Tempo L1 Network** | Other chains charge $0.05+ gas fees, pricing out sub-cent transactions. | Tempo settles transactions in ~135ms at <$0.00002 native gas. | **High-velocity payment volume** from millions of daily machine queries. |
| **Synapse402 Protocol** | No standard exists for machine-to-machine micro-billing. | Non-custodial clearing and spending-limit protocol. | **Sustainable 0.1% route fee** (Fintech business model). |

---

## 4. Core Security & Spending Controls

1. **Scoped Session Keys & Spend Limits:** Bots never touch master private keys. Each bot receives an isolated session key with hard daily caps (`totalBudget`) and per-call limits (`maxPerCall`).
2. **Approved Vendor Lists:** Allowed endpoints are cryptographically registered. If an AI is prompted to send funds to an unauthorized address, the transaction is blocked before any funds move.
3. **Zero-Loss Protection:** If an upstream API fails before settlement, the gateway voids the payment. The tested failure path leaves the amount at $0.
4. **Non-Blocking Speed:** Independent payment channels allow dozens of bots in a fleet to make payments concurrently without queue bottlenecks.

---

## 5. 60-Second Evaluation Guide

### Option A: Interactive Web Dashboard (Recommended)

1. Start the platform:
```bash
cd premium_site
npm install
npm run dev
```
2. Open `http://localhost:3001` in your browser.
3. Key features to evaluate:
   - **Payment walkthrough (6 scenarios):** In the **Payment walkthrough** tab, run the normal path and guardrails (Pay & Receive, Over Budget, Unapproved Provider, Invalid Payment, Provider Failure, Duplicate Request) and inspect the actual payment status.
   - **AI Workforce (20 Units):** In the **AI Workforce** tab, watch the Lead Agent orchestrate 12 specialized workers and 7 providers with 2D nonces under hard budget caps.
   - **Reality Check (403 vs 200):** In the **Reality Check** sub-view, launch a live head-to-head showdown between a standard web scraper (blocked by Cloudflare WAF with 403 Forbidden and 0 bytes) and a Synapse402 agent (settled in 14ms with clean JSON delivery).
   - **Earn from Bots & Anti-DDoS Surge Defense:** In the **Earn from Bots** tab, review the 2-line Express middleware and click **Simulate High-Traffic Burst (5 Requests)** to see prices autonomously surge from $0.0010 (1x) $\rightarrow$ $0.0025 (2.5x) $\rightarrow$ $0.0063 (6.3x).
   - **Bots & Budgets:** Inspect active treasury balance ($242.03 USD), virtual spending cards, daily spending ceilings, and Merkle allowlists.
   - **Payment Receipts:** View real-time cryptographic settlement proofs on Tempo Moderato (Chain 42431) and export bank-standard CSV audit records.

---

### Option B: Headless Terminal Agent Runner (CLI)

Demonstrates a real autonomous agent encountering an HTTP 402 paywall, resolving it autonomously via EIP-712 scoped session key, and enforcing rate-limiting via dynamic surge pricing:

```bash
cd premium_site
npm run demo
# or:
node scripts/agent-runner.mjs
```

**Verified Terminal Output:**
```text
===============================================================
  SYNAPSE402 AUTONOMOUS AI AGENT CLI DEMO (Tempo L1 MPP)       
===============================================================

[1/3] Initializing Autonomous AI Agent Client...
  Session Key Address : 0x77A2634BB7a0Cbf62d6F11BcDaD98C96230AF3C6
  Max Price Guardrail : $0.003 pathUSD
  Gateway Endpoint    : http://127.0.0.1:3001

[2/3] Calling Protected API: /api/v1/test-provider-data...
  Status Code       : 200 OK (Unlocked!)
  Settlement Status : Verified Type 0x76 MPP Authorization
  Provider Payload  : {
    "symbol": "TEMPO/USD",
    "bid": 42.5,
    "ask": 42.52,
    "depth": 154200,
    "timestamp": 1789210551489
  }
  Trace / Status    : ok | Signer: 0x71C839a9E841D8B4e21a8904cB2e3Ac992cE25a9

[3/3] Testing Dynamic Surge Pricing (Rate-Limiting via Price)...
  Sending rapid bursts to /api/v1/surge-demo...
  Burst #1: Settled at $0.0025 pathUSD (Status 200)
  Burst #2: HALTED BY GUARDRAIL!
    Reason : [Synapse402 Guardrail] Requested price $0.0063 pathUSD exceeds maximum budget guardrail ($0.003).
    Result : Agent automatically stopped spending; Seller protected from bot spam.

===============================================================
  DEMO COMPLETE: Two-sided machine micropayments verified.
===============================================================
```

---

### Option C: Smart Contract Hardhat Test Suite

Verify all mathematical and cryptographic guarantees on-chain:

```bash
cd contracts
npm install
npx hardhat test
```

**Result (13/13 Passing Tests in 520ms):**
* `✓ Should properly record deposits into the vault`
* `✓ Should register a scoped session key with Merkle whitelist and budget limits`
* `✓ Should settle payment successfully when called directly by agent session key`
* `✓ Should settle payment via relayer with EIP-712 signature from agent`
* `✓ Should REJECT payment if amount exceeds maxPerCall`
* `✓ Should REJECT payment to an unwhitelisted endpoint (Prompt Injection defense)`
* `✓ Should REJECT non-sequential 2D nonce (Replay Attack defense)`
* `✓ Should REJECT unauthorized signature from rogue signer`
* `✓ Should accurately route 0.1% protocol route fee to treasury`
* `✓ Should allow merchant to register an invoice and verify on-chain settlement`
* `✓ STRESS: Should successfully process 30 rapid interleaved transactions across 3 independent 2D channels`
* `✓ VARIATION: Exact budget exhaustion down to the micro-cent and strict rejection on overdraft`
* `✓ VARIATION: Should strictly REJECT zero-amount payment attempts`

---

## 6. Anthropic Model Context Protocol (MCP) Integration

Synapse402 provides native Model Context Protocol (MCP) support via both **Stdio** (for Claude Desktop / Cursor) and **HTTP JSON-RPC 2.0** (`http://localhost:3001/api/mcp`), allowing AI agents to autonomously negotiate HTTP 402 payments:

### Claude Desktop Configuration (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "synapse402": {
      "command": "npx",
      "args": ["tsx", "server/mcpServer.ts"]
    }
  }
}
```

### Exposed MCP Tools:
1. `synapse_call_paid_api`: Autonomous HTTP 402 paywall solver with Proof-of-Execution Escrow and EIP-712 session signing on Tempo L1.
2. `synapse_batch_swarm_settle`: Multi-agent swarm subcontracting engine (lead agent pays sub-agents in a pipelined batch with budget pre-validation).
3. `synapse_check_agent_budget`: Queries available USD balance, remaining 2D Nonce, and whitelisted Merkle root for an agent spending account.
4. `synapse_list_monetized_services`: Lists all available Tempo L1 MPP-monetized data and AI inference endpoints in the network registry.

---

## 7. Tempo Moderato Testnet Details & Live Deployment

| Parameter | Value |
| :--- | :--- |
| **Network Name** | Tempo Moderato Testnet |
| **Chain ID** | `42431` (`0xa5bf`) |
| **Currency Symbol** | `USD` (Tempo TIP-20, 6 decimals) |
| **Public RPC URL** | `https://rpc.moderato.tempo.xyz` |
| **Block Explorer** | [explore.tempo.xyz](https://explore.tempo.xyz) |
| **SynapseVault (Escrow)** | [`0x3c42E274FAdd8e371fB84f97203CC2F2125c8775`](https://explore.tempo.xyz/address/0x3c42E274FAdd8e371fB84f97203CC2F2125c8775) |
| **SynapseMPPReceiver** | [`0xfCEb1a2633881c19283836a2E17Ba25E612724A0`](https://explore.tempo.xyz/address/0xfCEb1a2633881c19283836a2E17Ba25E612724A0) |
| **TIP-20 USD Token** | [`0x9aa3ef4B60B6e3c440711658ee05780e236ac714`](https://explore.tempo.xyz/address/0x9aa3ef4B60B6e3c440711658ee05780e236ac714) |
| **Live Vault Liquidity** | `$242.03 USD` (On-Chain Confirmed on Tempo Testnet) |
| **Official Faucet** | `https://tempo.xyz/developers/docs/quickstart/faucet` |

### 1-Click Deployment Script
1. Fund your deployer wallet from the official faucet:
   - Address: Check or create in `contracts/.env`
2. Run deployment:
```bash
cd contracts
npx hardhat run scripts/deploy.ts --network tempoTestnet
```
*The script automatically deploys `MockTIP20`, `SynapseVault.sol`, and `SynapseMPPReceiver.sol`, verifies deployment, and syncs contract addresses to `premium_site/src/config/deployedContracts.json`.*

---

## 8. Repository Structure

```
Synapse402 project/
├── contracts/                  # Solidity 0.8.24 (Cancun, via-ir, Hardhat)
│   ├── src/
│   │   ├── SynapseVault.sol       # Primary Escrow & Merkle Policy Engine
│   │   ├── SynapseMPPReceiver.sol # Merchant HTTP 402 Gateway
│   │   ├── interfaces/ITIP20.sol  # TIP-20 32-byte memo interface
│   │   └── mocks/MockTIP20.sol    # pathUSD 6-decimal token mock
│   ├── test/SynapseVault.test.ts  # 13/13 Unit & Stress Tests (100% Pass)
│   ├── scripts/deploy.ts          # Tempo Moderato 1-click deployment & auto-sync
│   └── hardhat.config.ts          # Configured for Tempo Testnet (42431)
├── premium_site/               # Production Web Dashboard + Gateway
│   ├── src/
│   │   ├── sdk/index.ts           # Standalone Autonomous Agent SDK
│   │   ├── components/            # Production React 19 UI Views
│   │   │   ├── JuryInteractiveDemo.tsx # 1-Click Interactive Live Testing (6 Scenarios)
│   │   │   ├── MultiAgentSwarmView.tsx # 20-Unit Parallel Swarm + Reality Check
│   │   │   ├── DashboardWallet.tsx     # Bots & Budgets Spending Guardrails
│   │   │   ├── ApiMonetizationPortal.tsx # Earn from Bots & Dynamic Surge Defense
│   │   │   ├── AgentMissionsView.tsx   # 17 Ready-to-Run Jobs & Deliverables
│   │   │   ├── ProtocolArchitecture.tsx # How It Works & Economic Visualizer
│   │   │   ├── LivePaymentsFeed.tsx    # Real-time MPP Feed & Ledger Explorer
│   │   │   └── ErrorBoundary.tsx       # Fault-tolerant UI Shield
│   │   └── types/synapse402.ts    # TypeScript Data Models
│   ├── server/
│   │   ├── synapseCore.ts         # Dual-Mode Engine & JSON State Persistence
│   │   ├── synapseState.json      # Persistent DB for keys, TVL & traces
│   │   ├── mcpServer.ts           # Anthropic Model Context Protocol Server (Stdio & HTTP)
│   │   └── streamServer.ts        # SSE Inference Gateway (Off-chain counter + Batch settle)
│   ├── scripts/
│   │   └── agent-runner.mjs       # Headless CLI Autonomous Agent Runner
│   └── server.ts                  # Express Backend (Port 3001)
├── details.md                  # Hackathon Track & Rules Specification
├── LOOM_PITCH_SCRIPT.md        # 3-Minute Video Pitch & Demo Script
└── README.md                   # Complete Platform Documentation
```

---

## 9. License

MIT License — Developed for the **Colosseum Crypto World's Fair 2026** (Tempo L1 Track).
