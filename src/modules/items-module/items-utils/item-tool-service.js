const { Item } = require("../../../db/models");
const items = require("../items");

const getItemInfo = async (id, ctx) => {
  const needItem = items[id];

  if (!needItem) {
    await ctx.reply("Такой вещи вообще нет😥");
    return;
  }

  const info = needItem.info;

  if (!info) {
    await ctx.reply(`❗️${needItem.name}❗️\n\nУ данной вещи нет особености😥`);
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

  for (let itemId in items) {
    // Изменение имени переменной id на itemId
    if (items[itemId].name === needItem.itemName) {
      info = itemId;
    }
  }

  await ctx.replyWithHTML(`<code>инфа ${info}</code>`);
};
const checkItem = async (id, name) => {
  const hasItem = await Item.findOne({
    where: {
      userId: id,
      itemName: `${name}`,
      isWorn: true,
    },
  });

  if (hasItem) {
    return true;
  } else return false;
};
const createItem = async (id) => {
  const itemInfo = items[id];

  const item = await Item.create({
    src: itemInfo.src,
    itemName: itemInfo.name,
    bodyPart: itemInfo.bodyPart,
    isWorn: false,
    price: itemInfo.price,
  });

  return item;
};

module.exports = {
  getItemInfo,
  checkId,
  checkItem,
  createItem,
};
