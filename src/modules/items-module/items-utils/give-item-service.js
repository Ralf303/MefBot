import { withUsersTransaction } from "../../../services/transaction-service.js";
import { User, Item } from "../../../db/models.js";

const giveItem = async (sender, id, ctx) => {
  try {
    const message = ctx.message.reply_to_message;

    if (!message) {
      return;
    }

    const receiverChatId = message.from.id;

    if (message.from.is_bot) {
      return ctx.reply("Зачем боту вещи🧐");
    }

    const receiver = await User.findOne({
      where: { chatId: receiverChatId },
    });

    if (!receiver) return ctx.reply("Пользователь не зарегистрирован");
    const result = await withUsersTransaction([sender, receiver], async ([sender, receiver], transaction) => {
      const item = await Item.findOne({
      transaction, lock: transaction.LOCK.UPDATE,
      where: {
        id: id,
        userId: sender.id,
      },
    });

    if (!item) {
      return { error: `У тебя нет такой вещи 😥` };
    }

    if (receiver.slots <= receiver.fullSlots) {
      return { error: `У ${receiver.firstname} нет места 😥` };
    }

    if (item.isWorn) {
      item.isWorn = false;
    }

    if (sender.id === receiver.id) {
      return { error: `Иди нахуй, так нельзя🖕` };
    }
    sender.fullSlots--;
    receiver.fullSlots++;
    item.userId = receiver.id;

    await sender.save();
    await receiver.save();
    await item.save();
    return { item };
    });
    if (result.error) return ctx.reply(result.error);
    const { item } = result;
    await ctx.reply(
      `Ты успешно передал(а) ${item.itemName}[${item.id}](+${item.lvl}) <a href="tg://user?id=${receiver.chatId}">${receiver.firstname}</a>`,
      { parse_mode: "HTML" }
    );
  } catch (error) {
    console.log(error);
  }
};

export { giveItem };
