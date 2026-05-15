import { strict as assert } from "node:assert";
import { formatTrapAlert } from "../format";

export async function runFormatTests(): Promise<void> {
  const text = formatTrapAlert({
    symbol: "DOGX",
    address: "DoGx",
    trapScore: 92,
    verdict: "Critical Trap",
    priceChange1h: 82.4,
    smartWalletNetflowUsd: -184_500,
    insiderNetflowUsd: -71_200,
    liquidityChange1h: -22.6,
    reasons: [
      "Smart wallets dumped $184.5K into a +82% candle.",
      "Insider/dev wallets reduced exposure by $71.2K.",
      "Liquidity fell 22.6% during the pump."
    ],
    caseFileUrl: "http://localhost:3000/token/DoGx"
  });

  assert.ok(text.includes("Critical Trap"));
  assert.ok(text.includes("$DOGX"));
  assert.ok(text.includes("TrapScore: 92/100"));
  assert.ok(text.includes("+82.4%"));
  assert.ok(text.includes("-$184.5K"));
  assert.ok(text.includes("/token/DoGx"));
  // Reasons trimmed to top 3.
  const reasonLines = text.split("\n").filter((l) => l.startsWith("•"));
  assert.equal(reasonLines.length, 3);

  // Verdict emoji present.
  assert.ok(/[🔴🟠🟡🟢]/.test(text));

  // No financial advice phrases.
  assert.ok(!/\b(buy|sell|ape)\b/i.test(text));
}
