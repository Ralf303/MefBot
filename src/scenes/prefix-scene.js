const { Scenes } = require("telegraf");
const { message } = require("telegraf/filters");
const buyPrefix = new Scenes.BaseScene("buyPrefix");
const changePrefix = new Scenes.BaseScene("changePrefix");

buyPrefix.enter(async (ctx) => {
  await ctx.reply("Не больше 16 символов!");
});

buyPrefix.on(message("text"), async (ctx) => {
  const preff = ctx.message.text;
  if (preff.length <= 16) {
    await ctx.reply(
      "Поздравляем с покупкой!\n\nОжидайте, вскоре администратор вам все выдаст"
    );
    await ctx.telegram.sendMessage(
      "1157591765",
      "Заявка на покупку!\n\nИмя покупателя @" +
        ctx.chat.username +
        "\n\nПрефикс: <code>" +
        preff +
        "</code>",
      { parse_mode: "HTML" }
    );
    ctx.scene.leave();
  } else {
    ctx.scene.reenter();
  }
});

changePrefix.enter(async (ctx) => {
  await ctx.reply("Не больше 16 символов!");
});

changePrefix.on(message("text"), async (ctx) => {
  const chapref = ctx.message.text;
  if (chapref.length <= 16) {
    await ctx.reply(
      "Поздравляем с покупкой!\n\nОжидайте, вскоре администратор вам все поменяет"
    );
    await ctx.telegram.sendMessage(
      "1157591765",
      "Заявка на покупку!\n\nИмя покупателя @" +
        ctx.chat.username +
        "\n\nСмена префикса: <code>" +
        chapref +
        "</code>",
      { parse_mode: "HTML" }
    );
    ctx.scene.leave();
  } else {
    ctx.scene.reenter();
  }
});

module.exports = { buyPrefix, changePrefix };
