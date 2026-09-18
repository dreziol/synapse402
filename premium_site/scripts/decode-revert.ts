import { ethers } from 'ethers';

async function main() {
  const provider = new ethers.JsonRpcProvider('https://rpc.moderato.tempo.xyz');
  const txHash = process.argv[2] || process.env.TEMPO_TX_HASH;
  if (!txHash || !ethers.isHexString(txHash, 32)) {
    console.error('Usage: tsx scripts/decode-revert.ts <confirmed 0x transaction hash>');
    return;
  }
  const tx = await provider.getTransaction(txHash);
  if (!tx) {
    console.log('Tx not found');
    return;
  }
  const vaultAddress = '0x3c42E274FAdd8e371fB84f97203CC2F2125c8775';
  const iface = new ethers.Interface([
    "function settle402Payment((address sessionKey, uint64 channelId, uint64 nonce, address payee, uint256 amount, string endpoint, bytes32[] merkleProof, bytes32 memo, uint256 deadline, bytes signature) p) external",
    "function sessionKeys(address) view returns (uint256 maxPerCall, uint256 totalBudget, uint256 currentSpent, uint256 validBefore, bytes32 merkleRoot, uint8 status)",
    "error InvalidTokenAddress()",
    "error ZeroAmount()",
    "error InsufficientVaultBalance()",
    "error SessionNotActive(uint8 currentStatus)",
    "error SessionExpired(uint256 validBefore, uint256 currentTimestamp)",
    "error AuthorizationExpired(uint256 validBefore, uint256 currentTimestamp)",
    "error ExceedsMaxPerCall(uint256 amount, uint256 maxAllowed)",
    "error ExceedsTotalBudget(uint256 requestedTotal, uint256 budget)",
    "error Invalid2DNonce(uint64 expectedNonce, uint64 providedNonce)",
    "error EndpointNotWhitelisted(bytes32 endpointHash, bytes32 merkleRoot)",
    "error InvalidSignature(address recoveredSigner, address expectedSessionKey)"
  ]);
  const decoded = iface.decodeFunctionData("settle402Payment", tx.data);
  console.log("Decoded PaymentParams sessionKey:", decoded.p.sessionKey);
  console.log("Decoded PaymentParams channelId:", decoded.p.channelId.toString());
  console.log("Decoded PaymentParams nonce:", decoded.p.nonce.toString());
  console.log("Decoded PaymentParams endpoint:", decoded.p.endpoint);
  
  try {
    const res = await provider.call({
      from: tx.from,
      to: tx.to,
      data: tx.data,
      gasLimit: tx.gasLimit,
    }, tx.blockNumber - 1);
    console.log('Simulation success:', res);
  } catch (err: any) {
    const errorData = err.data || err.message;
    console.log('Simulation error data:', errorData);
    try {
      const parsed = iface.parseError(errorData);
      console.log('PARSED REVERT ERROR:', parsed?.name, parsed?.args);
    } catch (parseErr: any) {
      console.log('Could not parse error:', parseErr.message);
    }
  }
}

main().catch(console.error);
