// Промежуточная функция для вывода комментариев с цветом
function logMessage(message, color) {
  const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
  };

  console.log(colors[color], message, colors.reset);
}

module.exports = logMessage;
