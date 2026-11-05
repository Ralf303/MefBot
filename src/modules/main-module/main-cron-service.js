import { getVipChats } from "../../db/functions.js";
import { sleep } from "../../utils/helpers.js";
import { CronJob } from "cron";
import { canPostToGroup } from "../../services/group-access.js";
import dotenv from "dotenv";
dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});

function mainCronService(bot) {
  new CronJob(
    "0 0 0 * * *",
    async function () {
      try {
        const vipChats = await getVipChats();
        for (const chat of vipChats) {
          try {
            if (!await canPostToGroup(bot, chat.chatId)) continue;
            await bot.telegram.sendMessage(
              chat.chatId,
              "Всем спокойной ночи 😴"
            );
            await sleep(100);
          } catch (error) {
            continue;
          }
        }
      } catch (error) {
        console.log(error);
      }
    },
    null,
    true,
    "Europe/Moscow"
  );

  new CronJob(
    "0 0 8 * * *",
    async function () {
      try {
        const vipChats = await getVipChats();
        for (const chat of vipChats) {
          try {
            if (!await canPostToGroup(bot, chat.chatId)) continue;
            await bot.telegram.sendMessage(chat.chatId, "Всем доброе утро ☀️");
            await sleep(100);
          } catch (error) {
            continue;
          }
        }
      } catch (error) {
        console.log(error);
      }
    },
    null,
    true,
    "Europe/Moscow"
  );
}

export { mainCronService };
