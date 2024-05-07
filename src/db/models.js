const sequelize = require("./config.js");
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
  captureCounter: { type: DataTypes.BIGINT, defaultValue: 0 },
  balance: { type: DataTypes.INTEGER, defaultValue: 0 },
  meflvl: { type: DataTypes.INTEGER, defaultValue: 1 },
  timelvl: { type: DataTypes.INTEGER, defaultValue: 1 },
  farmtime: { type: DataTypes.INTEGER, defaultValue: 0 },
  slots: { type: DataTypes.INTEGER, defaultValue: 10 },
  fullSlots: { type: DataTypes.INTEGER, defaultValue: 0 },
  gems: { type: DataTypes.INTEGER, defaultValue: 0 },
  takeBonus: { type: DataTypes.INTEGER, defaultValue: 0 },
  chests: { type: DataTypes.INTEGER, defaultValue: 0 },
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

const Case = sequelize.define("case", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    unique: true,
  },
  minecraft: { type: DataTypes.INTEGER, defaultValue: 0 },
  brawl: { type: DataTypes.INTEGER, defaultValue: 0 },
  hotline: { type: DataTypes.INTEGER, defaultValue: 0 },
  donate: { type: DataTypes.INTEGER, defaultValue: 0 },
  fallout: { type: DataTypes.INTEGER, defaultValue: 0 },
  fnaf: { type: DataTypes.INTEGER, defaultValue: 0 },
  gem: { type: DataTypes.INTEGER, defaultValue: 0 },
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
  userTwo: { type: DataTypes.STRING, defaultValue: "НЕТ" },
});

const Roles = sequelize.define("roles", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  status: { type: DataTypes.STRING },
  password: { type: DataTypes.STRING },
});

const Bonus = sequelize.define("bonus", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  time: { type: DataTypes.INTEGER, defaultValue: 0 },
});

const Add = sequelize.define("add", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  userId: { type: DataTypes.STRING },
  channelId: { type: DataTypes.STRING },
  itemId: { type: DataTypes.INTEGER },
});

const Chat = sequelize.define("chat", {
  chatId: {
    type: DataTypes.STRING,
    primaryKey: true,
    unique: true,
  },
  vip: { type: DataTypes.BOOLEAN, defaultValue: false },
  vipTime: { type: DataTypes.INTEGER, defaultValue: 0 },
  allowCase: { type: DataTypes.BOOLEAN, defaultValue: false },
  allowGames: { type: DataTypes.BOOLEAN, defaultValue: false },
});

const Active = sequelize.define("active", {
  day: { type: DataTypes.INTEGER },
  week: { type: DataTypes.INTEGER },
  month: { type: DataTypes.INTEGER },
});

User.hasOne(Case);
Case.belongsTo(User);
User.hasMany(Item, { as: "items" });
User.hasOne(Roles, { as: "role" });
Active.belongsTo(User, { foreignKey: "userId" });
Active.belongsTo(Chat, { foreignKey: "chatId" });
User.hasOne(Active, { foreignKey: "userId" });
Chat.hasOne(Active, { foreignKey: "chatId" });

module.exports = { User, Item, Logs, Roles, Bonus, Case, Add, Active, Chat };
