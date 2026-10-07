import { withUserTransaction } from "../../services/transaction-service.js";
import { Home } from "../../db/models.js";
import { Composer } from "telegraf";
import { message } from "telegraf/filters";
import { getHomeByUserId, sellHome } from "./home-service.js";

const homeRouter = new Composer();

homeRouter.on(message("text"), async (ctx, next) => {
  try {
    const userMessage = ctx.message.text.toLowerCase();
    if (!["оплатить налог", "оплатить электричество"].includes(userMessage) &&
        !/^(продать|удалить) дом(?: |$)/.test(userMessage)) return next();
    const isHome = await getHomeByUserId(ctx.state.user.id);
    if (!isHome) return next();
    const [word1, word2, word3] = userMessage.split(" ");

    if (["оплатить налог", "оплатить электричество"].includes(userMessage)) {
      const field = userMessage === "оплатить налог" ? "tax" : "energy";
      const result = await withUserTransaction(ctx.state.user, async (user, transaction) => {
        const house = await Home.findByPk(isHome.id, { transaction, lock: transaction.LOCK.UPDATE });
        if (Number(house.userId) !== Number(user.id)) return "Дом уже не принадлежит тебе";
        const amount = Number(house[field]);
        if (!amount) return "Ты уже всё оплатил 👍";
        if (Number(user.balance) < amount) return "Недостаточно средств 🥲";
        user.balance = Number(user.balance) - amount;
        house[field] = 0;
        await house.save({ transaction });
        await user.save({ transaction });
        return "Оплата прошла успешно 💸";
      });
      await ctx.reply(result);
      return next();
    }

    if (
      word1 == "продать" &&
      word2 == "дом" &&
      ctx.message?.reply_to_message?.from
    ) {
      const price = Number(word3);
      if (!isNaN(price)) {
        const result = await sellHome(
          ctx.state.user,
          price,
          ctx.message?.reply_to_message?.from,
          ctx
        );

        await ctx.replyWithHTML(result);
      }
    }

    if (word1 == "удалить" && word2 == "дом") {
      await withUserTransaction(ctx.state.user, async (user, transaction) => {
        const house = await Home.findByPk(isHome.id, { transaction, lock: transaction.LOCK.UPDATE });
        if (Number(house.userId) !== Number(user.id)) throw new Error("HOME_NOT_OWNED");
        house.userId = null;
        await house.save({ transaction });
      });
      await ctx.reply("Ты успешно продал свой дом");
      return next();
    }

    await isHome.save();
    return next();
  } catch (e) {
    await ctx.reply("Какая то ошибка, " + e);
  }
});

export default homeRouter;
