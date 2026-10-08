import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Signer address:", signer.address);

  const vaultAddress = process.env.TEMPO_VAULT_ADDRESS || "0x3c42E274FAdd8e371fB84f97203CC2F2125c8775";
  const vault = await ethers.getContractAt("SynapseVault", vaultAddress);

  const sessionKey = "0x0c929C42048bA76A170fD3fE0Cf7d0A12aC429c6";
  const newMerkleRoot = "0x758017654d05c7b05fdcab605a927da4cb349c575b93d4ccfa804863fe187e11";

  console.log("Checking current on-chain config for:", sessionKey);
  const currentConfig = await vault.sessionKeys(sessionKey);
  console.log("Current on-chain Merkle root:", currentConfig.merkleRoot);
  console.log("Status:", currentConfig.status.toString());

  const status = Number(currentConfig.status);
  if (status === 0) {
    console.log("Session is inactive; registering it with the updated Merkle root:", newMerkleRoot);
    const tx = await vault.registerSessionKey(
      sessionKey,
      ethers.parseUnits("10", 6),
      ethers.parseUnits("50", 6),
      BigInt(Math.floor(Date.now() / 1000) + 86400 * 30),
      newMerkleRoot,
      { gasLimit: 500000 }
    );
    console.log("Tx hash:", tx.hash);
    await tx.wait(1);
  } else {
    console.log("Updating Merkle root without resetting cumulative spend:", newMerkleRoot);
    const tx = await vault.updateSessionMerkleRoot(sessionKey, newMerkleRoot, { gasLimit: 500000 });
    console.log("Tx hash:", tx.hash);
    await tx.wait(1);
  }
  console.log("Successfully synchronized Merkle root on-chain!");

  const updatedConfig = await vault.sessionKeys(sessionKey);
  console.log("Verified on-chain Merkle root:", updatedConfig.merkleRoot);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
