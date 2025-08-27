// @ts-check

import { FlatCompat } from "@eslint/eslintrc";
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";
import prettierConfig from "eslint-config-prettier";

const compat = new FlatCompat();

export default tseslint.config(
  {
    ignores: [
      "lib/supabase/types.generated.ts",
      "**/.next/**",
      "node_modules/",
    ],
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...compat.extends("next/core-web-vitals"),
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      // Project-specific rule overrides for next
      "@next/next/no-img-element": "off",
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        project: ["./tsconfig.json"],
      },
    },
    rules: {
      // Project-specific rules and overrides
      "react/no-unescaped-entities": "off", // Often triggered by apostrophes in text
      "react/react-in-jsx-scope": "off", // Not needed with Next.js/React 17+
      "no-unused-vars": [
        "warn",
        { args: "all", argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type",
          ],
          pathGroups: [
            {
              pattern: "@/**",
              group: "internal",
            },
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],

      // Additional TypeScript-specific rules (often come from recommendedTypeChecked)
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/no-empty-object-type": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { allowNumber: true, allowBoolean: true },
      ],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/no-redundant-type-constituents": "off",
    },
  },
  {
    files: ["components/task-list.tsx"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/await-thenable": "off", // Specific override
      "@typescript-eslint/no-misused-promises": "off", // Specific override
    },
  },
  {
    files: [
      "jest.config.js",
      "next.config.mjs",
      "scripts/**/*.mjs",
      "scripts/**/*.js",
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-undef": "off", // Allow undefined globals like process, URL, console in Node.js scripts
      "no-unused-vars": "off", // Allow unused variables in scripts
      "no-console": "off", // Allow console in scripts
    },
  },
  {
    files: ["**/*.js", "**/*.mjs"],
    extends: [tseslint.configs.disableTypeChecked],
  },
  prettierConfig,
);
