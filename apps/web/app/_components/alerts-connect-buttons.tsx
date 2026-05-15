"use client";

import * as React from "react";
import { toast } from "sonner";
import { Send, Puzzle, Bell } from "lucide-react";
import { AnimatedSubscribeButton } from "./ui/magicui";

export function AlertsConnectButtons() {
  const [telegram, setTelegram] = React.useState(true);
  const [extension, setExtension] = React.useState(true);
  const [webpush, setWebpush] = React.useState(false);

  async function onWebPushToggle(next: boolean) {
    if (next) {
      try {
        if (!("Notification" in window)) {
          toast.error("Web notifications not supported in this browser");
          return;
        }
        const result = await Notification.requestPermission();
        if (result === "granted") {
          setWebpush(true);
          new Notification("FOMO Firewall", {
            body: "Critical Trap alerts will now appear here."
          });
          toast.success("Web push enabled");
        } else {
          toast.error("Permission denied");
        }
      } catch (err) {
        toast.error("Failed to request permission");
      }
    } else {
      setWebpush(false);
      toast.message("Web push disabled");
    }
  }

  return (
    <div className="grid grid-cols-3 gap-sm">
      <div className="flex flex-col items-center gap-2 rounded-xl border border-outline-variant/40 bg-surface-container p-sm">
        <Send className={`h-4 w-4 ${telegram ? "text-primary" : "text-on-surface-variant"}`} />
        <span className="font-mono-label text-mono-label text-on-surface">Telegram</span>
        <AnimatedSubscribeButton
          subscribed={telegram}
          setSubscribed={(v) => {
            setTelegram(v);
            toast[v ? "success" : "message"](v ? "Telegram connected" : "Telegram disconnected");
          }}
          initialText="Connect"
          changeText="Connected"
          className="!h-7 !px-3 !text-[11px]"
        />
      </div>
      <div className="flex flex-col items-center gap-2 rounded-xl border border-outline-variant/40 bg-surface-container p-sm">
        <Puzzle className={`h-4 w-4 ${extension ? "text-primary" : "text-on-surface-variant"}`} />
        <span className="font-mono-label text-mono-label text-on-surface">Extension</span>
        <AnimatedSubscribeButton
          subscribed={extension}
          setSubscribed={(v) => {
            setExtension(v);
            toast[v ? "success" : "message"](v ? "Extension active" : "Extension disabled");
          }}
          initialText="Install"
          changeText="Active"
          className="!h-7 !px-3 !text-[11px]"
        />
      </div>
      <div className="flex flex-col items-center gap-2 rounded-xl border border-outline-variant/40 bg-surface-container p-sm">
        <Bell className={`h-4 w-4 ${webpush ? "text-primary" : "text-on-surface-variant"}`} />
        <span className="font-mono-label text-mono-label text-on-surface">Web Push</span>
        <AnimatedSubscribeButton
          subscribed={webpush}
          setSubscribed={onWebPushToggle}
          initialText="Enable"
          changeText="Enabled"
          className="!h-7 !px-3 !text-[11px]"
        />
      </div>
    </div>
  );
}
