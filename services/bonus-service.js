const { Keyboard, Key } = require("telegram-keyboard");
require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});
const { User, Bonus, Item } = require("../db/models");
const { getRandomInt } = require("../utils/helpers");
const clothes = require("../itemsObjects/clothes");
const { blendImages, checkItem } = require("../itemsModule/clothesFunctions");

class BonusService {
  #chatId = Number(process.env.CHANNEL_ID);

  async #createBonusInDb() {
    try {
      const now = Math.floor(Date.now() / 1000);
      const bonus = await Bonus.create({
        time: now,
      });

      return bonus;
    } catch (error) {
      return false;
    }
  }

  async giveItem(user, ctx, id) {
    const itemInfo = clothes[id];

    if (user.slots < user.fullSlots) {
      await ctx.reply("Недостаточно слотов😥");
      return;
    }

    if (user.takeBonus >= 2) {
      await ctx.reply("Вы уже учавствовали в раздаче");
      return;
    }

    const item = await Item.create({
      src: itemInfo.src,
      itemName: itemInfo.name,
      bodyPart: itemInfo.bodyPart,
      isWorn: false,
      price: itemInfo.price,
    });

    let prize = getRandomInt(1000, 10000);

    const pupsItem = await checkItem(user.id, "Пупс «Удача»");

    if (pupsItem) {
      prize += 500;
    }

    user.takeBonus += 2;
    user.balance += prize;
    user.fullSlots++;
    await user.addItem(item);
    await user.save();
    await item.save();
    await ctx.replyWithHTML(
      `Спасибо за участие в раздаче)\n\nВы получили:\n•${itemInfo.name}\n•${prize} мефа\n\n📖<code>Надеть ${item.id}</code>`
    );
  }

  async sendEvent(ctx, id) {
    if (ctx.channelPost.chat.id !== this.#chatId) {
      await ctx.telegram.sendMessage(ctx.channelPost.chat.id, "ИДИ НАХУЙ");
      return;
    }

    if (!id) {
      await ctx.telegram.sendMessage(ctx.channelPost.chat.id, "Не указан айди");
      return;
    }
    const itemInfo = clothes[id];

    if (!itemInfo) {
      await ctx.telegram.sendMessage(ctx.channelPost.chat.id, "Такой вещи нет");
      return;
    }
    await ctx.telegram.deleteMessage(this.#chatId, ctx.channelPost.message_id);
    await User.update({ takeBonus: 0 }, { where: {} });
    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "❗️УЧАСТВУЮ❗️",
            url: `${process.env.BOT_URL}?start=event_${id}`,
          },
        ],
      ],
    };

    await ctx.telegram.sendPhoto(
      this.#chatId,
      { source: await blendImages([itemInfo.src]) },
      {
        caption: `❗️РАЗДАЧА❗️\n\nУсловия:\n•Быть подписаным на этот канал\n•Нажать на кнопку внизу👇\n\nТот кто выполнит условие получит:\n•${itemInfo.name}\n•Немного мефа\n\n👇Скорее участвуй👇`,
        reply_markup: keyboard,
      }
    );
  }

  async createBonus(ctx) {
    if (ctx.channelPost.chat.id !== this.#chatId) {
      await ctx.telegram.sendMessage(ctx.channelPost.chat.id, "ИДИ НАХУЙ");
      return;
    }

    await ctx.telegram.deleteMessage(this.#chatId, ctx.channelPost.message_id);

    const bonus = await this.#createBonusInDb();

    if (!bonus) {
      await ctx.telegram.sendMessage(
        this.#chatId,
        "ОШИБКА ПРИ СОЗДАНИИ БОНУСА"
      );
      return;
    }

    await User.update({ takeBonus: 0 }, { where: {} });

    await ctx.telegram.sendMessage(
      this.#chatId,
      "❗️МЕФБОНУС❗️\n\nУспей забрать в первый час после выхода поста!",
      Keyboard.inline([
        Key.url("🎁Забрать", `${process.env.BOT_URL}?start=${bonus.id}`),
      ])
    );
  }

  async takeBonus(user, ctx, bonusId) {
    try {
      const bonus = await Bonus.findOne({ where: { id: bonusId } });

      if (!bonus) {
        return ctx.reply("поздно...");
      }

      if (user.takeBonus > 0) {
        return ctx.reply("Вы уже брали бонус");
      }

      const now = Math.floor(Date.now() / 1000);
      const lastTime = bonus.time;
      const diff = now - lastTime;

      if (diff > 3600) {
        await bonus.destroy();
        return ctx.reply("поздно...");
      }

      let prize = getRandomInt(1000, 10000);

      const pupsItem = await Item.findOne({
        where: {
          userId: user.id,
          itemName: "",
          isWorn: true,
        },
      });

      if (pupsItem) {
        prize += 500;
      }

      user.takeBonus++;
      user.balance += prize;
      await user.save();
      await ctx.reply(`Бонус в размере ${prize}MF успешно получен`);
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = new BonusService();
