const cases = {
  1: {
    name: "Майнкрафт кейс",
    dbName: "minecraft",
    price: 350,
    items:
      "Алмазный меч\nАлмазная кирка\nКурочка на глову\nСтив\nМайн кот\nЭнедер дракон\nПопуга",
    itemsId: [12, 24, 21, 22, 91, 90, 92],
  },

  2: {
    name: "Самп кейс",
    dbName: "brawl",
    price: 500,
    items:
      "Пивной молот\nБензо дилдак\nБратва\nЗелёная бандана\nМолот любви\nПопугай\nСАМП худ\nСкутер",
    itemsId: [129, 130, 131, 132, 133, 134, 135, 136],
  },

  3: {
    name: "Тайный кейс",
    dbName: "hotline",
    price: 250,
    items:
      "Щит Америки\nЧерный костюм\nКоричневый костюм\nЦензура\nПризрак\nТрешер\nЛадно\nОпечатано",
    itemsId: [142, 143, 144, 145, 146, 147, 148, 149],
  },

  4: {
    name: "Фоллаут Кейс",
    dbName: "fallout",
    price: 200,
    items:
      "Лазерная Винтовка\nСиловая броня\nПип-Бой\nШляпа мафиози\nАмерикан папа\nАвтомат колы\nЯдер кола\nSTAND BY\nЛинкольн\nВолтБой",
    itemsId: [60, 63, 61, 62, 128, 137, 138, 139, 140, 141],
  },

  5: {
    name: "Гем Кейс",
    dbName: "gem",
    price: 5,
    items:
      "Синий анонимус\nШляпа фермера\nОптимус\nСкибиди туалет\nСоник\nНаггетс\nДуэль\nRoblox Face\nВсе...",
    itemsId: [150, 151, 152, 153, 154, 155, 156, 157, 158],
    class: "gem",
  },

  6: {
    name: "Древний кейс",
    dbName: "fnaf",
    price: 666,
    items: "Вещи которые были ранее в кейсах, но сейчас затеряны",
    itemsId: [
      96, 97, 98, 99, 101, 102, 103, 105, 40, 41, 42, 43, 44, 45, 46, 47, 17,
      88, 89, 50, 51, 52, 53, 54, 55, 87, 78, 79, 77, 80, 81, 82, 83,
    ],
  },
};

module.exports = cases;
