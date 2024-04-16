const { Composer } = require("telegraf");
const { Item } = require("../../db/models");
const { getUser } = require("../../db/functions");
const { separateNumber } = require("../../utils/helpers");
const { loseLog, resiveLog } = require("../logs-module/globalLogs");

const itemsActions = new Composer();

itemsActions.action(/^sell/, async (ctx) => {
  try {
    await ctx.deleteMessage();
    const [_, itemId, senderId, receiverId, price] =
      ctx.callbackQuery.data.split(" ");
    const receiver = await getUser(receiverId);
    const sender = await getUser(senderId);
    const item = await Item.findOne({
      where: {
        id: itemId,
        userId: sender.id,
      },
    });

    if (!item) {
      return await ctx.reply(`Юзер уже продал вещь и ее у него нет😥`);
    }

    if (receiver.fullSlots >= receiver.slots) {
      return await ctx.reply(`У тебя недостаточно слотов😥`);
    }

    if (receiver.balance < price) {
      return await ctx.reply(`У тебя недостаточно мефа😥`);
    }

    receiver.balance -= Number(price);
    sender.balance += Number(price);
    sender.fullSlots--;
    receiver.fullSlots++;
    item.userId = receiver.id;

    await sender.save();
    await receiver.save();
    await item.save();
    await loseLog(sender, `${item.itemName[item.id]}`, "продажа другому юзеру");
    await resiveLog(
      receiver,
      `${item.itemName[item.id]}`,
      1,
      "покупка у другого юзера"
    );
    await loseLog(sender, `меф`, "продажа другому юзеру");
    await resiveLog(receiver, `меф`, price, "покупка у другого юзера");
    await ctx.reply(
      `Ты успешно купил(а) ${item.itemName} за ${separateNumber(price)} мефа`
    );
    await ctx.telegram.sendMessage(
      sender.chatId,
      `Вы успешно продали ${item.itemName}[${item.id}] за ${separateNumber(
        price
      )} мефа`,
      { parse_mode: "HTML" }
    );
  } catch (error) {
    console.log(error);
  }
});

itemsActions.action("cancel", async (ctx) => {
  try {
    await ctx.deleteMessage();
    await ctx.reply("Сделка успешно отменена");
  } catch (error) {
    console.log(error);
  }
});

module.exports = itemsActions;
