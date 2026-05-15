import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUsd(value: number, options?: { compact?: boolean }): string {
  const compact = options?.compact ?? Math.abs(value) >= 10_000;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 2
  }).format(value);
}

export function formatPercent(value: number, options?: { signed?: boolean }): string {
  const signed = options?.signed ?? true;
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value);
  if (!signed) return `${formatted}%`;
  return `${value > 0 ? "+" : ""}${formatted}%`;
}

export function shortAddress(address: string, prefix = 4, suffix = 4): string {
  if (!address || address.length <= prefix + suffix + 1) return address ?? "";
  return `${address.slice(0, prefix)}…${address.slice(-suffix)}`;
}
