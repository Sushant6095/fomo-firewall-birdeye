"use client";

import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "../utils";

export interface ScoreDeltaPillProps {
  current: number;
  previous: number;
  /** When true, a positive delta is *bad* (TrapScore going up = more risk). */
  invert?: boolean;
  className?: string;
}

export function ScoreDeltaPill({
  current,
  previous,
  invert = true,
  className
}: ScoreDeltaPillProps) {
  const delta = Math.round(current - previous);
  const isZero = delta === 0;
  const isWorse = invert ? delta > 0 : delta < 0;
  const Icon = isZero ? Minus : delta > 0 ? ArrowUp : ArrowDown;
  const tone = isZero
    ? "border-border bg-secondary text-muted-foreground"
    : isWorse
      ? "border-verdict-critical/40 bg-verdict-critical/10 text-verdict-critical"
      : "border-verdict-clean/30 bg-verdict-clean/10 text-verdict-clean";

  const label = isZero
    ? "Stable"
    : `${delta > 0 ? "+" : ""}${delta} vs prev`;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        tone,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
