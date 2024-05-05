const sequelize = require("sequelize");
const CronJob = require("cron").CronJob;
const { User } = require("../../db/models");

const { getUser } = require("../../db/functions");

class KeyService {
  async giveKeys(ctx) {
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
      await ctx.reply("Зачем боту ключи🧐");
      return;
    }

    try {
      const sender = await getUser(chatId);
      const receiver = await getUser(receiverChatId);

      if (sender.chests < amount) {
        await ctx.reply("Недостаточно ключей🥲");
        return;
      }

      if (sender.id === receiver.id) {
        await ctx.reply(`Иди нахуй, так нельзя🖕`);
        return;
      }

      sender.chests -= amount;
      receiver.chests += amount;
      await sender.save();
      await receiver.save();
      await ctx.reply(
        `Вы успешно передали ${amount} ключей ${message.from.first_name}`
      );
    } catch (error) {
      console.log(error);
      await ctx.reply("Ошибка при выполнении операции.");
    }
  }

  async giveAllKeys() {
    new CronJob(
      "1 30 21 * * *",
      async function addKeys() {
        try {
          await User.update(
            { chests: sequelize.literal("`chests` + 1") },
            { where: {} }
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
}

module.exports = new KeyService();
