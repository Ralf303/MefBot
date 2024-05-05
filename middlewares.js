const { Composer } = require("telegraf");

const middleware = new Composer();

middleware.use(require("./src/modules/items-module/items-actions.js"));
middleware.use(require("./src/modules/case-module/case-action.js"));
middleware.use(require("./src/actions/actionOnBuy.js"));
middleware.use(require("./src/actions/shopActions.js"));
middleware.use(require("./src/modules/game-module/dice-actions.js"));
middleware.use(require("./src/modules/vipChat-module/vipChat-actions.js"));
middleware.use(require("./src/modules/commands-module/commands-router.js"));
middleware.use(require("./src/modules/vipChat-module/vipChat-router.js"));
middleware.use(require("./src/modules/main-module/main-router.js"));
middleware.use(require("./src/modules/active-module/active-router.js"));
middleware.use(require("./src/modules/case-module/case-router.js"));
middleware.use(require("./src/modules/craft-module/craft-router.js"));
middleware.use(require("./src/modules/mef-module/mef-router.js"));
middleware.use(require("./src/modules/gems-module/gems-router.js"));
middleware.use(require("./src/modules/keys-module/keys-router.js"));
middleware.use(require("./src/modules/items-module/items-router.js"));
middleware.use(require("./src/modules/admin-module/admin-router.js"));
middleware.use(require("./src/modules/logs-module/logs-router.js"));
middleware.use(require("./src/modules/channel-module/channel-router.js"));
middleware.use(require("./src/modules/game-module/game-router.js"));
middleware.use(require("./src/modules/capcha-module/capcha-router.js"));

module.exports = middleware;
