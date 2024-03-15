const Sequelize = require("sequelize");
const Op = Sequelize.Op;
require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});
const { Composer } = require("telegraf");
const { getUser } = require("../db/functions.js");
const { User, Item } = require("../db/models.js");
const { getRandomInt } = require("../utils/helpers.js");
const clothes = require("../itemsObjects/clothes.js");
const { checkItem, createItem } = require("../itemsModule/clothesFunctions.js");

const MessageCounter = new Composer();

const allowedChats = [
  -1001680708708, -1001672482562, -1001551821031, -1002107153123,
  -1002013744790,
];

MessageCounter.on("new_chat_members", async (ctx, next) => {
  try {
    const chatId = ctx.message.chat.id;
    const fromUserInfo = ctx.message.from;
    const invitedUserInfo = ctx.message.new_chat_members;

    const fromUser = await getUser(
      fromUserInfo.id,
      fromUserInfo.first_name,
      fromUserInfo.username
    );

    for (let i = 0; i < invitedUserInfo.length; i++) {
      let invitedUser = await User.findOne({
        where: { chatId: invitedUserInfo[i].id },
      });

      if (!invitedUser && allowedChats.includes(chatId)) {
        invitedUser = await User.create({
          chatId: invitedUserInfo[i].id,
          firstname: invitedUserInfo[i].first_name,
          username: invitedUserInfo[i].username,
        });

        let sum = 1000;

        const chance = getRandomInt(0, 100);

        if (chance <= 10) {
          const item = await createItem(106);

          fromUser.fullSlots++;
          await fromUser.addItem(item);
          await ctx.telegram.sendMessage(
            process.env.CHAT_ID,
            `❗️@${fromUser.username} испытал удачу и получил ${item.itemName}❗️`
          );
          await item.save();
        }

        const hasPups = await checkItem(fromUser.id, "Пупс «Харизма»");

        if (hasPups) {
          sum += 1000;
        }

        fromUser.balance += sum;
        await invitedUser.save();
        await fromUser.save();
        await ctx.telegram.sendMessage(
          fromUser.chatId,
          `За приглашение юзера вы получили ${sum}`
        );
      }
    }
  } catch (error) {
    console.log(error);
  }

  return next();
});

MessageCounter.hears(/актив день/i, async (ctx, next) => {
  try {
    const users = await User.findAll({
      where: {
        dayMessageCounter: {
          [Op.gt]: 0,
        },
      },
      order: [["dayMessageCounter", "DESC"]],
      limit: 15,
    });

    const message = users
      .map(
        (user, index) =>
          `${index + 1}. <a href="tg://user?id=${user.chatId}">${
            user.firstname
          }</a>: ${user.dayMessageCounter}`
      )
      .join("\n");

    await ctx.reply(
      `❗️Топ-15 активных пользователей за день❗️\n
${message}`,
      {
        disable_notification: true,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }
    );
    return next();
  } catch (error) {
    console.log(error);
  }
});

MessageCounter.hears(/актив неделя/i, async (ctx, next) => {
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
        `${index + 1}. <a href="tg://user?id=${user.chatId}">${
          user.firstname
        }</a>: ${user.weekMessageCounter}`
    )
    .join("\n");

  await ctx.reply(
    `❗️Топ-15 активных пользователей за неделю❗️\n
${message}`,
    {
      disable_notification: true,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }
  );
  return next();
});

MessageCounter.hears(/актив месяц/i, async (ctx, next) => {
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
        `${index + 1}. <a href="tg://user?id=${user.chatId}">${
          user.firstname
        }</a>: ${user.monthMessageCounter}`
    )
    .join("\n");

  await ctx.reply(
    `❗️Топ-15 активных пользователей за месяц❗️\n
${message}`,
    {
      disable_notification: true,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }
  );
  return next();
});

MessageCounter.on("message", async (ctx, next) => {
  const chatId = ctx.chat.id;
  const needType = ctx.chat.type !== "private";
  if (!allowedChats.includes(chatId) && needType) {
    try {
      await ctx.reply(
        "Я не могу находиться в этом чате😘\n\nБот создан только для чата @mefpablo"
      );
      await ctx.leaveChat();
    } catch (error) {
      console.log(error);
    }
  }
  const user = await getUser(
    ctx.from.id,
    ctx.from.first_name,
    ctx.from.username
  );
  if (needType && chatId == process.env.CHAT_ID) {
    user.dayMessageCounter++;
    user.weekMessageCounter++;
    user.monthMessageCounter++;
    user.save();
  }
  return next();
});

module.exports = MessageCounter;
