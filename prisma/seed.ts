import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type Translations = Record<string, { name: string; description: string }>;

const categories: {
  name: string;
  slug: string;
  description: string;
  translations: Translations;
}[] = [
  {
    name: "Чай",
    slug: "tea",
    description: "Листовой чай и чай в пирамидках",
    translations: {
      en: { name: "Tea", description: "Loose leaf and pyramid tea bags" },
      de: { name: "Tee", description: "Loser Tee und Tee in Pyramidenbeuteln" },
    },
  },
  {
    name: "Чашки",
    slug: "cups",
    description: "Керамика и фарфор ручной работы",
    translations: {
      en: { name: "Cups", description: "Handmade ceramics and porcelain" },
      de: { name: "Tassen", description: "Handgefertigte Keramik und Porzellan" },
    },
  },
  {
    name: "Заварники",
    slug: "teapots",
    description: "Для дома и офиса, разный объём",
    translations: {
      en: { name: "Teapots", description: "For home and office, various sizes" },
      de: { name: "Teekannen", description: "Für Zuhause und Büro, verschiedene Größen" },
    },
  },
  {
    name: "Наборы",
    slug: "sets",
    description: "Готовые подарочные комплекты",
    translations: {
      en: { name: "Gift Sets", description: "Ready-made gift sets" },
      de: { name: "Sets", description: "Fertige Geschenksets" },
    },
  },
  {
    name: "Аксессуары",
    slug: "accessories",
    description: "Ситечки, банки для хранения и всё для чайной церемонии",
    translations: {
      en: { name: "Accessories", description: "Strainers, storage tins and everything for the tea ceremony" },
      de: { name: "Zubehör", description: "Siebe, Aufbewahrungsdosen und alles für die Teezeremonie" },
    },
  },
  {
    name: "Матча",
    slug: "matcha",
    description: "Матча и посуда для её приготовления",
    translations: {
      en: { name: "Matcha", description: "Matcha and matcha-making utensils" },
      de: { name: "Matcha", description: "Matcha und Zubehör zur Zubereitung" },
    },
  },
];

