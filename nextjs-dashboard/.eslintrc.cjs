/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
    project: "./tsconfig.json",
  },
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  plugins: [
    "@typescript-eslint",
    "react",
    "jsx-a11y",
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:jsx-a11y/recommended",
  ],
  rules: {
    // ✅ Te deja usar any si lo necesitas, pero te avisa.
    "@typescript-eslint/no-explicit-any": "warn",
    // ✅ Marca variables sin usar, pero no rompe el build.
    "@typescript-eslint/no-unused-vars": ["warn"],
    // React y Next.js ajustes:
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    // Accesibilidad:
    "jsx-a11y/alt-text": "warn",
    "jsx-a11y/anchor-is-valid": "warn",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
