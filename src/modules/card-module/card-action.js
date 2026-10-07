import jwtService from "../../services/jwt-service.js";
import { purchaseAsset, tradeError } from "../../services/trade-service.js";
import { Composer } from "telegraf";
import { Card } from "../../db/models.js";
import { getUser } from "../../db/functions.js";
import { separateNumber } from "../../utils/helpers.js";

const cardActions = new Composer();

cardActions.action(/^(t_|card_buy )/, async (ctx, next) => {
  try {
    const offer = jwtService.verifyTradeToken(ctx.callbackQuery.data);
    if (offer.kind !== "card") return next();
    const { id: itemId, senderId, receiverId, price } = offer;
    if (Number(ctx.from.id) !== Number(receiverId)) return ctx.answerCbQuery("Это предложение адресовано другому пользователю");
    await ctx.deleteMessage().catch(() => {});
    const receiver = ctx.state.user || await getUser(receiverId);
    const sender = await getUser(senderId);
    const item = await purchaseAsset({
      seller: sender, buyer: receiver, model: Card, id: itemId, price,
    });

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
    await ctx.reply(tradeError(error));
  }
});

export default cardActions;
