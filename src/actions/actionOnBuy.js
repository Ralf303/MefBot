const { Composer } = require("telegraf");
const { getUser } = require("../db/functions");
const { loseLog } = require("../modules/logs-module/globalLogs");
const compose = new Composer();

compose.action("timeapp", async (ctx) => {
  const user = await getUser(
    ctx.from.id,
    ctx.from.first_name,
    ctx.from.username
  );
  await ctx.deleteMessage();
  if (user.balance >= 10000 && user.timelvl < 4) {
    user.balance -= 10000;
    await loseLog(user, `меф`, "покупка в магазине");
    user.timelvl += 1;
    await ctx.reply(
      "Поздравляем с успешной покупкой!\nТеперь твой уровень времени " +
        user.timelvl
    );
    user.save();
  } else if (user.balance < 10000) {
    await ctx.reply("Недостаточно мефа😢");
  } else {
    await ctx.reply("ТЫ уже прокачал(а) уровень времени на максимум");
  }
});

compose.action("mefapp", async (ctx) => {
  const user = await getUser(
    ctx.from.id,
    ctx.from.first_name,
    ctx.from.username
  );
  await ctx.deleteMessage();
  if (user.balance >= 20000 && user.meflvl < 4) {
    user.balance -= 20000;
    await loseLog(user, `меф`, "покупка в магазине");
    user.meflvl += 1;
    await ctx.reply(
      "Поздравляем с успешной покупкой!\nТеперь твой уровень сбора " +
        user.meflvl
    );
    user.save();
  } else if (user.balance < 20000) {
    await ctx.reply("Недостаточно мефа😢");
  } else {
    await ctx.reply("ТЫ уже прокачал(а) уровень сбора на максимум");
  }
});

compose.action("slotapp", async (ctx) => {
  const user = await getUser(
    ctx.from.id,
    ctx.from.first_name,
    ctx.from.username
  );

  await ctx.deleteMessage();

  if (user.slots === 200) {
    return await ctx.reply("Больше не поместится, ты достиг максимума💪");
  }

  if (user.balance >= 5000) {
    user.balance -= 5000;
    await loseLog(user, `меф`, "покупка в магазине");
    user.slots += 1;
    await ctx.reply(
      "Поздравляем с успешной покупкой!\nТеперь у тебя " +
        user.slots +
        " слотов"
    );
    await user.save();
  } else {
    await ctx.reply("Недостаточно мефа😢");
  }
});
module.exports = compose;
