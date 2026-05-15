import type { BirdeyeClient } from "@fomo/birdeye";
import { normalizeTrending } from "@fomo/birdeye";
import { log } from "../log";

export type TrendingTarget = {
  address: string;
  symbol: string;
  name: string;
};

/**
 * Step 1 of the ingestion pipeline.
 *
 * Returns the next batch of token addresses to score. Limited to N so we
 * stay well within Birdeye's rate budget even when the worker runs every
 * 60 seconds.
 */
export async function fetchTrending(
  client: BirdeyeClient,
  limit: number
): Promise<TrendingTarget[]> {
  const env = await client.getTrendingTokens({ limit });
  const items = (env.data as { tokens?: unknown[] } | undefined)?.tokens ?? [];
  const normalized = normalizeTrending(items as Parameters<typeof normalizeTrending>[0]);
  log.info("fetched trending", { count: normalized.length });
  return normalized.map((t) => ({
    address: t.address,
    symbol: t.symbol,
    name: t.name
  }));
}
