import cases from "../cases.js";
import { getUserCase } from "./case-tool-service.js";
import { syncUserCaseToDb } from "../../../db/functions.js";
import { resolveReceiver } from "../../../utils/helpers.js";

const giveCase = async (sender, id, count, ctx) => {
  try {
    const intCount = Number(count);
    const needCase = cases[id];
    if (!needCase) {
      await ctx.reply("Такого кейса нет😥");
      return;
    }

    let resolved;
    try {
      resolved = await resolveReceiver(ctx);
    } catch (e) {
      switch (e.message) {
        case "BOT_REJECT":
          return ctx.reply("Зачем боту кейсы🧐");
        case "NO_TARGET":
          return ctx.reply("Сделай реплай на сообщение или укажи @username.");
        case "NOT_FOUND":
          return ctx.reply("Пользователь с таким username не найден.");
        case "SELF_TRANSFER":
          return ctx.reply("Иди нахуй, так нельзя🖕");
        default:
          throw e;
      }
    }

    const { receiver, transferredViaUsername } = resolved;
    await syncUserCaseToDb(sender.id);
    await syncUserCaseToDb(receiver.id);
    const senderCase = await getUserCase(sender.id);
    const receiverCase = await getUserCase(receiver.id);

    const have = senderCase[needCase.dbName] || 0;
    if (intCount > have) {
      return ctx.reply(`У тебя не хватает ${needCase.name}📦`);
    }

    senderCase[needCase.dbName] -= intCount;
    receiverCase[needCase.dbName] += intCount;
    await senderCase.save();
    await receiverCase.save();

    await ctx.replyWithHTML(
      `Ты успешно передал(а) ${intCount} ${needCase.name} ` +
        `<a href="tg://user?id=${receiver.chatId}">${receiver.firstname}</a>`
    );

    if (transferredViaUsername) {
      try {
        await ctx.telegram.sendMessage(
          receiver.chatId,
          `Тебе передали ${intCount} ${needCase.name} от ${ctx.from.first_name}`
        );
      } catch (err) {
        console.log("Не удалось отправить личку:", err.message);
      }
    }
  } catch (error) {
    console.error("giveCase error:", error);
  }
};

const giveDonateCase = async (sender, id, count, ctx) => {
  try {
    const intCount = Number(count);
    if (id !== "донат") {
      return ctx.reply("Такого кейса нет😥");
    }

    let resolved;
    try {
      resolved = await resolveReceiver(ctx);
    } catch (e) {
      switch (e.message) {
        case "BOT_REJECT":
          return ctx.reply("Зачем боту кейсы🧐");
        case "NO_TARGET":
          return ctx.reply("Сделай реплай на сообщение или укажи @username.");
        case "NOT_FOUND":
          return ctx.reply("Пользователь с таким username не найден.");
        case "SELF_TRANSFER":
          return ctx.reply("Иди нахуй, так нельзя🖕");
        default:
          throw e;
      }
    }

    const { receiver, transferredViaUsername } = resolved;
    const senderCase = await getUserCase(sender.id);
    const receiverCase = await getUserCase(receiver.id);

    if (intCount > senderCase.donate) {
      return ctx.reply(`У тебя не хватает кейсов донат кейсов📦`);
    }

    senderCase.donate -= intCount;
    receiverCase.donate += intCount;
    await senderCase.save();
    await receiverCase.save();

    await ctx.reply(
      `Ты успешно передал(а) ${intCount} донат кейсов ` +
        `<a href="tg://user?id=${receiver.chatId}">${receiver.firstname}</a>`,
      { parse_mode: "HTML" }
    );

    if (transferredViaUsername) {
      try {
        await ctx.telegram.sendMessage(
          receiver.chatId,
          `Тебе передали ${intCount} донат кейсов от ${ctx.from.first_name}`
        );
      } catch (err) {
        console.log("Не удалось отправить личку:", err.message);
      }
    }
  } catch (error) {
    console.error("giveDonateCase error:", error);
  }
};

export { giveCase, giveDonateCase };
