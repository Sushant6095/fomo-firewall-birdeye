# QA Red Team Review — FOMO Firewall

Reviewer: ruthless hackathon judge mode.
Scorecard: `docs/no-gap-scorecard.md` (40/40 target).
Date: 2026-05-14.

The product positions itself as a **Solana exit-liquidity detector** — a
TrapScore for pumps with reasons + evidence — across web, Telegram, and a
browser extension. The review below ranks every gap I'd dock points for, the
exact file(s) to change, and an explicit acceptance criterion per item.

## Severity scale

- **P0** — would fail the demo or fail security review. Fix before submission.
- **P1** — would visibly cost score points. Fix if time allows.
- **P2** — polish; reasonable to defer.

---

## P0 — Submission blockers

### P0-1 Live data path is not bound to a real Birdeye account in the demo
The worker pipeline, scoring, alerts, and dashboard all work end-to-end **on
fixtures**. With `BIRDEYE_API_KEY` set, the worker hits Birdeye, persists
snapshots, and the dashboard reads them — but no judge will see that path
unless we either (a) ship a 30-second clip of the live ingestion in the demo
video, or (b) write a setup snippet in the README that lets them run it.

- Files: `README.md`, `docs/demo-script.md`, `apps/worker/README.md` (new).
- Acceptance:
  - README has a 4-step "run live" block with the env vars in copy-pasteable form.
  - The demo script's 30-second walkthrough flags the moment we cut from
    fixtures to live data.
  - `pnpm --filter @fomo/worker dev` runs against `BIRDEYE_API_KEY` and writes
    rows to the in-memory DB visibly (already true; needs the doc).

### P0-2 Web build does not yet have a CI check that `BIRDEYE_API_KEY` cannot leak to the client bundle
The dashboard, extension popup, and content script never import `@fomo/birdeye`,
but there's nothing automated stopping a future contributor from doing so.

- Files: `scripts/check-no-server-keys-in-client.mjs` (new), `package.json`
  (top-level `check:secrets` script).
