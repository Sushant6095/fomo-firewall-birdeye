import { ABOUT_TEXT, homeKeyboard, type BotReply } from "../format";

export async function handleAboutCommand(): Promise<BotReply> {
  return {
    text: ABOUT_TEXT,
    parseMode: "HTML",
    keyboard: homeKeyboard()
  };
}
