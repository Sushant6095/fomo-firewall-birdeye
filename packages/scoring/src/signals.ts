import type {
  SignalCode,
  SignalEvidence,
  SignalResult,
  TrapInputs
} from "@fomo/shared";

/**
 * Per-signal scoring functions.
 *
 * Each function returns a `SignalResult` with:
 *  - `contribution`  → number of TrapScore points (capped per-signal).
 *  - `severity`      → "low" | "medium" | "high" | "critical" for UI tone.
 *  - `headline`      → screenshot-readable one-liner.
 *  - `reason`        → 1–2 sentences explaining the signal.
 *  - `evidence`      → typed values + Birdeye endpoint source.
 *
 * Caps per signal (sum to 100 max, leaving 5 slack for future signals):
 *   Smart Money Divergence       → 0..25
 *   Insider Exit Pressure        → 0..18
 *   Liquidity Fragility          → 0..18
 *   Sell Pressure While Green    → 0..12
 *   Holder Concentration Risk    → 0..12
 *   Static Token Risk            → 0..10
 *   Abnormal Volume/Liquidity    → 0..5
 *
 * "Low severity" signals still emit a result with contribution=0 so the UI
 * can render the absence of risk (Clean Pump explanations).
 */

const CAPS = {
  SMART_MONEY_DIVERGENCE: 25,
  INSIDER_EXIT_PRESSURE: 18,
  LIQUIDITY_FRAGILITY: 18,
  SELL_PRESSURE_GREEN: 12,
  HOLDER_CONCENTRATION: 12,
  STATIC_TOKEN_RISK: 10,
  ABNORMAL_VOLUME_LIQUIDITY: 5
} as const satisfies Record<SignalCode, number>;

const clamp = (v: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, v));

const formatUsd = (n: number, signed = false) => {
  const abs = Math.abs(n);
  const compact = abs >= 10_000;
  const opts: Intl.NumberFormatOptions = {
    style: "currency",
    currency: "USD",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 0
  };
  const s = new Intl.NumberFormat("en-US", opts).format(abs);
  if (!signed) return n < 0 ? `-${s}` : s;
  return `${n < 0 ? "-" : "+"}${s}`;
};

const formatPct = (n: number, signed = true) => {
  const s = n.toFixed(1);
  if (!signed) return `${s}%`;
  return `${n > 0 ? "+" : ""}${s}%`;
};

export function calculateSmartMoneyDivergence(
  input: TrapInputs
): SignalResult {
  const netflow = input.smartWalletBuyUsd - input.smartWalletSellUsd;
  const priceUp = input.priceChange1h > 0;
  const isDivergent = priceUp && netflow < 0;

  let contribution = 0;
  let severity: SignalResult["severity"] = "low";
  let headline = "Smart wallets are aligned with the move — no divergence.";

  if (isDivergent) {
    const magnitude = Math.min(Math.abs(netflow) / 100_000, 1); // -$100K = full cap
    contribution = clamp(magnitude * CAPS.SMART_MONEY_DIVERGENCE, 0, CAPS.SMART_MONEY_DIVERGENCE);
    severity =
      contribution >= 18 ? "critical" : contribution >= 12 ? "high" : "medium";
    headline = `Smart wallets are net-selling ${formatUsd(
      Math.abs(netflow)
    )} into a ${formatPct(input.priceChange1h)} candle.`;
  } else if (netflow < 0) {
    headline = `Smart wallets are net-sellers (${formatUsd(netflow, true)}) but price is flat or down — watch closely.`;
    contribution = clamp((Math.abs(netflow) / 400_000) * 8, 0, 8);
    severity = "medium";
  }

  const evidence: SignalEvidence[] = [
    {
      label: "Smart buy USD (1h)",
      value: formatUsd(input.smartWalletBuyUsd),
      source: "/defi/v3/token/txs",
      severity: input.smartWalletBuyUsd > 0 ? "low" : "medium"
    },
    {
      label: "Smart sell USD (1h)",
      value: formatUsd(input.smartWalletSellUsd),
      source: "/defi/v3/token/txs",
      severity:
        input.smartWalletSellUsd > 100_000
          ? "critical"
          : input.smartWalletSellUsd > 25_000
            ? "high"
            : "medium"
    },
    {
      label: "1h price change",
      value: formatPct(input.priceChange1h),
      source: "/defi/token_overview",
      severity: priceUp ? "medium" : "low"
    }
  ];

  return {
    code: "SMART_MONEY_DIVERGENCE",
    label: "Smart Money Divergence",
    contribution,
    severity,
    headline,
    reason: isDivergent
      ? "Price is rising while wallets Birdeye tags as smart-money are net-sellers. Classic exit-liquidity pattern."
      : "No active divergence between smart-money flow and price action.",
    evidence
  };
}

