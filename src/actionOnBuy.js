const { Keyboard, Key } = require("telegram-keyboard");

module.exports = (bot) => {
  bot.action("buy0", (ctx) => {
    ctx.deleteMessage();
    if (ctx.persone.balance >= 100000) {
      ctx.reply(
        "Поздравляем с покупкой!\n\nОжидайте, вскоре администратор вам все выдаст"
      );
      ctx.persone.balance -= 100000;
      bot.telegram.sendMessage(
        "1157591765",
        "Заявка на покупку!\n\nИмя покупателя @" +
          ctx.chat.username +
          "\n\nТовар: ВИП"
      );
    } else {
      ctx.reply("Не достаточно мефа😢");
    }
  });

  bot.action("buy1", (ctx) => {
    ctx.deleteMessage();
    if (ctx.persone.balance >= 80000) {
      ctx.reply(
        "Поздравляем с покупкой!\n\nОжидайте, вскоре администратор вам все выдаст"
      );
      ctx.persone.balance -= 80000;
      bot.telegram.sendMessage(
        "1157591765",
        "Заявка на покупку!\n\nИмя покупателя @" +
          ctx.chat.username +
          "\n\nТовар: Админка"
      );
    } else {
      ctx.reply("Не достаточно мефа😢");
    }
  });

  bot.action("buy3", (ctx) => {
    ctx.deleteMessage();
    if (ctx.persone.balance >= 20000) {
      ctx.reply(
        "Поздравляем с покупкой!\n\nОжидайте, вскоре администратор снимет варн, больше не нарушайте"
      );
      ctx.persone.balance -= 20000;
      bot.telegram.sendMessage(
        "1157591765",
        "Заявка на покупку!\n\nИмя покупателя @" +
          ctx.chat.username +
          "\n\nТовар: Снятие варна"
      );
    } else {
      ctx.reply("Не достаточно мефа😢");
    }
  });

  bot.action("buy4", (ctx) => {
    ctx.deleteMessage();
    if (ctx.persone.balance >= 150000) {
      ctx.reply(
        "Поздравляем с покупкой!\n\nОжидайте, вскоре администратор вам все выдаст"
      );
      ctx.persone.balance -= 150000;
      bot.telegram.sendMessage(
        "1157591765",
        "Заявка на покупку!\n\nИмя покупателя @" +
          ctx.chat.username +
          "\n\nТовар: Анонимность"
      );
    } else {
      ctx.reply("Не достаточно мефа😢");
    }
  });

  bot.action("buy5", (ctx) => {
    ctx.deleteMessage();
    if (ctx.persone.balance >= 25000) {
      ctx.reply(
        "Поздравляем с покупкой!\n\nИмейте ввиду что за слив логов вы можете быть лишены их\n\nhttps://t.me/+XsHvpzExiSRhZDUy"
      );
      ctx.persone.balance -= 25000;
      bot.telegram.sendMessage(
        "1157591765",
        "Уведомление о покупке!\n\nИмя покупателя @" +
          ctx.chat.username +
          "\n\nТовар: Логи"
      );
    } else {
      ctx.reply("Не достаточно мефа😢");
    }
  });

  bot.action("buy7", (ctx) => {
    ctx.deleteMessage();
    if (ctx.persone.balance >= 100000) {
      ctx.reply(
        "Поздравляем с покупкой!\n\nОжидайте, вскоре администратор снимет бан, больше не нарушайте!"
      );
      ctx.persone.balance -= 100000;
      bot.telegram.sendMessage(
        "1157591765",
        "Заявка на покупку!\n\nИмя покупателя @" +
          ctx.chat.username +
          "\n\nТовар: Снятие бана"
      );
    } else {
      ctx.reply("Не достаточно мефа😢");
    }
  });

  bot.action("buy8", (ctx) => {
    ctx.deleteMessage();
    if (ctx.persone.balance >= 200000) {
      ctx.reply(
        "Поздравляем с покупкой!\n\nОжидайте, вскоре администратор вынесет вас из ЧС, больше не нарушайте"
      );
      ctx.persone.balance -= 200000;
      bot.telegram.sendMessage(
        "1157591765",
        "Заявка на покупку!\n\nИмя покупателя @" +
          ctx.chat.username +
          "\n\nТовар: Вынос из ЧС"
      );
    } else {
      ctx.reply("Не достаточно мефа😢");
    }
  });
};
