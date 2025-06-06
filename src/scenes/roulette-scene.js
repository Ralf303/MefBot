import { Scenes } from "telegraf";
import { getUser } from "../db/functions.js";
import {
  getWinAmount,
  getWinColor,
} from "../modules/game-module/games/roulette.js";
import { gamesLog } from "../modules/logs-module/globalLogs.js";
import rightCalback from "../modules/game-module/game-utils/roulette-util.js";
import { checkAction, saveAction, separateNumber } from "../utils/helpers.js";

const rouletteScene = new Scenes.BaseScene("rouletteScene");

rouletteScene.enter(async (ctx) => {
  const user = await getUser(
    ctx.from.id,
    ctx.from.first_name,
    ctx.from.username
  );
  const message = `🃏 Для игры в рулетку тебе нужно поставить сумму, написав её в чат, а потом нажать на кнопку со ставкой.\n\nБаланс: ${separateNumber(
    user.balance
  )}`;
  await ctx.reply(message);
});

rouletteScene.hears(/^(\d+)$/, async (ctx) => {
  try {
    const user = await getUser(
      ctx.from.id,
      ctx.from.first_name,
      ctx.from.username
    );

    const balance = user.balance;

    const amount = Number(ctx.match[1]);

    if (balance < amount) {
      await ctx.reply("Недостаточно старок😢");
      return;
    }

    ctx.session.amount = amount;
    const sendedMessage = await ctx.replyWithPhoto(
      { source: "img/roulette.jpg" },
      {
        caption:
          "🃏 Ставка изменена.\n\nСтавка: " +
          separateNumber(amount) +
          "\nБаланс: " +
          separateNumber(balance),
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
    );
    await saveAction(user.id, sendedMessage);
  } catch (error) {
    console.log(error);
  }
});

rouletteScene.action("Отмена", async (ctx) => {
  await ctx.deleteMessage();
  await ctx.reply("Игра отменена.");
  ctx.scene.leave();
});

rouletteScene.on("callback_query", async (ctx) => {
  try {
    const bet = ctx.callbackQuery.data;

    if (rightCalback.includes(bet)) {
      await ctx.deleteMessage();
      const { amount } = ctx.session;

      const user = await getUser(
        ctx.from.id,
        ctx.from.first_name,
        ctx.from.username
      );

      await checkAction(user.id, ctx);

      if (user.balance < amount) {
        await ctx.reply(
          'У тебя кончились сстарки😢\nДля начала игры введи команду "рулетка"'
        );
        ctx.scene.leave();
        return;
      }

      const winNumber = Math.floor(Math.random() * 36 + 1);
      const winColor = getWinColor(winNumber);
      const winAmount = getWinAmount(amount, bet, winNumber);
      const message = `Выпавшее число: ${winNumber} (${winColor}),\nТвоя ставка: ${separateNumber(
        amount
      )} на (${bet}). ${
        winAmount > 0
          ? `\n🥳 Поздравляем, вы выиграли ${winAmount}!\n\nБаланс: ${separateNumber(
              user.balance - amount + winAmount
            )}`
          : `\n😔 Увы, вы проиграли. Попробуйте еще раз.\n\nБаланс: ${separateNumber(
              user.balance - amount
            )}`
      }`;

      const sendedMessage = await ctx.replyWithPhoto(
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
      );

      await saveAction(user.id, sendedMessage);
      const previousBalance = user.balance;
      user.balance -= amount;
      user.balance += winAmount;
      await gamesLog(user, "рулетку", winAmount, previousBalance);
      await user.save();
    } else {
      ctx.scene.leave();
      await ctx.answerCbQuery("Рулетка отменена.");
      await ctx.deleteMessage();
    }
  } catch (error) {
    return;
  }
});

export { rouletteScene };
