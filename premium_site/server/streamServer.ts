import { Request, Response } from 'express';
import { synapseEngine, sha256 } from './synapseCore';

// =======================================================================
// Server-Sent Events (SSE) AI Inference Stream with Tempo L1 Settlement
// Off-chain token counter with atomic batch settlement on Tempo L1 upon completion/abort.
// Abort-Safe: If client terminates stream, unread tokens are never settled.
// =======================================================================

const SAMPLE_GENERATIONS: Record<string, string[]> = {
  tempo_arbitrage: [
    "Tempo", " L1", " introduces", " native", " financial", " primitives", " tailored", " specifically", " for", " autonomous",
    " high-frequency", " algorithmic", " agents.", " Unlike", " traditional", " EVM", " state", " transitions", " which", " suffer",
    " from", " sequential", " nonce", " head-of-line", " blocking,", " Tempo", " employs", " 2D", " nonces", " (ChannelID", " :",
    " SequenceNonce).", " This", " permits", " simultaneous", " multi-lane", " execution", " across", " distinct", " counterparty",
    " routes.", " Concurrently,", " TIP-20", " sub-cent", " pathUSD", " transfers", " execute", " with", " sub-second", " finality."
  ],
  sec_audit: [
    "Autonomous", " regulatory", " scan", " initialized", " across", " SEC", " EDGAR", " structured", " 10-K", " filings.",
    " Analyzing", " Item", " 1A", " Risk", " Factors", " against", " on-chain", " smart", " contract", " bytecode.",
    " Discovered", " 0", " direct", " sanctions", " overlaps", " under", " OFAC", " sanctions", " compliance", " registry.",
    " Settlement", " voucher", " minted", " with", " ISO-20022", " pacs.008", " structured", " remittance", " identifier."
  ],
  general_ai: [
    "Model", " Context", " Protocol", " (MCP)", " streaming", " inference", " active.", " Real-time", " token", " throughput",
    " verified", " via", " continuous", " cryptographic", " micro-vouchers.", " Every", " generated", " word", " corresponds",
    " to", " exact", " compute", " resource", " consumption", " settled", " directly", " in", " pathUSD."
  ]
};

function generateDynamicTokens(prompt: string | undefined, topic: string, key: any): string[] {
  if (prompt && typeof prompt === 'string' && prompt.trim().length > 0) {
    const p = prompt.toLowerCase();
    let text = '';
    if (p.includes('tempo') || p.includes('l1') || p.includes('chain')) {
      text = `Tempo L1 operates as a purpose-built settlement layer optimized for autonomous machine-to-machine micropayments. By leveraging 2D nonces (ChannelID : SequenceNonce), parallel agent transactions execute without head-of-line blocking. Each payment integrates TIP-20 ISO 20022 metadata, enabling sub-second finality (~135ms) at less than $0.00002 gas overhead per atomic transfer.`;
    } else if (p.includes('guardrail') || p.includes('security') || p.includes('merkle') || p.includes('injection')) {
      text = `Synapse402 enforces cryptographic policy boundaries through scoped EIP-712 session delegations. Authorized API endpoints are anchored to an on-chain Merkle tree. If an adversarial prompt injection instructs an agent to exfiltrate funds to an unwhitelisted destination, SynapseVault.sol mathematically rejects the transaction with EndpointNotWhitelisted, guaranteeing corporate treasury immunity.`;
    } else if (p.includes('deepseek') || p.includes('llm') || p.includes('token') || p.includes('model') || p.includes('ai')) {
      text = `On-demand LLM token streaming eliminates fixed monthly subscriptions. Through HTTP 402 pay-per-token metering ($0.0008 per inference), autonomous agents stream reasoning tokens directly from inference nodes with per-word micro-vouchers. If client network connectivity drops or the request aborts, compute billing halts immediately with zero balance waste.`;
    } else if (p.includes('arbitrage') || p.includes('market') || p.includes('trade') || p.includes('quant')) {
      text = `High-frequency quantitative trading agents execute millisecond cross-venue arbitrage across Tempo L1 orderbooks. Ephemeral market depth feeds are purchased on-demand using atomic Type 0x76 transactions, eliminating multi-thousand dollar monthly exchange terminal retainers.`;
    } else {
      text = `Processing autonomous inquiry "${prompt.trim()}". Synapse402 session key [${key.agentName}] verified on Tempo Moderato (Chain 42431). Synthesized structured machine deliverable across authorized data endpoints with zero human authentication. Settlement channel ${key.channelId} active with 2D nonce sequence.`;
    }
    return text.split(/(\s+)/).filter(Boolean);
  }

  if (SAMPLE_GENERATIONS[topic]) {
    return SAMPLE_GENERATIONS[topic];
  }

  return `Inference stream activated for topic [${topic}]. Computing cryptographic verification on Tempo L1 with real-time token debit in pathUSD. Settlement channel ${key.channelId} active with 2D nonce sequence.`.split(/(\s+)/).filter(Boolean);
}

