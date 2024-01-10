const { gamesLog } = require("../../logs/globalLogs.js");
const { sleep } = require("../helpers.js");

async function dice_bandit(stake, user, ctx) {
  if (stake > user.balance) {
    return `🎰Не достаточно мефа😢\nСтавка — ${ctx.session.stake}\nБаланс — ${user.balance}`;
  }

  let winAmount = 0;
  const previousBalance = user.balance;

  user.balance -= stake;
  const info = await ctx.telegram.sendDice(ctx.chat.id, { emoji: "🎰" });
  const dice = info.dice.value;
  await sleep(2300);

  if (dice === 64) {
    winAmount = Number(stake) * 15;
    user.balance += winAmount;
    await gamesLog(user, "слоты", winAmount, previousBalance);
    await user.save();
    return `🎉ДЖЕКПОТ🎉\nВыигрыш — ${winAmount}\n\nСтавка — ${ctx.session.stake}\nБаланс — ${user.balance}`;
  }

  if (dice === 43) {
    winAmount = Number(stake) * 10;
    user.balance += winAmount;
    await gamesLog(user, "слоты", winAmount, previousBalance);
    await user.save();
    return `🍋ЛИМОНЧИКИ🍋\nВыигрыш — ${winAmount}\n\nСтавка — ${ctx.session.stake}\nБаланс — ${user.balance}`;
  }

  if (dice === 22) {
    winAmount = Number(stake) * 8;
    user.balance += winAmount;
    await gamesLog(user, "слоты", winAmount, previousBalance);
    await user.save();
    return `🍒ЯГОДКИ🍒\nВыигрыш — ${winAmount}\n\nСтавка — ${ctx.session.stake}\nБаланс — ${user.balance}`;
  }

  if (dice === 1) {
    winAmount = Number(stake) * 5;
    user.balance += winAmount;
    await gamesLog(user, "слоты", winAmount, previousBalance);
    await user.save();
    return `🍸КОКТЕЛЬЧИК🍸\nВыигрыш — ${winAmount}\n\nСтавка — ${ctx.session.stake}\nБаланс — ${user.balance}`;
  }

  user.balance += winAmount;
  await gamesLog(user, "слоты", winAmount, previousBalance);
  await user.save();
  return `🎰К сожалению ты проиграл😢\nВыигрыш — ${winAmount}\n\nСтавка — ${ctx.session.stake}\nБаланс — ${user.balance}`;
}

async function checkAndMultiplyStake(ctx, user) {
  if (ctx.session.stake * 2 <= user.balance) {
    ctx.session.stake *= 2;
    return `🎰Ставка умножена✅\nНовая ставка — ${ctx.session.stake}\nБаланс — ${user.balance}`;
  } else {
    return `🎰Не достаточно мефа😢\nСтавка — ${ctx.session.stake}\nБаланс — ${user.balance}`;
  }
}

async function checkAndMultiplyByHalfStake(ctx, user) {
  if (ctx.session.stake * 0.5 >= 1) {
    ctx.session.stake = Math.floor(ctx.session.stake * 0.5);
    return `🎰Ставка уменьшена✅\nНовая ставка — ${ctx.session.stake}\nБаланс — ${user.balance}`;
  } else {
    return `🎰Ставка слишком мала для умножения😢\nСтавка — ${ctx.session.stake}\nБаланс — ${user.balance}`;
  }
}

module.exports = {
  dice_bandit,
  checkAndMultiplyStake,
  checkAndMultiplyByHalfStake,
};
