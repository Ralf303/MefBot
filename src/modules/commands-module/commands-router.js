import { Keyboard, Key } from "telegram-keyboard";
import { Composer } from "telegraf";
import { getUser } from "../../db/functions.js";
import { Item } from "../../db/models.js";
import bonusService from "../../services/bonus-service.js";
import { Sequelize } from "sequelize";
import ru_text from "../../../ru_text.js";
import addService from "../../services/add-service.js";
import mainButton from "../../utils/keyboard.js";

const commandRouter = new Composer();

commandRouter.start(async (ctx) => {
  try {
    if (ctx.payload) {
      const value = ctx.payload;
      const { id, first_name, username } = ctx.from;
      const user = await getUser(id, first_name, username);

      if (/^\d+$/.test(value)) {
        await bonusService.takeBonus(user, ctx, value);
        return;
      }

      if (value.startsWith("event_")) {
        await bonusService.giveItem(user, ctx, value.slice(6));
        return;
      }

      if (value.startsWith("add_")) {
        await addService.take(user, ctx, value.slice(4));
        return;
      }
    } else {
      if (ctx.chat.type === "private") {
        return await ctx.replyWithHTML(
          "Привет " +
            ctx.from.first_name +
            "!\n\nЯ, старбот, игровой чатбот\nБолее подробно => /help",
          mainButton
        );
      } else {
        return await ctx.replyWithHTML(
          "Привет " +
            ctx.from.first_name +
            "!\n\nЯ, старбот, игровой чатбот\nБолее подробно => /help"
        );
      }
    }
  } catch (error) {
    console.log(error);
    await ctx.reply("Не удалось обработать ссылку. Возможно, раздача закончилась или ссылка устарела.");
  }
});

commandRouter.command("commands", async (ctx) => {
  try {
    if (ctx.chat.type === "private") {
      return await ctx.replyWithHTML(ru_text.commands, mainButton);
    } else {
      return await ctx.replyWithHTML(ru_text.commands);
    }
  } catch (error) {
    console.log(error);
  }
});

commandRouter.command("help", async (ctx) => {
  try {
    if (ctx.chat.type === "private") {
      return await ctx.replyWithHTML(ru_text.help, mainButton);
    } else {
      return await ctx.replyWithHTML(ru_text.help);
    }
  } catch (error) {
    console.log(error);
  }
});

commandRouter.command("shop", async (ctx) => {
  try {
    if (ctx.chat.type === "private") {
      return await ctx.reply(
        "Выбери что хочешь купить:",
        Keyboard.inline([
          ["Улучшения", "Вещи", "Майнинг"],
          [Key.callback("🤑Донат🤑", 4)],
          [Key.callback("Закрыть", "dell")],
        ])
      );
    } else {
      return await ctx.reply("Данная команда доступна только в лс");
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
      await ctx.reply("У тебя нет шайлушая🥲");
      return;
    }

    for (const item of isItem) {
      if (item.src === "img/white_shalusha.png") {
        item.src = "img/black_shalusha.png";
      } else if (item.src === "img/black_shalusha.png") {
        item.src = "img/white_shalusha.png";
      }
      await item.save();
    }

    return await ctx.reply("Шайлушай изменен");
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

      date.setHours(date.getHours() + 1);
      const hours = (date.getHours() < 10 ? "0" : "") + date.getHours();
      const minutes = (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();

      await ctx.reply(`${item.itemName} показали: ${hours}:${minutes} по МСК`);
    } else {
      return await ctx.reply("У тебя нет часов😢");
    }
  } catch (error) {
    console.log(error);
  }
});

export default commandRouter;
