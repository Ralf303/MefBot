const { getUser } = require("../../db/functions");
const { separateNumber } = require("../../utils/helpers");

const giveStars = async (ctx) => {
  const chatId = ctx.from.id;
  const message = ctx.message.reply_to_message;

  if (!message) {
    return;
  }

  const receiverChatId = message.from.id;
  const amount = parseInt(ctx.message.text.split(" ")[1]);

  if (isNaN(amount) || amount <= 0) {
    return;
  }

  if (message.from.is_bot) {
    await ctx.reply("Зачем боту старки🧐");
    return;
  }

  try {
    const sender = await getUser(chatId);
    let receiver = await getUser(receiverChatId);

    if (sender.balance < amount) {
      await ctx.reply("Недостаточно старок🥲");
      return;
    }

    if (sender.id === receiver.id) {
      await ctx.reply(`Иди нахуй, так нельзя🖕`);
      return;
    }

    if (amount < 100) {
      await ctx.reply("Минимальная сумма передачи 100 старок");
      return;
    }

    sender.balance -= amount;
    receiver.balance += amount;
    await sender.save();
    await receiver.save();
    await ctx.reply(
      `Ты успешно отсыпал(а) ${separateNumber(
        amount
      )} старок <a href="tg://user?id=${receiver.chatId}">${
        receiver.firstname
      }</a>`,
      { parse_mode: "HTML" }
    );
  } catch (error) {
    console.log(error);
    await ctx.reply("Ошибка при выполнении операции.");
  }
};

module.exports = {
  giveStars,
};
