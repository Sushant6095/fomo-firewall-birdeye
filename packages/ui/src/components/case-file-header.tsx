"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, Copy, ExternalLink } from "lucide-react";
import type { TrapVerdict } from "@fomo/shared";
import { cn, formatPercent, formatUsd, shortAddress } from "../utils";
import { fadeUp } from "../motion";
import { VerdictBadge } from "./verdict-badge";

export interface CaseFileHeaderProps {
  symbol: string;
  name: string;
  address: string;
  verdict: TrapVerdict;
  priceChange1h: number;
  volume1hUsd: number;
  liquidityUsd: number;
  className?: string;
}

export function CaseFileHeader({
  symbol,
  name,
  address,
  verdict,
  priceChange1h,
  volume1hUsd,
  liquidityUsd,
  className
}: CaseFileHeaderProps) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <motion.header
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className={cn("flex flex-col gap-4", className)}
    >
      <Link
        href="/"
        className="inline-flex w-fit items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Back to dashboard
      </Link>

      <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <span
            className={cn(
              "grid h-14 w-14 place-items-center rounded-xl border bg-secondary/60 text-base font-semibold uppercase",
              verdict === "Critical Trap" &&
                "border-verdict-critical/40 bg-verdict-critical/10 text-verdict-critical",
              verdict === "Exit Warning" &&
                "border-verdict-warning/35 bg-verdict-warning/10 text-verdict-warning",
              verdict === "Risky Chase" &&
                "border-verdict-risky/30 bg-verdict-risky/10 text-verdict-risky",
              verdict === "Clean Pump" &&
                "border-verdict-clean/30 bg-verdict-clean/10 text-verdict-clean"
            )}
          >
            {symbol.slice(0, 3)}
          </span>
          <div className="space-y-1">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Token case file
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold leading-tight">
                ${symbol}
              </h1>
              <span className="text-sm text-muted-foreground">{name}</span>
              <VerdictBadge verdict={verdict} size="sm" />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono">{shortAddress(address, 6, 6)}</span>
              <button
                onClick={copy}
                className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-secondary px-1.5 py-0.5 text-[10px] uppercase tracking-wider hover:bg-secondary/80"
                aria-label="Copy address"
              >
                <Copy className="h-2.5 w-2.5" />
                {copied ? "Copied" : "Copy"}
              </button>
              <a
                href={`https://birdeye.so/token/${address}?chain=solana`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-secondary px-1.5 py-0.5 text-[10px] uppercase tracking-wider hover:bg-secondary/80"
              >
                Birdeye
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 md:gap-6">
          <Stat label="1h price" value={formatPercent(priceChange1h)} positive={priceChange1h >= 0} />
          <Stat label="1h volume" value={formatUsd(volume1hUsd, { compact: true })} />
          <Stat label="Liquidity" value={formatUsd(liquidityUsd, { compact: true })} />
        </div>
      </div>
    </motion.header>
  );
}

function Stat({
  label,
  value,
  positive
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="min-w-[6rem] space-y-0.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "font-mono text-base font-semibold tabular-nums",
          positive === true && "text-verdict-clean",
          positive === false && "text-verdict-critical"
        )}
      >
        {value}
      </div>
    </div>
  );
}
