"use client";

import * as React from "react";

type CmdKContextValue = {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
};

const CmdKContext = React.createContext<CmdKContextValue | null>(null);

export function CmdKProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const value = React.useMemo<CmdKContextValue>(
    () => ({ open, setOpen, toggle: () => setOpen((v) => !v) }),
    [open]
  );
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  return <CmdKContext.Provider value={value}>{children}</CmdKContext.Provider>;
}

export function useCmdK(): CmdKContextValue {
  const ctx = React.useContext(CmdKContext);
  if (!ctx) {
    // Server-rendered fallback: noop. The provider is mounted client-side in the layout.
    return {
      open: false,
      setOpen: () => undefined,
      toggle: () => undefined
    };
  }
  return ctx;
}
