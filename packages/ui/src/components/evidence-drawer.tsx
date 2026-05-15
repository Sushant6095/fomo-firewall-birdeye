"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Database } from "lucide-react";
import { cn } from "../utils";
import { drawerSlide } from "../motion";
import { severityTone } from "../design-tokens";
import type { EvidenceItem } from "../fixtures";

export interface EvidenceDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  evidence: EvidenceItem[];
}

const SEVERITY_DOT = {
  low: "bg-muted-foreground",
  medium: "bg-verdict-risky",
  high: "bg-verdict-warning",
  critical: "bg-verdict-critical"
} as const;

export function EvidenceDrawer({
  open,
  onClose,
  title,
  subtitle,
  evidence
}: EvidenceDrawerProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            key="drawer"
            variants={drawerSlide}
            initial="hidden"
            animate="show"
            exit="exit"
            role="dialog"
            aria-label={title}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-border/70 bg-card shadow-2xl"
          >
            <header className="flex items-start justify-between gap-3 border-b border-border/60 p-5">
              <div className="space-y-1">
                <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Evidence
                </div>
                <h2 className="text-lg font-semibold leading-tight">{title}</h2>
                {subtitle && (
                  <p className="text-sm text-muted-foreground">{subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="space-y-3 p-5">
              {evidence.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No evidence captured for this signal yet.
                </p>
              ) : (
                evidence.map((e) => (
                  <article
                    key={`${e.label}-${e.source}`}
                    className={cn(
                      "rounded-lg border border-border/60 bg-secondary/40 p-3"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <span
                          className={cn(
                            "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                            SEVERITY_DOT[e.severity]
                          )}
                        />
                        <div>
                          <div className="text-sm font-medium">{e.label}</div>
                          <div className="font-mono text-base">{e.value}</div>
                        </div>
                      </div>
                      <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        {severityTone[e.severity].label}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
                      <Database className="h-3 w-3" />
                      <span className="font-mono">{e.source}</span>
                    </div>
                  </article>
                ))
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
