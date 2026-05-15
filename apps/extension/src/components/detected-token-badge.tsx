import type { TokenRiskFixture } from "@fomo/ui";

/**
 * Rendered into the page by content.ts as a small, draggable badge.
 *
 * This file exposes a pure HTML builder rather than a React component because
 * the content script runs in an isolated world and we keep the bundle tiny.
 *
 * Visual language must match the popup and dashboard verdict tones.
 */

export type BadgeState =
  | { kind: "loading" }
  | { kind: "ready"; token: Pick<TokenRiskFixture, "symbol" | "trapScore" | "verdict"> }
  | { kind: "error"; message: string };

const VERDICT_TONE = {
  "Clean Pump": "clean",
  "Risky Chase": "risky",
  "Exit Warning": "warning",
  "Critical Trap": "critical"
} as const;

export function buildBadgeMarkup(state: BadgeState): string {
  if (state.kind === "loading") {
    return `<div class="ff-bdg ff-bdg--loading">
      <span class="ff-bdg__pulse"></span>
      <span class="ff-bdg__label">Scoring…</span>
    </div>`;
  }
  if (state.kind === "error") {
    return `<div class="ff-bdg ff-bdg--error" title="${escapeAttr(state.message)}">
      <span class="ff-bdg__label">FF · n/a</span>
    </div>`;
  }
  const tone = VERDICT_TONE[state.token.verdict];
  return `<div class="ff-bdg ff-bdg--${tone}" title="FOMO Firewall TrapScore">
    <span class="ff-bdg__brand">FF</span>
    <span class="ff-bdg__score">${state.token.trapScore}</span>
    <span class="ff-bdg__verdict">${state.token.verdict}</span>
  </div>`;
}

function escapeAttr(s: string): string {
  return s.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
