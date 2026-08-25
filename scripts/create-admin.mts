/**
 * Creează sau actualizează un cont de admin.
 *
 *   npx tsx scripts/create-admin.mts <email> <parola>
 *   npx tsx scripts/create-admin.mts --list
 *
 * Parola se stochează DOAR ca hash bcrypt (cost 12) — în baza de date nu ajunge
 * niciodată în clar. Emailul se normalizează la litere mici, fiindcă exact așa
 * îl caută `authorize()` din lib/auth.ts; un cont salvat cu majuscule n-ar mai
 * putea fi găsit la login.
 *
 * Dacă adresa există deja, scriptul îi schimbă parola (util la resetare), nu
 * creează un al doilea cont.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import bcrypt from "bcryptjs";

const { prisma } = await import("@/lib/prisma");

const [rawEmail, password] = process.argv.slice(2);

if (rawEmail === "--list") {
  const admins = await prisma.admin.findMany({ select: { email: true } });
  console.log("Conturi de admin:");
  for (const admin of admins) console.log(` · ${admin.email}`);
  await prisma.$disconnect();
  process.exit(0);
}

if (!rawEmail || !password) {
  console.error("Folosire: npx tsx scripts/create-admin.mts <email> <parola>");
  process.exit(1);
}

const email = rawEmail.trim().toLowerCase();

if (password.length < 8) {
  console.warn(
    `⚠  Parola are ${password.length} caractere. Panoul de admin e expus public la ` +
      "/admin/login, deci o parolă scurtă e apărarea principală a magazinului."
  );
}

const hashed = await bcrypt.hash(password, 12);
const existing = await prisma.admin.findUnique({ where: { email } });

await prisma.admin.upsert({
  where: { email },
  update: { password: hashed },
  create: { email, password: hashed },
});

console.log(existing ? `Parolă actualizată pentru ${email}.` : `Cont creat: ${email}.`);

await prisma.$disconnect();
process.exit(0);
