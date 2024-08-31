const { Composer } = require("telegraf");
require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});

const { getRandomInt } = require("../../utils/helpers.js");
const { getUser } = require("../../db/functions.js");
const { resiveLog } = require("../logs-module/globalLogs.js");
const {
  checkItem,
  createItem,
} = require("../items-module/items-utils/item-tool-service.js");
const redisServise = require("../../services/redis-servise.js");
const { getFamilyByUserId } = require("../fam-module/fam-service.js");

const capchaRouter = new Composer();

capchaRouter.hears(/^(\d{6})$/, async (ctx, next) => {
  try {
    const capcha = ctx.match[1];
    const isCapchaInRedis = await redisServise.get(capcha);
    if (isCapchaInRedis == ctx.chat.id) {
      await redisServise.delete(capcha);

      let randommef = getRandomInt(500, 1000);

      const hasCalculator = await checkItem(ctx.state.user.id, "Калькулятор");

      if (hasCalculator) {
        randommef *= 3;
      }
      ctx.state.user.captureCounter += 1;

      if (ctx.state.user.captureCounter === 500) {
        const item = await createItem(57);

        ctx.state.user.fullSlots++;
        await ctx.state.user.addItem(item);
        await item.save();
        await ctx.reply(
          `‼️ВНИМАНИЕ‼️\n\n❗️<a href="tg://user?id=${ctx.state.user.chatId}">${ctx.state.user.firstname}</a> ввел 500 капчей и получает редкий предмет "калькулятор[${item.id}]"`,
          { parse_mode: "HTML" }
        );
      }

      const fam = await getFamilyByUserId(ctx.from.id);

      if (fam) {
        if (fam.check) {
          fam.reputation += 60;
        } else {
          fam.reputation += 30;
        }
        randommef += fam.Baf.capcha * 200;
        await fam.save();
      }

      ctx.state.user.balance += randommef;

      await ctx.reply("Верно, ты получил " + randommef + " мефа", {
        reply_to_message_id: ctx.message.message_id,
      });

      await resiveLog(ctx.state.user, "меф", `${randommef}`, "ввод капчи");
    }
    return next();
  } catch (e) {
    await ctx.reply("Какая то ошибка, " + e);
  }
});

module.exports = capchaRouter;
