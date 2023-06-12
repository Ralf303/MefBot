const Jimp = require("jimp");
const { Item } = require("../db/models");

async function blendImages(imagePaths) {
  const bg = await Jimp.read("img/bg.jpg");
  for (let i = 0; i < imagePaths.length; i++) {
    const fg = await Jimp.read(imagePaths[i]);
    const y = 0;
    const x = 0;

    bg.composite(fg, x, y);
  }

  const buffer = await bg.getBufferAsync(Jimp.MIME_JPEG);
  return buffer;
}

const buyItem = async (user, itemInfo, ctx, status) => {
  if (user.slots < user.fullSlots) {
    ctx.reply("Недостаточно слотов😥");
    return;
  }

  if (!itemInfo.canBuy && status) {
    ctx.reply("Эту вещь нельзя купить😥");
    return;
  }

  if (user.balance <= itemInfo.price && status) {
    ctx.reply("Недостаточно мефа😢");
    return;
  } else if (status) {
    user.balance -= itemInfo.price;
  }

  const item = await Item.create({
    src: itemInfo.src,
    itemName: itemInfo.name,
    bodyPart: itemInfo.bodyPart,
    isWorn: false,
    price: itemInfo.price,
  });

  user.fullSlots++;
  await user.addItem(item);
  await ctx.reply(`Вы купили: ${item.itemName}[${item.id}]`);
  await user.save();
  await item.save();
};

const deleteItem = async (user, id, ctx) => {
  const item = await Item.findOne({
    where: {
      id: id,
      userId: user.id,
    },
  });

  if (!item) {
    ctx.reply(`У вас нет такой вещи😥`);
    return;
  }

  const cashBack = Math.floor(item.price / 2);
  ctx.reply(
    `Успешно удалена вещь ${item.itemName}[${item.id}]\nВы получили ${cashBack}`
  );
  user.balance += cashBack;
  user.fullSlots--;
  await item.destroy();
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
      ctx.reply("Такой вещи у вас нет😥");
      return;
    }

    // проверяем, что предмет не надет
    if (!item.isWorn) {
      ctx.reply("Эта вещь и так не надета😎");
      return;
    }

    // снимаем указанный предмет
    item.isWorn = false;
    await item.save();

    ctx.reply(`Вы сняли ${item.itemName}[${id}]`);
  } catch (error) {
    console.log(error);
    ctx.reply("Что-то пошло не так");
  }
};

const wearItem = async (user, id, ctx) => {
  try {
    const item = await Item.findOne({
      where: {
        id: id,
        userId: user.id,
      },
    });

    // проверяем, что указанный предмет существует
    if (!item) {
      ctx.reply("Такой вещи у вас нет😥");
      return;
    }

    // проверяем, что предмет еще не надет
    if (item.isWorn) {
      ctx.reply("Эта вещь уже надета😎");
      return;
    }

    // проверяем, что указанный слот еще свободен
    const bodyPart = item.bodyPart;
    const wornItem = await Item.findOne({
      where: {
        userId: user.id,
        bodyPart: bodyPart,
        isWorn: true,
      },
    });

    if (wornItem) {
      // если на указанном слоте уже есть другая надетая вещь, снимаем ее
      wornItem.isWorn = false;
      await wornItem.save();
    }

    // надеваем указанный предмет
    item.isWorn = true;
    await item.save();

    ctx.reply(`Вы надели ${item.itemName}[${id}]`);
  } catch (error) {
    console.log(error);
    ctx.reply("Что-то пошло не так");
  }
};

const getWornItems = async (user, ctx) => {
  try {
    const items = await Item.findAll({
      where: {
        userId: user.id,
        isWorn: true,
      },
    });

    // формируем массив с названиями вещей и их идентификаторами
    const wornItems = items.map((item) => `${item.itemName}[${item.id}]`);
    const src = items.map((item) => `${item.src}`);
    if (wornItems.length === 0) {
      await ctx.replyWithPhoto(
        { source: "img/bg.jpg" },
        { caption: `На вас ничего не надето` }
      );
      return;
    }

    const rows = [];

    for (let i = 0; i < wornItems.length; i += 2) {
      let row = wornItems[i];
      if (i + 1 < wornItems.length) {
        row += `, ${wornItems[i + 1]}`;
      }
      rows.push(row);
    }
    // возвращаем список надетых вещей
    await ctx.replyWithPhoto(
      { source: await blendImages(src) },
      { caption: `На вас надето:\n${rows.join("\n")}` }
    );
    return;
  } catch (error) {
    console.log(error);
    ctx.reply("Что-то пошло не так😥");
  }
};

const getInventory = async (user, ctx) => {
  const items = await user.getItems();
  if (items.length === 0) {
    await ctx.reply("Ваш инвентарь пуст.");
    return;
  }
  const itemNames = items.map((item) => `${item.itemName}[${item.id}]`);
  const rows = [];
  for (let i = 0; i < itemNames.length; i += 2) {
    let row = itemNames[i];

    if (i + 1 < itemNames.length) {
      row += `, ${itemNames[i + 1]}`;
    }
    rows.push(row);
  }
  await ctx.reply(`Ваш инвентарь:\n${rows.join("\n")}`);
};

const tryItem = async (itemInfo, ctx, id) => {
  if (!itemInfo.canBuy) {
    ctx.reply("Эту вещь нельзя примерить");
    return;
  }

  let src = [];
  src.push(itemInfo.src);
  await ctx.replyWithPhoto(
    { source: await blendImages(src) },
    {
      caption: `Вот как будет выглядить ${itemInfo.name}[${id}]\nКупить ее можно командой:\n<<Купить вещь ${id}>>`,
    }
  );
};

module.exports = {
  buyItem,
  deleteItem,
  wearItem,
  getWornItems,
  getInventory,
  removeItem,
  tryItem,
};
