const { Item } = require("../db/models");
const { getRandomInt } = require("../utils/helpers");
const CronJob = require("cron").CronJob;

class TyneService {
  async changeLook() {
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
  }
}

module.exports = new TyneService();
