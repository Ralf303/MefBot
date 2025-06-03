import { Composer } from "telegraf";
import { message } from "telegraf/filters";
import { getUser } from "../../db/functions.js";
import keysService from "./keys-service.js";

const keysRouter = new Composer();

keysRouter.on(message("text"), async (ctx, next) => {
  try {
    const userMessage = ctx.message.text.toLowerCase();
    const [word1, word2, word3] = userMessage.split(" ");

    if (word1 == "передать") {
      const id = Number(word3);

      if (word2 == "ключи" && !isNaN(id)) {
        await keysService.giveKeys(ctx);
      }
    }

    return next();
  } catch (e) {
    await ctx.reply("Какая то ошибка, " + e);
  }
});

export default keysRouter;
