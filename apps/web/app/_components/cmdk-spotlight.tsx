"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "framer-motion";
import { Search, ArrowRight, Loader2, Radar } from "lucide-react";
import { useCmdK } from "./cmdk-context";

type SearchResult = {
  address: string;
  symbol: string;
  name: string;
  trapScore: number;
  verdict: "Critical Trap" | "Exit Warning" | "Risky Chase" | "Clean Pump";
};

const VERDICT_COLOR: Record<SearchResult["verdict"], string> = {
  "Critical Trap": "text-error",
  "Exit Warning": "text-secondary",
  "Risky Chase": "text-tertiary",
  "Clean Pump": "text-success"
};

export function CmdKSpotlight() {
  const { open, setOpen } = useCmdK();
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Debounced fetch
  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { results: SearchResult[] };
        if (!cancelled) setResults(data.results ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "search failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 120);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, open]);

  // Reset when opened
  React.useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  const handleSelect = React.useCallback(
    (address: string) => {
      setOpen(false);
      router.push(`/case-file/${address}`);
    },
    [router, setOpen]
  );

  const looksLikeMint =
    query.length >= 32 && /^[A-Za-z0-9]+$/.test(query) && results.length === 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="cmdk-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-start justify-center bg-background/70 px-4 pt-[12vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            key="cmdk-panel"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-outline-variant bg-surface-container shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <Command shouldFilter={false} className="flex w-full flex-col">
              <div className="flex items-center gap-3 border-b border-outline-variant/40 px-4 py-3">
                <Search className="h-4 w-4 text-on-surface-variant" />
                <Command.Input
                  autoFocus
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Paste a Solana mint, ticker, or token name…"
                  className="flex-1 bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant"
                />
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-tertiary" />
                ) : (
                  <kbd className="rounded border border-outline-variant bg-surface-container-high px-1.5 py-0.5 font-mono text-[10px] text-on-surface-variant">
                    Esc
                  </kbd>
                )}
              </div>

              <Command.List className="max-h-[420px] overflow-y-auto py-2">
                {error ? (
                  <div className="px-4 py-6 text-center text-sm text-error">
                    {error}
                  </div>
                ) : null}

                {!error && results.length === 0 && !loading ? (
                  <Command.Empty className="px-4 py-6 text-center text-sm text-on-surface-variant">
                    {looksLikeMint ? (
                      <button
                        type="button"
                        onClick={() => handleSelect(query)}
                        className="inline-flex w-full items-center justify-between rounded-lg border border-tertiary/40 bg-tertiary/10 px-4 py-3 text-left text-on-surface hover:bg-tertiary/15"
                      >
                        <span className="flex items-center gap-2">
                          <Radar className="h-4 w-4 text-tertiary" />
                          <span>
                            Open case file for{" "}
                            <code className="font-mono text-tertiary">
                              {query.slice(0, 6)}…{query.slice(-6)}
                            </code>
                          </span>
                        </span>
                        <ArrowRight className="h-4 w-4 text-tertiary" />
                      </button>
                    ) : (
                      <>No tokens match &quot;{query}&quot;.</>
                    )}
                  </Command.Empty>
                ) : null}

                {results.length > 0 ? (
                  <Command.Group
                    heading="Monitored Tokens"
                    className="px-2 py-1 text-[10px] font-medium uppercase tracking-widest text-on-surface-variant"
                  >
                    {results.map((r) => (
                      <Command.Item
                        key={r.address}
                        value={`${r.symbol}-${r.address}`}
                        onSelect={() => handleSelect(r.address)}
                        className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-on-surface aria-selected:bg-surface-container-highest"
                      >
                        <div className="flex items-center gap-3">
                          <span className="grid h-8 w-8 place-items-center rounded-lg border border-outline-variant bg-surface-container-low text-[11px] font-bold uppercase">
                            {r.symbol.slice(0, 3)}
                          </span>
                          <div className="flex flex-col">
                            <span className="font-medium">${r.symbol}</span>
                            <span className="font-mono text-[11px] text-on-surface-variant">
                              {r.address.slice(0, 6)}…{r.address.slice(-6)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`font-mono text-sm font-bold ${VERDICT_COLOR[r.verdict]}`}
                          >
                            {r.trapScore}
                          </span>
                          <span
                            className={`rounded border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${VERDICT_COLOR[r.verdict]} border-current/30 bg-current/10`}
                          >
                            {r.verdict}
                          </span>
                          <ArrowRight className="h-4 w-4 text-on-surface-variant" />
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>
                ) : null}
              </Command.List>
              <div className="flex items-center justify-between border-t border-outline-variant/40 bg-surface-container-low px-4 py-2 text-[11px] text-on-surface-variant">
                <span className="flex items-center gap-2">
                  <kbd className="rounded border border-outline-variant px-1 font-mono">
                    ↑
                  </kbd>
                  <kbd className="rounded border border-outline-variant px-1 font-mono">
                    ↓
                  </kbd>
                  navigate
                </span>
                <span className="flex items-center gap-2">
                  <kbd className="rounded border border-outline-variant px-1 font-mono">
                    ↵
                  </kbd>
                  open case file
                </span>
              </div>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
