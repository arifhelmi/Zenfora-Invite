import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      ".next/**",
      ".openai/**",
      ".wrangler/**",
      "dist/**",
      "node_modules/**",
      "playwright-report/**",
      "prisma/**",
      "worker/**",
      "db/**",
      "next-env.d.ts",
      "tests/rendered-html.test.mjs",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
];
