import { Composer } from "telegraf";
import { message } from "telegraf/filters";
import keysService from "./keys-service.js";

const keysRouter = new Composer();

keysRouter.on(message("text"), async (ctx, next) => {
  try {
    const userMessage = ctx.message.text.toLowerCase();
    const [word1, word2] = userMessage.trim().split(/\s+/);

    if (word1 == "передать") {
      if (word2 == "ключи") {
        await keysService.giveKeys(ctx);
      }
    }

    return next();
  } catch (e) {
    await ctx.reply("Какая то ошибка, " + e);
  }
});

export default keysRouter;
