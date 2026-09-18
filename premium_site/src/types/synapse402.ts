export interface AgentAccount {
  id: string;
  name: string;
  role: string;
  dailyLimitUsd: number;
  spentTodayUsd: number;
  status: 'ACTIVE' | 'PAUSED';
  sessionKey: string;
  avatarColor: string;
  merkleRoot?: string; // SHA-256 Merkle root of whitelisted endpoints
}

export interface LivePaymentEvent {
  id: string;
  agentName: string;
  serviceName: string;
  serviceUrl: string;
  amountUsd: number;
  latencyMs: number;
  timestamp: string;
  txHash: string;
  executionMode?: 'LIVE_TESTNET' | 'RESILIENT_SANDBOX';
  status?: 'SETTLED' | 'SIMULATED_PASS' | 'REJECTED' | 'VOIDED' | 'REFUNDED';
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
    status: 'CLEARED' | 'FLAGGED';
    policy: string;
    checkedAt: string;
  };
  sanctionsCompliance?: {
    status: 'CLEARED' | 'FLAGGED';
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
