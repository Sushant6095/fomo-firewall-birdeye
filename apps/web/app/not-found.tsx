import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-10">
      <div className="max-w-md rounded-2xl border border-outline-variant bg-surface-container p-8 text-center">
        <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-md border border-outline-variant bg-surface-container-low text-primary">
          <Compass className="h-5 w-5" />
        </div>
        <h1 className="text-lg font-semibold text-on-surface">
          Off the risk map
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          That route doesn&apos;t exist in FOMO Firewall. Head back to the dashboard
          to see the latest TrapScores.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary transition hover:bg-primary/90"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
