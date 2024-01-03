const { Item, User } = require("./db/models");
const { calculateMiningAmount, sleep } = require("./utils/helpers");

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

            if (minedAmount > 100000) {
              minedAmount = 100000;
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
