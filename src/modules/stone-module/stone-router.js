import { transferCurrency } from "../../services/currency-transfer-command.js";
import { Composer } from "telegraf";
import { separateNumber } from "../../utils/helpers.js";
import { upgradeItem } from "./stone-service.js";
import economyService from "../../services/economy-service.js";

const stoneRouter = new Composer();

stoneRouter.hears(/^карман/i, async (ctx, next) => {
  try {
    await ctx.reply(
      `Ключи: ${separateNumber(
        ctx.state.user.chests
      )}\nТочильные камни: ${separateNumber(ctx.state.user.stones)}
      \nОхлажадающие жидкости: ${separateNumber(
        ctx.state.user.freeze
      )}\nСмазки для видеокарты: ${separateNumber(ctx.state.user.oil)}`
    );

    return next();
  } catch (error) {
    console.log(error);
  }
});

stoneRouter.hears(/^улучшить вещь.*$/i, async (ctx, next) => {
  try {
    const itemId = ctx.message.text.split(" ")[2];

    if (!itemId) {
      await ctx.reply("Укажи id предмета");
      return;
    }

    const result = await upgradeItem(ctx.state.user, itemId);
    await ctx.reply(result);
    return next();
  } catch (error) {
    console.log(error);
  }
});

stoneRouter.hears(/^передать\s+камни(?:\s|$)/i, (ctx) => transferCurrency(ctx, "stones"));

stoneRouter.hears(/^купить камни.*$/i, async (ctx, next) => {
  try {
    let count = parseInt(ctx.message.text.split(" ")[2]);

    if (isNaN(count) || count <= 0) {
      count = 1;
    }

    if (ctx.state.user.famMoney < count * 50) {
      await ctx.reply("Недостаточно семейных монет 😢");
      return;
    }

    await economyService.exchange({
      user: ctx.state.user,
      spendCurrency: "famMoney",
      receiveCurrency: "stones",
      spendAmount: count * 50,
      receiveAmount: count,
    });
    await ctx.reply(
      `Ты успешно купил(а) ${count} точильных камней за ${
        count * 50
      } семейных монет`
    );
    return next();
  } catch (error) {
    console.log(error);
  }
});

export default stoneRouter;
