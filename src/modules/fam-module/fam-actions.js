import { Composer } from "telegraf";
import { getUser } from "../../db/functions.js";
import { getFamilyByUserId, deleteFam } from "./fam-service.js";

const famActions = new Composer();

famActions.action(/fam(\d+)/, async (ctx) => {
  try {
    const userId = ctx.match[1];

    await ctx.deleteMessage();
    const user = await getUser(userId);

    if (user.balance < 5000000) {
      return await ctx.reply("Недостаточно старок для создания семьи 😢");
    }

    user.balance -= 5000000;
    await user.save();
    await ctx.reply(
      "Отлично, теперь введи название своей семьи 🪧 (не больше 20 символов)"
    );
    await ctx.scene.enter("famName");
  } catch (error) {
    console.log(error);
  }
});

famActions.action(/check(\d+)/, async (ctx) => {
  try {
    const userId = ctx.match[1];

    if (userId != ctx.from.id) {
      return await ctx.answerCbQuery("Не тыкай куда не следует 😡");
    }

    await ctx.deleteMessage();
    const fam = await getFamilyByUserId(ctx.from.id);
    if (!fam) return await ctx.reply("У тебя нет семьи 😢");
    if (fam.check) return await ctx.reply("У твоей семьи уже есть галочка ✅");

    const user = await getUser(userId);

    if (user.balance < 10000000) {
      return await ctx.reply("Недостаточно старок для покупки галочки 😢");
    }

    user.balance -= 10000000;
    fam.slots += 10;
    fam.check = true;
    await user.save();
    await fam.save();
    await ctx.reply(
      `Поздравляю, семья «${fam.name}» успешно получила галочку 🎉`
    );
  } catch (error) {
    console.log(error);
  }
});

famActions.action(/deleteFam/, async (ctx) => {
  await ctx.deleteMessage();

  const fam = await getFamilyByUserId(ctx.chat.id);
  await deleteFam(fam.id);
  await ctx.reply(`Семья успешно удалена 🗑`);
});

export default famActions;
