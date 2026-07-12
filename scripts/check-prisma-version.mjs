// Prisma 7 nu suportă MongoDB (suport "coming soon", vezi docs.prisma.io/orm/overview/databases/mongodb).
// Acest guard rulează la postinstall și blochează instalarea dacă cineva upgradează din greșeală la Prisma 7.
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { version } = require("../node_modules/@prisma/client/package.json");

if (version.startsWith("7.")) {
  console.error(
    `\nEROARE: @prisma/client@${version} detectat. Prisma 7 NU suportă MongoDB.\n` +
      `Acest proiect trebuie să rămână pe Prisma 6.x (vezi AGENTS.md).\n` +
      `Rulează: npm install prisma@6 @prisma/client@6 --save-exact\n`
  );
  process.exit(1);
}

console.log(`OK: @prisma/client@${version} (Prisma 6.x, compatibil MongoDB)`);
