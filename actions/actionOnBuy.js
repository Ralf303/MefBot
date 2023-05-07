const { Composer } = require("telegraf");
const { getUser } = require("../utils/helpers");
const compose = new Composer();

compose.action("buy0", async (ctx) => {
  const user = await getUser(ctx.from.id);
  ctx.deleteMessage();
  if (user.balance >= 100000) {
    ctx.reply(
      "Поздравляем с покупкой!\n\nОжидайте, вскоре администратор вам все выдаст"
    );
    user.balance -= 100000;
    ctx.telegram.sendMessage(
      "1157591765",
      "Заявка на покупку!\n\nИмя покупателя @" +
        ctx.chat.username +
        "\n\nТовар: ВИП"
    );
    user.save();
  } else {
    ctx.reply("Не достаточно мефа😢");
  }
});

compose.action("buy1", async (ctx) => {
  const user = await getUser(ctx.from.id);
  ctx.deleteMessage();
  if (user.balance >= 80000) {
    ctx.reply(
      "Поздравляем с покупкой!\n\nОжидайте, вскоре администратор вам все выдаст"
    );
    user.balance -= 80000;
    ctx.telegram.sendMessage(
      "1157591765",
      "Заявка на покупку!\n\nИмя покупателя @" +
        ctx.chat.username +
        "\n\nТовар: Админка"
    );
    user.save();
  } else {
    ctx.reply("Не достаточно мефа😢");
  }
});

compose.action("buy3", async (ctx) => {
  const user = await getUser(ctx.from.id);
  ctx.deleteMessage();
  if (user.balance >= 20000) {
    ctx.reply(
      "Поздравляем с покупкой!\n\nОжидайте, вскоре администратор снимет варн, больше не нарушайте"
    );
    user.balance -= 20000;
    ctx.telegram.sendMessage(
      "1157591765",
      "Заявка на покупку!\n\nИмя покупателя @" +
        ctx.chat.username +
        "\n\nТовар: Снятие варна"
    );
    user.save();
  } else {
    ctx.reply("Не достаточно мефа😢");
  }
});

compose.action("buy4", async (ctx) => {
  const user = await getUser(ctx.from.id);
  ctx.deleteMessage();
  if (user.balance >= 150000) {
    ctx.reply(
      "Поздравляем с покупкой!\n\nОжидайте, вскоре администратор вам все выдаст"
    );
    user.balance -= 150000;
    ctx.telegram.sendMessage(
      "1157591765",
      "Заявка на покупку!\n\nИмя покупателя @" +
        ctx.chat.username +
        "\n\nТовар: Анонимность"
    );
    user.save();
  } else {
    ctx.reply("Не достаточно мефа😢");
  }
});

compose.action("buy5", async (ctx) => {
  const user = await getUser(ctx.from.id);
  ctx.deleteMessage();
  if (user.balance >= 25000) {
    ctx.reply(
      "Поздравляем с покупкой!\n\nИмейте ввиду что за слив логов вы можете быть лишены их\n\nhttps://t.me/+XsHvpzExiSRhZDUy"
    );
    user.balance -= 25000;
    ctx.telegram.sendMessage(
      "1157591765",
      "Уведомление о покупке!\n\nИмя покупателя @" +
        ctx.chat.username +
        "\n\nТовар: Логи"
    );
    user.save();
  } else {
    ctx.reply("Не достаточно мефа😢");
  }
});

compose.action("buy7", async (ctx) => {
  const user = await getUser(ctx.from.id);
  ctx.deleteMessage();
  if (user.balance >= 100000) {
    ctx.reply(
      "Поздравляем с покупкой!\n\nОжидайте, вскоре администратор снимет бан, больше не нарушайте!"
    );
    user.balance -= 100000;
    ctx.telegram.sendMessage(
      "1157591765",
      "Заявка на покупку!\n\nИмя покупателя @" +
        ctx.chat.username +
        "\n\nТовар: Снятие бана"
    );
    user.save();
  } else {
    ctx.reply("Не достаточно мефа😢");
  }
});

compose.action("buy8", async (ctx) => {
  const user = await getUser(ctx.from.id);
  ctx.deleteMessage();
  if (user.balance >= 200000) {
    ctx.reply(
      "Поздравляем с покупкой!\n\nОжидайте, вскоре администратор вынесет вас из ЧС, больше не нарушайте"
    );
    user.balance -= 200000;
    ctx.telegram.sendMessage(
      "1157591765",
      "Заявка на покупку!\n\nИмя покупателя @" +
        ctx.chat.username +
        "\n\nТовар: Вынос из ЧС"
    );
    user.save();
  } else {
    ctx.reply("Не достаточно мефа😢");
  }
});

compose.action("timeapp", async (ctx) => {
  const user = await getUser(ctx.from.id);
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
    ctx.reply("Недостаточно мефа(");
  } else {
    ctx.reply("Вы уже прокачали уровень времени на максимум");
  }
});

compose.action("mefapp", async (ctx) => {
  const user = await getUser(ctx.from.id);
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
    ctx.reply("Недостаточно мефа(");
  } else {
    ctx.reply("Вы уже прокачали уровень сбора на максимум");
  }
});

compose.action("buy2", async (ctx) => {
  const user = await getUser(ctx.from.id);
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
  const user = await getUser(ctx.from.id);
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
