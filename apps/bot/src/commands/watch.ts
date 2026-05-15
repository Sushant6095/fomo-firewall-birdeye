import type { FomoDb } from "@fomo/db";

const SOLANA_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export async function handleWatchCommand(
  db: FomoDb,
  chatId: string,
  arg: string
): Promise<string> {
  const address = arg.trim();
  if (!address) return "Usage: /watch <token mint address>";
  if (!SOLANA_RE.test(address))
    return "That doesn't look like a Solana mint. Usage: /watch <mint>";

  await db.upsertToken({ address, symbol: "TOKEN", name: "Watch target" });
  await db.addWatch(chatId, address);
  return `Watching ${shortAddress(address)} — you'll get alerts when TrapScore crosses a verdict threshold.`;
}

export async function handleUnwatchCommand(
  db: FomoDb,
  chatId: string,
  arg: string
): Promise<string> {
  const address = arg.trim();
  if (!address) return "Usage: /unwatch <token mint address>";
  await db.removeWatch(chatId, address);
  return `Stopped watching ${shortAddress(address)}.`;
}

function shortAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}
