import { withUserTransaction } from "../../../services/transaction-service.js";
import { syncUserCaseToDb } from "../../../db/functions.js";
import { Item, User } from "../../../db/models.js";
import { getRandomInt, sleep } from "../../../utils/helpers.js";
import { getUserCase } from "../../case-module/case-utils/case-tool-service.js";
import cases from "../../case-module/cases.js";
import { userFerma } from "../../mef-module/ferma.js";
import { CronJob } from "cron";

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

              await withUserTransaction(user, async () => {
                const currentCase = await getUserCase(user.id);
                currentCase[needCase.dbName] += 1;
                await currentCase.save();
              });

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

export default new ItemService();
