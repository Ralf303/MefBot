const { Composer } = require("telegraf");
const { getUser } = require("./src/db/functions.js");

const middleware = new Composer();

middleware.use(async (ctx, next) => {
  try {
    if (ctx.chat.type === "channel") return next();
    ctx.state.user = await getUser(
      ctx.from.id,
      ctx.from.first_name,
      ctx.from.username
    );
    return next();
  } catch (error) {
    console.log(error);
  }
});
middleware.use(require("./src/modules/items-module/items-actions.js"));
middleware.use(require("./src/modules/home-module/home-router.js"));
middleware.use(require("./src/modules/home-module/home-actions.js"));
middleware.use(require("./src/modules/fam-module/fam-actions.js"));
middleware.use(require("./src/modules/case-module/case-action.js"));
middleware.use(require("./src/actions/actionOnBuy.js"));
middleware.use(require("./src/actions/shopActions.js"));
middleware.use(require("./src/modules/game-module/dice-actions.js"));
middleware.use(require("./src/modules/vipChat-module/vipChat-actions.js"));
middleware.use(require("./src/modules/fam-module/fam-router.js"));
middleware.use(require("./src/modules/stone-module/stone-router.js"));
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
middleware.use(async (ctx) => {
  try {
    if (ctx.chat.type === "channel") return;
    await ctx.state.user.save();
  } catch (error) {
    console.log(error);
  }
});

module.exports = middleware;
