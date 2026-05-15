"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, RefreshCw, Wifi, WifiOff } from "lucide-react";

type Status = {
  hasKey: boolean;
  mode: "live" | "fixture" | "pending";
  tokensInDb: number;
  sampleSymbol: string | null;
  lastRun: {
    startedAt: string;
    durationMs: number;
    trendingFetched: number;
    enrichedOk: number;
    enrichedErrors: number;
    scored: number;
    alertsFired: number;
    warningCount: number;
  } | null;
};

export function LiveBadge() {
  const [status, setStatus] = React.useState<Status | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchStatus = React.useCallback(async () => {
    try {
      const r = await fetch("/api/source/status", { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = (await r.json()) as Status;
      setStatus(data);
    } catch {
      setStatus({
        hasKey: false,
        mode: "fixture",
        tokensInDb: 0,
        sampleSymbol: null,
        lastRun: null
      });
    }
  }, []);

  React.useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, 30_000);
    return () => clearInterval(id);
  }, [fetchStatus]);

  async function refresh() {
    if (!status?.hasKey) {
      toast.message("Demo mode", {
        description: "Add BIRDEYE_API_KEY to .env to pull live data."
      });
      return;
    }
    setRefreshing(true);
    const toastId = toast.loading("Pulling live Birdeye data…", {
      description: "8 tokens · 1 trending + ~4 calls each · ~40s on free tier"
    });
    try {
      const r = await fetch("/api/worker/run", { method: "POST" });
      const data = await r.json();
      if (!data.ok) throw new Error(data.error ?? "Run failed");
      toast.success("Live ingestion complete", {
        id: toastId,
        description: `${data.summary.scored} scored · ${data.summary.alertsFired} alerts · ${(data.summary.durationMs / 1000).toFixed(1)}s`
      });
      await fetchStatus();
      // Soft reload so server components re-fetch.
      if (typeof window !== "undefined") {
        setTimeout(() => window.location.reload(), 600);
      }
    } catch (err) {
      toast.error("Live ingestion failed", {
        id: toastId,
        description: err instanceof Error ? err.message : "Unknown error"
      });
    } finally {
      setRefreshing(false);
    }
  }

  if (!status) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-outline-variant/40 bg-surface-container px-3 py-1 text-xs text-on-surface-variant">
        <Loader2 className="h-3 w-3 animate-spin" /> Status…
      </span>
    );
  }

  const isLive = status.mode === "live" && status.hasKey;
  const dotClass = isLive ? "bg-success" : "bg-warning";
  const labelClass = isLive ? "text-success" : "text-warning";

  return (
    <button
      type="button"
      onClick={refresh}
      disabled={refreshing}
      title={
        isLive
          ? `Live Birdeye data · ${status.tokensInDb} tokens · last run ${status.lastRun ? new Date(status.lastRun.startedAt).toLocaleTimeString() : "—"} · click to refresh`
          : "Demo / fixture data. Set BIRDEYE_API_KEY to go live."
      }
      className={`group inline-flex items-center gap-2 rounded-full border bg-surface-container px-3 py-1 text-xs transition-all hover:scale-[1.02] disabled:opacity-60 ${
        isLive
          ? "border-success/40 hover:border-success/70"
          : "border-warning/40 hover:border-warning/70"
      }`}
    >
      <span className="relative flex h-2 w-2">
        {isLive ? (
          <motion.span
            className={`absolute inline-flex h-full w-full rounded-full ${dotClass} opacity-75`}
            animate={{ scale: [1, 2, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
          />
        ) : null}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${dotClass}`} />
      </span>
      <span className={`font-semibold uppercase tracking-wider ${labelClass}`}>
        {isLive ? "Live" : "Demo"}
      </span>
      {isLive ? (
        <span className="text-on-surface-variant">Birdeye</span>
      ) : (
        <span className="text-on-surface-variant">fixtures</span>
      )}
      {refreshing ? (
        <Loader2 className="ml-1 h-3 w-3 animate-spin text-on-surface" />
      ) : isLive ? (
        <RefreshCw className="ml-1 h-3 w-3 text-on-surface-variant opacity-0 transition-opacity group-hover:opacity-100" />
      ) : (
        <WifiOff className="ml-1 h-3 w-3 text-on-surface-variant" />
      )}
    </button>
  );
}
