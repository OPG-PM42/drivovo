import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";

const eslintConfig = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...nextCoreWebVitals.map((config) => ({
    ...config,
    settings: { ...config.settings, next: { rootDir: "apps/web" } },
  })),
  ...nextTypescript,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // --- General JS rules ---
      "no-bitwise": "error",
      "spaced-comment": ["error", "always"],
      "prefer-const": "error",
      "no-console": "error",
      "no-debugger": "error",
      "no-var": "error",
      "no-unused-expressions": "warn",
      "no-undef-init": "error",
      "no-eval": "error",
      "no-throw-literal": "off",
      "no-fallthrough": "error",
      "no-invalid-this": "error",
      "constructor-super": "error",
      "no-duplicate-case": "error",
      "no-cond-assign": "error",
      "no-extra-boolean-cast": "off",

      // --- TypeScript rules ---
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-use-before-define": [
        "error",
        { ignoreTypeReferences: true },
      ],
      "@typescript-eslint/consistent-indexed-object-style": "off",
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
          allowConciseArrowFunctionExpressionsStartingWithVoid: true,
        },
      ],
      "@typescript-eslint/prefer-function-type": "error",
      "@typescript-eslint/explicit-member-accessibility": [
        "error",
        {
          accessibility: "explicit",
          overrides: {
            accessors: "explicit",
            constructors: "no-public",
            methods: "explicit",
            properties: "explicit",
            parameterProperties: "explicit",
          },
        },
      ],
      "@typescript-eslint/typedef": [
        "error",
        {
          propertyDeclaration: true,
          memberVariableDeclaration: true,
          parameter: false,
          arrowParameter: false,
          variableDeclaration: false,
          objectDestructuring: false,
          arrayDestructuring: false,
        },
      ],
      "@typescript-eslint/member-ordering": [
        "error",
        {
          default: {
            memberTypes: [
              // Private fields
              "private-instance-field",
              "private-readonly-field",
              "private-static-field",

              // Protected fields
              "protected-instance-field",
              "protected-readonly-field",
              "protected-static-field",

              // Public fields
              "public-instance-field",
              "public-readonly-field",
              "public-static-field",

              // Signature
              "signature",

              // Constructors
              "public-constructor",
              "protected-constructor",
              "private-constructor",

              // Methods: public → protected → private
              "public-instance-method",
              "public-static-method",
              "protected-instance-method",
              "protected-static-method",
              "private-instance-method",
              "private-static-method",
            ],
          },
        },
      ],
    },
  },
  eslintConfigPrettier,
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/tmp/**",
      "**/coverage/**",
      "**/.next/**",
      "**/next-env.d.ts",
    ],
  },
];

export default eslintConfig;
