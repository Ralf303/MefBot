const { Composer } = require("telegraf");

const mineRouter = new Composer();

mineRouter.hears(/^майнинг$/i, async (ctx) => {
  await ctx.reply("Майнинг");
});

module.exports = mineRouter;
