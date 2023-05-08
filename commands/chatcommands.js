const { Keyboard, Key } = require("telegram-keyboard");
const { Composer } = require("telegraf");
const {
  getRandomInt,
  generateCapcha,
  notify,
  checkUserSub,
} = require("../utils/helpers");
const { dice, bandit, userFerma, createRP } = require("../utils/games.js");
const { getUser } = require("../DataBase/HelpWithDb");
const chatCommands = new Composer();
const commands =
  "Список команд:\nмеф гайд\nмеф\nбот\nкапча\nмагазин\nпроф\nкоманды";
const work =
  "Команды на котором можно заработать мефа:\n\nФерма\nКуб\nБандит\n\nТак же в чате иногда появляется капча из 6 цифр и если вы введете ее правильно то получите мефа";
let capture = 120394857653;
const triggers = [
  "меф",
  "бот",
  "капча",
  "магазин",
  "проф",
  "команды",
  "мой меф",
  "б",
  "куб",
  "бандит",
  "меф гайд",
  "ферма",
  "фарма",
  "актив",
];

chatCommands.on("text", async (ctx, next) => {
  const user = await getUser(
    ctx.from.id,
    ctx.from.first_name,
    ctx.from.username
  );
  const userMessage = ctx.message.text.toLowerCase();
  const [word1, word2, word3] = userMessage.split(" ");
  const replyToMessage = ctx.message.reply_to_message;
  const IsPrivate = ctx.chat.type === "private";
  const checkStatus = await checkUserSub(
    ctx,
    "@healthy_food_music",
    word1,
    userMessage,
    triggers,
    ctx
  );
  if (replyToMessage && replyToMessage.from) {
    const rp = ["кинуть", "доза", "наказать"];
    const rpValue = ["кинул напрогиб", "вколол дозу", "жестко наказал"];
    const rpid = rp.indexOf(userMessage);
    const needrp = rpValue[rpid];
    if (userMessage == rp[rpid]) {
      createRP(needrp, ctx, replyToMessage);
    }
  }
  try {
    if (checkStatus || userMessage === capture) {
      if (userMessage == "проф") {
        ctx.reply(
          "Ваш ник: " +
            user.firstname +
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

      if (
        userMessage == "мой меф" ||
        userMessage == "меф" ||
        userMessage == "б"
      ) {
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
        if (IsPrivate) {
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
        } else {
          ctx.reply("Данная команда доступна только в лс");
        }
      }
      if (userMessage === capture) {
        const randommef = getRandomInt(50, 200);
        user.balance += randommef;
        user.captureCounter += 1;
        await ctx.reply("Верно, ты получил " + randommef + " мефа", {
          reply_to_message_id: ctx.message.message_id,
        });
        capture = 342234242;
      }

      if (userMessage == "капча") {
        capture = generateCapcha();
        ctx.reply("МефКапча " + capture);
      }

      if (word1 == "куб") {
        await dice(word3, word2, user, ctx, ctx);
      }

      if (userMessage == "ферма" || userMessage == "фарма") {
        userFerma(ctx, user);
      }

      if (word1 == "бандит") {
        await bandit(word2, user, ctx);
      }
      await user.save();
    } else if (triggers.includes(userMessage) || triggers.includes(word1)) {
      await notify(ctx, "healthy_food_music");
    }
  } catch (e) {
    ctx.reply("Какая то ошибка, " + e);
  }
  return next();
});

module.exports = chatCommands;
