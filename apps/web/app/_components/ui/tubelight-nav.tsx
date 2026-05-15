"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export type TubelightItem = {
  name: string;
  url: string;
  icon?: React.ReactNode;
};

/**
 * 21st.dev "Tubelight" pill navigation.
 * Active item gets a soft tube-light glow on top and a sliding background pill
 * that uses framer-motion layoutId for the morph transition.
 */
export function TubelightNav({
  items,
  className = ""
}: {
  items: TubelightItem[];
  className?: string;
}) {
  const pathname = usePathname();
  return (
    <nav
      className={`relative flex items-center gap-1 rounded-full border border-outline-variant/40 bg-surface-container/80 p-1 backdrop-blur ${className}`}
    >
      {items.map((item) => {
        const active =
          item.url === "/"
            ? pathname === "/"
            : pathname.startsWith(item.url);
        return (
          <Link
            key={item.url}
            href={item.url}
            className={`relative z-10 flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "text-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {item.icon ? <span className="h-4 w-4">{item.icon}</span> : null}
            <span>{item.name}</span>
            {active ? (
              <motion.span
                layoutId="tubelight-bg"
                className="absolute inset-0 -z-10 rounded-full bg-primary/10 ring-1 ring-primary/30"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              >
                <span className="absolute left-1/2 top-0 h-1 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary blur-[6px]" />
                <span className="absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
              </motion.span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
