const { Keyboard } = require("telegram-keyboard");

const mainButton = Keyboard.make([
  ["Магазин"],
  ["Топ меф", "Топ капча"],
  ["Команды", "Донат"],
  ,
]).reply();

module.exports = mainButton;
