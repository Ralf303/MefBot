import { createHash, randomBytes } from "node:crypto";
import { Markup } from "telegraf";
import redis from "./redis-service.js";

const TTL = 120;
const keyFor = (ctx, token) => `transfer:all:${ctx.chat.id}:${ctx.from.id}:${token}`;
export const CHANGED_TRANSFER = "Состав или сумма перевода изменились. Ничего не передано. Введи команду ещё раз.";

export function assetSnapshot(rows) {
  return createHash("sha256").update(rows.map(row => Number(row.id)).sort((a, b) => a - b).join(",")).digest("hex");
}

export async function requestFullTransfer(ctx, sender, target, kind, data, description) {
  const token = randomBytes(16).toString("hex");
  const key = keyFor(ctx, token);
  const { receiver, transferredViaUsername } = target;
  await redis.set(key, JSON.stringify({
    senderId: sender.id, receiverId: receiver.id, receiverTelegramId: String(receiver.chatId),
    transferredViaUsername, kind, data,
  }), TTL);
  const username = receiver.username && receiver.username !== "donthavetag" ? ` (@${receiver.username})` : "";
  try {
    await ctx.reply(
      `Получатель: ${receiver.firstname || "Игрок"}${username}\nTelegram ID: ${receiver.chatId}\n\nБудет передано:\n${description}\n\nПодтверждение действует 2 минуты.`,
      Markup.inlineKeyboard([
        Markup.button.callback("Подтвердить", `all_transfer:y:${token}`),
        Markup.button.callback("Отменить", `all_transfer:n:${token}`),
      ]),
    );
  } catch (error) {
    await redis.delete(key).catch(() => {});
    throw error;
  }
}

export async function takeFullTransfer(ctx, token) {
  const value = await redis.take(keyFor(ctx, token));
  return value ? JSON.parse(value) : null;
}
