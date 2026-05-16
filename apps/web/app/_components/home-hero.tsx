"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ClipboardPaste,
  Radar,
  TrendingDown,
  Users,
  Droplets,
  Activity,
  ShieldAlert,
  Waves,
  AlertOctagon,
  ArrowRight,
  Zap,
  Puzzle,
  Database,
  Skull,
  Flame
} from "lucide-react";
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

/* ─── HERO SUB-COMPONENTS ────────────────────────────────────────── */

function LiveStatusPill({
  monitored,
  critical
}: {
  monitored: number;
  critical: number;
}) {
  return (
    <ShineBorder
      borderRadius={9999}
      borderWidth={1}
      duration={8}
      color={["#10B981", "#34D399", "#10B981"]}
      className="!mx-0"
    >
      <Link
        href="/board"
        className="group flex items-center gap-3 rounded-full bg-surface-container-low/80 px-4 py-2 backdrop-blur-md transition-colors hover:bg-surface-container"
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
        <span className="font-mono-label flex items-center gap-2 text-[12px]">
          <NumberTicker
            value={monitored}
            className="font-mono-data text-sm font-bold text-on-surface"
          />
          <span className="text-on-surface-variant">tokens monitored</span>
          <span className="text-on-surface-variant/40">·</span>
          <NumberTicker
            value={critical}
            className={`font-mono-data text-sm font-bold ${
              critical > 0 ? "text-error" : "text-on-surface"
            }`}
          />
          <span className={critical > 0 ? "text-error" : "text-on-surface-variant"}>
            critical
          </span>
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-on-surface-variant transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-on-surface" />
      </Link>
    </ShineBorder>
  );
}

function TrapScoreGauge({ score }: { score: number }) {
  const SIZE = 220;
  const STROKE = 14;
  const R = (SIZE - STROKE) / 2;
  const CIRC = 2 * Math.PI * R;
  const filled = (score / 100) * CIRC;
  return (
    <div
      className="relative"
      style={{ width: SIZE, height: SIZE }}
      aria-label={`TrapScore ${score} out of 100`}
    >
      {/* radial glow behind gauge */}
      <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,_rgba(239,68,68,0.45),_rgba(245,158,11,0.18)_45%,_transparent_70%)] blur-2xl" />
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <defs>
          <linearGradient id="trapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="50%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={STROKE}
          fill="none"
        />
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke="url(#trapGrad)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={CIRC}
          initial={{ strokeDashoffset: CIRC }}
          animate={{ strokeDashoffset: CIRC - filled }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display-lg bg-gradient-to-br from-error via-secondary to-warning bg-clip-text text-[68px] font-black leading-none tabular-nums text-transparent">
          <NumberTicker value={score} />
        </span>
        <span className="font-mono-label mt-1 text-[10px] uppercase tracking-[0.3em] text-on-surface-variant">
          / 100
        </span>
        <span className="font-mono-label mt-2 inline-flex items-center gap-1.5 rounded-full border border-error/40 bg-error/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-error">
          <Skull className="h-3 w-3" />
          Critical Trap
        </span>
      </div>
    </div>
  );
}

const METRIC_TONE: Record<"success" | "error" | "warning", string> = {
  success: "text-success",
  error: "text-error",
  warning: "text-tertiary"
};

function TrapScoreCore() {
  const metrics: Array<{
    label: string;
    value: string;
    tone: "success" | "error" | "warning";
  }> = [
    { label: "Price 1H", value: "+82.4%", tone: "success" },
    { label: "Smart Netflow", value: "-$184.5K", tone: "error" },
    { label: "Insider Exit", value: "-$71.2K", tone: "error" },
    { label: "Liquidity Δ", value: "-22.6%", tone: "error" },
    { label: "Top 10 Holders", value: "64.8%", tone: "warning" },
    { label: "Vol/Liq Ratio", value: "3.4×", tone: "warning" }
  ];
  const reasons = [
    { icon: TrendingDown, text: "Smart wallets are net-selling" },
    { icon: ShieldAlert, text: "Insiders are exiting" },
    { icon: Droplets, text: "Liquidity is draining" },
    { icon: Activity, text: "Retail volume rising" }
  ];
  return (
    <ShineBorder
      borderRadius={24}
      borderWidth={1}
      duration={6}
      color={["#EF4444", "#F97316", "#F59E0B", "#EF4444"]}
      className="!w-full"
    >
      <div className="relative w-full overflow-hidden rounded-3xl bg-surface-container-low/85 p-6 backdrop-blur-xl lg:p-7">
        {/* inner red radial wash */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.22),_transparent_65%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-warning/10 blur-3xl" />

        {/* Header */}
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="font-display-sm flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-error via-secondary to-warning text-base font-black text-white shadow-[0_6px_24px_rgba(239,68,68,0.4)]">
              D
            </div>
            <div className="flex flex-col">
              <span className="font-display-sm text-display-sm font-bold tracking-tight text-on-surface">
                $DOGX
              </span>
              <span className="font-mono-label inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
                Solana · live
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-error/40 bg-error/10 px-3 py-1.5 font-mono-label text-[10px] font-bold uppercase tracking-[0.22em] text-error">
            <Flame className="h-3 w-3" />
            Critical Trap
          </span>
        </div>

        {/* Gauge */}
        <div className="relative my-5 flex items-center justify-center">
          <TrapScoreGauge score={87} />
        </div>

        {/* Metrics grid */}
        <div className="relative grid grid-cols-2 gap-2 sm:grid-cols-3">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest/60 p-2.5 backdrop-blur-sm"
            >
              <div className="font-mono-label text-[9px] uppercase tracking-[0.18em] text-on-surface-variant">
                {m.label}
              </div>
              <div
                className={`font-mono-data mt-0.5 text-base font-bold tabular-nums ${METRIC_TONE[m.tone]}`}
              >
                {m.value}
              </div>
            </div>
          ))}
        </div>

        {/* Evidence reasons */}
        <ul className="relative mt-4 grid grid-cols-1 gap-1.5 border-t border-outline-variant/10 pt-4 sm:grid-cols-2">
          {reasons.map((r) => {
            const Icon = r.icon;
            return (
              <li
                key={r.text}
                className="flex items-center gap-2 font-mono-label text-[11px] text-on-surface-variant"
              >
                <Icon className="h-3.5 w-3.5 text-error" />
                {r.text}
              </li>
            );
          })}
        </ul>
      </div>
    </ShineBorder>
  );
}

