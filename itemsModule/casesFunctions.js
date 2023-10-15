const { Item, User } = require("../db/models");
const cases = require("../itemsObjects/cases");
const clothes = require("../itemsObjects/clothes");
const { resiveLog, loseLog } = require("../logs/globalLogs");
const { getRandomInt, sleep } = require("../utils/helpers");

const openDonateCase = async (user, ctx) => {
  if (user.donateCase === 0) {
    await ctx.reply(`Недостаточно мефкейсов😥`);
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

const open = async (user, ctx, box) => {
  try {
    await User.update(
      { [box.dbName]: user[box.dbName] - 1 },
      { where: { id: user.id } }
    );
    const chance = getRandomInt(1, 1000);
    let result = `${user.username} открыл ${box.name} и получил`;
    if (chance <= 499) {
      const win = getRandomInt(1, 250);
      user.balance += win;
      result += ` ${win}MF`;
      await resiveLog(user, "меф", `${win}`, "приз из кейса");
    }

    if (chance >= 500 && chance <= 510) {
      const randomItem = getRandomInt(0, box.itemsId.length);
      const needItem = clothes[box.itemsId[randomItem]];
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
        `❗️@${user.username} испытал удачу при открытии  ${box.name} и выбил ${needItem.name}❗️`
      );
      await resiveLog(user, `${needItem.name}`, `1`, "приз из кейса");
      await item.save();
      return;
    }

    if (chance >= 511 && chance <= 599) {
      const win = getRandomInt(250, 1000);
      user.balance += win;
      result += ` ${win}MF`;
      await resiveLog(user, "меф", `${win}`, "приз из кейса");
    }

    if (chance >= 600) {
      result += " ничего😥";
    }

    await ctx.reply(result);
  } catch (e) {
    console.log(e);
  }
};
/*****************************************************************************************************/

const buyCase = async (user, id, count, ctx) => {
  const needCase = cases[id];

  if (needCase) {
    let price = needCase.price;
    if (!isNaN(count) && count > 0) {
      price *= count;
    } else {
      count = 1;
    }

    if (user.balance < price) {
      await ctx.reply(`У вас недостаточно мефа😥`);
      return;
    }

    await ctx.reply(
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
    await ctx.reply(`Такого мефкейса нет😥`);
  }
};

const openCase = async (user, id, ctx) => {
  try {
    const needCase = cases[id];
    if (!needCase) {
      await ctx.reply("Такого мефкейса нет😥");
      return;
    }

    const caseName = needCase.dbName;
    console.log(`У юзера ${user[caseName]}`);

    if (user[caseName] > 0) {
      await open(user, ctx, needCase);
      await user.save();
      console.log(`Теперь ${user[caseName]}`);
      await loseLog(user, user[caseName], "открытие");
    } else {
      await ctx.reply("Недостаточно мефкейсов😥");
    }
  } catch (e) {
    console.log(e);
  }
};

const getCaseInfo = async (id, ctx) => {
  const needCase = cases[id];

  if (!needCase) {
    await ctx.reply("Такого кейса вообще нет😥");
    return;
  }

  const info = needCase.items;

  await ctx.reply(`❗️${needCase.name}❗️\n\n${info}`);
};

module.exports = { openCase, buyCase, openDonateCase, getCaseInfo };
