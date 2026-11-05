import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});
class RedisService {
  constructor() {
    if (process.env.REDIS_PASSWORD) {
      this.client = createClient({
        socket: { host: "127.0.0.1", port: 6379 },
        password: process.env.REDIS_PASSWORD,
      });
    } else {
      this.client = createClient({
        socket: { host: "127.0.0.1", port: 6379 },
      });
    }
    this.client.on("error", (error) => console.error("Redis error:", error.message));
  }

  async connect() {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  async disconnect() {
    if (this.client.isOpen) {
      await this.client.disconnect();
    }
  }

  async set(key, value, ttl = 86400) {
    await this.client.set(key, value, { EX: ttl });
  }

  async get(key) {
    return await this.client.get(key);
  }

  async take(key) {
    return this.client.eval("local value = redis.call('GET', KEYS[1]); if value then redis.call('DEL', KEYS[1]) end; return value", {
      keys: [key],
    });
  }

  async delete(key) {
    await this.client.del(key);
  }

  async consumeCaptcha(key, chatId) {
    return this.client.eval("if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end", {
      keys: [String(key)], arguments: [String(chatId)],
    });
  }

  async setInvite(key, value) {
    await this.client.set(`invite:${key}`, value, { EX: 900 });
  }

  async setBuffer(key, buffer, ttl = 86400) {
    await this.client.set(key, buffer, { EX: ttl });
  }

  async getBuffer(key) {
    return await this.client.sendCommand(["GET", key], {
      returnBuffers: true,
    });
  }
}

export default new RedisService();
