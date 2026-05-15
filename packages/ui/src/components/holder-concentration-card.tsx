"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { cn } from "../utils";
import { fadeUp } from "../motion";

export interface HolderConcentrationCardProps {
  top10HolderPercent: number;
  /** Optional: top wallet share for emphasis. */
  topHolderPercent?: number;
  className?: string;
}

export function HolderConcentrationCard({
  top10HolderPercent,
  topHolderPercent,
  className
}: HolderConcentrationCardProps) {
  const tone =
    top10HolderPercent >= 60
      ? "critical"
      : top10HolderPercent >= 40
        ? "warning"
        : top10HolderPercent >= 25
          ? "risky"
          : "clean";

  const clamped = Math.max(0, Math.min(100, top10HolderPercent));

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className={cn(
        "rounded-xl border bg-card p-5",
        tone === "critical"
          ? "border-verdict-critical/40"
          : tone === "warning"
            ? "border-verdict-warning/35"
            : "border-border/70",
        className
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Holder Concentration
          </div>
          <h3 className="text-sm font-semibold">
            Top 10 holders control {clamped.toFixed(1)}% of supply
          </h3>
        </div>
        <span
          className={cn(
            "grid h-9 w-9 place-items-center rounded-md border",
            tone === "critical" &&
              "border-verdict-critical/40 bg-verdict-critical/10 text-verdict-critical",
            tone === "warning" &&
              "border-verdict-warning/35 bg-verdict-warning/10 text-verdict-warning",
            tone === "risky" &&
              "border-verdict-risky/35 bg-verdict-risky/10 text-verdict-risky",
            tone === "clean" &&
              "border-verdict-clean/30 bg-verdict-clean/10 text-verdict-clean"
          )}
        >
          <Users className="h-4 w-4" />
        </span>
      </header>

      <div className="mt-4">
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={cn(
              "h-full",
              tone === "critical" && "bg-verdict-critical",
              tone === "warning" && "bg-verdict-warning",
              tone === "risky" && "bg-verdict-risky",
              tone === "clean" && "bg-verdict-clean"
            )}
            style={{ width: `${clamped}%` }}
          />
        </div>
        <div className="mt-1 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {typeof topHolderPercent === "number" && (
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Largest single wallet</span>
          <span className="font-mono tabular-nums">
            {topHolderPercent.toFixed(1)}%
          </span>
        </div>
      )}

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {tone === "critical"
          ? "Top wallets can crater the chart in a single transaction."
          : tone === "warning"
            ? "Significant concentration. Coordinated selling can cascade quickly."
            : tone === "risky"
              ? "Moderate concentration — track largest wallets in evidence."
              : "Distribution looks healthy for a Solana token."}
      </p>
    </motion.div>
  );
}
