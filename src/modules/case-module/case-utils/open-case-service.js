import cases from "../cases.js";
import items from "../../items-module/items.js";
import { resiveLog } from "../../logs-module/globalLogs.js";
import { getRandomInt } from "../../../utils/helpers.js";
import { getUserCase } from "./case-tool-service.js";
import {
  createItem,
  checkItem,
} from "../../items-module/items-utils/item-tool-service.js";
import redisServise from "../../../services/redis-servise.js";
import { syncUserCaseToDb } from "../../../db/functions.js";
import { Keyboard } from "telegram-keyboard";
import { getFamilyByUserId } from "../../fam-module/fam-service.js";
import dotenv from "dotenv";
dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});

const openDonateCase = async (user, ctx) => {
  try {
    const userCase = await getUserCase(user.id);
    if (userCase.donate === 0) {
      await ctx.reply(`Недостаточно старкейсов😥`);
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
    let chance = getRandomInt(0, 6000);
    chance -= luck;

    if (chance <= 499) {
      const win = getRandomInt(1, 250);
      user.balance += win;
      result += `${win} старок⭐️`;
    }

    if (chance >= 500 && chance <= 505 && user.fullSlots < 200) {
      const randomItem = getRandomInt(0, box.itemsId.length - 1);
      const item = await createItem(box.itemsId[randomItem]);

      user.fullSlots++;
      await user.addItem(item);
      await item.save();
      await user.save();
      result = `❗️${item.itemName}❗️`;
      await ctx.telegram.sendMessage(
        user.chatId,
        `❗️Ты испытал удачу при открытии ${box.name} и выбил ${item.itemName}❗️`,
        Keyboard.inline([[`Удалить вещь ${item.id}`]])
      );
      return result;
    } else if (chance >= 500 && chance <= 505 && user.fullSlots >= 200) {
      const win = getRandomInt(1, 10);
      user.freeze += win;
      result += `${win} охлаждающих жидкостей❄️`;
    }

    if (chance >= 506 && chance <= 1500) {
      const win = getRandomInt(200, 400);
      user.balance += win;
      result += `${win} старок⭐️`;
    }

    const dopChance = await getRandomInt(1, 10);
    if (chance === 1501 && user.fullSlots < 200 && dopChance === 1) {
      const item = await createItem(100);
      user.fullSlots++;
      await user.addItem(item);
      await item.save();
      await user.save();
      result = `❗️${item.itemName}❗️`;
      await ctx.telegram.sendMessage(
        user.chatId,
        `❗️Ты испытал удачу при открытии ${box.name} и выбил ${item.itemName}❗️`,
        Keyboard.inline([["Удалить вещь"]])
      );
      return result;
    } else if (chance === 1501 && (user.fullSlots >= 200 || dopChance != 1)) {
      user.stones += 1;
      result += `ТОЧИЛЬНЫЙ КАМЕНЬ`;
    }

    if (chance >= 1502 && chance <= 1512) {
      const win = getRandomInt(1, 5);
      user.gems += win;
      result += `${win} гемов💎`;
    }

    if (chance >= 1513 && chance <= 1515 && user.slots < 200) {
      user.slots += 1;
      result += `+1 СЛОТ В ИНВЕНТАРЬ🎒`;
    } else if (chance >= 1513 && chance <= 1515 && user.slots === 200) {
      const win = getRandomInt(1, 10);
      user.freeze += win;
      result += `${win} охлаждающих жидкостей❄️`;
    }

    if (chance >= 1516 && chance <= 2000) {
      const win = getRandomInt(100, 500);
      user.balance += win;
      result += `${win} старок⭐️`;
    }

    if (chance >= 2001 && chance <= 2003) {
      user.stones += 1;
      result += `ТОЧИЛЬНЫЙ КАМЕНЬ`;
    }

    // if (chance >= 2004 && chance <= 2006) {
    //   const win = getRandomInt(1, 3);
    //   user.freeze += win;
    //   result += `${win} охлаждающих жидкостей ❄️`;
    // }

    // if (chance >= 2007 && chance <= 2010) {
    //   const win = getRandomInt(1, 10);
    //   user.oil += win;
    //   result += `${win} смазок для видеокарты 🛢`;
    // }

    if (chance >= 2004) {
      const win = getRandomInt(22, 52);
      user.balance += win;
      result += `${win} старок⭐️`;
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
/*****************************************************************************************************/
/*****************************************************************************************************/
/*****************************************************************************************************/
/*****************************************************************************************************/
/*****************************************************************************************************/
/*****************************************************************************************************/
/*****************************************************************************************************/
/*****************************************************************************************************/
/*****************************************************************************************************/
/*****************************************************************************************************/
/*****************************************************************************************************/
/*****************************************************************************************************/
/*****************************************************************************************************/
/*****************************************************************************************************/
/*****************************************************************************************************/
/*****************************************************************************************************/
//ФУНКЦИЯ ПОКУПКИ ЛЮБОГО КЕЙСА
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

    if (
      user.balance < price &&
      needCase.class !== "gem" &&
      needCase.class !== "fam"
    ) {
      await ctx.reply(`У тебя недостаточно старок 😥`);
      return;
    } else if (needCase.class !== "gem") {
      user.balance -= price;
    }

    if (user.gems < price && needCase.class === "gem") {
      await ctx.reply(`У тебя недостаточно гемов 😥`);
      return;
    } else if (needCase.class === "gem") {
      user.gems -= price;
    }

    if (user.famMoney < price && needCase.class === "fam") {
      await ctx.reply(`У тебя недостаточно семейных монет 😥`);
      return;
    } else if (needCase.class === "fam") {
      user.famMoney -= price;
    }
    userCase[needCase.dbName] += Number(count);
    await userCase.save();
    await user.save();

    await ctx.reply(
      `Успешно куплен ${needCase.name} в количестве ${count} за ${price}`
    );
  } else {
    await ctx.reply(`Такого старкейса нет😥`);
  }
};

/*****************************************************************************************************/
/*****************************************************************************************************/
/*****************************************************************************************************/
//ТУТ ФУНКЦИЯ ОТКРЫТИЯ КЕЙСА ОНА ВАЩЕ ВАЖНАЯ

const openCase = async (user, id, ctx, count = 1) => {
  try {
    const needCase = cases[id];
    if (!needCase) {
      await ctx.reply("Такого старкейса нет😥");
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
      return await ctx.reply("Недостаточно старкейсов😥");
    }

    let caseCounte = 1;
    const isYesMan = await checkItem(user.id, "Йес-мэн");

    if (isYesMan) {
      caseCounte += 2;
    }

    const fam = await getFamilyByUserId(user.chatId);

    if (fam) {
      caseCounte += fam.Baf.case;
    }

    if (caseCounte < Number(count)) {
      await ctx.reply("Ты не можешь открыть столько за раз😥");
      return;
    }

    userCase[caseName] -= count;
    await redisServise.set(user.id + "cases", JSON.stringify(userCase));
    let results = [];
    let luck = 0;
    const pupsItem = await checkItem(user.id, "Пупс «Удача»");

    if (pupsItem) {
      luck += 500;
    }

    if (fam) {
      luck += fam.Baf.luck * 200;
    }

    for (let i = 0; i < count; i++) {
      const result = await open(user, ctx, needCase, luck);
      results.push("• " + result);
    }
    await ctx.reply(
      `Ты открыл ${count} старкейса и получил(а):\n\n${results.join("\n")}`
    );
  } catch (error) {
    console.log(error);
  }
};

export { openCase, buyCase, openDonateCase };
