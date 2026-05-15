export type TrapVerdict =
  | "Clean Pump"
  | "Risky Chase"
  | "Exit Warning"
  | "Critical Trap";

export type ScoreReason = {
  code: string;
  message: string;
  contribution: number;
  evidence: Record<string, unknown>;
};

export const VERDICT_RANGES = [
  { verdict: "Clean Pump" as const, min: 0, max: 30 },
  { verdict: "Risky Chase" as const, min: 31, max: 60 },
  { verdict: "Exit Warning" as const, min: 61, max: 80 },
  { verdict: "Critical Trap" as const, min: 81, max: 100 }
] as const;

export function verdictFromScore(score: number): TrapVerdict {
  if (score >= 81) return "Critical Trap";
  if (score >= 61) return "Exit Warning";
  if (score >= 31) return "Risky Chase";
  return "Clean Pump";
}

export * from "./scoring";
export * from "./alerts";
export * from "./time";
export * from "./env";
