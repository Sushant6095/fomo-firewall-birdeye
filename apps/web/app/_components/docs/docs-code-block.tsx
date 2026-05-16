"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";

export function DocsCodeBlock({
  language = "ts",
  title,
  children
}: {
  language?: string;
  title?: string;
  children: string;
}) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest">
      <div className="flex items-center justify-between border-b border-outline-variant/30 bg-surface-container px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-error/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
          </div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
            {title ?? language}
          </span>
        </div>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1 rounded-md border border-outline-variant/40 bg-surface-container-high px-2 py-1 text-[11px] text-on-surface-variant transition-colors hover:border-tertiary/40 hover:text-on-surface"
          aria-label="Copy"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-success" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" /> Copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-on-surface">
        <code>{children}</code>
      </pre>
    </div>
  );
}
