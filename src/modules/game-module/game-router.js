const { Composer } = require("telegraf");
const { message } = require("telegraf/filters");

const { getUser } = require("../../db/functions.js");
const rp = require("./game-utils/rp-util.js");
const { dice } = require("./games/dice.js");
const { bandit } = require("./games/bandit.js");
const { createRP } = require("./games/rp.js");

const gameRouter = new Composer();

gameRouter.on(message("text"), async (ctx, next) => {
  try {
    const userMessage = ctx.message.text.toLowerCase();
    const [word1, word2, word3] = userMessage.split(" ");
    const isPrivate = ctx.chat.type === "private";
    const replyToMessage = ctx.message.reply_to_message;

    if (replyToMessage && replyToMessage.from) {
      const comment = userMessage.split("\n")[1];
      const rpAction = rp[userMessage.split("\n")[0]];
      if (rpAction) {
        await createRP(
          rpAction.value,
          rpAction.emoji,
          ctx,
          replyToMessage,
          comment
        );
      }
    }

    if (userMessage == "рулетка" && isPrivate) {
      ctx.scene.enter("rouletteScene");
    } else if (userMessage == "рулетка") {
      await ctx.reply("Данная команда доступна только в лс");
    }

    if (userMessage == "слоты" && isPrivate) {
      await ctx.scene.enter("diceScene");
    } else if (userMessage == "слоты") {
      await ctx.reply("Данная команда доступна только в лс");
    }

    if (word1 == "куб") {
      await dice(word3, word2, ctx.state.user, ctx);
    }

    if (word1 == "бандит") {
      await bandit(word2, ctx.state.user, ctx);
    }

    return next();
  } catch (e) {
    return await ctx.reply("Какая то ошибка, " + e);
  }
});

module.exports = gameRouter;
