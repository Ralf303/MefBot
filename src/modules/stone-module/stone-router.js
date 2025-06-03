import { Composer } from "telegraf";
import { separateNumber } from "../../utils/helpers.js";
import { upgradeItem } from "./stone-service.js";
import { getUser } from "../../db/functions.js";

const stoneRouter = new Composer();

stoneRouter.hears(/^карман/i, async (ctx, next) => {
  try {
    await ctx.reply(
      `Ключи: ${separateNumber(
        ctx.state.user.chests
      )}\nТочильные камни: ${separateNumber(ctx.state.user.stones)}`
      // \nОхлажадающие жидкости: ${separateNumber(
      //   ctx.state.user.freeze
      // )}\nСмазки для видеокарты: ${separateNumber(ctx.state.user.oil)}
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
  const message = ctx.message.reply_to_message;

  if (!message) {
    return;
  }

  const receiverChatId = message.from.id;
  const amount = parseInt(ctx.message.text.split(" ")[2]);

  if (isNaN(amount) || amount <= 0) {
    return;
  }

  if (message.from.is_bot) {
    await ctx.reply("Зачем боту точильные камни🧐");
    return;
  }

  try {
    const sender = await getUser(chatId);
    const receiver = await getUser(receiverChatId);

    if (sender.stones < amount) {
      await ctx.reply("Недостаточно точильных камней🥲");
      return;
    }

    if (sender.id === receiver.id) {
      await ctx.reply(`Иди нахуй, так нельзя🖕`);
      return;
    }

    sender.stones -= amount;
    receiver.stones += amount;
    await sender.save();
    await receiver.save();
    await ctx.reply(
      `Ты успешно передал(а) ${amount} точильных камней ${message.from.first_name}`
    );
    return next();
  } catch (error) {
    console.log(error);
    await ctx.reply("Ошибка при выполнении операции.");
  }
});

stoneRouter.hears(/^купить камни.*$/i, async (ctx, next) => {
  try {
    let count = parseInt(ctx.message.text.split(" ")[2]);

    if (isNaN(count) || count <= 0) {
      count = 1;
    }

    if (ctx.state.user.famMoney < count * 100) {
      await ctx.reply("Недостаточно семейных монет 😢");
      return;
    }

    ctx.state.user.famMoney -= count * 100;
    ctx.state.user.stones += count;
    await ctx.reply(
      `Ты успешно купил(а) ${count} точильных камней за ${
        count * 100
      } семейных монет`
    );
    return next();
  } catch (error) {
    console.log(error);
  }
});

export default stoneRouter;
