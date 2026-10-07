import { getUser } from "../../db/functions.js";
import { resolveReceiver, separateNumber } from "../../utils/helpers.js";
import economyService from "../../services/economy-service.js";

const giveStars = async (ctx) => {
  const chatId = ctx.from.id;
  const textParts = ctx.message.text.split(" ");
  const amount = parseInt(textParts[1]);

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
        return ctx.reply("Зачем боту старки🧐");
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
    const sender = ctx.state.user || (await getUser(chatId));

    if (sender.balance < amount) {
      return ctx.reply("Недостаточно старок🥲");
    }

    if (amount < 100) {
      return ctx.reply("Минимальная сумма передачи 100 старок");
    }

    await economyService.transfer({
      sender,
      receiver,
      currency: "balance",
      amount,
      minAmount: 100,
    });

    await ctx.reply(
      `Ты успешно отсыпал(а) ${separateNumber(amount)} старок ` +
        `<a href="tg://user?id=${receiver.chatId}">${receiver.firstname}</a>`,
      { parse_mode: "HTML" }
    );

    if (viaUsername) {
      try {
        await ctx.telegram.sendMessage(
          receiver.chatId,
          `Тебе отсыпали ${separateNumber(amount)} старок от ${
            ctx.from.first_name
          }`
        );
      } catch (e) {
        console.log("Не удалось отправить личное сообщение:", e.message);
      }
    }
  } catch (error) {
    console.error("Ошибка передачи старок:", error);
    await ctx.reply("Ошибка при выполнении операции.");
  }
};

export { giveStars };
