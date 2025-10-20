const items = {
  1: {
    name: "Няшная шапка",
    src: "img/cute_hat.png",
    bodyPart: "head",
    price: 1000,
    canBuy: true,
    class: "low",
  },
  2: {
    name: "Гучи Панама",
    src: "img/gucci_panama.png",
    bodyPart: "head",
    price: 25000,
    canBuy: true,
    class: "elite",
  },

  3: {
    name: "Воздушный шар №1",
    bodyPart: "extra",
    src: "img/ball_1.png",
    price: 100,
    canBuy: true,
    class: "donate",
  },

  4: {
    name: "Глазки",
    src: "img/eye.png",
    bodyPart: "face",
    price: 1000,
    canBuy: true,
    class: "low",
  },

  5: {
    name: "Маска демона",
    src: "img/demon.png",
    bodyPart: "face",
    price: 8000,
    canBuy: true,
    class: "middle",
  },

  6: {
    name: "Джорданы",
    src: "img/nike.png",
    bodyPart: "legs",
    price: 40000,
    canBuy: true,
    class: "elite",
  },

  7: {
    name: "Дилдо",
    src: "img/dildo.png",
    bodyPart: "left",
    price: 5000,
    canBuy: true,
    class: "low",
  },

  8: {
    name: "Воздушный шар №2",
    bodyPart: "extra",
    src: "img/ball_2.png",
    price: 100,
    canBuy: true,
    class: "donate",
  },

  9: {
    name: "Воздушный шар №3",
    bodyPart: "extra",
    src: "img/ball_3.png",
    price: 100,
    canBuy: true,
    class: "donate",
  },

  10: {
    name: "Бандана",
    bodyPart: "face",
    src: "img/bandana.png",
    price: 777,
    canBuy: true,
    class: "gem",
  },

  11: {
    name: "Доска для серфа №1",
    bodyPart: "left",
    src: "img/board_1.png",
    price: 10000,
    canBuy: true,
    class: "middle",
  },

  12: {
    name: "Курочка на голову",
    bodyPart: "head",
    src: "img/chicken_on_head.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  13: {
    name: "Полицейская кепка",
    bodyPart: "head",
    src: "img/cop_cap.png",
    price: 2500,
    canBuy: true,
    class: "low",
  },

  14: {
    name: "Золотой доллар",
    bodyPart: "face",
    src: "img/dollar.png",
    price: 50,
    canBuy: false,
    class: "impossible",
  },

  15: {
    name: "Дедушкины галоши",
    bodyPart: "legs",
    src: "img/galosh.png",
    price: 1500,
    canBuy: true,
    class: "low",
  },

  16: {
    name: "Зеленая маска",
    bodyPart: "face",
    src: "img/grin_mask.png",
    price: 8000,
    canBuy: true,
    class: "middle",
  },

  17: {
    name: "Диз",
    bodyPart: "extra",
    src: "img/diz.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  18: {
    name: "Маска распорядителя",
    bodyPart: "face",
    src: "img/squid_mask.png",
    price: 25000,
    canBuy: true,
    class: "elite",
  },

  19: {
    name: "Часы обычные",
    bodyPart: "right",
    src: "img/watch_1.png",
    price: 500,
    canBuy: true,
    class: "low",
  },

  20: {
    name: "БАН",
    bodyPart: "left",
    src: "img/admin_hummer.png",
    price: 50,
    canBuy: false,
    class: "impossible",
  },

  21: {
    name: "Алмазный меч",
    bodyPart: "left",
    src: "img/diamond_sword.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  22: {
    name: "Алмазная кирка",
    bodyPart: "right",
    src: "img/diamond_pix.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  23: {
    name: "Тралалело Тралала",
    bodyPart: "leg2",
    src: "img/tralalelo.png",
    price: 2,
    canBuy: false,
    class: "impossible",
  },

  24: {
    name: "Стив",
    bodyPart: "face",
    src: "img/steve_face.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  25: {
    name: "Наебаджи",
    src: "img/naebaji.png",
    bodyPart: "legs",
    price: 2000,
    canBuy: true,
    class: "low",
  },

  26: {
    name: "Конверсы",
    src: "img/converse.png",
    bodyPart: "legs",
    price: 10000,
    canBuy: true,
    class: "middle",
  },

  27: {
    name: "Кроксы",
    src: "img/crocks.png",
    bodyPart: "legs",
    price: 5000,
    canBuy: true,
    class: "middle",
  },

  28: {
    name: "БДСМ костюм",
    src: "img/bdsm.png",
    bodyPart: "face",
    price: 15000,
    canBuy: true,
    class: "middle",
  },

  29: {
    name: "Цепь BENZO",
    src: "img/benzo.png",
    bodyPart: "face",
    price: 77777,
    canBuy: true,
    class: "elite",
  },

  30: {
    name: "Черный цилиндр",
    src: "img/black_hat.png",
    bodyPart: "head",
    price: 10000,
    canBuy: true,
    class: "middle",
  },

  31: {
    name: "Плетка",
    src: "img/whip.png",
    bodyPart: "right",
    price: 10000,
    canBuy: true,
    class: "middle",
  },

  32: {
    name: "Маска анонимуса",
    src: "img/anonim_mask.png",
    bodyPart: "face",
    price: 50,
    canBuy: false,
    class: "impossible",
  },

  33: {
    name: "Мишка фредэ",
    src: "img/freddy.png",
    bodyPart: "face",
    price: 30000,
    canBuy: true,
    class: "elite",
  },

  34: {
    name: 'Нож "сперме"',
    src: "img/knife.png",
    bodyPart: "left",
    price: 25000,
    canBuy: true,
    class: "elite",
  },

  35: {
    name: "Пиксельные очки",
    src: "img/pixel_glass.png",
    bodyPart: "face",
    price: 20000,
    canBuy: true,
    class: "middle",
  },

  36: {
    name: "Обычный дигл",
    src: "img/digle.png",
    bodyPart: "left",
    price: 11111,
    canBuy: true,
    class: "middle",
  },

  37: {
    name: "Золотой дигл",
    src: "img/golden_digle.png",
    bodyPart: "right",
    price: 33333,
    canBuy: true,
    class: "elite",
  },

  38: {
    name: "Балтика 9",
    src: "img/pivo.png",
    bodyPart: "left",
    price: 100,
    canBuy: true,
    class: "low",
  },

  39: {
    name: 'Часы "сперме"',
    src: "img/watch_2.png",
    bodyPart: "right",
    price: 30000,
    canBuy: true,
    class: "elite",
  },

  40: {
    name: "Маска 8-БИТ",
    bodyPart: "face",
    src: "img/brawl_1.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  41: {
    name: "Маска Брок",
    bodyPart: "face",
    src: "img/brawl_2.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  42: {
    name: "Маска Кольт",
    bodyPart: "face",
    src: "img/brawl_3.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  43: {
    name: "Маска Нита",
    bodyPart: "face",
    src: "img/brawl_4.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  44: {
    name: "Маска Тара",
    bodyPart: "face",
    src: "img/brawl_5.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  45: {
    name: "Маска ТИК",
    bodyPart: "face",
    src: "img/brawl_6.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  46: {
    name: "Маска Спраут",
    bodyPart: "face",
    src: "img/brawl_7.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  47: {
    name: "Маска Эль-Примо",
    bodyPart: "face",
    src: "img/brawl_8.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  48: {
    name: "Водочка",
    bodyPart: "right",
    src: "img/vodka.png",
    price: 999,
    canBuy: true,
    class: "low",
  },

  49: {
    name: "АНТИХАЙП",
    bodyPart: "face",
    src: "img/antihype.png",
    price: 1234,
    canBuy: true,
    class: "low",
  },

  50: {
    name: "Тайлер Дерден",
    bodyPart: "leg1",
    src: "img/derden.png",
    price: 50,
    canBuy: false,
    class: "impossible",
  },

  51: {
    name: "Гусеница Шелби",
    bodyPart: "leg2",
    src: "img/shelby.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  52: {
    name: "Райан Гостлинг",
    bodyPart: "leg1",
    src: "img/gostling.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  53: {
    name: "Рил Сигма",
    bodyPart: "face",
    src: "img/sigma.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  54: {
    name: "Скала",
    bodyPart: "face",
    src: "img/skala.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  55: {
    name: "CJ",
    bodyPart: "leg1",
    src: "img/cj.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  56: {
    name: "Супер Грабли",
    bodyPart: "left",
    src: "img/grabli.png",
    price: 125,
    canBuy: true,
    class: "donate",
    info: "Умножает сбор старок в пять раз когда надеты на пабло.",
  },

  57: {
    name: "Калькулятор",
    bodyPart: "right",
    src: "img/calculator.png",
    price: 50,
    canBuy: false,
    class: "impossible",
    info: "Умножает награду за капчу в 3 раза когда надет на пабло.",
  },

  58: {
    name: "Дрон Майнер",
    bodyPart: "extra",
    src: "img/drone_miner.png",
    price: 50,
    canBuy: false,
    class: "impossible",
    info: "Майнит 10% от твоего общего количества старок раз в сутки, когда надет на пабло\n\nМаксимальная сумма майнинга 150к",
  },

  59: {
    name: 'Дрон "ЭД-Э"',
    bodyPart: "extra",
    src: "img/drone_e-de.png",
    price: 50,
    canBuy: false,
    class: "impossible",
    info: "ЭД-Э является носителем информации многих умов, и знает как увеличить шанс успешного крафта на 10%, когда надет на пабло.",
  },

  60: {
    name: "Лазерная винтовка",
    bodyPart: "left",
    src: "img/lazer_gun.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  61: {
    name: "Силовая броня",
    bodyPart: "face",
    src: "img/power_armor.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  62: {
    name: "Пип-Бой",
    bodyPart: "right",
    src: "img/pip_boy.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  63: {
    name: "Шляпа мафиози",
    bodyPart: "head",
    src: "img/mafia_hat.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  64: {
    name: "Рик и морти",
    bodyPart: "leg1",
    src: "img/rick-and-morty.png",
    price: 95,
    canBuy: true,
    class: "gem",
  },

  65: {
    name: "zxc АмНям",
    bodyPart: "leg1",
    src: "img/zxc_nyme.png",
    price: 150,
    canBuy: true,
    class: "gem",
  },

  66: {
    name: "Аска",
    bodyPart: "leg2",
    src: "img/aska.png",
    price: 800,
    canBuy: true,
    class: "gem",
  },

  67: {
    name: "Рей",
    bodyPart: "leg1",
    src: "img/rey.png",
    price: 800,
    canBuy: true,
    class: "gem",
  },

  68: {
    name: "Каки Пуки",
    bodyPart: "face",
    src: "img/kaki_puki.png",
    price: 200,
    canBuy: true,
    class: "gem",
  },

  69: {
    name: "Мисато",
    bodyPart: "leg2",
    src: "img/misato.png",
    price: 550,
    canBuy: true,
    class: "gem",
  },

  70: {
    name: "Конфеты",
    bodyPart: "left",
    src: "img/narko.png",
    price: 50,
    canBuy: true,
    class: "gem",
  },

  71: {
    name: "АмНям",
    bodyPart: "leg2",
    src: "img/nyme.png",
    price: 100,
    canBuy: true,
    class: "gem",
  },

  72: {
    name: "Horny Tyan",
    bodyPart: "leg1",
    src: "img/tyne_1.png",
    price: 1500,
    canBuy: true,
    class: "gem",
    info: "Horny Tyan меняется в зависимости от времени (UTC+3):\n\n1 — с 6:00 до 17:00\n2 — с 16:00 до 21:00\n3 — с 21:00 до 6:00",
  },

  73: {
    name: "Легкий макияж",
    bodyPart: "face",
    src: "img/lips.png",
    price: 70,
    canBuy: true,
    class: "gem",
  },

  74: {
    name: "Лабутены",
    bodyPart: "legs",
    src: "img/shoes.png",
    price: 100,
    canBuy: true,
    class: "gem",
  },

  75: {
    name: "Супер Кирка",
    bodyPart: "right",
    src: "img/super_kirka.png",
    price: 50,
    canBuy: false,
    class: "impossible",
    info: "Добывает дополнительный гем каждый час",
  },

  76: {
    name: "Мазелов",
    bodyPart: "face",
    src: "img/mazelov.png",
    price: 897,
    canBuy: true,
    class: "gem",
  },

  77: {
    name: "Бейби бандит",
    bodyPart: "right",
    src: "img/baby_bandit.png",
    price: 150,
    canBuy: false,
    class: "impossible",
  },

  78: {
    name: "BEARBRICKS",
    bodyPart: "leg2",
    src: "img/bear_1.png",
    price: 123,
    canBuy: false,
    class: "impossible",
    info: "Каждый раз, медведь меняется",
  },

  79: {
    name: "Тянки",
    bodyPart: "legs",
    src: "img/tynki.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  80: {
    name: "Сет: Пабло с района",
    bodyPart: "set",
    src: "img/pablo_street.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  81: {
    name: "Сет: ZXC",
    bodyPart: "set",
    src: "img/gul_set.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  82: {
    name: "Найк хакки",
    bodyPart: "legs",
    src: "img/hikka_jordan.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  83: {
    name: "Кот",
    bodyPart: "leg1",
    src: "img/tik_tok_cat.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  84: {
    name: "Мульти кроссы",
    bodyPart: "legs",
    src: "img/multi_1.png",
    price: 250000,
    canBuy: true,
    class: "elite",
    info: "Каждые 30 минут меняют облик",
  },

  85: {
    name: "Шайлушай",
    bodyPart: "leg1",
    src: "img/white_shalusha.png",
    price: 111111,
    canBuy: true,
    class: "elite",
    info: "Можно изменить шайлушая с помощью команды /change",
  },

  86: {
    name: "Кот",
    bodyPart: "leg1",
    src: "img/tik_tok_cat.png",
    price: 150,
    canBuy: false,
    class: "impossible",
  },

  87: {
    name: "Павел Дуров",
    bodyPart: "leg2",
    src: "img/durov.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  88: {
    name: "Эль Примо",
    bodyPart: "leg1",
    src: "img/primo.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  89: {
    name: "Леон",
    bodyPart: "leg2",
    src: "img/leon.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  90: {
    name: "Майн кот",
    bodyPart: "leg1",
    src: "img/mine_cat.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  91: {
    name: "Попуга",
    bodyPart: "leg2",
    src: "img/parrot.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  92: {
    name: "Ендер дракон",
    bodyPart: "extra",
    src: "img/ender.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  93: {
    name: "Темная сторона",
    bodyPart: "left",
    src: "img/red_droch.png",
    price: 2,
    canBuy: false,
    class: "impossible",
  },

  94: {
    name: "Светлая сторона",
    bodyPart: "left",
    src: "img/blue_droch.png",
    price: 2,
    canBuy: false,
    class: "impossible",
  },

  95: {
    name: "Джеб Керман",
    bodyPart: "leg2",
    src: "img/jeb_kerman.png",
    price: 2,
    canBuy: false,
    class: "impossible",
  },

  96: {
    name: "Бон Бон",
    bodyPart: "left",
    src: "img/bonbon.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  97: {
    name: "Фреди",
    bodyPart: "fnaf_set2",
    src: "img/fnaf_freddy_d.png",
    price: 123,
    canBuy: false,
    class: "impossible",
    info: "Лучше не смотри на них с 00:00 до 6:00....",
  },

  98: {
    name: "Фокси",
    bodyPart: "fnaf_set1",
    src: "img/fnaf_foxy_d.png",
    price: 123,
    canBuy: false,
    class: "impossible",
    info: "Лучше не смотри на них с 00:00 до 6:00....",
  },

  99: {
    name: "Чика",
    bodyPart: "fnaf_set4",
    src: "img/fnaf_chika_d.png",
    price: 123,
    canBuy: false,
    class: "impossible",
    info: "Лучше не смотри на них с 00:00 до 6:00....",
  },

  100: {
    name: "Пупс «Удача»",
    bodyPart: "pups_set3",
    src: "img/pups_lucky.png",
    price: 50000,
    canBuy: false,
    class: "impossible",
    info: "С этой штукой тебе будет подозрительно везти)",
  },

  101: {
    name: "Балун Бой",
    bodyPart: "fnaf_set5",
    src: "img/fnaf_baloon_d.png",
    price: 123,
    canBuy: false,
    class: "impossible",
    info: "Лучше не смотри на них с 00:00 до 6:00....",
  },

  102: {
    name: "Бонни",
    bodyPart: "fnaf_set3",
    src: "img/fnaf_boney_d.png",
    price: 123,
    canBuy: false,
    class: "impossible",
    info: "Лучше не смотри на них с 00:00 до 6:00....",
  },

  103: {
    name: "Мангл",
    bodyPart: "extra",
    src: "img/mangl_d.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  104: {
    name: "Пупс «Красноречие»",
    bodyPart: "pups_set6",
    src: "img/pups_speech.png",
    price: 50000,
    canBuy: false,
    class: "impossible",
    info: "Награда за общение будет в два раза больше!",
  },

  105: {
    name: "Кекс",
    bodyPart: "right",
    src: "img/keks_d.png",
    price: 123,
    canBuy: false,
    class: "impossible",
    info: "Лучше не смотри на них с 00:00 до 6:00....",
  },

  106: {
    name: "Пупс «Харизма»",
    bodyPart: "pups_set1",
    src: "img/pups_charizma.png",
    price: 50000,
    canBuy: false,
    class: "impossible",
    info: "Награда за приглашение в чат новых юзеров будет больше.",
  },

  107: {
    name: "Мне пора. Удачи!",
    bodyPart: "extra",
    src: "img/mne_pora.png",
    price: 2,
    canBuy: false,
    class: "impossible",
  },

  108: {
    name: "Кавасаки",
    bodyPart: "leg1",
    src: "img/kavasaki.png",
    price: 2,
    canBuy: false,
    class: "impossible",
  },

  109: {
    name: "Эстрипер",
    bodyPart: "leg2",
    src: "img/estriper.png",
    price: 666,
    canBuy: true,
    class: "gem",
  },

  110: {
    name: "Каго",
    bodyPart: "leg1",
    src: "img/kago.png",
    price: 2,
    canBuy: false,
    class: "impossible",
  },

  111: {
    name: "Крико",
    bodyPart: "leg2",
    src: "img/kriko.png",
    price: 44444,
    canBuy: true,
    class: "middle",
  },

  112: {
    name: "Пупс «Интелект»",
    bodyPart: "pups_set2",
    src: "img/pups_inte.png",
    price: 50000,
    canBuy: true,
    class: "elite",
    info: "С ним ты будешь казаться умнее)",
  },

  113: {
    name: "Пупс «Наука»",
    bodyPart: "pups_set5",
    src: "img/pups_nauka.png",
    price: 50000,
    canBuy: false,
    class: "impossible",
    info: "Используй команду синтез для конвертации гемов в старки.",
  },

  114: {
    name: "Елка",
    bodyPart: "leg2",
    src: "img/elka.png",
    price: 5,
    canBuy: true,
    class: "event",
  },

  115: {
    name: "Бенгальский огонь",
    bodyPart: "left",
    src: "img/ogon.png",
    price: 25,
    canBuy: true,
    class: "event",
  },

  116: {
    name: "Пряня",
    bodyPart: "face",
    src: "img/pryna.png",
    price: 101,
    canBuy: true,
    class: "event",
  },

  117: {
    name: "Подарки",
    bodyPart: "legs",
    src: "img/podarki.png",
    price: 75,
    canBuy: true,
    class: "event",
  },

  118: {
    name: "Новогодняя шапочка",
    bodyPart: "head",
    src: "img/ng_hat.png",
    price: 2,
    canBuy: false,
    class: "impossible",
  },

  119: {
    name: "Нг нэ будет",
    bodyPart: "leg2",
    src: "img/ne_budet.png",
    price: 200,
    canBuy: true,
    class: "event",
  },

  120: {
    name: "Нг котейка",
    bodyPart: "leg1",
    src: "img/ng_cat.png",
    price: 150,
    canBuy: true,
    class: "event",
  },

  121: {
    name: "Снеговик",
    bodyPart: "head",
    src: "img/snegovik.png",
    price: 112,
    canBuy: true,
    class: "event",
  },

  122: {
    name: "Банан",
    bodyPart: "right",
    src: "img/banana.png",
    price: 49,
    canBuy: true,
    class: "low",
  },

  123: {
    name: "Нг тян",
    bodyPart: "leg1",
    src: "img/ng_tyne.png",
    price: 1000,
    canBuy: true,
    class: "impossible",
  },

  124: {
    name: "1000-7",
    bodyPart: "legs",
    src: "img/plushka.png",
    price: 2,
    canBuy: false,
    class: "impossible",
  },

  125: {
    name: "Пупс «Бартер»",
    bodyPart: "pups_set7",
    src: "img/pups_barter.png",
    price: 50000,
    canBuy: false,
    class: "impossible",
    info: "При продаже вещей ты получишь полную ее стоимость, а не 50%!",
  },

  126: {
    name: "Пупс «Ремонт»",
    bodyPart: "pups_set4",
    src: "img/pups_repair.png",
    price: 50000,
    canBuy: false,
    class: "impossible",
    info: "Увеличивает максимальный доход с дрона майнера до 200к!",
  },

  127: {
    name: "Худи BENZO",
    src: "img/benzo_hudi.png",
    bodyPart: "face",
    price: 2,
    canBuy: false,
    class: "impossible",
  },

  128: {
    name: "Американ папа",
    bodyPart: "head",
    src: "img/america_hat.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  129: {
    name: "Пивной молот",
    bodyPart: "right",
    src: "img/beer_hummer.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  130: {
    name: "Бензо дилдак",
    bodyPart: "right",
    src: "img/benzo_dildo.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  131: {
    name: "Братва",
    bodyPart: "legs",
    src: "img/gang.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  132: {
    name: "Зелёная бандана",
    bodyPart: "face",
    src: "img/green_bandana.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  133: {
    name: "Молот любви",
    bodyPart: "left",
    src: "img/love_hummer.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  134: {
    name: "Попугай",
    bodyPart: "left",
    src: "img/samp_parrot.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  135: {
    name: "САМП худ",
    bodyPart: "extra",
    src: "img/samp_hood.png",
    price: 123,
    canBuy: true,
    class: "impossible",
  },

  136: {
    name: "Скутер",
    bodyPart: "leg1",
    src: "img/skuter.png",
    price: 123,
    canBuy: true,
    class: "impossible",
  },

  137: {
    name: "Автомат колы",
    bodyPart: "leg1",
    src: "img/cola_farm.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  138: {
    name: "Ядер кола",
    bodyPart: "left",
    src: "img/nuke_cola.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  139: {
    name: "STAND BY",
    bodyPart: "face",
    src: "img/stand_by.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  140: {
    name: "Линкольн",
    bodyPart: "right",
    src: "img/snipe.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  141: {
    name: "ВолтБой",
    bodyPart: "leg2",
    src: "img/vault_boy.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  142: {
    name: "Щит Америки",
    bodyPart: "right",
    src: "img/america_shield.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  143: {
    name: "Черный костюм",
    bodyPart: "face",
    src: "img/black_suit.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  144: {
    name: "Коричневый костюм",
    bodyPart: "face",
    src: "img/brown_suit.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  145: {
    name: "Цензура",
    bodyPart: "face",
    src: "img/cenz.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  146: {
    name: "Призрак",
    bodyPart: "head",
    src: "img/gost.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  147: {
    name: "Трешер",
    bodyPart: "face",
    src: "img/tresher.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  148: {
    name: "Ладно",
    bodyPart: "leg1",
    src: "img/ladno.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  149: {
    name: "Опечатано",
    bodyPart: "face",
    src: "img/stop.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  150: {
    name: "Синий анонимус",
    bodyPart: "face",
    src: "img/blue_anonimus.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  151: {
    name: "Шляпа фермера",
    bodyPart: "head",
    src: "img/ferma_hat.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },
  152: {
    name: "Оптимус",
    bodyPart: "left",
    src: "img/optimus.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  153: {
    name: "Скибиди туалет",
    bodyPart: "leg1",
    src: "img/skibidi.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  154: {
    name: "Соник",
    bodyPart: "extra",
    src: "img/sonik.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  155: {
    name: "Наггетс",
    bodyPart: "leg2",
    src: "img/nagets.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  156: {
    name: "Дуэль",
    bodyPart: "legs",
    src: "img/duel.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  157: {
    name: "Roblox Face",
    bodyPart: "face",
    src: "img/roblox_face.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  158: {
    name: "Все...",
    bodyPart: "extra",
    src: "img/vse.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  159: {
    name: "Магический шар",
    bodyPart: "extra",
    src: "img/ball.png",
    price: 10000,
    canBuy: true,
    class: "gem",
  },

  160: {
    name: "Роблокс шар",
    bodyPart: "extra",
    src: "img/roblox_ball.png",
    price: 10000,
    canBuy: false,
    class: "impossible",
  },

  161: {
    name: "Йес-мэн",
    bodyPart: "leg1",
    src: "img/yes_man.png",
    price: 10000,
    canBuy: false,
    class: "impossible",
    info: "Йес-мэн +2 кейса за одно открытие.",
  },

  162: {
    name: "Кроссовки Евангелион",
    bodyPart: "legs",
    src: "img/evangelion.png",
    price: 100000,
    canBuy: false,
    class: "impossible",
  },

  163: {
    name: "Хомяк",
    bodyPart: "leg2",
    src: "img/homa_1.png",
    price: 123,
    canBuy: false,
    class: "impossible",
    info: "Каждый раз, хомяк меняется.",
  },

  164: {
    name: "Balance Bag",
    bodyPart: "right",
    src: "img/moneyBag_1.png",
    price: 25000,
    canBuy: true,
    class: "fam",
    info: "Чемодан меняется в зависимости от баланса.",
  },

  165: {
    name: "Мистер помощник",
    bodyPart: "leg2",
    src: "img/mr_helper.png",
    canBuy: false,
    price: 10000,
    class: "impossible",
    info: "Автоматически собирает ферму!",
  },

  166: {
    name: "Гладос",
    bodyPart: "extra",
    src: "img/glados.png",
    price: 7500,
    canBuy: true,
    class: "fam",
  },

  167: {
    name: "Адибоксы",
    bodyPart: "legs",
    src: "img/adibox.png",
    price: 1500,
    canBuy: true,
    class: "fam",
  },

  168: {
    name: "Шляпа Стена",
    bodyPart: "head",
    src: "img/stan_hat.png",
    price: 760,
    canBuy: true,
    class: "fam",
  },

  169: {
    name: "Святой каки пуки",
    bodyPart: "leg2",
    src: "img/svetoy_kaki.png",
    price: 3475,
    canBuy: true,
    class: "fam",
  },

  170: {
    name: "Сет: Клоун",
    bodyPart: "set",
    src: "img/set_clown.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  171: {
    name: "Пабло певец",
    bodyPart: "leg2",
    src: "img/singer.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  172: {
    name: "Базз режисер",
    bodyPart: "leg1",
    src: "img/baz.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  173: {
    name: "roflanEbalo",
    bodyPart: "face",
    src: "img/roflan.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  174: {
    name: "Билл Шифр",
    bodyPart: "extra",
    src: "img/bill_d.png",
    price: 123,
    canBuy: false,
    class: "impossible",
    info: "После 21:00 по мск переходит в гневную стадию...",
  },

  175: {
    name: "Микро пабло",
    bodyPart: "leg1",
    src: "img/kaktus.png",
    price: 123,
    canBuy: false,
    class: "impossible",
  },

  177: {
    name: "Рога",
    bodyPart: "head",
    src: "img/deer.png",
    price: 1000,
    canBuy: true,
    class: "event",
  },

  176: {
    name: "Нг дрон",
    bodyPart: "extra",
    src: "img/ng_dron.png",
    price: 5000,
    canBuy: true,
    class: "event",
    info: "Каждый час дрон генерирует один случайный кейс!",
  },

  178: {
    name: "Нг чилл гай",
    bodyPart: "leg2",
    src: "img/chiloviy_pablo.png",
    price: 2400,
    canBuy: true,
    class: "event",
  },

  179: {
    name: "Салатик",
    bodyPart: "right",
    src: "img/ng_salat.png",
    price: 80,
    canBuy: true,
    class: "event",
  },

  180: {
    name: "Леденец",
    bodyPart: "right",
    src: "img/ledenes.png",
    price: 90,
    canBuy: true,
    class: "event",
  },

  181: {
    name: "Нян Кэт 📺",
    src: "gif/cat.gif",
    bodyPart: "extra",
    price: 50,
    canBuy: true,
    class: "donate",
    info: "Первый анимированный предмет",
    animated: true,
    anim: {
      x: 520,
      y: -40,
      scale: 250,
      fps: 30,
    },
  },
};

export default items;
