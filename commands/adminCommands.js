const { Composer } = require("telegraf");
const clothes = require("../itemsObjects.js/clothes");
const { buyItem } = require("../itemsModule/clothesFunctions");
const { getUser } = require("../db/functions");
const { User, Roles } = require("../db/models");
const { generatePassword } = require("../utils/helpers");

const adminCommands = new Composer();

adminTriggers = ["список вещей", "выдать", "основатель", "админка"];
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
          ctx.reply(`Успешно выдано ${id}MF`);
          await user.save();
        }

        if (word2 == "вещь" && itemInfo && !isNaN(id)) {
          await buyItem(user, itemInfo, ctx);
        } else if (word2 == "вещь") {
          ctx.reply("Такой вещи нет");
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
                        .then((newManager) => {
                          needUser.setRole(newManager);

                          const message = `Пользователь ${needUser.username} теперь является менеджером. Пароль отправлен в лс`;
                          ctx.reply(message);
                          ctx.telegram.sendMessage(
                            id,
                            `Вы теперь являетесь менеджером. Пароль: ${password}`
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
            .catch((error) => {
              ctx.reply("Произошла ошибка при поиске пользователя: " + error);
            });
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
