"use client";

import * as React from "react";
import Link from "next/link";
import { Monitor, Send, Puzzle, ArrowUpRight, type LucideIcon } from "lucide-react";

type Surface = {
  name: string;
  icon: LucideIcon;
  tone: "primary" | "tertiary" | "warning";
  description: string;
  bullets: string[];
  cta: { label: string; href: string; external?: boolean };
};

const SURFACES: Surface[] = [
  {
    name: "Web Dashboard",
    icon: Monitor,
    tone: "primary",
    description:
      "Full threat matrix, live risk board, token case files, evidence pinned to each Birdeye endpoint.",
    bullets: ["5 pages", "9 API routes", "Cmd-K spotlight"],
    cta: { label: "Open dashboard", href: "/" }
  },
  {
    name: "Telegram Bot",
    icon: Send,
    tone: "tertiary",
    description:
      "Instant alerts when TrapScore spikes or smart money flips net-negative. /score, /watch, /alerts.",
    bullets: ["4 commands", "Auto-dispatch", "Dedup-aware"],
    cta: { label: "Open @fomo_firewall_bot", href: "https://t.me/fomo_firewall_bot", external: true }
  },
  {
    name: "Browser Extension",
    icon: Puzzle,
    tone: "warning",
    description:
      "Check any token address while browsing Birdeye, DexScreener, Solscan, pump.fun. Open the full case file with one click.",
    bullets: ["Manifest V3", "6 host scopes", "Calls our API only"],
    cta: {
      label: "View on GitHub",
      href: "https://github.com/Sushant6095/fomo-firewall-birdeye/tree/main/apps/extension",
      external: true
    }
  }
];

const TONE: Record<
  Surface["tone"],
  { border: string; iconBg: string; iconText: string; pill: string }
> = {
  primary: {
    border: "border-primary/40",
    iconBg: "bg-primary/10 border-primary/30",
    iconText: "text-primary",
    pill: "border-primary/30 text-primary/90 bg-primary/5"
  },
  tertiary: {
    border: "border-tertiary/40",
    iconBg: "bg-tertiary/10 border-tertiary/30",
    iconText: "text-tertiary",
    pill: "border-tertiary/30 text-tertiary/90 bg-tertiary/5"
  },
  warning: {
    border: "border-warning/40",
    iconBg: "bg-warning/10 border-warning/30",
    iconText: "text-warning",
    pill: "border-warning/30 text-warning/90 bg-warning/5"
  }
};

export function ProductSurfaceGrid() {
  return (
    <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-3">
      {SURFACES.map((s) => {
        const t = TONE[s.tone];
        return (
          <div
            key={s.name}
            className={`group flex flex-col gap-3 rounded-xl border bg-surface-container/40 p-5 transition-all hover:bg-surface-container/70 ${t.border}`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg border ${t.iconBg}`}
              >
                <s.icon className={`h-5 w-5 ${t.iconText}`} />
              </div>
            </div>
            <h4 className="text-base font-semibold text-on-surface">{s.name}</h4>
            <p className="flex-1 text-sm leading-relaxed text-on-surface-variant">
              {s.description}
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {s.bullets.map((b) => (
                <li
                  key={b}
                  className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${t.pill}`}
                >
                  {b}
                </li>
              ))}
            </ul>
            <Link
              href={s.cta.href}
              target={s.cta.external ? "_blank" : undefined}
              rel={s.cta.external ? "noopener noreferrer" : undefined}
              className={`mt-1 inline-flex items-center justify-between rounded-lg border border-outline-variant/40 bg-surface-container px-3 py-2 text-sm text-on-surface transition-colors hover:border-current hover:${t.iconText}`}
            >
              <span>{s.cta.label}</span>
              <ArrowUpRight className={`h-4 w-4 ${t.iconText}`} />
            </Link>
          </div>
        );
      })}
    </div>
  );
}
