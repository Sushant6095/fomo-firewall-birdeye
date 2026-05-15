import type { TrapVerdict } from "@fomo/shared";

export type EvidenceSeverity = "low" | "medium" | "high" | "critical";

export type EvidenceItem = {
  label: string;
  value: string;
  source: string;
  severity: EvidenceSeverity;
};

export type SignalCardFixture = {
  code: string;
  label: string;
  headline: string;
  severity: EvidenceSeverity;
  evidence: EvidenceItem[];
};

export type SparklinePoint = { t: number; v: number };

export type TokenRiskFixture = {
  address: string;
  symbol: string;
  name: string;
  chain: "solana";
  priceChange1h: number;
  volume1hUsd: number;
  liquidityUsd: number;
  liquidityChange1h: number;
  smartWalletNetflowUsd: number;
  insiderNetflowUsd: number;
  top10HolderPercent: number;
  trapScore: number;
  previousTrapScore: number;
  verdict: TrapVerdict;
  reasons: string[];
  evidence: EvidenceItem[];
  signals: SignalCardFixture[];
  priceSparkline: SparklinePoint[];
  liquiditySparkline: SparklinePoint[];
  analystSummary: string;
  securityFlags: {
    mutableMetadata: boolean;
    freezeAuthority: boolean;
    mintAuthority: boolean;
    transferFeeBps: number;
    notes: string[];
  };
};

export type AlertFixture = {
  id: string;
  tokenAddress: string;
  symbol: string;
  type:
    | "trapscore_spike"
    | "smart_money_divergence"
    | "insider_exit_pressure"
    | "liquidity_fragility";
  trapScore: number;
  verdict: TrapVerdict;
  headline: string;
  message: string;
  firedAt: string;
};

const sparkline = (start: number, steps: number, deltas: number[]) => {
  const base = Date.now() - steps * 60_000;
  const points: SparklinePoint[] = [];
  let value = start;
  for (let i = 0; i < steps; i += 1) {
    value = Math.max(0, value + (deltas[i] ?? 0));
    points.push({ t: base + i * 60_000, v: Number(value.toFixed(4)) });
  }
  return points;
};

