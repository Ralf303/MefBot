const { Keyboard, Key } = require("telegram-keyboard");
const { Composer } = require("telegraf");
const clothes = require("../itemsObjects.js/clothes");
const {

  tryItem,

  

 

  

  


  


} = require("../itemsModule/clothesFunctions");

const privatCommands = new Composer();

privatTriggers = ["магазин", "примерить"];

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
              Key.callback("Товары чата", "chatAssortiment"),
              "Улучшения",
              "Вещи",
            ],
            [Key.callback("Закрыть", "dell")],
          ])
        );
      }

      if (word1 == "примерить") {
        const id = Number(word2);
        const itemInfo = clothes[id];
        if (!isNaN(id)) {
          await tryItem(itemInfo, ctx, id);
        } else {
          ctx.reply(
            "Не правильное использование команды\n\nПопробуйте\n<<Примерить {Id вещи}>>"
          );
        }
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
