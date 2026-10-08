export type KeyStatus = 'ACTIVE' | 'PAUSED' | 'DEPLETED' | 'REVOKED';

export interface ScopedSessionKey {
  id: string;
  agentId: string;
  agentName: string;
  role: string;
  sessionPublicKey: string;
  delegatedBy: string;
  maxPerCallPathUsd: number;
  totalBudgetPathUsd: number;
  currentSpentPathUsd: number;
  whitelistedDomains: string[];
  status: KeyStatus;
  validBeforeTimestamp: number;
  channelId: number; // 2D nonce channel index
  sequenceNonce: number;
  lastActive: string;
  merkleRoot?: string; // OpenZeppelin StandardMerkleTree root of whitelisted domains
}

export interface MPPChallenge {
  statusCode: 402;
  realm: string;
  asset: 'pathUSD' | 'alphaUSD' | 'USDC.e';
  price: number;
  payeeAddress: string;
  scheme: 'tempo-mpp-eip712' | 'tempo-tip1034';
  challengeNonce: string;
}

export interface MPPExecutionTrace {
  id: string;
  timestamp: string;
  blockNumber: number;
  agentId: string;
  agentName: string;
  targetEndpoint: string;
  method: 'GET' | 'POST';
  costPathUsd: number;
  latencyMs: number;
  httpStatusBefore: 402;
  httpStatusAfter: 200;
  status?: 'SETTLED' | 'FAILED' | 'VOIDED' | 'PENDING' | 'SIMULATED_PASS' | 'REJECTED' | 'REFUNDED';
  /** True when the gateway returned a previously settled request by idempotency key. */
  isIdempotentCacheHit?: boolean;
  executionMode?: 'LIVE_TESTNET' | 'RESILIENT_SANDBOX' | 'LIVE_TESTNET_PENDING_CONFIRMATION' | 'FAILED_REVERT' | string;
  txHash?: string | null;
  /** Set only after the canonical Tempo receipt verifier finds the exact TIP-20 transfer. */
  receiptVerified?: boolean;
  providerDataStatus?: 'EVALUATION_FIXTURE' | 'UPSTREAM_RESPONSE';
  mppCredential?: {
    signer: string;
    channelId: number;
    nonce: number;
    payee: string;
    amountMicro: string;
    endpoint: string;
    endpointHash: string;
    memo: string;
    validBefore: number;
    chainId: number;
    verifyingContract: string;
  };
  challengeHeader: string;
  authAuthorizationHeader: string;
  eip712Signature: string;
  tempoTxType: '0x76';
  nonce2D: string;
  memoPayload: string;
  routerFeePathUsd: number;
  tip20Memo?: string; // 32-byte hex TIP-20 Transfer Memo (ISO 20022 audit digest)
  iso20022Remittance?: {
    standard: 'ISO-20022 pacs.008.001.08';
    costCenter: string;
    categoryCode: string;
    invoiceDigest: string;
  };
  merkleProof?: string[]; // StandardMerkleTree proof verifying the target domain
  merkleRoot?: string; // OpenZeppelin StandardMerkleTree root
  domainHash?: string; // Canonical double-keccak endpoint leaf
  eip712DomainSeparator?: string; // Real EIP-712 domain hash separator
  eip712StructHash?: string; // Real EIP-712 message structure hash
  liveProxyPayload?: any; // Real HTTP payload fetched through reverse proxy
  sanctionsCompliance?: {
    status: 'CLEARED' | 'FLAGGED' | 'UNVERIFIED';
    policy: string;
    checkedAt: string;
  };
}

export interface PaywalledEndpoint {
  id: string;
  name: string;
  url: string;
  category: 'Market Depth' | 'Derivatives RFQ' | 'Academic Graph' | 'Regulatory Data' | 'Bytecode Audit' | 'LLM Compute';
  pricePathUsd: number;
  samplePayloadSummary: string;
  provider: string;
  complianceStatus?: 'VERIFIED' | 'COMPLIANT';
}

export interface VaultMetrics {
  totalVaultLiquidity: number; // pathUSD
  availableUnreservedLiquidity: number;
  reservedAgentBudgets: number;
  totalVolumeSettledPathUsd: number;
  totalTransactionsCount: number;
  protocolFeeRevenuePathUsd: number; // 0.1% protocol micro-cut & yield reserve
  averageResponseLatencyMs?: number;
  averageFinalityMs: number;
  settlementSuccessRate: number;
  blockHeight?: number;
}
