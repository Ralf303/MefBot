const Jimp = require("jimp");
const { Item } = require("../db/models");
const clothes = require("../itemsObjects/clothes");
const { loseLog, resiveLog } = require("../logs/globalLogs");
const { getRandomInt } = require("../utils/helpers");

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
    await ctx.reply("Недостаточно слотов😥");
    return;
  }

  if (!itemInfo.canBuy && status) {
    await ctx.reply("Эту вещь нельзя купить😥");
    return;
  }

  if (user.balance < itemInfo.price && status && itemInfo.class !== "special") {
    await ctx.reply("Недостаточно мефа😢");
    return;
  } else if (status && itemInfo.class !== "special") {
    user.balance -= itemInfo.price;
  }

  if (user.gems < itemInfo.price && status && itemInfo.class === "special") {
    await ctx.reply("Недостаточно гемов😢");
    return;
  } else if (status && itemInfo.class === "special") {
    user.gems -= itemInfo.price;
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
    await ctx.reply(`У вас нет такой вещи😥`);
    return;
  }

  const cashBack = item.price / 2;
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
      await ctx.reply("Такой вещи у вас нет😥");
      return;
    }

    // проверяем, что предмет еще не надет
    if (item.isWorn) {
      await ctx.reply("Эта вещь уже надета😎");
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

    if (bodyPart === "legs") {
      // если надеваем вещь с bodyPart = 'legs', снимаем предыдущие items на leg1 и leg2
      const wornLegItem1 = await Item.findOne({
        where: {
          userId: user.id,
          bodyPart: "leg1",
          isWorn: true,
        },
      });

      const wornLegItem2 = await Item.findOne({
        where: {
          userId: user.id,
          bodyPart: "leg2",
          isWorn: true,
        },
      });

      for (let i = 1; i <= 5; i++) {
        const wornFnafItem = await Item.findOne({
          where: {
            userId: user.id,
            bodyPart: `fnaf_set${i}`,
            isWorn: true,
          },
        });

        if (wornFnafItem) {
          wornFnafItem.isWorn = false;
          await wornFnafItem.save();
        }
      }

      for (let i = 1; i <= 7; i++) {
        const wornPupsItem = await Item.findOne({
          where: {
            userId: user.id,
            bodyPart: `pups_set${i}`,
            isWorn: true,
          },
        });

        if (wornPupsItem) {
          wornPupsItem.isWorn = false;
          await wornPupsItem.save();
        }
      }

      if (wornLegItem1) {
        wornLegItem1.isWorn = false;
        await wornLegItem1.save();
      }

      if (wornLegItem2) {
        wornLegItem2.isWorn = false;
        await wornLegItem2.save();
      }
    }

    if (bodyPart === "leg1" || bodyPart === "leg2") {
      // если надеваем вещь с bodyPart = 'leg1' или 'leg2', снимаем вещь с bodyPart = 'legs'
      const wornLegsItem = await Item.findOne({
        where: {
          userId: user.id,
          bodyPart: "legs",
          isWorn: true,
        },
      });

      for (let i = 1; i <= 5; i++) {
        const wornFnafItem = await Item.findOne({
          where: {
            userId: user.id,
            bodyPart: `fnaf_set${i}`,
            isWorn: true,
          },
        });

        if (wornFnafItem) {
          wornFnafItem.isWorn = false;
          await wornFnafItem.save();
        }
      }

      for (let i = 1; i <= 7; i++) {
        const wornPupsItem = await Item.findOne({
          where: {
            userId: user.id,
            bodyPart: `pups_set${i}`,
            isWorn: true,
          },
        });

        if (wornPupsItem) {
          wornPupsItem.isWorn = false;
          await wornPupsItem.save();
        }
      }

      if (wornLegsItem) {
        wornLegsItem.isWorn = false;
        await wornLegsItem.save();
      }
    }

    if (bodyPart.includes("fnaf_set")) {
      const wornLegItem1 = await Item.findOne({
        where: {
          userId: user.id,
          bodyPart: "leg1",
          isWorn: true,
        },
      });

      const wornLegItem2 = await Item.findOne({
        where: {
          userId: user.id,
          bodyPart: "leg2",
          isWorn: true,
        },
      });

      const wornLegItem3 = await Item.findOne({
        where: {
          userId: user.id,
          bodyPart: "legs",
          isWorn: true,
        },
      });

      for (let i = 1; i <= 7; i++) {
        const wornPupsItem = await Item.findOne({
          where: {
            userId: user.id,
            bodyPart: `pups_set${i}`,
            isWorn: true,
          },
        });

        if (wornPupsItem) {
          wornPupsItem.isWorn = false;
          await wornPupsItem.save();
        }
      }

      if (wornLegItem1) {
        wornLegItem1.isWorn = false;
        await wornLegItem1.save();
      }

      if (wornLegItem2) {
        wornLegItem2.isWorn = false;
        await wornLegItem2.save();
      }

      if (wornLegItem3) {
        wornLegItem3.isWorn = false;
        await wornLegItem3.save();
      }
    }

    if (bodyPart.includes("pups_set")) {
      const wornLegItem1 = await Item.findOne({
        where: {
          userId: user.id,
          bodyPart: "leg1",
          isWorn: true,
        },
      });

      const wornLegItem2 = await Item.findOne({
        where: {
          userId: user.id,
          bodyPart: "leg2",
          isWorn: true,
        },
      });

      for (let i = 1; i <= 5; i++) {
        const wornFnafItem = await Item.findOne({
          where: {
            userId: user.id,
            bodyPart: `fnaf_set${i}`,
            isWorn: true,
          },
        });

        if (wornFnafItem) {
          wornFnafItem.isWorn = false;
          await wornFnafItem.save();
        }
      }

      const wornLegItem3 = await Item.findOne({
        where: {
          userId: user.id,
          bodyPart: "legs",
          isWorn: true,
        },
      });
      if (wornLegItem1) {
        wornLegItem1.isWorn = false;
        await wornLegItem1.save();
      }

      if (wornLegItem2) {
        wornLegItem2.isWorn = false;
        await wornLegItem2.save();
      }

      if (wornLegItem3) {
        wornLegItem3.isWorn = false;
        await wornLegItem3.save();
      }
    }

    if (bodyPart === "set") {
      const wornFace = await Item.findOne({
        where: {
          userId: user.id,
          bodyPart: "face",
          isWorn: true,
        },
      });

      const wornHead = await Item.findOne({
        where: {
          userId: user.id,
          bodyPart: "head",
          isWorn: true,
        },
      });

      if (wornFace) {
        wornFace.isWorn = false;
        await wornFace.save();
      }

      if (wornHead) {
        wornHead.isWorn = false;
        await wornHead.save();
      }
    }

    if (bodyPart === "face" || bodyPart === "head") {
      const wornSetItem = await Item.findOne({
        where: {
          userId: user.id,
          bodyPart: "set",
          isWorn: true,
        },
      });

      if (wornSetItem) {
        wornSetItem.isWorn = false;
        await wornSetItem.save();
      }
    }

    // надеваем указанный предмет
    item.isWorn = true;
    await item.save();

    await ctx.reply(`Вы надели ${item.itemName}[${id}]`);
  } catch (error) {
    console.log(error);
    await ctx.reply("Что-то пошло не так");
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

    items.forEach(async (item) => {
      if (item.itemName === "BEARBRICKS") {
        const number = getRandomInt(1, 32);
        item.src = `img/bear_${number}.png`;
        await item.save();
      }
    });

    // формируем массив с названиями вещей и их идентификаторами
    const wornItems = items.map(
      (item) => `${item.itemName}[<code>${item.id}</code>]`
    );
    const src = items.map((item) => `${item.src}`);
    if (wornItems.length === 0) {
      await ctx.replyWithPhoto(
        { source: "img/bg.jpg" },
        {
          caption: `На вас ничего не надето`,
          reply_to_message_id: ctx.message.message_id,
        }
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
      {
        parse_mode: "HTML",
        caption: `На вас надето:\n${rows.join("\n")}`,
        reply_to_message_id: ctx.message.message_id,
      }
    );
    return;
  } catch (error) {
    console.log(error);
    await ctx.reply("Что-то пошло не так😥");
  }
};

