import { User, Item } from "../../../db/models.js";
import { loseLog, giveResoursesLog } from "../../logs-module/globalLogs.js";

const giveItem = async (sender, id, ctx) => {
  try {
    const message = ctx.message.reply_to_message;

    if (!message) {
      return;
    }

    const receiverChatId = message.from.id;

    // проверяем, что отправитель не является ботом
    if (message.from.is_bot) {
      await ctx.reply("Зачем боту предметы🧐");
      return;
    }

    const receiver = await User.findOne({
      where: { chatId: receiverChatId },
    });

    const item = await Item.findOne({
      where: {
        id: id,
        userId: sender.id,
      },
    });

    if (!item) {
      await ctx.reply(`У тебя нет такой вещи 😥`);
      return;
    }

    if (receiver.slots <= receiver.fullSlots) {
      await ctx.reply(`У ${receiver.firstname} нет места 😥`);
      return;
    }

    if (item.isWorn) {
      item.isWorn = false;
    }

    if (sender.id === receiver.id) {
      await ctx.reply(`Иди нахуй, так нельзя🖕`);
      return;
    }
    sender.fullSlots--;
    receiver.fullSlots++;
    item.userId = receiver.id;

    await sender.save();
    await receiver.save();
    await item.save();
    await ctx.reply(
      `Ты успешно передал(а) ${item.itemName}[${item.id}](+${item.lvl}) <a href="tg://user?id=${receiver.chatId}">${receiver.firstname}</a>`,
      { parse_mode: "HTML" }
    );
    await loseLog(
      sender,
      `${item.itemName}[${item.id}]`,
      "передача другому юзеру"
    );
    await giveResoursesLog(
      sender,
      receiver,
      `${item.itemName}[${item.id}]`,
      "1"
    );
  } catch (error) {
    console.log(error);
  }
};

export { giveItem };
