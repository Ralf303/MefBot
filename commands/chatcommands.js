const { Keyboard, Key } = require("telegram-keyboard");
const { Composer } = require("telegraf");
const CronJob = require("cron").CronJob;
const {
  getRandomInt,
  generateCapcha,
  notify,
  checkUserSub,
} = require("../utils/helpers");
const { dice, bandit, userFerma, createRP } = require("../utils/games.js");
const { getUser } = require("../db/functions.js");
const { giveCoins } = require("./giveScripts.js");

const chatCommands = new Composer();
const commands =
  "Список команд:\nмеф гайд\nмеф\nбот\nкапча\nмагазин\nпроф\nкоманды";
const work =
  "Команды на котором можно заработать мефа:\n\nФерма\nКуб\nБандит\n\nТак же в чате иногда появляется капча из 6 цифр и если вы введете ее правильно то получите мефа";
let capture = 120394857653;

const triggers = [
  "меф",
  "бот",
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
  "отсыпать",
];

const rp = [
  "кинуть",
  "доза",
  "секс",
  "уничтожить",
  "нюхать",
  "накормить",
  "отшлепать",
  "бум",
];

const rpEmoji = ["🫂", "💉", "🔞", "💀", "🌿", "👨‍🍳", "🔞", "💥"];

const rpValue = [
  "кинул напрогиб",
  "вколол дозу",
  "поставил на колени",
  "уничтожил",
  "занюхнул мефа вместе с",
  "вкусно накормил",
  "смачно отшлепал",
  "взорвал",
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
    const rpid = rp.indexOf(userMessage);
    const needrp = rpValue[rpid];
    const needemoji = rpEmoji[rpid];
    if (userMessage == rp[rpid]) {
      createRP(needrp, needemoji, ctx, replyToMessage);
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

      if (word1 == "отсыпать") {
        await giveCoins(ctx);
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

      if (word1 == "куб") {
        await dice(word3, word2, user, ctx, ctx);
      }

      if (userMessage == "ферма" || userMessage == "фарма") {
        await userFerma(ctx, user);
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

function CaptureGenerator(bot) {
  new CronJob(
    "0 1 */2 * * *",
    async function () {
      capture = generateCapcha();
      await bot.telegram.sendMessage(-1001680708708, "МефКапча " + capture);
    },
    null,
    true,
    "Europe/Moscow"
  );
}

module.exports = { chatCommands, CaptureGenerator };
