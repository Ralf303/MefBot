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
  slots: { type: DataTypes.INTEGER, defaultValue: 10 },
  fullSlots: { type: DataTypes.INTEGER, defaultValue: 0 },
  minecraftCase: { type: DataTypes.INTEGER, defaultValue: 0 },
  brawlCase: { type: DataTypes.INTEGER, defaultValue: 0 },
  hotlineCase: { type: DataTypes.INTEGER, defaultValue: 0 },
});

const Item = sequelize.define("item", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  src: { type: DataTypes.STRING },
  itemName: { type: DataTypes.STRING },
  bodyPart: { type: DataTypes.STRING },
  isWorn: { type: DataTypes.BOOLEAN, defaultValue: false },
  price: { type: DataTypes.INTEGER },
});

const Logs = sequelize.define("logs", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  date: { type: DataTypes.STRING },
  action: { type: DataTypes.STRING },
  userOne: { type: DataTypes.STRING },
  userTwo: { type: DataTypes.STRING, defaultValue: "0" },
});

User.hasMany(Item, { as: "items" });

module.exports = { User, Item, Logs };
