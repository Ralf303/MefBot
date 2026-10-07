import { Payment } from "../db/models.js";
import { withUserTransaction } from "./transaction-service.js";

class PaymentError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

function createDonatePayload(userId, count) {
  return `donate:${userId}:${count}:${Date.now().toString(36)}`;
}

function parseDonatePayload(payload) {
  const [kind, userId, count] = String(payload || "").split(":");
  const amount = Number(count);

  if (kind !== "donate" || !Number.isSafeInteger(Number(userId)) || Number(userId) <= 0 || !Number.isSafeInteger(amount) || amount <= 0) {
    throw new PaymentError("INVALID_PAYLOAD");
  }

  return { userId: Number(userId), count: amount };
}

class PaymentService {
  createDonatePayload(userId, count) {
    return createDonatePayload(userId, count);
  }

  validatePreCheckout(query) {
    if (
      query.invoice_payload === "gold" &&
      query.currency === "XTR" &&
      Number.isSafeInteger(query.total_amount) && query.total_amount > 0
    ) {
      return { legacy: true, count: query.total_amount };
    }

    const payload = parseDonatePayload(query.invoice_payload);
    if (query.currency !== "XTR" || query.total_amount !== payload.count) {
      throw new PaymentError("INVALID_PAYMENT");
    }
    if (Number(query.from?.id) !== payload.userId) {
      throw new PaymentError("INVALID_PAYMENT_USER");
    }
    return payload;
  }

  async applySuccessfulDonate(user, payment) {
    const payload =
      payment.invoice_payload === "gold"
        ? { userId: Number(user.chatId), count: payment.total_amount, legacy: true }
        : parseDonatePayload(payment.invoice_payload);
    const chargeId = payment.telegram_payment_charge_id;

    if (
      !Number.isSafeInteger(payment.total_amount) || payment.total_amount <= 0 ||
      payment.currency !== "XTR" ||
      payment.total_amount !== payload.count ||
      Number(user.chatId) !== payload.userId ||
      !chargeId
    ) {
      throw new PaymentError("INVALID_PAYMENT");
    }

    const apply = () => withUserTransaction(user, async (lockedUser, transaction) => {
      const [record, created] = await Payment.findOrCreate({
      where: { chargeId },
      transaction,
      defaults: {
        userId: user.id,
        amount: payment.total_amount,
        payload: payment.invoice_payload,
      },
    });

    if (!created) {
      return { duplicate: true, record };
    }

    lockedUser.donate = Number(lockedUser.donate) + payment.total_amount;
    await lockedUser.save({ transaction });

    return { duplicate: false, record };
    });
    for (let attempt = 0; ; attempt++) {
      try { return await apply(); }
      catch (error) {
        const code = error.original?.code || error.parent?.code || error.code;
        if (attempt >= 2 || !["ER_LOCK_DEADLOCK", "ER_LOCK_WAIT_TIMEOUT", "ECONNRESET", "ETIMEDOUT", "PROTOCOL_CONNECTION_LOST", "ECONNREFUSED"].includes(code)) throw error;
        await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)));
      }
    }
  }
}

export { PaymentError, parseDonatePayload };
export default new PaymentService();
