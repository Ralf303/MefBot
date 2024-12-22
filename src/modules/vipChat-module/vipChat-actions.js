const { Composer } = require("telegraf");
const { getChat, getUser } = require("../../db/functions");

const vipChatActions = new Composer();

vipChatActions.action(/vipChat(\d+)/, async (ctx) => {
  try {
    const userId = ctx.match[1];

    if (userId != ctx.from.id) {
      return await ctx.answerCbQuery("Не тыкай куда не следует😡");
    }

    await ctx.deleteMessage();
    const chat = await getChat(ctx.chat.id);
    const user = await getUser(userId);

    if (user.balance < 1000000) {
      return await ctx.reply("Недостаточно мефа для покупки випчата😢");
    }

    user.balance -= 1000000;
    chat.vip = true;
    chat.vipTime += 30;
    await user.save();
    await chat.save();
    await ctx.reply("Готово! Випчат успешно продлен на 30 дней🤑");
  } catch (error) {
    console.log(error);
  }
});

module.exports = vipChatActions;
