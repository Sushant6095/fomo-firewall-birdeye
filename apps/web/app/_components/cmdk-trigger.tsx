"use client";

import * as React from "react";
import { useCmdK } from "./cmdk-context";

type CmdKTriggerProps = {
  children: (open: () => void) => React.ReactNode;
};

export function CmdKTrigger({ children }: CmdKTriggerProps) {
  const { setOpen } = useCmdK();
  return <>{children(() => setOpen(true))}</>;
}
