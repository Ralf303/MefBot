import { CronJob } from "cron";
import dotenv from "dotenv";
dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});
import { getVipChats, updateChatTime } from "../../db/functions.js";
import { Chat } from "../../db/models.js";
import { sleep } from "../../utils/helpers.js";

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

export { vipCron };
