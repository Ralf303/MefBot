const { Item } = require("../db/models.js");
const { gamesLog, resiveLog } = require("../logs/globalLogs.js");
const { sleep, formatTime, getRandomInt } = require("./helpers.js");

async function dice(word3, word2, user, bot, ctx) {
  const stake = Number(word2);
  const userInput = word3;
  const userTrueImput =
    Number(word3) <= 6 || word3 === "нечет" || word3 === "чет";
  let winAmount = 0;
  const previousBalance = user.balance;

  if (userTrueImput && user.balance >= stake && stake >= 500) {
    user.balance -= stake;
    const info = await bot.telegram.sendDice(ctx.chat.id);
    await sleep(3800);
    const dice = info.dice.value;

    if (Number(userInput) >= 1 && Number(userInput) <= 6) {
      if (Number(userInput) === dice) {
        ctx.reply(
          `🥳 Поздравляем! Кубик показал ${dice}\n Выигрыш ${stake * 5}`
        );
        winAmount = stake * 5;
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
          })\n Выигрыш ${stake * 1.5}`
        );
        winAmount = stake * 1.5;
      } else {
        winAmount = 0;
        ctx.reply(
          `😢 К сожалению, вы проиграли. Кубик показал ${dice} (число ${
            isEven ? "четное" : "нечетное"
          })`
        );
      }
    }

    user.balance += winAmount;
    await gamesLog(user, "кубик", winAmount, previousBalance);
    await user.save();
  } else if (stake > user.balance) {
    ctx.reply("Не достаточно мефа😢");
  } else if (stake < 500) {
    ctx.reply("Ставка должна быть больше 500");
  } else {
    ctx.reply(
      'Введите ставку, а дальше число от 1 до 6, "чет" или "нечет", например "куб 1000 5" или "куб 500 нечет"'
    );
  }
}

async function bandit(word2, user, ctx) {
  const fruits = ["🍇", "🍊", "🍐", "🍋", "🍒", "🍓", "🍑", "🍉", "🍌", "🍍"];
  const needChat =
    ctx.chat.id == -1001672482562 ||
    ctx.chat.id == -1001680708708 ||
    ctx.chat.type === "private";
  try {
    let stake = Number(word2);
    let winAmount = 0;
    const previousBalance = user.balance;

    if (stake > 499 && user.balance >= stake && stake && needChat) {
      user.balance -= stake;
      const randEmoji = () => fruits[Math.floor(Math.random() * fruits.length)];
      const randomEmojis = [randEmoji(), randEmoji(), randEmoji()];

      if (randomEmojis.every((e) => e === randomEmojis[0])) {
        winAmount = stake * 10;
        ctx.reply(
          `🤑ДЖЕКПОТ🤑\n${randomEmojis.join("|")}\n @${
            ctx.from.username
          } выигрыш ${stake * 10}!`
        );
      } else if (
        randomEmojis[0] === randomEmojis[1] ||
        randomEmojis[0] === randomEmojis[2] ||
        randomEmojis[1] === randomEmojis[2]
      ) {
        winAmount = stake * 3;
        ctx.reply(
          `${randomEmojis.join("|")}\n @${ctx.from.username} выигрыш ${
            stake * 3
          }!`
        );
      } else {
        ctx.reply(`${randomEmojis.join("|")}\n @${ctx.from.username} слив 🥱`);
        winAmount = 0;
      }

      user.balance += winAmount;

      await gamesLog(user, "бандит", winAmount, previousBalance);
      await user.save();
    } else if (stake > user.balance) {
      ctx.reply("Недостаточно мефа😢");
    } else if (!needChat) {
      ctx.reply("Ограничение спама, бандит либо в лс либо в @mefanarhia");
    } else {
      ctx.reply('Введи "бандит [ставка]" больше 500');
    }
  } catch (e) {
    console.log(e);
  }
}

async function userFerma(ctx, user) {
  const now = Math.floor(Date.now() / 1000);
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

    // Check if the user has an item named "Супер Грабли"
    const hasSuperGrabli = await Item.findOne({
      where: {
        userId: user.id,
        itemName: "Супер Грабли",
        isWorn: true,
      },
    });

    if (hasSuperGrabli) {
      randmef *= 5;
    }

    ctx.reply("✅Меф собран " + randmef);
    user.balance += randmef;
    await resiveLog(user, "меф", randmef, "сбор фермы");
  } else {
    let remainingTime;

    if (user.timelvl === 4) {
      remainingTime = 3600 - diff;
    } else if (user.timelvl === 3) {
      remainingTime = 7200 - diff;
    } else if (user.timelvl === 2) {
      remainingTime = 10800 - diff;
    } else {
      remainingTime = 14400 - diff;
    }

    const formattedTime = formatTime(remainingTime);
    ctx.reply(`❌Собрать меф можно через ${formattedTime}`);
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
