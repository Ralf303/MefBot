const { User } = require("../db/models");
const { loseLog, giveResoursesLog } = require("../logs/globalLogs");
const sequelize = require("sequelize");
const CronJob = require("cron").CronJob;

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
      const sender = await User.findOne({ where: { chatId } });
      let receiver = await User.findOne({
        where: { chatId: receiverChatId },
      });

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
        `Вы успешно отсыпали ${amount} грамм мефа ${message.from.first_name}`
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
      async function () {
        await User.update(
          { gems: sequelize.literal("`gems` + 1") },
          { where: { weekMessageCounter: { [sequelize.Op.gt]: 1 } } }
        );

        await User.update(
          { gems: sequelize.literal("gems + 1") },
          {
            where: {
              id: {
                [sequelize.Op.in]: sequelize.literal(
                  "(SELECT DISTINCT userId FROM items WHERE itemName = 'Супер Кирка' AND isWorn = true)"
                ),
              },
            },
          }
        );
      },
      null,
      true,
      "Europe/Moscow"
    );
  }
}

module.exports = new GemService();
