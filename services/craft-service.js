const { Item } = require("../db/models");
const clothes = require("../itemsObjects/clothes");
const craftItems = require("../itemsObjects/crafts");
const { loseLog, resiveLog } = require("../logs/globalLogs");

class CrafService {
  async craftItem(user, id, ctx) {
    try {
      const craft = craftItems[id];

      if (!craft) {
        await ctx.reply("Такого крафта нет😥");
        return;
      }

      const components = craft.components;
      const quantity = craft.quantity;

      // Проверка наличия компонентов у пользователя
      const userItems = await user.getItems();
      const availableComponents = userItems.filter((item) =>
        components.includes(item.itemName)
      );

      // Проверка, что количество компонентов достаточно для крафта
      if (availableComponents.length < quantity) {
        await ctx.reply("Недостаточно компонентов для крафта");
        return;
      }

      // Удаление использованных компонентов у пользователя
      await Promise.all(
        availableComponents
          .slice(0, quantity)
          .map((component) => component.destroy())
      );
      user.fullSlots -= quantity;
      await loseLog(user, `${availableComponents.slice(0, quantity)}`, `крафт`);

      let chance = Math.random() * 100;

      // Проверка, если у пользователя есть и надет ли "Дрон 'ЭД-Э'"
      const droneItem = await Item.findOne({
        where: {
          userId: user.id,
          itemName: 'Дрон "ЭД-Э"',
          isWorn: true,
        },
      });

      if (droneItem) {
        chance -= 25;
      }

      const pupsItem = await Item.findOne({
        where: {
          userId: user.id,
          itemName: "Пупс «Удача»",
          isWorn: true,
        },
      });

      if (pupsItem) {
        chance -= 5;
      }

      if (chance <= craft.chance) {
        // Создание и сохранение предмета
        const newItem = await Item.create({
          src: clothes[craft.personalId].src,
          itemName: clothes[craft.personalId].name,
          bodyPart: clothes[craft.personalId].bodyPart,
          price: clothes[craft.personalId].price,
        });

        user.fullSlots++;
        await user.addItem(newItem);

        await resiveLog(
          user,
          `${newItem.itemName}[${newItem.id}]`,
          "1",
          "Успешный крафт"
        );
        await user.save();
        await newItem.save();

        // Отправка ответа успешного крафта
        await ctx.reply(
          `Успешно скрафтено! Получено: ${newItem.itemName}[${newItem.id}]`
        );
      } else {
        // Отправка ответа неудачного крафта
        await ctx.reply("Крафт не удался. Компоненты потеряны.");
      }
    } catch (error) {
      console.error(error);

      // Отправка ответа об ошибке крафта
      await ctx.reply("Произошла ошибка при крафте.");
    }
  }

  async craftList(ctx) {
    let message = "❗️КРАФТИНГ❗️\n\n";

    for (const id in craftItems) {
      const item = craftItems[id];

      message += `${id}) ${item.name}[${item.personalId}]\n`;
      message += "•Возможные компоненты:\n";

      for (const component of item.components) {
        message += `• ${component}\n`;
      }

      message += `•Нужно компонентов: ${item.quantity}\n`;
      message += `•Шанс: ${item.chance}%\n\n`;
    }

    message += "Для крафта используйте\n<<Крафт {id}>>\n\n";
    message +=
      "Для того чтобы узнать особенность вещи введите\n<<Инфа {id самой вещи}>>";

    await ctx.reply(message);
  }
}

module.exports = new CrafService();
