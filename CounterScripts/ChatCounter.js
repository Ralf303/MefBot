const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const { Composer } = require("telegraf");
const { getUser } = require("../DataBase/helpWithDb");
const User = require("../DataBase/models");

const MessageCounter = new Composer();

const regex = /([_*][)~(`>#+\-=|{}.!])/g;
const allowedChats = [-1001680708708];

MessageCounter.hears(/актив день/i, async (ctx) => {
  const users = await User.findAll({
    where: {
      dayMessageCounter: {
        [Op.gt]: 0, // <--- Вместо этого нужно написать просто: 0
      },
    },
    order: [["dayMessageCounter", "DESC"]],
    limit: 15,
  });

  const message = users
    .map(
      (user, index) =>
        `${index + 1}. [${user.firstname.replace(
          regex,
          "\\$&"
        )}](https://t.me/${user.username}): ${user.dayMessageCounter}`
    )
    .join("\n");

  ctx.reply(
    `❗️Топ-15 активных пользователей за день❗️\n
${message}`,
    {
      disable_notification: true,
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    }
  );
});
MessageCounter.hears(/актив неделя/i, async (ctx) => {
  const users = await User.findAll({
    where: {
      weekMessageCounter: {
        [Op.gt]: 0,
      },
    },
    order: [["weekMessageCounter", "DESC"]],
    limit: 15,
  });

  const message = users
    .map(
      (user, index) =>
        `${index + 1}. [${user.firstname.replace(
          regex,
          "\\$&"
        )}](https://t.me/${user.username}): ${user.weekMessageCounter}`
    )
    .join("\n");

  ctx.reply(
    `❗️Топ-15 активных пользователей за неделю❗️\n
${message}`,
    {
      disable_notification: true,
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    }
  );
});
MessageCounter.hears(/актив месяц/i, async (ctx) => {
  const users = await User.findAll({
    where: {
      monthMessageCounter: {
        [Op.gt]: 0,
      },
    },
    order: [["monthMessageCounter", "DESC"]],
    limit: 15,
  });

  const message = users
    .map(
      (user, index) =>
        `${index + 1}. [${user.firstname.replace(
          regex,
          "\\$&"
        )}](https://t.me/${user.username}): ${user.monthMessageCounter}`
    )
    .join("\n");

  ctx.reply(
    `❗️Топ-15 активных пользователей за месяц❗️\n
${message}`,
    {
      disable_notification: true,
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    }
  );
});

MessageCounter.on("message", async (ctx) => {
  const chatId = ctx.chat.id;
  const needType = ctx.chat.type !== "private";
  if (!allowedChats.includes(chatId) && needType) {
    try {
      await ctx.reply(
        "Я не могу находиться в этом чате😘\n\nБот создан только для чата @mefpablo"
      );
      await ctx.leaveChat();
      return;
    } catch (error) {
      console.log(error);
    }
  }
  const user = await getUser(
    ctx.from.id,
    ctx.from.first_name,
    ctx.from.username
  );
  if (needType) {
    user.dayMessageCounter++;
    user.weekMessageCounter++;
    user.monthMessageCounter++;
    user.save();
  }
});

module.exports = MessageCounter;
