import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma CLI încarcă automat doar `.env`, nu `.env.local` — îl încărcăm manual
// ca să rămânem consistenți cu convenția Next.js (vezi AGENTS.md).
loadEnv({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
