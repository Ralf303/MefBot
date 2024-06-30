const { Composer } = require("telegraf");
const { Item } = require("../../db/models");
const { getUser } = require("../../db/functions");
const { separateNumber } = require("../../utils/helpers");
const { loseLog, resiveLog } = require("../logs-module/globalLogs");
const { Keyboard, Key } = require("telegram-keyboard");

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
      return await ctx.reply(`У тебя недостаточно старок😥`);
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
    await loseLog(sender, `стар`, "продажа другому юзеру");
    await resiveLog(receiver, `стар`, price, "покупка у другого юзера");
    await ctx.reply(
      `Ты успешно купил(а) ${item.itemName} за ${separateNumber(price)} старок`
    );
    await ctx.telegram.sendMessage(
      sender.chatId,
      `Вы успешно продали ${item.itemName}[${item.id}] за ${separateNumber(
        price
      )} старок`,
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

itemsActions.action("next", async (ctx) => {
  try {
    await ctx.deleteMessage();
    const button = Keyboard.inline([Key.callback("🔽Закрыть🔽", "dell")]);
    const user = await getUser(
      ctx.from.id,
      ctx.from.first_name,
      ctx.from.username
    );
    const items = await user.getItems();
    const itemNames = items.map(
      (item) => `${item.itemName}[<code>${item.id}</code>]`
    );
    let rows = [];
    for (let i = 0; i < itemNames.length; i++) {
      let row = itemNames[i];
      rows.push(row);
    }
    if (rows.join("\n").length > 4000) {
      rows = rows.slice(150);
      buttons = Keyboard.inline([
        [Key.callback("Дальше", "next")],
        [Key.callback("🔽Закрыть🔽", "dell")],
      ]);
    }
    const message = `Твой инвентарь:\n${rows.join(
      "\n"
    )}\n\n📖Надеть id\n📖Удалить вещь id\n📖Передать вещь id\n📖Узнать айди id`;
    await ctx.telegram.sendMessage(user.chatId, message, {
      parse_mode: "HTML",
      reply_markup: button.reply_markup,
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = itemsActions;
