const { Telegraf, session, Scenes } = require("telegraf");
const rateLimit = require("telegraf-ratelimit");

const token = "5790752465:AAHo8YTsyn0CWouPDpURS8jeivKikuF3XtA";
const bot = new Telegraf(token);

const { connectToDb } = require("./db/functions.js");
const { ScenesGenerator } = require("./scenes.js");
const { Timings } = require("./counter/prizeForActive.js");
const { CaptureGenerator } = require("./commands/chatCommands.js");
const curScene = new ScenesGenerator();
const BuyPrefix = curScene.prefix(bot);
const ChangePrefix = curScene.ChangePrefix(bot);
const stage = new Scenes.Stage([BuyPrefix, ChangePrefix]);

const start = async () => {
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

  Timings(bot);
  CaptureGenerator(bot);
  bot.launch();
};

start();
