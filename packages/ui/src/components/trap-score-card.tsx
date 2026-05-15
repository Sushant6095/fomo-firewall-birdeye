"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { TrapVerdict } from "@fomo/shared";
import { cn, verdictKey } from "../utils";
import { verdictTone } from "../design-tokens";
import { VerdictBadge } from "./verdict-badge";
import { ScoreDeltaPill } from "./score-delta-pill";
import { fadeUp, scaleIn } from "../motion";

export interface TrapScoreCardProps {
  trapScore: number;
  previousTrapScore?: number;
  verdict: TrapVerdict;
  reasons: string[];
  symbol?: string;
  className?: string;
}

const VERDICT_BAR_GRADIENT: Record<TrapVerdict, string> = {
  "Clean Pump":
    "from-verdict-clean/80 via-verdict-clean/60 to-verdict-clean/30",
  "Risky Chase":
    "from-verdict-clean/40 via-verdict-risky to-verdict-risky/60",
  "Exit Warning":
    "from-verdict-risky/50 via-verdict-warning to-verdict-warning",
  "Critical Trap":
    "from-verdict-warning/50 via-verdict-critical to-verdict-critical"
};

export function TrapScoreCard({
  trapScore,
  previousTrapScore,
  verdict,
  reasons,
  symbol,
  className
}: TrapScoreCardProps) {
  const tone = verdictTone[verdict];
  const reduced = useReducedMotion();
  const isCritical = verdict === "Critical Trap";

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      animate="show"
      data-verdict={verdictKey(verdict)}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6 shadow-card-inset",
        isCritical && "shadow-glow-critical",
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1">
        <div
          className={cn(
            "h-full w-full bg-gradient-to-r",
            VERDICT_BAR_GRADIENT[verdict]
          )}
        />
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            TrapScore{symbol ? ` · ${symbol}` : ""}
          </div>
          <div className="flex items-end gap-3">
            <motion.span
              key={trapScore}
              variants={reduced ? undefined : scaleIn}
              initial="hidden"
              animate="show"
              className="font-mono text-6xl font-semibold leading-none tracking-tight"
            >
              {trapScore}
            </motion.span>
            <span className="pb-1 text-sm font-medium text-muted-foreground">
              / 100
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <VerdictBadge verdict={verdict} size="lg" />
          {typeof previousTrapScore === "number" && (
            <ScoreDeltaPill
              current={trapScore}
              previous={previousTrapScore}
            />
          )}
        </div>
      </div>

      <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
        {tone.headline}
      </p>

      {reasons.length > 0 && (
        <ul className="mt-4 grid gap-1.5 text-sm">
          {reasons.slice(0, 5).map((reason, i) => (
            <li key={i} className="flex items-start gap-2 text-foreground/90">
              <span
                className={cn(
                  "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                  isCritical
                    ? "bg-verdict-critical"
                    : verdict === "Exit Warning"
                      ? "bg-verdict-warning"
                      : verdict === "Risky Chase"
                        ? "bg-verdict-risky"
                        : "bg-verdict-clean"
                )}
              />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      )}
    </motion.section>
  );
}
