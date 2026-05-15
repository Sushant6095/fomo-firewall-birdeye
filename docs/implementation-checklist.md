# Implementation Checklist

Final state after Prompts 00–10.

## Phase 1 — Core data and score

- [x] Birdeye client wrappers (`packages/birdeye/src/client.ts`)
- [x] Rate-limit + retry (`packages/birdeye/src/rate-limit.ts`, `retry.ts`)
- [x] Normalize layer (`packages/birdeye/src/normalize.ts`)
- [x] Mock fixtures (`packages/birdeye/src/mock-fixtures.ts`)
- [x] TrapScore 7 signals (`packages/scoring/src/signals.ts`)
- [x] Per-tier + per-signal tests (`packages/scoring/src/__tests__/`)
- [x] DB schema migration (`packages/db/migrations/0001_init.sql`)

## Phase 2 — Ingestion

- [x] Fetch trending (`apps/worker/src/pipeline/fetch-trending.ts`)
- [x] Enrich tokens with `pLimit(5)` (`apps/worker/src/pipeline/enrich-batch.ts`)
- [x] Score + persist (`apps/worker/src/pipeline/score-and-persist.ts`)
- [x] Detect alerts + dedupe (`apps/worker/src/pipeline/detect-alerts.ts`)
- [x] Orchestrator + structured logs (`apps/worker/src/index.ts`, `log.ts`)
- [x] HTTP `/run` endpoint with `WORKER_SECRET` (`apps/worker/src/server.ts`)
- [x] Worker pipeline tests (`apps/worker/src/__tests__/pipeline.test.ts`)

## Phase 3 — Web

- [x] Dashboard (`apps/web/app/page.tsx`) — Server Component reads `@fomo/db`.
- [x] Token Case File (`apps/web/app/token/[address]/page.tsx`)
- [x] Alerts feed (`apps/web/app/alerts/page.tsx`)
- [x] Compare page (`apps/web/app/compare/page.tsx`)
- [x] Score explanation drawer (`packages/ui/src/components/evidence-drawer.tsx`)
- [x] API routes — `/api/token/[address]/score`, `/api/tokens/trending-risk`, `/api/alerts/recent`.
- [x] Server-only adapter (`apps/web/lib/server/score-service.ts`)

## Phase 4 — Bot

- [x] `/score` (`apps/bot/src/commands/score.ts`)
- [x] `/watch`, `/unwatch` (`apps/bot/src/commands/watch.ts`)
- [x] `/alerts` (`apps/bot/src/commands/recent.ts`)
- [x] Canonical alert format with verdict emoji (`apps/bot/src/format.ts`)
- [x] Auto-dispatch with subscriber + broadcast fan-out (`apps/bot/src/alerts/dispatch.ts`)
- [x] Dedupe via `delivered_telegram` flag (covered by `dispatch.test.ts`)

## Phase 5 — Extension

- [x] Popup risk checker (`apps/extension/src/components/extension-popup.tsx`)
- [x] Content-script address detection + badge (`apps/extension/src/content.ts`)
- [x] esbuild bundler (`apps/extension/build.mjs`)
- [x] Service worker route handler (`apps/extension/src/background.ts`)

## Phase 6 — Final polish

- [x] Top-level README rewritten.
- [x] Architecture document updated with data flow + trust boundaries.
- [x] Demo script with extension cameo + recording checklist.
- [x] Screenshot checklist (`docs/screenshot-checklist.md`).
- [x] Secret-leak CI gate (`scripts/check-no-server-keys-in-client.mjs`).
- [x] QA red-team review (`docs/qa-redteam-review.md`).
- [x] `.env.example` complete.
- [x] MCP servers (read-only, audit-logged).

## Verification commands

```bash
pnpm install
pnpm -r typecheck
pnpm --filter @fomo/birdeye  test
pnpm --filter @fomo/scoring  test
pnpm --filter @fomo/worker   test
pnpm --filter @fomo/bot      test
pnpm --filter @fomo/web      build
pnpm --filter @fomo/extension build
pnpm check:secrets
```
