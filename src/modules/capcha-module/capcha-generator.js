import { CronJob } from "cron";
import { getVipChats } from "../../db/functions.js";
import redisService from "../../services/redis-service.js";
import { sleep, generateCapcha } from "../../utils/helpers.js";

async function captureGenerator(bot) {
  new CronJob(
    "0 5 */2 * * *",
    async function () {
      const vipChats = await getVipChats();
      for (const chatId of vipChats) {
        try {
          const capture = generateCapcha();
          await redisService.set(capture, chatId.chatId);
          await sleep(200);
          await bot.telegram.sendMessage(chatId.chatId, "СтарКапча " + capture);
          await sleep(300);
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
