"use client";

import { AlertOctagon } from "lucide-react";

export default function DashboardError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-10">
      <div className="max-w-md rounded-2xl border border-warning/35 bg-surface-container p-8 text-center">
        <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-md border border-warning/35 bg-warning/10 text-warning">
          <AlertOctagon className="h-5 w-5" />
        </div>
        <h1 className="text-lg font-semibold text-on-surface">
          Dashboard failed to load
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          The risk feed is temporarily unavailable. The worker may still be
          warming up. {error.digest ? `Reference: ${error.digest}` : null}
        </p>
        <button
          onClick={reset}
          className="mt-4 rounded-md border border-primary bg-transparent px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/10"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
