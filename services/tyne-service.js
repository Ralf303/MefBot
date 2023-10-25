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
