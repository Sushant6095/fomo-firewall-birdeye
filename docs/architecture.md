# FOMO Firewall — Architecture

## Surfaces

| Surface          | Stack                              | Reads                                |
| ---------------- | ---------------------------------- | ------------------------------------ |
| Web dashboard    | Next.js 15 + Tailwind + Radix      | `@fomo/db` via server components / API routes |
| Telegram bot     | grammy (long-poll / webhook)       | FOMO Firewall web API + `@fomo/db`   |
| Browser extension| MV3, esbuild → `dist/`             | FOMO Firewall web API                |

All three surfaces share `packages/ui` for visual language and `packages/shared`
for typed contracts.

## Backend

| Service            | Role                                                                |
| ------------------ | ------------------------------------------------------------------- |
| `apps/worker`      | Scheduled ingestion: trending → enrich → score → persist → alert.   |
| `apps/web` API     | Read-only HTTP API consumed by extension, bot, server components.   |
| `packages/birdeye` | Server-only Birdeye client (rate-limit + retry + normalize).        |
| `packages/scoring` | TrapScore engine (7 signals, evidence, explainer).                  |
| `packages/db`      | Database surface (in-memory driver; Supabase impl planned).         |
| `mcp/*`            | Read-only MCP servers for Claude Code / Cursor.                     |

## Data flow

```
                 ┌─────────────────────────────────────────┐
                 │ apps/worker                             │
                 │   1. fetchTrending() → 25 addresses     │
                 │   2. enrichBatch()  → EnrichedSnapshot[]│
                 │   3. scoreAndPersist() → TrapScoreResult│
                 │   4. detectAlerts() → AlertRecord[]     │
                 └────────────────┬────────────────────────┘
                                  │ writes (server-only)
                                  ▼
                 ┌─────────────────────────────────────────┐
                 │ packages/db                             │
                 │   tokens / token_snapshots /            │
                 │   token_scores / token_alerts /         │
                 │   watchlists / ingestion_runs           │
                 └────────────────┬────────────────────────┘
                                  │ reads
                  ┌───────────────┼─────────────────┐
                  ▼               ▼                 ▼
         ┌──────────────┐ ┌──────────────┐ ┌───────────────┐
         │ apps/web     │ │ apps/bot     │ │ apps/extension│
         │  /, /alerts, │ │  /score      │ │  popup +      │
         │  /compare,   │ │  /watch      │ │  badge        │
         │  /token/[..] │ │  /alerts     │ │               │
         │  + API rts   │ │  + dispatch  │ │  (calls API)  │
         └──────────────┘ └──────────────┘ └───────────────┘
```

## Database schema

Defined in `packages/db/migrations/0001_init.sql`.

| Table              | Purpose                                                                  |
| ------------------ | ------------------------------------------------------------------------ |
| `tokens`           | Unique mint addresses with first/last-seen timestamps.                   |
| `token_snapshots`  | Per-pass price/liquidity/volume + raw overview JSON.                     |
| `holder_snapshots` | Top-10 holder %, smart/insider netflow, raw holder JSON.                 |
| `trade_windows`    | Buy/sell volume buckets, large-trade counts, raw txs JSON.               |
| `token_scores`     | TrapScore + verdict + reasons[] + analyst_summary.                       |
| `token_alerts`     | Verdict-threshold alerts, unique `dedupe_key`.                           |
| `ingestion_runs`   | Run-level metadata + errors[].                                           |
| `watchlists`       | Telegram chat ↔ token subscription.                                      |

## Trust boundaries

| Boundary                                       | Enforced where                                                                                                                                       |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Browser → Birdeye                              | **Forbidden.** No client component imports `@fomo/birdeye`. Manifest host permissions exclude Birdeye API hosts.                                     |
| `BIRDEYE_API_KEY` reaches a static bundle      | CI script `scripts/check-no-server-keys-in-client.mjs` greps `apps/web/.next/static/**` and `apps/extension/dist/**` for the literal; fails on hit.  |
| `SUPABASE_SERVICE_ROLE_KEY` client-side import | `packages/db/src/client.ts` calls `assertServerOnly()` at import time; throws if `window` is defined.                                                |
| Worker `/run` open to the internet             | `apps/worker/src/server.ts` requires `x-worker-secret`, constant-time compare.                                                                       |
| MCP server side-effects                        | Read-only by construction. Audit log per call (sha256-prefixed arg hash, never raw addresses or secrets).                                            |
| Bot delivering the same alert twice            | `token_alerts.dedupe_key` unique constraint + `delivered_telegram` flag flipped at dispatch time.                                                    |
| Birdeye blowing through rate limits            | Token-bucket limiter (`BIRDEYE_RPS`, default 8) + exponential backoff with jitter on 429/5xx.                                                        |

## Development tooling

- `CLAUDE.md` — root operating manual.
- `.claude/skills/uiux-promax/` — premium UI/UX guidance referenced by every
  frontend prompt.
- `.claude/skills/fomo-*` — product, web, extension, scoring, bot, Birdeye,
  qa-redteam, presentation skills.
- `.claude/commands/` — slash commands wrapping the above skills.
- `prompts/` — staged build prompts (00 master → 10 polish).
- `mcp/*-mcp/` — local-only MCP servers for Birdeye and scoring.

## Recommended ingestion cadence

| Surface          | Frequency | Notes                                                  |
| ---------------- | --------- | ------------------------------------------------------ |
| Worker (live)    | 60 s      | One `runIngestion()` pass per minute.                  |
| Bot dispatch     | 30 s      | Polls for new alerts; idempotent via `delivered_telegram`. |
| Dashboard SSR    | 15 s      | `revalidate = 15` on `/`, `/alerts`, `/compare`.       |
| Extension content| on-load   | Single fetch per page navigation; no polling.          |
