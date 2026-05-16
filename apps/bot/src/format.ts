import type { AlertRecord, TrapVerdict } from "@fomo/shared";

const VERDICT_EMOJI: Record<TrapVerdict, string> = {
  "Clean Pump": "🟢",
  "Risky Chase": "🟡",
  "Exit Warning": "🟠",
  "Critical Trap": "🔴"
};

const VERDICT_HEADLINE: Record<TrapVerdict, string> = {
  "Clean Pump": "Clean Pump",
  "Risky Chase": "Risky Chase",
  "Exit Warning": "Exit Warning",
  "Critical Trap": "Critical Trap"
};

export type TrapAlertInput = {
  symbol: string;
  address: string;
  trapScore: number;
  verdict: TrapVerdict;
  reasons: string[];
  analystSummary?: string;
  priceChange1h?: number;
  smartWalletNetflowUsd?: number;
  insiderNetflowUsd?: number;
  liquidityChange1h?: number;
  liquidityUsd?: number;
  volume1hUsd?: number;
  top10HolderPercent?: number;
  caseFileUrl: string;
};

const formatUsdShort = (n: number) => {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : n > 0 ? "+" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${abs.toFixed(0)}`;
};

const formatUsdNoSign = (n: number) => {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(abs / 1_000).toFixed(1)}K`;
  return `$${abs.toFixed(0)}`;
};

const formatPct = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;

// Telegram HTML escape — only these 3 chars need it.
export function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

/**
 * Canonical FOMO Firewall alert. HTML parse-mode (parseMode: "HTML").
 * Safe across:
 *   - dashboard alert copy button (HTML strips cleanly to plain text)
 *   - Telegram bot
 *   - extension preview (renders or strips)
 *
 * Layout: header, ticker glance, score, metric table, analyst note,
 * top reasons, case-file link. Wrapping ticker/score in <b> as a single
 * unit preserves substring matching for tests.
 */
