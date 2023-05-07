const { Keyboard, Key } = require("telegram-keyboard");
const commands =
  "Список команд:\nмеф гайд\nмеф\nбот\nкапча\nмагазин\nпроф\nкоманды";
const work =
  "Команды на котором можно заработать мефа:\n\nФерма\nКуб\nБандит\n\nТак же в чате иногда появляется капча из 6 цифр и если вы введете ее правильно то получите мефа";
function chatcommands(userMessage, user, ctx) {
  if (userMessage == "проф") {
    ctx.reply(
      "Ваш ник: " +
        ctx.from.first_name +
        "\nВаш ID: " +
        ctx.chat.id +
        "\nВаш меф: " +
        user.balance +
        "\nКапчей введено: " +
        user.captureCounter +
        "\nВаш уровень сбора: " +
        user.meflvl +
        "\nВаш уровень времени: " +
        user.timelvl
    );
  }

  if (userMessage == "мой меф" || userMessage == "меф" || userMessage == "б") {
    ctx.reply("Ваш меф: " + user.balance);
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
        Keyboard.inline([
          [
            Key.callback("Товары для чата", "chatAssortiment"),
            Key.callback("Улучшения", "farmApp"),
          ],
          [Key.callback("Закрыть", "dell")],
        ])
      );
    } else if (ctx.chat.type === "group" || ctx.chat.type === "supergroup") {
      ctx.reply("Данная команда доступна только в лс");
    }
  }
}

module.exports = { chatcommands };
