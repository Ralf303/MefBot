import { Composer } from "telegraf";
import { message } from "telegraf/filters";

import { getUser } from "../../db/functions.js";
import rp from "./game-utils/rp-util.js";
import { dice } from "./games/dice.js";
import { bandit } from "./games/bandit.js";
import { createRP } from "./games/rp.js";

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

export default gameRouter;
