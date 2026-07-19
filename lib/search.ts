import { prisma } from "@/lib/prisma";
import { normalizeForSearch } from "@/lib/slugify";
import type { Book } from "@prisma/client";

const SEARCH_INDEX_NAME = "default";
const SEARCH_PATHS = ["title", "author", "description", "tags"];

type SearchResult = {
  books: Book[];
  usedFallback: boolean;
};

function extractObjectId(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "$oid" in value) {
    const oid = (value as { $oid?: unknown }).$oid;
    return typeof oid === "string" ? oid : null;
  }
  return null;
}

async function atlasSearch(query: string, limit: number): Promise<Book[]> {
  const raw = await prisma.$runCommandRaw({
    aggregate: "Book",
    pipeline: [
      {
        $search: {
          index: SEARCH_INDEX_NAME,
          text: {
            query,
            path: SEARCH_PATHS,
            fuzzy: {},
          },
        },
      },
      { $limit: limit },
      { $project: { _id: 1 } },
    ],
    cursor: {},
  });

  const batch =
    (raw as { cursor?: { firstBatch?: unknown[] } })?.cursor?.firstBatch ?? [];

  const orderedIds = batch
    .map((doc) => extractObjectId((doc as { _id?: unknown })?._id))
    .filter((id): id is string => Boolean(id));

  if (orderedIds.length === 0) return [];

  const books = await prisma.book.findMany({
    where: { id: { in: orderedIds }, stock: { gt: 0 } },
  });
  const byId = new Map(books.map((book) => [book.id, book]));

  return orderedIds
    .map((id) => byId.get(id))
    .filter((book): book is Book => Boolean(book));
}

// Distanța Damerau-Levenshtein (optimal string alignment) — pentru toleranță la
// greșeli de tastare. Contează transpoziția a două litere vecine ca O SINGURĂ
// editare (ex. „atmoic" vs „atomic", „sapeins" vs „sapiens"), cel mai frecvent
// tip de typo. Catalogul e mic, deci o rulăm în memorie.
function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (a === b) return 0;
  if (!m) return n;
  if (!n) return m;

  const d: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1); // transpoziție vecini
      }
    }
  }
  return d[m][n];
}

// Cât de mult „aproape" acceptăm între cuvântul căutat și un token, în funcție
// de lungime (cuvintele scurte tolerează 1 greșeală, cele lungi până la 2).
function maxEditDistance(word: string): number {
  if (word.length <= 3) return 0;
  if (word.length <= 6) return 1;
  return 2;
}

// Câmpurile relevante ca text de căutare per carte.
const CANDIDATE_TAKE = 2000;

async function fallbackSearch(query: string, limit: number): Promise<Book[]> {
  // Normalizăm și query-ul, și (mai jos) textele cărții — utilizatorii scriu
  // de obicei fără diacritice („carti"), iar titlurile le au („cărți").
  const words = normalizeForSearch(query)
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return [];

  // 1) Potrivire directă (rapidă) — conține cuvântul în searchText.
  const contained = await prisma.book.findMany({
    where: {
      stock: { gt: 0 },
      OR: words.map((word) => ({
        searchText: { contains: word, mode: "insensitive" },
      })),
    },
    take: limit * 3,
  });

  // 2) Dacă nu s-a găsit destul (probabil typo), scanăm un set mărginit de cărți
  //    și potrivim fuzzy pe tokenii lor (titlu, autor, tag-uri etc.).
  let pool = contained;
  if (contained.length < limit) {
    const extra = await prisma.book.findMany({ where: { stock: { gt: 0 } }, take: CANDIDATE_TAKE });
    const seen = new Set(contained.map((b) => b.id));
    pool = [...contained, ...extra.filter((b) => !seen.has(b.id))];
  }

  const scored = pool
    .map((book) => {
      const title = normalizeForSearch(book.title);
      const author = normalizeForSearch(book.author);
      const haystack = normalizeForSearch(book.searchText);
      const tokens = haystack.split(/\s+/).filter(Boolean);

      let score = 0;
      for (const word of words) {
        if (title.includes(word)) {
          score += 5; // potrivire exactă în titlu
        } else if (author.includes(word)) {
          score += 4;
        } else if (haystack.includes(word)) {
          score += 2; // potrivire exactă oriunde
        } else {
          // fuzzy: cel mai apropiat token din carte
          const threshold = maxEditDistance(word);
          if (threshold > 0) {
            let best = Infinity;
            for (const token of tokens) {
              if (Math.abs(token.length - word.length) > threshold) continue;
              const d = editDistance(word, token);
              if (d < best) best = d;
              if (best === 0) break;
            }
            if (best <= threshold) score += 3 - best; // mai aproape = scor mai mare
          }
        }
      }
      return { book, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.book);

  return scored;
}

export async function searchBooks(query: string, limit = 24): Promise<SearchResult> {
  const trimmed = query.trim();
  if (!trimmed) return { books: [], usedFallback: false };

  try {
    const books = await atlasSearch(trimmed, limit);
    // Dacă Atlas Search rulează dar nu întoarce nimic (index încă în construcție,
    // typo neacoperit sau mapare incompletă), mai încercăm căutarea simplă ca
    // să nu rămână utilizatorul cu „niciun rezultat" degeaba.
    if (books.length > 0) return { books, usedFallback: false };
    const fallback = await fallbackSearch(trimmed, limit);
    return { books: fallback, usedFallback: fallback.length > 0 };
  } catch (error) {
    console.error(
      "[search] Atlas Search a eșuat, trec pe căutarea simplă de rezervă:",
      error
    );
    const books = await fallbackSearch(trimmed, limit);
    return { books, usedFallback: true };
  }
}
