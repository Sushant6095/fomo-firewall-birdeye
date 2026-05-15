"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Plus, X, AlertTriangle, BellOff } from "lucide-react";
import { useCmdK } from "./cmdk-context";
import type { TrapVerdict } from "@fomo/shared";

type WatchlistRow = {
  address: string;
  symbol: string;
  trapScore: number;
  verdict: TrapVerdict;
};

const VERDICT_TONE: Record<TrapVerdict, "critical" | "warning" | "risky" | "clean"> = {
  "Critical Trap": "critical",
  "Exit Warning": "warning",
  "Risky Chase": "risky",
  "Clean Pump": "clean"
};

export function WatchlistAddButton() {
  const { setOpen } = useCmdK();
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="rounded p-1 text-primary transition-colors hover:bg-primary/10"
      aria-label="Add target via search"
    >
      <Plus className="h-4 w-4" />
    </button>
  );
}

export function WatchlistItem({ row }: { row: WatchlistRow }) {
  const router = useRouter();
  const [removing, setRemoving] = React.useState(false);
  const tone = VERDICT_TONE[row.verdict];

  async function remove(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setRemoving(true);
    try {
      const res = await fetch(`/api/watchlist/${row.address}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success(`Removed $${row.symbol} from watchlist`);
      router.refresh();
    } catch (err) {
      toast.error("Failed to remove", {
        description: err instanceof Error ? err.message : "Unknown"
      });
      setRemoving(false);
    }
  }

  const scoreColor =
    tone === "critical"
      ? "text-error"
      : tone === "warning"
        ? "text-secondary"
        : tone === "risky"
          ? "text-tertiary"
          : "text-success";

  return (
    <Link
      href={`/case-file/${row.address}`}
      className={`group relative flex flex-col gap-sm rounded-lg p-md transition-colors hover:bg-surface-container-highest ${
        tone === "critical"
          ? "border border-error/50 bg-surface"
          : tone === "warning"
            ? "border border-secondary/50 bg-surface"
            : "border border-surface-variant bg-surface"
      }`}
    >
      <button
        type="button"
        onClick={remove}
        disabled={removing}
        aria-label={`Remove $${row.symbol}`}
        className="absolute right-2 top-2 rounded-full p-1 text-on-surface-variant opacity-0 transition-opacity hover:bg-error/10 hover:text-error group-hover:opacity-100 disabled:opacity-100"
      >
        {removing ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
      </button>
      <div className="flex items-start justify-between pr-6">
        <div>
          <h3 className="font-headline-md text-headline-md flex items-center gap-xs text-on-surface">
            ${row.symbol}
            {tone === "critical" ? (
              <AlertTriangle className="h-3.5 w-3.5 text-error" />
            ) : null}
          </h3>
          <p className="font-mono-data text-mono-data w-32 truncate text-on-surface-variant">
            {row.address.slice(0, 6)}…{row.address.slice(-6)}
          </p>
        </div>
        <div className="text-right">
          <div className={`font-mono-data text-mono-data text-lg font-bold ${scoreColor}`}>
            {row.trapScore}
          </div>
          <div className="font-mono-label text-mono-label text-on-surface-variant">
            TrapScore
          </div>
        </div>
      </div>
      <div
        className={`relative mt-1 h-8 w-full rounded ${
          tone === "critical"
            ? "border-b-2 border-error bg-gradient-to-r from-transparent via-error/10 to-error/20"
            : tone === "warning"
              ? "border-b-2 border-secondary bg-gradient-to-r from-transparent via-secondary/10 to-secondary/20"
              : tone === "risky"
                ? "border-b border-tertiary/50 bg-gradient-to-r from-transparent via-tertiary/5 to-tertiary/10"
                : "border-b border-success/50 bg-gradient-to-r from-transparent via-success/5 to-success/10"
        }`}
      >
        {tone === "critical" ? (
          <div className="absolute right-0 top-0 bottom-0 w-1 animate-pulse bg-error" />
        ) : null}
      </div>
    </Link>
  );
}

type AlertPrefs = {
  trapScoreThreshold: number;
  dedupMinutes: number;
  quietHours: boolean;
  signalFilters: string[];
};

export function AlertPrefsPanel({ initial }: { initial: AlertPrefs }) {
  const [prefs, setPrefs] = React.useState<AlertPrefs>(initial);
  const [saving, setSaving] = React.useState(false);

  async function update(patch: Partial<AlertPrefs>) {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    setSaving(true);
    try {
      const res = await fetch("/api/user/alert-prefs", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success("Preferences saved");
    } catch (err) {
      toast.error("Failed to save preferences", {
        description: err instanceof Error ? err.message : "Unknown"
      });
      setPrefs(prefs); // rollback
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-auto rounded-xl border border-outline-variant/50 bg-surface-container-low p-md">
      <h3 className="font-headline-sm text-headline-sm mb-md flex items-center gap-xs text-on-surface-variant">
        <BellOff className="h-4 w-4" />
        Alert Preferences
        {saving ? (
          <Loader2 className="ml-auto h-3 w-3 animate-spin text-tertiary" />
        ) : null}
      </h3>
      <div className="flex flex-col gap-md">
        {/* Threshold slider */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-body-md text-body-md text-on-surface">
                TrapScore Threshold
              </div>
              <div className="font-body-sm text-body-sm text-on-surface-variant">
                Only alert above this score
              </div>
            </div>
            <span className="font-mono-data text-mono-data text-tertiary">
              {prefs.trapScoreThreshold}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={prefs.trapScoreThreshold}
            onChange={(e) =>
              setPrefs((p) => ({ ...p, trapScoreThreshold: Number(e.target.value) }))
            }
            onPointerUp={() =>
              update({ trapScoreThreshold: prefs.trapScoreThreshold })
            }
            className="w-full accent-tertiary"
          />
        </div>

        <div className="h-px w-full bg-outline-variant/30" />

        {/* Dedup */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-body-md text-body-md text-on-surface">
              Deduplicate Alerts
            </div>
            <div className="font-body-sm text-body-sm text-on-surface-variant">
              Merge similar events within {prefs.dedupMinutes}m
            </div>
          </div>
          <Toggle
            checked={prefs.dedupMinutes > 0}
            onChange={(v) =>
              update({ dedupMinutes: v ? 30 : 0 })
            }
          />
        </div>

        <div className="h-px w-full bg-outline-variant/30" />

        {/* Quiet hours */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-body-md text-body-md text-on-surface">
              Quiet Hours
            </div>
            <div className="font-body-sm text-body-sm text-on-surface-variant">
              Only Critical alerts bypass
            </div>
          </div>
          <Toggle
            checked={prefs.quietHours}
            onChange={(v) => update({ quietHours: v })}
          />
        </div>
      </div>
    </section>
  );
}

function Toggle({
  checked,
  onChange
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative flex h-6 w-10 cursor-pointer items-center rounded-full px-1 transition-colors ${
        checked ? "bg-primary" : "border border-outline-variant bg-surface-variant"
      }`}
    >
      <div
        className={`h-4 w-4 rounded-full shadow-sm transition-all ${
          checked
            ? "translate-x-4 bg-background"
            : "translate-x-0 bg-on-surface-variant"
        }`}
      />
    </button>
  );
}
