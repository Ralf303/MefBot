const { gamesLog } = require("../../logs/globalLogs.js");
const { getRandomInt } = require("../helpers.js");

async function dice(word3, word2, user, ctx) {
  const stake = Number(word2);
  const userInput = word3;
  const userTrueImput =
    Number(word3) <= 6 || word3 === "нечет" || word3 === "чет";
  let winAmount = 0;
  const previousBalance = user.balance;

  if (userTrueImput && user.balance >= stake && stake >= 500) {
    user.balance -= stake;
    // const info = await bot.telegram.sendDice(ctx.chat.id);
    // const dice = info.dice.value;
    const dice = getRandomInt(1, 6);
    if (Number(userInput) >= 1 && Number(userInput) <= 6) {
      if (Number(userInput) === dice) {
        await ctx.reply(
          `🥳 Поздравляем! Кубик показал ${dice}\n Выигрыш ${stake * 5}`
        );
        winAmount = stake * 5;
      } else {
        await ctx.reply(`😢 К сожалению, вы проиграли. Кубик показал ${dice}`);
      }
    } else if (userInput === "чет" || userInput === "нечет") {
      const isEven = dice % 2 === 0;
      if (
        (isEven && userInput === "чет") ||
        (!isEven && userInput === "нечет")
      ) {
        await ctx.reply(
          `🥳 Поздравляем! Кубик показал ${dice} (число ${
            isEven ? "чётное" : "нечётное"
          })\n Выигрыш ${stake * 1.5}`
        );
        winAmount = stake * 1.5;
      } else {
        winAmount = 0;
        await ctx.reply(
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
    await ctx.reply("Не достаточно мефа😢");
  } else if (stake < 500) {
    await ctx.reply("Ставка должна быть больше 500");
  } else {
    await ctx.reply(
      'Введите ставку, а дальше число от 1 до 6, "чет" или "нечет", например "куб 1000 5" или "куб 500 нечет"'
    );
  }
}

module.exports = { dice };
