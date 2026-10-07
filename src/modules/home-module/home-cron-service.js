import sequelize from "../../db/config.js";
import { CronJob } from "cron";
import { Op } from "sequelize";
import { Home } from "../../db/models.js";

async function homeCronService() {
  new CronJob(
    "0 0 * * * *",
    async function () {
      try {
        await Home.update({ userId: null, tax: 0, energy: 0 }, {
          where: { userId: { [Op.ne]: null }, tax: { [Op.gte]: 35500 } },
        });
        await Home.update({
          tax: sequelize.literal("tax + 500"),
          energy: sequelize.literal("LEAST(energy + 100, 10000)"),
        }, { where: { userId: { [Op.ne]: null }, tax: { [Op.lt]: 35500 } } });
      } catch (error) {
        console.log(error);
      }
    },

    null,
    true,
    "Europe/Moscow"
  );
}

export default homeCronService;
