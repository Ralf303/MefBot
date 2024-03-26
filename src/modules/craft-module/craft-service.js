const { Item } = require("../../db/models");
const items = require("../items-module/items");
const craftItems = require("./crafts");
const { resiveLog } = require("../logs-module/globalLogs");
const { checkItem } = require("../items-module/items-utils/item-tool-service");

class CrafService {
  async #countItemsByItemName(user, itemName) {
    const userItems = await user.getItems();
    const filteredItems = userItems.filter(
      (item) => item.itemName === itemName
    );
    return filteredItems.length;
  }

  async #checkUserCraft(user, components) {
    // Проверяем наличие всех необходимых компонентов у пользователя
    for (const component of components) {
      const itemQuantity = await this.#countItemsByItemName(
        user,
        component.name
      );
      if (itemQuantity < component.quantity) {
        return false; // Недостаточно компонентов
      }
    }

    // Удаляем необходимые компоненты у пользователя
    for (const component of components) {
      const itemsToDelete = await user.getItems({
        where: { itemName: component.name },
        limit: component.quantity,
      });
      for (const itemToDelete of itemsToDelete) {
        await itemToDelete.destroy();
        user.fullSlots--;
        await user.save();
      }
    }

    return true; // Успешно скрафтили
  }
  async craftItem(user, id, ctx) {
    try {
      const craft = craftItems[id];

      if (!craft) {
        await ctx.reply("Такого крафта нет😥");
        return;
      }

      const enoughComponents = await this.#checkUserCraft(
        user,
        craft.components
      );

      // Проверка, что количество компонентов достаточно для крафта
      if (!enoughComponents) {
        await ctx.reply("Недостаточно компонентов для крафта");
        return;
      }

      let chance = Math.random() * 100;

      // Проверка, если у пользователя есть и надет ли "Дрон 'ЭД-Э'"
      const droneItem = await checkItem(user.id, 'Дрон "ЭД-Э"');

      if (droneItem) {
        chance -= 25;
      }

      const pupsItem = await checkItem(user.id, "Пупс «Удача»");
      if (pupsItem) {
        chance -= 5;
      }

      if (chance <= craft.chance) {
        // Создание и сохранение предмета
        const newItem = await Item.create({
          src: items[craft.personalId].src,
          itemName: items[craft.personalId].name,
          bodyPart: items[craft.personalId].bodyPart,
          price: items[craft.personalId].price,
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
    for (let id in craftItems) {
      const item = craftItems[id];
      message += `${id}) ${item.name}[${item.personalId}]\n`;
      message += "• Нужные компоненты:\n";
      item.components.forEach((component) => {
        message += `• ${component.quantity}x ${component.name}\n`;
      });
      message += ` • Шанс: ${item.chance}%\n\n`;
    }
    message += "📖Крафт {id}\n📖Инфа {id вещи}";
    ctx.reply(message);
  }
}

module.exports = new CrafService();
