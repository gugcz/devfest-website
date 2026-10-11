// Cognitive complexity gate only (`npm run complexity`). Not a style linter.
import astro from 'eslint-plugin-astro';
import sonarjs from 'eslint-plugin-sonarjs';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['dist/**', '.astro/**', 'functions/lib/**', 'functions/lib-test/**'],
  },
  ...astro.configs['flat/base'],
  {
    files: ['**/*.{ts,tsx,mjs,js}'],
    languageOptions: { parser: tseslint.parser, parserOptions: { ecmaFeatures: { jsx: true } } },
  },
  {
    files: ['**/*.astro'],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
  {
    files: ['**/*.{ts,tsx,mjs,js,astro}'],
    linterOptions: { reportUnusedDisableDirectives: 'off' },
    plugins: { sonarjs },
    rules: { 'sonarjs/cognitive-complexity': ['error', 15] },
  },
];
