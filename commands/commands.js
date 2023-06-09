const { Keyboard, Key } = require("telegram-keyboard");
const { Composer } = require("telegraf");
const { getUser } = require("../db/functions.js");

const command = new Composer();
const commands = "https://telegra.ph/RUKOVODSTVO-PO-BOTU-05-13";

command.command("start", async (ctx) => {
  try {
    ctx.reply(
      "Привет " +
        ctx.from.first_name +
        "!\n\nЯ, МефБот, создан для помощи в чате @mefpablo\nБолее подробно => /help"
    );
  } catch (error) {
    console.log("e");
  }
});

command.command("command", (ctx) => {
  try {
    ctx.reply(commands);
  } catch (error) {
    console.log("e");
  }
});

command.command("help", (ctx) => {
  try {
    ctx.replyWithHTML(
      "Помощь по боту:\n/command все функции бота\n/start перезапуск бота\n/shop магазин\n\nТакже если вы нашли ошибку пишите @ralf303"
    );
  } catch (error) {
    console.log("e");
  }
});

command.command("shop", (ctx) => {
  try {
    if (ctx.chat.type === "private") {
      ctx.reply(
        "Выберите что хотите купить:",
        Keyboard.inline([
          [Key.callback("Товары чата", "chatAssortiment"), "Улучшения", "Вещи"],
          [Key.callback("Закрыть", "dell")],
        ])
      );
    } else {
      ctx.reply("Данная команда доступна только в лс");
    }
  } catch (error) {
    console.log("e");
  }
});

module.exports = command;
