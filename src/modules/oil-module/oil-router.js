import { Composer } from "telegraf";
import { resolveReceiver, separateNumber } from "../../utils/helpers.js";
import { getUser } from "../../db/functions.js";

const oilRouter = new Composer();

oilRouter.hears(/^передать смазки.*$/i, async (ctx, next) => {
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
        return ctx.reply("Зачем боту смазки для видеокарт🧐");
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

    if (sender.oil < amount) {
      return ctx.reply("Недостаточно смазок для видеокарт🥲");
    }

    sender.oil -= amount;
    receiver.oil += amount;
    await sender.save();
    await receiver.save();

    await ctx.reply(
      `Ты успешно передал(а) ${separateNumber(amount)} смазок для видеокарт ${
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

    ctx.state.user.famMoney -= count * 200;
    ctx.state.user.oil += count;
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
