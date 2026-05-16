"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Github,
  Rocket,
  ChevronRight,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { LogoPulse } from "../ui/logo";
import { DocsSidebar } from "./docs-sidebar";
import { DocsToc, type TocItem } from "./docs-toc";

const TOP_NAV = [
  { label: "Overview", href: "/docs" },
  { label: "Architecture", href: "/docs#system-architecture" },
  { label: "Birdeye API", href: "/docs#endpoint-map" },
  { label: "TrapScore", href: "/docs#trapscore-pipeline" },
  { label: "Web App", href: "/docs#surfaces" },
  { label: "Telegram Bot", href: "/docs#telegram" },
  { label: "Extension", href: "/docs#extension" },
  { label: "Agents / MCP", href: "/docs#mcp" }
];

export function DocsShell({
  breadcrumb,
  toc,
  children
}: {
  breadcrumb: { label: string; href?: string }[];
  toc: TocItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Docs sub-nav (below the global TopAppBar) */}
      <div className="sticky top-0 z-30 -mx-container-margin border-b border-outline-variant/30 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-6 px-container-margin py-3">
          <div className="flex items-center gap-3">
            <Link href="/docs" className="flex items-center gap-2.5">
              <LogoPulse size={26} />
              <div className="flex flex-col leading-none">
                <span className="text-[15px] font-bold uppercase tracking-tight text-on-surface">
                  Docs
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-on-surface-variant">
                  Exit-Liquidity Intel
                </span>
              </div>
            </Link>
            <nav className="hidden lg:flex items-center gap-1">
              {TOP_NAV.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-md px-3 py-1.5 text-[13px] text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 rounded-md border border-outline-variant/40 bg-surface-container px-3 py-1.5 text-on-surface-variant">
              <Search className="h-3.5 w-3.5" />
              <span className="text-[12px]">Search docs or ask AI</span>
              <kbd className="ml-3 rounded border border-outline-variant bg-surface-container-high px-1.5 py-0.5 font-mono text-[10px]">
                ⌘K
              </kbd>
            </div>
            <Link
              href="https://github.com/Sushant6095/fomo-firewall-birdeye"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-outline-variant/40 bg-surface-container p-2 text-on-surface-variant transition-colors hover:border-on-surface-variant hover:text-on-surface"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </Link>
            <Link
              href="/"
              className="hidden md:inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-[13px] font-medium text-primary transition-colors hover:bg-primary/20"
            >
              <Rocket className="h-3.5 w-3.5" />
              Launch App
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-container-margin pt-6">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-4 flex items-center gap-1.5 text-[12px] text-on-surface-variant"
        >
          {breadcrumb.map((b, i) => (
            <React.Fragment key={i}>
              {i > 0 ? <ChevronRight className="h-3 w-3" /> : null}
              {b.href ? (
                <Link
                  href={b.href}
                  className="transition-colors hover:text-on-surface"
                >
                  {b.label}
                </Link>
              ) : (
                <span className="text-on-surface">{b.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>

        <div className="flex gap-8">
          <DocsSidebar />
          <main className="min-w-0 flex-1 pb-24">{children}</main>
          <DocsToc items={toc} />
        </div>
      </div>
    </div>
  );
}
