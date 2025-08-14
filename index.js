import { Telegraf, session, Scenes } from "telegraf";
import express from "express";
import https from "https";
import http from "http";
import fs from "fs";
import rateLimit from "telegraf-ratelimit";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});
const token = process.env.BOT_TOKEN;
const bot = new Telegraf(token);
const app = express();
app.use(cors());
app.use(express.json());
const port = 88;

import { connectToDb } from "./src/db/functions.js";
import gemsService from "./src/modules/gems-module/gems-service.js";
import diceScene from "./src/scenes/dice-bandit-scene.js";
import { buyPrefix, changePrefix } from "./src/scenes/prefix-scene.js";
import { rouletteScene } from "./src/scenes/roulette-scene.js";
import itemCronService from "./src/modules/items-module/items-utils/item-cron-service.js";
import captureGenerator from "./src/modules/capcha-module/capcha-generator.js";
import redisService from "./src/services/redis-service.js";
import { activePrize } from "./src/modules/active-module/active-prize-service.js";
import { vipCron } from "./src/modules/vipChat-module/vipChat-cron.js";
import { mainCronService } from "./src/modules/main-module/main-cron-service.js";
import usersItemRouter from "./src/API/getUserPablo.js";
import { cronService } from "./src/services/cron-service.js";
import keysService from "./src/modules/keys-module/keys-service.js";
import { famName } from "./src/scenes/fam-scene.js";
import famCron from "./src/modules/fam-module/fam-cron-service.js";
import homeCronService from "./src/modules/home-module/home-cron-service.js";
import homeApi from "./src/API/homeApi.js";
import middleware from "./middlewares.js";
import mineService from "./src/modules/mine-module/mine-cron.js";

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

    bot.use(middleware);
    mainCronService(bot);
    activePrize(bot);
    vipCron(bot);
    cronService(bot);
    captureGenerator(bot);
    famCron(bot);
    homeCronService();
    keysService.giveAllKeys();
    gemsService.giveAllGems();
    mineService.mineCron();
    itemCronService.changeLook(bot);
    await redisService.connect();
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
