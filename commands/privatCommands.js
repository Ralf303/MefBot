const { Composer } = require("telegraf");
const clothes = require("../itemsObjects/clothes");
const { tryItem } = require("../itemsModule/clothesFunctions");
const {
  dice_bandit,
  checkAndMultiplyStake,
  checkAndMultiplyByHalfStake,
} = require("../utils/games/dice_bandit");
const { getUser } = require("../db/functions");

const { Key, Keyboard } = require("telegram-keyboard");
const { checkAction, saveAction } = require("../utils/helpers");

const privatCommands = new Composer();

privatTriggers = ["примерить", "рулетка", "слоты"];

privatCommands.on("text", async (ctx, next) => {
  const userMessage = ctx.message.text.toLowerCase();
  const [word1, word2, word3] = userMessage.split(" ");
  const IsPrivate = ctx.chat.type === "private";

  try {
    if (IsPrivate) {
      if (userMessage == "рулетка") {
        ctx.scene.enter("rouletteScene");
      }

      if (userMessage == "слоты") {
        await ctx.scene.enter("diceScene");
      }

      if (word1 == "примерить") {
        const id = Number(word2);
        const itemInfo = clothes[id];
        if (!isNaN(id)) {
          await tryItem(itemInfo, ctx, id);
        } else {
          await ctx.reply(
            "Не правильное использование команды\n\nПопробуйте\n<<Примерить {Id вещи}>>"
          );
        }
      }
    } else if (
      (privatTriggers.includes(userMessage) ||
        privatTriggers.includes(word1)) &&
      !IsPrivate
    ) {
      await ctx.reply("Данная команда доступна только в лс");
    }
  } catch (e) {
    await ctx.reply("Какая то ошибка, " + e);
  }
  return next();
});

privatCommands.action("dice", async (ctx) => {
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

privatCommands.action("2х ставка", async (ctx) => {
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

privatCommands.action("0.5х ставка", async (ctx) => {
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

module.exports = privatCommands;
