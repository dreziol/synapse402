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
    "Example", " compliance", " response", " prepared", " from", " the", " supplied", " evaluation", " fixture.",
    " No", " live", " SEC", " EDGAR", " OFAC", " AML", " or", " sanctions", " lookup", " was", " run.",
    " The", " payment", " record", " and", " ISO-20022", " fields", " remain", " available", " for", " review."
  ],
  general_ai: [
    "Model", " Context", " Protocol", " (MCP)", " streaming", " inference", " active.", " Real-time", " token", " throughput",
    " tracked", " against", " the", " configured", " budget.", " A", " final", " payment", " record", " is", " created",
    " on", " completion", " as", " an", " evaluation", " receipt.", " Live", " streaming", " stays", " disabled", " until", " a", " pre-authorized", " hold", " exists."
  ]
};

function generateDynamicTokens(prompt: string | undefined, topic: string, key: any): string[] {
  if (prompt && typeof prompt === 'string' && prompt.trim().length > 0) {
    const p = prompt.toLowerCase();
    let text = '';
    if (p.includes('tempo') || p.includes('l1') || p.includes('chain')) {
      text = `Tempo L1 can provide the settlement layer for autonomous machine-to-machine micropayments. Synapse402 uses 2D nonces (ChannelID : SequenceNonce) to keep agent payment lanes independent. This stream is evaluation-only: it counts the work and records a local receipt; live output stays disabled until a pre-authorized hold exists.`;
    } else if (p.includes('guardrail') || p.includes('security') || p.includes('merkle') || p.includes('injection')) {
      text = `Synapse402 enforces cryptographic policy boundaries through scoped EIP-712 session delegations. Authorized API endpoints are anchored to an on-chain Merkle tree. If a request targets an unapproved destination, the policy check rejects it before any payment is sent.`;
    } else if (p.includes('deepseek') || p.includes('llm') || p.includes('token') || p.includes('model') || p.includes('ai')) {
      text = `On-demand LLM token streaming avoids fixed monthly commitments. This evaluation demo counts generated tokens against its cap and creates one local receipt for the delivered portion. If the client disconnects, counting stops at the last delivered token.`;
    } else if (p.includes('arbitrage') || p.includes('market') || p.includes('trade') || p.includes('quant')) {
      text = `Quantitative agents can compare cross-venue market depth and prepare an arbitrage plan. Ephemeral feeds are requested on demand within the job maximum; this demo prepares the report and does not submit a trade.`;
    } else {
      text = `Processing autonomous inquiry "${prompt.trim()}". Session key [${key.agentName}] checked against its policy and authorized endpoints. Structured output is assembled for review; channel ${key.channelId} tracks the payment plan.`;
    }
    return text.split(/(\s+)/).filter(Boolean);
  }

  if (SAMPLE_GENERATIONS[topic]) {
    return SAMPLE_GENERATIONS[topic];
  }

  return `Evaluation stream activated for topic [${topic}]. Counting tokens against the pathUSD budget and recording one local receipt. Live output requires a pre-authorized hold.`.split(/(\s+)/).filter(Boolean);
}

