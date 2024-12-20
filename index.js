const { Telegraf, session, Scenes } = require("telegraf");
const express = require("express");
const https = require("https");
const http = require("http");
const fs = require("fs");
const rateLimit = require("telegraf-ratelimit");
const cors = require("cors");

require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});
const token = process.env.BOT_TOKEN;
const bot = new Telegraf(token);
const app = express();
app.use(cors());
app.use(express.json());
const port = 88;

const { connectToDb } = require("./src/db/functions.js");
const gemsService = require("./src/modules/gems-module/gems-service.js");
const diceScene = require("./src/scenes/dice-bandit-scene.js");
const { buyPrefix, changePrefix } = require("./src/scenes/prefix-scene.js");
const { rouletteScene } = require("./src/scenes/roulette-scene.js");
const itemCronService = require("./src/modules/items-module/items-utils/item-cron-service.js");
const captureGenerator = require("./src/modules/capcha-module/capcha-generator.js");
const redisServise = require("./src/services/redis-servise.js");
const {
  activePrize,
} = require("./src/modules/active-module/active-prize-service.js");
const { vipCron } = require("./src/modules/vipChat-module/vipChat-cron.js");
const {
  mainCronService,
} = require("./src/modules/main-module/main-cron-service.js");
const usersItemRouter = require("./src/API/getUserPablo.js");
const { cronService } = require("./src/services/cron-service.js");
const keysService = require("./src/modules/keys-module/keys-service.js");
const { famName } = require("./src/scenes/fam-scene.js");
const famCron = require("./src/modules/fam-module/fam-cron-service.js");
const homeCronService = require("./src/modules/home-module/home-cron-service.js");
const homeApi = require("./src/API/homeApi.js");

const stage = new Scenes.Stage([
  buyPrefix,
  changePrefix,
  rouletteScene,
  diceScene,
  famName,
]);

const start = async () => {
  try {
    bot.catch(async (err) => {
      console.log(`ОШИБКА В БОТ CATCH: ${err}`);
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
    mainCronService(bot);
    activePrize(bot);
    vipCron(bot);
    cronService(bot);
    captureGenerator(bot);
    famCron(bot);
    homeCronService();
    keysService.giveAllKeys();
    gemsService.giveAllGems();
    itemCronService.changeLook(bot);
    await redisServise.connect();
    app.use(usersItemRouter);
    app.use(homeApi);
    if (process.env.WEB_HOOK_URL) {
      const options = {
        key: fs.readFileSync(process.env.SECRET_KEY),
        cert: fs.readFileSync(process.env.SERTIFICATE),
      };
      app.use(
        await bot.createWebhook({
          domain: process.env.WEB_HOOK_URL,
          drop_pending_updates: true,
        })
      );
      https.createServer(options, app).listen(port, () => {
        console.log("Бот работает на порту", port);
      });
      https.createServer(options, app).listen(5000, () => {
        console.log("Сервер работает на порту", port);
      });
      await bot.telegram.sendMessage(1157591765, "Бот перезапущен на веб хуке");
    } else {
      http.createServer(app).listen(5000, () => {
        console.log("Сервер работает на порту", 5000);
      });
      bot.launch({ dropPendingUpdates: true });
      await bot.telegram.sendMessage(1157591765, "Бот перезапущен на пулинге");
    }
  } catch (error) {
    console.log(error);
  }
};

start();
