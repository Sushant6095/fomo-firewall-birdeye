import { strict as assert } from "node:assert";
import { createMemoryDb, seedDemoData } from "@fomo/db";
import { dispatchAlerts } from "../alerts/dispatch";

export async function runDispatchTests(): Promise<void> {
  const db = createMemoryDb();
  await seedDemoData(db);

  // Subscribe one chat to DOGX.
  await db.addWatch("chat-1", "DoGxJTRP7nKpRrjEYRr7nT9hZqEqL8mTjYR4hM7N2ZpL");

  const sent: { chatId: string; text: string }[] = [];
  const send = async (chatId: string, text: string) => {
    sent.push({ chatId, text });
  };

  const result = await dispatchAlerts(db, send, {
    broadcastChatId: "broadcast-chat"
  });

  assert.ok(result.delivered > 0, "expected at least one delivery");
  // DOGX alert should go to both the subscriber and the broadcast chat.
  const dogxDeliveries = sent.filter((s) => s.text.includes("$DOGX"));
  assert.ok(
    dogxDeliveries.some((s) => s.chatId === "chat-1"),
    "subscriber must receive DOGX alert"
  );
  assert.ok(
    dogxDeliveries.some((s) => s.chatId === "broadcast-chat"),
    "broadcast chat must receive DOGX alert"
  );

  // Running again should not double-send (delivered_telegram flag flips).
  sent.length = 0;
  const second = await dispatchAlerts(db, send, {
    broadcastChatId: "broadcast-chat"
  });
  assert.equal(second.delivered, 0, "dispatch must dedupe via delivered flag");
  assert.equal(sent.length, 0);
}
