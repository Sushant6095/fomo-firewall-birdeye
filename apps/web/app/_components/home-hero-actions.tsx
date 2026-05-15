"use client";

import Link from "next/link";
import { ClipboardPaste, Radar } from "lucide-react";
import { useCmdK } from "./cmdk-context";
import { ShimmerButton } from "./ui/shimmer-button";

export function HomeHeroActions({ featuredAddress }: { featuredAddress: string }) {
  const { setOpen } = useCmdK();
  return (
    <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
      <ShimmerButton onClick={() => setOpen(true)} className="!px-8 !py-4 !text-base">
        <ClipboardPaste className="h-5 w-5" />
        Paste a mint
      </ShimmerButton>
      <Link
        href={`/case-file/${featuredAddress}`}
        className="font-headline-sm text-headline-sm group flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface-container-high px-8 py-4 text-on-surface transition-all duration-300 hover:border-error/50 hover:bg-error/10 hover:text-error"
      >
        <Radar className="h-5 w-5 transition-colors group-hover:text-error" />
        Show me the worst trap
      </Link>
    </div>
  );
}
