import type { TrapScoreResult, TrapVerdict } from "@fomo/shared";

/**
 * Rule-based analyst summary for a TrapScore result. The output reads like a
 * 1–2 sentence "what does the evidence say" line — never as a buy/sell call,
 * never claiming financial advice.
 */

const VERDICT_OPENERS: Record<TrapVerdict, string> = {
  "Critical Trap":
    "Critical Trap pattern: pump while smart money, insiders, and liquidity exit.",
  "Exit Warning":
    "Evidence suggests possible exit-liquidity behavior.",
  "Risky Chase":
    "Signal is mixed — TrapScore indicates elevated chase risk.",
  "Clean Pump":
    "Risk intelligence: pattern looks healthy."
};

export type ExplainInput = {
  symbol: string;
  priceChange1h?: number;
  result: TrapScoreResult;
};

export function explainTrapScore(input: ExplainInput): string {
  const { symbol, result, priceChange1h } = input;
  const opener = VERDICT_OPENERS[result.verdict];
  const topReasons = result.reasons
    .slice(0, 3)
    .map((r) => r.message)
    .join(" ");

  const priceClause =
    typeof priceChange1h === "number"
      ? `$${symbol} is ${priceChange1h >= 0 ? "up" : "down"} ${Math.abs(
          priceChange1h
        ).toFixed(1)}% in 1h.`
      : `$${symbol}.`;

  return `${priceClause} ${opener}${topReasons ? ` ${topReasons}` : ""}`.trim();
}
