const { Telegraf, session, Scenes } = require("telegraf");
const rateLimit = require("telegraf-ratelimit");
const token = "5790752465:AAHo8YTsyn0CWouPDpURS8jeivKikuF3XtA";
const bot = new Telegraf(token);
const { ScenesGenerator } = require("./scenes.js");
const curScene = new ScenesGenerator();
const GetPref = curScene.prefix(bot);
const ChangePrefix = curScene.change(bot);
const {
  getRandomInt,
  generateCapcha,
  notify,
  checkUserSub,
} = require("./utils/helpers.js");
const { dice, bandit, userFerma, createRP } = require("./utils/games.js");
const { chatcommands } = require("./commands/chatcommands.js");
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
];

let persone = {
  balance: 1000000,
  captureCounter: 0,
  farmtime: 0,
  lvl: {
    mef: 1,
    time: 1,
  },
  words: 0,
};
let banditStatus = true;

const stage = new Scenes.Stage([GetPref, ChangePrefix]);
bot.use(session());
bot.use(stage.middleware());
bot.use(require("./actions/actionOnBuy.js"));
bot.use(require("./commands/commands.js"));
bot.use(require("./actions/actions.js"));
bot.use(
  rateLimit({
    window: 4000,
    limit: 5,
  })
);

bot.context.persone = persone;

setInterval(() => {
  if (!banditStatus) {
    banditStatus = true;
  }
}, 3 * 1000);

bot.on("text", async (ctx) => {
  const userMessage = ctx.message.text.toLowerCase();
  const [word1, word2, word3] = userMessage.split(" ");
  const replyToMessage = ctx.message.reply_to_message;
  const checkStatus = await checkUserSub(
    ctx,
    "@healthy_food_music",
    word1,
    userMessage,
    triggers,
    bot
  );
  if (replyToMessage && replyToMessage.from) {
    const rp = ["кинуть", "доза"];
    const rpValue = ["кинул напрогиб", "вколол дозу"];
    const rpid = rp.indexOf(userMessage);
    const needrp = rpValue[rpid];
    if (userMessage == rp[rpid]) {
      createRP(needrp, ctx, replyToMessage);
    }
  }
  try {
    if (checkStatus || userMessage === capture) {
      chatcommands(userMessage, persone, ctx);

      if (userMessage === capture) {
        const randommef = getRandomInt(50, 200);
        persone.balance += randommef;
        persone.captureCounter += 1;
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
        await dice(word3, word2, persone, bot, ctx);
      }

      if (userMessage == "ферма" || userMessage == "фарма") {
        userFerma(ctx, persone);
      }

      if (word1 == "бандит") {
        await bandit(word2, persone, ctx, banditStatus);
        banditStatus = false;
      }
    } else if (triggers.includes(userMessage) || triggers.includes(word1)) {
      await notify(ctx, "healthy_food_music");
    }
  } catch (e) {
    ctx.reply("Какая то ошибка, " + e);
  }
});

bot.launch();