export const CRITICAL_TRAP_TOKEN: TokenRiskFixture = {
  address: "DoGxJTRP7nKpRrjEYRr7nT9hZqEqL8mTjYR4hM7N2ZpL",
  symbol: "DOGX",
  name: "Dogx",
  chain: "solana",
  priceChange1h: 82.4,
  volume1hUsd: 4_120_000,
  liquidityUsd: 318_000,
  liquidityChange1h: -22.6,
  smartWalletNetflowUsd: -184_500,
  insiderNetflowUsd: -71_200,
  top10HolderPercent: 64.8,
  trapScore: 92,
  previousTrapScore: 71,
  verdict: "Critical Trap",
  reasons: [
    "Price up 82% in 1h while smart wallets are net selling $184.5K.",
    "Insider / dev-tagged wallets reduced exposure by $71.2K.",
    "Liquidity dropped 22.6% during the same window.",
    "Top 10 holders control 64.8% of supply.",
    "Mutable metadata still enabled."
  ],
  evidence: [
    {
      label: "Smart wallet netflow (1h)",
      value: "-$184,500",
      source: "/defi/v3/token/txs",
      severity: "critical"
    },
    {
      label: "Insider/dev netflow (1h)",
      value: "-$71,200",
      source: "/token/v1/holder-profile",
      severity: "high"
    },
    {
      label: "Liquidity change (1h)",
      value: "-22.6%",
      source: "/defi/token_overview",
      severity: "high"
    },
    {
      label: "Top 10 holders",
      value: "64.8%",
      source: "/defi/v3/token/holder",
      severity: "high"
    },
    {
      label: "Mutable metadata",
      value: "Enabled",
      source: "/defi/token_security",
      severity: "medium"
    }
  ],
  signals: [
    {
      code: "SMART_MONEY_DIVERGENCE",
      label: "Smart Money Divergence",
      headline:
        "Smart wallets are dumping $184.5K into a +82% candle. Strongest divergence we track.",
      severity: "critical",
      evidence: [
        {
          label: "Smart buy USD (1h)",
          value: "$12,400",
          source: "/defi/v3/token/txs",
          severity: "low"
        },
        {
          label: "Smart sell USD (1h)",
          value: "$196,900",
          source: "/defi/v3/token/txs",
          severity: "critical"
        }
      ]
    },
    {
      code: "INSIDER_EXIT_PRESSURE",
      label: "Insider Exit Pressure",
      headline:
        "Insider and dev-tagged wallets reduced position by $71.2K in the last hour.",
      severity: "high",
      evidence: [
        {
          label: "Insider buy USD (1h)",
          value: "$2,100",
          source: "/token/v1/holder-positions",
          severity: "low"
        },
        {
          label: "Insider sell USD (1h)",
          value: "$73,300",
          source: "/token/v1/holder-positions",
          severity: "high"
        }
      ]
    },
    {
      code: "LIQUIDITY_FRAGILITY",
      label: "Liquidity Fragility",
      headline:
        "Liquidity drained 22.6% in 1h while price ran. Slippage profile is deteriorating.",
      severity: "high",
      evidence: [
        {
          label: "Liquidity (start)",
          value: "$411k",
          source: "/defi/token_overview",
          severity: "medium"
        },
        {
          label: "Liquidity (now)",
          value: "$318k",
          source: "/defi/token_overview",
          severity: "high"
        }
      ]
    },
    {
      code: "HOLDER_CONCENTRATION",
      label: "Holder Concentration Risk",
      headline: "Top 10 holders sit at 64.8%. Two wallets control 31%.",
      severity: "high",
      evidence: [
        {
          label: "Top 10 holders",
          value: "64.8%",
          source: "/defi/v3/token/holder",
          severity: "high"
        },
        {
          label: "Top wallet share",
          value: "18.4%",
          source: "/defi/v3/token/holder",
          severity: "high"
        }
      ]
    }
  ],
  priceSparkline: sparkline(
    0.0042,
    24,
    [
      0.0001, 0.00015, 0.0002, 0.0001, 0.00025, 0.0003, 0.00035, 0.0004,
      0.0005, 0.00065, 0.0007, 0.00085, 0.00095, 0.0011, 0.00125, 0.0013,
      0.00145, 0.00135, 0.00115, 0.0009, 0.0007, 0.0006, 0.0005, 0.00045
    ]
  ),
  liquiditySparkline: sparkline(
    411_000,
    24,
    [
      -1200, -2200, -1800, -2500, -1900, -2100, -3000, -3400, -2800, -4200,
      -5200, -4800, -6100, -5800, -5200, -4700, -4400, -4100, -3800, -3500,
      -3300, -3100, -2800, -2600
    ]
  ),
  analystSummary:
    "$DOGX is up 82% in 1h, but smart wallets are net-selling, insider/dev-tagged wallets reduced exposure, and liquidity fell during the pump. This pattern suggests possible exit-liquidity behavior.",
  securityFlags: {
    mutableMetadata: true,
    freezeAuthority: false,
    mintAuthority: true,
    transferFeeBps: 0,
    notes: [
      "Metadata is still mutable — symbol/URI can change post-listing.",
      "Mint authority remains active — additional supply can still be issued."
    ]
  }
};

