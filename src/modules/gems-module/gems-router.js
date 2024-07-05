const { Composer } = require("telegraf");
const { message } = require("telegraf/filters");

const gemsService = require("./gems-service.js");
const { getUser } = require("../../db/functions.js");

const gemsRouter = new Composer();

gemsRouter.on(message("text"), async (ctx, next) => {
  try {
    const userMessage = ctx.message.text.toLowerCase();
    const [word1, word2, word3] = userMessage.split(" ");

    if (word1 == "передать") {
      const id = Number(word3);

      if (word2 == "гемы" && !isNaN(id)) {
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

module.exports = gemsRouter;
