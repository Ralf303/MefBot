const { Item } = require("../db/models");
const cases = require("../itemsObjects.js/cases");
const clothes = require("../itemsObjects.js/clothes");
const { resiveLog, loseLog } = require("../logs/globalLogs");
const { getRandomInt } = require("../utils/helpers");

const openminecraftCase = async (user, ctx, bot) => {
  const chance = getRandomInt(1, 1000);
  let result = `${user.username} открыл Майнкрафт кейс и получил`;
  await loseLog(user, "кейс", "открытие");
  if (chance <= 499) {
    const win = getRandomInt(1, 250);
    user.balance += win;
    result += ` ${win}MF`;
    await resiveLog(user, "меф", `${win}`, "приз из кейса");
  }

  if (chance >= 500 && chance <= 502) {
    const needItem = clothes[12];
    const item = await Item.create({
      src: needItem.src,
      itemName: needItem.name,
      bodyPart: needItem.bodyPart,
      isWorn: false,
    });

    user.fullSlots++;
    await user.addItem(item);
    await ctx.reply(`❗️@${result} ${needItem.name}❗️`);
    await bot.telegram.sendMessage(
      process.env.CHAT_ID,
      `❗️@${user.username} испытал удачу при открытии Майнкрафт кейса и выбил ${needItem.name}❗️`
    );
    await resiveLog(user, `${needItem.name}`, `1`, "приз из кейса");
    await user.save();
    await item.save();
    return;
  }

  if (chance >= 503 && chance <= 505) {
    const needItem = clothes[24];
    const item = await Item.create({
      src: needItem.src,
      itemName: needItem.name,
      bodyPart: needItem.bodyPart,
      isWorn: false,
    });

    user.fullSlots++;
    await user.addItem(item);
    await ctx.reply(`❗️@${result} ${needItem.name}❗️`);
    await bot.telegram.sendMessage(
      process.env.CHAT_ID,
      `❗️@${user.username} испытал удачу при открытии Майнкрафт кейса и выбил ${needItem.name}❗️`
    );
    await resiveLog(user, `${needItem.name}`, `1`, "приз из кейса");
    await user.save();
    await item.save();
    return;
  }

  if (chance >= 506 && chance <= 508) {
    const needItem = clothes[21];
    const item = await Item.create({
      src: needItem.src,
      itemName: needItem.name,
      bodyPart: needItem.bodyPart,
      isWorn: false,
    });

    user.fullSlots++;
    await user.addItem(item);
    await ctx.reply(`❗️@${result} ${needItem.name}❗️`);
    await bot.telegram.sendMessage(
      process.env.CHAT_ID,
      `❗️@${user.username} испытал удачу при открытии Майнкрафт кейса и выбил ${needItem.name}❗️`
    );
    await resiveLog(user, `${needItem.name}`, `1`, "приз из кейса");
    await user.save();
    await item.save();
    return;
  }

  if (chance >= 509 && chance <= 511) {
    const needItem = clothes[22];
    const item = await Item.create({
      src: needItem.src,
      itemName: needItem.name,
      bodyPart: needItem.bodyPart,
      isWorn: false,
    });

    user.fullSlots++;
    await user.addItem(item);
    await ctx.reply(`❗️@${result} ${needItem.name}❗️`);
    await bot.telegram.sendMessage(
      process.env.CHAT_ID,
      `❗️@${user.username} испытал удачу при открытии Майнкрафт кейса и выбил ${needItem.name}❗️`
    );
    await resiveLog(user, `${needItem.name}`, `1`, "приз из кейса");
    await user.save();
    await item.save();
    return;
  }

  if (chance >= 512 && chance <= 599) {
    const win = getRandomInt(250, 1000);
    user.balance += win;
    result += ` ${win}MF`;
    await resiveLog(user, `меф`, `${win}`, "приз из кейса");
  }

  if (chance >= 600) {
    result += " ничего😥";
  }
  await user.save();
  ctx.reply(result);
};

const openbrawlCase = async (user, ctx, bot) => {
  const chance = getRandomInt(1, 1000);
  let result = `${user.username} открыл Бравл кейс и получил`;
  await loseLog(user, "кейс", "открытие");
  if (chance <= 499) {
    const win = getRandomInt(1, 250);
    user.balance += win;
    result += ` ${win}MF`;
    await resiveLog(user, "меф", `${win}`, "приз из кейса");
  }

  if (chance >= 500 && chance <= 505) {
    const randomItem = getRandomInt(40, 47);
    const needItem = clothes[randomItem];
    const item = await Item.create({
      src: needItem.src,
      itemName: needItem.name,
      bodyPart: needItem.bodyPart,
      isWorn: false,
    });

    user.fullSlots++;
    await user.addItem(item);
    await ctx.reply(`❗️@${result} ${needItem.name}❗️`);
    await bot.telegram.sendMessage(
      process.env.CHAT_ID,
      `❗️@${user.username} испытал удачу при открытии Бравл кейса и выбил ${needItem.name}❗️`
    );
    await resiveLog(user, `${needItem.name}`, `1`, "приз из кейса");
    await user.save();
    await item.save();
    return;
  }

  if (chance >= 506 && chance <= 599) {
    const win = getRandomInt(250, 1000);
    user.balance += win;
    result += ` ${win}MF`;
    await resiveLog(user, "меф", `${win}`, "приз из кейса");
  }

  if (chance >= 600) {
    result += " ничего😥";
  }

  await user.save();
  ctx.reply(result);
};

