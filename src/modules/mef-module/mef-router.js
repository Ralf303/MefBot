import dotenv from "dotenv";
dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});
import { Composer } from "telegraf";
import { message } from "telegraf/filters";
import { Keyboard, Key } from "telegram-keyboard";
import {
  checkUserSub,
  checkUserProfile,
  separateNumber,
} from "../../utils/helpers.js";
import { giveStars } from "./mef-service.js";
import ru_text from "../../../ru_text.js";
import { userFerma } from "./ferma.js";

const mefRouter = new Composer();

mefRouter.on(message("text"), async (ctx, next) => {
  try {
    const userMessage = ctx.message.text.toLowerCase();
    const [word1] = userMessage.split(" ");

    if (userMessage == "проф") {
      await checkUserProfile(ctx.state.user, ctx);
    }

    if (userMessage == "магазин" || userMessage == "🏬 магазин 🏬") {
      try {
        await ctx.telegram.sendMessage(
          ctx.from.id,
          "Выбери что хочешь купить:",
          Keyboard.inline([
            ["Улучшения", "Вещи", "Майнинг"],
            [Key.callback("🤑Донат🤑", 4)],
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
      userMessage == "мои старки" ||
      userMessage == "старки" ||
      userMessage == "мои стар" ||
      userMessage == "стар" ||
      userMessage == "б"
    ) {
      await ctx.reply(
        "Старки: " +
          separateNumber(ctx.state.user.balance) +
          "\nГемы: " +
          separateNumber(ctx.state.user.gems) +
          "\nBTC: " +
          separateNumber(ctx.state.user.coin) +
          "\nСемейные монеты: " +
          separateNumber(ctx.state.user.famMoney) +
          "\nИскр: " +
          separateNumber(ctx.state.user.donate)
        //+ "\n❄️ Снежинки: " +
        // separateNumber(ctx.state.user.snows)
      );
    }

    if (word1 == "отсыпать") {
      await giveStars(ctx);
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
        const message = await userFerma(ctx.state.user);

        await ctx.reply(message);
      }
    }

    return next();
  } catch (e) {
    await ctx.reply("Какая то ошибка, " + e);
  }
});

export default mefRouter;
