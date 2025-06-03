import { Composer } from "telegraf";
import { getUser } from "../../db/functions.js";
import { separateNumber } from "../../utils/helpers.js";
import { Keyboard, Key } from "telegram-keyboard";
import { getHomeByUserId } from "./home-service.js";

const homeActions = new Composer();

homeActions.action(/^homeSell/, async (ctx) => {
  try {
    await ctx.deleteMessage();
    const [_, senderId, receiverId, price] = ctx.callbackQuery.data.split(" ");
    const receiver = await getUser(receiverId);
    const sender = await getUser(senderId);

    const senderHome = await getHomeByUserId(sender.id);

    if (!senderHome) {
      return await ctx.reply(`Продавец уже продал дом 😥`);
    }

    const receiverHome = await getHomeByUserId(receiver.id);

    if (receiverHome) {
      return await ctx.reply(`У тебя и так уже есть дом, зачем тебе второй 🧐`);
    }

    if (receiver.balance < price) {
      return await ctx.reply(`У тебя недостаточно старок😥`);
    }

    receiver.balance -= Number(price);
    sender.balance += Number(price);

    senderHome.userId = receiver.id;

    await sender.save();
    await receiver.save();
    await senderHome.save();

    await ctx.reply(
      `Ты успешно купил(а) ${senderHome.name} за ${separateNumber(
        price
      )} старок`
    );
    await ctx.telegram.sendMessage(
      sender.chatId,
      `Ты успешно продал(а) ${senderHome.name} за ${separateNumber(
        price
      )} старок`,
      { parse_mode: "HTML" }
    );
  } catch (error) {
    console.log(error);
  }
});

homeActions.action("cancel", async (ctx) => {
  try {
    await ctx.deleteMessage();
    await ctx.reply("Сделка успешно отменена.");
  } catch (error) {
    console.log(error);
  }
});

export default homeActions;
