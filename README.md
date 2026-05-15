# FOMO Firewall

> Entry tools tell you when smart money enters.
> **FOMO Firewall tells you when smart money is using the crowd as exit liquidity.**

A real-time Solana exit-liquidity detector powered by Birdeye Data. FOMO
Firewall watches trending tokens and flags pumps where **smart wallets,
insiders, dev-tagged wallets, or top holders are selling into retail FOMO**.

Every score is a **TrapScore (0–100)** with a verdict, reasons, and evidence
pulled from specific Birdeye endpoints — never raw API output.

| TrapScore | Verdict        | Color  |
| --------- | -------------- | ------ |
| 0–30      | Clean Pump     | green  |
| 31–60     | Risky Chase    | amber  |
| 61–80     | Exit Warning   | orange |
| 81–100    | Critical Trap  | red    |

## Three surfaces, one risk model

- **Web dashboard** — Trending Pump Risk Board, Token Case File, Alerts, Compare.
- **Telegram bot** — `/score`, `/watch`, `/alerts`, and auto-dispatched alerts.
- **Browser extension** — popup checker + non-invasive on-page TrapScore badge.

All three surfaces read the same TrapScore from the same engine.

## Repo map

```
apps/
  web/         Next.js dashboard, API routes, server components.
  worker/      Ingestion pipeline: trending → enrich → score → persist → alert.
  bot/         Telegram bot (grammy) — commands + automatic alert dispatch.
  extension/   MV3 browser extension (esbuild → dist/).
packages/
  birdeye/     Server-only Birdeye client (rate-limit, retry, normalize, enrich).
  scoring/     TrapScore engine — 7 signals, evidence, explainer.
  db/          Database surface: in-memory driver today, Supabase-ready interface.
  shared/      Cross-surface types: TrapInputs, AlertRecord, EnrichedSnapshot.
  ui/          Shared design system (17 React components + Framer Motion + fixtures).
  agents/      Rule-based analyst summaries.
mcp/
  birdeye-mcp/ Read-only Birdeye MCP server (stdio JSON-RPC).
  scoring-mcp/ Pure-function TrapScore MCP server.
```

Schema lives at `packages/db/migrations/0001_init.sql`.

## Quick start (demo mode — no Birdeye account needed)

```bash
pnpm install

# Run the worker once against fixture data — populates the in-memory DB so
# the dashboard, bot, and extension all show the same Risk Board.
pnpm --filter @fomo/worker dev:demo

# Start the dashboard.
pnpm --filter @fomo/web dev
# → http://localhost:3000
```

Open the dashboard, click a Critical Trap row, watch the evidence drawer
explain why.

## Live mode (with Birdeye)

```bash
# In .env (server-side only):
BIRDEYE_API_KEY=...

# Run one live ingestion pass.
pnpm --filter @fomo/worker dev

# Or run the long-lived HTTP /run server for a cron schedule.
WORKER_SECRET=... pnpm --filter @fomo/worker serve
# Trigger from cron: curl -X POST -H "x-worker-secret: $WORKER_SECRET" http://localhost:4001/run
```

Add the Telegram bot:

```bash
pnpm --filter @fomo/bot add grammy   # one-time
TELEGRAM_BOT_TOKEN=...               # in .env
TELEGRAM_ALERT_CHAT_ID=...           # optional broadcast channel
pnpm --filter @fomo/bot dev
```

Build the browser extension:

```bash
pnpm --filter @fomo/extension build
# → load apps/extension/dist/ via chrome://extensions (Developer Mode)
```

## How TrapScore works

The score is the clamped sum of seven independent signals, each capped:

