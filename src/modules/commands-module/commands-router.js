const { Keyboard, Key } = require("telegram-keyboard");
const { Composer } = require("telegraf");
const { getUser } = require("../../db/functions.js");
const { Item } = require("../../db/models.js");
const bonusService = require("../../services/bonus-service.js");
const { Sequelize } = require("../../db/config.js");
const ru_text = require("../../../ru_text.js");
const addServise = require("../../services/add-servise.js");
const mainButton = require("../../utils/keyboard.js");

const commandRouter = new Composer();

commandRouter.start(async (ctx) => {
  try {
    if (ctx.payload) {
      const value = ctx.payload;
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
        addServise.take(user, ctx, value.slice(4));
        return;
      }
    } else {
      if (ctx.chat.type === "private") {
        await ctx.replyWithHTML(
          "Привет " +
            ctx.from.first_name +
            "!\n\nЯ, старбот, игровой чатбот\nБолее подробно => /help",
          mainButton
        );
      } else {
        await ctx.replyWithHTML(
          "Привет " +
            ctx.from.first_name +
            "!\n\nЯ, старбот, игровой чатбот\nБолее подробно => /help"
        );
      }
    }
  } catch (error) {
    console.log(error);
  }
});

commandRouter.command("commands", async (ctx) => {
  try {
    if (ctx.chat.type === "private") {
      await ctx.replyWithHTML(ru_text.commands, mainButton);
    } else {
      await ctx.replyWithHTML(ru_text.commands);
    }
  } catch (error) {
    console.log(error);
  }
});

commandRouter.command("help", async (ctx) => {
  try {
    if (ctx.chat.type === "private") {
      await ctx.replyWithHTML(ru_text.help, mainButton);
    } else {
      await ctx.replyWithHTML(ru_text.help);
    }
  } catch (error) {
    console.log(error);
  }
});

commandRouter.command("shop", async (ctx) => {
  try {
    if (ctx.chat.type === "private") {
      await ctx.reply(
        "Выберите что хотите купить:",
        Keyboard.inline([
          ["Улучшения", "Вещи", Key.callback("🤑Донат🤑", 4)],
          [Key.callback("Закрыть", "dell")],
        ])
      );
    } else {
      await ctx.reply("Данная команда доступна только в лс");
    }
  } catch (error) {
    console.log(error);
  }
});

commandRouter.command("change", async (ctx) => {
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

commandRouter.command("time", async (ctx) => {
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

module.exports = commandRouter;
