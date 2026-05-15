import { NextResponse } from "next/server";
import {
  getAlertPrefs,
  updateAlertPrefs,
  type AlertPrefs
} from "@/lib/server/user-state";

export async function GET() {
  return NextResponse.json(
    { prefs: getAlertPrefs() },
    { headers: { "cache-control": "no-store" } }
  );
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Partial<AlertPrefs>;
  const patch: Partial<AlertPrefs> = {};
  if (typeof body.trapScoreThreshold === "number") {
    patch.trapScoreThreshold = Math.max(0, Math.min(100, body.trapScoreThreshold));
  }
  if (typeof body.dedupMinutes === "number") {
    patch.dedupMinutes = Math.max(0, Math.min(720, body.dedupMinutes));
  }
  if (typeof body.quietHours === "boolean") patch.quietHours = body.quietHours;
  if (Array.isArray(body.signalFilters)) patch.signalFilters = body.signalFilters;
  const next = updateAlertPrefs(patch);
  return NextResponse.json({ ok: true, prefs: next });
}
