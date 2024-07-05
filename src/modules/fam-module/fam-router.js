const { Composer } = require("telegraf");
const { message } = require("telegraf/filters");
const { getUser } = require("../../db/functions");

const famModule = new Composer();

famModule.on(message("text"), async (ctx) => {
  try {
    const user = await getUser(
      ctx.from.id,
      ctx.from.first_name,
      ctx.from.username
    );
  } catch (error) {
    console.log(error);
  }
});
