import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import { checkRateLimit, resetRateLimit, fingerprintFromRequest, hashKey } from "@/lib/rate-limit";

/**
 * Protecția împotriva ghicirii parolei prin încercări repetate.
 *
 * Panoul de admin are o singură apărare — parola — și e expus public la
 * /admin/login. Fără limitare, un script poate încerca mii de parole pe minut.
 * Contorul stă în MongoDB (vezi lib/rate-limit.ts), nu în memorie: pe serverless
 * fiecare instanță are propria memorie, deci un contor local n-ar limita nimic.
 *
 * Limităm pe DOUĂ chei deodată:
 * - pe IP, împotriva unui atacator care încearcă multe parole;
 * - pe adresa de email, împotriva unui atac distribuit pe mai multe IP-uri, care
 *   ar ocoli prima limită.
 *
 * Contorul se șterge la o autentificare reușită, ca un admin care doar a greșit
 * parola de câteva ori să nu rămână blocat după ce intră.
 */
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS_PER_IP = 10;
const MAX_ATTEMPTS_PER_EMAIL = 6;

/**
 * Hash de unică folosință cu care comparăm când adresa nu există în baza de
 * date. Fără el, un email inexistent ar răspunde vizibil mai repede decât unul
 * existent (bcrypt durează intenționat), iar diferența de timp ar spune
 * atacatorului care adrese sunt reale.
 */
const DUMMY_HASH = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Parolă", type: "password" },
      },
      async authorize(credentials, request) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const normalizedEmail = email.trim().toLowerCase();
        const ipKey = `admin-login:ip:${fingerprintFromRequest(request)}`;
        const emailKey = `admin-login:email:${hashKey(normalizedEmail)}`;

        const [byIp, byEmail] = await Promise.all([
          checkRateLimit(ipKey, { limit: MAX_ATTEMPTS_PER_IP, windowMs: LOGIN_WINDOW_MS }),
          checkRateLimit(emailKey, { limit: MAX_ATTEMPTS_PER_EMAIL, windowMs: LOGIN_WINDOW_MS }),
        ]);

        // Răspuns identic cu „parolă greșită": nu confirmăm atacatorului nici că
        // a nimerit o adresă reală, nici că a declanșat limitarea.
        if (!byIp.ok || !byEmail.ok) {
          console.warn("[auth] prea multe incercari de autentificare, blocat temporar");
          return null;
        }

        const admin = await prisma.admin.findUnique({ where: { email: normalizedEmail } });

        // Comparăm mereu, chiar și când adresa nu există — vezi DUMMY_HASH.
        const isValid = await bcrypt.compare(password, admin?.password ?? DUMMY_HASH);
        if (!admin || !isValid) return null;

        await Promise.all([resetRateLimit(ipKey), resetRateLimit(emailKey)]);

        return { id: admin.id, email: admin.email };
      },
    }),
  ],
});
