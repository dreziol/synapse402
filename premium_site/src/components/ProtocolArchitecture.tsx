import { TEMPO_CHAIN_ID, TEMPO_EXPLORER_URL, TEMPO_RECEIVER_ADDRESS, TEMPO_RPC_URL, TEMPO_VAULT_ADDRESS, tempoTransactionUrl, tempoAddressUrl } from '../config/network';
import React, { useState } from 'react';
import { 
  ShieldCheck, Zap, Lock, Database, Code, Cpu, 
  Terminal, Globe, CheckCircle, Award, Play, Check, ExternalLink,
  ArrowRight, DollarSign, Sparkles, CheckCircle2, Calculator, FileCheck, Loader2,
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
      const protocol = calcCalls * Math.max(0.000001, calcPriceUsd * 0.001); // 0.1%, one micro-unit minimum per call
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
      const isLive = netStatus?.networkMode === 'LIVE_TESTNET' && Number(netStatus?.blockHeight) > 0;
      const logs = [
        isLive
          ? `[RPC] Tempo L1 connection verified (Chain ID: ${TEMPO_CHAIN_ID})`
          : `[RPC] Configured endpoint: ${TEMPO_RPC_URL} (Chain ID: ${TEMPO_CHAIN_ID}); live connection is unverified`,
        `[BLOCK] Current Tempo L1 Block Height: #${netStatus?.blockHeight || 'Syncing...'}`,
        isLive && dynamicTx ? `[TX] Latest confirmed L1 settlement: ${dynamicTx}` : `[STATUS] Connected in ${netStatus?.networkMode || 'fallback'} mode; no new chain write was made`,
        isLive ? `[BYTECODE] Contract record available on Tempo L1 Explorer` : `[BYTECODE] Live bytecode check unavailable in fallback mode`,
        `[CHECK] Addresses and network configuration loaded`,
        `[ADDRESS] SynapseVault: ${netStatus?.vaultAddress || TEMPO_VAULT_ADDRESS}`,
        `[ADDRESS] SynapseMPPReceiver: ${netStatus?.receiverAddress || TEMPO_RECEIVER_ADDRESS}`,
        isLive ? `[STATUS] Live testnet connection confirmed. TVL: $${Number(netStatus?.vaultTvl ?? 0).toFixed(2)} USD` : `[STATUS] Sandbox response only. TVL and receipts are not presented as live settlement.`
      ];
      setDeploymentLog(logs);
      setDeployedAddresses({
        vault: netStatus?.vaultAddress || TEMPO_VAULT_ADDRESS,
        gateway: netStatus?.receiverAddress || TEMPO_RECEIVER_ADDRESS,
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
// Simplified architecture excerpt (for production implementation see contracts/src/SynapseVault.sol)
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
 * @title SynapseVault (Simplified Architecture Excerpt)
 * @notice Testnet Escrow & Policy Engine for Autonomous AI Agent payments on Tempo L1.
 *         Supports EIP-712 scoped session delegations, Merkle whitelist verification,
 *         2D-nonce concurrency channels, and TIP-20 ISO 20022 payment memos.
 *         For full production implementation, see contracts/src/SynapseVault.sol
 */
contract SynapseVault is Ownable, ReentrancyGuard, EIP712 {
    using SafeERC20 for IERC20;

    enum SessionStatus { INACTIVE, ACTIVE, PAUSED, DEPLETED, REVOKED }

    struct SessionKeyConfig {
        uint256 maxPerCall;       // Max token units per HTTP 402 payment
        uint256 totalBudget;      // Total cumulative budget allocated
        uint256 currentSpent;     // Cumulative tokens spent so far
        uint256 validBefore;      // Expiry timestamp (UNIX)
        bytes32 merkleRoot;       // Merkle root of approved provider endpoints (zero root rejected on registration)
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

    uint256 public constant PROTOCOL_FEE_BPS = 10; // 0.1% protocol route fee
    address public treasury;
    IERC20 public immutable paymentToken;
    uint256 public totalVaultBalance;
    mapping(address => SessionKeyConfig) public sessionKeys;
    mapping(address => mapping(uint64 => uint64)) public lastNonce;

    constructor(address _token, address _initialOwner)
        Ownable(_initialOwner)
        EIP712("SynapseVault", "1.0.0")
    {
        paymentToken = IERC20(_token);
        treasury = _initialOwner;
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
        if (config.currentSpent == config.totalBudget) {
            config.status = SessionStatus.DEPLETED;
        }
        totalVaultBalance -= p.amount;

        // Dispatch Payment with 0.1% Protocol Route Fee to Treasury
        uint256 protocolFee = (p.amount * PROTOCOL_FEE_BPS) / 10000;
        uint256 payeeAmount = p.amount - protocolFee;

        if (protocolFee > 0 && treasury != address(0)) {
            _dispatchPayment(treasury, protocolFee, bytes32("SYNAPSE_0.1%_PROTOCOL_FEE"));
        }
        _dispatchPayment(p.payee, payeeAmount, p.memo);
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
      <div className="ui-selector flex border-b border-white/[.08] bg-white/[.03] backdrop-blur-md text-xs font-mono p-1 rounded-lg border border-white/[.08] w-fit">
        <button
          onClick={() => setActiveSubTab('blueprint')}
          className={`ui-interactive px-4 py-2 font-semibold rounded-md transition-all ${
            activeSubTab === 'blueprint'
              ? 'bg-[#d7ff4f]/[.08] text-[#d7ff4f] border border-[#d7ff4f]/20'
              : 'text-white/50 hover:text-[#f5f5f2]'
          }`}
          aria-pressed={activeSubTab === 'blueprint'}
          data-selected={activeSubTab === 'blueprint'}
        >
          System Blueprint
        </button>
        <button
          onClick={() => setActiveSubTab('solidity')}
          className={`ui-interactive px-4 py-2 font-semibold rounded-md transition-all flex items-center gap-1.5 ${
            activeSubTab === 'solidity'
              ? 'bg-[#d7ff4f]/[.08] text-[#d7ff4f] border border-[#d7ff4f]/20'
              : 'text-white/50 hover:text-[#f5f5f2]'
          }`}
          aria-pressed={activeSubTab === 'solidity'}
          data-selected={activeSubTab === 'solidity'}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Solidity Contracts (EVM)</span>
        </button>
      </div>

      {activeSubTab === 'blueprint' ? (
        <>
          {/* Executive Value Framework: Old Way vs Synapse402 & 4-Step Process */}
            <div className="ui-section p-5 sm:p-7 rounded-2xl bg-white/[.03] backdrop-blur-md border border-[#d7ff4f]/20 space-y-6 font-sans shadow-[0_0_35px_rgba(215,255,79,0.06)]">
            {/* Header Row: Narrative Title & Live Network Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[.08] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Controlled payments for AI agents and the services they use
                </span>
              </div>
              <span className="text-[10px] text-zinc-400">
                One job maximum · approved provider checks · receipt after settlement
              </span>
            </div>

            <p className="max-w-5xl rounded-xl bg-[#d7ff4f]/[.035] px-4 py-3 text-sm sm:text-base leading-relaxed text-zinc-200">
              One person gives an AI worker a job and one spending limit. The system applies the approved service rules automatically, buys only the steps the job needs, settles each approved step through the configured payment receiver, and returns the result. The SDK lets a production provider set its own payee address; this hackathon demo uses one shared receiver gateway.
            </p>

            <div className="relative isolate min-h-[350px] overflow-hidden px-4 py-6 sm:px-8" aria-label="Controlled payment gate: agent request, rules check, payment gate, and receipt issued">
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d7ff4f]/25" />
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[205px] w-[205px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.12]" />
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d7ff4f]/[0.08] blur-2xl" />
              <div className="absolute left-[16%] top-[49%] hidden h-px w-[35%] bg-gradient-to-r from-[#d7ff4f]/50 via-[#d7ff4f] to-[#d7ff4f]/80 sm:block" />
              <div className="absolute left-[50%] top-[53%] hidden h-px w-[35%] bg-gradient-to-r from-[#d7ff4f] via-[#d7ff4f]/80 to-[#d7ff4f]/50 sm:block" />
              <div className="absolute left-[20%] top-[65%] hidden h-px w-[28%] -rotate-[17deg] bg-[#d7ff4f]/80 sm:block" />

              <div className="relative z-10 mb-2 flex items-center justify-between gap-3 text-[10px] font-mono font-black uppercase tracking-[0.18em]">
                <span className="text-[#d7ff4f]">Agent spend control</span>
                <span className="text-zinc-500">Intent → validation → settlement</span>
              </div>

              <div className="absolute left-1/2 top-1/2 z-20 flex h-[148px] w-[148px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-[#d7ff4f] bg-[#182316]/95 text-center shadow-[0_0_45px_rgba(215,255,79,0.18)]">
                <div className="mb-2 grid h-12 w-12 place-items-center rounded-full bg-[#d7ff4f] text-[#0b100d]"><Lock className="h-6 w-6" /></div>
                <div className="text-sm font-black leading-tight text-white">PAYMENT<br />GATE</div>
                <div className="mt-1 text-[9px] font-mono font-bold uppercase tracking-wider text-[#d7ff4f]">Policy active</div>
              </div>

              <div className="absolute left-[7%] top-[31%] z-20 flex h-[112px] w-[112px] flex-col items-center justify-center rounded-full border border-slate-500/50 bg-[#1b2630] text-center shadow-[0_8px_25px_rgba(0,0,0,0.22)] sm:left-[10%] sm:h-[124px] sm:w-[124px]">
                <Bot className="mb-2 h-6 w-6 text-zinc-200" /><div className="text-[11px] font-black leading-tight text-zinc-100">AGENT<br />REQUEST</div>
              </div>
              <div className="absolute bottom-[8%] left-[14%] z-20 flex h-[104px] w-[104px] flex-col items-center justify-center rounded-full border border-[#d7ff4f]/75 bg-[#1d2c17] text-center shadow-[0_8px_25px_rgba(0,0,0,0.22)] sm:left-[17%] sm:h-[112px] sm:w-[112px]">
                <ShieldCheck className="mb-2 h-6 w-6 text-[#d7ff4f]" /><div className="text-[11px] font-black leading-tight text-[#d7ff4f]">RULES<br />CHECK</div>
              </div>
              <div className="absolute right-[7%] top-[43%] z-20 flex h-[112px] w-[112px] flex-col items-center justify-center rounded-full border border-slate-500/50 bg-[#1b2630] text-center shadow-[0_8px_25px_rgba(0,0,0,0.22)] sm:right-[10%] sm:h-[124px] sm:w-[124px]">
                <FileCheck className="mb-2 h-6 w-6 text-zinc-200" /><div className="text-[11px] font-black leading-tight text-zinc-100">RECEIPT<br />ISSUED</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="ui-meta rounded-xl border border-white/[.12] bg-black/[.14] p-4 space-y-1.5">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">Person</div>
                <div className="font-semibold text-white">Sets the job and one limit</div>
                <p className="text-zinc-300 leading-relaxed">The agent never receives an unrestricted wallet. The job maximum and approved destinations are applied before each paid step, so the owner keeps control of spend.</p>
              </div>
              <div className="ui-meta rounded-xl border border-[#d7ff4f]/25 bg-[#d7ff4f]/[.035] p-4 space-y-1.5">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#d7ff4f]">Agent</div>
                <div className="font-semibold text-white">Buys the missing steps</div>
                <p className="text-zinc-300 leading-relaxed">It can call an API, an SDK-enabled site, or another specialist only when that step helps finish the job, without a human checkout.</p>
              </div>
              <div className="ui-meta rounded-xl border border-white/[.12] bg-black/[.14] p-4 space-y-1.5">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">Provider</div>
                <div className="font-semibold text-white">Defines a paid machine route</div>
                <p className="text-zinc-300 leading-relaxed">In a production integration, the provider sets its own payee address in the SDK. This demo settles to the shared SynapseMPPReceiver gateway so the payment path can be inspected.</p>
              </div>
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
                    <span><strong className="text-zinc-300">Scrapers:</strong> absorb proxy and CAPTCHA costs before a useful response can be delivered.</span>
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
                </div>
                <ul className="space-y-1.5 text-[11px] text-zinc-200">
                  <li className="flex items-center gap-2">
                    <Coins className="w-3.5 h-3.5 text-[#d7ff4f] shrink-0" />
                    <span><strong className="text-white">Providers:</strong> a small SDK lets agents pay for the exact API call, tool, or access they use — a fair pay-per-use model that makes joining worthwhile and grows partner participation.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-[#d7ff4f] shrink-0" />
                    <span><strong className="text-white">Tempo L1:</strong> A selectable TIP-20 fee token supports <strong className="text-[#d7ff4f]">0.1¢ machine micropayments</strong>; the live fee is shown on the confirmed receipt.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#d7ff4f] shrink-0" />
                    <span><strong className="text-white">AI Agents:</strong> buy only the data, API access, or software step they need, so they can finish jobs without subscriptions or manual checkout.</span>
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
                <div className="text-xs font-bold text-[#d7ff4f]">Settle each approved route</div>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  Each approved step is checked against the job limit and settled through the configured receiver; a live receipt can be checked on-chain.
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
                <span><strong className="text-white font-semibold">One shared loop:</strong> people assign work, agents buy only what they need, and providers earn for each completed step — so every side has a reason to participate.</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-[10.5px] text-zinc-200 space-y-0.5">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-zinc-400 flex items-center gap-1"><Bot className="w-3 h-3 text-zinc-300" /> Buyer:</span>
                    <span className="text-white font-bold">Pay-per-use</span>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-zinc-400 flex items-center gap-1"><Globe className="w-3 h-3 text-zinc-300" /> Provider:</span>
                    <span className="text-[#d7ff4f] font-bold">Illustrative split: 99.9%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Intro Header: Two-Sided Market Flywheel */}
          <div className="bg-white/[.025] backdrop-blur-md border border-white/[.08] rounded-2xl p-6 sm:p-7 shadow-sm relative overflow-hidden mt-8">
            <div className="absolute right-0 top-0 w-80 h-80 bg-[#d7ff4f]/5 rounded-full blur-3xl pointer-events-none"></div>
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
                  Sets the goal, budget, and approved providers. This keeps the work predictable while the agent works without an unrestricted wallet.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[.035] border border-white/[.1] space-y-2">
                <div className="flex items-center gap-1.5 text-white font-bold">
                  <Globe className="w-4 h-4 text-zinc-300" />
                  <span>Provider who supplies a step</span>
                </div>
                <p className="text-zinc-300 leading-relaxed text-[11px]">
                  Adds the SDK and chooses the payee address for its paid route. This demo uses one shared receiver gateway; a production provider can route an approved request to its own wallet.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Micropayment Economics & Route Simulator */}
          <div className="space-y-4 mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wide">Payment example</span>
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
                    Select Work Batch Volume:
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
                      <span className="text-zinc-300 font-bold">Illustrative: $0.30 fixed + 2.9%</span>
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
                        USD (Illustrative fixed-fee comparison)
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-400">Payout Finality:</span>
                      <span className="text-zinc-400">Illustrative processor window</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    This comparison assumes a $0.30 fixed card fee and 2.9% rate; actual processor terms vary. Under that assumption, a 0.1¢ request loses its margin before delivery.
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
                      ILLUSTRATIVE PAYOUT MODEL (0.1% FEE)
                    </span>
                  </div>
                  <div className="space-y-1.5 font-mono text-[11px] text-zinc-200">
                    <div className="flex justify-between py-1 border-b border-white/[.06]">
                      <span className="text-zinc-400">Gross Spend ({calcCalls.toLocaleString()} queries):</span>
                      <span className="text-white font-bold">${(calcCalls * calcPriceUsd).toFixed(4)} USD</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[.06]">
                      <span className="text-zinc-400">Illustrative provider payout (99.9%):</span>
                      <span className="text-[#d7ff4f] font-bold">
                        +${(calcCalls * calcPriceUsd - calcCalls * Math.max(0.000001, calcPriceUsd * 0.001)).toFixed(4)} USD
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[.06]">
                      <span className="text-zinc-400">Synapse Protocol Fee (0.1%):</span>
                      <span className="text-[#d7ff4f] font-bold">
                        ${(calcCalls * Math.max(0.000001, calcPriceUsd * 0.001)).toFixed(6)} USD
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-400">Illustrative chain cost:</span>
                      <span className="text-white font-bold">Estimate only · live value on receipt</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    This illustrative payout model shows what a provider could receive after configuring its own payee. In this hackathon demo, confirmed payments go to the shared SynapseMPPReceiver gateway; the receipt shows that receiver explicitly.
                  </p>
                </div>
              </div>

              {/* Simulation Result Details */}
              {routeResult && (
                <div className="p-4 rounded-xl bg-[#d7ff4f]/[.08] border border-[#d7ff4f]/30 space-y-2 animate-fadeIn font-mono text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[#d7ff4f] font-bold">
                      <Calculator className="w-4 h-4" />
                      <span>Example route calculated — no live payment was sent.</span>
                    </div>
                    <span className="text-[11px] text-zinc-400">Calculated at {routeResult.calculatedAt} · no transaction submitted</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                    <div className="p-2 rounded bg-white/[.025] border border-white/10">
                      <span className="text-zinc-400 block text-[10px]">Illustrative provider payout (99.9%):</span>
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
                      <span className="text-zinc-400 block text-[10px]">Tempo L1 Fee Token Cost:</span>
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
                        href={TEMPO_EXPLORER_URL}
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
          <details open className="group rounded-2xl border border-white/[.08] bg-white/[.015]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-xs font-bold text-white marker:hidden">
              <span className="flex items-center gap-2">
                <span>What keeps each payment controlled</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500 transition group-open:rotate-180">▼</span>
            </summary>
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <span className="text-xs font-bold text-white tracking-wide">Three rules that control each payment</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pillar 1 */}
            <div className="bg-white/[.03] backdrop-blur-md border border-white/[.08] rounded-xl p-5 space-y-3 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-[#d7ff4f]/[.08] border border-[#d7ff4f]/30 flex items-center justify-center text-[#d7ff4f]">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-[#f5f5f2] flex items-center">
                <span>1. Spending permissions</span>
                <InfoBadge
                  title="EIP-712 Scoped Delegation"
                  text="Secp256k1 cryptographic session keys with strict parameters: maximum spend per call ($0.0050), reusable total cap, and validBefore expiration on SynapseVault.sol."
                />
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                A normal mission creates a restricted session scope from the job maximum automatically. Repeated or background runs can reuse a stricter key with a reusable total cap, a per-call ceiling, and approved-provider limits, so one bad request cannot drain the shared treasury.
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
                <span>2. Payment lanes and sequencing</span>
                <InfoBadge
                  title="Tempo L1 2D Nonces"
                  text="Independent 2D nonce counters per bot session key so multiple bots can pay at once without waiting in line."
                />
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                Tempo L1's 2-dimensional nonce structure gives each bot an independent lane, so multiple bots can pay at once without waiting in line or blocking one another.
              </p>
              <div className="text-[11px] font-mono text-[#d7ff4f] bg-white/[.025] p-2.5 rounded-lg border border-white/[.08]">
                Separate payment lanes per agent
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
                  text="The protocol supports independent nonce lanes. This walkthrough confirms work steps in sequence and shows a receipt after confirmation."
                />
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                The protocol supports independent nonce lanes; this walkthrough confirms work steps in sequence. Each confirmed payment carries a reference so the spend can be matched to the work later. Testnet latency varies by RPC and confirmation time.
              </p>
              <div className="text-[11px] font-mono text-[#d7ff4f] bg-white/[.025] p-2.5 rounded-lg border border-white/[.08]">
                Route fee + direct settlement
              </div>
            </div>
          </div>
          </div>
          </details>

          {/* Fee Comparison & Unit Economics */}
          <details open className="group rounded-2xl border border-white/[.08] bg-white/[.015]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-xs font-bold text-white marker:hidden">
              <span className="flex items-center gap-2">
                <span>Why pay per request instead of a subscription</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500 transition group-open:rotate-180">▼</span>
            </summary>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wide">Cost example</span>
                <span className="text-xs font-bold text-white tracking-wide flex items-center">
                  <span>Economic Architecture & Compliance</span>
                  <InfoBadge
                    title="Machine-to-Machine Unit Economics"
                    text="Traditional banking rails can impose fixed fees that are poorly suited to tiny machine calls. Tempo L1 supports sub-cent settlement through a selectable TIP-20 fee token."
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
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Traditional credit card fees are shown here as an illustrative comparison; Tempo L1 supports sub-cent settlement with a selectable TIP-20 fee token, while the live value is read from the receipt.
                </p>
                <div className="text-[11px] font-mono text-[#d7ff4f] bg-white/[.025] p-2 rounded-lg border border-white/[.06]">
                  Tempo L1 fee token: estimate only · live value on receipt
                </div>
              </div>

              <div className="bg-white/[.03] backdrop-blur-md border border-white/[.08] rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white">Blocked requests can become paid access</span>
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
                  Instead of brittle scrapers, proxy layers, and CAPTCHA solving, AI agents pay <strong className="text-[#d7ff4f]">0.1¢</strong> directly for clean, structured JSON.
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
          <details open className="group rounded-2xl border border-white/[.08] bg-white/[.015]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-xs font-bold text-white marker:hidden">
              <span className="flex items-center gap-2">
                <span>Contracts, addresses and network checks</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500 transition group-open:rotate-180">▼</span>
            </summary>
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
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
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              The project is configured for Tempo Moderato Testnet (Chain ID {TEMPO_CHAIN_ID}). Open the addresses below to verify the contracts and network record; a sandbox connection does not claim a new on-chain deployment.{' '}
              <a
                href={`${TEMPO_EXPLORER_URL}/address/${TEMPO_VAULT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#d7ff4f] hover:underline font-mono"
              >
                0x3c42E27...
              </a>{' '}
              (SynapseVault) and{' '}
              <a
                href={`${TEMPO_EXPLORER_URL}/address/${TEMPO_RECEIVER_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#d7ff4f] hover:underline font-mono"
              >
                0xfCEb1a2...
              </a>{' '}
              (SynapseMPPReceiver) are the configured contract addresses. Use “Check network status” below to verify live bytecode and the latest confirmed receipt:
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
                href={`${TEMPO_EXPLORER_URL}/address/${TEMPO_VAULT_ADDRESS}`}
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
                      href={`${TEMPO_EXPLORER_URL}/address/${deployedAddresses.vault}`}
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
                      href={`${TEMPO_EXPLORER_URL}/address/${deployedAddresses.gateway}`}
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
                    href={deployedAddresses.txHash.length === 66 && deployedAddresses.txHash.startsWith('0x')
                      ? tempoTransactionUrl(deployedAddresses.txHash)
                      : tempoAddressUrl(deployedAddresses.vault)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 bg-white/[.03] p-1.5 rounded text-[#d7ff4f] hover:underline font-mono truncate flex items-center justify-between group border border-white/10"
                  >
                    <span className="truncate">{deployedAddresses.txHash || deployedAddresses.vault}</span>
                    <ExternalLink className="w-3 h-3 text-[#d7ff4f] shrink-0 ml-1" />
                  </a>
                </div>
              </div>
            )}
          </div>
          </div>
          </details>

          {/* Small, realistic roadmap for the jury. Keep it at the end of How It Works. */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-[#0c0e14] p-5 sm:p-6 space-y-4">
            <div className="border-b border-white/10 pb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#d7ff4f] font-bold">
                Where this goes next
              </span>
              <h4 className="text-base font-bold text-white tracking-tight mt-0.5">
                Start narrow. Prove the loop. Expand from there.
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              <div className="rounded-xl border border-[#d7ff4f]/30 bg-[#d7ff4f]/[0.04] p-4 space-y-2">
                <span className="inline-flex text-[10px] font-mono font-black uppercase text-[#d7ff4f] px-2 py-0.5 rounded bg-[#d7ff4f]/15 border border-[#d7ff4f]/30">
                  Today
                </span>
                <div className="text-xs font-bold text-white tracking-tight">Working payment-and-work loop</div>
                <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
                  Tempo payments, spending limits, one real AI mission, a provider SDK route, and receipts that show what happened.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4 space-y-2">
                <span className="inline-flex text-[10px] font-mono font-bold uppercase text-sky-400 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
                  Next
                </span>
                <div className="text-xs font-bold text-white tracking-tight">Real provider network</div>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                  Bring in the first real data providers so an AI can buy the exact resource it needs, request by request, through the SDK.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4 space-y-2">
                <span className="inline-flex text-[10px] font-mono font-bold uppercase text-violet-400 px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20">
                  Then
                </span>
                <div className="text-xs font-bold text-white tracking-tight">Autonomous work economy</div>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                  Let longer-running workers combine several providers and specialist agents while one job budget keeps the work bounded.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4 space-y-2">
                <span className="inline-flex text-[10px] font-mono font-bold uppercase text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  Future
                </span>
                <div className="text-xs font-bold text-white tracking-tight">Paid machine resources</div>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                  Extend the same pattern to GPU compute, IoT devices, robotics, and other machine-to-machine services.
                </p>
              </div>
            </div>

            <p className="border-t border-white/10 pt-3 text-xs leading-relaxed text-zinc-300">
              The hackathon demo proves the payment-and-work loop; the roadmap is turning that loop into an open network of AI workers and paid machine resources.
            </p>
          </div>
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
                {activeContract === 'vault' ? 'SynapseVault.sol (Simplified architecture excerpt — see contracts/src/SynapseVault.sol)' : 'SynapseMPPReceiver.sol'}
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
