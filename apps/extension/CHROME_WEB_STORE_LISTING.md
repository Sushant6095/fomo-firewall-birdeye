# Chrome Web Store Listing — copy/paste ready

This file is the canonical source for everything you need to enter into the
Chrome Web Store Developer Dashboard. Each section below maps to one field
in the CWS form.

> **Before you submit:** the web app must be deployed to Vercel (or any
> public HTTPS host) so that the URLs in this listing resolve. The
> placeholder URL `https://fomo-firewall-birdeye.vercel.app` is baked into
> the extension build and the manifest — update [build.mjs](build.mjs)
> + [manifest.json](manifest.json) if your deployment lands at a different
> domain, then rebuild and re-zip.

---

## Item · Name

```
FOMO Firewall
```

## Item · Short description (132 chars max)

```
Solana exit-liquidity intelligence. See when smart wallets, insiders, and top holders are using retail FOMO as exit liquidity.
```

(131 chars — within limit.)

## Item · Detailed description

```
FOMO Firewall is a Solana exit-liquidity intelligence overlay.

Every other crypto tool answers "what should I buy?" — FOMO Firewall answers "should I NOT be buying?" It scans the token pages you're already browsing on Birdeye, DexScreener, Solscan, pump.fun, Jupiter, and DexTools, and overlays a transparent TrapScore (0–100) with a verdict tier and named evidence.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHAT TRAPSCORE DETECTS

TrapScore is the weighted sum of seven independent signals, each computed server-side from public Solana on-chain data:

▸ Smart Money Divergence — smart wallets net-selling into a green candle
▸ Insider Exit Pressure — dev/insider-tagged wallets reducing exposure
▸ Liquidity Fragility — liquidity contracting while price climbs
▸ Sell Pressure While Green — sell volume rising on bullish bars
▸ Holder Concentration Risk — top 10 wallets controlling supply
▸ Static Token Risk — mint/freeze authority, mutable metadata
▸ Abnormal Vol/Liq Ratio — volume far outpacing liquidity

Each signal returns reasons and evidence pinned to the exact Solana data source it came from — never raw API output, never opaque scoring.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VERDICT TIERS

🟢  0–30  Clean Pump        Move along, nothing structurally wrong
🟡  31–60 Risky Chase       Mixed signal — watch closely
🟠  61–80 Exit Warning      Smart money fleeing — exit pattern forming
🔴  81–100 Critical Trap    High-probability rug or coordinated dump

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HOW IT WORKS

1. You browse a Solana token on any supported site (Birdeye, DexScreener, Solscan, pump.fun, Jupiter, DexTools).
2. FOMO Firewall detects the mint address on the active tab when you click the toolbar icon.
3. The popup shows a TrapScore, verdict, top three reasons, and a link to the full Case File on the web dashboard.
4. The extension calls only our backend — never Birdeye directly. Your wallet is never touched.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRIVACY & SECURITY

✓ No accounts. No wallet connection. No login.
✓ No advertising. No third-party analytics. No data sale.
✓ Watchlist and preferences stay in chrome.storage.local on your device.
✓ The Birdeye API key is server-only — never exposed to the extension.
✓ Source code is open at github.com/Sushant6095/fomo-firewall-birdeye

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHAT FOMO FIREWALL IS NOT

✗ Not investment advice. TrapScore is a heuristic risk score, not a recommendation.
✗ Not a trading bot. No swap execution, no wallet signing, no custody.
✗ Not a wallet. We never request your private keys or seed phrase.
✗ Not a paid product. Free, open-source, MIT-licensed.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LINKS

• Web dashboard: https://fomo-firewall-birdeye.vercel.app
• Source code:   https://github.com/Sushant6095/fomo-firewall-birdeye
• Privacy:       https://fomo-firewall-birdeye.vercel.app/privacy
• Terms:         https://fomo-firewall-birdeye.vercel.app/terms

Powered by Birdeye Data.
```

## Item · Category

```
Productivity
```

(Alternatives that also fit: *Developer Tools*, *News*.)

## Item · Language

```
English
```

---

## Privacy practices · Single purpose

```
FOMO Firewall computes an on-chain risk score (TrapScore) for Solana tokens. Its single purpose is to surface that score, the verdict tier, and the supporting evidence on the token pages a user is browsing.
```

## Privacy practices · Permission justifications

### `activeTab`

```
When the user clicks the toolbar icon, the extension reads the URL of the currently active tab to detect a Solana token mint address (e.g. on birdeye.so/token/<MINT> or solscan.io/token/<MINT>). The extension does not access other tabs, browsing history, or page content beyond the URL pattern of the active tab.
```

### `storage`

```
The extension stores the user's watchlist of tokens and alert threshold preferences in chrome.storage.local on the user's device. Nothing is transmitted to remote servers. The user can clear it at any time by uninstalling the extension or via Chrome site settings.
```

### Host permission · `https://birdeye.so/*`

```
Content script injects on Birdeye token pages to detect mint addresses in the URL and render a non-invasive TrapScore badge near the price chart. The badge is a one-way display — the extension does not modify Birdeye's UI or interact with its forms.
```

### Host permission · `https://dexscreener.com/*`

```
Content script injects on DexScreener token pages for the same purpose: detect mint addresses and render a TrapScore badge. Read-only DOM detection — no form submission, no DOM mutation outside the badge container.
```

### Host permission · `https://www.dextools.io/*`

```
Same as above — detect mint, render badge, no interaction with DexTools' UI or user data.
```

### Host permission · `https://solscan.io/*`

