const { Case } = require("../../../db/models");
const cases = require("../cases");
const items = require("../../items-module/items");
const { resiveLog, loseLog } = require("../../logs-module/globalLogs");
const { getRandomInt } = require("../../../utils/helpers");
const { getUserCase } = require("./case-tool-service");
const {
  createItem,
} = require("../../items-module/items-utils/item-tool-service");

const openDonateCase = async (user, ctx) => {
  try {
    const userCase = await getUserCase(user.id);
    if (userCase.donate === 0) {
      await ctx.reply(`Недостаточно мефкейсов😥`);
      return;
    }

    userCase.donate--;
    await userCase.save();

    let result = `${user.username} открыл Донат кейс и получил`;
    const randomItem =
      Math.floor(Math.random() * Object.keys(items).length) + 1;
    const item = await createItem(randomItem);

    user.fullSlots++;
    await user.addItem(item);
    await ctx.reply(`❗️@${result} ${item.itemName}❗️`);
    await ctx.telegram.sendMessage(
      process.env.CHAT_ID,
      `❗️@${user.username} испытал удачу при открытии Донат кейса и выбил ${item.itemName}❗️`
    );
    await resiveLog(user, `${item.itemName}`, `1`, "приз из кейса");
    await user.save();
    await item.save();
  } catch (error) {
    console.log(error);
  }
};

const open = async (user, ctx, box) => {
  try {
    await Case.decrement({ [box.dbName]: 1 }, { where: { userId: user.id } });
    const chance = getRandomInt(1, 5000);
    let result = `${user.firstname} открыл ${box.name} и получил`;
    let winAmount = 0;

    if (chance <= 499) {
      const win = getRandomInt(1, 250);
      user.balance += win;
      result += ` ${win} мефа🌿`;
      await resiveLog(user, "меф", win, "приз из кейса");
      winAmount = win;
    }

    if (chance >= 500 && chance <= 510) {
      const randomItem = getRandomInt(0, box.itemsId.length);

      const item = await createItem(box.itemsId[randomItem]);

      user.fullSlots++;
      await user.addItem(item);
      await ctx.reply(`❗️@${result} ${item.itemName}❗️`);
      await ctx.telegram.sendMessage(
        process.env.CHAT_ID,
        `❗️@${user.username} испытал удачу при открытии  ${box.name} и выбил ${item.itemName}❗️`
      );
      await resiveLog(user, item.itemName, 1, "приз из кейса");
      await item.save();
      return;
    }

    if (chance >= 512 && chance <= 1500) {
      const win = getRandomInt(250, 1000);
      user.balance += win;
      result += ` ${win} мефа🌿`;
      await resiveLog(user, "меф", win, "приз из кейса");
    }

    if (chance === 1501) {
      const item = await createItem(100);

      user.fullSlots++;
      await user.addItem(item);
      await ctx.reply(`❗️@${result} ${item.itemName}❗️`);
      await ctx.telegram.sendMessage(
        process.env.CHAT_ID,
        `❗️@${user.username} испытал удачу при открытии  ${box.name} и выбил ${item.itemName}❗️`
      );
      await resiveLog(user, item.itemName, 1, "приз из кейса");
      await item.save();
      return;
    }

    if (chance >= 1502 && chance <= 1800) {
      const win = getRandomInt(1, 25);
      user.gems += win;
      result += ` ${win} гемов💎`;
      await resiveLog(user, "гемы", win, "приз из кейса");
    }

    if (chance >= 1801 && chance <= 1805) {
      user.slots += 1;
      result += ` 1 СЛОТ В ИНВЕНТАРЬ🎒`;
      await resiveLog(user, "слоты", 1, "приз из кейса");
    }

    if (chance > 1806) {
      result += " ничего😥";
    }
    await ctx.reply(result);
  } catch (error) {
    console.log(error);
  }
};

/*****************************************************************************************************/

const buyCase = async (user, id, count, ctx) => {
  const needCase = cases[id];
  const userCase = await getUserCase(user.id);

  if (needCase) {
    let price = needCase.price;
    if (!isNaN(count) && count > 0) {
      price *= count;
    } else {
      count = 1;
    }

    if (user.balance < price && needCase.class !== "gem") {
      await ctx.reply(`У вас недостаточно мефа😥`);
      return;
    } else if (needCase.class !== "gem") {
      user.balance -= price;
      await loseLog(
        user,
        "меф",
        `покупка ${needCase.name} в количестве ${count}`
      );

      await resiveLog(
        user,
        `${needCase.name}`,
        `${count}`,
        "покупка в магазине"
      );
    }

    if (user.gems < price && needCase.class === "gem") {
      await ctx.reply(`У вас недостаточно гемов😥`);
      return;
    } else if (needCase.class === "gem") {
      user.gems -= price;
      await loseLog(
        user,
        "гемы",
        `покупка ${needCase.name} в количестве ${count}`
      );

      await resiveLog(
        user,
        `${needCase.name}`,
        `${count}`,
        "покупка в магазине"
      );
    }
    userCase[needCase.dbName] += count;
    await userCase.save();
    await user.save();

    await ctx.reply(
      `Успешно куплен ${needCase.name} в количестве ${count} за ${price}`
    );
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
    const userCase = await getUserCase(user.id);

    if (userCase[caseName] > 0) {
      await open(user, ctx, needCase);
      await userCase.save();
      await user.save();
      await loseLog(user, user[caseName], "открытие");
    } else {
      await ctx.reply("Недостаточно мефкейсов😥");
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = { openCase, buyCase, openDonateCase };
