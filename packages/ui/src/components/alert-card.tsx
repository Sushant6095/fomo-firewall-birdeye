"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, Copy, ExternalLink, Check } from "lucide-react";
import { cn } from "../utils";
import { fadeUp, dangerPulse } from "../motion";
import { VerdictBadge } from "./verdict-badge";
import type { AlertFixture } from "../fixtures";

export interface AlertCardProps {
  alert: AlertFixture;
  className?: string;
  showPulse?: boolean;
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(ms / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function alertTypeLabel(type: AlertFixture["type"]): string {
  switch (type) {
    case "trapscore_spike":
      return "TrapScore spike";
    case "smart_money_divergence":
      return "Smart Money Divergence";
    case "insider_exit_pressure":
      return "Insider Exit Pressure";
    case "liquidity_fragility":
      return "Liquidity Fragility";
  }
}

function buildShareText(a: AlertFixture): string {
  return `[FOMO Firewall · ${a.verdict}] $${a.symbol} TrapScore ${a.trapScore}/100\n${a.headline}\n${a.message}`;
}

export function AlertCard({ alert, className, showPulse }: AlertCardProps) {
  const [copied, setCopied] = React.useState(false);
  const isCritical = alert.verdict === "Critical Trap";
  const usePulse = showPulse ?? isCritical;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(buildShareText(alert));
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <motion.article
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className={cn(
        "relative flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-4",
        isCritical && "border-verdict-critical/40",
        className
      )}
    >
      {usePulse && (
        <motion.div
          variants={dangerPulse}
          initial="rest"
          animate="pulse"
          className="pointer-events-none absolute inset-0 rounded-xl"
          aria-hidden
        />
      )}

      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "grid h-8 w-8 place-items-center rounded-md border bg-secondary/60",
              isCritical
                ? "border-verdict-critical/40 text-verdict-critical"
                : "border-border/70 text-primary"
            )}
          >
            <Bell className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {alertTypeLabel(alert.type)} · {timeAgo(alert.firedAt)}
            </div>
            <div className="text-sm font-semibold">{alert.headline}</div>
          </div>
        </div>
        <VerdictBadge verdict={alert.verdict} size="sm" />
      </header>

      <p className="text-sm leading-relaxed text-foreground/90">
        {alert.message}
      </p>

      <footer className="flex items-center justify-between gap-2 border-t border-border/40 pt-3 text-xs">
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="font-mono">${alert.symbol}</span>
          <span className="font-mono">TrapScore {alert.trapScore}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-secondary px-2 py-1 text-[11px] font-medium uppercase tracking-wider hover:bg-secondary/80"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy alert
              </>
            )}
          </button>
          <Link
            href={`/token/${alert.tokenAddress}`}
            className="inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-primary hover:bg-primary/15"
          >
            Open case file
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </footer>
    </motion.article>
  );
}