export const EXIT_WARNING_TOKEN: TokenRiskFixture = {
  address: "ExWaRn7yK9pLvR2nM8jHqYpD5eF4cV3bN2aJ1kQ7sT6u",
  symbol: "MOONX",
  name: "Moonx",
  chain: "solana",
  priceChange1h: 41.2,
  volume1hUsd: 1_840_000,
  liquidityUsd: 612_000,
  liquidityChange1h: -8.4,
  smartWalletNetflowUsd: -52_300,
  insiderNetflowUsd: -8_100,
  top10HolderPercent: 48.6,
  trapScore: 74,
  previousTrapScore: 58,
  verdict: "Exit Warning",
  reasons: [
    "Smart wallets net-sold $52.3K while price climbed 41%.",
    "Insider tagged wallets reduced exposure mildly.",
    "Liquidity slipping 8.4% — early fragility signal.",
    "Top 10 holders at 48.6%."
  ],
  evidence: [
    {
      label: "Smart wallet netflow (1h)",
      value: "-$52,300",
      source: "/defi/v3/token/txs",
      severity: "high"
    },
    {
      label: "Liquidity change (1h)",
      value: "-8.4%",
      source: "/defi/token_overview",
      severity: "medium"
    },
    {
      label: "Insider/dev netflow (1h)",
      value: "-$8,100",
      source: "/token/v1/holder-profile",
      severity: "medium"
    }
  ],
  signals: [
    {
      code: "SMART_MONEY_DIVERGENCE",
      label: "Smart Money Divergence",
      headline:
        "Smart wallets net-sold $52.3K against a +41% candle.",
      severity: "high",
      evidence: [
        {
          label: "Smart sell USD (1h)",
          value: "$62,000",
          source: "/defi/v3/token/txs",
          severity: "high"
        }
      ]
    },
    {
      code: "LIQUIDITY_FRAGILITY",
      label: "Liquidity Fragility",
      headline: "Liquidity is slipping early in the pump — watch for cascade.",
      severity: "medium",
      evidence: [
        {
          label: "Liquidity (now)",
          value: "$612k",
          source: "/defi/token_overview",
          severity: "medium"
        }
      ]
    }
  ],
  priceSparkline: sparkline(
    0.011,
    24,
    [
      0.0003, 0.0005, 0.0006, 0.0008, 0.001, 0.0009, 0.0011, 0.0013, 0.0014,
      0.0015, 0.0014, 0.0012, 0.0011, 0.001, 0.0009, 0.0007, 0.0005, 0.0006,
      0.0007, 0.0006, 0.0005, 0.0004, 0.0003, 0.0002
    ]
  ),
  liquiditySparkline: sparkline(
    668_000,
    24,
    [
      -1200, -1100, -900, -850, -1100, -1400, -1700, -1600, -1500, -1400,
      -1300, -1200, -1100, -1000, -1100, -1300, -1500, -1700, -1900, -2100,
      -2200, -2100, -2000, -1800
    ]
  ),
  analystSummary:
    "$MOONX is climbing fast, but smart wallets are turning net sellers and liquidity is showing early fragility. TrapScore indicates elevated chase risk.",
  securityFlags: {
    mutableMetadata: false,
    freezeAuthority: false,
    mintAuthority: true,
    transferFeeBps: 0,
    notes: ["Mint authority still active — supply can expand."]
  }
};

export const RISKY_CHASE_TOKEN: TokenRiskFixture = {
  address: "RiSkY2A4zPq8nF1cT6jL3vK9bH5dM7eY2gP4rN8sX6uK",
  symbol: "NOVA",
  name: "Nova",
  chain: "solana",
  priceChange1h: 28.7,
  volume1hUsd: 920_000,
  liquidityUsd: 1_140_000,
  liquidityChange1h: -2.1,
  smartWalletNetflowUsd: 3_400,
  insiderNetflowUsd: -1_200,
  top10HolderPercent: 31.4,
  trapScore: 46,
  previousTrapScore: 39,
  verdict: "Risky Chase",
  reasons: [
    "Price up 28% in 1h with mixed smart-money signal.",
    "Insider wallets nearly flat — minor outflow.",
    "Liquidity stable but volume/liquidity ratio elevated."
  ],
  evidence: [
    {
      label: "Smart wallet netflow (1h)",
      value: "+$3,400",
      source: "/defi/v3/token/txs",
      severity: "low"
    },
    {
      label: "Volume / liquidity ratio",
      value: "0.81×",
      source: "/defi/token_overview",
      severity: "medium"
    },
    {
      label: "Top 10 holders",
      value: "31.4%",
      source: "/defi/v3/token/holder",
      severity: "medium"
    }
  ],
  signals: [
    {
      code: "ABNORMAL_VOLUME_LIQUIDITY",
      label: "Abnormal Volume/Liquidity Ratio",
      headline:
        "Volume is large relative to liquidity. Watch for slippage cascade.",
      severity: "medium",
      evidence: [
        {
          label: "Volume / liquidity ratio",
          value: "0.81×",
          source: "/defi/token_overview",
          severity: "medium"
        }
      ]
    }
  ],
  priceSparkline: sparkline(
    0.085,
    24,
    [
      0.001, 0.0011, 0.0013, 0.0012, 0.0015, 0.0016, 0.0018, 0.0019, 0.0021,
      0.0023, 0.0025, 0.0024, 0.0022, 0.002, 0.0019, 0.0018, 0.0017, 0.0019,
      0.002, 0.0021, 0.002, 0.0019, 0.0018, 0.0017
    ]
  ),
  liquiditySparkline: sparkline(
    1_165_000,
    24,
    [
      -200, -100, -150, -50, 100, 50, -100, -150, -200, -100, -50, 100, 200,
      150, 100, 0, -50, -100, -150, -100, -50, 0, 50, 100
    ]
  ),
  analystSummary:
    "$NOVA is up but the signal is mixed — smart wallets are roughly flat while volume is running hot relative to liquidity. Treat as a Risky Chase.",
  securityFlags: {
    mutableMetadata: false,
    freezeAuthority: false,
    mintAuthority: false,
    transferFeeBps: 0,
    notes: ["No active mint or freeze authority detected."]
  }
};

