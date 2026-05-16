import * as React from "react";
import Link from "next/link";
import { Copy, Github, Rocket, BookOpen, AlertOctagon } from "lucide-react";
import { DocsShell } from "../_components/docs/docs-shell";
import { DocsCallout } from "../_components/docs/docs-callout";
import { DocsCodeBlock } from "../_components/docs/docs-code-block";
import { DocsEndpointTable } from "../_components/docs/docs-endpoint-table";
import { ScoreBand } from "../_components/docs/score-band";
import { ProductSurfaceGrid } from "../_components/docs/product-surface-card";
import { ArchitectureFlow } from "../_components/docs/architecture-flow";
import { TrapScoreFlow } from "../_components/docs/trapscore-flow";

export const metadata = {
  title: "FOMO Firewall Docs — Exit-Liquidity Intel · Powered by Birdeye Data",
  description:
    "Developer documentation for the real-time Solana exit-liquidity intelligence system: architecture, Birdeye endpoint map, TrapScore engine, Telegram bot, browser extension, MCP tools."
};

const TOC = [
  { id: "introduction", label: "What FOMO Firewall does" },
  { id: "system-architecture", label: "System architecture" },
  { id: "endpoint-map", label: "Birdeye endpoint map" },
  { id: "trapscore-pipeline", label: "TrapScore pipeline" },
  { id: "surfaces", label: "Web, bot, extension" },
  { id: "quick-start", label: "Local development" },
  { id: "security", label: "Security model" },
  { id: "why", label: "Why this matters" }
];