export async function handleStreamInference(req: Request, res: Response) {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const keyId = (req.query.keyId as string) || (req.body?.keyId as string);
  const topic = (req.query.topic as string) || (req.body?.topic as string) || 'tempo_arbitrage';
  const pricePerToken = Number(req.query.pricePerToken || req.body?.pricePerToken || 0.00002);

  const keys = synapseEngine.getKeys();
  const key = keys.find((k) => k.id === keyId) || keys.find((k) => k.status === 'ACTIVE') || keys[0];

  if (!key) {
    res.write(`data: ${JSON.stringify({ error: 'No active session key available for streaming settlement.' })}\n\n`);
    res.end();
    return;
  }

  const streamId = `stream_${Date.now()}_${key.sequenceNonce}`;
  const customPrompt = (req.query.prompt as string) || (req.body?.prompt as string);
  const tokens = generateDynamicTokens(customPrompt, topic, key);

  let totalTokensStreamed = 0;
  let totalCostCharged = 0;
  let isAborted = false;

  // Handle client disconnect / abort signal
  req.on('close', () => {
    isAborted = true;
  });

  res.write(`data: ${JSON.stringify({
    event: 'STREAM_STARTED',
    streamId,
    agentId: key.agentId,
    pricePerTokenPathUsd: pricePerToken,
    sessionPublicKey: key.sessionPublicKey,
    timestamp: new Date().toISOString()
  })}\n\n`);

  for (let i = 0; i < tokens.length; i++) {
    if (isAborted) {
      break;
    }

    // Check budget
    if (key.currentSpentPathUsd + pricePerToken > key.totalBudgetPathUsd) {
      res.write(`data: ${JSON.stringify({
        event: 'STREAM_HALTED_BUDGET_EXHAUSTED',
        streamId,
        message: 'Stream stopped: Session key budget limit reached.',
        totalTokens: totalTokensStreamed,
        totalCostPathUsd: Number(totalCostCharged.toFixed(6))
      })}\n\n`);
      break;
    }

    const tokenChunk = tokens[i];
    totalTokensStreamed++;
    totalCostCharged += pricePerToken;

    const chunkNonce = `0x01:0x${(key.sequenceNonce + totalTokensStreamed).toString(16).padStart(4, '0')}`;
    const tokenHash = sha256(`${streamId}:${totalTokensStreamed}:${tokenChunk}`);
    const provisionalSpent = Number((key.currentSpentPathUsd + totalCostCharged).toFixed(6));
    const provisionalAvailable = Math.max(0, Number((key.totalBudgetPathUsd - provisionalSpent).toFixed(4)));

    res.write(`data: ${JSON.stringify({
      event: 'TOKEN_CHUNK',
      streamId,
      tokenIndex: i,
      token: tokenChunk,
      nonce2D: chunkNonce,
      cumulativeCostPathUsd: Number(totalCostCharged.toFixed(6)),
      tokenProofHash: `0x${tokenHash.slice(0, 16)}...`,
      spentSoFar: provisionalSpent,
      availableBudget: provisionalAvailable
    })}\n\n`);

    // Natural token streaming delay (60ms)
    await new Promise((resolve) => setTimeout(resolve, 60));
  }

  // Finalize settlement record in Synapse Engine (commits totalCostCharged exactly once)
  if (totalTokensStreamed > 0) {
    if (totalTokensStreamed > 1) {
      key.sequenceNonce += totalTokensStreamed - 1;
    }
    const finalTrace = await synapseEngine.settle402(
      key.id,
      `https://api.stream.tempo/v1/sse/${topic}`,
      Number(totalCostCharged.toFixed(6)),
      `SSE Stream: ${totalTokensStreamed} tokens`,
      { allowDynamicWhitelist: true, asyncRelay: true }
    );

    res.write(`data: ${JSON.stringify({
      event: isAborted ? 'STREAM_ABORTED_BY_CLIENT' : 'STREAM_COMPLETED',
      streamId,
      totalTokens: totalTokensStreamed,
      totalTokensStreamed,
      finalCostPathUsd: Number(totalCostCharged.toFixed(6)),
      leakagePrevented: isAborted ? `Cancelled at token ${totalTokensStreamed}/${tokens.length}. Zero overpayment.` : 'Full stream completed.',
      finalTraceId: finalTrace.trace.id,
      blockHeight: finalTrace.blockHeight
    })}\n\n`);
  }

  res.end();
}
