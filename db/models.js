const sequelize = require("./db.js");
const { DataTypes } = require("sequelize");

const User = sequelize.define("user", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  chatId: { type: DataTypes.STRING, unique: true },
  username: { type: DataTypes.STRING },
  firstname: { type: DataTypes.STRING },
  captureCounter: { type: DataTypes.INTEGER, defaultValue: 0 },
  dayMessageCounter: { type: DataTypes.INTEGER, defaultValue: 0 },
  weekMessageCounter: { type: DataTypes.INTEGER, defaultValue: 0 },
  monthMessageCounter: { type: DataTypes.INTEGER, defaultValue: 0 },
  balance: { type: DataTypes.INTEGER, defaultValue: 0 },
  meflvl: { type: DataTypes.INTEGER, defaultValue: 1 },
  timelvl: { type: DataTypes.INTEGER, defaultValue: 1 },
  farmtime: { type: DataTypes.INTEGER, defaultValue: 0 },
});

module.exports = User;
