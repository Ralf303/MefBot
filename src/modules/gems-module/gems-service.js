import sequelize from "sequelize";
import { CronJob } from "cron";
import { User, Item } from "../../db/models.js";
import { getRandomInt, separateNumber } from "../../utils/helpers.js";
import { checkItem } from "../items-module/items-utils/item-tool-service.js";
import { getUser } from "../../db/functions.js";

class GemService {
  async giveGems(ctx) {
    const chatId = ctx.from.id;
    const message = ctx.message.reply_to_message;

    if (!message) {
      return;
    }

    const receiverChatId = message.from.id;
    const amount = parseInt(ctx.message.text.split(" ")[2]);

    if (isNaN(amount) || amount <= 0) {
      return;
    }

    if (message.from.is_bot) {
      await ctx.reply("Зачем боту гемы🧐");
      return;
    }

    try {
      const sender = await getUser(chatId);
      const receiver = await getUser(receiverChatId);

      if (sender.gems < amount) {
        await ctx.reply("Недостаточно гемов🥲");
        return;
      }

      if (sender.id === receiver.id) {
        await ctx.reply(`Иди нахуй, так нельзя🖕`);
        return;
      }

      sender.gems -= amount;
      receiver.gems += amount;
      await sender.save();
      await receiver.save();
      await ctx.reply(
        `Ты успешно передал(а) ${separateNumber(amount)} гемов ${
          message.from.first_name
        }`
      );
    } catch (error) {
      console.log(error);
      await ctx.reply("Ошибка при выполнении операции.");
    }
  }

  async giveAllGems() {
    new CronJob(
      "2 0 * * * *",
      async function addGems() {
        try {
          await User.update(
            { gems: sequelize.literal("`gems` + 1") },
            { where: {} }
          );

          // await User.update(
          //   { snows: sequelize.literal("`snows` + 1") },
          //   { where: {} }
          // );

          const usersWithSuperPickaxe = await Item.findAll({
            where: {
              itemName: "Супер Кирка",
              isWorn: true,
            },
            attributes: ["userId"],
          });

          const userIds = usersWithSuperPickaxe.map((item) => item.userId);

          await User.update(
            { gems: sequelize.literal("`gems` + 1") },
            { where: { id: userIds } }
          );
        } catch (error) {
          console.log(error);
        }
      },

      null,
      true,
      "Europe/Moscow"
    );
  }

  async sintez(user, amount) {
    try {
      if (user.gems < amount) {
        return "Недостаточно гемов🥲";
      }

      const hasPups = await checkItem(user.id, "Пупс «Наука»");

      if (hasPups) {
        const mef = amount * getRandomInt(100, 500);

        user.gems -= amount;
        user.balance += mef;
        await user.save();

        return `Ты успешно синтезировал(а) ${amount} гемов в ${mef} старок🧪`;
      } else return "У тебя нет пупса науки🥲";
    } catch (error) {
      console.log(error);
      return "Ошибка при выполнении операции.", error;
    }
  }
}

export default new GemService();
