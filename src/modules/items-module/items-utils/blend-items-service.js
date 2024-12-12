const Jimp = require("jimp");
const { Item } = require("../../../db/models");
const { getRandomInt, separateNumber } = require("../../../utils/helpers");
const redisServise = require("../../../services/redis-servise");

async function blendImages(imagePaths, backgroundPath) {
  const bg = await Jimp.read(backgroundPath);
  for (const imagePath of imagePaths) {
    const fg = await Jimp.read(imagePath);
    const y = 0;
    const x = 0;
    bg.composite(fg, x, y);
  }

  const buffer = await bg.getBufferAsync(Jimp.MIME_PNG);
  return buffer;
}

async function overlayImage(foregroundBuffer, home) {
  const bg = await Jimp.read(home.src);
  const fg = await Jimp.read(foregroundBuffer);
  fg.resize(home.scale, Jimp.AUTO);
  const y = home.y;
  const x = home.x;
  bg.composite(fg, x, y);
  const buffer = await bg.getBufferAsync(Jimp.MIME_PNG);
  return buffer;
}

const getWornItems = async (user, ctx, home, dbHome) => {
  try {
    const homeKey = home ? `${home.src}` : "default";
    const redisKey = `pablo_${user.id}_${homeKey}`;
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
      for (const item of items) {
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
      }

      if (home) {
        const mainBg = `./img/no_bg.png`;
        buffer = await blendImages(src, mainBg);
        buffer = await overlayImage(buffer, home);
      } else {
        const mainBg = `./img/bg.png`;
        buffer = await blendImages(src, mainBg);
      }

      await redisServise.set(redisKey, buffer.toString("base64"));
      await redisServise.set(srcKey, JSON.stringify(src));
    } else {
      buffer = Buffer.from(buffer, "base64");
    }

    const wornItems = items.map(
      (item) => `• ${item.itemName}[<code>${item.id}</code>](+${item.lvl})`
    );

    const homeInfo = home
      ? `\n🏠 Твой дом «${home.name}»\n💸 Налог: ${separateNumber(
          dbHome.tax
        )}/36.000\n⚡️ Электричество: ${separateNumber(dbHome.energy)}/10.000`
      : "";

    if (wornItems.length === 0) {
      let imgSrc;

      if (home) {
        imgSrc = `./img/no_bg.png`;
        imgSrc = await overlayImage(imgSrc, home);
      } else {
        imgSrc = `./img/bg.png`;
      }
      await ctx.replyWithPhoto(
        { source: imgSrc },
        {
          caption: `На тебе ничего не надето\n\n${homeInfo}`,
          reply_to_message_id: ctx.message.message_id,
        }
      );
      return;
    }

    const rows = wornItems.map((item) => item);

    await ctx.replyWithPhoto(
      { source: buffer },
      {
        parse_mode: "HTML",
        caption: `👕 На тебе надето:\n${rows.join("\n")}\n\n${homeInfo}`,
        reply_to_message_id: ctx.message.message_id,
      }
    );
    return;
  } catch (error) {
    console.log(error);
    await ctx.reply("Что-то пошло не так");
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
    { source: await blendImages(src, `./img/bg.png`) },
    {
      parse_mode: "HTML",
      caption: `Вот как будет выглядить ${itemInfo.name}[${id}]\nКупить ее можно командой:\n<code>Купить вещь ${id}</code>`,
    }
  );
};

module.exports = { getWornItems, blendImages, tryItem, overlayImage };
