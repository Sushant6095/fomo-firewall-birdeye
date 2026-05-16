import { getDb } from "@fomo/db";
import { handleScoreCommand } from "./commands/score";
import {
  handleUnwatchCommand,
  handleWatchCommand
} from "./commands/watch";
import { handleRecentCommand } from "./commands/recent";
import {
  handleTopCommand,
  handleTrapsCommand
} from "./commands/top";
import { handleWatchingCommand } from "./commands/watching";
import { handleAboutCommand } from "./commands/about";
import { dispatchAlerts, type Sender } from "./alerts/dispatch";
import {
  HELP_TEXT,
  START_TEXT,
  homeKeyboard,
  type BotKeyboard,
  type BotReply
} from "./format";

export type TelegramBotConfig = {
  token: string;
  alertChatId: string | null;
};

const BOT_COMMANDS: Array<{ command: string; description: string }> = [
  { command: "score", description: "TrapScore for a mint address" },
  { command: "top", description: "Top trending tokens by TrapScore" },
  { command: "traps", description: "Critical + Exit Warning only" },
  { command: "watch", description: "Subscribe to a token's alerts" },
  { command: "unwatch", description: "Stop alerts for a token" },
  { command: "watching", description: "List your watched tokens" },
  { command: "alerts", description: "Recent high-risk alerts" },
  { command: "about", description: "What FOMO Firewall is" },
  { command: "help", description: "Show command list" }
];

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

  // grammy is intentionally typed loosely here because we import it dynamically
  // so the package can typecheck without the dep installed.
  type GrammyKb = { reply_markup?: unknown };
  type GrammyApi = {
    sendMessage: (
      chatId: string | number,
      text: string,
      extra?: GrammyKb & {
        parse_mode?: string;
        disable_web_page_preview?: boolean;
      }
    ) => Promise<unknown>;
    setMyCommands: (cmds: typeof BOT_COMMANDS) => Promise<unknown>;
    setMyDescription?: (desc: string) => Promise<unknown>;
    setMyShortDescription?: (desc: string) => Promise<unknown>;
    answerCallbackQuery?: (
      id: string,
      extra?: { text?: string; show_alert?: boolean }
    ) => Promise<unknown>;
  };
  type GrammyCtx = {
    match: string;
    chat: { id: number };
    reply: (
      text: string,
      extra?: GrammyKb & {
        parse_mode?: string;
        disable_web_page_preview?: boolean;
      }
    ) => Promise<unknown>;
    answerCallbackQuery?: (
      extra?: { text?: string; show_alert?: boolean }
    ) => Promise<unknown>;
    callbackQuery?: { id: string; data?: string };
  };
  type GrammyBot = {
    command: (name: string, fn: (ctx: GrammyCtx) => Promise<void>) => void;
    on: (event: string, fn: (ctx: GrammyCtx) => Promise<void>) => void;
    api: GrammyApi;
    start: () => Promise<void>;
  };
  type GrammyMod = {
    Bot: new (token: string) => GrammyBot;
    InlineKeyboard: new () => {
      url: (text: string, url: string) => unknown;
      text: (text: string, data: string) => unknown;
      row: () => unknown;
    };
  };

  let Bot: GrammyMod["Bot"];
  let InlineKeyboard: GrammyMod["InlineKeyboard"];
  try {
    // grammy is an optional runtime dep — install with `pnpm --filter @fomo/bot add grammy`.
    // @ts-expect-error -- module resolved at runtime, not required for typecheck
    const mod = (await import("grammy")) as GrammyMod;
    Bot = mod.Bot;
    InlineKeyboard = mod.InlineKeyboard;
  } catch {
    console.log(
      "[bot] grammy not installed — run `pnpm --filter @fomo/bot add grammy` to enable. Continuing in dispatch-only mode."
    );
    return;
  }

  const bot = new Bot(config.token);
  const db = getDb();

  // Build a grammy InlineKeyboard from our framework-agnostic shape.
  const buildKeyboard = (rows: BotKeyboard) => {
    const kb = new InlineKeyboard();
    rows.forEach((row, rowIdx) => {
      row.forEach((btn) => {
        if (btn.kind === "url") kb.url(btn.text, btn.url);
        else kb.text(btn.text, btn.data);
      });
      if (rowIdx < rows.length - 1) kb.row();
    });
    return kb;
  };

  const sendReply = async (ctx: GrammyCtx, reply: BotReply) => {
    await ctx.reply(reply.text, {
      parse_mode: reply.parseMode ?? "HTML",
      disable_web_page_preview: reply.disableLinkPreview ?? false,
      ...(reply.keyboard
        ? { reply_markup: buildKeyboard(reply.keyboard) }
        : {})
    });
  };

  // ─── Boot polish — populate the / menu and bot description ────────
  try {
    await bot.api.setMyCommands(BOT_COMMANDS);
    if (bot.api.setMyShortDescription) {
      await bot.api.setMyShortDescription(
        "Exit-liquidity intelligence for Solana — TrapScore before retail becomes the exit."
      );
    }
    if (bot.api.setMyDescription) {
      await bot.api.setMyDescription(
        "Send a Solana mint to get its TrapScore (0-100). I track smart-wallet exits, insider sells, and liquidity drains. Powered by Birdeye Data."
      );
    }
  } catch (err) {
    console.warn("[bot] could not set bot menu:", err);
  }

  // ─── Commands ─────────────────────────────────────────────────────
  bot.command("start", async (ctx) => {
    await sendReply(ctx, {
      text: START_TEXT,
      parseMode: "HTML",
      keyboard: homeKeyboard()
    });
  });

  bot.command("help", async (ctx) => {
    await sendReply(ctx, { text: HELP_TEXT, parseMode: "HTML" });
  });

  bot.command("score", async (ctx) => {
    const watches = await db.listWatches(String(ctx.chat.id));
    const address = ctx.match.trim();
    const watching = address ? watches.includes(address) : false;
    const reply = await handleScoreCommand(ctx.match, { watching });
    await sendReply(ctx, reply);
  });

  bot.command("watch", async (ctx) => {
    const reply = await handleWatchCommand(db, String(ctx.chat.id), ctx.match);
    await sendReply(ctx, reply);
  });

  bot.command("unwatch", async (ctx) => {
    const reply = await handleUnwatchCommand(db, String(ctx.chat.id), ctx.match);
    await sendReply(ctx, reply);
  });

  bot.command("watching", async (ctx) => {
    const reply = await handleWatchingCommand(db, String(ctx.chat.id));
    await sendReply(ctx, reply);
  });

  bot.command("alerts", async (ctx) => {
    const reply = await handleRecentCommand();
    await sendReply(ctx, reply);
  });

  bot.command("top", async (ctx) => {
    const reply = await handleTopCommand();
    await sendReply(ctx, reply);
  });

  bot.command("traps", async (ctx) => {
    const reply = await handleTrapsCommand();
    await sendReply(ctx, reply);
  });

  bot.command("about", async (ctx) => {
    const reply = await handleAboutCommand();
    await sendReply(ctx, reply);
  });

  // ─── Inline-keyboard callbacks ────────────────────────────────────
  // Format: "<verb>:<payload>". Verbs: refresh, watch, unwatch, addr, cmd.
  bot.on("callback_query:data", async (ctx) => {
    const data = ctx.callbackQuery?.data ?? "";
    const [verb, ...rest] = data.split(":");
    const payload = rest.join(":");
    const chatId = String(ctx.chat.id);

    try {
      switch (verb) {
        case "refresh": {
          const watches = await db.listWatches(chatId);
          const reply = await handleScoreCommand(payload, {
            watching: watches.includes(payload)
          });
          await sendReply(ctx, reply);
          await ctx.answerCallbackQuery?.({ text: "Refreshed." });
          break;
        }
        case "watch": {
          const reply = await handleWatchCommand(db, chatId, payload);
          await sendReply(ctx, reply);
          await ctx.answerCallbackQuery?.({ text: "Watching." });
          break;
        }
        case "unwatch": {
          const reply = await handleUnwatchCommand(db, chatId, payload);
          await sendReply(ctx, reply);
          await ctx.answerCallbackQuery?.({ text: "Unwatched." });
          break;
        }
        case "addr": {
          await ctx.reply(`<code>${payload}</code>`, { parse_mode: "HTML" });
          await ctx.answerCallbackQuery?.({ text: "Address sent." });
          break;
        }
        case "cmd": {
          if (payload === "top") {
            await sendReply(ctx, await handleTopCommand());
          } else if (payload === "traps") {
            await sendReply(ctx, await handleTrapsCommand());
          } else if (payload === "alerts") {
            await sendReply(ctx, await handleRecentCommand());
          } else if (payload === "about") {
            await sendReply(ctx, await handleAboutCommand());
          }
          await ctx.answerCallbackQuery?.();
          break;
        }
        default:
          await ctx.answerCallbackQuery?.({ text: "Unknown action." });
      }
    } catch (err) {
      console.error("[bot] callback handler failed:", err);
      await ctx.answerCallbackQuery?.({
        text: "Something went wrong. Try again.",
        show_alert: true
      });
    }
  });

  // Background loop: poll for new alerts every 30s and fan them out.
  setInterval(async () => {
    const send: Sender = async (chatId, text) => {
      await bot.api.sendMessage(chatId, text, {
        parse_mode: "HTML",
        disable_web_page_preview: true
      });
    };
    await dispatchAlerts(db, send, { broadcastChatId: config.alertChatId });
  }, 30_000);

  console.log("[bot] starting long-poll");
  await bot.start();
}
