import http from 'http';
import { ethers } from 'ethers';
import { canonicalEndpointHash, withTempoMpp } from '../src/sdk/index';
import { TEMPO_CHAIN_ID, TEMPO_VAULT_ADDRESS } from '../src/config/network';

const payee = ethers.Wallet.createRandom().address;
const signer = ethers.Wallet.createRandom();
const verifyingContract = TEMPO_VAULT_ADDRESS;
const endpoint = 'https://provider.example/api/resource?symbol=SOL';
const channelId = 1;
const nonce = 7;
const amountMicro = 1000n;
const memo = ethers.encodeBytes32String('receipt-test');
const validBefore = Math.floor(Date.now() / 1000) + 600;
const chainId = TEMPO_CHAIN_ID;
const domain = { name: 'SynapseVault', version: '1.0.0', chainId, verifyingContract };
const types = {
  MPPAuthorization: [
    { name: 'sessionKey', type: 'address' },
    { name: 'channelId', type: 'uint64' },
    { name: 'nonce', type: 'uint64' },
    { name: 'payee', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'endpointHash', type: 'bytes32' },
    { name: 'memo', type: 'bytes32' },
    { name: 'validBefore', type: 'uint256' },
  ],
};

function makeRequest(
  signature: string,
  rpcUrl: string,
  txHash = `0x${'11'.repeat(32)}`,
  signedEndpoint = endpoint,
  requestTarget = '/api/resource?symbol=SOL',
  signedNonce = nonce,
) {
  return {
    headers: {
      host: 'provider.example',
      'x-tempo-mpp-signature': signature,
      'x-tempo-mpp-signer': signer.address,
      'x-tempo-mpp-payee': payee,
      'x-tempo-mpp-amount-micro': amountMicro.toString(),
      'x-tempo-mpp-endpoint': signedEndpoint,
      'x-tempo-mpp-endpoint-hash': canonicalEndpointHash(signedEndpoint),
      'x-tempo-mpp-memo': memo,
      'x-tempo-mpp-valid-before': String(validBefore),
      'x-tempo-mpp-chain-id': String(chainId),
      'x-tempo-mpp-verifying-contract': verifyingContract,
      'x-tempo-mpp-channel-id': String(channelId),
      'x-tempo-mpp-nonce': String(signedNonce),
      'x-tempo-nonce-2d': `0x01:0x${signedNonce.toString(16).padStart(4, '0')}`,
      ...(txHash ? { 'x-tempo-mpp-tx-hash': txHash } : {}),
    },
    protocol: 'https',
    originalUrl: requestTarget,
    url: requestTarget,
    socket: { remoteAddress: '127.0.0.1' },
    rpcUrl,
  } as any;
}

function runMiddleware(middleware: any, req: any) {
  return new Promise<{ status: number; body: any; next: boolean }>((resolve, reject) => {
    let status = 200;
    let body: any = null;
    let next = false;
    const res = {
      status(code: number) { status = code; return this; },
      setHeader() { return this; },
      json(value: any) { body = value; resolve({ status, body, next }); return this; },
    } as any;
    Promise.resolve(middleware(req, res, () => { next = true; resolve({ status, body, next }); })).catch(reject);
  });
}

async function main() {
  const rpc = http.createServer((request, response) => {
    let raw = '';
    request.on('data', (chunk) => { raw += chunk; });
    request.on('end', () => {
      const parsed = JSON.parse(raw || '{}');
      const result = parsed.method === 'eth_chainId' ? '0xa5bf' : null;
      response.setHeader('content-type', 'application/json');
      response.end(JSON.stringify({ jsonrpc: '2.0', id: parsed.id ?? 1, result }));
    });
  });
  await new Promise<void>((resolve) => rpc.listen(0, '127.0.0.1', resolve));
  const address = rpc.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  const rpcUrl = `http://127.0.0.1:${port}`;
  const value = { sessionKey: signer.address, channelId, nonce, payee, amount: amountMicro, endpointHash: canonicalEndpointHash(endpoint), memo, validBefore };
  const signature = await signer.signTypedData(domain, types, value);

  const strict = withTempoMpp({ priceUsd: 0.001, payee, endpointUrl: endpoint, rpcUrl });
  const rejected = await runMiddleware(strict, makeRequest(signature, rpcUrl));
  if (rejected.status !== 402 || rejected.next || !String(rejected.body?.verificationError).includes('INVALID_PAYMENT_PROOF')) {
    throw new Error(`strict receipt check failed: ${JSON.stringify(rejected)}`);
  }

  const attested = withTempoMpp({ priceUsd: 0.001, payee, endpointUrl: endpoint, rpcUrl, verifyPayment: () => true });
  // A gateway attestation can authorize an evaluation request with no chain
  // hash; it cannot bypass the canonical receipt proof when a live hash exists.
  const accepted = await runMiddleware(attested, makeRequest(signature, rpcUrl, ''));
  if (!accepted.next || accepted.status !== 200) {
    throw new Error(`trusted attestation path failed: ${JSON.stringify(accepted)}`);
  }
  const queryMismatchRequest = makeRequest(signature, rpcUrl, '');
  queryMismatchRequest.originalUrl = '/api/resource?symbol=ETH';
  queryMismatchRequest.url = '/api/resource?symbol=ETH';
  const queryMismatch = await runMiddleware(attested, queryMismatchRequest);
  if (queryMismatch.next || queryMismatch.status !== 402 || !String(queryMismatch.body?.verificationError).includes('Signed endpoint')) {
    throw new Error(`query binding failed: ${JSON.stringify(queryMismatch)}`);
  }

  // Local provider routes are signed as canonical paths by the mission
  // gateway. Verify that the provider middleware accepts that form while
  // still binding the request path and query exactly.
  const relativeEndpoint = '/api/resource?symbol=SOL';
  const relativeValue = {
    ...value,
    endpointHash: canonicalEndpointHash(relativeEndpoint),
    nonce: nonce + 1,
  };
  const relativeSignature = await signer.signTypedData(domain, types, relativeValue);
  const relativeMiddleware = withTempoMpp({
    priceUsd: 0.001,
    payee,
    endpointUrl: relativeEndpoint,
    verifyPayment: () => true,
  });
  const relativeAccepted = await runMiddleware(
    relativeMiddleware,
    makeRequest(relativeSignature, rpcUrl, '', relativeEndpoint, relativeEndpoint, nonce + 1),
  );
  if (!relativeAccepted.next || relativeAccepted.status !== 200) {
    throw new Error(`relative endpoint verification failed: ${JSON.stringify(relativeAccepted)}`);
  }

  const relativeQueryMismatchRequest = makeRequest(
    relativeSignature,
    rpcUrl,
    '',
    relativeEndpoint,
    '/api/resource?symbol=ETH',
    nonce + 1,
  );
  const relativeQueryMismatch = await runMiddleware(relativeMiddleware, relativeQueryMismatchRequest);
  if (relativeQueryMismatch.next || relativeQueryMismatch.status !== 402 || !String(relativeQueryMismatch.body?.verificationError).includes('Signed endpoint')) {
    throw new Error(`relative query binding failed: ${JSON.stringify(relativeQueryMismatch)}`);
  }

  rpc.close();
  console.log('SDK receipt verification: PASS (invalid proof rejected; absolute and relative endpoint/query binding verified; evaluation attestation accepted)');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
