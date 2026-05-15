import { startBot } from "./client";

export { formatTrapAlert, formatAlertRecord, HELP_TEXT } from "./format";
export { handleScoreCommand } from "./commands/score";
export { handleWatchCommand, handleUnwatchCommand } from "./commands/watch";
export { handleRecentCommand } from "./commands/recent";
export { dispatchAlerts, type Sender } from "./alerts/dispatch";
export { startBot } from "./client";

// Boot when invoked directly.
const isMain =
  process.argv[1]?.endsWith("/index.ts") || process.argv[1]?.endsWith("/index.js");
if (isMain) {
  startBot({
    token: process.env.TELEGRAM_BOT_TOKEN ?? "",
    alertChatId: process.env.TELEGRAM_ALERT_CHAT_ID ?? null
  }).catch((err) => {
    console.error("[bot] failed to start", err);
    process.exit(1);
  });
}
