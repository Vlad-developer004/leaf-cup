import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const categories = [
  { name: "Чай", slug: "tea", description: "Листовой чай и чай в пирамидках" },
  { name: "Чашки", slug: "cups", description: "Керамика и фарфор ручной работы" },
  { name: "Заварники", slug: "teapots", description: "Для дома и офиса, разный объём" },
  { name: "Наборы", slug: "sets", description: "Готовые подарочные комплекты" },
  { name: "Аксессуары", slug: "accessories", description: "Ситечки, банки для хранения и всё для чайной церемонии" },
  { name: "Матча", slug: "matcha", description: "Матча и посуда для её приготовления" },
];

// Изображения скачаны из Wikimedia Commons (свободная лицензия, см. public/products/CREDITS.md),
// сконвертированы в AVIF и лежат локально в public/products — так каталог не зависит от
// скорости/доступности стороннего сервера при каждой загрузке страницы.
const products: {
  slug: string;
  name: string;
  description: string;
  priceAmount: number;
  stock: number;
  category: string;
  images: string[];
  isFeatured?: boolean;
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
  },
  {
    slug: "tie-guan-yin",
    name: "Те Гуань Инь",
    description: "Классический улун с молочно-цветочным вкусом",
    priceAmount: 2100,
    stock: 25,
    category: "tea",
    images: ["/products/tie-guan-yin.avif"],
  },
  {
    slug: "pu-erh-shu",
    name: "Шу Пуэр",
    description: "Выдержанный тёмный пуэр с землистым, глубоким вкусом",
    priceAmount: 2600,
    stock: 18,
    category: "tea",
    images: ["/products/pu-erh-shu.avif"],
  },
  {
    slug: "tea-sencha",
    name: "Сенча",
    description: "Свежий японский зелёный чай с травянистой сладостью",
    priceAmount: 1900,
    stock: 30,
    category: "tea",
    images: ["/products/tea-sencha.avif"],
  },
  {
    slug: "tea-earl-grey",
    name: "Эрл Грей",
    description: "Чёрный чай с маслом бергамота, классика с британским характером",
    priceAmount: 1600,
    stock: 35,
    category: "tea",
    images: ["/products/tea-earl-grey.avif"],
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
  },
  {
    slug: "tea-white-peony",
    name: "Бай Му Дань",
    description: "Белый чай «белый пион» с лёгким медовым послевкусием",
    priceAmount: 2900,
    stock: 16,
    category: "tea",
    images: ["/products/tea-white-peony.avif"],
  },
  {
    slug: "tea-hojicha",
    name: "Хочуа",
    description: "Обжаренный японский зелёный чай с ореховым ароматом",
    priceAmount: 1900,
    stock: 26,
    category: "tea",
    images: ["/products/tea-hojicha.avif"],
  },
  {
    slug: "cup-hagi",
    name: "Чашка «Хаги»",
    description: "Керамическая чашка ручной обжига, 250 мл",
    priceAmount: 2800,
    stock: 15,
    category: "cups",
    images: ["/products/cup-hagi.avif"],
  },
  {
    slug: "cup-porcelain-white",
    name: "Фарфоровая чашка «Снег»",
    description: "Тонкостенный белый фарфор, 180 мл",
    priceAmount: 3200,
    stock: 12,
    category: "cups",
    images: ["/products/cup-porcelain-white.avif"],
  },
  {
    slug: "cup-set-two",
    name: "Пара чашек «Роса»",
    description: "Комплект из двух чашек с блюдцами",
    priceAmount: 5200,
    stock: 10,
    category: "cups",
    images: ["/products/cup-set-two.avif"],
  },
  {
    slug: "cup-celadon",
    name: "Чашка «Селадон»",
    description: "Керамика с фирменной бледно-зелёной глазурью",
    priceAmount: 3100,
    stock: 14,
    category: "cups",
    images: ["/products/cup-celadon.avif"],
  },
  {
    slug: "cup-glass-double-wall",
    name: "Стеклянная чашка с двойными стенками",
    description: "Термостойкое стекло, сохраняет тепло дольше обычного",
    priceAmount: 2200,
    stock: 20,
    category: "cups",
    images: ["/products/cup-glass-double-wall.avif"],
  },
  {
    slug: "cup-gaiwan",
    name: "Гайвань",
    description: "Традиционная чашка с крышкой для заваривания и питья",
    priceAmount: 2600,
    stock: 18,
    category: "cups",
    images: ["/products/cup-gaiwan.avif"],
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
  },
  {
    slug: "teapot-glass",
    name: "Стеклянный заварник «Прозрачность»",
    description: "Термостойкое стекло, съёмное ситечко, 0.8 л",
    priceAmount: 3400,
    stock: 14,
    category: "teapots",
    images: ["/products/teapot-glass.avif"],
  },
  {
    slug: "teapot-yixing",
    name: "Исинский чайник",
    description: "Глина Исин, для улунов и пуэров, 0.15 л",
    priceAmount: 4800,
    stock: 6,
    category: "teapots",
    images: ["/products/teapot-yixing.avif"],
  },
  {
    slug: "teapot-porcelain-blue",
    name: "Фарфоровый заварник «Кобальт»",
    description: "Роспись подглазурным кобальтом, 0.5 л",
    priceAmount: 4200,
    stock: 11,
    category: "teapots",
    images: ["/products/teapot-porcelain-blue.avif"],
  },
  {
    slug: "teapot-kyusu",
    name: "Заварник «Кюсу»",
    description: "Японский заварник с боковой ручкой, 0.3 л",
    priceAmount: 3900,
    stock: 13,
    category: "teapots",
    images: ["/products/teapot-kyusu.avif"],
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
  },
  {
    slug: "set-tasting",
    name: "Дегустационный набор",
    description: "5 сортов чая по 20 г для знакомства с ассортиментом",
    priceAmount: 3200,
    stock: 22,
    category: "sets",
    images: ["/products/set-tasting.avif"],
  },
  {
    slug: "set-oolong-collection",
    name: "Коллекция улунов",
    description: "Три сорта улуна разной степени ферментации в подарочной коробке",
    priceAmount: 4400,
    stock: 17,
    category: "sets",
    images: ["/products/set-oolong-collection.avif"],
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
  },
  {
    slug: "accessory-infuser",
    name: "Ситечко для чая",
    description: "Нержавеющая сталь, мелкая сетка для рассыпного чая",
    priceAmount: 900,
    stock: 50,
    category: "accessories",
    images: ["/products/accessory-infuser.avif"],
  },
  {
    slug: "accessory-caddy",
    name: "Банка для хранения чая",
    description: "Жестяная банка с плотной крышкой, защищает от света и влаги",
    priceAmount: 1400,
    stock: 34,
    category: "accessories",
    images: ["/products/accessory-caddy.avif"],
  },
  {
    slug: "accessory-tray",
    name: "Поднос для чайной церемонии",
    description: "Бамбуковый поднос с решёткой для гунфу ча",
    priceAmount: 3600,
    stock: 15,
    category: "accessories",
    images: ["/products/accessory-tray.avif"],
  },
  {
    slug: "accessory-scoop",
    name: "Тясяку — ложка для чая",
    description: "Бамбуковая ложка для дозирования листового чая и матча",
    priceAmount: 700,
    stock: 40,
    category: "accessories",
    images: ["/products/accessory-scoop.avif"],
  },
  {
    slug: "accessory-timer",
    name: "Песочные часы для заваривания",
    description: "3 минуты — точное время для большинства сортов чая",
    priceAmount: 1100,
    stock: 28,
    category: "accessories",
    images: ["/products/accessory-timer.avif"],
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
  },
  {
    slug: "matcha-whisk",
    name: "Часэн — венчик для матча",
    description: "Бамбуковый венчик со 100 зубцами для взбивания матча",
    priceAmount: 2100,
    stock: 24,
    category: "matcha",
    images: ["/products/matcha-whisk.avif"],
  },
  {
    slug: "matcha-bowl",
    name: "Чаван — чаша для матча",
    description: "Широкая керамическая чаша для взбивания и питья матча",
    priceAmount: 3300,
    stock: 16,
    category: "matcha",
    images: ["/products/matcha-bowl.avif"],
  },
  {
    slug: "matcha-set",
    name: "Полный набор для матча",
    description: "Матча, чаван, часэн и ложка — комплект для настоящей церемонии",
    priceAmount: 7200,
    stock: 9,
    category: "matcha",
    images: ["/products/matcha-set.avif"],
  },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  for (const { category: categorySlug, ...product } of products) {
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: categorySlug },
    });
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: { ...product, categoryId: category.id },
      create: { ...product, categoryId: category.id },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
