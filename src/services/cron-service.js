import { migrateLegacyCaseCache } from "../db/functions.js";
import { adminList } from "../modules/admin-module/admins.js";
import { CronJob } from "cron";
function cronService(bot) {
  new CronJob("1 1 5 * * *", async () => {
    try {
      await migrateLegacyCaseCache();
      await bot.telegram.sendMessage(adminList[0], "Синхронизация кейсов завершена 🫡");
    } catch (error) {
      console.error("Case cache migration failed:", error);
    }
  }, null, true, "Europe/Moscow");
}
export { cronService };
