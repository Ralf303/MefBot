import { CronJob } from "cron";
import { getVipChats } from "../../db/functions.js";
import redisServise from "../../services/redis-servise.js";
import { sleep, generateCapcha } from "../../utils/helpers.js";

async function captureGenerator(bot) {
  new CronJob(
    "0 5 */2 * * *",
    async function () {
      const vipChats = await getVipChats();
      for (const chatId of vipChats) {
        try {
          const capture = generateCapcha();
          await bot.telegram.sendMessage(chatId.chatId, "СтарКапча " + capture);
          await redisServise.set(capture, chatId.chatId);
          await sleep(100);
        } catch (error) {
          continue;
        }
      }
    },
    null,
    true,
    "Europe/Moscow"
  );
}
export default captureGenerator;
