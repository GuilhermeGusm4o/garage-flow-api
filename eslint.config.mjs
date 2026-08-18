import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      'dist/',
      'node_modules/',
      'coverage/',
      'prisma/migrations/',
    ],
  },

  eslint.configs.recommended,

  ...tseslint.configs.recommended,

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      // TypeScript
      '@typescript-eslint/no-explicit-any': 'error',

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],

      // Imports
      'no-duplicate-imports': 'error',

      // Código
      'no-console': 'warn',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],

      // Funções muito grandes
      'max-lines-per-function': [
        'warn',
        {
          max: 80,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  },

  // Regras específicas para testes
  {
    files: ['test/**/*.ts', 'src/**/*.spec.ts', 'src/**/*.test.ts'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },

  prettier,
);