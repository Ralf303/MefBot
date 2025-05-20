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
      await ctx.reply("✅ На месте");
    }

    if (userMessage == "команды" || userMessage == "📖 команды 📖") {
      await ctx.reply(ru_text.commands);
    }

    if (userMessage == "ссылки") {
      await ctx.reply(
        `Полезные ссылки\n\n\n1. <a href="https://t.me/mefpablo">Меф с Пабло</a>\n\n2. <a href="https://t.me/mefanarhia">Меф с Пабло || Анархия</a>\n\n3. <a href="https://t.me/themafiaipablo">Меф с Пабло || Мафия</a>`,
        { parse_mode: "HTML", disable_web_page_preview: true }
      );
    }

    if (
      userMessage === "топ стар" ||
      userMessage === "форбс" ||
      userMessage == "⭐️ топ стар ⭐️"
    ) {
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
      await ctx.reply(`⭐️ Богатейшие в старботе ⭐️\n\n${message}`);
    }

    if (
      userMessage === "топ капча" ||
      userMessage === "топ капчи" ||
      userMessage === "капча топ" ||
      userMessage === "🧮 топ капча 🧮"
    ) {
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
