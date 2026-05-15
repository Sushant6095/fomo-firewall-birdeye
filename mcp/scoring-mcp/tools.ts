/**
 * Allow-list of TrapScore MCP tool names. Tools are pure functions over local
 * `@fomo/scoring` — no network access, no Birdeye, no DB writes.
 */
export const scoringTools = [
  "scoring.calculateTrapScore",
  "scoring.explainTrapScore",
  "scoring.compareSnapshots",
  "scoring.generateAlertText"
] as const;

export type ScoringToolName = (typeof scoringTools)[number];
