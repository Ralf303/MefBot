const CronJob = require("cron").CronJob;
require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});

function Cycles(bot) {
  new CronJob(
    "0 0 0 * * *",
    async function () {
      bot.telegram.sendMessage(
        process.env.CHAT_ID,
        "Всем спокойной ночи ебать😴"
      );
    },
    null,
    true,
    "Europe/Moscow"
  );

  new CronJob(
    "0 0 8 * * *",
    async function () {
      bot.telegram.sendMessage(process.env.CHAT_ID, "Всем доброе утро ебать☀️");
    },
    null,
    true,
    "Europe/Moscow"
  );
}

module.exports = { Cycles };
