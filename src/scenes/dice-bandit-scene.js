import { Scenes } from "telegraf";
import { getUser } from "../db/functions.js";
import { Key, Keyboard } from "telegram-keyboard";
import { saveAction, separateNumber } from "../utils/helpers.js";

const diceScene = new Scenes.BaseScene("diceScene");

diceScene.enter(async (ctx) => {
  const user = await getUser(
    ctx.from.id,
    ctx.from.first_name,
    ctx.from.username
  );
  const message = `🎰Для игры в слоты тебе нужно написать в чат сумму ставки\n\nБаланс — ${separateNumber(
    user.balance
  )}`;
  await ctx.reply(message);
});

diceScene.hears(/^([1-9]\d*)$/, async (ctx) => {
  try {
    const user = await getUser(
      ctx.from.id,
      ctx.from.first_name,
      ctx.from.username
    );

    const stake = Number(ctx.match[1]);

    if (!Number.isSafeInteger(stake) || stake <= 0) return ctx.reply("Укажи целую положительную ставку");
    if (user.balance < stake) {
      await ctx.reply("Недостаточно старок😢");
      return;
    }

    ctx.session.stake = stake;

    const message = await ctx.reply(
      `7️⃣7️⃣7️⃣ — 15х\n🍋🍋🍋 — 10х\n🍒🍒🍒 — 8х\n🍸🍸🍸 — 5х\n\nСтавка — ${separateNumber(
        ctx.session.stake
      )}\nБаланс — ${separateNumber(user.balance)}`,
      Keyboard.inline([
        ["0.5х ставка", Key.callback("🎰Крутить", "dice"), "2х ставка"],
        [Key.callback("🔽Закрыть🔽", "dell")],
      ])
    );

    await saveAction(user.id, message);
    ctx.scene.leave();
  } catch (e) {
    await ctx.reply(`Какая то ошибка ${e}`);
    ctx.scene.leave();
  }
});

export default diceScene;
