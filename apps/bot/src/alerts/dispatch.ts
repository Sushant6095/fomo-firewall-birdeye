import type { FomoDb } from "@fomo/db";
import { caseFileUrl } from "../api";
import { formatAlertRecord } from "../format";

export type Sender = (chatId: string, text: string) => Promise<void>;

/**
 * Push new alerts to subscribers.
 *
 * - Reads recent alerts (DB).
 * - For each alert, fans out to every watcher of that token plus the global
 *   broadcast chat if `TELEGRAM_ALERT_CHAT_ID` is set.
 * - Marks the alert `delivered_telegram = true` so it's never re-sent.
 *
 * `Sender` is injected so tests can verify behaviour without grammy.
 */
export async function dispatchAlerts(
  db: FomoDb,
  send: Sender,
  options: { broadcastChatId?: string | null; limit?: number } = {}
): Promise<{ delivered: number }> {
  const alerts = await db.listRecentAlerts(options.limit ?? 25);
  let delivered = 0;

  for (const alert of alerts) {
    if (alert.deliveredTelegram) continue;

    const subscribers = await db.listSubscribersFor(alert.tokenAddress);
    const recipients = new Set<string>(subscribers);
    if (options.broadcastChatId) recipients.add(options.broadcastChatId);
    if (recipients.size === 0) continue;

    const body = formatAlertRecord(alert, caseFileUrl(alert.tokenAddress));
    for (const chatId of recipients) {
      try {
        await send(chatId, body);
        delivered += 1;
      } catch {
        // Sender errors should not stop the loop — log via the sender if needed.
      }
    }
    await db.markAlertDelivered(alert.id);
  }

  return { delivered };
}
