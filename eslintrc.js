// .eslintrc.js
module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    extends: [
      "next/core-web-vitals",
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
    ],
    overrides: [
      {
        files: ["*.ts", "*.tsx", "*.js", "*.jsx"],
        rules: {
          // your custom rules here
        },
      },
    ],
  };