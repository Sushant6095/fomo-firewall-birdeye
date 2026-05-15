import { buildTrapInputs, calculateTrapScore, explainTrapScore } from "@fomo/scoring";
import type { FomoDb } from "@fomo/db";
import type { EnrichedSnapshot, TrapScoreResult } from "@fomo/shared";
import { log } from "../log";

export type ScoredToken = {
  address: string;
  symbol: string;
  result: TrapScoreResult;
  summary: string;
  snapshot: EnrichedSnapshot;
  previous: { trapScore: number; verdict: TrapScoreResult["verdict"] } | null;
};

/**
 * Step 3 + 4 of the pipeline.
 *
 * For each enriched snapshot:
 *  1. Persist the snapshot row.
 *  2. Compute TrapScore + analyst summary.
 *  3. Persist the score row.
 *
 * Returns the list of scored tokens, with the *previous* score still attached
 * so the alert detector can diff verdict tiers.
 */
export async function scoreAndPersist(
  db: FomoDb,
  snapshots: EnrichedSnapshot[]
): Promise<ScoredToken[]> {
  const out: ScoredToken[] = [];

  for (const snapshot of snapshots) {
    const previous = (await db.getLatestScore(snapshot.address))
      ? {
          trapScore: (await db.getLatestScore(snapshot.address))!.trapScore,
          verdict: (await db.getLatestScore(snapshot.address))!.verdict
        }
      : null;

    await db.upsertToken({
      address: snapshot.address,
      symbol: snapshot.symbol,
      name: snapshot.name
    });
    await db.insertTokenSnapshot(snapshot);

    const result = calculateTrapScore(buildTrapInputs(snapshot));
    const summary = explainTrapScore({
      symbol: snapshot.symbol,
      priceChange1h: snapshot.priceChange1h,
      result
    });

    await db.insertScore({
      tokenAddress: snapshot.address,
      scoredAt: snapshot.capturedAt,
      result,
      analystSummary: summary
    });

    out.push({
      address: snapshot.address,
      symbol: snapshot.symbol,
      result,
      summary,
      snapshot,
      previous
    });
  }

  log.info("scored batch", { scored: out.length });
  return out;
}
