import { getUser } from "../../db/functions.js";
import { separateNumber } from "../../utils/helpers.js";

const giveDonate = async (ctx) => {
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
    await ctx.reply("Зачем боту искры🧐");
    return;
  }

  try {
    const sender = await getUser(chatId);
    let receiver = await getUser(receiverChatId);

    if (sender.donate < amount) {
      await ctx.reply("Недостаточно искр🥲");
      return;
    }

    if (sender.id === receiver.id) {
      await ctx.reply(`Иди нахуй, так нельзя🖕`);
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
  } catch (error) {
    console.log(error);
    await ctx.reply("Ошибка при выполнении операции.");
  }
};

export { giveDonate };
