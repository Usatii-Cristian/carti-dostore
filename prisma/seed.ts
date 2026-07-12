import { prisma } from "../lib/prisma";

const DIACRITICS_REGEX = /[̀-ͯ]/g;

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Fotografii temporare de pe Unsplash (Faza 1) — înlocuite cu imagini reale
// ale cărților prin Vercel Blob la Faza 5.
function coverUrl(photoId: string): string {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=800&h=1200&q=80`;
}

function buildSearchText(parts: (string | string[])[]): string {
  return parts
    .flat()
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "");
}

const categoriesData = [
  { name: "Literatură română", icon: "📖" },
  { name: "Literatură universală", icon: "🌍" },
  { name: "Dezvoltare personală", icon: "🌱" },
  { name: "Psihologie", icon: "🧠" },
  { name: "Istorie", icon: "🏛️" },
  { name: "Afaceri", icon: "💼" },
  { name: "Copii și adolescenți", icon: "🧸" },
  { name: "Spiritualitate", icon: "🕊️" },
  { name: "Știință", icon: "🔬" },
  { name: "Arte și hobby", icon: "🎨" },
];

type BookSeed = {
  title: string;
  author: string;
  category: string;
  description: string;
  price: number;
  discountPrice?: number;
  publisher?: string;
  isbn?: string;
  pageCount?: number;
  stock: number;
  rating: number;
  reviewCount: number;
  isBestseller?: boolean;
  isNew?: boolean;
  tags: string[];
  photoId: string;
};

const booksData: BookSeed[] = [
  {
    title: "Atomic Habits",
    author: "James Clear",
    category: "Dezvoltare personală",
    description:
      "Un ghid practic despre cum obiceiurile mici, repetate constant, produc schimbări remarcabile pe termen lung. James Clear oferă un sistem clar pentru a construi obiceiuri bune și a le elimina pe cele proaste.",
    price: 189,
    discountPrice: 159,
    publisher: "Alfa",
    isbn: "978-606-25-0000-1",
    pageCount: 320,
    stock: 24,
    rating: 4.8,
    reviewCount: 312,
    isBestseller: true,
    tags: ["obiceiuri", "productivitate", "dezvoltare personală"],
    photoId: "photo-1705837861201-dd000d929a31",
  },
  {
    title: "Ikigai",
    author: "Hector Garcia, Francesc Miralles",
    category: "Dezvoltare personală",
    description:
      "Secretul japonez pentru o viață lungă și fericită. O explorare a conceptului de ikigai — motivul pentru care te trezești dimineața — prin poveștile locuitorilor din Okinawa.",
    price: 149,
    publisher: "Litera",
    isbn: "978-606-33-0000-2",
    pageCount: 208,
    stock: 18,
    rating: 4.6,
    reviewCount: 201,
    isBestseller: true,
    tags: ["fericire", "filosofie de viață", "japonia"],
    photoId: "photo-1528459105426-b9548367069b",
  },
  {
    title: "Cele 7 deprinderi ale persoanelor eficace",
    author: "Stephen R. Covey",
    category: "Dezvoltare personală",
    description:
      "Un clasic al literaturii de dezvoltare personală, care propune un cadru bazat pe caracter pentru eficacitate personală și profesională.",
    price: 169,
    publisher: "Allfa",
    isbn: "978-606-25-0000-3",
    pageCount: 384,
    stock: 15,
    rating: 4.7,
    reviewCount: 178,
    isBestseller: true,
    tags: ["leadership", "eficacitate", "obiceiuri"],
    photoId: "photo-1783692218364-a97c219b0f67",
  },
  {
    title: "12 reguli de viață: Un antidot la haos",
    author: "Jordan B. Peterson",
    category: "Psihologie",
    description:
      "Psihologul Jordan Peterson combină biologia, mitologia și filosofia pentru a oferi 12 principii practice care ajută la găsirea ordinii într-o lume haotică.",
    price: 179,
    discountPrice: 149,
    publisher: "Act și Politon",
    isbn: "978-606-913-000-4",
    pageCount: 448,
    stock: 20,
    rating: 4.5,
    reviewCount: 264,
    isBestseller: true,
    tags: ["psihologie", "filosofie", "disciplină"],
    photoId: "photo-1778546978267-b93e8c6ea099",
  },
  {
    title: "Gândire rapidă, gândire lentă",
    author: "Daniel Kahneman",
    category: "Psihologie",
    description:
      "Laureatul Nobel Daniel Kahneman explică cele două sisteme care ne guvernează gândirea — unul rapid și intuitiv, altul lent și rațional.",
    price: 199,
    publisher: "Publica",
    isbn: "978-606-722-000-5",
    pageCount: 552,
    stock: 12,
    rating: 4.7,
    reviewCount: 143,
    isNew: true,
    tags: ["psihologie", "decizii", "cogniție"],
    photoId: "photo-1621351183012-e2f9972dd9bf",
  },
  {
    title: "Sapiens: Scurtă istorie a omenirii",
    author: "Yuval Noah Harari",
    category: "Istorie",
    description:
      "O reinterpretare îndrăzneață a istoriei umanității, de la apariția Homo sapiens până la revoluțiile cognitivă, agricolă și științifică.",
    price: 209,
    discountPrice: 179,
    publisher: "Polirom",
    isbn: "978-973-46-0000-6",
    pageCount: 512,
    stock: 30,
    rating: 4.9,
    reviewCount: 389,
    isBestseller: true,
    tags: ["istorie", "antropologie", "civilizație"],
    photoId: "photo-1633477189729-9290b3261d0a",
  },
  {
    title: "Homo Deus: Scurtă istorie a viitorului",
    author: "Yuval Noah Harari",
    category: "Istorie",
    description:
      "Continuarea volumului Sapiens, care explorează ce urmează pentru specia umană — de la inteligența artificială la nemurirea biologică.",
    price: 209,
    publisher: "Polirom",
    isbn: "978-973-46-0000-7",
    pageCount: 464,
    stock: 16,
    rating: 4.6,
    reviewCount: 156,
    isNew: true,
    tags: ["istorie", "viitor", "tehnologie"],
    photoId: "photo-1519764340700-3db40311f21e",
  },
  {
    title: "Invitație la vals",
    author: "Mihail Drumeș",
    category: "Literatură română",
    description:
      "Un roman esențial al literaturii române interbelice, care urmărește drama unui om obișnuit prins între datorie și pasiune.",
    price: 79,
    publisher: "Cartex",
    isbn: "978-973-104-000-8",
    pageCount: 296,
    stock: 10,
    rating: 4.4,
    reviewCount: 67,
    tags: ["literatură română", "clasic", "roman"],
    photoId: "photo-1629992101753-56d196c8aabb",
  },
  {
    title: "Baltagul",
    author: "Mihail Sadoveanu",
    category: "Literatură română",
    description:
      "Povestea Vitoriei Lipan, care pornește într-o călătorie prin Munții Neamțului pentru a afla adevărul despre moartea soțului ei.",
    price: 69,
    publisher: "Cartex",
    isbn: "978-973-104-000-9",
    pageCount: 176,
    stock: 22,
    rating: 4.5,
    reviewCount: 98,
    tags: ["literatură română", "clasic", "roman"],
    photoId: "photo-1610116306796-6fea9f4fae38",
  },
  {
    title: "1984",
    author: "George Orwell",
    category: "Literatură universală",
    description:
      "Romanul distopic care a definit genul — o viziune tulburătoare asupra unei societăți totalitare aflate sub supraveghere permanentă.",
    price: 89,
    discountPrice: 74,
    publisher: "Polirom",
    isbn: "978-973-46-0001-0",
    pageCount: 352,
    stock: 28,
    rating: 4.8,
    reviewCount: 421,
    isBestseller: true,
    tags: ["distopie", "clasic", "politică"],
    photoId: "photo-1457369804613-52c61a468e7d",
  },
  {
    title: "Crimă și pedeapsă",
    author: "Feodor Dostoievski",
    category: "Literatură universală",
    description:
      "Capodopera lui Dostoievski despre vină, ispășire și limitele moralei umane, urmărind destinul tânărului Raskolnikov.",
    price: 99,
    publisher: "Cartex",
    isbn: "978-973-104-001-1",
    pageCount: 608,
    stock: 14,
    rating: 4.7,
    reviewCount: 132,
    tags: ["clasic", "roman rusesc", "filosofie"],
    photoId: "photo-1777484838408-7de1b96ce8f4",
  },
  {
    title: "Tatăl bogat, tatăl sărac",
    author: "Robert Kiyosaki",
    category: "Afaceri",
    description:
      "Lecțiile financiare fundamentale care contrastează mentalitatea despre bani a două figuri paterne diferite — un bestseller mondial despre educație financiară.",
    price: 139,
    publisher: "Curtea Veche",
    isbn: "978-973-669-000-2",
    pageCount: 272,
    stock: 19,
    rating: 4.4,
    reviewCount: 187,
    tags: ["finanțe personale", "afaceri", "investiții"],
    photoId: "photo-1550399105-c4db5fb85c18",
  },
  {
    title: "Start with Why",
    author: "Simon Sinek",
    category: "Afaceri",
    description:
      "De ce unele organizații și lideri reușesc să inspire, iar altele nu. Simon Sinek propune conceptul de cercul de aur ca model de gândire pentru leadership.",
    price: 129,
    publisher: "Publica",
    isbn: "978-606-722-001-3",
    pageCount: 256,
    stock: 11,
    rating: 4.5,
    reviewCount: 94,
    isNew: true,
    tags: ["leadership", "afaceri", "strategie"],
    photoId: "photo-1604866830893-c13cafa515d5",
  },
  {
    title: "Micul Prinț",
    author: "Antoine de Saint-Exupéry",
    category: "Copii și adolescenți",
    description:
      "Povestea atemporală a unui prinț venit de pe o planetă îndepărtată, o meditație delicată despre prietenie, iubire și esența lucrurilor cu adevărat importante.",
    price: 59,
    discountPrice: 49,
    publisher: "Humanitas",
    isbn: "978-973-50-0000-4",
    pageCount: 96,
    stock: 35,
    rating: 4.9,
    reviewCount: 276,
    isBestseller: true,
    tags: ["copii", "clasic", "ilustrat"],
    photoId: "photo-1524995997946-a1c2e315a42f",
  },
  {
    title: "Poveștile lui Creangă",
    author: "Ion Creangă",
    category: "Copii și adolescenți",
    description:
      "Colecție completă a poveștilor lui Ion Creangă — Harap-Alb, Punguța cu doi bani, Capra cu trei iezi și multe altele, în ediție ilustrată.",
    price: 65,
    publisher: "Litera",
    isbn: "978-606-33-0001-5",
    pageCount: 224,
    stock: 26,
    rating: 4.7,
    reviewCount: 112,
    tags: ["copii", "povești", "clasic românesc"],
    photoId: "photo-1513185041617-8ab03f83d6c5",
  },
  {
    title: "Puterea prezentului",
    author: "Eckhart Tolle",
    category: "Spiritualitate",
    description:
      "Un ghid spiritual influent despre eliberarea de gândurile anxioase și găsirea păcii interioare prin conectarea la momentul prezent.",
    price: 119,
    publisher: "Curtea Veche",
    isbn: "978-973-669-001-6",
    pageCount: 232,
    stock: 17,
    rating: 4.6,
    reviewCount: 165,
    isNew: true,
    tags: ["spiritualitate", "mindfulness", "conștiință"],
    photoId: "photo-1532012197267-da84d127e765",
  },
  {
    title: "Cele patru înțelegeri",
    author: "Don Miguel Ruiz",
    category: "Spiritualitate",
    description:
      "O înțelepciune toltecă distilată în patru principii simple de viață, care conduc spre libertate personală și fericire autentică.",
    price: 89,
    publisher: "Cartea Daath",
    isbn: "978-973-8383-00-7",
    pageCount: 160,
    stock: 13,
    rating: 4.5,
    reviewCount: 88,
    tags: ["spiritualitate", "filosofie tolteca", "libertate"],
    photoId: "photo-1463320726281-696a485928c7",
  },
  {
    title: "O scurtă istorie a timpului",
    author: "Stephen Hawking",
    category: "Știință",
    description:
      "Cartea care a adus cosmologia modernă publicului larg — de la Big Bang la găurile negre, explicate într-un limbaj accesibil.",
    price: 99,
    publisher: "Humanitas",
    isbn: "978-973-50-0001-8",
    pageCount: 256,
    stock: 9,
    rating: 4.7,
    reviewCount: 121,
    tags: ["știință", "astrofizică", "cosmologie"],
    photoId: "photo-1495446815901-a7297e633e8d",
  },
  {
    title: "Cosmos",
    author: "Carl Sagan",
    category: "Știință",
    description:
      "O călătorie captivantă prin univers, prin ochii unuia dintre cei mai buni comunicatori de știință ai secolului XX.",
    price: 109,
    publisher: "Humanitas",
    isbn: "978-973-50-0001-9",
    pageCount: 384,
    stock: 8,
    rating: 4.8,
    reviewCount: 76,
    tags: ["știință", "astronomie", "univers"],
    photoId: "photo-1497633762265-9d179a990aa6",
  },
  {
    title: "Micul manual de caligrafie",
    author: "Ana Popescu",
    category: "Arte și hobby",
    description:
      "Un ghid pas cu pas pentru începători, cu exerciții practice pentru a învăța bazele caligrafiei moderne și scrierii decorative.",
    price: 95,
    publisher: "Editura Creativ",
    isbn: "978-606-8500-00-1",
    pageCount: 144,
    stock: 15,
    rating: 4.3,
    reviewCount: 34,
    tags: ["arte", "caligrafie", "hobby"],
    photoId: "photo-1543002588-bfa74002ed7e",
  },
  {
    title: "Grădinărit pentru începători",
    author: "Maria Ionescu",
    category: "Arte și hobby",
    description:
      "Sfaturi practice pentru amenajarea unei grădini de la zero, potrivite pentru climatul din Moldova — de la sol la recoltă.",
    price: 85,
    publisher: "Editura Creativ",
    isbn: "978-606-8500-00-2",
    pageCount: 168,
    stock: 12,
    rating: 4.2,
    reviewCount: 29,
    tags: ["hobby", "grădinărit", "practic"],
    photoId: "photo-1485322551133-3a4c27a9d925",
  },
];

async function main() {
  console.log("Seeding categorii...");
  const categoryBySlug = new Map<string, string>();

  for (const cat of categoriesData) {
    const slug = slugify(cat.name);
    const category = await prisma.category.upsert({
      where: { slug },
      update: { name: cat.name, icon: cat.icon },
      create: { name: cat.name, slug, icon: cat.icon },
    });
    categoryBySlug.set(cat.name, category.id);
  }

  console.log("Seeding cărți...");
  for (const book of booksData) {
    const categoryId = categoryBySlug.get(book.category);
    if (!categoryId) {
      throw new Error(`Categorie necunoscută pentru cartea "${book.title}": ${book.category}`);
    }

    const slug = slugify(book.title);
    const cover = coverUrl(book.photoId);
    const searchText = buildSearchText([
      book.title,
      book.author,
      book.category,
      book.tags,
    ]);

    await prisma.book.upsert({
      where: { slug },
      update: {
        title: book.title,
        author: book.author,
        description: book.description,
        price: book.price,
        discountPrice: book.discountPrice,
        coverImage: cover,
        images: [cover],
        categoryId,
        publisher: book.publisher,
        isbn: book.isbn,
        pageCount: book.pageCount,
        stock: book.stock,
        rating: book.rating,
        reviewCount: book.reviewCount,
        isBestseller: book.isBestseller ?? false,
        isNew: book.isNew ?? false,
        tags: book.tags,
        searchText,
      },
      create: {
        title: book.title,
        slug,
        author: book.author,
        description: book.description,
        price: book.price,
        discountPrice: book.discountPrice,
        coverImage: cover,
        images: [cover],
        categoryId,
        publisher: book.publisher,
        isbn: book.isbn,
        pageCount: book.pageCount,
        stock: book.stock,
        rating: book.rating,
        reviewCount: book.reviewCount,
        isBestseller: book.isBestseller ?? false,
        isNew: book.isNew ?? false,
        tags: book.tags,
        searchText,
      },
    });
  }

  console.log("Seeding admin...");
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminEmail || !adminPasswordHash) {
    console.warn(
      "ADMIN_EMAIL sau ADMIN_PASSWORD_HASH lipsesc din .env.local — sar peste crearea contului de admin."
    );
  } else {
    await prisma.admin.upsert({
      where: { email: adminEmail },
      update: { password: adminPasswordHash },
      create: { email: adminEmail, password: adminPasswordHash },
    });
  }

  console.log(
    `Gata: ${categoriesData.length} categorii, ${booksData.length} cărți.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
