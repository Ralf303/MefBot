function getWinAmount(amount, bet, winNumber) {
  if (winNumber === 0 && bet !== "0") return 0;
  switch (bet) {
    case "0":
      return amount * (winNumber === 0 ? 35 : 0);
    case "красное":
    case "черное":
      return amount * (getWinColor(winNumber) === getBetColor(bet) ? 2 : 0);
    case "1-12":
    case "13-24":
    case "25-36":
      return amount * (getBetRange(bet).includes(winNumber) ? 3 : 0);
    case "1-18":
    case "19-36":
      return amount * (getBetRange(bet).includes(winNumber) ? 2 : 0);
    case "чет":
    case "нечет":
      return amount * (winNumber % 2 === (bet === "нечет" ? 1 : 0) ? 2 : 0);
    default:
      return 0;
  }
}

function getWinColor(number) {
  if (number === 0) {
    return "🟢";
  }
  if ((number >= 1 && number <= 10) || (number >= 19 && number <= 28)) {
    return number % 2 === 0 ? "⚫" : "🔴";
  }
  return number % 2 === 0 ? "🔴" : "⚫";
}

function getBetColor(bet) {
  if (bet === "красное" || bet === "черное") {
    return bet === "красное" ? "🔴" : "⚫";
  }
  return "";
}

function getBetRange(bet) {
  switch (bet) {
    case "1-12":
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    case "13-24":
      return [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
    case "25-36":
      return [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36];
    case "1-18":
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
    case "19-36":
      return [
        19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
      ];
    default:
      return [];
  }
}

export { getWinAmount, getBetColor, getWinColor, getBetRange };
