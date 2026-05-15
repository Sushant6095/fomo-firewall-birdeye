import { NextResponse } from "next/server";
import { listRecentAlertsService } from "@/lib/server/score-service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Math.min(
    Math.max(parseInt(url.searchParams.get("limit") ?? "50", 10) || 50, 1),
    200
  );
  const alerts = await listRecentAlertsService(limit);
  return NextResponse.json(
    {
      alerts,
      generatedAt: new Date().toISOString()
    },
    {
      headers: {
        "cache-control": "public, max-age=15, s-maxage=15"
      }
    }
  );
}
