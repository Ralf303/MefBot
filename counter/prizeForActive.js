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
      const topUsers = await findTopUserInDay(); // вызываем функцию findTopUsersInDay
      await resetDayCounter();
      if (topUsers[0]) {
        const balanceToAdd = topUsers[0].dayMessageCounter + 500; // баланс первого пользователя равен его количеству сообщений + 500
        await topUsers[0].update({ balance: balanceToAdd }); // обновляем баланс первого пользователя
        await resiveLog(
          topUsers[0],
          "меф",
          balanceToAdd.toString(),
          "награда за актив"
        ); // отправляем лог о начислении баланса
        bot.telegram.sendMessage(
          process.env.CHAT_ID,
          `[${topUsers[0].firstname}](https://t.me/${topUsers[0].username}) был самым активным за этот день и получил ${balanceToAdd} грам мефа`,
          {
            disable_notification: true,
            parse_mode: "Markdown",
            disable_web_page_preview: true,
          }
        );
      }
      if (topUsers[1]) {
        const balanceToAdd = topUsers[1].dayMessageCounter; // баланс второго пользователя равен его количеству сообщений
        await topUsers[1].update({ balance: balanceToAdd }); // обновляем баланс второго пользователя
        await resiveLog(
          topUsers[1],
          "меф",
          balanceToAdd.toString(),
          "награда за актив"
        ); // отправляем лог о начислении баланса
        bot.telegram.sendMessage(
          process.env.CHAT_ID,
          `[${topUsers[1].firstname}](https://t.me/${topUsers[1].username}) был вторым по активности за этот день и получил ${balanceToAdd} грам мефа`,
          {
            disable_notification: true,
            parse_mode: "Markdown",
            disable_web_page_preview: true,
          }
        );
      }
      if (topUsers[2]) {
        const balanceToAdd = topUsers[2].dayMessageCounter; // баланс третьего пользователя равен его количеству сообщений
        await topUsers[2].update({ balance: balanceToAdd }); // обновляем баланс третьего пользователя
        await resiveLog(
          topUsers[2],
          "меф",
          balanceToAdd.toString(),
          "награда за актив"
        ); // отправляем лог о начислении баланса
        bot.telegram.sendMessage(
          process.env.CHAT_ID,
          `[${topUsers[2].firstname}](https://t.me/${topUsers[2].username}) был третьим по активности за этот день и получил ${balanceToAdd} грам мефа`,
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
