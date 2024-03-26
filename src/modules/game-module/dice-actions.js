const { Composer } = require("telegraf");
const { Key, Keyboard } = require("telegram-keyboard");
const {
  dice_bandit,
  checkAndMultiplyStake,
  checkAndMultiplyByHalfStake,
} = require("./games/dice-bandit.js");
const { getUser } = require("../../db/functions");
const { checkAction, saveAction } = require("../../utils/helpers");

const diceAction = new Composer();

diceAction.action("dice", async (ctx) => {
  try {
    await ctx.deleteMessage();
    const user = await getUser(
      ctx.from.id,
      ctx.from.first_name,
      ctx.from.username
    );

    await checkAction(user.id, ctx);
    if (ctx.session.stake) {
      const message = await ctx.reply(
        await dice_bandit(ctx.session.stake, user, ctx),
        Keyboard.inline([
          ["0.5х ставка", Key.callback("🎰Крутить", "dice"), "2х ставка"],
          [Key.callback("🔽Закрыть🔽", "dell")],
        ])
      );

      await saveAction(user.id, message);
    } else {
      await ctx.reply("Ставка не найдена, запустите слоты заново");
    }
  } catch (error) {
    return;
  }
});

diceAction.action("2х ставка", async (ctx) => {
  try {
    await ctx.deleteMessage();
    const user = await getUser(
      ctx.from.id,
      ctx.from.first_name,
      ctx.from.username
    );

    await checkAction(user.id, ctx);
    if (ctx.session.stake) {
      const message = await ctx.reply(
        await checkAndMultiplyStake(ctx, user),
        Keyboard.inline([
          ["0.5х ставка", Key.callback("🎰Крутить", "dice"), "2х ставка"],
          [Key.callback("🔽Закрыть🔽", "dell")],
        ])
      );

      await saveAction(user.id, message);
    } else {
      await ctx.reply("Ставка не найдена, запустите слоты заново");
    }
  } catch (error) {
    return;
  }
});

diceAction.action("0.5х ставка", async (ctx) => {
  try {
    await ctx.deleteMessage();
    const user = await getUser(
      ctx.from.id,
      ctx.from.first_name,
      ctx.from.username
    );

    await checkAction(user.id, ctx);

    if (ctx.session.stake) {
      const message = await ctx.reply(
        await checkAndMultiplyByHalfStake(ctx, user),
        Keyboard.inline([
          ["0.5х ставка", Key.callback("🎰Крутить", "dice"), "2х ставка"],
          [Key.callback("🔽Закрыть🔽", "dell")],
        ])
      );

      await saveAction(user.id, message);
    } else {
      await ctx.reply("Ставка не найдена, запустите слоты заново");
    }
  } catch (error) {
    return;
  }
});

module.exports = diceAction;
