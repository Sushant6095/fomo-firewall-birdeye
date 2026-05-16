"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Terminal,
  FileSearch,
  LayoutDashboard,
  Shield,
  Activity,
  Bell,
  BookOpen
} from "lucide-react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useCmdK } from "./cmdk-context";
import { ShimmerButton } from "./ui/shimmer-button";
import { LogoPulse } from "./ui/logo";
import { TubelightNav, type TubelightItem } from "./ui/tubelight-nav";
import { LiveBadge } from "./live-badge";

const NAV_LINKS: TubelightItem[] = [
  { name: "Dashboard", url: "/", icon: <LayoutDashboard className="h-4 w-4" /> },
  { name: "Board", url: "/board", icon: <Shield className="h-4 w-4" /> },
  { name: "Signals", url: "/signals", icon: <Activity className="h-4 w-4" /> },
  { name: "Alerts", url: "/alerts", icon: <Bell className="h-4 w-4" /> },
  { name: "Docs", url: "/docs", icon: <BookOpen className="h-4 w-4" /> }
];

export function TopAppBar() {
  const { setOpen } = useCmdK();
  const [isMac, setIsMac] = React.useState(false);
  const [floating, setFloating] = React.useState(false);
  const { scrollY } = useScroll();

  React.useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
  }, []);

  useMotionValueEvent(scrollY, "change", (y) => {
    setFloating(y > 40);
  });

  return (
    <motion.header
      initial={false}
      animate={{
        marginTop: floating ? 12 : 0,
        marginLeft: floating ? 16 : 0,
        marginRight: floating ? 16 : 0,
        borderRadius: floating ? 24 : 0,
        scale: floating ? 0.99 : 1
      }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className={`sticky top-3 z-40 hidden w-auto items-center justify-between border bg-background/60 px-container-margin py-2 backdrop-blur-xl md:flex ${
        floating
          ? "border-outline-variant shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
          : "border-b-outline-variant/10 border-x-transparent border-t-transparent rounded-none shadow-none"
      }`}
    >
      <div className="flex items-center gap-container-margin">
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          aria-label="FOMO Firewall home"
        >
          <LogoPulse size={32} className="transition-transform group-hover:scale-110" />
          <span className="font-display-lg text-[18px] font-black uppercase tracking-tight text-on-surface">
            FOMO <span className="text-primary">Firewall</span>
          </span>
        </Link>

        <TubelightNav items={NAV_LINKS} />
      </div>

      <div className="flex items-center gap-md">
        <LiveBadge />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group hidden items-center gap-2 rounded-full border border-outline-variant/40 bg-surface-container px-3 py-1.5 text-sm text-on-surface-variant transition-all hover:border-primary/50 hover:bg-surface-container-high hover:text-on-surface lg:flex"
          aria-label="Open search"
        >
          <Search className="h-4 w-4" />
          <span>Search mint or ticker…</span>
          <kbd className="ml-4 rounded border border-outline-variant bg-surface-container-high px-1.5 py-0.5 font-mono text-[10px] text-on-surface-variant">
            {isMac ? "⌘K" : "Ctrl K"}
          </kbd>
        </button>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary lg:hidden"
          aria-label="Open search"
        >
          <Search className="h-4 w-4" />
        </button>

        <Link
          href="/board"
          className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
          aria-label="Threat Board"
        >
          <Terminal className="h-4 w-4" />
        </Link>

        <ShimmerButton onClick={() => setOpen(true)} className="!py-2 !px-4">
          <FileSearch className="h-4 w-4" />
          Open Case File
        </ShimmerButton>
      </div>
    </motion.header>
  );
}
