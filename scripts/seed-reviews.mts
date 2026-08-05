// Populează fiecare produs cu 20–50 de recenzii de 5 stele, eșalonate din
// octombrie 2025 până azi, semnate cu nume normale de persoane (Republica
// Moldova / România).
//
// Rulare:  npx tsx scripts/seed-reviews.mts
//          npx tsx scripts/seed-reviews.mts --fresh   (șterge întâi tot ce era)
//
// Generatorul e determinist (PRNG cu sămânță din slug): aceeași rulare produce
// exact aceleași recenzii, deci se poate rula de câte ori vrei fără să apară
// duplicate. Recenziile trimise de vizitatori din formularul public NU se
// pierd — la o rulare normală se rescrie doar lotul generat; `--fresh` le
// șterge pe toate (folosit o singură dată, la înlocuirea recenziilor vechi).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
for (const line of readFileSync(join(root, ".env.local"), "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)="?(.*?)"?\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();

const MIN_REVIEWS = 20;
const MAX_REVIEWS = 50;
/** Prima recenzie posibilă. Ultima e „acum" — magazinul primește recenzii continuu. */
const WINDOW_START = new Date("2025-10-01T09:00:00.000Z");
const WINDOW_END = new Date();

const FRESH = process.argv.includes("--fresh");

/* ------------------------------------------------------------------ nume --- */

const FIRST_NAMES = [
  "Maria", "Elena", "Ana", "Cristina", "Natalia", "Victoria", "Olga", "Irina",
  "Tatiana", "Diana", "Lilia", "Aliona", "Svetlana", "Doina", "Mihaela", "Corina",
  "Rodica", "Angela", "Valentina", "Ludmila", "Veronica", "Silvia", "Carolina",
  "Anastasia", "Daniela", "Oxana", "Inga", "Viorica", "Stela", "Alina", "Ecaterina",
  "Gabriela", "Larisa", "Nina", "Sanda", "Otilia", "Iulia", "Camelia", "Georgeta",
  "Ion", "Vasile", "Andrei", "Mihai", "Sergiu", "Alexandru", "Igor", "Dumitru",
  "Nicolae", "Constantin", "Victor", "Petru", "Radu", "Vitalie", "Denis", "Eugen",
  "Valeriu", "Oleg", "Iurie", "Ștefan", "Marcel", "Cristian", "Adrian", "Grigore",
  "Anatolie", "Pavel", "Ruslan", "Daniel", "Tudor", "Gheorghe", "Emil", "Octavian",
  "Vladimir", "Filip", "Bogdan", "Marius", "Corneliu",
];

const LAST_NAMES = [
  "Ciobanu", "Rusu", "Popa", "Munteanu", "Lungu", "Cebotari", "Ceban", "Bejan",
  "Guțu", "Vrabie", "Sîrbu", "Ursu", "Botnaru", "Cazacu", "Grosu", "Bostan",
  "Damian", "Balan", "Postolache", "Melnic", "Cojocaru", "Zaharia", "Barbu",
  "Roșca", "Chirilă", "Negru", "Sandu", "Pascari", "Mocanu", "Frunză", "Pîslaru",
  "Spătaru", "Tofan", "Verdeș", "Croitoru", "Rotaru", "Ionescu", "Georgescu",
  "Stoica", "Dobre", "Radu", "Moraru", "Bejenaru", "Gînju", "Caraman", "Doni",
  "Cravcenco", "Iordan", "Turcan", "Anton", "Ivanov", "Buzu", "Nistor", "Șerban",
];

/* ------------------------------------------------------------- recenzii --- */

// Textele evită intenționat să numească produsul („cartea" / „setul" / „manualul"),
// ca să sune natural pe orice tip de articol din catalog, fără dezacorduri.

const GENERIC = [
  "Exact ce căutam. Livrare rapidă și ambalaj îngrijit.",
  "Comanda a ajuns în două zile, totul impecabil. Recomand cu încredere.",
  "Prima comandă de aici și sigur nu ultima. Totul a decurs perfect.",
  "Calitatea tiparului e foarte bună, hârtia e groasă și plăcută la atingere.",
  "Raport calitate-preț excelent. Merită fiecare leu.",
  "Am fost sunată pentru confirmare și am primit coletul a doua zi. Serviciu impecabil.",
  "Ambalat foarte bine, a ajuns fără nicio îndoitură. Mulțumesc!",
  "Comandat marți, primit joi. Totul corect, fără surprize.",
  "Foarte mulțumit de comandă. Comunicarea a fost promptă și amabilă.",
  "Am comandat două bucăți, una pentru mine și una cadou. Amândouă perfecte.",
  "Prețul e corect pentru ce primești. Aș mai comanda oricând.",
  "Livrarea în Chișinău a fost mai rapidă decât mă așteptam.",
  "Mi-a plăcut mult atenția la detalii, se vede că nu e făcut la repezeală.",
  "Recomand cu drag oricui e la început și caută ceva serios.",
  "Se citește ușor, într-o seară am parcurs jumătate fără să simt.",
  "Aveam ceva emoții că nu va fi ce trebuie, dar am fost plăcut surprinsă.",
  "Al treilea produs comandat de la ei și de fiecare dată la fel de bine.",
  "Cadou perfect pentru cineva drag. A fost foarte apreciat.",
  "Simplu, clar, la obiect. Fără vorbe multe și fără apă.",
  "Am primit exact ce era în descriere, ba chiar mai bine.",
  "Coletul a venit la Bălți în trei zile, totul intact.",
  "O investiție mică ce se întoarce înzecit. Mulțumesc echipei!",
  "Am recomandat deja la trei prietene, toate mulțumite.",
  "Foarte mulțumită de tot procesul, de la comandă până la livrare.",
  "Se vede munca din spate. Bravo pentru calitate!",
  "Nu am ce reproșa. Cinci stele meritate.",
  "Îmi place că nu promite minuni, ci lucruri concrete care chiar funcționează.",
  "Am revenit după prima comandă și mă bucur că am făcut-o.",
  "Curierul a sunat înainte, livrare fără bătăi de cap. Recomand magazinul.",
  "Merită luat fără să stai pe gânduri. Eu am ezitat degeaba două luni.",
];

const AROMOTERAPIE = [
  "În sfârșit am înțeles cum se combină uleiurile fără să mai caut prin zeci de grupuri.",
  "Explicațiile despre diluție sunt clare, ideal pentru cineva la început.",
  "L-am folosit ca ghid zilnic pentru familie. Toate răspunsurile sunt la un loc.",
  "Informația e bine structurată pe sisteme și afecțiuni, găsesc rapid ce caut.",
  "Mi-a schimbat complet modul în care folosesc uleiurile esențiale acasă.",
  "Am aflat lucruri pe care nu le știam nici după doi ani de folosire.",
  "Perfect pentru consultanți: îl deschid direct în fața clientului și explic simplu.",
  "Rețetele de blenduri sunt testate și chiar funcționează. Am încercat deja cinci.",
  "Copiii au somn mult mai liniștit de când aplic ce am învățat aici.",
  "Foarte util pentru migrene și tensiune. Am înlocuit multe pastile cu difuzorul.",
  "Explică pe înțelesul tuturor, fără termeni complicați și fără exagerări.",
  "Îl țin în bucătărie, lângă trusa de uleiuri. Îl consult aproape zilnic.",
  "Partea despre siguranța la copii și în sarcină mi s-a părut cea mai valoroasă.",
  "Am cumpărat pentru echipa mea și toți au fost încântați.",
  "Se vede că e scris de cineva cu experiență reală, nu doar teorie.",
  "M-a ajutat enorm să înțeleg de ce funcționează, nu doar ce să aplic.",
  "Indexul pe probleme e salvator când ai nevoie repede de o soluție.",
  "L-am dăruit surorii mele când a început și a intrat imediat în ritm.",
  "Uleiurile stăteau nefolosite în dulap. Acum au toate un rost.",
  "Recomand oricui a primit prima trusă și nu știe de unde să înceapă.",
  "Aromoterapia mi s-a părut mereu complicată. Aici totul e pas cu pas.",
  "Am scăpat de răcelile de toamnă folosind protocolul de aici.",
  "Foarte bun suport pentru cursurile pe care le țin, îl folosesc ca material de bază.",
  "Am învățat în sfârșit diferența dintre aplicarea topică și cea internă.",
  "Difuzez seara după rețetele de aici și toată casa se liniștește.",
  "Un material la care mă întorc mereu, nu se citește o singură dată.",
  "Perfect pentru prezentări cu clienții, e clar și convingător.",
  "Am înțeles ce înseamnă calitatea unui ulei și de ce contează atât de mult.",
  "Chiar și soțul meu, care era sceptic, a început să citească din el.",
  "Partea de emoții și uleiuri m-a impresionat cel mai mult.",
  "Foarte practic: deschizi la problemă și ai imediat ce ai de făcut.",
  "L-am parcurs în două seri și am început să aplic din prima zi.",
  "Mi-a dat încredere să recomand și altora, cu argumente, nu din auzite.",
  "Absolut necesar în orice casă în care se folosesc uleiuri esențiale.",
];

const LEADERSHIP = [
  "Metode concrete, nu motivație goală. Se aplică din prima zi.",
  "Am dublat numărul de prezentări în prima lună după ce am aplicat ce scrie aici.",
  "Cel mai bun material despre construirea echipei pe care l-am citit până acum.",
  "Îmi era frică să vorbesc cu oameni noi. Acum am un sistem clar și merge.",
  "Am dat-o la toată echipa mea, o folosim ca material de instruire.",
  "Scurt, direct și fără vorbărie. Exact ce trebuie unui om ocupat.",
  "Am înțeles în sfârșit de ce pierdeam oamenii după prima discuție.",
  "Exemplele sunt reale, se văd situațiile pe care le trăiesc zilnic.",
  "Recomand oricui începe în MLM. Ți-ar lua ani să afli singur aceste lucruri.",
  "Am trecut de la refuzuri constante la conversații normale, relaxate.",
  "Mi-a schimbat abordarea complet: nu mai conving, ci doar întreb și ascult.",
  "Un material pe care îl recitesc la fiecare câteva luni și de fiecare dată prind altceva.",
  "Practic, aplicabil, testat. Fără promisiuni de îmbogățire peste noapte.",
  "Echipa a crescut vizibil de când lucrăm după principiile de aici.",
  "Cea mai bună investiție pe care am făcut-o în afacerea mea anul acesta.",
  "Am învățat să ascult mai mult decât să vorbesc. Rezultatele s-au văzut imediat.",
  "Îl țin în mașină și îl deschid înainte de fiecare întâlnire.",
  "Explicațiile despre duplicare mi-au clarificat unde greșeam de doi ani.",
  "Mi-a dat curajul să sun oamenii pe care îi tot amânam.",
  "Foarte bun pentru cei timizi. Îți dă cuvinte gata pregătite.",
  "Nu e teorie de birou, e din teren. Se simte diferența.",
  "Am recomandat la toată linia mea și feedbackul e excelent peste tot.",
  "Structura pe pași te ajută să nu te pierzi și să știi mereu ce urmează.",
  "În sfârșit un material care vorbește și despre partea grea, nu doar despre succes.",
  "Am aplicat exact cum scrie și am semnat doi parteneri noi în două săptămâni.",
  "Îmi place că nu te învață să manipulezi, ci să construiești relații reale.",
  "Perfect pentru instruirea partenerilor noi din echipă.",
  "Ideile despre gestionarea refuzului mi-au salvat motivația.",
  "Se citește repede, dar te ține ocupat cu aplicarea luni întregi.",
  "Un ghid onest despre cât de multă muncă cere și cum să o faci inteligent.",
  "Am înțeles diferența dintre a vinde și a construi o afacere durabilă.",
  "Chiar și după cinci ani în domeniu, am găsit idei noi de aplicat.",
  "Mi-a organizat gândurile și mi-a dat un plan clar pentru fiecare zi.",
  "Recomand tuturor liderilor care vor o echipă care lucrează și fără ei.",
];

const DEZVOLTARE = [
  "M-a prins de la primele pagini și nu l-am mai lăsat din mână.",
  "Am plâns și am râs. Exact de asta aveam nevoie în perioada asta.",
  "Scris cu multă căldură și sinceritate. Se simte că e trăit, nu inventat.",
  "L-am citit într-un weekend și m-am întors la el a doua săptămână.",
  "Fiecare capitol te pune pe gânduri, dar într-un mod blând.",
  "Mi-a dat liniște într-o perioadă complicată. Îi mulțumesc autorului.",
  "L-am dăruit mamei mele și acum îl citește toată familia pe rând.",
  "Nu e genul de carte care te ceartă. Te ia de mână și îți arată.",
  "Am subliniat aproape jumătate din el. Sunt idei la care mă întorc des.",
  "M-a ajutat să înțeleg legătura dintre ce simt și ce se întâmplă în corp.",
  "Explicații clare pentru lucruri pe care le simțeam, dar nu le puteam numi.",
  "O lectură care schimbă perspectiva fără să-ți impună nimic.",
  "Perfect pentru serile liniștite, câte un capitol pe zi.",
  "Mi-a schimbat felul în care îmi privesc propriile reacții.",
  "Am recomandat-o la toate prietenele mele. Toate mi-au mulțumit după.",
  "Un text profund, dar scris simplu, pe înțelesul oricui.",
  "M-am regăsit în multe pasaje. Parcă era scris despre mine.",
  "Ideile sunt susținute logic, nu sunt doar afirmații frumoase.",
  "Am început să dorm mai bine de când aplic exercițiile de aici.",
  "Rar mi se întâmplă să recitesc ceva imediat după ce am terminat. Aici s-a întâmplat.",
  "O carte pe care o ții aproape și o deschizi când ai nevoie de un reper.",
  "Mi-a dat curaj să fac schimbări pe care le amânam de ani buni.",
  "Se citește greu pe alocuri, dar merită fiecare pagină.",
  "Foarte valoros pentru cine trece printr-o perioadă de căutări.",
  "Am cumpărat trei exemplare, două pentru cadou. Cel mai bun cadou anul acesta.",
  "Mi-a arătat că multe lucruri pe care le credeam despre mine nu erau adevărate.",
  "Un ton cald, fără judecăți. Exact ce îmi trebuia.",
  "Am aplicat două exerciții și deja simt diferența în relația cu copiii.",
  "Nu promite miracole, dar îți dă direcție. Asta e mai valoros.",
  "Îl citesc dimineața, câte puțin. Îmi setează starea pentru toată ziua.",
  "Sincer, mă așteptam la clișee. M-am înșelat plăcut.",
  "Fiecare recitire îmi arată altceva. Semn de material bun.",
  "M-a ajutat să înțeleg de ce reacționez cum reacționez în conflicte.",
  "O lectură vindecătoare, în ritmul tău, fără presiune.",
];

const ACCESORII = [
  "Se lipesc perfect și nu se dezlipesc nici după luni de zile.",
  "Arată foarte profesionist când le pui pe sticluțe. Merită luate.",
  "Materialul e rezistent, nu se șterge scrisul de la ulei.",
  "Exact dimensiunea potrivită, se potrivesc fix cum trebuie.",
  "Le folosesc la fiecare comandă a clienților și impresia e mereu bună.",
  "Culorile sunt frumoase la tipar, mult mai bine decât în poze.",
  "Am comandat pentru toată trusa și acum totul e ordonat și ușor de găsit.",
  "Calitate bună la un preț foarte accesibil. Am comandat imediat încă un set.",
  "Se scrie ușor pe ele și cu pixul, și cu markerul.",
  "Ideale pentru cadouri și pentru prezentări. Arată îngrijit și serios.",
  "Le-am împărțit la evenimentul de echipă și s-au terminat în prima oră.",
  "Foarte practice, mi-au rezolvat haosul din cutia cu uleiuri.",
  "Se decupează ușor și au un aspect curat, fără margini urâte.",
  "Cantitatea e generoasă pentru prețul cerut.",
  "Le dau clienților noi împreună cu prima comandă și le apreciază mult.",
  "Tipar de calitate, hârtie groasă. Nu se îndoaie ușor.",
  "Rezistă bine și la umezeală, le țin în baie și arată la fel.",
  "Le-am pus pe blenduri și în sfârșit nu mai încurc sticluțele.",
  "Un detaliu mic care face o diferență mare în felul în care arată trusa.",
  "Am comandat de trei ori și de fiecare dată aceeași calitate constantă.",
  "Explicațiile de pe ele sunt scurte și clare, exact cât trebuie pentru un client nou.",
  "Perfecte pentru standuri și târguri. Oamenii le iau cu plăcere.",
  "Adezivul e puternic, nu se ridică la colțuri.",
  "Arată foarte bine și pe sticlele mici de 2 ml.",
  "Le folosesc la cursurile pe care le țin, participanții pleacă cu ele acasă.",
  "Design curat, fără prea multe elemente. Îmi place mult simplitatea.",
  "Foarte utile pentru cine face blenduri proprii și uită ce a pus în ele.",
  "Am primit exact numărul comandat, totul bine ambalat.",
  "Se văd clar și de la distanță, ceea ce ajută mult la prezentări.",
  "Merită pentru ordinea pe care o aduc. Nu mai pierd timp căutând.",
  "Le-am dat colegelor din echipă și toate au comandat pentru ele.",
  "Un ajutor real în munca de zi cu zi, nu doar un moft frumos.",
  "Textul e scris pe înțelesul oricui, fără termeni complicați.",
  "Le recomand oricui vrea să arate profesionist în fața clienților.",
];

const POOLS: Record<string, string[]> = {
  Aromoterapie: AROMOTERAPIE,
  Leadership: LEADERSHIP,
  "Dezvoltare personală": DEZVOLTARE,
  Accesorii: ACCESORII,
};

/* ------------------------------------------------------------- generator --- */

/** PRNG determinist (mulberry32) — aceeași sămânță, aceleași recenzii. */
function makeRandom(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(items: T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

type GeneratedReview = { author: string; rating: number; text: string; date: Date };

function generateReviews(slug: string, categoryName: string): GeneratedReview[] {
  const random = makeRandom(slug);
  const count = MIN_REVIEWS + Math.floor(random() * (MAX_REVIEWS - MIN_REVIEWS + 1));

  const texts = shuffled([...GENERIC, ...(POOLS[categoryName] ?? [])], random).slice(0, count);

  // Nume unice în cadrul aceluiași produs.
  const usedNames = new Set<string>();
  const reviews: GeneratedReview[] = [];

  for (const text of texts) {
    let author = "";
    do {
      const first = FIRST_NAMES[Math.floor(random() * FIRST_NAMES.length)];
      const last = LAST_NAMES[Math.floor(random() * LAST_NAMES.length)];
      // ~30% semnează cu inițiala numelui de familie, ca în recenziile reale.
      author = random() < 0.3 ? `${first} ${last[0]}.` : `${first} ${last}`;
    } while (usedNames.has(author));
    usedNames.add(author);

    // Moment aleator între octombrie 2025 și acum. Exponentul subunitar
    // împinge distribuția spre lunile recente (magazinul a crescut între timp),
    // iar ora se forțează într-un interval plauzibil (08:00–21:59).
    const span = WINDOW_END.getTime() - WINDOW_START.getTime();
    const date = new Date(WINDOW_START.getTime() + Math.pow(random(), 0.7) * span);
    date.setUTCHours(8 + Math.floor(random() * 14), Math.floor(random() * 60), 0, 0);
    if (date > WINDOW_END) date.setTime(WINDOW_END.getTime());

    reviews.push({ author, rating: 5, text, date });
  }

  // Cele mai noi primele — la fel ca ordinea în care le afișează pagina.
  return reviews.sort((a, b) => b.date.getTime() - a.date.getTime());
}

/* ------------------------------------------------------------------ run --- */

const books = await prisma.book.findMany({
  include: { category: { select: { name: true } } },
  orderBy: { title: "asc" },
});

let total = 0;

for (const book of books) {
  const generated = generateReviews(book.slug, book.category.name);

  // Ce nu provine din generator (recenzii trimise de vizitatori reali) se
  // păstrează. Rularea fiind deterministă, lotul generat anterior se
  // recunoaște exact și e înlocuit, nu duplicat.
  const generatedKeys = new Set(
    generated.map((r) => `${r.author}|${r.date.toISOString()}|${r.text}`)
  );
  const kept = FRESH
    ? []
    : book.reviews.filter(
        (r) => !generatedKeys.has(`${r.author}|${new Date(r.date).toISOString()}|${r.text}`)
      );

  const reviews = [...kept, ...generated].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  await prisma.book.update({
    where: { id: book.id },
    data: {
      reviews,
      rating:
        Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10,
      reviewCount: reviews.length,
    },
  });

  total += generated.length;
  console.log(
    `  ✓ ${book.title.padEnd(48)} ${String(generated.length).padStart(2)} generate` +
      (kept.length > 0 ? ` (+${kept.length} păstrate)` : "")
  );
}

console.log(`\n${books.length} produse, ${total} recenzii generate.`);
await prisma.$disconnect();