export function calculateInsiderExitPressure(input: TrapInputs): SignalResult {
  const netflow = input.insiderBuyUsd - input.insiderSellUsd;
  const isExiting = netflow < 0;

  let contribution = 0;
  let severity: SignalResult["severity"] = "low";
  let headline = "Insider / dev-tagged wallets are flat or accumulating.";

  if (isExiting) {
    const magnitude = Math.min(Math.abs(netflow) / 50_000, 1); // -$50K = full cap
    contribution = clamp(magnitude * CAPS.INSIDER_EXIT_PRESSURE, 0, CAPS.INSIDER_EXIT_PRESSURE);
    severity = contribution >= 14 ? "critical" : contribution >= 9 ? "high" : "medium";
    headline = `Insider / dev-tagged wallets reduced exposure by ${formatUsd(
      Math.abs(netflow)
    )} in 1h.`;
  }

  const evidence: SignalEvidence[] = [
    {
      label: "Insider buy USD (1h)",
      value: formatUsd(input.insiderBuyUsd),
      source: "/token/v1/holder-positions",
      severity: "low"
    },
    {
      label: "Insider sell USD (1h)",
      value: formatUsd(input.insiderSellUsd),
      source: "/token/v1/holder-positions",
      severity:
        input.insiderSellUsd > 50_000
          ? "high"
          : input.insiderSellUsd > 5_000
            ? "medium"
            : "low"
    }
  ];

  return {
    code: "INSIDER_EXIT_PRESSURE",
    label: "Insider Exit Pressure",
    contribution,
    severity,
    headline,
    reason: isExiting
      ? "Wallets Birdeye tags as insiders or devs are reducing exposure while the token pumps."
      : "No active distribution from insider/dev-tagged wallets.",
    evidence
  };
}

export function calculateLiquidityFragility(input: TrapInputs): SignalResult {
  const liqDown = input.liquidityChange1h < 0;
  const priceUp = input.priceChange1h > 0;

  let contribution = 0;
  let severity: SignalResult["severity"] = "low";
  let headline = "Liquidity is holding alongside the move.";

  if (liqDown && priceUp) {
    const magnitude = Math.min(Math.abs(input.liquidityChange1h) / 15, 1); // -15% drop = full cap
    contribution = clamp(magnitude * CAPS.LIQUIDITY_FRAGILITY, 0, CAPS.LIQUIDITY_FRAGILITY);
    severity =
      input.liquidityChange1h <= -15
        ? "critical"
        : input.liquidityChange1h <= -5
          ? "high"
          : "medium";
    headline = `Liquidity drained ${formatPct(
      input.liquidityChange1h,
      false
    )} while price ran ${formatPct(input.priceChange1h)}.`;
  } else if (liqDown) {
    const magnitude = Math.min(Math.abs(input.liquidityChange1h) / 50, 1);
    contribution = clamp(magnitude * 6, 0, 6);
    severity = "medium";
    headline = `Liquidity slipping ${formatPct(input.liquidityChange1h, false)}.`;
  }

  const evidence: SignalEvidence[] = [
    {
      label: "1h liquidity change",
      value: formatPct(input.liquidityChange1h),
      source: "/defi/token_overview",
      severity:
        input.liquidityChange1h <= -10
          ? "critical"
          : input.liquidityChange1h < 0
            ? "high"
            : "low"
    },
    {
      label: "1h price change",
      value: formatPct(input.priceChange1h),
      source: "/defi/token_overview",
      severity: priceUp ? "medium" : "low"
    }
  ];

  return {
    code: "LIQUIDITY_FRAGILITY",
    label: "Liquidity Fragility",
    contribution,
    severity,
    headline,
    reason:
      liqDown && priceUp
        ? "Liquidity is falling while price is up — slippage and rug risk rise sharply."
        : "No active liquidity-drain pattern detected.",
    evidence
  };
}

