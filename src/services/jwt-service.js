import crypto from "node:crypto";
import dotenv from "dotenv";
dotenv.config({ path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev" });

function secret() {
  const value = process.env.JWT_SECRET || process.env.BOT_TOKEN || process.env.PASSWORD;
  if (!value) throw new Error("TOKEN_SECRET_REQUIRED");
  return value;
}
function sign(body) {
  return crypto.createHmac("sha256", secret()).update(body).digest().subarray(0, 16).toString("base64url");
}
function integer(value) {
  if (!/^-?\d+$/.test(String(value)) || !Number.isSafeInteger(Number(value))) throw new Error("INVALID_TOKEN_PAYLOAD");
  return Number(value);
}
class Jwt {
  generateTradeToken(kind, { id, senderId, receiverId, price }) {
    const kinds = { item: 1, card: 2, home: 3 };
    if (!kinds[kind]) throw new Error("INVALID_TRADE");
    const data = Buffer.alloc(33);
    data.writeUInt8(kinds[kind], 0);
    data.writeUInt32BE(integer(id), 1);
    data.writeBigUInt64BE(BigInt(integer(senderId)), 5);
    data.writeBigUInt64BE(BigInt(integer(receiverId)), 13);
    data.writeBigUInt64BE(BigInt(integer(price)), 21);
    data.writeUInt32BE(Math.floor(Date.now() / 1000), 29);
    const body = data.toString("base64url");
    return `t_${body}_${sign("trade:" + body).slice(0, 16)}`;
  }

  verifyTradeToken(token) {
    token = String(token);
    if (!/^t_[A-Za-z0-9_-]{44}_[A-Za-z0-9_-]{16}$/.test(token)) throw new Error("INVALID_TRADE_SIGNATURE");
    const body = token.slice(2, -17);
    const signature = token.slice(-16);
    const expected = sign("trade:" + body).slice(0, 16);
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw new Error("INVALID_TRADE_SIGNATURE");
    const data = Buffer.from(body, "base64url");
    const kind = { 1: "item", 2: "card", 3: "home" }[data.readUInt8(0)];
    const result = {
      kind, id: data.readUInt32BE(1), senderId: Number(data.readBigUInt64BE(5)),
      receiverId: Number(data.readBigUInt64BE(13)), price: Number(data.readBigUInt64BE(21)),
    };
    const age = Math.floor(Date.now() / 1000) - data.readUInt32BE(29);
    if (!kind || age < -60 || age > 7 * 86400 ||
        ![result.id, result.senderId, result.receiverId, result.price].every((value) => Number.isSafeInteger(value) && value > 0)) throw new Error("INVALID_TRADE_SIGNATURE");
    return result;
  }

  generateToken(payload, type = "generic") {
    const time = Math.floor(Date.now() / 1000).toString(36);
    let body;
    if (type === "event" || type === "add") {
      body = [type === "event" ? "e" : "a", integer(payload.id).toString(36), time];
      if (type === "add") body.push(integer(payload.channelId).toString(36));
      body = body.join("_");
    } else {
      body = "g_" + Buffer.from(JSON.stringify({ type, payload, time })).toString("base64url");
    }
    return body + "_" + sign(body);
  }
  verifyToken(token, expectedType) {
    token = String(token);
    if (token.length < 24 || token.at(-23) !== "_") throw new Error("INVALID_TOKEN_SIGNATURE");
    const body = token.slice(0, -23);
    const signature = token.slice(-22);
    const expected = sign(body);
    if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      throw new Error("INVALID_TOKEN_SIGNATURE");
    }
    let type, payload, timestamp;
    if (body.startsWith("g_")) {
      const parsed = JSON.parse(Buffer.from(body.slice(2), "base64url").toString("utf8"));
      ({ type, payload } = parsed);
      timestamp = parseInt(parsed.time, 36);
    } else {
      const parts = body.split("_");
      type = parts[0] === "e" ? "event" : parts[0] === "a" ? "add" : null;
      if (!type || parts.length !== (type === "event" ? 3 : 4)) throw new Error("INVALID_TOKEN_TYPE");
      payload = { id: parseInt(parts[1], 36) };
      if (type === "add") payload.channelId = parseInt(parts[3], 36);
      timestamp = parseInt(parts[2], 36);
    }
    if (expectedType && type !== expectedType) throw new Error("INVALID_TOKEN_TYPE");
    const now = Math.floor(Date.now() / 1000);
    if (!Number.isFinite(timestamp) || timestamp > now + 60 || now - timestamp > 7 * 86400) throw new Error("TOKEN_EXPIRED");
    return payload;
  }
}
export default new Jwt();
