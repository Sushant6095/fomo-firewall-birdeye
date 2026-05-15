"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Copy,
  Eye,
  EyeOff,
  Loader2,
  Share2,
  ShieldOff,
  ShieldCheck,
  Check
} from "lucide-react";
import { ShimmerButton } from "./ui/shimmer-button";
import { InteractiveHoverButton } from "./ui/interactive-hover-button";

type CaseFileActionsProps = {
  address: string;
  symbol: string;
  trapScore: number;
  verdict: string;
  initialWatched: boolean;
  initialBlocked: boolean;
};

export function CopyAddressButton({ address }: { address: string }) {
  const [copied, setCopied] = React.useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success("Mint copied", {
        description: `${address.slice(0, 6)}…${address.slice(-6)}`
      });
      setTimeout(() => setCopied(false), 1400);
    } catch {
      toast.error("Clipboard unavailable");
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="text-on-surface-variant transition-colors hover:text-primary"
      aria-label="Copy mint address"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export function WatchTokenButton({
  address,
  symbol,
  initialWatched
}: {
  address: string;
  symbol: string;
  initialWatched: boolean;
}) {
  const router = useRouter();
  const [watched, setWatched] = React.useState(initialWatched);
  const [loading, setLoading] = React.useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(
        watched ? `/api/watchlist/${address}` : "/api/watchlist",
        watched
          ? { method: "DELETE" }
          : {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ address })
            }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const next = !watched;
      setWatched(next);
      toast.success(
        next ? `Watching $${symbol}` : `Removed $${symbol} from watchlist`,
        {
          description: next
            ? "Telegram alerts will fire when TrapScore changes."
            : "You will stop receiving alerts for this token."
        }
      );
      router.refresh();
    } catch (err) {
      toast.error("Failed to update watchlist", {
        description: err instanceof Error ? err.message : "Unknown error"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <InteractiveHoverButton
      onClick={toggle}
      accent={watched ? "tertiary" : "primary"}
      disabled={loading}
      icon={
        loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : watched ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )
      }
    >
      {watched ? "Watching" : "Watch this token"}
    </InteractiveHoverButton>
  );
}

export function CaseFileActionBar({
  address,
  symbol,
  trapScore,
  verdict,
  initialBlocked
}: CaseFileActionsProps) {
  const router = useRouter();
  const [blocked, setBlocked] = React.useState(initialBlocked);
  const [blockLoading, setBlockLoading] = React.useState(false);
  const [shareLoading, setShareLoading] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);

  async function toggleBlock() {
    setBlockLoading(true);
    try {
      const res = await fetch(`/api/extension/block/${address}`, {
        method: "POST"
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { blocked: boolean };
      setBlocked(data.blocked);
      toast.success(
        data.blocked
          ? `Blocked $${symbol} in extension`
          : `Unblocked $${symbol} in extension`,
        {
          description: data.blocked
            ? "Trades on Jupiter, Birdeye, Photon will show a Critical Trap overlay."
            : "Token removed from the extension blocklist."
        }
      );
      router.refresh();
    } catch (err) {
      toast.error("Failed to update extension blocklist", {
        description: err instanceof Error ? err.message : "Unknown error"
      });
    } finally {
      setBlockLoading(false);
    }
  }

  async function share() {
    setShareLoading(true);
    const text = `🛑 ${verdict} · $${symbol} · TrapScore ${trapScore}/100\nhttps://fomo-firewall.app/case-file/${address}`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: `FOMO Firewall · $${symbol}`, text });
        toast.success("Shared");
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("Intelligence copied to clipboard", {
          description: text.slice(0, 60) + "…"
        });
      }
    } catch (err) {
      // ignore — likely user-cancelled share sheet
      if ((err as Error).name !== "AbortError") {
        toast.error("Failed to share", {
          description: (err as Error).message
        });
      }
    } finally {
      setShareLoading(false);
    }
  }

  function exportPdf() {
    setExporting(true);
    toast.message(`Generating intelligence PDF for $${symbol}`, {
      description: "Print dialog will open. Save as PDF to export."
    });
    setTimeout(() => {
      if (typeof window !== "undefined") window.print();
      setExporting(false);
    }, 200);
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-md border-t border-outline-variant/20 pt-lg">
      <button
        type="button"
        onClick={exportPdf}
        disabled={exporting}
        className="font-headline-sm text-headline-sm flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container px-lg py-sm text-on-surface transition-colors hover:border-surface-variant disabled:opacity-60"
      >
        {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Export PDF
      </button>
      <button
        type="button"
        onClick={share}
        disabled={shareLoading}
        className="font-headline-sm text-headline-sm flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container px-lg py-sm text-on-surface transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-60"
      >
        {shareLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
        Share Intelligence
      </button>
      <ShimmerButton
        onClick={toggleBlock}
        disabled={blockLoading}
        background={
          blocked
            ? "linear-gradient(110deg, #22C55E 0%, #4ade80 45%, #22C55E 100%)"
            : "linear-gradient(110deg, #EF4444 0%, #f87171 45%, #EF4444 100%)"
        }
        className="!px-6 !py-2.5 !text-sm"
      >
        {blockLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : blocked ? (
          <ShieldCheck className="h-4 w-4" />
        ) : (
          <ShieldOff className="h-4 w-4" />
        )}
        {blocked ? "Unblock in Extension" : "Block in Extension"}
      </ShimmerButton>
    </div>
  );
}
