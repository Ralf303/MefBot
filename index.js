const { Telegraf, session, Scenes } = require("telegraf");
const express = require("express");
const rateLimit = require("telegraf-ratelimit");
require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});
const token = process.env.BOT_TOKEN;
const bot = new Telegraf(token);
const app = express();

const { connectToDb } = require("./db/functions.js");
const { ScenesGenerator } = require("./scenes.js");
const { Timings } = require("./counter/prizeForActive.js");
const { CaptureGenerator } = require("./commands/chatcommands.js");
const { Cycles } = require("./cyclesScript.js");
const gemsService = require("./services/gems-service.js");
const tyneService = require("./services/tyne-service.js");

const curScene = new ScenesGenerator();
const BuyPrefix = curScene.prefix(bot);
const ChangePrefix = curScene.ChangePrefix(bot);
const rouletteScene = curScene.rouletteScene(bot);
const stage = new Scenes.Stage([BuyPrefix, ChangePrefix, rouletteScene]);
const port = 80;

const start = async () => {
  try {
    bot.catch(async (err) => {
      console.log(`Error occurred: ${err}`);
    });
    await connectToDb();
    bot.use(session());
    bot.use(stage.middleware());

    bot.use(
      rateLimit({
        window: 1000,
        limit: 5,
      })
    );

    bot.use(require("./middlewares.js"));
    Cycles(bot);
    Timings(bot);
    CaptureGenerator(bot);
    gemsService.giveAllGems();
    tyneService.changeLook();

    if (process.env.WEB_HOOK_URL) {
      app.use(
        await bot.createWebhook({
          domain: process.env.WEB_HOOK_URL,
        })
      );
      app.listen(port, () => console.log("Listening on port", port));
      await bot.telegram.sendMessage(1157591765, "Бот перезапущен на веб хуке");
    } else {
      bot.launch({ dropPendingUpdates: true });
      await bot.telegram.sendMessage(1157591765, "Бот перезапущен на пулинге");
    }
  } catch (error) {
    console.log(error);
  }
};

start();
