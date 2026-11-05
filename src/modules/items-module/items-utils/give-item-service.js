import { withUsersTransaction } from "../../../services/transaction-service.js";
import { Item } from "../../../db/models.js";
import { ALL } from "../../../utils/transfer-amount.js";
import { getTransferRecipient } from "../../../utils/transfer-recipient.js";
import { assetSnapshot, CHANGED_TRANSFER, requestFullTransfer } from "../../../services/transfer-confirmation.js";

export async function giveItem(sender, id, ctx, confirmed) {
  const target = confirmed?.target ?? await getTransferRecipient(ctx, { registeredOnly: true });
  if (!target) return;
  const { receiver } = target;
  const result = await withUsersTransaction([sender, receiver], async ([from, to], transaction) => {
    const where = { userId: from.id, ...(id === ALL ? {} : { id }) };
    const items = await Item.findAll({ where, transaction, lock: transaction.LOCK.UPDATE });
    const snapshot = id === ALL ? assetSnapshot(items) : null;
    if (confirmed && snapshot !== confirmed.data.snapshot) return { error: CHANGED_TRANSFER };
    if (!items.length) return { error: id === ALL ? "У тебя нет вещей." : "У тебя нет такой вещи." };

    const occupied = await Item.count({ where: { userId: to.id }, transaction });
    const free = Math.max(0, to.slots - occupied);
    if (items.length > free) {
      return { error: `У получателя мало места: нужно ${items.length} слотов, свободно ${free}. Ничего не передано.` };
    }
    if (id === ALL && !confirmed) return { items, snapshot };

    await Item.update({ userId: to.id, isWorn: false }, { where, transaction });
    from.fullSlots = id === ALL ? 0 : await Item.count({ where: { userId: from.id }, transaction });
    to.fullSlots = occupied + items.length;
    await from.save({ transaction });
    await to.save({ transaction });
    return { items };
  });

  if (result.error) return ctx.reply(result.error);
  const [item] = result.items;
  const description = id === ALL ? `все вещи (${result.items.length} шт.)` : `${item.itemName} [${item.id}](+${item.lvl})`;
  if (id === ALL && !confirmed) return requestFullTransfer(ctx, sender, target, "items", { snapshot: result.snapshot }, description);
  return ctx.reply(`Ты передал(а) ${description} → ${receiver.firstname}`);
}
