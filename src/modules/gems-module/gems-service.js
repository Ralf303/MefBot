const sequelize = require("sequelize");
const CronJob = require("cron").CronJob;
const { User, Item } = require("../../db/models");
const { loseLog, giveResoursesLog } = require("../logs-module/globalLogs");
const { getRandomInt } = require("../../utils/helpers");
const { checkItem } = require("../items-module/items-utils/item-tool-service");

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

    // проверяем, что отправитель не является ботом
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
        `Вы успешно передали ${amount} гемов ${message.from.first_name}`
      );

      await loseLog(sender, "гемы", "передача другому юзеру");
      await giveResoursesLog(sender, receiver, "гемы", amount);
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
        const mef = amount * getRandomInt(1, 500);

        user.gems -= amount;
        user.balance += mef;
        await user.save();

        return `Вы успешно синтезировали ${amount} гемов в ${mef} грамм мефа🧪`;
      } else return "У вас нет пупса науки🥲";
    } catch (error) {
      console.log(error);
      return "Ошибка при выполнении операции.", error;
    }
  }
}

module.exports = new GemService();
