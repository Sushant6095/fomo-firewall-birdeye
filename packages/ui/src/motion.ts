import type { Variants } from "framer-motion";

/**
 * FOMO Firewall motion language.
 *
 * Rules:
 *  - Animations must be fast (120-250ms for most UI).
 *  - Motion explains state changes; it does not decorate.
 *  - Respect prefers-reduced-motion via `useReducedMotion()` in callers.
 *  - Never animate full data tables — animate row updates only.
 *  - No infinite loops except `dangerPulse` for high-risk live state.
 */

const easeOut: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: easeOut }
  }
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.18, ease: easeOut }
  }
};

export const rowHighlight: Variants = {
  rest: { backgroundColor: "hsl(var(--card) / 0)" },
  flash: {
    backgroundColor: [
      "hsl(var(--card) / 0)",
      "hsl(var(--primary) / 0.12)",
      "hsl(var(--card) / 0)"
    ],
    transition: { duration: 1.1, ease: easeOut }
  }
};

export const dangerPulse: Variants = {
  rest: { boxShadow: "0 0 0 0 hsl(var(--verdict-critical) / 0)" },
  pulse: {
    boxShadow: [
      "0 0 0 0 hsl(var(--verdict-critical) / 0.5)",
      "0 0 0 8px hsl(var(--verdict-critical) / 0)",
      "0 0 0 0 hsl(var(--verdict-critical) / 0)"
    ],
    transition: { duration: 2.4, repeat: Infinity, ease: "easeOut" }
  }
};

export const drawerSlide: Variants = {
  hidden: { opacity: 0, x: 32 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.24, ease: easeOut }
  },
  exit: {
    opacity: 0,
    x: 32,
    transition: { duration: 0.18, ease: easeOut }
  }
};

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02
    }
  }
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 4 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: easeOut }
  }
};

export const motionPresets = {
  fadeUp,
  scaleIn,
  rowHighlight,
  dangerPulse,
  drawerSlide,
  staggerContainer,
  staggerItem
};
