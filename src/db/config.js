import { Sequelize } from "sequelize";
import dotenv from "dotenv";
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
