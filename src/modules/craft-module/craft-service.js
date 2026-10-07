import { withUserOperation } from "../../services/transaction-service.js";
import { Item } from "../../db/models.js";
import items from "../items-module/items.js";
import craftItems from "./crafts.js";
import { resiveLog } from "../logs-module/globalLogs.js";
import { checkItem } from "../items-module/items-utils/item-tool-service.js";
import { getFamilyByUserId } from "../fam-module/fam-service.js";

class CrafService {
  async #checkUserCraft(user, components) {
    const inventory = await user.getItems();
    const counts = new Map();
    for (const item of inventory) counts.set(item.itemName, (counts.get(item.itemName) || 0) + 1);
    for (const component of components) {
      if ((counts.get(component.name) || 0) < component.quantity) return false;
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
    return withUserOperation(user, ctx, (locked, deferred) => this.craftItemUnsafe(locked, id, deferred));
  }
  async craftItemUnsafe(user, id, ctx) {
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
          `🎉 Успешно создано! Получено: ${newItem.itemName}[${newItem.id}]`
        );
      } else {
        await ctx.reply("Крафт не удался. Компоненты потеряны.");
      }
    } catch (error) {
      console.error(error);

      throw error;
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

export default new CrafService();
