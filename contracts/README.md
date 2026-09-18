# Synapse402 — Smart Contracts on Tempo L1

Production-grade Solidity smart contracts powering the **Machine Payments Protocol (MPP)** and **Scoped Agent Vaults** on Tempo L1.

---

## 🏛 Architecture Overview

```
                        ┌───────────────────────────────┐
                        │        Agent Custodian        │
                        │    (Human / Treasury Multisig) │
                        └───────────────┬───────────────┘
                                        │ Deposits USD
                                        │ Delegates Scoped Session Key
                                        ▼
                        ┌───────────────────────────────┐
                        │       SynapseVault.sol        │
                        │  - EIP-712 Scoped Delegation  │
                        │  - Merkle Whitelist Defense   │
                        │  - 2D Nonce Concurrency       │
                        │  - Spend Caps (Per-Tx / Daily)│
                        └───────────────┬───────────────┘
                                        │
           HTTP 402 Settlement Flow     │ TIP-20 transferWithMemo(payee, amount, memo)
                                        │ Memo: ISO 20022 pacs.008.001.08
                                        ▼
                        ┌───────────────────────────────┐
                        │    SynapseMPPReceiver.sol     │
                        │  (API Merchant / Payee GW)    │
                        └───────────────────────────────┘
```

---

## 📜 Smart Contracts

| Contract | Description | Gas Optimization |
| :--- | :--- | :--- |
| [`SynapseVault.sol`](./src/SynapseVault.sol) | Agent escrow & policy engine. Enforces EIP-712 session key signatures, Merkle tree endpoint whitelisting, and 2D nonces. | `via-ir` compiled, custom errors, struct packing |
| [`SynapseMPPReceiver.sol`](./src/SynapseMPPReceiver.sol) | API Provider receiver contract. Validates incoming HTTP 402 settlements and emits receipt events. | Reentrancy-guarded, storage packed |
| [`ITIP20.sol`](./src/interfaces/ITIP20.sol) | Tempo L1 native token standard interface supporting 32-byte remittance memos (`transferWithMemo`). | Standardized |
| [`MockTIP20.sol`](./src/mocks/MockTIP20.sol) | 6-decimal pathUSD stablecoin mock for local unit testing and development. | ERC-20 standard |

---

## 🛡 Security & Guardrails

1. **Prompt Injection / Rogue Tool Defense:** Agents cannot send funds to unapproved URLs. The target endpoint hash must pass a Merkle inclusion proof verified against the session key's on-chain `merkleRoot`.
2. **Replay Protection via 2D Nonces:** Every sub-agent channel has an independent `(channelId, sequenceNonce)` counter. Parallel agent threads never collide on sequential Ethereum nonces.
3. **Hard Budget Caps:** `maxPerCall` prevents micro-drain attacks; `totalBudget` triggers automated `DEPLETED` status when exhausted.
4. **ISO 20022 Audit Format:** Remittance data digest is encoded into the TIP-20 32-byte memo (`pacs.008.001.08`) providing a standard audit digest for accounting reconciliations.

---

## 🧪 Testing

The contracts are tested against Hardhat's simulated environment with 100% pass rate:

```bash
cd contracts
npm test
```

### Test Coverage Summary
- `SynapseVault: Vault Deposits and Session Key Delegation`
  - Proper recording of pathUSD deposits
  - Registration of scoped session keys with Merkle roots & budget limits
- `SynapseVault: HTTP 402 Settlement Execution & Policy Enforcement`
  - Direct execution by agent session key
  - Relayed execution with EIP-712 typed structured signatures
  - Rejection of amounts exceeding `maxPerCall` (`ExceedsMaxPerCall`)
  - Rejection of unauthorized endpoints (`EndpointNotWhitelisted`)
  - Rejection of replayed 2D nonces (`Invalid2DNonce`)
  - Rejection of rogue signers (`InvalidSignature`)
- `SynapseMPPReceiver: Invoice Verification`
  - On-chain invoice creation, TIP-20 memo settlement, and verification

---

## 🚀 Deployment to Tempo Moderato Testnet

```bash
# Set your testnet private key
export PRIVATE_KEY="0x..."
export TEMPO_RPC_URL="https://rpc.moderato.tempo.xyz"

# Deploy contracts
npm run deploy:tempo
```

### Verified Network Details:
* **Network:** Tempo Moderato Testnet
* **Chain ID:** `42431` (Verified via RPC)
* **RPC URL:** `https://rpc.moderato.tempo.xyz`
* **Block Explorer:** `https://explore.tempo.xyz`
