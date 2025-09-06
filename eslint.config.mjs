module.exports = {
  parser: "@typescript-eslint/parser", // if you're using TypeScript
  plugins: ["@typescript-eslint"],
  extends: [
    "next/core-web-vitals", // for Next.js projects
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  overrides: [
    {
      files: ["*.js", "*.jsx", "*.ts", "*.tsx"],
      rules: {
        // your rules here
      },
    },
  ],
};