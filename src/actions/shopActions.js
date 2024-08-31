const { Keyboard, Key } = require("telegram-keyboard");
const { Composer } = require("telegraf");
const { getUser } = require("../db/functions.js");
const { shopGenerator } = require("../utils/helpers.js");
const ru_text = require("../../ru_text.js");

const shopActions = new Composer();

shopActions.action(["1", "2", "3", "4", "5", "6"], async (ctx) => {
  try {
    await ctx.deleteMessage();
    const { data } = ctx.callbackQuery;
    await shopGenerator(String(data), ctx);
  } catch (error) {
    console.log(error);
  }
});

shopActions.action("farmApp", async (ctx) => {
  try {
    const user = await getUser(
      ctx.from.id,
      ctx.from.first_name,
      ctx.from.username
    );
    await ctx.deleteMessage();
    await ctx.reply(
      "❗️УЛУЧШЕНИЯ ДЛЯ ФЕРМЫ❗️\n\nТвой уровень сбора: " +
        user.meflvl +
        "\nТвой уровень времени: " +
        user.timelvl +
        "\nТвой меф: " +
        user.balance,
      Keyboard.inline([
        ["Улучшить сбор", "Улучшить время"],
        [Key.callback("Закрыть", "dell"), Key.callback("🔙Назад", "menu")],
      ])
    );
  } catch (error) {
    console.log(error);
  }
});

shopActions.action("Улучшить сбор", async (ctx) => {
  try {
    await ctx.reply(
      ru_text.mef_upgrade,
      Keyboard.inline([
        [Key.callback("Купить улучшение", "mefapp")],
        [Key.callback("🔙Назад", "farmApp")],
      ])
    );
  } catch (error) {
    console.log(error);
  }
  await ctx.deleteMessage();
});

shopActions.action("Улучшить время", async (ctx) => {
  try {
    await ctx.deleteMessage();
    await ctx.reply(
      ru_text.time_upgrade,
      Keyboard.inline([
        [Key.callback("Купить улучшение", "timeapp")],
        [Key.callback("🔙Назад", "farmApp")],
      ])
    );
  } catch (error) {
    console.log(error);
  }
});

shopActions.action("Инвентарь", async (ctx) => {
  try {
    await ctx.deleteMessage();
    await ctx.reply(
      ru_text.inventory_upgrade,
      Keyboard.inline([
        [Key.callback("Купить слот", "slotapp")],
        [Key.callback("🔙Назад", "Улучшения")],
      ])
    );
  } catch (error) {
    console.log(error);
  }
});

shopActions.action("dell", async (ctx) => {
  try {
    await ctx.deleteMessage();
    ctx.scene.leave();
  } catch (error) {
    console.log(error);
  }
});

shopActions.action("Улучшения", async (ctx) => {
  try {
    await ctx.deleteMessage();
    await ctx.reply(
      "Что будем улучшать:",
      Keyboard.inline([
        ["Инвентарь", Key.callback("Ферму", "farmApp")],
        [Key.callback("🔙Назад", "menu"), Key.callback("Закрыть", "dell")],
      ])
    );
  } catch (error) {
    console.log(error);
  }
});

shopActions.action("Вещи", async (ctx) => {
  try {
    await ctx.deleteMessage();
    await ctx.reply(
      "Отлично!\nВ какой магазин пойдем?",
      Keyboard.inline([
        [Key.callback("📦Bomj Gang📦", 1), Key.callback("💼Paul Shop💼", 2)],
        [
          Key.callback("🎩Clemente House🎩", 3),
          Key.callback("💎Gem Shop💎", 5),
        ],
        [Key.callback("👥Fam Shop👥", 6)],
        [(Key.callback("🔙Назад", "menu"), Key.callback("Закрыть", "dell"))],
      ])
    );
  } catch (error) {
    console.log(error);
  }
});

shopActions.action("menu", async (ctx) => {
  try {
    await ctx.deleteMessage();
    await ctx.reply(
      "Выбери что хочешь купить:",
      Keyboard.inline([
        ["Улучшения", "Вещи", Key.callback("🤑Донат🤑", 4)],
        [Key.callback("Закрыть", "dell")],
      ])
    );
  } catch (error) {
    console.log(error);
  }
});

module.exports = shopActions;
