import { Composer } from "telegraf";
import { message } from "telegraf/filters";
import {
  buyCard,
  deleteCard,
  getInventory,
  giveCard,
  sellCard,
} from "./card-service.js";

const cardRouter = new Composer();

cardRouter.on(message("text"), async (ctx, next) => {
  try {
    const userMessage = ctx.message.text.toLowerCase();
    const [word1, word2, word3, word4] = userMessage.split(" ");
    const replyToMessage = ctx.message?.reply_to_message?.from;

    if (userMessage == "карты" || userMessage == "видеокарты") {
      await getInventory(ctx.state.user, ctx);
    }

    if (word1 == "удалить") {
      const id = Number(word3);
      if (!isNaN(id) && (word2 == "карту" || word2 == "видеокарту")) {
        const result = await deleteCard(ctx.state.user, id);
        await ctx.replyWithHTML(result);
      }
    }

    if (word1 == "передать") {
      const id = Number(word3);

      if ((word2 == "карту" || word2 == "видеокарту") && !isNaN(id)) {
        await giveCard(ctx.state.user, id, ctx);
      }
    }

    if (word1 == "купить" && (word2 == "карту" || word2 == "видеокарту")) {
      const responce = await buyCard(ctx.state.user);
      await ctx.replyWithHTML(responce);
      return;
    }

    if (
      word1 == "продать" &&
      (word2 == "карту" || word2 == "видеокарту") &&
      replyToMessage
    ) {
      const id = Number(word3);
      const price = Number(word4);
      if (!isNaN(id) && !isNaN(price)) {
        const result = await sellCard(
          ctx.state.user,
          id,
          price,
          replyToMessage,
          ctx
        );
        await ctx.replyWithHTML(result);
      }
    }

    return next();
  } catch (e) {
    await ctx.reply("Какая то ошибка, " + e);
  }
});

export default cardRouter;
