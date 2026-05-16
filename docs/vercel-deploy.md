# Deploying on Vercel

Step-by-step + live-mode upgrade. For the short version, see the [main README](../README.md#deploying-on-vercel).

## One-click button (demo mode)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSushant6095%2Ffomo-firewall-birdeye&env=FOMO_DEMO_MODE,BIRDEYE_API_KEY,BIRDEYE_RPS,FOMO_TRENDING_LIMIT&envDescription=Demo%20mode%20%3D%20rich%20fixtures%2C%20no%20Birdeye%20account%20needed.%20Set%20FOMO_DEMO_MODE%3D1%20OR%20provide%20a%20free-tier%20Birdeye%20key%20for%20live%20data.&envLink=https%3A%2F%2Fdocs.birdeye.so%2Fdocs%2Fauthentication-api-keys&project-name=fomo-firewall&repository-name=fomo-firewall-birdeye)

This is the fastest path. Click → Vercel handles GitHub fork + monorepo build + deploy. Fills in `FOMO_DEMO_MODE=1` to start; you can flip to live mode later with one env var change.

## What Vercel sees

[`vercel.json`](../vercel.json) at the repo root configures:

```json
{
  "framework": "nextjs",
  "buildCommand": "pnpm --filter @fomo/web build",
  "installCommand": "pnpm install --frozen-lockfile=false",
  "outputDirectory": "apps/web/.next",
  "regions": ["iad1"]
}
```

Plus per-route function timeouts (Pro plan):

| Route | Max duration |
|---|---|
| `/api/worker/run` | 60s — full Birdeye ingestion cycle |
| `/api/source/status` | 60s — may trigger ensureSeeded() on cold start |
| `/api/tokens/trending-risk` | 60s — may trigger ensureSeeded() |
| `/api/alerts/recent` | 30s |
| `/api/token/[address]/score` | 30s |
| All others | 10s (Vercel default) |

Plus a cron job that hits `/api/worker/run` daily at noon UTC. The daily schedule is the **Hobby-tier cap** (one fire per day); Pro users should bump it to `*/15 * * * *` for 15-min refreshes:

```json
"crons": [{ "path": "/api/worker/run", "schedule": "0 12 * * *" }]
```

### Cron schedule by plan

| Plan | Max frequency | Recommended schedule |
|---|---|---|
| **Hobby** | Once per day | `0 12 * * *` (noon UTC — current default) |
| **Pro** | Unlimited | `*/15 * * * *` (every 15 min — keeps DB warm with fresh Birdeye data) |
| **Enterprise** | Unlimited | `*/5 * * * *` (every 5 min if you want near-real-time) |

Edit `vercel.json` → `crons[0].schedule` → commit → push. Vercel re-reads on next deploy.

## Environment variables

### Required for live mode

| Variable | Example | Notes |
|---|---|---|
| `BIRDEYE_API_KEY` | `290087fa...d5c16` | Free tier (60 rpm) works for 5 of 7 signals. Premium unlocks `holder-profile`, `holder-positions`, `token_security` |

### Optional knobs

| Variable | Default | Notes |
|---|---|---|
| `FOMO_DEMO_MODE` | (empty) | Set to `1` to force fixture-only seeding. Demos work without a Birdeye key |
| `BIRDEYE_BASE_URL` | `https://public-api.birdeye.so` | Override for self-hosted Birdeye proxies |
| `BIRDEYE_CHAIN` | `solana` | Birdeye supports other chains; this product targets Solana |
| `BIRDEYE_RPS` | `0.9` | Token-bucket rate cap. Stay strictly under 60 rpm to leave retry headroom |
| `FOMO_TRENDING_LIMIT` | `8` | Tokens per ingestion cycle. 8 × ~5 endpoints ≈ 37s wall time |

### Not used on Vercel (yet)

| Variable | Why ignored |
|---|---|
| `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | The Supabase driver behind `FomoDb` is the next milestone — currently the in-memory driver is hardcoded |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ALERT_CHAT_ID` | The Telegram bot is a separate long-running process — deploy to Fly.io / Railway / Render, not Vercel |
| `WORKER_SECRET` | The standalone worker's `/run` HTTP endpoint isn't deployed via Vercel — the inline web ingestion replaces it for the Vercel deploy |
| `EXTENSION_API_BASE_URL` | Used only by `apps/extension`, which loads as a browser MV3 extension |

## Plan tier matrix

| | Hobby (free) | Pro | Enterprise |
|---|---|---|---|
| Max function duration | 10s | 60s (configurable to 300s in `vercel.json`) | 900s |
| Demo mode | ✅ Instant | ✅ Instant | ✅ Instant |
| Live Birdeye ingestion (~45s) | ❌ Times out | ✅ Works | ✅ Works |
| Cron jobs | ✅ Daily only (`0 12 * * *` default) | ✅ Up to every 15 min — change schedule in `vercel.json` | ✅ Unlimited |
| Recommended for | Showcase / portfolio demo | Live demo / staging | Production with custom regions |

## Step-by-step manual deploy

If the one-click button doesn't work for your setup (e.g. you want a private fork):

```bash
# 1. Fork or clone into your own GitHub
gh repo fork Sushant6095/fomo-firewall-birdeye --clone
cd fomo-firewall-birdeye

# 2. Install Vercel CLI
npm i -g vercel

# 3. Login
vercel login

# 4. Link to a new Vercel project
vercel link
# → answers: scope=your-team, project=fomo-firewall, link to existing? No

# 5. Set env vars (production scope)
vercel env add FOMO_DEMO_MODE production
# → paste: 1

# OR for live mode:
vercel env add BIRDEYE_API_KEY production
# → paste your key from docs.birdeye.so

# 6. Deploy
vercel --prod
# → outputs the live URL
```

## Verifying after deploy

1. Open the live URL Vercel gives you (e.g. `fomo-firewall-<hash>.vercel.app`)
2. Click the **LIVE / DEMO** pill in the top-right
   - 🟢 **LIVE** = `BIRDEYE_API_KEY` is set and ingestion succeeded
   - 🟡 **DEMO** = `FOMO_DEMO_MODE=1` or no key
3. Paste a Solana mint into Cmd-K → search should return results
4. Click `/case-file/<mint>` → radial gauge populates with TrapScore + reasons + evidence
5. Verify `/api/source/status` returns `{ "mode": "live" | "fixture", "tokensInDb": >0 }`

## Flipping from demo to live (no redeploy needed)

1. Vercel dashboard → your project → **Settings → Environment Variables**
2. Remove `FOMO_DEMO_MODE` (or set it empty)
3. Add `BIRDEYE_API_KEY` = your key from [docs.birdeye.so](https://docs.birdeye.so/docs/authentication-api-keys)
4. Hit **Redeploy** on the latest deployment (or just push a commit — Vercel auto-redeploys)
5. The LIVE pill should turn green within a minute, and the marquee will show real Solana mints

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Function exceeded the 10s timeout` on `/api/worker/run` | Hobby plan with live mode | Either upgrade to Pro, or set `FOMO_DEMO_MODE=1` |
| Watchlist add doesn't persist across reloads | In-memory DB resets between lambda containers | Expected behavior — Supabase driver is the next milestone |
| LIVE pill shows DEMO even with `BIRDEYE_API_KEY` set | Cold-start ingestion still in progress | Wait 60s and reload, or check `/api/source/status` directly |
| Build fails: `Cannot find module '@fomo/birdeye'` | Vercel ran `npm install` instead of `pnpm install` | Confirm `installCommand` in `vercel.json` is intact. Vercel auto-detects pnpm from `pnpm-lock.yaml` |
| Build fails: `tsc` errors in `packages/*` | Vercel doesn't build workspace deps | `pnpm --filter @fomo/web build` cascades through workspace deps via Turbo. Make sure root `package.json` has `"packageManager": "pnpm@..."` |
| `Hobby accounts are limited to daily cron jobs` build error | Cron schedule fires more than once per day | Hobby is capped at daily. Default is `0 12 * * *`. To fire more often, upgrade to Pro and change the schedule in `vercel.json` |
| Cron not firing on schedule | Cron is set up in vercel.json but Vercel needs a deploy to register it | Push any commit. Vercel re-registers crons on every deployment. Verify in Vercel dashboard → Settings → Cron Jobs |

## Cost expectations

For a typical demo:

| Scenario | Vercel cost | Birdeye cost |
|---|---|---|
| Demo mode (no Birdeye key) | $0 — well under Hobby free-tier limits | $0 |
| Live mode w/ 15-min cron, 100 daily visitors | $0 — under Pro free-tier ($20/mo included credits) | $0 — free tier 60 rpm × 96 cron runs/day = ~6500 calls, well under monthly free quota |
| Live mode at scale (1000+ daily visitors, real users) | ~$20/mo Pro plan baseline | Premium tier may be needed for `holder-profile` signals |

For the hackathon submission: **Hobby + demo mode = $0 forever**. Click the button, paste a Birdeye key when you want live data, done.
