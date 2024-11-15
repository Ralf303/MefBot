const { Composer } = require("telegraf");
const { message } = require("telegraf/filters");

const vipChatRouter = new Composer();
const ru_text = require("../../../ru_text");
const { getChat, getTopChats } = require("../../db/functions");
const { Keyboard, Key } = require("telegram-keyboard");
const { daysRemaining, separateNumber } = require("../../utils/helpers");
const moment = require("moment");

vipChatRouter.on(message("text"), async (ctx, next) => {
  try {
    const userMessage = ctx.message.text.toLowerCase();

    if (
      userMessage == "топ чат" ||
      userMessage == "чат топ" ||
      userMessage == "топ чаты"
    ) {
      const topChats = await getTopChats();
      let message = "💬Топ чатов💬\n\n";
      topChats.forEach((chat, index) => {
        message += `${index + 1}. <a href="${chat.chatLink}">${
          chat.name
        }</a> - ${separateNumber(chat.bank)} мефа\n`;
      });
      return await ctx.replyWithHTML(message, {
        disable_web_page_preview: true,
      });
    }

    if (ctx.chat.type === "private") return next();
    const [word1, word2] = userMessage.split(" ");

    const chat = await getChat(ctx.chat.id, ctx.chat.title);
    if (userMessage == "випчат") {
      await ctx.reply(
        ru_text.about_vip_chat +
          `\n\n🕓 ${
            chat.vip
              ? `В этом чате випчат будет действовать еще ${daysRemaining(
                  chat.vipTime
                )}`
              : "В чате нет випчата"
          } 🕓`
      );
    }
    const link = await ctx.getChat();

    if (link.pinned_message?.chat.username) {
      chat.chatLink = `https://t.me/${link.pinned_message.chat.username}`;
    } else if (chat.chatLink === "none") {
      try {
        const link = await ctx.createChatInviteLink({
          expire_date: moment().add(7, "days").unix(),
        });

        chat.chatLink = link.invite_link;
      } catch (e) {
        chat.chatLink = "none";
      }
    }

    const userStatus = await ctx.telegram.getChatMember(
      ctx.chat.id,
      ctx.from.id
    );

    const isOwner = userStatus.status === "creator";

    if (userMessage == "инфа чат") {
      await ctx.replyWithHTML(
        `🗓 Чат «${ctx.chat.title}»
💎 Випчат действует еще ${daysRemaining(chat.vipTime)}
🔗 <a href="${chat.chatLink}">Чат-ссылка</a>
🌿 Хранилище чата: ${separateNumber(chat.bank)} мефа


⚠️ Разрешения чата:
${chat.allowGames ? "✅" : "❌"} Игры
${chat.allowCase ? "✅" : "❌"} Кейсы`,
        {
          disable_web_page_preview: true,
        }
      );
    }

    if (word1 == "пожертвовать" && !isNaN(Number(word2)) && word2 > 0) {
      if (ctx.state.user.balance < Number(word2)) {
        return await ctx.reply("У тебя не хватает мефа 😥");
      }
      ctx.state.user.balance -= Number(word2);
      chat.bank += Number(word2);
      await ctx.reply(
        `🎉 Ты успешно пожертвовал ${separateNumber(word2)} мефа в беседу «${
          ctx.chat.title
        }»`
      );
    }

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
