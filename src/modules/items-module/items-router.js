const { Composer } = require("telegraf");
const { message } = require("telegraf/filters");

const { shopGenerator } = require("../../utils/helpers.js");
const { getUser } = require("../../db/functions.js");
const items = require("./items.js");
const {
  getInventory,
  deleteItem,
  removeItem,
  buyItem,
} = require(".//items-utils/items-functions.js");
const ru_text = require("../../../ru_text.js");
const { wearItem } = require("./items-utils/wear-item-service.js");
const {
  tryItem,
  getWornItems,
} = require("./items-utils/blend-items-service.js");
const { getItemInfo, checkId } = require("./items-utils/item-tool-service.js");
const { giveItem } = require("./items-utils/give-item-service.js");
const itemsRouter = new Composer();

itemsRouter.on(message("text"), async (ctx, next) => {
  try {
    const user = await getUser(
      ctx.from.id,
      ctx.from.first_name,
      ctx.from.username
    );
    const userMessage = ctx.message.text.toLowerCase();
    const [word1, word2, word3] = userMessage.split(" ");
    const isPrivate = ctx.chat.type === "private";

    if (userMessage == "пупсы") {
      try {
        await ctx.telegram.sendMessage(ctx.from.id, ru_text.pups);

        if (ctx.chat.type !== "private") {
          await ctx.replyWithHTML(
            'Информация о пупсах отправлена в <a href="https://t.me/PablMefBot">ЛС бота</a>',
            {
              reply_to_message_id: ctx.message.message_id,
              disable_web_page_preview: true,
            }
          );
        }
      } catch (error) {
        console.log(error);
        await ctx.reply(ru_text.pups_err, {
          reply_to_message_id: ctx.message.message_id,
        });
      }
    }

    if (word1 == "примерить" && isPrivate) {
      const id = Number(word2);
      const itemInfo = items[id];
      if (!isNaN(id)) {
        await tryItem(itemInfo, ctx, id);
      } else {
        await ctx.reply(
          "Не правильное использование команды\n\nПопробуй\n<<Примерить {Id вещи}>>"
        );
      }
    } else if (word1 == "примерить") {
      await ctx.reply("Данная команда доступна только в лс");
    }

    if (word1 == "узнать") {
      const id = Number(word3);

      if (!isNaN(id) && word2 == "айди") {
        await checkId(id, ctx);
        return;
      }
    }

    if (userMessage == "инвентарь") {
      await getInventory(user, ctx);
    }

    if (word1 == "удалить") {
      const id = Number(word3);
      if (!isNaN(id) && word2 == "вещь") {
        await deleteItem(user, id, ctx);
      }
    }

    if (word1 == "снять") {
      const id = Number(word2);
      if (!isNaN(id)) {
        await removeItem(user, id, ctx);
      }
    }

    if (word1 == "передать") {
      const id = Number(word3);

      if (word2 == "вещь" && !isNaN(id)) {
        await giveItem(user, id, ctx);
        return;
      }
    }

    if (word1 == "надеть") {
      const id = Number(word2);
      if (!isNaN(id)) {
        await wearItem(user, id, ctx);
      }
    }

    if (userMessage == "мой пабло") {
      await getWornItems(user, ctx);
    }

    if (word1 == "донат") {
      await shopGenerator("4", ctx);
    }

    if (word1 == "купить") {
      const id = Number(word3);
      const itemInfo = items[id];

      if (word2 == "вещь" && itemInfo && !isNaN(id)) {
        await buyItem(user, itemInfo, ctx, true);
      } else if (word2 == "вещь") {
        await ctx.reply("Такой вещи нет");
      }
    }

    if (word1 == "инфо" || word1 == "инфа") {
      const id = Number(word2);
      if (!isNaN(id)) {
        getItemInfo(id, ctx);
      }
    }

    await user.save();
    return next();
  } catch (e) {
    await ctx.reply("Какая то ошибка, " + e);
  }
});

module.exports = itemsRouter;
