import Link from "next/link";
import {
  loadBoardData,
  verdictToTone,
  toneToColorToken,
  shortAddress,
  formatPercent,
  formatUsd,
  type Tone,
  type TokenRiskRow
} from "../_lib/data";
import { DemoModeBanner } from "../_components/demo-mode-banner";
import { BoardWatchAllButton } from "../_components/board-actions";
import {
  NumberTicker,
  MagicCard,
  ShineBorder,
  BlurFade,
  AnimatedShinyText
} from "../_components/ui/magicui";
import type { TrapVerdict } from "@fomo/shared";

export const dynamic = "force-dynamic";
export const revalidate = 15;

const VERDICT_FILTER_MAP: Record<string, TrapVerdict | "all"> = {
  all: "all",
  clean: "Clean Pump",
  risky: "Risky Chase",
  warning: "Exit Warning",
  critical: "Critical Trap"
};

type SearchParams = Promise<{ filter?: string }>;

function scoreBarColor(tone: Tone): string {
  if (tone === "critical") return "bg-error shadow-[0_0_8px_rgba(255,77,46,0.6)]";
  if (tone === "warning")
    return "bg-secondary shadow-[0_0_8px_rgba(255,122,26,0.4)]";
  if (tone === "risky") return "bg-tertiary shadow-[0_0_8px_rgba(34,211,238,0.3)]";
  return "bg-success shadow-[0_0_8px_rgba(34,197,94,0.4)]";
}

function rowBgByTone(tone: Tone): string {
  if (tone === "critical")
    return "bg-error/5 hover:bg-error/10 border-l-error";
  if (tone === "warning")
    return "hover:bg-surface-container-highest/50 border-transparent hover:border-l-secondary/50";
  if (tone === "risky")
    return "hover:bg-surface-container-highest/50 border-transparent hover:border-l-tertiary/50";
  return "hover:bg-surface-container-highest/50 border-transparent hover:border-l-success/50";
}

function verdictPill(tone: Tone): string {
  if (tone === "critical") return "bg-error-container/30 text-error border-error/20";
  if (tone === "warning") return "bg-secondary-container/20 text-secondary border-secondary/20";
  if (tone === "risky") return "bg-tertiary-container/20 text-tertiary border-tertiary/20";
  return "bg-success/20 text-success border-success/20";
}

