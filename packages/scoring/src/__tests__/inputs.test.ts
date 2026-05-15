import { strict as assert } from "node:assert";
import type { EnrichedSnapshot } from "@fomo/shared";
import { buildTrapInputs } from "../inputs";

function snapshot(overrides: Partial<EnrichedSnapshot> = {}): EnrichedSnapshot {
  return {
    address: "Addr1",
    symbol: "TKN",
    name: "Token",
    chain: "solana",
    capturedAt: new Date().toISOString(),
    priceUsd: 0.01,
    liquidityUsd: 200_000,
    volume1hUsd: 600_000,
    priceChange1h: 40,
    liquidityChange1h: -5,
    marketCapUsd: 1_000_000,
    fdvUsd: 2_000_000,
    buyVolume1hUsd: 200_000,
    sellVolume1hUsd: 400_000,
    smartWalletBuyUsd: 1_000,
    smartWalletSellUsd: 50_000,
    insiderBuyUsd: 100,
    insiderSellUsd: 10_000,
    largeBuyCount: 0,
    largeSellCount: 4,
    top10HolderPercent: 45,
    topHolderPercent: 12,
    hasMutableMetadata: true,
    hasFreezeAuthority: false,
    hasMintAuthority: true,
    transferFeeBps: 0,
    securityNotes: [],
    ...overrides
  };
}

export async function runInputsTests(): Promise<void> {
  const inputs = buildTrapInputs(snapshot());
  assert.equal(inputs.priceChange1h, 40);
  assert.equal(inputs.liquidityChange1h, -5);
  assert.equal(inputs.smartWalletSellUsd, 50_000);
  assert.ok(inputs.volumeToLiquidityRatio > 2, "v/l ratio should reflect 600k / 200k");

  // Zero-liquidity edge case → ratio must not NaN.
  const zeroLiq = buildTrapInputs(
    snapshot({ liquidityUsd: 0, volume1hUsd: 50_000 })
  );
  assert.ok(Number.isFinite(zeroLiq.volumeToLiquidityRatio));
  assert.ok(zeroLiq.volumeToLiquidityRatio > 0);

  // Missing insider signal → numeric zeros, not undefined.
  const noInsider = buildTrapInputs(
    snapshot({ insiderBuyUsd: 0, insiderSellUsd: 0 })
  );
  assert.equal(noInsider.insiderBuyUsd, 0);
  assert.equal(noInsider.insiderSellUsd, 0);
}
