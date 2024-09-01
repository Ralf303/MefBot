const { User } = require("../db/models");
const { getFamilyByUserId } = require("../modules/fam-module/fam-service");
const items = require("../modules/items-module/items");
const redisServise = require("../services/redis-servise");

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCapcha() {
  let length = 6,
    charset = "1234567890";
  res = "";

  for (let i = 0, n = charset.length; i < length; i++) {
    res += charset.charAt(Math.floor(Math.random() * n));
  }

  return res;
}

function separateNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function calculateMiningAmount(balance) {
  return Math.floor(balance * 0.1);
}

function generatePassword(length) {
  let charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let retVal = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  let timeOutput = "";

  if (hours > 0) {
    timeOutput += `${hours} часов `;
  }

  if (minutes > 0) {
    timeOutput += `${minutes} минут `;
  }

  timeOutput += `${remainingSeconds} секунд`;

  return timeOutput.trim();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkUserSub(ctx, channel, id) {
  try {
    const chatMember = await ctx.telegram.getChatMember(channel, id);
    const status = chatMember.status;
    const needStatus = ["member", "administrator", "creator"];

    if (needStatus.includes(status)) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Произошла ошибка:", error);
    return false;
  }
}

async function checkUserProfile(user, ctx) {
  const message = ctx.message.reply_to_message;
  if (!message) {
    const fam = await getFamilyByUserId(user.chatId);
    await ctx.replyWithHTML(
      `Ник: ${user.firstname}
Id: <code>${user.chatId}</code>
Семья: ${fam ? `«${fam.name}»` : "Нет"}
Меф: ${separateNumber(user.balance)}
Гемы: ${user.gems}
Семейные монеты: ${user.famMoney}
Капчей введено: ${user.captureCounter}
Слотов всего: ${user.slots}
Слотов занято: ${user.fullSlots}`
    );

    return;
  }

  const playerChatId = message.from.id;

  // проверяем, что отправитель не является ботом
  if (message.from.is_bot) {
    await ctx.reply("У ботов не бывает профилей🙄");
    return;
  }

  try {
    const player = await User.findOne({
      where: { chatId: playerChatId },
    });

    if (player) {
      const fam = await getFamilyByUserId(player.chatId);
      await ctx.replyWithHTML(
        `Профиль ${player.firstname}
Id: <code>${player.chatId}</code>
Семья: ${fam ? `«${fam.name}»` : "Нет"}
Меф: ${separateNumber(player.balance)}
Гемы: ${player.gems}
Семейные монеты: ${user.famMoney}
Капчей введено: ${player.captureCounter}
Слотов всего: ${player.slots}
Слотов занято: ${player.fullSlots}`
      );
    } else {
      await ctx.reply("Я ничего о нем не знаю...");
    }
  } catch (error) {
    console.log(error);
    await ctx.reply("Ошибка при выполнении операции.");
  }
}

async function shopGenerator(id, ctx) {
  let result;
  if (id === "1") {
    result = 'Магазин "Bomj Gang"\n\n';

    for (const item in items) {
      if (items[item].class === "low") {
        result += `• ${
          items[item].name
        }[<code>${item}</code>] Цена: ${separateNumber(
          items[item].price
        )} мефа\n`;
      }
    }
  }

  if (id === "2") {
    result = 'Магазин "Paul Shop"\n\n';

    for (const item in items) {
      if (items[item].class === "middle") {
        result += `• ${
          items[item].name
        }[<code>${item}</code>] Цена: ${separateNumber(
          items[item].price
        )} мефа\n`;
      }
    }
  }

  if (id === "3") {
    result = 'Магазин "Clemente House"\n\n';

    for (const item in items) {
      if (items[item].class === "elite") {
        result += `• ${
          items[item].name
        }[<code>${item}</code>] Цена: ${separateNumber(
          items[item].price
        )} мефа\n`;
      }
    }
  }

  if (id === "4") {
    result = "Донат услуги\n\n";

    for (const item in items) {
      if (items[item].class === "donate") {
        result += `• ${
          items[item].name
        }[<code>${item}</code>] Цена: ${separateNumber(items[item].price)}\n`;
      }
    }

    result +=
      "• Донат кейс Цена: 25\n• 1000 мефа Цена: 1\n• 20 точильных камней Цена: 50\n\n❗️Все цены в ру рублях❗️\n";
    await ctx.replyWithHTML(
      result +
        "\nДля покупки связывайтесь с @ralf303" +
        "\n\n📖Инфа id\n📖Инфа мефкейс донат"
    );
    return;
  }

  if (id === "5") {
    result = "💎Gem Shop💎\n\n";
    const sorteditems = Object.keys(items)
      .filter((item) => items[item].class === "gem")
      .sort((a, b) => items[a].price - items[b].price);

    sorteditems.forEach((item) => {
      result += `• ${items[item].name}[<code>${item}</code>] Цена: ${items[item].price} гемов\n`;
    });
  }

  if (id === "6") {
    result = "👥Fam Shop👥\n\n";
    const sorteditems = Object.keys(items)
      .filter((item) => items[item].class === "fam")
      .sort((a, b) => items[a].price - items[b].price);

    sorteditems.forEach((item) => {
      result += `• ${items[item].name}[<code>${item}</code>] Цена: ${items[item].price} семейных монет\n`;
    });
    result +=
      "• Точильный камень Цена: 100\n\n\n📖Инфа id\n📖Примерить id\n📖Купить вещь id\n📖Купить камни [кол-во]";
    return await ctx.replyWithHTML(result);
  }

  await ctx.replyWithHTML(
    result + "\n\n📖Инфа id\n📖Примерить id\n📖Купить вещь id"
  );
  return;
}

async function checkAction(id, ctx) {
  try {
    const queryId = ctx?.update?.callback_query?.message?.message_id;
    const value = await redisServise.get(String(id));

    if (String(value) === String(queryId)) {
      return;
    } else {
      throw new Error("Остановка выполнения");
    }
  } catch (error) {
    throw error;
  }
}

async function saveAction(id, message) {
  try {
    const messageId = message?.message_id;
    await redisServise.set(String(id), String(messageId));
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getRandomInt,
  generateCapcha,
  sleep,
  formatTime,
  checkUserSub,
  checkUserProfile,
  shopGenerator,
  generatePassword,
  calculateMiningAmount,
  checkAction,
  saveAction,
  separateNumber,
};
