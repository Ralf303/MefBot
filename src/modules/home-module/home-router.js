const { Composer } = require("telegraf");
const { message } = require("telegraf/filters");
const { getHomeByUserId, sellHome } = require("./home-service");

const homeRouter = new Composer();

homeRouter.on(message("text"), async (ctx, next) => {
  try {
    const userMessage = ctx.message.text.toLowerCase();
    const isHome = await getHomeByUserId(ctx.state.user.id);
    if (!isHome) return next();
    const [word1, word2, word3] = userMessage.split(" ");

    if (userMessage == "оплатить налог") {
      const { balance } = ctx.state.user;
      const { tax } = isHome;

      if (tax === 0) {
        await ctx.reply("Ты уже все оплатил 👍");
      }

      if (balance < tax) {
        await ctx.reply("Недостаточно средств для оплаты налога 🥲");
        return next();
      }

      if (balance >= tax) {
        await ctx.reply("Ты успешно оплатил налог 💸");
        ctx.state.user.balance -= tax;
        isHome.tax = 0;
      }
    }

    if (userMessage == "оплатить электричество") {
      const { balance } = ctx.state.user;
      const { energy } = isHome;

      if (energy === 0) {
        await ctx.reply("Ты уже все оплатил 👍");
      }

      if (balance < energy) {
        await ctx.reply("Недостаточно средств для оплаты электричества 🥲");
        return next();
      }

      if (balance >= energy) {
        await ctx.reply("Ты успешно оплатил электричество 💸");
        ctx.state.user.balance -= energy;
        isHome.energy = 0;
      }
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

    await isHome.save();
    return next();
  } catch (e) {
    await ctx.reply("Какая то ошибка, " + e);
  }
});

module.exports = homeRouter;
