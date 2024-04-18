const { Composer } = require("telegraf");
const { getUser } = require("../../db/functions");
const { deleteItem } = require("../items-module/items-utils/items-functions");

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

module.exports = caseActon;
