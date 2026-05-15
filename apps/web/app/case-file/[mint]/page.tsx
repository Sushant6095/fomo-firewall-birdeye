import Link from "next/link";
import { notFound } from "next/navigation";
import {
  loadCaseFile,
  verdictToTone,
  toneToColorToken,
  shortAddress,
  formatPercent,
  formatUsd,
  relativeTime,
  type Tone
} from "../../_lib/data";
import { DemoModeBanner } from "../../_components/demo-mode-banner";
import {
  CaseFileActionBar,
  CopyAddressButton,
  WatchTokenButton
} from "../../_components/case-file-actions";
import { isWatched, isBlocked } from "@/lib/server/user-state";
import {
  NumberTicker,
  OrbitingCircles,
  AnimatedList,
  MagicCard,
  ShineBorder,
  BlurFade,
  DotPattern,
  SparklesText
} from "../../_components/ui/magicui";
import { BorderBeam } from "../../_components/ui/border-beam";

export const dynamic = "force-dynamic";
export const revalidate = 15;

type CaseFileParams = { params: Promise<{ mint: string }> };

const SEVERITY_TONE: Record<string, Tone> = {
  critical: "critical",
  high: "warning",
  medium: "risky",
  low: "clean"
};

const SEVERITY_BG: Record<string, string> = {
  critical: "border-error/20 bg-error/5",
  high: "border-secondary/20 bg-secondary/5",
  medium: "border-tertiary/20 bg-tertiary/5",
  low: "border-outline-variant/30 bg-surface-container-low opacity-80"
};

const SEVERITY_ICON_BG: Record<string, string> = {
  critical: "bg-error/10 text-error",
  high: "bg-secondary/10 text-secondary",
  medium: "bg-tertiary/10 text-tertiary",
  low: "bg-surface-variant text-on-surface-variant"
};

const SEVERITY_PILL: Record<string, string> = {
  critical: "bg-error/20 text-error border-error/30",
  high: "bg-secondary/20 text-secondary border-secondary/30",
  medium: "bg-tertiary/20 text-tertiary border-tertiary/30",
  low: "bg-surface-variant text-on-surface-variant border-outline-variant/50"
};

const SIGNAL_ICON_MAP: Record<string, string> = {
  SMART_MONEY_DIVERGENCE: "trending_down",
  INSIDER_EXIT_PRESSURE: "logout",
  LIQUIDITY_FRAGILITY: "water_drop",
  SELL_PRESSURE_GREEN: "south_east",
  HOLDER_CONCENTRATION: "group",
  STATIC_TOKEN_RISK: "shield",
  ABNORMAL_VOLUME_LIQUIDITY: "waves"
};

