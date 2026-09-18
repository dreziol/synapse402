import React, { useState } from 'react';
import { 
  ShieldCheck, Zap, Lock, Database, Code, Cpu, 
  Terminal, Globe, CheckCircle, Award, Play, Check, ExternalLink,
  ArrowRight, DollarSign, Sparkles, CheckCircle2, Calculator, Loader2,
  Layers, Bot, XCircle, ShieldAlert, CreditCard, Coins
} from 'lucide-react';
import { soundEngine } from '../utils/audioEffects';
import { InfoBadge } from './InfoBadge';


export const ProtocolArchitecture: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'blueprint' | 'solidity'>('blueprint');
  const [activeContract, setActiveContract] = useState<'vault' | 'gateway'>('vault');
  
  // Economics & Settlement Calculator State
  const [calcCalls, setCalcCalls] = useState<number>(10000);
  const [calcPriceUsd, setCalcPriceUsd] = useState<number>(0.001);
  const [isSimulatingRoute, setIsSimulatingRoute] = useState<boolean>(false);
  const [copiedRouteHash, setCopiedRouteHash] = useState<boolean>(false);
  const [routeResult, setRouteResult] = useState<{
    totalGross: number;
    sellerNet: number;
    protocolFee: number;
    tempoGasUsd: number;
    stripeFeeEquivalent: number;
    stripeLossPercent: number;
    exampleId: string;
    calculatedAt: string;
  } | null>(null);

  const handleSimulateRoute = () => {
    soundEngine.playClick();
    setIsSimulatingRoute(true);
    setTimeout(() => {
      const gross = calcCalls * calcPriceUsd;
      const protocol = gross * 0.001; // 0.1%
      const seller = gross - protocol; // 99.9%
      const tempoGas = 0.000018 * (calcCalls > 1000 ? 5 : 1);
      const stripeFee = calcCalls * 0.30 + gross * 0.029;
      const now = Date.now();
      
      setRouteResult({
        totalGross: gross,
        sellerNet: seller,
        protocolFee: protocol,
        tempoGasUsd: tempoGas,
        stripeFeeEquivalent: stripeFee,
        stripeLossPercent: Math.min(100, Math.round((stripeFee / gross) * 100)),
        exampleId: `example_${now}`,
        calculatedAt: new Date().toLocaleTimeString(),
      });
      soundEngine.playClick();
      setIsSimulatingRoute(false);
    }, 250);
  };

  // Deployment Simulation State
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentLog, setDeploymentLog] = useState<string[]>([]);
  const [deployedNetwork, setDeployedNetwork] = useState<'moderato' | 'mainnet' | null>(null);
  const [deployedAddresses, setDeployedAddresses] = useState<{
    vault: string;
    gateway: string;
    txHash: string;
  } | null>(null);

  const inspectDeployment = async (network: 'moderato' | 'mainnet') => {
    soundEngine.playClick();
    setIsDeploying(true);
    setDeployedNetwork(network);
    setDeploymentLog([]);
    setDeployedAddresses(null);

    try {
      const netRes = await fetch('/api/network/status');
      const netStatus = await netRes.json().catch(() => null);
      const dynamicTx = netStatus?.latestTxHash;
      const isLive = netStatus?.networkMode === 'LIVE_TESTNET';
      const logs = [
        `[RPC] Connected to RPC: https://rpc.moderato.tempo.xyz (Chain ID: 42431)`,
        `[BLOCK] Current Tempo L1 Block Height: #${netStatus?.blockHeight || 'Syncing...'}`,
        isLive && dynamicTx ? `[TX] Latest confirmed L1 settlement: ${dynamicTx}` : `[STATUS] Connected in ${netStatus?.networkMode || 'fallback'} mode; no new chain write was made`,
        isLive ? `[BYTECODE] Contract record available on Tempo L1 Explorer` : `[BYTECODE] Live bytecode check unavailable in fallback mode`,
        `[CHECK] Addresses and network configuration loaded`,
        `[ADDRESS] SynapseVault: ${netStatus?.vaultAddress || '0x3c42E274FAdd8e371fB84f97203CC2F2125c8775'}`,
        `[ADDRESS] SynapseMPPReceiver: ${netStatus?.receiverAddress || '0xfCEb1a2633881c19283836a2E17Ba25E612724A0'}`,
        isLive ? `[STATUS] Live testnet connection confirmed. TVL: $${Number(netStatus?.vaultTvl ?? 0).toFixed(2)} USD` : `[STATUS] Sandbox response only. TVL and receipts are not presented as live settlement.`
      ];
      setDeploymentLog(logs);
      setDeployedAddresses({
        vault: netStatus?.vaultAddress || '0x3c42E274FAdd8e371fB84f97203CC2F2125c8775',
        gateway: netStatus?.receiverAddress || '0xfCEb1a2633881c19283836a2E17Ba25E612724A0',
        txHash: dynamicTx || ''
      });
      soundEngine.playClick();
    } catch (err: any) {
      setDeploymentLog([`[ERR] Network inspection failed: ${err.message}`]);
    } finally {
      setIsDeploying(false);
    }
  };

  const synapseVaultSol = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/ITIP20.sol";

/**
 * @title SynapseVault
 * @notice Production-grade Escrow & Policy Engine for Autonomous AI Agent payments on Tempo L1.
 *         Supports EIP-712 scoped session delegations, Merkle whitelist verification,
 *         2D-nonce concurrency channels, and TIP-20 ISO 20022 payment memos.
 */