function FloatingEvidenceCard({
  icon: Icon,
  label,
  value,
  tone,
  position,
  delay = 0
}: {
  icon: typeof TrendingDown;
  label: string;
  value: string;
  tone: "error" | "warning" | "success";
  position: string; // tailwind absolute-position classes
  delay?: number;
}) {
  const toneRing =
    tone === "error"
      ? "border-error/30 bg-error/10 text-error"
      : tone === "warning"
        ? "border-tertiary/30 bg-tertiary/10 text-tertiary"
        : "border-success/30 bg-success/10 text-success";
  const valueColor =
    tone === "error"
      ? "text-error"
      : tone === "warning"
        ? "text-tertiary"
        : "text-success";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
      transition={{
        opacity: { duration: 0.5, delay },
        scale: { duration: 0.5, delay },
        y: {
          duration: 4.5 + delay,
          repeat: Infinity,
          ease: "easeInOut",
          delay
        }
      }}
      className={`pointer-events-none absolute z-20 hidden items-center gap-2.5 rounded-2xl border border-outline-variant/30 bg-surface-container-low/85 px-3 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl lg:flex ${position}`}
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-lg border ${toneRing}`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex flex-col">
        <span className="font-mono-label text-[9px] uppercase tracking-[0.18em] text-on-surface-variant">
          {label}
        </span>
        <span
          className={`font-mono-data text-sm font-bold tabular-nums ${valueColor}`}
        >
          {value}
        </span>
      </span>
    </motion.div>
  );
}

function EndpointProofStrip() {
  const endpoints = [
    "Trending",
    "Overview",
    "Txs",
    "Holder Profile",
    "Holder Positions",
    "Security"
  ];
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-2.5 gap-y-2">
      <span className="font-mono-label inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-on-surface-variant/80">
        <Database className="h-3 w-3 text-primary" />
        Powered by Birdeye
      </span>
      <span className="h-3 w-px bg-outline-variant/40" aria-hidden />
      {endpoints.map((ep, i) => (
        <React.Fragment key={ep}>
          <span className="font-mono-label inline-flex items-center gap-1 text-[10px] text-on-surface/85">
            <span className="h-1 w-1 rounded-full bg-primary/70" />
            {ep}
          </span>
          {i < endpoints.length - 1 && (
            <span className="text-on-surface-variant/30">·</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

const TICKER_TONE: Record<
  "error" | "warning" | "tertiary" | "success",
  { border: string; bg: string; text: string; dot: string }
> = {
  error: {
    border: "border-error/40",
    bg: "bg-error/5",
    text: "text-error",
    dot: "bg-error"
  },
  warning: {
    border: "border-secondary/40",
    bg: "bg-secondary/5",
    text: "text-secondary",
    dot: "bg-secondary"
  },
  tertiary: {
    border: "border-tertiary/40",
    bg: "bg-tertiary/5",
    text: "text-tertiary",
    dot: "bg-tertiary"
  },
  success: {
    border: "border-success/40",
    bg: "bg-success/5",
    text: "text-success",
    dot: "bg-success"
  }
};

function HeroThreatTicker() {
  const items: Array<{
    token: string;
    score: number;
    verdict: string;
    tone: keyof typeof TICKER_TONE;
  }> = [
    { token: "$DOGX", score: 87, verdict: "Critical Trap", tone: "error" },
    { token: "$MOONX", score: 62, verdict: "Risky Chase", tone: "tertiary" },
    { token: "$NOVA", score: 7, verdict: "Clean Pump", tone: "success" },
    { token: "$RUGR", score: 91, verdict: "Liquidity Drain", tone: "error" }
  ];
  return (
    <div className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-2.5 border-t border-outline-variant/10 pt-6 lg:justify-start">
      <span className="font-mono-label inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-on-surface-variant/70">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-error" />
        Live tape
      </span>
      {items.map((item, i) => {
        const t = TICKER_TONE[item.tone];
        return (
          <motion.span
            key={item.token}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 + i * 0.12, ease: "easeOut" }}
            className={`inline-flex items-center gap-2 rounded-full border ${t.border} ${t.bg} px-3 py-1.5 backdrop-blur-sm`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
            <span className="font-mono-data text-[12px] font-bold text-on-surface">
              {item.token}
            </span>
            <span className="font-mono-label text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">
              TrapScore
            </span>
            <span className={`font-mono-data text-[13px] font-bold tabular-nums ${t.text}`}>
              {item.score}
            </span>
            <span className="text-on-surface-variant/40">·</span>
            <span className={`font-mono-label text-[10px] font-semibold uppercase tracking-[0.18em] ${t.text}`}>
              {item.verdict}
            </span>
          </motion.span>
        );
      })}
    </div>
  );
}

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
    <section className="relative mb-xl overflow-hidden border-b border-outline-variant/10 py-12 lg:py-16">
      <RetroGrid angle={70} />
      <Meteors number={18} />
      <Particles className="opacity-60" quantity={70} color="#10B981" />
      <Ripple mainCircleSize={120} mainCircleOpacity={0.18} numCircles={6} />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-gutter">
          {/* LEFT — pitch */}
          <div className="text-center lg:col-span-6 lg:text-left">
            <BlurFade delay={0.1}>
              <div className="mb-6 inline-flex">
                <LiveStatusPill
                  monitored={monitoredCount}
                  critical={criticalCount}
                />
              </div>
            </BlurFade>

            <BlurFade delay={0.2}>
              <h1 className="font-display-lg mb-5 text-display-lg font-black leading-[0.95] tracking-tighter">
                <span className="block text-on-surface">You are not early.</span>
                <span className="block">
                  <span className="text-on-surface">You are </span>
                  <span className="bg-gradient-to-r from-error via-secondary to-warning bg-clip-text text-transparent">
                    the trap.
                  </span>
                </span>
              </h1>
            </BlurFade>

            <BlurFade delay={0.3}>
              <p className="mb-7 max-w-xl text-headline-sm text-on-surface-variant lg:max-w-2xl">
                FOMO Firewall monitors trending Solana tokens, tracks
                smart-wallet and insider exits, and calculates a{" "}
                <span className="font-semibold text-on-surface">TrapScore</span>{" "}
                before retail becomes exit liquidity.
              </p>
            </BlurFade>

            <BlurFade delay={0.45}>
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap lg:items-start lg:justify-start">
                <ShimmerButton
                  onClick={() => setOpen(true)}
                  className="!px-6 !py-3 !text-sm"
                >
                  <Zap className="h-4 w-4" />
                  Run TrapScore
                  <kbd className="ml-1 rounded border border-white/20 bg-black/30 px-1.5 py-0.5 font-mono text-[10px] text-white/80">
                    ⌘K
                  </kbd>
                </ShimmerButton>
                <Link
                  href="/board"
                  className="font-headline-sm group inline-flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface-container-high px-5 py-3 text-sm text-on-surface transition-all duration-300 hover:border-error/50 hover:bg-error/10 hover:text-error"
                >
                  <Radar className="h-4 w-4 transition-colors group-hover:text-error" />
                  View Live Traps
                </Link>
                <Link
                  href="/docs"
                  className="font-headline-sm group inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-5 py-3 text-sm text-on-surface transition-all duration-300 hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
                >
                  <Puzzle className="h-4 w-4 text-primary" />
                  Install Extension
                </Link>
              </div>
            </BlurFade>

            <BlurFade delay={0.6}>
              <EndpointProofStrip />
            </BlurFade>
          </div>

          {/* RIGHT — TrapScore Core + floating evidence */}
          <BlurFade delay={0.25} className="relative lg:col-span-6">
            <div className="relative mx-auto w-full max-w-[520px]">
              {/* Floating evidence cards — desktop only */}
              <FloatingEvidenceCard
                icon={TrendingDown}
                label="Smart Money Divergence"
                value="-$184.5K"
                tone="error"
                position="-left-10 top-6"
                delay={0.4}
              />
              <FloatingEvidenceCard
                icon={ShieldAlert}
                label="Insider Exit Pressure"
                value="-$71.2K"
                tone="error"
                position="-right-8 top-24"
                delay={0.7}
              />
              <FloatingEvidenceCard
                icon={Droplets}
                label="Liquidity Drain"
                value="-22.6%"
                tone="warning"
                position="-left-8 bottom-28"
                delay={1.0}
              />
              <FloatingEvidenceCard
                icon={Users}
                label="Top Holder Risk"
                value="64.8%"
                tone="warning"
                position="-right-10 bottom-10"
                delay={1.3}
              />

              <TrapScoreCore />
            </div>
          </BlurFade>
        </div>

        {/* Hero threat ticker (bottom band) */}
        <BlurFade delay={0.7}>
          <HeroThreatTicker />
        </BlurFade>
      </div>
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
