import type { FomoDb } from "@fomo/db";
import {
  buildAlertDedupeKey,
  type AlertRecord,
  type AlertType,
  type TrapVerdict
} from "@fomo/shared";
import { log } from "../log";
import type { ScoredToken } from "./score-and-persist";

const VERDICT_RANK: Record<TrapVerdict, number> = {
  "Clean Pump": 0,
  "Risky Chase": 1,
  "Exit Warning": 2,
  "Critical Trap": 3
};

/**
 * Step 5 + 6 of the pipeline.
 *
 * Detect verdict-threshold crossings and persist deduped alerts. A single
 * score can fire multiple alert types (e.g. trapscore_spike *and*
 * smart_money_divergence) — each gets its own dedupe bucket so the bot can
 * pull a clean feed without spam.
 */
export async function detectAlerts(
  db: FomoDb,
  scored: ScoredToken[]
): Promise<AlertRecord[]> {
  const fired: AlertRecord[] = [];

  for (const t of scored) {
    const events = detectFor(t);
    for (const event of events) {
      const { inserted } = await db.insertAlertIfNew(event);
      if (inserted) {
        fired.push(event);
        log.info("alert fired", {
          token: t.address,
          type: event.type,
          verdict: event.verdict,
          trapScore: event.trapScore
        });
      }
    }
  }

  return fired;
}

function detectFor(t: ScoredToken): AlertRecord[] {
  const fromMs = Date.parse(t.snapshot.capturedAt);
  const out: AlertRecord[] = [];

  // 1. TrapScore spike — verdict jumped to a worse tier.
  if (
    t.previous == null ||
    VERDICT_RANK[t.result.verdict] > VERDICT_RANK[t.previous.verdict]
  ) {
    out.push(
      buildAlert({
        type: "trapscore_spike",
        token: t,
        firedAtMs: fromMs,
        headline: t.previous
          ? `$${t.symbol} TrapScore jumped ${t.previous.trapScore} → ${t.result.trapScore}`
          : `$${t.symbol} TrapScore: ${t.result.trapScore}`,
        message: t.summary
      })
    );
  }

  // 2..N — per-signal alerts when the corresponding reason fires above
  //         a meaningful contribution threshold.
  const SIGNAL_TYPES: Array<{ code: string; type: AlertType }> = [
    { code: "SMART_MONEY_DIVERGENCE", type: "smart_money_divergence" },
    { code: "INSIDER_EXIT_PRESSURE", type: "insider_exit_pressure" },
    { code: "LIQUIDITY_FRAGILITY", type: "liquidity_fragility" }
  ];

  for (const { code, type } of SIGNAL_TYPES) {
    const reason = t.result.reasons.find((r) => r.code === code);
    if (!reason || reason.contribution < 9) continue;
    out.push(
      buildAlert({
        type,
        token: t,
        firedAtMs: fromMs,
        headline: `${humanType(type)}: $${t.symbol}`,
        message: reason.message
      })
    );
  }

  return out;
}

function buildAlert(input: {
  type: AlertType;
  token: ScoredToken;
  firedAtMs: number;
  headline: string;
  message: string;
}): AlertRecord {
  return {
    id: "",
    tokenAddress: input.token.address,
    symbol: input.token.symbol,
    type: input.type,
    trapScore: input.token.result.trapScore,
    verdict: input.token.result.verdict,
    headline: input.headline,
    message: input.message,
    firedAt: new Date(input.firedAtMs).toISOString(),
    dedupeKey: buildAlertDedupeKey({
      tokenAddress: input.token.address,
      type: input.type,
      verdict: input.token.result.verdict,
      firedAtMs: input.firedAtMs
    }),
    deliveredTelegram: false
  };
}

function humanType(type: AlertType): string {
  switch (type) {
    case "trapscore_spike":
      return "TrapScore spike";
    case "smart_money_divergence":
      return "Smart Money Divergence";
    case "insider_exit_pressure":
      return "Insider Exit Pressure";
    case "liquidity_fragility":
      return "Liquidity Fragility";
  }
}
