const { Keyboard, Key } = require("telegram-keyboard");
const { Composer } = require("telegraf");
const { getUser } = require("../db/functions.js");
const { Item } = require("../db/models.js");
const bonusService = require("../services/bonus-service.js");
const { Sequelize } = require("../db/db.js");
const ru_text = require("../ru_text.js");
const { addIdChannelId } = require("../utils/helpers.js");

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
        return;
      }

      if (value.includes("event_")) {
        bonusService.giveItem(user, ctx, value.slice(6));
        return;
      }

      if (value.includes("add_")) {
        bonusService.takeAdd(user, ctx, addIdChannelId(value));
        return;
      }
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
    await ctx.replyWithHTML(ru_text.help);
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

command.command("time", async (ctx) => {
  try {
    const user = await getUser(
      ctx.from.id,
      ctx.from.first_name,
      ctx.from.username
    );

    const item = await Item.findOne({
      where: {
        itemName: {
          [Sequelize.Op.like]: "%Часы%",
        },
        userId: user.id,
        isWorn: true,
      },
    });

    if (item) {
      const date = new Date();
      const hours = (date.getHours() < 10 ? "0" : "") + date.getHours();
      const minutes = (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();

      ctx.reply(`${item.itemName} показали: ${hours}:${minutes} по МСК`);
    } else {
      ctx.reply("У вас нет часов😢");
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = command;
