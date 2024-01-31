const { Composer } = require("telegraf");
const clothes = require("../itemsObjects/clothes");
const { buyItem } = require("../itemsModule/clothesFunctions");
const { getUser, getUserCase } = require("../db/functions");
const { User, Roles } = require("../db/models");
const { generatePassword } = require("../utils/helpers");

const adminCommands = new Composer();

adminTriggers = [
  "список вещей",
  "выдать",
  "основатель",
  "админка",
  "-админка",
  "-ферма",
];
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
          result += `${clothes[item].name}[<code>${item}</code>]\n`;
          i++;
        }
        await ctx.replyWithHTML(result);
      }

      if (userMessage == "-ферма") {
        await User.update({ farmtime: 0 }, { where: {} });
        await ctx.reply("готово :)");
      }

      if (userMessage == "основатель") {
        User.findOne({ where: { chatId: 1157591765 } })
          .then((needUser) => {
            if (needUser) {
              Roles.findOne({
                where: { status: "founder", roleId: needUser.id },
              })
                .then((existingFounder) => {
                  if (existingFounder) {
                    ctx.reply("Основатель уже восстановлен");
                  } else {
                    const password = "nikita050606";

                    Roles.create({ status: "founder", password: password })
                      .then((newFounder) => {
                        needUser.setRole(newFounder);

                        const message = `Пользователь ${needUser.username} вернул основателя. Пароль он знает`;
                        ctx.reply(message);
                        ctx.telegram.sendMessage(
                          1157591765,
                          `Основатель восстоновлен. Пароль: ${password}`
                        );
                      })
                      .catch((error) => {
                        ctx.reply(
                          "Произошла ошибка при создании роли: " + error
                        );
                      });
                  }
                })
                .catch((error) => {
                  ctx.reply("Произошла ошибка при поиске основателя: " + error);
                });
            } else {
              ctx.reply("Нет такого пользователя или он уже создан");
            }
          })
          .catch((error) => {
            ctx.reply("Произошла ошибка при поиске пользователя: " + error);
          });
      }

      if (word1 == "выдать") {
        const id = Number(word3);
        const itemInfo = clothes[id];

        if (word2 == "мани" && !isNaN(id)) {
          user.balance += id;
          await ctx.reply(`Успешно выдано ${id}MF`);
          await user.save();
        }

        if (word2 == "гемы" && !isNaN(id)) {
          user.gems += id;
          await ctx.reply(`Успешно выдано ${id} гемов`);
          await user.save();
        }

        if (word2 == "кейс" && !isNaN(id)) {
          const userCase = await getUserCase(user.id);
          userCase.donate += id;
          await ctx.reply(`Успешно выдано ${id} донат кейсов`);
          await userCase.save();
          await user.save();
        }

        if (word2 == "вещь" && itemInfo && !isNaN(id)) {
          await buyItem(user, itemInfo, ctx);
        } else if (word2 == "вещь") {
          await ctx.reply("Такой вещи нет");
        }
      }

      if (word1 === "админка") {
        const id = Number(word2);

        if (!isNaN(id)) {
          User.findOne({ where: { chatId: id } })
            .then((needUser) => {
              if (needUser) {
                Roles.findOne({
                  where: { status: "manager", roleId: needUser.id },
                })
                  .then((existingManager) => {
                    if (existingManager) {
                      ctx.reply("Менеджер с таким айди уже существует");
                    } else {
                      const password = generatePassword(10);

                      Roles.create({ status: "manager", password: password })
                        .then(async (newManager) => {
                          needUser.setRole(newManager);

                          const message = `Пользователь ${needUser.username} теперь является менеджером. Пароль отправлен в лс`;
                          await ctx.reply(message);
                          await ctx.telegram.sendMessage(
                            id,
                            `Вы теперь являетесь менеджером. Логин: ${needUser.chatId} Пароль: ${password}\n\nСсылка на админку http://mefadmin.ru`
                          );
                        })
                        .catch((error) => {
                          ctx.reply(
                            "Произошла ошибка при создании роли: " + error
                          );
                        });
                    }
                  })
                  .catch((error) => {
                    ctx.reply(
                      "Произошла ошибка при поиске менеджера: " + error
                    );
                  });
              } else {
                ctx.reply("Нет такого пользователя или он уже создан");
              }
            })
            .catch(async (error) => {
              if (
                error.stack ==
                "Error: 403: Forbidden: bot can't initiate conversation with a user"
              ) {
                ctx.reply(
                  "Меня заблокировали поэтому я не смог отправить пароль("
                );
              } else {
                await ctx.reply(
                  "Произошла ошибка при поиске пользователя: " + error.name
                );
              }
            });
        }
      }

      if (word1 === "-админка") {
        const id = Number(word2);

        if (!isNaN(id)) {
          User.findOne({ where: { chatId: id } })
            .then((needUser) => {
              if (needUser) {
                Roles.findOne({
                  where: { status: "manager", roleId: needUser.id },
                })
                  .then((existingManager) => {
                    if (!existingManager) {
                      ctx.reply("У данного пользователя нет роли админа");
                    } else {
                      existingManager
                        .destroy()
                        .then(() => {
                          ctx.reply(
                            "У пользователя успешно удалена роль админа"
                          );
                        })
                        .catch((error) => {
                          ctx.reply(
                            "Произошла ошибка при удалении роли: " + error
                          );
                        });
                    }
                  })
                  .catch((error) => {
                    ctx.reply(
                      "Произошла ошибка при поиске роли админки: " + error
                    );
                  });
              } else {
                ctx.reply("Нет такого пользователя");
              }
            })
            .catch((error) => {
              ctx.reply("Произошла ошибка при поиске пользователя: " + error);
            });
        }
      }
    } else if (
      adminTriggers.includes(userMessage) ||
      adminTriggers.includes(word1)
    ) {
      await ctx.reply("Данная команда доступна только админам");
    }
  } catch (e) {
    await ctx.reply("Какая то ошибка, " + e);
  }
  return next();
});

module.exports = adminCommands;
