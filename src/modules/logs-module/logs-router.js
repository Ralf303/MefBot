const { Composer } = require("telegraf");
const { message } = require("telegraf/filters");

const logsRouter = new Composer();

logsRouter.on(message("text"), async (ctx, next) => {
  const userMessage = ctx.message.text.toLowerCase();
  const [word1] = userMessage.split(" ");
  const message = ctx.message.reply_to_message;
  const chatId = ctx.message.chat.id.toString();
  const stringChatId = chatId.slice(4);
  const messageId = ctx.message.message_id;

  try {
    if (message) {
      if (word1 == "мут") {
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

      if (word1 == "варн" || word1 == "пред") {
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

      if (word1 == "бан") {
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

      if (
        word1 == "размут" ||
        word1 == "говори" ||
        userMessage == "снять мут"
      ) {
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

      if (userMessage == "снять варн" || word1 == "разварн") {
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

      if (word1 == "разбан" || userMessage == "снять бан") {
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
    return next();
  } catch (e) {
    await ctx.reply("Какая то ошибка, " + e);
  }
});
module.exports = logsRouter;
