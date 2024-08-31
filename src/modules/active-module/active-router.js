const Sequelize = require("sequelize");
const { Op } = Sequelize;
const { Composer } = require("telegraf");
const { message } = require("telegraf/filters");
require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});
const { getUser, getChat } = require("../../db/functions.js");
const { User, Active, Chat } = require("../../db/models.js");
const { getRandomInt, sleep } = require("../../utils/helpers.js");

const {
  checkItem,
  createItem,
} = require("../items-module/items-utils/item-tool-service.js");
const activeService = require("./active-service.js");
const ru_text = require("../../../ru_text.js");
const { getFamilyByUserId } = require("../fam-module/fam-service.js");

const activeRouter = new Composer();

activeRouter.on(message("new_chat_members"), async (ctx, next) => {
  try {
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

      if (!invitedUser && !invitedUserInfo[i].is_bot) {
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
            ctx.chat.id,
            `❗️@${fromUser.username} испытал удачу и получил ${item.itemName}❗️`
          );
          await item.save();
        }

        const hasPups = await checkItem(fromUser.id, "Пупс «Харизма»");

        if (hasPups) {
          sum += 1000;
        }

        const fam = await getFamilyByUserId(fromUser.chatId);

        if (fam) {
          if (fam.check) {
            fam.reputation += 100;
          } else {
            fam.reputation += 50;
          }

          sum += fam.Baf.invite * 500;

          await fam.save();
        }

        fromUser.balance += sum;
        await invitedUser.save();
        await fromUser.save();
        await ctx.telegram.sendMessage(
          fromUser.chatId,
          `За приглашение юзера вы получили ${sum}`
        );
      }
      await sleep(100);
    }
    return next();
  } catch (error) {
    console.log(error);
  }
});

activeRouter.hears(/актив день/i, async (ctx, next) => {
  try {
    const chatId = ctx.chat.id;
    if (ctx.chat.type == "private") return next();
    const chat = await getChat(chatId);
    const isVip = chat.vip;
    if (!isVip) return await ctx.reply(ru_text.no_active_without_vip);
    const activeUsers = await Active.findAll({
      where: {
        day: {
          [Op.gt]: 0,
        },
        chatId: chatId,
      },
      include: {
        model: User,
      },
      order: [["day", "DESC"]],
      limit: 15,
    });

    const message = activeUsers
      .map(
        (user, index) =>
          `${index + 1}. <a href="tg://openmessage?user_id=${
            user.user.chatId
          }">${user.user.firstname}</a>: ${user.day}`
      )
      .join("\n");

    await ctx.reply(`📊Активчик по общительным за сутки\n\n${message}`, {
      disable_notification: true,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
    return next();
  } catch (error) {
    console.log(error);
  }
});

activeRouter.hears(/актив неделя/i, async (ctx, next) => {
  try {
    const chatId = ctx.chat.id;
    if (ctx.chat.type == "private") return next();
    const chat = await getChat(chatId);
    const isVip = chat.vip;
    if (!isVip) return await ctx.reply(ru_text.no_active_without_vip);
    const activeUsers = await Active.findAll({
      where: {
        week: {
          [Op.gt]: 0,
        },
        chatId: chatId,
      },
      include: {
        model: User,
      },
      order: [["week", "DESC"]],
      limit: 15,
    });

    const message = activeUsers
      .map(
        (user, index) =>
          `${index + 1}. <a href="tg://openmessage?user_id=${
            user.user.chatId
          }">${user.user.firstname}</a>: ${user.week}`
      )
      .join("\n");
    await ctx.reply(
      `📊Активчик по общительным за неделю\n
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

activeRouter.hears(/актив месяц/i, async (ctx, next) => {
  try {
    const chatId = ctx.chat.id;
    if (ctx.chat.type == "private") return next();
    const chat = await getChat(chatId);
    const isVip = chat.vip;
    if (!isVip) return await ctx.reply(ru_text.no_active_without_vip);
    const activeUsers = await Active.findAll({
      where: {
        month: {
          [Op.gt]: 0,
        },
        chatId: chatId,
      },
      include: {
        model: User,
      },
      order: [["month", "DESC"]],
      limit: 15,
    });

    const message = activeUsers
      .map(
        (user, index) =>
          `${index + 1}. <a href="tg://openmessage?user_id=${
            user.user.chatId
          }">${user.user.firstname}</a>: ${user.month}`
      )
      .join("\n");

    await ctx.reply(
      `📊Активчик по общительным за месяц\n
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

activeRouter.on("message", async (ctx, next) => {
  try {
    const needType = ctx.chat.type !== "private";
    if (!needType) return next();
    const chatId = ctx.chat.id;
    const chat = await Chat.findOrCreate({
      where: { chatId },
      defaults: { vip: false },
    });

    if (chat[0].vip) {
      await activeService.updateUserActivity(ctx.state.user.id, chat[0].chatId);
    }

    return next();
  } catch (error) {
    console.log(error);
  }
});

module.exports = activeRouter;
