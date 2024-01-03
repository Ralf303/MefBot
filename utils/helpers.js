const { User } = require("../db/models");
const clothes = require("../itemsObjects/clothes");

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

async function checkUserSub(ctx, channel) {
  try {
    const chatMember = await ctx.telegram.getChatMember(channel, ctx.from.id);
    const status = chatMember.status;
    const needStatus = ["member", "administrator", "creator"];

    if (needStatus.includes(status)) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Произошла ошибка:", error);
    return false; // Если возникла ошибка при получении статуса пользователя, считаем, что у него нет подписки
  }
}

async function checkUserProfile(user, ctx) {
  const message = ctx.message.reply_to_message;

  if (!message) {
    await ctx.replyWithHTML(
      "Ваш ник: " +
        user.firstname +
        "\nId: <code>" +
        user.chatId +
        "</code>\nВаш меф: " +
        user.balance +
        "\nВаши гемы: " +
        user.gems +
        "\nКапчей введено: " +
        user.captureCounter +
        "\nВаш уровень сбора: " +
        user.meflvl +
        "\nВаш уровень времени: " +
        user.timelvl +
        "\nСлотов всего: " +
        user.slots +
        "\nСлотов занято: " +
        user.fullSlots
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
      await ctx.replyWithHTML(
        "Профиль " +
          player.firstname +
          "\nId: <code>" +
          player.chatId +
          "</code>\nГрамм мефа: " +
          player.balance +
          "\nГемы: " +
          player.gems +
          "\nКапчей введено: " +
          player.captureCounter +
          "\nУровень сбора: " +
          player.meflvl +
          "\nУровень времени: " +
          player.timelvl +
          "\nСлотов всего: " +
          player.slots +
          "\nСлотов занято: " +
          player.fullSlots
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

    for (const item in clothes) {
      if (clothes[item].class === "low") {
        result += `• ${clothes[item].name}[<code>${item}</code>] Цена: ${clothes[item].price}MF\n`;
      }
    }
  }

  if (id === "2") {
    result = 'Магазин "Paul Shop"\n\n';

    for (const item in clothes) {
      if (clothes[item].class === "middle") {
        result += `• ${clothes[item].name}[<code>${item}</code>] Цена: ${clothes[item].price}MF\n`;
      }
    }
  }

  if (id === "3") {
    result = 'Магазин "Clemente House"\n\n';

    for (const item in clothes) {
      if (clothes[item].class === "elite") {
        result += `• ${clothes[item].name}[<code>${item}</code>] Цена: ${clothes[item].price}MF\n`;
      }
    }
  }

  if (id === "4") {
    result = "Донат услуги\n\n";

    for (const item in clothes) {
      if (clothes[item].class === "vip") {
        result += `• ${clothes[item].name}[<code>${item}</code>] Цена: ${clothes[item].price}\n`;
      }
    }

    result +=
      "• Донат кейс Цена: 25\n• 1000 мефа Цена: 1\n\n❗️Все цены в ру рублях❗️\n";
    await ctx.replyWithHTML(
      result +
        "\nДля покупки связывайтесь с @ralf303" +
        "\n\n📖Инфа id\n📖Инфа мефкейс донат"
    );
    return;
  }

  if (id === "5") {
    result = "💎Gem Shop💎\n\n";
    const sortedClothes = Object.keys(clothes)
      .filter((item) => clothes[item].class === "special")
      .sort((a, b) => clothes[a].price - clothes[b].price);

    sortedClothes.forEach((item) => {
      result += `• ${clothes[item].name}[<code>${item}</code>] Цена: ${clothes[item].price} гемов\n`;
    });
  }

  if (id === "6") {
    result = "🎄НГ ШОП🎄\n\n";
    const sortedClothes = Object.keys(clothes)
      .filter((item) => clothes[item].class === "event")
      .sort((a, b) => clothes[a].price - clothes[b].price);

    sortedClothes.forEach((item) => {
      result += `• ${clothes[item].name}[<code>${item}</code>] Цена: ${clothes[item].price}❄️\n`;
    });
  }

  await ctx.replyWithHTML(
    result + "\n\n📖Инфа id\n📖Примерить id\n📖Купить вещь id"
  );
  return;
}

async function notify(ctx, channel) {
  await ctx.reply("Бот бесплатный и без доната поэтому подпишись @" + channel);
}
module.exports = {
  getRandomInt,
  generateCapcha,
  sleep,
  formatTime,
  notify,
  checkUserSub,
  checkUserProfile,
  shopGenerator,
  generatePassword,
  calculateMiningAmount,
};
