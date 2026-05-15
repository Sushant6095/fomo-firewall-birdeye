"use client";

import type { TrapVerdict } from "@fomo/shared";
import { cn, shortAddress } from "../utils";
import { VerdictBadge } from "./verdict-badge";

export interface ExtensionMiniCardProps {
  symbol: string;
  address: string;
  trapScore: number;
  verdict: TrapVerdict;
  reasons: string[];
  onOpenCaseFile?: () => void;
  onWatchToken?: () => void;
  caseFileHref?: string;
  className?: string;
}

const BORDER: Record<TrapVerdict, string> = {
  "Clean Pump": "border-verdict-clean/30",
  "Risky Chase": "border-verdict-risky/35",
  "Exit Warning": "border-verdict-warning/40",
  "Critical Trap": "border-verdict-critical/45"
};

/**
 * Compact card shared between the extension popup and the demo dashboard.
 * Designed to fit a 360x420 popup window without scrolling.
 */
export function ExtensionMiniCard({
  symbol,
  address,
  trapScore,
  verdict,
  reasons,
  onOpenCaseFile,
  onWatchToken,
  caseFileHref,
  className
}: ExtensionMiniCardProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-3 rounded-xl border bg-card p-4 text-sm",
        BORDER[verdict],
        className
      )}
    >
      <header className="flex items-center justify-between gap-2">
        <div className="leading-tight">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            FOMO Firewall
          </div>
          <div className="text-sm font-semibold">${symbol}</div>
          <div className="font-mono text-[10px] text-muted-foreground">
            {shortAddress(address)}
          </div>
        </div>
        <VerdictBadge verdict={verdict} size="sm" />
      </header>

      <div className="flex items-end gap-2">
        <span className="font-mono text-3xl font-semibold leading-none">
          {trapScore}
        </span>
        <span className="pb-0.5 text-[11px] text-muted-foreground">
          / 100 TrapScore
        </span>
      </div>

      {reasons.length > 0 && (
        <ul className="space-y-1 text-xs text-foreground/90">
          {reasons.slice(0, 3).map((r) => (
            <li key={r} className="flex items-start gap-1.5">
              <span
                className={cn(
                  "mt-1.5 h-1 w-1 shrink-0 rounded-full",
                  verdict === "Critical Trap" && "bg-verdict-critical",
                  verdict === "Exit Warning" && "bg-verdict-warning",
                  verdict === "Risky Chase" && "bg-verdict-risky",
                  verdict === "Clean Pump" && "bg-verdict-clean"
                )}
              />
              {r}
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2 pt-1">
        {caseFileHref ? (
          <a
            href={caseFileHref}
            target="_blank"
            rel="noreferrer"
            className="flex-1 rounded-md border border-primary/40 bg-primary/10 px-2 py-1.5 text-center text-[11px] font-medium uppercase tracking-wider text-primary hover:bg-primary/20"
          >
            Open case file
          </a>
        ) : (
          <button
            type="button"
            onClick={onOpenCaseFile}
            className="flex-1 rounded-md border border-primary/40 bg-primary/10 px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider text-primary hover:bg-primary/20"
          >
            Open case file
          </button>
        )}
        <button
          type="button"
          onClick={onWatchToken}
          className="flex-1 rounded-md border border-border/70 bg-secondary px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider hover:bg-secondary/80"
        >
          Watch token
        </button>
      </div>
    </div>
  );
}
