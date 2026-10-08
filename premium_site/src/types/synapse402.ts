export interface AgentAccount {
  id: string;
  name: string;
  role: string;
  reusableCapUsd: number;
  cumulativeUsageUsd: number;
  status: 'ACTIVE' | 'PAUSED';
  sessionKey: string;
  /** Unix timestamp after which this session rule must reject payment. */
  validBeforeTimestamp?: number;
  avatarColor: string;
  merkleRoot?: string; // OpenZeppelin StandardMerkleTree root of whitelisted endpoints
  whitelistedDomains?: string[];
}

export interface LivePaymentEvent {
  id: string;
  agentName: string;
  serviceName: string;
  /** Canonical provider label returned by the backend record. */
  providerName?: string;
  serviceUrl: string;
  amountUsd: number;
  latencyMs: number;
  timestamp: string;
  txHash: string;
  /** True only after the backend has matched this receipt to Tempo chain data. */
  receiptVerified?: boolean;
  /** The local showcase may return an example payload while the Tempo payment proof is real. */
  providerDataStatus?: 'EVALUATION_FIXTURE' | 'UPSTREAM_RESPONSE';
  explorerUrl?: string;
  executionMode?: 'LIVE_TESTNET' | 'LIVE_TESTNET_PENDING_CONFIRMATION' | 'RESILIENT_SANDBOX' | 'FAILED_REVERT';
  paymentMode?: 'LIVE_TESTNET' | 'DEMO';
  status?: 'SETTLED' | 'PENDING' | 'SIMULATED_PASS' | 'REJECTED' | 'FAILED' | 'VOIDED' | 'REFUNDED';
  blockNumber: number;
  merkleProof?: string[];
  merkleRoot?: string;
  tip20Memo?: string;
  iso20022Remittance?: {
    standard: 'ISO-20022 pacs.008.001.08';
    costCenter: string;
    categoryCode: string;
    invoiceDigest: string;
  };
  domainHash?: string;
  nonce2D?: string;
  eip712Signature?: string;
  eip712DomainSeparator?: string;
  eip712StructHash?: string;
  challengeHeader?: string;
  authAuthorizationHeader?: string;
  liveProxyPayload?: any;
  complianceVerification?: {
    status: 'CLEARED' | 'FLAGGED' | 'UNVERIFIED';
    policy: string;
    checkedAt: string;
  };
  sanctionsCompliance?: {
    status: 'CLEARED' | 'FLAGGED' | 'UNVERIFIED';
    policy: string;
    checkedAt: string;
  };
}

export interface MonetizedApiEndpoint {
  id: string;
  title: string;
  endpointUrl: string;
  pricePerCallUsd: number;
  category: string;
  totalEarnedUsd: number;
  totalCalls: number;
  integrationSnippet: string;
}
