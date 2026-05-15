# Screenshot Checklist

Mirror of the canonical list in `.claude/skills/uiux-promax/references/screenshot-checklist.md`. Use this as the human-facing reference inside the repo.

## Dashboard screenshot

- Hero clearly says "Real-time exit-liquidity detector for Solana pumps."
- Four metric cards above the fold (Tokens scanned, Critical traps, Clean pumps, Alerts fired).
- Trending Pump Risk Board shows at least one **Critical Trap** and one **Clean Pump**.
- TrapScore column visible with mono digits.
- Verdict badges show verdict text (not just color).
- Recent Alerts column has at least one Critical Trap alert with the soft pulse.
- No "Demo mode" banner cropped — visible in full or out of frame entirely.

## Token case file screenshot

- CaseFileHeader fully readable: symbol, name, address, verdict, 1h price/vol/liquidity.
- TrapScoreCard with the big numeric score, verdict bar at top, reasons list.
- Analyst summary card readable for the first 2 lines.
- 3+ RiskSignalCards visible (Smart Money Divergence, Insider Exit, Liquidity Fragility).
- At least one inline evidence value (don't hide all evidence in tooltips).
- "Not financial advice" microcopy visible.

## Extension popup screenshot

- Brand strip with logo and "Exit-liquidity intel" line.
- Token search row visible.
- Mini case card with TrapScore, verdict badge, top 3 reasons.
- Open case file + Watch token buttons visible.
- Verdict tones match the dashboard (red border = Critical Trap, orange = Exit Warning, etc.).

## Alert card screenshot

- Headline ("$DOGX TrapScore jumped 71 → 92") visible.
- Verdict badge visible.
- Time-ago indicator ("just now", "6m ago") visible.
- Copy alert + Open case file buttons visible.
- For Critical Trap alerts, the soft pulse glow is captured in the frame.

## Compare page screenshot

- Both sides clearly labeled "Clean Pump example" vs "Critical Trap example".
- Both TrapScores visible.
- Metric table shows colored deltas (green = clean wins a row, red = trap wins a row).
- Footer paragraph explaining why FOMO Firewall ≠ a trending dashboard is visible.

## Demo video readiness

1. Dashboard → click a Critical Trap row → token case file → click "View evidence" → drawer opens. Three transitions, each under 1 second.
2. Alert page → copy alert → paste into a Telegram preview window.
3. Extension → paste a mint → score appears within 500ms.
4. Compare page closes the video with the side-by-side narrative.

Voiceover uses canonical terminology — never "buy", "sell", "ape".

## Common rejects

- Screenshot of a single chart with no verdict text in frame.
- Screenshot of just the table with no Risk Board header.
- Screenshot where every visible verdict is "Clean Pump".
- Any wallet-connect, swap, or trading-button UI.
