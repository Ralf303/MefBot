import { transferCurrency } from "../../services/currency-transfer-command.js";
import sequelize from "sequelize";
import { CronJob } from "cron";
import { User } from "../../db/models.js";

class KeyService {
  giveKeys(ctx) {
    return transferCurrency(ctx, "chests");
  }

  async giveAllKeys() {
    new CronJob(
      "1 0 5 * * *",
      async function addKeys() {
        try {
          await User.update(
            { chests: sequelize.literal("`chests` + 1") },
            { where: {} }
          );
        } catch (error) {
          console.log(error);
        }
      },

      null,
      true,
      "Europe/Moscow"
    );
  }
}

export default new KeyService();
