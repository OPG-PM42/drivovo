import nx from "@nx/eslint-plugin";
import boundaries from "eslint-plugin-boundaries";
import baseConfig from "../../eslint.config.mjs";

export default [
  ...baseConfig,
  ...nx.configs["flat/angular"],
  ...nx.configs["flat/angular-template"],
  {
    // Generated OpenAPI client: skip all checks; it is hand-authored fallback
    // mirroring the typescript-angular generator output.
    ignores: ["apps/admin/src/app/infrastructure/api/generated/**"],
  },
  {
    plugins: { boundaries },
    settings: {
      "boundaries/elements": [
        { type: "domain", pattern: "apps/admin/src/app/domain/**" },
        { type: "application", pattern: "apps/admin/src/app/application/**" },
        { type: "infrastructure", pattern: "apps/admin/src/app/infrastructure/**" },
        { type: "presentation", pattern: "apps/admin/src/app/presentation/**" },
        {
          type: "composition-root",
          pattern: "apps/admin/src/app/app.config.ts",
          mode: "file",
        },
      ],
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          rules: [
            { from: "domain", allow: [] },
            { from: "application", allow: ["domain"] },
            { from: "infrastructure", allow: ["domain", "application"] },
            { from: "presentation", allow: ["domain", "application"] },
            {
              from: "composition-root",
              allow: ["domain", "application", "infrastructure", "presentation"],
            },
          ],
        },
      ],
    },
  },
  {
    files: ["apps/admin/src/app/presentation/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/application/state/auth.store*"],
              message: "Use AuthFacade instead of auth.store directly.",
            },
            {
              group: [
                "**/application/use-cases/sign-in*",
                "**/application/use-cases/sign-out*",
                "**/application/use-cases/get-current-admin*",
              ],
              message: "Use AuthFacade for auth operations, not use-cases directly.",
            },
          ],
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.property.name=/^(setAdmin|setLoading)$/]",
          message: "Do not call setAdmin or setLoading directly from presentation or use-case layer.",
        },
      ],
    },
  },
  {
    files: ["apps/admin/src/app/application/use-cases/**/*.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.property.name=/^(setAdmin|setLoading)$/]",
          message: "Do not call setAdmin or setLoading directly from presentation or use-case layer.",
        },
      ],
    },
  },
  {
    // Services in infrastructure/api/services may only import the generated barrel
    // (index.ts), never api/* or model/* internal paths directly.
    files: ["apps/admin/src/app/infrastructure/api/services/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "**/infrastructure/api/generated/api/*",
                "**/infrastructure/api/generated/model/*",
              ],
              message:
                "Import from the generated barrel (./generated) only — never from api/* or model/* internals.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.ts"],
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
      // Root config rules too strict for existing Angular code — relax at admin level
      "@typescript-eslint/typedef": "off",
      "@typescript-eslint/explicit-member-accessibility": "off",
      "@typescript-eslint/member-ordering": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },
  {
    files: ["**/*.cts", "**/*.cjs", "jest.config.*"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    files: ["**/*.spec.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: ["**/*.html"],
    rules: {
      // Taiga UI uses custom label/button components — these Angular rules produce false positives
      "@angular-eslint/template/label-has-associated-control": "off",
      "@angular-eslint/template/elements-content": "off",
    },
  },
  {
    files: ["**/*.html"],
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
      "@next/next/no-async-client-component": "off",
      "@next/next/no-before-interactive-script-outside-document": "off",
      "@next/next/no-css-tags": "off",
      "@next/next/no-head-element": "off",
      "@next/next/no-html-link-for-pages": "off",
      "@next/next/no-img-element": "off",
      "@next/next/no-page-custom-font": "off",
      "@next/next/no-script-component-in-head": "off",
      "@next/next/no-styled-jsx-in-document": "off",
      "@next/next/no-sync-scripts": "off",
      "@next/next/no-title-in-document-head": "off",
      "@next/next/no-typos": "off",
      "@next/next/no-unwanted-polyfillio": "off",
    },
  },
];
