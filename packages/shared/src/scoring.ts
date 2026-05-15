import type { TrapVerdict, ScoreReason } from "./index";

/**
 * Inputs to `calculateTrapScore`. Produced by `buildTrapInputs(enriched)` in
 * `@fomo/scoring`. Every field must be in the units described — the scoring
 * engine assumes USD where stated.
 */
export type TrapInputs = {
  priceChange1h: number; // percent, e.g. 82.4 = +82.4%
  liquidityChange1h: number; // percent
  buyVolume1h: number; // USD
  sellVolume1h: number; // USD
  smartWalletBuyUsd: number; // USD
  smartWalletSellUsd: number; // USD
  insiderBuyUsd: number; // USD
  insiderSellUsd: number; // USD
  top10HolderPercent: number; // 0..100
  hasMutableMetadata: boolean;
  hasFreezeAuthority: boolean;
  hasMintAuthority?: boolean;
  transferFeeBps?: number;
  volumeToLiquidityRatio: number;
};

export type TrapScoreResult = {
  trapScore: number;
  verdict: TrapVerdict;
  reasons: ScoreReason[];
  warnings: string[];
};

/**
 * Per-signal result. Each signal in the scoring engine returns one of these
 * so the UI can render a card without re-computing anything.
 */
export type SignalResult = {
  code: SignalCode;
  label: string;
  /** Score contribution clamped to the signal's own cap. */
  contribution: number;
  /** Severity used by the UI for tone selection. */
  severity: "low" | "medium" | "high" | "critical";
  /** Short, screenshot-readable headline. */
  headline: string;
  /** Long-form reason text (1–2 sentences). */
  reason: string;
  /** Raw values that prove the signal — surfaced inside the evidence drawer. */
  evidence: SignalEvidence[];
};

export type SignalCode =
  | "SMART_MONEY_DIVERGENCE"
  | "INSIDER_EXIT_PRESSURE"
  | "LIQUIDITY_FRAGILITY"
  | "SELL_PRESSURE_GREEN"
  | "HOLDER_CONCENTRATION"
  | "STATIC_TOKEN_RISK"
  | "ABNORMAL_VOLUME_LIQUIDITY";

export type SignalEvidence = {
  label: string;
  value: string;
  source: string;
  severity: "low" | "medium" | "high" | "critical";
};

/**
 * The fully enriched, per-token row produced by the worker after a Birdeye
 * fetch sweep. Persisted to `token_snapshots` / `holder_snapshots` /
 * `trade_windows` rows as raw JSON, and fed to `buildTrapInputs`.
 */
export type EnrichedSnapshot = {
  address: string;
  symbol: string;
  name: string;
  chain: "solana";
  capturedAt: string; // ISO timestamp

  // Overview-derived
  priceUsd: number;
  liquidityUsd: number;
  volume1hUsd: number;
  priceChange1h: number;
  liquidityChange1h: number;
  marketCapUsd: number | null;
  fdvUsd: number | null;

  // Tx-window derived
  buyVolume1hUsd: number;
  sellVolume1hUsd: number;
  smartWalletBuyUsd: number;
  smartWalletSellUsd: number;
  insiderBuyUsd: number;
  insiderSellUsd: number;
  largeSellCount: number;
  largeBuyCount: number;

  // Holder-derived
  top10HolderPercent: number;
  topHolderPercent: number;

  // Security
  hasMutableMetadata: boolean;
  hasFreezeAuthority: boolean;
  hasMintAuthority: boolean;
  transferFeeBps: number;
  securityNotes: string[];
};

export type StoredScore = {
  tokenAddress: string;
  scoredAt: string;
  trapScore: number;
  verdict: TrapVerdict;
  reasons: ScoreReason[];
  warnings: string[];
};
