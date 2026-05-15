import { strict as assert } from "node:assert";
import type { TrapInputs } from "@fomo/shared";
import {
  calculateAbnormalVolumeLiquidityRatio,
  calculateHolderConcentrationRisk,
  calculateInsiderExitPressure,
  calculateLiquidityFragility,
  calculateSellPressureWhileGreen,
  calculateSmartMoneyDivergence,
  calculateStaticTokenRisk,
  calculateTrapScore,
  calculateTrapScoreWithSignals,
  explainTrapScore
} from "../index";

function baseInputs(overrides: Partial<TrapInputs> = {}): TrapInputs {
  return {
    priceChange1h: 0,
    liquidityChange1h: 0,
    buyVolume1h: 100_000,
    sellVolume1h: 100_000,
    smartWalletBuyUsd: 0,
    smartWalletSellUsd: 0,
    insiderBuyUsd: 0,
    insiderSellUsd: 0,
    top10HolderPercent: 15,
    hasMutableMetadata: false,
    hasFreezeAuthority: false,
    hasMintAuthority: false,
    transferFeeBps: 0,
    volumeToLiquidityRatio: 0.5,
    ...overrides
  };
}

export async function runTrapScoreTests(): Promise<void> {
  // --- Clean Pump ---
  const clean = calculateTrapScore(
    baseInputs({
      priceChange1h: 12,
      liquidityChange1h: 1.5,
      smartWalletBuyUsd: 60_000,
      smartWalletSellUsd: 4_000
    })
  );
  assert.equal(clean.verdict, "Clean Pump", `expected Clean Pump, got ${clean.verdict}`);
  assert.ok(clean.trapScore <= 30, `clean score should be ≤ 30, got ${clean.trapScore}`);

  // --- Risky Chase ---
  const risky = calculateTrapScore(
    baseInputs({
      priceChange1h: 35,
      smartWalletBuyUsd: 3_000,
      smartWalletSellUsd: 60_000,
      liquidityChange1h: -3,
      sellVolume1h: 200_000,
      buyVolume1h: 90_000,
      top10HolderPercent: 42,
      volumeToLiquidityRatio: 3.2
    })
  );
  assert.ok(
    risky.trapScore >= 31 && risky.trapScore <= 60,
    `expected risky 31-60, got ${risky.trapScore}`
  );
  assert.equal(risky.verdict, "Risky Chase");

  // --- Exit Warning ---
  const warning = calculateTrapScore(
    baseInputs({
      priceChange1h: 41,
      liquidityChange1h: -12,
      smartWalletSellUsd: 130_000,
      smartWalletBuyUsd: 5_000,
      insiderSellUsd: 25_000,
      insiderBuyUsd: 1_000,
      top10HolderPercent: 55,
      sellVolume1h: 220_000,
      buyVolume1h: 120_000,
      volumeToLiquidityRatio: 3.1
    })
  );
  assert.ok(
    warning.trapScore >= 61 && warning.trapScore <= 80,
    `expected exit warning 61-80, got ${warning.trapScore}`
  );
  assert.equal(warning.verdict, "Exit Warning");

  // --- Critical Trap (the DOGX fixture pattern) ---
  const critical = calculateTrapScore(
    baseInputs({
      priceChange1h: 82.4,
      liquidityChange1h: -22.6,
      smartWalletBuyUsd: 12_400,
      smartWalletSellUsd: 196_900,
      insiderBuyUsd: 2_100,
      insiderSellUsd: 73_300,
      top10HolderPercent: 64.8,
      hasMutableMetadata: true,
      hasMintAuthority: true,
      buyVolume1h: 1_880_000,
      sellVolume1h: 2_240_000,
      volumeToLiquidityRatio: 6
    })
  );
  assert.ok(
    critical.trapScore >= 81,
    `expected Critical Trap ≥ 81, got ${critical.trapScore}`
  );
  assert.equal(critical.verdict, "Critical Trap");

  // --- Signal isolation ---
  const smdOnly = calculateSmartMoneyDivergence(
    baseInputs({
      priceChange1h: 50,
      smartWalletBuyUsd: 0,
      smartWalletSellUsd: 200_000
    })
  );
  assert.equal(smdOnly.code, "SMART_MONEY_DIVERGENCE");
  assert.equal(smdOnly.severity, "critical");
  assert.ok(smdOnly.contribution >= 24, `divergence contribution low: ${smdOnly.contribution}`);

  const insider = calculateInsiderExitPressure(
    baseInputs({ insiderBuyUsd: 0, insiderSellUsd: 100_000 })
  );
  assert.equal(insider.severity, "critical");

  const liq = calculateLiquidityFragility(
    baseInputs({ priceChange1h: 50, liquidityChange1h: -20 })
  );
  assert.equal(liq.severity, "critical");

  const sellGreen = calculateSellPressureWhileGreen(
    baseInputs({
      priceChange1h: 20,
      buyVolume1h: 100_000,
      sellVolume1h: 220_000
    })
  );
  assert.equal(sellGreen.severity, "high");

  const conc = calculateHolderConcentrationRisk(
    baseInputs({ top10HolderPercent: 70 })
  );
  assert.equal(conc.severity, "critical");

  const sec = calculateStaticTokenRisk(
    baseInputs({
      hasMutableMetadata: true,
      hasFreezeAuthority: true,
      hasMintAuthority: true,
      transferFeeBps: 250
    })
  );
  assert.equal(sec.severity, "critical");
  assert.ok(sec.contribution > 0);

  const vol = calculateAbnormalVolumeLiquidityRatio(
    baseInputs({ volumeToLiquidityRatio: 6.2 })
  );
  assert.equal(vol.severity, "high");

  // --- Signal returns full result even when clean ---
  const cleanSig = calculateSmartMoneyDivergence(
    baseInputs({
      priceChange1h: 10,
      smartWalletBuyUsd: 50_000,
      smartWalletSellUsd: 1_000
    })
  );
  assert.equal(cleanSig.contribution, 0);
  assert.equal(cleanSig.severity, "low");

  // --- Signals slot returns array of 7 ---
  const withSigs = calculateTrapScoreWithSignals(
    baseInputs({ priceChange1h: 30 })
  );
  assert.equal(withSigs.signals.length, 7);

  // --- Explain helper ---
  const explain = explainTrapScore({
    symbol: "DOGX",
    priceChange1h: 82.4,
    result: critical
  });
  assert.ok(explain.includes("DOGX"));
  assert.ok(explain.includes("Critical Trap"));

  // --- Warnings ---
  const noVol = calculateTrapScore(
    baseInputs({ buyVolume1h: 0, sellVolume1h: 0, top10HolderPercent: 0 })
  );
  assert.ok(noVol.warnings.length >= 1, "expected warnings when volume + top10 missing");
}
