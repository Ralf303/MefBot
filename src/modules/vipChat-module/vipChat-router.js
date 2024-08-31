const { Composer } = require("telegraf");
const { message } = require("telegraf/filters");

const vipChatRouter = new Composer();
const ru_text = require("../../../ru_text");
const { getChat } = require("../../db/functions");
const { Keyboard, Key } = require("telegram-keyboard");

vipChatRouter.on(message("text"), async (ctx, next) => {
  try {
    const userMessage = ctx.message.text.toLowerCase();
    if (ctx.chat.type === "private") return next();
    if (userMessage == "випчат") {
      const chat = await getChat(ctx.chat.id);

      await ctx.reply(
        ru_text.about_vip_chat +
          `\n\n🕓 ${
            chat.vip
              ? `В этом чате випчат будет действовать еще ${chat.vipTime} дней`
              : "В чате нет випчата"
          } 🕓`
      );
    }

    const chat = await getChat(ctx.chat.id);
    const userStatus = await ctx.telegram.getChatMember(
      ctx.chat.id,
      ctx.from.id
    );
    const isOwner = userStatus.status === "creator";

    if (userMessage == "купить випчат") {
      await ctx.reply(
        ru_text.buy_vip_chat,
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
    console.log(e);
  }
});

module.exports = vipChatRouter;
