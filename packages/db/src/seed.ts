import { calculateTrapScore, buildTrapInputs, explainTrapScore } from "@fomo/scoring";
import type { EnrichedSnapshot, AlertRecord, TrapVerdict, AlertType } from "@fomo/shared";
import { buildAlertDedupeKey } from "@fomo/shared";
import type { FomoDb } from "./types";

/**
 * Demo seed — populates the in-memory DB with a realistic Risk Board so the
 * dashboard, alert feed, and bot all have something to show before the
 * worker has run a single live pass.
 *
 * The seed mirrors the fixtures in `@fomo/ui` so a screenshot taken now and
 * a screenshot taken after the worker runs are visually identical.
 */
export async function seedDemoData(db: FomoDb): Promise<void> {
  for (const snapshot of DEMO_SNAPSHOTS) {
    await db.upsertToken({
      address: snapshot.address,
      symbol: snapshot.symbol,
      name: snapshot.name
    });
    await db.insertTokenSnapshot(snapshot);

    const inputs = buildTrapInputs(snapshot);
    const result = calculateTrapScore(inputs);
    const summary = explainTrapScore({
      symbol: snapshot.symbol,
      priceChange1h: snapshot.priceChange1h,
      result
    });
    await db.insertScore({
      tokenAddress: snapshot.address,
      scoredAt: snapshot.capturedAt,
      result,
      analystSummary: summary
    });
  }

  for (const alert of DEMO_ALERTS) {
    await db.insertAlertIfNew(alert);
  }
}

// Snapshots intentionally match the `@fomo/ui` fixture file so demo data is
// identical across the dashboard, bot, and extension.
const NOW = Date.now();
const iso = (delta = 0) => new Date(NOW + delta).toISOString();

const DEMO_SNAPSHOTS: EnrichedSnapshot[] = [
  {
    address: "DoGxJTRP7nKpRrjEYRr7nT9hZqEqL8mTjYR4hM7N2ZpL",
    symbol: "DOGX",
    name: "Dogx",
    chain: "solana",
    capturedAt: iso(),
    priceUsd: 0.0042,
    liquidityUsd: 318_000,
    volume1hUsd: 4_120_000,
    priceChange1h: 82.4,
    liquidityChange1h: -22.6,
    marketCapUsd: 4_200_000,
    fdvUsd: 6_400_000,
    buyVolume1hUsd: 1_880_000,
    sellVolume1hUsd: 2_240_000,
    smartWalletBuyUsd: 12_400,
    smartWalletSellUsd: 196_900,
    insiderBuyUsd: 2_100,
    insiderSellUsd: 73_300,
    largeBuyCount: 2,
    largeSellCount: 9,
    top10HolderPercent: 64.8,
    topHolderPercent: 18.4,
    hasMutableMetadata: true,
    hasFreezeAuthority: false,
    hasMintAuthority: true,
    transferFeeBps: 0,
    securityNotes: [
      "Mutable metadata is still enabled.",
      "Mint authority is still active — supply can expand."
    ]
  },
  {
    address: "ExWaRn7yK9pLvR2nM8jHqYpD5eF4cV3bN2aJ1kQ7sT6u",
    symbol: "MOONX",
    name: "Moonx",
    chain: "solana",
    capturedAt: iso(-60_000),
    priceUsd: 0.011,
    liquidityUsd: 612_000,
    volume1hUsd: 1_840_000,
    priceChange1h: 41.2,
    liquidityChange1h: -8.4,
    marketCapUsd: null,
    fdvUsd: null,
    buyVolume1hUsd: 920_000,
    sellVolume1hUsd: 920_000,
    smartWalletBuyUsd: 9_700,
    smartWalletSellUsd: 62_000,
    insiderBuyUsd: 600,
    insiderSellUsd: 8_700,
    largeBuyCount: 1,
    largeSellCount: 4,
    top10HolderPercent: 48.6,
    topHolderPercent: 11.2,
    hasMutableMetadata: false,
    hasFreezeAuthority: false,
    hasMintAuthority: true,
    transferFeeBps: 0,
    securityNotes: ["Mint authority is still active — supply can expand."]
  },
  {
    address: "RiSkY2A4zPq8nF1cT6jL3vK9bH5dM7eY2gP4rN8sX6uK",
    symbol: "NOVA",
    name: "Nova",
    chain: "solana",
    capturedAt: iso(-90_000),
    priceUsd: 0.085,
    liquidityUsd: 1_140_000,
    volume1hUsd: 920_000,
    priceChange1h: 28.7,
    liquidityChange1h: -2.1,
    marketCapUsd: null,
    fdvUsd: null,
    buyVolume1hUsd: 462_000,
    sellVolume1hUsd: 458_000,
    smartWalletBuyUsd: 11_200,
    smartWalletSellUsd: 7_800,
    insiderBuyUsd: 400,
    insiderSellUsd: 1_600,
    largeBuyCount: 1,
    largeSellCount: 1,
    top10HolderPercent: 31.4,
    topHolderPercent: 6.2,
    hasMutableMetadata: false,
    hasFreezeAuthority: false,
    hasMintAuthority: false,
    transferFeeBps: 0,
    securityNotes: ["No active mint or freeze authority detected."]
  },
  {
    address: "CLeaNp5yT3pHnZq2mLrK7vN8jPxR6sFdT4uY9cBaW3iJ",
    symbol: "JITO",
    name: "Clean Pump Example",
    chain: "solana",
    capturedAt: iso(-120_000),
    priceUsd: 2.41,
    liquidityUsd: 8_400_000,
    volume1hUsd: 2_200_000,
    priceChange1h: 12.4,
    liquidityChange1h: 1.6,
    marketCapUsd: null,
    fdvUsd: null,
    buyVolume1hUsd: 1_310_000,
    sellVolume1hUsd: 890_000,
    smartWalletBuyUsd: 74_000,
    smartWalletSellUsd: 11_600,
    insiderBuyUsd: 0,
    insiderSellUsd: 0,
    largeBuyCount: 6,
    largeSellCount: 2,
    top10HolderPercent: 18.2,
    topHolderPercent: 3.4,
    hasMutableMetadata: false,
    hasFreezeAuthority: false,
    hasMintAuthority: false,
    transferFeeBps: 0,
    securityNotes: ["Token is non-mintable and metadata is locked."]
  }
];

