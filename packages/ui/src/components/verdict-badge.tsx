"use client";

import { ShieldCheck, ShieldAlert, ShieldX, AlertOctagon } from "lucide-react";
import type { TrapVerdict } from "@fomo/shared";
import { cn, verdictKey } from "../utils";
import { verdictTone } from "../design-tokens";

const VERDICT_STYLES: Record<TrapVerdict, string> = {
  "Clean Pump":
    "border-verdict-clean/30 bg-verdict-clean/10 text-verdict-clean",
  "Risky Chase":
    "border-verdict-risky/30 bg-verdict-risky/10 text-verdict-risky",
  "Exit Warning":
    "border-verdict-warning/35 bg-verdict-warning/10 text-verdict-warning",
  "Critical Trap":
    "border-verdict-critical/40 bg-verdict-critical/12 text-verdict-critical"
};

const VERDICT_ICONS: Record<TrapVerdict, React.ComponentType<{ className?: string }>> = {
  "Clean Pump": ShieldCheck,
  "Risky Chase": ShieldAlert,
  "Exit Warning": ShieldX,
  "Critical Trap": AlertOctagon
};

export interface VerdictBadgeProps {
  verdict: TrapVerdict;
  size?: "sm" | "md" | "lg";
  className?: string;
  hideIcon?: boolean;
}

export function VerdictBadge({
  verdict,
  size = "md",
  className,
  hideIcon = false
}: VerdictBadgeProps) {
  const Icon = VERDICT_ICONS[verdict];
  const tone = verdictTone[verdict];
  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 text-[10px]"
      : size === "lg"
        ? "px-3.5 py-1 text-sm"
        : "px-2.5 py-1 text-xs";

  return (
    <span
      data-verdict={verdictKey(verdict)}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium uppercase tracking-wider",
        VERDICT_STYLES[verdict],
        sizeClasses,
        className
      )}
      title={tone.description}
    >
      {!hideIcon && <Icon className="h-3.5 w-3.5" />}
      {verdict}
    </span>
  );
}
