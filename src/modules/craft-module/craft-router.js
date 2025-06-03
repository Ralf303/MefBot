import { Composer } from "telegraf";
import { message } from "telegraf/filters";

import { getUser } from "../../db/functions.js";
import craftService from "./craft-service.js";

const craftRouter = new Composer();

craftRouter.on(message("text"), async (ctx, next) => {
  try {
    const userMessage = ctx.message.text.toLowerCase();
    const [word1, word2] = userMessage.split(" ");

    if (word1 == "крафт") {
      const id = Number(word2);
      if (!isNaN(id)) {
        await craftService.craftItem(ctx.state.user, id, ctx);
      }
    }

    if (userMessage == "крафты") {
      craftService.craftList(ctx);
    }
    return next();
  } catch (e) {
    await ctx.reply("Какая то ошибка, " + e);
  }
});

export default craftRouter;
