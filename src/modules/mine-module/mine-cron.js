import { CronJob } from "cron";
import { getMineInfo } from "./mine-service.js";
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
}

export default new MineService();
