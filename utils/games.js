const { sleep, formatTime, getRandomInt } = require("./helpers.js");

async function dice(word3, word2, user, bot, ctx) {
  const stake = Number(word2);
  const userInput = word3;
  const userTrueImput = word3 <= 6 || word3 === "нечет" || word3 === "чет";
  if (userTrueImput && user.balance >= stake && stake >= 500) {
    user.balance -= stake;
    const info = await bot.telegram.sendDice(ctx.chat.id);
    await sleep(3800);
    const dice = info.dice.value;

    if (Number(userInput) >= 1 && Number(userInput) <= 6) {
      if (Number(userInput) === dice) {
        ctx.reply(
          `🥳 Поздравляем! Кубик показал ${dice}\n Выйгрыш ${stake * 10}`
        );
        user.balance += stake * 10;
      } else {
        ctx.reply(`😢 К сожалению, вы проиграли. Кубик показал ${dice}`);
      }
    } else if (userInput === "чет" || userInput === "нечет") {
      const isEven = dice % 2 === 0;
      if (
        (isEven && userInput === "чет") ||
        (!isEven && userInput === "нечет")
      ) {
        ctx.reply(
          `🥳 Поздравляем! Кубик показал ${dice} (число ${
            isEven ? "чётное" : "нечётное"
          })\n Выйгрыш ${stake * 1.5}`
        );
        user.balance += stake * 1.5;
      } else {
        ctx.reply(
          `😢 К сожалению, вы проиграли. Кубик показал ${dice} (число ${
            isEven ? "четное" : "нечетное"
          })`
        );
      }
    }
  } else if (stake > user.balance) {
    ctx.reply("Не достаточно мефа😢");
  } else if (stake < 500) {
    ctx.reply("Ставка должна быть больше 500");
  } else {
    ctx.reply(
      'Введите ставку, а дальше число от 1 до 6, "чет" или "нечет", например "куб 1000 5" или "куб 228 нечет"'
    );
  }
}

async function bandit(word2, user, ctx) {
  const fruits = ["🍇", "🍊", "🍐", "🍋", "🍒", "🍓", "🍑", "🍉", "🍌", "🍍"];
  const needChat = ctx.chat.id == -1001672482562 || ctx.chat.type === "private";
  try {
    let stake = Number(word2);
    if (stake > 99 && user.balance >= stake && stake && needChat) {
      user.balance -= stake;
      const randEmoji = () => fruits[Math.floor(Math.random() * fruits.length)];
      const randomEmojis = [randEmoji(), randEmoji(), randEmoji()];

      if (randomEmojis.every((e) => e === randomEmojis[0])) {
        user.balance += stake * 20;
        ctx.reply(
          `🤑ДЖЕКПОТ🤑\n${randomEmojis.join("|")}\n @${
            ctx.from.username
          } выйгрыш ${stake * 20}!`
        );
      } else if (
        randomEmojis[0] === randomEmojis[1] ||
        randomEmojis[0] === randomEmojis[2] ||
        randomEmojis[1] === randomEmojis[2]
      ) {
        user.balance += stake * 5;
        ctx.reply(
          `${randomEmojis.join("|")}\n @${ctx.from.username} выйгрыш ${
            stake * 5
          }!`
        );
      } else {
        ctx.reply(`${randomEmojis.join("|")}\n @${ctx.from.username} слив 🥱`);
      }
    } else if (stake > user.balance) {
      ctx.reply("Недостаточно мефа😢");
    } else if (!needChat) {
      ctx.reply("Ограничение спама, бандит либо в лс либо в @mefanarhia");
    } else {
      ctx.reply('Введи "бандит [ставка]" больше 100');
    }
  } catch (e) {
    console.log(e);
  }
}

function userFerma(ctx, user) {
  const now = Math.floor(Date.now() / 1000); // текущее время в UNIX-формате
  const lastTime = user.farmtime;
  const diff = now - lastTime;
  if (
    (diff >= 3600 && user.timelvl === 4) ||
    (diff >= 7200 && user.timelvl === 3) ||
    (diff >= 10800 && user.timelvl === 2) ||
    (diff >= 14400 && user.timelvl === 1)
  ) {
    user.farmtime = now;
    let randmef;
    if (user.meflvl === 1) {
      randmef = getRandomInt(50, 100);
    } else if (user.meflvl === 2) {
      randmef = getRandomInt(100, 200);
    } else if (user.meflvl === 3) {
      randmef = getRandomInt(200, 400);
    } else {
      randmef = getRandomInt(300, 500);
    }
    ctx.reply("✅Меф собран " + randmef);
    user.balance += randmef;
  } else {
    if (user.timelvl === 4) {
      const remainingTime = 3600 - diff;
      const formattedTime = formatTime(remainingTime);
      ctx.reply(`❌Собрать меф можно через ${formattedTime}`);
    } else if (user.timelvl === 3) {
      const remainingTime = 7200 - diff;
      const formattedTime = formatTime(remainingTime);
      ctx.reply(`❌Собрать меф можно через ${formattedTime}`);
    } else if (user.timelvl === 2) {
      const remainingTime = 10800 - diff;
      const formattedTime = formatTime(remainingTime);
      ctx.reply(`❌Собрать меф можно через ${formattedTime}`);
    } else {
      const remainingTime = 14400 - diff;
      const formattedTime = formatTime(remainingTime);
      ctx.reply(`❌Собрать меф можно через ${formattedTime}`);
    }
  }
}

async function createRP(rp, emoji, ctx, replyToMessage, comment) {
  const firstName = ctx.message.from.first_name.replaceAll(
    /[\\`*_{}\[\]()#+\-.!()]/g,
    "\\$&"
  );
  const replyFirstName = replyToMessage.from.first_name.replaceAll(
    /[\\`*_{}\[\]()#+\-.!()]/g,
    "\\$&"
  );

  console.log(comment);
  try {
    let replyMessage =
      `${emoji} [${firstName}](tg://user?id=${ctx.message.from.id}) ` +
      `${rp.replaceAll(/[\\*_{}\[\]()#+\-.!()]/g, "\\$&")} ` +
      `[${replyFirstName}](tg://user?id=${replyToMessage.from.id})`;

    if (comment) {
      replyMessage += `\n\n💬 С комментарием: ${comment}`;
    }

    ctx.telegram.sendMessage(replyToMessage.chat.id, replyMessage, {
      reply_to_message_id: replyToMessage.message_id,
      parse_mode: "MarkdownV2",
    });
  } catch (e) {
    console.log(e);
  }
}
module.exports = { dice, bandit, userFerma, createRP };
