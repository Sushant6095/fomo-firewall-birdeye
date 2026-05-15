import { explainTrapScore } from "@fomo/scoring";
import type { TrapScoreResult } from "@fomo/shared";

/**
 * Rule-based analyst summary. Backwards-compatible signature for legacy
 * callers that only carry plain strings — internally we delegate to
 * `@fomo/scoring`'s `explainTrapScore` when a full result is available.
 */
export function summarizeTrapScore(input: {
  symbol: string;
  trapScore: number;
  verdict: string;
  reasons: string[];
  priceChange1h?: number;
}): string {
  const reasons = input.reasons.slice(0, 3).join(" ");
  return `${input.symbol} has a TrapScore of ${input.trapScore}/100 (${input.verdict}). ${reasons}`.trim();
}

export function summarizeTrapResult(
  symbol: string,
  result: TrapScoreResult,
  priceChange1h?: number
): string {
  return explainTrapScore({ symbol, priceChange1h, result });
}
