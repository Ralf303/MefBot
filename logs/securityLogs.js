const { Composer } = require("telegraf");

const safety = new Composer();

safety.on("text", async (ctx, next) => {
  const userMessage = ctx.message.text.toLowerCase();
  const word1 = userMessage[0];
  const IsPrivate = ctx.chat.type === "private";
  const message = ctx.message.reply_to_message;
  const chatId = ctx.message.chat.id.toString();
  const stringChatId = chatId.slice(4);
  const messageId = ctx.message.message_id;

  try {
    if (!IsPrivate && message) {
      if (userMessage.includes("мут")) {
        ctx.telegram.sendMessage(
          "-1001497936733",
          `🔇 #МУТ
  • Кто: [${ctx.from.first_name}](tg://user?id=${ctx.from.id}) (${ctx.from.id})
  • Кого: [${message.from.first_name}](tg://user?id=${message.from.id}) (${message.from.id})
  • Группа: ${ctx.message.chat.title} (${chatId})
  • 👀 [Посмотреть сообщениe](https://t.me/c/${stringChatId}/${messageId})
  #id${message.from.id}`,
          {
            parse_mode: "Markdown",
            disable_web_page_preview: false,
          }
        );
      }

      if (userMessage.includes("варн")) {
        ctx.telegram.sendMessage(
          "-1001497936733",
          `⚠️ #ВАРН
  • Кто: [${ctx.from.first_name}](tg://user?id=${ctx.from.id}) (${ctx.from.id})
  • Кого: [${message.from.first_name}](tg://user?id=${message.from.id}) (${message.from.id})
  • Группа: ${ctx.message.chat.title} (${chatId})
  • 👀 [Посмотреть сообщениe](https://t.me/c/${stringChatId}/${messageId})
  #id${message.from.id}`,
          {
            parse_mode: "Markdown",
            disable_web_page_preview: false,
          }
        );
      }

      if (userMessage.includes("бан")) {
        ctx.telegram.sendMessage(
          "-1001497936733",
          `🚷 #БАН
  • Кто: [${ctx.from.first_name}](tg://user?id=${ctx.from.id}) (${ctx.from.id})
  • Кого: [${message.from.first_name}](tg://user?id=${message.from.id}) (${message.from.id})
  • Группа: ${ctx.message.chat.title} (${chatId})
  • 👀 [Посмотреть сообщениe](https://t.me/c/${stringChatId}/${messageId})
  #id${message.from.id}`,
          {
            parse_mode: "Markdown",
            disable_web_page_preview: false,
          }
        );
      }

      if (userMessage.includes("размут")) {
        ctx.telegram.sendMessage(
          "-1001497936733",
          `🔉 #РАЗМУТ
  • Кто: [${ctx.from.first_name}](tg://user?id=${ctx.from.id}) (${ctx.from.id})
  • Кого: [${message.from.first_name}](tg://user?id=${message.from.id}) (${message.from.id})
  • Группа: ${ctx.message.chat.title} (${chatId})
  • 👀 [Посмотреть сообщениe](https://t.me/c/${stringChatId}/${messageId})
  #id${message.from.id}`,
          {
            parse_mode: "Markdown",
            disable_web_page_preview: false,
          }
        );
      }

      if (userMessage.includes("снять варн")) {
        ctx.telegram.sendMessage(
          "-1001497936733",
          `⚠️ #РАЗВАРН
  • Кто: [${ctx.from.first_name}](tg://user?id=${ctx.from.id}) (${ctx.from.id})
  • Кого: [${message.from.first_name}](tg://user?id=${message.from.id}) (${message.from.id})
  • Группа: ${ctx.message.chat.title} (${chatId})
  • 👀 [Посмотреть сообщениe](https://t.me/c/${stringChatId}/${messageId})
  #id${message.from.id}`,
          {
            parse_mode: "Markdown",
            disable_web_page_preview: false,
          }
        );
      }

      if (userMessage.includes("разбан")) {
        ctx.telegram.sendMessage(
          "-1001497936733",
          `♿️ #РАЗБАН
  • Кто: [${ctx.from.first_name}](tg://user?id=${ctx.from.id}) (${ctx.from.id})
  • Кого: [${message.from.first_name}](tg://user?id=${message.from.id}) (${message.from.id})
  • Группа: ${ctx.message.chat.title} (${chatId})
  • 👀 [Посмотреть сообщениe](https://t.me/c/${stringChatId}/${messageId})
  #id${message.from.id}`,
          {
            parse_mode: "Markdown",
            disable_web_page_preview: false,
          }
        );
      }
    }
  } catch (e) {
    ctx.reply("Какая то ошибка, " + e);
  }
  return next();
});
module.exports = safety;
