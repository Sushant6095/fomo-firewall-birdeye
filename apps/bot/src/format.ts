import type { AlertRecord, TrapVerdict } from "@fomo/shared";

const VERDICT_EMOJI: Record<TrapVerdict, string> = {
  "Clean Pump": "🟢",
  "Risky Chase": "🟡",
  "Exit Warning": "🟠",
  "Critical Trap": "🔴"
};

export type TrapAlertInput = {
  symbol: string;
  address: string;
  trapScore: number;
  verdict: TrapVerdict;
  reasons: string[];
  priceChange1h?: number;
  smartWalletNetflowUsd?: number;
  insiderNetflowUsd?: number;
  liquidityChange1h?: number;
  caseFileUrl: string;
};

const formatUsdShort = (n: number) => {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : n > 0 ? "+" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${abs.toFixed(0)}`;
};

const formatPct = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;

/**
 * Canonical FOMO Firewall alert format. Same shape across:
 *   - dashboard alert copy button
 *   - Telegram bot dispatch
 *   - extension alert preview
 *
 * Plain text only — no Markdown that Telegram could mangle.
 */
export function formatTrapAlert(input: TrapAlertInput): string {
  const lines: string[] = [];
  lines.push(`${VERDICT_EMOJI[input.verdict]} FOMO Firewall · ${input.verdict}`);
  lines.push(`$${input.symbol}`);
  lines.push(`TrapScore: ${input.trapScore}/100`);

  if (typeof input.priceChange1h === "number") {
    lines.push(`1h price: ${formatPct(input.priceChange1h)}`);
  }
  if (typeof input.smartWalletNetflowUsd === "number") {
    lines.push(`Smart wallet netflow: ${formatUsdShort(input.smartWalletNetflowUsd)}`);
  }
  if (typeof input.insiderNetflowUsd === "number") {
    lines.push(`Insider netflow: ${formatUsdShort(input.insiderNetflowUsd)}`);
  }
  if (typeof input.liquidityChange1h === "number") {
    lines.push(`Liquidity Δ: ${formatPct(input.liquidityChange1h)}`);
  }

  if (input.reasons.length > 0) {
    lines.push("");
    lines.push("Why:");
    input.reasons.slice(0, 3).forEach((r) => lines.push(`• ${r}`));
  }
  lines.push("");
  lines.push(`Case file: ${input.caseFileUrl}`);

  return lines.join("\n");
}

/** Render a stored `AlertRecord` (no per-snapshot fields) into Telegram text. */
export function formatAlertRecord(alert: AlertRecord, caseFileUrl: string): string {
  return formatTrapAlert({
    symbol: alert.symbol,
    address: alert.tokenAddress,
    trapScore: alert.trapScore,
    verdict: alert.verdict,
    reasons: [alert.headline, alert.message],
    caseFileUrl
  });
}

export const HELP_TEXT = [
  "FOMO Firewall · Exit-liquidity intelligence",
  "",
  "Commands:",
  "/score <mint>   — current TrapScore for a token",
  "/watch <mint>   — subscribe to alerts for a token",
  "/unwatch <mint> — stop alerts for a token",
  "/alerts         — recent high-risk alerts",
  "/help           — show this message",
  "",
  "Risk intelligence only. Not financial advice."
].join("\n");
