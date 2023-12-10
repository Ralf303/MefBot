const { User, Item } = require("../db/models");
const cases = require("../itemsObjects/cases");
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
    await ctx.reply("Зачем боту меф🧐");
    return;
  }

  try {
    const sender = await User.findOne({ where: { chatId } });
    let receiver = await User.findOne({
      where: { chatId: receiverChatId },
    });

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
      `Вы успешно отсыпали ${amount} грамм мефа ${message.from.first_name}`
    );

    await loseLog(sender, "меф", "передача другому юзеру");
    await giveResoursesLog(sender, receiver, "меф", amount);
  } catch (error) {
    console.log(error);
    await ctx.reply("Ошибка при выполнении операции.");
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
      await ctx.reply("Зачем боту предметы🧐");
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
      await ctx.reply(`У вас нет такой вещи😥`);
      return;
    }

    if (receiver.slots <= receiver.fullSlots) {
      await ctx.reply(`У ${receiver.firstname} нет места😥`);
      return;
    }

    if (item.isWorn) {
      item.isWorn = false;
    }

    if (sender.id === receiver.id) {
      await ctx.reply(`Иди нахуй, так нельзя🖕`);
      return;
    }
    sender.fullSlots--;
    receiver.fullSlots++;
    item.userId = receiver.id;
    await ctx.reply(
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
      await ctx.reply("Зачем боту кейсы🧐");
      return;
    }

    const receiver = await User.findOne({
      where: { chatId: receiverChatId },
    });

    const needCase = cases[id];

    if (!needCase) {
      await ctx.reply("Такого кейса нет😥");
      return;
    }

    const caseCount = sender[needCase.dbName];

    if (count > caseCount) {
      await ctx.reply(`У вас не хватает кейсов ${needCase.name}📦`);
      return;
    }

    if (sender.id === receiver.id) {
      await ctx.reply(`Иди нахуй, так нельзя🖕`);
      return;
    }

    sender[needCase.dbName] -= count;
    receiver[needCase.dbName] += count;

    await ctx.reply(
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

const giveDonateCase = async (sender, id, count, ctx) => {
  try {
    const message = ctx.message.reply_to_message;

    if (!message) {
      return;
    }

    const receiverChatId = message.from.id;

    // проверяем, что отправитель не является ботом
    if (message.from.is_bot) {
      await ctx.reply("Зачем боту кейсы🧐");
      return;
    }

    const receiver = await User.findOne({
      where: { chatId: receiverChatId },
    });

    const needCase = id;

    if (needCase !== "донат") {
      await ctx.reply("Такого кейса нет😥");
      return;
    }

    const caseCount = sender.donateCase;

    if (count > caseCount) {
      await ctx.reply(`У вас не хватает кейсов донат кейсов📦`);
      return;
    }

    if (sender.id === receiver.id) {
      await ctx.reply(`Иди нахуй, так нельзя🖕`);
      return;
    }

    sender.donateCase -= count;
    receiver.donateCase += count;

    await ctx.reply(
      `Вы успешно передали ${count} донаткейсов @${receiver.username}`
    );

    await sender.save();
    await receiver.save();
    await loseLog(sender, `донат кейс`, "передача другому юзеру");
    await giveResoursesLog(sender, receiver, `донат кейс`, `${count}`);
  } catch (error) {
    console.log(error);
  }
};

const giveSnowflakes = async (ctx) => {
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
    await ctx.reply("Зачем боту снежинки🧐");
    return;
  }

  try {
    const sender = await User.findOne({ where: { chatId } });
    let receiver = await User.findOne({
      where: { chatId: receiverChatId },
    });

    if (sender.event < amount) {
      await ctx.reply("Недостаточно снежинок🥲");
      return;
    }

    if (sender.id === receiver.id) {
      await ctx.reply("Нельзя передавать снежинки самому себе🖕");
      return;
    }

    sender.event -= amount;
    receiver.event += amount;
    await sender.save();
    await receiver.save();
    await ctx.reply(
      `Вы успешно передали ${amount} снежинок пользователю ${message.from.first_name}`
    );

    await loseLog(sender, "снежинки", "передача другому пользователю");
    await giveResoursesLog(sender, receiver, "снежинки", amount);
  } catch (error) {
    console.log(error);
    await ctx.reply("Ошибка при выполнении операции.");
  }
};

module.exports = {
  giveCoins,
  giveItem,
  giveCase,
  giveDonateCase,
  giveSnowflakes,
};
