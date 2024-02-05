const { Composer } = require("telegraf");
const { chatCommands } = require("./commands/chatcommands.js");
const bonusService = require("./services/bonus-service.js");
const addServise = require("./services/add-servise.js");

const middleware = new Composer();

middleware.use((ctx, next) => {
  const { channelPost } = ctx;

  if (
    channelPost &&
    channelPost.text &&
    channelPost.text.toLowerCase() == "бонус"
  ) {
    bonusService.createBonus(ctx);
  }

  if (channelPost && channelPost.text) {
    const message = channelPost.text.toLowerCase();
    const [word1, word2, word3, word4] = message.split(" ");

    if (word1 === "раздача" && word2) {
      bonusService.sendEvent(ctx, word2);
    }

    if (word1 === "реклама" && word2) {
      addServise.send(ctx, word2, word3, word4);
    }
  }

  next();
});
middleware.use(require("./counter/chatCounter.js"));
middleware.use(require("./actions/actionOnBuy.js"));
middleware.use(require("./commands/commands.js"));
middleware.use(require("./actions/shopActions.js"));
middleware.use(require("./commands/privatCommands.js"));
middleware.use(require("./commands/spamCommands.js"));
middleware.use(require("./commands/adminCommands.js"));
middleware.use(require("./logs/securityLogs.js"));
middleware.use(chatCommands);
module.exports = middleware;
