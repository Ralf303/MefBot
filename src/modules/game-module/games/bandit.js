import economyService from "../../../services/economy-service.js";
import { getChat } from "../../../db/functions.js";
import { separateNumber } from "../../../utils/helpers.js";
import ru_text from "../../../../ru_text.js";

async function bandit(word2, user, ctx) {
  const fruits = ["🍇", "🍊", "🍐", "🍋", "🍒", "🍓", "🍑", "🍉", "🍌", "🍍"];
  let chat;
  if (ctx.chat.type !== "private") {
    chat = await getChat(ctx.chat.id);
  }

  const needChat = chat?.allowGames === true || ctx.chat.type === "private";
  try {
    let stake = Number(word2);
    let winAmount = 0;

    if (Number.isSafeInteger(stake) && stake > 499 && user.balance >= stake && needChat) {
      const randEmoji = () => fruits[Math.floor(Math.random() * fruits.length)];
      const randomEmojis = [randEmoji(), randEmoji(), randEmoji()];

      const winnings = randomEmojis.every((e) => e === randomEmojis[0]) ? stake * 10 :
        new Set(randomEmojis).size < 3 ? stake * 3 : 0;
      await economyService.wager({ user, stake, winnings });
      if (randomEmojis.every((e) => e === randomEmojis[0])) {
        winAmount = stake * 10;
        await ctx.reply(
          `🤑ДЖЕКПОТ🤑\n${randomEmojis.join("|")}\n @${
            ctx.from.username
          } выигрыш ${separateNumber(stake * 10)}!`
        );
      } else if (
        randomEmojis[0] === randomEmojis[1] ||
        randomEmojis[0] === randomEmojis[2] ||
        randomEmojis[1] === randomEmojis[2]
      ) {
        winAmount = stake * 3;
        await ctx.reply(
          `${randomEmojis.join("|")}\n @${
            ctx.from.username
          } выигрыш ${separateNumber(stake * 3)}!`
        );
      } else {
        await ctx.reply(
          `${randomEmojis.join("|")}\n @${ctx.from.username} слив 🥱`
        );
        winAmount = 0;
      }


    } else if (stake > user.balance) {
      await ctx.reply("Недостаточно старок😢");
    } else if (!needChat) {
      await ctx.reply(ru_text.no_games_in_chat);
    } else {
      await ctx.reply('Введи "бандит [ставка]" больше 500');
    }
  } catch (error) {
    console.log(error);
  }
}

export { bandit };
