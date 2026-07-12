<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# BookStore

Magazin online de cărți, în limba română, pentru piața din Moldova. Checkout ca oaspete
(fără conturi de clienți), plată reală prin maib e-commerce API, admin panel protejat.

Proiectul se construiește în 6 faze secvențiale (vezi planul original al utilizatorului).
Faza curentă atinsă: **Faza 1 — fundație** (schemă, seed, design system, layout static).

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

- `app/` — rute App Router. Server Components implicit; adaugă `"use client"` doar unde
  chiar e nevoie de interactivitate (ex. meniul mobil, formulare cu state)
- `components/layout/` — Header, Footer, TopBar, SecondaryNav, MobileMenu, Logo etc.
- `lib/` — `prisma.ts` (singleton client), `nav-links.ts` (linkurile de navigație)
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

Fără conturi de clienți. Coșul și favoritele trăiesc exclusiv client-side, în
`localStorage` — nu există modele în baza de date pentru ele (vin la Faza 3).

### Imagini temporare (Faza 1)

Seed-ul folosește fotografii reale de pe Unsplash (`images.unsplash.com`, alocat în
`next.config.ts` → `images.remotePatterns`) ca placeholder vizual pentru coperți — nu
corespund cărților reale, sunt doar temporare. Se înlocuiesc cu imagini reale prin Vercel
Blob la Faza 5.

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
