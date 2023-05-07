const { Scenes } = require("telegraf");

class ScenesGenerator {
  prefix(bot) {
    const BuyPrefix = new Scenes.BaseScene("BuyPrefix");
    BuyPrefix.enter(async (ctx) => {
      await ctx.reply("Не больше 16 символов!");
    });
    BuyPrefix.on("text", async (ctx) => {
      const preff = ctx.message.text;
      if (preff.length <= 16) {
        ctx.reply(
          "Поздравляем с покупкой!\n\nОжидайте, вскоре администратор вам все выдаст"
        );
        await bot.telegram.sendMessage(
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
    return BuyPrefix;
  }

  ChangePrefix(bot) {
    const ChangePrefix = new Scenes.BaseScene("ChangePrefix");
    ChangePrefix.enter(async (ctx) => {
      await ctx.reply("Не больше 16 символов!");
    });
    ChangePrefix.on("text", async (ctx) => {
      const chapref = ctx.message.text;
      if (chapref.length <= 16) {
        ctx.reply(
          "Поздравляем с покупкой!\n\nОжидайте, вскоре администратор вам все поменяет"
        );
        await bot.telegram.sendMessage(
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
    return ChangePrefix;
  }
}

module.exports = { ScenesGenerator };
