"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "../utils";

export interface TokenSearchCommandProps {
  className?: string;
  placeholder?: string;
  /** Optional override — defaults to client-side router push. */
  onSubmit?: (value: string) => void;
}

const SOLANA_ADDRESS_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function TokenSearchCommand({
  className,
  placeholder = "Paste Solana token address…",
  onSubmit
}: TokenSearchCommandProps) {
  const router = useRouter();
  const [value, setValue] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    if (!SOLANA_ADDRESS_RE.test(trimmed)) {
      setError("That doesn't look like a Solana mint address.");
      return;
    }
    setError(null);
    if (onSubmit) onSubmit(trimmed);
    else router.push(`/token/${trimmed}`);
  };

  return (
    <form onSubmit={submit} className={cn("w-full", className)} role="search">
      <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-card px-3 py-2 focus-within:border-primary/60">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          placeholder={placeholder}
          aria-label="Token address"
          className="flex-1 bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-primary hover:bg-primary/20"
        >
          Run TrapScore
        </button>
      </div>
      {error && (
        <p className="mt-1 text-xs text-verdict-critical">{error}</p>
      )}
    </form>
  );
}
