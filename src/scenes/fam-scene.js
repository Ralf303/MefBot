const { Scenes } = require("telegraf");
const { message } = require("telegraf/filters");
const { createFamily } = require("../modules/fam-module/fam-service");
const famName = new Scenes.BaseScene("famName");

famName.on(message("text"), async (ctx) => {
  const name = ctx.message.text;
  if (name.length > 20)
    await ctx.reply("Название может быть не больше 20 символов!");

  const family = await createFamily(name, ctx.from.id);
  await ctx.reply(
    `Семья ${family.name} создана успешно!\n\n📖Семья описание (текст)\n📖Семья магазин\n📖Моя семья`
  );
  await ctx.scene.leave();
});

module.exports = { famName };
