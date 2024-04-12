const { syncUserCaseToDb } = require("../db/functions");
const { User } = require("../db/models");
const { adminList } = require("../modules/admin-module/admins");

const CronJob = require("cron").CronJob;
require("dotenv").config({
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

module.exports = { cronService };