| Signal                          | Cap | Powered by Birdeye endpoint                              |
| ------------------------------- | --: | -------------------------------------------------------- |
| Smart Money Divergence          |  25 | `/defi/v3/token/txs` + `/token/v1/holder-profile`        |
| Insider Exit Pressure           |  18 | `/token/v1/holder-positions` + `/defi/v3/token/txs`      |
| Liquidity Fragility             |  18 | `/defi/token_overview`                                   |
| Sell Pressure While Green       |  12 | `/defi/token_overview`                                   |
| Holder Concentration Risk       |  12 | `/defi/v3/token/holder`                                  |
| Security Risk                   |  10 | `/defi/token_security`                                   |
| Abnormal Volume / Liquidity     |   5 | `/defi/token_overview`                                   |

Every signal returns a `SignalResult` with `severity`, `headline`, `reason`,
and a typed `evidence[]`. The UI's evidence drawer renders these directly —
nothing is fabricated by the front-end.

Implementation: `packages/scoring/src/signals.ts` and `trap-score.ts`.

## Security boundaries

Concrete file-level enforcement:

| Boundary                                                              | Enforced by                                                                                                                  |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `BIRDEYE_API_KEY` never enters a client bundle                        | Read only in `apps/worker/src/env.ts` and `mcp/birdeye-mcp/server.ts`. CI script `scripts/check-no-server-keys-in-client.mjs` greps `apps/web/.next/static/**` and `apps/extension/dist/**` and fails the build on any hit. |
| `SUPABASE_SERVICE_ROLE_KEY` never client-side                          | `packages/db/src/client.ts` calls `assertServerOnly()` at import time.                                                       |
| Extension never calls Birdeye                                          | Extension popup + content script only call `${EXTENSION_API_BASE_URL}/api/token/[address]/score`. Manifest host permissions exclude Birdeye API hosts. |
| Worker `/run` endpoint                                                 | `apps/worker/src/server.ts` requires `x-worker-secret` header, constant-time compare against `WORKER_SECRET`.                |
| MCP servers                                                            | Read-only by construction; audit log per call; arg hash only, never raw addresses or secrets.                                |
| No wallet signing / trading / buy / sell language                      | CLAUDE.md non-negotiable; `bot/src/__tests__/format.test.ts` asserts no `buy/sell/ape` in alert text.                          |

## Tests

```bash
pnpm -r typecheck
pnpm --filter @fomo/birdeye test
pnpm --filter @fomo/scoring test
pnpm --filter @fomo/worker test
pnpm --filter @fomo/bot test
```

Covered:

- Birdeye payload normalization (golden fixtures per endpoint + edge cases).
- Token-bucket rate limiter burst + refill behavior.
- TrapScore per-verdict tier + per-signal isolation + edge cases.
- `EnrichedSnapshot → TrapInputs` conversion.
- Full worker pipeline (score, persist, alert, dedupe).
- Alert format (verdict emoji, top-3 reasons, no buy/sell language).
- Alert dispatch (subscriber + broadcast fan-out, delivery dedupe).

## Hackathon positioning

Previous winning products optimize **entry**: smart wallet entries, whale
activity, copy signals, token scanners, rug checks.

FOMO Firewall optimizes the opposite axis: **exit-risk intelligence**.

The same Birdeye payload that powers a trending dashboard powers TrapScore —
we just ask a different, harder question of it:

> *Is this pump safe to chase, or am I becoming exit liquidity?*

## Hard rules

- Never expose `BIRDEYE_API_KEY` to a client bundle.
- All Birdeye calls run server-side, rate-limited and retried.
- No wallet connection. No trading. No financial advice.
- Every score must be explainable with reasons and evidence.

## Where to look first

- `docs/product-spec.md` — what the product is.
- `docs/architecture.md` — how surfaces fit together.
- `docs/birdeye-endpoint-map.md` — which endpoint powers which signal.
- `docs/ui-system.md` — the shared design language.
- `docs/demo-script.md` — the 30-second walkthrough.
- `docs/qa-redteam-review.md` — every gap we audited, ranked by severity.
- `docs/no-gap-scorecard.md` — the 40/40 judging checklist.
