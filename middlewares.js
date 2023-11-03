const { Composer } = require("telegraf");
const { chatCommands } = require("./commands/chatcommands.js");
const bonusService = require("./services/bonus-service.js");

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
    const [word1, word2] = message.split(" ");

    if (word1 === "раздача" && word2) {
      bonusService.sendEvent(ctx, word2);
    }
  }

  next();
});
middleware.use(require("./counter/chatCounter.js"));
middleware.use(require("./actions/actionOnBuy.js"));
middleware.use(require("./commands/commands.js"));
middleware.use(require("./actions/shopActions.js"));
middleware.use(chatCommands);
middleware.use(require("./commands/privatCommands.js"));
middleware.use(require("./commands/spamCommands.js"));
middleware.use(require("./commands/adminCommands.js"));
middleware.use(require("./logs/securityLogs.js"));
module.exports = middleware;
