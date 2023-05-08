const { Telegraf, session, Scenes } = require("telegraf");
const token = "5790752465:AAHo8YTsyn0CWouPDpURS8jeivKikuF3XtA";
const bot = new Telegraf(token);
const rateLimit = require("telegraf-ratelimit");
const { connectToDb } = require("./DataBase/HelpWithDb");
const { ScenesGenerator } = require("./scenes.js");
const curScene = new ScenesGenerator();
const BuyPrefix = curScene.prefix(bot);
const ChangePrefix = curScene.ChangePrefix(bot);
const stage = new Scenes.Stage([BuyPrefix, ChangePrefix]);

const start = async () => {
  await connectToDb();
  bot.use(session());
  bot.use(stage.middleware());
  bot.use(require("./actions/actionOnBuy.js"));
  bot.use(require("./commands/commands.js"));
  bot.use(require("./actions/actions.js"));
  bot.use(require("./commands/chatCommands.js"));
  bot.use(require("./ChatCounter.js"));
  bot.use(
    rateLimit({
      window: 4000,
      limit: 5,
    })
  );
  bot.launch();
};

start();
