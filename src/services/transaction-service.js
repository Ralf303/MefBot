import sequelize, { currentTransaction } from "../db/config.js";
import { User } from "../db/models.js";

// Copy committed values without marking the caller's old instance dirty again.
export function refreshInstance(target, source) {
  if (!target || !source) return;
  const values = source.get ? source.get({ plain: true }) : source;
  if (!target.set) {
    Object.assign(target, values);
    return;
  }
  target.set(values, { raw: true });
  for (const key of Object.keys(values)) {
    target._previousDataValues[key] = values[key];
    target.changed(key, false);
  }
}

export async function withUsersTransaction(users, operation) {
  const ids = [...new Set(users.map((user) => Number(user.id)))].sort((a, b) => a - b);
  const execute = async (transaction) => {
    const locked = new Map();
    for (const id of ids) {
      const user = await User.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
      if (!user) throw new Error("USER_NOT_FOUND");
      // mysql BIGINT may be returned as a string; arithmetic must never concatenate it.
      for (const field of ["balance", "gems", "donate", "stones", "freeze", "oil", "chests", "coin", "famMoney"]) {
        const value = Number(user[field]);
        if (user[field] !== undefined && !Number.isSafeInteger(value)) throw new Error("INVALID_STORED_BALANCE");
        if (user.setDataValue) user.setDataValue(field, value);
        else if (user[field] !== undefined) user[field] = value;
      }
      locked.set(id, user);
    }
    const value = await operation(users.map((user) => locked.get(Number(user.id))), transaction);
    return { value, locked };
  };
  const existing = currentTransaction();
  const result = existing ? await execute(existing) : await sequelize.transaction(execute);
  for (const user of users) refreshInstance(user, result.locked.get(Number(user.id)));
  return result.value;
}

// Do not hold database locks while sending notifications to Telegram.
export async function withUserOperation(user, ctx, operation) {
  const outer = currentTransaction();
  const notifications = [];
  const defer = (target) => new Proxy(target, {
    get(object, key) {
      const value = object[key];
      if (typeof value !== "function") return value;
      if (["reply", "replyWithHTML", "replyWithPhoto", "sendMessage"].includes(key)) {
        return async (...args) => { notifications.push(() => value.apply(object, args)); };
      }
      return value.bind(object);
    },
  });
  const deferredCtx = ctx && new Proxy(defer(ctx), {
    get(object, key) { return key === "telegram" ? defer(ctx.telegram) : object[key]; },
  });
  const result = await withUserTransaction(user, (locked, transaction) => operation(locked, deferredCtx, transaction));
  const send = async () => {
    for (const notify of notifications) {
      try { await notify(); } catch (error) { console.error("Committed operation notification failed:", error); }
    }
  };
  if (outer) outer.afterCommit(send);
  else await send();
  return result;
}

export function withUserTransaction(user, operation) {
  return withUsersTransaction([user], ([locked], transaction) => operation(locked, transaction));
}
