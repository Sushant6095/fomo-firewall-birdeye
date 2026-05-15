# FOMO Firewall — Telegram Bot

A risk-intelligence companion. Same vocabulary, same TrapScore, same evidence as the web dashboard — delivered to Telegram instead of a browser tab.

## Commands

- `/start` — explain FOMO Firewall and list commands.
- `/score <mint>` — current TrapScore + top 3 reasons + case-file link.
- `/watch <mint>` — subscribe to alerts for one token.
- `/unwatch <mint>` — unsubscribe.
- `/alerts` — most recent high-risk alerts (Critical Trap + Exit Warning).
- `/help` — same as `/start`.

## Automatic alerts

Every 30 seconds the bot pulls fresh alert rows from the FOMO Firewall DB and fans them out to:

1. Each subscriber who runs `/watch <mint>`.
2. (Optional) a single broadcast channel via `TELEGRAM_ALERT_CHAT_ID`.

Each alert row carries a `dedupe_key` so the same alert is never delivered twice — even if the bot restarts mid-loop.

## Architecture

- The bot **calls our backend** at `BOT_API_BASE_URL/api/token/<mint>/score` and `…/api/alerts/recent`. It **never** calls Birdeye directly.
- `TELEGRAM_BOT_TOKEN` is read only inside `apps/bot` (server-side). It is never echoed in logs.
- Alerts persist in the in-memory DB (hackathon) or Supabase (production) via `@fomo/db`. The same surface backs the web app and the extension.

## Files

```
apps/bot/
  README.md
  package.json
  tsconfig.json
  src/
    index.ts           # boot entrypoint
    client.ts          # grammy bot wiring (long-poll)
    api.ts             # fetchScore, fetchRecentAlerts, caseFileUrl
    format.ts          # formatTrapAlert + formatAlertRecord + HELP_TEXT
    commands/
      score.ts
      watch.ts
      recent.ts
    alerts/
      dispatch.ts      # subscriber fan-out + dedupe
    __tests__/
      run.ts           # tsx runner
      format.test.ts
      dispatch.test.ts
```

## Running locally

```bash
# 1. Install grammy (required for live bot, optional for tests).
pnpm --filter @fomo/bot add grammy

# 2. Set env (in repo root .env).
export TELEGRAM_BOT_TOKEN=...
export BOT_API_BASE_URL=http://localhost:3000

# 3. Start the bot.
pnpm --filter @fomo/bot dev
```

If the bot starts with no token it logs `"[bot] no TELEGRAM_BOT_TOKEN — bot disabled"` and exits cleanly. The rest of the system keeps working.

## Tests

```bash
pnpm --filter @fomo/bot test
```

Covers:

- `format.test.ts` — canonical alert template, verdict emoji, no buy/sell language, top-3 reason cap.
- `dispatch.test.ts` — fan-out to subscribers + broadcast chat, dedupe via `delivered_telegram` flag.
