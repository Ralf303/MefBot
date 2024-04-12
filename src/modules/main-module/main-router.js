const { Composer } = require("telegraf");
const { message } = require("telegraf/filters");

const mainRouter = new Composer();
const ru_text = require("../../../ru_text");

mainRouter.on(message("text"), async (ctx, next) => {
  try {
    const userMessage = ctx.message.text.toLowerCase();

    if (userMessage == "бот") {
      ctx.react("👍");
      await ctx.reply("✅На месте");
    }

    if (userMessage == "команды") {
      await ctx.reply(ru_text.commands);
    }

    return next();
  } catch (e) {
    return;
  }
});

module.exports = mainRouter;
