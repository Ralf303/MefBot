const { syncUserCaseToDb } = require("../../../db/functions");
const { Item, User } = require("../../../db/models");
const {
  getRandomInt,
  calculateMiningAmount,
  sleep,
} = require("../../../utils/helpers");
const {
  getUserCase,
} = require("../../case-module/case-utils/case-tool-service");
const cases = require("../../case-module/cases");
const { userFerma } = require("../../mef-module/ferma");
const { createItem, checkItem } = require("./item-tool-service");
const CronJob = require("cron").CronJob;

class ItemService {
  async changeLook(bot) {
    new CronJob(
      "2 0 6-15 * * *",
      async function () {
        await Item.update(
          {
            src: "img/tyne_1.png",
          },
          {
            where: {
              itemName: "Horny Tyan",
            },
          }
        );

        await Item.update(
          {
            src: "img/bill_d.png",
          },
          {
            where: {
              itemName: "Билл Шифр",
            },
          }
        );
      },
      null,
      true,
      "Europe/Moscow"
    );

    new CronJob(
      "2 */30 * * * *",
      async function () {
        const number = getRandomInt(1, 6);
        const src = `img/multi_${number}.png`;
        await Item.update(
          {
            src: src,
          },
          {
            where: {
              itemName: "Мульти кроссы",
            },
          }
        );
      },
      null,
      true,
      "Europe/Moscow"
    );

    new CronJob(
      "59 0 0 * * *",
      async function () {
        await Item.update(
          {
            src: "img/fnaf_freddy_n.png",
          },
          {
            where: {
              itemName: "Фреди",
            },
          }
        );

        await Item.update(
          {
            src: "img/fnaf_foxy_n.png",
          },
          {
            where: {
              itemName: "Фокси",
            },
          }
        );

        await Item.update(
          {
            src: "img/fnaf_chika_n.png",
          },
          {
            where: {
              itemName: "Чика",
            },
          }
        );

        await Item.update(
          {
            src: "img/fnaf_baloon_n.png",
          },
          {
            where: {
              itemName: "Балун Бой",
            },
          }
        );

        await Item.update(
          {
            src: "img/fnaf_boney_n.png",
          },
          {
            where: {
              itemName: "Бонни",
            },
          }
        );

        await Item.update(
          {
            src: "img/keks_n.png",
          },
          {
            where: {
              itemName: "Кекс",
            },
          }
        );

        await Item.update(
          {
            src: "img/mangl_n.png",
          },
          {
            where: {
              itemName: "Мангл",
            },
          }
        );
      },

      null,
      true,
      "Europe/Moscow"
    );

    new CronJob(
      "59 0 6 * * *",
      async function () {
        await Item.update(
          {
            src: "img/fnaf_freddy_d.png",
          },
          {
            where: {
              itemName: "Фреди",
            },
          }
        );

        await Item.update(
          {
            src: "img/fnaf_foxy_d.png",
          },
          {
            where: {
              itemName: "Фокси",
            },
          }
        );

        await Item.update(
          {
            src: "img/fnaf_chika_d.png",
          },
          {
            where: {
              itemName: "Чика",
            },
          }
        );

        await Item.update(
          {
            src: "img/fnaf_baloon_d.png",
          },
          {
            where: {
              itemName: "Балун Бой",
            },
          }
        );

        await Item.update(
          {
            src: "img/fnaf_boney_d.png",
          },
          {
            where: {
              itemName: "Бонни",
            },
          }
        );

        await Item.update(
          {
            src: "img/keks_d.png",
          },
          {
            where: {
              itemName: "Кекс",
            },
          }
        );

        await Item.update(
          {
            src: "img/mangl_d.png",
          },
          {
            where: {
              itemName: "Мангл",
            },
          }
        );
      },
      null,
      true,
      "Europe/Moscow"
    );

    new CronJob(
      "2 */30 * * * *",
      async function () {
        const number = getRandomInt(1, 6);
        const src = `img/multi_${number}.png`;
        await Item.update(
          {
            src: src,
          },
          {
            where: {
              itemName: "Мульти кроссы",
            },
          }
        );
      },
      null,
      true,
      "Europe/Moscow"
    );

    new CronJob(
      "2 0 16-20 * * *",
      async function () {
        await Item.update(
          {
            src: "img/tyne_2.png",
          },
          {
            where: {
              itemName: "Horny Tyan",
            },
          }
        );
      },
      null,
      true,
      "Europe/Moscow"
    );

    new CronJob(
      "2 0 21-23 * * *",
      async function () {
        await Item.update(
          {
            src: "img/tyne_3.png",
          },
          {
            where: {
              itemName: "Horny Tyan",
            },
          }
        );

        await Item.update(
          {
            src: "img/bill_n.png",
          },
          {
            where: {
              itemName: "Билл Шифр",
            },
          }
        );
      },
      null,
      true,
      "Europe/Moscow"
    );

    new CronJob(
      "2 0 0-5 * * *",
      async function () {
        await Item.update(
          {
            src: "img/tyne_3.png",
          },
          {
            where: {
              itemName: "Horny Tyan",
            },
          }
        );
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

              const chance = getRandomInt(0, 300);

              if (chance === 1) {
                const item = await createItem(126);

                user.fullSlots++;
                await user.addItem(item);
                await bot.telegram.sendMessage(
                  user.chatId,
                  `❗️Ты испытал(а) удачу и получили ${item.itemName}❗️`,
                  { parse_mode: "HTML" }
                );
                await item.save();
              }

              user.balance += minedAmount;
              await user.save();
              const message = `Я намайнил ${minedAmount} старок🤑`;
              await bot.telegram.sendMessage(user.chatId, message);
              await sleep(200);
            } catch (error) {
              continue;
            }
          }
        }
      },
      null,
      true,
      "Europe/Moscow"
    );

    new CronJob(
      "59 37 */1 * * *",
      async function () {
        const helpers = await Item.findAll({
          where: {
            itemName: "Мистер помощник",
            isWorn: true,
          },
        });

        if (helpers) {
          for (const helper of helpers) {
            try {
              const user = await User.findOne({ where: { id: helper.userId } });
              const message = await userFerma(user);
              await bot.telegram.sendMessage(
                user.chatId,
                `${message}\n\n\n\nВаш мистер помощник 🎩`
              );
              await sleep(200);
            } catch (error) {
              continue;
            }
          }
        }
      },
      null,
      true,
      "Europe/Moscow"
    );

    new CronJob(
      "0 0 */1 * * *",
      async function () {
        const drons = await Item.findAll({
          where: {
            itemName: "Нг дрон",
            isWorn: true,
          },
        });

        if (drons) {
          for (const helper of drons) {
            try {
              const user = await User.findOne({
                where: { id: helper.userId },
              });

              const caseNumber = getRandomInt(1, 7);

              const needCase = cases[caseNumber];
              await syncUserCaseToDb(user.id);
              const userCase = await getUserCase(user.id);

              userCase[needCase.dbName] += 1;
              await userCase.save();
              await user.save();

              await sleep(200);
            } catch (error) {
              continue;
            }
          }
        }
      },
      null,
      true,
      "Europe/Moscow"
    );
  }
}

module.exports = new ItemService();
