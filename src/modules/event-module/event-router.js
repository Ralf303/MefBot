import { Composer } from "telegraf";
import items from "../items-module/items.js";
import { separateNumber } from "../../utils/helpers.js";
import { getUser } from "../../db/functions.js";

const eventRouter = new Composer();

eventRouter.hears(/^передать снежинки.*$/i, async (ctx, next) => {
  const chatId = ctx.from.id;
  const message = ctx.message.reply_to_message;

  if (!message) {
    return;
  }

  const receiverChatId = message.from.id;
  const amount = parseInt(ctx.message.text.split(" ")[2]);

  if (isNaN(amount) || amount <= 0) {
    return;
  }

  if (message.from.is_bot) {
    await ctx.reply("Зачем боту снежинки🧐");
    return;
  }

  try {
    const sender = await getUser(chatId);
    const receiver = await getUser(receiverChatId);

    if (sender.snows < amount) {
      await ctx.reply("Недостаточно снежинок🥲");
      return;
    }

    if (sender.id === receiver.id) {
      await ctx.reply(`Иди нахуй, так нельзя🖕`);
      return;
    }

    sender.snows -= amount;
    receiver.snows += amount;
    await sender.save();
    await receiver.save();
    await ctx.reply(
      `Ты успешно передал(а) ${amount} снежинок ${message.from.first_name}`
    );
    return next();
  } catch (error) {
    console.log(error);
    await ctx.reply("Ошибка при выполнении операции.");
  }
});

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
