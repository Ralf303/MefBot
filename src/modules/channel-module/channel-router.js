const { Composer } = require("telegraf");
const { channelPost } = require("telegraf/filters");
const bonusService = require("../../services/bonus-service");
const { adminChannels } = require("../admin-module/admins");

const channelRouter = new Composer();

channelRouter.on(channelPost("text"), async (ctx, next) => {
  try {
    if (!adminChannels.includes(ctx.chat.id)) {
      return;
    }

    const text = ctx.text.toLowerCase();
    const [word1, word2, word3, word4] = text.split(" ");

    if (text === "бонус") {
      bonusService.createBonus(ctx);
    }

    if (word1 === "раздача" && word2) {
      bonusService.sendEvent(ctx, word2);
    }

    if (word1 === "реклама" && word2) {
      addServise.send(ctx, word2, word3, word4);
    }
    return next();
  } catch (error) {
    console.log(error);
  }
});

module.exports = channelRouter;
