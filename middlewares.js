import { Composer } from "telegraf";
import { getUser } from "./src/db/functions.js";
import itemsActions from "./src/modules/items-module/items-actions.js";
import mineRouter from "./src/modules/mine-module/mine-router.js";
import homeRouter from "./src/modules/home-module/home-router.js";
import homeActions from "./src/modules/home-module/home-actions.js";
import famActions from "./src/modules/fam-module/fam-actions.js";
import caseAction from "./src/modules/case-module/case-action.js";
import actionOnBuy from "./src/actions/actionOnBuy.js";
import shopActions from "./src/actions/shopActions.js";
import diceActions from "./src/modules/game-module/dice-actions.js";
import vipChatActions from "./src/modules/vipChat-module/vipChat-actions.js";
import famRouter from "./src/modules/fam-module/fam-router.js";
import stoneRouter from "./src/modules/stone-module/stone-router.js";
import commandsRouter from "./src/modules/commands-module/commands-router.js";
import vipChatRouter from "./src/modules/vipChat-module/vipChat-router.js";
import mainRouter from "./src/modules/main-module/main-router.js";
import activeRouter from "./src/modules/active-module/active-router.js";
import caseRouter from "./src/modules/case-module/case-router.js";
import craftRouter from "./src/modules/craft-module/craft-router.js";
import mefRouter from "./src/modules/mef-module/mef-router.js";
import gemsRouter from "./src/modules/gems-module/gems-router.js";
import keysRouter from "./src/modules/keys-module/keys-router.js";
import itemsRouter from "./src/modules/items-module/items-router.js";
import adminRouter from "./src/modules/admin-module/admin-router.js";
import logsRouter from "./src/modules/logs-module/logs-router.js";
import channelRouter from "./src/modules/channel-module/channel-router.js";
import gameRouter from "./src/modules/game-module/game-router.js";
import capchaRouter from "./src/modules/capcha-module/capcha-router.js";
import donateRouter from "./src/modules/donate-module/donate-router.js";
import donatAction from "./src/modules/donate-module/donate-action.js";
import cardRouter from "./src/modules/card-module/card-router.js";
import cardActions from "./src/modules/card-module/card-action.js";
import oilRouter from "./src/modules/oil-module/oil-router.js";
import freezeRouter from "./src/modules/freeze-module/freeze-router.js";
// import eventRouter from "./src/modules/event-module/event-router.js";

const middleware = new Composer();

middleware.use(async (ctx, next) => {
  try {
    if (ctx.chat?.type === "channel" || ctx.preCheckoutQuery) return next();
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
middleware.use(itemsActions);
middleware.use(mineRouter);
middleware.use(homeRouter);
middleware.use(homeActions);
middleware.use(famActions);
middleware.use(caseAction);
middleware.use(actionOnBuy);
middleware.use(shopActions);
middleware.use(diceActions);
middleware.use(vipChatActions);
middleware.use(famRouter);
middleware.use(stoneRouter);
middleware.use(commandsRouter);
middleware.use(vipChatRouter);
middleware.use(mainRouter);
middleware.use(activeRouter);
middleware.use(caseRouter);
middleware.use(craftRouter);
middleware.use(mefRouter);
middleware.use(gemsRouter);
middleware.use(keysRouter);
middleware.use(itemsRouter);
middleware.use(adminRouter);
middleware.use(logsRouter);
middleware.use(channelRouter);
middleware.use(gameRouter);
middleware.use(capchaRouter);
middleware.use(donateRouter);
middleware.use(donatAction);
middleware.use(cardRouter);
middleware.use(cardActions);
middleware.use(oilRouter);
middleware.use(freezeRouter);
// middleware.use(eventRouter);

middleware.use(async (ctx) => {
  try {
    if (ctx.chat.type === "channel") return;
    await ctx.state.user.save();
  } catch (error) {
    console.log(error);
  }
});

export default middleware;
