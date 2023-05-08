const sequelize = require("..//DataBase/db");
const UserModel = require("../DataBase/models.js");
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

async function connectToDb() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  connectToDb,
  getUser,
};
