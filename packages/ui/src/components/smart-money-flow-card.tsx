"use client";

import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn, formatUsd } from "../utils";
import { fadeUp } from "../motion";

export interface SmartMoneyFlowCardProps {
  smartWalletNetflowUsd: number;
  insiderNetflowUsd: number;
  priceChange1h: number;
  className?: string;
}

export function SmartMoneyFlowCard({
  smartWalletNetflowUsd,
  insiderNetflowUsd,
  priceChange1h,
  className
}: SmartMoneyFlowCardProps) {
  const smartNegative = smartWalletNetflowUsd < 0;
  const insiderNegative = insiderNetflowUsd < 0;
  const divergence = priceChange1h > 0 && smartNegative;

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className={cn(
        "rounded-xl border bg-card p-5",
        divergence ? "border-verdict-critical/40" : "border-border/70",
        className
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Smart Money Flow
          </div>
          <h3 className="text-sm font-semibold">
            {divergence
              ? "Divergence detected"
              : smartNegative
                ? "Smart wallets net-selling"
                : "Smart wallets net-buying"}
          </h3>
        </div>
        <span
          className={cn(
            "grid h-9 w-9 place-items-center rounded-md border",
            divergence
              ? "border-verdict-critical/40 bg-verdict-critical/10 text-verdict-critical"
              : smartNegative
                ? "border-verdict-warning/35 bg-verdict-warning/10 text-verdict-warning"
                : "border-verdict-clean/30 bg-verdict-clean/10 text-verdict-clean"
          )}
        >
          {smartNegative ? (
            <TrendingDown className="h-4 w-4" />
          ) : (
            <TrendingUp className="h-4 w-4" />
          )}
        </span>
      </header>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <FlowRow
          label="Smart netflow (1h)"
          value={formatUsd(smartWalletNetflowUsd, {
            compact: true,
            signed: true
          })}
          negative={smartNegative}
        />
        <FlowRow
          label="Insider netflow (1h)"
          value={formatUsd(insiderNetflowUsd, {
            compact: true,
            signed: true
          })}
          negative={insiderNegative}
        />
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {divergence
          ? "Price is up while smart wallets are net-sellers — classic exit-liquidity pattern."
          : smartNegative
            ? "Smart wallets are reducing exposure. Watch for divergence if price keeps climbing."
            : "Smart wallets are aligned with the move. No divergence right now."}
      </p>
    </motion.div>
  );
}

function FlowRow({
  label,
  value,
  negative
}: {
  label: string;
  value: string;
  negative: boolean;
}) {
  return (
    <div className="space-y-0.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "font-mono text-base font-semibold tabular-nums",
          negative ? "text-verdict-critical" : "text-verdict-clean"
        )}
      >
        {value}
      </div>
    </div>
  );
}
