const { Item, User } = require("./db/models");
const { checkItem, createItem } = require("./itemsModule/clothesFunctions");

const {
  calculateMiningAmount,
  sleep,
  getRandomInt,
} = require("./utils/helpers");

const CronJob = require("cron").CronJob;
require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});

function Cycles(bot) {
  new CronJob(
    "0 0 0 * * *",
    async function () {
      try {
        bot.telegram.sendMessage(
          process.env.CHAT_ID,
          "Всем спокойной ночи ебать😴"
        );
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
        bot.telegram.sendMessage(
          process.env.CHAT_ID,
          "Всем доброе утро ебать☀️"
        );
      } catch (error) {
        console.log(error);
      }
    },
    null,
    true,
    "Europe/Moscow"
  );

  new CronJob(
    "20 0 13 * * *",
    async function () {
      const drones = await Item.findAll({
        where: {
          itemName: "Дрон Майнер",
          isWorn: true,
        },
      });

      if (drones) {
        for (const drone of drones) {
          try {
            const user = await User.findOne({ where: { id: drone.userId } });
            let minedAmount = calculateMiningAmount(user.balance);

            if (
              (await checkItem(user.id, "Пупс «Ремонт»")) &&
              minedAmount > 150000
            ) {
              minedAmount = 200000;
            } else if (minedAmount > 150000) {
              minedAmount = 150000;
            }

            const chance = getRandomInt(0, 100);

            if (chance <= 2) {
              const item = await createItem(126);

              user.fullSlots++;
              await user.addItem(item);
              await bot.telegram.sendMessage(
                process.env.CHAT_ID,
                `❗️<a href="tg://user?id=${user.chatId}">${user.firstname}</a> испытал удачу и получил ${item.itemName}❗️`,
                { parse_mode: "HTML" }
              );
              await item.save();
            }

            user.balance += minedAmount;
            await user.save();
            const message = `Я намайнил ${minedAmount} мефа🤑`;
            await bot.telegram.sendMessage(user.chatId, message);
            await sleep(200);
          } catch (error) {
            console.log(error);
          }
        }
      }
    },
    null,
    true,
    "Europe/Moscow"
  );
}

module.exports = { Cycles };
