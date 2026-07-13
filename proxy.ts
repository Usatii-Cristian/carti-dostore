import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

// Foloseste doar config-ul Edge-safe (fara Prisma/bcrypt) — vezi lib/auth.config.ts.
const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return;

  const isLoggedIn = Boolean(req.auth?.user);

  if (pathname.startsWith("/api/")) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }
    return;
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/admin/login", req.nextUrl));
  }
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
