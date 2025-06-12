import sequelize from "sequelize";
import { CronJob } from "cron";
import { User } from "../../db/models.js";
import { getUser } from "../../db/functions.js";
import { resolveReceiver, separateNumber } from "../../utils/helpers.js";

class KeyService {
  async giveKeys(ctx) {
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
          return ctx.reply("Зачем боту ключи🧐");
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

      if (sender.chests < amount) {
        return ctx.reply("Недостаточно ключей🥲");
      }

      sender.chests -= amount;
      receiver.chests += amount;
      await sender.save();
      await receiver.save();

      await ctx.reply(
        `Ты успешно передал(а) ${separateNumber(amount)} ключей ${
          receiver.firstname
        }`
      );

      if (viaUsername) {
        try {
          await ctx.telegram.sendMessage(
            receiver.chatId,
            `Тебе передали ${separateNumber(amount)} ключей от ${
              ctx.from.first_name
            }`
          );
        } catch (e) {
          console.log("Не удалось отправить личное сообщение:", e.message);
        }
      }
    } catch (error) {
      console.error("Ошибка передачи ключей:", error);
      await ctx.reply("Ошибка при выполнении операции.");
    }
  }

  async giveAllKeys() {
    new CronJob(
      "1 0 5 * * *",
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

export default new KeyService();
