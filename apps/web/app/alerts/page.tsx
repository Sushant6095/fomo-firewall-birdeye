import Link from "next/link";
import {
  loadAlertsData,
  verdictToTone,
  toneToColorToken,
  shortAddress,
  relativeTime,
  type Tone
} from "../_lib/data";
import { DemoModeBanner } from "../_components/demo-mode-banner";
import {
  WatchlistAddButton,
  WatchlistItem,
  AlertPrefsPanel
} from "../_components/alerts-actions";
import {
  IPhone15Pro,
  NumberTicker,
  AnimatedList as MagicAnimatedList,
  MagicCard,
  BlurFade
} from "../_components/ui/magicui";
import { AlertsConnectButtons } from "../_components/alerts-connect-buttons";
import { getAlertPrefs, getWatchlist } from "@/lib/server/user-state";
import { getTokenScore } from "@/lib/server/score-service";
import type { TrapVerdict } from "@fomo/shared";

export const dynamic = "force-dynamic";
export const revalidate = 15;

const CHANNELS: {
  icon: string;
  name: string;
  status: string;
  active: boolean;
}[] = [
  { icon: "send", name: "Telegram", status: "Connected", active: true },
  { icon: "extension", name: "Extension", status: "Active", active: true },
  {
    icon: "notifications_off",
    name: "Web Push",
    status: "Disabled",
    active: false
  }
];

const verdictLabel: Record<TrapVerdict, { level: string; icon: string }> = {
  "Critical Trap": { level: "CRITICAL", icon: "warning" },
  "Exit Warning": { level: "WARNING", icon: "error" },
  "Risky Chase": { level: "WATCH", icon: "visibility" },
  "Clean Pump": { level: "CLEAN", icon: "verified" }
};

function alertBorderByTone(tone: Tone): string {
  if (tone === "critical") return "border-l-error";
  if (tone === "warning") return "border-l-secondary";
  if (tone === "risky") return "border-l-tertiary";
  return "border-l-success";
}

function alertIconColor(tone: Tone): string {
  if (tone === "critical") return "text-error";
  if (tone === "warning") return "text-secondary";
  if (tone === "risky") return "text-tertiary";
  return "text-success";
}

function alertPillByTone(tone: Tone): string {
  if (tone === "critical") return "bg-error/10 text-error border-error/20";
  if (tone === "warning") return "bg-secondary/10 text-secondary border-secondary/20";
  if (tone === "risky") return "bg-tertiary/10 text-tertiary border-tertiary/20";
  return "bg-success/10 text-success border-success/20";
}

function alertHoverBg(tone: Tone): string {
  if (tone === "critical") return "bg-error/5";
  if (tone === "warning") return "bg-secondary/5";
  if (tone === "risky") return "bg-tertiary/5";
  return "bg-success/5";
}

