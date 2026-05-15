"use client";

import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";
import { cn, formatPercent, formatUsd } from "../utils";
import { fadeUp } from "../motion";
import { VerdictBadge } from "./verdict-badge";
import { MiniSparkline } from "./mini-sparkline";
import type { TokenRiskFixture } from "../fixtures";

export interface ComparePanelProps {
  cleanToken: TokenRiskFixture;
  trapToken: TokenRiskFixture;
  className?: string;
}

type Row = {
  label: string;
  /** Lower is better. */
  lowerIsBetter?: boolean;
  cleanValue: string;
  trapValue: string;
  cleanRaw: number;
  trapRaw: number;
};

export function ComparePanel({
  cleanToken,
  trapToken,
  className
}: ComparePanelProps) {
  const rows: Row[] = [
    {
      label: "1h price change",
      cleanValue: formatPercent(cleanToken.priceChange1h),
      trapValue: formatPercent(trapToken.priceChange1h),
      cleanRaw: cleanToken.priceChange1h,
      trapRaw: trapToken.priceChange1h
    },
    {
      label: "Smart wallet netflow (1h)",
      cleanValue: formatUsd(cleanToken.smartWalletNetflowUsd, {
        compact: true,
        signed: true
      }),
      trapValue: formatUsd(trapToken.smartWalletNetflowUsd, {
        compact: true,
        signed: true
      }),
      cleanRaw: cleanToken.smartWalletNetflowUsd,
      trapRaw: trapToken.smartWalletNetflowUsd
    },
    {
      label: "Insider/dev netflow (1h)",
      cleanValue: formatUsd(cleanToken.insiderNetflowUsd, {
        compact: true,
        signed: true
      }),
      trapValue: formatUsd(trapToken.insiderNetflowUsd, {
        compact: true,
        signed: true
      }),
      cleanRaw: cleanToken.insiderNetflowUsd,
      trapRaw: trapToken.insiderNetflowUsd
    },
    {
      label: "Liquidity change (1h)",
      cleanValue: formatPercent(cleanToken.liquidityChange1h),
      trapValue: formatPercent(trapToken.liquidityChange1h),
      cleanRaw: cleanToken.liquidityChange1h,
      trapRaw: trapToken.liquidityChange1h
    },
    {
      label: "Top 10 holder share",
      cleanValue: `${cleanToken.top10HolderPercent.toFixed(1)}%`,
      trapValue: `${trapToken.top10HolderPercent.toFixed(1)}%`,
      cleanRaw: cleanToken.top10HolderPercent,
      trapRaw: trapToken.top10HolderPercent,
      lowerIsBetter: true
    },
    {
      label: "TrapScore",
      cleanValue: `${cleanToken.trapScore}/100`,
      trapValue: `${trapToken.trapScore}/100`,
      cleanRaw: cleanToken.trapScore,
      trapRaw: trapToken.trapScore,
      lowerIsBetter: true
    }
  ];

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className={cn(
        "overflow-hidden rounded-2xl border border-border/70 bg-card",
        className
      )}
    >
      <div className="grid grid-cols-1 gap-px bg-border/40 md:grid-cols-2">
        <Side token={cleanToken} flavor="clean" />
        <Side token={trapToken} flavor="trap" />
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-secondary/30 text-[10px] uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-2 text-left">Signal</th>
            <th className="px-4 py-2 text-right">
              ${cleanToken.symbol} (Clean)
            </th>
            <th className="px-4 py-2 text-right">
              ${trapToken.symbol} (Trap)
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {rows.map((r) => {
            const cleanBetter = r.lowerIsBetter
              ? r.cleanRaw <= r.trapRaw
              : r.cleanRaw >= r.trapRaw;
            return (
              <tr key={r.label}>
                <td className="px-4 py-2.5 text-muted-foreground">{r.label}</td>
                <td
                  className={cn(
                    "px-4 py-2.5 text-right font-mono tabular-nums",
                    cleanBetter
                      ? "text-verdict-clean"
                      : "text-foreground/80"
                  )}
                >
                  {r.cleanValue}
                </td>
                <td
                  className={cn(
                    "px-4 py-2.5 text-right font-mono tabular-nums",
                    !cleanBetter
                      ? "text-verdict-critical"
                      : "text-foreground/80"
                  )}
                >
                  {r.trapValue}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="border-t border-border/60 bg-secondary/20 p-4 text-xs text-muted-foreground">
        FOMO Firewall reads the same Birdeye data as every other tool — the
        difference is the question. A trending dashboard tells you what's
        moving. FOMO Firewall tells you whether the move is real or whether
        smart money, insiders, and liquidity are exiting into retail.
      </div>
    </motion.section>
  );
}

function Side({
  token,
  flavor
}: {
  token: TokenRiskFixture;
  flavor: "clean" | "trap";
}) {
  const Icon = flavor === "clean" ? ShieldCheck : ShieldAlert;
  const Arrow = flavor === "clean" ? ArrowUpRight : ArrowDownRight;
  return (
    <div className="bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "grid h-9 w-9 place-items-center rounded-md border",
              flavor === "clean"
                ? "border-verdict-clean/30 bg-verdict-clean/10 text-verdict-clean"
                : "border-verdict-critical/40 bg-verdict-critical/10 text-verdict-critical"
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {flavor === "clean" ? "Clean Pump example" : "Critical Trap example"}
            </div>
            <div className="text-lg font-semibold">${token.symbol}</div>
          </div>
        </div>
        <VerdictBadge verdict={token.verdict} size="sm" />
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-mono text-4xl font-semibold tabular-nums">
          {token.trapScore}
        </span>
        <span className="text-xs text-muted-foreground">/ 100 TrapScore</span>
      </div>

      <div className="mt-3">
        <MiniSparkline
          data={token.priceSparkline}
          tone={flavor === "clean" ? "positive" : "negative"}
          width={320}
          height={48}
          className="w-full"
        />
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {token.analystSummary}
      </p>

      <div className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground">
        <Arrow className="h-3 w-3" />
        {flavor === "clean"
          ? "Smart money aligned. Liquidity holding."
          : "Smart money exiting. Liquidity draining."}
      </div>
    </div>
  );
}
