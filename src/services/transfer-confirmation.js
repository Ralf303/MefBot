import { createHash, randomBytes } from "node:crypto";
import { Markup } from "telegraf";
import redis from "./redis-service.js";
import { isGroupChat } from "./group-access.js";

const TTL = 120;
const expiryText = "\n\nПодтверждение действует 2 минуты.";
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
  const keyboard = Markup.inlineKeyboard([
    Markup.button.callback("Подтвердить", `all_transfer:y:${token}`),
    Markup.button.callback("Отменить", `all_transfer:n:${token}`),
  ]);
  const inGroup = isGroupChat(ctx.chat);
  try {
    await ctx.reply(
      `Получатель: ${receiver.firstname || "Игрок"}${username}\nTelegram ID: ${receiver.chatId}\n\nБудет передано:\n${description}${expiryText}`,
      inGroup ? { ...keyboard, ephemeral_message_parameters: { receiver_user_id: ctx.from.id } } : keyboard,
    );
  } catch (error) {
    await redis.delete(key).catch(() => {});
    if (inGroup) {
      console.error("Private transfer preview failed:", error.name, error.code || "");
      return;
    }
    throw error;
  }
}

export async function updateTransferPrompt(ctx, status) {
  const message = ctx.callbackQuery?.message;
  const reply_markup = { inline_keyboard: [] };
  const original = message?.text;
  const text = status && (original?.endsWith(expiryText)
    ? `${original.slice(0, -expiryText.length)}\n\n${status}`
    : status);
  if (message?.ephemeral_message_id !== undefined) {
    return ctx.telegram.callApi(status ? "editEphemeralMessageText" : "editEphemeralMessageReplyMarkup", {
      chat_id: ctx.chat.id,
      receiver_user_id: ctx.from.id,
      ephemeral_message_id: message.ephemeral_message_id,
      reply_markup,
      ...(text ? { text } : {}),
    });
  }
  if (!message?.message_id) return;
  if (status) return ctx.editMessageText(text, { reply_markup });
  return ctx.editMessageReplyMarkup(reply_markup);
}

export async function takeFullTransfer(ctx, token) {
  const value = await redis.take(keyFor(ctx, token));
  return value ? JSON.parse(value) : null;
}
