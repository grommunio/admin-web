import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["build/", "dist/", "public/", "node_modules/"]),
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      react.configs.flat.recommended,
      react.configs.flat["jsx-runtime"],
    ],
    plugins: {
      "react-hooks": reactHooks,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: globals.browser,
    },
    // "detect" is not supported by eslint-plugin-react on ESLint 10
    settings: { react: { version: "19.2" } },
    rules: {
      indent: ["warn", 2],
      "linebreak-style": ["error", "unix"],
      quotes: "off",
      semi: "off",
      "@typescript-eslint/no-explicit-any": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "error",
      // Props are typed with TypeScript
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
    },
  },
  {
    files: ["*.{js,cjs,ts}"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: { globals: globals.node },
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
]);
