const { Keyboard } = require("telegram-keyboard");

const mainButton = Keyboard.make([
  ["Магазин"],
  ["Топ стар", "Топ капча"],
  ["Команды", "Донат"],
  ,
]).reply();

module.exports = mainButton;
