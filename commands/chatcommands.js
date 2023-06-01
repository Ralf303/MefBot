const { Keyboard, Key } = require("telegram-keyboard");
const { Composer } = require("telegraf");
const CronJob = require("cron").CronJob;
require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});

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
const commands = "https://telegra.ph/RUKOVODSTVO-PO-BOTU-05-13";
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
  "ферма",
  "фарма",
  "актив",
  "отсыпать",
];

const rp = {
  кинуть: { value: "кинул(а) напрогиб", emoji: "🫂" },
  доза: { value: "вколол(а) дозу", emoji: "💉" },
  секс: { value: "трахнул(а) и кончил(а) внутрь", emoji: "🔞" },
  уничтожить: { value: "уничтожил(а)", emoji: "💀" },
  нюхать: { value: "занюхнул(а) мефа вместе с", emoji: "🌿" },
  накормить: { value: "вкусно накормил(а)", emoji: "👨‍🍳" },
  отшлепать: { value: "смачно отшлепал(а)", emoji: "🔞" },
  бум: { value: "взорвал(а)", emoji: "💥" },
  кончить: { value: "кончил(а) на лицо", emoji: "💦" },
};

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
    const comment = userMessage.split("\n")[1];
    console.log(comment);
    const rpAction = rp[userMessage.split("\n")[0]];
    if (rpAction) {
      await createRP(
        rpAction.value,
        rpAction.emoji,
        ctx,
        replyToMessage,
        comment
      );
    }
  }
  try {
    if (checkStatus || userMessage === capture) {
      if (userMessage == "проф") {
        ctx.reply(
          "Ваш ник: " +
            user.firstname +
            "\nВаш ID: " +
            ctx.from.id +
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
      try {
        capture = generateCapcha();
        await bot.telegram.sendMessage(
          process.env.CHAT_ID,
          "МефКапча " + capture
        );
      } catch (error) {
        console.log(error);
      }
    },
    null,
    true,
    "Europe/Moscow"
  );
}

module.exports = { chatCommands, CaptureGenerator };
