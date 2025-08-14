import { Keyboard, Key } from "telegram-keyboard";
import { User } from "../db/models.js";
import { getFamilyByUserId } from "../modules/fam-module/fam-service.js";
import items from "../modules/items-module/items.js";
import redisService from "../services/redis-service.js";
import { checkUserByUsername, getUser } from "../db/functions.js";

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
        }[<code>${item}</code>]: ${separateNumber(items[item].price)} старок\n`;
      }
    }
  }

  if (id === "2") {
    result = 'Магазин "Paul Shop"\n\n';

    for (const item in items) {
      if (items[item].class === "middle") {
        result += `• ${
          items[item].name
        }[<code>${item}</code>]: ${separateNumber(items[item].price)} старок\n`;
      }
    }
  }

  if (id === "3") {
    result = 'Магазин "Clemente House"\n\n';

    for (const item in items) {
      if (items[item].class === "elite") {
        result += `• ${
          items[item].name
        }[<code>${item}</code>]: ${separateNumber(items[item].price)} старок\n`;
      }
    }
  }

  if (id === "4") {
    result = "🤑 Донат услуги 🤑\n\n";

    for (const item in items) {
      if (items[item].class === "donate") {
        result += `• ${
          items[item].name
        }[<code>${item}</code>]: ${separateNumber(items[item].price)} ✨\n`;
      }
    }

    result +=
      "• Донат кейс: 25 ✨\n• 5.000 старок: 1 ✨\n• 1 точильный камень: 1 ✨\n\n 1 ⭐️ = 1 ✨\n";
    await ctx.replyWithHTML(
      result +
        "\n📖Купить искры [кол-во]\n📖Инфа id\n📖Купить вещь id\n📖Купить старкейс донат [кол-во]\n📖Донат купить старки [кол-во]\n📖Донат купить камни [кол-во]"
    );
    return;
  }

  if (id === "5") {
    result = "💎Gem Shop💎\n\n";
    const sorteditems = Object.keys(items)
      .filter((item) => items[item].class === "gem")
      .sort((a, b) => items[a].price - items[b].price);

    sorteditems.forEach((item) => {
      result += `• ${items[item].name}[<code>${item}</code>]: ${items[item].price} гемов\n`;
    });
    result +=
      "• Охлаждающая жидкость: 100 гемов\n\n\n📖Инфа id\n📖Примерить id\n📖Купить вещь id\n";
    // 📖Купить охлаждение [кол-во]
    return await ctx.replyWithHTML(result);
  }

  if (id === "6") {
    result = "👥Fam Shop👥\n\n";
    const sorteditems = Object.keys(items)
      .filter((item) => items[item].class === "fam")
      .sort((a, b) => items[a].price - items[b].price);

    sorteditems.forEach((item) => {
      result += `• ${items[item].name}[<code>${item}</code>]: ${items[item].price} семейных монет\n`;
    });
    result +=
      "• Точильный камень: 100 семейных монет\n\n\n📖Инфа id\n📖Примерить id\n📖Купить вещь id\n📖Купить камни [кол-во]";
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
    const value = await redisService.get(String(id));

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
    await redisService.set(String(id), String(messageId));
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

async function resolveReceiver(ctx) {
  const chatId = ctx.from.id;
  const reply = ctx.message.reply_to_message;
  if (reply) {
    if (reply.from.is_bot) {
      throw new Error("BOT_REJECT");
    }
    const user = await getUser(reply.from.id);

    if (!user) {
      throw new Error("NOT_FOUND");
    }

    if (user.chatId == chatId) {
      throw new Error("SELF_TRANSFER");
    }

    return { receiver: user, transferredViaUsername: false };
  }

  const parts = ctx.message.text.split(" ");
  const usernamePart = parts.find((p) => p.startsWith("@"));
  if (!usernamePart) {
    throw new Error("NO_TARGET");
  }
  const username = usernamePart.slice(1).toLowerCase();
  const user = await checkUserByUsername(username);
  if (!user) {
    throw new Error("NOT_FOUND");
  }

  if (user.chatId == chatId) {
    throw new Error("SELF_TRANSFER");
  }
  return { receiver: user, transferredViaUsername: true };
}

export {
  getRandomInt,
  generateCapcha,
  separateNumber,
  generatePassword,
  formatTime,
  sleep,
  checkUserSub,
  checkUserProfile,
  shopGenerator,
  checkAction,
  saveAction,
  daysRemaining,
  resolveReceiver,
};
