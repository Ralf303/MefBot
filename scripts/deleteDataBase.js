// Подключение к базе данных
const sequelize = require("../db/db.js");

// Функция для сброса моделей
async function resetModels() {
  try {
    // Удаление всех записей в таблице items
    await sequelize.query("DELETE FROM items", {
      type: sequelize.QueryTypes.DELETE,
    });

    // Удаление всех записей в таблице logs
    await sequelize.query("DELETE FROM logs", {
      type: sequelize.QueryTypes.DELETE,
    });

    // Удаление всех записей в таблице roles
    await sequelize.query("DELETE FROM roles", {
      type: sequelize.QueryTypes.DELETE,
    });

    // Удаление всех записей в таблице users
    await sequelize.query("DELETE FROM users", {
      type: sequelize.QueryTypes.DELETE,
    });

    console.log("Все модели успешно сброшены");
  } catch (error) {
    console.error("Ошибка при сбросе моделей:", error);
  } finally {
    // Закрытие подключения к базе данных
    await sequelize.close();
  }
}

// Вызов функции для сброса моделей
resetModels();
