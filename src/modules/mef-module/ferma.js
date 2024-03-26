const { resiveLog } = require("../../modules/logs-module/globalLogs.js");
const { formatTime, getRandomInt } = require("../../utils/helpers.js");
const {
  checkItem,
} = require("../items-module/items-utils/item-tool-service.js");

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

    const hasSuperGrabli = await checkItem(user.id, "Супер Грабли");

    if (hasSuperGrabli) {
      randmef *= 5;
    }

    const hasPups = await checkItem(user.id, "Пупс «Удача»");

    if (hasPups) {
      randmef += 555;
    }

    await ctx.reply("✅Меф собран " + randmef);
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
    await ctx.reply(`❌Собрать меф можно через ${formattedTime}`);
  }
}

module.exports = { userFerma };
