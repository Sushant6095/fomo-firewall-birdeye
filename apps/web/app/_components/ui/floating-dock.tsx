"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion
} from "framer-motion";
import { LogoPulse } from "./logo";

export type DockItem = {
  title: string;
  icon: React.ReactNode;
  href: string;
};

/**
 * 21st.dev / Aceternity-style FloatingDock.
 * Mac-OS cursor magnification + tooltip on hover, vertical left-rail variant.
 * Brand Pulse Shield pinned at the top.
 */
export function FloatingDockVertical({
  items,
  className = ""
}: {
  items: DockItem[];
  className?: string;
}) {
  const mouseY = useMotionValue(Infinity);
  return (
    <motion.aside
      onMouseMove={(e) => mouseY.set(e.pageY)}
      onMouseLeave={() => mouseY.set(Infinity)}
      className={`fixed left-3 top-1/2 z-50 hidden -translate-y-1/2 flex-col items-center gap-3 rounded-2xl border border-outline-variant bg-surface-container-low/80 px-2 py-4 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl md:flex ${className}`}
    >
      <Link
        href="/"
        aria-label="FOMO Firewall home"
        className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/5 transition-all hover:scale-105 hover:border-primary/60 hover:bg-primary/10"
      >
        <LogoPulse size={40} glow />
      </Link>
      <span className="mb-1 h-px w-8 bg-outline-variant/40" />
      {items.map((item, i) => (
        <DockIcon key={`${item.title}-${i}`} mouseY={mouseY} item={item} />
      ))}
    </motion.aside>
  );
}

function DockIcon({
  mouseY,
  item
}: {
  mouseY: ReturnType<typeof useMotionValue<number>>;
  item: DockItem;
}) {
  const ref = React.useRef<HTMLAnchorElement>(null);
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const active =
    item.href === "/"
      ? pathname === "/"
      : pathname.startsWith(item.href.split("/").slice(0, 2).join("/"));

  const distance = useTransform(mouseY, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { y: 0, height: 0 };
    return val - bounds.y - bounds.height / 2;
  });

  const sizeSync = useTransform(distance, [-120, 0, 120], [40, 68, 40]);
  const size = useSpring(reduced ? 44 : sizeSync, {
    mass: 0.1,
    stiffness: 150,
    damping: 12
  });

  const [hovered, setHovered] = React.useState(false);

  return (
    <Link
      ref={ref}
      href={item.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={item.title}
      className="relative flex items-center justify-center"
    >
      <motion.span
        style={{ width: size, height: size }}
        className={`flex items-center justify-center rounded-xl border transition-colors ${
          active
            ? "border-primary/50 bg-primary/15 text-primary shadow-[0_0_22px_rgba(16,185,129,0.4)]"
            : "border-outline-variant/40 bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
        }`}
      >
        <span className="flex h-1/2 w-1/2 items-center justify-center">
          {item.icon}
        </span>
      </motion.span>
      <AnimatePresence>
        {hovered && (
          <motion.span
            initial={{ opacity: 0, x: -8, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="font-mono-label text-mono-label absolute left-full ml-4 whitespace-nowrap rounded-md border border-outline-variant bg-surface-container-high px-2 py-1 text-on-surface shadow-lg"
          >
            {item.title}
          </motion.span>
        )}
      </AnimatePresence>
      {active ? (
        <motion.span
          layoutId="dock-active-indicator"
          className="absolute -right-2 top-1/2 h-6 w-1 -translate-y-1/2 rounded-l-full bg-primary shadow-[0_0_12px_rgba(16,185,129,0.7)]"
        />
      ) : null}
    </Link>
  );
}
