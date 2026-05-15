"use client";

import { motion } from "framer-motion";
import { cn } from "../utils";
import { staggerContainer } from "../motion";
import { AlertCard } from "./alert-card";
import type { AlertFixture } from "../fixtures";

export interface AlertFeedProps {
  alerts: AlertFixture[];
  className?: string;
  emptyMessage?: string;
}

export function AlertFeed({
  alerts,
  className,
  emptyMessage = "No alerts in the last 24h."
}: AlertFeedProps) {
  if (!alerts.length) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed border-border/70 bg-card/40 p-8 text-center text-sm text-muted-foreground",
          className
        )}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className={cn("grid gap-3", className)}
    >
      {alerts.map((alert) => (
        <AlertCard key={alert.id} alert={alert} />
      ))}
    </motion.div>
  );
}
