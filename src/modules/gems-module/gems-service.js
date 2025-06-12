import sequelize from "sequelize";
import { CronJob } from "cron";
import { User, Item } from "../../db/models.js";
import {
  getRandomInt,
  resolveReceiver,
  separateNumber,
} from "../../utils/helpers.js";
import { checkItem } from "../items-module/items-utils/item-tool-service.js";
import { getUser } from "../../db/functions.js";

class GemService {
  async giveGems(ctx) {
    const chatId = ctx.from.id;
    const textParts = ctx.message.text.split(" ");
    const amount = parseInt(textParts[2]);

    if (isNaN(amount) || amount <= 0) {
      return;
    }

    let receiver,
      viaUsername = false;

    try {
      const resolved = await resolveReceiver(ctx);
      receiver = resolved.receiver;
      viaUsername = resolved.transferredViaUsername;
    } catch (err) {
      switch (err.message) {
        case "BOT_REJECT":
          return ctx.reply("Зачем боту гемы🧐");
        case "NO_TARGET":
          return ctx.reply("Сделай реплай или укажи @username.");
        case "NOT_FOUND":
          return ctx.reply("Пользователь с таким username не найден.");
        case "SELF_TRANSFER":
          return ctx.reply("Иди нахуй, так нельзя🖕");
        default:
          console.error("resolveReceiver error:", err);
          return ctx.reply("Не удалось определить получателя.");
      }
    }

    try {
      const sender = await getUser(chatId);

      if (sender.gems < amount) {
        return ctx.reply("Недостаточно гемов🥲");
      }

      sender.gems -= amount;
      receiver.gems += amount;
      await sender.save();
      await receiver.save();

      await ctx.reply(
        `Ты успешно передал(а) ${separateNumber(amount)} гемов ${
          receiver.firstname
        }`
      );

      if (viaUsername) {
        try {
          await ctx.telegram.sendMessage(
            receiver.chatId,
            `Тебе передали ${separateNumber(amount)} гемов от ${
              ctx.from.first_name
            }`
          );
        } catch (e) {
          console.log("Не удалось отправить личное сообщение:", e.message);
        }
      }
    } catch (error) {
      console.error("Ошибка передачи гемов:", error);
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
