# FOMO Firewall — Browser Extension

A lightweight risk overlay and popup checker for Solana tokens. Reads the active page for a mint address, fetches a TrapScore from the FOMO Firewall backend, and renders the same verdict language used by the web dashboard.

## What it does

- **Popup**: paste any Solana mint address and run a TrapScore. Shows the verdict, top 3 reasons, and links into the full Token Case File.
- **Content script**: on supported sites (Birdeye, DexScreener, DexTools, Solscan, Pump.fun, Jup), detects the active token address and injects a non-invasive TrapScore badge in the bottom-right corner.
- **Service worker**: routes case-file open intents to the web app. Nothing else.

## Security rules

The extension **must** follow these:

- **Never** include `BIRDEYE_API_KEY`. The extension never calls Birdeye directly.
- All scoring goes through `EXTENSION_API_BASE_URL/api/token/[address]/score`.
- Minimum permissions — `activeTab`, `storage`, and a small set of host permissions for supported token pages.
- DOM mutations are scoped to the single injected `#ff-badge-root` node.
- Reduced motion is respected (the loading pulse is disabled when the user prefers reduced motion).

## File layout

```
apps/extension/
  manifest.json
  popup.html
  src/
    popup.tsx              # Popup mount point
    content.ts             # Content script — detects tokens + injects badge
    background.ts          # Service worker — routes intents
    styles.css             # Shared popup + badge styles (verdict tones)
    components/
      extension-popup.tsx   # React popup UI
      detected-token-badge.tsx  # HTML builder used by the content script
```

## Install (developer mode)

```bash
# 1. From the repo root, install all workspaces.
pnpm install

# 2. Build the extension. Output lands in apps/extension/dist/.
pnpm --filter @fomo/extension build
# or, for live rebuilds while you iterate:
pnpm --filter @fomo/extension dev

# 3. Make sure the FOMO Firewall backend is running so the popup has an API to call.
pnpm --filter @fomo/web dev
```

In Chrome:

1. Open `chrome://extensions`.
2. Toggle **Developer Mode** on.
3. Click **Load unpacked** and select `apps/extension/dist/` (not the `apps/extension/` root).
4. Click the FOMO Firewall icon in the toolbar.
5. Paste an address from the dashboard's Risk Board — e.g. `DoGxJTRP7nKpRrjEYRr7nT9hZqEqL8mTjYR4hM7N2ZpL` for the demo `$DOGX` Critical Trap.

`dist/` contents after a successful build:

```
dist/
  manifest.json   # MV3 manifest
  popup.html      # popup shell, loads popup.js + styles.css
  popup.js        # bundled React popup
  content.js      # content-script badge injector
  background.js   # service worker
  styles.css      # shared popup + badge styles (verdict-toned)
```

## Visual language

The extension mirrors the dashboard verdict palette so screenshots and demo videos read as one product:

| Verdict        | Color  |
| -------------- | ------ |
| Clean Pump     | green  |
| Risky Chase    | amber  |
| Exit Warning   | orange |
| Critical Trap  | red    |

See `packages/ui/src/design-tokens.ts` for the source of truth.
