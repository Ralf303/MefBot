const { Composer } = require("telegraf");
const { message } = require("telegraf/filters");

const { getUser } = require("../../db/functions.js");
const craftService = require("./craft-service.js");

const craftRouter = new Composer();

craftRouter.on(message("text"), async (ctx, next) => {
  try {
    const user = await getUser(
      ctx.from.id,
      ctx.from.first_name,
      ctx.from.username
    );
    const userMessage = ctx.message.text.toLowerCase();
    const [word1, word2] = userMessage.split(" ");

    if (word1 == "крафт") {
      const id = Number(word2);
      if (!isNaN(id)) {
        await craftService.craftItem(user, id, ctx);
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

module.exports = craftRouter;
