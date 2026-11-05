import { getUser } from "../db/functions.js";
import { separateNumber } from "../utils/helpers.js";
import { parseTransferAmount } from "../utils/transfer-amount.js";
import { getTransferRecipient } from "../utils/transfer-recipient.js";
import economyService from "./economy-service.js";

const units = {
  balance: "старок", gems: "гемов", donate: "искр", stones: "точильных камней",
  freeze: "охлаждающих жидкостей", oil: "смазок для видеокарт", chests: "ключей",
  coin: "BTC", famMoney: "семейных монет", snows: "снежинок",
};

export async function transferCurrency(ctx, currency, amountIndex = 2) {
  const amount = parseTransferAmount(ctx.message.text.trim().split(/\s+/)[amountIndex]);
  if (amount === null) return ctx.reply("Укажи целое положительное количество или «всё».");

  const unit = units[currency];
  const minAmount = currency === "balance" ? 100 : 1;
  let result, receiver, transferredViaUsername;
  try {
    const target = await getTransferRecipient(ctx);
    if (!target) return;
    ({ receiver, transferredViaUsername } = target);
    const sender = ctx.state.user || await getUser(ctx.from.id);
    result = await economyService.transfer({ sender, receiver, currency, amount, minAmount });
  } catch (error) {
    switch (error.code || error.message) {
      case "SELF_TRANSFER": return ctx.reply("Нельзя передавать самому себе.");
      case "INSUFFICIENT_FUNDS": return ctx.reply(`Недостаточно ${unit} 🥲`);
      case "MIN_AMOUNT": return ctx.reply(`Минимальная сумма передачи — ${minAmount} ${unit}.`);
      default:
        console.error("Ошибка передачи валюты:", currency, error);
        return ctx.reply("Ошибка при выполнении операции.");
    }
  }

  const quantity = separateNumber(result.amount);
  await ctx.reply(`Ты успешно передал(а) ${quantity} ${unit} → ${receiver.firstname}`);
  if (transferredViaUsername) {
    try {
      await ctx.telegram.sendMessage(receiver.chatId, `Тебе передали ${quantity} ${unit} от ${ctx.from.first_name}`);
    } catch (error) {
      console.log("Не удалось отправить личное сообщение:", error.message);
    }
  }
}
