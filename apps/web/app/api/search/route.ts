import { NextResponse } from "next/server";
import { listTrendingRiskRows } from "@/lib/server/score-service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
  const rows = await listTrendingRiskRows(100);
  const results = !q
    ? rows.slice(0, 8)
    : rows
        .filter(
          (r) =>
            r.symbol.toLowerCase().includes(q) ||
            r.name.toLowerCase().includes(q) ||
            r.address.toLowerCase().includes(q)
        )
        .slice(0, 12);
  return NextResponse.json(
    {
      query: q,
      results: results.map((r) => ({
        address: r.address,
        symbol: r.symbol,
        name: r.name,
        trapScore: r.trapScore,
        verdict: r.verdict
      })),
      generatedAt: new Date().toISOString()
    },
    {
      headers: { "cache-control": "public, max-age=10, s-maxage=10" }
    }
  );
}
