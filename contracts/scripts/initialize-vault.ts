import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("==================================================");
  console.log(`🏦 Initializing SynapseVault on Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`👤 Deployer/Owner Address: ${deployer.address}`);
  console.log("==================================================");

  const tokenAddress = process.env.TEMPO_PATHUSD_ADDRESS || "0x9aa3ef4B60B6e3c440711658ee05780e236ac714";
  const vaultAddress = process.env.TEMPO_VAULT_ADDRESS || "0x3c42E274FAdd8e371fB84f97203CC2F2125c8775";

  const MockTIP20 = await ethers.getContractFactory("MockTIP20");
  const token = MockTIP20.attach(tokenAddress) as any;

  const SynapseVault = await ethers.getContractFactory("SynapseVault");
  const vault = SynapseVault.attach(vaultAddress) as any;

  // 1. Check Deployer Token Balance
  const bal = await token.balanceOf(deployer.address);
  console.log(`💰 Deployer pathUSD Balance: ${ethers.formatUnits(bal, 6)} pathUSD`);

  const depositAmount = ethers.parseUnits("100", 6);
  const vaultBalInit = await vault.totalVaultBalance();
  console.log(`🏦 Current Vault Balance on-chain: ${ethers.formatUnits(vaultBalInit, 6)} pathUSD`);

  if (vaultBalInit < depositAmount) {
    console.log("📝 Approving SynapseVault to spend 100 pathUSD...");
    const approveTx = await token.approve(vaultAddress, ethers.parseUnits("1000", 6));
    await approveTx.wait();
    console.log(`✅ Approved (Tx: ${approveTx.hash})`);

    console.log("📥 Depositing 100 pathUSD into SynapseVault...");
    const depositTx = await vault.deposit(depositAmount);
    await depositTx.wait();
    console.log(`✅ Deposited 100 pathUSD (Tx: ${depositTx.hash})`);
  } else {
    console.log("✅ SynapseVault already has >= 100 pathUSD deposited.");
  }

  const vaultBal = await vault.totalVaultBalance();
  console.log(`🏦 Total Vault Balance on-chain: ${ethers.formatUnits(vaultBal, 6)} pathUSD`);

  // 3. Register Session Keys
  const validBefore = Math.floor(Date.now() / 1000) + 86400 * 365; // 1 year

  // Key 1: Quant Alpha
  const key1 = {
    address: "0x0c929C42048bA76A170fD3fE0Cf7d0A12aC429c6",
    maxPerCall: ethers.parseUnits("0.005", 6),
    totalBudget: ethers.parseUnits("50", 6),
    merkleRoot: "0x0d0d3aada66a65e30d9353cc0d06816be2a7bd143a25a1d2ad3263e11ed3c996",
    name: "AlphaArb-HFT"
  };

  // Key 2: Cortex Research
  const key2 = {
    address: "0x0823f01203A914b4bFE3Ac246e63aECf5C30F584",
    maxPerCall: ethers.parseUnits("0.015", 6),
    totalBudget: ethers.parseUnits("35", 6),
    merkleRoot: "0x95889e3f2ae4a2d4907e42d1baba9858e0da0dd8412413f9ffa3a63bdb6c8f33",
    name: "Cortex-ResearchBot"
  };

  // Key 3: Sec Audit
  const key3 = {
    address: "0x0f52C5054367adF81faf25Fc9BB4f92D4c649669",
    maxPerCall: ethers.parseUnits("0.02", 6),
    totalBudget: ethers.parseUnits("25", 6),
    merkleRoot: "0x0d0d3aada66a65e30d9353cc0d06816be2a7bd143a25a1d2ad3263e11ed3c996",
    name: "SecAudit-Fuzzer"
  };

  const keys = [key1, key2, key3];

  for (const k of keys) {
    console.log(`\n🔑 Registering Session Key for ${k.name} (${k.address})...`);
    const regTx = await vault.registerSessionKey(
      k.address,
      k.maxPerCall,
      k.totalBudget,
      validBefore,
      k.merkleRoot
    );
    await regTx.wait();
    console.log(`✅ Registered ${k.name} (Tx: ${regTx.hash})`);
  }

  console.log("\n==================================================");
  console.log("🎉 SynapseVault Onboarding & Session Key Setup Complete!");
  console.log("==================================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
