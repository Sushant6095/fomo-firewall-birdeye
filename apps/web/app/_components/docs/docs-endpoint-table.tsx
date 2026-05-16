"use client";

import * as React from "react";
import { Network } from "lucide-react";

type Row = {
  endpoint: string;
  role: string;
  signal: string;
  usedBy: string;
  tone?: "primary" | "tertiary" | "warning" | "neutral";
};

const ROWS: Row[] = [
  {
    endpoint: "/defi/token_trending",
    role: "Discovery feed",
    signal: "Which tokens are currently hot",
    usedBy: "Worker, dashboard, alerts",
    tone: "tertiary"
  },
  {
    endpoint: "/defi/token_overview",
    role: "Market snapshot",
    signal: "Price, liquidity, volume, market cap, trade changes",
    usedBy: "TrapScore, case file",
    tone: "tertiary"
  },
  {
    endpoint: "/defi/v3/token/txs",
    role: "Transaction evidence",
    signal: "Buy/sell pressure, large trades, liquidity events",
    usedBy: "Evidence engine",
    tone: "primary"
  },
  {
    endpoint: "/token/v1/holder-profile",
    role: "Holder intelligence",
    signal: "Smart trader, insider, dev, sniper, bundler groups",
    usedBy: "Smart-money and insider signals",
    tone: "primary"
  },
  {
    endpoint: "/token/v1/holder-positions",
    role: "Wallet position analysis",
    signal: "Tagged holder exposure, netflow, PnL behavior",
    usedBy: "TrapScore engine",
    tone: "primary"
  },
  {
    endpoint: "/defi/v3/token/holder",
    role: "Top holder concentration",
    signal: "Top 10 / top 20 holder concentration",
    usedBy: "Concentration risk",
    tone: "warning"
  },
  {
    endpoint: "/defi/token_security",
    role: "Static token risk",
    signal: "Mint / freeze authority, mutable metadata, transfer restrictions",
    usedBy: "Security risk",
    tone: "warning"
  },
  {
    endpoint: "/defi/v2/tokens/new_listing",
    role: "Secondary early discovery",
    signal: "Fresh launches entering risk monitoring",
    usedBy: "Early warning feed",
    tone: "neutral"
  }
];

const TONE_TO_DOT: Record<NonNullable<Row["tone"]>, string> = {
  primary: "bg-primary",
  tertiary: "bg-tertiary",
  warning: "bg-warning",
  neutral: "bg-on-surface-variant"
};

const TONE_TO_BORDER: Record<NonNullable<Row["tone"]>, string> = {
  primary: "border-l-primary",
  tertiary: "border-l-tertiary",
  warning: "border-l-warning",
  neutral: "border-l-on-surface-variant/40"
};

export function DocsEndpointTable() {
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container/40">
      <div className="hidden lg:grid grid-cols-12 gap-3 border-b border-outline-variant/40 bg-surface-container px-5 py-3 text-[10px] font-medium uppercase tracking-[0.18em] text-on-surface-variant">
        <div className="col-span-4">Endpoint</div>
        <div className="col-span-2">Role</div>
        <div className="col-span-4">Signal</div>
        <div className="col-span-2">Used by</div>
      </div>
      <div>
        {ROWS.map((row) => {
          const tone = row.tone ?? "neutral";
          return (
            <div
              key={row.endpoint}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-3 border-b border-l-2 border-outline-variant/20 px-5 py-4 transition-colors hover:bg-surface-container-high/60 last:border-b-0 ${TONE_TO_BORDER[tone]}`}
            >
              <div className="col-span-4 flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${TONE_TO_DOT[tone]}`} />
                <code className="rounded bg-surface-container-high px-2 py-0.5 font-mono text-[12.5px] text-tertiary">
                  {row.endpoint}
                </code>
              </div>
              <div className="col-span-2 text-sm text-on-surface">{row.role}</div>
              <div className="col-span-4 text-sm text-on-surface-variant">{row.signal}</div>
              <div className="col-span-2 text-sm text-on-surface-variant">{row.usedBy}</div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2 border-t border-outline-variant/40 bg-surface-container px-5 py-3 font-mono text-[11px] text-on-surface-variant">
        <Network className="h-3 w-3 text-tertiary" />
        8 endpoints · all read server-side · BIRDEYE_API_KEY never leaves the worker
      </div>
    </div>
  );
}
