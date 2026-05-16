"use client";

import * as React from "react";
import Link from "next/link";
import { ClipboardPaste, Radar, TrendingDown, Users, Droplets, Activity, ShieldAlert, Waves, AlertOctagon, ArrowRight } from "lucide-react";
import { useCmdK } from "./cmdk-context";
import { ShimmerButton } from "./ui/shimmer-button";
import {
  Meteors,
  RetroGrid,
  TypingAnimation,
  WordRotate,
  SparklesText,
  NumberTicker,
  Marquee,
  BentoGrid,
  BentoCard,
  AnimatedList,
  MagicCard,
  OrbitingCircles,
  AnimatedBeam,
  BlurFade,
  Particles,
  Ripple,
  ShineBorder,
  AnimatedShinyText,
  AnimatedGradientText,
  AnimatedGridPattern,
  DotPattern
} from "./ui/magicui";

type Row = {
  address: string;
  symbol: string;
  trapScore: number;
  verdict: "Clean Pump" | "Risky Chase" | "Exit Warning" | "Critical Trap";
  smartWalletNetflowUsd: number;
};

type AlertRecord = {
  type: string;
  tokenAddress: string;
  trapScore: number;
  verdict: "Clean Pump" | "Risky Chase" | "Exit Warning" | "Critical Trap";
  headline: string;
  message: string;
};

const VERDICT_TONE: Record<Row["verdict"], string> = {
  "Critical Trap": "text-error border-error/40",
  "Exit Warning": "text-secondary border-secondary/40",
  "Risky Chase": "text-tertiary border-tertiary/40",
  "Clean Pump": "text-success border-success/40"
};

const VERDICT_DOT: Record<Row["verdict"], string> = {
  "Critical Trap": "bg-error",
  "Exit Warning": "bg-secondary",
  "Risky Chase": "bg-tertiary",
  "Clean Pump": "bg-success"
};

/* ─── HERO ───────────────────────────────────────────────────────── */

export function HomeHero({
  featuredAddress,
  monitoredCount,
  criticalCount
}: {
  featuredAddress: string;
  monitoredCount: number;
  criticalCount: number;
}) {
  const { setOpen } = useCmdK();
  return (
    <section className="relative mb-xl flex min-h-[680px] flex-col items-center justify-center overflow-hidden border-b border-outline-variant/10 py-20 text-center">
      <RetroGrid angle={70} />
      <Meteors number={18} />
      <Particles className="opacity-60" quantity={70} color="#10B981" />
      <Ripple mainCircleSize={120} mainCircleOpacity={0.18} numCircles={6} />

      <BlurFade className="relative z-10 w-full" delay={0.1}>
        <ShineBorder
          borderRadius={9999}
          borderWidth={1}
          duration={8}
          color={["#10B981", "#34D399", "#10B981"]}
          className="mx-auto mb-8"
        >
          <Link
            href="/board"
            className="group flex items-center gap-3 rounded-full bg-surface-container-low/80 px-5 py-2.5 backdrop-blur-md transition-colors hover:bg-surface-container"
            aria-label="View Threat Board"
          >
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>

            <span className="font-mono-label rounded-md border border-success/30 bg-success/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-success">
              Live
            </span>

            <span className="h-3.5 w-px bg-outline-variant/40" aria-hidden />

            <span className="font-mono-label flex items-center gap-2 text-[13px]">
              <NumberTicker
                value={monitoredCount}
                className="font-mono-data text-base font-bold text-on-surface"
              />
              <span className="text-on-surface-variant">tokens monitored</span>
              <span className="text-on-surface-variant/40">·</span>
              <NumberTicker
                value={criticalCount}
                className={`font-mono-data text-base font-bold ${
                  criticalCount > 0 ? "text-error" : "text-on-surface"
                }`}
              />
              <span
                className={
                  criticalCount > 0 ? "text-error" : "text-on-surface-variant"
                }
              >
                critical
              </span>
            </span>

            <ArrowRight className="h-3.5 w-3.5 text-on-surface-variant transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-on-surface" />
          </Link>
        </ShineBorder>
      </BlurFade>

      <BlurFade delay={0.2} className="relative z-10">
        <h1 className="font-display-lg mx-auto mb-3 max-w-4xl text-display-lg tracking-tighter">
          <span className="text-on-surface">You are not early.</span>
        </h1>
        <h2 className="font-display-lg mx-auto mb-6 max-w-4xl text-display-lg leading-[1.05] tracking-tighter">
          <span className="text-on-surface">You are </span>
          <AnimatedGradientText className="font-display-lg text-display-lg font-bold">
            <WordRotate words={["exit liquidity.", "the bag holder.", "their exit.", "the trap."]} duration={2600} />
          </AnimatedGradientText>
        </h2>
      </BlurFade>

      <BlurFade delay={0.3} className="relative z-10">
        <div className="mx-auto mb-10 max-w-2xl text-headline-sm text-on-surface-variant">
          <TypingAnimation
            text="FOMO Firewall reads Birdeye in real-time, runs forensic analysis on every smart-wallet move, and calculates a TrapScore before you ape."
            duration={20}
          />
        </div>
      </BlurFade>

      <BlurFade delay={0.5} className="relative z-10">
        <div className="flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
          <ShimmerButton onClick={() => setOpen(true)} className="!px-8 !py-4 !text-base">
            <ClipboardPaste className="h-5 w-5" />
            Paste a mint
            <kbd className="ml-2 rounded border border-white/20 bg-black/30 px-1.5 py-0.5 font-mono text-[10px] text-white/70">
              ⌘K
            </kbd>
          </ShimmerButton>
          <Link
            href={`/case-file/${featuredAddress}`}
            className="font-headline-sm text-headline-sm group flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface-container-high px-8 py-4 text-on-surface transition-all duration-300 hover:border-error/50 hover:bg-error/10 hover:text-error"
          >
            <Radar className="h-5 w-5 transition-colors group-hover:text-error" />
            Show me the worst trap
          </Link>
        </div>
      </BlurFade>
    </section>
  );
}

