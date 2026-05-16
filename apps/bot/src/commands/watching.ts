import type { FomoDb } from "@fomo/db";
import { escHtml, shortAddress, type BotReply } from "../format";

/**
 * `/watching` — list the addresses this chat has subscribed to via `/watch`.
 * Includes ticker symbols when the token has been seen by the worker.
 */
export async function handleWatchingCommand(
  db: FomoDb,
  chatId: string
): Promise<BotReply> {
  const addresses = await db.listWatches(chatId);
  if (addresses.length === 0) {
    return {
      text:
        "👁 <b>You aren't watching anything yet.</b>\n\n" +
        "Use <code>/watch &lt;mint&gt;</code> to subscribe to a token.\n" +
        "I'll push you an alert whenever its TrapScore crosses a verdict line.",
      parseMode: "HTML"
    };
  }
  const lines: string[] = [
    `👁 <b>Watching ${addresses.length} token(s)</b>`,
    ""
  ];
  for (const address of addresses) {
    const stored = await db.getLatestScore(address);
    if (stored) {
      lines.push(
        `• <b>$${escHtml(stored.symbol)}</b>  <code>${stored.trapScore}</code>  <i>${escHtml(stored.verdict)}</i>`
      );
    } else {
      lines.push(
        `• <code>${shortAddress(address)}</code>  <i>no snapshot yet</i>`
      );
    }
  }
  lines.push("");
  lines.push("<i>Use /unwatch &lt;mint&gt; to stop alerts for a token.</i>");
  return { text: lines.join("\n"), parseMode: "HTML" };
}
