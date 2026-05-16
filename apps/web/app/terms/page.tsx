import * as React from "react";
import Link from "next/link";

export const metadata = {
  title: "Terms of Use — FOMO Firewall",
  description:
    "Terms of use for the FOMO Firewall web app, browser extension, and Telegram bot."
};

const UPDATED = "May 16, 2026";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-container-margin py-12">
      <div className="mb-8">
        <Link href="/" className="text-sm text-on-surface-variant hover:text-on-surface">
          ← Home
        </Link>
      </div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-on-surface">
        Terms of Use
      </h1>
      <p className="mb-8 font-mono text-xs uppercase tracking-widest text-on-surface-variant">
        Last updated: {UPDATED}
      </p>

      <Section title="What FOMO Firewall is">
        <p>
          FOMO Firewall is a <strong className="text-on-surface">risk-intelligence tool</strong>{" "}
          for Solana token activity. It computes a TrapScore (0–100) and a
          verdict band based on on-chain signals — smart-wallet flow, insider
          behaviour, liquidity changes, holder concentration, token security.
        </p>
        <p>
          It is <strong className="text-on-surface">not</strong> investment advice,
          a brokerage, a custodian, or a trading platform.
        </p>
      </Section>

      <Section title="No financial advice">
        <p>
          Nothing on this site, in the browser extension, or in the Telegram
          bot constitutes financial, investment, legal, or tax advice. TrapScore
          is a heuristic risk score derived from public on-chain data. Low scores
          do not guarantee safety. High scores do not guarantee malice.
        </p>
        <p>
          You are solely responsible for your own decisions. Do your own research.
        </p>
      </Section>

      <Section title="No trading, no custody">
        <ul className="ml-4 list-disc space-y-2">
          <li>We never ask for your wallet&apos;s private key or seed phrase.</li>
          <li>We do not execute trades, swaps, or bridges on your behalf.</li>
          <li>We do not custody any of your assets.</li>
          <li>We do not endorse buying, selling, or holding any specific token.</li>
        </ul>
      </Section>

      <Section title="Data accuracy">
        <p>
          We fetch market data from the{" "}
          <a href="https://birdeye.so" target="_blank" rel="noopener noreferrer" className="text-tertiary hover:underline">
            Birdeye API
          </a>{" "}
          and compute TrapScore from those snapshots. Birdeye data may be
          incomplete, delayed, or incorrect. We make no warranty that scores
          reflect reality at the millisecond a trade executes.
        </p>
      </Section>

      <Section title="Acceptable use">
        <p>You agree not to:</p>
        <ul className="ml-4 list-disc space-y-1.5">
          <li>Scrape, mirror, or republish TrapScore data without attribution.</li>
          <li>Rate-limit-bomb the API or attempt denial-of-service.</li>
          <li>Use the product to harass, defame, or harm any token project.</li>
          <li>Misrepresent our scores or verdict bands in marketing materials.</li>
        </ul>
      </Section>

      <Section title="Service availability">
        <p>
          We offer the service as-is. Uptime is best-effort. We may pause,
          throttle, or shut down any surface (web, extension, bot) at any time
          without notice. There is no SLA, no refund mechanism, and no warranty.
        </p>
      </Section>

      <Section title="Limitation of liability">
        <p>
          To the maximum extent permitted by law, FOMO Firewall and its
          maintainer shall not be liable for any direct, indirect, incidental,
          consequential, or punitive damages arising from your use of, or
          reliance on, the product. Including but not limited to trading losses,
          missed opportunities, or data inaccuracies.
        </p>
      </Section>

      <Section title="Open source">
        <p>
          The source code is available under the MIT license at{" "}
          <a
            href="https://github.com/Sushant6095/fomo-firewall-birdeye"
            target="_blank"
            rel="noopener noreferrer"
            className="text-tertiary hover:underline"
          >
            github.com/Sushant6095/fomo-firewall-birdeye
          </a>
          . You may fork, audit, or self-host. The license applies to the code
          only — &quot;FOMO Firewall&quot; and the Pulse Shield logo are not licensed
          for derivative branding.
        </p>
      </Section>

      <Section title="Changes to these terms">
        <p>
          We&apos;ll update this page whenever terms change. The &quot;Last updated&quot;
          date at the top will reflect any change. Continued use of the product
          after a change means you accept the new terms.
        </p>
      </Section>

      <div className="mt-12 border-t border-outline-variant/30 pt-6">
        <p className="text-xs text-on-surface-variant">
          See also our{" "}
          <Link href="/privacy" className="text-tertiary hover:underline">
            Privacy Policy
          </Link>
          . Open a GitHub issue for anything contractual.
        </p>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xl font-semibold text-on-surface">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-on-surface-variant">
        {children}
      </div>
    </section>
  );
}
