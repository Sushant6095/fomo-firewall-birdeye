# FOMO Firewall — Demo Script

A 90-second walkthrough that doubles as the structure for the submission
video. Three acts: **The hook**, **The product**, **The proof**.

---

## 10-second opening (the hook)

> "Entry tools tell you when smart money *enters*.
>  FOMO Firewall tells you when smart money is using the crowd as exit liquidity."

Show the dashboard hero — the line "Real-time exit-liquidity detector for
Solana pumps" — and let the Risk Board flash up showing one **Critical Trap**
(red) next to one **Clean Pump** (green) so the verdict spread is visible in a
single frame.

---

## 30-second walkthrough (the product)

1. **Dashboard** — point at the Trending Pump Risk Board. Highlight the
   columns the rest of the demo will pay off: `Smart Netflow`, `Insider Netflow`,
   `Liquidity Δ`, `Top 10`, `TrapScore`, `Verdict`.
2. **Click `$DOGX` (Critical Trap, score 92)**. The Token Case File loads.
3. **Score + analyst summary** — show the TrapScoreCard with the big 92, the
   red verdict badge, and the analyst summary line:
   > "$DOGX is up 82% in 1h, but smart wallets are net-selling, insider/dev-tagged
   > wallets reduced exposure, and liquidity fell during the pump. This pattern
   > suggests possible exit-liquidity behavior."
4. **Open the Evidence drawer** on `Smart Money Divergence`. Show the
   Birdeye-sourced numbers and the endpoint each came from. This is the
   "we don't just show raw API output" pay-off.
5. **Compare** — quick cut to `/compare`. Two tokens, same up-move, very
   different stories. Read the metric table — green wins on the Clean side,
   red wins on the Trap side.
6. **Telegram** — show the same alert in Telegram. Same verdict, same top 3
   reasons, same case-file link. (Drives home: every surface reads the same
   TrapScore.)
7. **Extension cameo** — in Chrome, click the FOMO Firewall toolbar icon.
   Paste `$DOGX`'s mint. The popup renders Critical Trap with the same red
   tones and the same top 3 reasons. Click *Open Case File* — it deep-links
   back to the dashboard.

---

## 10-second closing (the proof)

> "Most tools help traders find entries.
>  FOMO Firewall helps traders avoid being the exit."

Cut to the architecture diagram: one Birdeye source → one TrapScore engine →
three surfaces (web / Telegram / extension), all reading the same scored row.

---

## Recording checklist

- [ ] Worker has run at least once (so the dashboard is showing real data,
      not just fixtures): `pnpm --filter @fomo/worker dev:demo` is enough for
      the recording — judges can re-run live mode with their own
      `BIRDEYE_API_KEY` from the README.
- [ ] At least one Critical Trap and one Clean Pump are visible in the same
      Risk Board frame.
- [ ] The Evidence drawer is opened on a high-severity signal — values are
      readable, not blurred.
- [ ] Telegram window is using the dark theme that matches the dashboard.
- [ ] Extension popup screenshot has the verdict tone visible (red border for
      Critical Trap).
- [ ] Audio voiceover uses canonical terminology: TrapScore, Critical Trap,
      smart wallets, insiders, exit liquidity. Never "buy", "sell", or "ape".
- [ ] No `BIRDEYE_API_KEY` or other secret appears in any visible terminal
      output or browser dev tools panel.

## Reject criteria (do not ship the demo if any are true)

- A "trending dashboard" framing slipped into the voiceover — we are not that.
- A buy / sell button or wallet-connect modal appears anywhere.
- The score is visible but the *reasons + evidence* are not (defeats the
  "explainable risk" thesis).
- The Critical Trap row is the only verdict visible — judges should see the
  spread.

---

See `docs/screenshot-checklist.md` for per-surface screenshot gates.
