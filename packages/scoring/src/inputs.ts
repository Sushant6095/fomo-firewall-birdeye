import type { EnrichedSnapshot, TrapInputs } from "@fomo/shared";

/**
 * Build `TrapInputs` from an `EnrichedSnapshot`. The worker calls this after
 * Birdeye enrichment; the result is fed to `calculateTrapScore`.
 */
export function buildTrapInputs(snapshot: EnrichedSnapshot): TrapInputs {
  const liquidity = Math.max(snapshot.liquidityUsd, 1);
  const volumeToLiquidityRatio = snapshot.volume1hUsd / liquidity;

  return {
    priceChange1h: snapshot.priceChange1h,
    liquidityChange1h: snapshot.liquidityChange1h,
    buyVolume1h: snapshot.buyVolume1hUsd,
    sellVolume1h: snapshot.sellVolume1hUsd,
    smartWalletBuyUsd: snapshot.smartWalletBuyUsd,
    smartWalletSellUsd: snapshot.smartWalletSellUsd,
    insiderBuyUsd: snapshot.insiderBuyUsd,
    insiderSellUsd: snapshot.insiderSellUsd,
    top10HolderPercent: snapshot.top10HolderPercent,
    hasMutableMetadata: snapshot.hasMutableMetadata,
    hasFreezeAuthority: snapshot.hasFreezeAuthority,
    hasMintAuthority: snapshot.hasMintAuthority,
    transferFeeBps: snapshot.transferFeeBps,
    volumeToLiquidityRatio
  };
}
