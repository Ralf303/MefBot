import { Op } from "sequelize";
import redisService from "../services/redis-service.js";
import sequelize, { currentTransaction } from "./config.js";
import { User, Case, Chat, Family, Bafs, CaseCacheMigration } from "./models.js";

const getUser = async (chatId, firstName, username) => {
  try {
    let user = await User.findOne({
      where: { chatId },
      include: Case,
    });
    if (!user) {
      user = await User.create({ chatId, firstname: firstName, username });
      // Создание таблицы кейс для нового пользователя
      await Case.create({ userId: user.id, status: "active" });
    } else {
      const changes = {};
      if (firstName !== undefined && user.firstname !== firstName) changes.firstname = firstName;
      if (username !== undefined || firstName !== undefined) {
        const name = username || "donthavetag";
        if (user.username !== name) changes.username = name;
      }
      if (Object.keys(changes).length) await user.update(changes);

      // Проверка на наличие таблицы кейс и создание, если отсутствует
      if (!user.case) {
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
    throw error;
  }
};

// One-time, transactional import of balances left by the old Redis case cache.
const syncUserCaseToDb = async (userId) => {
  const key = userId + "cases";
  const cached = await redisService.get(key);
  if (!cached) return;
  const apply = async (transaction) => {
    const userCase = await Case.findOne({ where: { userId }, transaction, lock: transaction.LOCK.UPDATE });
    if (!userCase) throw new Error("CASE_NOT_FOUND");
    const [marker, created] = await CaseCacheMigration.findOrCreate({ where: { userId }, transaction });
    if (created) {
      const balances = JSON.parse(cached);
      for (const name of ["minecraft", "brawl", "hotline", "donate", "fallout", "fnaf", "gem", "fam"]) {
        if (balances[name] !== undefined) {
          const amount = Number(balances[name]);
          if (!Number.isSafeInteger(amount) || amount < 0) throw new Error("INVALID_CACHED_CASE_AMOUNT");
          userCase[name] = amount;
        }
      }
      await userCase.save({ transaction });
    }
    transaction.afterCommit(async () => {
      try { await redisService.delete(key); } catch (error) { console.error("Legacy case cache cleanup:", error); }
    });
  };
  const transaction = currentTransaction();
  if (transaction) await apply(transaction);
  else await sequelize.transaction(apply);
};

const migrateLegacyCaseCache = async () => {
  for await (const key of redisService.client.scanIterator({ MATCH: "*cases", COUNT: 100 })) {
    const id = /^(\d+)cases$/.exec(key)?.[1];
    if (id) await syncUserCaseToDb(Number(id));
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
  migrateLegacyCaseCache,
  checkUserById,
  checkUserByUsername,
  getTopChats,
};
