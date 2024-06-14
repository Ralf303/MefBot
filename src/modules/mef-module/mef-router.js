const { Composer } = require("telegraf");
const { message } = require("telegraf/filters");
const { Keyboard, Key } = require("telegram-keyboard");

const {
  checkUserSub,
  checkUserProfile,
  separateNumber,
} = require("../../utils/helpers");
const { getUser } = require("../../db/functions.js");
const { giveCoins } = require("./mef-service.js");
const ru_text = require("../../../ru_text.js");
const { userFerma } = require("./ferma.js");

const mefRouter = new Composer();

mefRouter.on(message("text"), async (ctx, next) => {
  try {
    const user = await getUser(
      ctx.from.id,
      ctx.from.first_name,
      ctx.from.username
    );
    const userMessage = ctx.message.text.toLowerCase();
    const [word1] = userMessage.split(" ");

    if (userMessage == "проф") {
      await checkUserProfile(user, ctx);
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
          separateNumber(user.balance) +
          "\nГемы: " +
          separateNumber(user.gems) +
          "\nКлючи: " +
          separateNumber(user.chests)
      );
    }

    if (word1 == "отсыпать") {
      await giveCoins(ctx);
    }

    if (userMessage == "ферма" || userMessage == "фарма") {
      const checkSub = await checkUserSub(ctx, -1002015930296, user.chatId);

      if (!checkSub) {
        ctx.reply(ru_text.sub);
      } else {
        await userFerma(ctx, user);
      }
    }

    await user.save();
    return next();
  } catch (e) {
    await ctx.reply("Какая то ошибка, " + e);
  }
});

module.exports = mefRouter;
