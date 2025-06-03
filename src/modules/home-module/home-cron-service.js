import { CronJob } from "cron";
import { Op } from "sequelize";
import { Home } from "../../db/models.js";

async function homeCronService() {
  new CronJob(
    "0 0 * * * *",
    async function () {
      try {
        const homes = await Home.findAll({
          where: {
            userId: {
              [Op.ne]: null,
            },
          },
        });

        homes.forEach(async (home) => {
          if (home.tax + 500 >= 36000) {
            home.userId = null;
            home.tax = 0;
            home.energy = 0;
            await home.save();
          } else {
            home.tax += 500;
            if (home.energy != 10000) {
              home.energy += 100;
            }
            await home.save();
          }
        });
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
