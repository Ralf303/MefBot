const { Item } = require("../../db/models");
const items = require("../items-module/items");
const craftItems = require("./crafts");
const { resiveLog } = require("../logs-module/globalLogs");
const { checkItem } = require("../items-module/items-utils/item-tool-service");
const { getFamilyByUserId } = require("../fam-module/fam-service");

class CrafService {
  async #countItemsByItemName(user, itemName) {
    const userItems = await user.getItems();
    const filteredItems = userItems.filter(
      (item) => item.itemName === itemName
    );
    return filteredItems.length;
  }

  async #checkUserCraft(user, components) {
    for (const component of components) {
      const itemQuantity = await this.#countItemsByItemName(
        user,
        component.name
      );
      if (itemQuantity < component.quantity) {
        return false;
      }
    }

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

    return true;
  }
  async craftItem(user, id, ctx) {
    try {
      const craft = craftItems[id];

      if (!craft) {
        await ctx.reply("Такого крафта нет 😥");
        return;
      }

      const enoughComponents = await this.#checkUserCraft(
        user,
        craft.components
      );

      if (!enoughComponents) {
        await ctx.reply("Недостаточно компонентов для крафта");
        return;
      }

      let chance = Math.random() * 100;

      const droneItem = await checkItem(user.id, 'Дрон "ЭД-Э"');

      if (droneItem) {
        chance -= 10;
      }

      const pupsItem = await checkItem(user.id, "Пупс «Удача»");
      if (pupsItem) {
        chance -= 1;
      }

      const fam = await getFamilyByUserId(user.chatId);

      if (fam) {
        chance -= fam.Baf.craft;
        chance -= fam.Baf.luck;
      }

      if (chance <= craft.chance) {
        const newItem = await Item.create({
          src: items[craft.personalId].src,
          itemName: items[craft.personalId].name,
          bodyPart: items[craft.personalId].bodyPart,
          price: items[craft.personalId].price,
        });

        user.fullSlots++;
        await user.addItem(newItem);

        const fam = await getFamilyByUserId(user.chatId);

        if (fam) {
          if (fam.check) {
            fam.reputation += 1600;
          } else {
            fam.reputation += 800;
          }

          await fam.save();
        }

        await user.save();
        await newItem.save();

        await ctx.reply(
          `Успешно скрафтено! Получено: ${newItem.itemName}[${newItem.id}]`
        );
        await resiveLog(
          user,
          `${newItem.itemName}[${newItem.id}]`,
          "1",
          "Успешный крафт"
        );
      } else {
        await ctx.reply("Крафт не удался. Компоненты потеряны.");
      }
    } catch (error) {
      console.error(error);

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
