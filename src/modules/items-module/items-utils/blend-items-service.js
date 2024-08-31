const Jimp = require("jimp");
const { Item } = require("../../../db/models");
const { getRandomInt } = require("../../../utils/helpers");
const redisServise = require("../../../services/redis-servise");

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
    const redisKey = `pablo_${user.id}`;
    const srcKey = `src_${user.id}`;
    let buffer = await redisServise.get(redisKey);
    let srcInRedis = await redisServise.get(srcKey);
    const items = await Item.findAll({
      where: {
        userId: user.id,
        isWorn: true,
      },
    });

    const src = items.map((item) => `${item.src}`);

    if (!buffer || srcInRedis !== JSON.stringify(src)) {
      items.forEach(async (item) => {
        if (item.itemName === "BEARBRICKS") {
          const number = getRandomInt(1, 32);
          item.src = `img/bear_${number}.png`;
          await item.save();
        }

        if (item.itemName === "Хомяк") {
          const number = getRandomInt(1, 31);
          item.src = `img/homa_${number}.png`;
          await item.save();
        }

        if (item.itemName === "Balance Bag") {
          let number;
          const { balance } = user;
          if (balance <= 100000) {
            number = 1;
          } else if (balance <= 500000) {
            number = 2;
          } else if (balance <= 1000000) {
            number = 3;
          } else if (balance <= 5000000) {
            number = 4;
          } else if (balance <= 10000000) {
            number = 5;
          } else if (balance <= 25000000) {
            number = 6;
          } else {
            number = 7;
          }

          item.src = `img/moneyBag_${number}.png`;
          await item.save();
        }
      });

      if (
        items.every((item) => item.itemName !== "BEARBRICKS") &&
        items.every((item) => item.itemName !== "Хомяк") &&
        items.every((item) => item.itemName !== "Balance Bag")
      ) {
        buffer = await blendImages(src);
        await redisServise.set(redisKey, buffer.toString("base64"));
        await redisServise.set(srcKey, JSON.stringify(src));
      } else {
        buffer = await blendImages(src);
      }
    } else {
      buffer = Buffer.from(buffer, "base64");
    }

    const wornItems = items.map(
      (item) => `${item.itemName}[<code>${item.id}</code>](+${item.lvl})`
    );

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

    await ctx.replyWithPhoto(
      { source: buffer },
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
