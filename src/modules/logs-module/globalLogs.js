import moment from "moment";
import { Logs } from "../../db/models.js";

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

  const newLog = await Logs.create({
    date: `${date} ${time}`,
    action: `Юзер ${user.firstname}(${user.chatId}) сыграл в ${game} и выйграл ${win}. Было ${previous} стало ${user.balance}`,
    userOne: `${user.balance}`,
  });

  await newLog.save();
}

async function loseLog(user, item, reason) {
  moment.locale("ru");
  const date = `${moment().format("L")}`;
  const time = `${moment().format("LTS")}`;

  const newLog = await Logs.create({
    date: `${date} ${time}`,
    action: `Юзер ${user.firstname}(${user.chatId}) потерял ${item}. Причина ${reason}`,
    userOne: `${user.balance}`,
  });

  await newLog.save();
}

async function resiveLog(user, item, count, reason) {
  moment.locale("ru");
  const date = `${moment().format("L")}`;
  const time = `${moment().format("LTS")}`;

  const newLog = await Logs.create({
    date: `${date} ${time}`,
    action: `Юзер ${user.firstname}(${user.chatId}) получил ${item} в количестве ${count}. Причина ${reason}`,
    userOne: `${user.balance}`,
  });

  await newLog.save();
}

export { giveResoursesLog, gamesLog, loseLog, resiveLog };
