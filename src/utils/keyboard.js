import { Keyboard } from "telegram-keyboard";

const mainButton = Keyboard.make([
  ["🏬 Магазин 🏬"],
  ["⭐️ Топ стар ⭐️", "🧮 Топ капча 🧮"],
  ["📖 Команды 📖", "🤑 Донат 🤑"],
  ,
]).reply();

export default mainButton;
