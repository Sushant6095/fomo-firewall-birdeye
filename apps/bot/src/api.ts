import { getOptionalEnv } from "@fomo/shared";

const BASE = getOptionalEnv("BOT_API_BASE_URL", "http://localhost:8727");

export function caseFileUrl(address: string): string {
  return `${BASE}/case-file/${address}`;
}

export type ScoreApiResponse = {
  address: string;
  symbol: string;
  name?: string;
  trapScore: number;
  verdict: string;
  reasons: { code: string; message: string; contribution: number }[];
  analystSummary: string;
  // Per-snapshot metrics — required for rich Telegram cards.
  priceChange1h?: number;
  volume1hUsd?: number;
  liquidityUsd?: number;
  liquidityChange1h?: number;
  smartWalletNetflowUsd?: number;
  insiderNetflowUsd?: number;
  top10HolderPercent?: number;
  scoredAt?: string;
  source: "db" | "fixture";
};

export type TrendingRiskToken = {
  address: string;
  symbol: string;
  name?: string;
  trapScore: number;
  verdict: string;
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

export async function fetchTrending(limit = 10): Promise<TrendingRiskToken[]> {
  try {
    const res = await fetch(
      `${BASE}/api/tokens/trending-risk?limit=${limit}`,
      { headers: { accept: "application/json" } }
    );
    if (!res.ok) return [];
    const json = (await res.json()) as { tokens: TrendingRiskToken[] };
    return json.tokens ?? [];
  } catch {
    return [];
  }
}
