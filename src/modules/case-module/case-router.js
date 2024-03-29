const { Composer } = require("telegraf");
const { message } = require("telegraf/filters");

const cases = require("./cases");
const { getUser, getChat } = require("../../db/functions");
const { getCaseInfo } = require("./case-utils/case-tool-service");
const {
  buyCase,
  openCase,
  openDonateCase,
} = require("./case-utils/open-case-service");
const ru_text = require("../../../ru_text");
const { giveCase, giveDonateCase } = require("./case-utils/give-case-service");
const caseRouter = new Composer();

caseRouter.on(message("text"), async (ctx, next) => {
  try {
    const user = await getUser(
      ctx.from.id,
      ctx.from.first_name,
      ctx.from.username
    );
    const userMessage = ctx.message.text.toLowerCase();
    const [word1, word2, word3, word4] = userMessage.split(" ");
    let chat;
    if (ctx.chat.type !== "private") {
      chat = await getChat(ctx.chat.id);
    }

    const isSpam = chat?.allowCase === true || ctx.chat.type === "private";

    if (userMessage == "мои мефкейсы") {
      let result = "Ваши мефкейсы:\n";
      let i = 1;
      for (const item in cases) {
        result += `${i}) ${cases[item].name} - ${
          user.case[cases[item].dbName]
        } шт.\n`;
        i++;
      }
      await ctx.reply(
        result +
          "\n💰Донат кейс - " +
          user.case.donate +
          "шт💰\n\n📖Открыть id\n📖Открыть донат\n📖Передать мефкейс id\n📖Передать мефкейс донат"
      );
    }

    if (word1 == "передать") {
      const id = Number(word3);
      const count = isNaN(Number(word4)) ? 1 : word4;

      if (word2 == "мефкейс" && !isNaN(id)) {
        await giveCase(user, id, count, ctx);
        return;
      }

      if (word2 == "мефкейс" && word3 === "донат") {
        await giveDonateCase(user, word3, count, ctx);
        return;
      }
    }

    if (userMessage == "инфа мефкейс донат") {
      await ctx.reply(
        "❗️Донат кейс❗️\n\nВыпадает любая случайная вещь, от обычных до донатных"
      );
    }

    if (word1 == "купить") {
      const id = Number(word3);
      const count = isNaN(Number(word4)) ? 1 : word4;

      if (word2 == "мефкейс" && !isNaN(id)) {
        await buyCase(user, id, count, ctx);
      }
    }

    if (word1 == "инфо" || word1 == "инфа") {
      if (word2 == "мефкейс" && !isNaN(Number(word3))) {
        getCaseInfo(Number(word3), ctx);
      }
    }

    if (word1 == "открыть" && isSpam) {
      const id = Number(word2);

      if (word2 === "донат") {
        await openDonateCase(user, ctx);
        return;
      }

      if (!isNaN(id)) {
        await openCase(user, id, ctx);
        return;
      } else if (word1 == "открыть") {
        await ctx.reply(
          "Не правильное использование команды\n\nПопробуйте\n<<Открыть Id>>"
        );
      }
    } else if (word1 == "открыть") {
      await ctx.reply(ru_text.no_case_in_chat);
    }

    if (userMessage == "мефкейсы" && isSpam) {
      let result = "Доступные кейсы:\n";
      let i = 1;
      for (const item in cases) {
        let price = cases[item].price;
        if (cases[item].class) {
          price += ` гемов`;
        } else {
          price += ` MF`;
        }
        result += `${i}) ${cases[item].name} Цена: ${price}\n`;
        i++;
      }
      await ctx.reply(result + "\n📖Купить мефкейс id\n📖Инфа мефкейс id");
    } else if (userMessage == "мефкейсы") {
      await ctx.reply(ru_text.no_case_in_chat);
    }

    await user.save();
    return next();
  } catch (e) {
    await ctx.reply("Какая то ошибка, " + e);
  }
});

module.exports = caseRouter;
