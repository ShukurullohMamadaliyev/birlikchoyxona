// Ibrohim Ota choyxonasi - Menyu ma'lumotlari
const CATEGORIES = [
  { id: "all", name: "Barchasi", icon: "✨" },
  { id: "milliy", name: "Milliy taomlar", icon: "🍲" },
  { id: "shashlik", name: "Shashliklar", icon: "🍢" },
  { id: "fastfud", name: "Fastfud", icon: "🍔" },
  { id: "salatlar", name: "Salatlar & Non", icon: "🥗" },
  { id: "ichimliklar", name: "Ichimliklar", icon: "🍹" }
];

const MENU_ITEMS = [
  // --- MILLIY TAOMLAR ---
  {
    id: "osh",
    name: "Osh (Choyxona Palov)",
    category: "milliy",
    price: 35000,
    badge: "BOSH TAOM",
    badgeType: "hot",
    image: "images/taomlar/osh.webp",
    description: "Maxsus devzira/lazer guruch, yumshoq sarxil mol go'shti, sarg'ish sabzi va mayizli haqiqiy choyxona palovi."
  },
  {
    id: "tandir_somsa",
    name: "Go'shtli tandir somsa",
    category: "milliy",
    price: 12000,
    badge: "TANDIR XIT",
    badgeType: "hit",
    image: "images/taomlar/Tandir_somsa.jpg",
    description: "Qarsildoq qatlama xamirdan tandirda pishirilgan, mayin to'g'ralgan shirali go'shtli issiq somsa."
  },
  {
    id: "lagmon",
    name: "Lag'mon (Cho'zma)",
    category: "milliy",
    price: 32000,
    badge: "ISSIQ & TO'YIMLI",
    badgeType: "hot",
    image: "images/taomlar/lagmon.jpg",
    description: "Qo'lda cho'zilgan yangi xamir, sarxil sabzavotlar va lazzatli go'shtli qaylali to'yimli cho'zma lag'mon."
  },
  {
    id: "mastava",
    name: "Mastava (Qaynoq)",
    category: "milliy",
    price: 30000,
    badge: "QAYNOQ",
    badgeType: "hot",
    image: "images/taomlar/mastava.jpg",
    description: "Xushbo'y ziravorlar, go'sht, guruch va yangi ko'katlar bilan tayyorlangan ishtahaochar suyuq milliy taom."
  },
  {
    id: "oltin_joja",
    name: "Oltin jo'ja (Tabaka)",
    category: "milliy",
    price: 55000,
    badge: "YANGI",
    badgeType: "new",
    image: "images/taomlar/oltinjoja.jpg",
    description: "Maxsus ziravorlar bilan qizarguncha pishirilgan, sershirali va tillarang qovurilgan jo'ja."
  },

  // --- SHASHLIKLAR ---
  {
    id: "polvon_qiyma",
    name: "Polvon qiyma shashlik",
    category: "shashlik",
    price: 22000,
    badge: "ENG KATTA",
    badgeType: "hit",
    image: "images/taomlar/polvonqiymashashlik.webp",
    description: "Katta va to'yimli sixda, yumshoq qiyma va damba yog'i bilan cho'g'da maromiga yetkazib pishirilgan shashlik."
  },
  {
    id: "oddiy_qiyma",
    name: "Oddiy qiyma shashlik",
    category: "shashlik",
    price: 16000,
    badge: "KLASSIK",
    badgeType: "default",
    image: "images/taomlar/oddiyqiyma.jpg",
    description: "Klassik choyxona uslubida, xushbo'y kashnich va zira bilan tayyorlangan lazzatli qiyma shashlik."
  },
  {
    id: "burda",
    name: "Burda shashlik (Go'shtli)",
    category: "shashlik",
    price: 20000,
    badge: "LAHM GO'SHT",
    badgeType: "hot",
    image: "images/taomlar/burda.jpg",
    description: "Sarxil lahm mol go'shtidan yumshoq va sershirali qilib marinadlangan mazali six shashlik."
  },
  {
    id: "ordak",
    name: "O'rdak shashlik",
    category: "shashlik",
    price: 24000,
    badge: "MAXSUS TA'M",
    badgeType: "hit",
    image: "images/taomlar/ordakshashlik.jpg",
    description: "O'rdak go'shtining o'zgacha mayinligi va o'ziga xos ta'miga ega bo'lgan nozik shashlik."
  },
  {
    id: "tovuq_qanot",
    name: "Tovuq qanot shashlik",
    category: "shashlik",
    price: 18000,
    badge: "QARSILDOQ",
    badgeType: "default",
    image: "images/taomlar/tovuqqanot.webp",
    description: "Cho'g'da qizargan qarsildoq teri va mayin go'shtli tovuq qanotlari."
  },
  {
    id: "tovuq_burda",
    name: "Tovuq burda shashlik",
    category: "shashlik",
    price: 18000,
    badge: "YENGIL & MAYIN",
    badgeType: "new",
    image: "images/taomlar/burda.jpg",
    description: "Tovuq filesidan tayyorlangan parhezbop, mayin va tez hazm bo'luvchi yengil shashlik."
  },

  // --- FASTFUD ---
  {
    id: "katta_lavash",
    name: "Katta lavash",
    category: "fastfud",
    price: 34000,
    badge: "KATTA & TO'YIMLI",
    badgeType: "hit",
    image: "images/taomlar/kattalavash.webp",
    description: "Grilda pishgan go'sht, chipslar, yangi pomidor-bodring va maxsus sousli katta to'yimli lavash."
  },
  {
    id: "kichkina_lavash",
    name: "Kichkina lavash",
    category: "fastfud",
    price: 28000,
    badge: "STANDART",
    badgeType: "default",
    image: "images/taomlar/kichkinalavash.webp",
    description: "Klassik o'lchamdagi, sershirali go'sht va sabzavotlar bilan tayyorlangan ixcham lavash."
  },
  {
    id: "chizburger",
    name: "Chizburger",
    category: "fastfud",
    price: 30000,
    badge: "PISHLOQLI XIT",
    badgeType: "hot",
    image: "images/taomlar/chizburger.webp",
    description: "Yumshoq bulochka, sersuv kotlet, erigan Chedder pishlog'i va xushxo'r sous."
  },
  {
    id: "sosiskali_xotdog",
    name: "Sosiskali xotdog",
    category: "fastfud",
    price: 15000,
    badge: "KLASSIK",
    badgeType: "default",
    image: "images/taomlar/sosiskalihoddog.jpg",
    description: "Issiq bulochkada sifatli sosiska, yangi bodring, pomidor va souslar."
  },
  {
    id: "kolbasali_xotdog",
    name: "Kolbasali xotdog",
    category: "fastfud",
    price: 18000,
    badge: "DUDLANGAN",
    badgeType: "default",
    image: "images/taomlar/koblasalixoddog.jpg",
    description: "Dudlangan mazali kolbasa bo'laklari va sabzavotli maxsus xotdog."
  },

  // --- SALATLAR & NON ---
  {
    id: "achchiq_salat",
    name: "Achchiq-chuchuk (Shakarob)",
    category: "salatlar",
    price: 10000,
    badge: "VITAMIN",
    badgeType: "hit",
    image: "images/taomlar/achchiqsalat.jpg",
    description: "Yupqa to'g'ralgan shirin pomidor, piyoz va xushxo'r rayhonli an'anaviy osh salati."
  },
  {
    id: "bahor_salat",
    name: "Bahor salat",
    category: "salatlar",
    price: 12000,
    badge: "YANGI UZILGAN",
    badgeType: "new",
    image: "images/taomlar/bahorsalat.jpg",
    description: "Yangi bodring, rediska, tuxum va ko'katlar bilan tayyorlangan bahoriy tetiklashtiruvchi salat."
  },
  {
    id: "bodring_salat",
    name: "Bodringli salat",
    category: "salatlar",
    price: 10000,
    badge: "MUZDEK",
    badgeType: "default",
    image: "images/taomlar/bodringsalat.jpg",
    description: "Qarsildoq yangi bodring va sarxil ko'katlardan tayyorlangan yengil salat."
  },
  {
    id: "karamli_salat",
    name: "Karamli salat",
    category: "salatlar",
    price: 10000,
    badge: "FOYDALI",
    badgeType: "default",
    image: "images/taomlar/karamlisalat.jpg",
    description: "Nozik to'g'ralgan karam, sabzi va limon sharbati bilan tayyorlangan parhez salat."
  },
  {
    id: "qatiq",
    name: "Choyxona Qatiq / Suzma",
    category: "salatlar",
    price: 8000,
    badge: "TABIIY",
    badgeType: "default",
    image: "images/taomlar/qatiq.jpg",
    description: "Yalpizli va sarimsoqli xonaki mazali quyuq choyxona suzmasi."
  },
  {
    id: "issiq_tandir_non",
    name: "Issiq tandir non",
    category: "salatlar",
    price: 5000,
    badge: "QAYNOQ",
    badgeType: "hot",
    image: "images/taomlar/issiqtandirnon.jpg",
    description: "Tandirdan uzilgan sedanalik yumshoq va xushbo'y qaynoq non."
  },

  // --- ICHIMLIKLAR ---
  {
    id: "kok_choy",
    name: "95-Ko'k choy (Choynakda)",
    category: "ichimliklar",
    price: 6000,
    badge: "MILLIY CHOY",
    badgeType: "hit",
    image: "images/taomlar/kok-choy.webp",
    description: "Xushbo'y damlangan haqiqiy 95-ko'k choy, milliy piyolalar bilan taqdim etiladi."
  },
  {
    id: "qora_choy",
    name: "Qora choy (Limonli/Oddiy)",
    category: "ichimliklar",
    price: 6000,
    badge: "QAYNOQ",
    badgeType: "default",
    image: "images/taomlar/qorachoy.jpg",
    description: "To'q damlangan issiq qora choy (xohishga ko'ra limon va novvot bilan)."
  },
  {
    id: "pepsi",
    name: "Pepsi (1.5L / 0.5L)",
    category: "ichimliklar",
    price: 14000,
    badge: "MUZDEK",
    badgeType: "default",
    image: "images/taomlar/pepsi.jpg",
    description: "Muzdek salqinlantiruvchi klassik gazlangan ichimlik."
  },
  {
    id: "cocacola",
    name: "Coca-Cola",
    category: "ichimliklar",
    price: 14000,
    badge: "MUZDEK",
    badgeType: "default",
    image: "images/taomlar/cocacola.webp",
    description: "Muzdek tetiklashtiruvchi Coca-Cola ichimligi."
  },
  {
    id: "gardensharbati",
    name: "Garden sharbati (1L)",
    category: "ichimliklar",
    price: 15000,
    badge: "TABIIY",
    badgeType: "hit",
    image: "images/taomlar/gardensharbati.webp",
    description: "Tabiiy mevali sarxil sharbat."
  },
  {
    id: "flavissharbati",
    name: "Flavis sharbati",
    category: "ichimliklar",
    price: 14000,
    badge: "CHANQOQBOSTI",
    badgeType: "default",
    image: "images/taomlar/flavissharbati.jpg",
    description: "Anor va rezavor mevali chanqoqbosti xushxo'r sharbat."
  },
  {
    id: "gazlisuv",
    name: "Muzdek gazli suv (0.5L)",
    category: "ichimliklar",
    price: 5000,
    badge: "SALQIN",
    badgeType: "default",
    image: "images/taomlar/gazlisuv.webp",
    description: "Chanqoqni qondiruvchi toza gazli mineral suv."
  }
];
