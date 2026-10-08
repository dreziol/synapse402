import { ethers } from 'ethers';

/** Canonical StandardMerkleTree endpoint binding (double-keccak leaf). */
export function canonicalizeEndpoint(endpoint: string): string {
  return String(endpoint || '').toLowerCase().trim();
}

export function canonicalEndpointHash(endpoint: string): string {
  const encoded = ethers.AbiCoder.defaultAbiCoder().encode(['string'], [canonicalizeEndpoint(endpoint)]);
  return ethers.keccak256(ethers.keccak256(encoded));
}
