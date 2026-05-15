import { NextResponse } from "next/server";
import { listTrendingRiskRows } from "@/lib/server/score-service";

/**
 * Returns the latest score per token, sorted by TrapScore descending.
 * The dashboard's Trending Pump Risk Board reads from this endpoint.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Math.min(
    Math.max(parseInt(url.searchParams.get("limit") ?? "25", 10) || 25, 1),
    100
  );
  const tokens = await listTrendingRiskRows(limit);
  const source = tokens[0]?.source ?? "fixture";

  return NextResponse.json(
    {
      tokens,
      source,
      generatedAt: new Date().toISOString()
    },
    {
      headers: {
        "cache-control": "public, max-age=15, s-maxage=15"
      }
    }
  );
}
