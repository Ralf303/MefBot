const CronJob = require("cron").CronJob;
require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});

const { getVipChats, updateChatTime } = require("../../db/functions.js");
const { Chat } = require("../../db/models.js");
const { sleep } = require("../../utils/helpers.js");

function vipCron(bot) {
  new CronJob(
    "15 16 16 * * *",
    async function () {
      const chats = await getVipChats();
      for (const chat of chats) {
        try {
          if (chat.vipTime === 0) {
            chat.vip = false;
            await chat.save();
            await bot.telegram.sendMessage(
              chat.chatId,
              "Беседа больше не является вип чатом, что купить введи «Купить випчат»"
            );
            await sleep(500);
          }
        } catch (error) {
          continue;
        }
      }
      await updateChatTime();
    },
    null,
    true,
    "Europe/Moscow"
  );

  new CronJob(
    "15 16 16 */5 * *",
    async function () {
      try {
        await Chat.update({ chatLink: "none" });
      } catch (error) {
        console.log(error);
      }
    },
    null,
    true,
    "Europe/Moscow"
  );
}

module.exports = { vipCron };
