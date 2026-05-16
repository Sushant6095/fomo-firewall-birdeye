"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Send,
  Puzzle,
  ArrowUpRight,
  ExternalLink,
  Copy,
  Check
} from "lucide-react";
import {
  MagicCard,
  BlurFade,
  AnimatedShinyText,
  NumberTicker
} from "./ui/magicui";
import { ShimmerButton } from "./ui/shimmer-button";
import { InteractiveHoverButton } from "./ui/interactive-hover-button";
import { BorderBeam } from "./ui/border-beam";

/**
 * Multi-channel CTA — points users at the Telegram bot and the browser
 * extension. The web they're already on, so we don't include it as a card;
 * we just show "Web · live" as a status pill above the grid.
 */
export function HomeChannelsCTA() {
  const [copied, setCopied] = React.useState(false);

  function copyExtensionInstall() {
    const cmd =
      "git clone https://github.com/Sushant6095/fomo-firewall-birdeye.git\ncd fomo-firewall-birdeye\npnpm install\npnpm --filter @fomo/extension build\n# then chrome://extensions → Load unpacked → apps/extension/dist/";
    navigator.clipboard
      .writeText(cmd)
      .then(() => {
        setCopied(true);
        toast.success("Install commands copied", {
          description: "Paste in your terminal, then load apps/extension/dist/ as unpacked in chrome://extensions"
        });
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast.error("Clipboard unavailable");
      });
  }

  return (
    <section className="mt-xl">
      <h3 className="font-headline-md text-headline-md mb-1 flex items-center gap-2 text-on-surface">
        <span className="material-symbols-outlined text-primary">
          radio_button_checked
        </span>
        Get alerts wherever you trade
      </h3>
      <p className="font-body-sm text-body-sm mb-4 max-w-2xl text-on-surface-variant">
        Same TrapScore. Three surfaces. Pick whichever fits your workflow —
        they all read from the same engine.
      </p>

      <div className="grid grid-cols-1 gap-md md:grid-cols-3">
        {/* Web (current) */}
        <BlurFade delay={0.05}>
          <MagicCard className="!h-full !rounded-2xl !border-success/30">
            <div className="flex h-full flex-col gap-3 p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-success/30 bg-success/10">
                  <span className="material-symbols-outlined text-success">
                    monitor
                  </span>
                </div>
                <span className="font-mono-label text-mono-label inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-2 py-0.5 text-success">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
                  </span>
                  ACTIVE
                </span>
              </div>
              <div>
                <h4 className="font-headline-sm text-headline-sm text-on-surface">
                  Web Terminal
                </h4>
                <p className="font-body-sm text-body-sm mt-1 text-on-surface-variant">
                  You&apos;re here. 5 pages, Cmd-K spotlight, live risk board.
                </p>
              </div>
              <div className="font-mono-label text-mono-label mt-auto flex items-center gap-2 text-on-surface-variant">
                <NumberTicker value={5} /> routes ·{" "}
                <NumberTicker value={10} /> API endpoints
              </div>
            </div>
          </MagicCard>
        </BlurFade>

        {/* Telegram bot */}
        <BlurFade delay={0.12}>
          <div className="relative h-full">
            <MagicCard
              gradientColor="#10B981"
              gradientOpacity={0.22}
              className="!h-full !rounded-2xl !border-primary/40"
            >
              <BorderBeam size={200} duration={9} colorFrom="#10B981" colorTo="#84CC16" />
              <div className="flex h-full flex-col gap-3 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
                    <Send className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-mono-label text-mono-label inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-primary">
                    LIVE
                  </span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface">
                    Telegram Bot
                  </h4>
                  <p className="font-body-sm text-body-sm mt-1 text-on-surface-variant">
                    Paste a mint, get the TrapScore. /watch any token —
                    push alerts when smart money flips seller.
                  </p>
                </div>
                <div className="font-mono-data text-mono-data flex flex-wrap gap-1.5 text-[10px] text-on-surface-variant">
                  <code className="rounded bg-surface-container-high px-1.5 py-0.5">/score</code>
                  <code className="rounded bg-surface-container-high px-1.5 py-0.5">/watch</code>
                  <code className="rounded bg-surface-container-high px-1.5 py-0.5">/unwatch</code>
                  <code className="rounded bg-surface-container-high px-1.5 py-0.5">/alerts</code>
                </div>
                <Link
                  href="https://t.me/fomo_firewall_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto block"
                >
                  <ShimmerButton className="!w-full !py-3 !text-sm">
                    <Send className="h-4 w-4" />
                    Open @fomo_firewall_bot
                    <ArrowUpRight className="h-4 w-4" />
                  </ShimmerButton>
                </Link>
                <AnimatedShinyText
                  shimmerWidth={80}
                  className="font-mono-label text-mono-label text-center text-on-surface-variant"
                >
                  t.me/fomo_firewall_bot · tap Start to begin
                </AnimatedShinyText>
              </div>
            </MagicCard>
          </div>
        </BlurFade>

        {/* Browser extension */}
        <BlurFade delay={0.18}>
          <MagicCard
            gradientColor="#84CC16"
            gradientOpacity={0.18}
            className="!h-full !rounded-2xl !border-tertiary/40"
          >
            <div className="flex h-full flex-col gap-3 p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-tertiary/30 bg-tertiary/10">
                  <Puzzle className="h-5 w-5 text-tertiary" />
                </div>
                <span className="font-mono-label text-mono-label inline-flex items-center gap-1.5 rounded-full border border-tertiary/40 bg-tertiary/10 px-2 py-0.5 text-tertiary">
                  MANIFEST V3
                </span>
              </div>
              <div>
                <h4 className="font-headline-sm text-headline-sm text-on-surface">
                  Browser Extension
                </h4>
                <p className="font-body-sm text-body-sm mt-1 text-on-surface-variant">
                  TrapScore overlays on Birdeye, DexScreener, Solscan,
                  Photon, Jupiter — wherever you actually trade.
                </p>
              </div>
              <div className="font-mono-data text-mono-data flex flex-wrap gap-1.5 text-[10px] text-on-surface-variant">
                <code className="rounded bg-surface-container-high px-1.5 py-0.5">birdeye.so</code>
                <code className="rounded bg-surface-container-high px-1.5 py-0.5">dexscreener</code>
                <code className="rounded bg-surface-container-high px-1.5 py-0.5">solscan</code>
                <code className="rounded bg-surface-container-high px-1.5 py-0.5">pump.fun</code>
                <code className="rounded bg-surface-container-high px-1.5 py-0.5">jup.ag</code>
              </div>
              <button
                type="button"
                onClick={copyExtensionInstall}
                className="mt-auto w-full"
              >
                <InteractiveHoverButton
                  accent="tertiary"
                  icon={
                    copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )
                  }
                  className="!w-full !justify-center"
                >
                  {copied ? "Copied install commands" : "Copy install commands"}
                </InteractiveHoverButton>
              </button>
              <Link
                href="https://github.com/Sushant6095/fomo-firewall-birdeye/tree/main/apps/extension"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono-label text-mono-label inline-flex items-center gap-1 justify-center text-on-surface-variant hover:text-tertiary"
              >
                <ExternalLink className="h-3 w-3" />
                source on GitHub
              </Link>
            </div>
          </MagicCard>
        </BlurFade>
      </div>
    </section>
  );
}
