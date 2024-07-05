require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});
const { Composer } = require("telegraf");
const { message } = require("telegraf/filters");
const { Keyboard, Key } = require("telegram-keyboard");

const {
  checkUserSub,
  checkUserProfile,
  separateNumber,
} = require("../../utils/helpers");
const { giveCoins } = require("./mef-service.js");
const ru_text = require("../../../ru_text.js");
const { userFerma } = require("./ferma.js");

const mefRouter = new Composer();

mefRouter.on(message("text"), async (ctx, next) => {
  try {
    const userMessage = ctx.message.text.toLowerCase();
    const [word1] = userMessage.split(" ");

    if (userMessage == "проф") {
      await checkUserProfile(ctx.state.user, ctx);
    }

    if (userMessage == "магазин") {
      try {
        await ctx.telegram.sendMessage(
          ctx.from.id,
          "Выберите что хотите купить:",
          Keyboard.inline([
            ["Улучшения", "Вещи", Key.callback("🤑Донат🤑", 4)],
            [Key.callback("Закрыть", "dell")],
          ])
        );

        if (ctx.chat.type !== "private") {
          await ctx.replyWithHTML(
            'Магазин уже открыт в <a href="https://t.me/PablMefBot">ЛС бота</a>',
            {
              reply_to_message_id: ctx.message.message_id,
              disable_web_page_preview: true,
            }
          );
        }
      } catch (e) {
        await ctx.reply(ru_text.shop_err, {
          reply_to_message_id: ctx.message.message_id,
        });
      }
    }

    if (
      userMessage == "мой стар" ||
      userMessage == "стар" ||
      userMessage == "б"
    ) {
      await ctx.reply(
        "Стар: " +
          separateNumber(ctx.state.user.balance) +
          "\nГемы: " +
          separateNumber(ctx.state.user.gems) +
          "\nКлючи: " +
          separateNumber(ctx.state.user.chests)
      );
    }

    if (word1 == "отсыпать") {
      await giveCoins(ctx);
    }

    if (userMessage == "ферма" || userMessage == "фарма") {
      const checkSub = await checkUserSub(
        ctx,
        Number(process.env.CHANNEL_ID),
        ctx.state.user.chatId
      );

      if (!checkSub) {
        await ctx.reply(ru_text.sub);
      } else {
        await userFerma(ctx, ctx.state.user);
      }
    }

    return next();
  } catch (e) {
    await ctx.reply("Какая то ошибка, " + e);
  }
});

module.exports = mefRouter;
