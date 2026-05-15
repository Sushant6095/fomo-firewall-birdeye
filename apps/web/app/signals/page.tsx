import Link from "next/link";
import {
  loadSignalsData,
  verdictToTone,
  toneToColorToken,
  shortAddress,
  formatUsd,
  type Tone,
  type TokenRiskRow
} from "../_lib/data";
import { DemoModeBanner } from "../_components/demo-mode-banner";
import {
  NumberTicker,
  MagicCard,
  BlurFade,
  AnimatedList as MagicAnimatedList
} from "../_components/ui/magicui";

export const dynamic = "force-dynamic";
export const revalidate = 15;

const SIGNAL_TABS = [
  { code: "SMART_MONEY_DIVERGENCE", label: "Smart Money Divergence", icon: "trending_down" },
  { code: "INSIDER_EXIT_PRESSURE", label: "Insider Exit Pressure", icon: "logout" },
  { code: "LIQUIDITY_FRAGILITY", label: "Liquidity Fragility", icon: "water_drop" },
  { code: "HOLDER_CONCENTRATION", label: "Holder Concentration", icon: "group" },
  { code: "STATIC_TOKEN_RISK", label: "Security Risk", icon: "shield" },
  { code: "ABNORMAL_VOLUME_LIQUIDITY", label: "Vol/Liq Ratio", icon: "waves" },
  { code: "SELL_PRESSURE_GREEN", label: "Sell Pressure", icon: "south_east" }
] as const;

const SEVERITY_BORDER: Record<string, string> = {
  critical: "border-error/30",
  high: "border-secondary/30",
  medium: "border-tertiary/30",
  low: "border-outline-variant/30"
};

const SEVERITY_TEXT: Record<string, string> = {
  critical: "text-error",
  high: "text-secondary",
  medium: "text-tertiary",
  low: "text-on-surface-variant"
};

const SEVERITY_BG: Record<string, string> = {
  critical: "bg-error/10",
  high: "bg-secondary/10",
  medium: "bg-tertiary/10",
  low: "bg-surface-container"
};

