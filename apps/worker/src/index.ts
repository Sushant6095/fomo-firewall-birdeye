import { BirdeyeClient } from "@fomo/birdeye";
import { getDb, seedDemoData } from "@fomo/db";
import { detectAlerts } from "./pipeline/detect-alerts";
import { enrichBatch } from "./pipeline/enrich-batch";
import { fetchTrending } from "./pipeline/fetch-trending";
import { scoreAndPersist } from "./pipeline/score-and-persist";
import { log, setRunId } from "./log";
import { readEnv } from "./env";

export type RunSummary = {
  runId: string;
  tokensSeen: number;
  tokensScored: number;
  alertsFired: number;
  durationMs: number;
  errors: { address: string; error: string }[];
};

/**
 * One ingestion pass. Returns a structured summary suitable for HTTP
 * responses, status pages, and structured logs.
 */
export async function runIngestion(): Promise<RunSummary> {
  const env = readEnv();
  const db = getDb();
  const start = Date.now();
  const runId = await db.startRun();
  setRunId(runId);

  log.info("ingestion run starting", {
    trendingLimit: env.trendingLimit,
    rps: env.birdeyeRps
  });

  const client = new BirdeyeClient(
    {
      apiKey: env.birdeyeApiKey,
      baseUrl: env.birdeyeBaseUrl,
      chain: env.birdeyeChain,
      rateLimit: { ratePerSecond: env.birdeyeRps }
    },
    {
      debug: (msg, meta) => log.debug(`birdeye: ${msg}`, meta),
      warn: (msg, meta) => log.warn(`birdeye: ${msg}`, meta),
      error: (msg, meta) => log.error(`birdeye: ${msg}`, meta)
    }
  );

  const trending = await fetchTrending(client, env.trendingLimit);
  const enrichment = await enrichBatch(client, trending.map((t) => t.address));
  const snapshots = enrichment.flatMap((e) => (e.kind === "ok" ? [e.snapshot] : []));
  const errors = enrichment.flatMap((e) =>
    e.kind === "error" ? [{ address: e.address, error: e.error }] : []
  );

  const scored = await scoreAndPersist(db, snapshots);
  const alerts = await detectAlerts(db, scored);

  await db.finishRun(runId, {
    tokensSeen: trending.length,
    tokensScored: scored.length,
    alertsFired: alerts.length,
    errors
  });

  const summary: RunSummary = {
    runId,
    tokensSeen: trending.length,
    tokensScored: scored.length,
    alertsFired: alerts.length,
    durationMs: Date.now() - start,
    errors
  };

  log.info("ingestion run complete", summary);
  return summary;
}

/**
 * Demo mode — does not hit Birdeye. Seeds the in-memory DB with the same
 * fixture-shape data the dashboard already uses. Run with:
 *   pnpm --filter @fomo/worker dev -- --demo
 */
export async function runDemoMode(): Promise<RunSummary> {
  const db = getDb();
  const start = Date.now();
  const runId = await db.startRun();
  setRunId(runId);

  log.info("demo mode — seeding in-memory DB from fixtures");
  await seedDemoData(db);

  const summary: RunSummary = {
    runId,
    tokensSeen: 4,
    tokensScored: 4,
    alertsFired: 4,
    durationMs: Date.now() - start,
    errors: []
  };
  await db.finishRun(runId, summary);
  log.info("demo run complete", summary);
  return summary;
}

// Boot when invoked directly: `pnpm --filter @fomo/worker dev`
const isMain = process.argv[1]?.endsWith("/index.ts") || process.argv[1]?.endsWith("/index.js");
if (isMain) {
  const demo = process.argv.includes("--demo") || !process.env.BIRDEYE_API_KEY;
  (demo ? runDemoMode() : runIngestion())
    .then((summary) => {
      console.log("\nRun summary:", summary);
    })
    .catch((err) => {
      console.error("worker failed", err);
      process.exit(1);
    });
}
