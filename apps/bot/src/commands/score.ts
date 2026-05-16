import { formatTrapAlert } from "../format";
import { caseFileUrl, fetchScore } from "../api";

const SOLANA_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

/**
 * Handler for `/score <mint>`. Pure function — takes the user-supplied
 * argument and returns the reply text. Bot framework code lives in
 * `client.ts` so this stays testable without grammy.
 */
export async function handleScoreCommand(arg: string): Promise<string> {
  const address = arg.trim();
  if (!address) {
    return "Usage: /score <token mint address>";
  }
  if (!SOLANA_RE.test(address)) {
    return "That doesn't look like a Solana mint address. Usage: /score <mint>";
  }
  const resp = await fetchScore(address);
  if (!resp) {
    return `No FOMO Firewall snapshot yet for ${address}. Try a token from the dashboard's Risk Board.`;
  }
  // Be defensive — older fixture data returned reasons as string[] while
  // DB data returns {code, message, contribution}[]. Accept either shape.
  const reasonStrings = (resp.reasons as unknown[])
    .slice(0, 3)
    .map((r) =>
      typeof r === "string"
        ? r
        : (r as { message?: string }).message ?? ""
    )
    .filter((s) => s.length > 0);

  return formatTrapAlert({
    symbol: resp.symbol,
    address: resp.address,
    trapScore: resp.trapScore,
    verdict: resp.verdict as Parameters<typeof formatTrapAlert>[0]["verdict"],
    reasons: reasonStrings,
    caseFileUrl: caseFileUrl(resp.address)
  });
}
