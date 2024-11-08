import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.{js,mjs,cjs,ts}"]},
  {files: ["**/*.js"], languageOptions: {sourceType: "commonjs"}},
  {languageOptions: { globals: globals.browser }},
  {
    rules: {
      "no-console": "off",
      "no-debugger": "off",
      "no-unused-vars": "off",
      "no-undef": "off",
      "no-empty": "off",
      "no-empty-function": "error",
      "no-useless-escape": "off",
      "no-useless-return": "off",
      "no-unreachable": "error",
      "prefer-const": ["error", {ignoreReadBeforeAssign: true}],
    }
  },
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/build/**", "**/coverage/**", "**/__tests__/**", "**/__mocks__/**"],
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];