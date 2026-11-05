import { transferCurrency } from "../../services/currency-transfer-command.js";
import { withUserTransaction } from "../../services/transaction-service.js";
import { Composer } from "telegraf";
import { getMineInfo } from "../mine-module/mine-service.js";

const freezeRouter = new Composer();

freezeRouter.hears(/^передать\s+жидкости(?:\s|$)/i, (ctx) => transferCurrency(ctx, "freeze"));

freezeRouter.hears(/^купить жидкости.*$/i, async (ctx, next) => {
  try {
    let count = parseInt(ctx.message.text.split(" ")[2]);

    if (isNaN(count) || count <= 0) {
      count = 1;
    }

    const totalPrice = count * 250;
    const mineShop = await getMineInfo();

    if (mineShop.freeze < count) {
      return ctx.reply("Охлаждающие жидкости закончились🥲");
    }

    if (ctx.state.user.gems < totalPrice) {
      await ctx.reply("Недостаточно гемов 😢");
      return;
    }

    await withUserTransaction(ctx.state.user, async (lockedUser, transaction) => {
      const lockedMineShop = await mineShop.reload({
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (lockedMineShop.freeze < count) {
        throw new Error("FREEZE_SOLD_OUT");
      }

      if (lockedUser.gems < totalPrice) {
        throw new Error("NOT_ENOUGH_GEMS");
      }

      lockedMineShop.freeze -= count;
      lockedUser.gems -= totalPrice;
      lockedUser.freeze += count;

      await lockedMineShop.save({ transaction });
      await lockedUser.save({ transaction });


    });
    await ctx.reply(
      `Ты успешно купил(а) ${count} охлаждающих жидкостей за ${
        count * 250
      } гемов`
    );
    return next();
  } catch (error) {
    if (error.message === "FREEZE_SOLD_OUT") {
      return ctx.reply("Охлаждающие жидкости закончились🥲");
    }
    if (error.message === "NOT_ENOUGH_GEMS") {
      return ctx.reply("Недостаточно гемов 😢");
    }
    console.log(error);
  }
});

export default freezeRouter;
