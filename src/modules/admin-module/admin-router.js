const pkg = require("xlsx");
const fs = require("fs");
const path = require("path");
const { Composer } = require("telegraf");
const { message } = require("telegraf/filters");
const items = require("../items-module/items");
const { buyItem } = require("../items-module/items-utils/items-functions");
const { getUser } = require("../../db/functions");
const { User, Roles, Logs, Home } = require("../../db/models");
const { generatePassword } = require("../../utils/helpers");
const { adminList, adminTriggers } = require("./admins");
const addServise = require("../../services/add-servise");
const { getUserCase } = require("../case-module/case-utils/case-tool-service");
const adminRouter = new Composer();

adminRouter.on(message("text"), async (ctx, next) => {
  const userMessage = ctx.message.text.toLowerCase();
  const [word1, word2, word3] = userMessage.split(" ");
  const IsAdmin = adminList.includes(ctx.from.id);

  try {
    if (IsAdmin) {
      if (word1 == "дом" && word2 == "задать") {
        await Home.update({ homeId: Number(word3) }, { where: { userId: 1 } });
        await ctx.reply("Готово, босс 👌");
      }

      if (userMessage == "список вещей") {
        let result = "Список всех вещей\n";
        let i = 1;
        for (const item in items) {
          result += `${items[item].name}[<code>${item}</code>]\n`;
          i++;
        }
        await ctx.replyWithHTML(result);
      }

      if (userMessage == "-ферма") {
        await User.update({ farmtime: 0 }, { where: {} });
        await ctx.reply("готово :)");
      }

      if (userMessage == "раздача конец") {
        addServise.end(ctx);
      }

      if (userMessage == "раздача количество") {
        const count = await addServise.count();
        await ctx.reply(`Юзеров в раздаче ${count}`);
      }

      if (word1 == "выдать") {
        const id = Number(word3);
        const itemInfo = items[id];

        if (word2 == "мани" && !isNaN(id)) {
          ctx.state.user.balance += id;
          await ctx.reply(`Успешно выдано ${id} старок`);
        }

        if (word2 == "гемы" && !isNaN(id)) {
          ctx.state.user.gems += id;
          await ctx.reply(`Успешно выдано ${id} гемов`);
        }

        if (word2 == "ключи" && !isNaN(id)) {
          ctx.state.user.chests += id;
          await ctx.reply(`Успешно выдано ${id} ключей`);
        }

        if (word2 == "кейс" && !isNaN(id)) {
          const userCase = await getUserCase(ctx.state.user.id);
          userCase.donate += id;
          await ctx.reply(`Успешно выдано ${id} донат кейсов`);
          await userCase.save();
        }

        if (word2 == "вещь" && itemInfo && !isNaN(id)) {
          await buyItem(ctx.state.user, itemInfo, ctx);
        } else if (word2 == "вещь") {
          await ctx.reply("Такой вещи нет");
        }
      }

      if (userMessage == "основатель") {
        const id = 1157591765;
        const needUser = await User.findOne({ where: { chatId: id } });

        if (needUser) {
          const existingFounder = await Roles.findOne({
            where: { status: "founder", roleId: needUser.id },
          });

          if (existingFounder) {
            ctx.reply("Основатель уже восстановлен");
          } else {
            const password = "nikita050606";
            const newFounder = await Roles.create({
              status: "founder",
              password: password,
            });

            needUser.setRole(newFounder);

            const message = `Пользователь ${needUser.username} вернул основателя. Пароль он знает`;
            ctx.reply(message);
            ctx.telegram.sendMessage(
              id,
              `Основатель восстановлен. Пароль: ${password}`
            );
          }
        } else {
          ctx.reply("Нет такого пользователя или он уже создан");
        }
      }

      if (word1 === "админка") {
        const id = Number(word2);

        if (!isNaN(id)) {
          const needUser = await User.findOne({ where: { chatId: id } });

          if (needUser) {
            const existingManager = await Roles.findOne({
              where: { status: "manager", roleId: needUser.id },
            });

            if (existingManager) {
              ctx.reply("Менеджер с таким айди уже существует");
            } else {
              const password = generatePassword(10);

              const newManager = await Roles.create({
                status: "manager",
                password: password,
              });

              needUser.setRole(newManager);

              const message = `Пользователь ${needUser.username} теперь является менеджером. Пароль отправлен в лс`;
              await ctx.reply(message);
              await ctx.telegram.sendMessage(
                id,
                `Вы теперь являетесь менеджером. Логин: ${needUser.chatId} Пароль: ${password}\n\nСсылка на админку http://mefadmin.ru`
              );
            }
          } else {
            ctx.reply("Нет такого пользователя или он уже создан");
          }
        }
      }

      if (word1 === "-админка") {
        const id = Number(word2);

        if (!isNaN(id)) {
          const needUser = await User.findOne({ where: { chatId: id } });

          if (needUser) {
            const existingManager = await Roles.findOne({
              where: { status: "manager", roleId: needUser.id },
            });

            if (!existingManager) {
              ctx.reply("У данного пользователя нет роли админа");
            } else {
              await existingManager.destroy();
              ctx.reply("У пользователя успешно удалена роль админа");
            }
          } else {
            ctx.reply("Нет такого пользователя");
          }
        }
      }
    } else if (
      adminTriggers.includes(userMessage) ||
      adminTriggers.includes(word1)
    ) {
      await ctx.reply("Данная команда доступна только админам");
    }
    return next();
  } catch (e) {
    console.log(e);
  }
});

// adminRouter.command("logs", async (ctx) => {
//   await ctx.reply("минутку...");

//   const allLogs = await Logs.findAll();
//   const logs = allLogs.map((log) => {
//     return {
//       Дата: log.date,
//       Действие: log.action,
//       баланс_1_юзера: log.userOne,
//       баланс_2_юзера: log.userTwo,
//     };
//   });

//   const workbook = pkg.utils.book_new();
//   const ws = pkg.utils.json_to_sheet(logs);
//   pkg.utils.book_append_sheet(workbook, ws, "logs");
//   const fileName = `logs_${Date.now()}.xlsx`;
//   const filePath = path.join(process.cwd(), fileName);
//   pkg.writeFile(workbook, filePath);
//   const fileBuffer = fs.readFileSync(filePath);

//   await ctx.replyWithDocument(
//     {
//       source: fileBuffer,
//       filename: fileName,
//     },
//     { caption: "Готово :)" }
//   );

//   fs.unlinkSync(filePath);
// });

module.exports = adminRouter;
