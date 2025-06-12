import { Composer } from "telegraf";
import { separateNumber } from "../../utils/helpers.js";

const donatAction = new Composer();

donatAction.action(
  /^confirm_donate_(\d+)_(\d+)_(stars|stones)$/,
  async (ctx) => {
    const count = Number(ctx.match[1]);
    const userId = Number(ctx.match[2]);
    const type = ctx.match[3];

    if (ctx.from.id !== userId) {
      await ctx.answerCbQuery("Не тыкай куда не надо 😡");
      return;
    }

    const user = ctx.state.user;

    if (user.donate < count) {
      await ctx.editMessageText(
        `Недостаточно искр для покупки ${count} ${
          type === "stars" ? "старок" : "камней"
        } 🥲`
      );
      return;
    }

    user.donate -= count;

    if (type === "stars") {
      user.balance += count * 5000;
    } else if (type === "stones") {
      user.stones += count;
    }

    await user.save();

    try {
      await ctx.deleteMessage();
    } catch (e) {}

    if (type === "stars") {
      await ctx.reply(
        `Ты успешно обменял ${count} искр на ${separateNumber(
          count * 5000
        )} старок! 🎉\n\nТвой баланс теперь: ${separateNumber(user.balance)} 🌟`
      );
    } else if (type === "stones") {
      await ctx.reply(
        `Ты успешно обменял ${count} искр на ${count} камней! 🎉\n\nУ тебя теперь ${user.stones} точильных камней`
      );
    }
  }
);

export default donatAction;
