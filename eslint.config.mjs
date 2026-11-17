import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: [".next/**", "node_modules/**", "public/**"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": "warn",
    },
  },
]);