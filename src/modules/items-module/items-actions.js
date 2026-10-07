import jwtService from "../../services/jwt-service.js";
import { purchaseAsset, tradeError } from "../../services/trade-service.js";
import { Composer } from "telegraf";
import { Item } from "../../db/models.js";
import { getUser } from "../../db/functions.js";
import { separateNumber } from "../../utils/helpers.js";
import { Keyboard, Key } from "telegram-keyboard";

const itemsActions = new Composer();

itemsActions.action(/^(t_|sell )/, async (ctx, next) => {
  try {
    const offer = jwtService.verifyTradeToken(ctx.callbackQuery.data);
    if (offer.kind !== "item") return next();
    const { id: itemId, senderId, receiverId, price } = offer;
    if (Number(ctx.from.id) !== Number(receiverId)) return ctx.answerCbQuery("Это предложение адресовано другому пользователю");
    await ctx.deleteMessage().catch(() => {});
    const receiver = ctx.state.user || await getUser(receiverId);
    const sender = await getUser(senderId);
    const item = await purchaseAsset({
      seller: sender, buyer: receiver, model: Item, id: itemId, price, inventory: true,
    });

    await ctx.reply(
      `Ты успешно купил(а) ${item.itemName} за ${separateNumber(price)} старок`
    );
    await ctx.telegram.sendMessage(
      sender.chatId,
      `Ты успешно продал(а) ${item.itemName}[${item.id}] за ${separateNumber(
        price
      )} старок`,
      { parse_mode: "HTML" }
    );
  } catch (error) {
    console.log(error);
    await ctx.reply(tradeError(error));
  }
});

itemsActions.action("cancel", async (ctx) => {
  try {
    await ctx.deleteMessage();
    await ctx.deleteMessage();
    await ctx.reply("Сделка успешно отменена.");
  } catch (error) {
    console.log(error);
  }
});

itemsActions.action("next", async (ctx) => {
  try {
    await ctx.deleteMessage();
    await ctx.deleteMessage();
    let buttons = Keyboard.inline([Key.callback("🔽Закрыть🔽", "dell")]);

    const user = await getUser(
      ctx.from.id,
      ctx.from.first_name,
      ctx.from.username
    );
    const items = await user.getItems();

    const categories = {
      head: "Голова",
      face: "Лицо",
      legs: "Ноги",
      leg1: "Ноги",
      leg2: "Ноги",
      left: "Рука(L)",
      right: "Рука(R)",
      extra: "Прочее",
      default: "Прочее",
    };

    const categorizedItems = {
      Голова: [],
      Лицо: [],
      Ноги: [],
      "Рука(L)": [],
      "Рука(R)": [],
      Прочее: [],
    };

    items.forEach((item) => {
      const category = categories[item.bodyPart] || categories.default;
      categorizedItems[category].push(
        `${item.itemName}[<code>${item.id}</code>](+${item.lvl})`
      );
    });

    const inventoryMessage = Object.entries(categorizedItems)
      .map(([category, items]) => {
        if (items.length > 0) {
          return `• ${category}:\n${items.join("\n")}`;
        }
        return "";
      })
      .filter((section) => section)
      .join("\n\n");

    if (inventoryMessage.length > 4000) {
      const nextPage = inventoryMessage.split("\n").slice(150).join("\n");
      buttons = Keyboard.inline([
        [Key.callback("Дальше", "next")],
        [Key.callback("🔽Закрыть🔽", "dell")],
      ]);

      await ctx.telegram.sendMessage(user.chatId, nextPage, {
        parse_mode: "HTML",
        reply_markup: buttons.reply_markup,
      });
    } else {
      const message = `Твой инвентарь:\n\n${inventoryMessage}\n\n📖Надеть id\n📖Удалить вещь id\n📖Передать вещь id\n📖Узнать айди id`;
      await ctx.telegram.sendMessage(user.chatId, message, {
        parse_mode: "HTML",
        reply_markup: buttons.reply_markup,
      });
    }
  } catch (error) {
    console.error(error);
  }
});

export default itemsActions;
