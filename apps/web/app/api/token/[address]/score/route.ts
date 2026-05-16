import { NextResponse } from "next/server";
import { fixtureByAddress } from "@fomo/ui";
import {
  getLatestStoredScore,
  getTokenScore
} from "@/lib/server/score-service";

/**
 * Returns the current TrapScore for a token.
 *
 * Birdeye is **never** called directly from this handler — only `@fomo/db`
 * (with the in-memory or Supabase driver) and `@fomo/ui` fixtures cross the
 * boundary. The response shape is stable across DB and fixture sources so
 * the dashboard, Telegram bot, and browser extension all read the same JSON.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ address: string }> }
) {
  const { address } = await context.params;
  const stored = await getLatestStoredScore(address);
  if (stored) {
    return NextResponse.json(
      {
        address: stored.tokenAddress,
        symbol: stored.symbol,
        trapScore: stored.trapScore,
        verdict: stored.verdict,
        reasons: stored.reasons,
        warnings: stored.warnings,
        analystSummary: stored.analystSummary,
        scoredAt: stored.scoredAt,
        source: "db"
      },
      {
        headers: { "cache-control": "public, max-age=15, s-maxage=15" }
      }
    );
  }

  const fixture = fixtureByAddress(address);
  if (fixture) {
    return NextResponse.json(
      {
        address: fixture.address,
        symbol: fixture.symbol,
        trapScore: fixture.trapScore,
        verdict: fixture.verdict,
        // Normalize fixture reasons (string[]) to the same
        // {code, message, contribution} object shape the DB branch uses,
        // so the bot, extension, and dashboard never have to handle two shapes.
        reasons: fixture.reasons.map((message, i) => ({
          code: `FIXTURE_REASON_${i + 1}`,
          message,
          contribution: 0
        })),
        evidence: fixture.evidence,
        analystSummary: fixture.analystSummary,
        scoredAt: new Date().toISOString(),
        source: "fixture"
      },
      {
        headers: { "cache-control": "public, max-age=15, s-maxage=15" }
      }
    );
  }

  // Score on demand for unknown addresses isn't supported yet — return 404.
  void getTokenScore;
  return NextResponse.json(
    {
      address,
      error: "no_snapshot",
      message: "No FOMO Firewall snapshot for this address yet."
    },
    { status: 404 }
  );
}
