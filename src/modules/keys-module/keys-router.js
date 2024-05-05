const { Composer } = require("telegraf");
const { message } = require("telegraf/filters");
const { getUser } = require("../../db/functions.js");
const keysService = require("./keys-service.js");

const keysRouter = new Composer();

keysRouter.on(message("text"), async (ctx, next) => {
  try {
    const user = await getUser(
      ctx.from.id,
      ctx.from.first_name,
      ctx.from.username
    );
    const userMessage = ctx.message.text.toLowerCase();
    const [word1, word2, word3] = userMessage.split(" ");

    if (word1 == "передать") {
      const id = Number(word3);

      if (word2 == "ключи" && !isNaN(id)) {
        await keysService.giveKeys(ctx);
        return;
      }
    }
    await user.save();
    return next();
  } catch (e) {
    await ctx.reply("Какая то ошибка, " + e);
  }
});

module.exports = keysRouter;