export default function DocsPage() {
  return (
    <DocsShell
      breadcrumb={[
        { label: "FOMO Firewall Documentation", href: "/docs" },
        { label: "Overview" }
      ]}
      toc={TOC}
    >
      {/* Hero */}
      <header className="mb-10 border-b border-outline-variant/30 pb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-tertiary/30 bg-tertiary/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-tertiary">
          <BookOpen className="h-3 w-3" />
          v1 · Developer Docs
        </div>
        <h1 className="font-display-lg text-display-lg mb-3 tracking-tight text-on-surface">
          FOMO Firewall Docs
        </h1>
        <p className="font-headline-sm text-headline-sm mb-2 max-w-3xl text-on-surface-variant">
          Developer documentation for the real-time Solana{" "}
          <span className="text-primary">exit-liquidity intelligence</span>{" "}
          system, powered by Birdeye Data.
        </p>
        <p className="max-w-3xl text-sm leading-relaxed text-on-surface-variant">
          FOMO Firewall monitors trending Solana tokens and detects when price
          momentum is contradicted by smart-wallet selling, insider exit
          pressure, liquidity weakness, holder concentration, and token
          security risks. Every token receives a transparent TrapScore with
          evidence pinned to the originating Birdeye endpoint.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-outline-variant/40 bg-surface-container px-3 py-1.5 text-[13px] text-on-surface transition-colors hover:border-on-surface-variant"
          >
            <Copy className="h-3.5 w-3.5" /> Copy Markdown
          </button>
          <Link
            href="https://github.com/Sushant6095/fomo-firewall-birdeye"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-outline-variant/40 bg-surface-container px-3 py-1.5 text-[13px] text-on-surface transition-colors hover:border-on-surface-variant"
          >
            <Github className="h-3.5 w-3.5" /> Open GitHub
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-[13px] font-medium text-primary transition-colors hover:bg-primary/20"
          >
            <Rocket className="h-3.5 w-3.5" /> Launch App
          </Link>
        </div>

        <DocsCallout tone="warning" title="Not financial advice">
          FOMO Firewall does not provide buy/sell calls or financial advice. It
          provides risk intelligence and evidence so users can understand
          dangerous FOMO conditions.
        </DocsCallout>
      </header>

      {/* Section 1 — What it does */}
      <section id="introduction" className="mb-14 scroll-mt-24">
        <h2 className="font-headline-md text-headline-md mb-4 text-on-surface">
          What FOMO Firewall does
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-on-surface-variant">
          FOMO Firewall watches the same Solana trending feed that every entry
          tool watches — then asks a different question. Instead of{" "}
          <em>&quot;what should I buy?&quot;</em>, it asks{" "}
          <em className="text-on-surface">
            &quot;should I <strong>not</strong> be buying?&quot;
          </em>{" "}
          and answers with a transparent TrapScore plus evidence.
        </p>

        <div className="my-6 overflow-x-auto">
          <div className="flex min-w-[820px] items-stretch gap-2 font-mono text-[11px]">
            {[
              { label: "Trending Token", tone: "tertiary" },
              { label: "Birdeye Enrichment", tone: "tertiary" },
              { label: "Snapshot Storage", tone: "neutral" },
              { label: "Signal Detection", tone: "warning" },
              { label: "TrapScore", tone: "primary" },
              { label: "Alert · Case File", tone: "primary" }
            ].map((step, i, arr) => {
              const styles =
                step.tone === "primary"
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : step.tone === "warning"
                    ? "border-warning/40 bg-warning/10 text-warning"
                    : step.tone === "tertiary"
                      ? "border-tertiary/40 bg-tertiary/10 text-tertiary"
                      : "border-outline-variant/40 bg-surface-container text-on-surface";
              return (
                <React.Fragment key={step.label}>
                  <div className={`flex-1 rounded-lg border px-3 py-3 text-center ${styles}`}>
                    <span className="text-[10px] uppercase tracking-wider opacity-70">
                      Step {i + 1}
                    </span>
                    <div className="mt-1 font-semibold">{step.label}</div>
                  </div>
                  {i < arr.length - 1 ? (
                    <div className="flex items-center text-on-surface-variant">→</div>
                  ) : null}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <ul className="mt-4 grid grid-cols-1 gap-3 text-sm text-on-surface-variant md:grid-cols-2">
          {[
            "Watches the trending Solana token feed every cycle.",
            "Enriches each token using 6 Birdeye endpoints in parallel.",
            "Stores snapshots over time so deltas can be computed.",
            "Detects price-vs-flow contradictions (smart money flips).",
            "Generates TrapScore with reasons and evidence per signal.",
            "Powers the web dashboard, Telegram alerts, and browser extension."
          ].map((line) => (
            <li key={line} className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-tertiary" />
              {line}
            </li>
          ))}
        </ul>
      </section>

      {/* Section 2 — System Architecture */}
      <section id="system-architecture" className="mb-14 scroll-mt-24">
        <h2 className="font-headline-md text-headline-md mb-2 text-on-surface">
          System architecture
        </h2>
        <p className="mb-2 text-sm leading-relaxed text-on-surface-variant">
          Four delivery surfaces, one shared risk model, one Birdeye client,
          one shared DB. The boundary that matters:{" "}
          <code className="rounded bg-surface-container px-1 text-tertiary">
            BIRDEYE_API_KEY
          </code>{" "}
          never leaves the server. Web, bot, and extension all consume the
          same{" "}
          <code className="rounded bg-surface-container px-1 text-tertiary">
            /api/*
          </code>{" "}
          surface.
        </p>
        <ArchitectureFlow />
      </section>

      {/* Section 3 — Birdeye Endpoint Map */}
      <section id="endpoint-map" className="mb-14 scroll-mt-24">
        <h2 className="font-headline-md text-headline-md mb-2 text-on-surface">
          Birdeye endpoint map
        </h2>
        <p className="mb-2 text-sm leading-relaxed text-on-surface-variant">
          Every endpoint we use, what role it plays in the product, and which
          signal it generates. The principle: never display raw API output —
          every endpoint must feed a product signal.
        </p>
        <DocsEndpointTable />
        <DocsCodeBlock language="ts" title="enrich + score">{`const token          = await birdeye.getTokenOverview(address);
const txs            = await birdeye.getTokenTransactions(address);
const holderProfile  = await birdeye.getHolderProfile(address);
const holderPosition = await birdeye.getHolderPositions(address);
const topHolders     = await birdeye.getTopHolders(address);
const security       = await birdeye.getTokenSecurity(address);

const score = calculateTrapScore({
  overview: token,
  transactions: txs,
  holderProfile,
  holderPosition,
  topHolders,
  security
});

// → { trapScore, verdict, reasons[], evidence[] }
`}</DocsCodeBlock>
      </section>

      {/* Section 4 — TrapScore Pipeline */}
      <section id="trapscore-pipeline" className="mb-14 scroll-mt-24">
        <h2 className="font-headline-md text-headline-md mb-2 text-on-surface">
          TrapScore pipeline
        </h2>
        <p className="mb-2 text-sm leading-relaxed text-on-surface-variant">
          Seven independent signals, each weighted and capped. Their sum
          (clamped 0–100) is the TrapScore. The same signals produce the
          evidence reasons rendered in the case file.
        </p>
        <TrapScoreFlow />

        <h3 id="signal-weights" className="font-headline-sm text-headline-sm mt-6 mb-2 text-on-surface">
          Signal weights
        </h3>
        <DocsCodeBlock language="ts" title="trap-score.ts">{`TrapScore =
    smartMoneyDivergence       * 25
  + insiderExitPressure        * 20
  + liquidityFragility         * 15
  + sellPressureWhilePriceUp   * 15
  + holderConcentrationRisk    * 10
  + tokenSecurityRisk          * 10
  + abnormalVolumeLiquidityRatio * 5;

// clamped to [0, 100]
`}</DocsCodeBlock>

        <h3 id="verdict-system" className="font-headline-sm text-headline-sm mt-6 mb-2 text-on-surface">
          Verdict bands
        </h3>
        <p className="text-sm leading-relaxed text-on-surface-variant">
          A single number doesn&apos;t survive a screenshot. So every TrapScore
          comes with a verdict tier:
        </p>
        <ScoreBand />
      </section>

      {/* Section 5 — Surfaces */}
      <section id="surfaces" className="mb-14 scroll-mt-24">
        <h2 className="font-headline-md text-headline-md mb-2 text-on-surface">
          Product surfaces
        </h2>
        <p className="mb-2 text-sm leading-relaxed text-on-surface-variant">
          Same TrapScore. Three surfaces. All read from the same engine — pick
          whichever fits your workflow.
        </p>
        <ProductSurfaceGrid />

        <h3 id="telegram" className="font-headline-sm text-headline-sm mt-8 mb-2 text-on-surface">
          Telegram bot details
        </h3>
        <p className="mb-3 text-sm leading-relaxed text-on-surface-variant">
          Long-polls Telegram via grammy, replies in plain text (no Markdown
          to mangle), polls the in-memory DB every 30 seconds for new alerts
          and fans them out to subscribers via{" "}
          <code className="rounded bg-surface-container px-1 text-tertiary">
            db.listSubscribersFor(address)
          </code>
          .
        </p>
        <DocsCodeBlock language="text" title="commands">{`/start          show the help menu
/score <mint>   TrapScore + verdict + top 3 reasons + case file link
/watch <mint>   subscribe this chat to alerts for the token
/unwatch <mint> remove the subscription
/alerts         the 3 most recent Critical Trap + Exit Warning alerts`}</DocsCodeBlock>

        <h3 id="extension" className="font-headline-sm text-headline-sm mt-8 mb-2 text-on-surface">
          Browser extension details
        </h3>
        <p className="text-sm leading-relaxed text-on-surface-variant">
          Manifest V3 with content scripts injecting on{" "}
          <code className="rounded bg-surface-container px-1 text-tertiary">birdeye.so</code>,{" "}
          <code className="rounded bg-surface-container px-1 text-tertiary">dexscreener.com</code>,{" "}
          <code className="rounded bg-surface-container px-1 text-tertiary">solscan.io</code>,{" "}
          <code className="rounded bg-surface-container px-1 text-tertiary">pump.fun</code>,{" "}
          <code className="rounded bg-surface-container px-1 text-tertiary">jup.ag</code>. Never
          calls Birdeye directly — every request goes through{" "}
          <code className="rounded bg-surface-container px-1 text-tertiary">
            /api/token/[address]/score
          </code>{" "}
          on our backend.
        </p>

        <h3 id="mcp" className="font-headline-sm text-headline-sm mt-8 mb-2 text-on-surface">
          Agents / MCP tools
        </h3>
        <p className="text-sm leading-relaxed text-on-surface-variant">
          Two local MCP servers (Model Context Protocol) — read-only Birdeye
          proxy and pure-function TrapScore — let Claude Code agents query
          the engine during development without ever seeing the API key.
        </p>
      </section>

      {/* Section 6 — Local Development */}
      <section id="quick-start" className="mb-14 scroll-mt-24">
        <h2 className="font-headline-md text-headline-md mb-2 text-on-surface">
          Local development
        </h2>
        <p className="mb-2 text-sm leading-relaxed text-on-surface-variant">
          Three commands and you&apos;re running. Demo mode requires no Birdeye
          account.
        </p>
        <DocsCodeBlock language="bash" title="setup">{`pnpm install
cp .env.example .env.local
pnpm dev`}</DocsCodeBlock>

        <h3 id="env" className="font-headline-sm text-headline-sm mt-6 mb-2 text-on-surface">
          Environment variables
        </h3>
        <DocsCodeBlock language="env" title=".env.local">{`# Required for live mode (free tier works — 60 rpm)
BIRDEYE_API_KEY=

# Web app
NEXT_PUBLIC_APP_URL=http://localhost:8727
PORT=8727

# Optional knobs
BIRDEYE_RPS=0.9
FOMO_TRENDING_LIMIT=8
FOMO_DEMO_MODE=         # set to 1 to force fixture-only mode

# Database (Supabase impl forthcoming)
DATABASE_URL=

# Telegram bot
TELEGRAM_BOT_TOKEN=
TELEGRAM_ALERT_CHAT_ID=
BOT_API_BASE_URL=http://localhost:8727

# Extension
EXTENSION_API_BASE_URL=http://localhost:8727`}</DocsCodeBlock>
      </section>

      {/* Section 7 — Security Model */}
      <section id="security" className="mb-14 scroll-mt-24">
        <h2 className="font-headline-md text-headline-md mb-2 text-on-surface">
          Security model
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-on-surface-variant">
          Boundary enforcement at the file level, not by convention. CI checks
          fail the build if any rule is violated.
        </p>
        <DocsCallout tone="danger" title="Hard rules">
          <ul className="space-y-1.5">
            <li>
              Never expose{" "}
              <code className="rounded bg-surface-container-high px-1 text-error/90">
                BIRDEYE_API_KEY
              </code>{" "}
              in frontend code.
            </li>
            <li>Extension must call our backend, not Birdeye directly.</li>
            <li>MCP tools are local development helpers, not public production dependencies.</li>
            <li>No wallet signing.</li>
            <li>No trading execution.</li>
            <li>No financial advice claims.</li>
          </ul>
        </DocsCallout>
        <DocsCallout tone="safe" title="What's enforced in code">
          <ul className="space-y-1.5">
            <li>
              <code className="rounded bg-surface-container-high px-1">
                scripts/check-no-server-keys-in-client.mjs
              </code>{" "}
              greps every client bundle on every build.
            </li>
            <li>
              <code className="rounded bg-surface-container-high px-1">
                packages/db/src/client.ts
              </code>{" "}
              calls{" "}
              <code className="rounded bg-surface-container-high px-1">
                assertServerOnly()
              </code>{" "}
              at import time.
            </li>
            <li>
              MV3 manifest{" "}
              <code className="rounded bg-surface-container-high px-1">host_permissions</code>{" "}
              excludes Birdeye API hosts entirely.
            </li>
            <li>
              <code className="rounded bg-surface-container-high px-1">
                bot/src/__tests__/format.test.ts
              </code>{" "}
              asserts no buy/sell/ape language in alert text.
            </li>
          </ul>
        </DocsCallout>
      </section>

      {/* Section 8 — Why this architecture matters */}
      <section id="why" className="mb-14 scroll-mt-24">
        <h2 className="font-headline-md text-headline-md mb-2 text-on-surface">
          Why this architecture matters
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-on-surface-variant">
          Most dashboards display data. FOMO Firewall stores snapshots,
          calculates deltas, detects the contradiction between price action
          and wallet behavior, and turns Birdeye data into{" "}
          <span className="text-on-surface">
            explainable risk intelligence
          </span>{" "}
          — every score traces back to a specific endpoint and a specific
          observation.
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            {
              title: "Snapshots, not dashboards",
              body:
                "Without time-series storage you can't detect the moment smart wallets flip seller. We persist enriched snapshots so deltas matter."
            },
            {
              title: "Contradiction, not metrics",
              body:
                "Price up + smart-money out is the contradiction we hunt. A naive metrics dashboard never sees it."
            },
            {
              title: "Evidence, not opinion",
              body:
                "Every score pins to a Birdeye endpoint and a specific number. No black box, no LLM hallucinations."
            }
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-xl border border-outline-variant/40 bg-surface-container/40 p-4"
            >
              <h4 className="mb-1 text-sm font-semibold text-on-surface">
                {card.title}
              </h4>
              <p className="text-[13px] leading-relaxed text-on-surface-variant">
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/30 pt-6">
        <p className="font-mono text-[11px] text-on-surface-variant">
          FOMO Firewall · Exit-Liquidity Intelligence Terminal · Powered by
          Birdeye Data
        </p>
        <div className="flex items-center gap-3 text-[12px] text-on-surface-variant">
          <Link href="/" className="hover:text-on-surface">
            Open terminal
          </Link>
          <span className="text-on-surface-variant/40">·</span>
          <Link
            href="https://github.com/Sushant6095/fomo-firewall-birdeye"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-on-surface"
          >
            GitHub
          </Link>
          <span className="text-on-surface-variant/40">·</span>
          <Link
            href="https://t.me/fomo_firewall_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-on-surface"
          >
            Telegram bot
          </Link>
        </div>
      </footer>
    </DocsShell>
  );
}
