const { Keyboard, Key } = require("telegram-keyboard");
const commands =
  "Список команд:\nмеф гайд\nмеф\nбот\nкапча\nмагазин\nпроф\nкоманды";
const work =
  "Команды на котором можно заработать мефа:\n\nФерма\nКуб\nБандит\n\nТак же в чате иногда появляется капча из 6 цифр и если вы введете ее правильно то получите мефа";
function chatcommands(userMessage, persone, ctx) {
  if (userMessage == "проф") {
    ctx.reply(
      "Ваш ник: " +
        ctx.from.first_name +
        "\nВаш ID: " +
        ctx.chat.id +
        "\nВаш меф: " +
        persone.balance +
        "\nКапчей введено: " +
        persone.captureCounter +
        "\nВаш уровень сбора: " +
        persone.lvl.mef +
        "\nВаш уровень времени: " +
        persone.lvl.time
    );
  }

  if (userMessage == "мой меф" || userMessage == "меф" || userMessage == "б") {
    ctx.reply("Ваш меф: " + persone.balance);
  }

  if (userMessage == "меф гайд") {
    ctx.reply(work);
  }

  if (userMessage == "бот") {
    ctx.reply("✅На месте");
  }

  if (userMessage == "команды") {
    ctx.reply(commands);
  }

  if (userMessage == "магазин") {
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
  }
}

module.exports = { chatcommands };
