const { Keyboard, Key } = require("telegram-keyboard");
require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});
const { User, Bonus, Item } = require("../db/models");
const { getRandomInt } = require("../utils/helpers");
const clothes = require("../itemsObjects/clothes");

class BonusService {
  #chatId = -1002015930296;

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

  async sith(user, ctx) {
    const itemInfo = clothes[93];

    if (user.slots < user.fullSlots) {
      await ctx.reply("Недостаточно слотов😥");
      return;
    }

    const item = await Item.create({
      src: itemInfo.src,
      itemName: itemInfo.name,
      bodyPart: itemInfo.bodyPart,
      isWorn: false,
      price: itemInfo.price,
    });

    user.fullSlots++;
    await user.addItem(item);
    await user.save();
    await item.save();
    await ctx.replyWithHTML(
      `Ты выбрал верную сторону, темная сила захватит все😈\n\n📖<code>Надеть ${item.id}</code>`
    );
  }

  async jeday(user, ctx) {
    const itemInfo = clothes[94];

    if (user.slots < user.fullSlots) {
      await ctx.reply("Недостаточно слотов😥");
      return;
    }

    const item = await Item.create({
      src: itemInfo.src,
      itemName: itemInfo.name,
      bodyPart: itemInfo.bodyPart,
      isWorn: false,
      price: itemInfo.price,
    });

    user.fullSlots++;
    await user.addItem(item);
    await user.save();
    await item.save();
    await ctx.replyWithHTML(
      `Да прибудет с тобой сила, юный джедай💪\n\n📖<code>Надеть ${item.id}</code>`
    );
  }

  async droch(ctx) {
    if (ctx.channelPost.chat.id !== this.#chatId) {
      await ctx.telegram.sendMessage(ctx.channelPost.chat.id, "ИДИ НАХУЙ");
      return;
    }

    await ctx.telegram.deleteMessage(this.#chatId, ctx.channelPost.message_id);

    await ctx.telegram.sendMessage(
      this.#chatId,
      "❗️НЕДРОЧАБРЬ❗️\n\nВыбирай на чьей стороне ты будешь",
      Keyboard.inline([
        Key.url("💪Джедай", `${process.env.BOT_URL}?start=jeday`),
        Key.url("🥵Ситх", `${process.env.BOT_URL}?start=sith`),
      ])
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

      const prize = getRandomInt(1000, 10000);
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
