import { Scenes } from "telegraf";
import { message } from "telegraf/filters";
import { createFamily } from "../modules/fam-module/fam-service.js";
const famName = new Scenes.BaseScene("famName");

famName.on(message("text"), async (ctx) => {
  const name = ctx.message.text;
  if (name.length > 20)
    await ctx.reply("Название может быть не больше 20 символов!");

  const family = await createFamily(name, ctx.from.id);
  await ctx.reply(
    `Семья ${family.name} создана успешно!\n\n📖Семья описание (текст)\n📖Моя семья`
  );
  await ctx.scene.leave();
});

export { famName };
