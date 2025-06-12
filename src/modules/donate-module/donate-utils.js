import { checkUserByUsername, getUser } from "../../db/functions.js";
import { separateNumber } from "../../utils/helpers.js";

const giveDonate = async (ctx) => {
  const chatId = ctx.from.id;
  const replyMessage = ctx.message.reply_to_message;
  const textParts = ctx.message.text.split(" ");
  const amount = parseInt(textParts[2]);

  if (isNaN(amount) || amount <= 0) {
    await ctx.reply("Укажи корректную сумму для передачи.");
    return;
  }

  let receiver = null;
  let transferredViaUsername = false;

  if (replyMessage) {
    if (replyMessage.from.is_bot) {
      await ctx.reply("Зачем боту искры🧐");
      return;
    }

    receiver = await getUser(replyMessage.from.id);
  } else {
    const usernamePart = textParts.find((part) => part.startsWith("@"));
    if (!usernamePart) {
      await ctx.reply("Сделай реплай на сообщение или укажи @username.");
      return;
    }

    const username = usernamePart.replace("@", "").toLowerCase();
    receiver = await checkUserByUsername(username);

    if (!receiver) {
      await ctx.reply("Пользователь с таким username не найден.");
      return;
    }

    if (receiver.chatId === chatId) {
      await ctx.reply("Иди нахуй, так нельзя🖕");
      return;
    }

    transferredViaUsername = true;
  }

  try {
    const sender = await getUser(chatId);

    if (sender.donate < amount) {
      await ctx.reply("Недостаточно искр🥲");
      return;
    }

    if (receiver.chatId === sender.chatId) {
      await ctx.reply("Иди нахуй, так нельзя🖕");
      return;
    }

    if (amount < 1) {
      await ctx.reply("Минимальная сумма передачи 1 искра");
      return;
    }

    sender.donate -= amount;
    receiver.donate += amount;
    await sender.save();
    await receiver.save();

    await ctx.reply(
      `Ты успешно передал(а) ${separateNumber(
        amount
      )} искр <a href="tg://user?id=${receiver.chatId}">${
        receiver.firstname
      }</a>`,
      { parse_mode: "HTML" }
    );

    if (transferredViaUsername) {
      try {
        await ctx.telegram.sendMessage(
          receiver.chatId,
          `Тебе передали ${separateNumber(amount)} искр от ${
            ctx.from.first_name
          }`
        );
      } catch (err) {
        console.log("Не удалось отправить сообщение получателю:", err.message);
      }
    }
  } catch (error) {
    console.log("Ошибка при передаче искр:", error);
    await ctx.reply("Ошибка при выполнении операции.");
  }
};

export { giveDonate };
