import { Composer } from "telegraf";
import { resolveReceiver, separateNumber } from "../../utils/helpers.js";
import { upgradeItem } from "./stone-service.js";
import { getUser } from "../../db/functions.js";
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

stoneRouter.hears(/^передать камни.*$/i, async (ctx, next) => {
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
        return ctx.reply("Зачем боту точильные камни🧐");
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

    if (sender.stones < amount) {
      return ctx.reply("Недостаточно точильных камней🥲");
    }

    await economyService.transfer({
      sender,
      receiver,
      currency: "stones",
      amount,
    });

    await ctx.reply(
      `Ты успешно передал(а) ${separateNumber(amount)} точильных камней ${
        receiver.firstname
      }`
    );

    if (viaUsername) {
      try {
        await ctx.telegram.sendMessage(
          receiver.chatId,
          `Тебе передали ${separateNumber(amount)} точильных камней от ${
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
