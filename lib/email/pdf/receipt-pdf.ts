import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import { formatShippingAddress } from "@/lib/orders/address";
import type { PaymentReceiptData } from "@/lib/email/templates/PaymentReceiptEmail";

/**
 * Bonul electronic ca PDF, atașat la emailul de după plată.
 *
 * De ce PDF pe lângă emailul HTML: clientul are nevoie de un document pe care
 * să-l poată salva, printa sau trimite mai departe (contabilitate, garanție),
 * nu doar de un mesaj în inbox.
 *
 * Fonturile sunt încorporate din repo (DejaVu Sans): fonturile implicite din
 * PDFKit sunt WinAnsi și n-au ă/â/î/ș/ț, deci textul românesc ar ieși stricat.
 * Fișierele sunt incluse explicit în bundle-ul de pe Vercel — vezi
 * `outputFileTracingIncludes` din next.config.ts.
 */

const FONTS = path.join(process.cwd(), "lib/email/pdf/fonts");
const REGULAR = path.join(FONTS, "DejaVuSans.ttf");
const BOLD = path.join(FONTS, "DejaVuSans-Bold.ttf");
const MIA_LOGO = path.join(process.cwd(), "public/plati/mia-logo.png");
const SHOP_LOGO = path.join(process.cwd(), "public/logo-nou.png");

const NAVY = "#16283f";
const TERRACOTTA = "#b0512f";
const INK = "#1f2937";
const INK_SOFT = "#6b7280";
const LINE = "#e5e0d8";

const SELLER = {
  brand: "Dostore Cărți",
  company: "Free Life SRL",
  fiscalCode: "1025600059594",
  iban: "MD46VI022511400000572MDL, VictoriaBank",
  email: "dostore.moldova@gmail.com",
  phone: "+373 68 812 853",
  site: "www.dostore.md",
};

const DATE_TIME = new Intl.DateTimeFormat("ro-RO", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Chisinau",
});

const lei = (value: number) =>
  `${value.toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} lei`;

/** Citește un fișier opțional (logo). Lipsa lui nu trebuie să strice bonul. */
function readOptional(file: string): Buffer | null {
  try {
    return readFileSync(file);
  } catch {
    return null;
  }
}

