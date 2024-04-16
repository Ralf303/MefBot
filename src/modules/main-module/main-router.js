const { Composer } = require("telegraf");
const { message } = require("telegraf/filters");

const mainRouter = new Composer();
const ru_text = require("../../../ru_text");
const { User } = require("../../db/models");
const { separateNumber } = require("../../utils/helpers");

mainRouter.on(message("text"), async (ctx, next) => {
  try {
    const userMessage = ctx.message.text.toLowerCase();

    if (userMessage == "бот") {
      await ctx.react("👍");
      await ctx.reply("✅На месте");
    }

    if (userMessage == "команды") {
      await ctx.reply(ru_text.commands);
    }

    if (userMessage === "топ меф" || userMessage === "форбс") {
      const top = await User.findAll({
        order: [["balance", "DESC"]],
        limit: 10,
      });
      const message = top
        .map(
          (user, index) =>
            `${index + 1}. ${user.firstname} - ${separateNumber(user.balance)}`
        )
        .join("\n");
      await ctx.reply(`🤑Богатейшие в мефботе🤑\n\n${message}`);
    }

    if (userMessage === "топ капча" || userMessage === "топ капчи") {
      const top = await User.findAll({
        order: [["captureCounter", "DESC"]],
        limit: 10,
      });
      const message = top
        .map(
          (user, index) =>
            `${index + 1}. ${user.firstname} - ${separateNumber(
              user.captureCounter
            )}`
        )
        .join("\n");
      await ctx.reply(`🧮Топ по капчам🧮\n\n${message}`);
    }

    return next();
  } catch (e) {
    return;
  }
});

module.exports = mainRouter;
