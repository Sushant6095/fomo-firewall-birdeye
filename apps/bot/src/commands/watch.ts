import type { FomoDb } from "@fomo/db";
import { escHtml, shortAddress, type BotReply } from "../format";

const SOLANA_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export async function handleWatchCommand(
  db: FomoDb,
  chatId: string,
  arg: string
): Promise<BotReply> {
  const address = arg.trim();
  if (!address) {
    return {
      text: "Usage: <code>/watch &lt;token mint address&gt;</code>",
      parseMode: "HTML"
    };
  }
  if (!SOLANA_RE.test(address)) {
    return {
      text:
        "That doesn't look like a Solana mint.\nUsage: <code>/watch &lt;mint&gt;</code>",
      parseMode: "HTML"
    };
  }

  // If we already have a snapshot, use the real symbol/name.
  const existing = await db.getLatestScore(address);
  const symbol = existing?.symbol ?? "TOKEN";
  const name = existing?.name ?? "Watch target";
  await db.upsertToken({ address, symbol, name });
  await db.addWatch(chatId, address);

  return {
    text:
      `👁 <b>Watching $${escHtml(symbol)}</b>  <code>${shortAddress(address)}</code>\n\n` +
      `You'll get a push the moment its TrapScore crosses a verdict line\n` +
      `(60 → Exit Warning, 81 → Critical Trap).\n\n` +
      `<i>Use /unwatch ${shortAddress(address)} to stop.</i>`,
    parseMode: "HTML"
  };
}

export async function handleUnwatchCommand(
  db: FomoDb,
  chatId: string,
  arg: string
): Promise<BotReply> {
  const address = arg.trim();
  if (!address) {
    return {
      text: "Usage: <code>/unwatch &lt;token mint address&gt;</code>",
      parseMode: "HTML"
    };
  }
  await db.removeWatch(chatId, address);
  return {
    text: `🚫 Stopped watching <code>${shortAddress(address)}</code>.`,
    parseMode: "HTML"
  };
}