export async function buildReceiptPdf(receipt: PaymentReceiptData): Promise<Buffer> {
  // `font: REGULAR` din construcție: altfel PDFKit pornește pe Helvetica și
  // citește fișierele .afm din node_modules, care nu ajung în bundle-ul de pe
  // Vercel — generarea crăpa în producție cu ENOENT.
  const doc = new PDFDocument({ size: "A4", margin: 48, font: REGULAR, info: {
    Title: `Bon electronic ${receipt.orderNumber}`,
    Author: SELLER.company,
    Subject: "Confirmare de plată",
  } });

  doc.registerFont("body", REGULAR);
  doc.registerFont("bold", BOLD);
  doc.font("body");

  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const width = right - left;

  // ── Antet ────────────────────────────────────────────────────────────────
  const shopLogo = readOptional(SHOP_LOGO);
  if (shopLogo) doc.image(shopLogo, left, 44, { width: 38 });

  doc.font("bold").fontSize(17).fillColor(NAVY).text(SELLER.brand, left + (shopLogo ? 48 : 0), 50);
  doc.font("body").fontSize(9).fillColor(INK_SOFT).text(SELLER.site, left + (shopLogo ? 48 : 0), 72);

  doc.font("bold").fontSize(15).fillColor(TERRACOTTA).text("BON ELECTRONIC", left, 48, {
    width,
    align: "right",
  });
  doc
    .font("body")
    .fontSize(9.5)
    .fillColor(INK)
    .text(`Comanda ${receipt.orderNumber}`, left, 70, { width, align: "right" })
    .fillColor(INK_SOFT)
    .text(DATE_TIME.format(new Date(receipt.paidAt)), left, 84, { width, align: "right" });

  doc.moveTo(left, 106).lineTo(right, 106).lineWidth(1).strokeColor(LINE).stroke();

  // ── Vânzător / Cumpărător ────────────────────────────────────────────────
  const colGap = 24;
  const colWidth = (width - colGap) / 2;
  const blockTop = 124;

  doc.font("bold").fontSize(8.5).fillColor(INK_SOFT).text("VÂNZĂTOR", left, blockTop);
  doc.font("bold").fontSize(11).fillColor(INK).text(SELLER.company, left, blockTop + 14);
  doc
    .font("body")
    .fontSize(9.5)
    .fillColor(INK_SOFT)
    .text(`Cod fiscal: ${SELLER.fiscalCode}`, left, blockTop + 30, { width: colWidth })
    .text(`IBAN: ${SELLER.iban}`, { width: colWidth })
    .text(`${SELLER.phone} · ${SELLER.email}`, { width: colWidth });

  const buyerX = left + colWidth + colGap;
  doc.font("bold").fontSize(8.5).fillColor(INK_SOFT).text("CUMPĂRĂTOR", buyerX, blockTop);
  doc.font("bold").fontSize(11).fillColor(INK).text(receipt.customerName, buyerX, blockTop + 14);
  doc
    .font("body")
    .fontSize(9.5)
    .fillColor(INK_SOFT)
    .text(`${formatShippingAddress(receipt)}, ${receipt.city}`, buyerX, blockTop + 30, {
      width: colWidth,
    })
    .text(`${receipt.customerPhone} · ${receipt.customerEmail}`, { width: colWidth });

  // ── Plata ────────────────────────────────────────────────────────────────
  let y = Math.max(doc.y, blockTop + 76) + 16;
  doc.roundedRect(left, y, width, 66, 6).fillColor("#f7f3ec").fill();

  const miaLogo = readOptional(MIA_LOGO);
  if (miaLogo) doc.image(miaLogo, right - 96, y + 12, { width: 84 });

  doc.font("bold").fontSize(8.5).fillColor(INK_SOFT).text("PLATĂ", left + 14, y + 12);
  doc
    .font("bold")
    .fontSize(10.5)
    .fillColor(INK)
    .text("MIA Plăți Instant (MIA Instant Payments)", left + 14, y + 25, { width: width - 120 });
  doc
    .font("body")
    .fontSize(8)
    .fillColor(INK_SOFT)
    .text(
      receipt.paymentReference
        ? `Referința tranzacției: ${receipt.paymentReference}`
        : "Plată confirmată de bancă",
      left + 14,
      y + 41,
      { width: width - 120 }
    );

  y += 84;

  // ── Tabelul produselor ───────────────────────────────────────────────────
  const cols = {
    name: left + 6,
    qty: left + width - 200,
    unit: left + width - 150,
    total: left + width - 70,
  };

  doc.rect(left, y, width, 22).fillColor(NAVY).fill();
  doc.font("bold").fontSize(8.5).fillColor("#ffffff");
  doc.text("PRODUS", cols.name, y + 7, { width: cols.qty - cols.name - 10 });
  doc.text("CANT.", cols.qty, y + 7, { width: 40, align: "right" });
  doc.text("PREȚ", cols.unit, y + 7, { width: 70, align: "right" });
  doc.text("VALOARE", cols.total, y + 7, { width: 64, align: "right" });
  y += 22;

  doc.font("body").fontSize(9.5);
  for (const item of receipt.items) {
    const nameWidth = cols.qty - cols.name - 10;
    const nameHeight = doc.heightOfString(item.title, { width: nameWidth });
    const rowHeight = Math.max(nameHeight + 12, 26);

    doc.fillColor(INK).text(item.title, cols.name, y + 6, { width: nameWidth });
    doc.fillColor(INK_SOFT).text(String(item.quantity), cols.qty, y + 6, { width: 40, align: "right" });
    doc.text(lei(item.price), cols.unit, y + 6, { width: 70, align: "right" });
    doc
      .font("bold")
      .fillColor(INK)
      .text(lei(item.price * item.quantity), cols.total, y + 6, { width: 64, align: "right" })
      .font("body");

    y += rowHeight;
    doc.moveTo(left, y).lineTo(right, y).strokeColor(LINE).lineWidth(0.6).stroke();
  }

  // ── Totaluri ─────────────────────────────────────────────────────────────
  y += 12;
  const totalsX = left + width - 260;
  const labelWidth = 150;
  const valueWidth = 110;

  const totalRow = (label: string, value: string, strong = false) => {
    doc
      .font(strong ? "bold" : "body")
      .fontSize(strong ? 12 : 10)
      .fillColor(strong ? INK : INK_SOFT)
      .text(label, totalsX, y, { width: labelWidth, align: "right" })
      .fillColor(strong ? TERRACOTTA : INK)
      .text(value, totalsX + labelWidth, y, { width: valueWidth, align: "right" });
    y += strong ? 22 : 16;
  };

  totalRow("Produse", lei(receipt.subtotal));
  totalRow("Livrare prin curier", lei(receipt.shippingCost));
  doc
    .moveTo(totalsX, y + 2)
    .lineTo(right, y + 2)
    .strokeColor(LINE)
    .stroke();
  y += 10;
  totalRow("TOTAL ACHITAT", lei(receipt.total), true);

  // ── Notă de subsol ───────────────────────────────────────────────────────
  y += 14;
  doc
    .font("body")
    .fontSize(8.5)
    .fillColor(INK_SOFT)
    .text(
      "Documentul confirmă plata efectuată prin MIA Plăți Instant și ține loc de bon electronic al " +
        "cumpărăturii. Produsele se livrează prin curier, la adresa indicată mai sus. Dacă ai nevoie de " +
        `factură fiscală pe persoană juridică, scrie-ne la ${SELLER.email} cu datele firmei.`,
      left,
      y,
      { width, align: "left" }
    );

  doc.end();
  return done;
}
