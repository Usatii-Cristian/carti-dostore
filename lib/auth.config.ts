import type { NextAuthConfig } from "next-auth";

// Config "sigură pentru Edge" — fără Prisma/bcrypt, pentru că proxy.ts rulează
// pe Edge runtime și nu poate încărca driverul MongoDB. Providerul Credentials
// complet (cu authorize() care interoghează baza de date) trăiește doar în
// lib/auth.ts, care rulează pe Node.js (route handler, Server Components/Actions).
// Decizia de autorizare (redirect la login / 401) e implementată direct în
// proxy.ts, care citește req.auth.
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 zile
  },
  providers: [],
};
