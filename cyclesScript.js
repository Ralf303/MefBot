const { Op } = require("sequelize");
const { Item, User, Add } = require("./db/models");
const { checkItem, createItem } = require("./itemsModule/clothesFunctions");
const clothes = require("./itemsObjects/clothes");
const {
  calculateMiningAmount,
  sleep,
  getRandomInt,
  checkUserSub,
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

            if (await checkItem(user.id, "Пупс «Ремонт»")) {
              minedAmount = Math.min(minedAmount + 50000, 150000);
            } else if (minedAmount > 100000) {
              minedAmount = 100000;
            }

            const chance = getRandomInt(0, 100);

            if (chance <= 2) {
              const item = await createItem(126);

              user.fullSlots++;
              await user.addItem(item);
              await bot.telegram.sendMessage(
                process.env.CHAT_ID,
                `❗️@${user.username} испытал удачу и получил ${item.itemName}❗️`
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

  new CronJob(
    "20 0 15 * * *",
    async function () {
      const bonuses = await Add.findAll({
        where: {
          createdAt: {
            [Op.lt]: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          },
        },
      });

      if (bonuses) {
        for (const bonus of bonuses) {
          try {
            const user = await User.findOne({
              where: { chatId: bonus.userId },
            });

            if (await checkUserSub(bot, bonus.channelId, user.chatId)) {
              const item = await createItem(bonus.itemId);

              user.fullSlots++;
              await user.addItem(item);
              const minedAmount = getRandomInt(1000, 10000);
              user.balance += minedAmount;
              await bonus.destroy();
              await item.save();
              await user.save();
              const message = `❗️Спасибо за участие в разадче❗️\n\nВы получили:\n${minedAmount}мефа🤑\n${item.itemName}[${item.id}]`;
              await bot.telegram.sendMessage(user.chatId, message);
              await sleep(200);
            } else {
              console.log("Юзер отписался");
            }
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
