const { gamesLog } = require("../../logs/globalLogs");

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
        await ctx.reply(
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
        await ctx.reply(
          `${randomEmojis.join("|")}\n @${ctx.from.username} выигрыш ${
            stake * 3
          }!`
        );
      } else {
        await ctx.reply(
          `${randomEmojis.join("|")}\n @${ctx.from.username} слив 🥱`
        );
        winAmount = 0;
      }

      user.balance += winAmount;

      await gamesLog(user, "бандит", winAmount, previousBalance);
      await user.save();
    } else if (stake > user.balance) {
      await ctx.reply("Недостаточно мефа😢");
    } else if (!needChat) {
      await ctx.reply("Ограничение спама, бандит либо в лс либо в @mefanarhia");
    } else {
      await ctx.reply('Введи "бандит [ставка]" больше 500');
    }
  } catch (e) {
    console.log(e);
  }
}

module.exports = { bandit };
