import { loadHomeData } from "./_lib/data";
import { DemoModeBanner } from "./_components/demo-mode-banner";
import {
  HomeHero,
  HomeRiskTicker,
  HomeFeaturedOrbit,
  HomeSignalBento,
  HomeAlertWire,
  HomeHowItWorks,
  HomeStatsRow
} from "./_components/home-hero";
import { HomeChannelsCTA } from "./_components/home-channels-cta";

export const dynamic = "force-dynamic";
export const revalidate = 15;

export default async function TerminalHomePage() {
  const { rows, alerts, featured, featuredFixture } = await loadHomeData();
  const source: "db" | "fixture" = rows[0]?.source ?? "fixture";

  const featuredScore = featured?.trapScore ?? featuredFixture.trapScore;
  const featuredSymbol = featured?.symbol ?? featuredFixture.symbol;
  const featuredAddress = featured?.address ?? featuredFixture.address;
  const featuredVerdict = featured?.verdict ?? featuredFixture.verdict;
  const featuredReasons = featuredFixture.reasons.slice(0, 3);

  const monitored = rows.length;
  const critical = rows.filter((r) => r.verdict === "Critical Trap").length;
  const warning = rows.filter((r) => r.verdict === "Exit Warning").length;
  const risky = rows.filter((r) => r.verdict === "Risky Chase").length;
  const clean = rows.filter((r) => r.verdict === "Clean Pump").length;

  // Estimate signal-firing counts from rows.
  const signalCounts: Record<string, number> = {
    SMART_MONEY_DIVERGENCE: rows.filter(
      (r) => r.smartWalletNetflowUsd < -1_000 && r.priceChange1h > 0
    ).length,
    INSIDER_EXIT_PRESSURE: rows.filter((r) => r.insiderNetflowUsd < -1_000).length,
    LIQUIDITY_FRAGILITY: rows.filter(
      (r) => r.liquidityChange1h < -3 && r.priceChange1h > 0
    ).length,
    SELL_PRESSURE_GREEN: rows.filter(
      (r) => r.priceChange1h > 5 && r.smartWalletNetflowUsd < 0
    ).length,
    HOLDER_CONCENTRATION: rows.filter((r) => r.top10HolderPercent > 50).length,
    STATIC_TOKEN_RISK: critical,
    ABNORMAL_VOLUME_LIQUIDITY: rows.filter(
      (r) => r.liquidityUsd > 0 && r.volume1hUsd / r.liquidityUsd > 2.5
    ).length
  };

  return (
    <>
      <DemoModeBanner source={source} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-md pb-xl md:px-container-margin">
        <HomeHero
          featuredAddress={featuredAddress}
          monitoredCount={monitored}
          criticalCount={critical}
        />

        {/* Three delivery surfaces — Web / Telegram / Extension */}
        <HomeChannelsCTA />

        <HomeRiskTicker rows={rows} />

        {/* Hero stats */}
        <HomeStatsRow
          monitored={monitored}
          critical={critical}
          warning={warning}
          alerts24h={alerts.length}
        />

        {/* Featured 2-col: Orbit + Reasons */}
        <div className="mt-xl grid grid-cols-1 gap-gutter lg:grid-cols-12">
          <div className="lg:col-span-7">
            <HomeFeaturedOrbit
              symbol={featuredSymbol}
              trapScore={featuredScore}
              address={featuredAddress}
              verdict={featuredVerdict}
              reasons={featuredReasons}
            />
          </div>

          {/* Right: Terminal Wire */}
          <aside className="flex flex-col gap-gutter lg:col-span-5">
            <div className="flex h-full min-h-[440px] flex-col rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5">
              <div className="mb-5 flex items-center justify-between border-b border-outline-variant/10 pb-3">
                <h3 className="font-headline-sm text-headline-sm flex items-center gap-2 text-on-surface">
                  <span className="material-symbols-outlined animate-pulse text-error">
                    crisis_alert
                  </span>
                  Terminal Wire
                </h3>
                <span className="font-mono-label text-mono-label rounded bg-surface-container px-2 py-1 text-on-surface-variant">
                  LIVE
                </span>
              </div>
              <div className="relative flex flex-1 flex-col overflow-hidden">
                <HomeAlertWire alerts={alerts} />
              </div>
            </div>
          </aside>
        </div>

        {/* Signal Bento */}
        <h3 className="font-headline-md text-headline-md mt-xl mb-4 flex items-center gap-2 text-on-surface">
          <span className="material-symbols-outlined text-tertiary">
            monitoring
          </span>
          Signal Coverage
          <span className="font-mono-label text-mono-label ml-2 text-on-surface-variant">
            7 detectors · {Object.values(signalCounts).reduce((a, b) => a + b, 0)} fires now
          </span>
        </h3>
        <HomeSignalBento counts={signalCounts} />

        {/* How it works AnimatedBeam */}
        <h3 className="font-headline-md text-headline-md mt-xl mb-4 flex items-center gap-2 text-on-surface">
          <span className="material-symbols-outlined text-primary">bolt</span>
          How it works
        </h3>
        <HomeHowItWorks />

        {/* Status line */}
        <div className="mt-xl flex flex-wrap items-center justify-between gap-md rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5">
          <div className="font-mono-label text-mono-label flex items-center gap-2 text-on-surface-variant">
            <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
            {clean} clean · {risky} risky · {warning} exit warning · {critical}{" "}
            critical
          </div>
          <div className="font-mono-label text-mono-label text-on-surface-variant opacity-70">
            Built on Birdeye Data · TrapScore engine v1
          </div>
        </div>
      </main>
    </>
  );
}
