import { Composer } from "telegraf";
import { message } from "telegraf/filters";
import { separateNumber, shopGenerator } from "../../utils/helpers.js";
import { Key, Keyboard } from "telegram-keyboard";
import { getUser } from "../../db/functions.js";
import { giveDonate } from "./donate-utils.js";
import text from "../../../ru_text.js";

const donateRouter = new Composer();

donateRouter.on(message("text"), async (ctx, next) => {
  try {
    const userMessage = ctx.message.text.toLowerCase();
    const [word1, word2, word3, word4] = userMessage.split(" ");

    if (userMessage == "донат" || userMessage == "🤑 донат 🤑") {
      await shopGenerator("4", ctx);
    }

    if (userMessage.startsWith("донат купить")) {
      const type = word3;
      const amount = Number(word4);
      const count = isNaN(amount) || amount < 1 ? 1 : amount;
      const user = ctx.state.user;

      if (user.donate < count) {
        await ctx.reply(`Недостаточно искр 🥲`);
        return;
      }

      let callbackData = "";
      let confirmText = "";
      let exchangeText = "";

      if (type === "старки") {
        callbackData = `confirm_donate_${count}_${ctx.from.id}_stars`;
        confirmText = "✨ Подтвердить";
        exchangeText = `Ты собираешься обменять ${count} искр на ${separateNumber(
          count * 5000
        )} старок`;
      } else if (type === "камни") {
        callbackData = `confirm_donate_${count}_${ctx.from.id}_stones`;
        confirmText = "🪨 Подтвердить";
        exchangeText = `Ты собираешься обменять ${count} искр на ${separateNumber(
          count
        )} камней`;
      } else {
        return;
      }

      const keyboard = Keyboard.inline([
        [Key.callback(confirmText, callbackData)],
      ]);

      await ctx.reply(exchangeText, keyboard);
    }

    if (word1 == "купить" && word2 == "искры" && !isNaN(Number(word3))) {
      const count =
        isNaN(Number(word3)) || Number(word3) < 1 ? 1 : Number(word3);
      const pay = await ctx.telegram.createInvoiceLink({
        title: `${count} искр`,
        description: `Пополнение на ${count} искр`,
        payload: "gold",
        currency: "XTR",
        prices: [{ label: "Искры", amount: count }],
      });
      try {
        await ctx.telegram.sendMessage(
          ctx.from.id,
          `Для пополнения на ${count} искр нажми на кнопку ниже.\n\n💸 Искры будут начислены сразу после оплаты.`,
          Keyboard.inline([Key.url("Пополнить ✨", pay)])
        );

        if (ctx.chat.type !== "private") {
          await ctx.replyWithHTML(
            '✨ Информация о пополнении искр отправлена в <a href="https://t.me/PablMefBot">ЛС бота</a>',
            {
              reply_to_message_id: ctx.message.message_id,
              disable_web_page_preview: true,
            }
          );
        }
      } catch (error) {
        console.log(error);
        await ctx.reply(text.donate_err, {
          reply_to_message_id: ctx.message.message_id,
        });
      }
    }

    if (word1 == "передать" && word2 == "искры") {
      await giveDonate(ctx);
    }

    return next();
  } catch (e) {
    await ctx.reply("Какая то ошибка, " + e);
  }
});

donateRouter.on("pre_checkout_query", async (ctx) => {
  await ctx.answerPreCheckoutQuery(true);
});

donateRouter.on(message("successful_payment"), async (ctx) => {
  const { total_amount } = ctx.message.successful_payment;
  const userId = ctx.from.id;
  const user = await getUser(userId);
  user.donate += total_amount;
  await user.save();
  await ctx.reply(
    `Пополнение прошло успешно! 🎉\n\nТвой баланс теперь: ${user.donate} искр ✨.\nСпасибо за поддержку СтарБота 💚`
  );
});

export default donateRouter;
