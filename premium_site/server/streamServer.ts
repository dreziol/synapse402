import { Request, Response } from 'express';
import { synapseEngine, sha256 } from './synapseCore';

// =======================================================================
// Server-Sent Events (SSE) AI Inference Stream with budgeted payment tracking.
// Tokens are counted off-chain and one final payment record is created on completion/abort.
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
    " Audit", " result", " prepared", " with", " ISO-20022", " remittance", " details", " for", " review."
  ],
  general_ai: [
    "Model", " Context", " Protocol", " (MCP)", " streaming", " inference", " active.", " Real-time", " token", " throughput",
    " tracked", " against", " the", " configured", " budget.", " A", " final", " payment", " record", " is", " created",
    " on", " completion", " when", " a", " live", " wallet", " is", " connected."
  ]
};

function generateDynamicTokens(prompt: string | undefined, topic: string, key: any): string[] {
  if (prompt && typeof prompt === 'string' && prompt.trim().length > 0) {
    const p = prompt.toLowerCase();
    let text = '';
    if (p.includes('tempo') || p.includes('l1') || p.includes('chain')) {
      text = `Tempo L1 can provide the settlement layer for autonomous machine-to-machine micropayments. Synapse402 uses 2D nonces (ChannelID : SequenceNonce) to keep agent payment lanes independent. This evaluation counts the work first; a live wallet is required before a chain receipt exists.`;
    } else if (p.includes('guardrail') || p.includes('security') || p.includes('merkle') || p.includes('injection')) {
      text = `Synapse402 enforces cryptographic policy boundaries through scoped EIP-712 session delegations. Authorized API endpoints are anchored to an on-chain Merkle tree. If an adversarial prompt injection instructs an agent to exfiltrate funds to an unwhitelisted destination, SynapseVault.sol mathematically rejects the transaction with EndpointNotWhitelisted, guaranteeing corporate treasury immunity.`;
    } else if (p.includes('deepseek') || p.includes('llm') || p.includes('token') || p.includes('model') || p.includes('ai')) {
      text = `On-demand LLM token streaming avoids fixed monthly commitments. The agent counts generated tokens against its cap and creates one final payment record for the delivered portion. If the client disconnects, counting stops at the last delivered token.`;
    } else if (p.includes('arbitrage') || p.includes('market') || p.includes('trade') || p.includes('quant')) {
      text = `Quantitative agents can compare cross-venue market depth and prepare an arbitrage plan. Ephemeral feeds are requested on demand within the session budget; execution requires a separate live wallet and trading integration.`;
    } else {
      text = `Processing autonomous inquiry "${prompt.trim()}". Session key [${key.agentName}] checked against its policy and authorized endpoints. Structured output is assembled for review; channel ${key.channelId} tracks the payment plan.`;
    }
    return text.split(/(\s+)/).filter(Boolean);
  }

  if (SAMPLE_GENERATIONS[topic]) {
    return SAMPLE_GENERATIONS[topic];
  }

  return `Inference stream activated for topic [${topic}]. Counting tokens against the pathUSD budget. Payment channel ${key.channelId} is ready for a live receipt when a wallet is connected.`.split(/(\s+)/).filter(Boolean);
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

  if (!Number.isFinite(pricePerToken) || pricePerToken <= 0) {
    res.write(`data: ${JSON.stringify({ error: 'pricePerToken must be a positive finite number.' })}\n\n`);
    res.end();
    return;
  }
  if (pricePerToken > key.maxPerCallPathUsd) {
    res.write(`data: ${JSON.stringify({ error: `pricePerToken exceeds the session per-call limit of $${key.maxPerCallPathUsd.toFixed(6)}.` })}\n\n`);
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
    const liveConfirmed = finalTrace.trace.executionMode === 'LIVE_TESTNET'
      && finalTrace.trace.status === 'SETTLED'
      && typeof finalTrace.trace.txHash === 'string'
      && finalTrace.trace.txHash.startsWith('0x');

    res.write(`data: ${JSON.stringify({
      event: isAborted ? 'STREAM_ABORTED_BY_CLIENT' : 'STREAM_COMPLETED',
      streamId,
      totalTokens: totalTokensStreamed,
      totalTokensStreamed,
      finalCostPathUsd: Number(totalCostCharged.toFixed(6)),
      leakagePrevented: isAborted ? `Cancelled at token ${totalTokensStreamed}/${tokens.length}. Zero overpayment.` : 'Full stream completed.',
      finalTraceId: finalTrace.trace.id,
      executionMode: finalTrace.trace.executionMode,
      paymentStatus: liveConfirmed ? 'SETTLED' : 'EVALUATION_ONLY',
      txHash: liveConfirmed ? finalTrace.trace.txHash : null,
      blockHeight: finalTrace.blockHeight
    })}\n\n`);
  }

  res.end();
}
