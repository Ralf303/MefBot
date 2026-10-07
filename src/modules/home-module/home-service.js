import jwtService from "../../services/jwt-service.js";
import fs from "fs";
import { Home, Item } from "../../db/models.js";
import { home } from "./home.js";
import {
  blendImages,
  overlayImage,
} from "../items-module/items-utils/blend-items-service.js";
import redisService from "../../services/redis-service.js";
import { getUser } from "../../db/functions.js";
import { Keyboard, Key } from "telegram-keyboard";
import { separateNumber, getRandomInt } from "../../utils/helpers.js";

const getHomeByUserId = async (userId) => {
  const home = await Home.findOne({ where: { userId } });
  return home;
};

const getHomeById = async (id) => {
  const home = await Home.findOne({ where: { id } });
  return home;
};

const getHomeImg = async (homeId) => {
  const house = await Home.findOne({ where: { id: homeId }, include: "user" });

  if (!house) {
    throw new Error(`Дом с ID ${homeId} не найден`);
  }

  const homeData = house.toJSON();
  const imgPath = home[house.homeId]?.src;

  if (!house.userId) {
    if (imgPath) {
      const imgBuffer = fs.readFileSync(imgPath);
      homeData.imgSrc = imgBuffer.toString("base64");
    } else {
      homeData.imgSrc = null;
    }
  } else {
    const redisKey = `pablo_${house.userId}_${home[house.homeId].src}`;
    let cachedImage = await redisService.get(redisKey);
    if (cachedImage) {
      homeData.imgSrc = cachedImage;
    } else {
      const generatedImage = await generateHomeImg(
        house.user,
        home[house.homeId]
      );
      homeData.imgSrc = generatedImage;
    }
  }
  return homeData;
};

const getAllHomesWithImgs = async () => {
  const houses = await Home.findAll({ include: "user" });

  const results = await Promise.all(
    houses.map(async (house) => {
      const homeData = house.toJSON();

      const imgInfo = home[house.id]?.src;

      if (!house.userId) {
        if (imgInfo) {
          const imgBuffer = fs.readFileSync(imgInfo);
          homeData.imgSrc = imgBuffer.toString("base64");
        } else {
          homeData.imgSrc = null;
        }
      } else {
        const redisKey = `pablo_${house.userId}_${imgInfo}`;
        let cachedImage = await redisService.get(redisKey);
        if (cachedImage) {
          homeData.imgSrc = cachedImage;
        } else {
          const generatedImage = await generateHomeImg(house.user, imgInfo);
          homeData.imgSrc = generatedImage;
        }
      }

      return homeData;
    })
  );

  return results;
};

const generateHomeImg = async (user, home) => {
  try {
    const redisKey = `pablo_${user.id}_${home.src}`;
    const items = await Item.findAll({
      where: {
        userId: user.id,
        isWorn: true,
      },
    });
    console.log(
      `Generating home image for user ${JSON.stringify(
        user,
        null,
        2
      )} with home ${JSON.stringify(home, null, 2)}`
    );

    const src = items.map((item) => `${item.src}`);

    const mainBg = `./img/no_bg.png`;
    let buffer = await blendImages(src, mainBg);
    buffer = await overlayImage(buffer, home);

    const base64Image = buffer.toString("base64");
    await redisService.set(redisKey, base64Image);

    return base64Image;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const sellHome = async (user, price, replyMessage, ctx) => {
  try {
    if (price < 100) {
      return `Минимальная цена продажи 100 старок⭐️`;
    }

    const senderHome = await getHomeByUserId(user.id);

    if (!senderHome) {
      return `У тебя нет дома😥`;
    }

    if (replyMessage.isBot) {
      return `Нельзя продавать дома ботам😥`;
    }

    const receiver = await getUser(replyMessage.id);

    if (receiver.id === user.id) {
      return `Нельзя продавать самому себе😥`;
    }

    const receiverHome = await getHomeByUserId(receiver.id);

    if (receiverHome) {
      return `У юзера и так уже есть дом, зачем ему второй 🧐`;
    }

    if (receiver.balance < price) {
      return `У юзера недостаточно старок😥`;
    }

    await ctx.telegram.sendMessage(
      receiver.chatId,
      `${user.firstname} хочет продать тебе дом «${
        senderHome.name
      }» за ${separateNumber(price)} старок`,
      Keyboard.inline([
        [
          Key.callback(
            "Принять",
            jwtService.generateTradeToken("home", { id: senderHome.id, senderId: user.chatId, receiverId: receiver.chatId, price })
          ),
        ],
        [Key.callback("Отмена", "cancel")],
      ]),
      { parse_mode: "HTML" }
    );

    return `Предложение о покупке ${senderHome.name} за ${separateNumber(
      price
    )} старок было отправлено `;
  } catch (error) {
    console.log(error);
    return `Что-то пошло не так, возможно ${replyMessage.first_name} заблокировал меня в лс`;
  }
};

export {
  getHomeByUserId,
  getHomeImg,
  sellHome,
  getHomeById,
  getAllHomesWithImgs,
  generateHomeImg,
};