```
Same as above — Solscan token pages get a TrapScore badge for the active mint.
```

### Host permission · `https://pump.fun/*`

```
Same as above — pump.fun token pages get a TrapScore badge. Critical for early-stage tokens where exit-liquidity patterns surface fastest.
```

### Host permission · `https://jup.ag/*`

```
Same as above — Jupiter swap interface gets a TrapScore preview before the user initiates any swap. The extension does NOT interact with Jupiter's wallet connection, swap router, or transaction signing. It only reads the URL.
```

### Host permission · `https://fomo-firewall-birdeye.vercel.app/*`

```
The extension calls the FOMO Firewall backend at this domain to fetch TrapScore for the detected mint. This is the only outbound network call the extension makes. Birdeye and other external APIs are never called directly from the extension — that boundary keeps the Birdeye API key server-side.
```

### Remote code use

```
The extension does NOT load any remote code (no eval, no remote scripts, no dynamic imports from URLs). All JavaScript is bundled at build time via esbuild and shipped in the .zip you reviewed.
```

### Data collection disclosure

| Data type | Collected? | Used for | Sold? | Shared? |
|---|---|---|---|---|
| Personally identifiable information (name, email, address, phone, age) | No | — | No | No |
| Health information | No | — | No | No |
| Financial info (credit cards, etc.) | No | — | No | No |
| Authentication info (passwords, credentials, security questions) | No | — | No | No |
| Personal communications (emails, texts, chats) | No | — | No | No |
| Location | No | — | No | No |
| Web history | No | — | No | No |
| User activity (clicks, mouse position, scroll) | No | — | No | No |
| Website content (text, images, audio, video, files, links) | No | — | No | No |

(Tick the "I do not collect any of the above" checkbox on the form.)

### Compliance certifications (single checkbox on form)

- [x] I do not sell or transfer user data to third parties, outside of approved use cases
- [x] I do not use or transfer user data for purposes unrelated to the item's single purpose
- [x] I do not use or transfer user data to determine creditworthiness or for lending purposes

### Privacy policy URL

```
https://fomo-firewall-birdeye.vercel.app/privacy
```

---

## Listing assets

### Icon (128×128) — already in the zip

`apps/extension/dist/icons/icon-128.png` — generated from the Pulse Shield logo.

### Screenshots (1280×800 or 640×400, at least one, up to five)

Suggested screenshot order:

1. **Hero shot** — extension popup open over a Birdeye token page, showing a Critical Trap verdict with reasons. Drives the value prop in one glance.
2. **Case file deep-dive** — the web dashboard's `/case-file/[mint]` page with the TrapScore orbit, evidence log, and timeline. Shows the depth behind a single mint.
3. **Threat board** — the `/board` page filtered to Critical Trap, with multiple tokens visible. Shows scale.
4. **Signal matrix** — the `/signals` page with the 7-signal breakdown. Shows the model.
5. **Telegram bot** — a Telegram chat showing the bot replying to `/score <mint>` with a formatted Critical Trap card. Shows the multi-channel story.

**Capture command** (after deploying):

```bash
# Open each in Chrome at 1280×800 viewport, then ⌘+Shift+4 to drag-snap a region.
open https://fomo-firewall-birdeye.vercel.app/
open https://fomo-firewall-birdeye.vercel.app/case-file/DoGxJTRP7nKpRrjEYRr7nT9hZqEqL8mTjYR4hM7N2ZpL
open https://fomo-firewall-birdeye.vercel.app/board
open https://fomo-firewall-birdeye.vercel.app/signals
```

### Small promo tile (440×280) — optional

Suggested: the Pulse Shield logo centred on the dark emerald background with the wordmark "FOMO Firewall" + tagline "Exit-Liquidity Intelligence" below. A 440×280 export of [public/logo-pulse.svg](../web/public/logo-pulse.svg) on a `#070B1A` canvas with the wordmark works.

### Marquee promo tile (1400×560) — optional, helps with featured placement

Suggested: a wide composition with the Pulse Shield mark on the left, the wordmark + tagline centred, and a screenshot of the Critical Trap card on the right.

---

## Submission flow

1. https://chrome.google.com/webstore/devconsole → **New item**
2. Upload `fomo-firewall-extension-v1.0.0.zip` (created by `pnpm zip`)
3. Fill **Store listing** tab — paste from sections above
4. Fill **Privacy practices** tab — paste from sections above
5. Fill **Distribution** tab — choose **Public** and the regions
6. Upload screenshots + icon (icon is read from manifest automatically but they may ask for a clean 128 PNG)
7. **Save draft**, review the preview
8. **Submit for review**

## Timeline expectations

- Review queue: **3–7 days** for first-time submissions
- Common review questions: justifying `activeTab` + each host permission (already written above)
- After approval: listing goes live at `chrome.google.com/webstore/detail/<extension-id>`. The ID is permanent and shows up in your developer dashboard

## After approval

- Update the README with the live Chrome Web Store install button
- Update the `apps/web/app/_components/home-channels-cta.tsx` so the
  Extension card's primary action is "Install from Chrome Web Store"
  (currently it's a "Copy install commands" → unpacked load flow)
- Notify any judges / users that the install is now one click

## When you need to ship an update

1. Bump `version` in [manifest.json](manifest.json) (e.g. `1.0.1`)
2. `pnpm build && pnpm zip`
3. In CWS dashboard → your item → **Package** → upload new zip → **Submit for review**
4. Updates typically clear review in **1–2 days** (faster than the initial review)
