import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { AsyncLocalStorage } from "node:async_hooks";

// Legacy helpers and associations participate in the transaction of their caller.
const storage = new AsyncLocalStorage();
export const currentTransaction = () => storage.getStore()?.get("transaction");
Sequelize.useCLS({
  run: (callback) => storage.run(new Map(), callback),
  bind: (callback) => {
    const context = storage.getStore();
    return (...args) => storage.run(context || new Map(), () => callback(...args));
  },
  get: (key) => storage.getStore()?.get(key),
  set: (key, value) => storage.getStore()?.set(key, value),
});
dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});

export default new Sequelize(
  process.env.DATABASE,
  process.env.USER_NAME,
  process.env.PASSWORD,
  {
    host: process.env.HOST,
    port: process.env.PORT,
    dialect: "mysql",
    logging: false,
  }
);
