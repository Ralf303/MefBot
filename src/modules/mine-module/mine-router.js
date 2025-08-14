import { Composer } from "telegraf";
import { getMineInfo } from "./mine-service.js";
import { resolveReceiver, separateNumber } from "../../utils/helpers.js";
import { getUser } from "../../db/functions.js";

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
    )} Стар</b>\n\n📖Крипта купить [кол-во]\n📖Крипта продать [кол-во]\n📖Крипта передать [кол-во]`
  );
});

mineRouter.hears(/^крипта купить.*$/i, async (ctx) => {
  const amountText = ctx.message.text.split(" ")[2];
  const amount = Number(amountText);

  if (isNaN(amount) || amount <= 0) {
    return ctx.reply("❌ Укажи корректное количество BTC для покупки");
  }

  const user = ctx.state.user;
  const mineInfo = await getMineInfo();
  const price = mineInfo.currency || 0;
  const totalCost = Math.floor(amount * price);

  if (user.balance < totalCost) {
    return ctx.reply("Недостаточно старок😢");
  }

  if (mineInfo.coin < amount) {
    return ctx.reply("❌ В банке недостаточно BTC");
  }

  user.balance -= totalCost;
  user.coin += amount;
  mineInfo.coin -= amount;

  await user.save();
  await mineInfo.save();

  await ctx.replyWithHTML(
    `✅ Ты купил <b>${amount} BTC</b> за <b>${separateNumber(
      totalCost
    )} Стар</b>.`
  );
});

mineRouter.hears(/^крипта продать.*$/i, async (ctx) => {
  const amountText = ctx.message.text.split(" ")[2];
  const amount = Number(amountText);

  if (isNaN(amount) || amount <= 0) {
    return ctx.reply("❌ Укажи корректное количество BTC");
  }

  const user = ctx.state.user;
  const mineInfo = await getMineInfo();
  const price = mineInfo.currency || 0;
  const bankBuyPrice = Math.trunc(price * 0.95);
  const totalReceive = Math.floor(amount * bankBuyPrice);

  if (user.coin < amount) {
    return ctx.reply("Недостаточно BTC😢");
  }

  user.coin -= amount;
  user.balance += totalReceive;
  mineInfo.coin += amount;

  await user.save();
  await mineInfo.save();

  await ctx.replyWithHTML(
    `✅ Ты продал <b>${amount} BTC</b> и получил <b>${separateNumber(
      totalReceive
    )} Стар</b>.`
  );
});

mineRouter.hears(/^передать крипту.*$/i, async (ctx, next) => {
  const chatId = ctx.from.id;
  const textParts = ctx.message.text.split(" ");
  const amount = parseInt(textParts[2]);

  if (isNaN(amount) || amount <= 0) {
    return;
  }

  let receiver;
  let viaUsername = false;

  try {
    const resolved = await resolveReceiver(ctx);
    receiver = resolved.receiver;
    viaUsername = resolved.transferredViaUsername;
  } catch (err) {
    switch (err.message) {
      case "BOT_REJECT":
        return ctx.reply("Зачем боту BTC 🧐");
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
    const sender = await getUser(chatId);

    if (sender.coin < amount) {
      return ctx.reply("Недостаточно BTC 🥲");
    }

    sender.coin -= amount;
    receiver.coin += amount;
    await sender.save();
    await receiver.save();

    await ctx.reply(
      `Ты успешно передал(а) ${separateNumber(amount)} ₿ ` +
        `${receiver.firstname}`
    );

    if (viaUsername) {
      try {
        await ctx.telegram.sendMessage(
          receiver.chatId,
          `Тебе передали ${separateNumber(amount)} ₿ от ${ctx.from.first_name}`
        );
      } catch (e) {
        console.log("Не удалось отправить личное сообщение:", e.message);
      }
    }

    return next();
  } catch (error) {
    console.error("Ошибка передачи ₿:", error);
    return ctx.reply("Ошибка при выполнении операции.");
  }
});

export default mineRouter;
