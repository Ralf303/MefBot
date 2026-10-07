import { withUserTransaction } from "../../services/transaction-service.js";
import { Composer } from "telegraf";
import { getUser } from "../../db/functions.js";
import { getFamilyByUserId, deleteFam } from "./fam-service.js";

const famActions = new Composer();

famActions.action(/^fam(\d+)$/, async (ctx) => {
  try {
    const userId = ctx.match[1];
    if (Number(userId) !== Number(ctx.from.id)) return ctx.answerCbQuery("Это чужая кнопка");

    await ctx.deleteMessage();
    const user = await getUser(userId);

    if (user.balance < 5000000) {
      return await ctx.reply("Недостаточно старок для создания семьи 😢");
    }

    if (await getFamilyByUserId(ctx.from.id)) return ctx.reply("У тебя уже есть семья");
    await ctx.reply(
      "Отлично, теперь введи название своей семьи 🪧 (не больше 20 символов)"
    );
    await ctx.scene.enter("famName");
  } catch (error) {
    console.log(error);
  }
});

famActions.action(/^check(\d+)$/, async (ctx) => {
  try {
    const userId = ctx.match[1];

    if (userId != ctx.from.id) {
      return await ctx.answerCbQuery("Не тыкай куда не следует 😡");
    }

    await ctx.deleteMessage();
    const fam = await withUserTransaction(ctx.state.user, async (user) => {
      const family = await getFamilyByUserId(ctx.from.id);
      if (!family) throw new Error("FAMILY_NOT_FOUND");
      if (family.check) throw new Error("ALREADY_CHECKED");
      if (user.balance < 10000000) throw new Error("INSUFFICIENT_FUNDS");
      user.balance -= 10000000;
      family.slots += 10;
      family.check = true;
      await user.save();
      await family.save();
      return family;
    });
    await ctx.reply(
      `Поздравляю, семья «${fam.name}» успешно получила галочку 🎉`
    );
  } catch (error) {
    console.log(error);
  }
});

famActions.action(/^deleteFam$/, async (ctx) => {
  await ctx.deleteMessage();

  const fam = await getFamilyByUserId(ctx.from.id);
  if (!fam || String(fam.owner) !== String(ctx.from.id)) return ctx.reply("Удалить семью может только основатель");
  await deleteFam(fam.id);
  await ctx.reply(`Семья успешно удалена 🗑`);
});

export default famActions;
