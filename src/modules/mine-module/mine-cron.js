import { CronJob } from "cron";
import {
  getMineInfo,
  increaseCardBalances,
  updateFreezeBalances,
} from "./mine-service.js";
import axios from "axios";

class MineService {
  async mineCron() {
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
  }

  async updateShop() {
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
  }

  async updateCardBalances() {
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
  }

  async updateFreezeBalances() {
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
  }
}

export default new MineService();
