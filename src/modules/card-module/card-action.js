import { Composer } from "telegraf";
import { Card } from "../../db/models.js";
import { getUser } from "../../db/functions.js";
import { separateNumber } from "../../utils/helpers.js";

const cardActions = new Composer();

cardActions.action(/^card_buy/, async (ctx) => {
  try {
    await ctx.deleteMessage();
    const [_, itemId, senderId, receiverId, price] =
      ctx.callbackQuery.data.split(" ");
    const receiver = await getUser(receiverId);
    const sender = await getUser(senderId);
    const item = await Card.findOne({
      where: {
        id: itemId,
        userId: sender.id,
      },
    });

    if (!item) {
      return await ctx.reply(`Юзер уже продал видеокарту и ее у него нет😥`);
    }

    if (receiver.balance < price) {
      return await ctx.reply(`У тебя недостаточно старок😥`);
    }

    receiver.balance -= Number(price);
    sender.balance += Number(price);
    item.userId = receiver.id;

    await sender.save();
    await receiver.save();
    await item.save();

    await ctx.reply(
      `Ты успешно купил(а) Видеокарту[${item.id}] за ${separateNumber(
        price
      )} старок`
    );

    await ctx.telegram.sendMessage(
      sender.chatId,
      `Ты успешно продал(а) Видеокарту[${item.id}] за ${separateNumber(
        price
      )} старок`,
      { parse_mode: "HTML" }
    );
  } catch (error) {
    console.log(error);
  }
});

export default cardActions;
