import { Composer } from "telegraf";
import { User } from "../../db/models.js";
import { completeCurrencyTransfer } from "../../services/currency-transfer-command.js";
import { currentLogContext } from "../../services/game-log-service.js";
import { takeFullTransfer } from "../../services/transfer-confirmation.js";
import { ALL } from "../../utils/transfer-amount.js";
import { giveCard } from "../card-module/card-service.js";
import { giveCase } from "../case-module/case-utils/give-case-service.js";
import { giveItem } from "../items-module/items-utils/give-item-service.js";

const router = new Composer();

router.action(/^all_transfer:([yn]):([a-f0-9]{32})$/, async ctx => {
  if (!ctx.chat) return ctx.answerCbQuery("Подтверждение недоступно.");
  const [, action, token] = ctx.match;
  const pending = await takeFullTransfer(ctx, token).catch(error => {
    console.error("Transfer confirmation store unavailable:", error.name);
    return undefined;
  });
  if (pending === undefined) return ctx.answerCbQuery("Подтверждение временно недоступно. Попробуй ещё раз.");
  if (!pending) return ctx.answerCbQuery("Это не твоя заявка или она уже закрыта.");

  await ctx.answerCbQuery().catch(() => {});
  await ctx.editMessageReplyMarkup({ inline_keyboard: [] }).catch(() => {});
  if (action === "n") return ctx.reply("Передача отменена.");

  const [sender, receiver] = await Promise.all([User.findByPk(pending.senderId), User.findByPk(pending.receiverId)]);
  if (!sender || !receiver || sender.id === receiver.id ||
      String(sender.chatId) !== String(ctx.from.id) || String(receiver.chatId) !== pending.receiverTelegramId) {
    return ctx.reply("Участник перевода недоступен. Ничего не передано.");
  }

  const { kind, data, transferredViaUsername } = pending;
  const target = { receiver, transferredViaUsername };
  const confirmed = { target, data };
  const scope = currentLogContext();
  if (scope) {
    scope.actorId = sender.id;
    scope.command = "передать всё (подтверждено)";
  }
  if (kind === "currency") return completeCurrencyTransfer(ctx, sender, target, data.currency, ALL, data.expectedAmount);
  if (kind === "items") return giveItem(sender, ALL, ctx, confirmed);
  if (kind === "cards") return giveCard(sender, ALL, ctx, confirmed);
  if (kind === "cases") return giveCase(sender, data.caseId ?? ALL, ALL, ctx, confirmed);
  return ctx.reply("Не удалось распознать перевод. Ничего не передано.");
});

export default router;
