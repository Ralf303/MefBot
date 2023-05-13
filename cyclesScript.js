const CronJob = require("cron").CronJob;

function Cycles(bot) {
  new CronJob(
    "0 0 0 * * *",
    async function () {
      bot.telegram.sendMessage(
        -1001680708708,
        "Все, всем спокойной ночи ебать😴"
      );
    },
    null,
    true,
    "Europe/Moscow"
  );

  new CronJob(
    "0 0 8 * * *",
    async function () {
      bot.telegram.sendMessage(-1001680708708, "Всем доброе утро ебать☀️");
    },
    null,
    true,
    "Europe/Moscow"
  );
}

module.exports = { Cycles };
