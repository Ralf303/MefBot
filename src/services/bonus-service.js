import sequelize from "../db/config.js";
import { withUserOperation } from "./transaction-service.js";
import { Keyboard, Key } from "telegram-keyboard";
import { User, Bonus, Item, Giveaway } from "../db/models.js";
import { getRandomInt } from "../utils/helpers.js";
import items from "../modules/items-module/items.js";
import jwtService from "./jwt-service.js";
import { blendImages } from "../modules/items-module/items-utils/blend-items-service.js";
import { checkItem } from "../modules/items-module/items-utils/item-tool-service.js";
import dotenv from "dotenv";
dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});

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

  async giveItem(user, ctx, token) {
    return withUserOperation(user, ctx, (locked, deferred) => this.giveItemUnsafe(locked, deferred, token));
  }
  async giveItemUnsafe(user, ctx, token) {
    const tokenInfo = jwtService.verifyToken(token, "event");
    const giveaway = await Giveaway.findByPk("event");
    if (!giveaway || giveaway.token !== token) throw new Error("GIVEAWAY_EXPIRED");
    const itemInfo = items[tokenInfo.id];

    if (user.fullSlots >= user.slots) {
      await ctx.reply("Недостаточно слотов😥");
      return;
    }

    if (user.takeBonus >= 2) {
      await ctx.reply("Ты уже учавствовал(а) в раздаче");
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
      `Спасибо за участие в раздаче)\n\nТы получил:\n•${itemInfo.name}\n•${prize} старок\n\n📖<code>Надеть ${item.id}</code>`
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
    const itemInfo = items[id];

    if (!itemInfo) {
      await ctx.telegram.sendMessage(ctx.channelPost.chat.id, "Такой вещи нет");
      return;
    }
    await ctx.telegram.deleteMessage(this.#chatId, ctx.channelPost.message_id);
    const token = jwtService.generateToken({ id: id }, "event");
    await sequelize.transaction(async (transaction) => {
      await User.update({ takeBonus: 0 }, { where: {}, transaction });
      await Giveaway.upsert({ kind: "event", token }, { transaction });
    });
    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "❗️УЧАСТВУЮ❗️",
            url: `${process.env.BOT_URL}?start=event_${token}`,
          },
        ],
      ],
    };

    await ctx.telegram.sendPhoto(
      this.#chatId,
      { source: await blendImages([itemInfo.src], `./img/bg.png`) },
      {
        caption: `❗️РАЗДАЧА❗️\n\nУсловия:\n•Быть подписаным на этот канал\n•Нажать на кнопку внизу👇\n\nТот кто выполнит условие получит:\n•${itemInfo.name}\n•Немного старок\n\n👇Скорее участвуй👇`,
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
      "❗️СТАРБОНУС❗️\n\nУспей забрать в первый час после выхода поста!",
      Keyboard.inline([
        Key.url("🎁Забрать", `${process.env.BOT_URL}?start=${bonus.id}`),
      ])
    );
  }

  async takeBonus(user, ctx, bonusId) {
    return withUserOperation(user, ctx, (locked, deferred) => this.takeBonusUnsafe(locked, deferred, bonusId));
  }
  async takeBonusUnsafe(user, ctx, bonusId) {
    try {
      const bonus = await Bonus.findOne({ where: { id: bonusId } });

      if (!bonus) {
        return ctx.reply("поздно...");
      }

      if (user.takeBonus > 0) {
        return ctx.reply("Ты уже брал(а) бонус");
      }

      const now = Math.floor(Date.now() / 1000);
      const lastTime = bonus.time;
      const diff = now - lastTime;

      if (diff > 3600) {
        await bonus.destroy();
        return ctx.reply("поздно...");
      }

      let prize = getRandomInt(1000, 10000);

      const pupsItem = await checkItem(user.id, "Пупс «Удача»");

      if (pupsItem) {
        prize += 500;
      }

      user.takeBonus++;
      user.balance += prize;
      await user.save();
      await ctx.reply(`Бонус в размере ${prize} старок успешно получен`);
    } catch (error) {
      throw error;
    }
  }
}

export default new BonusService();
