const {
  findTopUserInDay,
  resetDayCounter,
  resetMonthCounter,
  resetWeekCounter,
  findTopUserInMonth,
  findTopUserInWeek,
} = require("../DataBase/HelpWithDb");
const CronJob = require("cron").CronJob;

function Timings(bot) {
  new CronJob(
    "5 0 0 * * *",
    async function () {
      const topUser = await findTopUserInDay();
      await resetDayCounter();
      if (topUser) {
        await topUser.update({ balance: topUser.balance + 500 });
        bot.telegram.sendMessage(
          -1001680708708,
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
        await topUser.update({ balance: topUser.balance + 5000 });
        bot.telegram.sendMessage(
          -1001680708708,
          `[${topUser.firstname}](https://t.me/${topUser.username}) был самым активным за эту неделю и получил 5000 грам мефа`,
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
        await topUser.update({ balance: topUser.balance + 10000 });
        bot.telegram.sendMessage(
          -1001680708708,
          `[${topUser.firstname}](https://t.me/${topUser.username}) был самым активным за этот месяц и получил 10000 грам мефа`,
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
