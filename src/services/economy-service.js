import { withUserTransaction, withUsersTransaction } from "./transaction-service.js";

const CURRENCIES = new Set(["balance", "gems", "donate", "stones", "freeze", "oil", "chests", "coin", "famMoney"]);
class EconomyError extends Error {
  constructor(code, message = code) { super(message); this.code = code; }
}
function assertCurrency(currency) {
  if (!CURRENCIES.has(currency)) throw new EconomyError("INVALID_CURRENCY");
}
function normalizeAmount(amount) {
  const value = Number(amount);
  if (!Number.isSafeInteger(value) || value <= 0) throw new EconomyError("INVALID_AMOUNT");
  return value;
}
function setBalance(user, currency, amount) {
  if (!Number.isSafeInteger(amount) || amount < 0) throw new EconomyError("INVALID_BALANCE");
  user[currency] = amount;
}
class EconomyService {
  async wager({ user, stake, winnings }) {
    const amount = normalizeAmount(stake);
    if (!Number.isSafeInteger(winnings) || winnings < 0) throw new EconomyError("INVALID_AMOUNT");
    return withUserTransaction(user, async (locked, transaction) => {
      if (locked.balance < amount) throw new EconomyError("INSUFFICIENT_FUNDS");
      setBalance(locked, "balance", locked.balance - amount + winnings);
      await locked.save({ transaction });
    });
  }

  async transfer({ sender, receiver, currency, amount, minAmount = 1 }) {
    assertCurrency(currency);
    const value = normalizeAmount(amount);
    if (value < minAmount) throw new EconomyError("MIN_AMOUNT");
    if (!sender || !receiver || Number(sender.id) === Number(receiver.id)) throw new EconomyError("SELF_TRANSFER");
    return withUsersTransaction([sender, receiver], async ([lockedSender, lockedReceiver], transaction) => {
      if (lockedSender[currency] < value) throw new EconomyError("INSUFFICIENT_FUNDS");
      setBalance(lockedSender, currency, lockedSender[currency] - value);
      setBalance(lockedReceiver, currency, lockedReceiver[currency] + value);
      await lockedSender.save({ transaction });
      await lockedReceiver.save({ transaction });
      return { sender: lockedSender, receiver: lockedReceiver };
    });
  }

  async exchange({ user, spendCurrency, receiveCurrency, spendAmount, receiveAmount }) {
    assertCurrency(spendCurrency);
    assertCurrency(receiveCurrency);
    if (spendCurrency === receiveCurrency) throw new EconomyError("INVALID_CURRENCY");
    const spend = normalizeAmount(spendAmount);
    const receive = normalizeAmount(receiveAmount);
    return withUserTransaction(user, async (locked, transaction) => {
      if (locked[spendCurrency] < spend) throw new EconomyError("INSUFFICIENT_FUNDS");
      setBalance(locked, spendCurrency, locked[spendCurrency] - spend);
      setBalance(locked, receiveCurrency, locked[receiveCurrency] + receive);
      await locked.save({ transaction });
      return locked;
    });
  }

  async add({ user, currency, amount }) {
    assertCurrency(currency);
    const value = normalizeAmount(amount);
    return withUserTransaction(user, async (locked, transaction) => {
      setBalance(locked, currency, locked[currency] + value);
      await locked.save({ transaction });
      return locked;
    });
  }
}
export { EconomyError };
export default new EconomyService();
