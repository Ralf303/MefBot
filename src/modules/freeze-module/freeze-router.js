import { withUserTransaction } from "../../services/transaction-service.js";
import { Composer } from "telegraf";
import { resolveReceiver, separateNumber } from "../../utils/helpers.js";
import { getUser } from "../../db/functions.js";
import { getMineInfo } from "../mine-module/mine-service.js";
import economyService from "../../services/economy-service.js";

const freezeRouter = new Composer();

freezeRouter.hears(/^передать жидкости.*$/i, async (ctx, next) => {
  const chatId = ctx.from.id;
  const textParts = ctx.message.text.split(" ");
  const amount = parseInt(textParts[2]);

  if (isNaN(amount) || amount <= 0) {
    return;
  }

  let receiver,
    viaUsername = false;

  try {
    const resolved = await resolveReceiver(ctx);
    receiver = resolved.receiver;
    viaUsername = resolved.transferredViaUsername;
  } catch (err) {
    switch (err.message) {
      case "BOT_REJECT":
        return ctx.reply("Зачем боту охлаждаюющие жидкости🧐");
      case "NO_TARGET":
        return ctx.reply("Сделай реплай или укажи @username.");
      case "NOT_FOUND":
        return ctx.reply("Пользователь с таким username не найден.");
      case "SELF_TRANSFER":
        return ctx.reply("Иди нахуй, так нельзя🖕");
      default:
        console.error("resolveReceiver error:", err);
        return ctx.reply("Не удалось определить получателя.");
    }
  }

  try {
    const sender = ctx.state.user || (await getUser(chatId));

    if (sender.freeze < amount) {
      return ctx.reply("Недостаточно охлаждающих жидкостей🥲");
    }

    await economyService.transfer({
      sender,
      receiver,
      currency: "freeze",
      amount,
    });

    await ctx.reply(
      `Ты успешно передал(а) ${separateNumber(amount)} охлаждающих жидкостей ${
        receiver.firstname
      }`
    );

    if (viaUsername) {
      try {
        await ctx.telegram.sendMessage(
          receiver.chatId,
          `Тебе передали ${separateNumber(amount)} смазок для видеокарт от ${
            ctx.from.first_name
          }`
        );
      } catch (e) {
        console.log("Не удалось отправить личное сообщение:", e.message);
      }
    }

    return next();
  } catch (error) {
    console.error("Ошибка передачи камней:", error);
    return ctx.reply("Ошибка при выполнении операции.");
  }
});

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
