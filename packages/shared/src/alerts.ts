import type { TrapVerdict } from "./index";
import { bucketTimestamp } from "./time";

export type AlertType =
  | "trapscore_spike"
  | "smart_money_divergence"
  | "insider_exit_pressure"
  | "liquidity_fragility";

/**
 * Persisted alert row (mirrors `token_alerts` columns) plus the bot-friendly
 * fields used to format the Telegram payload.
 */
export type AlertRecord = {
  id: string;
  tokenAddress: string;
  symbol: string;
  type: AlertType;
  trapScore: number;
  verdict: TrapVerdict;
  headline: string;
  message: string;
  firedAt: string;
  dedupeKey: string;
  deliveredTelegram: boolean;
};

/**
 * The dedupe key collapses repeated alerts for the same
 * (token, type, verdict) within the same 15-minute window.
 *
 * Example: `"DoGx…ZpL:trapscore_spike:Critical Trap:1715690700000"`.
 */
export function buildAlertDedupeKey(input: {
  tokenAddress: string;
  type: AlertType;
  verdict: TrapVerdict;
  firedAtMs?: number;
}): string {
  const bucket = bucketTimestamp(input.firedAtMs ?? Date.now());
  return [input.tokenAddress, input.type, input.verdict, bucket].join(":");
}
