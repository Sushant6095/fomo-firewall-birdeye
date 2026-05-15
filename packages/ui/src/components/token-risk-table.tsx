"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn, formatPercent, formatUsd, shortAddress } from "../utils";
import {
  rowHighlight,
  staggerContainer,
  staggerItem
} from "../motion";
import { VerdictBadge } from "./verdict-badge";
import type { TokenRiskFixture } from "../fixtures";

/**
 * The minimum shape `TokenRiskTable` needs to render a row. Both `TokenRiskFixture`
 * (fixtures) and the DB-backed `TokenRiskRow` from `apps/web` satisfy this.
 */
export type RiskTableToken = Pick<
  TokenRiskFixture,
  | "address"
  | "symbol"
  | "priceChange1h"
  | "volume1hUsd"
  | "smartWalletNetflowUsd"
  | "insiderNetflowUsd"
  | "liquidityChange1h"
  | "top10HolderPercent"
  | "trapScore"
  | "verdict"
>;

export interface TokenRiskTableProps {
  tokens: RiskTableToken[];
  hrefBuilder?: (token: RiskTableToken) => string;
  className?: string;
  highlightAddress?: string;
}

export function TokenRiskTable({
  tokens,
  hrefBuilder = (t) => `/token/${t.address}`,
  className,
  highlightAddress
}: TokenRiskTableProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border/70 bg-card",
        className
      )}
    >
      <div className="grid grid-cols-12 gap-2 border-b border-border/60 bg-secondary/40 px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        <div className="col-span-3">Token</div>
        <div className="col-span-1 text-right">1h Price</div>
        <div className="col-span-1 text-right">1h Vol</div>
        <div className="col-span-1 text-right">Smart Netflow</div>
        <div className="col-span-1 text-right">Insider Netflow</div>
        <div className="col-span-1 text-right">Liq Δ</div>
        <div className="col-span-1 text-right">Top 10</div>
        <div className="col-span-1 text-right">TrapScore</div>
        <div className="col-span-1">Verdict</div>
        <div className="col-span-1 text-right">Action</div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="divide-y divide-border/40"
      >
        {tokens.map((token) => {
          const priceClass =
            token.priceChange1h >= 0
              ? "text-verdict-clean"
              : "text-verdict-critical";
          const liqClass =
            token.liquidityChange1h >= 0
              ? "text-verdict-clean"
              : "text-verdict-critical";
          const smartClass =
            token.smartWalletNetflowUsd >= 0
              ? "text-verdict-clean"
              : "text-verdict-critical";
          const insiderClass =
            token.insiderNetflowUsd >= 0
              ? "text-foreground"
              : "text-verdict-critical";

          return (
            <motion.div
              key={token.address}
              variants={staggerItem}
              {...(highlightAddress === token.address
                ? { animate: "flash" }
                : {})}
              {...({ variants: rowHighlight } as Record<string, unknown>)}
              className="grid grid-cols-12 items-center gap-2 px-4 py-3 text-sm transition-colors hover:bg-secondary/40"
            >
              <div className="col-span-3 flex items-center gap-2.5">
                <span
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded-md border text-[11px] font-semibold uppercase",
                    token.verdict === "Critical Trap" &&
                      "border-verdict-critical/40 bg-verdict-critical/10 text-verdict-critical",
                    token.verdict === "Exit Warning" &&
                      "border-verdict-warning/35 bg-verdict-warning/10 text-verdict-warning",
                    token.verdict === "Risky Chase" &&
                      "border-verdict-risky/30 bg-verdict-risky/10 text-verdict-risky",
                    token.verdict === "Clean Pump" &&
                      "border-verdict-clean/30 bg-verdict-clean/10 text-verdict-clean"
                  )}
                >
                  {token.symbol.slice(0, 3)}
                </span>
                <div className="leading-tight">
                  <div className="font-medium">${token.symbol}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {shortAddress(token.address)}
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  "col-span-1 text-right font-mono tabular-nums",
                  priceClass
                )}
              >
                {formatPercent(token.priceChange1h)}
              </div>
              <div className="col-span-1 text-right font-mono tabular-nums">
                {formatUsd(token.volume1hUsd, { compact: true })}
              </div>
              <div
                className={cn(
                  "col-span-1 text-right font-mono tabular-nums",
                  smartClass
                )}
              >
                {formatUsd(token.smartWalletNetflowUsd, {
                  compact: true,
                  signed: true
                })}
              </div>
              <div
                className={cn(
                  "col-span-1 text-right font-mono tabular-nums",
                  insiderClass
                )}
              >
                {formatUsd(token.insiderNetflowUsd, {
                  compact: true,
                  signed: true
                })}
              </div>
              <div
                className={cn(
                  "col-span-1 text-right font-mono tabular-nums",
                  liqClass
                )}
              >
                {formatPercent(token.liquidityChange1h)}
              </div>
              <div className="col-span-1 text-right font-mono tabular-nums text-muted-foreground">
                {token.top10HolderPercent.toFixed(1)}%
              </div>
              <div className="col-span-1 text-right">
                <span className="inline-flex h-6 min-w-[2.25rem] items-center justify-center rounded-md bg-secondary px-2 font-mono text-sm font-semibold">
                  {token.trapScore}
                </span>
              </div>
              <div className="col-span-1">
                <VerdictBadge verdict={token.verdict} size="sm" />
              </div>
              <div className="col-span-1 text-right">
                <Link
                  href={hrefBuilder(token)}
                  className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-secondary px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-foreground hover:bg-secondary/80"
                >
                  Case file
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
