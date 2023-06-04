const { Keyboard, Key } = require("telegram-keyboard");
const { Composer } = require("telegraf");

const privatCommands = new Composer();

privatTriggers = ["магазин"];

privatCommands.on("text", async (ctx, next) => {
  const userMessage = ctx.message.text.toLowerCase();
  const [word1, word2, word3] = userMessage.split(" ");
  const IsPrivate = ctx.chat.type === "private";

  try {
    if (IsPrivate) {
      if (userMessage == "магазин") {
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
      }
    } else if (
      (privatTriggers.includes(userMessage) ||
        privatTriggers.includes(word1)) &&
      !IsPrivate
    ) {
      ctx.reply("Данная команда доступна только в лс");
    }
  } catch (e) {
    ctx.reply("Какая то ошибка, " + e);
  }
  return next();
});

module.exports = privatCommands;
