const { Composer } = require("telegraf");
const CronJob = require("cron").CronJob;
require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});

const {
  getRandomInt,
  generateCapcha,
  notify,
  checkUserSub,
  checkUserProfile,
} = require("../utils/helpers");
const { dice, bandit, userFerma, createRP } = require("../utils/games.js");
const { getUser } = require("../db/functions.js");
const { giveCoins, giveItem, giveCase } = require("./giveScripts.js");
const clothes = require("../itemsObjects.js/clothes");
const {
  getInventory,
  deleteItem,
  removeItem,
  wearItem,
  getWornItems,
  buyItem,
  getItemInfo,
} = require("../itemsModule/clothesFunctions");
const { buyCase } = require("../itemsModule/casesFunctions");
const { resiveLog } = require("../logs/globalLogs");
const { Item } = require("../db/models");

const chatCommands = new Composer();
const commands = "https://telegra.ph/RUKOVODSTVO-PO-BOTU-05-13";
let capture = 120394857653;

const triggers = [
  "меф",
  "бот",
  "проф",
  "команды",
  "мой меф",
  "б",
  "куб",
  "бандит",
  "ферма",
  "фарма",
  "актив",
  "отсыпать",
  "инвентарь",
  "удалить",
  "снять",
  "передать",
  "купить",
  "надеть",
  "мой пабло",
  "курс",
  "инфо",
  "инфа",
];

const rp = {
  кинуть: { value: "кинул(а) напрогиб", emoji: "🫂" },
  доза: { value: "вколол(а) дозу", emoji: "💉" },
  секс: { value: "трахнул(а) и кончил(а) внутрь", emoji: "🔞" },
  уничтожить: { value: "уничтожил(а)", emoji: "💀" },
  нюхать: { value: "занюхнул(а) мефа вместе с", emoji: "🌿" },
  накормить: { value: "вкусно накормил(а)", emoji: "👨‍🍳" },
  отшлепать: { value: "смачно отшлепал(а)", emoji: "🔞" },
  бум: { value: "взорвал(а)", emoji: "💥" },
  кончить: { value: "кончил(а) на лицо", emoji: "💦" },
  вылечить: { value: "сделал(а) укол в попу и вылечил(а)", emoji: "💉" },
};

chatCommands.on("text", async (ctx, next) => {
  const user = await getUser(
    ctx.from.id,
    ctx.from.first_name,
    ctx.from.username
  );
  const userMessage = ctx.message.text.toLowerCase();
  const [word1, word2, word3, word4] = userMessage.split(" ");
  const replyToMessage = ctx.message.reply_to_message;
  const checkStatus = await checkUserSub(
    ctx,
    "@healthy_food_music",
    word1,
    userMessage,
    triggers,
    ctx
  );

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
    if (checkStatus || userMessage === capture) {
      if (userMessage == "проф") {
        await checkUserProfile(user, ctx);
      }

      if (
        userMessage == "мой меф" ||
        userMessage == "меф" ||
        userMessage == "б"
      ) {
        ctx.reply("Ваш меф: " + user.balance);
      }

      if (word1 == "отсыпать") {
        await giveCoins(ctx);
      }

      if (userMessage == "бот") {
        ctx.reply("✅На месте");
      }

      if (userMessage == "команды") {
        ctx.reply(commands);
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
          ctx.reply(
            `‼️ВНИМАНИЕ‼️\n\n@${ctx.from.username} ввел 100 капчей и получает редкий предмет "калькулятор[${item.id}]"`
          );
        }

        await resiveLog(user, "меф", `${randommef}`, "ввод капчи");
        user.balance += randommef;
        await ctx.reply("Верно, ты получил " + randommef + " мефа", {
          reply_to_message_id: ctx.message.message_id,
        });
        capture = 342234242;
      }

      if (word1 == "куб") {
        await dice(word3, word2, user, ctx, ctx);
      }

      if (userMessage == "ферма" || userMessage == "фарма") {
        await userFerma(ctx, user);
      }

      if (word1 == "бандит") {
        await bandit(word2, user, ctx);
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
        }

        if (word2 == "мефкейс" && !isNaN(id)) {
          await giveCase(user, id, count, ctx);
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

      if (userMessage == "курс") {
        ctx.reply(
          "🤑Активный курс обмена🤑\n\n1 бкоин - 5 мефа\n2 рдно - 1 меф\n1 ириска - 500 мефа\n1 рубль - 1000 мефа\n\nМенять можно у @ralf303"
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
          ctx.reply("Такой вещи нет");
        }
      }

      if (word1 == "инфо" || word1 == "инфа") {
        const id = Number(word2);
        if (!isNaN(id)) {
          getItemInfo(id, ctx);
        }
      }

      await user.save();
    } else if (triggers.includes(userMessage) || triggers.includes(word1)) {
      notify(ctx, "healthy_food_music");
    }
  } catch (e) {
    ctx.reply("Какая то ошибка, " + e);
  }
  return next();
});

function CaptureGenerator(bot) {
  const job = new CronJob(
    "0 0 13-23 * * *",
    async function () {
      try {
        const capture = generateCapcha();
        await bot.telegram.sendMessage(
          process.env.CHAT_ID,
          "МефКапча " + capture
        );
      } catch (error) {
        console.log(error);
      }
    },
    null,
    true,
    "Europe/Moscow"
  );

  const randomJob = new CronJob(
    "0 */30 * * * *",
    function () {
      const interval =
        Math.floor(Math.random() * (10800000 - 1800000 + 1)) + 1800000; // Случайный интервал от 30 минут до 3 часов
      setTimeout(() => {
        job.start();
        job.stop();
      }, interval);
    },
    null,
    true,
    "Europe/Moscow"
  );
}

module.exports = { chatCommands, CaptureGenerator };
