import "server-only";
import { getDb, seedDemoData, type StoredScoreRow } from "@fomo/db";
import {
  CRITICAL_TRAP_TOKEN,
  CLEAN_PUMP_TOKEN,
  EXIT_WARNING_TOKEN,
  RISKY_CHASE_TOKEN,
  fixtureByAddress,
  type TokenRiskFixture
} from "@fomo/ui";
import type { TrapVerdict } from "@fomo/shared";
import { hasBirdeyeKey, runLiveIngestion } from "./live-ingestion";

/**
 * Server-only adapter between the database (or fixtures) and the API route
 * handlers. The web app never imports `@fomo/birdeye` or `BIRDEYE_API_KEY`
 * directly — only this module + ./live-ingestion cross the boundary.
 */

let seeded = false;
let seedMode: "live" | "fixture" | "pending" = "pending";

export function getSeedMode(): "live" | "fixture" | "pending" {
  return seedMode;
}

async function ensureSeeded() {
  if (seeded) return;
  const db = getDb();
  const existing = await db.listTopTrapScores(1);
  if (existing.length > 0) {
    seeded = true;
    return;
  }

  if (hasBirdeyeKey()) {
    try {
      console.log("[score-service] BIRDEYE_API_KEY set — running live ingestion");
      const summary = await runLiveIngestion();
      console.log("[score-service] live ingestion complete", {
        scored: summary.scored,
        alerts: summary.alertsFired,
        warnings: summary.warnings.length,
        durationMs: summary.durationMs
      });
      seedMode = "live";
      seeded = true;
      return;
    } catch (err) {
      console.error(
        "[score-service] live ingestion failed, falling back to fixtures",
        err instanceof Error ? err.message : err
      );
    }
  }

  await seedDemoData(db);
  seedMode = "fixture";
  seeded = true;
}

export type TokenRiskRow = {
  address: string;
  symbol: string;
  name: string;
  trapScore: number;
  verdict: TrapVerdict;
  priceChange1h: number;
  volume1hUsd: number;
  liquidityUsd: number;
  liquidityChange1h: number;
  smartWalletNetflowUsd: number;
  insiderNetflowUsd: number;
  top10HolderPercent: number;
  scoredAt: string;
  source: "db" | "fixture";
};

function rowFromStored(row: StoredScoreRow): TokenRiskRow {
  const s = row.snapshot;
  return {
    address: row.tokenAddress,
    symbol: row.symbol,
    name: row.name,
    trapScore: row.trapScore,
    verdict: row.verdict,
    priceChange1h: s.priceChange1h,
    volume1hUsd: s.volume1hUsd,
    liquidityUsd: s.liquidityUsd,
    liquidityChange1h: s.liquidityChange1h,
    smartWalletNetflowUsd: s.smartWalletBuyUsd - s.smartWalletSellUsd,
    insiderNetflowUsd: s.insiderBuyUsd - s.insiderSellUsd,
    top10HolderPercent: s.top10HolderPercent,
    scoredAt: row.scoredAt,
    source: "db"
  };
}

function rowFromFixture(token: TokenRiskFixture): TokenRiskRow {
  return {
    address: token.address,
    symbol: token.symbol,
    name: token.name,
    trapScore: token.trapScore,
    verdict: token.verdict,
    priceChange1h: token.priceChange1h,
    volume1hUsd: token.volume1hUsd,
    liquidityUsd: token.liquidityUsd,
    liquidityChange1h: token.liquidityChange1h,
    smartWalletNetflowUsd: token.smartWalletNetflowUsd,
    insiderNetflowUsd: token.insiderNetflowUsd,
    top10HolderPercent: token.top10HolderPercent,
    scoredAt: new Date().toISOString(),
    source: "fixture"
  };
}

export async function listTrendingRiskRows(limit = 25): Promise<TokenRiskRow[]> {
  await ensureSeeded();
  const db = getDb();
  const rows = await db.listTopTrapScores(limit);
  if (rows.length > 0) return rows.map(rowFromStored);

  // Fixture fallback so the dashboard always renders.
  return [
    CRITICAL_TRAP_TOKEN,
    EXIT_WARNING_TOKEN,
    RISKY_CHASE_TOKEN,
    CLEAN_PUMP_TOKEN
  ].map(rowFromFixture);
}

export async function getTokenScore(address: string): Promise<{
  row: TokenRiskRow | null;
  source: "db" | "fixture";
}> {
  await ensureSeeded();
  const db = getDb();
  const stored = await db.getLatestScore(address);
  if (stored) return { row: rowFromStored(stored), source: "db" };

  const fixture = fixtureByAddress(address);
  if (fixture) return { row: rowFromFixture(fixture), source: "fixture" };

  return { row: null, source: "fixture" };
}

export async function listRecentAlertsService(limit = 50) {
  await ensureSeeded();
  const db = getDb();
  return db.listRecentAlerts(limit);
}

export async function getLatestStoredScore(address: string) {
  await ensureSeeded();
  const db = getDb();
  return db.getLatestScore(address);
}
