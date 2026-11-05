import { transferCurrency } from "../../services/currency-transfer-command.js";
import { Composer } from "telegraf";
import items from "../items-module/items.js";
import { separateNumber } from "../../utils/helpers.js";

const eventRouter = new Composer();

eventRouter.hears(/^передать\s+снежинки(?:\s|$)/i, (ctx) => transferCurrency(ctx, "snows"));

eventRouter.hears(/^нг магазин*$/i, async (ctx) => {
  try {
    let result = "🎄Новогодний магазин🎄\n\n";

    const sortedItems = Object.entries(items)
      .filter(([key, item]) => item.class === "event")
      .sort(([, itemA], [, itemB]) => itemA.price - itemB.price);

    for (const [key, item] of sortedItems) {
      result += `• ${item.name}[<code>${key}</code>] Цена: ${separateNumber(
        item.price
      )} ❄️\n`;
    }

    result += `\n📖Примерить вещь {id}\n📖Купить вещь {id}\n📖Инфа {id}`;
    await ctx.reply(result, { parse_mode: "HTML" });
  } catch (error) {
    console.log(error);
  }
});

export default eventRouter;
