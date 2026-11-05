import { getUser } from "../db/functions.js";
import { separateNumber } from "../utils/helpers.js";
import { ALL, parseTransferAmount } from "../utils/transfer-amount.js";
import { getTransferRecipient, transferRecipientLink } from "../utils/transfer-recipient.js";
import economyService from "./economy-service.js";
import { CHANGED_TRANSFER, requestFullTransfer } from "./transfer-confirmation.js";

const units = {
  balance: "старок", gems: "гемов", donate: "искр", stones: "точильных камней",
  freeze: "охлаждающих жидкостей", oil: "смазок для видеокарт", chests: "ключей",
  coin: "BTC", famMoney: "семейных монет", snows: "снежинок",
};

export async function transferCurrency(ctx, currency, amountIndex = 2) {
  const amount = parseTransferAmount(ctx.message.text.trim().split(/\s+/)[amountIndex]);
  if (amount === null) return ctx.reply("Укажи целое положительное количество или «всё».");
  const target = await getTransferRecipient(ctx, amount === ALL ? { registeredOnly: true } : undefined);
  if (!target) return;
  const sender = ctx.state.user || await getUser(ctx.from.id);
  if (amount === ALL) {
    const expectedAmount = Number(sender[currency]);
    if (!Number.isSafeInteger(expectedAmount) || expectedAmount <= 0) return ctx.reply(`Недостаточно ${units[currency]} 🥲`);
    if (currency === "balance" && expectedAmount < 100) return ctx.reply("Минимальная сумма передачи — 100 старок.");
    return requestFullTransfer(ctx, sender, target, "currency", { currency, expectedAmount }, `${separateNumber(expectedAmount)} ${units[currency]}`);
  }
  return completeCurrencyTransfer(ctx, sender, target, currency, amount);
}

export async function completeCurrencyTransfer(ctx, sender, { receiver, transferredViaUsername }, currency, amount, {
  expectedAmount, replyFailure = text => ctx.reply(text),
} = {}) {
  const unit = units[currency];
  const minAmount = currency === "balance" ? 100 : 1;
  let result;
  try {
    result = await economyService.transfer({ sender, receiver, currency, amount, minAmount, expectedAmount });
  } catch (error) {
    switch (error.code || error.message) {
      case "TRANSFER_CHANGED": return replyFailure(CHANGED_TRANSFER);
      case "SELF_TRANSFER": return replyFailure("Нельзя передавать самому себе.");
      case "INSUFFICIENT_FUNDS": return replyFailure(`Недостаточно ${unit} 🥲`);
      case "MIN_AMOUNT": return replyFailure(`Минимальная сумма передачи — ${minAmount} ${unit}.`);
      default:
        console.error("Ошибка передачи валюты:", currency, error);
        return replyFailure("Ошибка при выполнении операции.");
    }
  }

  const quantity = separateNumber(result.amount);
  const stars = currency === "balance";
  const displayUnit = currency === "coin" ? "₿" : unit;
  const sent = `Ты успешно ${stars ? "отсыпал(а)" : "передал(а)"} ${quantity} ${displayUnit}`;
  if (stars || currency === "donate") await ctx.replyWithHTML(`${sent} ${transferRecipientLink(receiver)}`);
  else await ctx.reply(`${sent} ${receiver.firstname || "Игрок"}`);
  if (transferredViaUsername) {
    try {
      await ctx.telegram.sendMessage(receiver.chatId, `Тебе ${stars ? "отсыпали" : "передали"} ${quantity} ${displayUnit} от ${ctx.from.first_name}`);
    } catch (error) {
      console.log("Не удалось отправить личное сообщение:", error.message);
    }
  }
}
