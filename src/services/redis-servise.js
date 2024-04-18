const { createClient } = require("redis");
require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});
class RedisService {
  constructor() {
    this.client = createClient({
      host: "127.0.0.1",
      port: 6379,
      password: process.env.REDIS_PASSWORD,
    });
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
}

module.exports = new RedisService();
