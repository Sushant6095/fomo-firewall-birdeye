"use client";

import * as React from "react";
import {
  Compass,
  GitBranch,
  Network,
  Gauge,
  Bot,
  Puzzle,
  Cpu,
  Cloud,
  ChevronRight,
  type LucideIcon
} from "lucide-react";

type Item = { id: string; label: string };
type Section = { title: string; icon: LucideIcon; items: Item[] };

const SECTIONS: Section[] = [
  {
    title: "Getting Started",
    icon: Compass,
    items: [
      { id: "introduction", label: "Introduction" },
      { id: "thesis", label: "Product Thesis" },
      { id: "quick-start", label: "Quick Start" },
      { id: "env", label: "Environment Variables" }
    ]
  },
  {
    title: "Architecture",
    icon: GitBranch,
    items: [
      { id: "system-architecture", label: "System Overview" },
      { id: "data-pipeline", label: "Data Pipeline" },
      { id: "snapshot-engine", label: "Snapshot Engine" },
      { id: "alert-engine", label: "Alert Engine" },
      { id: "surfaces", label: "Web · Bot · Extension" }
    ]
  },
  {
    title: "Birdeye Data",
    icon: Network,
    items: [
      { id: "endpoint-map", label: "Endpoint Map" },
      { id: "ep-trending", label: "Trending Tokens" },
      { id: "ep-overview", label: "Token Overview" },
      { id: "ep-txs", label: "Token Transactions" },
      { id: "ep-holder-profile", label: "Holder Profile" },
      { id: "ep-holder-positions", label: "Holder Positions" },
      { id: "ep-security", label: "Token Security" },
      { id: "ep-new-listing", label: "New Listings" }
    ]
  },
  {
    title: "TrapScore",
    icon: Gauge,
    items: [
      { id: "trapscore-pipeline", label: "Scoring Model" },
      { id: "signal-weights", label: "Signal Weights" },
      { id: "evidence-engine", label: "Evidence Engine" },
      { id: "verdict-system", label: "Verdict System" }
    ]
  },
  {
    title: "Integrations",
    icon: Bot,
    items: [
      { id: "telegram", label: "Telegram Bot" },
      { id: "extension", label: "Browser Extension" },
      { id: "mcp", label: "MCP Tools" },
      { id: "skills", label: "Claude Skills" }
    ]
  },
  {
    title: "Deployment",
    icon: Cloud,
    items: [
      { id: "vercel", label: "Vercel" },
      { id: "supabase", label: "Supabase" },
      { id: "cron", label: "Cron Workers" },
      { id: "security", label: "Security Notes" }
    ]
  }
];

export function DocsSidebar({
  activeId,
  onNavigate
}: {
  activeId?: string;
  onNavigate?: (id: string) => void;
}) {
  return (
    <nav className="hidden lg:block w-64 shrink-0 sticky top-20 self-start max-h-[calc(100vh-5rem)] overflow-y-auto pb-12 pr-4">
      <div className="flex flex-col gap-6">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="font-mono mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-on-surface-variant/80">
              <section.icon className="h-3 w-3" />
              {section.title}
            </div>
            <ul className="flex flex-col gap-px">
              {section.items.map((item) => {
                const active = activeId === item.id;
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={(e) => {
                        if (onNavigate) {
                          e.preventDefault();
                          onNavigate(item.id);
                        }
                      }}
                      className={
                        active
                          ? "flex items-center gap-2 rounded-md border-l-2 border-primary bg-primary/10 px-3 py-1.5 text-sm text-primary"
                          : "flex items-center gap-2 rounded-md border-l-2 border-transparent px-3 py-1.5 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                      }
                    >
                      {active ? (
                        <ChevronRight className="h-3 w-3 shrink-0" />
                      ) : (
                        <span className="h-3 w-3 shrink-0" />
                      )}
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
