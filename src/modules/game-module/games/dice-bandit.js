import economyService from "../../../services/economy-service.js";
import { sleep, separateNumber } from "../../../utils/helpers.js";

async function dice_bandit(stake, user, ctx) {
  if (stake > user.balance) {
    return `🎰Не достаточно старок😢\nСтавка — ${separateNumber(
      ctx.session.stake
    )}\nБаланс — ${separateNumber(user.balance)}`;
  }

  let winAmount = 0;
  const previousBalance = user.balance;

  stake = Number(stake);
  await economyService.wager({ user, stake, winnings: 0 });
  let info;
  try {
    info = await ctx.telegram.sendDice(ctx.chat.id, { emoji: "🎰" });
  } catch (error) {
    await economyService.add({ user, currency: "balance", amount: stake });
    throw error;
  }
  const dice = info.dice.value;
  const multiplier = { 64: 15, 43: 10, 22: 8, 1: 5 }[dice] || 0;
  if (multiplier) await economyService.add({ user, currency: "balance", amount: stake * multiplier });
  await sleep(2300);

  if (dice === 64) {
    winAmount = Number(stake) * 15;

    return `🎉ДЖЕКПОТ🎉\nВыигрыш — ${separateNumber(
      winAmount
    )}\n\nСтавка — ${separateNumber(
      ctx.session.stake
    )}\nБаланс — ${separateNumber(user.balance)}`;
  }

  if (dice === 43) {
    winAmount = Number(stake) * 10;

    return `🍋ЛИМОНЧИКИ🍋\nВыигрыш — ${separateNumber(
      winAmount
    )}\n\nСтавка — ${separateNumber(
      ctx.session.stake
    )}\nБаланс — ${separateNumber(user.balance)}`;
  }

  if (dice === 22) {
    winAmount = Number(stake) * 8;

    return `🍒ЯГОДКИ🍒\nВыигрыш — ${separateNumber(
      winAmount
    )}\n\nСтавка — ${separateNumber(
      ctx.session.stake
    )}\nБаланс — ${separateNumber(user.balance)}`;
  }

  if (dice === 1) {
    winAmount = Number(stake) * 5;

    return `🍸КОКТЕЛЬЧИК🍸\nВыигрыш — ${separateNumber(
      winAmount
    )}\n\nСтавка — ${separateNumber(
      ctx.session.stake
    )}\nБаланс — ${separateNumber(user.balance)}`;
  }


  return `🎰К сожалению ты проиграл😢\nВыигрыш — ${separateNumber(
    winAmount
  )}\n\nСтавка — ${separateNumber(
    ctx.session.stake
  )}\nБаланс — ${separateNumber(user.balance)}`;
}

async function checkAndMultiplyStake(ctx, user) {
  if (ctx.session.stake * 2 <= user.balance) {
    ctx.session.stake *= 2;
    return `🎰Ставка умножена✅\nНовая ставка — ${separateNumber(
      ctx.session.stake
    )}\nБаланс — ${separateNumber(user.balance)}`;
  } else {
    return `🎰Не достаточно старок😢\nСтавка — ${separateNumber(
      ctx.session.stake
    )}\nБаланс — ${separateNumber(user.balance)}`;
  }
}

async function checkAndMultiplyByHalfStake(ctx, user) {
  if (ctx.session.stake * 0.5 >= 1) {
    ctx.session.stake = Math.floor(ctx.session.stake * 0.5);
    return `🎰Ставка уменьшена✅\nНовая ставка — ${separateNumber(
      ctx.session.stake
    )}\nБаланс — ${separateNumber(user.balance)}`;
  } else {
    return `🎰Ставка слишком мала для умножения😢\nСтавка — ${separateNumber(
      ctx.session.stake
    )}\nБаланс — ${separateNumber(user.balance)}`;
  }
}

export { dice_bandit, checkAndMultiplyStake, checkAndMultiplyByHalfStake };