export function calculateSellPressureWhileGreen(
  input: TrapInputs
): SignalResult {
  const priceUp = input.priceChange1h > 0;
  const sellHeavy = input.sellVolume1h > input.buyVolume1h * 1.1;

  let contribution = 0;
  let severity: SignalResult["severity"] = "low";
  let headline = "Buy volume is matching or beating sell volume.";

  if (priceUp && sellHeavy) {
    const ratio = input.sellVolume1h / Math.max(input.buyVolume1h, 1);
    const magnitude = Math.min((ratio - 1) / 1.0, 1);
    contribution = clamp(magnitude * CAPS.SELL_PRESSURE_GREEN, 0, CAPS.SELL_PRESSURE_GREEN);
    severity = ratio >= 1.8 ? "high" : "medium";
    headline = `Sell volume is ${ratio.toFixed(2)}× buy volume while price is green.`;
  }

  const evidence: SignalEvidence[] = [
    {
      label: "Buy volume (1h)",
      value: formatUsd(input.buyVolume1h),
      source: "/defi/token_overview",
      severity: "low"
    },
    {
      label: "Sell volume (1h)",
      value: formatUsd(input.sellVolume1h),
      source: "/defi/token_overview",
      severity: sellHeavy ? "high" : "low"
    }
  ];

  return {
    code: "SELL_PRESSURE_GREEN",
    label: "Sell Pressure While Green",
    contribution,
    severity,
    headline,
    reason:
      priceUp && sellHeavy
        ? "Sells outpace buys despite a positive price move — sellers are dumping into retail bids."
        : "No green-candle sell-pressure imbalance.",
    evidence
  };
}

export function calculateHolderConcentrationRisk(
  input: TrapInputs
): SignalResult {
  const top10 = input.top10HolderPercent;
  let contribution = 0;
  let severity: SignalResult["severity"] = "low";
  let headline = `Top 10 holders control ${top10.toFixed(1)}% — distribution looks healthy.`;

  if (top10 >= 60) {
    contribution = CAPS.HOLDER_CONCENTRATION;
    severity = "critical";
    headline = `Top 10 holders control ${top10.toFixed(1)}% — high concentration risk.`;
  } else if (top10 >= 40) {
    contribution = (CAPS.HOLDER_CONCENTRATION * 2) / 3;
    severity = "high";
    headline = `Top 10 holders control ${top10.toFixed(1)}% — coordinated selling can cascade.`;
  } else if (top10 >= 25) {
    contribution = CAPS.HOLDER_CONCENTRATION / 3;
    severity = "medium";
    headline = `Top 10 holders control ${top10.toFixed(1)}% — moderate concentration.`;
  }

  const evidence: SignalEvidence[] = [
    {
      label: "Top 10 holders",
      value: `${top10.toFixed(1)}%`,
      source: "/defi/v3/token/holder",
      severity: top10 >= 60 ? "critical" : top10 >= 40 ? "high" : top10 >= 25 ? "medium" : "low"
    }
  ];

  return {
    code: "HOLDER_CONCENTRATION",
    label: "Holder Concentration Risk",
    contribution,
    severity,
    headline,
    reason:
      top10 >= 40
        ? "A small number of wallets can crater the chart in a single transaction."
        : "Holder distribution looks reasonable for a Solana token.",
    evidence
  };
}

