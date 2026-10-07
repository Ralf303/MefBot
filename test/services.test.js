import test from "node:test";
import assert from "node:assert/strict";
import jwtService from "../src/services/jwt-service.js";
import paymentService, { parseDonatePayload } from "../src/services/payment-service.js";

test("signed tokens round-trip and reject tampering", () => {
  const token = jwtService.generateToken({ id: 7 }, "event");

  assert.deepEqual(jwtService.verifyToken(token, "event"), { id: 7 });

  const tampered = token.replace(/.$/, token.endsWith("a") ? "b" : "a");
  assert.throws(() => jwtService.verifyToken(tampered, "event"));
});

test("unsigned legacy tokens are rejected", () => {
  const legacy = Buffer.from(JSON.stringify({ id: 9 }), "utf-8").toString(
    "base64"
  );

  assert.throws(() => jwtService.verifyToken(legacy, "event"), /INVALID_TOKEN_SIGNATURE/);
});

test("donate payment payload validates expected user and amount", () => {
  const payload = paymentService.createDonatePayload(12345, 10);

  assert.deepEqual(parseDonatePayload(payload), {
    userId: 12345,
    count: 10,
  });
  assert.throws(() => parseDonatePayload("gold"));
});

test("legacy donate payment payload is accepted for pre-checkout", () => {
  assert.deepEqual(
    paymentService.validatePreCheckout({
      invoice_payload: "gold",
      currency: "XTR",
      total_amount: 3,
    }),
    { legacy: true, count: 3 }
  );
});


test("event and advertisement links fit Telegram and distinguish purposes", () => {
  for (const type of ["event", "add"]) {
    const payload = type === "event" ? { id: 999999 } : { id: 999999, channelId: -1001234567890 };
    const token = jwtService.generateToken(payload, type);
    assert.ok((type + "_" + token).length <= 64);
    assert.match(token, /^[A-Za-z0-9_-]+$/);
    assert.deepEqual(jwtService.verifyToken(token, type), payload);
    assert.throws(() => jwtService.verifyToken(token, type === "event" ? "add" : "event"));
  }
});

test("pre-checkout rejects wrong payer, currency and amount", () => {
  const query = { invoice_payload: paymentService.createDonatePayload(12345, 10), currency: "XTR", total_amount: 10, from: { id: 12345 } };
  assert.equal(paymentService.validatePreCheckout(query).count, 10);
  for (const change of [{ from: { id: 2 } }, { currency: "USD" }, { total_amount: 11 }]) {
    assert.throws(() => paymentService.validatePreCheckout({ ...query, ...change }));
  }
});


test("trade callbacks fit 64 bytes and authenticate price and participants", () => {
  const fields = { id: 2147483647, senderId: Number.MAX_SAFE_INTEGER, receiverId: Number.MAX_SAFE_INTEGER - 1, price: Number.MAX_SAFE_INTEGER };
  for (const kind of ["item", "card", "home"]) {
    const token = jwtService.generateTradeToken(kind, fields);
    assert.equal(Buffer.byteLength(token), 63);
    assert.deepEqual(jwtService.verifyTradeToken(token), { kind, ...fields });
    const tampered = token.slice(0, 8) + (token[8] === "A" ? "B" : "A") + token.slice(9);
    assert.throws(() => jwtService.verifyTradeToken(tampered));
  }
  assert.throws(() => jwtService.verifyTradeToken("sell 1 123 456 100"));
});
