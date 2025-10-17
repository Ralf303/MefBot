import { CronJob } from "cron";
import {
  getMineInfo,
  increaseCardBalances,
  updateFreezeBalances,
} from "./mine-service.js";
import axios from "axios";
import { Item, User } from "../../db/models.js";
import { getRandomInt, sleep } from "../../utils/helpers.js";
import {
  checkItem,
  createItem,
} from "../items-module/items-utils/item-tool-service.js";

class MineService {
  async mineCron(bot) {
    new CronJob(
      "2 */5 * * * *",
      async () => {
        try {
          const mineInfo = await getMineInfo();
          const cryptPrice = await axios.get(
            "https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD"
          );

          const { USD } = cryptPrice.data;
          const price = Math.trunc(USD);
          mineInfo.currency = price;
          await mineInfo.save();
        } catch (error) {
          console.error("Error updating mine info:", error);
        }
      },
      null,
      true,
      "Europe/Moscow"
    );

    new CronJob(
      "* 5 * * *",
      async () => {
        try {
          const mineInfo = await getMineInfo();

          if (mineInfo.cards < 100) {
            mineInfo.cards += 1;
          }

          if (mineInfo.freeze < 100) {
            mineInfo.freeze += 1;
          }

          await mineInfo.save();
        } catch (error) {
          console.error("Error updating mine info:", error);
        }
      },
      null,
      true,
      "Europe/Moscow"
    );

    new CronJob(
      "0 0 1 * * *",
      async () => {
        try {
          await increaseCardBalances();
        } catch (error) {
          console.error("Error updating card balances:", error);
        }
      },
      null,
      true,
      "Europe/Moscow"
    );

    new CronJob(
      "0 17 * * * *",
      async () => {
        try {
          await updateFreezeBalances();
        } catch (error) {
          console.error("Error updating freeze balances:", error);
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
              const hasPup = await checkItem(user.id, "Пупс «Ремонт»");
              let randomAmount = getRandomInt(1, 3);

              if (hasPup) {
                randomAmount += 2;
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

              user.coin += randomAmount;
              await user.save();
              const message = `Я намайнил ${randomAmount} ₿🤑`;
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
  }
}

export default new MineService();
