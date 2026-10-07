import economyService from "../../services/economy-service.js";
import { grantItem } from "../../services/reward-service.js";
import { Family } from "../../db/models.js";
import Sequelize, { Op } from "sequelize";
import { Composer } from "telegraf";
import { message } from "telegraf/filters";
import { getUser, getChat } from "../../db/functions.js";
import { User, Active, Chat } from "../../db/models.js";
import { getRandomInt, sleep } from "../../utils/helpers.js";
import {
  checkItem,
  createItem,
} from "../items-module/items-utils/item-tool-service.js";
import activeService from "./active-service.js";
import ru_text from "../../../ru_text.js";
import { getFamilyByUserId } from "../fam-module/fam-service.js";

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
          const item = await grantItem(fromUser, 106);
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
          await Family.increment({ reputation: fam.check ? 100 : 50 }, { where: { id: fam.id } });

          sum += fam.Baf.invite * 500;


        }

        await economyService.add({ user: fromUser, currency: "balance", amount: sum });
        await invitedUser.save();
        await fromUser.save();
        await ctx.telegram.sendMessage(
          fromUser.chatId,
          `За приглашение юзера ты получил ${sum}`
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
    const chat = ctx.state.chat || await getChat(chatId, ctx.chat.title);
    ctx.state.chat = chat;
    if (chat.vip) await activeService.updateUserActivity(ctx.state.user.id, chat.chatId);

    return next();
  } catch (error) {
    console.log(error);
  }
});

export default activeRouter;
