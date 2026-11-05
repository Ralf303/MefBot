import { withUsersTransaction } from "../../../services/transaction-service.js";
import { ALL } from "../../../utils/transfer-amount.js";
import { getTransferRecipient } from "../../../utils/transfer-recipient.js";
import cases from "../cases.js";
import { getUserCase } from "./case-tool-service.js";

export async function giveCase(sender, id, count, ctx) {
  const selected = id === ALL ? Object.values(cases) : Object.hasOwn(cases, id) ? [cases[id]] : [];
  if (!selected.length) return ctx.reply("Такого кейса нет.");
  const target = await getTransferRecipient(ctx);
  if (!target) return;
  const { receiver, transferredViaUsername } = target;

  const moved = await withUsersTransaction([sender, receiver], async ([from, to], transaction) => {
    const senderCase = await getUserCase(from.id);
    const receiverCase = await getUserCase(to.id);
    const balances = selected.map(({ dbName, name }) => ({
      dbName, name, available: senderCase[dbName] || 0,
    }));
    if (count !== ALL && balances[0].available < count) return [];

    const transfers = balances.map(({ dbName, name, available }) => ({
      dbName, name, amount: count === ALL ? available : count,
    })).filter(({ amount }) => amount > 0);
    if (!transfers.length) return [];

    for (const { dbName, amount } of transfers) {
      senderCase[dbName] -= amount;
      receiverCase[dbName] = (receiverCase[dbName] || 0) + amount;
    }
    await senderCase.save({ transaction });
    await receiverCase.save({ transaction });
    return transfers;
  });

  if (!moved.length) return ctx.reply("Недостаточно кейсов.");
  const description = moved.map(({ name, amount }) => `${name}: ${amount} шт.`).join("\n");
  await ctx.reply(`Ты передал(а) кейсы → ${receiver.firstname}:\n${description}`);
  if (transferredViaUsername) {
    try {
      await ctx.telegram.sendMessage(receiver.chatId, `Тебе передали кейсы от ${ctx.from.first_name}:\n${description}`);
    } catch (error) {
      console.log("Не удалось отправить личное сообщение:", error.message);
    }
  }
}