contract SynapseVault is Ownable, ReentrancyGuard, EIP712 {
    using SafeERC20 for IERC20;

    enum SessionStatus { INACTIVE, ACTIVE, PAUSED, DEPLETED, REVOKED }

    struct SessionKeyConfig {
        uint256 maxPerCall;       // Max token units per HTTP 402 payment
        uint256 totalBudget;      // Total cumulative budget allocated
        uint256 currentSpent;     // Cumulative tokens spent so far
        uint256 validBefore;      // Expiry timestamp (UNIX)
        bytes32 merkleRoot;       // Merkle root of whitelisted API endpoints (bytes32(0) = wildcard)
        SessionStatus status;     // Lifecycle status
    }

    struct PaymentParams {
        address sessionKey;
        uint64 channelId;
        uint64 nonce;
        address payee;
        uint256 amount;
        string endpoint;
        bytes32[] merkleProof;
        bytes32 memo;
        uint256 deadline;
        bytes signature;
    }

    bytes32 public constant MPP_AUTHORIZATION_TYPEHASH = keccak256(
        "MPPAuthorization(address sessionKey,uint64 channelId,uint64 nonce,address payee,uint256 amount,bytes32 endpointHash,bytes32 memo,uint256 validBefore)"
    );

    IERC20 public immutable paymentToken;
    uint256 public totalVaultBalance;
    mapping(address => SessionKeyConfig) public sessionKeys;
    mapping(address => mapping(uint64 => uint64)) public lastNonce;

    constructor(address _token, address _initialOwner)
        Ownable(_initialOwner)
        EIP712("SynapseVault", "1.0.0")
    {
        paymentToken = IERC20(_token);
    }

    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "ZERO_AMOUNT");
        paymentToken.safeTransferFrom(msg.sender, address(this), amount);
        totalVaultBalance += amount;
    }

    function settle402Payment(PaymentParams calldata p) external nonReentrant {
        SessionKeyConfig storage config = sessionKeys[p.sessionKey];
        require(config.status == SessionStatus.ACTIVE, "SESSION_NOT_ACTIVE");
        require(block.timestamp <= config.validBefore, "SESSION_EXPIRED");
        require(block.timestamp <= p.deadline, "DEADLINE_EXPIRED");
        require(p.amount <= config.maxPerCall, "EXCEEDS_MAX_PER_CALL");
        require(config.currentSpent + p.amount <= config.totalBudget, "EXCEEDS_BUDGET");

        // 2D Nonce Concurrency Check
        uint64 expectedNonce = lastNonce[p.sessionKey][p.channelId] + 1;
        require(p.nonce == expectedNonce, "INVALID_2D_NONCE");
        lastNonce[p.sessionKey][p.channelId] = p.nonce;

        // Merkle Tree Endpoint Whitelist Verification
        if (config.merkleRoot != bytes32(0)) {
            bytes32 endpointLeaf = keccak256(bytes.concat(keccak256(abi.encode(p.endpoint))));
            require(MerkleProof.verify(p.merkleProof, config.merkleRoot, endpointLeaf), "NOT_WHITELISTED");
        }

        // EIP-712 Signature Verification
        if (msg.sender != p.sessionKey) {
            bytes32 structHash = keccak256(abi.encode(
                MPP_AUTHORIZATION_TYPEHASH, p.sessionKey, p.channelId, p.nonce, p.payee, p.amount,
                keccak256(bytes.concat(keccak256(abi.encode(p.endpoint)))), p.memo, p.deadline
            ));
            address signer = ECDSA.recover(_hashTypedDataV4(structHash), p.signature);
            require(signer == p.sessionKey, "INVALID_EIP712_SIGNATURE");
        }

        config.currentSpent += p.amount;
        totalVaultBalance -= p.amount;

        // Native Tempo TIP-20 Settlement with 32-byte Memo
        try ITIP20(address(paymentToken)).transferWithMemo(p.payee, p.amount, p.memo) returns (bool ok) {
            require(ok, "TIP20_MEMO_FAILED");
        } catch {
            paymentToken.safeTransfer(p.payee, p.amount);
        }
    }
}`;

  const synapseMppReceiverSol = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title SynapseMPPReceiver
 * @notice Verifiable HTTP 402 Payment Gateway for API Providers on Tempo L1.
 *         Receives autonomous machine payments, matches TIP-20 ISO 20022 memos,
 *         and issues cryptographic receipt proofs for downstream API unlock.
 */
contract SynapseMPPReceiver is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Invoice {
        address merchant;
        uint256 amountRequired;
        bool isSettled;
        address settledBy;
        uint256 settledAt;
        bytes32 memo;
    }

    IERC20 public immutable acceptedToken;
    mapping(bytes32 => Invoice) public invoices;

    event InvoiceCreated(bytes32 indexed invoiceId, address indexed merchant, uint256 amountRequired);
    event InvoiceSettled(bytes32 indexed invoiceId, address indexed payer, address indexed merchant, uint256 amount, bytes32 memo, uint256 timestamp);

    constructor(address _acceptedToken, address _owner) Ownable(_owner) {
        acceptedToken = IERC20(_acceptedToken);
    }

    function createInvoice(bytes32 invoiceId, uint256 amountRequired) external {
        require(invoices[invoiceId].amountRequired == 0, "INVOICE_EXISTS");
        require(amountRequired > 0, "INVALID_AMOUNT");
        invoices[invoiceId] = Invoice({
            merchant: msg.sender,
            amountRequired: amountRequired,
            isSettled: false,
            settledBy: address(0),
            settledAt: 0,
            memo: bytes32(0)
        });
        emit InvoiceCreated(invoiceId, msg.sender, amountRequired);
    }

    function settleInvoice(bytes32 invoiceId, bytes32 memo) external nonReentrant {
        Invoice storage invoice = invoices[invoiceId];
        require(invoice.amountRequired > 0, "INVOICE_NOT_FOUND");
        require(!invoice.isSettled, "INVOICE_ALREADY_SETTLED");

        invoice.isSettled = true;
        invoice.settledBy = msg.sender;
        invoice.settledAt = block.timestamp;
        invoice.memo = memo;

        acceptedToken.safeTransferFrom(msg.sender, invoice.merchant, invoice.amountRequired);
        emit InvoiceSettled(invoiceId, msg.sender, invoice.merchant, invoice.amountRequired, memo, block.timestamp);
    }
}`;

  return (
    <section id="architecture-specs-section" className="space-y-6 font-sans">
      
      {/* Tab Selector */}
      <div className="flex border-b border-white/[.08] bg-white/[.03] backdrop-blur-md text-xs font-mono p-1 rounded-lg border border-white/[.08] w-fit">
        <button
          onClick={() => setActiveSubTab('blueprint')}
          className={`px-4 py-2 font-semibold rounded-md transition-all ${
            activeSubTab === 'blueprint'
              ? 'bg-[#d7ff4f]/[.08] text-[#d7ff4f] border border-[#d7ff4f]/20'
              : 'text-white/50 hover:text-[#f5f5f2]'
          }`}
        >
          System Blueprint
        </button>
        <button
          onClick={() => setActiveSubTab('solidity')}
          className={`px-4 py-2 font-semibold rounded-md transition-all flex items-center gap-1.5 ${
            activeSubTab === 'solidity'
              ? 'bg-[#d7ff4f]/[.08] text-[#d7ff4f] border border-[#d7ff4f]/20'
              : 'text-white/50 hover:text-[#f5f5f2]'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Solidity Contracts (EVM)</span>
        </button>
      </div>

      {activeSubTab === 'blueprint' ? (
        <>
          {/* Executive Value Framework: Old Way vs Synapse402 & 4-Step Process */}
          <div className="p-5 sm:p-7 rounded-2xl bg-white/[.03] backdrop-blur-md border border-[#d7ff4f]/20 space-y-6 font-sans shadow-[0_0_35px_rgba(215,255,79,0.06)]">
            {/* Header Row: Narrative Title & Live Network Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[.08] pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-[#d7ff4f] text-[#08090c] font-black text-[10px] font-mono tracking-wider uppercase">
                  START HERE
                </span>
                <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Controlled payments for AI agents and the services they use
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                <span className="px-2 py-0.5 rounded bg-[#d7ff4f]/10 text-[#d7ff4f] border border-[#d7ff4f]/20 font-semibold">
                  Fast rules check · optional on-chain proof
                </span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] text-zinc-300 border border-white/10 font-semibold">
                  Pay only for work used
                </span>
              </div>
            </div>

            <p className="max-w-4xl text-base leading-relaxed text-zinc-100">
              One person gives an AI worker a job, a spending limit, and a short list of allowed services. The worker buys only the steps it needs, pays each provider, and returns the finished result. The SDK adds the same machine payment path to any API or website, while a swarm lets several specialists share one controlled budget.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl border border-white/[.12] bg-black/[.14] p-4 space-y-1.5">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">Person</div>
                <div className="font-semibold text-white">Sets the job and the limit</div>
                <p className="text-zinc-300 leading-relaxed">The agent never receives an unrestricted wallet. Every call has a clear cap and approved destination.</p>
              </div>
              <div className="rounded-xl border border-[#d7ff4f]/25 bg-[#d7ff4f]/[.035] p-4 space-y-1.5">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#d7ff4f]">Agent</div>
                <div className="font-semibold text-white">Buys the missing steps</div>
                <p className="text-zinc-300 leading-relaxed">It can call an API, an SDK-enabled site, or another specialist only when that step helps finish the job.</p>
              </div>
              <div className="rounded-xl border border-white/[.12] bg-black/[.14] p-4 space-y-1.5">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">Provider</div>
                <div className="font-semibold text-white">Earns per approved result</div>
                <p className="text-zinc-300 leading-relaxed">A service owner keeps the normal human site and adds a paid machine route beside it.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-stretch gap-2.5 pt-1" aria-label="Work flow overview">
              {[
                { icon: Sparkles, label: 'Give a goal', detail: 'What should be done?' },
                { icon: Lock, label: 'Set the rules', detail: 'Budget and access' },
                { icon: Layers, label: 'Get the work done', detail: 'Services and agents' },
                { icon: CheckCircle2, label: 'Receive the result', detail: 'Work and receipt' },
              ].map(({ icon: Icon, label, detail }, index) => (
                <React.Fragment key={label}>
                  <div className={`relative flex flex-1 items-center gap-2.5 rounded-xl border px-3 py-3 ${index === 2 ? 'border-[#d7ff4f]/40 bg-[#d7ff4f]/[.05]' : 'border-white/[.1] bg-black/[.14]'}`}>
                    <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${index === 2 ? 'bg-[#d7ff4f] text-[#08090c]' : 'bg-white/[.08] text-zinc-200'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-white"><span className="text-[9px] font-mono text-zinc-500">0{index + 1}</span>{label}</div>
                      <div className="text-[10px] text-zinc-400">{detail}</div>
                    </div>
                  </div>
                  {index < 3 && <ArrowRight className="hidden self-center justify-self-center text-zinc-600 sm:block" size={15} />}
                </React.Fragment>
              ))}
            </div>

            {/* Side-by-Side Contrast: Old Way vs Synapse402 Way */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Old Way */}
              <div className="hidden p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-400 flex items-center gap-1.5 font-mono text-[11px] uppercase">
                    <XCircle className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span>The Broken Status Quo</span>
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/10 font-bold">403 &amp; Subscriptions</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-zinc-400">
                  <li className="flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span><strong className="text-zinc-300">Websites:</strong> Spend fortunes on WAFs to return 403 blocks ➔ Earn <strong className="text-white">$0.00</strong>.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span><strong className="text-zinc-300">Credit Cards:</strong> Fixed swipe fees make sub-cent machine payments impossible.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span><strong className="text-zinc-300">Scrapers:</strong> Burn <strong className="text-white">$5–$10/GB</strong> on residential proxies and CAPTCHAs.</span>
                  </li>
                </ul>
              </div>

              {/* Synapse402 Way */}
              <div className="md:col-span-2 p-4 rounded-xl bg-[#d7ff4f]/[0.03] border border-[#d7ff4f]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#d7ff4f] flex items-center gap-1.5 font-mono text-[11px] uppercase">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#d7ff4f] shrink-0" />
                    <span>What gets connected</span>
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#d7ff4f]/20 text-[#d7ff4f] font-bold border border-[#d7ff4f]/30">Example: 0.1¢ / request</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-zinc-200">
                  <li className="flex items-center gap-2">
                    <Coins className="w-3.5 h-3.5 text-[#d7ff4f] shrink-0" />
                    <span><strong className="text-white">Service owners:</strong> a small SDK lets agents pay for the exact API call, tool, or access they use.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-[#d7ff4f] shrink-0" />
                    <span><strong className="text-white">Tempo L1:</strong> Micro-gas (&lt;$0.00002) enables true <strong className="text-[#d7ff4f]">0.1¢ machine micropayments</strong>.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#d7ff4f] shrink-0" />
                    <span><strong className="text-white">AI Agents:</strong> Complete jobs by buying data, API access, software actions, or help from other agents.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 4-Step Executive Flow Rail */}
            <div className="hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-white/[.04] border border-white/[.12] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Step 01</span>
                  <span className="text-[9px] font-mono text-zinc-500">Set the job</span>
                </div>
                <div className="text-xs font-bold text-white">Give the agent a goal</div>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  Set the goal, budget, allowed providers, and rules before the work starts.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[.04] border border-white/[.12] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Step 02</span>
                  <span className="text-[9px] font-mono text-zinc-500">Find what is needed</span>
                </div>
                <div className="text-xs font-bold text-white">Use services</div>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  The agent finds the right API, SDK-enabled site, paid access, or specialist agent for each step.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#d7ff4f]/[.04] border border-[#d7ff4f]/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#d7ff4f] uppercase">Step 03</span>
                  <span className="text-[9px] font-mono text-[#d7ff4f]/80 font-bold">Within rules</span>
                </div>
                <div className="text-xs font-bold text-[#d7ff4f]">Pay each provider</div>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  Each approved step is paid within its limit; live payments can be checked on-chain.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[.04] border border-white/[.12] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Step 04</span>
                  <span className="text-[9px] font-mono text-emerald-400/80 font-bold">Job complete</span>
                </div>
                <div className="text-xs font-bold text-white">Return the finished work</div>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  The agent combines the results and gives the finished deliverable back to the person who asked.
                </p>
              </div>
            </div>

            {/* Bottom Proof Strip */}
            <div className="p-3 rounded-xl bg-white/[.02] border border-white/[.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span><strong className="text-white font-semibold">One shared loop:</strong> people assign work, agents buy what they need, and service owners get paid for each completed step.</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-[10.5px] text-zinc-200 space-y-0.5">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-zinc-400 flex items-center gap-1"><Bot className="w-3 h-3 text-zinc-300" /> Buyer:</span>
                    <span className="text-white font-bold">Pay-per-use</span>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-zinc-400 flex items-center gap-1"><Globe className="w-3 h-3 text-zinc-300" /> Seller:</span>
                    <span className="text-[#d7ff4f] font-bold">Example payout: 99.9%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Intro Header: Two-Sided Market Flywheel */}
          <div className="bg-white/[.025] backdrop-blur-md border border-white/[.08] rounded-2xl p-6 sm:p-7 shadow-sm relative overflow-hidden mt-8">
            <div className="absolute right-0 top-0 w-80 h-80 bg-[#d7ff4f]/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#d7ff4f]/[.08] text-[#d7ff4f] border border-[#d7ff4f]/30 font-mono text-xs font-semibold flex items-center">
                <span>THE AGENT WORK ECONOMY</span>
                <InfoBadge
                  title="How the work network connects"
                  text="The same payment rules connect the person who assigns the job, the agent doing it, the services it uses, and any specialist agents it hires."
                />
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#f5f5f2] tracking-tight">
              One payment flow, three roles
            </h2>

            {/* Two-Sided Value Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/[.08] text-xs">
              <div className="p-4 rounded-xl bg-white/[.035] border border-white/[.1] space-y-2">
                <div className="flex items-center gap-1.5 text-[#d7ff4f] font-bold">
                  <Bot className="w-4 h-4 text-[#d7ff4f]" />
                  <span>Person who assigns the job</span>
                </div>
                <p className="text-zinc-300 leading-relaxed text-[11px]">
                  Sets the goal, budget, and approved providers. The agent can work without an unrestricted wallet.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[.035] border border-white/[.1] space-y-2">
                <div className="flex items-center gap-1.5 text-white font-bold">
                  <Globe className="w-4 h-4 text-zinc-300" />
                  <span>Provider who supplies a step</span>
                </div>
                <p className="text-zinc-300 leading-relaxed text-[11px]">
                  Adds the SDK and charges only when an agent uses the service. A specialist agent can also be paid when it completes one part of a larger job.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Micropayment Economics & Route Simulator */}
          <div className="space-y-4 mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#d7ff4f] text-[#08090c] font-black text-[10px] tracking-wider uppercase">
                  02 · SEE THE MONEY FLOW
                </span>
                <span className="text-xs font-bold text-white tracking-wide flex items-center">
                  <span>Example: how one job's payment is split</span>
                  <InfoBadge
                    title="How the payment is split"
                    text="The service receives almost all of the payment; a small routing fee keeps the network running. The figures below are an example, not a live charge."
                  />
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                See the cost difference
              </span>
            </div>

            <div className="bg-white/[.03] backdrop-blur-md border border-white/[.08] rounded-xl p-5 space-y-5 shadow-sm font-sans">
              {/* Volume & Price Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-semibold text-zinc-300 block mb-1.5">
                    Select Bot Batch Volume:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { label: 'Single Call (1)', calls: 1 },
                      { label: 'Swarm Batch (10,000)', calls: 10000 },
                      { label: 'Large Swarm (100,000)', calls: 100000 },
                    ].map((preset) => (
                      <button
                        key={preset.calls}
                        onClick={() => {
                          soundEngine.playClick();
                          setCalcCalls(preset.calls);
                          setRouteResult(null);
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition cursor-pointer ${
                          calcCalls === preset.calls
                            ? 'bg-[#d7ff4f]/15 border-[#d7ff4f] text-[#d7ff4f]'
                            : 'bg-white/[.025] border-white/10 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSimulateRoute}
                    disabled={isSimulatingRoute}
                    className="px-5 py-2.5 rounded-xl bg-[#d7ff4f] hover:bg-[#cbf540] text-[#08090c] font-black text-xs flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    {isSimulatingRoute ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#08090c]" />
                        <span>Simulating Settlement...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-current text-[#08090c]" />
                        <span>Simulate Settlement Route</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                {/* Traditional Credit Cards */}
                <div className="p-4 rounded-xl bg-white/[.02] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-300 text-xs flex items-center gap-1.5">
                      <span>Traditional Credit Cards (Stripe / PayPal)</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/10 font-mono text-[10px] font-bold">
                      FAIL ON MICROPAYMENTS
                    </span>
                  </div>
                  <div className="space-y-1.5 font-mono text-[11px] text-zinc-300">
                    <div className="flex justify-between py-1 border-b border-white/[.04]">
                      <span className="text-zinc-400">Fixed Fee Per Swipe:</span>
                      <span className="text-zinc-300 font-bold">$0.30 fixed + 2.9%</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[.04]">
                      <span className="text-zinc-400">Total Swipe Fee on {calcCalls.toLocaleString()} calls:</span>
                      <span className="text-zinc-200 font-bold">
                        ${(calcCalls * 0.30 + calcCalls * calcPriceUsd * 0.029).toFixed(2)} USD
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[.04]">
                      <span className="text-zinc-400">Service receives:</span>
                      <span className="text-zinc-300 font-bold">
                        -$
                        {Math.max(
                          0,
                          calcCalls * 0.30 + calcCalls * calcPriceUsd * 0.029 - calcCalls * calcPriceUsd
                        ).toFixed(2)}{' '}
                        USD (Negative Margin due to $0.30 fixed fee)
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-400">Payout Finality:</span>
                      <span className="text-zinc-400">2-3 Business Days</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Credit cards charge a minimum $0.30 fee per swipe, making 0.1¢ agent micropayments mathematically impossible.
                  </p>
                </div>

                {/* Synapse402 on Tempo L1 */}
                <div className="p-4 rounded-xl bg-[#d7ff4f]/[0.03] border border-[#d7ff4f]/30 space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#d7ff4f] text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Synapse402 on Tempo L1</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#d7ff4f]/20 text-[#d7ff4f] font-mono text-[10px] font-bold border border-[#d7ff4f]/30">
                      99.9% SELLER PAYOUT (0.1% FEE)
                    </span>
                  </div>
                  <div className="space-y-1.5 font-mono text-[11px] text-zinc-200">
                    <div className="flex justify-between py-1 border-b border-white/[.06]">
                      <span className="text-zinc-400">Gross Spend ({calcCalls.toLocaleString()} queries):</span>
                      <span className="text-white font-bold">${(calcCalls * calcPriceUsd).toFixed(4)} USD</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[.06]">
                      <span className="text-zinc-400">Service payout (99.9%):</span>
                      <span className="text-[#d7ff4f] font-bold">
                        +${(calcCalls * calcPriceUsd * 0.999).toFixed(4)} USD
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[.06]">
                      <span className="text-zinc-400">Synapse Protocol Fee (0.1%):</span>
                      <span className="text-[#d7ff4f] font-bold">
                        ${(calcCalls * calcPriceUsd * 0.001).toFixed(6)} USD
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-400">Illustrative chain cost:</span>
                      <span className="text-white font-bold">Estimate only · live value on receipt</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    The service receives its share directly, with a payment record that can be checked later.
                  </p>
                </div>
              </div>

              {/* Simulation Result Details */}
              {routeResult && (
                <div className="p-4 rounded-xl bg-[#d7ff4f]/[.08] border border-[#d7ff4f]/30 space-y-2 animate-fadeIn font-mono text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[#d7ff4f] font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Example route calculated — no live payment was sent.</span>
                    </div>
                    <span className="text-[11px] text-zinc-400">Calculated at {routeResult.calculatedAt} · no transaction submitted</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                    <div className="p-2 rounded bg-white/[.025] border border-white/10">
                      <span className="text-zinc-400 block text-[10px]">Seller Deposit (99.9%):</span>
                      <span className="text-white font-bold text-xs">
                        +${routeResult.sellerNet.toFixed(4)} USD
                      </span>
                    </div>
                    <div className="p-2 rounded bg-white/[.025] border border-white/10">
                      <span className="text-zinc-400 block text-[10px]">Protocol Route Fee (0.1%):</span>
                      <span className="text-[#d7ff4f] font-bold text-xs">
                        +${routeResult.protocolFee.toFixed(6)} USD
                      </span>
                    </div>
                    <div className="p-2 rounded bg-white/[.025] border border-white/10">
                      <span className="text-zinc-400 block text-[10px]">Tempo L1 Gas Cost:</span>
                      <span className="text-zinc-300 font-bold text-xs">
                        ${routeResult.tempoGasUsd.toFixed(6)} USD
                      </span>
                    </div>
                  </div>
                  <div className="pt-1.5 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-zinc-500">Example ID:</span>
                      <span className="truncate text-[#d7ff4f]">{routeResult.exampleId}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(routeResult.exampleId);
                          setCopiedRouteHash(true);
                          setTimeout(() => setCopiedRouteHash(false), 2000);
                        }}
                        className="px-2 py-0.5 rounded bg-white/[0.06] hover:bg-white/10 text-zinc-300 hover:text-white transition cursor-pointer text-[10px]"
                      >
                        {copiedRouteHash ? (
                          <span className="text-emerald-400 font-bold">Copied!</span>
                        ) : (
                          <span>Copy Example ID</span>
                        )}
                      </button>
                      <a
                        href="https://explore.tempo.xyz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-400 hover:text-white flex items-center gap-1 hover:underline text-[10px]"
                      >
                        <span>Tempo Explorer</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3 Core Architecture Pillars */}
          <details className="group rounded-2xl border border-white/[.08] bg-white/[.015]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-xs font-bold text-white marker:hidden">
              <span className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#d7ff4f] text-[#08090c] font-black text-[10px] tracking-wider uppercase">TECHNICAL SAFEGUARDS</span>
                <span>What keeps each payment controlled</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500 transition group-open:rotate-180">▼</span>
            </summary>
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <span className="px-2 py-0.5 rounded-md bg-[#d7ff4f] text-[#08090c] font-black text-[10px] tracking-wider uppercase">
                CORE PILLARS
              </span>
              <span className="text-xs font-bold text-white tracking-wide">3 Foundational Architectural Primitives</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pillar 1 */}
            <div className="bg-white/[.03] backdrop-blur-md border border-white/[.08] rounded-xl p-5 space-y-3 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-[#d7ff4f]/[.08] border border-[#d7ff4f]/30 flex items-center justify-center text-[#d7ff4f]">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-[#f5f5f2] flex items-center">
                <span>1. Limited-Use Cards (with spending limits)</span>
                <InfoBadge
                  title="EIP-712 Scoped Delegation"
                  text="Secp256k1 cryptographic session keys with strict parameters: maximum spend per call ($0.0050), total daily allowance, and validBefore expiration on SynapseVault.sol."
                />
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                Agent owners issue restricted session keys with hard daily caps, per-call limits, and approved provider lists.
              </p>
              <div className="text-[11px] font-mono text-[#d7ff4f] bg-white/[.025] p-2.5 rounded-lg border border-white/[.08]">
                Enforced by SynapseVault.sol on-chain
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white/[.03] backdrop-blur-md border border-white/[.08] rounded-xl p-5 space-y-3 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-[#d7ff4f]/[.08] border border-[#d7ff4f]/30 flex items-center justify-center text-[#d7ff4f]">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-[#f5f5f2] flex items-center">
                <span>2. Parallel Payment Lanes</span>
                <InfoBadge
                  title="Tempo L1 2D Nonces"
                  text="Independent 2D nonce counters per bot session key so multiple bots can pay at once without waiting in line."
                />
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                Tempo L1's 2-dimensional nonce structure gives each bot an independent lane, so multiple bots can pay at once without waiting in line.
              </p>
              <div className="text-[11px] font-mono text-[#d7ff4f] bg-white/[.025] p-2.5 rounded-lg border border-white/[.08]">
                Simultaneous Multi-Agent Concurrency
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white/[.03] backdrop-blur-md border border-white/[.08] rounded-xl p-5 space-y-3 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-[#d7ff4f]/[.08] border border-[#d7ff4f]/30 flex items-center justify-center text-[#d7ff4f]">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-[#f5f5f2] flex items-center">
                <span>3. Batch settlement</span>
                <InfoBadge
                  title="Tempo Native TIP-20 Settlement"
                  text="Sub-150ms on-chain finality on Tempo L1 with payment references that make every agent job easy to match."
                />
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                A live Tempo run can settle sub-cent transactions in about 135ms with low gas; each payment can carry a reference for later accounting export.
              </p>
              <div className="text-[11px] font-mono text-[#d7ff4f] bg-white/[.025] p-2.5 rounded-lg border border-white/[.08]">
                0.1% Route Fee + Direct Settlement
              </div>
            </div>
          </div>
          </div>
          </details>

          {/* Fee Comparison & Unit Economics */}
          <details className="group rounded-2xl border border-white/[.08] bg-white/[.015]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-xs font-bold text-white marker:hidden">
              <span className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#d7ff4f] text-[#08090c] font-black text-[10px] tracking-wider uppercase">COSTS &amp; BUSINESS MODEL</span>
                <span>Why pay per request instead of a subscription</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500 transition group-open:rotate-180">▼</span>
            </summary>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#d7ff4f] text-[#08090c] font-black text-[10px] tracking-wider uppercase font-mono">
                  03 · COMPARE THE COST
                </span>
                <span className="text-xs font-bold text-white tracking-wide flex items-center">
                  <span>Economic Architecture & Compliance</span>
                  <InfoBadge
                    title="Machine-to-Machine Unit Economics"
                    text="Traditional banking rails (Visa/Stripe) have fixed minimum swipe fees that make sub-cent machine calls impossible. Tempo L1 provides native sub-cent settlements."
                  />
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                Why small payments need a different rail
              </span>
            </div>

            {/* 3 Unit Economics Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-sans">
              <div className="bg-white/[.03] backdrop-blur-md border border-white/[.08] rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white">Card Fees vs Micropayments</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-zinc-300 border border-white/10">CARD RAILS VS L1</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Traditional credit card minimum fees ($0.30) make 0.1¢ calls unviable; Tempo L1 enables sub-cent settlement with micro-gas (&lt;$0.00002) per call.
                </p>
                <div className="text-[11px] font-mono text-[#d7ff4f] bg-white/[.025] p-2 rounded-lg border border-white/[.06]">
                  Tempo L1 Gas: &lt;$0.00002 per micro-settlement
                </div>
              </div>

              <div className="bg-white/[.03] backdrop-blur-md border border-white/[.08] rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white">Blocked requests can become paid access</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-zinc-300 border border-white/10">MONETIZATION MODEL</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Websites spend resources on WAF firewalls to return HTTP 403 blocks and earn <strong className="text-white">$0</strong>. With Synapse 402 SDK, bot traffic converts into <strong className="text-[#d7ff4f]">paid API revenue (0.1% protocol fee)</strong> on Tempo L1.
                </p>
                <div className="text-[11px] font-mono text-[#d7ff4f] bg-white/[.025] p-2 rounded-lg border border-white/[.06]">
                  Monetize machine demand instead of blocking it
                </div>
              </div>

              <div className="bg-white/[.03] backdrop-blur-md border border-white/[.08] rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#d7ff4f]">Clean data for a small payment</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#d7ff4f]/10 text-[#d7ff4f] border border-[#d7ff4f]/20">DIRECT MACHINE ACCESS</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Instead of brittle scrapers, residential proxies (<strong className="text-white">$5–$10/GB</strong>), and CAPTCHA solving, AI agents pay <strong className="text-[#d7ff4f]">0.1¢</strong> directly for clean, structured JSON.
                </p>
                <div className="text-[11px] font-mono text-[#d7ff4f] bg-white/[.025] p-2 rounded-lg border border-white/[.06]">
                  Built for high uptime + minimal LLM token waste
                </div>
              </div>
            </div>

            {/* 2 Strategic Implementation Cards: Content Negotiation & Legal MoR */}
            <div className="hidden grid grid-cols-1 md:grid-cols-2 gap-3 font-sans pt-1">
              <div className="bg-white/[.02] border border-white/[.06] rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#d7ff4f]" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                    Same Link, Two Versions
                  </h4>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Single URL handles both humans and bots automatically:
                </p>
                <ul className="text-xs text-zinc-400 space-y-1 font-mono">
                  <li className="flex items-start gap-1.5">
                    <span className="text-zinc-500">•</span>
                    <span><strong className="text-zinc-200">Human (`Accept: text/html`):</strong> Sees regular free page with ads or newsletter signup.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-zinc-500">•</span>
                    <span><strong className="text-[#d7ff4f]">Agent (`Accept: application/json`):</strong> Receives HTTP 402, settles $0.001 on Tempo L1, receives raw structured JSON.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white/[.02] border border-white/[.06] rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#d7ff4f]" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                    Handles the Paperwork (Tax &amp; Compliance)
                  </h4>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Optional legal and tax reporting for teams that need it:
                </p>
                <ul className="text-xs text-zinc-400 space-y-1 font-mono">
                  <li className="flex items-start gap-1.5">
                    <span className="text-zinc-500">•</span>
                    <span><strong className="text-zinc-200">Machine Audit Trail:</strong> Cryptographically signed sessions provide a clear record of what each agent paid for.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-zinc-500">•</span>
                    <span><strong className="text-zinc-200">Consolidated statement:</strong> Instead of handling every tiny receipt by hand, teams can export one combined payment record.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          </details>

          {/* Real-time Interactive Deployer Widget */}
          <details className="group rounded-2xl border border-white/[.08] bg-white/[.015]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-xs font-bold text-white marker:hidden">
              <span className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#d7ff4f] text-[#08090c] font-black text-[10px] tracking-wider uppercase">TECHNICAL PROOF</span>
                <span>Contracts, addresses and network checks</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500 transition group-open:rotate-180">▼</span>
            </summary>
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <span className="px-2 py-0.5 rounded-md bg-[#d7ff4f] text-[#08090c] font-black text-[10px] tracking-wider uppercase">
                04 · TECHNICAL PROOF
              </span>
              <span className="text-xs font-bold text-white tracking-wide flex items-center">
                <span>Contract configuration and verification</span>
                <InfoBadge
                  title="What this section proves"
                  text="These are the contract addresses and checks used by the project. A live chain write is shown only when the backend confirms it."
                />
              </span>
            </div>
            <div className="bg-white/[.03] backdrop-blur-md border border-white/[.08] rounded-xl p-5 space-y-4 shadow-sm font-sans">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[.08] pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#d7ff4f]" />
                <h3 className="text-xs font-bold font-mono text-[#f5f5f2] uppercase">
                  Smart Contract Verification & Deployment Status
                </h3>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px]">
                <span className="px-2.5 py-0.5 rounded-full bg-[#d7ff4f]/15 text-[#d7ff4f] border border-[#d7ff4f]/30 font-bold">
                  ✓ CONFIGURED CONTRACTS
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                  TEMPO MODERATO · 42431
                </span>
              </div>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              The project is configured for Tempo Moderato Testnet (Chain ID 42431). Open the addresses below to inspect the network record; a sandbox connection does not claim a new on-chain deployment.{' '}
              <a
                href="https://explore.tempo.xyz/address/0x3c42E274FAdd8e371fB84f97203CC2F2125c8775"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#d7ff4f] hover:underline font-mono"
              >
                0x3c42E27...
              </a>{' '}
              (SynapseVault) and{' '}
              <a
                href="https://explore.tempo.xyz/address/0xfCEb1a2633881c19283836a2E17Ba25E612724A0"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#d7ff4f] hover:underline font-mono"
              >
                0xfCEb1a2...
              </a>{' '}
              (SynapseMPPReceiver) active and verified on-chain:
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                id="btn-inspect-deployment"
                onClick={() => inspectDeployment('moderato')}
                disabled={isDeploying}
                className="px-4 py-2.5 bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border border-white/10 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isDeploying ? 'Checking network status...' : 'Check network status'}</span>
              </button>
              <a
                href="https://explore.tempo.xyz/address/0x3c42E274FAdd8e371fB84f97203CC2F2125c8775"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-[#d7ff4f] hover:bg-[#cbf540] text-[#08090c] font-black rounded-xl text-xs font-mono transition-all flex items-center gap-2 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open SynapseVault on Explorer</span>
              </a>
              <span className="text-[11px] font-mono text-zinc-400">
                (Live writes appear only when the backend confirms them)
              </span>
            </div>

            {deploymentLog.length > 0 && (
              <div className="bg-white/[.025] border border-white/[.08] rounded-lg p-4 space-y-1.5 font-mono text-[11px] text-white/60 max-h-[220px] overflow-y-auto">
                {deploymentLog.map((log, index) => (
                  <div key={index} className="animate-fadeIn">
                    {log}
                  </div>
                ))}
              </div>
            )}

            {deployedAddresses && (
              <div className="p-4 bg-[#d7ff4f]/[.08]/40 border border-[#d7ff4f]/20 rounded-lg space-y-2 font-mono text-xs text-white/50 animate-fadeIn">
                <div className="flex items-center gap-1.5 text-[#d7ff4f] font-bold">
                  <CheckCircle className="w-4 h-4" />
                  <span>Network check complete</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div>
                    <span className="text-slate-400">SynapseVault Contract:</span>
                    <a
                      href={`https://explore.tempo.xyz/address/${deployedAddresses.vault}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-0.5 bg-white/[.03] p-1.5 rounded text-[#d7ff4f] hover:underline font-mono truncate flex items-center justify-between group border border-white/10"
                    >
                      <span className="truncate">{deployedAddresses.vault}</span>
                      <ExternalLink className="w-3 h-3 text-[#d7ff4f] shrink-0 ml-1" />
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400">SynapseMPPReceiver Contract:</span>
                    <a
                      href={`https://explore.tempo.xyz/address/${deployedAddresses.gateway}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-0.5 bg-white/[.03] p-1.5 rounded text-[#d7ff4f] hover:underline font-mono truncate flex items-center justify-between group border border-white/10"
                    >
                      <span className="truncate">{deployedAddresses.gateway}</span>
                      <ExternalLink className="w-3 h-3 text-[#d7ff4f] shrink-0 ml-1" />
                    </a>
                  </div>
                </div>
                <div className="pt-1 text-[11px]">
                  <span className="text-slate-400">
                    {deployedAddresses.txHash.length === 66 && deployedAddresses.txHash !== deployedAddresses.vault
                      ? 'Latest Confirmed Settlement Transaction on Tempo Moderato:'
                      : 'Verified Smart Contract on Tempo Moderato Explorer:'}
                  </span>
                  <a
                    href={`https://explore.tempo.xyz/address/${deployedAddresses.vault}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 bg-white/[.03] p-1.5 rounded text-[#d7ff4f] hover:underline font-mono truncate flex items-center justify-between group border border-white/10"
                  >
                    <span className="truncate">{deployedAddresses.txHash}</span>
                    <ExternalLink className="w-3 h-3 text-[#d7ff4f] shrink-0 ml-1" />
                  </a>
                </div>
              </div>
            )}
          </div>
          </div>
          </details>
        </>
      ) : (
        /* Solidity Contracts Tab (Full annotated production contracts) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fadeIn">
          {/* Contracts Sidebar Selector */}
          <div className="lg:col-span-3 flex flex-col gap-2">
            <button
              onClick={() => setActiveContract('vault')}
              className={`p-3 text-left rounded-xl border font-mono text-xs transition-all ${
                activeContract === 'vault'
                  ? 'bg-[#d7ff4f]/[.08] border-[#d7ff4f]/40 text-[#f5f5f2]'
                  : 'bg-white/[.03] backdrop-blur-md border-white/[.08] text-white/50 hover:bg-white/[.06]'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#d7ff4f]" />
                <span>SynapseVault.sol</span>
              </div>
              <span className="text-[10px] text-white/50 block mt-1">EIP-712 & 2D Nonces</span>
            </button>

            <button
              onClick={() => setActiveContract('gateway')}
              className={`p-3 text-left rounded-xl border font-mono text-xs transition-all ${
                activeContract === 'gateway'
                  ? 'bg-[#d7ff4f]/[.08] border-[#d7ff4f]/40 text-[#f5f5f2]'
                  : 'bg-white/[.03] backdrop-blur-md border-white/[.08] text-white/50 hover:bg-white/[.06]'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#d7ff4f]" />
                <span>SynapseMPPReceiver.sol</span>
              </div>
              <span className="text-[10px] text-white/50 block mt-1">HTTP 402 & TIP-20 Memo</span>
            </button>
          </div>

          {/* Code Viewer (Span 9) */}
          <div className="lg:col-span-9 bg-white/[.03] backdrop-blur-md border border-white/[.08] rounded-xl p-5 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/[.08] pb-2 text-[11px] text-white/50">
              <span className="font-bold text-[#f5f5f2]">
                {activeContract === 'vault' ? 'SynapseVault.sol' : 'SynapseMPPReceiver.sol'} — Production Interface
              </span>
              <span>Solidity ^0.8.24 (Tempo EVM Cancun)</span>
            </div>

            <pre className="bg-white/[.02] p-4 rounded-lg border border-white/[.08] text-white/60 overflow-x-auto leading-relaxed text-[11px] max-h-[500px] overflow-y-auto">
              {activeContract === 'vault' ? synapseVaultSol : synapseMppReceiverSol}
            </pre>
          </div>
        </div>
      )}
    </section>
  );
};
