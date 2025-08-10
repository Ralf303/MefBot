import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});
class RedisService {
  constructor() {
    if (process.env.REDIS_PASSWORD) {
      this.client = createClient({
        host: "127.0.0.1",
        port: 6379,
        password: process.env.REDIS_PASSWORD,
      });
    } else {
      this.client = createClient({
        host: "127.0.0.1",
        port: 6379,
      });
    }
  }

  async connect() {
    await this.client.connect();
  }

  async disconnect() {
    await this.client.disconnect();
  }

  async set(key, value) {
    await this.client.set(key, value, {
      EX: 86400,
    });
  }

  async get(key) {
    const value = await this.client.get(key);
    return value;
  }

  async delete(key) {
    this.client.del(key);
  }

  async setInvite(key, value) {
    await this.client.set(`invite:${key}`, value, {
      EX: 900,
    });
  }
}

export default new RedisService();
