import { getUser } from "../db/functions.js";
import { withUserTransaction } from "../services/transaction-service.js";
import { getFamilyByUserId } from "../modules/fam-module/fam-service.js";
import { Scenes } from "telegraf";
import { message } from "telegraf/filters";
import { createFamily } from "../modules/fam-module/fam-service.js";
const famName = new Scenes.BaseScene("famName");

famName.on(message("text"), async (ctx) => {
  const name = ctx.message.text;
  if (!name.trim() || name.length > 20)
    return ctx.reply("Название должно содержать от 1 до 20 символов!");

  const user = await getUser(ctx.from.id);
  const family = await withUserTransaction(user, async (locked, transaction) => {
    if (await getFamilyByUserId(ctx.from.id)) throw new Error("ALREADY_HAS_FAMILY");
    if (locked.balance < 5000000) throw new Error("INSUFFICIENT_FUNDS");
    const created = await createFamily(name, ctx.from.id);
    if (!created) throw new Error("FAMILY_CREATE_FAILED");
    locked.balance -= 5000000;
    await locked.save({ transaction });
    return created;
  });
  await ctx.reply(
    `Семья ${family.name} создана успешно!\n\n📖Семья описание (текст)\n📖Моя семья`
  );
  await ctx.scene.leave();
});

export { famName };
