import { transferCurrency } from "../../services/currency-transfer-command.js";
import { withUserTransaction } from "../../services/transaction-service.js";
import { Composer } from "telegraf";
import { getMineInfo } from "./mine-service.js";
import { separateNumber } from "../../utils/helpers.js";

const mineRouter = new Composer();

mineRouter.hears(/^курс$/i, async (ctx) => {
  const mineInfo = await getMineInfo();
  const user = ctx.state.user;
  const price = mineInfo.currency || 0;
  const bankBuyPrice = Math.trunc(price * 0.95);

  await ctx.replyWithHTML(
    `В банке доступно: <b>${separateNumber(
      mineInfo.coin
    )} ₿</b>\nУ тебя есть: <b>${separateNumber(
      user.coin
    )} ₿</b>\n\nБанк продает по курсу: 1 ₿ = <b>${separateNumber(
      price
    )} Стар</b>\nБанк покупает по курсу: 1 ₿ = <b>${separateNumber(
      bankBuyPrice
    )} Стар</b>\n\n📖Крипта купить [кол-во]\n📖Крипта продать [кол-во]\n📖Крипта передать [кол-во или всё]\n📖Передать крипта [кол-во или всё]`
  );
});

mineRouter.hears(/^крипта купить.*$/i, async (ctx) => {
  const amountText = ctx.message.text.split(" ")[2];
  const amount = Number(amountText);

  if (!Number.isSafeInteger(amount) || amount <= 0) {
    return ctx.reply("❌ Укажи корректное количество BTC для покупки");
  }

  const result = await withUserTransaction(ctx.state.user, async (user, transaction) => {
    const mineInfo = await getMineInfo();
    await mineInfo.reload({ transaction, lock: transaction.LOCK.UPDATE });
    const price = Number(mineInfo.currency);
    if (!Number.isSafeInteger(price) || price <= 0) return { error: "Курс временно недоступен" };
    const totalCost = Math.floor(amount * price);

    if (user.balance < totalCost) {
    return { error: "Недостаточно старок😢" };
    }

    if (mineInfo.coin < amount) {
    return { error: "❌ В банке недостаточно BTC" };
    }

    user.balance -= totalCost;
    user.coin += amount;
    mineInfo.coin -= amount;

    await user.save();
    await mineInfo.save();
    return { total: totalCost };
  });
  if (result.error) return ctx.reply(result.error);
  const totalCost = result.total;

  await ctx.replyWithHTML(
    `✅ Ты купил <b>${amount} BTC</b> за <b>${separateNumber(
      totalCost
    )} Стар</b>.`
  );
});

mineRouter.hears(/^крипта продать.*$/i, async (ctx) => {
  const amountText = ctx.message.text.split(" ")[2];
  const amount = Number(amountText);

  if (!Number.isSafeInteger(amount) || amount <= 0) {
    return ctx.reply("❌ Укажи корректное количество BTC");
  }

  const result = await withUserTransaction(ctx.state.user, async (user, transaction) => {
    const mineInfo = await getMineInfo();
    await mineInfo.reload({ transaction, lock: transaction.LOCK.UPDATE });
    const price = Number(mineInfo.currency);
    if (!Number.isSafeInteger(price) || price <= 0) return { error: "Курс временно недоступен" };
    const bankBuyPrice = Math.trunc(price * 0.95);
    const totalReceive = Math.floor(amount * bankBuyPrice);

    if (user.coin < amount) {
    return { error: "Недостаточно BTC😢" };
    }

    user.coin -= amount;
    user.balance += totalReceive;
    mineInfo.coin += amount;

    await user.save();
    await mineInfo.save();
    return { total: totalReceive };
  });
  if (result.error) return ctx.reply(result.error);
  const totalReceive = result.total;

  await ctx.replyWithHTML(
    `✅ Ты продал <b>${amount} BTC</b> и получил <b>${separateNumber(
      totalReceive
    )} Стар</b>.`
  );
});

mineRouter.hears(/^(?:передать\s+крипт[ау]|крипта\s+передать)(?:\s|$)/i, (ctx) => transferCurrency(ctx, "coin"));

export default mineRouter;
