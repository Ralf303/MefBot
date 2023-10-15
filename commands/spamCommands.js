const { Composer } = require("telegraf");
const { openCase, openDonateCase } = require("../itemsModule/casesFunctions");
const cases = require("../itemsObjects/cases");
const { getUser } = require("../db/functions");

const spamCommands = new Composer();

spamTriggers = ["открыть", "мефкейсы"];

spamCommands.on("text", async (ctx, next) => {
  const user = await getUser(
    ctx.from.id,
    ctx.from.first_name,
    ctx.from.username
  );
  const userMessage = ctx.message.text.toLowerCase();
  const [word1, word2] = userMessage.split(" ");
  const IsSpam =
    ctx.chat.id === -1001672482562 || ctx.chat.id === -1001680708708;
  const IsPrivate = ctx.chat.type === "private";
  try {
    if (IsSpam || IsPrivate) {
      if (word1 == "открыть") {
        const id = Number(word2);

        if (word2 === "донат") {
          await openDonateCase(user, ctx);
          return;
        }

        if (!isNaN(id)) {
          await openCase(user, id, ctx);
          return;
        } else if (word1 == "открыть") {
          await ctx.reply(
            "Не правильное использование команды\n\nПопробуйте\n<<Открыть Id>>"
          );
        }
      }

      if (userMessage == "мефкейсы") {
        let result = "Доступные кейсы:\n";
        let i = 1;
        for (const item in cases) {
          result += `${i}) ${cases[item].name} Цена: ${cases[item].price}MF\n`;
          i++;
        }
        await ctx.reply(
          result +
            "\n\nТак же есть Донат кейс за 25 рублей\nИз него выпадает одна рандомная вещь\n\nКупить => @ralf303\n\n📖Купить мефкейс id\n📖Инфа мефкейс id"
        );
      }
    } else if (
      (spamTriggers.includes(userMessage) || spamTriggers.includes(word1)) &&
      !IsSpam
    ) {
      await ctx.reply("Данная команда доступна только в @mefanarhia или в лс");
    }
  } catch (e) {
    await ctx.reply("Какая то ошибка, " + e);
  }
  return next();
});

module.exports = spamCommands;
