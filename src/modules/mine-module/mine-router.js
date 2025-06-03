import { Composer } from "telegraf";

const mineRouter = new Composer();

mineRouter.hears(/^майнинг$/i, async (ctx) => {
  await ctx.reply("Майнинг");
});

export default mineRouter;
