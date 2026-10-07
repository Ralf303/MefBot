import { Composer } from "telegraf";
import { message } from "telegraf/filters";

import cases from "./cases.js";
import { getUser, getChat, syncUserCaseToDb } from "../../db/functions.js";
import { getCaseInfo, getUserCase } from "./case-utils/case-tool-service.js";
import {
  buyCase,
  openCase,
  openDonateCase,
} from "./case-utils/open-case-service.js";
import ru_text from "../../../ru_text.js";
import { giveCase, giveDonateCase } from "./case-utils/give-case-service.js";

const caseRouter = new Composer();

caseRouter.on(message("text"), async (ctx, next) => {
  try {
    const userMessage = ctx.message.text.toLowerCase();
    const [word1, word2, word3, word4] = userMessage.split(" ");
    if (!["мои старкейсы", "старкейсы"].includes(userMessage) &&
        !["передать", "купить", "инфо", "инфа", "открыть"].includes(word1)) return next();
    let chat;
    if (ctx.chat.type !== "private" && (word1 === "открыть" || userMessage === "старкейсы")) {
      chat = await getChat(ctx.chat.id);
    }

    const isSpam = chat?.allowCase === true || ctx.chat.type === "private";

    if (userMessage == "мои старкейсы") {
      await syncUserCaseToDb(ctx.state.user.id);
      const userCase = await getUserCase(ctx.state.user.id);
      let result = "Твои старкейсы:\n";
      let i = 1;
      for (const item in cases) {
        if (cases[item].dbName == "donate") continue;
        result += `${i}) ${cases[item].name} - ${
          userCase[cases[item].dbName]
        } шт.\n`;
        i++;
      }
      await ctx.reply(
        result +
          "\n💰Донат кейс - " +
          userCase.donate +
          "шт💰\n\n📖Открыть id\n📖Открыть донат\n📖Передать старкейс id [кол-во]\n📖Передать старкейс донат [кол-во]"
      );
    }

    if (word1 == "передать") {
      const id = Number(word3);
      const count =
        isNaN(Number(word4)) || Number(word4) < 1 ? 1 : Number(word4);

      if (word2 == "старкейс" && !isNaN(id)) {
        await giveCase(ctx.state.user, id, count, ctx);
      }

      if (word2 == "старкейс" && word3 === "донат") {
        await giveDonateCase(ctx.state.user, word3, count, ctx);
      }
    }

    if (userMessage == "инфа старкейс донат") {
      await ctx.reply(
        "❗️Донат кейс❗️\n\nВыпадает любая случайная вещь, от обычных до донатных"
      );
    }

    if (word1 == "купить" && word2 == "старкейс") {
      const count =
        isNaN(Number(word4)) || Number(word4) < 1 ? 1 : Number(word4);

      if (word3 === "донат") {
        await buyCase(ctx.state.user, "donate", count, ctx);
      } else if (!isNaN(word3)) {
        await buyCase(ctx.state.user, word3, count, ctx);
      }
    }

    if (word1 == "инфо" || word1 == "инфа") {
      if (word2 == "старкейс" && !isNaN(Number(word3))) {
        getCaseInfo(Number(word3), ctx);
      }
    }

    if (word1 == "открыть" && isSpam) {
      const id = Number(word2);
      const count =
        isNaN(Number(word3)) || Number(word3) < 1 ? 1 : Number(word3);

      if (word2 === "донат") {
        await openDonateCase(ctx.state.user, ctx);
      } else if (!isNaN(id)) {
        await openCase(ctx.state.user, id, ctx, count);
      } else if (word1 == "открыть") {
        await ctx.reply(
          "Не правильное использование команды\n\nПопробуй\nОткрыть id [кол-во]"
        );
      }
    } else if (word1 == "открыть") {
      await ctx.reply(ru_text.no_case_in_chat);
    }

    if (userMessage == "старкейсы" && isSpam) {
      let result = "Доступные кейсы:\n";
      let i = 1;
      for (const item in cases) {
        if (cases[item].dbName == "donate") continue;

        let price = cases[item].price;
        if (cases[item].class == "gem") {
          price += ` гемов`;
        } else if (cases[item].class == "fam") {
          price += ` семейных монет`;
        } else {
          price += ` старок`;
        }
        result += `${i}) ${cases[item].name}: ${price}\n`;
        i++;
      }
      await ctx.reply(
        result +
          "💰Донат кейс: 25 искр💰\n\n📖Купить старкейс id [кол-во]\n📖Купить старкейс донат [кол-во]\n📖Инфа старкейс id\n📖Инфа старкейс донат"
      );
    } else if (userMessage == "старкейсы") {
      await ctx.reply(ru_text.no_case_in_chat);
    }

    return next();
  } catch (e) {
    await ctx.reply("Какая то ошибка, " + e);
  }
});

export default caseRouter;
