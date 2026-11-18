import astro from 'eslint-plugin-astro';
import tailwind from 'eslint-plugin-tailwindcss';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  // Global ignores
  {
    ignores: ['node_modules/**', 'dist/**', '.astro/**', 'public/**'],
  },

  // TypeScript files
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': ts,
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // Astro files
  ...astro.configs['flat/recommended'],

  // Tailwind CSS - no arbitrary values (only for component files)
  {
    files: ['**/*.{astro,jsx,tsx,html}'],
    plugins: {
      tailwindcss: tailwind,
    },
    rules: {
      'tailwindcss/no-arbitrary-value': 'error',
    },
  },
];
