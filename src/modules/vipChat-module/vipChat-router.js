const { Composer } = require("telegraf");
const { message } = require("telegraf/filters");

const vipChatRouter = new Composer();
const ru_text = require("../../../ru_text");
const { getChat } = require("../../db/functions");
const { Keyboard, Key } = require("telegram-keyboard");

vipChatRouter.on(message("text"), async (ctx, next) => {
  try {
    if (ctx.chat.type === "private") return next();
    const chat = await getChat(ctx.chat.id);
    const userMessage = ctx.message.text.toLowerCase();
    const userStatus = await ctx.telegram.getChatMember(
      ctx.chat.id,
      ctx.from.id
    );
    const isOwner = userStatus.status === "creator";

    if (userMessage == "купить випчат") {
      if (chat.vip) return await ctx.reply("Випчат уже куплен🤑");
      await ctx.reply(
        "💎 Вы собираетесь приобрести випчат.\n🕓 Период: 1 месяц\n🌿 Цена: 1 миллион мефа",
        Keyboard.inline([
          [Key.callback("Точно купить", "vipChat" + ctx.from.id)],
        ])
      );
    }

    if (userMessage == "+кейсы" && isOwner) {
      chat.allowCase = true;
      await ctx.reply("Кейсы теперь разрешены✅");
    } else if (!isOwner && userMessage == "+кейсы") {
      await ctx.reply(ru_text.not_owner);
    }

    if (userMessage == "-кейсы" && isOwner) {
      chat.allowCase = false;
      await ctx.reply("Кейсы теперь запрещены❌");
    } else if (!isOwner && userMessage == "-кейсы") {
      await ctx.reply(ru_text.not_owner);
    }

    if (userMessage == "+игры" && isOwner) {
      chat.allowGames = true;
      await ctx.reply("Игры теперь разрешены✅");
    } else if (!isOwner && userMessage == "+игры") {
      await ctx.reply(ru_text.not_owner);
    }

    if (userMessage == "-игры" && isOwner) {
      chat.allowGames = false;
      await ctx.reply("Игры теперь запрещены❌");
    } else if (!isOwner && userMessage == "-игры") {
      await ctx.reply(ru_text.not_owner);
    }

    await chat.save();
    return next();
  } catch (e) {
    await ctx.reply("ВИП ошибка, " + e);
  }
});

module.exports = vipChatRouter;
