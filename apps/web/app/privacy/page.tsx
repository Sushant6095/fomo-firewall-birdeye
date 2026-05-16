import * as React from "react";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — FOMO Firewall",
  description:
    "Privacy policy for the FOMO Firewall web app, browser extension, and Telegram bot."
};

const UPDATED = "May 16, 2026";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-container-margin py-12">
      <div className="mb-8">
        <Link href="/" className="text-sm text-on-surface-variant hover:text-on-surface">
          ← Home
        </Link>
      </div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-on-surface">
        Privacy Policy
      </h1>
      <p className="mb-8 font-mono text-xs uppercase tracking-widest text-on-surface-variant">
        Last updated: {UPDATED}
      </p>

      <Section title="Summary">
        <p>
          FOMO Firewall is a risk-intelligence tool. We do not collect, sell,
          or share personal information. We do not place advertising or
          third-party trackers. There is no wallet connection, no trading
          execution, and no financial-advice content.
        </p>
      </Section>

      <Section title="What we collect">
        <ul className="ml-4 list-disc space-y-2">
          <li>
            <strong className="text-on-surface">Nothing identifying.</strong>{" "}
            We do not require accounts, email addresses, names, phone numbers,
            or wallet signatures. There is no login.
          </li>
          <li>
            <strong className="text-on-surface">Token mint addresses you query.</strong>{" "}
            When you paste a Solana mint into the web app, extension popup, or
            Telegram bot, we send that mint to our backend so we can return a
            TrapScore. Mints are public on-chain identifiers — not personal data.
          </li>
          <li>
            <strong className="text-on-surface">Anonymous server logs.</strong>{" "}
            Our server records standard request metadata (timestamp, route,
            status code, IP for rate limiting). Logs are rotated within 30 days
            and never joined to identity.
          </li>
          <li>
            <strong className="text-on-surface">Telegram chat IDs you provide.</strong>{" "}
            If you use the Telegram bot&apos;s <code className="rounded bg-surface-container px-1">/watch</code> command,
            your chat ID is stored locally so we can deliver alerts to the right
            place. Remove it with <code className="rounded bg-surface-container px-1">/unwatch</code>.
            We do not have access to your Telegram identity or messages.
          </li>
        </ul>
      </Section>

      <Section title="What the browser extension stores">
        <ul className="ml-4 list-disc space-y-2">
          <li>
            Your <strong className="text-on-surface">watchlist</strong> and{" "}
            <strong className="text-on-surface">alert preferences</strong> live in{" "}
            <code className="rounded bg-surface-container px-1">chrome.storage.local</code>{" "}
            on your machine. We never read them off-device.
          </li>
          <li>
            The extension calls <strong className="text-on-surface">only our backend</strong>{" "}
            (FOMO Firewall API). It does not call Birdeye, Solana RPC, wallets,
            or third-party trackers directly.
          </li>
          <li>
            We use the <code className="rounded bg-surface-container px-1">activeTab</code>{" "}
            permission to detect the mint address on the page you&apos;re currently
            viewing — only when you click the extension. We do not read other tabs.
          </li>
        </ul>
      </Section>

      <Section title="What we do NOT do">
        <ul className="ml-4 list-disc space-y-2">
          <li>We do not sell user data.</li>
          <li>We do not run advertising or affiliate tracking.</li>
          <li>We do not use Google Analytics, Mixpanel, Segment, or similar.</li>
          <li>We do not request your wallet&apos;s private keys or seed phrase.</li>
          <li>We do not execute trades on your behalf.</li>
          <li>We do not provide financial advice — TrapScore is risk intelligence.</li>
        </ul>
      </Section>

      <Section title="Third-party data sources">
        <p>
          TrapScore is computed from public Solana on-chain data fetched server-side
          via the <a href="https://birdeye.so" target="_blank" rel="noopener noreferrer" className="text-tertiary hover:underline">Birdeye Data API</a>.
          The Birdeye API key is server-only — never exposed to your browser, extension,
          or Telegram client.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          Because we don&apos;t collect personal data, there&apos;s little to delete.
          To remove your Telegram subscriptions, send <code className="rounded bg-surface-container px-1">/unwatch</code> for each token.
          To clear extension-local data, uninstall the extension or use Chrome&apos;s site settings.
          For any other concern, open a GitHub issue at{" "}
          <a
            href="https://github.com/Sushant6095/fomo-firewall-birdeye/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-tertiary hover:underline"
          >
            github.com/Sushant6095/fomo-firewall-birdeye/issues
          </a>
          .
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          We&apos;ll update this page whenever the product&apos;s data handling
          changes. The &quot;Last updated&quot; date at the top will reflect any change.
          Material changes will also be noted in our GitHub repository&apos;s release notes.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Open an issue on{" "}
          <a
            href="https://github.com/Sushant6095/fomo-firewall-birdeye/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-tertiary hover:underline"
          >
            GitHub
          </a>{" "}
          for anything privacy-related. There&apos;s no human inbox monitored
          24/7 — issues are the canonical channel.
        </p>
      </Section>

      <div className="mt-12 border-t border-outline-variant/30 pt-6">
        <p className="text-xs text-on-surface-variant">
          FOMO Firewall provides risk intelligence based on on-chain heuristics.
          Not financial advice. High TrapScores indicate elevated structural
          risk, not certainty of malice.
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
