const User = require("../db/models.js");

async function giveCoins(ctx) {
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
    ctx.reply("Зачем боту меф🧐");
    return;
  }

  try {
    const sender = await User.findOne({ where: { chatId } });
    let receiver = await User.findOne({
      where: { chatId: receiverChatId },
    });

    if (sender.balance < amount) {
      ctx.reply("Недостаточно мефа🥲");
      return;
    }

    if (amount < 100) {
      ctx.reply("Минимальная сумма передачи 100 грамм");
      return;
    }

    sender.balance -= amount;
    receiver.balance += amount;
    await sender.save();
    await receiver.save();
    ctx.reply(
      `Вы успешно отсыпали ${amount} грамм мефа ${message.from.first_name}`
    );
  } catch (error) {
    console.log(error);
    ctx.reply("Ошибка при выполнении операции.");
  }
}

module.exports = { giveCoins };
