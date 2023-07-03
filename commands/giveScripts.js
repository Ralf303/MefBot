const { User, Item } = require("../db/models");
const cases = require("../itemsObjects.js/cases");
const { giveResoursesLog, loseLog } = require("../logs/globalLogs");

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

    await loseLog(sender, "меф", "передача другому юзеру");
    await giveResoursesLog(sender, receiver, "меф", amount);
  } catch (error) {
    console.log(error);
    ctx.reply("Ошибка при выполнении операции.");
  }
};

const giveItem = async (sender, id, ctx) => {
  try {
    const message = ctx.message.reply_to_message;

    if (!message) {
      return;
    }

    const receiverChatId = message.from.id;

    // проверяем, что отправитель не является ботом
    if (message.from.is_bot) {
      ctx.reply("Зачем боту предметы🧐");
      return;
    }

    const receiver = await User.findOne({
      where: { chatId: receiverChatId },
    });

    const item = await Item.findOne({
      where: {
        id: id,
        userId: sender.id,
      },
    });

    if (!item) {
      ctx.reply(`У вас нет такой вещи😥`);
      return;
    }

    if (receiver.slots <= receiver.fullSlots) {
      ctx.reply(`У ${receiver.firstName} нет места😥`);
      return;
    }

    if (item.isWorn) {
      item.isWorn = false;
    }
    sender.fullSlots--;
    receiver.fullSlots++;
    item.userId = receiver.id;
    ctx.reply(
      `Вы успешно передали ${item.itemName}[${item.id}] @${receiver.username}`
    );

    await sender.save();
    await receiver.save();
    await item.save();
    await loseLog(
      sender,
      `${item.itemName}[${item.id}]`,
      "передача другому юзеру"
    );
    await giveResoursesLog(
      sender,
      receiver,
      `${item.itemName}[${item.id}]`,
      "1"
    );
  } catch (error) {
    console.log(error);
  }
};

const giveCase = async (sender, id, count, ctx) => {
  try {
    const message = ctx.message.reply_to_message;

    if (!message) {
      return;
    }

    const receiverChatId = message.from.id;

    // проверяем, что отправитель не является ботом
    if (message.from.is_bot) {
      ctx.reply("Зачем боту кейсы🧐");
      return;
    }

    const receiver = await User.findOne({
      where: { chatId: receiverChatId },
    });

    const needCase = cases[id];

    if (!needCase) {
      ctx.reply("Такого кейса нет😥");
      return;
    }

    const caseCount = sender[needCase.dbName];

    if (count > caseCount) {
      ctx.reply(`У вас не хватает кейсов ${needCase.name}📦`);
      return;
    }

    sender[needCase.dbName] -= count;
    receiver[needCase.dbName] += count;

    ctx.reply(
      `Вы успешно передали ${count} ${needCase.name}[${id}] @${receiver.username}`
    );

    await sender.save();
    await receiver.save();
    await loseLog(sender, `${needCase.name}[${id}]`, "передача другому юзеру");
    await giveResoursesLog(
      sender,
      receiver,
      `${needCase.name}[${id}]`,
      `${count}`
    );
  } catch (error) {
    console.log(error);
  }
};
module.exports = { giveCoins, giveItem, giveCase };