export function calculateStaticTokenRisk(input: TrapInputs): SignalResult {
  const items: Array<{ label: string; bad: boolean; weight: number; note: string }> = [
    {
      label: "Mutable metadata",
      bad: input.hasMutableMetadata,
      weight: 4,
      note: "Symbol/URI can change post-listing"
    },
    {
      label: "Freeze authority",
      bad: input.hasFreezeAuthority,
      weight: 4,
      note: "Transfers can be frozen"
    },
    {
      label: "Mint authority",
      bad: input.hasMintAuthority === true,
      weight: 3,
      note: "Supply can still be issued"
    },
    {
      label: "Transfer fee",
      bad: (input.transferFeeBps ?? 0) > 100,
      weight: 3,
      note: `${((input.transferFeeBps ?? 0) / 100).toFixed(2)}% per transfer`
    }
  ];

  const contributionRaw = items.reduce((s, i) => s + (i.bad ? i.weight : 0), 0);
  const contribution = clamp(contributionRaw, 0, CAPS.STATIC_TOKEN_RISK);
  const badCount = items.filter((i) => i.bad).length;

  let severity: SignalResult["severity"] = "low";
  if (badCount >= 3) severity = "critical";
  else if (badCount === 2) severity = "high";
  else if (badCount === 1) severity = "medium";

  const headline =
    badCount === 0
      ? "No critical security flags on this token."
      : `Token has ${badCount} open security risk${badCount > 1 ? "s" : ""}.`;

  const evidence: SignalEvidence[] = items.map((i) => ({
    label: i.label,
    value: i.bad ? "Enabled" : "Disabled",
    source: "/defi/token_security",
    severity: i.bad ? "high" : "low"
  }));

  return {
    code: "STATIC_TOKEN_RISK",
    label: "Security Risk",
    contribution,
    severity,
    headline,
    reason:
      badCount === 0
        ? "No mutable metadata, mint, or freeze authority active."
        : "Open authorities or fees let the issuer rug, freeze, or tax holders.",
    evidence
  };
}

export function calculateAbnormalVolumeLiquidityRatio(
  input: TrapInputs
): SignalResult {
  const ratio = input.volumeToLiquidityRatio;
  let contribution = 0;
  let severity: SignalResult["severity"] = "low";
  let headline = "Volume / liquidity ratio looks normal.";

  if (ratio >= 5) {
    contribution = CAPS.ABNORMAL_VOLUME_LIQUIDITY;
    severity = "high";
    headline = `Volume is ${ratio.toFixed(2)}× liquidity — slippage cascade risk.`;
  } else if (ratio >= 2) {
    contribution = CAPS.ABNORMAL_VOLUME_LIQUIDITY / 2;
    severity = "medium";
    headline = `Volume / liquidity ratio is elevated (${ratio.toFixed(2)}×).`;
  }

  const evidence: SignalEvidence[] = [
    {
      label: "Volume / liquidity",
      value: `${ratio.toFixed(2)}×`,
      source: "/defi/token_overview",
      severity: ratio >= 5 ? "high" : ratio >= 2 ? "medium" : "low"
    }
  ];

  return {
    code: "ABNORMAL_VOLUME_LIQUIDITY",
    label: "Abnormal Volume/Liquidity Ratio",
    contribution,
    severity,
    headline,
    reason:
      ratio >= 2
        ? "Volume is large relative to available liquidity — slippage and rug risk are amplified."
        : "Volume sits within a normal range for the available liquidity.",
    evidence
  };
}

export const ALL_SIGNAL_FUNCTIONS = [
  calculateSmartMoneyDivergence,
  calculateInsiderExitPressure,
  calculateLiquidityFragility,
  calculateSellPressureWhileGreen,
  calculateHolderConcentrationRisk,
  calculateStaticTokenRisk,
  calculateAbnormalVolumeLiquidityRatio
] as const;

export { CAPS as SIGNAL_CAPS };
