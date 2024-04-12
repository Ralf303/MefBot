const { getUser } = require("../../db/functions");
const { User } = require("../../db/models");
const { giveResoursesLog, loseLog } = require("../logs-module/globalLogs");

const giveCoins = async (ctx) => {
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

  // проверяем, что отправитель не является ботом
  if (message.from.is_bot) {
    await ctx.reply("Зачем боту меф🧐");
    return;
  }

  try {
    const sender = await getUser(chatId);
    let receiver = await getUser(receiverChatId);

    if (sender.balance < amount) {
      await ctx.reply("Недостаточно мефа🥲");
      return;
    }

    if (sender.id === receiver.id) {
      await ctx.reply(`Иди нахуй, так нельзя🖕`);
      return;
    }

    if (amount < 100) {
      await ctx.reply("Минимальная сумма передачи 100 грамм");
      return;
    }

    sender.balance -= amount;
    receiver.balance += amount;
    await sender.save();
    await receiver.save();
    await ctx.reply(
      `Вы успешно отсыпали ${amount} грамм мефа <a href="tg://user?id=${receiver.chatId}">${receiver.firstname}</a>`,
      { parse_mode: "HTML" }
    );

    await loseLog(sender, "меф", "передача другому юзеру");
    await giveResoursesLog(sender, receiver, "меф", amount);
  } catch (error) {
    console.log(error);
    await ctx.reply("Ошибка при выполнении операции.");
  }
};

module.exports = {
  giveCoins,
};
