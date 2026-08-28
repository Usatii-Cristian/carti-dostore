import { config } from "dotenv";
config({ path: ".env.local" });
import { enqueueNotification, deliverNotification, flushNotifications } from "../lib/notifications/outbox";
import { prisma } from "../lib/prisma";
import crypto from "crypto";

async function test() {
  const dedupeKey = `test-tg-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  
  console.log("Enqueueing notification cu cheia:", dedupeKey);
  const record = await enqueueNotification({
    channel: "telegram",
    dedupeKey,
    payload: "Mesaj de test pentru a verifica conditia de cursa.",
  });
  
  if (!record) {
    console.error("Failed to enqueue.");
    return;
  }
  
  console.log("Notificare adaugata:", record.id);
  
  console.log("Triggering concurrent delivery (declansam simultan deliver si de 2 ori flush)...");
  
  await Promise.all([
    deliverNotification(record),
    flushNotifications(),
    flushNotifications()
  ]);
  
  const inDb = await prisma.notification.findUnique({
    where: { id: record.id }
  });
  
  console.log("Starea finala in DB:", inDb?.status, "| Numar incercari:", inDb?.attempts);
  
  if (inDb?.attempts === 1) {
    console.log("SUCCES: S-a facut exact 1 incercare, updateMany atomic functioneaza corect.");
  } else {
    console.log("ESEC: Mai multe incercari sau stare blocata.", inDb);
  }
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
