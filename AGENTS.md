<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# BookStore

Magazin online de cărți, în limba română, pentru piața din Moldova. Checkout ca oaspete
(fără conturi de clienți), plată reală prin maib e-commerce API, admin panel protejat.

Proiectul s-a construit în 6 faze secvențiale (vezi planul original al utilizatorului).
Toate cele 6 faze sunt complete: fundație, catalog, căutare/coș/favorite, checkout+maib,
admin panel, și **Faza 6 — polish final** (responsive, loading/empty/error states,
performanță, SEO, accesibilitate, verificare E2E completă).

## Stack tehnic

- Next.js 16.x, App Router, TypeScript, ESLint, Tailwind CSS v4 (config CSS-first, `@theme`
  în `app/globals.css` — nu există `tailwind.config.*`)
- FĂRĂ director `src/` — foldere direct la rădăcină (`app/`, `components/`, `lib/`, `prisma/`)
- FĂRĂ React Compiler — rămâne dezactivat, nu-l activa în `next.config.ts`
- Node.js 20+ necesar (testat pe Node 24)
- Import alias `@/*`

### Bază de date — MongoDB + Prisma 6 (NU Prisma 7)

Folosim MongoDB (Atlas) cu Prisma ca ORM. **Prisma 7 NU suportă MongoDB** — suportul e
„coming soon" oficial, confirmat pe docs.prisma.io/orm/overview/databases/mongodb. Din
această cauză:

- `prisma` și `@prisma/client` sunt fixate explicit la `6.19.3` (`--save-exact`), niciodată
  `@latest`
- Există un guard la `postinstall` (`scripts/check-prisma-version.mjs`) care aruncă eroare
  dacă `@prisma/client` ajunge vreodată pe versiunea `7.x` — dacă vezi această eroare, NU
  face upgrade, rulează în schimb `npm install prisma@6 @prisma/client@6 --save-exact`
- Configurația Prisma stă în `prisma.config.ts` (nu în `package.json#prisma`, care e
  deprecat de la Prisma 6.19+); acesta încarcă manual `.env.local` (Prisma CLI nu-l
  citește automat, doar `.env`)
