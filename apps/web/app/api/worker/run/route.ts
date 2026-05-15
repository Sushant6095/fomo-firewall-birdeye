import { NextResponse } from "next/server";
import {
  hasBirdeyeKey,
  runLiveIngestion
} from "@/lib/server/live-ingestion";

export const dynamic = "force-dynamic";
export const maxDuration = 120; // free tier ~37s cycle; budget for slack

export async function POST() {
  if (!hasBirdeyeKey()) {
    return NextResponse.json(
      {
        ok: false,
        error: "BIRDEYE_API_KEY not set. Running in demo mode."
      },
      { status: 400 }
    );
  }
  try {
    const summary = await runLiveIngestion();
    return NextResponse.json({ ok: true, summary });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    hint: "POST to trigger a manual Birdeye ingestion"
  });
}
