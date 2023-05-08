const { Composer } = require("telegraf");
const { getUser } = require("./DataBase/HelpWithDb");
const User = require("./DataBase/models");

const MessageCounter = new Composer();
const regex = /([_*[\]()~`>#+\-=|{}.!])/g;

MessageCounter.hears(/актив день/i, async (ctx) => {
  const users = await User.findAll({
    order: [["dayMessageCounter", "DESC"]],
    limit: 20,
  });

  const message = users
    .map(
      (user, index) =>
        `${index + 1}. [${user.firstname.replace(regex, "\\$&")}]` +
        `(tg://user?id=${user.chatId}): ${user.dayMessageCounter}`
    )
    .join("\n");

  ctx.reply(`Топ-20 активных пользователей за день:\n\n${message}`, {
    parse_mode: "Markdown",
  });
});

MessageCounter.hears(/актив неделя/i, async (ctx) => {
  const users = await User.findAll({
    order: [["weekMessageCounter", "DESC"]],
    limit: 20,
  });

  const message = users
    .map(
      (user, index) =>
        `${index + 1}. [${user.firstname.replace(regex, "\\$&")}]` +
        `(tg://user?id=${user.chatId}): ${user.weekMessageCounter}`
    )
    .join("\n");

  ctx.reply(`Топ-20 активных пользователей за неделю:\n\n${message}`, {
    parse_mode: "Markdown",
  });
});
MessageCounter.hears(/актив месяц/i, async (ctx) => {
  const users = await User.findAll({
    order: [["monthMessageCounter", "DESC"]],
    limit: 20,
  });

  const message = users
    .map(
      (user, index) =>
        `${index + 1}. [${user.firstname.replace(regex, "\\$&")}]` +
        `(tg://user?id=${user.chatId}): ${user.monthMessageCounter}`
    )
    .join("\n");

  ctx.reply(`Топ-20 активных пользователей за месяц:\n\n${message}`, {
    parse_mode: "Markdown",
  });
});

MessageCounter.on("message", async (ctx) => {
  const user = await getUser(
    ctx.from.id,
    ctx.from.first_name,
    ctx.from.username
  );
  if (ctx.chat.type !== "private") {
    user.dayMessageCounter++;
    user.weekMessageCounter++;
    user.monthMessageCounter++;
    user.save();
  }
});

module.exports = MessageCounter;
