import { Composer } from "telegraf";
import { channelPost } from "telegraf/filters";
import bonusService from "../../services/bonus-service.js";
import { adminChannels } from "../admin-module/admins.js";
import addServise from "../../services/add-servise.js";

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

export default channelRouter;
