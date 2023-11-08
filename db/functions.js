const sequelize = require("./db.js");
const { User } = require("./models");

const getUser = async (chatId, firstName, username) => {
  try {
    let user = await User.findOne({ where: { chatId } });
    if (!user) {
      user = await User.create({ chatId, firstname: firstName, username });
    } else {
      if (!username) {
        user = await user.update({ username: "dont_have_tag" });
      }

      if (!(user.username === username)) {
        user = await user.update({ username });
      }

      if (!user.firstname || !(user.firstname === firstName)) {
        user = await user.update({ firstname: firstName });
      }
    }
    return user;
  } catch (e) {
    console.log(e);
  }
};

async function findTopUserInDay() {
  const topUsers = await User.findAll({
    order: [["dayMessageCounter", "DESC"]],
    limit: 3, // ограничиваем количество найденных пользователей тремя
  });
  return topUsers;
}

async function findTopUserInWeek() {
  const topUser = await User.findOne({
    order: [["weekMessageCounter", "DESC"]],
  });
  return topUser;
}

async function findTopUserInMonth() {
  const topUser = await User.findOne({
    order: [["monthMessageCounter", "DESC"]],
  });
  return topUser;
}

const connectToDb = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    await sequelize.sync();
    console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

async function resetDayCounter() {
  await User.update({ dayMessageCounter: 0 }, { where: {} });
}

async function resetWeekCounter() {
  await User.update({ weekMessageCounter: 0 }, { where: {} });
}

async function resetMonthCounter() {
  await User.update({ monthMessageCounter: 0 }, { where: {} });
}

module.exports = {
  connectToDb,
  getUser,
  findTopUserInDay,
  resetDayCounter,
  findTopUserInWeek,
  findTopUserInMonth,
  resetWeekCounter,
  resetMonthCounter,
};
