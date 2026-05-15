import { strict as assert } from "node:assert";
import { createMemoryDb, seedDemoData } from "@fomo/db";
import type { AlertRecord } from "@fomo/shared";
import { detectAlerts } from "../pipeline/detect-alerts";
import { scoreAndPersist } from "../pipeline/score-and-persist";
import type { ScoredToken } from "../pipeline/score-and-persist";

/**
 * Worker happy-path tests. We don't hit Birdeye — instead we feed already-
 * enriched snapshots through `scoreAndPersist` and `detectAlerts` and assert
 * the right rows / dedupe behavior come out.
 */
export async function runPipelineTests(): Promise<void> {
  const db = createMemoryDb();

  // Seed the demo data so subsequent scoring has a previous-score baseline.
  await seedDemoData(db);

  // Pull the latest snapshots from the DB and re-score them — same call path
  // the worker takes after Birdeye enrichment.
  const dogx = await db.getLatestSnapshot(
    "DoGxJTRP7nKpRrjEYRr7nT9hZqEqL8mTjYR4hM7N2ZpL"
  );
  const clean = await db.getLatestSnapshot(
    "CLeaNp5yT3pHnZq2mLrK7vN8jPxR6sFdT4uY9cBaW3iJ"
  );
  assert.ok(dogx && clean, "demo snapshots must exist after seed");

  // For testing, we *re-insert* with a fresh capturedAt so it counts as a
  // new score — and the alert detector compares against the seeded score.
  const re = (s: typeof dogx) => ({
    ...s!,
    capturedAt: new Date().toISOString()
  });

  const scored = await scoreAndPersist(db, [re(dogx), re(clean)]);
  assert.equal(scored.length, 2);

  const dogxScore = scored.find((s) => s.symbol === "DOGX") as ScoredToken;
  assert.ok(dogxScore, "expected DOGX score");
  assert.ok(
    dogxScore.result.trapScore >= 81,
    `expected DOGX Critical Trap, got ${dogxScore.result.trapScore}`
  );

  const cleanScore = scored.find((s) => s.symbol === "JITO") as ScoredToken;
  assert.equal(cleanScore.result.verdict, "Clean Pump");

  // Alert detection — DOGX's verdict didn't *worsen* (already Critical), so
  // no trapscore_spike. But signal alerts should fire.
  const alerts = await detectAlerts(db, scored);
  const hasDivergence = alerts.some(
    (a: AlertRecord) =>
      a.tokenAddress === dogxScore.address && a.type === "smart_money_divergence"
  );
  assert.ok(hasDivergence, "expected smart_money_divergence alert for DOGX");

  // Dedupe — running detection again should not double-fire (same bucket).
  const second = await detectAlerts(db, scored);
  assert.equal(
    second.length,
    0,
    `expected dedupe to suppress second pass, got ${second.length} alerts`
  );

  // Recent alerts list should contain at least the demo alerts + new ones.
  const recent = await db.listRecentAlerts(50);
  assert.ok(recent.length >= 4, `expected ≥ 4 recent alerts, got ${recent.length}`);

  // Top trap scores: latest score per token, sorted desc.
  const top = await db.listTopTrapScores(3);
  assert.equal(top[0].symbol, "DOGX");
}
