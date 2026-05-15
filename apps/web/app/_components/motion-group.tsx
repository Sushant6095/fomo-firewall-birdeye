"use client";

import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, staggerContainer, staggerItem } from "@fomo/ui";

type MotionGroupProps = {
  children: React.ReactNode;
  className?: string;
};

export function MotionStagger({ children, className }: MotionGroupProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      variants={reduced ? undefined : staggerContainer}
      initial={reduced ? false : "hidden"}
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function MotionItem({ children, className }: MotionGroupProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      variants={reduced ? undefined : staggerItem}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function MotionFadeUp({ children, className }: MotionGroupProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      variants={reduced ? undefined : fadeUp}
      initial={reduced ? false : "hidden"}
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}