export const CLEAN_PUMP_TOKEN: TokenRiskFixture = {
  address: "CLeaNp5yT3pHnZq2mLrK7vN8jPxR6sFdT4uY9cBaW3iJ",
  symbol: "JITO",
  name: "Clean Pump Example",
  chain: "solana",
  priceChange1h: 12.4,
  volume1hUsd: 2_200_000,
  liquidityUsd: 8_400_000,
  liquidityChange1h: 1.6,
  smartWalletNetflowUsd: 62_400,
  insiderNetflowUsd: 0,
  top10HolderPercent: 18.2,
  trapScore: 14,
  previousTrapScore: 16,
  verdict: "Clean Pump",
  reasons: [
    "Smart wallets are net buyers into the move.",
    "Liquidity expanded with price.",
    "Holder concentration is low.",
    "No active mint, freeze authority, or mutable metadata."
  ],
  evidence: [
    {
      label: "Smart wallet netflow (1h)",
      value: "+$62,400",
      source: "/defi/v3/token/txs",
      severity: "low"
    },
    {
      label: "Liquidity change (1h)",
      value: "+1.6%",
      source: "/defi/token_overview",
      severity: "low"
    },
    {
      label: "Top 10 holders",
      value: "18.2%",
      source: "/defi/v3/token/holder",
      severity: "low"
    }
  ],
  signals: [
    {
      code: "SMART_MONEY_DIVERGENCE",
      label: "Smart Money Divergence",
      headline: "Smart wallets are aligned with the move — no divergence.",
      severity: "low",
      evidence: [
        {
          label: "Smart net USD (1h)",
          value: "+$62,400",
          source: "/defi/v3/token/txs",
          severity: "low"
        }
      ]
    }
  ],
  priceSparkline: sparkline(
    2.41,
    24,
    [
      0.01, 0.015, 0.02, 0.022, 0.024, 0.025, 0.026, 0.028, 0.03, 0.032, 0.033,
      0.034, 0.035, 0.034, 0.033, 0.034, 0.035, 0.036, 0.037, 0.038, 0.039,
      0.04, 0.041, 0.042
    ]
  ),
  liquiditySparkline: sparkline(
    8_280_000,
    24,
    [
      2000, 3000, 4500, 5000, 4500, 5200, 6000, 6500, 6200, 5800, 6100, 6500,
      6800, 7100, 7300, 7400, 7600, 7800, 8000, 8200, 8400, 8500, 8600, 8800
    ]
  ),
  analystSummary:
    "$JITO is moving up cleanly: smart wallets are buying with the move, liquidity is expanding, and concentration is low. Risk intelligence: pattern looks healthy.",
  securityFlags: {
    mutableMetadata: false,
    freezeAuthority: false,
    mintAuthority: false,
    transferFeeBps: 0,
    notes: ["Token is non-mintable and metadata is locked."]
  }
};

export const RISK_BOARD_FIXTURES: TokenRiskFixture[] = [
  CRITICAL_TRAP_TOKEN,
  EXIT_WARNING_TOKEN,
  {
    ...CRITICAL_TRAP_TOKEN,
    address: "TrApZ9KpLrMzN8qF2vJxYr1cT6sH3bP4uM7eD5gWaQiV",
    symbol: "PEPE2",
    name: "Pepe2",
    priceChange1h: 64.1,
    volume1hUsd: 3_010_000,
    liquidityUsd: 252_000,
    liquidityChange1h: -18.3,
    smartWalletNetflowUsd: -132_400,
    insiderNetflowUsd: -42_900,
    top10HolderPercent: 58.4,
    trapScore: 86,
    previousTrapScore: 64
  },
  {
    ...EXIT_WARNING_TOKEN,
    address: "ExSp6vC8jMpRqK2nT4hY7L9rD3bF5eV1cN8aJ4uW6sXk",
    symbol: "SPARK",
    name: "Spark",
    priceChange1h: 36.8,
    volume1hUsd: 1_220_000,
    liquidityUsd: 740_000,
    liquidityChange1h: -6.2,
    smartWalletNetflowUsd: -38_100,
    insiderNetflowUsd: -4_400,
    top10HolderPercent: 43.5,
    trapScore: 68,
    previousTrapScore: 55
  },
  RISKY_CHASE_TOKEN,
  {
    ...RISKY_CHASE_TOKEN,
    address: "ChAs3K1pLrMz9qF4vN8jH2cT6sB5dM7eY1pR4uN8sXkJ",
    symbol: "ORCA2",
    name: "Orca2",
    priceChange1h: 19.6,
    volume1hUsd: 540_000,
    liquidityUsd: 1_460_000,
    liquidityChange1h: -0.4,
    smartWalletNetflowUsd: 1_200,
    insiderNetflowUsd: -800,
    top10HolderPercent: 27.1,
    trapScore: 38,
    previousTrapScore: 34
  },
  CLEAN_PUMP_TOKEN,
  {
    ...CLEAN_PUMP_TOKEN,
    address: "CleAnYvB1pK8nM3rT7q2cF6hJ4dL5sN9eP3aRzW8uXkQ",
    symbol: "BONK2",
    name: "Bonk2",
    priceChange1h: 7.8,
    volume1hUsd: 3_400_000,
    liquidityUsd: 12_400_000,
    liquidityChange1h: 0.8,
    smartWalletNetflowUsd: 84_200,
    insiderNetflowUsd: 0,
    top10HolderPercent: 16.4,
    trapScore: 12,
    previousTrapScore: 14
  }
];

