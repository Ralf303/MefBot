const Jimp = require("jimp");
const { Item } = require("../../../db/models");
const { getRandomInt } = require("../../../utils/helpers");

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

    for (let i = 0; i < wornItems.length; i++) {
      let row = wornItems[i];
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

const tryItem = async (itemInfo, ctx, id) => {
  if (!itemInfo?.canBuy) {
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

module.exports = { getWornItems, blendImages, tryItem };
