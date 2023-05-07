const { Keyboard, Key } = require("telegram-keyboard");

const { Composer } = require("telegraf");

const c = new Composer();

const trigers = [
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
      '" составляет ' +
      price +
      "MF\n\nВаш баланс: " +
      ctx.persone.balance +
      "MF\n\nВы согласны на покупку?",
    Keyboard.inline([
      [
        Key.callback("Купить", "buy" + triger),
        Key.callback("Назад", "chatAssortiment"),
      ],
    ])
  );
}

c.action(trigers, (ctx) => {
  const { data } = ctx.callbackQuery;
  const item = trigers.indexOf(data);
  beforeBuy(ctx, trigers[item], price[item], item);
});

c.action("farmApp", (ctx) => {
  ctx.deleteMessage();
  ctx.reply(
    "❗️УЛУЧШЕНИЯ ДЛЯ ФЕРМЫ❗️\n\nВаш уровень сбора: " +
      ctx.persone.lvl.mef +
      "\nВаш уровень времени: " +
      ctx.persone.lvl.time +
      "\nВаш меф: " +
      ctx.persone.balance,
    Keyboard.inline([
      ["Улучшить сбор", "Улучшить время"],
      [Key.callback("Закрыть", "dell"), Key.callback("Назад", "menu")],
    ])
  );
});

c.action("Улучшить сбор", (ctx) => {
  ctx.deleteMessage();
  ctx.reply(
    "💎Улучшение сбора💎\n\n1 лвл: 50-100 мефа за сбор\n2 лвл: 100-200 мефа за сбор\n3 лвл: 200-400 мефа за сбор\n4 лвл: 300-500 мефа за сбор\n\n💰Каждое улучшение стоит 20к💰",
    Keyboard.inline([
      [Key.callback("Купить улучшение", "mefapp")],
      [Key.callback("Назад", "farmApp")],
    ])
  );
});

c.action("Улучшить время", (ctx) => {
  ctx.deleteMessage();
  ctx.reply(
    "🕘Улучшение времени🕘\n\nС каждым уровнем уменьшается количество времени между сбором\nНа первом уровне интервал сбора 4 часа. Всего уровней 4 и каждый сбрасывает время на один час.\n\n💰Цена одного улучшения 10к💰",
    Keyboard.inline([
      [Key.callback("Купить улучшение", "timeapp")],
      [Key.callback("Назад", "farmApp")],
    ])
  );
});

c.action("dell", (ctx) => {
  ctx.deleteMessage();
});

c.action("chatAssortiment", (ctx) => {
  ctx.deleteMessage();
  ctx.reply(
    "Товары📦\n•ВИП статус в ирисе: 100к💰\n•+1лвл админа: 80к💰\n•Префикс: 40к💰\n•Снять варн: 20к💰\n•Купить анонимность: 150к💰\n•Доступ к логам: 25к💰\n•Смена префикса: 10к💰\n•Снять бан: 100к💰\n•Выход из ЧС: 200к💰\n\n❗️магазин не доступен 3+ рангам администраторов❗️",
    Keyboard.inline([
      ["ВИП", "Админка", "Префикс"],
      ["Снять Варн", "Анон", "Логи"],
      ["Смена Префикса", "Снять бан", "Выход ЧС"],
      [Key.callback("Закрыть", "dell"), Key.callback("Назад", "menu")],
    ])
  );
});

c.action("menu", (ctx) => {
  ctx.deleteMessage();
  ctx.reply(
    "Выберите что хотите купить:",
    Keyboard.inline([
      [
        Key.callback("Товары для чата", "chatAssortiment"),
        Key.callback("Улучшения", "farmApp"),
      ],
      [Key.callback("Закрыть", "dell")],
    ])
  );
});

module.exports = c;
