const { Composer } = require("telegraf");
const CronJob = require("cron").CronJob;
require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});

const {
  getRandomInt,
  generateCapcha,
  checkUserSub,
  checkUserProfile,
  shopGenerator,
} = require("../utils/helpers");
const { dice, bandit, userFerma, createRP } = require("../utils/games.js");
const { getUser } = require("../db/functions.js");
const {
  giveCoins,
  giveItem,
  giveCase,
  giveDonateCase,
} = require("./giveScripts.js");
const clothes = require("../itemsObjects/clothes");
const {
  getInventory,
  deleteItem,
  removeItem,
  wearItem,
  getWornItems,
  buyItem,
  getItemInfo,
  checkId,
} = require("../itemsModule/clothesFunctions");
const { buyCase, getCaseInfo } = require("../itemsModule/casesFunctions");
const { resiveLog } = require("../logs/globalLogs");
const { Item } = require("../db/models");
const cases = require("../itemsObjects/cases");
const rp = require("../utils/arrays/rp-array");
const craftService = require("../services/craft-service");
const gemsService = require("../services/gems-service");
const { Keyboard, Key } = require("telegram-keyboard");

const chatCommands = new Composer();
const commands = "https://telegra.ph/RUKOVODSTVO-PO-BOTU-05-13";
let capture = 120394857653;

