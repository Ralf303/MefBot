const { Keyboard, Key } = require("telegram-keyboard");
const { Composer } = require("telegraf");
const { getUser } = require("../db/functions.js");
const { shopGenerator } = require("../utils/helpers.js");

const shopActions = new Composer();
const trigers = [
  "ВИП",
  "Админка",
  "Префикс",
  "Снять Варн",
  "Анон",
  "Логи",
  "Смена Префикса",
  "Снять бан",
];

const numbers = ["1", "2", "3", "4"];

const price = [100000, 80000, 40000, 20000, 150000, 25000, 10000, 100000];

async function beforeBuy(ctx, item, price, triger) {
  const user = await getUser(
    ctx.from.id,
    ctx.from.first_name,
    ctx.from.username
  );
  ctx.deleteMessage();
  ctx.reply(
    'Цена товара "' +
      item +
      '" составляет ' +
      price +
      "MF\n\nВаш баланс: " +
      user.balance +
      "MF\n\nВы согласны на покупку?",
    Keyboard.inline([
      [
        Key.callback("Купить", "buy" + triger),
        Key.callback("Назад", "chatAssortiment"),
      ],
    ])
  );
}

shopActions.action(trigers, (ctx) => {
  const { data } = ctx.callbackQuery;
  const item = trigers.indexOf(data);
  beforeBuy(ctx, trigers[item], price[item], item);
});

shopActions.action(numbers, (ctx) => {
  ctx.deleteMessage();
  const { data } = ctx.callbackQuery;
  shopGenerator(data, ctx);
});

shopActions.action("farmApp", async (ctx) => {
  const user = await getUser(
    ctx.from.id,
    ctx.from.first_name,
    ctx.from.username
  );
  ctx.deleteMessage();
  ctx.reply(
    "❗️УЛУЧШЕНИЯ ДЛЯ ФЕРМЫ❗️\n\nВаш уровень сбора: " +
      user.meflvl +
      "\nВаш уровень времени: " +
      user.timelvl +
      "\nВаш меф: " +
      user.balance,
    Keyboard.inline([
      ["Улучшить сбор", "Улучшить время"],
      [Key.callback("Закрыть", "dell"), Key.callback("Назад", "menu")],
    ])
  );
});

shopActions.action("Улучшить сбор", (ctx) => {
  ctx.deleteMessage();
  ctx.reply(
    "💎Улучшение сбора💎\n\n1 лвл: 50-100 мефа за сбор\n2 лвл: 100-200 мефа за сбор\n3 лвл: 200-400 мефа за сбор\n4 лвл: 300-500 мефа за сбор\n\n💰Каждое улучшение стоит 20к💰",
    Keyboard.inline([
      [Key.callback("Купить улучшение", "mefapp")],
      [Key.callback("Назад", "farmApp")],
    ])
  );
});

shopActions.action("Улучшить время", (ctx) => {
  ctx.deleteMessage();
  ctx.reply(
    "🕘Улучшение времени🕘\n\nС каждым уровнем уменьшается количество времени между сбором\nНа первом уровне интервал сбора 4 часа. Всего уровней 4 и каждый сбрасывает время на один час.\n\n💰Цена одного улучшения 10к💰",
    Keyboard.inline([
      [Key.callback("Купить улучшение", "timeapp")],
      [Key.callback("Назад", "farmApp")],
    ])
  );
});

shopActions.action("Инвентарь", (ctx) => {
  ctx.deleteMessage();
  ctx.reply(
    "🎒Улучшение инвентаря🎒\n\nВсе просто, чем больше слотов тем больше вещей вы можете хранить\n\n💰1 слот стоит 5к💰",
    Keyboard.inline([
      [Key.callback("Купить слот", "slotapp")],
      [Key.callback("Назад", "Улучшения")],
    ])
  );
});

shopActions.action("dell", (ctx) => {
  ctx.deleteMessage();
});

shopActions.action("Улучшения", (ctx) => {
  ctx.deleteMessage();
  ctx.reply(
    "Что будем улучшать:",
    Keyboard.inline([
      ["Инвентарь", Key.callback("Ферму", "farmApp")],
      [Key.callback("Закрыть", "dell")],
    ])
  );
});

shopActions.action("Вещи", (ctx) => {
  ctx.deleteMessage();
  ctx.reply(
    "Отлично!\nВ какой магазин пойдем?",
    Keyboard.inline([
      [Key.callback("Bomj Gang", "1"), Key.callback("Paul Shop", "2")],
      [Key.callback("Clemente House", "3"), Key.callback("DonateLand", "4")],
    ])
  );
});

shopActions.action("chatAssortiment", (ctx) => {
  ctx.deleteMessage();
  ctx.reply(
    "Товары📦\n•ВИП статус в ирисе: 100к💰\n•+1лвл админа: 80к💰\n•Префикс: 40к💰\n•Снять варн: 20к💰\n•Купить анонимность: 150к💰\n•Доступ к логам: 25к💰\n•Смена префикса: 10к💰\n•Снять бан: 100к💰n\n❗️магазин не доступен 3+ рангам администраторов❗️",
    Keyboard.inline([
      ["ВИП", "Админка", "Префикс"],
      ["Снять Варн", "Анон", "Логи"],
      ["Смена Префикса", "Снять бан"],
      [Key.callback("Закрыть", "dell"), Key.callback("Назад", "menu")],
    ])
  );
});

shopActions.action("menu", (ctx) => {
  ctx.deleteMessage();
  ctx.reply(
    "Выберите что хотите купить:",
    Keyboard.inline([
      [Key.callback("Товары чата", "chatAssortiment"), "Улучшения", "Вещи"],
      [Key.callback("Закрыть", "dell")],
    ])
  );
});

module.exports = shopActions;
