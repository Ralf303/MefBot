const { Keyboard, Key } = require("telegram-keyboard");
const { Composer } = require("telegraf");

const comand = new Composer();

const commands =
  "Список команд:\nмеф гайд\nмеф\nбот\nкапча\nмагазин\nпроф\nкоманды";
const work =
  "Команды на котором можно заработать мефа:\n\nФерма\nКуб\nБандит\n\nТак же в чате иногда появляется капча из 6 цифр и если вы введете ее правильно то получите мефа";

comand.command("start", async (ctx) => {
  ctx
    .reply(
      "Привет " +
        ctx.from.first_name +
        "!\n\nЯ, МефБот, создан для помощи в чате @mefpablo\nБолее подробно => /help"
    )
    .catch((err) => console.log(err));
});

comand.command("command", (ctx) => {
  ctx.reply(commands).catch((err) => console.log(err));
});

comand.command("help", (ctx) => {
  ctx
    .replyWithHTML(
      "Помощь по боту:\n/command все функции бота\n/start перезапуск бота\n/mef информация по добычи мефа\n/shop магазин\n\nТакже если вы нашли ошибку пишите @ralf303"
    )
    .catch((err) => console.log(err));
});

comand.command("mef", (ctx) => {
  ctx.reply(work).catch((err) => console.log(err));
});

comand.command("shop", (ctx) => {
  if (ctx.chat.type === "private") {
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
  } else if (ctx.chat.type === "group" || ctx.chat.type === "supergroup") {
    ctx.reply("Данная команда доступна только в лс");
  }
});

module.exports = comand;
