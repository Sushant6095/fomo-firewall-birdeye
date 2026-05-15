import "server-only";
import {
  listTrendingRiskRows,
  listRecentAlertsService,
  getTokenScore,
  type TokenRiskRow
} from "@/lib/server/score-service";
import {
  RECENT_ALERTS,
  RISK_BOARD_FIXTURES,
  CRITICAL_TRAP_TOKEN,
  fixtureByAddress,
  type TokenRiskFixture,
  type AlertFixture
} from "@fomo/ui";
import type { TrapVerdict } from "@fomo/shared";

export type Tone = "critical" | "warning" | "risky" | "clean";

const VERDICT_TONE: Record<TrapVerdict, Tone> = {
  "Critical Trap": "critical",
  "Exit Warning": "warning",
  "Risky Chase": "risky",
  "Clean Pump": "clean"
};

export function verdictToTone(verdict: TrapVerdict): Tone {
  return VERDICT_TONE[verdict];
}

export function toneToColorToken(tone: Tone): "error" | "secondary" | "tertiary" | "success" {
  if (tone === "critical") return "error";
  if (tone === "warning") return "secondary";
  if (tone === "risky") return "tertiary";
  return "success";
}

export function shortAddress(addr: string, head = 4, tail = 4): string {
  if (!addr) return "";
  if (addr.length <= head + tail + 1) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

export function formatUsd(
  value: number,
  opts: { compact?: boolean; signed?: boolean } = {}
): string {
  const sign = opts.signed && value > 0 ? "+" : "";
  const abs = Math.abs(value);
  let body: string;
  if (opts.compact ?? true) {
    if (abs >= 1_000_000_000) body = `${(value / 1_000_000_000).toFixed(2)}B`;
    else if (abs >= 1_000_000) body = `${(value / 1_000_000).toFixed(2)}M`;
    else if (abs >= 1_000) body = `${(value / 1_000).toFixed(1)}K`;
    else body = value.toFixed(0);
  } else {
    body = value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  return `${sign}$${body}`;
}

export function formatPercent(value: number, digits = 1): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

export function relativeTime(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  const seconds = Math.max(0, (Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return "Just now";
  if (seconds < 60) return `${Math.floor(seconds)}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export type BoardStats = {
  monitored: number;
  critical: number;
  warning: number;
  risky: number;
  clean: number;
  medianTrapScore: number;
  avgLiquidityAtRisk: number;
  alertsFiredToday: number;
};

export function deriveBoardStats(rows: TokenRiskRow[], alerts: number): BoardStats {
  const monitored = Math.max(rows.length, RISK_BOARD_FIXTURES.length);
  const critical = rows.filter((r) => r.verdict === "Critical Trap").length;
  const warning = rows.filter((r) => r.verdict === "Exit Warning").length;
  const risky = rows.filter((r) => r.verdict === "Risky Chase").length;
  const clean = rows.filter((r) => r.verdict === "Clean Pump").length;
  const scores = [...rows].map((r) => r.trapScore).sort((a, b) => a - b);
  const median =
    scores.length === 0
      ? 0
      : scores.length % 2 === 0
        ? Math.round((scores[scores.length / 2 - 1] + scores[scores.length / 2]) / 2)
        : scores[Math.floor(scores.length / 2)];
  const avgLiquidityAtRisk =
    rows
      .filter((r) => r.verdict === "Critical Trap" || r.verdict === "Exit Warning")
      .reduce((acc, r) => acc + r.liquidityUsd, 0) /
    Math.max(1, rows.filter((r) => r.verdict === "Critical Trap" || r.verdict === "Exit Warning").length);
  return {
    monitored,
    critical,
    warning,
    risky,
    clean,
    medianTrapScore: median,
    avgLiquidityAtRisk: avgLiquidityAtRisk || 0,
    alertsFiredToday: alerts
  };
}

export async function loadBoardData() {
  const [rows, alerts] = await Promise.all([
    listTrendingRiskRows(50),
    listRecentAlertsService(50)
  ]);
  const stats = deriveBoardStats(rows, alerts.length);
  return { rows, alerts, stats };
}

export async function loadHomeData() {
  const [rows, alerts] = await Promise.all([
    listTrendingRiskRows(24),
    listRecentAlertsService(12)
  ]);
  const featured =
    rows.find((r) => r.verdict === "Critical Trap") ?? rows[0] ?? null;
  const featuredFixture =
    (featured && fixtureByAddress(featured.address)) || CRITICAL_TRAP_TOKEN;
  return { rows, alerts, featured, featuredFixture };
}

export async function loadAlertsData() {
  const [alerts, watchRows] = await Promise.all([
    listRecentAlertsService(20),
    listTrendingRiskRows(8)
  ]);
  // Use the rich UI fixture alerts if the DB alerts are too sparse.
  const enriched: AlertFixture[] =
    alerts.length > 0
      ? alerts.map((a, i) => ({
          id: `db_${i}`,
          tokenAddress: a.tokenAddress,
          symbol:
            fixtureByAddress(a.tokenAddress)?.symbol ??
            shortAddress(a.tokenAddress, 3, 3),
          type:
            (a.type as AlertFixture["type"]) ?? "trapscore_spike",
          trapScore: a.trapScore,
          verdict: a.verdict,
          headline: a.headline,
          message: a.message,
          firedAt: new Date(Date.now() - (i + 1) * 60_000).toISOString()
        }))
      : RECENT_ALERTS;
  const watchlist = watchRows.slice(0, 4);
  return { alerts: enriched, watchlist };
}

export async function loadSignalsData() {
  const rows = await listTrendingRiskRows(50);
  const top = rows[0] ?? null;
  const topFixture = top
    ? fixtureByAddress(top.address) ?? CRITICAL_TRAP_TOKEN
    : CRITICAL_TRAP_TOKEN;
  return { rows, top, topFixture };
}

export async function loadCaseFile(mintOrSymbol: string): Promise<{
  row: TokenRiskRow | null;
  fixture: TokenRiskFixture | null;
}> {
  // Try by address first.
  const byAddress = await getTokenScore(mintOrSymbol);
  if (byAddress.row) {
    return {
      row: byAddress.row,
      fixture: fixtureByAddress(byAddress.row.address) ?? null
    };
  }
  // Fallback: match by symbol against RISK_BOARD_FIXTURES.
  const normalized = mintOrSymbol.toLowerCase().replace(/^\$/, "");
  const fixture =
    RISK_BOARD_FIXTURES.find(
      (t) =>
        t.symbol.toLowerCase() === normalized ||
        t.name.toLowerCase().replace(/\s+/g, "") === normalized ||
        t.address === mintOrSymbol
    ) ?? null;
  if (!fixture) return { row: null, fixture: null };
  const refreshed = await getTokenScore(fixture.address);
  return { row: refreshed.row, fixture };
}

export {
  RECENT_ALERTS,
  RISK_BOARD_FIXTURES,
  fixtureByAddress,
  CRITICAL_TRAP_TOKEN,
  type TokenRiskFixture,
  type AlertFixture
};
export type { TokenRiskRow };
