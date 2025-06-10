import { Composer } from "telegraf";
import { message } from "telegraf/filters";
import { shopGenerator } from "../../utils/helpers.js";
import { Key, Keyboard } from "telegram-keyboard";

const donateRouter = new Composer();

donateRouter.on(message("text"), async (ctx, next) => {
  try {
    const userMessage = ctx.message.text.toLowerCase();
    const [word1] = userMessage.split(" ");

    if (word1 == "донат" || userMessage == "🤑 донат 🤑") {
      await shopGenerator("4", ctx);
    }

    if (word1 == "отсыпать") {
      await giveStars(ctx);
    }

    return next();
  } catch (e) {
    await ctx.reply("Какая то ошибка, " + e);
  }
});

donateRouter.hears("1", async (ctx) => {
  const pay = await ctx.telegram.createInvoiceLink({
    title: "ТУТ ТАЙТЛ",
    description: "ТУТ ОПИСАНИЕ ОНО ОБЯЗАТЕЛЬНО ДОЛЖНО БЫТЬ",
    payload: "gold",
    currency: "XTR",
    prices: [{ label: "ТУТ ЛЕЙБЛ ТИПО", amount: 1 }],
  });

  ctx.reply(
    `Пополнение на 1 Голд`,
    Keyboard.inline([Key.url("Пополнить (олег гей)", pay)])
  );
});

donateRouter.hears("2", async (ctx) => {
  await ctx.telegram.sendInvoice(ctx.chat.id, {
    title: "ТУТ ТАЙТЛ",
    description: "ТУТ ОПИСАНИЕ ОНО ОБЯЗАТЕЛЬНО ДОЛЖНО БЫТЬ",
    payload: "gold",
    currency: "XTR",
    prices: [{ label: "ТУТ ЛЕЙБЛ ТИПО", amount: 1 }],
  });
});

donateRouter.on("pre_checkout_query", async (ctx) => {
  await ctx.answerPreCheckoutQuery(true);
});

donateRouter.on(message("successful_payment"), async (ctx) => {
  console.log(ctx);

  await ctx.reply("Спасибо за покупку! Премиум активирован.");
});

export default donateRouter;
