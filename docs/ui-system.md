# FOMO Firewall — UI System

This document explains the shared UI stack that powers `apps/web`, `apps/extension`, and any future surface (e.g. Telegram screenshot cards).

## Stack

- **Framework:** Next.js 15 (App Router) with React 19.
- **Styling:** Tailwind CSS 3 with `tailwindcss-animate`. Dark-first via the `:root` HSL tokens in `apps/web/app/globals.css`.
- **Primitives:** shadcn-style components built on Radix (`@radix-ui/react-{dialog,tabs,tooltip,progress,scroll-area,dropdown-menu,slot}`). Co-located at `apps/web/components/ui/`.
- **Variants:** `class-variance-authority` + `tailwind-merge` via the `cn()` helper.
- **Motion:** `framer-motion` 11. Shared presets live in `packages/ui/src/motion.ts`.
- **Icons:** `lucide-react`.
- **Charts:** `recharts` (heavy charts); native SVG `MiniSparkline` for inline trends.
- **Toasts:** `sonner` (added but only enabled per-screen — no global noise).

## Design system

- Source of truth for verdict tones and severity tones: `packages/ui/src/design-tokens.ts`.
- HSL CSS variables for the web app: `apps/web/app/globals.css`.
- Mirrored verdict palette for the extension: `apps/extension/src/styles.css`.

See `.claude/skills/uiux-promax/references/design-system.md` for the design vocabulary (colors, typography, spacing, cards, icons, hierarchy).

## Component structure

```
packages/ui/
  src/
    design-tokens.ts         # verdictTone, severityTone, signalCatalog
    motion.ts                # fadeUp, scaleIn, rowHighlight, dangerPulse, drawerSlide, stagger*
    fixtures.ts              # demo TokenRiskFixture & AlertFixture data
    utils.ts                 # cn, formatUsd, formatPercent, shortAddress, verdictKey, verdictFromScore
    components/
      trap-score-card.tsx
      verdict-badge.tsx
      risk-signal-card.tsx
      token-risk-table.tsx
      evidence-drawer.tsx
      case-file-header.tsx
      alert-feed.tsx
      alert-card.tsx
      token-search-command.tsx
      smart-money-flow-card.tsx
      liquidity-fragility-card.tsx
      holder-concentration-card.tsx
      security-flags-card.tsx
      mini-sparkline.tsx
      score-delta-pill.tsx
      compare-panel.tsx
      extension-mini-card.tsx
```

```
apps/web/
  components/
    ui/                   # Button, Card, Badge, Dialog, Tabs, Tooltip, Progress, ScrollArea, Skeleton
    site-nav.tsx
    token-case-file.tsx   # page-level composition of @fomo/ui components
  app/
    layout.tsx
    globals.css
    loading.tsx
    error.tsx
    not-found.tsx
    page.tsx
    token/[address]/
      page.tsx
      loading.tsx
      not-found.tsx
    alerts/
      page.tsx
      loading.tsx
    compare/
      page.tsx
      loading.tsx
    api/token/[address]/score/route.ts
```

## Fixture-first approach

Every screen and component is built against `packages/ui/src/fixtures.ts` first. Concretely:

1. We have realistic `TokenRiskFixture` objects for each verdict tier (`CLEAN_PUMP_TOKEN`, `RISKY_CHASE_TOKEN`, `EXIT_WARNING_TOKEN`, `CRITICAL_TRAP_TOKEN`) plus a board of 7 tokens.
2. `RECENT_ALERTS` holds 5 alerts spanning the four alert types.
3. The dashboard, case file, alerts, and compare pages all read from these fixtures — meaning the app screenshots perfectly without any live API call.
4. When the worker comes online, it will write the **same shape** into the DB. Pages swap from `fixtureByAddress(...)` to a DB lookup with no UI changes.

## Shared packages/ui approach

- `apps/web` imports `@fomo/ui` directly (workspace dependency).
- `apps/extension` reuses fixture types and the `shortAddress` helper from `@fomo/ui` so popup state can mirror the dashboard.
- Tailwind in `apps/web` is configured (in `tailwind.config.ts`) to scan `packages/ui/src/**/*.{ts,tsx}` so component classes are bundled.
- The Next config sets `transpilePackages: ["@fomo/ui", "@fomo/shared", "@fomo/scoring", "@fomo/birdeye"]` so the workspace packages don't need a build step.

## Framer Motion usage

Motion is a *state-change explainer*, not decoration. See `.claude/skills/uiux-promax/references/motion-rules.md` and the implementation in `packages/ui/src/motion.ts`. In practice:

- `fadeUp` is used on the TrapScoreCard, CaseFileHeader, AlertCard, ComparePanel, SmartMoneyFlowCard, LiquidityFragilityCard, HolderConcentrationCard, SecurityFlagsCard.
- `staggerContainer` + `staggerItem` are used on the TokenRiskTable rows and AlertFeed lists.
- `rowHighlight` is applied to a specific row when an update arrives.
- `dangerPulse` is used inside AlertCard for `Critical Trap` alerts and inside TrapScoreCard when the verdict is Critical Trap.
- `drawerSlide` powers the EvidenceDrawer.

All animations under 250ms unless explicitly part of a pulse loop. `useReducedMotion()` callers fall back to opacity-only fades.

## How 21st.dev-style components are adapted

When a 21st.dev (or similar) component pattern is used as inspiration:

1. Treat it as a **layout reference**, not a copy-paste.
2. Re-implement using Tailwind + Radix primitives so the output stays consistent with the design tokens.
3. Replace any glassy / gradient / cute styling with our muted dark-card aesthetic.
4. Strip any non-aligned terminology — every label should map back to FOMO Firewall vocabulary (TrapScore, Smart Money Divergence, etc.).
5. Add reasons + evidence wherever a metric is shown. A pattern that only shows a number is incomplete by our standards.

## Adding a new component

1. If it's reusable across surfaces → add to `packages/ui/src/components/` and export from `packages/ui/src/index.ts`.
2. If it's specific to a single web page → put it in `apps/web/components/`.
3. Always provide loading, empty, and error states.
4. Use a fixture as the default story before wiring to live data.
5. Update `.claude/skills/uiux-promax/references/design-system.md` if you introduce a new token.

## Accessibility

- Color is paired with text in every verdict (badge text, severity label, signed values).
- Drawers and dialogs trap focus via Radix.
- Reduced-motion users get opacity-only transitions.
- All interactive elements are keyboard reachable; focus rings use `--ring`.
- Numeric content uses `tabular-nums` so columns align even with mixed digit widths.
