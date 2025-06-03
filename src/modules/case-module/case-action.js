import { Composer } from "telegraf";
import { getUser } from "../../db/functions.js";
import { deleteItem } from "../items-module/items-utils/items-functions.js";

const caseActon = new Composer();

caseActon.action(/^Удалить вещь/, async (ctx) => {
  try {
    const user = await getUser(ctx.callbackQuery.from.id);
    const result = await deleteItem(user, ctx.callbackQuery.data.split(" ")[2]);

    await ctx.answerCbQuery(result);
    await ctx.deleteMessage();
  } catch (error) {
    console.log(error);
  }
});

export default caseActon;
