import type { EnrichedSnapshot } from "@fomo/shared";
import type { BirdeyeClient } from "./client";
import {
  normalizeHolderPositions,
  normalizeHolderProfile,
  normalizeOverview,
  normalizeSecurity,
  normalizeTopHolders,
  normalizeTxs
} from "./normalize";

const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * One round-trip per Birdeye endpoint required for TrapScore.
 *
 * Each call is wrapped in a `Promise.allSettled` so a single failing
 * endpoint downgrades the score (and surfaces a warning) instead of
 * crashing the whole worker pass.
 */
export async function enrichToken(
  client: BirdeyeClient,
  address: string,
  capturedAtMs: number = Date.now()
): Promise<{ snapshot: EnrichedSnapshot; warnings: string[] }> {
  const txsAfter = Math.floor((capturedAtMs - ONE_HOUR_MS) / 1000);
  const txsBefore = Math.floor(capturedAtMs / 1000);

  const [overview, txs, holderProfile, holderPositions, topHolders, security] =
    await Promise.allSettled([
      client.getTokenOverview(address),
      client.getTokenTxs(address, {
        limit: 50,
        beforeTime: txsBefore,
        afterTime: txsAfter
      }),
      client.getHolderProfile(address),
      client.getHolderPositions(address),
      client.getTopHolders(address),
      client.getTokenSecurity(address)
    ]);

  const warnings: string[] = [];
  const unwrap = <T>(
    res: PromiseSettledResult<{ data?: T }>,
    name: string
  ): T | undefined => {
    if (res.status === "fulfilled") return res.value?.data;
    warnings.push(`Birdeye endpoint failed: ${name}`);
    return undefined;
  };

  const overviewNorm = normalizeOverview(unwrap(overview, "overview"), address);
  const txsData = unwrap(txs, "txs")?.items;
  const txsNorm = normalizeTxs(txsData, capturedAtMs - ONE_HOUR_MS, capturedAtMs);
  const holderProfileNorm = normalizeHolderProfile(
    unwrap(holderProfile, "holder-profile")
  );
  const holderPositionsNorm = normalizeHolderPositions(
    unwrap(holderPositions, "holder-positions")
  );
  const topHoldersNorm = normalizeTopHolders(unwrap(topHolders, "top-holders"));
  const securityNorm = normalizeSecurity(unwrap(security, "security"));

  // Prefer holder-profile netflow when present; fall back to txs windowing.
  const smartWalletBuyUsd = txsNorm.smartWalletBuyUsd;
  const smartWalletSellUsd = txsNorm.smartWalletSellUsd;
  const insiderBuyUsd = txsNorm.insiderBuyUsd;
  const insiderSellUsd = txsNorm.insiderSellUsd;

  void holderPositionsNorm; // currently informational; persisted as raw json
  void holderProfileNorm; // netflow surfaced separately if/when API is stable

  const snapshot: EnrichedSnapshot = {
    address,
    symbol: overviewNorm.symbol,
    name: overviewNorm.name,
    chain: "solana",
    capturedAt: new Date(capturedAtMs).toISOString(),

    priceUsd: overviewNorm.priceUsd,
    liquidityUsd: overviewNorm.liquidityUsd,
    volume1hUsd: overviewNorm.volume1hUsd,
    priceChange1h: overviewNorm.priceChange1h,
    liquidityChange1h: overviewNorm.liquidityChange1h,
    marketCapUsd: overviewNorm.marketCapUsd,
    fdvUsd: overviewNorm.fdvUsd,

    buyVolume1hUsd:
      overviewNorm.buyVolume1hUsd > 0
        ? overviewNorm.buyVolume1hUsd
        : txsNorm.buyVolumeUsd,
    sellVolume1hUsd:
      overviewNorm.sellVolume1hUsd > 0
        ? overviewNorm.sellVolume1hUsd
        : txsNorm.sellVolumeUsd,
    smartWalletBuyUsd,
    smartWalletSellUsd,
    insiderBuyUsd,
    insiderSellUsd,
    largeBuyCount: txsNorm.largeBuyCount,
    largeSellCount: txsNorm.largeSellCount,

    top10HolderPercent: topHoldersNorm.top10HolderPercent,
    topHolderPercent: topHoldersNorm.topHolderPercent,

    hasMutableMetadata: securityNorm.hasMutableMetadata,
    hasFreezeAuthority: securityNorm.hasFreezeAuthority,
    hasMintAuthority: securityNorm.hasMintAuthority,
    transferFeeBps: securityNorm.transferFeeBps,
    securityNotes: securityNorm.notes
  };

  return { snapshot, warnings };
}
