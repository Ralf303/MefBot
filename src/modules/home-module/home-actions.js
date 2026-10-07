import jwtService from "../../services/jwt-service.js";
import { Home } from "../../db/models.js";
import { purchaseAsset, tradeError } from "../../services/trade-service.js";
import { Composer } from "telegraf";
import { getUser } from "../../db/functions.js";
import { separateNumber } from "../../utils/helpers.js";
import { Keyboard, Key } from "telegram-keyboard";
import { getHomeByUserId } from "./home-service.js";

const homeActions = new Composer();

homeActions.action(/^(t_|homeSell )/, async (ctx, next) => {
  try {
    const offer = jwtService.verifyTradeToken(ctx.callbackQuery.data);
    if (offer.kind !== "home") return next();
    const { id: itemId, senderId, receiverId, price } = offer;
    if (Number(ctx.from.id) !== Number(receiverId)) return ctx.answerCbQuery("Это предложение адресовано другому пользователю");
    await ctx.deleteMessage().catch(() => {});
    const receiver = ctx.state.user || await getUser(receiverId);
    const sender = await getUser(senderId);
    const senderHome = await purchaseAsset({
      seller: sender, buyer: receiver, model: Home, id: itemId, house: true, price,
    });

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
    await ctx.reply(tradeError(error));
  }
});

homeActions.action("cancel", async (ctx) => {
  try {
    await ctx.deleteMessage();
    await ctx.deleteMessage();
    await ctx.reply("Сделка успешно отменена.");
  } catch (error) {
    console.log(error);
  }
});

export default homeActions;
