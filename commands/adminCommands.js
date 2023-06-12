const { Composer } = require("telegraf");
const clothes = require("../itemsObjects.js/clothes");
const { buyItem } = require("../itemsModule/clothesFunctions");
const { getUser } = require("../db/functions");

const adminCommands = new Composer();

adminTriggers = ["список вещей", "выдать"];
adminList = [1157591765];

adminCommands.on("text", async (ctx, next) => {
  const userMessage = ctx.message.text.toLowerCase();
  const user = await getUser(
    ctx.from.id,
    ctx.from.first_name,
    ctx.from.username
  );
  const [word1, word2, word3] = userMessage.split(" ");
  const IsAdmin = adminList.includes(ctx.from.id);

  try {
    if (IsAdmin) {
      if (userMessage == "список вещей") {
        let result = "Список всех вещей\n";
        let i = 1;
        for (const item in clothes) {
          result += `${i}) ${clothes[item].name}[${item}] Цена: ${clothes[item].price}\n`;
          i++;
        }
        ctx.reply(result);
      }

      if (word1 == "выдать") {
        const id = Number(word3);
        const itemInfo = clothes[id];

        if (word2 == "мани" && !isNaN(id)) {
          user.balance += id;
          ctx.reply(`Успешно выдано ${id}MF`);
          await user.save();
        }

        if (word2 == "вещь" && itemInfo && !isNaN(id)) {
          await buyItem(user, itemInfo, ctx);
        } else if (word2 == "вещь") {
          ctx.reply("Такой вещи нет");
        }
      }
    } else if (
      adminTriggers.includes(userMessage) ||
      adminTriggers.includes(word1)
    ) {
      ctx.reply("Данная команда доступна только админам");
    }
  } catch (e) {
    ctx.reply("Какая то ошибка, " + e);
  }
  return next();
});

module.exports = adminCommands;
