import economyService from "../../../services/economy-service.js";
import { getRandomInt, separateNumber } from "../../../utils/helpers.js";
import ru_text from "../../../../ru_text.js";
import { getChat } from "../../../db/functions.js";

async function dice(word3, word2, user, ctx) {
  let chat;
  if (ctx.chat.type !== "private") {
    chat = await getChat(ctx.chat.id);
  }

  const needChat = chat?.allowGames === true || ctx.chat.type === "private";

  if (!needChat) {
    return await ctx.reply(ru_text.no_games_in_chat);
  }

  const stake = Number(word2);
  const userInput = word3;
  const userTrueImput =
    Number(word3) <= 6 || word3 === "нечет" || word3 === "чет";
  let winAmount = 0;
  const previousBalance = user.balance;

  if (userTrueImput && user.balance >= stake && Number.isSafeInteger(stake) && stake >= 500) {
    // const info = await bot.telegram.sendDice(ctx.chat.id);
    // const dice = info.dice.value;
    const dice = getRandomInt(1, 6);
    const isEven = dice % 2 === 0;
    const winnings = Number(userInput) === dice ? stake * 5 :
      ((userInput === "чет" && isEven) || (userInput === "нечет" && !isEven)) ? Math.floor(stake * 1.5) : 0;
    await economyService.wager({ user, stake, winnings });
    if (Number(userInput) >= 1 && Number(userInput) <= 6) {
      if (Number(userInput) === dice) {
        await ctx.reply(
          `🥳 Поздравляем! Кубик показал ${dice}\n Выигрыш ${separateNumber(
            stake * 5
          )}`
        );
        winAmount = stake * 5;
      } else {
        await ctx.reply(
          `😢 К сожалению, ты проиграл. Кубик показал ${separateNumber(dice)}`
        );
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
          })\n Выигрыш ${separateNumber(stake * 1.5)}`
        );
        winAmount = stake * 1.5;
      } else {
        winAmount = 0;
        await ctx.reply(
          `😢 К сожалению, ты проиграл. Кубик показал ${dice} (число ${
            isEven ? "четное" : "нечетное"
          })`
        );
      }
    }


  } else if (stake > user.balance) {
    await ctx.reply("Не достаточно старок😢");
  } else if (stake < 500) {
    await ctx.reply("Ставка должна быть больше 500");
  } else {
    await ctx.reply(ru_text.wrong_dice);
  }
}

export { dice };
