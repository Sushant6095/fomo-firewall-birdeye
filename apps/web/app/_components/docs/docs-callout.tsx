"use client";

import * as React from "react";
import { Info, AlertTriangle, AlertOctagon, ShieldCheck } from "lucide-react";

type Tone = "info" | "warning" | "danger" | "safe";

const TONE: Record<Tone, { wrap: string; iconColor: string; Icon: typeof Info }> = {
  info: {
    wrap: "border-tertiary/30 bg-tertiary/5",
    iconColor: "text-tertiary",
    Icon: Info
  },
  warning: {
    wrap: "border-warning/40 bg-warning/5",
    iconColor: "text-warning",
    Icon: AlertTriangle
  },
  danger: {
    wrap: "border-error/40 bg-error/5",
    iconColor: "text-error",
    Icon: AlertOctagon
  },
  safe: {
    wrap: "border-success/30 bg-success/5",
    iconColor: "text-success",
    Icon: ShieldCheck
  }
};

export function DocsCallout({
  tone = "info",
  title,
  children
}: {
  tone?: Tone;
  title?: string;
  children: React.ReactNode;
}) {
  const t = TONE[tone];
  return (
    <div className={`my-6 flex gap-3 rounded-xl border ${t.wrap} p-4`}>
      <t.Icon className={`mt-0.5 h-5 w-5 shrink-0 ${t.iconColor}`} />
      <div className="text-sm leading-relaxed text-on-surface">
        {title ? (
          <div className={`mb-1 text-xs font-semibold uppercase tracking-wider ${t.iconColor}`}>
            {title}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
