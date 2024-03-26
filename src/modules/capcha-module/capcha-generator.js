const CronJob = require("cron").CronJob;

const { getVipChats } = require("../../db/functions");
const redisServise = require("../../services/redis-servise");
const { sleep, generateCapcha } = require("../../utils/helpers");

async function captureGenerator(bot) {
  new CronJob(
    "0 5 */2 * * *",
    async function () {
      const vipChats = await getVipChats();
      for (const chatId of vipChats) {
        try {
          const capture = generateCapcha();
          await bot.telegram.sendMessage(chatId.chatId, "МефКапча " + capture);
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
module.exports = captureGenerator;
