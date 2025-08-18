import { Keyboard, Key } from "telegram-keyboard";
import { Composer } from "telegraf";
import { getUser } from "../db/functions.js";
import { shopGenerator } from "../utils/helpers.js";
import text from "../../ru_text.js";
import { getMineInfo } from "../modules/mine-module/mine-service.js";

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
        "\nТвои старки: " +
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
      text.mef_upgrade,
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
      text.time_upgrade,
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
      text.inventory_upgrade,
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
        ["Улучшения", "Вещи", "Майнинг"],
        [Key.callback("🤑Донат🤑", 4)],
        [Key.callback("Закрыть", "dell")],
      ])
    );
  } catch (error) {
    console.log(error);
  }
});

shopActions.action("Майнинг", async (ctx) => {
  try {
    await ctx.deleteMessage();
    const info = await getMineInfo();

    await ctx.reply(
      `⛏️Все для майнинга⛏️\n\nВидеокарта\nВ наличии: ${info.cards}шт\nЦена: 15.000 гемов\n\nОхлаждающая жидкость\nВ наличии: ${info.freeze}шт\nЦена: 250 гемов\n\nℹ️ Каждый час в магазин завозится одна видеокарта\n\n📖 Купить видеокарту\n📖 Купить охлаждайку [кол-во]`,
      Keyboard.inline([[Key.callback("🔙Назад", "menu")]])
    );
  } catch (error) {
    console.log(error);
  }
});

export default shopActions;
