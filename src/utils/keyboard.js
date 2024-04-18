const { Keyboard } = require("telegram-keyboard");

const mainButton = Keyboard.make([
  ["Магазин"],
  ["Топ меф", "Топ капча"],
  ["Команды", "Донат"],
  ["Ссылки"],
]).reply();

module.exports = mainButton;