/* ─── RISK TICKER ──────────────────────────────────────────────── */

export function HomeRiskTicker({ rows }: { rows: Row[] }) {
  if (rows.length === 0) return null;
  return (
    <section className="mb-xl -mx-md overflow-hidden border-y border-outline-variant/10 bg-surface-container-lowest/50 py-3 md:-mx-container-margin">
      <Marquee pauseOnHover durationSec={48}>
        {rows.map((r) => (
          <Link
            key={r.address}
            href={`/case-file/${r.address}`}
            className={`relative mx-2 inline-flex items-center gap-3 rounded-lg border bg-surface-container-low px-4 py-2 ${VERDICT_TONE[r.verdict]}`}
          >
            <span className="font-mono-data text-mono-data font-bold text-on-surface">
              ${r.symbol}
            </span>
            <span className="font-mono-data text-mono-data">
              <NumberTicker value={r.trapScore} /> TS
            </span>
            <span className={`h-1.5 w-1.5 rounded-full ${VERDICT_DOT[r.verdict]}`} />
          </Link>
        ))}
      </Marquee>
    </section>
  );
}

/* ─── FEATURED ORBIT ───────────────────────────────────────────── */

export function HomeFeaturedOrbit({
  symbol,
  trapScore,
  address,
  verdict,
  reasons
}: {
  symbol: string;
  trapScore: number;
  address: string;
  verdict: Row["verdict"];
  reasons: string[];
}) {
  const tone = VERDICT_TONE[verdict];
  return (
    <BlurFade delay={0.1}>
      <MagicCard
        gradientColor="#34D399"
        gradientOpacity={0.15}
        className="relative col-span-2 flex min-h-[440px] flex-col items-center justify-center overflow-hidden !rounded-2xl !border-error/30 p-6"
      >
        <DotPattern className="opacity-30" glow />
        <OrbitingCircles duration={20} radius={150} delay={0}>
          <span className="grid h-10 w-10 place-items-center rounded-full border border-error/40 bg-surface text-error">
            <AlertOctagon className="h-4 w-4" />
          </span>
        </OrbitingCircles>
        <OrbitingCircles duration={26} radius={210} reverse delay={4}>
          <span className="grid h-10 w-10 place-items-center rounded-full border border-secondary/40 bg-surface text-secondary">
            <TrendingDown className="h-4 w-4" />
          </span>
        </OrbitingCircles>
        <div className="relative z-10 flex flex-col items-center text-center">
          <span className={`font-mono-label text-mono-label mb-2 uppercase tracking-widest ${tone}`}>
            <SparklesText text={verdict} sparkleCount={6} />
          </span>
          <div className="font-display-lg text-[120px] font-bold leading-none text-error drop-shadow-[0_0_15px_rgba(255,77,46,0.4)]">
            <NumberTicker value={trapScore} className="text-error" />
          </div>
          <span className="font-headline-sm text-headline-sm mt-2 text-on-surface">
            ${symbol}
          </span>
          <span className="font-mono-data text-mono-data mt-1 rounded bg-surface-container-highest px-2 py-1 text-on-surface-variant">
            {address.slice(0, 6)}…{address.slice(-4)}
          </span>
          <ul className="mt-4 space-y-1 text-left">
            {reasons.slice(0, 2).map((r, i) => (
              <li
                key={i}
                className="font-body-sm text-body-sm flex items-start gap-2 text-on-surface-variant"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-error" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      </MagicCard>
    </BlurFade>
  );
}

/* ─── SIGNAL BENTO ─────────────────────────────────────────────── */

export function HomeSignalBento({ counts }: { counts: Record<string, number> }) {
  const items = [
    {
      name: "Smart Money Divergence",
      description: "Smart wallets net-sell while retail buys.",
      Icon: TrendingDown,
      count: counts.SMART_MONEY_DIVERGENCE ?? 0,
      className: "col-span-3 md:col-span-2"
    },
    {
      name: "Insider Exit Pressure",
      description: "Dev/insider wallets reduce exposure.",
      Icon: Users,
      count: counts.INSIDER_EXIT_PRESSURE ?? 0,
      className: "col-span-3 md:col-span-1"
    },
    {
      name: "Liquidity Fragility",
      description: "Liquidity contracts while price climbs.",
      Icon: Droplets,
      count: counts.LIQUIDITY_FRAGILITY ?? 0,
      className: "col-span-3 md:col-span-1"
    },
    {
      name: "Sell Pressure While Green",
      description: "Sell volume rises on a green candle.",
      Icon: Activity,
      count: counts.SELL_PRESSURE_GREEN ?? 0,
      className: "col-span-3 md:col-span-1"
    },
    {
      name: "Holder Concentration",
      description: "Top 10 hold too much supply.",
      Icon: Users,
      count: counts.HOLDER_CONCENTRATION ?? 0,
      className: "col-span-3 md:col-span-1"
    },
    {
      name: "Security Risk",
      description: "Mint/freeze auth, mutable metadata.",
      Icon: ShieldAlert,
      count: counts.STATIC_TOKEN_RISK ?? 0,
      className: "col-span-3 md:col-span-2",
      highlight: true
    },
    {
      name: "Abnormal Vol/Liq Ratio",
      description: "Volume far outpaces liquidity.",
      Icon: Waves,
      count: counts.ABNORMAL_VOLUME_LIQUIDITY ?? 0,
      className: "col-span-3 md:col-span-1"
    }
  ];
  return (
    <BentoGrid className="auto-rows-[14rem] md:auto-rows-[16rem]">
      {items.map((item) => (
        <BentoCard
          key={item.name}
          name={item.name}
          description={item.description}
          Icon={item.Icon}
          className={item.className}
          highlight={item.highlight}
          href="/signals"
          cta="Inspect signal"
          background={
            <div className="absolute right-4 top-4 flex flex-col items-end">
              <span className="font-display-lg text-[44px] font-black leading-none text-on-surface/10 transition-colors group-hover:text-error/40">
                <NumberTicker value={item.count} />
              </span>
              <span className="font-mono-label text-mono-label uppercase text-on-surface-variant/30">
                firing now
              </span>
            </div>
          }
        />
      ))}
    </BentoGrid>
  );
}

/* ─── ALERT WIRE (AnimatedList real entry) ────────────────────── */

export function HomeAlertWire({ alerts }: { alerts: AlertRecord[] }) {
  if (alerts.length === 0) {
    return (
      <div className="font-body-sm text-body-sm rounded border border-dashed border-outline-variant/30 p-4 text-center text-on-surface-variant">
        No alerts in the last hour.
      </div>
    );
  }
  return (
    <AnimatedList delay={2400}>
      {alerts.slice(0, 6).map((alert, i) => (
        <Link
          key={`${alert.tokenAddress}-${i}`}
          href={`/case-file/${alert.tokenAddress}`}
          className={`block rounded-lg border border-outline-variant/10 border-l-2 bg-surface-container p-3 shadow-sm transition-opacity hover:opacity-100 ${
            alert.verdict === "Critical Trap"
              ? "border-l-error"
              : alert.verdict === "Exit Warning"
                ? "border-l-secondary"
                : alert.verdict === "Risky Chase"
                  ? "border-l-tertiary"
                  : "border-l-success"
          }`}
        >
          <div className="mb-1 flex items-start justify-between">
            <span
              className={`font-mono-label text-mono-label ${
                alert.verdict === "Critical Trap"
                  ? "text-error"
                  : alert.verdict === "Exit Warning"
                    ? "text-secondary"
                    : "text-success"
              }`}
            >
              {alert.verdict.toUpperCase()}
            </span>
            <span className="font-mono-label text-mono-label text-[10px] text-on-surface-variant">
              TrapScore {alert.trapScore}
            </span>
          </div>
          <div className="font-body-sm text-body-sm text-on-surface">
            {alert.headline}
          </div>
        </Link>
      ))}
    </AnimatedList>
  );
}

/* ─── HOW IT WORKS — AnimatedBeam ──────────────────────────────── */

export function HomeHowItWorks() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const birdeyeRef = React.useRef<HTMLDivElement>(null);
  const trapscoreRef = React.useRef<HTMLDivElement>(null);
  const surfaceRef = React.useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="relative mt-xl flex w-full items-center justify-between rounded-2xl border border-outline-variant/30 bg-surface-container-low p-12"
    >
      <AnimatedGridPattern className="opacity-50" numSquares={20} />
      <Node refEl={birdeyeRef} icon="📡" label="Birdeye Data" hint="Smart wallets · Holder positions · Tx flow" />
      <Node refEl={trapscoreRef} icon="🛡️" label="TrapScore Engine" hint="7 signals · Verdict 0–100 · Evidence" highlight />
      <Node refEl={surfaceRef} icon="🚨" label="Surface" hint="Web · Telegram · Extension" />

      <AnimatedBeam containerRef={containerRef} fromRef={birdeyeRef} toRef={trapscoreRef} />
      <AnimatedBeam containerRef={containerRef} fromRef={trapscoreRef} toRef={surfaceRef} delay={1.4} />
    </div>
  );
}

function Node({
  refEl,
  icon,
  label,
  hint,
  highlight
}: {
  refEl: React.RefObject<HTMLDivElement | null>;
  icon: string;
  label: string;
  hint: string;
  highlight?: boolean;
}) {
  return (
    <div
      ref={refEl}
      className={`relative z-10 flex w-[220px] flex-col items-center gap-2 rounded-xl border bg-surface-container p-5 text-center shadow-[0_4px_24px_rgba(0,0,0,0.25)] ${
        highlight ? "border-error/40" : "border-outline-variant/40"
      }`}
    >
      <span className="text-3xl">{icon}</span>
      <div className="font-headline-sm text-headline-sm text-on-surface">
        {label}
      </div>
      <div className="font-body-sm text-body-sm text-on-surface-variant">
        {hint}
      </div>
    </div>
  );
}

/* ─── HERO STATS ROW ───────────────────────────────────────────── */

export function HomeStatsRow({
  monitored,
  critical,
  warning,
  alerts24h
}: {
  monitored: number;
  critical: number;
  warning: number;
  alerts24h: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-md md:grid-cols-4">
      <StatTile label="Tokens Monitored" value={monitored} hint="across Solana" tone="neutral" />
      <StatTile label="Critical Traps" value={critical} hint="action required" tone="critical" />
      <StatTile label="Exit Warnings" value={warning} hint="smart money fleeing" tone="warning" />
      <StatTile label="Alerts Fired 24h" value={alerts24h} hint="across all channels" tone="tertiary" />
    </div>
  );
}

function StatTile({
  label,
  value,
  hint,
  tone
}: {
  label: string;
  value: number;
  hint: string;
  tone: "neutral" | "critical" | "warning" | "tertiary";
}) {
  const text =
    tone === "critical"
      ? "text-error"
      : tone === "warning"
        ? "text-secondary"
        : tone === "tertiary"
          ? "text-tertiary"
          : "text-on-surface";
  return (
    <BlurFade delay={0.05}>
      <MagicCard className="!min-h-[120px]">
        <div className="flex flex-col gap-1 p-5">
          <span className="font-mono-label text-mono-label uppercase tracking-wider text-on-surface-variant">
            {label}
          </span>
          <div className={`font-display-lg text-display-lg leading-tight ${text}`}>
            <NumberTicker value={value} />
          </div>
          <AnimatedShinyText shimmerWidth={70} className="font-body-sm text-body-sm">
            {hint}
          </AnimatedShinyText>
        </div>
      </MagicCard>
    </BlurFade>
  );
}
