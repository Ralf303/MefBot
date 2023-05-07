const { Composer } = require("telegraf");

const compose = new Composer();

compose.action("buy0", (ctx) => {
  ctx.deleteMessage();
  if (ctx.persone.balance >= 100000) {
    ctx.reply(
      "Поздравляем с покупкой!\n\nОжидайте, вскоре администратор вам все выдаст"
    );
    ctx.persone.balance -= 100000;
    ctx.telegram.sendMessage(
      "1157591765",
      "Заявка на покупку!\n\nИмя покупателя @" +
        ctx.chat.username +
        "\n\nТовар: ВИП"
    );
  } else {
    ctx.reply("Не достаточно мефа😢");
  }
});

compose.action("buy1", (ctx) => {
  ctx.deleteMessage();
  if (ctx.persone.balance >= 80000) {
    ctx.reply(
      "Поздравляем с покупкой!\n\nОжидайте, вскоре администратор вам все выдаст"
    );
    ctx.persone.balance -= 80000;
    ctx.telegram.sendMessage(
      "1157591765",
      "Заявка на покупку!\n\nИмя покупателя @" +
        ctx.chat.username +
        "\n\nТовар: Админка"
    );
  } else {
    ctx.reply("Не достаточно мефа😢");
  }
});

compose.action("buy3", (ctx) => {
  ctx.deleteMessage();
  if (ctx.persone.balance >= 20000) {
    ctx.reply(
      "Поздравляем с покупкой!\n\nОжидайте, вскоре администратор снимет варн, больше не нарушайте"
    );
    ctx.persone.balance -= 20000;
    ctx.telegram.sendMessage(
      "1157591765",
      "Заявка на покупку!\n\nИмя покупателя @" +
        ctx.chat.username +
        "\n\nТовар: Снятие варна"
    );
  } else {
    ctx.reply("Не достаточно мефа😢");
  }
});

compose.action("buy4", (ctx) => {
  ctx.deleteMessage();
  if (ctx.persone.balance >= 150000) {
    ctx.reply(
      "Поздравляем с покупкой!\n\nОжидайте, вскоре администратор вам все выдаст"
    );
    ctx.persone.balance -= 150000;
    ctx.telegram.sendMessage(
      "1157591765",
      "Заявка на покупку!\n\nИмя покупателя @" +
        ctx.chat.username +
        "\n\nТовар: Анонимность"
    );
  } else {
    ctx.reply("Не достаточно мефа😢");
  }
});

compose.action("buy5", (ctx) => {
  ctx.deleteMessage();
  if (ctx.persone.balance >= 25000) {
    ctx.reply(
      "Поздравляем с покупкой!\n\nИмейте ввиду что за слив логов вы можете быть лишены их\n\nhttps://t.me/+XsHvpzExiSRhZDUy"
    );
    ctx.persone.balance -= 25000;
    ctx.telegram.sendMessage(
      "1157591765",
      "Уведомление о покупке!\n\nИмя покупателя @" +
        ctx.chat.username +
        "\n\nТовар: Логи"
    );
  } else {
    ctx.reply("Не достаточно мефа😢");
  }
});

compose.action("buy7", (ctx) => {
  ctx.deleteMessage();
  if (ctx.persone.balance >= 100000) {
    ctx.reply(
      "Поздравляем с покупкой!\n\nОжидайте, вскоре администратор снимет бан, больше не нарушайте!"
    );
    ctx.persone.balance -= 100000;
    ctx.telegram.sendMessage(
      "1157591765",
      "Заявка на покупку!\n\nИмя покупателя @" +
        ctx.chat.username +
        "\n\nТовар: Снятие бана"
    );
  } else {
    ctx.reply("Не достаточно мефа😢");
  }
});

compose.action("buy8", (ctx) => {
  ctx.deleteMessage();
  if (ctx.persone.balance >= 200000) {
    ctx.reply(
      "Поздравляем с покупкой!\n\nОжидайте, вскоре администратор вынесет вас из ЧС, больше не нарушайте"
    );
    ctx.persone.balance -= 200000;
    ctx.telegram.sendMessage(
      "1157591765",
      "Заявка на покупку!\n\nИмя покупателя @" +
        ctx.chat.username +
        "\n\nТовар: Вынос из ЧС"
    );
  } else {
    ctx.reply("Не достаточно мефа😢");
  }
});

compose.action("timeapp", (ctx) => {
  ctx.deleteMessage();
  if (ctx.persone.balance >= 10000 && ctx.persone.lvl.time < 4) {
    ctx.persone.balance -= 10000;
    ctx.persone.lvl.time += 1;
    ctx.reply(
      "Поздравляем с успешной покупкой!\nТеперь ваш уровень времени " +
        ctx.persone.lvl.time
    );
  } else if (ctx.persone.balance < 10000) {
    ctx.reply("Недостаточно мефа(");
  } else {
    ctx.reply("Вы уже прокачали уровень времени на максимум");
  }
});

compose.action("mefapp", (ctx) => {
  ctx.deleteMessage();
  if (ctx.persone.balance >= 20000 && ctx.persone.lvl.mef < 4) {
    ctx.persone.balance -= 20000;
    ctx.persone.lvl.mef += 1;
    ctx.reply(
      "Поздравляем с успешной покупкой!\nТеперь ваш уровень сбора " +
        ctx.persone.lvl.mef
    );
  } else if (ctx.persone.balance < 20000) {
    ctx.reply("Недостаточно мефа(");
  } else {
    ctx.reply("Вы уже прокачали уровень сбора на максимум");
  }
});

compose.action("buy2", async (ctx) => {
  ctx.deleteMessage();
  if (ctx.persone.balance >= 40000) {
    ctx.reply("Отлично, какой префикс ты хочешь?");
    ctx.persone.balance -= 40000;
    ctx.scene.enter("BuyPrefix");
  } else {
    ctx.reply("Не достаточно мефа😢");
  }
});

compose.action("buy6", (ctx) => {
  ctx.deleteMessage();
  if (ctx.persone.balance >= 10000) {
    ctx.reply("Отлично, какой префикс ты хочешь?");
    ctx.persone.balance -= 10000;
    ctx.scene.enter("ChangePrefix");
  } else {
    ctx.reply("Не достаточно мефа😢");
  }
});

module.exports = compose;
