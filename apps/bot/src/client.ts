import { getDb } from "@fomo/db";
import { handleScoreCommand } from "./commands/score";
import {
  handleUnwatchCommand,
  handleWatchCommand
} from "./commands/watch";
import { handleRecentCommand } from "./commands/recent";
import { dispatchAlerts, type Sender } from "./alerts/dispatch";
import { HELP_TEXT } from "./format";

export type TelegramBotConfig = {
  token: string;
  alertChatId: string | null;
};

/**
 * Loads `grammy` dynamically so the bot package can typecheck and run unit
 * tests without the dependency installed (helpful for offline CI). When the
 * token is missing the bootstrap is a no-op — the rest of the system still
 * works.
 */
export async function startBot(config: TelegramBotConfig): Promise<void> {
  if (!config.token) {
    console.log("[bot] no TELEGRAM_BOT_TOKEN — bot disabled");
    return;
  }
  type GrammyBot = {
    command: (name: string, fn: (ctx: GrammyCtx) => Promise<void>) => void;
    api: { sendMessage: (chatId: string | number, text: string) => Promise<unknown> };
    start: () => Promise<void>;
  };
  type GrammyCtx = {
    match: string;
    chat: { id: number };
    reply: (text: string) => Promise<unknown>;
  };

  let Bot: new (token: string) => GrammyBot;
  try {
    // grammy is an optional runtime dep — install with `pnpm --filter @fomo/bot add grammy`.
    // @ts-expect-error -- module resolved at runtime, not required for typecheck
    const mod = (await import("grammy")) as { Bot: new (token: string) => GrammyBot };
    Bot = mod.Bot;
  } catch {
    console.log(
      "[bot] grammy not installed — run `pnpm --filter @fomo/bot add grammy` to enable. Continuing in dispatch-only mode."
    );
    return;
  }

  const bot = new Bot(config.token);
  const db = getDb();

  bot.command("start", async (ctx) => {
    await ctx.reply(HELP_TEXT);
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(HELP_TEXT);
  });

  bot.command("score", async (ctx) => {
    const text = await handleScoreCommand(ctx.match);
    await ctx.reply(text);
  });

  bot.command("watch", async (ctx) => {
    const text = await handleWatchCommand(db, String(ctx.chat.id), ctx.match);
    await ctx.reply(text);
  });

  bot.command("unwatch", async (ctx) => {
    const text = await handleUnwatchCommand(db, String(ctx.chat.id), ctx.match);
    await ctx.reply(text);
  });

  bot.command("alerts", async (ctx) => {
    const text = await handleRecentCommand();
    await ctx.reply(text);
  });

  // Background loop: poll for new alerts every 30s and fan them out.
  setInterval(async () => {
    const send: Sender = async (chatId, text) => {
      await bot.api.sendMessage(chatId, text);
    };
    await dispatchAlerts(db, send, { broadcastChatId: config.alertChatId });
  }, 30_000);

  console.log("[bot] starting long-poll");
  await bot.start();
}
