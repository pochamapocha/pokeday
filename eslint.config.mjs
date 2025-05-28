import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint-define-config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      "no-unused-vars": "warn",    // ✅ 将未使用变量改为警告
      "no-console": "off",         // 可选：允许使用 console
      "no-debugger": "warn"        // 可选：调试语句为警告
    }
  }
]);