const getInventory = async (user, ctx) => {
  const items = await user.getItems();
  if (items.length === 0) {
    await ctx.reply("Ваш инвентарь пуст.");
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
    `Ваш инвентарь:\n${rows.join(
      "\n"
    )}\n\n📖Надеть id\n📖Удалить вещь id\n📖Передать вещь id`
  );
};

const tryItem = async (itemInfo, ctx, id) => {
  if (!itemInfo.canBuy) {
    await ctx.reply("Эту вещь нельзя примерить");
    return;
  }

  let src = [];
  src.push(itemInfo.src);
  await ctx.replyWithPhoto(
    { source: await blendImages(src) },
    {
      parse_mode: "HTML",
      caption: `Вот как будет выглядить ${itemInfo.name}[${id}]\nКупить ее можно командой:\n<code>Купить вещь ${id}</code>`,
    }
  );
};

const getItemInfo = async (id, ctx) => {
  const needItem = clothes[id];

  if (!needItem) {
    await ctx.reply("Такой вещи вообще нет😥");
    return;
  }

  const info = needItem.info;

  if (!info) {
    await ctx.reply("У данной вещи нет особености😥");
    return;
  }

  await ctx.reply(`❗️${needItem.name}❗️\n\n${info}`);
};

const checkId = async (id, ctx) => {
  const needItem = await Item.findOne({ where: { id: id } }); // Изменение условия для поиска элемента в базе данных
  if (!needItem) {
    await ctx.reply("Такой вещи вообще нет😥");
    return;
  }
  let info;

  for (let itemId in clothes) {
    // Изменение имени переменной id на itemId
    if (clothes[itemId].name === needItem.itemName) {
      info = itemId;
    }
  }

  await ctx.replyWithHTML(`<code>инфа ${info}</code>`);
};

module.exports = {
  buyItem,
  deleteItem,
  wearItem,
  getWornItems,
  getInventory,
  removeItem,
  tryItem,
  getItemInfo,
  blendImages,
  checkId,
};
