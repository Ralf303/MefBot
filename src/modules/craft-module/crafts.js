const craftItems = {
  1: {
    name: "Дрон Майнер",
    personalId: 58,
    components: [
      { name: "Воздушный шар №1", quantity: 1 },
      { name: "Воздушный шар №2", quantity: 1 },
      { name: "Воздушный шар №3", quantity: 1 },
    ],
    chance: 60,
  },

  2: {
    name: "Дрон 'ЭД-Э'",
    personalId: 59,
    components: [
      { name: "Пип-Бой", quantity: 1 },
      { name: "Лазерная винтовка", quantity: 2 },
    ],
    chance: 25,
  },

  3: {
    name: "Супер Кирка",
    personalId: 75,
    components: [{ name: "Алмазная кирка", quantity: 2 }],
    chance: 10,
  },

  4: {
    name: "Пупс «Наука»",
    personalId: 113,
    components: [{ name: "Пупс «Интелект»", quantity: 3 }],
    chance: 1,
  },

  5: {
    name: "Роблокс шар",
    personalId: 160,
    components: [
      { name: "Магический шар", quantity: 2 },
      { name: "Roblox Face", quantity: 1 },
    ],
    chance: 30,
  },
};

module.exports = craftItems;
