import { withUserTransaction } from "../../services/transaction-service.js";
import economyService from "../../services/economy-service.js";
import { grantItem } from "../../services/reward-service.js";
import { Family } from "../../db/models.js";
import { Composer } from "telegraf";
import { getRandomInt } from "../../utils/helpers.js";
import {
  checkItem,
  createItem,
} from "../items-module/items-utils/item-tool-service.js";
import redisService from "../../services/redis-service.js";
import { getFamilyByUserId } from "../fam-module/fam-service.js";

const capchaRouter = new Composer();

capchaRouter.hears(/^\d{6}$/, async (ctx, next) => {
  try {
    const capcha = ctx.match;
    if (await redisService.consumeCaptcha(String(capcha), ctx.chat.id)) {

      let randommef = getRandomInt(500, 1000);

      const hasCalculator = await checkItem(ctx.state.user.id, "Калькулятор");

      if (hasCalculator) {
        randommef *= 3;
      }
      await withUserTransaction(ctx.state.user, async (user, transaction) => {
        user.captureCounter++;
        await user.save({ transaction });
      });

      if (ctx.state.user.captureCounter === 500) {
        const item = await grantItem(ctx.state.user, 57);
        await item.save();
        await ctx.reply(
          `‼️ВНИМАНИЕ‼️\n\n❗️<a href="tg://user?id=${ctx.state.user.chatId}">${ctx.state.user.firstname}</a> ввел 500 капчей и получает редкий предмет "калькулятор[${item.id}]"`,
          { parse_mode: "HTML" }
        );
      }

      const fam = await getFamilyByUserId(ctx.from.id);

      if (fam) {
        await Family.increment({ reputation: fam.check ? 60 : 30 }, { where: { id: fam.id } });
        randommef += fam.Baf.capcha * 200;

      }

      await economyService.add({ user: ctx.state.user, currency: "balance", amount: randommef });

      await ctx.reply("Верно, ты получил " + randommef + " старок", {
        reply_to_message_id: ctx.message.message_id,
      });
    }

    return next();
  } catch (e) {
    await ctx.reply("Какая то ошибка, " + e);
  }
});

export default capchaRouter;
