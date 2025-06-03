import { syncUserCaseToDb } from "../db/functions.js";
import { User } from "../db/models.js";
import { adminList } from "../modules/admin-module/admins.js";
import { CronJob } from "cron";
import dotenv from "dotenv";
dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});

function cronService(bot) {
  new CronJob(
    "1 1 5 * * *",
    async function () {
      const users = await User.findAll();
      for (let user of users) {
        try {
          await syncUserCaseToDb(user.id);
        } catch (error) {
          console.log(error);
        }
      }
      await bot.telegram.sendMessage(
        adminList[0],
        `Рестарт произошел успешно🫡`
      );
    },
    null,
    true,
    "Europe/Moscow"
  );
}

export { cronService };
