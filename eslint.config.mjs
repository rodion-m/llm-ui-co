import js from "@eslint/js";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import eslintPluginAstro from "eslint-plugin-astro";
import preferArrow from "eslint-plugin-prefer-arrow";
import reactRecommended from "eslint-plugin-react/configs/recommended.js";
import globals from "globals";
const astroRecommended = eslintPluginAstro.configs["flat/recommended"];

const wwwFolder = "apps/www";

export default [
  {
    ignores: [
      `${wwwFolder}/{public,dist,.vercel,.astro}/**/*`,
      `${wwwFolder}/src/components/Posthog.astro`,
    ],
  },
  {
    files: [`${wwwFolder}/**/*.{ts,tsx}`],
    plugins: {
      "@typescript-eslint": typescriptPlugin,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: `${wwwFolder}/tsconfig.json`,
        sourceType: "module",
        ecmaVersion: 2020,
      },
    },
  },
  {
    files: [`${wwwFolder}/**/*.{jsx,tsx}`],
    ...reactRecommended,
    languageOptions: {
      ...reactRecommended.languageOptions,
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      ...reactRecommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
  {
    files: [`${wwwFolder}/**/*.{js,jsx,mjs,cjs,ts,tsx}`],
    ...js.configs.recommended,
    plugins: {
      "prefer-arrow": preferArrow,
      ...js.configs.recommended.plugins,
    },
    rules: {
      "no-unused-vars": ["error", { varsIgnorePattern: "React" }],
      "prefer-arrow-callback": "error",
      "prefer-arrow/prefer-arrow-functions": [
        "error",
        {
          disallowPrototype: true,
          singleReturnOnly: false,
          classPropertiesAllowed: false,
        },
      ],
    },
  },
  {
    ...astroRecommended,
    files: [`${wwwFolder}/**/*.{astro}`],
    rules: {
      ...astroRecommended.rules,
    },
  },
];
