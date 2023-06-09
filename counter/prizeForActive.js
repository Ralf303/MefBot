require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});
const {
  findTopUserInDay,
  resetDayCounter,
  resetMonthCounter,
  resetWeekCounter,
  findTopUserInMonth,
  findTopUserInWeek,
} = require("../db/functions.js");
const { resiveLog } = require("../logs/globalLogs.js");
const CronJob = require("cron").CronJob;

function Timings(bot) {
  new CronJob(
    "5 0 0 * * *",
    async function () {
      const topUser = await findTopUserInDay();
      await resetDayCounter();
      if (topUser) {
        await topUser.update({ balance: topUser.balance + 500 });
        await resiveLog(topUser, "меф", "500", "награда за актив");
        bot.telegram.sendMessage(
          process.env.CHAT_ID,
          `[${topUser.firstname}](https://t.me/${topUser.username}) был самым активным за этот день и получил 500 грам мефа`,
          {
            disable_notification: true,
            parse_mode: "Markdown",
            disable_web_page_preview: true,
          }
        );
      }
    },
    null,
    true,
    "Europe/Moscow"
  );
  new CronJob(
    "20 0 0 * * 0",
    async function () {
      const topUser = await findTopUserInWeek();
      await resetWeekCounter();
      if (topUser) {
        await topUser.update({ balance: topUser.balance + 15000 });
        await resiveLog(topUser, "меф", "15000", "награда за актив");
        bot.telegram.sendMessage(
          process.env.CHAT_ID,
          `[${topUser.firstname}](https://t.me/${topUser.username}) был самым активным за эту неделю и получил 15000 грам мефа`,
          {
            disable_notification: true,
            parse_mode: "Markdown",
            disable_web_page_preview: true,
          }
        );
      }
    },
    null,
    true,
    "Europe/Moscow"
  );
  new CronJob(
    "10 0 0 1 * *",
    async function () {
      const topUser = await findTopUserInMonth();
      await resetMonthCounter();
      if (topUser) {
        await topUser.update({ balance: topUser.balance + 50000 });
        await resiveLog(topUser, "меф", "50000", "награда за актив");
        bot.telegram.sendMessage(
          process.env.CHAT_ID,
          `[${topUser.firstname}](https://t.me/${topUser.username}) был самым активным за этот месяц и получил 50000 грам мефа`,
          {
            disable_notification: true,
            parse_mode: "Markdown",
            disable_web_page_preview: true,
          }
        );
      }
    },
    null,
    true,
    "Europe/Moscow"
  );
}

module.exports = { Timings };
