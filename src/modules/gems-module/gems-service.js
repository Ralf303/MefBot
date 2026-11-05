import { transferCurrency } from "../../services/currency-transfer-command.js";
import sequelize from "sequelize";
import { CronJob } from "cron";
import { User, Item } from "../../db/models.js";
import { getRandomInt } from "../../utils/helpers.js";
import { checkItem } from "../items-module/items-utils/item-tool-service.js";
import economyService from "../../services/economy-service.js";

class GemService {
  giveGems(ctx) {
    return transferCurrency(ctx, "gems");
  }

  async giveAllGems() {
    new CronJob(
      "2 0 * * * *",
      async function addGems() {
        try {
          await User.update(
            { gems: sequelize.literal("`gems` + 1") },
            { where: {} }
          );

          // await User.update(
          //   { snows: sequelize.literal("`snows` + 1") },
          //   { where: {} }
          // );

          const usersWithSuperPickaxe = await Item.findAll({
            where: {
              itemName: "Супер Кирка",
              isWorn: true,
            },
            attributes: ["userId"],
          });

          const userIds = usersWithSuperPickaxe.map((item) => item.userId);

          await User.update(
            { gems: sequelize.literal("`gems` + 1") },
            { where: { id: userIds } }
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

  async sintez(user, amount) {
    try {
      if (user.gems < amount) {
        return "Недостаточно гемов🥲";
      }

      const hasPups = await checkItem(user.id, "Пупс «Наука»");

      if (hasPups) {
        const mef = amount * getRandomInt(100, 500);

        await economyService.exchange({
          user,
          spendCurrency: "gems",
          receiveCurrency: "balance",
          spendAmount: amount,
          receiveAmount: mef,
        });

        return `Ты успешно синтезировал(а) ${amount} гемов в ${mef} старок🧪`;
      } else return "У тебя нет пупса науки🥲";
    } catch (error) {
      console.log(error);
      return "Ошибка при выполнении операции.", error;
    }
  }
}

export default new GemService();
