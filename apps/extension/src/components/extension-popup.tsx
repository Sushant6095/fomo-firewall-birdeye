import * as React from "react";
import {
  CRITICAL_TRAP_TOKEN,
  EXIT_WARNING_TOKEN,
  fixtureByAddress,
  shortAddress
} from "@fomo/ui";
import type { TokenRiskFixture } from "@fomo/ui";

type ScoreResponse = {
  address: string;
  symbol: string;
  trapScore: number;
  verdict: TokenRiskFixture["verdict"];
  reasons: string[];
};

const SOLANA_ADDRESS_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

const DEMO_TOKEN: TokenRiskFixture = CRITICAL_TRAP_TOKEN;

function backendUrl(): string {
  // Extension MUST NOT call Birdeye directly. Only the FOMO Firewall backend.
  // Injected at build time by esbuild's `define` from build.mjs:
  //   pnpm build → https://fomo-firewall-birdeye.vercel.app
  //   pnpm dev   → http://localhost:8727
  return (
    (typeof process !== "undefined" &&
      process.env?.EXTENSION_API_BASE_URL) ||
    "https://fomo-firewall-birdeye.vercel.app"
  );
}

async function fetchScore(address: string): Promise<ScoreResponse | null> {
  try {
    const res = await fetch(`${backendUrl()}/api/token/${address}/score`, {
      method: "GET",
      headers: { accept: "application/json" }
    });
    if (!res.ok) return null;
    return (await res.json()) as ScoreResponse;
  } catch {
    return null;
  }
}

function verdictTone(v: TokenRiskFixture["verdict"]) {
  switch (v) {
    case "Critical Trap":
      return "ff-tone-critical";
    case "Exit Warning":
      return "ff-tone-warning";
    case "Risky Chase":
      return "ff-tone-risky";
    case "Clean Pump":
      return "ff-tone-clean";
  }
}

export function ExtensionPopup() {
  const [value, setValue] = React.useState("");
  const [token, setToken] = React.useState<TokenRiskFixture | null>(DEMO_TOKEN);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [demoMode, setDemoMode] = React.useState(true);

  React.useEffect(() => {
    // If the active tab has a Solana address in its URL or stored state, prefill.
    try {
      chrome.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0]?.url ?? "";
        const match = url.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/);
        if (match) setValue(match[0]);
      });
    } catch {
      /* not in extension context */
    }
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    if (!SOLANA_ADDRESS_RE.test(trimmed)) {
      setError("That doesn't look like a Solana mint address.");
      return;
    }
    setError(null);
    setLoading(true);
    setDemoMode(false);

    const fixture = fixtureByAddress(trimmed);
    if (fixture) {
      setToken(fixture);
      setLoading(false);
      setDemoMode(true);
      return;
    }

    const resp = await fetchScore(trimmed);
    if (resp) {
      setToken({
        ...EXIT_WARNING_TOKEN,
        address: resp.address,
        symbol: resp.symbol,
        trapScore: resp.trapScore,
        verdict: resp.verdict,
        reasons: resp.reasons
      });
    } else {
      setError(
        "Couldn't reach the FOMO Firewall backend. Start `pnpm dev` in apps/web."
      );
    }
    setLoading(false);
  };

  return (
    <div className="ff-popup">
      <header className="ff-popup__header">
        <div className="ff-logo">
          <span className="ff-logo__mark" aria-hidden>
            🔥
          </span>
          <div className="ff-logo__text">
            <strong>FOMO Firewall</strong>
            <small>Exit-liquidity intel</small>
          </div>
        </div>
      </header>

      <form onSubmit={submit} className="ff-form">
        <label className="ff-form__label" htmlFor="ff-address">
          Paste Solana token address
        </label>
        <div className="ff-form__row">
          <input
            id="ff-address"
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            placeholder="So111…1112"
            className="ff-form__input"
            aria-label="Token address"
          />
          <button type="submit" className="ff-form__submit" disabled={loading}>
            {loading ? "Scoring…" : "Run TrapScore"}
          </button>
        </div>
        {error ? (
          <p className="ff-form__error">{error}</p>
        ) : (
          <p className="ff-form__hint">
            Runs server-side. The extension never calls Birdeye directly.
          </p>
        )}
      </form>

      {token && (
        <article className={`ff-card ${verdictTone(token.verdict)}`}>
          <header className="ff-card__header">
            <div className="ff-card__symbol">
              <strong>${token.symbol}</strong>
              <small>{shortAddress(token.address)}</small>
            </div>
            <span className="ff-badge">{token.verdict}</span>
          </header>

          <div className="ff-card__score">
            <span className="ff-card__num">{token.trapScore}</span>
            <span className="ff-card__num-suffix">/100 TrapScore</span>
          </div>

          <ul className="ff-card__reasons">
            {token.reasons.slice(0, 3).map((r) => (
              <li key={r}>
                <span className="ff-dot" aria-hidden />
                {r}
              </li>
            ))}
          </ul>

          <footer className="ff-card__footer">
            <a
              href={`${backendUrl()}/token/${token.address}`}
              target="_blank"
              rel="noreferrer"
              className="ff-btn ff-btn--primary"
            >
              Open case file
            </a>
            <button
              type="button"
              className="ff-btn"
              onClick={() => {
                try {
                  chrome.storage?.local?.set?.({
                    [`watch:${token.address}`]: Date.now()
                  });
                } catch {
                  /* ignore */
                }
              }}
            >
              Watch token
            </button>
          </footer>
        </article>
      )}

      {demoMode && (
        <p className="ff-demo-note">
          Demo data. Sync with your local backend to score live tokens.
        </p>
      )}
    </div>
  );
}