export default async function ThreatBoardPage({
  searchParams
}: {
  searchParams?: SearchParams;
}) {
  const params = (await searchParams) ?? {};
  const filterKey = params.filter ?? "critical";
  const filterVerdict = VERDICT_FILTER_MAP[filterKey] ?? "all";

  const { rows: allRows, stats } = await loadBoardData();
  const rows =
    filterVerdict === "all"
      ? allRows
      : allRows.filter((r) => r.verdict === filterVerdict);
  const source: "db" | "fixture" = allRows[0]?.source ?? "fixture";

  const verdictTabs: {
    key: string;
    label: string;
    count: number;
    pill: string;
  }[] = [
    {
      key: "all",
      label: "All",
      count: stats.monitored,
      pill: "bg-surface-variant text-on-surface-variant"
    },
    {
      key: "risky",
      label: "Risky Chase",
      count: stats.risky,
      pill: "bg-tertiary-container/20 text-tertiary"
    },
    {
      key: "warning",
      label: "Exit Warning",
      count: stats.warning,
      pill: "bg-secondary-container/20 text-secondary"
    },
    {
      key: "critical",
      label: "Critical Trap",
      count: stats.critical,
      pill: "bg-error/20 text-error"
    }
  ];

  return (
    <>
      <DemoModeBanner source={source} />
      <main className="relative mx-auto flex w-full max-w-[1600px] flex-1 gap-lg px-container-margin pb-lg pt-6">
      <div className="flex min-w-0 flex-1 flex-col gap-md">
        {/* Filter bar */}
        <div className="sticky top-[72px] z-30 -mx-container-margin flex flex-col items-start justify-between gap-md border-b border-outline-variant/30 bg-background/90 px-container-margin py-sm backdrop-blur-xl xl:flex-row xl:items-center">
          <div className="flex rounded-lg border border-outline-variant/40 bg-surface-container-low p-1">
            {verdictTabs.map((tab) => {
              const active = filterKey === tab.key;
              const toneCls =
                tab.key === "critical"
                  ? "border-error/30 bg-error-container/20 text-error shadow-[0_0_10px_rgba(255,77,46,0.1)]"
                  : tab.key === "warning"
                    ? "border-secondary/30 bg-secondary-container/20 text-secondary"
                    : tab.key === "risky"
                      ? "border-tertiary/30 bg-tertiary-container/20 text-tertiary"
                      : "border-outline-variant/40 bg-surface-variant text-on-surface";
              return (
                <Link
                  key={tab.key}
                  href={`/board?filter=${tab.key}`}
                  className={
                    active
                      ? `flex items-center gap-2 rounded-md border px-4 py-1.5 font-body-sm text-body-sm ${toneCls}`
                      : "flex items-center gap-2 rounded-md px-4 py-1.5 font-body-sm text-body-sm text-on-surface-variant transition-colors hover:text-on-surface"
                  }
                >
                  {tab.label}
                  <span
                    className={`font-mono-label text-mono-label rounded px-1.5 ${tab.pill}`}
                  >
                    {tab.count.toLocaleString()}
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="no-scrollbar flex w-full items-center gap-sm overflow-x-auto pb-2 xl:w-auto xl:pb-0">
            <div className="flex min-w-max cursor-pointer items-center rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-1.5 transition-colors hover:border-outline-variant">
              <span className="material-symbols-outlined mr-2 text-[16px] text-on-surface-variant">
                filter_list
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Smart Money, Insider, Liquidity…
              </span>
              <span className="material-symbols-outlined ml-2 text-[16px] text-on-surface-variant">
                expand_more
              </span>
            </div>
            <div className="flex min-w-max cursor-pointer items-center rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-1.5 transition-colors hover:border-outline-variant">
              <span className="material-symbols-outlined mr-2 text-[16px] text-on-surface-variant">
                calendar_today
              </span>
              <span className="font-mono-data text-mono-data text-on-surface-variant">
                Last 24h
              </span>
            </div>
            <div className="ml-auto xl:ml-md">
              <BoardWatchAllButton
                addresses={allRows
                  .filter((r) => r.verdict === "Critical Trap")
                  .map((r) => r.address)}
              />
            </div>
          </div>
        </div>

        {/* KPI strip — real */}
        <div className="mt-sm grid grid-cols-2 gap-md lg:grid-cols-4">
          <KpiCard
            label="Scanned Targets"
            icon="radar"
            numericValue={stats.monitored}
            note={`${stats.clean} clean, ${stats.risky} risky`}
            noteTone="success"
          />
          <KpiCardBeam
            label="Critical Traps"
            count={stats.critical}
            note="Action Required"
          />
          <KpiCard
            label="Median TrapScore"
            icon="straighten"
            numericValue={stats.medianTrapScore}
            note={`${stats.warning} exit warnings active`}
            noteTone="secondary"
            valueClass="font-headline-md text-headline-md text-secondary tracking-tight"
          />
          <KpiCard
            label="Avg Liquidity At Risk"
            icon="water_drop"
            value={formatUsd(stats.avgLiquidityAtRisk)}
            note={`${stats.alertsFiredToday} alerts fired`}
            noteTone="on-surface-variant"
            valueClass="font-headline-md text-headline-md text-on-surface tracking-tight"
          />
        </div>

        {/* Table */}
        <div className="mt-sm flex flex-1 flex-col overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container/50">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant/40 bg-surface-container/80 backdrop-blur-sm">
                  <Th className="w-12 text-center">Rank</Th>
                  <Th>Target / Mint</Th>
                  <Th className="w-48">TrapScore</Th>
                  <Th>Verdict</Th>
                  <Th className="text-right">Price Δ (1h)</Th>
                  <Th className="text-right">Smart Netflow</Th>
                  <Th className="text-right">Liquidity</Th>
                  <Th className="text-right">Top 10</Th>
                  <th className="w-10 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="font-mono-data text-mono-data divide-y divide-outline-variant/20">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-on-surface-variant">
                      No tokens monitored yet. Worker may still be warming up.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, idx) => (
                    <TableRow key={row.address} row={row} rank={idx + 1} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <RightPeekPanel rows={rows} />
      </main>
    </>
  );
}

function Th({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`font-mono-label text-mono-label px-4 py-3 font-medium uppercase tracking-wider text-on-surface-variant ${className}`}
    >
      {children}
    </th>
  );
}

function KpiCard({
  label,
  icon,
  value,
  numericValue,
  prefix,
  suffix,
  note,
  noteTone,
  valueClass
}: {
  label: string;
  icon: string;
  value?: string;
  numericValue?: number;
  prefix?: string;
  suffix?: string;
  note: string;
  noteTone: "success" | "secondary" | "on-surface-variant";
  valueClass?: string;
}) {
  return (
    <BlurFade delay={0.05}>
      <MagicCard className="!h-full !rounded-xl">
        <div className="p-4">
          <div className="mb-2 flex items-start justify-between">
            <span className="font-mono-label text-mono-label uppercase tracking-wider text-on-surface-variant">
              {label}
            </span>
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant/50">
              {icon}
            </span>
          </div>
          <div className={valueClass ?? "font-headline-md text-headline-md tracking-tight text-on-surface"}>
            {typeof numericValue === "number" ? (
              <NumberTicker value={numericValue} prefix={prefix ?? ""} suffix={suffix ?? ""} />
            ) : (
              value
            )}
          </div>
          <AnimatedShinyText shimmerWidth={60} className={`font-mono-data text-mono-data mt-2 inline-block text-${noteTone}`}>
            {note}
          </AnimatedShinyText>
        </div>
      </MagicCard>
    </BlurFade>
  );
}

function KpiCardBeam({
  label,
  count,
  note
}: {
  label: string;
  count: number;
  note: string;
}) {
  return (
    <BlurFade delay={0.05}>
      <ShineBorder borderRadius={12} borderWidth={1} duration={6} color={["#EF4444", "#f87171", "#EF4444"]} className="!w-full">
        <div className="relative flex h-full w-full flex-col rounded-xl bg-surface-container p-4 backdrop-blur-md">
          <div className="mb-2 flex items-start justify-between">
            <span className="font-mono-label text-mono-label uppercase tracking-wider text-error">
              {label}
            </span>
            <span className="material-symbols-outlined animate-pulse text-[18px] text-error">
              warning
            </span>
          </div>
          <div className="font-headline-md text-headline-md tracking-tight text-error drop-shadow-[0_0_12px_rgba(255,77,46,0.5)]">
            <NumberTicker value={count} className="text-error" />
          </div>
          <div className="font-mono-data text-mono-data mt-auto flex items-center gap-1 pt-2 text-error/80">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-error" /> {note}
          </div>
        </div>
      </ShineBorder>
    </BlurFade>
  );
}

function TableRow({ row, rank }: { row: TokenRiskRow; rank: number }) {
  const tone = verdictToTone(row.verdict);
  const colorToken = toneToColorToken(tone);
  const priceUp = row.priceChange1h >= 0;
  const smartUp = row.smartWalletNetflowUsd >= 0;
  return (
    <tr
      className={`group relative cursor-pointer border-l-2 transition-colors ${rowBgByTone(tone)}`}
    >
      <td className="px-4 py-3 text-center text-on-surface-variant">
        {String(rank).padStart(2, "0")}
      </td>
      <td className="px-4 py-3">
        <Link
          href={`/case-file/${row.address}`}
          className="flex items-center gap-2"
        >
          <div className="h-6 w-6 overflow-hidden rounded border border-outline-variant bg-surface-variant">
            <div
              className={`h-full w-full bg-gradient-to-br from-${colorToken} to-surface-dim`}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-on-surface">
              ${row.symbol}
            </span>
            <span className="text-[10px] text-on-surface-variant opacity-70">
              {shortAddress(row.address)}
            </span>
          </div>
        </Link>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span className={`w-6 text-right font-bold text-${colorToken}`}>
            <NumberTicker value={row.trapScore} className={`text-${colorToken}`} />
          </span>
          <div className="h-1.5 w-full max-w-[120px] overflow-hidden rounded-full bg-surface-variant">
            <div
              className={`h-full ${scoreBarColor(tone)}`}
              style={{ width: `${row.trapScore}%` }}
            />
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-bold ${verdictPill(tone)}`}
        >
          {tone === "critical" ? (
            <span className="material-symbols-outlined mr-1 text-[12px]">
              gavel
            </span>
          ) : null}
          {row.verdict}
        </span>
      </td>
      <td className={`px-4 py-3 text-right ${priceUp ? "text-success" : "text-error"}`}>
        {formatPercent(row.priceChange1h)}
      </td>
      <td className={`px-4 py-3 text-right ${smartUp ? "text-success" : "text-error"}`}>
        {formatUsd(row.smartWalletNetflowUsd, { signed: true })}
      </td>
      <td className="px-4 py-3 text-right text-on-surface-variant">
        {formatUsd(row.liquidityUsd)}
      </td>
      <td className="px-4 py-3 text-right text-on-surface-variant">
        {row.top10HolderPercent.toFixed(1)}%
      </td>
      <td className="px-4 py-3 text-center">
        <Link
          href={`/case-file/${row.address}`}
          className="text-on-surface-variant group-hover:text-on-surface"
          aria-label="Open case file"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </Link>
      </td>
    </tr>
  );
}

function RightPeekPanel({ rows }: { rows: TokenRiskRow[] }) {
  const top = rows.find((r) => r.verdict === "Critical Trap") ?? rows[0];
  if (!top) return null;
  const tone = verdictToTone(top.verdict);
  return (
    <aside className="no-scrollbar sticky top-[96px] hidden h-[calc(100vh-120px)] w-80 shrink-0 flex-col gap-md overflow-y-auto border-l border-outline-variant/20 pl-lg xl:flex lg:w-96">
      <div className="flex items-start justify-between border-b border-outline-variant/30 pb-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-outline-variant bg-surface-variant">
            <div
              className={`h-full w-full bg-gradient-to-br from-${toneToColorToken(tone)} to-surface-dim`}
            />
          </div>
          <div className="flex flex-col">
            <h2 className="font-headline-md text-headline-md leading-none tracking-tight text-on-surface">
              ${top.symbol}
            </h2>
            <div className="mt-1 flex items-center gap-1 text-on-surface-variant">
              <span className="font-mono-data rounded border border-outline-variant/30 bg-surface-container px-1 text-[11px]">
                Solana
              </span>
              <span className="font-mono-data w-24 truncate text-[11px]">
                {shortAddress(top.address)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-sm flex flex-col gap-lg">
        <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-error/20 bg-error/5 p-4 shadow-[inset_0_0_20px_rgba(255,77,46,0.05)]">
          <span className="font-mono-label text-mono-label relative z-10 mb-1 uppercase tracking-widest text-error">
            {top.verdict}
          </span>
          <div className="font-display-lg text-display-lg relative z-10 font-black text-error drop-shadow-[0_0_8px_rgba(255,77,46,0.5)]">
            {top.trapScore}
          </div>
          <span className="font-mono-data relative z-10 text-[10px] text-error/70">
            TRAPSCORE
          </span>
          <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-error/20 blur-2xl" />
        </div>

        <div className="flex flex-col gap-3">
          <span className="font-headline-sm text-[14px] font-medium text-on-surface">
            Top Signals
          </span>
          <PeekStat label="Smart Money Netflow (1h)" value={formatUsd(top.smartWalletNetflowUsd, { signed: true })} negative={top.smartWalletNetflowUsd < 0} />
          <PeekStat label="Insider Netflow (1h)" value={formatUsd(top.insiderNetflowUsd, { signed: true })} negative={top.insiderNetflowUsd < 0} />
          <PeekStat label="Liquidity (Δ 1h)" value={formatPercent(top.liquidityChange1h)} negative={top.liquidityChange1h < 0} />
          <PeekStat label="Top 10 Holders" value={`${top.top10HolderPercent.toFixed(1)}%`} negative={top.top10HolderPercent > 60} />
        </div>

        <div className="mt-auto flex gap-sm pt-md">
          <Link
            href={`/case-file/${top.address}`}
            className="flex-1 rounded-lg bg-error py-2 text-center font-body-sm font-semibold text-on-error shadow-[0_0_15px_rgba(255,77,46,0.2)] transition-colors hover:bg-error/90"
          >
            Open Case File
          </Link>
        </div>
      </div>
    </aside>
  );
}

function PeekStat({
  label,
  value,
  negative
}: {
  label: string;
  value: string;
  negative: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-outline-variant/30 bg-surface-container p-3">
      <span className="font-mono-data text-[12px] text-on-surface-variant">
        {label}
      </span>
      <span
        className={`font-mono-data text-[12px] font-bold ${negative ? "text-error" : "text-success"}`}
      >
        {value}
      </span>
    </div>
  );
}
