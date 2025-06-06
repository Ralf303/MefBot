import dotenv from "dotenv";
dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});
import { User, Add } from "../db/models.js";
import { getRandomInt, checkUserSub, sleep } from "../utils/helpers.js";
import items from "../modules/items-module/items.js";
import ru_text from "../../ru_text.js";
import jwtService from "./jwt-service.js";
import { adminList } from "../modules/admin-module/admins.js";
import { blendImages } from "../modules/items-module/items-utils/blend-items-service.js";
import { createItem } from "../modules/items-module/items-utils/item-tool-service.js";

class AddService {
  #chatId = Number(process.env.CHANNEL_ID);

  async #createAddInDb(user, obj) {
    try {
      const add = await Add.create({
        userId: user.chatId,
        channelId: obj.channelId,
        itemId: obj.id,
      });
      return add;
    } catch (error) {
      return false;
    }
  }

  async send(ctx, id, channelId, channelName) {
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
    const token = jwtService.generateToken({
      id: id,
      channelId: channelId,
    });
    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "❗️УЧАСТВУЮ❗️",
            url: `${process.env.BOT_URL}?start=add_${token}`,
          },
        ],
      ],
    };

    await ctx.telegram.sendPhoto(
      this.#chatId,
      { source: await blendImages([itemInfo.src], `./img/bg.png`) },
      {
        caption: `❗️РАЗДАЧА❗️\n\nУсловия:\n•Быть подписаным на ${channelName}\n•Нажать на кнопку внизу👇\n\nТот кто выполнит условие получит:\n•${itemInfo.name}\n•Немного старок\n\n👇Скорее участвуй👇`,
        reply_markup: keyboard,
      }
    );
  }

  async take(user, ctx, token) {
    try {
      const obj = jwtService.verifyToken(token);
      const checkBonus = await Add.findOne({ where: { userId: user.chatId } });

      if (checkBonus) {
        return ctx.reply(ru_text.add_err);
      }

      if (!(await checkUserSub(ctx, obj.channelId, user.chatId))) {
        return ctx.reply(ru_text.add_no_sub);
      }
      await this.#createAddInDb(user, obj);
      await ctx.reply(ru_text.add_start);
    } catch (error) {
      console.log(error);
    }
  }

  async end(bot) {
    const bonuses = await Add.findAll();
    if (bonuses.length > 0) {
      let counter = 0;
      for (const bonus of bonuses) {
        try {
          const user = await User.findOne({
            where: { chatId: bonus.userId },
          });

          if (await checkUserSub(bot, bonus.channelId, user.chatId)) {
            const item = await createItem(bonus.itemId);

            user.fullSlots++;
            await user.addItem(item);
            const minedAmount = getRandomInt(1000, 10000);
            user.balance += minedAmount;
            await bonus.destroy();
            await bonus.save();
            await item.save();
            await user.save();
            const message = `❗️Спасибо за участие в разадче❗️\n\nТы получил(а):\n${minedAmount} старок🤑\n${item.itemName}[${item.id}]`;
            await bot.telegram.sendMessage(user.chatId, message);
            counter++;
            await sleep(200);
          } else {
            console.log("Юзер отписался");
          }
        } catch (error) {
          console.log(error);
        }
      }
      await bot.telegram.sendMessage(
        adminList[0],
        `Готово:)\n\nВ раздаче участвовало: ${
          bonuses.length
        }\nУспешно: ${counter}\nОтписалось: ${(bonuses.length -= counter)}`
      );
    }
  }

  async count() {
    return (await Add.findAll()).length;
  }
}

export default new AddService();
