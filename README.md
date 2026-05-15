<div align="center">

<img src="apps/web/public/logo-pulse.svg" alt="FOMO Firewall" width="120" height="120" />

# **FOMO Firewall**

### Solana Exit-Liquidity Intelligence Terminal · Powered by Birdeye Data

[![Built on Birdeye](https://img.shields.io/badge/Built%20on-Birdeye%20Data-10B981?style=for-the-badge&labelColor=050D09)](https://birdeye.so)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&labelColor=050D09)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=for-the-badge&logo=typescript&labelColor=050D09)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&labelColor=050D09)](https://tailwindcss.com)
[![License MIT](https://img.shields.io/badge/License-MIT-A3E635?style=for-the-badge&labelColor=050D09)](#license)

---

> **Every other Solana tool answers: *"What should I buy?"***
> **FOMO Firewall answers: *"Should I _not_ be buying?"***

</div>

---

## The thesis

The crypto-tools market is saturated with **entry-discovery** products — token radars, whale trackers, copy-trading signals, trending boards. They all push you *toward* tokens. Smart wallets exit while retail chases the pump.

**FOMO Firewall inverts the question.** It watches the same on-chain feed every entry tool watches — and surfaces the moments when **smart wallets, dev-tagged addresses, and top holders are using retail as exit liquidity**. The product *is* the green shield. The traps are the threat.

Every verdict is a single number, four words, and **named evidence pinned to the exact Birdeye endpoint it came from** — never raw API output.

<table>
<tr>
<td align="center" width="25%">
<h3>🟢</h3><b>0–30</b><br/><sup>Clean Pump</sup>
</td>
<td align="center" width="25%">
<h3>🟡</h3><b>31–60</b><br/><sup>Risky Chase</sup>
</td>
<td align="center" width="25%">
<h3>🟠</h3><b>61–80</b><br/><sup>Exit Warning</sup>
</td>
<td align="center" width="25%">
<h3>🔴</h3><b>81–100</b><br/><sup>Critical Trap</sup>
</td>
</tr>
</table>

---

## Table of contents

- [Architecture at a glance](#architecture-at-a-glance)
- [Data flow — one full request lifecycle](#data-flow--one-full-request-lifecycle)
- [TrapScore — the 7 signals](#trapscore--the-7-signals)
- [The 5 product surfaces](#the-5-product-surfaces)
- [Repo map](#repo-map)
- [Quick start](#quick-start)
- [Live mode (real Birdeye data)](#live-mode-real-birdeye-data)
- [Tech stack](#tech-stack)
- [API reference](#api-reference)
- [Security boundaries](#security-boundaries)
- [What's currently live](#whats-currently-live)
- [Roadmap](#roadmap)
- [License](#license)

---

## Architecture at a glance

Four delivery surfaces, one shared risk model, one Birdeye client, one shared in-memory DB (Supabase-ready).

```mermaid
flowchart LR
    %% Sources
    B["fa:fa-cloud Birdeye Data API<br/>8 endpoints · 60 rpm free"]:::external

    %% Ingestion
    subgraph INGEST["Ingestion Layer (server-only)"]
      direction TB
      BC["packages/birdeye<br/>typed client · rate-limit · retry"]:::pkg
      EN["enrichToken()<br/>Promise.allSettled<br/>premium-gate tolerant"]:::pkg
      SC["packages/scoring<br/>7 signal calculators<br/>TrapScore + explain"]:::pkg
    end

    %% Storage
    DB[("packages/db<br/>FomoDb interface<br/>in-memory · supabase-ready")]:::db

    %% Surfaces
    subgraph SURFACES["Delivery Surfaces"]
      direction TB
      WEB["apps/web<br/>Next.js 15<br/>5 pages · 9 API routes"]:::app
      WORKER["apps/worker<br/>fetch → enrich → score → alert"]:::app
      BOT["apps/bot<br/>Telegram alerts"]:::app
      EXT["apps/extension<br/>MV3 popup + content script"]:::app
    end

    USR(["fa:fa-user User"]):::user

    %% Edges
    B -->|"X-API-KEY<br/>X-Chain: solana"| BC
    BC --> EN --> SC --> DB
    WORKER -.cron.-> BC
    DB --> WEB
    DB --> BOT
    DB --> EXT
    USR --> WEB
    USR --> BOT
    USR --> EXT

    %% styles
    classDef external fill:#0F1A14,stroke:#10B981,color:#E8F5E9
    classDef pkg      fill:#152119,stroke:#84CC16,color:#E8F5E9
    classDef db       fill:#1F2D24,stroke:#34D399,color:#E8F5E9
    classDef app      fill:#152119,stroke:#10B981,color:#E8F5E9
    classDef user     fill:#050D09,stroke:#A3E635,color:#A3E635
```

**Key boundary:** `BIRDEYE_API_KEY` is read only by `packages/birdeye` consumers running server-side. The web client bundle, the extension, and the Telegram bot **never** import that package. CI greps `apps/web/.next/static/**` and `apps/extension/dist/**` for the key on every build and fails on any hit.

---

## Data flow — one full request lifecycle

What happens when a user pastes a Solana mint into the Cmd-K spotlight:

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant N as Next.js (RSC + /api)
    participant SS as score-service.ts
    participant LI as live-ingestion.ts
    participant BD as Birdeye API
    participant DB as in-memory FomoDb
    participant T as sonner toast

    U->>N: ⌘K → paste mint → Enter
    N->>SS: getTokenScore(mint)
    SS->>DB: getLatestScore(mint)
    alt cached < 60s old
        DB-->>SS: StoredScoreRow
    else stale or missing
        SS->>LI: ensureSeeded() / refresh
        LI->>BD: trending + overview + txs + holders<br/>(throttled 0.9 rps · token-bucket)
        BD-->>LI: 6× endpoints (allSettled)
        LI->>LI: buildTrapInputs → calculateTrapScore
        LI->>DB: upsertToken · insertSnapshot · insertScore · insertAlertIfNew
        DB-->>SS: fresh StoredScoreRow
    end
    SS-->>N: TokenRiskRow + reasons + evidence
    N-->>U: /case-file/[mint] renders<br/>(NumberTicker, OrbitingCircles, BorderBeam)
    N-->>T: toast.success("Live data")
```

Every step above is a real production code path — no mocking, no stubbed fetches. The ingestion runs **inside** the Next.js process so the in-memory DB is shared with all `/api/*` routes (no IPC needed for the dev demo; swap to Supabase for prod without changing surface code).

---

## TrapScore — the 7 signals

TrapScore = clamped sum of seven independent contributions, each capped per the table below. **A signal can only fire if its data prerequisites are met** — premium-gated endpoints (401 on free tier) downgrade gracefully instead of crashing the run.

```mermaid
flowchart TB
    SS["Smart Money Divergence<br/>cap 25"]:::s1
    IE["Insider Exit Pressure<br/>cap 18"]:::s2
    LF["Liquidity Fragility<br/>cap 18"]:::s3
    SP["Sell Pressure While Green<br/>cap 12"]:::s4
    HC["Holder Concentration Risk<br/>cap 12"]:::s5
    SE["Static Token Risk<br/>cap 10"]:::s6
    VL["Abnormal Vol/Liq Ratio<br/>cap 5"]:::s7

    SS & IE & LF & SP & HC & SE & VL --> SUM(("Σ clamp 0–100"))
    SUM --> V{"verdict band"}

    V -->|"81–100"| CR["🔴 Critical Trap"]:::cr
    V -->|"61–80"|  EW["🟠 Exit Warning"]:::ew
    V -->|"31–60"|  RC["🟡 Risky Chase"]:::rc
    V -->|"0–30"|   CP["🟢 Clean Pump"]:::cp

    classDef s1 fill:#7F1D1D,stroke:#EF4444,color:#fff
    classDef s2 fill:#92400E,stroke:#F97316,color:#fff
    classDef s3 fill:#854D0E,stroke:#F59E0B,color:#fff
    classDef s4 fill:#365314,stroke:#84CC16,color:#fff
    classDef s5 fill:#14532D,stroke:#22C55E,color:#fff
    classDef s6 fill:#064E3B,stroke:#10B981,color:#fff
    classDef s7 fill:#022C22,stroke:#34D399,color:#fff
    classDef cr fill:#7F1D1D,stroke:#EF4444,color:#fff,stroke-width:2px
    classDef ew fill:#92400E,stroke:#F97316,color:#fff,stroke-width:2px
    classDef rc fill:#854D0E,stroke:#F59E0B,color:#fff,stroke-width:2px
    classDef cp fill:#064E3B,stroke:#22C55E,color:#fff,stroke-width:2px
```

| # | Signal | Cap | Powered by | Reads from |
|---|---|---:|---|---|
| 1 | **Smart Money Divergence** | 25 | Smart wallets net-sell while price climbs | `/defi/v3/token/txs` + `/token/v1/holder-profile` |
| 2 | **Insider Exit Pressure** | 18 | Dev/insider-tagged wallets reduce exposure | `/token/v1/holder-positions` + `/defi/v3/token/txs` |
| 3 | **Liquidity Fragility** | 18 | Liquidity contracts while price climbs | `/defi/token_overview` |
| 4 | **Sell Pressure While Green** | 12 | Sell volume rising on a green candle | `/defi/token_overview` |
| 5 | **Holder Concentration Risk** | 12 | Top 10 hold too much supply | `/defi/v3/token/holder` |
| 6 | **Static Token Risk** | 10 | Mint/freeze authority, mutable metadata | `/defi/token_security` |
| 7 | **Abnormal Vol/Liq Ratio** | 5 | Volume far outpaces liquidity | `/defi/token_overview` |

Each signal returns a typed `SignalResult` with `severity`, `headline`, `reason`, and a `evidence[]` array. The case-file UI renders these **directly** — nothing is fabricated by the frontend, nothing is tooltip-only.

> Implementation lives in [`packages/scoring/src/signals.ts`](packages/scoring/src/signals.ts) and [`trap-score.ts`](packages/scoring/src/trap-score.ts).

---

## The 5 product surfaces

| Route | Page | Answers the question |
|---|---|---|
| **`/`** | Terminal Home | *What's dangerous right now?* — hero, live ticker marquee, featured Critical Trap, signal-counts bento, recent alerts |
| **`/board`** | Threat Board | *Show every monitored token, filterable.* TanStack-style table, URL-driven verdict filter tabs, KPI strip, right peek drawer |
| **`/signals`** | Signal Matrix | *How does each of the 7 signals look across the entire set?* Tabbed analytics, confidence gauge, concentration heatmap |
| **`/case-file/[mint]`** | Token Case File | *Why is this specific token a trap?* Radial score gauge, evidence log, tactical timeline, security flags, action bar |
| **`/alerts`** | Alerts & Watchlist | *What fired recently and what am I watching?* Interactive watchlist with real `POST/DELETE`, threshold slider PATCHing prefs |

Every page is a **server component** that fetches via [`score-service.ts`](apps/web/lib/server/score-service.ts) — no client-side waterfalls, no SWR/React Query, no skeletons-then-data flicker. First-paint is always real DB data.

Visual language: **dark emerald canvas, `#10B981` primary, `#84CC16` lime accent, critical red `#EF4444` reserved exclusively for traps.** SF Pro on Apple devices, Inter elsewhere.

---

## Repo map

```
fomo-firewall-birdeye/
├─ apps/
│  ├─ web/                Next.js 15 dashboard · 5 pages · 9 API routes · MagicUI bundle
│  ├─ worker/             Standalone ingestion daemon (also runs inline in web for dev)
│  ├─ bot/                Telegram bot — grammy framework
│  └─ extension/          Manifest V3 browser extension (esbuild → dist/)
├─ packages/
│  ├─ birdeye/            Server-only Birdeye client · token-bucket rate-limit · retry · normalize
│  ├─ scoring/            7-signal TrapScore engine · pure functions · explain layer
│  ├─ db/                 FomoDb interface · in-memory driver · Supabase-ready
│  ├─ shared/             Cross-surface types · TrapVerdict · AlertRecord · env helpers
│  ├─ ui/                 Shared design system · 17 components · framer-motion · fixtures
│  └─ agents/             Rule-based analyst summary generator (deterministic, no LLM)
├─ mcp/
│  ├─ birdeye-mcp/        Read-only Birdeye MCP server (stdio JSON-RPC)
│  └─ scoring-mcp/        Pure-function TrapScore MCP server
├─ docs/                  architecture · birdeye endpoint map · product spec · demo script
└─ scripts/               smoke tests · CI guards (e.g. check-no-server-keys-in-client)
```

---

## Quick start

Three commands. No Birdeye account needed for demo mode.

```bash
# 1. Install everything
pnpm install

# 2. Seed the in-memory DB with rich fixtures (DOGX, NOVA, MOONX…)
pnpm --filter @fomo/worker dev:demo

# 3. Start the terminal
pnpm --filter @fomo/web dev
#    → http://localhost:3000
```

Open the dashboard, watch the Terminal Wire animate alerts in, click any token to dive into its Case File, hit `⌘K` to spotlight-search.

---

## Live mode (real Birdeye data)

```bash
# 1. Get a key (free tier = 60 rpm, 5 of 7 signals work)
#    → https://docs.birdeye.so/docs/authentication-api-keys

# 2. Copy env template and paste your key
cp .env.example .env
#    BIRDEYE_API_KEY=...
#    BIRDEYE_RPS=0.9              # Strictly under 1 rps for free-tier safety
#    FOMO_TRENDING_LIMIT=8        # 8 tokens × ~5 endpoints = ~40s per cycle

# 3. Either run the standalone worker (separate terminal) …
pnpm --filter @fomo/worker dev

# 3b. … or just start the web app — it auto-ingests on first request
pnpm --filter @fomo/web dev
```

The web app has an inline ingestion runner at [`apps/web/lib/server/live-ingestion.ts`](apps/web/lib/server/live-ingestion.ts). On cold-start, if the DB is empty and `BIRDEYE_API_KEY` is set, it pulls the current Solana trending feed, enriches each token, scores it, and persists — all inside the Next.js process so the in-memory DB stays consistent across `/api/*` routes.

**Free-tier note:** `/defi/token_security` is Premium-only and returns 401. The pipeline catches it via `Promise.allSettled`, emits a warning, and continues — Static Token Risk just scores 0 on those tokens. Five other signals still fire.

A pulsing **🟢 LIVE · Birdeye** pill in the top-right confirms ingestion is real. Click it to force a fresh cycle.

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15** (App Router) | RSC + streaming + native API routes — one box for UI + backend |
| Language | **TypeScript strict** | Boundary contracts (Birdeye → DB → UI) all typed |
| Styling | **Tailwind 3.4** + tokens | Emerald-Sentinel design system in [`tailwind.config.ts`](apps/web/tailwind.config.ts) |
| Components | **shadcn/ui + 21st.dev / MagicUI** | 25 hand-tuned primitives in [`apps/web/app/_components/ui/magicui.tsx`](apps/web/app/_components/ui/magicui.tsx) |
| Motion | **framer-motion 11** | Variants tied to product state, not decoration |
| Search | **cmdk** | ⌘K spotlight backed by `/api/search` |
| Toast | **sonner** | Every mutation produces feedback |
| Charts | **recharts** + custom SVG | Sparklines, area, concentration heatmap |
| Rate limit | **TokenBucketRateLimiter** (custom) | 0.9 rps for Birdeye free tier |
| Retry | **withRetry + exponential backoff** | 429 + 5xx retried, 4xx surfaced |
| DB | **In-memory FomoDb** (Supabase-ready) | Single shared instance on `globalThis` for dev |
| Build | **Turborepo + pnpm workspaces** | Incremental builds, shared deps |
| Browser ext | **Manifest V3 + esbuild** | MV3 service worker + content script bundle |
| Bot | **grammy** (Telegram) | Typed Bot API client |
| MCP | **Custom stdio servers** | Read-only Birdeye + pure TrapScore MCP |

---

## API reference

| Route | Method | Purpose |
|---|---|---|
| `/api/tokens/trending-risk` | GET | Live TrapScore feed (paginated) |
| `/api/token/[address]/score` | GET | Single-token deep query |
| `/api/alerts/recent` | GET | Deduped alert stream |
| `/api/search?q=` | GET | Cmd-K spotlight backing |
| `/api/watchlist` | GET / POST | List or add a watched mint |
| `/api/watchlist/[address]` | DELETE | Stop watching a mint |
| `/api/user/alert-prefs` | GET / PATCH | TrapScore threshold, dedup window, quiet hours |
| `/api/extension/block/[address]` | GET / POST | Toggle a mint in the extension blocklist |
| `/api/worker/run` | POST | Manually trigger a Birdeye ingestion cycle |
| `/api/source/status` | GET | `{ hasKey, mode, sampleSymbol, lastRun }` — drives LIVE/DEMO badge |

---

## Security boundaries

Concrete, file-level enforcement — not just convention:

| Boundary | Enforced by |
|---|---|
| `BIRDEYE_API_KEY` never reaches a client bundle | Read only in [`apps/worker/src/env.ts`](apps/worker/src/env.ts), [`apps/web/lib/server/live-ingestion.ts`](apps/web/lib/server/live-ingestion.ts), and [`mcp/birdeye-mcp/server.ts`](mcp/birdeye-mcp/). CI script [`scripts/check-no-server-keys-in-client.mjs`](scripts/) greps `apps/web/.next/static/**` and `apps/extension/dist/**` on every build and fails on any hit |
| `SUPABASE_SERVICE_ROLE_KEY` never client-side | `packages/db/src/client.ts` calls `assertServerOnly()` at import time |
| Extension never calls Birdeye | Popup + content script call only `${EXTENSION_API_BASE_URL}/api/token/[address]/score`. Manifest host permissions exclude Birdeye API hosts entirely |
| Worker `/run` endpoint | [`apps/worker/src/server.ts`](apps/worker/src/server.ts) requires `x-worker-secret` header, constant-time compare against `WORKER_SECRET` |
| MCP servers | Read-only by construction; audit log per call; arg hash only, never raw addresses or secrets |
| No wallet signing / trading / buy / sell language | Non-negotiable; `bot/src/__tests__/format.test.ts` asserts no `buy/sell/ape` in alert text |

---

## What's currently live

- 🟢 **Live Birdeye ingestion** verified on `2026-05-15` — pulled real Solana mints `$EOS`, `$PONKE`, `$GIGA`, `$BURNIE` in a 56-second cycle with 8 scored, 8 alerts fired
- 🟢 **All 5 web routes** return real DB data, not fixtures (Cmd-K spotlight + watchlist mutations + threshold slider all hit real `/api/*` endpoints)
- 🟢 **LIVE / DEMO badge** in the top app bar — pulses green when Birdeye is wired, click to trigger manual refresh
- 🟢 **Premium gating** handled gracefully — `/defi/token_security` 401s become warnings, snapshot still builds
- 🟢 **Rate limit respected** — token bucket strictly capped at 0.9 rps (54 rpm) on the 60 rpm free tier
- 🟡 **In-memory DB** — no persistence across web restarts yet; Supabase impl is the next adapter
- 🟡 **Telegram bot + extension** scaffolded but not yet load-tested end-to-end against the live API

---

## Roadmap

- [x] Birdeye client with rate-limit + retry
- [x] 7-signal TrapScore engine + plain-English explainer
- [x] Worker ingestion pipeline (fetch → enrich → score → alert)
- [x] 5-page Next.js terminal with 21st.dev / MagicUI primitives
- [x] Live ingestion bridged into Next.js process
- [x] Cmd-K spotlight backed by `/api/search`
- [x] Interactive watchlist + alert preferences (real API mutations)
- [x] LIVE/DEMO badge + manual refresh endpoint
- [x] Three logo variants (Shield Sentinel, Hex Sentinel, Pulse Shield)
- [ ] Supabase driver behind `FomoDb` interface (persistence across restarts)
- [ ] Telegram bot end-to-end against live API
- [ ] Browser extension consuming `/api/extension/block/[address]`
- [ ] Historical TrapScore series (`/api/token/[address]/score-history`)
- [ ] Production deployment (Vercel for `apps/web`, Fly.io for `apps/worker`)
- [ ] Mobile-responsive 4-col → 1-col grid pass

---

## Hard rules

- **Never expose `BIRDEYE_API_KEY`** to a client bundle. Period.
- **All Birdeye calls run server-side**, rate-limited, retried.
- **No wallet connection. No trading. No financial advice.**
- **Every score must be explainable** with reasons and evidence pinned to the originating Birdeye endpoint.

---

## License

MIT — see [LICENSE](LICENSE).

---

<div align="center">

**Built on [Birdeye Data](https://birdeye.so) · designed for traders who want to <i>not</i> get rugged.**

</div>
