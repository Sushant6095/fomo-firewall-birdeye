"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Droplets,
  LineChart,
  Users,
  ShieldAlert,
  TrendingDown,
  Waves
} from "lucide-react";
import { cn } from "../utils";
import { staggerItem } from "../motion";
import { severityTone } from "../design-tokens";
import type { SignalCardFixture } from "../fixtures";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  SMART_MONEY_DIVERGENCE: TrendingDown,
  INSIDER_EXIT_PRESSURE: Users,
  LIQUIDITY_FRAGILITY: Droplets,
  SELL_PRESSURE_GREEN: Activity,
  HOLDER_CONCENTRATION: Users,
  STATIC_TOKEN_RISK: ShieldAlert,
  ABNORMAL_VOLUME_LIQUIDITY: Waves
};

const SEVERITY_BORDER = {
  low: "border-border/60",
  medium: "border-verdict-risky/30",
  high: "border-verdict-warning/35",
  critical: "border-verdict-critical/40"
} as const;

export interface RiskSignalCardProps {
  signal: SignalCardFixture;
  onViewEvidence?: () => void;
  className?: string;
}

export function RiskSignalCard({
  signal,
  onViewEvidence,
  className
}: RiskSignalCardProps) {
  const Icon = ICON_MAP[signal.code] ?? LineChart;
  const severity = severityTone[signal.severity];

  return (
    <motion.article
      variants={staggerItem}
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl border bg-card p-4 transition-colors",
        SEVERITY_BORDER[signal.severity],
        className
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "grid h-8 w-8 place-items-center rounded-md border bg-secondary/60 text-foreground",
              SEVERITY_BORDER[signal.severity]
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Signal
            </div>
            <div className="text-sm font-semibold">{signal.label}</div>
          </div>
        </div>
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
            signal.severity === "critical" &&
              "border-verdict-critical/40 bg-verdict-critical/10 text-verdict-critical",
            signal.severity === "high" &&
              "border-verdict-warning/40 bg-verdict-warning/10 text-verdict-warning",
            signal.severity === "medium" &&
              "border-verdict-risky/35 bg-verdict-risky/10 text-verdict-risky",
            signal.severity === "low" &&
              "border-border bg-secondary text-muted-foreground"
          )}
        >
          {severity.label}
        </span>
      </header>

      <p className="text-sm leading-relaxed text-foreground/90">
        {signal.headline}
      </p>

      <div className="mt-1 space-y-1.5 border-t border-border/50 pt-3">
        {signal.evidence.slice(0, 3).map((e) => (
          <div
            key={e.label}
            className="flex items-center justify-between gap-2 text-xs"
          >
            <span className="text-muted-foreground">{e.label}</span>
            <span className="font-mono text-foreground">{e.value}</span>
          </div>
        ))}
      </div>

      {onViewEvidence && (
        <button
          type="button"
          onClick={onViewEvidence}
          className="self-start text-xs font-medium uppercase tracking-wider text-primary hover:text-primary/80"
        >
          View evidence →
        </button>
      )}
    </motion.article>
  );
}