export default async function AlertsPage() {
  const { alerts } = await loadAlertsData();
  const prefs = getAlertPrefs();

  // Real watchlist from user-state
  const watchedAddresses = getWatchlist();
  const watchlistRows = (
    await Promise.all(
      watchedAddresses.map(async (addr) => {
        const { row } = await getTokenScore(addr);
        return row;
      })
    )
  ).filter((r): r is NonNullable<typeof r> => r != null);
  const source: "db" | "fixture" = watchlistRows[0]?.source ?? "fixture";

  const firstCritical = alerts.find((a) => a.verdict === "Critical Trap");

  return (
    <>
      <DemoModeBanner source={source} />
      <main className="grid flex-grow grid-cols-1 gap-xl p-container-margin lg:grid-cols-12">
        {/* Left column */}
        <div className="flex flex-col gap-lg lg:col-span-4">
          {/* Channels — AnimatedSubscribeButton for each */}
          <section className="flex flex-col gap-sm">
            <h2 className="font-headline-sm text-headline-sm flex items-center gap-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-sm">cable</span>
              Alert Channels
            </h2>
            <AlertsConnectButtons />
          </section>

          {/* Watchlist — REAL rows + interactive remove */}
          <section className="flex flex-grow flex-col gap-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-headline-sm flex items-center gap-sm text-on-surface">
                <span className="material-symbols-outlined text-sm">radar</span>
                Active Watchlist{" "}
                <span className="font-mono-label text-mono-label ml-1 text-on-surface-variant">
                  ({watchlistRows.length})
                </span>
              </h2>
              <WatchlistAddButton />
            </div>
            <div className="flex max-h-[440px] flex-col gap-sm overflow-y-auto pr-2">
              {watchlistRows.length === 0 ? (
                <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-low p-md text-center font-body-sm text-body-sm text-on-surface-variant">
                  No tokens being watched. Hit{" "}
                  <kbd className="rounded border border-outline-variant bg-surface-container-high px-1.5 py-0.5 font-mono text-[10px]">
                    ⌘K
                  </kbd>{" "}
                  to add one.
                </div>
              ) : (
                watchlistRows.map((row) => (
                  <WatchlistItem
                    key={row.address}
                    row={{
                      address: row.address,
                      symbol: row.symbol,
                      trapScore: row.trapScore,
                      verdict: row.verdict
                    }}
                  />
                ))
              )}
            </div>
          </section>

          {/* Alert preferences — fully interactive */}
          <AlertPrefsPanel initial={prefs} />
        </div>

        {/* Right column — alert stream */}
        <div className="flex h-full flex-col gap-md lg:col-span-8">
          <div className="flex items-end justify-between border-b border-outline-variant/30 pb-sm">
            <h2 className="font-headline-md text-headline-md flex items-center gap-sm text-on-surface">
              Live Intelligence Stream
              <span className="ml-2 h-2 w-2 animate-pulse rounded-full bg-primary" />
              <span className="font-mono-label text-mono-label ml-2 text-on-surface-variant">
                {alerts.length} events
              </span>
            </h2>
            <div className="flex gap-xs rounded-lg border border-outline-variant/50 bg-surface-container p-1">
              <button
                type="button"
                className="font-mono-label text-mono-label rounded bg-surface-container-highest px-sm py-1 text-on-surface shadow-sm"
              >
                All
              </button>
              <button
                type="button"
                className="font-mono-label text-mono-label rounded px-sm py-1 text-on-surface-variant transition-colors hover:bg-surface-variant/50 hover:text-on-surface"
              >
                Critical
              </button>
              <button
                type="button"
                className="font-mono-label text-mono-label rounded px-sm py-1 text-on-surface-variant transition-colors hover:bg-surface-variant/50 hover:text-on-surface"
              >
                Smart Money
              </button>
              <button
                type="button"
                className="font-mono-label text-mono-label rounded px-sm py-1 text-on-surface-variant transition-colors hover:bg-surface-variant/50 hover:text-on-surface"
              >
                Insider
              </button>
            </div>
          </div>

          {alerts.length === 0 ? (
            <div className="font-body-sm text-body-sm rounded-xl border border-dashed border-outline-variant/40 bg-surface-container-low/60 p-12 text-center text-on-surface-variant">
              No alerts in the last 24h.
            </div>
          ) : (
            <div className="flex flex-col gap-sm overflow-y-auto pb-xl pr-2">
              {alerts.map((alert, idx) => {
                const tone = verdictToTone(alert.verdict);
                const meta = verdictLabel[alert.verdict];
                return (
                  <div key={alert.id}>
                    <div
                      className={`group relative flex gap-md overflow-hidden rounded-r-xl border border-outline-variant bg-surface-container p-md border-l-4 ${alertBorderByTone(tone)}`}
                    >
                      <div
                        className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 ${alertHoverBg(tone)}`}
                      />
                      {tone === "critical" ? (
                        <div className="border-beam pointer-events-none absolute inset-0" />
                      ) : null}
                      <div className="pt-1">
                        <span
                          className={`material-symbols-outlined ${alertIconColor(tone)}`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {meta.icon}
                        </span>
                      </div>
                      <div className="flex flex-grow flex-col gap-xs">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-sm">
                            <span
                              className={`font-mono-data text-mono-data rounded border px-2 py-0.5 ${alertPillByTone(tone)}`}
                            >
                              {meta.level}
                            </span>
                            <span className="font-headline-sm text-headline-sm text-on-surface">
                              ${alert.symbol}
                            </span>
                            <span className="font-mono-label text-mono-label uppercase text-on-surface-variant">
                              {alert.type.replace(/_/g, " ")}
                            </span>
                          </div>
                          <span className="font-mono-data text-[11px] text-on-surface-variant">
                            {relativeTime(alert.firedAt)}
                          </span>
                        </div>
                        <p className="font-body-md text-body-md mt-1 font-semibold text-on-surface">
                          {alert.headline}
                        </p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          {alert.message}
                        </p>
                        <div className="mt-sm flex items-center gap-md border-t border-outline-variant/30 pt-sm">
                          <div className="flex items-center gap-xs">
                            <span className="font-mono-label text-mono-label text-on-surface-variant">
                              TrapScore:
                            </span>
                            <span
                              className={`font-mono-data text-mono-data flex items-center font-bold ${alertIconColor(tone)}`}
                            >
                              {alert.trapScore}
                            </span>
                          </div>
                          <Link
                            href={`/case-file/${alert.tokenAddress}`}
                            className="font-mono-label text-mono-label ml-auto flex items-center gap-xs text-primary underline-offset-2 hover:underline"
                          >
                            Open Case File
                            <span className="material-symbols-outlined text-[14px]">
                              open_in_new
                            </span>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Telegram preview after the first critical alert */}
                    {idx === alerts.indexOf(firstCritical!) && firstCritical ? (
                      <TelegramPreview alert={firstCritical} />
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function TelegramPreview({
  alert
}: {
  alert: {
    symbol: string;
    trapScore: number;
    headline: string;
    message: string;
    tokenAddress: string;
  };
}) {
  return (
    <div className="my-md ml-xl max-w-sm overflow-hidden rounded-2xl border border-[#334155] bg-[#0f172a]/80 p-4 shadow-2xl backdrop-blur-md relative">
      <div className="absolute left-1/2 top-0 z-10 flex h-4 w-24 -translate-x-1/2 items-end justify-center rounded-b-xl border border-t-0 border-[#334155] bg-background pb-1">
        <div className="h-1 w-12 rounded-full bg-[#334155]" />
      </div>
      <div className="mb-3 mt-2 flex items-center gap-2 border-b border-[#334155]/50 pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-background">
          FF
        </div>
        <div>
          <div className="font-headline-sm text-[14px] leading-tight text-white">
            FOMO Firewall Bot
          </div>
          <div className="font-body-sm text-[11px] leading-tight text-[#94a3b8]">
            bot · just now
          </div>
        </div>
      </div>
      <div className="relative rounded-xl rounded-tl-sm bg-[#1e293b] p-3 shadow-md">
        <div className="font-mono-data mb-1 text-[10px] font-bold tracking-wider text-error">
          🚨 CRITICAL TRAP · ${alert.symbol}
        </div>
        <div className="font-body-sm mb-2 leading-relaxed text-white">
          {alert.headline}
        </div>
        <div className="font-body-sm mb-2 text-[11px] leading-relaxed text-[#cbd5e1]">
          {alert.message}
        </div>
        <div className="mb-2 rounded border border-error/30 bg-background/50 p-2">
          <div className="font-mono-data mb-1 flex justify-between text-[11px]">
            <span className="text-[#94a3b8]">TrapScore</span>
            <span className="font-bold text-error">{alert.trapScore}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#334155]">
            <div
              className="h-full bg-error"
              style={{ width: `${alert.trapScore}%` }}
            />
          </div>
        </div>
        <div className="mt-2 flex gap-2">
          <a
            href={`/case-file/${alert.tokenAddress}`}
            className="flex-1 rounded bg-primary py-1.5 text-center text-[12px] font-medium text-on-primary transition-colors hover:bg-primary/90"
          >
            Open Case File
          </a>
          <button
            type="button"
            className="flex-1 rounded border border-[#334155] bg-surface-container py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-surface-container-high"
          >
            Mute Token
          </button>
        </div>
        <div className="font-mono-data mt-2 text-right text-[9px] text-[#64748b]">
          {new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          })}
        </div>
      </div>
    </div>
  );
}
