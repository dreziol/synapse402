# Synapse402 — The payment layer for autonomous work on Tempo L1

> **Agents can request approved machine resources, pay per approved step within a hard job limit, and receive a result with its payment status.**  
> Built for the **Colosseum Crypto World's Fair** (Tempo L1 Track).  
> Standards: **HTTP 402 + Tempo Native Micropayments (Type 0x76) + EIP-712 Scoped Session Keys**.

## The simple user flow

The user does not create a bot or configure a provider for every job:

**Choose a mission → set one maximum job budget → run → receive the result and a payment receipt.**

The system chooses the approved workers and providers behind the scenes. `Bots & Budgets` is an optional advanced page for reusable safety rules used by repeated or background work; it is not a required step for a normal mission.

The selected maximum follows the whole job, including every worker/provider step. A retry with the same idempotency key reuses the existing result and does not spend the job limit twice; the server keeps that job ledger across restarts.

## What this replaces

Synapse402 does not replace the APIs, websites, or apps that provide the work. It replaces the human checkout, unused subscriptions, exposed API keys, and blanket `403` blocks that stop an approved agent from completing a task. A service adds the SDK; an agent requests a structured result, pays only for the approved step, and continues its job within the assigned budget.

[![Solidity Test Suite](https://img.shields.io/badge/Hardhat%20Tests-16%2F16%20Passing-brightgreen)](contracts/test/SynapseVault.test.ts)
[![Security Defense Vectors](https://img.shields.io/badge/Defense%20Vectors-8%2F8%20Passing-brightgreen)](premium_site/scripts/test-defense.ts)
[![Tempo L1](https://img.shields.io/badge/Network-Tempo%20Moderato%20(42431)-blue)](https://explore.tempo.xyz)
[![Payment Rail](https://img.shields.io/badge/Payment%20Rail-Tempo%20L1-orange)](#)
[![Budget Safety](https://img.shields.io/badge/Budget%20Protection-Scoped%20Limits-brightgreen)](#)
[![Fee Policy](https://img.shields.io/badge/Fee%20Policy-0.1%25%20Route%20Fee-green)](#)

---

## ⚡ 1-Line CLI Verification

Run the entire verification suite (Solidity smart contracts + Defense Gateway vectors) directly from the repository root:
```bash
npm test
```
Or verify the 8 security and payment defense vectors against the local gateway:
```bash
npm run test:defense
```
The defense suite is evaluation-only: it exercises the policy, signature, budget, and replay checks without submitting a chain transaction or debiting the treasury.

For the repeatable concurrency and boundary audit, run `npm --prefix premium_site run test:stress`. Both automated gateway suites start the real app on an isolated temporary port with an empty runtime and no relayer key; they never send requests to the running site or submit chain transactions. The seeded test key and job ledger are removed with the temporary runtime when the suite exits.

---

## 🚀 Platform Capabilities and Proof Modes

| System Capability | Architecture / Standard | Realized Performance |
|:---|:---|:---|
| **Payment walkthrough** | 6 live backend guardrail scenarios | Check the normal path, budget limits, allowlists, tampering, provider failure, and retries. Every scenario runs against the live `/api/mpp/settle` backend. |
| **Judge Mode** | 8-step product story | Walk from one SOL/USDT job and budget through the Lead Agent, payment rules, provider opportunity, receipts, and the architecture roadmap. It pauses by default and never submits a live payment automatically. |
| **AI Workforce** | Selectable mission pipelines | **Mission 01 (Flagship): SOL/USDT Market Analysis** ($0.0050 job limit) combines free Bybit candles, local calculations, one paid Amberdata depth snapshot ($0.0010), and the visible CoinGlass SDK business gap into one reviewable brief. **Mission 02: Viral Ad Campaign** coordinates 20 participants (1 Lead Agent · 12 Workers · 7 Providers) under a $0.0245 / $0.0500 cap. |
| **2-Line Service SDK** | Express / Node Middleware (`withTempoMpp`) | A site or API can offer a paid machine path while keeping its normal human page. |
| **2-Line Agent Client SDK** | Lightweight Wrapper (`createSynapseAgent`) | Detects HTTP 402, checks the delegated budget, and requests the resource without human checkout. |
| **Dynamic Surge Defense** | Burst Protection & Adaptive Pricing | Autonomous 2.5x–6.3x price scaling during request surges, rate-filtering low-value traffic while keeping high-priority queries executing. |
| **Reality Check (403 vs 200)** | Side-by-Side access comparison | Shows why blanket bot blocking fails a job and how an approved paid request can return structured data. |
| **Pre-Settlement Failure Handling** | Explicit failure signal before authorization | Explicit pre-settlement failure signal appears before authorization → payment is not sent ($0.00 lost). In the normal agent path, the gateway issues payment first and the agent requests the resource once. |
| **Sub-Cent Micropayments** | Tempo L1 Type 0x76 Native MPP | The UI shows the planned sub-cent step; a configured treasury relayer and reachable Tempo testnet are required for a confirmed receipt. Personal MetaMask connection is optional. |
| **Defense Evaluation** | Merkle Allowlist + EIP-712 + 2D Nonce + route-bound key checks | 8/8 automated defense vectors run in evaluation-only mode, so the test suite does not debit the treasury (`npm run test:defense`). |
| **Anthropic MCP Server** | Model Context Protocol + JSON-RPC 2.0 | Standardized tools (`synapse_call_paid_api`, `synapse_batch_swarm_settle`) for Claude & Cursor. |
| **Pay-Per-Streamed-Token** | SSE Token Metering ($0.00002/tok) | Evaluation-only token metering + local receipt; live streamed settlement planned after pre-authorized hold. |

---

## 1. The Problem: Subscriptions Don't Work for Autonomous AI

When humans use 5 or 10 popular APIs, they buy monthly subscriptions ($20–$100/mo) and paste API keys into `.env`. 

For autonomous AI agents, that model does not fit well:

1. **Fixed-fee mismatch:** Traditional card processors combine a fixed fee with a percentage fee. For a single sub-cent data request, that fixed fee can be larger than the resource itself.
2. **Subscription Waste:** An AI agent needing occasional lookups across 30 different niche providers cannot maintain 30 separate $30/mo subscriptions ($900/month in idle capacity waste).
3. **WAF Negative Margin:** Websites spend money paying Cloudflare and WAF services per 1,000 bot requests just to return 403 Forbidden ($0 revenue, burning cash).
4. **Runaway Spending & Hack Risks:** Giving an AI agent an uncapped corporate credit card or raw private key is dangerous. A single prompt injection, infinite loop, or rogue command can drain an entire company budget in seconds.

### The Synapse402 Solution
Synapse402 does **not** replace APIs — APIs remain the pipe through which data flows.  
Synapse402 **replaces the manual credit card checkout, monthly retainers, and exposed secret keys** with an automated, sub-cent pay-per-request protocol layer on **Tempo L1** (backed by Stripe & Paradigm).

Individuals, teams, or companies deposit funds once into a treasury vault. The system applies scoped session keys, hard spending caps, and approved vendor allowlists behind the scenes. One approved request can produce one sub-cent payment, without a recurring subscription for that mission.

---

## 2. ⚡ The 2-Line SDK Quickstart

### A. For Site and API Owners (Offer Machine Access)
Add a paid machine path beside the normal human page with 2 lines of Express middleware:

```typescript
import express from 'express';
import { withTempoMpp } from '@synapse402/sdk';

const app = express();

// Protect any route with HTTP 402 + Dynamic SEO Segmentation:
app.get('/api/v1/market-feed', withTempoMpp({
  priceUsd: 0.0010,                                  // 0.1¢ per request
  payee: '0xfCEb1a2633881c19283836a2E17Ba25E612724A0',
  endpointUrl: 'https://api.provider.com/api/v1/market-feed',
}), (req, res) => {
  res.json({ status: 'success', depth: [142.5, 143.1, 141.8] });
});
```

The middleware accepts a request only after recovering the EIP-712 signer and matching
the signed amount, payee, endpoint, chain, contract, expiry, and channel nonce. A
signature-shaped header alone is rejected, and a channel nonce cannot be replayed.
`endpointUrl` should be the canonical public URL that the agent signs for this route.
The 402 `recipient` is carried into the settlement intent and signed as the payee;
the gateway issues that credential, then the agent makes the provider request once.
The gateway does not pre-fetch or proxy the provider resource before payment.

### B. For AI Bot Developers (Autonomous Purchasing)
Allow your AI bot to request paid resources without a manual checkout, while hard spending caps remain in force:

```typescript
import { createSynapseAgent } from '@synapse402/sdk';

// 2 Lines: Automatically detects HTTP 402, validates budget, signs EIP-712, settles on Tempo L1:
const agent = createSynapseAgent({ sessionKey: process.env.AGENT_SESSION_KEY });
const liveData = await agent.fetch('https://api.provider.com/api/v1/market-feed');

console.log('Unlocked Data:', await liveData.json());
```

---

## 3. Payment Walkthrough (6 Guardrail Scenarios)

The **Payment walkthrough** tab demonstrates how agents, providers, and settlement rails respond under 6 real-world conditions. Every scenario executes a real HTTP request against `/api/mpp/settle` and renders the real server response:

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ 1. Bot Requests │  ──>  │ 2. Policy Check │  ──>  │ 3. Settlement   │  ──>  │ 4. Result       │
│     Resource    │       │   (Limit & Merkle│      │   (Tempo receipt) │       │   (Result)      │
└─────────────────┘       └─────────────────┘       └─────────────────┘       └─────────────────┘
```

1. **`1. Pay & Receive` (SUCCESS):** AI needs market depth ($0.0010) $\rightarrow$ policy checks the request $\rightarrow$ the configured treasury relayer settles it on Tempo L1 and returns real data (**HTTP 200 OK**).
2. **`2. Over Budget` (BLOCKED):** AI attempts to exceed the job maximum chosen on the walkthrough page $\rightarrow$ halted off-chain before payment (**HTTP 402 Payment Required · $0.00 spent**).
3. **`3. Unapproved Provider` (BLOCKED):** Prompt injection directs bot to unknown domain outside Merkle allowlist $\rightarrow$ rejected off-chain before payment (**HTTP 403 Forbidden · $0.00 spent**).
4. **`4. Tampered Payment` (REJECTED):** Price spoofing or signature tampering detected $\rightarrow$ cryptographic check rejects proof before debit (**HTTP 401 Unauthorized · $0.00 transferred**).
5. **`5. Provider Failure` (VOIDED):** An explicit pre-settlement failure signal appears before authorization $\rightarrow$ pre-settlement void executed, payment is not sent (**HTTP 502 / VOIDED · $0.00 lost**).
6. **`6. Duplicate Request` (CACHED):** Accidental network retry $\rightarrow$ cached response served via idempotency key with 0 duplicate fee (**HTTP 200 OK Cache Hit · $0.00 additional**).

---

## 3. Why Every Stakeholder Wins

| Stakeholder | Before Synapse402 | With Synapse402 on Tempo L1 | Concrete Benefit |
|:---|:---|:---|:---|
| **Buyer (individual, team, or company)** | Overpays $500/mo in unused flat subscriptions; risks wallet drain if bot is tricked. | Agents pay per-call ($0.0010 standard) inside a job limit and a shared safety limit. | **Pay only for what is used** + controlled spending. |
| **Data Provider / Seller** | Burns cash on blocked machine traffic or has no practical checkout for tiny requests. | Adds a paid machine path beside the normal human page and charges per approved request. | **Turns approved machine traffic into measurable revenue.** |
| **Tempo L1 Network** | General-purpose payment rails are often awkward for tiny machine requests. | Provides the chain used by the configured settlement path and its receipts. | **A verifiable payment record for each confirmed request.** |
| **Synapse402 Protocol** | Agents need separate keys, checkout flows, and provider rules. | Connects HTTP 402, scoped limits, approved routes, settlement, and receipts. | **One controlled payment path from request to result.** |

---

## 4. Core Security & Spending Controls

1. **Scoped Session Keys & Spend Limits:** Bots never touch master private keys. Each bot receives an isolated session key with a hard spending cap (`totalBudget`) and per-call limits (`maxPerCall`).
2. **Approved Vendor Lists:** Allowed endpoints are cryptographically registered. If an AI is prompted to send funds to an unauthorized address, the transaction is blocked before any funds move.
3. **Pre-settlement protection:** When a provider failure is known before authorization, the gateway can void the planned payment. The tested failure path leaves the amount at $0. After settlement, the agent makes the provider request once and receives the provider's actual response.
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
   - **Judge Mode:** Click **Judge Mode** in the header for the paused 8-step walkthrough. Use Next to move through the real page sections; the panel highlights the live evidence and explains what the jury should notice. In live mode it never submits a payment automatically.
   - **Payment walkthrough (6 scenarios):** In the **Payment walkthrough** tab, run the normal path and guardrails (Pay & Receive, Over Budget, Unapproved Provider, Tampered Payment, Provider Failure, Duplicate Request). Every scenario executes a live HTTP call against `/api/mpp/settle` and displays the real server response.
   - **AI Workforce:** In the **AI Workforce** tab, inspect **01 SOL/USDT Market Analysis** (flagship mission, $0.0050 job limit) to watch the Lead Agent combine free Bybit data, local technical analysis, one paid Amberdata market-depth snapshot ($0.0010), and the visible CoinGlass SDK business opportunity. Mission 02 (Viral Ad Campaign) demonstrates the 20-unit workforce under a $0.0245 / $0.0500 cap.
   - **Reality Check (403 vs 200):** In the **Reality Check** sub-view, compare a blanket blocked request with an approved agent request that can receive clean structured data.
   - **Earn from Bots & Dynamic Surge Pricing:** In the **Earn from Bots** tab, review the 2-line Express middleware and click **Test High-Traffic Burst (5 Requests)** to see prices autonomously surge from $0.0010 (1x) $\rightarrow$ $0.0025 (2.5x) $\rightarrow$ $0.0063 (6.3x).
   - **Bots & Budgets:** Inspect the shared treasury and optional reusable safety rules; normal missions do not require creating or funding each bot.
   - **Payment Receipts:** View cryptographic settlement proofs for confirmed Tempo Moderato payments (Chain 42431) and export CSV audit records.

---

### Option B: Headless Terminal Agent Runner (CLI)

Demonstrates a real autonomous agent encountering an HTTP 402 paywall, resolving it autonomously via EIP-712 scoped session key, and enforcing rate-limiting via dynamic surge pricing:

```bash
cd premium_site
npm run demo
# or:
node scripts/agent-runner.mjs
```

This CLI demonstrates the live settlement path when the gateway has an explicit relayer key and funded treasury. Use the interactive walkthrough or the evaluation-only defense suite when you do not want to submit a testnet payment.

Public-origin live settlement is disabled by default. A hosted deployment must
set `SYNAPSE_ALLOW_PUBLIC_LIVE=true` only after adding its own login/session
gate; local demo requests continue to work without that flag.

**Illustrative terminal output:**
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

Verify the tested mathematical and cryptographic checks:

```bash
cd contracts
npm install
npx hardhat test
```

**Result (16/16 Passing Tests):**
* `✓ Should properly record deposits into the vault`
* `✓ Should register a scoped session key with Merkle whitelist and budget limits`
* `✓ Should REJECT re-registering an already active session key`
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
| **Fee Model** | No native gas coin; fees use a selectable USD-denominated TIP-20 token (pathUSD is configured here) |
| **Public RPC URL** | `https://rpc.moderato.tempo.xyz` |
| **Block Explorer** | [explore.tempo.xyz](https://explore.tempo.xyz) |
| **SynapseVault (Escrow)** | [`0x3c42E274FAdd8e371fB84f97203CC2F2125c8775`](https://explore.tempo.xyz/address/0x3c42E274FAdd8e371fB84f97203CC2F2125c8775) |
| **SynapseMPPReceiver** | [`0xfCEb1a2633881c19283836a2E17Ba25E612724A0`](https://explore.tempo.xyz/address/0xfCEb1a2633881c19283836a2E17Ba25E612724A0) |
| **TIP-20 USD Token** | [`0x9aa3ef4B60B6e3c440711658ee05780e236ac714`](https://explore.tempo.xyz/address/0x9aa3ef4B60B6e3c440711658ee05780e236ac714) |
| **Live Vault Liquidity** | Read live from the dashboard and `/api/vault/metrics`; the displayed value changes with confirmed deposits and settlements. |
| **Official Faucet** | `https://tempo.xyz/developers/docs/quickstart/faucet` |

### 1-Click Deployment Script
1. Fund your deployer wallet from the official faucet:
   - Address: Check or create in the ignored `contracts/.runtime/relayer.env`
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
│   ├── test/SynapseVault.test.ts  # 16/16 Unit & Stress Tests (100% Pass)
│   ├── scripts/deploy.ts          # Tempo Moderato 1-click deployment & auto-sync
│   └── hardhat.config.ts          # Configured for Tempo Testnet (42431)
├── premium_site/               # Hackathon Web Dashboard + Gateway
│   ├── src/
│   │   ├── sdk/index.ts           # Standalone Autonomous Agent SDK
│   │   ├── components/            # React 19 UI Views
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
│   │   └── streamServer.ts        # SSE Inference Gateway (Evaluation metering + local receipt)
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
