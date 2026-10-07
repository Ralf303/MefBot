import economyService from "../../services/economy-service.js";
import { Family } from "../../db/models.js";
import { getUser } from "../../db/functions.js";
import { getItemsLvl } from "../items-module/items-utils/items-functions.js";
import {
  getCheckFamily,
  getRang,
  getFamUsers,
  getTopFams,
  flushReputation,
} from "./fam-service.js";
import dotenv from "dotenv";
dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});
import { CronJob } from "cron";

function famCron(bot) {
  new CronJob(
    "1 15 */3 * * *",
    async function () {
      try {
        const fams = await getCheckFamily();
        if (!fams) return;

        let itemsLvl = 0;
        for (const fam of fams) {
          const famUsers = await getFamUsers(fam.id);
          if (!famUsers) return;
          for (const user of famUsers) {
            const realUser = await getUser(user.userId);
            const rang = await getRang(user.userId, fam.id);
            const itemLvl = await getItemsLvl(realUser.id);

            if (fam.check) {
              if (rang > 0) await economyService.add({ user: realUser, currency: "famMoney", amount: rang });
              itemsLvl += itemLvl * 2;
            } else {
              itemsLvl += itemLvl;
            }


          }

          await Family.increment({ reputation: itemsLvl }, { where: { id: fam.id } });
          itemsLvl = 0;
        }
      } catch (error) {
        console.log(error);
      }
    },
    null,
    true,
    "Europe/Moscow"
  );

  new CronJob(
    "0 45 15 1 * *",
    async function () {
      try {
        const [fam1, fam2, fam3] = await getTopFams(3);
        let message = "🏆БИТВА СЕМЕЙ ЗАКОНЧЕНА🏆\n\n";
        await flushReputation();
        if (fam1) {
          await Family.increment({ balance: fam1.fullSlots * 200 }, { where: { id: fam1.id } });

          const famUsers = await getFamUsers(fam1.id);
          if (!famUsers) return;

          for (const user of famUsers) {
            const realUser = await getUser(user.userId);
            const rang = await getRang(user.userId, fam1.id);
            const itemLvl = await getItemsLvl(realUser.id);

            const amount = rang * itemLvl * 15;
            if (amount > 0) await economyService.add({ user: realUser, currency: "famMoney", amount });

          }

          message += `• Семья «${fam1.name}» получает ${
            fam1.fullSlots * 200
          } семейных монет\n\n`;

        }

        if (fam2) {
          await Family.increment({ balance: fam2.fullSlots * 150 }, { where: { id: fam2.id } });

          const famUsers = await getFamUsers(fam2.id);
          if (!famUsers) return;

          for (const user of famUsers) {
            const realUser = await getUser(user.userId);
            const rang = await getRang(user.userId, fam2.id);
            const itemLvl = await getItemsLvl(realUser.id);

            const amount = rang * itemLvl * 10;
            if (amount > 0) await economyService.add({ user: realUser, currency: "famMoney", amount });

          }

          message += `• Семья «${fam2.name}» получает ${
            fam2.fullSlots * 150
          } семейных монет\n\n`;

        }

        if (fam3) {
          await Family.increment({ balance: fam3.fullSlots * 100 }, { where: { id: fam3.id } });

          const famUsers = await getFamUsers(fam3.id);
          if (!famUsers) return;

          for (const user of famUsers) {
            const realUser = await getUser(user.userId);
            const rang = await getRang(user.userId, fam3.id);
            const itemLvl = await getItemsLvl(realUser.id);
            const amount = rang * itemLvl * 5;
            if (amount > 0) await economyService.add({ user: realUser, currency: "famMoney", amount });

          }

          message += `• Семья «${fam3.name}» получает ${
            fam3.fullSlots * 100
          } семейных монет\n\n`;

        }

        message +=
          "\n\n\nТак же все участники топ 3 семей получили на свой баланс монеты";
        await bot.telegram.sendMessage(process.env.CHAT_ID, message);
      } catch (error) {
        console.log(error);
      }
    },
    null,
    true,
    "Europe/Moscow"
  );
}

export default famCron;
