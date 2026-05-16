"use client";

import * as React from "react";

const BANDS = [
  { range: "0–30", label: "Clean Pump", color: "#22C55E", bg: "bg-success/10 border-success/40 text-success" },
  { range: "31–60", label: "Risky Chase", color: "#F59E0B", bg: "bg-warning/10 border-warning/40 text-warning" },
  { range: "61–80", label: "Exit Warning", color: "#F97316", bg: "bg-orange-500/10 border-orange-500/40 text-orange-400" },
  { range: "81–100", label: "Critical Trap", color: "#EF4444", bg: "bg-error/10 border-error/40 text-error" }
] as const;

export function ScoreBand() {
  return (
    <div className="my-6">
      <div className="relative h-3 overflow-hidden rounded-full border border-outline-variant/30 bg-surface-container">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, #22C55E 0%, #22C55E 30%, #F59E0B 30%, #F59E0B 60%, #F97316 60%, #F97316 80%, #EF4444 80%, #EF4444 100%)"
          }}
        />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
        {BANDS.map((band) => (
          <div
            key={band.range}
            className={`flex flex-col rounded-lg border px-3 py-2 ${band.bg}`}
          >
            <span className="font-mono text-[11px] uppercase tracking-wider opacity-90">
              {band.range}
            </span>
            <span className="text-sm font-semibold">{band.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
