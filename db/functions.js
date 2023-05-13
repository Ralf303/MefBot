const sequelize = require("./db.js");
const UserModel = require("./models.js");

const getUser = async (chatId, firstName, username) => {
  let user = await UserModel.findOne({ where: { chatId } });
  if (!user) {
    user = await UserModel.create({ chatId, firstname: firstName, username });
  } else {
    if (!user.username) {
      user = await user.update({ username });
    }
    if (!user.firstname) {
      user = await user.update({ firstname: firstName });
    }
  }
  return user;
};

async function findTopUserInDay() {
  const topUser = await UserModel.findOne({
    order: [["dayMessageCounter", "DESC"]],
  });
  return topUser;
}

async function findTopUserInWeek() {
  const topUser = await UserModel.findOne({
    order: [["weekMessageCounter", "DESC"]],
  });
  return topUser;
}

async function findTopUserInMonth() {
  const topUser = await UserModel.findOne({
    order: [["monthMessageCounter", "DESC"]],
  });
  return topUser;
}
async function connectToDb() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
  } catch (error) {
    console.log(error);
  }
}

async function resetDayCounter() {
  await UserModel.update({ dayMessageCounter: 0 }, { where: {} });
}

async function resetWeekCounter() {
  await UserModel.update({ weekMessageCounter: 0 }, { where: {} });
}

async function resetMonthCounter() {
  await UserModel.update({ monthMessageCounter: 0 }, { where: {} });
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
