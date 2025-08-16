import cases from "../cases.js";
import items from "../../items-module/items.js";
import { resiveLog } from "../../logs-module/globalLogs.js";
import { getRandomInt } from "../../../utils/helpers.js";
import { getUserCase } from "./case-tool-service.js";
import {
  createItem,
  checkItem,
} from "../../items-module/items-utils/item-tool-service.js";
import redisService from "../../../services/redis-service.js";
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
    let chance = getRandomInt(0, 6000 - luck);

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

    if (chance >= 2004 && chance <= 2006) {
      const win = getRandomInt(1, 3);
      user.freeze += win;
      result += `${win} охлаждающих жидкостей ❄️`;
    }

    if (chance >= 2007 && chance <= 2010) {
      const win = getRandomInt(1, 10);
      user.oil += win;
      result += `${win} смазок для видеокарты 🛢`;
    }

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
  if (!needCase) return ctx.reply(`Такого старкейса нет😥`);

  await syncUserCaseToDb(user.id);
  const userCase = await getUserCase(user.id);

  count = !isNaN(count) && count > 0 ? Number(count) : 1;
  const totalPrice = needCase.price * count;

  const cls = needCase.class;

  if (
    cls !== "gem" &&
    cls !== "fam" &&
    cls !== "donate" &&
    user.balance < totalPrice
  ) {
    return ctx.reply(`У тебя недостаточно старок 😥`);
  }
  if (cls === "gem" && user.gems < totalPrice) {
    return ctx.reply(`У тебя недостаточно гемов 😥`);
  }
  if (cls === "fam" && user.famMoney < totalPrice) {
    return ctx.reply(`У тебя недостаточно семейных монет 😥`);
  }
  if (cls === "donate" && user.donate < totalPrice) {
    return ctx.reply(`У тебя недостаточно искр 😥`);
  }

  switch (cls) {
    case "gem":
      user.gems -= totalPrice;
      break;
    case "fam":
      user.famMoney -= totalPrice;
      break;
    case "donate":
      user.donate -= totalPrice;
      break;
    default:
      user.balance -= totalPrice;
  }

  userCase[needCase.dbName] += count;

  await Promise.all([userCase.save(), user.save()]);

  return ctx.reply(
    `Успешно куплен ${needCase.name} в количестве ${count} за ${totalPrice}`
  );
};

/*****************************************************************************************************/
/*****************************************************************************************************/
/*****************************************************************************************************/
//ТУТ ФУНКЦИЯ ОТКРЫТИЯ КЕЙСА ОНА ВАЩЕ ВАЖНАЯ

const openCase = async (user, id, ctx, count = 1) => {
  try {
    const needCase = cases[id];
    if (!needCase) return ctx.reply("Такого старкейса нет😥");

    const caseName = needCase.dbName;
    let userCase = await redisService.get(user.id + "cases");

    if (!userCase) {
      userCase = await getUserCase(user.id);
      await redisService.set(user.id + "cases", JSON.stringify(userCase));
    } else {
      userCase = JSON.parse(userCase);
    }

    if (userCase[caseName] < count) {
      return ctx.reply("Недостаточно старкейсов😥");
    }

    let maxCount = 1;
    const [isYesMan, fam] = await Promise.all([
      checkItem(user.id, "Йес-мэн"),
      getFamilyByUserId(user.chatId),
    ]);

    if (isYesMan) maxCount += 2;
    if (fam) maxCount += fam.Baf.case;

    if (count > maxCount) {
      return ctx.reply("Ты не можешь открыть столько за раз😥");
    }

    userCase[caseName] -= count;
    await redisService.set(user.id + "cases", JSON.stringify(userCase));

    let luck = 0;
    const pupsItem = await checkItem(user.id, "Пупс «Удача»");
    if (pupsItem) luck += 500;
    if (fam) luck += fam.Baf.luck * 200;

    const results = await Promise.all(
      Array.from({ length: count }, () => open(user, ctx, needCase, luck))
    );

    const formatted = results.map((res) => `• ${res}`).join("\n");
    await ctx.reply(
      `Ты открыл ${count} старкейса и получил(а):\n\n${formatted}`
    );
  } catch (error) {
    console.error(error);
  }
};

export { openCase, buyCase, openDonateCase };
