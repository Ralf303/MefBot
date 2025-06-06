import { Op } from "sequelize";
import { getUserCase } from "../modules/case-module/case-utils/case-tool-service.js";
import redisServise from "../services/redis-servise.js";
import sequelize from "./config.js";
import { User, Case, Chat, Family, Bafs } from "./models.js";

const getUser = async (chatId, firstName, username) => {
  try {
    let user = await User.findOne({
      where: { chatId },
      include: Case,
    });
    if (!user) {
      user = await User.create({ chatId, firstName, username });
      // Создание таблицы кейс для нового пользователя
      await Case.create({ userId: user.id, status: "active" });
    } else {
      if (!username && firstName) {
        user = await user.update({ username: "donthavetag" });
      }

      if (!(user.username === username)) {
        user = await user.update({ username });
      }

      if (!user.firstname || !(user.firstname === firstName)) {
        user = await user.update({ firstname: firstName });
      }

      // Проверка на наличие таблицы кейс и создание, если отсутствует
      let cases = await Case.findAll({ where: { userId: user.id } });
      if (cases.length === 0) {
        await Case.create({ userId: user.id, status: "active" });
      }
    }
    return user;
  } catch (error) {
    console.log(error);
  }
};

const checkUserById = async (chatId) => {
  try {
    const user = await User.findOne({ where: { chatId: chatId } });
    return user;
  } catch (error) {
    console.log(error);
  }
};

const checkUserByUsername = async (username) => {
  try {
    const user = await User.findOne({ where: { username: username } });
    return user;
  } catch (error) {
    console.log(error);
  }
};

const getChat = async (chatId, title) => {
  try {
    let chat = await Chat.findOne({ where: { chatId: chatId } });

    if (!chat) {
      chat = await Chat.create({ chatId: chatId, name: title });
    }

    if (chat.name != title) {
      chat.name = title;
      await chat.save();
    }

    return chat;
  } catch (error) {
    console.log(error);
  }
};

const getVipChats = async () => {
  try {
    const chats = await Chat.findAll({ where: { vip: true } });
    return chats;
  } catch (error) {
    console.log(error);
  }
};

const updateChatTime = async () => {
  try {
    await Chat.update(
      { vipTime: sequelize.literal("vipTime - 1") },
      { where: { vip: true } }
    );
  } catch (error) {
    console.log(error);
  }
};

const connectToDb = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    await sequelize.sync();
    console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

const syncUserCaseToDb = async (userId) => {
  try {
    const userCaseRedis = await redisServise.get(userId + "cases");

    if (userCaseRedis) {
      const userCase = JSON.parse(userCaseRedis);

      const userCaseDb = await getUserCase(userId);

      for (let caseName in userCase) {
        userCaseDb[caseName] = userCase[caseName];
      }

      await userCaseDb.save();

      await redisServise.delete(userId + "cases");
    }
  } catch (error) {
    console.log(error);
  }
};

const getTopChats = async () => {
  try {
    const chats = await Chat.findAll({
      where: { bank: { [Op.gt]: 0 } },
      order: [["bank", "DESC"]],
      limit: 10,
    });

    return chats;
  } catch (error) {
    console.log(error);
  }
};

export {
  connectToDb,
  getUser,
  getChat,
  getVipChats,
  updateChatTime,
  syncUserCaseToDb,
  checkUserById,
  checkUserByUsername,
  getTopChats,
};
