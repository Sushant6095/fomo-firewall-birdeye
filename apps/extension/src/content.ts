/**
 * FOMO Firewall content script.
 *
 * Scans the active page for Solana mint addresses and injects a small,
 * non-invasive TrapScore badge in the bottom-right corner. The badge calls
 * the FOMO Firewall backend (never Birdeye directly) and shows the verdict.
 *
 * Security:
 *  - No third-party network calls.
 *  - No DOM mutation outside of #ff-badge-root.
 *  - No reading of form inputs.
 *  - No injection on pages with `data-ff-disabled` on <html>.
 */

import { buildBadgeMarkup, type BadgeState } from "./components/detected-token-badge";

const SOLANA_ADDRESS_RE = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
const BADGE_ID = "ff-badge-root";
const BACKEND_URL = "http://localhost:3000";

type ScoreResponse = {
  address: string;
  symbol: string;
  trapScore: number;
  verdict: BadgeState extends { kind: "ready"; token: { verdict: infer V } }
    ? V
    : never;
  reasons: string[];
};

function detectCandidateAddress(): string | null {
  const url = location.href;
  const fromUrl = url.match(SOLANA_ADDRESS_RE)?.[0];
  if (fromUrl) return fromUrl;

  // Light scan of visible text only — bounded to keep cost low.
  const text = document.body?.innerText?.slice(0, 20_000) ?? "";
  return text.match(SOLANA_ADDRESS_RE)?.[0] ?? null;
}

function ensureBadgeRoot(): HTMLElement {
  let el = document.getElementById(BADGE_ID);
  if (el) return el;
  el = document.createElement("div");
  el.id = BADGE_ID;
  el.setAttribute("aria-live", "polite");
  el.setAttribute("data-ff-injected", "1");
  document.documentElement.appendChild(el);
  return el;
}

function render(state: BadgeState) {
  const root = ensureBadgeRoot();
  root.innerHTML = buildBadgeMarkup(state);
}

async function fetchScore(address: string): Promise<ScoreResponse | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/token/${address}/score`, {
      method: "GET",
      headers: { accept: "application/json" }
    });
    if (!res.ok) return null;
    return (await res.json()) as ScoreResponse;
  } catch {
    return null;
  }
}

async function run() {
  if (document.documentElement.hasAttribute("data-ff-disabled")) return;

  const address = detectCandidateAddress();
  if (!address) return;

  render({ kind: "loading" });

  const resp = await fetchScore(address);
  if (!resp) {
    render({
      kind: "error",
      message: "Backend unreachable — start FOMO Firewall locally."
    });
    return;
  }

  render({
    kind: "ready",
    token: {
      symbol: resp.symbol,
      trapScore: resp.trapScore,
      verdict: resp.verdict as never
    }
  });
}

// Initial run + lightweight re-detection on SPA navigation.
run();

let lastHref = location.href;
const observer = new MutationObserver(() => {
  if (location.href !== lastHref) {
    lastHref = location.href;
    run();
  }
});
observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});
