"use client";

import { motion } from "framer-motion";
import { Droplets } from "lucide-react";
import { cn, formatPercent, formatUsd } from "../utils";
import { fadeUp } from "../motion";
import { MiniSparkline } from "./mini-sparkline";
import type { SparklinePoint } from "../fixtures";

export interface LiquidityFragilityCardProps {
  liquidityUsd: number;
  liquidityChange1h: number;
  priceChange1h: number;
  sparkline?: SparklinePoint[];
  className?: string;
}

export function LiquidityFragilityCard({
  liquidityUsd,
  liquidityChange1h,
  priceChange1h,
  sparkline,
  className
}: LiquidityFragilityCardProps) {
  const fragile = liquidityChange1h < 0 && priceChange1h > 0;
  const tone =
    liquidityChange1h <= -10
      ? "critical"
      : liquidityChange1h < 0
        ? "warning"
        : "clean";

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
            Liquidity Fragility
          </div>
          <h3 className="text-sm font-semibold">
            {fragile ? "Liquidity draining while price climbs" : "Liquidity holding"}
          </h3>
        </div>
        <span
          className={cn(
            "grid h-9 w-9 place-items-center rounded-md border",
            tone === "critical" &&
              "border-verdict-critical/40 bg-verdict-critical/10 text-verdict-critical",
            tone === "warning" &&
              "border-verdict-warning/35 bg-verdict-warning/10 text-verdict-warning",
            tone === "clean" &&
              "border-verdict-clean/30 bg-verdict-clean/10 text-verdict-clean"
          )}
        >
          <Droplets className="h-4 w-4" />
        </span>
      </header>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Liquidity (now)
          </div>
          <div className="font-mono text-base font-semibold tabular-nums">
            {formatUsd(liquidityUsd, { compact: true })}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            1h change
          </div>
          <div
            className={cn(
              "font-mono text-base font-semibold tabular-nums",
              liquidityChange1h < 0
                ? "text-verdict-critical"
                : "text-verdict-clean"
            )}
          >
            {formatPercent(liquidityChange1h)}
          </div>
        </div>
      </div>

      {sparkline && sparkline.length >= 2 && (
        <div className="mt-3">
          <MiniSparkline
            data={sparkline}
            height={48}
            width={300}
            tone={liquidityChange1h < 0 ? "negative" : "positive"}
            className="w-full"
          />
        </div>
      )}

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {fragile
          ? "Liquidity is falling while price is up — slippage and rug risk rise sharply."
          : "Liquidity is stable or expanding alongside price."}
      </p>
    </motion.div>
  );
}
