const { Keyboard, Key } = require("telegram-keyboard");
const { Composer } = require("telegraf");
const { getUser } = require("../db/functions.js");
const { Item } = require("../db/models.js");
const bonusService = require("../services/bonus-service.js");

const command = new Composer();
const commands = "https://telegra.ph/RUKOVODSTVO-PO-BOTU-05-13";

command.start(async (ctx) => {
  try {
    if (ctx.startPayload) {
      const value = ctx.startPayload;
      const { id, first_name, username } = ctx.from;
      const user = await getUser(id, first_name, username);

      if (/^\d+$/.test(value)) {
        bonusService.takeBonus(user, ctx, value);
      }

      if (value === "sith") {
        bonusService.sith(user, ctx);
      }

      if (value === "jeday") {
        bonusService.jeday(user, ctx);
      }
      ctx.reply(value);
    } else {
      await ctx.reply(
        "Привет " +
          ctx.from.first_name +
          "!\n\nЯ, МефБот, создан для помощи в чате @mefpablo\nБолее подробно => /help"
      );
    }
  } catch (error) {
    console.log(error);
  }
});

command.command("command", async (ctx) => {
  try {
    await ctx.reply(commands);
  } catch (error) {
    console.log(error);
  }
});

command.command("help", async (ctx) => {
  try {
    await ctx.replyWithHTML(
      "Помощь по боту:\n/command все функции бота\n/start перезапуск бота\n/shop магазин\n\nТакже если вы нашли ошибку пишите @ralf303"
    );
  } catch (error) {
    console.log(error);
  }
});

command.command("shop", async (ctx) => {
  try {
    if (ctx.chat.type === "private") {
      await ctx.reply(
        "Выберите что хотите купить:",
        Keyboard.inline([
          [Key.callback("Товары чата", "chatAssortiment"), "Улучшения", "Вещи"],
          [
            Key.callback("Закрыть", "dell"),
            Key.callback("🤑DonateLand🤑", "4"),
          ],
        ])
      );
    } else {
      await ctx.reply("Данная команда доступна только в лс");
    }
  } catch (error) {
    console.log(error);
  }
});

command.command("change", async (ctx) => {
  try {
    const user = await getUser(
      ctx.from.id,
      ctx.from.first_name,
      ctx.from.username
    );

    const isItem = await Item.findAll({
      where: {
        userId: user.id,
        itemName: "Шайлушай",
      },
    });

    if (isItem.length === 0) {
      await ctx.reply("У вас нет шайлушая🥲");
      return;
    }

    isItem.forEach(async (item) => {
      if (item.src === "img/white_shalusha.png") {
        item.src = "img/black_shalusha.png";
      } else if (item.src === "img/black_shalusha.png") {
        item.src = "img/white_shalusha.png";
      }
      await item.save();
    });

    ctx.reply("Шайлушай изменен");
  } catch (error) {
    console.log(error);
  }
});

module.exports = command;
