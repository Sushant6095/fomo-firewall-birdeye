"use client";

import { motion } from "framer-motion";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "../utils";
import { fadeUp } from "../motion";

export interface SecurityFlagsCardProps {
  flags: {
    mutableMetadata: boolean;
    freezeAuthority: boolean;
    mintAuthority: boolean;
    transferFeeBps: number;
    notes: string[];
  };
  className?: string;
}

export function SecurityFlagsCard({
  flags,
  className
}: SecurityFlagsCardProps) {
  const items = [
    {
      label: "Mutable metadata",
      enabled: flags.mutableMetadata,
      bad: true,
      detail: "Symbol/URI can change post-listing"
    },
    {
      label: "Freeze authority",
      enabled: flags.freezeAuthority,
      bad: true,
      detail: "Transfers can be frozen"
    },
    {
      label: "Mint authority",
      enabled: flags.mintAuthority,
      bad: true,
      detail: "New supply can still be issued"
    },
    {
      label: "Transfer fee",
      enabled: flags.transferFeeBps > 0,
      bad: flags.transferFeeBps > 100,
      detail:
        flags.transferFeeBps > 0
          ? `${(flags.transferFeeBps / 100).toFixed(2)}% on every transfer`
          : "No on-transfer tax"
    }
  ];

  const hasRisk = items.some((i) => i.enabled && i.bad);

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className={cn(
        "rounded-xl border bg-card p-5",
        hasRisk ? "border-verdict-warning/35" : "border-border/70",
        className
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Security Risk
          </div>
          <h3 className="text-sm font-semibold">
            {hasRisk ? "Token has open authority risks" : "No critical security flags"}
          </h3>
        </div>
        <span
          className={cn(
            "grid h-9 w-9 place-items-center rounded-md border",
            hasRisk
              ? "border-verdict-warning/35 bg-verdict-warning/10 text-verdict-warning"
              : "border-verdict-clean/30 bg-verdict-clean/10 text-verdict-clean"
          )}
        >
          {hasRisk ? (
            <ShieldAlert className="h-4 w-4" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
        </span>
      </header>

      <ul className="mt-4 grid gap-2 text-sm">
        {items.map((i) => (
          <li
            key={i.label}
            className="flex items-center justify-between gap-3 border-b border-border/40 pb-2 last:border-b-0 last:pb-0"
          >
            <div>
              <div className="text-sm">{i.label}</div>
              <div className="text-[11px] text-muted-foreground">
                {i.detail}
              </div>
            </div>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                i.enabled && i.bad
                  ? "border-verdict-warning/40 bg-verdict-warning/10 text-verdict-warning"
                  : i.enabled
                    ? "border-verdict-risky/35 bg-verdict-risky/10 text-verdict-risky"
                    : "border-verdict-clean/30 bg-verdict-clean/10 text-verdict-clean"
              )}
            >
              {i.enabled ? "Enabled" : "Disabled"}
            </span>
          </li>
        ))}
      </ul>

      {flags.notes.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
          {flags.notes.map((n) => (
            <li key={n} className="flex items-start gap-1.5">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
              {n}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
