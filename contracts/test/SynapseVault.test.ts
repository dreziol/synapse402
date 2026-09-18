import { expect } from "chai";
import { ethers } from "hardhat";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { MockTIP20, SynapseVault, SynapseMPPReceiver } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Synapse402 on Tempo L1: Smart Contracts Test Suite", function () {
  let owner: HardhatEthersSigner;
  let agentSigner: HardhatEthersSigner;
  let merchant: HardhatEthersSigner;
  let relayer: HardhatEthersSigner;
  let rogueSigner: HardhatEthersSigner;

  let pathUSD: MockTIP20;
  let vault: SynapseVault;
  let receiver: SynapseMPPReceiver;

  const DECIMALS = 6;
  const parseUSD = (val: number) => BigInt(Math.round(val * 10 ** DECIMALS));

  // Whitelisted Endpoints for AI Agent
  const allowedEndpoints = [
    "https://api.tempo.xyz/v1/weather",
    "https://mcp.deepseek.ai/v1/inference",
    "https://api.anthropic.com/v1/messages",
  ];

  let merkleTree: StandardMerkleTree<[string]>;
  let merkleRoot: string;

  beforeEach(async function () {
    [owner, agentSigner, merchant, relayer, rogueSigner] = await ethers.getSigners();

    // 1. Build Merkle Tree for Endpoints
    merkleTree = StandardMerkleTree.of(
      allowedEndpoints.map((ep) => [ep]),
      ["string"]
    );
    merkleRoot = merkleTree.root;

    // 2. Deploy Mock TIP-20 pathUSD
    const MockTIP20Factory = await ethers.getContractFactory("MockTIP20");
    pathUSD = (await MockTIP20Factory.deploy("Tempo pathUSD", "pathUSD")) as unknown as MockTIP20;
    await pathUSD.waitForDeployment();

    // 3. Deploy SynapseVault
    const VaultFactory = await ethers.getContractFactory("SynapseVault");
    vault = (await VaultFactory.deploy(await pathUSD.getAddress(), owner.address)) as unknown as SynapseVault;
    await vault.waitForDeployment();

    // 4. Deploy SynapseMPPReceiver
    const ReceiverFactory = await ethers.getContractFactory("SynapseMPPReceiver");
    receiver = (await ReceiverFactory.deploy(await pathUSD.getAddress(), owner.address)) as unknown as SynapseMPPReceiver;
    await receiver.waitForDeployment();

    // 5. Fund the Vault with $100 pathUSD
    const initialDeposit = parseUSD(100);
    await pathUSD.approve(await vault.getAddress(), initialDeposit);
    await vault.deposit(initialDeposit);
  });

  describe("Vault Deposits and Session Key Delegation", function () {
    it("Should properly record deposits into the vault", async function () {
      expect(await vault.totalVaultBalance()).to.equal(parseUSD(100));
      expect(await pathUSD.balanceOf(await vault.getAddress())).to.equal(parseUSD(100));
    });

    it("Should register a scoped session key with Merkle whitelist and budget limits", async function () {
      const maxPerCall = parseUSD(0.10); // $0.10 max per HTTP 402 call
      const totalBudget = parseUSD(5.00); // $5.00 total agent budget
      const validBefore = Math.floor(Date.now() / 1000) + 86400 * 7; // 7 days

      await vault.registerSessionKey(
        agentSigner.address,
        maxPerCall,
        totalBudget,
        validBefore,
        merkleRoot
      );

      const session = await vault.sessionKeys(agentSigner.address);
      expect(session.status).to.equal(1); // ACTIVE
      expect(session.maxPerCall).to.equal(maxPerCall);
      expect(session.totalBudget).to.equal(totalBudget);
      expect(session.currentSpent).to.equal(0n);
      expect(session.merkleRoot).to.equal(merkleRoot);
    });
  });

  describe("HTTP 402 Settlement Execution & Policy Enforcement", function () {
    const maxPerCall = parseUSD(0.10);
    const totalBudget = parseUSD(5.00);
    let validBefore: number;

    beforeEach(async function () {
      validBefore = Math.floor(Date.now() / 1000) + 86400 * 7;
      await vault.registerSessionKey(
        agentSigner.address,
        maxPerCall,
        totalBudget,
        validBefore,
        merkleRoot
      );
    });

    it("Should settle payment successfully when called directly by agent session key", async function () {
      const endpoint = allowedEndpoints[0];
      const amount = parseUSD(0.05); // $0.05 < maxPerCall
      const channelId = 1;
      const nonce = 1;
      const deadline = validBefore;
      const memo = ethers.encodeBytes32String("pacs.008.001.08|INV-101");

      // Obtain Merkle Proof
      let proof: string[] = [];
      for (const [i, v] of merkleTree.entries()) {
        if (v[0] === endpoint) {
          proof = merkleTree.getProof(i);
          break;
        }
      }

      const merchantBalanceBefore = await pathUSD.balanceOf(merchant.address);

      // Execute settlement directly by agent
      await expect(
        vault.connect(agentSigner).settle402Payment({
          sessionKey: agentSigner.address,
          channelId: channelId,
          nonce: nonce,
          payee: merchant.address,
          amount: amount,
          endpoint: endpoint,
          merkleProof: proof,
          memo: memo,
          deadline: deadline,
          signature: "0x",
        })
      )
        .to.emit(vault, "PaymentSettled")
        .withArgs(
          agentSigner.address,
          merchant.address,
          amount,
          channelId,
          nonce,
          memo,
          endpoint
        );

      // Verify merchant received net pathUSD (99.9%) and treasury received 0.1% route fee
      const protocolFee = (amount * 10n) / 10000n;
      const merchantBalanceAfter = await pathUSD.balanceOf(merchant.address);
      expect(merchantBalanceAfter - merchantBalanceBefore).to.equal(amount - protocolFee);

      // Verify session spent tracking
      const session = await vault.sessionKeys(agentSigner.address);
      expect(session.currentSpent).to.equal(amount);
      expect(await vault.getRemainingBudget(agentSigner.address)).to.equal(totalBudget - amount);
    });

    it("Should settle payment via relayer with EIP-712 signature from agent", async function () {
      const endpoint = allowedEndpoints[1];
      const amount = parseUSD(0.02);
      const channelId = 2;
      const nonce = 1;
      const deadline = validBefore;
      const memo = ethers.encodeBytes32String("pacs.008|MCP-TOOL-CALL");

      // Merkle proof
      let proof: string[] = [];
      for (const [i, v] of merkleTree.entries()) {
        if (v[0] === endpoint) {
          proof = merkleTree.getProof(i);
          break;
        }
      }

      // EIP-712 Signature
      const network = await ethers.provider.getNetwork();
      const domain = {
        name: "SynapseVault",
        version: "1.0.0",
        chainId: network.chainId,
        verifyingContract: await vault.getAddress(),
      };

      const types = {
        MPPAuthorization: [
          { name: "sessionKey", type: "address" },
          { name: "channelId", type: "uint64" },
          { name: "nonce", type: "uint64" },
          { name: "payee", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "endpointHash", type: "bytes32" },
          { name: "memo", type: "bytes32" },
          { name: "validBefore", type: "uint256" },
        ],
      };

      const endpointHash = merkleTree.leafHash([endpoint]);
      const value = {
        sessionKey: agentSigner.address,
        channelId: channelId,
        nonce: nonce,
        payee: merchant.address,
        amount: amount,
        endpointHash: endpointHash,
        memo: memo,
        validBefore: deadline,
      };

      const signature = await agentSigner.signTypedData(domain, types, value);

      // Relayer submits transaction
      await expect(
        vault.connect(relayer).settle402Payment({
          sessionKey: agentSigner.address,
          channelId: channelId,
          nonce: nonce,
          payee: merchant.address,
          amount: amount,
          endpoint: endpoint,
          merkleProof: proof,
          memo: memo,
          deadline: deadline,
          signature: signature,
        })
      ).to.emit(vault, "PaymentSettled");

      const protocolFee = (amount * 10n) / 10000n;
      expect(await pathUSD.balanceOf(merchant.address)).to.equal(amount - protocolFee);
    });

    it("Should REJECT payment if amount exceeds maxPerCall", async function () {
      const endpoint = allowedEndpoints[0];
      const excessAmount = parseUSD(0.15); // > $0.10 maxPerCall
      const memo = ethers.encodeBytes32String("test");

      await expect(
        vault.connect(agentSigner).settle402Payment({
          sessionKey: agentSigner.address,
          channelId: 1,
          nonce: 1,
          payee: merchant.address,
          amount: excessAmount,
          endpoint: endpoint,
          merkleProof: [],
          memo: memo,
          deadline: validBefore,
          signature: "0x",
        })
      ).to.be.revertedWithCustomError(vault, "ExceedsMaxPerCall");
    });

    it("Should REJECT payment to an unwhitelisted endpoint (Prompt Injection defense)", async function () {
      const maliciousEndpoint = "https://evil-phishing-agent.com/drain";
      const amount = parseUSD(0.01);
      const memo = ethers.encodeBytes32String("exploit");

      // False proof
      const dummyProof = [ethers.ZeroHash];

      await expect(
        vault.connect(agentSigner).settle402Payment({
          sessionKey: agentSigner.address,
          channelId: 1,
          nonce: 1,
          payee: merchant.address,
          amount: amount,
          endpoint: maliciousEndpoint,
          merkleProof: dummyProof,
          memo: memo,
          deadline: validBefore,
          signature: "0x",
        })
      ).to.be.revertedWithCustomError(vault, "EndpointNotWhitelisted");
    });

    it("Should REJECT non-sequential 2D nonce (Replay Attack defense)", async function () {
      const endpoint = allowedEndpoints[0];
      const amount = parseUSD(0.01);
      const memo = ethers.encodeBytes32String("memo");

      let proof: string[] = [];
      for (const [i, v] of merkleTree.entries()) {
        if (v[0] === endpoint) {
          proof = merkleTree.getProof(i);
          break;
        }
      }

      // Step 1: Send nonce 1
      await vault.connect(agentSigner).settle402Payment({
        sessionKey: agentSigner.address,
        channelId: 1,
        nonce: 1,
        payee: merchant.address,
        amount: amount,
        endpoint: endpoint,
        merkleProof: proof,
        memo: memo,
        deadline: validBefore,
        signature: "0x",
      });

      // Step 2: Try to replay nonce 1
      await expect(
        vault.connect(agentSigner).settle402Payment({
          sessionKey: agentSigner.address,
          channelId: 1,
          nonce: 1,
          payee: merchant.address,
          amount: amount,
          endpoint: endpoint,
          merkleProof: proof,
          memo: memo,
          deadline: validBefore,
          signature: "0x",
        })
      ).to.be.revertedWithCustomError(vault, "Invalid2DNonce");
    });

    it("Should REJECT unauthorized signature from rogue signer", async function () {
      const endpoint = allowedEndpoints[0];
      const amount = parseUSD(0.01);
      const channelId = 5;
      const nonce = 1;
      const memo = ethers.encodeBytes32String("memo");

      let proof: string[] = [];
      for (const [i, v] of merkleTree.entries()) {
        if (v[0] === endpoint) {
          proof = merkleTree.getProof(i);
          break;
        }
      }

      const network = await ethers.provider.getNetwork();
      const domain = {
        name: "SynapseVault",
        version: "1.0.0",
        chainId: network.chainId,
        verifyingContract: await vault.getAddress(),
      };
      const types = {
        MPPAuthorization: [
          { name: "sessionKey", type: "address" },
          { name: "channelId", type: "uint64" },
          { name: "nonce", type: "uint64" },
          { name: "payee", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "endpointHash", type: "bytes32" },
          { name: "memo", type: "bytes32" },
          { name: "validBefore", type: "uint256" },
        ],
      };
      const endpointHash = merkleTree.leafHash([endpoint]);
      const value = {
        sessionKey: agentSigner.address,
        channelId: channelId,
        nonce: nonce,
        payee: merchant.address,
        amount: amount,
        endpointHash: endpointHash,
        memo: memo,
        validBefore: validBefore,
      };

      // Rogue signs instead of agentSigner
      const rogueSignature = await rogueSigner.signTypedData(domain, types, value);

      await expect(
        vault.connect(relayer).settle402Payment({
          sessionKey: agentSigner.address,
          channelId: channelId,
          nonce: nonce,
          payee: merchant.address,
          amount: amount,
          endpoint: endpoint,
          merkleProof: proof,
          memo: memo,
          deadline: validBefore,
          signature: rogueSignature,
        })
      ).to.be.revertedWithCustomError(vault, "InvalidSignature");
    });

    it("Should accurately route 0.1% protocol route fee to treasury", async function () {
      expect(await vault.treasury()).to.equal(owner.address);
      const endpoint = allowedEndpoints[0];
      const amount = parseUSD(0.10);
      let proof: string[] = [];
      for (const [i, v] of merkleTree.entries()) {
        if (v[0] === endpoint) {
          proof = merkleTree.getProof(i);
          break;
        }
      }

      const treasuryBefore = await pathUSD.balanceOf(owner.address);
      const merchantBefore = await pathUSD.balanceOf(merchant.address);

      await vault.connect(agentSigner).settle402Payment({
        sessionKey: agentSigner.address,
        channelId: 1,
        nonce: 1,
        payee: merchant.address,
        amount: amount,
        endpoint: endpoint,
        merkleProof: proof,
        memo: ethers.encodeBytes32String("test_treasury_fee"),
        deadline: validBefore,
        signature: "0x",
      });

      const protocolFee = (amount * 10n) / 10000n;
      const payeeAmount = amount - protocolFee;

      const treasuryAfter = await pathUSD.balanceOf(owner.address);
      const merchantAfter = await pathUSD.balanceOf(merchant.address);

      expect(treasuryAfter - treasuryBefore).to.equal(protocolFee);
      expect(merchantAfter - merchantBefore).to.equal(payeeAmount);
    });
  });

  describe("SynapseMPPReceiver Invoice Verification", function () {
    it("Should allow merchant to register an invoice and verify on-chain settlement", async function () {
      const invoiceId = ethers.keccak256(ethers.toUtf8Bytes("INV-AI-QUERY-2026"));
      const price = parseUSD(0.03);
      const memo = ethers.encodeBytes32String("pacs.008|INV-AI-QUERY");

      // Merchant creates invoice
      await receiver.connect(merchant).createInvoice(invoiceId, price);

      // Payer mints & approves receiver
      await pathUSD.mint(agentSigner.address, price);
      await pathUSD.connect(agentSigner).approve(await receiver.getAddress(), price);

      // Settle invoice
      await expect(receiver.connect(agentSigner).settleInvoice(invoiceId, memo))
        .to.emit(receiver, "InvoiceSettled")
        .withArgs(invoiceId, agentSigner.address, merchant.address, price, memo, (val: any) => typeof val === 'bigint');

      // Check invoice status
      const [isPaid, settledBy] = await receiver.isInvoicePaid(invoiceId);
      expect(isPaid).to.be.true;
      expect(settledBy).to.equal(agentSigner.address);
      expect(await pathUSD.balanceOf(merchant.address)).to.equal(price);
    });
  });

  describe("Smart Contract Stress & Variational Testing Suite", function () {
    const maxPerCall = parseUSD(0.10);
    const totalBudget = parseUSD(50.00);
    let validBefore: number;

    beforeEach(async function () {
      validBefore = Math.floor(Date.now() / 1000) + 86400 * 30;
      await vault.registerSessionKey(
        agentSigner.address,
        maxPerCall,
        totalBudget,
        validBefore,
        merkleRoot
      );
    });

    it("STRESS: Should successfully process 30 rapid interleaved transactions across 3 independent 2D channels", async function () {
      const channels = [1, 2, 3];
      const channelNonces: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
      const txCountPerChannel = 10;
      const amountPerTx = parseUSD(0.01);
      const endpoint = allowedEndpoints[0];
      
      let proof: string[] = [];
      for (const [i, v] of merkleTree.entries()) {
        if (v[0] === endpoint) {
          proof = merkleTree.getProof(i);
          break;
        }
      }

      for (let round = 0; round < txCountPerChannel; round++) {
        for (const ch of channels) {
          channelNonces[ch] += 1;
          const currentNonce = channelNonces[ch];
          const memo = ethers.encodeBytes32String(`ch${ch}:n${currentNonce}`);

          const domain = {
            name: "SynapseVault",
            version: "1.0.0",
            chainId: (await ethers.provider.getNetwork()).chainId,
            verifyingContract: await vault.getAddress(),
          };

          const types = {
            MPPAuthorization: [
              { name: "sessionKey", type: "address" },
              { name: "channelId", type: "uint64" },
              { name: "nonce", type: "uint64" },
              { name: "payee", type: "address" },
              { name: "amount", type: "uint256" },
              { name: "endpointHash", type: "bytes32" },
              { name: "memo", type: "bytes32" },
              { name: "validBefore", type: "uint256" },
            ],
          };

          const endpointLeaf = ethers.keccak256(
            ethers.concat([ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["string"], [endpoint]))])
          );

          const sig = await agentSigner.signTypedData(domain, types, {
            sessionKey: agentSigner.address,
            channelId: ch,
            nonce: currentNonce,
            payee: merchant.address,
            amount: amountPerTx,
            endpointHash: endpointLeaf,
            memo,
            validBefore,
          });

          await vault.connect(relayer).settle402Payment({
            sessionKey: agentSigner.address,
            channelId: ch,
            nonce: currentNonce,
            payee: merchant.address,
            amount: amountPerTx,
            endpoint,
            merkleProof: proof,
            memo,
            deadline: validBefore,
            signature: sig,
          });

          const onChainNonce = await vault.lastNonce(agentSigner.address, ch);
          expect(onChainNonce).to.equal(BigInt(currentNonce));
        }
      }

      const session = await vault.sessionKeys(agentSigner.address);
      const expectedTotalSpent = amountPerTx * BigInt(channels.length * txCountPerChannel);
      expect(session.currentSpent).to.equal(expectedTotalSpent);
    });

    it("VARIATION: Exact budget exhaustion down to the micro-cent and strict rejection on overdraft", async function () {
      const tightBudget = parseUSD(0.05);
      const agentTight = rogueSigner; // use distinct signer
      await vault.registerSessionKey(
        agentTight.address,
        tightBudget,
        tightBudget,
        validBefore,
        merkleRoot
      );

      const endpoint = allowedEndpoints[0];
      let proof: string[] = [];
      for (const [i, v] of merkleTree.entries()) {
        if (v[0] === endpoint) {
          proof = merkleTree.getProof(i);
          break;
        }
      }

      const domain = {
        name: "SynapseVault",
        version: "1.0.0",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: await vault.getAddress(),
      };
      const types = {
        MPPAuthorization: [
          { name: "sessionKey", type: "address" },
          { name: "channelId", type: "uint64" },
          { name: "nonce", type: "uint64" },
          { name: "payee", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "endpointHash", type: "bytes32" },
          { name: "memo", type: "bytes32" },
          { name: "validBefore", type: "uint256" },
        ],
      };
      const endpointLeaf = ethers.keccak256(
        ethers.concat([ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["string"], [endpoint]))])
      );

      const sigExact = await agentTight.signTypedData(domain, types, {
        sessionKey: agentTight.address,
        channelId: 1,
        nonce: 1,
        payee: merchant.address,
        amount: tightBudget,
        endpointHash: endpointLeaf,
        memo: ethers.encodeBytes32String("exact_spend"),
        validBefore,
      });

      await vault.connect(relayer).settle402Payment({
        sessionKey: agentTight.address,
        channelId: 1,
        nonce: 1,
        payee: merchant.address,
        amount: tightBudget,
        endpoint,
        merkleProof: proof,
        memo: ethers.encodeBytes32String("exact_spend"),
        deadline: validBefore,
        signature: sigExact,
      });

      const s = await vault.sessionKeys(agentTight.address);
      expect(s.currentSpent).to.equal(tightBudget);
      expect(s.status).to.equal(3); // DEPLETED

      // Rejection of 1 micro-cent overdraft
      const sigOver = await agentTight.signTypedData(domain, types, {
        sessionKey: agentTight.address,
        channelId: 1,
        nonce: 2,
        payee: merchant.address,
        amount: 1n,
        endpointHash: endpointLeaf,
        memo: ethers.encodeBytes32String("overdraft_attempt"),
        validBefore,
      });

      await expect(
        vault.connect(relayer).settle402Payment({
          sessionKey: agentTight.address,
          channelId: 1,
          nonce: 2,
          payee: merchant.address,
          amount: 1n,
          endpoint,
          merkleProof: proof,
          memo: ethers.encodeBytes32String("overdraft_attempt"),
          deadline: validBefore,
          signature: sigOver,
        })
      ).to.be.revertedWithCustomError(vault, "SessionNotActive");
    });

    it("VARIATION: Should strictly REJECT zero-amount payment attempts", async function () {
      const endpoint = allowedEndpoints[0];
      let proof: string[] = [];
      for (const [i, v] of merkleTree.entries()) {
        if (v[0] === endpoint) {
          proof = merkleTree.getProof(i);
          break;
        }
      }

      await expect(
        vault.connect(agentSigner).settle402Payment({
          sessionKey: agentSigner.address,
          channelId: 1,
          nonce: 1,
          payee: merchant.address,
          amount: 0n,
          endpoint,
          merkleProof: proof,
          memo: ethers.encodeBytes32String("zero_amount"),
          deadline: validBefore,
          signature: "0x",
        })
      ).to.be.revertedWithCustomError(vault, "ZeroAmount");
    });
  });
});
