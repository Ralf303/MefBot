const { Item, User } = require("../../../db/models.js");
const items = require("../items.js");
const { loseLog, resiveLog } = require("../../logs-module/globalLogs");
const { getRandomInt } = require("../../../utils/helpers");
const { checkItem } = require("./item-tool-service.js");

const buyItem = async (user, itemInfo, ctx, status) => {
  if (user.slots < user.fullSlots) {
    await ctx.reply("Недостаточно слотов😥");
    return;
  }

  if (!itemInfo.canBuy && status) {
    await ctx.reply("Эту вещь нельзя купить😥");
    return;
  }

  if (user.balance < itemInfo.price && status && itemInfo.class !== "gem") {
    await ctx.reply("Недостаточно мефа😢");
    return;
  } else if (status && itemInfo.class !== "gem") {
    user.balance -= itemInfo.price;
  }

  if (user.gems < itemInfo.price && status && itemInfo.class === "gem") {
    await ctx.reply("Недостаточно гемов😢");
    return;
  } else if (status && itemInfo.class === "gem") {
    user.gems -= itemInfo.price;
  }

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
  await loseLog(user, "меф", `покупка ${item.itemName}[${item.id}]`);
  await ctx.replyWithHTML(
    `Вы купили: ${item.itemName}[${item.id}]\n\n📖<code>Надеть ${item.id}</code>`
  );
  await resiveLog(
    user,
    `${item.itemName}[${item.id}]`,
    "1",
    "покупка в магазине"
  );

  const chance = getRandomInt(0, 100);

  if (chance === 5) {
    const itemInfo = items[125];
    const item = await Item.create({
      src: itemInfo.src,
      itemName: itemInfo.name,
      bodyPart: itemInfo.bodyPart,
      isWorn: false,
    });

    user.fullSlots++;
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

const deleteItem = async (user, id, ctx) => {
  const item = await Item.findOne({
    where: {
      id: id,
      userId: user.id,
    },
  });

  if (!item) {
    await ctx.reply(`У вас нет такой вещи😥`);
    return;
  }
  const havePups = await checkItem(user.id, "Пупс «Бартер»");
  let cashBack;
  if (havePups) {
    cashBack = item.price;
  } else {
    cashBack = item.price / 2;
  }

  await ctx.reply(
    `Успешно удалена вещь ${item.itemName}[${item.id}]\nВы получили ${cashBack}`
  );
  await loseLog(user, `${item.itemName}[${item.id}]`, `Удаление`);
  user.balance += cashBack;
  user.fullSlots--;
  await item.destroy();
  await user.save();
};

const removeItem = async (user, id, ctx) => {
  try {
    const item = await Item.findOne({
      where: {
        id: id,
        userId: user.id,
      },
    });

    // проверяем, что указанный предмет существует
    if (!item) {
      await ctx.reply("Такой вещи у вас нет😥");
      return;
    }

    // проверяем, что предмет не надет
    if (!item.isWorn) {
      await ctx.reply("Эта вещь и так не надета😎");
      return;
    }

    // снимаем указанный предмет
    item.isWorn = false;
    await item.save();

    await ctx.reply(`Вы сняли ${item.itemName}[${id}]`);
  } catch (error) {
    console.log(error);
    await ctx.reply("Что-то пошло не так");
  }
};

const getInventory = async (user, ctx) => {
  const items = await user.getItems();
  if (items.length === 0) {
    await ctx.reply("Твой инвентарь пуст.");
    return;
  }
  const itemNames = items.map(
    (item) => `${item.itemName}[<code>${item.id}</code>]`
  );
  const rows = [];
  for (let i = 0; i < itemNames.length; i += 2) {
    let row = itemNames[i];

    if (i + 1 < itemNames.length) {
      row += `, ${itemNames[i + 1]}`;
    }
    rows.push(row);
  }
  await ctx.replyWithHTML(
    `Твой инвентарь:\n${rows.join(
      "\n"
    )}\n\n📖Надеть id\n📖Удалить вещь id\n📖Передать вещь id`
  );
};

module.exports = {
  buyItem,
  deleteItem,
  getInventory,
  removeItem,
};
