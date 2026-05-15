"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, Loader2 } from "lucide-react";
import { ShimmerButton } from "./ui/shimmer-button";

export function BoardWatchAllButton({ addresses }: { addresses: string[] }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [loading, setLoading] = React.useState(false);

  async function onClick() {
    if (addresses.length === 0) {
      toast.message("Nothing to watch", {
        description: "No critical traps active right now."
      });
      return;
    }
    setLoading(true);
    try {
      const results = await Promise.all(
        addresses.map((address) =>
          fetch("/api/watchlist", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ address })
          }).then((r) => r.json())
        )
      );
      const added = results.filter((r) => r.added).length;
      toast.success(`Added ${added} of ${addresses.length} to watchlist`, {
        description: "Telegram alerts will fire if TrapScore moves."
      });
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error("Failed to update watchlist", {
        description: err instanceof Error ? err.message : "Unknown error"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <ShimmerButton onClick={onClick} disabled={loading || pending} className="!px-4 !py-2 !text-sm">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
      Watch All Critical
    </ShimmerButton>
  );
}
