const { Item } = require("../db/models");
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