const products: {
  slug: string;
  name: string;
  description: string;
  priceAmount: number;
  stock: number;
  category: string;
  images: string[];
  isFeatured?: boolean;
  translations: Translations;
}[] = [
  {
    slug: "da-hong-pao",
    name: "Да Хун Пао",
    description: "Насыщенный дымный улун с медовыми нотами",
    priceAmount: 2400,
    stock: 32,
    category: "tea",
    images: ["/products/da-hong-pao.avif"],
    isFeatured: true,
    translations: {
      en: { name: "Da Hong Pao", description: "Rich smoky oolong with honeyed notes" },
      de: { name: "Da Hong Pao", description: "Kräftiger rauchiger Oolong mit Honignoten" },
    },
  },
  {
    slug: "bi-luo-chun",
    name: "Билочунь",
    description: "Нежный весенний зелёный чай с цветочным ароматом",
    priceAmount: 1800,
    stock: 40,
    category: "tea",
    images: ["/products/bi-luo-chun.avif"],
    isFeatured: true,
    translations: {
      en: { name: "Bi Luo Chun", description: "Delicate spring green tea with a floral aroma" },
      de: { name: "Bi Luo Chun", description: "Zarter Frühlings-Grüntee mit blumigem Aroma" },
    },
  },
  {
    slug: "tie-guan-yin",
    name: "Те Гуань Инь",
    description: "Классический улун с молочно-цветочным вкусом",
    priceAmount: 2100,
    stock: 25,
    category: "tea",
    images: ["/products/tie-guan-yin.avif"],
    translations: {
      en: { name: "Tie Guan Yin", description: "Classic oolong with a milky-floral taste" },
      de: { name: "Tie Guan Yin", description: "Klassischer Oolong mit milchig-blumigem Geschmack" },
    },
  },
  {
    slug: "pu-erh-shu",
    name: "Шу Пуэр",
    description: "Выдержанный тёмный пуэр с землистым, глубоким вкусом",
    priceAmount: 2600,
    stock: 18,
    category: "tea",
    images: ["/products/pu-erh-shu.avif"],
    translations: {
      en: { name: "Shou Pu-erh", description: "Aged dark pu-erh with a deep, earthy taste" },
      de: { name: "Shou Pu-erh", description: "Gereifter dunkler Pu-erh mit erdigem, tiefem Geschmack" },
    },
  },
  {
    slug: "tea-sencha",
    name: "Сенча",
    description: "Свежий японский зелёный чай с травянистой сладостью",
    priceAmount: 1900,
    stock: 30,
    category: "tea",
    images: ["/products/tea-sencha.avif"],
    translations: {
      en: { name: "Sencha", description: "Fresh Japanese green tea with a grassy sweetness" },
      de: { name: "Sencha", description: "Frischer japanischer Grüntee mit grasiger Süße" },
    },
  },
  {
    slug: "tea-earl-grey",
    name: "Эрл Грей",
    description: "Чёрный чай с маслом бергамота, классика с британским характером",
    priceAmount: 1600,
    stock: 35,
    category: "tea",
    images: ["/products/tea-earl-grey.avif"],
    translations: {
      en: { name: "Earl Grey", description: "Black tea with bergamot oil, a classic with British character" },
      de: { name: "Earl Grey", description: "Schwarzer Tee mit Bergamottöl, ein Klassiker mit britischem Charakter" },
    },
  },
  {
    slug: "tea-jasmine",
    name: "Жасминовый чай",
    description: "Зелёный чай, ароматизированный цветками жасмина",
    priceAmount: 2000,
    stock: 28,
    category: "tea",
    images: ["/products/tea-jasmine.avif"],
    isFeatured: true,
    translations: {
      en: { name: "Jasmine Tea", description: "Green tea scented with jasmine flowers" },
      de: { name: "Jasmintee", description: "Grüner Tee, aromatisiert mit Jasminblüten" },
    },
  },
  {
    slug: "tea-white-peony",
    name: "Бай Му Дань",
    description: "Белый чай «белый пион» с лёгким медовым послевкусием",
    priceAmount: 2900,
    stock: 16,
    category: "tea",
    images: ["/products/tea-white-peony.avif"],
    translations: {
      en: { name: "Bai Mu Dan", description: "White Peony tea with a light honeyed finish" },
      de: { name: "Bai Mu Dan", description: "Weißer Tee „Weiße Pfingstrose“ mit leichtem Honigabgang" },
    },
  },
  {
    slug: "tea-hojicha",
    name: "Хочуа",
    description: "Обжаренный японский зелёный чай с ореховым ароматом",
    priceAmount: 1900,
    stock: 26,
    category: "tea",
    images: ["/products/tea-hojicha.avif"],
    translations: {
      en: { name: "Hojicha", description: "Roasted Japanese green tea with a nutty aroma" },
      de: { name: "Hojicha", description: "Gerösteter japanischer Grüntee mit nussigem Aroma" },
    },
  },
  {
    slug: "cup-hagi",
    name: "Чашка «Хаги»",
    description: "Керамическая чашка ручной обжига, 250 мл",
    priceAmount: 2800,
    stock: 15,
    category: "cups",
    images: ["/products/cup-hagi.avif"],
    translations: {
      en: { name: "Hagi Cup", description: "Hand-fired ceramic cup, 250 ml" },
      de: { name: "Tasse „Hagi“", description: "Handgebrannte Keramiktasse, 250 ml" },
    },
  },
  {
    slug: "cup-porcelain-white",
    name: "Фарфоровая чашка «Снег»",
    description: "Тонкостенный белый фарфор, 180 мл",
    priceAmount: 3200,
    stock: 12,
    category: "cups",
    images: ["/products/cup-porcelain-white.avif"],
    translations: {
      en: { name: "White Porcelain Cup \"Snow\"", description: "Thin-walled white porcelain, 180 ml" },
      de: { name: "Porzellantasse „Schnee“", description: "Dünnwandiges weißes Porzellan, 180 ml" },
    },
  },
  {
    slug: "cup-set-two",
    name: "Пара чашек «Роса»",
    description: "Комплект из двух чашек с блюдцами",
    priceAmount: 5200,
    stock: 10,
    category: "cups",
    images: ["/products/cup-set-two.avif"],
    translations: {
      en: { name: "Cup Pair \"Dew\"", description: "Set of two cups with saucers" },
      de: { name: "Tassenpaar „Tau“", description: "Set aus zwei Tassen mit Untertassen" },
    },
  },
  {
    slug: "cup-celadon",
    name: "Чашка «Селадон»",
    description: "Керамика с фирменной бледно-зелёной глазурью",
    priceAmount: 3100,
    stock: 14,
    category: "cups",
    images: ["/products/cup-celadon.avif"],
    translations: {
      en: { name: "Celadon Cup", description: "Ceramics with signature pale green glaze" },
      de: { name: "Tasse „Seladon“", description: "Keramik mit typisch blassgrüner Glasur" },
    },
  },
  {
    slug: "cup-glass-double-wall",
    name: "Стеклянная чашка с двойными стенками",
    description: "Термостойкое стекло, сохраняет тепло дольше обычного",
    priceAmount: 2200,
    stock: 20,
    category: "cups",
    images: ["/products/cup-glass-double-wall.avif"],
    translations: {
      en: { name: "Double-Wall Glass Cup", description: "Heat-resistant glass, keeps warmth longer than usual" },
      de: { name: "Doppelwandiges Glas", description: "Hitzebeständiges Glas, hält die Wärme länger als gewöhnlich" },
    },
  },
  {
    slug: "cup-gaiwan",
    name: "Гайвань",
    description: "Традиционная чашка с крышкой для заваривания и питья",
    priceAmount: 2600,
    stock: 18,
    category: "cups",
    images: ["/products/cup-gaiwan.avif"],
    translations: {
      en: { name: "Gaiwan", description: "Traditional lidded cup for brewing and drinking" },
      de: { name: "Gaiwan", description: "Traditionelle Deckelschale zum Aufgießen und Trinken" },
    },
  },
  {
    slug: "teapot-tetsubin",
    name: "Заварник «Тэцубин»",
    description: "Чугунный заварник ручной работы, 0.6 л",
    priceAmount: 5600,
    stock: 8,
    category: "teapots",
    images: ["/products/teapot-tetsubin.avif"],
    isFeatured: true,
    translations: {
      en: { name: "Tetsubin Teapot", description: "Handmade cast-iron teapot, 0.6 L" },
      de: { name: "Teekanne „Tetsubin“", description: "Handgefertigte Gusseisen-Teekanne, 0,6 l" },
    },
  },
  {
    slug: "teapot-glass",
    name: "Стеклянный заварник «Прозрачность»",
    description: "Термостойкое стекло, съёмное ситечко, 0.8 л",
    priceAmount: 3400,
    stock: 14,
    category: "teapots",
    images: ["/products/teapot-glass.avif"],
    translations: {
      en: { name: "Glass Teapot \"Clarity\"", description: "Heat-resistant glass, removable strainer, 0.8 L" },
      de: { name: "Glasteekanne „Klarheit“", description: "Hitzebeständiges Glas, herausnehmbares Sieb, 0,8 l" },
    },
  },
  {
    slug: "teapot-yixing",
    name: "Исинский чайник",
    description: "Глина Исин, для улунов и пуэров, 0.15 л",
    priceAmount: 4800,
    stock: 6,
    category: "teapots",
    images: ["/products/teapot-yixing.avif"],
    translations: {
      en: { name: "Yixing Teapot", description: "Yixing clay, for oolongs and pu-erhs, 0.15 L" },
      de: { name: "Yixing-Kanne", description: "Yixing-Ton, für Oolong und Pu-erh, 0,15 l" },
    },
  },
  {
    slug: "teapot-porcelain-blue",
    name: "Фарфоровый заварник «Кобальт»",
    description: "Роспись подглазурным кобальтом, 0.5 л",
    priceAmount: 4200,
    stock: 11,
    category: "teapots",
    images: ["/products/teapot-porcelain-blue.avif"],
    translations: {
      en: { name: "Porcelain Teapot \"Cobalt\"", description: "Underglaze cobalt-blue painting, 0.5 L" },
      de: { name: "Porzellankanne „Kobalt“", description: "Unterglasurmalerei in Kobaltblau, 0,5 l" },
    },
  },
  {
    slug: "teapot-kyusu",
    name: "Заварник «Кюсу»",
    description: "Японский заварник с боковой ручкой, 0.3 л",
    priceAmount: 3900,
    stock: 13,
    category: "teapots",
    images: ["/products/teapot-kyusu.avif"],
    translations: {
      en: { name: "Kyusu Teapot", description: "Japanese side-handle teapot, 0.3 L" },
      de: { name: "Teekanne „Kyusu“", description: "Japanische Kanne mit Seitengriff, 0,3 l" },
    },
  },
  {
    slug: "set-morning-ritual",
    name: "Набор «Утренний ритуал»",
    description: "Чай, чашка и заварник в подарочной упаковке",
    priceAmount: 6800,
    stock: 20,
    category: "sets",
    images: ["/products/set-morning-ritual.avif"],
    isFeatured: true,
    translations: {
      en: { name: "Morning Ritual Set", description: "Tea, a cup and a teapot in gift packaging" },
      de: { name: "Set „Morgenritual“", description: "Tee, Tasse und Teekanne in Geschenkverpackung" },
    },
  },
  {
    slug: "set-tasting",
    name: "Дегустационный набор",
    description: "5 сортов чая по 20 г для знакомства с ассортиментом",
    priceAmount: 3200,
    stock: 22,
    category: "sets",
    images: ["/products/set-tasting.avif"],
    translations: {
      en: { name: "Tasting Set", description: "5 teas, 20 g each, to explore the range" },
      de: { name: "Verkostungsset", description: "5 Teesorten à 20 g zum Kennenlernen des Sortiments" },
    },
  },
  {
    slug: "set-oolong-collection",
    name: "Коллекция улунов",
    description: "Три сорта улуна разной степени ферментации в подарочной коробке",
    priceAmount: 4400,
    stock: 17,
    category: "sets",
    images: ["/products/set-oolong-collection.avif"],
    translations: {
      en: { name: "Oolong Collection", description: "Three oolongs of varying fermentation in a gift box" },
      de: { name: "Oolong-Kollektion", description: "Drei Oolongs unterschiedlicher Fermentationsgrade in einer Geschenkbox" },
    },
  },
  {
    slug: "set-matcha-starter",
    name: "Стартовый набор для матча",
    description: "Матча, чаван и венчик — всё для первой церемонии",
    priceAmount: 5900,
    stock: 12,
    category: "sets",
    images: ["/products/set-matcha-starter.avif"],
    isFeatured: true,
    translations: {
      en: { name: "Matcha Starter Set", description: "Matcha, a chawan bowl and a whisk — everything for your first ceremony" },
      de: { name: "Matcha-Starterset", description: "Matcha, Chawan-Schale und Besen — alles für die erste Zeremonie" },
    },
  },
  {
    slug: "accessory-infuser",
    name: "Ситечко для чая",
    description: "Нержавеющая сталь, мелкая сетка для рассыпного чая",
    priceAmount: 900,
    stock: 50,
    category: "accessories",
    images: ["/products/accessory-infuser.avif"],
    translations: {
      en: { name: "Tea Strainer", description: "Stainless steel, fine mesh for loose-leaf tea" },
      de: { name: "Teesieb", description: "Edelstahl, feines Sieb für losen Tee" },
    },
  },
  {
    slug: "accessory-caddy",
    name: "Банка для хранения чая",
    description: "Жестяная банка с плотной крышкой, защищает от света и влаги",
    priceAmount: 1400,
    stock: 34,
    category: "accessories",
    images: ["/products/accessory-caddy.avif"],
    translations: {
      en: { name: "Tea Storage Tin", description: "Tin with a tight lid, protects from light and moisture" },
      de: { name: "Teedose", description: "Blechdose mit dichtem Deckel, schützt vor Licht und Feuchtigkeit" },
    },
  },
  {
    slug: "accessory-tray",
    name: "Поднос для чайной церемонии",
    description: "Бамбуковый поднос с решёткой для гунфу ча",
    priceAmount: 3600,
    stock: 15,
    category: "accessories",
    images: ["/products/accessory-tray.avif"],
    translations: {
      en: { name: "Tea Ceremony Tray", description: "Bamboo tray with a grate for gongfu tea" },
      de: { name: "Teetablett", description: "Bambustablett mit Gitter für Gongfu-Cha" },
    },
  },
  {
    slug: "accessory-scoop",
    name: "Тясяку — ложка для чая",
    description: "Бамбуковая ложка для дозирования листового чая и матча",
    priceAmount: 700,
    stock: 40,
    category: "accessories",
    images: ["/products/accessory-scoop.avif"],
    translations: {
      en: { name: "Chashaku Tea Scoop", description: "Bamboo scoop for measuring loose tea and matcha" },
      de: { name: "Chashaku-Teelöffel", description: "Bambuslöffel zum Dosieren von losem Tee und Matcha" },
    },
  },
  {
    slug: "accessory-timer",
    name: "Песочные часы для заваривания",
    description: "3 минуты — точное время для большинства сортов чая",
    priceAmount: 1100,
    stock: 28,
    category: "accessories",
    images: ["/products/accessory-timer.avif"],
    translations: {
      en: { name: "Brewing Sand Timer", description: "3 minutes — the right time for most tea types" },
      de: { name: "Sanduhr zum Aufgießen", description: "3 Minuten — die richtige Zeit für die meisten Teesorten" },
    },
  },
  {
    slug: "matcha-ceremonial",
    name: "Матча церемониальная",
    description: "Ярко-зелёный порошок первого сбора, для питья без добавок",
    priceAmount: 3800,
    stock: 20,
    category: "matcha",
    images: ["/products/matcha-ceremonial.avif"],
    isFeatured: true,
    translations: {
      en: { name: "Ceremonial Matcha", description: "Vivid green first-harvest powder, for drinking plain" },
      de: { name: "Zeremonielles Matcha", description: "Leuchtend grünes Pulver der ersten Ernte, pur genießbar" },
    },
  },
  {
    slug: "matcha-whisk",
    name: "Часэн — венчик для матча",
    description: "Бамбуковый венчик со 100 зубцами для взбивания матча",
    priceAmount: 2100,
    stock: 24,
    category: "matcha",
    images: ["/products/matcha-whisk.avif"],
    translations: {
      en: { name: "Chasen Matcha Whisk", description: "Bamboo whisk with 100 tines for whisking matcha" },
      de: { name: "Chasen-Matchabesen", description: "Bambusbesen mit 100 Zinken zum Aufschlagen von Matcha" },
    },
  },
  {
    slug: "matcha-bowl",
    name: "Чаван — чаша для матча",
    description: "Широкая керамическая чаша для взбивания и питья матча",
    priceAmount: 3300,
    stock: 16,
    category: "matcha",
    images: ["/products/matcha-bowl.avif"],
    translations: {
      en: { name: "Chawan Matcha Bowl", description: "Wide ceramic bowl for whisking and drinking matcha" },
      de: { name: "Chawan-Matchaschale", description: "Breite Keramikschale zum Aufschlagen und Trinken von Matcha" },
    },
  },
  {
    slug: "matcha-set",
    name: "Полный набор для матча",
    description: "Матча, чаван, часэн и ложка — комплект для настоящей церемонии",
    priceAmount: 7200,
    stock: 9,
    category: "matcha",
    images: ["/products/matcha-set.avif"],
    translations: {
      en: { name: "Complete Matcha Set", description: "Matcha, chawan, chasen and scoop — a set for a real ceremony" },
      de: { name: "Komplettes Matcha-Set", description: "Matcha, Chawan, Chasen und Löffel — Set für eine echte Zeremonie" },
    },
  },
];

async function upsertTranslations(entityType: "PRODUCT" | "CATEGORY", entityId: string, translations: Translations) {
  for (const [locale, { name, description }] of Object.entries(translations)) {
    await Promise.all([
      prisma.translation.upsert({
        where: { entityType_entityId_locale_field: { entityType, entityId, locale, field: "NAME" } },
        update: { value: name },
        create: { entityType, entityId, locale, field: "NAME", value: name },
      }),
      prisma.translation.upsert({
        where: { entityType_entityId_locale_field: { entityType, entityId, locale, field: "DESCRIPTION" } },
        update: { value: description },
        create: { entityType, entityId, locale, field: "DESCRIPTION", value: description },
      }),
    ]);
  }
}

async function main() {
  for (const { translations, ...category } of categories) {
    const saved = await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
    await upsertTranslations("CATEGORY", saved.id, translations);
  }

  for (const { category: categorySlug, translations, ...product } of products) {
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: categorySlug },
    });
    const saved = await prisma.product.upsert({
      where: { slug: product.slug },
      update: { ...product, categoryId: category.id },
      create: { ...product, categoryId: category.id },
    });
    await upsertTranslations("PRODUCT", saved.id, translations);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