chatCommands.on("text", async (ctx, next) => {
  const user = await getUser(
    ctx.from.id,
    ctx.from.first_name,
    ctx.from.username
  );
  const userMessage = ctx.message.text.toLowerCase();
  const [word1, word2, word3, word4] = userMessage.split(" ");
  const replyToMessage = ctx.message.reply_to_message;

  if (replyToMessage && replyToMessage.from) {
    const comment = userMessage.split("\n")[1];
    const rpAction = rp[userMessage.split("\n")[0]];
    if (rpAction) {
      await createRP(
        rpAction.value,
        rpAction.emoji,
        ctx,
        replyToMessage,
        comment
      );
    }
  }

  try {
    if (userMessage == "проф") {
      await checkUserProfile(user, ctx);
    }

    if (userMessage == "пупсы") {
      try {
        await ctx.telegram.sendMessage(
          ctx.from.id,
          `❗️ПУПСЫ❗️\n\n•Пупс «Удача»\nС этой штукой вам подозрительно будет везти\n\n•Пупс «Красноречие»\nВаше общение будет оплачиваться в два раза выше!\n\n•Пупс «Харизма»\nПользуясь своей харизмой, вы профессионально созываете всех в чат и получаете большую награду\n\n•Пупс «Интелект»\nС ним вы будете казаться умнее, а еще все знают какой вы богатый)\n\n\nУдачи в поисках)`
        );

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
        await ctx.reply(
          "Я не смог отправить тебе секретную инфу так как ты меня заблокал",
          { reply_to_message_id: ctx.message.message_id }
        );
      }
    }

    if (userMessage == "магазин") {
      try {
        await ctx.telegram.sendMessage(
          ctx.from.id,
          "Выберите что хотите купить:",
          Keyboard.inline([
            [
              Key.callback("Товары чата", "chatAssortiment"),
              "Улучшения",
              "Вещи",
            ],
            [
              Key.callback("Закрыть", "dell"),
              Key.callback("🤑DonateLand🤑", "4"),
            ],
          ])
        );

        if (ctx.chat.type !== "private") {
          await ctx.replyWithHTML(
            'Магазин уже открыт в <a href="https://t.me/PablMefBot">ЛС бота</a>',
            {
              reply_to_message_id: ctx.message.message_id,
              disable_web_page_preview: true,
            }
          );
        }
      } catch (e) {
        await ctx.reply("Я не смог открыть магазин так как ты меня заблокал", {
          reply_to_message_id: ctx.message.message_id,
        });
      }
    }

    if (word1 == "узнать") {
      const id = Number(word3);

      if (!isNaN(id) && word2 == "айди") {
        await checkId(id, ctx);

        return;
      }
    }

    if (
      userMessage == "мой меф" ||
      userMessage == "меф" ||
      userMessage == "б"
    ) {
      await ctx.reply("Ваш меф: " + user.balance + "\nВаши гемы: " + user.gems);
    }

    if (word1 == "отсыпать") {
      await giveCoins(ctx);
    }

    if (userMessage == "бот") {
      await ctx.reply("✅На месте");
    }

    if (userMessage == "команды") {
      await ctx.reply(commands);
    }

    if (word1 == "крафт") {
      const id = Number(word2);
      if (!isNaN(id)) {
        await craftService.craftItem(user, id, ctx);
      }
    }

    if (userMessage === capture) {
      let randommef = getRandomInt(500, 1000);

      const hasCalculator = await Item.findOne({
        where: {
          userId: user.id,
          itemName: "Калькулятор",
          isWorn: true,
        },
      });

      if (hasCalculator) {
        randommef *= 3;
      }
      user.captureCounter += 1;

      if (user.captureCounter === 100) {
        const item = await Item.create({
          src: "img/calculator.png",
          itemName: "Калькулятор",
          bodyPart: "right",
          isWorn: false,
          price: 50,
        });

        user.fullSlots++;
        await user.addItem(item);
        await item.save();
        await ctx.reply(
          `‼️ВНИМАНИЕ‼️\n\n@${ctx.from.username} ввел 100 капчей и получает редкий предмет "калькулятор[${item.id}]"`
        );
      }

      await resiveLog(user, "меф", `${randommef}`, "ввод капчи");
      user.balance += randommef;
      await ctx.reply("Верно, ты получил " + randommef + " мефа", {
        reply_to_message_id: ctx.message.message_id,
      });
      capture = getRandomInt(0, 99999);
    }

    if (word1 == "куб") {
      await dice(word3, word2, user, ctx, ctx);
    }

    if (userMessage == "мои мефкейсы") {
      let result = "Ваши мефкейсы:\n";
      let i = 1;
      for (const item in cases) {
        result += `${i}) ${cases[item].name} - ${
          user[cases[item].dbName]
        } шт.\n`;
        i++;
      }
      await ctx.reply(
        result +
          "\n💰Донат кейс - " +
          user.donateCase +
          "шт💰\n\n📖Открыть id\n📖Открыть донат\n📖Передать мефкейс id\n📖Передать мефкейс донат"
      );
    }

    if (userMessage == "ферма" || userMessage == "фарма") {
      const checkSub = await checkUserSub(ctx, -1002015930296);

      if (!checkSub) {
        ctx.reply("📝 Для сбора мефа нужно быть подписанным на канал @mef_dev");
      } else {
        await userFerma(ctx, user);
      }
    }

    if (word1 == "бандит") {
      await bandit(word2, user, ctx);
    }

    if (userMessage == "крафты") {
      craftService.craftList(ctx);
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
      const count = isNaN(Number(word4)) ? 1 : word4;

      if (word2 == "вещь" && !isNaN(id)) {
        await giveItem(user, id, ctx);
        return;
      }

      if (word2 == "мефкейс" && !isNaN(id)) {
        await giveCase(user, id, count, ctx);
        return;
      }

      if (word2 == "мефкейс" && word3 === "донат") {
        await giveDonateCase(user, word3, count, ctx);
        return;
      }

      if (word2 == "гемы" && !isNaN(id)) {
        await gemsService.giveGems(ctx);
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

    if (userMessage.includes("донат")) {
      await shopGenerator("4", ctx);
    }

    if (userMessage == "инфа мефкейс донат") {
      await ctx.reply(
        "❗️Донат кейс❗️\n\nВыпадает любая случайная вещь, от обычных до донатных"
      );
    }

    if (word1 == "купить") {
      const id = Number(word3);
      const count = Number(word4);
      const itemInfo = clothes[id];

      if (word2 == "мефкейс" && !isNaN(id)) {
        await buyCase(user, id, count, ctx);
      }

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

      if (word2 == "мефкейс" && !isNaN(Number(word3))) {
        getCaseInfo(Number(word3), ctx);
      }
    }

    await user.save();
  } catch (e) {
    await ctx.reply("Какая то ошибка, " + e);
  }
  return next();
});

function CaptureGenerator(bot) {
  const job = new CronJob(
    "0 5 */2 * * *",
    async function () {
      try {
        capture = generateCapcha();
        await bot.telegram.sendMessage(
          process.env.CHAT_ID,
          "МефКапча " + capture
        );
      } catch (error) {
        console.log(error);
      }
    },
    null,
    true, // Установите значение `false`, чтобы задача не запускалась автоматически
    "Europe/Moscow"
  );
}

module.exports = { chatCommands, CaptureGenerator };
