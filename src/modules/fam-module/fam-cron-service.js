const { getUser } = require("../../db/functions");
const { getItemsLvl } = require("../items-module/items-utils/items-functions");
const {
  getCheckFamily,
  getRang,
  getFamUsers,
  getTopFams,
} = require("./fam-service");
require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});
const CronJob = require("cron").CronJob;

function famCron(bot) {
  new CronJob(
    "* 15 */3 * * *",
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
              realUser.famMoney += rang;
              itemsLvl += itemLvl * 2;
            } else {
              itemsLvl += itemLvl;
            }

            await realUser.save();
          }

          fam.reputation += itemsLvl;
          fam.save();
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
    "0 13 15 1 * *",
    async function () {
      const [fam1, fam2, fam3] = await getTopFams(3);
      let message = "🏆БИТВА СЕМЕЙ ЗАКОНЧЕНА🏆\n\n";
      await flushReputation();
      if (fam1) {
        fam1.balance += fam1.fullSlots * 200;

        const famUsers = await getFamUsers(fam1.id);
        if (!famUsers) return;

        for (const user of famUsers) {
          const realUser = await getUser(user.userId);
          const rang = await getRang(user.userId, fam1.id);
          const itemLvl = await getItemsLvl(realUser.id);

          realUser.famMoney += rang * 15 + itemLvl;
          await realUser.save();
        }

        message += `• Семья «${fam1.name}» получает ${
          fam1.fullSlots * 200
        } семейных монет\n\n`;
        fam1.save();
      }

      if (fam2) {
        fam2.balance += fam2.fullSlots * 150;

        const famUsers = await getFamUsers(fam2.id);
        if (!famUsers) return;

        for (const user of famUsers) {
          const realUser = await getUser(user.userId);
          const rang = await getRang(user.userId, fam2.id);
          const itemLvl = await getItemsLvl(realUser.id);

          realUser.famMoney += rang * 10 + itemLvl;
          await realUser.save();
        }

        message += `• Семья «${fam2.name}» получает ${
          fam2.fullSlots * 150
        } семейных монет\n\n`;
        fam2.save();
      }

      if (fam3) {
        fam3.balance += fam3.fullSlots * 100;

        const famUsers = await getFamUsers(fam3.id);
        if (!famUsers) return;

        for (const user of famUsers) {
          const realUser = await getUser(user.userId);
          const rang = await getRang(user.userId, fam3.id);
          const itemLvl = await getItemsLvl(realUser.id);
          realUser.famMoney += rang * 5 + itemLvl;
          await realUser.save();
        }

        message += `• Семья «${fam3.name}» получает ${
          fam3.fullSlots * 100
        } семейных монет\n\n`;
        fam3.save();
      }

      message +=
        "\n\n\nТак же все участники топ 3 семей получили на свой баланс монеты";
      await bot.telegram.sendMessage(process.env.CHAT_ID, message);
    },
    null,
    true,
    "Europe/Moscow"
  );
}

module.exports = famCron;
