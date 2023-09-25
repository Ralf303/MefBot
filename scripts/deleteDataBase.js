const sequelize = require("../db/db.js");
const { connectToDb } = require("../db/functions.js");
const logMessage = require("../utils/logMessage.js");

// Функция для сброса таблиц
async function resetTables() {
  try {
    await connectToDb();
    // Удаление таблицы items
    await sequelize.drop("items");
    logMessage("Таблица items удалена", "blue");

    // Удаление таблицы logs
    await sequelize.drop("logs");
    logMessage("Таблица logs удалена", "blue");

    // Удаление таблицы roles
    await sequelize.drop("roles");
    logMessage("Таблица roles удалена", "blue");

    // Удаление таблицы users
    await sequelize.drop("users");
    logMessage("Таблица users удалена", "blue");

    logMessage("Все таблицы успешно удалены", "green");
  } catch (error) {
    console.error(logMessage("Ошибка при удалении таблиц:", "red"), error);
  } finally {
    // Закрытие подключения к базе данных
    await sequelize.close();
    logMessage("Подключение к базе данных закрыто", "yellow");
  }
}

// Вызов функции для сброса таблиц
resetTables();
