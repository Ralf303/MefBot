import { Keyboard, Key } from "telegram-keyboard";
import { User } from "../db/models.js";
import { getFamilyByUserId } from "../modules/fam-module/fam-service.js";
import items from "../modules/items-module/items.js";
import redisServise from "../services/redis-servise.js";

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCapcha() {
  const length = 6;
  const charset = "1234567890";
  let res = "";

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
Стар: ${separateNumber(user.balance)}
Гемы: ${separateNumber(user.gems)}
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
Стар: ${separateNumber(player.balance)}
Гемы: ${separateNumber(player.gems)}
Семейные монеты: ${player.famMoney}
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
        )} старок\n`;
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
        )} старок\n`;
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
        )} старок\n`;
      }
    }
  }

  if (id === "4") {
    result = "🤑 Донат услуги 🤑\n\n";

    for (const item in items) {
      if (items[item].class === "donate") {
        result += `• ${
          items[item].name
        }[<code>${item}</code>] Цена: ${separateNumber(
          items[item].price
        )} голд\n`;
      }
    }

    result +=
      "• Донат кейс Цена: 25 голды\n• 1000 старок Цена: 1 голда\n• 20 точильных камней Цена: 50 голды\n\n❗️ 1 RUB = 1 Голд❗️\n";
    await ctx.replyWithHTML(
      result +
        "\nДля пополнения голд => @ralfy" +
        "\n\n📖Купить вещь id\n📖Купить старкейс донат\n📖Купить старки\n📖Донат купить камни\n📖Инфа id\n📖Инфа старкейс донат"
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
    result +=
      "• Охлаждающая жидкость Цена: 100\n\n\n📖Инфа id\n📖Примерить id\n📖Купить вещь id\n";
    // 📖Купить охлаждение [кол-во]
    return await ctx.replyWithHTML(result);
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
    return await ctx.replyWithHTML(
      result,
      Keyboard.inline([[Key.callback("🔙Назад", "Вещи")]])
    );
  }

  await ctx.replyWithHTML(
    result + "\n\n📖Инфа id\n📖Примерить id\n📖Купить вещь id",
    Keyboard.inline([[Key.callback("🔙Назад", "Вещи")]])
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

function daysRemaining(days) {
  if (days < 0) {
    return "Некорректное количество дней";
  }

  if (days === 0) {
    return "0 дней";
  }

  const lastDigit = days % 10;
  const lastTwoDigits = days % 100;

  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return `${days} день`;
  } else if (
    lastDigit >= 2 &&
    lastDigit <= 4 &&
    (lastTwoDigits < 12 || lastTwoDigits > 14)
  ) {
    return `${days} дня`;
  } else {
    return `${days} дней`;
  }
}

export {
  getRandomInt,
  generateCapcha,
  separateNumber,
  calculateMiningAmount,
  generatePassword,
  formatTime,
  sleep,
  checkUserSub,
  checkUserProfile,
  shopGenerator,
  checkAction,
  saveAction,
  daysRemaining,
};
