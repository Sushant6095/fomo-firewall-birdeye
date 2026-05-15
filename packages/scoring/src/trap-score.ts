import {
  type ScoreReason,
  type SignalResult,
  type TrapInputs,
  type TrapScoreResult,
  type TrapVerdict,
  verdictFromScore
} from "@fomo/shared";
import { ALL_SIGNAL_FUNCTIONS } from "./signals";

const clamp = (v: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, v));

/**
 * Compute the TrapScore for a single token. Returns:
 *   trapScore (0..100)  · verdict · reasons[] · warnings[]
 *
 * Every signal runs unconditionally so the result always contains 7 entries —
 * UIs need that to render "no risk on this dimension" as a low-severity card.
 *
 * The score itself is the *sum of signal contributions*, clamped to 100.
 */
export function calculateTrapScore(input: TrapInputs): TrapScoreResult {
  const signals = ALL_SIGNAL_FUNCTIONS.map((fn) => fn(input));
  const total = signals.reduce((sum, s) => sum + s.contribution, 0);
  const trapScore = clamp(Math.round(total));

  const reasons: ScoreReason[] = signals
    .filter((s) => s.contribution > 0)
    .sort((a, b) => b.contribution - a.contribution)
    .map((s) => signalToReason(s));

  const warnings: string[] = [];
  if (input.buyVolume1h === 0 && input.sellVolume1h === 0) {
    warnings.push("No tx volume in the 1h window — score relies on overview data only.");
  }
  if (input.top10HolderPercent === 0) {
    warnings.push("Top-holder data missing — concentration signal is muted.");
  }

  return {
    trapScore,
    verdict: verdictFromScore(trapScore),
    reasons,
    warnings
  };
}

/**
 * Same engine, but also returns the per-signal `SignalResult[]` so the UI
 * (RiskSignalCard grid, evidence drawer) can render without recomputing.
 */
export function calculateTrapScoreWithSignals(input: TrapInputs): TrapScoreResult & {
  signals: SignalResult[];
} {
  const signals = ALL_SIGNAL_FUNCTIONS.map((fn) => fn(input));
  const total = signals.reduce((sum, s) => sum + s.contribution, 0);
  const trapScore = clamp(Math.round(total));
  const verdict: TrapVerdict = verdictFromScore(trapScore);
  const reasons = signals
    .filter((s) => s.contribution > 0)
    .sort((a, b) => b.contribution - a.contribution)
    .map(signalToReason);

  return {
    trapScore,
    verdict,
    reasons,
    warnings: [],
    signals
  };
}

function signalToReason(s: SignalResult): ScoreReason {
  return {
    code: s.code,
    message: s.headline,
    contribution: s.contribution,
    evidence: {
      severity: s.severity,
      reason: s.reason,
      items: s.evidence
    }
  };
}
