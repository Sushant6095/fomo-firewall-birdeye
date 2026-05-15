import { getOptionalEnv } from "@fomo/shared";

const BASE = getOptionalEnv("BOT_API_BASE_URL", "http://localhost:3000");

export function caseFileUrl(address: string): string {
  return `${BASE}/token/${address}`;
}

export type ScoreApiResponse = {
  address: string;
  symbol: string;
  trapScore: number;
  verdict: string;
  reasons: { code: string; message: string; contribution: number }[];
  analystSummary: string;
  source: "db" | "fixture";
};

/**
 * Fetch the canonical TrapScore for an address from the FOMO Firewall web app.
 * The bot is a *consumer* of the same endpoint the extension uses — we never
 * call Birdeye from this surface.
 */
export async function fetchScore(address: string): Promise<ScoreApiResponse | null> {
  try {
    const res = await fetch(`${BASE}/api/token/${address}/score`, {
      headers: { accept: "application/json" }
    });
    if (!res.ok) return null;
    return (await res.json()) as ScoreApiResponse;
  } catch {
    return null;
  }
}

export async function fetchRecentAlerts(limit = 5) {
  try {
    const res = await fetch(`${BASE}/api/alerts/recent?limit=${limit}`, {
      headers: { accept: "application/json" }
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { alerts: unknown[] };
    return json.alerts ?? [];
  } catch {
    return [];
  }
}