export async function handleStreamInference(req: Request, res: Response) {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const keyId = (req.query.keyId as string) || (req.body?.keyId as string);
  const topic = (req.query.topic as string) || (req.body?.topic as string) || 'tempo_arbitrage';
  const rawPricePerToken = req.query.pricePerToken ?? req.body?.pricePerToken;
  const pricePerToken = rawPricePerToken === undefined ? 0.00002 : Number(rawPricePerToken);
  const evaluationOnly = String(req.query.evaluationOnly ?? req.body?.evaluationOnly ?? 'true').toLowerCase() !== 'false';

  // Tokens are emitted before the final aggregate settlement. Do not expose
  // that experimental ordering as a live payment product: live mode would
  // give the provider output away before a chain receipt exists. The UI uses
  // evaluationOnly=true; a future prepaid stream can explicitly replace this
  // guard once a real hold/escrow is wired in.
  if (!evaluationOnly) {
    res.write(`data: ${JSON.stringify({
      event: 'STREAM_UNAVAILABLE_LIVE',
      message: 'Live streamed output requires a pre-authorized stream hold. This demo endpoint is evaluation-only until that hold is available.',
      executionMode: 'RESILIENT_SANDBOX',
      paymentStatus: 'EVALUATION_ONLY'
    })}\n\n`);
    res.end();
    return;
  }

  const keys = synapseEngine.getKeys();
  if (!keyId || !String(keyId).trim()) {
    res.write(`data: ${JSON.stringify({ error: 'keyId is required; streaming cannot choose another spending policy.' })}\n\n`);
    res.end();
    return;
  }
  const key = keys.find((k) => k.id === String(keyId).trim());

  if (!key) {
    res.write(`data: ${JSON.stringify({ error: `Session key "${String(keyId).trim()}" does not exist.` })}\n\n`);
    res.end();
    return;
  }
  if (key.status !== 'ACTIVE') {
    res.write(`data: ${JSON.stringify({ error: `Session key "${key.id}" is not active for streaming settlement.` })}\n\n`);
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
    executionMode: 'RESILIENT_SANDBOX',
    settlementPolicy: 'Evaluation stream: output is delivered before a local receipt; no live payment is sent.',
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
    const maxStreamCost = Number((tokens.length * pricePerToken).toFixed(6));
    let finalTrace: any;
    try {
      // Use the same canonical job ledger and settlement endpoint as every
      // other payment path. Streaming remains evaluation-only until a real
      // prepayment hold exists, but it still gets durable idempotency/history.
      const settlementResponse = await fetch(`http://127.0.0.1:${process.env.PORT || 3001}/api/mpp/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': streamId },
        body: JSON.stringify({
          keyId: key.id,
          // The stream itself is a first-party evaluation route. Point the
          // receipt at the local gateway route so the same SSRF/allowlist
          // policy recognizes it and the final local receipt can be recorded.
          targetUrl: `/api/stream/inference`,
          pricePathUsd: Number(totalCostCharged.toFixed(6)),
          category: `SSE Stream: ${totalTokensStreamed} tokens`,
          idempotencyKey: streamId,
          jobId: streamId,
          jobBudgetPathUsd: maxStreamCost,
          evaluationOnly: true,
          recipient: synapseEngine.receiverAddress,
          asset: 'pathUSD',
          realm: 'Tempo-L1',
        }),
      });
      const settlementData = await settlementResponse.json().catch(() => null);
      if (!settlementResponse.ok || !settlementData?.trace) {
        throw new Error(settlementData?.error || `Streaming settlement failed (HTTP ${settlementResponse.status}).`);
      }
      finalTrace = {
        trace: settlementData.trace,
        blockHeight: settlementData.blockHeight,
      };
    } catch (settlementError: any) {
      res.write(`data: ${JSON.stringify({
        event: 'STREAM_SETTLEMENT_FAILED',
        streamId,
        totalTokens: totalTokensStreamed,
        finalCostPathUsd: Number(totalCostCharged.toFixed(6)),
        executionMode: 'RESILIENT_SANDBOX',
        paymentStatus: 'EVALUATION_ONLY',
        message: settlementError?.message || 'Evaluation receipt could not be recorded.',
      })}\n\n`);
      res.end();
      return;
    }
    const liveConfirmed = finalTrace.trace.executionMode === 'LIVE_TESTNET'
      && finalTrace.trace.status === 'SETTLED'
      && finalTrace.trace.receiptVerified === true
      && typeof finalTrace.trace.txHash === 'string'
      && /^0x[a-fA-F0-9]{64}$/.test(finalTrace.trace.txHash);

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
      settlementPolicy: 'Evaluation stream: no blockchain payment was sent.',
      txHash: liveConfirmed ? finalTrace.trace.txHash : null,
      blockHeight: finalTrace.blockHeight
    })}\n\n`);
  }

  res.end();
}
