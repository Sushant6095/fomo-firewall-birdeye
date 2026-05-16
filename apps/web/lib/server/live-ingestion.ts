import "server-only";
import { BirdeyeClient, enrichToken, normalizeTrending } from "@fomo/birdeye";
import {
  buildTrapInputs,
  calculateTrapScore,
  explainTrapScore
} from "@fomo/scoring";
import { getDb, type FomoDb } from "@fomo/db";
import type { EnrichedSnapshot, AlertRecord, TrapVerdict } from "@fomo/shared";
import { buildAlertDedupeKey } from "@fomo/shared";

/**
 * Inline ingestion pipeline — runs INSIDE the Next.js server process so the
 * in-memory DB is shared with all `/api/*` routes and page server components.
 *
 * Mirrors apps/worker/src/index.ts but never imports it: the worker package
 * loads BIRDEYE_API_KEY at module-init time which is hostile to bundling.
 */

export type LiveRunSummary = {
  runId: string;
  startedAt: string;
  durationMs: number;
  trendingFetched: number;
  enrichedOk: number;
  enrichedErrors: number;
  scored: number;
  alertsFired: number;
  warnings: string[];
  source: "live";
};

let runInFlight: Promise<LiveRunSummary> | null = null;
let lastSummary: LiveRunSummary | null = null;

export function hasBirdeyeKey(): boolean {
  // FOMO_DEMO_MODE=1 forces fixture-only seeding even when the key is set.
  // Useful for fast local testing without burning the Birdeye rpm budget.
  if (process.env.FOMO_DEMO_MODE === "1") return false;
  return Boolean(process.env.BIRDEYE_API_KEY);
}

export function getLastLiveSummary(): LiveRunSummary | null {
  return lastSummary;
}

/**
 * Idempotent: if a run is in-flight, returns the same promise.
 */
export async function runLiveIngestion(): Promise<LiveRunSummary> {
  if (runInFlight) return runInFlight;
  runInFlight = doRun().finally(() => {
    runInFlight = null;
  });
  const summary = await runInFlight;
  lastSummary = summary;
  return summary;
}

async function doRun(): Promise<LiveRunSummary> {
  const apiKey = process.env.BIRDEYE_API_KEY;
  if (!apiKey) throw new Error("BIRDEYE_API_KEY not set");

  const start = Date.now();
  const db = getDb();
  const runId = await db.startRun();

  const trendingLimit = Number(process.env.FOMO_TRENDING_LIMIT ?? "8");
  const ratePerSecond = Number(process.env.BIRDEYE_RPS ?? "0.9");

  const client = new BirdeyeClient(
    {
      apiKey,
      baseUrl: process.env.BIRDEYE_BASE_URL ?? "https://public-api.birdeye.so",
      chain: process.env.BIRDEYE_CHAIN ?? "solana",
      rateLimit: { ratePerSecond, burst: 1 }
    },
    {
      debug: () => undefined,
      warn: (m, meta) => console.warn(`[live-ingest] ${m}`, meta ?? ""),
      error: (m, meta) => console.error(`[live-ingest] ${m}`, meta ?? "")
    }
  );

  // 1. Trending
  const trendingEnv = await client.getTrendingTokens({ limit: trendingLimit });
  const trendingItems =
    (trendingEnv.data as { tokens?: unknown[] } | undefined)?.tokens ?? [];
  const trending = normalizeTrending(
    trendingItems as Parameters<typeof normalizeTrending>[0]
  );

  // 2. Enrich — sequentially, since the limiter is set to 0.9 rps
  const warnings: string[] = [];
  const snapshots: EnrichedSnapshot[] = [];
  let enrichedErrors = 0;
  for (const t of trending) {
    try {
      const { snapshot, warnings: warns } = await enrichToken(client, t.address);
      snapshots.push(snapshot);
      warnings.push(...warns);
    } catch (err) {
      enrichedErrors += 1;
      const msg = err instanceof Error ? err.message : String(err);
      warnings.push(`enrich(${t.symbol}): ${msg}`);
      console.warn(`[live-ingest] enrich failed`, t.address, msg);
    }
  }

  // 3. Score + persist
  let scored = 0;
  let alertsFired = 0;
  for (const snapshot of snapshots) {
    const prevStored = await db.getLatestScore(snapshot.address);
    const previous = prevStored
      ? { trapScore: prevStored.trapScore, verdict: prevStored.verdict }
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
    scored += 1;

    // 4. Alerts — fire when verdict tier jumps worse
    if (
      previous === null ||
      VERDICT_RANK[result.verdict] > VERDICT_RANK[previous.verdict]
    ) {
      const alert = buildAlert({
        address: snapshot.address,
        symbol: snapshot.symbol,
        verdict: result.verdict,
        trapScore: result.trapScore,
        headline:
          previous === null
            ? `$${snapshot.symbol} entered watch · TrapScore ${result.trapScore}`
            : `$${snapshot.symbol} TrapScore ${previous.trapScore} → ${result.trapScore}`,
        message: result.reasons[0]?.message ?? summary,
        firedAt: snapshot.capturedAt
      });
      const { inserted } = await db.insertAlertIfNew(alert);
      if (inserted) alertsFired += 1;
    }
  }

  await db.finishRun(runId, {
    tokensSeen: trending.length,
    tokensScored: scored,
    alertsFired,
    errors: warnings
  });

  return {
    runId,
    startedAt: new Date(start).toISOString(),
    durationMs: Date.now() - start,
    trendingFetched: trending.length,
    enrichedOk: snapshots.length,
    enrichedErrors,
    scored,
    alertsFired,
    warnings: warnings.slice(0, 10),
    source: "live"
  };
}

const VERDICT_RANK: Record<TrapVerdict, number> = {
  "Clean Pump": 0,
  "Risky Chase": 1,
  "Exit Warning": 2,
  "Critical Trap": 3
};

function buildAlert(input: {
  address: string;
  symbol: string;
  verdict: TrapVerdict;
  trapScore: number;
  headline: string;
  message: string;
  firedAt: string;
}): AlertRecord {
  const firedAtMs = Date.parse(input.firedAt);
  return {
    id: "",
    tokenAddress: input.address,
    symbol: input.symbol,
    type: "trapscore_spike",
    trapScore: input.trapScore,
    verdict: input.verdict,
    headline: input.headline,
    message: input.message,
    firedAt: input.firedAt,
    dedupeKey: buildAlertDedupeKey({
      tokenAddress: input.address,
      type: "trapscore_spike",
      verdict: input.verdict,
      firedAtMs
    }),
    deliveredTelegram: false
  };
}

export type { FomoDb };
