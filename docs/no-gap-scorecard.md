# No-Gap Scorecard

Use this as the internal 40/40 checklist.

## Product Utility - target 10/10

Must-have:

- Solves a painful trader problem: avoiding exit liquidity.
- Token table gives instant verdicts.
- Token case file explains why.
- Telegram bot sends actionable alerts.
- Extension lets users check risk while browsing token pages.
- No manual wallet setup required for the main product.

Reject if:

- It feels like a generic token scanner.
- It only shows raw Birdeye data.
- It lacks clear verdicts.

## Technical Depth - target 10/10

Must-have:

- Uses at least 6 Birdeye endpoint families.
- Has typed API client wrappers.
- Has snapshot storage and delta calculations.
- Has reusable scoring package.
- Has unit tests for scoring.
- Has worker ingestion and alert deduplication.
- Has Telegram bot and browser extension using the same backend score API.
- Has explainable scoring output.

Reject if:

- Calls APIs only from the UI.
- Exposes the Birdeye key to the browser.
- Has no persistence or historical deltas.

## Presentation - target 10/10

Must-have:

- README explains problem, solution, endpoints, architecture, scoring.
- Demo script includes 3 token case files.
- Architecture diagram exists.
- Screenshots show web, bot, extension.
- Clear product language: TrapScore, Smart Money Divergence, Insider Exit Pressure.

Reject if:

- README is only installation instructions.
- No architecture explanation.
- No endpoint map.

## Community Support - target 10/10

Later phase, not now. But product must create shareable artifacts automatically:

- Alert cards
- Token case-file screenshots
- Daily leaderboard of highest TrapScore tokens
- "Clean pump vs exit trap" comparisons

## Final readiness gate

Before submission, answer yes to all:

- Can a judge understand the product in 10 seconds?
- Can a judge verify Birdeye is deeply used?
- Can a judge see technical architecture in the repo?
- Can a trader use the app without reading docs?
- Can every score be explained?
- Does the bot work?
- Does the extension work?
- Does the web app work on mobile?
- Does the README contain endpoint-by-endpoint usage?
- Is there a 60-90 second demo video script?
