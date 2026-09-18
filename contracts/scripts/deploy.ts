import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("==================================================");
  console.log(`🚀 Deploying Synapse402 on Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`👤 Deployer Address: ${deployer.address}`);
  console.log("==================================================");

  // 1. Deploy or link TIP-20 pathUSD token
  let tokenAddress = process.env.TEMPO_PATHUSD_ADDRESS;
  if (!tokenAddress || network.chainId === 31337n) {
    console.log("Deploying Mock TIP-20 pathUSD token...");
    const MockTIP20 = await ethers.getContractFactory("MockTIP20");
    const mockToken = await MockTIP20.deploy("Tempo pathUSD", "pathUSD");
    await mockToken.waitForDeployment();
    tokenAddress = await mockToken.getAddress();
    console.log(`✅ MockTIP20 deployed at: ${tokenAddress}`);
  } else {
    console.log(`Using existing pathUSD at: ${tokenAddress}`);
  }

  // 2. Deploy SynapseVault
  console.log("Deploying SynapseVault (Agent Policy & Escrow Engine)...");
  const SynapseVault = await ethers.getContractFactory("SynapseVault");
  const vault = await SynapseVault.deploy(tokenAddress, deployer.address);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log(`✅ SynapseVault deployed at: ${vaultAddress}`);

  // 3. Deploy SynapseMPPReceiver
  console.log("Deploying SynapseMPPReceiver (HTTP 402 Merchant Gateway)...");
  const SynapseMPPReceiver = await ethers.getContractFactory("SynapseMPPReceiver");
  const receiver = await SynapseMPPReceiver.deploy(tokenAddress, deployer.address);
  await receiver.waitForDeployment();
  const receiverAddress = await receiver.getAddress();
  console.log(`✅ SynapseMPPReceiver deployed at: ${receiverAddress}`);

  // 4. Save Deployment Manifest
  const manifest = {
    network: network.name,
    chainId: Number(network.chainId),
    deployedAt: new Date().toISOString(),
    contracts: {
      pathUSD: tokenAddress,
      SynapseVault: vaultAddress,
      SynapseMPPReceiver: receiverAddress,
    },
    deployer: deployer.address,
  };

  const manifestPath = path.join(__dirname, "../deployment-manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`📄 Deployment manifest saved to: ${manifestPath}`);

  // Auto-sync to Web App config directory
  const webAppConfigDir = path.join(__dirname, "../../premium_site/src/config");
  if (!fs.existsSync(webAppConfigDir)) {
    fs.mkdirSync(webAppConfigDir, { recursive: true });
  }
  const webAppConfigPath = path.join(webAppConfigDir, "deployedContracts.json");
  fs.writeFileSync(webAppConfigPath, JSON.stringify(manifest, null, 2));
  console.log(`🔗 Auto-synced contract addresses to Web App: ${webAppConfigPath}`);

  console.log("==================================================");
  console.log("📝 Copy/Paste these into your premium_site/.env file:");
  console.log(`TEMPO_VAULT_ADDRESS=${vaultAddress}`);
  console.log(`TEMPO_RECEIVER_ADDRESS=${receiverAddress}`);
  console.log(`TEMPO_PATHUSD_ADDRESS=${tokenAddress}`);
  console.log("==================================================");
  console.log("🎉 Synapse402 deployment completed successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
