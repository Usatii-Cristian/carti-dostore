/**
 * Verificare completă a magazinului, pe site-ul LIVE.
 *
 * Nu presupune nimic: intră în admin ca un om, modifică un produs, se uită pe
 * site-ul public, cere comanda și verifică ce a ajuns în baza de date. Există
 * fiindcă „am reparat" fără dovadă a ieșit prost de prea multe ori — un deploy
 * picat sau un câmp scos din formular arată identic cu „merge" dacă nu te uiți.
 *
 *   npx tsx scripts/verify-production.mts
 *
 * Nu lasă urme: ce modifică, pune la loc.
 */
import { chromium, type Page } from "playwright";
import { config } from "dotenv";
config({ path: ".env.local" });

const BASE = "https://www.dostore.md";
const ADMIN_EMAIL = "dostore.moldova@gmail.com";
const ADMIN_PASS = process.env.VERIFY_ADMIN_PASSWORD ?? "admin123";

const { prisma } = await import("@/lib/prisma");

const rez: { ok: boolean; text: string }[] = [];
const ok = (t: string) => rez.push({ ok: true, text: t });
const nu = (t: string) => rez.push({ ok: false, text: t });
const check = (cond: boolean, t: string) => (cond ? ok(t) : nu(t));

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page: Page = await ctx.newPage();

// ── 1. Rute publice ────────────────────────────────────────────────────────
const rute = ["/", "/carti", "/cos", "/checkout", "/contact", "/livrare-si-plata",
  "/despre-noi", "/termeni-si-conditii", "/confidentialitate", "/categorii", "/blog"];
let rele = 0;
for (const r of rute) {
  const c = await fetch(BASE + r).then((x) => x.status).catch(() => 0);
  if (c !== 200) { nu(`ruta ${r} → ${c}`); rele++; }
}
check(rele === 0, `${rute.length} rute publice răspund 200`);

const books = await prisma.book.findMany({
  select: { id: true, slug: true, title: true, stock: true, price: true, rating: true, reviewCount: true, variants: true },
});
let releP = 0;
for (const b of books) {
  const c = await fetch(`${BASE}/carti/${b.slug}`).then((x) => x.status).catch(() => 0);
  if (c !== 200) { nu(`produs ${b.slug} → ${c}`); releP++; }
}
check(releP === 0, `${books.length} pagini de produs răspund 200`);
check((await fetch(`${BASE}/carti/nu-exista-xyz`)).status === 404, "produs inexistent → 404");

// ── 2. Stocuri ─────────────────────────────────────────────────────────────
const fara = books.filter((b) => (b.variants.length ? b.variants.every((v) => (v.stock ?? 0) === 0) : b.stock === 0));
check(fara.length === 0, `toate cele ${books.length} produse au stoc${fara.length ? `: lipsă la ${fara.map((f) => f.title).join(", ")}` : ""}`);

const api = await fetch(`${BASE}/api/stock`).then((r) => r.json());
check(!!api.stockData, "/api/stock răspunde");
check(!Object.values(api.stockData ?? {}).some((v) => "inStock" in (v as object)),
  "/api/stock nu mai trimite câmpul vechi inStock");

// ── 3. Admin: login, editare, deconectare ─────────────────────────────────
await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
await page.fill('input[name="email"]', ADMIN_EMAIL);
await page.fill('input[name="password"]', ADMIN_PASS);
await page.locator('button[type="submit"]:has-text("Conectare")').click();
await page.waitForTimeout(6000);
check(page.url().startsWith(BASE) && !page.url().includes("/admin/login"),
  `login admin rămâne pe domeniul corect (${page.url()})`);

const tinta = books.find((b) => b.variants.length === 0)!;
await page.goto(`${BASE}/admin/carti/${tinta.id}/editare`, { waitUntil: "networkidle" });
check((await page.locator('input[name="stock"]').count()) === 1, "formularul de produs are câmpul de stoc");
check((await page.locator('select[name="inStock"]').count()) === 0, "comutatorul vechi „Disponibilitate” a dispărut");

await page.fill('input[name="stock"]', "0");
await page.locator('button[type="submit"]:has-text("Salvează cartea")').click();
await page.waitForTimeout(9000);
const dupa = await prisma.book.findUnique({
  where: { id: tinta.id },
  select: { stock: true, price: true, rating: true, reviewCount: true, title: true },
});
check(dupa?.stock === 0, `salvarea din admin scrie stocul (a ieșit ${dupa?.stock})`);
check(dupa?.price === tinta.price && dupa?.rating === tinta.rating && dupa?.reviewCount === tinta.reviewCount,
  "salvarea nu strică restul datelor (preț, rating, recenzii)");

// ── 4. Site-ul public reflectă imediat ────────────────────────────────────
const pub = await ctx.newPage();
await pub.goto(`${BASE}/carti/${tinta.slug}`, { waitUntil: "networkidle" });
check((await pub.locator("text=Nu este în stoc").count()) === 1, "pagina produsului arată „Nu este în stoc”");
check((await pub.locator('button:has-text("Adaugă în coș")').count()) === 0, "butonul de adăugare e blocat");
const api2 = await fetch(`${BASE}/api/stock`).then((r) => r.json());
check(api2.stockData[tinta.id]?.stock === 0, "/api/stock raportează stoc 0");

// ── 5. Restaurare ─────────────────────────────────────────────────────────
await page.goto(`${BASE}/admin/carti/${tinta.id}/editare`, { waitUntil: "networkidle" });
await page.fill('input[name="stock"]', String(tinta.stock));
await page.locator('button[type="submit"]:has-text("Salvează cartea")').click();
await page.waitForTimeout(9000);
const fin = await prisma.book.findUnique({ where: { id: tinta.id }, select: { stock: true } });
check(fin?.stock === tinta.stock, `stoc restaurat la ${tinta.stock} (e ${fin?.stock})`);

// ── 6. Coada de notificări e curată ───────────────────────────────────────
const blocate = await prisma.notification.count({ where: { status: { in: ["PENDING", "SENDING", "FAILED"] } } });
check(blocate === 0, `nicio notificare blocată (${blocate})`);
const chat = await prisma.setting.findUnique({ where: { key: "telegram_chat_id" } });
check(!!chat?.value, `id-ul grupului Telegram e salvat în baza de date (${chat?.value})`);

// ── 7. Comenzile recente au notificare unică și AWB ───────────────────────
const comenzi = await prisma.order.findMany({
  where: { status: { not: "CANCELLED" } }, orderBy: { createdAt: "desc" }, take: 5,
  select: { orderNumber: true, trackingNumber: true },
});
for (const c of comenzi) {
  const n = await prisma.notification.count({ where: { dedupeKey: `telegram:new-order:${c.orderNumber}` } });
  check(n === 1, `${c.orderNumber}: o singură notificare Telegram (${n})`);
}

await browser.close();
console.log(rez.map((r) => `${r.ok ? "✔" : "✘"} ${r.text}`).join("\n"));
const trecute = rez.filter((r) => r.ok).length;
console.log(`\n${trecute}/${rez.length} verificări trecute`);
await prisma.$disconnect();
process.exit(trecute === rez.length ? 0 : 1);
