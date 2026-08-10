import { readFileSync } from "node:fs";
for (const line of readFileSync("e:/bookstore/.env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)="?(.*?)"?\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();
const o = await prisma.order.findUnique({ where: { orderNumber: "BS-20260810-ZBDENP" } });
console.log("comanda:", o?.orderNumber);
console.log("  client :", o?.customerName, "|", o?.customerPhone);
console.log("  adresa :", o?.shippingAddress, "| bloc:", o?.building, "| ap:", o?.apartment);
console.log("  mesaj  :", o?.customerNote);
console.log("  oras   :", `${o?.city}/${o?.county}`);
console.log("  AWB    :", o?.trackingNumber ?? "LIPSA");
console.log("  fanCost:", o?.fanCost ?? "-");

if (o?.trackingNumber) {
  const res = await fetch("https://app.fancourier.md/fan/API/get_history", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ api_key: process.env.FAN_API_KEY ?? "", awbno: o.trackingNumber, full: "true" }),
  });
  const data = await res.json();
  console.log("\nla FAN: nr", data?.data?.no, "| greutate", data?.data?.invoice_weight, "| evenimente:", (data?.data?.history ?? []).map((h: {description:string}) => h.description).join(" -> "));
}
await prisma.$disconnect();
