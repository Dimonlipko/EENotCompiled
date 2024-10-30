module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es6: true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: [
    'plugin:vue/recommended', // налаштування для Vue
    'plugin:@typescript-eslint/recommended', // правила для TypeScript
    'prettier', // інтеграція з Prettier
  ],
  plugins: [
    'vue',
    '@typescript-eslint',
    'prettier',
    'import', // Доданий плагін import для підтримки правила import/order
  ],
  rules: {
    curly: ['error', 'all'],
    'require-await': 'error',
    'no-console': 'error',
    'no-debugger': 'error',
    'prettier/prettier': 'error',
    'vue/no-v-html': 'off',
    'vue/require-default-prop': 'off',

    // Ігнорування попереджень, якщо типи повернення не потрібні
    '@typescript-eslint/explicit-function-return-type': 'off',

    // Ігнорування попереджень про невикористані змінні
    '@typescript-eslint/no-unused-vars': 'warn',

    'sort-imports': [
      'warn',
      {
        ignoreCase: true,
        ignoreDeclarationSort: true,
      },
    ],
    'import/order': [
      'warn',
      {
        'newlines-between': 'always',
        groups: [
          'builtin',
          'external',
          'internal',
          'sibling',
          'parent',
          'index',
          'object',
          'type',
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
        alphabetize: {
          order: 'asc',
          caseInsensitive: false,
        },
        pathGroups: [
          {
            pattern: '@twilio/**',
            group: 'external',
          },
          {
            pattern: '@vue/**',
            group: 'external',
          },
          {
            pattern: '@pinia/**',
            group: 'external',
          },
          {
            pattern: '@shared/**',
            group: 'internal',
            position: 'before',
          },
          {
            pattern: '@protots/**',
            group: 'internal',
            position: 'before',
          },
          {
            pattern: '@**/**',
            group: 'internal',
            position: 'after',
          },
        ],
      },
    ],
  },
}
