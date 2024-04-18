const { Case } = require("../../../db/models");
const cases = require("../cases");
const items = require("../../items-module/items");
const { resiveLog, loseLog } = require("../../logs-module/globalLogs");
const { getRandomInt } = require("../../../utils/helpers");
const { getUserCase } = require("./case-tool-service");
const {
  createItem,
  checkItem,
} = require("../../items-module/items-utils/item-tool-service");
const redisServise = require("../../../services/redis-servise");
const { syncUserCaseToDb } = require("../../../db/functions");
const { Keyboard, Key } = require("telegram-keyboard");

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
    await resiveLog(user, `${item.itemName}`, `1`, "приз из кейса");
    await user.save();
    await item.save();
    await ctx.telegram.sendMessage(
      process.env.CHAT_ID,
      `❗️<a href="tg://user?id=${user.chatId}">${user.firstname}</a> испытал удачу при открытии Донат кейса и выбил ${item.itemName}❗️`,
      {
        parse_mode: "HTML",
      }
    );
  } catch (error) {
    console.log(error);
  }
};

const open = async (user, ctx, box, luck) => {
  let result = ``;
  try {
    let chance = getRandomInt(1500, 1501);
    chance -= luck;

    if (chance <= 499) {
      const win = getRandomInt(1, 250);
      user.balance += win;
      result += `${win} мефа🌿`;
      await resiveLog(user, "меф", win, "приз из кейса");
    }

    if (chance >= 500 && chance <= 510) {
      const randomItem = getRandomInt(0, box.itemsId.length - 1);
      const item = await createItem(box.itemsId[randomItem]);

      user.fullSlots++;
      await user.addItem(item);
      await resiveLog(user, item.itemName, 1, "приз из кейса");
      await item.save();
      await user.save();
      result = `❗️${item.itemName}❗️`;
      await ctx.telegram.sendMessage(
        user.chatId,
        `❗️Ты испытал удачу при открытии ${box.name} и выбил ${item.itemName}❗️`,
        Keyboard.inline([[`Удалить вещь ${item.id}`]])
      );
      return result;
    }

    if (chance >= 512 && chance <= 1500) {
      const win = getRandomInt(250, 1000);
      user.balance += win;
      result += `${win} мефа🌿`;
      await resiveLog(user, "меф", win, "приз из кейса");
    }

    if (chance === 1501) {
      const item = await createItem(100);

      user.fullSlots++;
      await user.addItem(item);
      await resiveLog(user, item.itemName, 1, "приз из кейса");
      await item.save();
      await user.save();
      result = `❗️${item.itemName}❗️`;
      await ctx.telegram.sendMessage(
        user.chatId,
        `❗️Ты испытал удачу при открытии ${box.name} и выбил ${item.itemName}❗️`,
        Keyboard.inline([["Удалить вещь"]])
      );
      return result;
    }

    if (chance >= 1502 && chance <= 1800) {
      const win = getRandomInt(1, 25);
      user.gems += win;
      result += `${win} гемов💎`;
      await resiveLog(user, "гемы", win, "приз из кейса");
    }

    if (chance >= 1801 && chance <= 1805) {
      user.slots += 1;
      result += `+1 СЛОТ В ИНВЕНТАРЬ🎒`;
      await resiveLog(user, "слоты", 1, "приз из кейса");
    }

    if (chance > 1806) {
      result += "Ничего😥";
    }

    await user.save();
    return result;
  } catch (error) {
    console.log(error);
    return result;
  }
};

/*****************************************************************************************************/
/*****************************************************************************************************/
/*****************************************************************************************************/
/*****************************************************************************************************/
/*****************************************************************************************************/

const buyCase = async (user, id, count, ctx) => {
  const needCase = cases[id];
  await syncUserCaseToDb(user.id);
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
    userCase[needCase.dbName] += Number(count);
    await userCase.save();
    await user.save();

    await ctx.reply(
      `Успешно куплен ${needCase.name} в количестве ${count} за ${price}`
    );
  } else {
    await ctx.reply(`Такого мефкейса нет😥`);
  }
};

/*****************************************************************************************************/
/*****************************************************************************************************/
/*****************************************************************************************************/

const openCase = async (user, id, ctx, count = 1) => {
  try {
    const needCase = cases[id];
    if (!needCase) {
      await ctx.reply("Такого мефкейса нет😥");
      return;
    }

    const caseName = needCase.dbName;
    let userCase = await redisServise.get(user.id + "cases");

    if (!userCase) {
      userCase = await getUserCase(user.id);
      await redisServise.set(user.id + "cases", JSON.stringify(userCase));
    } else {
      userCase = JSON.parse(userCase);
    }

    if (userCase[caseName] < count) {
      return await ctx.reply("Недостаточно мефкейсов😥");
    }

    const isYesMane = await checkItem(user.id, "Йес-мэн");

    if ((!isYesMane && Number(count) > 1) || Number(count) >= 4) {
      await ctx.reply("Ты не можешь открыть столько за раз😥");
      return;
    }

    userCase[caseName] -= count;
    await redisServise.set(user.id + "cases", JSON.stringify(userCase));
    let results = [];
    let luck = 0;
    const pupsItem = await checkItem(user.id, "Пупс «Удача»");

    if (pupsItem) {
      luck += 1000;
    }
    for (let i = 0; i < count; i++) {
      const result = await open(user, ctx, needCase, luck);
      results.push("• " + result);
    }
    await loseLog(user, user[caseName], "открытие");
    await ctx.reply(
      `Ты открыл ${count} мефкейса и получил(а):\n\n${results.join("\n")}`
    );
  } catch (error) {
    console.log(error);
  }
};

module.exports = { openCase, buyCase, openDonateCase };