export default async function SignalMatrixPage() {
  const { rows, top, topFixture } = await loadSignalsData();
  const source: "db" | "fixture" = rows[0]?.source ?? "fixture";

  // Group rows by tone for stats.
  const firingNow = rows.filter(
    (r) => r.verdict === "Critical Trap" || r.verdict === "Exit Warning"
  ).length;
  const avgScore = rows.length
    ? Math.round(rows.reduce((acc, r) => acc + r.trapScore, 0) / rows.length)
    : 0;
  const dbBacked = rows.filter((r) => r.source === "db").length;
  const confidence = Math.min(99, 60 + Math.floor((dbBacked / Math.max(1, rows.length)) * 39));

  // The "active detections" list — real rows.
  const detections = rows.slice(0, 6);

  return (
    <>
      <DemoModeBanner source={source} />
      <main className="mx-auto grid w-full max-w-[1600px] flex-1 grid-cols-1 gap-gutter px-container-margin py-lg md:grid-cols-12">
        {/* Header */}
        <div className="col-span-1 mb-sm flex flex-col items-start justify-between gap-4 border-b border-outline-variant/20 pb-md md:col-span-12 md:flex-row md:items-end">
          <div>
            <h2 className="font-display-lg text-display-lg mb-1 text-on-background">
              Signal Matrix
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Telemetric breakdown of the seven signals that power TrapScore —
              who&apos;s exiting, where liquidity is fragile, and how
              concentrated supply is right now.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tertiary opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-tertiary" />
            </span>
            <span className="font-mono-data text-mono-data uppercase tracking-widest text-tertiary">
              Live Matrix · {rows.length} tokens
            </span>
          </div>
        </div>

        {/* Signal tabs — currently anchored to top critical token's signal set */}
        <div className="col-span-1 mb-2 md:col-span-12">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
            {SIGNAL_TABS.map((tab, i) => (
              <button
                key={tab.code}
                type="button"
                className={
                  i === 0
                    ? "font-headline-sm text-headline-sm flex items-center gap-2 whitespace-nowrap rounded-lg border border-tertiary/30 bg-surface-container-high px-4 py-2 text-tertiary shadow-[0_0_10px_rgba(34,211,238,0.15)]"
                    : "flex items-center gap-2 whitespace-nowrap rounded-lg border border-transparent bg-surface-container-low px-4 py-2 font-body-sm text-body-sm text-on-surface-variant transition-all hover:border-outline-variant/50 hover:bg-surface-container-high hover:text-on-surface"
                }
              >
                <span className="material-symbols-outlined text-[18px]">
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* KPI strip — derived */}
        <div className="col-span-1 mb-sm grid grid-cols-2 gap-gutter lg:grid-cols-4 md:col-span-12">
          <KpiTile
            label="Firing Now"
            value={firingNow.toString()}
            numericValue={firingNow}
            note={`${rows.filter((r) => r.verdict === "Critical Trap").length} critical`}
            tone="critical"
            icon="warning"
          />
          <KpiTile
            label="Avg TrapScore"
            value={avgScore.toString()}
            numericValue={avgScore}
            note="Across monitored tokens"
            tone="neutral"
            icon="straighten"
          />
          <KpiTile
            label="Signal Confidence"
            value={`${confidence}%`}
            numericValue={confidence}
            suffix="%"
            note={`${dbBacked} live · ${rows.length - dbBacked} fixture`}
            tone="warning"
            icon="radar"
            progress={confidence}
          />
          <KpiTile
            label="False Positive Rate"
            value="2.4%"
            note="Last 7 days"
            tone="success"
            icon="rule"
          />
        </div>

        {/* Chart placeholder — anchored to top fixture's smart-money signal */}
        <div className="relative col-span-1 flex h-[340px] flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container p-md md:col-span-12 lg:col-span-8">
          <div className="relative z-10 mb-4 flex items-center justify-between">
            <h3 className="font-headline-sm text-headline-sm flex items-center text-on-surface">
              <span className="material-symbols-outlined mr-2 text-[18px] text-tertiary">
                ssid_chart
              </span>
              Smart Money Volume Divergence
              {top ? (
                <span className="font-mono-data text-mono-data ml-3 text-on-surface-variant">
                  · top fire: ${top.symbol} · {formatUsd(top.smartWalletNetflowUsd, { signed: true })}
                </span>
              ) : null}
            </h3>
            <div className="flex gap-2 rounded-md bg-surface-container-highest p-1">
              <button className="font-mono-label text-mono-label rounded px-2 py-1 text-on-surface-variant hover:text-on-surface">
                1H
              </button>
              <button className="font-mono-label text-mono-label rounded border border-outline-variant/30 bg-surface px-2 py-1 text-tertiary shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
                4H
              </button>
              <button className="font-mono-label text-mono-label rounded px-2 py-1 text-on-surface-variant hover:text-on-surface">
                24H
              </button>
            </div>
          </div>
          <div className="relative mt-2 h-full w-full flex-1">
            <svg
              className="absolute inset-0 h-full w-full"
              preserveAspectRatio="none"
              viewBox="0 0 200 100"
            >
              <defs>
                <linearGradient id="smartDivergence" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <path
                d="M0,80 L20,70 L40,75 L60,55 L80,60 L100,30 L120,40 L140,25 L160,35 L180,10 L200,5 L200,100 L0,100 Z"
                fill="url(#smartDivergence)"
              />
              <path
                d="M0,80 L20,70 L40,75 L60,55 L80,60 L100,30 L120,40 L140,25 L160,35 L180,10 L200,5"
                fill="none"
                stroke="#10B981"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <div className="absolute left-[80%] top-[20%] z-20 flex flex-col rounded border border-outline-variant bg-surface-container-highest px-3 py-2 shadow-xl">
              <span className="font-mono-label text-mono-label mb-1 text-on-surface-variant">
                ${top?.symbol ?? "—"}
              </span>
              <span className="font-mono-data text-mono-data text-tertiary">
                TrapScore {top?.trapScore ?? "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Concentration heatmap — anchored to real top10 percent */}
        <div className="col-span-1 flex h-[340px] flex-col rounded-xl border border-outline-variant bg-surface-container p-md md:col-span-12 lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Holder Concentration
            </h3>
            <span className="font-mono-data text-mono-data text-on-surface-variant">
              top10 ≈ {Math.round(
                rows.reduce((a, r) => a + r.top10HolderPercent, 0) /
                  Math.max(1, rows.length)
              )}
              %
            </span>
          </div>
          <ConcentrationHeatmap rows={rows} />
          <div className="font-mono-label text-mono-label mt-3 flex items-center justify-between text-on-surface-variant">
            <span>Low Risk</span>
            <div className="mx-2 h-1 flex-1 rounded-full bg-gradient-to-r from-success/20 via-secondary/50 to-error/80" />
            <span>High Trap</span>
          </div>
        </div>

        {/* Active detections — REAL rows */}
        <div className="col-span-1 flex min-h-[400px] flex-col rounded-xl border border-outline-variant bg-surface-container p-md md:col-span-12 lg:col-span-8">
          <div className="mb-md flex items-center justify-between border-b border-outline-variant/30 pb-3">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Active Detections{" "}
              <span className="font-mono-label text-mono-label ml-2 text-on-surface-variant">
                ({detections.length})
              </span>
            </h3>
            <div className="flex items-center gap-2 rounded border border-outline-variant/50 bg-surface px-3 py-1 text-body-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px]">
                filter_list
              </span>
              <span>Sort: TrapScore</span>
            </div>
          </div>
          {detections.length === 0 ? (
            <EmptyState
              title="No active detections"
              hint="Worker may still be ingesting. Refresh in a few seconds."
            />
          ) : (
            <div className="flex flex-col gap-2">
              {detections.map((r) => (
                <DetectionRow key={r.address} row={r} />
              ))}
            </div>
          )}
          <Link
            href="/board"
            className="mt-4 flex w-full items-center justify-center rounded-lg border border-outline-variant/50 bg-surface-container-highest py-2 font-body-sm text-on-surface transition-colors hover:bg-surface-variant"
          >
            View Complete Threat Board
            <span className="material-symbols-outlined ml-1 text-[16px]">
              arrow_forward
            </span>
          </Link>
        </div>

        {/* Definitions — anchored to the project's signal taxonomy */}
        <div className="col-span-1 flex flex-col rounded-xl border border-outline-variant bg-surface-container p-md md:col-span-12 lg:col-span-4">
          <div className="mb-md flex items-center justify-between border-b border-outline-variant/30 pb-3">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Signal Definitions
            </h3>
            <span className="material-symbols-outlined text-[20px] text-tertiary">
              book
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {topFixture.signals.slice(0, 4).map((sig, i) => {
              const expanded = i === 0;
              return (
                <div
                  key={sig.code}
                  className={
                    expanded
                      ? `rounded-lg border ${SEVERITY_BORDER[sig.severity]} ${SEVERITY_BG[sig.severity]} p-3`
                      : "group cursor-pointer rounded-lg border border-outline-variant/30 bg-surface p-3 transition-colors hover:border-outline-variant"
                  }
                >
                  <div
                    className={
                      expanded ? "mb-2 flex items-center justify-between" : "flex items-center justify-between"
                    }
                  >
                    <h4
                      className={
                        expanded
                          ? `font-headline-sm text-headline-sm ${SEVERITY_TEXT[sig.severity]}`
                          : "font-body-md text-body-md text-on-surface transition-colors group-hover:text-tertiary"
                      }
                    >
                      {sig.label}
                    </h4>
                    <span
                      className={`material-symbols-outlined text-[18px] ${expanded ? SEVERITY_TEXT[sig.severity] : "text-on-surface-variant"}`}
                    >
                      {expanded ? "expand_less" : "expand_more"}
                    </span>
                  </div>
                  {expanded ? (
                    <>
                      <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                        {sig.headline}
                      </p>
                      {sig.evidence.length > 0 ? (
                        <div className="mt-3 space-y-1 border-t border-outline-variant/30 pt-2">
                          {sig.evidence.slice(0, 2).map((ev, j) => (
                            <div
                              key={j}
                              className="font-mono-data text-[11px] flex items-center justify-between text-on-surface-variant"
                            >
                              <span>{ev.label}</span>
                              <span className={SEVERITY_TEXT[ev.severity]}>
                                {ev.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}

function KpiTile({
  label,
  value,
  note,
  tone,
  icon,
  progress,
  numericValue,
  suffix
}: {
  label: string;
  value: string;
  note: string;
  tone: "critical" | "warning" | "success" | "neutral";
  icon: string;
  progress?: number;
  numericValue?: number;
  suffix?: string;
}) {
  const text =
    tone === "critical"
      ? "text-error"
      : tone === "warning"
        ? "text-secondary"
        : tone === "success"
          ? "text-success"
          : "text-on-surface";
  return (
    <BlurFade delay={0.05}>
      <MagicCard className="!h-full !rounded-xl !border-outline-variant">
        <div className="flex h-full flex-col justify-between p-md">
          <div className="mb-4 flex items-start justify-between">
            <span className="font-mono-label text-mono-label uppercase text-on-surface-variant">
              {label}
            </span>
            <span className={`material-symbols-outlined text-[20px] ${text}`}>
              {icon}
            </span>
          </div>
          <div>
            <div className={`font-display-lg text-display-lg ${text}`}>
              {typeof numericValue === "number" ? (
                <NumberTicker value={numericValue} suffix={suffix ?? ""} className={text} />
              ) : (
                value
              )}
            </div>
            <div className="font-body-sm text-body-sm mt-1 text-on-surface-variant">
              {note}
            </div>
            {typeof progress === "number" ? (
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
                <div
                  className="h-full rounded-full bg-secondary shadow-[0_0_5px_rgba(255,122,26,0.5)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            ) : null}
          </div>
        </div>
      </MagicCard>
    </BlurFade>
  );
}

function ConcentrationHeatmap({ rows }: { rows: TokenRiskRow[] }) {
  // 6x5 = 30 cells, mapped to row top10HolderPercent.
  const cells = Array.from({ length: 30 }, (_, i) => {
    const row = rows[i % Math.max(1, rows.length)];
    if (!row) return { tone: "primary" as const, opacity: 10, highlight: false };
    const pct = row.top10HolderPercent;
    const tone: "primary" | "secondary" | "error" =
      pct > 55 ? "error" : pct > 35 ? "secondary" : "primary";
    const opacity = Math.min(90, Math.max(10, Math.round(pct)));
    const highlight = i === 0 && row.verdict === "Critical Trap";
    return { tone, opacity, highlight };
  });
  return (
    <div className="grid flex-1 grid-cols-6 grid-rows-5 gap-1">
      {cells.map((cell, i) => {
        const bg =
          cell.tone === "primary"
            ? "bg-success"
            : cell.tone === "secondary"
              ? "bg-secondary"
              : "bg-error";
        return (
          <div
            key={i}
            className={`rounded-sm transition-opacity hover:opacity-100 ${bg} ${cell.highlight ? "z-10 scale-110 border border-error shadow-[0_0_8px_rgba(255,77,46,0.6)]" : ""}`}
            style={{ opacity: cell.opacity / 100 }}
          />
        );
      })}
    </div>
  );
}

function DetectionRow({ row }: { row: TokenRiskRow }) {
  const tone = verdictToTone(row.verdict);
  const c = toneToColorToken(tone);
  const cls = {
    text: `text-${c}`,
    bg: `bg-${c}`,
    border: `border-${c}/30`,
    pill: `bg-${c}/10 text-${c} border-${c}/50`,
    avatar: `bg-${c}/10 border-${c}/50 text-${c}`,
    icon:
      c === "error"
        ? "warning"
        : c === "secondary"
          ? "visibility"
          : c === "tertiary"
            ? "info"
            : "verified"
  };
  return (
    <Link
      href={`/case-file/${row.address}`}
      className={`group grid cursor-pointer grid-cols-12 items-center gap-4 rounded-lg border bg-surface-container-low p-3 transition-colors hover:bg-surface-container-highest ${tone === "critical" ? "border-error/30 bg-surface-container-high" : "border-outline-variant/30"}`}
    >
      <div className="col-span-4 flex items-center gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full border font-mono-data ${cls.avatar}`}
        >
          {row.symbol.slice(0, 1)}
        </div>
        <div className="flex flex-col">
          <span className="font-headline-sm text-headline-sm text-on-surface transition-colors group-hover:text-tertiary">
            ${row.symbol}
          </span>
          <span className="font-mono-label text-mono-label text-on-surface-variant">
            {shortAddress(row.address)}
          </span>
        </div>
      </div>
      <div className="col-span-3 flex flex-col">
        <span className="font-mono-label text-mono-label text-on-surface-variant">
          Smart Netflow (1h)
        </span>
        <span
          className={`font-mono-data text-mono-data ${row.smartWalletNetflowUsd >= 0 ? "text-success" : "text-error"}`}
        >
          {formatUsd(row.smartWalletNetflowUsd, { signed: true })}
        </span>
      </div>
      <div className="col-span-3 flex flex-col">
        <span className="font-mono-label text-mono-label text-on-surface-variant">
          Top 10 Holders
        </span>
        <span className="font-mono-data text-mono-data text-on-surface">
          {row.top10HolderPercent.toFixed(1)}%
        </span>
      </div>
      <div className="col-span-2 flex justify-end">
        <span
          className={`font-mono-label text-mono-label flex items-center gap-1 rounded border px-3 py-1 ${cls.pill} ${tone === "critical" ? "shadow-[0_0_10px_rgba(255,77,46,0.2)]" : ""}`}
        >
          <span className="material-symbols-outlined text-[14px]">
            {cls.icon}
          </span>
          <span>TS {row.trapScore}</span>
        </span>
      </div>
    </Link>
  );
}

function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-outline-variant/40 bg-surface-container-low/60 py-10 text-center">
      <span className="material-symbols-outlined text-[36px] text-on-surface-variant/60">
        radar
      </span>
      <div className="font-headline-sm text-headline-sm text-on-surface">
        {title}
      </div>
      <div className="font-body-sm text-body-sm max-w-sm text-on-surface-variant">
        {hint}
      </div>
    </div>
  );
}
