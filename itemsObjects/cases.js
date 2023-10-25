const cases = {
  1: {
    name: "Майнкрафт кейс",
    dbName: "minecraftCase",
    price: 250,
    items:
      "Алмазный меч\nАлмазная кирка\nКурочка на глову\nСтив\nМайн кот\nЭнедер дракон\nПопуга",
    itemsId: [12, 24, 21, 22, 91, 90, 92],
  },

  2: {
    name: "Бравл кейс",
    dbName: "brawlCase",
    price: 500,
    items: "Разные маски из бравла\nДиз\nЭль примо\nЛеон",
    itemsId: [40, 41, 42, 43, 44, 45, 46, 47, 17, 88, 89],
  },

  3: {
    name: "Сигма кейс",
    dbName: "hotlineCase",
    price: 200,
    items:
      "Гусеница Шелби\nРил сигма\nСкала\nРайан гостлинг\nТайлер дерден\nCJ\nПавел Дуров",
    itemsId: [50, 51, 52, 53, 54, 55, 87],
  },

  4: {
    name: "Фоллаут Кейс",
    dbName: "falloutCase",
    price: 100,
    items: "Лазерная Винтовка\nСиловая броня\nПип-Бой\nШляпа мафиози",
    itemsId: [60, 63, 61, 62],
  },

  5: {
    name: "Гем Кейс",
    dbName: "gemCase",
    price: 5,
    items:
      "BEARBRICKS[78]\nТянки\nБейби бандит\nСет: Пабло с района\nСет: ZXC\nНайк хакки\nКот",
    itemsId: [78, 79, 77, 80, 81, 82, 83],
    class: "gem",
  },
};

module.exports = cases;
