const { getVipChats } = require("../../db/functions");
const { sleep } = require("../../utils/helpers");

const CronJob = require("cron").CronJob;
require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});

function mainCronService(bot) {
  new CronJob(
    "0 0 0 * * *",
    async function () {
      const vipChats = await getVipChats();
      for (const chat of vipChats) {
        try {
          bot.telegram.sendMessage(chat.chatId, "Всем спокойной ночи 😴");
          await sleep(100);
        } catch (error) {
          continue;
        }
      }
    },
    null,
    true,
    "Europe/Moscow"
  );

  new CronJob(
    "0 0 8 * * *",
    async function () {
      const vipChats = await getVipChats();
      for (const chat of vipChats) {
        try {
          bot.telegram.sendMessage(chat.chatId, "Всем доброе утро ☀️");
        } catch (error) {
          console.log(error);
        }
      }
    },
    null,
    true,
    "Europe/Moscow"
  );
}

module.exports = { mainCronService };
