const { Keyboard, Key } = require("telegram-keyboard");

module.exports = (bot) => {
  trigers = [
    "ВИП",
    "Админка",
    "Префикс",
    "Снять Варн",
    "Анон",
    "Логи",
    "Смена Префикса",
    "Снять бан",
    "Выход ЧС",
  ];

  const price = [
    100000, 80000, 40000, 20000, 150000, 25000, 10000, 100000, 200000,
  ];

  function beforeBuy(ctx, item, price, triger) {
    ctx.deleteMessage();
    ctx.reply(
      'Цена товара "' +
        item +
        '" состовляет ' +
        price +
        "MF\n\nВаш баланс: " +
        ctx.persone.balance +
        "MF\n\nВы согласны на покупку?",
      Keyboard.make([
        [
          Key.callback("Купить", "buy" + triger),
          Key.callback("Назад", "chatAssortiment"),
        ],
      ]).inline()
    );
  }

  bot.action(trigers, (ctx) => {
    const { data } = ctx.callbackQuery;
    const item = trigers.indexOf(data);
    console.log("Вы нажали на товар " + trigers[item] + " и его ID " + item);
    beforeBuy(ctx, trigers[item], price[item], item);
  });

  bot.action("dell", (ctx) => {
    ctx.deleteMessage();
  });

  bot.action("chatAssortiment", (ctx) => {
    ctx.deleteMessage();
    ctx.reply(
      "Товары📦\n•ВИП статус в ирисе: 100к💰\n•+1лвл админа: 80к💰\n•Префикс: 40к💰\n•Снять варн: 20к💰\n•Купить анонимность: 150к💰\n•Доступ к логам: 25к💰\n•Смена префикса: 10к💰\n•Снять бан: 100к💰\n•Выход из ЧС: 200к💰\n\n❗️магазин не доступен 3+ рангам администраторов❗️",
      Keyboard.make([
        ["ВИП", "Админка", "Префикс"],
        ["Снять Варн", "Анон", "Логи"],
        ["Смена Префикса", "Снять бан", "Выход ЧС"],
        [Key.callback("Закрыть", "dell"), Key.callback("Назад", "menu")],
      ]).inline()
    );
  });

  bot.action("menu", (ctx) => {
    ctx.deleteMessage();
    ctx.reply(
      "Выберите что хотите купить:",
      Keyboard.make([
        [
          Key.callback("Товары для чата", "chatAssortiment"),
          Key.callback("Улучшения", "farmApp"),
        ],
        [Key.callback("Закрыть", "dell")],
      ]).inline()
    );
  });
};
