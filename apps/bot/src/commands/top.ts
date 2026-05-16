import { fetchTrending } from "../api";
import {
  formatLeaderboard,
  homeKeyboard,
  type BotReply,
  type LeaderboardRow
} from "../format";
import type { TrapVerdict } from "@fomo/shared";

/**
 * `/top` — top trending tokens by TrapScore. Pulls from the same
 * trending-risk endpoint the dashboard uses, so the bot mirrors the
 * web Threat Board exactly.
 */
export async function handleTopCommand(): Promise<BotReply> {
  const tokens = await fetchTrending(20);
  if (tokens.length === 0) {
    return {
      text:
        "⚠ <b>No trending data right now.</b>\n\n" +
        "The worker may be mid-cycle. Try <b>/top</b> again in ~60s.",
      parseMode: "HTML"
    };
  }
  // Sort desc by TrapScore so the riskiest sit at the top.
  const sorted: LeaderboardRow[] = tokens
    .map((t) => ({
      symbol: t.symbol,
      address: t.address,
      trapScore: t.trapScore,
      verdict: t.verdict as TrapVerdict,
      priceChange1h: t.priceChange1h,
      smartWalletNetflowUsd: t.smartWalletNetflowUsd
    }))
    .sort((a, b) => b.trapScore - a.trapScore);

  return {
    text: formatLeaderboard("Top trending · ranked by TrapScore", sorted, ""),
    parseMode: "HTML",
    keyboard: homeKeyboard(),
    disableLinkPreview: true
  };
}

/**
 * `/traps` — Critical Trap + Exit Warning only. The signal version
 * of /top — strips the noise and shows what to avoid right now.
 */
export async function handleTrapsCommand(): Promise<BotReply> {
  const tokens = await fetchTrending(30);
  const dangerous: LeaderboardRow[] = tokens
    .filter(
      (t) => t.verdict === "Critical Trap" || t.verdict === "Exit Warning"
    )
    .map((t) => ({
      symbol: t.symbol,
      address: t.address,
      trapScore: t.trapScore,
      verdict: t.verdict as TrapVerdict,
      priceChange1h: t.priceChange1h,
      smartWalletNetflowUsd: t.smartWalletNetflowUsd
    }))
    .sort((a, b) => b.trapScore - a.trapScore);

  if (dangerous.length === 0) {
    return {
      text:
        "✅ <b>No traps active right now.</b>\n\n" +
        "Nothing trending currently scores above 60.\n" +
        "Run <b>/top</b> for the full leaderboard.",
      parseMode: "HTML"
    };
  }
  return {
    text: formatLeaderboard("Active traps · 61+ score", dangerous, ""),
    parseMode: "HTML",
    keyboard: homeKeyboard(),
    disableLinkPreview: true
  };
}