function buildDemoAlert(
  type: AlertType,
  tokenAddress: string,
  symbol: string,
  verdict: TrapVerdict,
  trapScore: number,
  headline: string,
  message: string,
  minutesAgo: number
): AlertRecord {
  const firedAt = new Date(NOW - minutesAgo * 60_000).toISOString();
  return {
    id: "", // assigned on insert
    tokenAddress,
    symbol,
    type,
    trapScore,
    verdict,
    headline,
    message,
    firedAt,
    dedupeKey: buildAlertDedupeKey({
      tokenAddress,
      type,
      verdict,
      firedAtMs: NOW - minutesAgo * 60_000
    }),
    deliveredTelegram: false
  };
}

const DEMO_ALERTS: AlertRecord[] = [
  buildDemoAlert(
    "trapscore_spike",
    "DoGxJTRP7nKpRrjEYRr7nT9hZqEqL8mTjYR4hM7N2ZpL",
    "DOGX",
    "Critical Trap",
    92,
    "$DOGX TrapScore jumped 71 → 92",
    "Smart wallets dumped $184.5K into a +82% candle. Insider wallets distributed $71.2K. Liquidity -22.6%.",
    2
  ),
  buildDemoAlert(
    "smart_money_divergence",
    "ExWaRn7yK9pLvR2nM8jHqYpD5eF4cV3bN2aJ1kQ7sT6u",
    "MOONX",
    "Exit Warning",
    74,
    "Smart Money Divergence: $MOONX",
    "Smart wallets net-sold $52.3K while price climbed 41%.",
    14
  ),
  buildDemoAlert(
    "liquidity_fragility",
    "ExWaRn7yK9pLvR2nM8jHqYpD5eF4cV3bN2aJ1kQ7sT6u",
    "MOONX",
    "Exit Warning",
    74,
    "Liquidity Fragility: $MOONX",
    "Liquidity -8.4% while price +41%. Smart wallets net-sold $52.3K.",
    22
  ),
  buildDemoAlert(
    "trapscore_spike",
    "RiSkY2A4zPq8nF1cT6jL3vK9bH5dM7eY2gP4rN8sX6uK",
    "NOVA",
    "Risky Chase",
    46,
    "$NOVA TrapScore now 46",
    "Mixed smart-money signal with elevated volume/liquidity ratio. Treat as Risky Chase.",
    34
  )
];
