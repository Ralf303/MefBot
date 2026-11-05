import { Composer } from "telegraf";
import { message } from "telegraf/filters";
import gemsService from "./gems-service.js";

const gemsRouter = new Composer();

gemsRouter.on(message("text"), async (ctx, next) => {
  try {
    const userMessage = ctx.message.text.toLowerCase();
    const [word1, word2] = userMessage.trim().split(/\s+/);

    if (word1 == "передать") {
      if (word2 == "гемы") {
        await gemsService.giveGems(ctx);
      }
    }

    if (word1 == "синтез") {
      const amount = Number(word2);
      if (!isNaN(amount) && amount > 0) {
        const response = await gemsService.sintez(ctx.state.user, amount);
        await ctx.reply(response);
      } else {
        await ctx.reply(
          "Неправильно используете команду, надо так:\n\nСинтез 100"
        );
      }
    }

    return next();
  } catch (e) {
    await ctx.reply("Какая то ошибка, " + e);
  }
});

export default gemsRouter;
