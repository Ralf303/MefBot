import { User } from "../../../db/models.js";
import cases from "../cases.js";
import { giveResoursesLog, loseLog } from "../../logs-module/globalLogs.js";
import { getUserCase } from "./case-tool-service.js";
import { syncUserCaseToDb, getUser } from "../../../db/functions.js";

const giveCase = async (sender, id, count, ctx) => {
  try {
    const message = ctx.message.reply_to_message;
    const intCount = Number(count);
    if (!message) {
      return;
    }

    const receiverChatId = message.from.id;
    if (message.from.is_bot) {
      await ctx.reply("Зачем боту кейсы🧐");
      return;
    }

    const receiver = await getUser(receiverChatId);
    const receiverCase = await getUserCase(receiver.id);
    await syncUserCaseToDb(sender.id);
    await syncUserCaseToDb(receiver.id);
    const senderCase = await getUserCase(sender.id);
    const needCase = cases[id];

    if (!needCase) {
      await ctx.reply("Такого кейса нет😥");
      return;
    }

    const caseCount = senderCase[needCase.dbName];

    if (intCount > caseCount) {
      await ctx.reply(`У тебя не хватает ${needCase.name}📦`);
      return;
    }

    if (sender.id === receiver.id) {
      await ctx.reply(`Иди нахуй, так нельзя🖕`);
      return;
    }

    senderCase[needCase.dbName] -= intCount;
    receiverCase[needCase.dbName] += intCount;

    await ctx.replyWithHTML(
      `Ты успешно передал(а) ${intCount} ${needCase.name}[${id}] <a href="tg://user?id=${receiver.chatId}">${receiver.firstname}</a>`
    );

    await senderCase.save();
    await receiverCase.save();
  } catch (error) {
    console.log(error);
  }
};

const giveDonateCase = async (sender, id, count, ctx) => {
  try {
    const message = ctx.message.reply_to_message;
    const senderCase = await getUserCase(sender.id);
    if (!message) {
      return;
    }

    const receiverChatId = message.from.id;

    // проверяем, что отправитель не является ботом
    if (message.from.is_bot) {
      await ctx.reply("Зачем боту кейсы🧐");
      return;
    }

    const receiver = await User.findOne({
      where: { chatId: receiverChatId },
    });
    const receiverCase = await getUserCase(receiver.id);
    const needCase = id;

    if (needCase !== "донат") {
      await ctx.reply("Такого кейса нет😥");
      return;
    }

    if (count > senderCase.donate) {
      await ctx.reply(`У тебя не хватает кейсов донат кейсов📦`);
      return;
    }

    if (sender.id === receiver.id) {
      await ctx.reply(`Иди нахуй, так нельзя🖕`);
      return;
    }

    senderCase.donate -= count;
    receiverCase.donate += count;

    await ctx.reply(
      `Ты успешно передал(а) ${count} донаткейсов @${receiver.username}`
    );

    await senderCase.save();
    await receiverCase.save();
    await loseLog(sender, `донат кейс`, "передача другому юзеру");
    await giveResoursesLog(sender, receiver, `донат кейс`, `${count}`);
  } catch (error) {
    console.log(error);
  }
};

export { giveCase, giveDonateCase };