export function formatTrapAlert(input: TrapAlertInput): string {
  const emoji = VERDICT_EMOJI[input.verdict];
  const headline = VERDICT_HEADLINE[input.verdict];
  const lines: string[] = [];

  lines.push(`${emoji} <b>FOMO Firewall</b> · <i>${headline}</i>`);
  lines.push(`<b>$${escHtml(input.symbol)}</b>`);
  lines.push(`<b>TrapScore: ${input.trapScore}/100</b>`);
  lines.push("");

  // Metric table — only rendered when fields are present.
  const metrics: string[] = [];
  if (typeof input.priceChange1h === "number") {
    metrics.push(`Price 1h:  ${formatPct(input.priceChange1h)}`);
  }
  if (typeof input.smartWalletNetflowUsd === "number") {
    metrics.push(`Smart net: ${formatUsdShort(input.smartWalletNetflowUsd)}`);
  }
  if (typeof input.insiderNetflowUsd === "number") {
    metrics.push(`Insider:   ${formatUsdShort(input.insiderNetflowUsd)}`);
  }
  if (typeof input.liquidityChange1h === "number") {
    metrics.push(`Liq Δ:     ${formatPct(input.liquidityChange1h)}`);
  }
  if (typeof input.liquidityUsd === "number" && input.liquidityUsd > 0) {
    metrics.push(`Liq:       ${formatUsdNoSign(input.liquidityUsd)}`);
  }
  if (typeof input.volume1hUsd === "number" && input.volume1hUsd > 0) {
    metrics.push(`Vol 1h:    ${formatUsdNoSign(input.volume1hUsd)}`);
  }
  if (
    typeof input.top10HolderPercent === "number" &&
    input.top10HolderPercent > 0
  ) {
    metrics.push(`Top 10:    ${input.top10HolderPercent.toFixed(1)}%`);
  }
  if (metrics.length > 0) {
    lines.push("<pre>" + metrics.map(escHtml).join("\n") + "</pre>");
  }

  if (input.analystSummary && input.analystSummary.length > 0) {
    lines.push("");
    lines.push(`<i>${escHtml(input.analystSummary)}</i>`);
  }

  if (input.reasons.length > 0) {
    lines.push("");
    lines.push("<b>Why:</b>");
    input.reasons.slice(0, 3).forEach((r) => lines.push(`• ${escHtml(r)}`));
  }

  lines.push("");
  lines.push(
    `📂 <a href="${escHtml(input.caseFileUrl)}">${escHtml(input.caseFileUrl)}</a>`
  );

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

// ─── Leaderboard formatter ─────────────────────────────────────────

export type LeaderboardRow = {
  symbol: string;
  address: string;
  trapScore: number;
  verdict: TrapVerdict;
  priceChange1h: number;
  smartWalletNetflowUsd: number;
};

export function formatLeaderboard(
  title: string,
  rows: LeaderboardRow[],
  emptyText: string
): string {
  if (rows.length === 0) return emptyText;
  const lines: string[] = [];
  lines.push(`📊 <b>${escHtml(title)}</b>`);
  lines.push("");
  rows.slice(0, 8).forEach((r, i) => {
    const emoji = VERDICT_EMOJI[r.verdict];
    const rank = `${i + 1}`.padStart(2, " ");
    lines.push(
      `<code>${rank}.</code> ${emoji} <b>$${escHtml(r.symbol)}</b>  ` +
        `<code>${r.trapScore}</code>  ` +
        `<i>${formatPct(r.priceChange1h)}</i>  ` +
        `smart ${formatUsdShort(r.smartWalletNetflowUsd)}`
    );
  });
  lines.push("");
  lines.push(`<i>Tap a token in the dashboard for the full case file.</i>`);
  return lines.join("\n");
}

export const HELP_TEXT = [
  "<b>FOMO Firewall</b> · Exit-liquidity intelligence for Solana",
  "",
  "<b>Commands</b>",
  "/score <i>&lt;mint&gt;</i>     — current TrapScore for a token",
  "/top              — top trending tokens by TrapScore",
  "/traps            — Critical + Exit Warning only",
  "/watch <i>&lt;mint&gt;</i>     — subscribe to a token's alerts",
  "/unwatch <i>&lt;mint&gt;</i>   — stop alerts for a token",
  "/watching         — list your watched tokens",
  "/alerts           — recent high-risk alerts",
  "/about            — what FOMO Firewall is",
  "/help             — show this message",
  "",
  "<i>Risk intelligence only. Not financial advice.</i>"
].join("\n");

export const START_TEXT = [
  "🛡 <b>FOMO Firewall</b>",
  "",
  "You don't need another pump alert.",
  "You need to know <i>when smart money is exiting</i>.",
  "",
  "Send any Solana mint address and I'll return a TrapScore",
  "(0–100) plus the evidence behind it.",
  "",
  "Try one now:",
  "<code>/score DoGxJTRP7nKpRrjEYRr7nT9hZqEqL8mTjYR4hM7N2ZpL</code>",
  "",
  "Or browse the trending leaderboard with <b>/top</b>.",
  "",
  "<i>Powered by Birdeye Data · Not financial advice.</i>"
].join("\n");

export const ABOUT_TEXT = [
  "🛡 <b>FOMO Firewall</b>",
  "",
  "Exit-liquidity intelligence for Solana traders.",
  "",
  "We monitor trending tokens via Birdeye, track smart-wallet and",
  "insider exits, and compute a <b>TrapScore</b> (0–100) before",
  "retail becomes the exit.",
  "",
  "<b>Verdicts</b>",
  "🟢 <b>0–30</b>   Clean Pump",
  "🟡 <b>31–60</b>  Risky Chase",
  "🟠 <b>61–80</b>  Exit Warning",
  "🔴 <b>81–100</b> Critical Trap",
  "",
  "<b>Surfaces</b> · Web · Telegram · Browser Extension",
  "",
  "<i>Powered by Birdeye Data · Not financial advice.</i>"
].join("\n");

// ─── Keyboard model ─────────────────────────────────────────────────

export type BotButton =
  | { kind: "url"; text: string; url: string }
  | { kind: "callback"; text: string; data: string };

export type BotKeyboard = BotButton[][];

export type BotReply = {
  text: string;
  parseMode?: "HTML" | "MarkdownV2";
  keyboard?: BotKeyboard;
  disableLinkPreview?: boolean;
};

export function scoreKeyboard(
  address: string,
  caseUrl: string,
  watching: boolean
): BotKeyboard {
  return [
    [
      { kind: "url", text: "📂 Case File", url: caseUrl },
      { kind: "callback", text: "🔁 Refresh", data: `refresh:${address}` }
    ],
    [
      watching
        ? { kind: "callback", text: "🚫 Unwatch", data: `unwatch:${address}` }
        : { kind: "callback", text: "👁 Watch", data: `watch:${address}` },
      { kind: "callback", text: "📋 Address", data: `addr:${address}` }
    ]
  ];
}

export function homeKeyboard(): BotKeyboard {
  return [
    [
      { kind: "callback", text: "🔥 /top", data: "cmd:top" },
      { kind: "callback", text: "💀 /traps", data: "cmd:traps" }
    ],
    [
      { kind: "callback", text: "📡 /alerts", data: "cmd:alerts" },
      { kind: "callback", text: "ℹ /about", data: "cmd:about" }
    ]
  ];
}
