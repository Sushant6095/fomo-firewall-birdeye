"use client";

import * as React from "react";

type ShimmerButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  shimmerColor?: string;
  shimmerDuration?: string;
  borderRadius?: string;
  background?: string;
};

/**
 * 21st.dev / MagicUI style ShimmerButton.
 * Hover-driven moving highlight, no external deps.
 */
export const ShimmerButton = React.forwardRef<
  HTMLButtonElement,
  ShimmerButtonProps
>(function ShimmerButton(
  {
    shimmerColor = "rgba(255,255,255,0.45)",
    shimmerDuration = "2.5s",
    borderRadius = "9999px",
    background =
      "linear-gradient(110deg, #10B981 0%, #34D399 45%, #10B981 100%)",
    className = "",
    children,
    style,
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      {...rest}
      className={`group relative inline-flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/10 px-6 py-2.5 text-sm font-semibold text-on-primary shadow-[0_4px_24px_rgba(16,185,129,0.35)] transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      style={{
        background,
        backgroundSize: "200% auto",
        borderRadius,
        ...style
      }}
    >
      {/* Moving highlight */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full transition-transform duration-1000 ease-out group-hover:translate-x-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
          animation: `shimmerSlide ${shimmerDuration} linear infinite`
        }}
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
});
