import { transferCurrency } from "../../services/currency-transfer-command.js";
import { Composer } from "telegraf";
import economyService from "../../services/economy-service.js";

const oilRouter = new Composer();

oilRouter.hears(/^передать\s+смазки(?:\s|$)/i, (ctx) => transferCurrency(ctx, "oil"));

oilRouter.hears(/^купить смазки.*$/i, async (ctx, next) => {
  try {
    let count = parseInt(ctx.message.text.split(" ")[2]);

    if (isNaN(count) || count <= 0) {
      count = 1;
    }

    if (ctx.state.user.famMoney < count * 200) {
      await ctx.reply("Недостаточно семейных монет 😢");
      return;
    }

    await economyService.exchange({
      user: ctx.state.user,
      spendCurrency: "famMoney",
      receiveCurrency: "oil",
      spendAmount: count * 200,
      receiveAmount: count,
    });
    await ctx.reply(
      `Ты успешно купил(а) ${count} смазок для видеокарт за ${
        count * 200
      } семейных монет`
    );
    return next();
  } catch (error) {
    console.log(error);
  }
});

export default oilRouter;
