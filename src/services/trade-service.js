import { Home, Card, CardStand } from "../db/models.js";
import { withUsersTransaction } from "./transaction-service.js";

export async function purchaseAsset({ seller, buyer, model, id, price, inventory = false, house = false }) {
  price = Number(price);
  if (!Number.isSafeInteger(price) || price < 100) throw new Error("INVALID_PRICE");
  if (Number(seller.id) === Number(buyer.id)) throw new Error("SELF_TRANSFER");
  return withUsersTransaction([seller, buyer], async ([lockedSeller, lockedBuyer], transaction) => {
    const asset = await model.findOne({
      where: { ...(id === undefined ? {} : { id }), userId: lockedSeller.id },
      transaction, lock: transaction.LOCK.UPDATE,
    });
    if (!asset) throw new Error("ASSET_NOT_FOUND");
    if (Number(lockedBuyer.balance) < price) throw new Error("INSUFFICIENT_FUNDS");
    if (inventory && lockedBuyer.fullSlots >= lockedBuyer.slots) throw new Error("INVENTORY_FULL");
    if (house && await Home.findOne({ where: { userId: lockedBuyer.id }, transaction })) throw new Error("ALREADY_HAS_HOME");
    lockedBuyer.balance = Number(lockedBuyer.balance) - price;
    lockedSeller.balance = Number(lockedSeller.balance) + price;
    if (inventory) {
      lockedSeller.fullSlots--;
      lockedBuyer.fullSlots++;
      asset.isWorn = false;
    }
    asset.userId = lockedBuyer.id;
    if (model === Card) await CardStand.update({ cardId: null }, { where: { cardId: asset.id }, transaction });
    await lockedSeller.save({ transaction });
    await lockedBuyer.save({ transaction });
    await asset.save({ transaction });
    return asset;
  });
}

export function tradeError(error) {
  return ({
    INVALID_PRICE: "Некорректная цена сделки",
    INVALID_TRADE_SIGNATURE: "Предложение устарело или повреждено. Попроси продавца отправить новое.",
    SELF_TRANSFER: "Нельзя продавать самому себе",
    ASSET_NOT_FOUND: "Предмет уже продан или больше не принадлежит продавцу",
    INSUFFICIENT_FUNDS: "Недостаточно старок 😥",
    INVENTORY_FULL: "Недостаточно места в инвентаре 😥",
    ALREADY_HAS_HOME: "У тебя уже есть дом",
  })[error.message] || "Не удалось выполнить сделку. Попробуй ещё раз.";
}
