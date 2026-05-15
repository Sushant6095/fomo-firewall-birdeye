"use client";

import * as React from "react";

type BorderBeamProps = {
  size?: number;
  duration?: number;
  colorFrom?: string;
  colorTo?: string;
  className?: string;
};

/**
 * 21st.dev / MagicUI BorderBeam.
 * Animated rotating gradient inside the border ring of a relatively-positioned parent.
 */
export function BorderBeam({
  size = 200,
  duration = 8,
  colorFrom = "#10B981",
  colorTo = "#84CC16",
  className = ""
}: BorderBeamProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 rounded-[inherit] [border:1px_solid_transparent] [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)] ${className}`}
      aria-hidden
      style={
        {
          "--size": `${size}px`,
          "--duration": `${duration}s`,
          "--color-from": colorFrom,
          "--color-to": colorTo,
          background: `conic-gradient(from 0deg, transparent 0%, ${colorFrom} 40%, ${colorTo} 50%, transparent 60%)`,
          animation: `borderBeamRotate ${duration}s linear infinite`
        } as React.CSSProperties
      }
    />
  );
}