export const RECENT_ALERTS: AlertFixture[] = [
  {
    id: "alrt_001",
    tokenAddress: CRITICAL_TRAP_TOKEN.address,
    symbol: CRITICAL_TRAP_TOKEN.symbol,
    type: "trapscore_spike",
    trapScore: 92,
    verdict: "Critical Trap",
    headline: "$DOGX TrapScore jumped 71 → 92",
    message:
      "Smart wallets dumped $184.5K into a +82% candle. Insider wallets distributed $71.2K. Liquidity -22.6%.",
    firedAt: new Date(Date.now() - 2 * 60_000).toISOString()
  },
  {
    id: "alrt_002",
    tokenAddress: "TrApZ9KpLrMzN8qF2vJxYr1cT6sH3bP4uM7eD5gWaQiV",
    symbol: "PEPE2",
    type: "smart_money_divergence",
    trapScore: 86,
    verdict: "Critical Trap",
    headline: "Smart Money Divergence: $PEPE2",
    message:
      "Price +64% in 1h while smart wallets net-sold $132.4K. Insider wallets exited $42.9K.",
    firedAt: new Date(Date.now() - 6 * 60_000).toISOString()
  },
  {
    id: "alrt_003",
    tokenAddress: EXIT_WARNING_TOKEN.address,
    symbol: EXIT_WARNING_TOKEN.symbol,
    type: "insider_exit_pressure",
    trapScore: 74,
    verdict: "Exit Warning",
    headline: "Insider Exit Pressure: $MOONX",
    message:
      "Insider/dev-tagged wallets reduced exposure by $8.1K while price climbed 41%.",
    firedAt: new Date(Date.now() - 14 * 60_000).toISOString()
  },
  {
    id: "alrt_004",
    tokenAddress: "ExSp6vC8jMpRqK2nT4hY7L9rD3bF5eV1cN8aJ4uW6sXk",
    symbol: "SPARK",
    type: "liquidity_fragility",
    trapScore: 68,
    verdict: "Exit Warning",
    headline: "Liquidity Fragility: $SPARK",
    message:
      "Liquidity -6.2% while price +36.8%. Smart wallets net-sold $38.1K.",
    firedAt: new Date(Date.now() - 22 * 60_000).toISOString()
  },
  {
    id: "alrt_005",
    tokenAddress: RISKY_CHASE_TOKEN.address,
    symbol: RISKY_CHASE_TOKEN.symbol,
    type: "trapscore_spike",
    trapScore: 46,
    verdict: "Risky Chase",
    headline: "$NOVA TrapScore now 46",
    message:
      "Mixed smart-money signal with elevated volume/liquidity ratio. Treat as Risky Chase.",
    firedAt: new Date(Date.now() - 34 * 60_000).toISOString()
  }
];

export const DASHBOARD_METRICS = {
  tokensScanned: 8_142,
  criticalTraps: 17,
  cleanPumps: 9,
  alertsFired24h: 142
};

export function fixtureByAddress(
  address: string
): TokenRiskFixture | undefined {
  return RISK_BOARD_FIXTURES.find((t) => t.address === address);
}

export const DEMO_MODE_NOTICE =
  "Demo data. Live Birdeye signal feed connects via the worker; switch with NEXT_PUBLIC_FOMO_LIVE=1.";
