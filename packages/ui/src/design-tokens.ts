import type { TrapVerdict } from "@fomo/shared";

/**
 * FOMO Firewall design tokens.
 *
 * These are the *source of truth* for verdict semantics across web, extension,
 * Telegram embeds, and screenshots. Surfaces must not invent their own colors.
 */

export const verdictRanges = [
  { verdict: "Clean Pump" as const, min: 0, max: 30 },
  { verdict: "Risky Chase" as const, min: 31, max: 60 },
  { verdict: "Exit Warning" as const, min: 61, max: 80 },
  { verdict: "Critical Trap" as const, min: 81, max: 100 }
] as const;

export const verdictTone: Record<
  TrapVerdict,
  {
    label: string;
    badge: "clean" | "risky" | "warning" | "critical";
    hsl: string;
    description: string;
    /** Plain-language "what does this mean" line shown next to the score. */
    headline: string;
  }
> = {
  "Clean Pump": {
    label: "Clean Pump",
    badge: "clean",
    hsl: "142 70% 48%",
    description: "Smart wallets and liquidity holding up while price climbs.",
    headline: "Risk intelligence: pattern looks healthy."
  },
  "Risky Chase": {
    label: "Risky Chase",
    badge: "risky",
    hsl: "42 95% 56%",
    description: "Mixed signals — watch netflow and liquidity carefully.",
    headline: "TrapScore indicates elevated chase risk."
  },
  "Exit Warning": {
    label: "Exit Warning",
    badge: "warning",
    hsl: "24 95% 55%",
    description: "Smart money or insiders distributing into retail FOMO.",
    headline: "Evidence suggests possible exit-liquidity behavior."
  },
  "Critical Trap": {
    label: "Critical Trap",
    badge: "critical",
    hsl: "0 84% 60%",
    description:
      "Multiple exit-liquidity signals firing together. Highest chase risk.",
    headline:
      "Critical Trap pattern: pump while smart money, insiders, and liquidity exit."
  }
};

export const severityTone: Record<
  "low" | "medium" | "high" | "critical",
  { label: string; badge: "muted" | "risky" | "warning" | "critical" }
> = {
  low: { label: "Low", badge: "muted" },
  medium: { label: "Medium", badge: "risky" },
  high: { label: "High", badge: "warning" },
  critical: { label: "Critical", badge: "critical" }
};

export const signalCatalog = [
  {
    code: "SMART_MONEY_DIVERGENCE",
    label: "Smart Money Divergence",
    blurb: "Price up while smart wallets net-sell."
  },
  {
    code: "INSIDER_EXIT_PRESSURE",
    label: "Insider Exit Pressure",
    blurb: "Insider / dev wallets reducing exposure."
  },
  {
    code: "LIQUIDITY_FRAGILITY",
    label: "Liquidity Fragility",
    blurb: "Liquidity falling while price climbs."
  },
  {
    code: "SELL_PRESSURE_GREEN",
    label: "Sell Pressure While Green",
    blurb: "Sell volume rising despite positive price action."
  },
  {
    code: "HOLDER_CONCENTRATION",
    label: "Holder Concentration Risk",
    blurb: "Top holders control too much supply."
  },
  {
    code: "STATIC_TOKEN_RISK",
    label: "Security Risk",
    blurb:
      "Mutable metadata, freeze authority, transfer fees, mint authority risks."
  },
  {
    code: "ABNORMAL_VOLUME_LIQUIDITY",
    label: "Abnormal Volume/Liquidity Ratio",
    blurb: "Volume far outpaces available liquidity."
  }
] as const;

export type SignalCode = (typeof signalCatalog)[number]["code"];

export const dashboardSections = [
  "Highest TrapScore",
  "Clean Pumps",
  "Smart Money Divergence",
  "Insider Exit Pressure",
  "Liquidity Drain Alerts",
  "Recent Alerts"
] as const;
