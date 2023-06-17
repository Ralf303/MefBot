const { Telegraf, session, Scenes } = require("telegraf");
const rateLimit = require("telegraf-ratelimit");
require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});
const token = process.env.BOT_TOKEN;
const bot = new Telegraf(token);

const { connectToDb } = require("./db/functions.js");
const { ScenesGenerator } = require("./scenes.js");
const { Timings } = require("./counter/prizeForActive.js");
const { CaptureGenerator } = require("./commands/chatcommands.js");
const { Cycles } = require("./cyclesScript.js");

const curScene = new ScenesGenerator();
const BuyPrefix = curScene.prefix(bot);
const ChangePrefix = curScene.ChangePrefix(bot);
const rouletteScene = curScene.rouletteScene(bot);
const stage = new Scenes.Stage([BuyPrefix, ChangePrefix, rouletteScene]);

const start = async () => {
  bot.catch((err) => {
    console.log(`Error occurred: ${err}`);
  });
  await connectToDb();
  bot.use(session());
  bot.use(stage.middleware());

  bot.use(
    rateLimit({
      window: 3000,
      limit: 5,
    })
  );
  bot.use(require("./middlewares.js"));
  Cycles(bot);
  Timings(bot);
  CaptureGenerator(bot);
  bot.launch();
};

start();