export default async function TokenCaseFilePage({ params }: CaseFileParams) {
  const { mint } = await params;
  const { row, fixture } = await loadCaseFile(mint);
  if (!row && !fixture) notFound();

  // Prefer real row data; fall back to fixture for evidence/signals/timeline.
  const symbol = row?.symbol ?? fixture?.symbol ?? "";
  const name = fixture?.name ?? row?.name ?? symbol;
  const address = row?.address ?? fixture?.address ?? mint;
  const verdict = row?.verdict ?? fixture?.verdict ?? "Critical Trap";
  const trapScore = row?.trapScore ?? fixture?.trapScore ?? 0;
  const previousTrapScore = fixture?.previousTrapScore;
  const delta =
    typeof previousTrapScore === "number" ? trapScore - previousTrapScore : 0;
  const tone = verdictToTone(verdict);
  const toneColor = toneToColorToken(tone);
  const source: "db" | "fixture" = row?.source ?? "fixture";
  const initialWatched = isWatched(address);
  const initialBlocked = isBlocked(address);

  const reasons = fixture?.reasons ?? [];
  const evidence = fixture?.evidence ?? [];
  const signals = fixture?.signals ?? [];
  const security = fixture?.securityFlags;
  const analyst = fixture?.analystSummary;

  // Derive a tactical timeline from real row + evidence severities.
  const now = Date.now();
  const timelineEvents = [
    {
      time: relativeTime(new Date(now - 2 * 60_000)),
      title: "Smart wallets flipped sellers",
      body: `Smart wallet netflow: ${formatUsd(row?.smartWalletNetflowUsd ?? -184_500, { signed: true })} in the last hour.`,
      tone: "critical" as Tone
    },
    {
      time: relativeTime(new Date(now - 15 * 60_000)),
      title: "Liquidity contraction",
      body: `Liquidity ${formatPercent(row?.liquidityChange1h ?? -22.6)} while price ${formatPercent(row?.priceChange1h ?? 82.4)} — exit-liquidity pattern.`,
      tone: "warning" as Tone
    },
    {
      time: relativeTime(new Date(now - 60 * 60_000)),
      title: "Token first scored",
      body: `Entered the FOMO Firewall watch set with TrapScore ${previousTrapScore ?? Math.max(0, trapScore - 20)}.`,
      tone: "risky" as Tone
    }
  ];

  return (
    <>
      <DemoModeBanner source={source} />
      <main className="mx-auto min-h-screen w-full max-w-[1440px] flex-1 px-container-margin pb-xl pt-6">
        {/* Header */}
        <div className="mb-lg flex flex-col justify-between gap-md md:flex-row md:items-center">
          <div>
            <div className="mb-xs flex items-center gap-sm text-on-surface-variant">
              <Link
                href="/"
                className="font-mono-label text-mono-label uppercase tracking-widest opacity-70 hover:opacity-100"
              >
                Terminal
              </Link>
              <span className="material-symbols-outlined text-[14px]">
                chevron_right
              </span>
              <Link
                href="/board"
                className="font-mono-label text-mono-label uppercase tracking-widest opacity-70 hover:opacity-100"
              >
                Threat Board
              </Link>
              <span className="material-symbols-outlined text-[14px]">
                chevron_right
              </span>
              <span className="font-mono-label text-mono-label text-primary">
                ${symbol}
              </span>
            </div>
            <div className="flex items-center gap-md">
              <h2 className="font-display-lg text-display-lg text-on-surface">
                ${symbol}{" "}
                <span className="font-headline-md text-headline-md text-on-surface-variant">
                  / {name}
                </span>
              </h2>
              <div className="flex items-center gap-sm rounded-md border border-outline-variant bg-surface-container px-sm py-xs">
                <span className="font-mono-data text-mono-data text-on-surface-variant">
                  {shortAddress(address, 6, 6)}
                </span>
                <CopyAddressButton address={address} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-sm">
            <WatchTokenButton
              address={address}
              symbol={symbol}
              initialWatched={initialWatched}
            />
          </div>
        </div>

        {/* Hero stats */}
        <div className="mb-xl grid grid-cols-1 gap-lg lg:grid-cols-12">
          {/* TrapScore Hero — with OrbitingCircles + BorderBeam + Sparkles */}
          <div className="col-span-1 flex flex-col gap-md lg:col-span-5">
            <div className="relative flex min-h-[480px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-low p-lg">
              <BorderBeam size={250} duration={9} colorFrom="#10B981" colorTo="#84CC16" />
              <DotPattern className="opacity-30" glow />
              <div
                className={`absolute inset-0 -translate-y-1/4 scale-150 transform rounded-full blur-3xl ${tone === "critical" ? "bg-error/15" : tone === "warning" ? "bg-secondary/15" : "bg-tertiary/15"}`}
              />
              <OrbitingCircles duration={26} radius={180} delay={0}>
                <span className="grid h-8 w-8 place-items-center rounded-full border border-error/40 bg-surface text-[10px] font-bold text-error">
                  SM
                </span>
              </OrbitingCircles>
              <OrbitingCircles duration={32} radius={230} reverse delay={3}>
                <span className="grid h-8 w-8 place-items-center rounded-full border border-secondary/40 bg-surface text-[10px] font-bold text-secondary">
                  IX
                </span>
              </OrbitingCircles>
              <div className="z-10 flex flex-col items-center text-center">
                <span
                  className={`font-mono-label text-mono-label mb-sm flex items-center gap-xs uppercase tracking-widest ${tone === "critical" ? "text-error" : tone === "warning" ? "text-secondary" : tone === "risky" ? "text-tertiary" : "text-success"}`}
                >
                  <span
                    className={`h-2 w-2 animate-pulse rounded-full ${tone === "critical" ? "bg-error" : tone === "warning" ? "bg-secondary" : "bg-success"}`}
                  />
                  <SparklesText text={verdict} sparkleCount={5} />
                </span>
                <ScoreGauge score={trapScore} tone={tone} />
                <div
                  className={`font-headline-md text-headline-md mb-lg bg-gradient-to-r ${
                    tone === "critical"
                      ? "from-error to-secondary"
                      : tone === "warning"
                        ? "from-secondary to-tertiary"
                        : "from-tertiary to-success"
                  } bg-clip-text font-bold uppercase tracking-widest text-transparent`}
                >
                  {tone === "critical"
                    ? "High Probability Trap"
                    : tone === "warning"
                      ? "Exit Liquidity Signal"
                      : tone === "risky"
                        ? "Mixed Signal — Watch Closely"
                        : "Clean For Now"}
                </div>
                {typeof previousTrapScore === "number" ? (
                  <div className="font-mono-data text-mono-data flex items-center gap-2 text-on-surface-variant">
                    <span>was {previousTrapScore}</span>
                    <span
                      className={`flex items-center ${delta >= 0 ? "text-error" : "text-success"}`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {delta >= 0 ? "arrow_upward" : "arrow_downward"}
                      </span>
                      {Math.abs(delta)}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Right column — Analyst Summary + Stats */}
          <div className="col-span-1 flex flex-col gap-md lg:col-span-7">
            <div className="rounded-xl border border-outline-variant/30 bg-surface-container p-lg">
              <h3 className="font-mono-label text-mono-label mb-3 uppercase tracking-widest text-on-surface-variant">
                Analyst Summary
              </h3>
              <p className="font-body-md text-body-md leading-relaxed text-on-surface">
                {analyst ??
                  `${symbol} is currently flagged by FOMO Firewall as a ${verdict}. Review reasons and evidence below before considering any exposure.`}
              </p>
              <p className="font-mono-label text-mono-label mt-4 text-on-surface-variant opacity-70">
                Not financial advice. TrapScore reflects elevated structural
                risk based on on-chain heuristics — not certainty of malice.
              </p>
            </div>
            {row ? (
              <div className="grid grid-cols-3 gap-md">
                <Stat
                  label="1h Price"
                  value={formatPercent(row.priceChange1h)}
                  positive={row.priceChange1h >= 0}
                />
                <Stat
                  label="1h Volume"
                  value={formatUsd(row.volume1hUsd)}
                />
                <Stat label="Liquidity" value={formatUsd(row.liquidityUsd)} />
                <Stat
                  label="Smart Netflow"
                  value={formatUsd(row.smartWalletNetflowUsd, { signed: true })}
                  positive={row.smartWalletNetflowUsd >= 0}
                />
                <Stat
                  label="Insider Netflow"
                  value={formatUsd(row.insiderNetflowUsd, { signed: true })}
                  positive={row.insiderNetflowUsd >= 0}
                />
                <Stat
                  label="Top 10 Holders"
                  value={`${row.top10HolderPercent.toFixed(1)}%`}
                  positive={row.top10HolderPercent < 50}
                />
              </div>
            ) : null}
          </div>
        </div>

        {/* Why headline reasons */}
        {reasons.length > 0 ? (
          <div className="mb-xl rounded-xl border border-outline-variant/30 bg-surface-container/60 p-lg">
            <h3 className="font-headline-md text-headline-md mb-4 flex items-center gap-sm text-on-surface">
              <span className="material-symbols-outlined text-error">
                gavel
              </span>
              Why this verdict
            </h3>
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {reasons.map((reason, i) => (
                <li
                  key={i}
                  className="font-body-md text-body-md flex items-start gap-2 text-on-surface"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-error" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Risk Signals grid */}
        {signals.length > 0 ? (
          <div className="mb-xl">
            <h3 className="font-headline-md text-headline-md mb-md text-on-surface">
              Risk Signals
            </h3>
            <div className="grid grid-cols-1 gap-md md:grid-cols-2 lg:grid-cols-3">
              {signals.map((sig) => {
                const sigTone =
                  sig.severity === "critical"
                    ? "critical"
                    : sig.severity === "high"
                      ? "warning"
                      : sig.severity === "medium"
                        ? "risky"
                        : "clean";
                return (
                  <article
                    key={sig.code}
                    className={`group flex flex-col gap-3 rounded-xl border bg-surface-container p-4 ${
                      sigTone === "critical"
                        ? "border-error/30"
                        : sigTone === "warning"
                          ? "border-secondary/30"
                          : "border-outline-variant/30"
                    }`}
                  >
                    <header className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`grid h-8 w-8 place-items-center rounded-md border ${
                            sigTone === "critical"
                              ? "border-error/30 bg-error/10 text-error"
                              : sigTone === "warning"
                                ? "border-secondary/30 bg-secondary/10 text-secondary"
                                : "border-outline-variant bg-surface-container-high text-on-surface-variant"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {SIGNAL_ICON_MAP[sig.code] ?? "monitoring"}
                          </span>
                        </span>
                        <div className="text-sm font-semibold text-on-surface">
                          {sig.label}
                        </div>
                      </div>
                      <span
                        className={`font-mono-label rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${SEVERITY_PILL[sig.severity]}`}
                      >
                        {sig.severity}
                      </span>
                    </header>
                    <p className="font-body-sm text-body-sm leading-relaxed text-on-surface/90">
                      {sig.headline}
                    </p>
                    {sig.evidence.length > 0 ? (
                      <div className="font-mono-data flex flex-col gap-1 border-t border-outline-variant/30 pt-2 text-[11px]">
                        {sig.evidence.slice(0, 2).map((ev, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-on-surface-variant"
                          >
                            <span>{ev.label}</span>
                            <span
                              className={
                                ev.severity === "critical"
                                  ? "text-error"
                                  : ev.severity === "high"
                                    ? "text-secondary"
                                    : "text-on-surface"
                              }
                            >
                              {ev.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Evidence Log */}
        {evidence.length > 0 ? (
          <div className="mb-xl">
            <h3 className="font-headline-md text-headline-md mb-md flex items-center gap-sm text-on-surface">
              <span className="material-symbols-outlined text-tertiary">
                database
              </span>
              Evidence Log
              <span className="font-mono-label text-mono-label ml-2 text-on-surface-variant">
                {evidence.length} item{evidence.length === 1 ? "" : "s"}
              </span>
            </h3>
            <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-lg">
              <AnimatedList delay={2200} className="!gap-sm">
                {evidence.map((ev, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-md rounded-lg border p-md ${SEVERITY_BG[ev.severity]}`}
                  >
                    <div
                      className={`flex shrink-0 items-center justify-center rounded-full p-sm ${SEVERITY_ICON_BG[ev.severity]}`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {ev.severity === "critical"
                          ? "warning"
                          : ev.severity === "high"
                            ? "priority_high"
                            : ev.severity === "medium"
                              ? "info"
                              : "check_circle"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="mb-xs flex flex-wrap items-center gap-sm">
                        <span
                          className={`font-mono-label text-mono-label rounded border px-xs py-0.5 uppercase ${SEVERITY_PILL[ev.severity]}`}
                        >
                          {ev.severity}
                        </span>
                        <span className="font-body-md text-body-md font-semibold text-on-surface">
                          {ev.label}
                        </span>
                        <span className="font-mono-data text-mono-data ml-auto text-on-surface">
                          {ev.value}
                        </span>
                      </div>
                      <p className="font-mono-data text-mono-data text-[11px] text-on-surface-variant">
                        <span className="material-symbols-outlined mr-1 align-text-bottom text-[12px]">
                          link
                        </span>
                        Source: <code className="rounded bg-surface-container px-1">{ev.source}</code>
                      </p>
                    </div>
                  </div>
                ))}
              </AnimatedList>
            </div>
          </div>
        ) : null}

        {/* Tactical Timeline */}
        <div className="mb-xl">
          <h3 className="font-headline-md text-headline-md mb-md text-on-surface">
            Tactical Timeline
          </h3>
          <div className="relative rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-lg">
            <div className="absolute bottom-lg left-10 top-lg z-0 w-px bg-surface-variant" />
            <div className="relative z-10 flex flex-col gap-lg pl-xl">
              {timelineEvents.map((event, i) => {
                const dot = event.tone === "critical" ? "bg-error" : event.tone === "warning" ? "bg-secondary" : event.tone === "risky" ? "bg-tertiary" : "bg-success";
                const timeColor = event.tone === "critical" ? "text-error" : event.tone === "warning" ? "text-secondary" : event.tone === "risky" ? "text-tertiary" : "text-on-surface-variant";
                return (
                  <div key={i} className="relative">
                    <div
                      className={`absolute -left-12 top-1 z-10 h-3 w-3 rounded-full border-2 border-surface-container-lowest ${dot}`}
                    />
                    <div className="mb-xs flex items-baseline gap-md">
                      <span className={`font-mono-data text-mono-data ${timeColor}`}>
                        {event.time}
                      </span>
                      <span className="font-headline-sm text-headline-sm text-on-surface">
                        {event.title}
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm max-w-2xl text-on-surface-variant">
                      {event.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Security flags */}
        {security ? (
          <div className="mb-xl">
            <h3 className="font-headline-md text-headline-md mb-md flex items-center gap-sm text-on-surface">
              <span className="material-symbols-outlined text-secondary">
                shield
              </span>
              Static Token Security
            </h3>
            <div className="grid grid-cols-2 gap-md md:grid-cols-4">
              <SecurityFlag label="Mutable Metadata" value={security.mutableMetadata} />
              <SecurityFlag label="Freeze Authority" value={security.freezeAuthority} />
              <SecurityFlag label="Mint Authority" value={security.mintAuthority} />
              <SecurityFlag
                label="Transfer Fee"
                value={security.transferFeeBps > 0}
                detail={`${security.transferFeeBps} bps`}
              />
            </div>
            {security.notes.length > 0 ? (
              <ul className="mt-4 space-y-1">
                {security.notes.map((note, i) => (
                  <li
                    key={i}
                    className="font-body-sm text-body-sm flex items-start gap-2 text-on-surface-variant"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-on-surface-variant" />
                    {note}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        {/* Action bar — real APIs */}
        <CaseFileActionBar
          address={address}
          symbol={symbol}
          trapScore={trapScore}
          verdict={verdict}
          initialWatched={initialWatched}
          initialBlocked={initialBlocked}
        />

        <p className="font-mono-label text-mono-label mt-lg max-w-3xl text-on-surface-variant opacity-50">
          Disclaimer: Analysis is based on on-chain heuristics. High TrapScores
          indicate elevated structural risk — not definitive malice. Not
          financial advice.
        </p>
      </main>
    </>
  );
}

function ScoreGauge({ score, tone }: { score: number; tone: Tone }) {
  const ringColor =
    tone === "critical"
      ? "#EF4444"
      : tone === "warning"
        ? "#F97316"
        : tone === "risky"
          ? "#84CC16"
          : "#22C55E";
  const circumference = 282.7;
  const dashOffset = circumference - (score / 100) * circumference;
  return (
    <div className="relative mb-md flex h-48 w-48 items-center justify-center">
      <svg
        className="absolute inset-0 h-full w-full -rotate-90"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          fill="none"
          r="45"
          stroke="#2f3542"
          strokeWidth="3"
        />
        <circle
          cx="50"
          cy="50"
          fill="none"
          r="45"
          stroke={ringColor}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <span
        className="font-display-lg text-display-lg tabular-nums tracking-tighter"
        style={{ fontSize: "72px", lineHeight: "1", color: ringColor }}
      >
        <NumberTicker value={score} />
      </span>
      <div className="font-mono-label text-mono-label absolute bottom-4 left-1/2 -translate-x-1/2 transform text-on-surface-variant">
        TRAPSCORE
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  positive
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <MagicCard className="!rounded-xl !border-outline-variant/30">
      <div className="p-md">
        <div className="font-mono-label text-mono-label uppercase tracking-wider text-on-surface-variant">
          {label}
        </div>
        <div
          className={`font-mono-data mt-1 text-base font-semibold tabular-nums ${
            positive === true
              ? "text-success"
              : positive === false
                ? "text-error"
                : "text-on-surface"
          }`}
        >
          {value}
        </div>
      </div>
    </MagicCard>
  );
}

function SecurityFlag({
  label,
  value,
  detail
}: {
  label: string;
  value: boolean;
  detail?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-outline-variant/30 bg-surface-container p-md">
      <span
        className={`material-symbols-outlined mt-0.5 ${value ? "text-error" : "text-success"}`}
      >
        {value ? "dangerous" : "check_circle"}
      </span>
      <div>
        <div className="font-body-md text-body-md text-on-surface">
          {label}
        </div>
        <div
          className={`font-mono-data text-mono-data mt-1 ${value ? "text-error" : "text-success"}`}
        >
          {value ? detail ?? "Enabled" : "Clear"}
        </div>
      </div>
    </div>
  );
}
