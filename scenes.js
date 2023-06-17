const { Scenes, Markup } = require("telegraf");
const { Keyboard, Key } = require("telegram-keyboard");
const { getUser } = require("./db/functions");
const {
  getWinAmount,
  getBetColor,
  getWinColor,
  getBetRange,
} = require("./utils/rouletteFunctions");

const gameButtons = Keyboard.inline([
  [
    Key.callback("Зеро", "0"),
    Key.callback("Красное", "красное"),
    Key.callback("Черное", "черное"),
  ],
  [
    Key.callback("1-12", "1-12"),
    Key.callback("13-24", "13-24"),
    Key.callback("25-36", "25-36"),
  ],
  [
    Key.callback("Чет", "чет"),
    Key.callback("1-18", "1-18"),
    Key.callback("19-36", "19-36"),
    Key.callback("Нечет", "нечет"),
  ],
  [Key.callback("Отмена", "Отмена")],
]);

class ScenesGenerator {
  prefix(bot) {
    const BuyPrefix = new Scenes.BaseScene("BuyPrefix");
    BuyPrefix.enter(async (ctx) => {
      await ctx.reply("Не больше 16 символов!");
    });
    BuyPrefix.on("text", async (ctx) => {
      const preff = ctx.message.text;
      if (preff.length <= 16) {
        ctx.reply(
          "Поздравляем с покупкой!\n\nОжидайте, вскоре администратор вам все выдаст"
        );
        await bot.telegram.sendMessage(
          "1157591765",
          "Заявка на покупку!\n\nИмя покупателя @" +
            ctx.chat.username +
            "\n\nПрефикс: <code>" +
            preff +
            "</code>",
          { parse_mode: "HTML" }
        );
        ctx.scene.leave();
      } else {
        ctx.scene.reenter();
      }
    });
    return BuyPrefix;
  }

  ChangePrefix(bot) {
    const ChangePrefix = new Scenes.BaseScene("ChangePrefix");
    ChangePrefix.enter(async (ctx) => {
      await ctx.reply("Не больше 16 символов!");
    });
    ChangePrefix.on("text", async (ctx) => {
      const chapref = ctx.message.text;
      if (chapref.length <= 16) {
        ctx.reply(
          "Поздравляем с покупкой!\n\nОжидайте, вскоре администратор вам все поменяет"
        );
        await bot.telegram.sendMessage(
          "1157591765",
          "Заявка на покупку!\n\nИмя покупателя @" +
            ctx.chat.username +
            "\n\nСмена префикса: <code>" +
            chapref +
            "</code>",
          { parse_mode: "HTML" }
        );
        ctx.scene.leave();
      } else {
        ctx.scene.reenter();
      }
    });
    return ChangePrefix;
  }

  rouletteScene(bot) {
    const rouletteScene = new Scenes.BaseScene("rouletteScene");

    rouletteScene.enter(async (ctx) => {
      const user = await getUser(
        ctx.from.id,
        ctx.from.first_name,
        ctx.from.username
      );
      const message = `🃏 Для игры в рулетку тебе нужно поставить сумму, написав её в чат, а потом нажать на кнопку со ставкой.\n\nБаланс: ${user.balance}`;
      ctx.reply(message);
    });

    rouletteScene.hears(/^(\d+)$/, async (ctx) => {
      const rouletteMessage = ctx.session;

      const user = await getUser(
        ctx.from.id,
        ctx.from.first_name,
        ctx.from.username
      );

      const balance = user.balance;

      if (rouletteMessage) {
        try {
          await ctx.telegram.deleteMessage(ctx.chat.id, rouletteMessage);
        } catch (err) {
          console.error(err);
        }
      }

      const amount = Number(ctx.match[1]);

      if (balance < amount) {
        ctx.reply("Недостаточно мефа😢");
        return;
      }

      ctx.session.amount = amount;
      ctx
        .replyWithPhoto(
          { source: "img/roulette.jpg" },
          {
            caption:
              "🃏 Ставка изменена.\n\nСтавка: " +
              amount +
              "\nБаланс: " +
              balance,
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "Зеро", callback_data: "0" },
                  { text: "Красное", callback_data: "красное" },
                  { text: "Черное", callback_data: "черное" },
                ],
                [
                  { text: "1-12", callback_data: "1-12" },
                  { text: "13-24", callback_data: "13-24" },
                  { text: "25-36", callback_data: "25-36" },
                ],
                [
                  { text: "Чет", callback_data: "чет" },
                  { text: "1-18", callback_data: "1-18" },
                  { text: "19-36", callback_data: "19-36" },
                  { text: "Нечет", callback_data: "нечет" },
                ],
                [{ text: "Отмена", callback_data: "Отмена" }],
              ],
            },
          }
        )
        .then((res) => {
          ctx.session.rouletteMessage = res.message_id;
        });
    });

    rouletteScene.action("Отмена", (ctx) => {
      ctx.deleteMessage();
      ctx.reply("Игра отменена.");
      ctx.scene.leave();
    });

    rouletteScene.on("callback_query", async (ctx) => {
      ctx.deleteMessage();
      const { amount } = ctx.session;

      const user = await getUser(
        ctx.from.id,
        ctx.from.first_name,
        ctx.from.username
      );

      const bet = ctx.callbackQuery.data;
      const winNumber = Math.floor(Math.random() * 36 + 1); // генерация случайного числа от 1 до 36
      const winColor = getWinColor(winNumber);
      const winAmount = getWinAmount(amount, bet, winNumber);
      const message = `Выпавшее число: ${winNumber} (${winColor}),\nВаша ставка: ${amount} на (${bet}). ${
        winAmount > 0
          ? `\n🥳 Поздравляем, вы выиграли *${winAmount}*!\n\nБаланс: ${
              user.balance + winAmount
            }`
          : `\n😔 Увы, вы проиграли. Попробуйте еще раз.\n\nБаланс: ${
              user.balance - amount
            }`
      }`;

      ctx
        .replyWithPhoto(
          { source: "img/roulette.jpg" },
          {
            caption: message,
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "Зеро", callback_data: "0" },
                  { text: "Красное", callback_data: "красное" },
                  { text: "Черное", callback_data: "черное" },
                ],
                [
                  { text: "1-12", callback_data: "1-12" },
                  { text: "13-24", callback_data: "13-24" },
                  { text: "25-36", callback_data: "25-36" },
                ],
                [
                  { text: "Чет", callback_data: "чет" },
                  { text: "1-18", callback_data: "1-18" },
                  { text: "19-36", callback_data: "19-36" },
                  { text: "Нечет", callback_data: "нечет" },
                ],
                [{ text: "Отмена", callback_data: "Отмена" }],
              ],
            },
          }
        )
        .then((res) => {
          ctx.session.rouletteMessage = res.message_id;
        });

      user.balance += winAmount - amount;
      await user.save();
    });
    return rouletteScene;
  }
}

module.exports = { ScenesGenerator };
