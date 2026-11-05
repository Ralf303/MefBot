import { resolveReceiver } from "./helpers.js";

const messages = {
  BOT_REJECT: "Боту нельзя ничего передавать.",
  NO_TARGET: "Ответь на сообщение получателя или укажи @username.",
  NOT_FOUND: "Получатель не найден.",
  SELF_TRANSFER: "Нельзя передавать самому себе.",
};

export async function getTransferRecipient(ctx, options) {
  try {
    return await resolveReceiver(ctx, options);
  } catch (error) {
    if (!Object.hasOwn(messages, error.message)) throw error;
    await ctx.reply(messages[error.message]);
    return null;
  }
}