- Acceptance:
  - Script greps `apps/web/.next/static/**` and `apps/extension/dist/**` for
    the literal strings `BIRDEYE_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
    `TELEGRAM_BOT_TOKEN`. Non-zero exit on any hit.
  - Top-level `pnpm check:secrets` runs after `pnpm build`.

### P0-3 The Telegram bot requires `grammy` to actually deliver messages, but it isn't installed
The bot package handles the missing module gracefully (logs and exits), but a
judge running `pnpm --filter @fomo/bot dev` would see "grammy not installed".

- Files: `apps/bot/package.json`.
- Acceptance:
  - Either add `grammy` as a `dependencies` entry, or document the install
    step prominently in `apps/bot/README.md` and the top-level README.
  - `dispatch.test.ts` and `format.test.ts` continue to pass without grammy.

---

## P1 — Visible during demo, costs points

### P1-1 Demo video does not include the extension cameo yet
The extension exists, builds to `dist/`, and the popup is screenshot-ready,
but the demo script ends at the Telegram alert. A 4-second extension shot
turns "3-surface product" from a README claim into a watched fact.

- Files: `docs/demo-script.md`.
- Acceptance: Demo script step 7 reads "Load extension, paste $DOGX address,
  show the same Critical Trap verdict and the case-file deep link."

### P1-2 Token Case File page uses fixtures even when the DB has data
`apps/web/app/token/[address]/page.tsx` calls `fixtureByAddress(address)`
directly. The score API route already prefers DB → fixture — the case file
page should follow the same precedence.

- Files: `apps/web/app/token/[address]/page.tsx`, optionally
  `apps/web/lib/server/score-service.ts` for a `getCaseFileData()` helper.
- Acceptance:
  - When the worker has populated the DB, the case file shows DB-sourced
    snapshot fields with a small "live data" badge.
  - When no DB row exists, it falls back to fixtures (current behavior).

### P1-3 `apps/web/app/api/token/[address]/score/route.ts` returns *different shapes* for DB vs fixture
DB responses include `reasons` shaped as `ScoreReason[]`; fixture responses
include the legacy `evidence: EvidenceItem[]` array. Bot/extension consumers
have to branch.

- Files: `apps/web/app/api/token/[address]/score/route.ts`,
  `apps/web/lib/server/score-service.ts`.
- Acceptance:
  - Both paths return `{ reasons, evidence, analystSummary, source }` with
    `reasons` always shaped as `ScoreReason[]` and `evidence` always as
    `EvidenceItem[]` (empty when not available).
  - The bot's `commands/score.ts` and the extension popup type the response
    once and stop branching.

### P1-4 No HTTP-level test for the API routes
The pipeline + bot + scoring all have unit tests. The API routes don't, so we
have no automated proof that `GET /api/tokens/trending-risk` returns a valid
payload after the worker runs.

- Files: `apps/web/scripts/smoke-api.mjs` (new) or
  `apps/web/__tests__/api.test.ts`.
- Acceptance:
  - Smoke script starts the Next.js server, calls each route, asserts the
    response includes `tokens.length > 0` and `tokens[0].verdict in [...]`.

### P1-5 Recent Alerts column on the dashboard renders zero items when DB seed is fresh but `delivered_telegram` flips for everything
The bot's `dispatchAlerts` marks `delivered_telegram = true` once delivered.
The Recent Alerts component reads `listRecentAlerts(limit)` and shows what's
there — but the seed sets `deliveredTelegram = false`, then the bot's dispatch
loop (when running) flips them. There's no bug, just confusion if the bot is
running before a demo recording.

- Files: `apps/web/app/page.tsx` (display logic), optional read from
  `getDb().listRecentAlerts(...)` regardless of delivered flag.
- Acceptance:
  - The dashboard's `AlertFeed` shows alerts even after the bot has marked
    them delivered. (It already does — confirm in QA pass.)

### P1-6 Worker test runs but doesn't assert idempotence across two passes
We assert dedupe in `pipeline.test.ts`, but we don't assert that re-running
the whole pipeline twice (snapshot → score → alert) twice in a row produces
exactly **one** alert per (token, type, bucket).

- Files: `apps/worker/src/__tests__/pipeline.test.ts`.
- Acceptance:
  - New test: run `scoreAndPersist + detectAlerts` twice with the same
    snapshots, assert the second pass adds 0 new alert rows.

---

## P2 — Polish, defer if time-boxed

### P2-1 Extension does not yet have icons
Manifest has no `icons` field. Chrome shows a default puzzle piece.

- Files: `apps/extension/icons/{16,32,48,128}.png` (new),
  `apps/extension/manifest.json` (add `icons` block), `build.mjs` (already
  copies an `icons/` dir if present).
- Acceptance: Toolbar icon shows the FOMO Firewall flame.

### P2-2 `packages/scoring/explain.ts` always uses the same verdict opener
The analyst summary reads the same way for every Critical Trap. A small
randomization over 2–3 openers per verdict would make 5 case files in a row
feel less templated.

- Files: `packages/scoring/src/explain.ts`.
- Acceptance: 5 case files in a row use at least 2 distinct openers per
  verdict.

### P2-3 No "what changed since last snapshot" data on the case file
`db.getLatestScore` returns the latest; we never surface the previous one. A
"TrapScore +21 since 1h ago" pill on the case file would make the dynamic
nature of the product obvious from a single screenshot.

- Files: `apps/web/lib/server/score-service.ts`,
  `apps/web/components/token-case-file.tsx`.
- Acceptance: Case file header shows a `ScoreDeltaPill` when previous-score
  data is available.

### P2-4 `docs/architecture.md` is minimal
Currently a paragraph. Should match the file-level plan in `01-architect.md`.

- Files: `docs/architecture.md`.
- Acceptance: Document includes data-flow diagram, table list, surface list,
  security boundaries (mirrors what we already wrote in the 01 prompt
  response).

---

## Coverage check vs `docs/no-gap-scorecard.md`

**Product Utility — projected 9/10** (loses 1 pt for P0-1 demo gap until README adds the live-run snippet).

- ✅ Token table with instant verdicts (Risk Board)
- ✅ Token case file explains why
- ✅ Telegram bot sends actionable alerts (after grammy install)
- ✅ Extension lets users check risk while browsing
- ✅ No wallet setup required
- ⚠ Reject criteria: passes — does not feel like a generic scanner, does
  surface verdicts, does not just show raw API output.

**Technical Depth — projected 10/10** once P0-1/P0-2/P1-3 land.

- ✅ Birdeye client with rate-limit + retry + normalize + enrich
- ✅ TrapScore with 7 signals, evidence, per-signal severity
- ✅ DB schema + in-memory implementation + Supabase-ready interface
- ✅ Worker pipeline with structured logging + run table
- ✅ Alert dedupe via bucketed timestamps + unique key
- ✅ MCP servers exposing only read-only tools
- ⚠ Add CI key-leak gate (P0-2) to claim 10/10 here.

**Presentation — projected 9.5/10** once the extension shot lands in the demo.

- ✅ Premium dark command-center UI
- ✅ Screenshot-readable surfaces (dashboard, case file, alerts, compare)
- ✅ Extension popup + content badge mirror the dashboard
- ⚠ Demo video needs the extension cameo (P1-1).

**Community Support — projected 9/10** (deferred phase; we ship the
shareable-artifact primitives but not the leaderboard).

- ✅ Copyable alert text
- ✅ "Clean Pump vs Critical Trap" comparison page exists
- ✅ Token case files double as shareable screenshots
- ⚠ Daily leaderboard is not built (acceptable per scorecard's "later phase"
  note).

## Final readiness estimate

**37.5 / 40** — with P0-1 (README live-run block), P0-2 (CI key-leak gate),
P0-3 (grammy install path), and P1-1 (extension demo step) all addressed in
Prompt 10 polish, the score rises to **39 / 40**. The remaining 1 point is
held by the absence of an auto-generated daily leaderboard, which the
scorecard explicitly defers.

The Prompt 10 polish pass should close every P0 above.