- CLI-ul Prisma va afișa un nag de update la fiecare rulare ("Update available 6.19.3 ->
  7.x") — e normal, ignoră-l

## Structura folderelor și convenții

- `app/(site)/` — tot magazinul public (homepage, catalog, coș, checkout etc.), cu propriul
  root layout (`app/(site)/layout.tsx`: fonturi Playfair+Inter, Header, Footer,
  StoreHydration)
- `app/admin/` — panoul de admin, cu **propriul root layout separat**
  (`app/admin/layout.tsx`: doar Inter, fără Header/Footer public). Vezi „Două root layout-uri"
  mai jos — e intenționat, nu o greșeală.
  - `app/admin/login/` — pagina de login, PUBLICĂ (în afara grupului `(protected)`)
  - `app/admin/(protected)/` — dashboard, cărți, categorii, comenzi — protejate de `proxy.ts`
- `app/api/` — route handlers (auth, upload, callback maib, sugestii căutare) — nu sunt
  afectate de root layout-uri, indiferent unde stau în `app/`
- Server Components implicit peste tot; adaugă `"use client"` doar unde chiar e nevoie de
  interactivitate
- `components/layout/` — Header, Footer public. `components/admin/` — sidebar, formulare,
  upload, tot ce e specific panoului de admin
- `lib/` — `prisma.ts` (singleton client), `auth.ts` + `auth.config.ts` (vezi mai jos),
  `slugify.ts`, `store/` (Zustand: coș, favorite), `actions/` (Server Actions), `admin/`
  (interogări specifice panoului de admin)
- `prisma/` — `schema.prisma`, `seed.ts`
- `scripts/` — utilitare de build/install (ex. guard-ul de versiune Prisma)

### Design system

Paletă caldă de librărie, definită ca variabile CSS/`@theme` în `app/globals.css` (nu
culori Tailwind hardcodate): `cream`/`cream-soft` (fundal), `card` (carduri), `navy`/
`navy-dark` (header, navigație), `terracotta`/`terracotta-dark` (CTA), `gold` (rating,
accente), `ink`/`ink-soft` (text). Fonturi din `next/font/google`: Playfair Display
(`font-serif`, titluri) + Inter (`font-sans`, text), expuse ca `--font-playfair` /
`--font-inter` și mapate în `@theme inline`.

### Coș și favorite

Fără conturi de clienți. Coșul și favoritele trăiesc exclusiv client-side, în `localStorage`
(store-uri Zustand în `lib/store/`, cu `persist` + `skipHydration: true` — rehidratate manual
în `components/providers/StoreHydration.tsx` ca să evităm hydration mismatch) — nu există
modele în baza de date pentru ele.

### Imagini

Seed-ul (Faza 1) folosește fotografii reale de pe Unsplash (`images.unsplash.com`, alocat în
`next.config.ts` → `images.remotePatterns`) ca placeholder vizual pentru coperți — nu
corespund cărților reale, sunt doar temporare. Cărțile adăugate/editate din admin (Faza 5)
încarcă imagini reale prin Vercel Blob (`*.public.blob.vercel-storage.com`, alocat tot în
`images.remotePatterns`) — vezi `app/api/admin/upload/route.ts` +
`components/admin/ImageUploader.tsx`.

### Autentificare admin — NextAuth v5 (beta) + două fișiere de config

`next-auth@beta` (v5), nu v4 — v5 e gândit pentru App Router (`auth()` universal în Server
Components/Actions/Route Handlers/proxy), v4 e doar un shim pentru App Router. La data
scrierii, v5 era încă pe tag `beta` în npm (nu `latest`) — normal, nu e o greșeală de
instalare.

**De ce doi fișiere de config** (`lib/auth.config.ts` + `lib/auth.ts`): `proxy.ts` (vezi mai
jos) rulează pe **Edge runtime**, care nu poate încărca driverul MongoDB al Prisma. Dacă
`Credentials({ authorize: ... })` (care importă `bcryptjs` + `prisma`) e definit în același
obiect de config pe care-l importă `proxy.ts`, tot graful de importuri (inclusiv MongoDB
driver-ul) se bundle-uiește pentru Edge și crapă la runtime cu erori de tipul
`Module not found: Can't resolve './query_engine_bg.wasm'`. Soluția:
- `lib/auth.config.ts` — config Edge-safe: `pages`, `session`, `providers: []` (fără
  Credentials). **Nu adăuga niciodată aici un provider cu `authorize()` care atinge baza de
  date.**
- `lib/auth.ts` — config complet, cu `Credentials({ authorize: ... })` (Prisma + bcrypt).
  Rulează doar pe Node.js (route handler-ul din `app/api/auth/[...nextauth]/route.ts`,
  Server Components, Server Actions).

### `proxy.ts` (NU `middleware.ts`) — protecția rutelor `/admin/*`

Next.js 16 a redenumit Middleware în **Proxy**: fișierul se numește `proxy.ts` (la rădăcină,
lângă `next.config.ts`), cu export numit `proxy` (sau default), nu `middleware`. Un fișier
`middleware.ts` vechi mai pornește dev server-ul dar Next avertizează că e deprecat — dacă
vezi acel warning, verifică că n-a reapărut din greșeală.

**Important**: `auth((req) => { ... })` (înfășurarea proprie peste `auth`) NU rulează automat
callback-ul `authorized` din config — dacă vrei logica de redirect/401, trebuie scrisă direct
în callback-ul dat lui `auth(...)`, folosind `req.auth` și `req.nextUrl`. Exact așa arată
`proxy.ts` acum; nu „simplifica" la `export { auth as proxy }` fără să retestezi manual că un
request neautentificat chiar primește redirect (am avut exact acest bug: pagina se randa cu
200 în loc de redirect, pentru că `authorized` nu se apela).

Matcher-ul acoperă și `/api/admin/:path*` (ex. upload-ul de imagini) — pentru cereri către
`/api/*` fără sesiune, `proxy.ts` răspunde cu 401 JSON, nu redirect (altfel un `fetch()` din
client ar urma redirectul spre pagina HTML de login și ar primi un 200 confuz în loc de eroare).

### Gotcha: fișierele `"use server"` pot exporta DOAR funcții async

Orice `export` dintr-un fișier cu `"use server"` la începutul lui (ex.
`lib/actions/admin-books.ts`) trebuie să fie o funcție async — inclusiv obiecte simple gen
`export const initialState = { status: "idle" }` sunt interzise și crapă la runtime cu
„A 'use server' file can only export async functions, found object". Tipurile TypeScript
(`export type X = ...`) sunt OK (se elimină la compilare, nu ajung în bundle-ul runtime).
Dacă un formular client are nevoie de o stare inițială, definește constanta direct în
componenta client, nu în fișierul de acțiuni.

### Gotcha: paginile statice (○) nu se revalidează singure la modificări din admin

Rutele fără API dinamic (`/`, `/carti/bestsellers`, `/carti/noutati`, `/carti/recomandate`,
`/carti/reduceri`, `/categorii`) sunt prerandate static la build (○ în output-ul `next build`)
și NU se actualizează automat când admin-ul creează/editează/șterge o carte sau categorie —
asta apare DOAR în `next build`/`next start`, nu în `next dev` (unde totul e randat on-demand,
deci bug-ul e invizibil în dezvoltare). Soluția: fiecare Server Action de mutație din
`lib/actions/admin-books.ts` și `lib/actions/admin-categories.ts` (create/update/delete) cheamă
`revalidatePath("/", "layout")` pe lângă `revalidatePath("/admin/...")` — asta invalidează tot
subarborele de layout public, inclusiv paginile statice. Dacă adaugi o mutație nouă în admin
care afectează date afișate public, nu uita acest apel.

### Gotcha: `loading.tsx` pe o rută care poate apela `notFound()` produce 200 în loc de 404

`loading.tsx` creează un Suspense boundary la nivel de rută — Next.js începe să transmită
răspunsul HTTP cu status 200 înainte ca `notFound()` să apuce să schimbe statusul, deci
rezultă un „soft 404": body-ul corect (pagina custom 404), dar `HTTP/1.1 200 OK`. Vizibil
doar în build de producție (`curl -i`), nu în `next dev`. De-asta `/carti/[slug]` și
`/carti/categorie/[slug]` (care pot apela `notFound()`) NU au `loading.tsx` — folosesc alt
mecanism de loading state (skeleton randat direct în pagină, nu prin fișier `loading.tsx`).
Păstrează `loading.tsx` doar pe rute care nu pot 404 (`/cautare`, `/carti/bestsellers`,
`/carti/noutati`, `/carti/recomandate`, `/carti/reduceri`, `/categorii`).

### Gotcha: `UntrustedHost` la `next start` local sau pe hosting non-Vercel

NextAuth v5 (`@auth/core`) decide dacă are încredere în header-ul `Host` verificând DOAR
`AUTH_URL` / `AUTH_TRUST_HOST` / `VERCEL` / `CF_PAGES` / `NODE_ENV !== "production"` — NU
citește `NEXTAUTH_URL` pentru asta. Pe Vercel funcționează automat (variabila `VERCEL` e
setată), dar la `next start` local sau pe alt hosting fără aceste variabile, orice
autentificare eșuează silențios cu `[auth][error] UntrustedHost`. De asta `lib/auth.config.ts`
setează explicit `trustHost: true` — nu-l scoate crezând că e redundant cu `NEXTAUTH_URL`.

## Comenzi

```
npm run dev            # server de dezvoltare (Turbopack)
npm run build           # build de producție
npm run lint             # ESLint
npx prisma generate      # regenerează Prisma Client din schema.prisma
npm run prisma:push      # sincronizează schema cu MongoDB Atlas (prisma db push)
npm run prisma:seed      # populează baza de date (categorii, cărți, admin)
```

`prisma generate` rulează automat la `postinstall` (după guard-ul de versiune).
