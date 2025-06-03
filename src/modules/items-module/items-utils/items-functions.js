import { Item, User } from "../../../db/models.js";
import items from "../items.js";
import { loseLog } from "../../logs-module/globalLogs.js";
import { getRandomInt, separateNumber } from "../../../utils/helpers.js";
import { checkItem } from "./item-tool-service.js";
import { getUser } from "../../../db/functions.js";
import { Keyboard, Key } from "telegram-keyboard";
import dotenv from "dotenv";
dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});

const buyItem = async (user, itemInfo, ctx, status) => {
  if (user.slots < user.fullSlots) {
    await ctx.reply("Недостаточно слотов😥");
    return;
  }

  if (!itemInfo.canBuy && status) {
    await ctx.reply("Эту вещь нельзя купить😥");
    return;
  }

  if (
    user.balance < itemInfo.price &&
    status &&
    itemInfo.class !== "gem" &&
    itemInfo.class !== "fam"
  ) {
    await ctx.reply("Недостаточно старок 😢");
    return;
  } else if (status && itemInfo.class !== "gem" && itemInfo.class !== "fam") {
    user.balance -= itemInfo.price;
  }

  if (user.gems < itemInfo.price && status && itemInfo.class === "gem") {
    await ctx.reply("Недостаточно гемов 😢");
    return;
  } else if (status && itemInfo.class === "gem") {
    user.gems -= itemInfo.price;
  }

  if (user.famMoney < itemInfo.price && status && itemInfo.class === "fam") {
    await ctx.reply("Недостаточно семейных монет 😢");
    return;
  } else if (status && itemInfo.class === "fam") {
    user.famMoney -= itemInfo.price;
  }

  // if (user.snows < itemInfo.price && status && itemInfo.class === "event") {
  //   await ctx.reply("Недостаточно снежинок 😢");
  //   return;
  // } else if (status && itemInfo.class === "event") {
  //   user.snows -= itemInfo.price;
  // }

  await User.increment({ fullSlots: 1 }, { where: { id: user.id } });
  const item = await Item.create({
    src: itemInfo.src,
    itemName: itemInfo.name,
    bodyPart: itemInfo.bodyPart,
    isWorn: false,
    price: itemInfo.price,
  });

  await user.addItem(item);
  await user.save();
  await item.save();
  await ctx.replyWithHTML(
    `Ты купил(а): ${item.itemName}[${item.id}]\n\n📖<code>Надеть ${item.id}</code>`
  );

  const chance = getRandomInt(0, 100);

  if (chance === 5) {
    const itemInfo = items[125];
    const item = await Item.create({
      src: itemInfo.src,
      itemName: itemInfo.name,
      bodyPart: itemInfo.bodyPart,
      isWorn: false,
      price: itemInfo.price,
    });

    await User.increment({ fullSlots: 1 }, { where: { id: user.id } });

    await user.addItem(item);
    await user.save();
    await item.save();
    await ctx.replyWithHTML(
      `❗️Ты испытал удачу и получил ${itemInfo.name}❗️`
    );
    await ctx.telegram.sendMessage(
      process.env.CHAT_ID,
      `❗️@${user.username} испытал удачу и получил ${itemInfo.name}❗️`
    );
  }
};

const deleteItem = async (user, id) => {
  const item = await Item.findOne({
    where: {
      id: id,
      userId: user.id,
    },
  });

  if (!item) {
    return `У тебя нет такой вещи😥`;
  }
  const havePups = await checkItem(user.id, "Пупс «Бартер»");
  let cashBack;
  if (havePups) {
    cashBack = item.price;
  } else {
    cashBack = item.price / 2;
  }

  await loseLog(user, `${item.itemName}[${item.id}]`, `Удаление`);
  user.balance += cashBack;
  user.fullSlots--;
  await item.destroy();
  await user.save();
  return `Успешно удалена вещь ${item.itemName}[${item.id}]\nВы получили ${cashBack}`;
};

