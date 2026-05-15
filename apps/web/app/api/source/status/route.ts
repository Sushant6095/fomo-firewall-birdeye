import { NextResponse } from "next/server";
import {
  hasBirdeyeKey,
  getLastLiveSummary
} from "@/lib/server/live-ingestion";
import { getSeedMode } from "@/lib/server/score-service";
import { listTrendingRiskRows } from "@/lib/server/score-service";

export const dynamic = "force-dynamic";

export async function GET() {
  // Force a seed if it hasn't happened yet.
  const rows = await listTrendingRiskRows(1);
  const mode = getSeedMode();
  const last = getLastLiveSummary();
  return NextResponse.json(
    {
      hasKey: hasBirdeyeKey(),
      mode,
      tokensInDb: rows.length,
      sampleSymbol: rows[0]?.symbol ?? null,
      lastRun: last
        ? {
            startedAt: last.startedAt,
            durationMs: last.durationMs,
            trendingFetched: last.trendingFetched,
            enrichedOk: last.enrichedOk,
            enrichedErrors: last.enrichedErrors,
            scored: last.scored,
            alertsFired: last.alertsFired,
            warningCount: last.warnings.length
          }
        : null
    },
    { headers: { "cache-control": "no-store" } }
  );
}
