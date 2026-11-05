import { withUsersTransaction } from "../../../services/transaction-service.js";
import { ALL } from "../../../utils/transfer-amount.js";
import { escapeTransferText, getTransferRecipient, transferRecipientLink } from "../../../utils/transfer-recipient.js";
import { CHANGED_TRANSFER, requestFullTransfer } from "../../../services/transfer-confirmation.js";
import cases from "../cases.js";
import { getUserCase } from "./case-tool-service.js";

export async function giveCase(sender, id, count, ctx, confirmed) {
  const selected = id === ALL ? Object.values(cases) : Object.hasOwn(cases, id) ? [cases[id]] : [];
  if (!selected.length) return ctx.reply("Такого кейса нет.");
  const target = confirmed?.target ?? await getTransferRecipient(ctx, count === ALL ? { registeredOnly: true } : undefined);
  if (!target) return;
  const { receiver, transferredViaUsername } = target;

  const result = await withUsersTransaction([sender, receiver], async ([from, to], transaction) => {
    const senderCase = await getUserCase(from.id);
    const balances = selected.map(({ dbName, name }) => ({
      dbName, name, available: senderCase[dbName] || 0,
    }));
    if (count !== ALL && balances[0].available < count) return { moved: [] };

    const transfers = balances.map(({ dbName, name, available }) => ({
      dbName, name, amount: count === ALL ? available : count,
    })).filter(({ amount }) => amount > 0);
    const snapshot = count === ALL ? transfers.map(({ dbName, amount }) => `${dbName}:${amount}`).join(",") : null;
    if (confirmed && snapshot !== confirmed.data.snapshot) return { error: CHANGED_TRANSFER };
    if (!transfers.length || (count === ALL && !confirmed)) return { moved: transfers, snapshot };

    const receiverCase = await getUserCase(to.id);
    for (const { dbName, amount } of transfers) {
      senderCase[dbName] -= amount;
      receiverCase[dbName] = (receiverCase[dbName] || 0) + amount;
    }
    await senderCase.save({ transaction });
    await receiverCase.save({ transaction });
    return { moved: transfers };
  });

  if (result.error) return ctx.reply(result.error);
  const { moved } = result;
  if (!moved.length) return ctx.reply("Недостаточно кейсов.");
  const description = moved.map(({ name, amount }) => `${name}: ${amount} шт.`).join("\n");
  if (count === ALL && !confirmed) return requestFullTransfer(ctx, sender, target, "cases", { caseId: id === ALL ? null : id, snapshot: result.snapshot }, description);
  const single = moved.length === 1 ? `${moved[0].amount} ${moved[0].dbName === "donate" ? "донат кейсов" : moved[0].name}` : null;
  const mention = transferRecipientLink(receiver);
  await ctx.replyWithHTML(single
    ? `Ты успешно передал(а) ${escapeTransferText(single)} ${mention}`
    : `Ты успешно передал(а) все кейсы ${mention}:\n${escapeTransferText(description)}`);
  if (transferredViaUsername) {
    try {
      await ctx.telegram.sendMessage(receiver.chatId, single
        ? `Тебе передали ${single} от ${ctx.from.first_name}`
        : `Тебе передали кейсы от ${ctx.from.first_name}:\n${description}`);
    } catch (error) {
      console.log("Не удалось отправить личное сообщение:", error.message);
    }
  }
}
