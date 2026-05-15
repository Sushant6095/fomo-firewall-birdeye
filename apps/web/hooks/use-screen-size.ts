"use client";

import { useEffect, useState } from "react";

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

export type ScreenSize = {
  width: number;
  height: number;
  /** True when `window.innerWidth < BREAKPOINTS[bp]`. */
  lessThan: (bp: Breakpoint) => boolean;
  /** True when `window.innerWidth >= BREAKPOINTS[bp]`. */
  greaterThan: (bp: Breakpoint) => boolean;
};

/**
 * Reactive screen-size hook with a Tailwind-shaped breakpoint API.
 *
 * Safe to call from any client component — returns `{ width: 0, height: 0 }`
 * during SSR / first render, then updates after mount.
 */
export function useScreenSize(): ScreenSize {
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return {
    width: size.width,
    height: size.height,
    lessThan: (bp) => size.width > 0 && size.width < BREAKPOINTS[bp],
    greaterThan: (bp) => size.width >= BREAKPOINTS[bp]
  };
}
