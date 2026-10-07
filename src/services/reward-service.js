import { Item } from "../db/models.js";
import items from "../modules/items-module/items.js";
import { withUserTransaction } from "./transaction-service.js";

export function grantItem(user, id) {
  return withUserTransaction(user, async (locked, transaction) => {
    const info = items[id];
    if (!info) throw new Error("ITEM_NOT_FOUND");
    const item = await Item.create({
      src: info.src, itemName: info.name, bodyPart: info.bodyPart,
      isWorn: false, price: info.price, userId: locked.id,
    }, { transaction });
    locked.fullSlots++;
    await locked.save({ transaction });
    return item;
  });
}
