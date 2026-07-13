import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Parolă", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const admin = await prisma.admin.findUnique({
          where: { email: email.trim().toLowerCase() },
        });

        if (!admin) return null;

        const isValid = await bcrypt.compare(password, admin.password);
        if (!isValid) return null;

        return { id: admin.id, email: admin.email };
      },
    }),
  ],
});
