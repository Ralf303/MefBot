const { Composer } = require("telegraf");
const { getUser } = require("../db/functions");
const compose = new Composer();
const regex = /([_*[\]()~`>#+\-=|{}.!])/g;

compose.action("buy0", async (ctx) => {
  const user = await getUser(
    ctx.from.id,
    ctx.from.first_name,
    ctx.from.username
  );
  ctx.deleteMessage();
  if (user.balance >= 100000) {
    ctx.reply(
      "Поздравляем с покупкой!\n\nОжидайте, вскоре администратор вам все выдаст"
    );
    user.balance -= 100000;
    ctx.telegram.sendMessage(
      "1157591765",
      "Заявка на покупку!\n\nИмя покупателя " +
        `[${user.firstname.replace(regex, "\\$&")}]` +
        `(tg://user?id=${user.chatId})
        \n\nТовар: ВИП`,
      {
        parse_mode: "Markdown",
      }
    );
    user.save();
  } else {
    ctx.reply("Не достаточно мефа😢");
  }
});

compose.action("buy1", async (ctx) => {
  const user = await getUser(
    ctx.from.id,
    ctx.from.first_name,
    ctx.from.username
  );
  ctx.deleteMessage();
  if (user.balance >= 80000) {
    ctx.reply(
      "Поздравляем с покупкой!\n\nОжидайте, вскоре администратор вам все выдаст"
    );
    user.balance -= 80000;
    ctx.telegram.sendMessage(
      "1157591765",
      "Заявка на покупку!\n\nИмя покупателя " +
        `[${user.firstname.replace(regex, "\\$&")}]` +
        `(tg://user?id=${user.chatId})
        \n\nТовар: Админка`,
      {
        parse_mode: "Markdown",
      }
    );
    user.save();
  } else {
    ctx.reply("Не достаточно мефа😢");
  }
});

compose.action("buy3", async (ctx) => {
  const user = await getUser(
    ctx.from.id,
    ctx.from.first_name,
    ctx.from.username
  );
  ctx.deleteMessage();
  if (user.balance >= 20000) {
    ctx.reply(
      "Поздравляем с покупкой!\n\nОжидайте, вскоре администратор снимет варн, больше не нарушайте"
    );
    user.balance -= 20000;
    ctx.telegram.sendMessage(
      "1157591765",
      "Заявка на покупку!\n\nИмя покупателя " +
        `[${user.firstname.replace(regex, "\\$&")}]` +
        `(tg://user?id=${user.chatId})
        \n\nТовар: Снятие варна`,
      {
        parse_mode: "Markdown",
      }
    );
    user.save();
  } else {
    ctx.reply("Не достаточно мефа😢");
  }
});

compose.action("buy4", async (ctx) => {
  const user = await getUser(
    ctx.from.id,
    ctx.from.first_name,
    ctx.from.username
  );
  ctx.deleteMessage();
  if (user.balance >= 150000) {
    ctx.reply(
      "Поздравляем с покупкой!\n\nОжидайте, вскоре администратор вам все выдаст"
    );
    user.balance -= 150000;
    ctx.telegram.sendMessage(
      "1157591765",
      "Заявка на покупку!\n\nИмя покупателя " +
        `[${user.firstname.replace(regex, "\\$&")}]` +
        `(tg://user?id=${user.chatId})
        \n\nТовар: Анонимность`,
      {
        parse_mode: "Markdown",
      }
    );
    user.save();
  } else {
    ctx.reply("Не достаточно мефа😢");
  }
});

compose.action("buy5", async (ctx) => {
  const user = await getUser(
    ctx.from.id,
    ctx.from.first_name,
    ctx.from.username
  );
  ctx.deleteMessage();
  if (user.balance >= 25000) {
    ctx.reply(
      "Поздравляем с покупкой!\n\nИмейте ввиду что за слив логов вы можете быть лишены их\n\nhttps://t.me/+XsHvpzExiSRhZDUy"
    );
    user.balance -= 25000;
    ctx.telegram.sendMessage(
      "1157591765",
      "Заявка на покупку!\n\nИмя покупателя " +
        `[${user.firstname.replace(regex, "\\$&")}]` +
        `(tg://user?id=${user.chatId})
        \n\nТовар: Логи`,
      {
        parse_mode: "Markdown",
      }
    );
    user.save();
  } else {
    ctx.reply("Не достаточно мефа😢");
  }
});

compose.action("buy7", async (ctx) => {
  const user = await getUser(
    ctx.from.id,
    ctx.from.first_name,
    ctx.from.username
  );
  ctx.deleteMessage();
  if (user.balance >= 100000) {
    ctx.reply(
      "Поздравляем с покупкой!\n\nОжидайте, вскоре администратор снимет бан, больше не нарушайте!"
    );
    user.balance -= 100000;
    ctx.telegram.sendMessage(
      "1157591765",
      "Заявка на покупку!\n\nИмя покупателя " +
        `[${user.firstname.replace(regex, "\\$&")}]` +
        `(tg://user?id=${user.chatId})
        \n\nТовар: Снятие бана`,
      {
        parse_mode: "Markdown",
      }
    );
    user.save();
  } else {
    ctx.reply("Не достаточно мефа😢");
  }
});

compose.action("timeapp", async (ctx) => {
  const user = await getUser(
    ctx.from.id,
    ctx.from.first_name,
    ctx.from.username
  );
  ctx.deleteMessage();
  if (user.balance >= 10000 && user.timelvl < 4) {
    user.balance -= 10000;
    user.timelvl += 1;
    ctx.reply(
      "Поздравляем с успешной покупкой!\nТеперь ваш уровень времени " +
        user.timelvl
    );
    user.save();
  } else if (user.balance < 10000) {
    ctx.reply("Недостаточно мефа😢");
  } else {
    ctx.reply("Вы уже прокачали уровень времени на максимум");
  }
});

compose.action("mefapp", async (ctx) => {
  const user = await getUser(
    ctx.from.id,
    ctx.from.first_name,
    ctx.from.username
  );
  ctx.deleteMessage();
  if (user.balance >= 20000 && user.meflvl < 4) {
    user.balance -= 20000;
    user.meflvl += 1;
    ctx.reply(
      "Поздравляем с успешной покупкой!\nТеперь ваш уровень сбора " +
        user.meflvl
    );
    user.save();
  } else if (user.balance < 20000) {
    ctx.reply("Недостаточно мефа😢");
  } else {
    ctx.reply("Вы уже прокачали уровень сбора на максимум");
  }
});

compose.action("slotapp", async (ctx) => {
  const user = await getUser(
    ctx.from.id,
    ctx.from.first_name,
    ctx.from.username
  );

  ctx.deleteMessage();

  if (user.balance >= 5000) {
    user.balance -= 5000;
    user.slots += 1;
    ctx.reply(
      "Поздравляем с успешной покупкой!\nТеперь у вас " + user.slots + " слотов"
    );
    await user.save();
  } else {
    ctx.reply("Недостаточно мефа😢");
  }
});

compose.action("buy2", async (ctx) => {
  const user = await getUser(
    ctx.from.id,
    ctx.from.first_name,
    ctx.from.username
  );
  ctx.deleteMessage();
  if (user.balance >= 40000) {
    ctx.reply("Отлично, какой префикс ты хочешь?");
    user.balance -= 40000;
    ctx.scene.enter("BuyPrefix");
    user.save();
  } else {
    ctx.reply("Не достаточно мефа😢");
  }
});

compose.action("buy6", async (ctx) => {
  const user = await getUser(
    ctx.from.id,
    ctx.from.first_name,
    ctx.from.username
  );
  ctx.deleteMessage();
  if (user.balance >= 10000) {
    ctx.reply("Отлично, какой префикс ты хочешь?");
    user.balance -= 10000;
    ctx.scene.enter("ChangePrefix");
    user.save();
  } else {
    ctx.reply("Не достаточно мефа😢");
  }
});

module.exports = compose;
