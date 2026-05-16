import {
  formatTrapAlert,
  scoreKeyboard,
  type BotReply
} from "../format";
import { caseFileUrl, fetchScore } from "../api";

const SOLANA_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

/**
 * Handler for `/score <mint>`. Pure function — takes the user-supplied
 * argument and returns a `BotReply` (text + optional inline keyboard).
 * Bot framework code lives in `client.ts` so this stays testable without
 * grammy.
 *
 * Now wired to the full snapshot metrics: priceChange1h, smartWalletNetflow,
 * insiderNetflow, liquidity stats, top-10 holders, and the analyst summary.
 */
export async function handleScoreCommand(
  arg: string,
  opts?: { watching?: boolean }
): Promise<BotReply> {
  const address = arg.trim();
  if (!address) {
    return { text: "Usage: <code>/score &lt;token mint address&gt;</code>", parseMode: "HTML" };
  }
  if (!SOLANA_RE.test(address)) {
    return {
      text: "That doesn't look like a Solana mint address.\nUsage: <code>/score &lt;mint&gt;</code>",
      parseMode: "HTML"
    };
  }
  const resp = await fetchScore(address);
  if (!resp) {
    return {
      text:
        `No FOMO Firewall snapshot yet for <code>${address.slice(0, 8)}…</code>\n` +
        `Try a token from <b>/top</b> or the dashboard's Threat Board.`,
      parseMode: "HTML"
    };
  }
  // Be defensive — older fixture data returned reasons as string[] while
  // DB data returns {code, message, contribution}[]. Accept either shape.
  const reasonStrings = (resp.reasons as unknown[])
    .slice(0, 3)
    .map((r) =>
      typeof r === "string" ? r : (r as { message?: string }).message ?? ""
    )
    .filter((s) => s.length > 0);

  const caseUrl = caseFileUrl(resp.address);
  const text = formatTrapAlert({
    symbol: resp.symbol,
    address: resp.address,
    trapScore: resp.trapScore,
    verdict: resp.verdict as Parameters<typeof formatTrapAlert>[0]["verdict"],
    reasons: reasonStrings,
    analystSummary: resp.analystSummary,
    priceChange1h: resp.priceChange1h,
    smartWalletNetflowUsd: resp.smartWalletNetflowUsd,
    insiderNetflowUsd: resp.insiderNetflowUsd,
    liquidityChange1h: resp.liquidityChange1h,
    liquidityUsd: resp.liquidityUsd,
    volume1hUsd: resp.volume1hUsd,
    top10HolderPercent: resp.top10HolderPercent,
    caseFileUrl: caseUrl
  });

  return {
    text,
    parseMode: "HTML",
    keyboard: scoreKeyboard(resp.address, caseUrl, opts?.watching ?? false),
    disableLinkPreview: true
  };
}
