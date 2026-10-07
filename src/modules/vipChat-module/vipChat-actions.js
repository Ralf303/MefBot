import { withUserTransaction } from "../../services/transaction-service.js";
import { Composer } from "telegraf";
import { getChat, getUser } from "../../db/functions.js";

const vipChatActions = new Composer();

vipChatActions.action(/^vipChat(\d+)$/, async (ctx) => {
  try {
    const userId = ctx.match[1];

    if (userId != ctx.from.id) {
      return await ctx.answerCbQuery("Не тыкай куда не следует😡");
    }

    await ctx.deleteMessage();
    await withUserTransaction(ctx.state.user, async (user, transaction) => {
      const chat = await getChat(ctx.chat.id);
      await chat.reload({ transaction, lock: transaction.LOCK.UPDATE });
      if (user.balance < 1000000) throw new Error("INSUFFICIENT_FUNDS");
      user.balance -= 1000000;
      chat.vip = true;
      chat.vipTime += 30;
      await user.save({ transaction });
      await chat.save({ transaction });
    });
    await ctx.reply("Готово! Випчат успешно продлен на 30 дней🤑");
  } catch (error) {
    console.log(error);
  }
});

export default vipChatActions;
