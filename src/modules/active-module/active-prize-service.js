const CronJob = require("cron").CronJob;
require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});
const { getUser, getVipChats } = require("../../db/functions.js");
const { sleep, getRandomInt } = require("../../utils/helpers.js");
const {
  checkItem,
  createItem,
} = require("../items-module/items-utils/item-tool-service.js");
const activeService = require("./active-service.js");

function activePrize(bot) {
  new CronJob(
    "40 3 0 * * *",
    async function () {
      const chats = await getVipChats();

      for (const chat of chats) {
        try {
          const chatId = chat.chatId;
          const topUsers = await activeService.getTopDayUsers(chatId);
          let message = `Топ 3 активных пользователей за сегодня:\n\n`;

          for (const active of topUsers) {
            try {
              const index = topUsers.indexOf(active);
              const user = await getUser(active.user.chatId);
              const chance = getRandomInt(0, 500);
              let prize = (active.day *= 2);

              if (chance === 2) {
                const item = await createItem(104);
                user.fullSlots++;
                await user.addItem(item);
                await bot.telegram.sendMessage(
                  user.chatId,
                  "❗️Ты испытал удачу и получил " + item.itemName + "❗️"
                );
                await item.save();
              }

              if (
                (await checkItem(user.id, "Пупс «Красноречие»")) &&
                active.day != 0
              ) {
                prize += 1000;
              }

              user.balance += prize;
              await user.save();
              message += `${index + 1}) <a href="tg://user?id=${
                active.user.chatId
              }">${active.user.firstname}</a> получает ${prize} мефа\n\n`;
            } catch (error) {
              continue;
            }
          }

          await activeService.resetDayValues(chatId);
          await bot.telegram.sendMessage(chatId, message, {
            parse_mode: "HTML",
            disable_web_page_preview: true,
            disable_notification: true,
          });
          await sleep(500);
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
    "20 2 0 * * 1",
    async function () {
      const chats = await getVipChats();

      for (const chat of chats) {
        try {
          const chatId = chat.chatId;
          const topUsers = await activeService.getTopWeekUsers(chatId);
          let message = `Топ 3 активных пользователей за эту неделю:\n\n`;

          for (const active of topUsers) {
            try {
              const index = topUsers.indexOf(active);
              const user = await getUser(active.user.chatId);
              const chance = getRandomInt(0, 500);
              let prize = (active.week *= 2);

              if (chance === 2) {
                const item = await createItem(104);
                user.fullSlots++;
                await user.addItem(item);
                await bot.telegram.sendMessage(
                  user.chatId,
                  "❗️Ты испытал удачу и получил " + item.itemName + "❗️"
                );
                await item.save();
              }

              if (
                (await checkItem(user.id, "Пупс «Красноречие»")) &&
                active.week != 0
              ) {
                prize += 1000;
              }

              user.balance += prize;
              await user.save();
              message += `${index + 1}) <a href="tg://user?id=${
                active.user.chatId
              }">${active.user.firstname}</a> получает ${prize} мефа\n\n`;
            } catch (error) {
              continue;
            }
          }

          await activeService.resetWeekValues(chatId);
          await bot.telegram.sendMessage(chatId, message, {
            parse_mode: "HTML",
            disable_web_page_preview: true,
            disable_notification: true,
          });
          await sleep(500);
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
    "10 0 0 1 * *",
    async function () {
      const chats = await getVipChats();

      for (const chat of chats) {
        try {
          const chatId = chat.chatId;
          const topUsers = await activeService.getTopMonthUsers(chatId);
          let message = `Топ 3 активных пользователей за этот месяц:\n\n`;

          for (const active of topUsers) {
            try {
              const index = topUsers.indexOf(active);
              const user = await getUser(active.user.chatId);
              const chance = getRandomInt(0, 500);
              let prize = (active.month *= 2);

              if (chance === 2) {
                const item = await createItem(104);
                user.fullSlots++;
                await user.addItem(item);
                await bot.telegram.sendMessage(
                  user.chatId,
                  "❗️Ты испытал удачу и получил " + item.itemName + "❗️"
                );
                await item.save();
              }

              if (
                (await checkItem(user.id, "Пупс «Красноречие»")) &&
                active.month != 0
              ) {
                prize += 1000;
              }

              user.balance += prize;
              await user.save();
              message += `${index + 1}) <a href="tg://user?id=${
                active.user.chatId
              }">${active.user.firstname}</a> получает ${prize} мефа\n\n`;
            } catch (error) {
              continue;
            }
          }

          await activeService.resetMonthValues(chatId);
          await bot.telegram.sendMessage(chatId, message, {
            parse_mode: "HTML",
            disable_web_page_preview: true,
            disable_notification: true,
          });
          await sleep(500);
        } catch (error) {
          continue;
        }
      }
    },
    null,
    true,
    "Europe/Moscow"
  );
}

module.exports = { activePrize };
