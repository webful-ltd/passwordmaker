// @ts-check
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const ionic = require('@ionic/eslint-config/recommended');

// Strip import/* rules that require external plugins, for now
const ionicTypeScriptRules = Object.fromEntries(
  Object.entries(ionic.rules)
    .filter(([ruleName]) => !ruleName.startsWith("import/"))
    .filter(([ruleName]) => ruleName === 'explicit-module-boundary-types') // for now
);

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    processor: angular.processInlineTemplates,
    rules: {
      // TODO Probably phase in on push changes soon.
      "@angular-eslint/prefer-on-push-component-change-detection": "off",
      "@angular-eslint/prefer-standalone": "off",
      "indent": ["error", 2],
      // "quotes": [2, "single", { "allowTemplateLiterals": true, "avoidEscape": true }]
      "@typescript-eslint/no-explicit-any": "off", // for now
      ...ionicTypeScriptRules,
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
    ],
    rules: {}
  }
);
