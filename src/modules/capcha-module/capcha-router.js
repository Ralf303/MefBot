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

const capchaRouter = new Composer();

capchaRouter.hears(/^(\d{6})$/, async (ctx, next) => {
  try {
    const capcha = ctx.match[1];
    const isCapchaInRedis = await redisServise.get(capcha);
    if (isCapchaInRedis == ctx.chat.id) {
      await redisServise.delete(capcha);

      const user = await getUser(
        ctx.from.id,
        ctx.from.first_name,
        ctx.from.username
      );

      let randommef = getRandomInt(500, 1000);

      const hasCalculator = await checkItem(user.id, "Калькулятор");

      if (hasCalculator) {
        randommef *= 3;
      }
      user.captureCounter += 1;

      if (user.captureCounter === 500) {
        const item = await createItem(57);

        user.fullSlots++;
        await user.addItem(item);
        await item.save();
        await ctx.reply(
          `‼️ВНИМАНИЕ‼️\n\n❗️<a href="tg://user?id=${user.chatId}">${user.firstname}</a> ввел 500 капчей и получает редкий предмет "калькулятор[${item.id}]"`,
          { parse_mode: "HTML" }
        );
      }

      await resiveLog(user, "меф", `${randommef}`, "ввод капчи");
      user.balance += randommef;
      await ctx.reply("Верно, ты получил " + randommef + " мефа", {
        reply_to_message_id: ctx.message.message_id,
      });

      await user.save();
    }
    return next();
  } catch (e) {
    await ctx.reply("Какая то ошибка, " + e);
  }
});

module.exports = capchaRouter;
