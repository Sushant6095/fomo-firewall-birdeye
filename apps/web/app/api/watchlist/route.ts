import { NextResponse } from "next/server";
import { addWatch, getWatchlist } from "@/lib/server/user-state";
import { getTokenScore } from "@/lib/server/score-service";

export async function GET() {
  const addresses = getWatchlist();
  const rows = await Promise.all(
    addresses.map(async (addr) => {
      const { row, source } = await getTokenScore(addr);
      return row ? { ...row, source } : null;
    })
  );
  return NextResponse.json(
    {
      watchlist: rows.filter(Boolean),
      generatedAt: new Date().toISOString()
    },
    { headers: { "cache-control": "no-store" } }
  );
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    address?: string;
  };
  const address = body.address?.trim();
  if (!address) {
    return NextResponse.json({ error: "address required" }, { status: 400 });
  }
  const result = addWatch(address);
  return NextResponse.json({ ok: true, ...result, address });
}