const removeItem = async (user, id, ctx) => {
  try {
    const item = await Item.findOne({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!item) {
      await ctx.reply("Такой вещи у тебя нет😥");
      return;
    }

    if (!item.isWorn) {
      await ctx.reply("Эта вещь и так не надета😎");
      return;
    }

    // снимаем указанный предмет
    item.isWorn = false;
    await item.save();

    await ctx.reply(`Ты снял(а) ${item.itemName}[${id}](+${item.lvl})`);
  } catch (error) {
    console.log(error);
    await ctx.reply("Что-то пошло не так");
  }
};

const getInventory = async (user, ctx) => {
  try {
    let buttons = Keyboard.inline([Key.callback("🔽Закрыть🔽", "dell")]);
    const items = await user.getItems();

    if (items.length === 0) {
      await ctx.reply("Твой инвентарь пуст.");
      return;
    }

    const categories = {
      head: "Голова",
      face: "Лицо",
      legs: "Ноги",
      leg1: "Ноги",
      leg2: "Ноги",
      left: "Рука(L)",
      right: "Рука(R)",
      extra: "Прочее",
      default: "Прочее",
    };

    const categorizedItems = {
      Голова: [],
      Лицо: [],
      Ноги: [],
      "Рука(L)": [],
      "Рука(R)": [],
      Прочее: [],
    };

    items.forEach((item) => {
      const category = categories[item.bodyPart] || categories.default;
      categorizedItems[category].push(
        `${item.itemName}[<code>${item.id}</code>](+${item.lvl})`
      );
    });

    const inventoryMessage = Object.entries(categorizedItems)
      .map(([category, items]) => {
        if (items.length > 0) {
          return `• ${category}:\n${items.join("\n")}`;
        }
        return "";
      })
      .filter((section) => section)
      .join("\n\n");

    const message = `Твой инвентарь:\n\n${inventoryMessage}\n\n📖Надеть id\n📖Удалить вещь id\n📖Передать вещь id\n📖Узнать айди id`;

    if (message.length > 4000) {
      const firstPage = inventoryMessage.slice(0, 150);
      buttons = Keyboard.inline([
        [Key.callback("Дальше", "next")],
        [Key.callback("🔽Закрыть🔽", "dell")],
      ]);

      await ctx.replyWithHTML(
        'Твой инвентарь уже открыт в <a href="https://t.me/PablMefBot">ЛС бота</a>',
        {
          reply_to_message_id: ctx.message.message_id,
          disable_web_page_preview: true,
        }
      );

      await ctx.telegram.sendMessage(user.chatId, firstPage, {
        parse_mode: "HTML",
        reply_markup: buttons.reply_markup,
      });
    } else {
      await ctx.replyWithHTML(message);
    }
  } catch (e) {
    console.log(e);
    return;
  }
};

const sellItem = async (user, id, price, replyMessage, ctx) => {
  try {
    if (price < 100) {
      return `Минимальная цена продажи 100 старок⭐️`;
    }

    const item = await Item.findOne({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!item) {
      return `У тебя нет такой вещи😥`;
    }

    if (replyMessage.isBot) {
      return `Нельзя продавать вещи ботам😥`;
    }

    const receiver = await getUser(replyMessage.id);

    if (receiver.id === user.id) {
      return `Нельзя продавать самому себе😥`;
    }

    if (receiver.fullSlots >= receiver.slots) {
      return `У юзера недостаточно слотов😥`;
    }

    if (receiver.balance < price) {
      return `У юзера недостаточно старок😥`;
    }

    await ctx.telegram.sendMessage(
      receiver.chatId,
      `${user.firstname} хочет продать тебе ${item.itemName}[${item.id}](+${
        item.lvl
      }) за ${separateNumber(price)} старок`,
      Keyboard.inline([
        [
          Key.callback(
            "Принять",
            `sell ${item.id} ${user.chatId} ${receiver.chatId} ${price}`
          ),
        ],
        [Key.callback("Отмена", "cancel")],
      ]),
      { parse_mode: "HTML" }
    );

    return `Предложение о покупке ${item.itemName}[${
      item.id
    }] за ${separateNumber(price)} старок было отправлено `;
  } catch (error) {
    console.log(error);
    return `Что-то пошло не так, возможно ${replyMessage.first_name} заблокировал меня в лс`;
  }
};

const getItemsLvl = async (userId) => {
  const items = await Item.findAll({
    where: {
      userId: userId,
      isWorn: true,
    },
  });

  let lvl = 0;
  items.forEach((item) => {
    lvl += item.lvl;
  });

  return lvl;
};

export { buyItem, deleteItem, removeItem, getInventory, sellItem, getItemsLvl };
