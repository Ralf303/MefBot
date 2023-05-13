const { Composer } = require("telegraf");
const { chatCommands } = require("./commands/chatCommands.js");

const middleware = new Composer();

middleware.use(require("./actions/actionOnBuy.js"));
middleware.use(require("./commands/commands.js"));
middleware.use(require("./actions/actions.js"));
middleware.use(chatCommands);
middleware.use(require("./counterScripts/ChatCounter.js"));

module.exports = middleware;
