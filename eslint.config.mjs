import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Server Actions primesc obligatoriu `prevState` ca prim parametru, chiar
      // când nu-l folosesc. Îl numim `_prev` prin convenție; fără regula asta
      // ESLint se plânge la fiecare, iar zgomotul acoperă avertismentele reale
      // (am împins de două ori cod cu eroare de lint fiindcă se pierdea în ele).
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
    },
  },
]);

export default eslintConfig;
