"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";

type InteractiveHoverButtonProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    icon?: React.ReactNode;
    accent?: "primary" | "tertiary" | "error" | "neutral";
  };

const ACCENT: Record<
  NonNullable<InteractiveHoverButtonProps["accent"]>,
  { dot: string; ring: string; fill: string; text: string }
> = {
  primary: {
    dot: "bg-primary",
    ring: "border-primary/40 hover:border-primary",
    fill: "bg-primary",
    text: "text-on-primary"
  },
  tertiary: {
    dot: "bg-tertiary",
    ring: "border-tertiary/40 hover:border-tertiary",
    fill: "bg-tertiary",
    text: "text-on-tertiary"
  },
  error: {
    dot: "bg-error",
    ring: "border-error/40 hover:border-error",
    fill: "bg-error",
    text: "text-on-error"
  },
  neutral: {
    dot: "bg-on-surface-variant",
    ring: "border-outline-variant hover:border-on-surface-variant",
    fill: "bg-on-surface",
    text: "text-background"
  }
};

/**
 * 21st.dev / MagicUI InteractiveHoverButton.
 * Dot grows into background fill on hover, arrow translates in.
 */
export const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(function InteractiveHoverButton(
  { className = "", children, icon, accent = "primary", ...rest },
  ref
) {
  const a = ACCENT[accent];
  return (
    <button
      ref={ref}
      {...rest}
      className={`group relative inline-flex w-fit cursor-pointer items-center gap-3 overflow-hidden rounded-full border bg-surface-container px-5 py-2 text-sm font-medium text-on-surface transition-all hover:pl-10 active:scale-95 ${a.ring} ${className}`}
    >
      <span
        className={`absolute left-3 top-1/2 z-10 h-2 w-2 -translate-y-1/2 rounded-full transition-all duration-300 group-hover:scale-[20] group-hover:opacity-100 ${a.dot}`}
        aria-hidden
      />
      <span
        className={`relative z-20 transition-colors duration-300 group-hover:${a.text}`}
      >
        {children}
      </span>
      <span
        className={`relative z-20 flex translate-x-2 items-center opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-hover:${a.text}`}
      >
        {icon ?? <ArrowRight className="h-4 w-4" />}
      </span>
    </button>
  );
});
