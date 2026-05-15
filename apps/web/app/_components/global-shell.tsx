"use client";

import { Toaster } from "sonner";
import { CmdKProvider } from "./cmdk-context";
import { CmdKSpotlight } from "./cmdk-spotlight";
import { ScrollProgress } from "./ui/magicui";

export function GlobalShell({ children }: { children: React.ReactNode }) {
  return (
    <CmdKProvider>
      <ScrollProgress />
      {children}
      <CmdKSpotlight />
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#152119",
            border: "1px solid rgba(52, 211, 153, 0.18)",
            color: "#E8F5E9"
          }
        }}
      />
    </CmdKProvider>
  );
}
