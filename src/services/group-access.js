const cache = new Map();
const TTL = 30_000;
const MAX_CHATS = 4096;
const keyFor = (botId, chatId) => `${botId}:${chatId}`;

export const isGroupChat = chat => chat?.type === "group" || chat?.type === "supergroup";

async function hasGroupAdmin(telegram, botId, chatId, fresh = false) {
  const key = keyFor(botId, chatId);
  const current = cache.get(key);
  if (current?.pending) return current.pending;
  if (!fresh && current?.until > Date.now()) return current.allowed;

  const entry = {};
  cache.delete(key);
  cache.set(key, entry);
  if (cache.size > MAX_CHATS) cache.delete(cache.keys().next().value);
  entry.pending = (async () => {
    let allowed = false, ttl = TTL;
    try {
      const { status } = await telegram.getChatMember(chatId, botId);
      allowed = status === "administrator" || status === "creator";
    } catch {
      ttl = 5_000;
    }
    // A membership update can invalidate the lookup while Telegram is replying.
    if (cache.get(key) !== entry) return false;
    Object.assign(entry, { pending: null, allowed, until: Date.now() + ttl });
    return allowed;
  })();
  return entry.pending;
}

export async function requireGroupAdmin(ctx, next) {
  if (!isGroupChat(ctx.chat)) return next();
  if (ctx.myChatMember) {
    cache.delete(keyFor(ctx.botInfo.id, ctx.chat.id));
    return;
  }
  const isTransferButton = ctx.callbackQuery?.data?.startsWith("all_transfer:");
  if (await hasGroupAdmin(ctx.telegram, ctx.botInfo.id, ctx.chat.id, isTransferButton)) return next();
}

// Also cover messages to groups sent by scheduled jobs and cross-chat announcements.
export async function canPostToGroup(bot, chatId) {
  if (!chatId) return false;
  try {
    const info = bot.botInfo ?? await bot.telegram.getMe();
    return await hasGroupAdmin(bot.telegram, info.id, chatId);
  } catch {
    return false;
  }
}
