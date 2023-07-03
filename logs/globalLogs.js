const { Logs } = require("../db/models");
const moment = require("moment");

async function giveResoursesLog(user, resiver, item, count) {
  moment.locale("ru");
  const date = `${moment().format("L")}`;
  const time = `${moment().format("LTS")}`;

  const newLog = await Logs.create({
    date: `${date}\n${time}`,
    action: `Юзер ${resiver.firstname}(${resiver.chatId}) получил от ${user.firstname}(${user.chatId}) ${item} в количестве ${count}`,
    userOne: `${resiver.balance}`,
    userTwo: `${user.balance}`,
  });

  await newLog.save();
}

async function gamesLog(user, game, win, previous) {
  moment.locale("ru");
  const date = `${moment().format("L")}`;
  const time = `${moment().format("LTS")}`;
  console.log("начало");
  const newLog = await Logs.create({
    date: `${date} ${time}`,
    action: `Юзер ${user.firstname}(${user.chatId}) сыграл в ${game} и выйграл ${win}. Было ${previous} стало ${user.balance}`,
    userOne: `${user.balance}`,
  });
  console.log(`конец ${newLog}`);
  await newLog.save();
}

async function loseLog(user, item, reason) {
  moment.locale("ru");
  const date = `${moment().format("L")}`;
  const time = `${moment().format("LTS")}`;
  console.log("начало");
  const newLog = await Logs.create({
    date: `${date} ${time}`,
    action: `Юзер ${user.firstname}(${user.chatId}) потерял ${item}. Причина ${reason}`,
    userOne: `${user.balance}`,
  });
  console.log(`конец ${newLog}`);
  await newLog.save();
}

module.exports = { giveResoursesLog, gamesLog, loseLog };
