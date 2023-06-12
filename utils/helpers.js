const { User } = require("../db/models");
const clothes = require("../itemsObjects.js/clothes");

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

async function checkUserSub(ctx, channel, trigger, msg, triggers, bot) {
  const chatMember = await bot.telegram.getChatMember(channel, ctx.from.id);
  const status = chatMember.status;
  NeedResult = ["member", "administrator", "creator"];
  if (
    NeedResult.includes(status) &&
    (triggers.includes(trigger) || triggers.includes(msg))
  ) {
    return true;
  } else {
    return false;
  }
}

async function checkUserProfile(user, ctx) {
  const message = ctx.message.reply_to_message;

  if (!message) {
    ctx.reply(
      "Ваш ник: " +
        user.firstname +
        "\nВаш меф: " +
        user.balance +
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
    ctx.reply("У ботов не бывает профилей🙄");
    return;
  }

  try {
    const player = await User.findOne({
      where: { chatId: playerChatId },
    });

    ctx.reply(
      "Профиль " +
        player.firstname +
        "\nГрамм мефа: " +
        player.balance +
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
  } catch (error) {
    console.log(error);
    ctx.reply("Ошибка при выполнении операции.");
  }
}

function shopGenerator(id, ctx) {
  let result;
  if (id === "1") {
    result = 'Магазин "Bomj Gang"\n\n';
    let i = 1;
    for (const item in clothes) {
      if (clothes[item].class === "low") {
        result += `• ${clothes[item].name}[${item}] Цена: ${clothes[item].price}MF\n`;
        i++;
      }
    }
  }

  if (id === "2") {
    result = 'Магазин "Paul Shop"\n\n';
    let i = 1;
    for (const item in clothes) {
      if (clothes[item].class === "middle") {
        result += `• ${clothes[item].name}[${item}] Цена: ${clothes[item].price}MF\n`;
        i++;
      }
    }
  }

  if (id === "3") {
    result = 'Магазин "Clemente House"\n\n';
    let i = 1;
    for (const item in clothes) {
      if (clothes[item].class === "elite") {
        result += `• ${clothes[item].name}[${item}] Цена: ${clothes[item].price}MF\n`;
        i++;
      }
    }
  }

  if (id === "4") {
    result = "Магазин donate\n\n";
    let i = 1;
    for (const item in clothes) {
      if (clothes[item].class === "vip") {
        result += `• ${clothes[item].name}[${item}] Цена: ${clothes[item].price}\n`;
        i++;
      }
    }
    result += "\n❗️ЦЕНЫ УКАЗАНЫ В ИРИСКАХ, ПРИ ПОКУПКЕ ЗА РУБЛИ СКИДКА 50%❗️";
    ctx.reply(result + "\n\nДля покупки связывайтесь с @ralf303");
    return;
  }
  ctx.reply(
    result +
      "\n\nПонравилась вещь? Примерь ее командой\n<<Примерить {Id вещи}>>\nЧтобы купить товар напишите команду\n<<Купить вещь {id вещи}>>"
  );
  return;
}

function notify(ctx, channel) {
  ctx.reply("Бот бесплатный и без доната поэтому подпишись @" + channel);
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
};