const openfalloutCase = async (user, ctx, bot) => {
  const chance = getRandomInt(1, 1000);
  let result = `${user.username} открыл Фоллаут кейс и получил`;
  await loseLog(user, "кейс", "открытие");
  if (chance <= 499) {
    const win = getRandomInt(1, 50);
    user.balance += win;
    result += ` ${win}MF`;
    await resiveLog(user, "меф", `${win}`, "приз из кейса");
  }

  if (chance >= 500 && chance <= 515) {
    const randomItem = getRandomInt(60, 63);
    const needItem = clothes[randomItem];
    const item = await Item.create({
      src: needItem.src,
      itemName: needItem.name,
      bodyPart: needItem.bodyPart,
      isWorn: false,
    });

    user.fullSlots++;
    await user.addItem(item);
    await ctx.reply(`❗️@${result} ${needItem.name}❗️`);
    await bot.telegram.sendMessage(
      process.env.CHAT_ID,
      `❗️@${user.username} испытал удачу при открытии Фоллаут кейса и выбил ${needItem.name}❗️`
    );
    await resiveLog(user, `${needItem.name}`, `1`, "приз из кейса");
    await user.save();
    await item.save();
    return;
  }

  if (chance >= 516 && chance <= 599) {
    const win = getRandomInt(250, 500);
    user.balance += win;
    result += ` ${win}MF`;
    await resiveLog(user, "меф", `${win}`, "приз из кейса");
  }

  if (chance >= 600) {
    result += " ничего😥";
  }

  await user.save();
  ctx.reply(result);
};

const openhotlineCase = async (user, ctx, bot) => {
  const chance = getRandomInt(1, 1000);
  let result = `${user.username} открыл Сигма кейс и получил`;
  await loseLog(user, "кейс", "открытие");
  if (chance <= 499) {
    const win = getRandomInt(1, 250);
    user.balance += win;
    result += ` ${win}MF`;
    await resiveLog(user, "меф", `${win}`, "приз из кейса");
  }

  if (chance >= 500 && chance <= 515) {
    const randomItem = getRandomInt(50, 55);
    const needItem = clothes[randomItem];
    const item = await Item.create({
      src: needItem.src,
      itemName: needItem.name,
      bodyPart: needItem.bodyPart,
      isWorn: false,
    });

    user.fullSlots++;
    await user.addItem(item);
    await ctx.reply(`❗️@${result} ${needItem.name}❗️`);
    await bot.telegram.sendMessage(
      process.env.CHAT_ID,
      `❗️@${user.username} испытал удачу при открытии Сигма кейса и выбил ${needItem.name}❗️`
    );
    await resiveLog(user, `${needItem.name}`, `1`, "приз из кейса");
    await user.save();
    await item.save();
    return;
  }

  if (chance >= 516 && chance <= 599) {
    const win = getRandomInt(250, 1000);
    user.balance += win;
    result += ` ${win}MF`;
    await resiveLog(user, "меф", `${win}`, "приз из кейса");
  }

  if (chance >= 600) {
    result += " ничего😥";
  }

  await user.save();
  ctx.reply(result);
};

const openDonateCase = async (user, ctx) => {
  if (user.donateCase === 0) {
    ctx.reply(`Недостаточно мефкейсов😥`);
    return;
  }

  user.donateCase--;
  await user.save();

  let result = `${user.username} открыл Донат кейс и получил`;
  const randomItem =
    Math.floor(Math.random() * Object.keys(clothes).length) + 1;
  const needItem = clothes[randomItem];
  const item = await Item.create({
    src: needItem.src,
    itemName: needItem.name,
    bodyPart: needItem.bodyPart,
    isWorn: false,
  });

  user.fullSlots++;
  await user.addItem(item);
  await ctx.reply(`❗️@${result} ${needItem.name}❗️`);
  await ctx.telegram.sendMessage(
    process.env.CHAT_ID,
    `❗️@${user.username} испытал удачу при открытии Донат кейса и выбил ${needItem.name}❗️`
  );
  await resiveLog(user, `${needItem.name}`, `1`, "приз из кейса");
  await user.save();
  await item.save();
};

/*****************************************************************************************************/

const buyCase = async (user, id, count, ctx) => {
  const needCase = cases[id];

  if (needCase) {
    let price = needCase.price;
    if (!isNaN(count)) {
      price *= count;
    } else {
      count = 1;
    }

    if (user.balance < price) {
      ctx.reply(`У вас недостаточно мефа😥`);
      return;
    }

    ctx.reply(
      `Успешно куплен ${needCase.name} в количестве ${count} за ${price}`
    );
    user.balance -= price;
    await loseLog(
      user,
      "меф",
      `покупка ${needCase.name} в количестве ${count}`
    );

    await resiveLog(user, `${needCase.name}`, `${count}`, "покупка в магазине");
    user[needCase.dbName] += count;
    await user.save();
  } else {
    ctx.reply(`Такого мефкейса нет😥`);
  }
};

const open = {
  minecraftCase: openminecraftCase,
  brawlCase: openbrawlCase,
  hotlineCase: openhotlineCase,
  falloutCase: openfalloutCase,
};

const openCase = async (user, id, ctx, bot) => {
  const needCase = cases[id];

  if (!needCase) {
    ctx.reply("Такого мефкейса нет😥");
    return;
  }

  const caseName = needCase.dbName;

  if (user[caseName] === 0) {
    ctx.reply(`Недостаточно мефкейсов😥`);
    return;
  }

  user[caseName]--;
  open[caseName](user, ctx, bot);
  await user.save();
  return;
};

module.exports = { openCase, buyCase, openDonateCase };
