module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ['@typescript-eslint'],
  env: {
    node: true,
    es6: true,
  },
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'no-prototype-builtins': 'off',
    'no-useless-escape': 'off',
    // Prevent .ts extensions in imports - use .js for ESM compatibility
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ImportDeclaration[source.value=/\\.ts["\']$/]',
        message: 'Do not use .ts extensions in imports. Use .js extensions for ESM compatibility (TypeScript with NodeNext understands .js refers to .ts files).',
      },
      {
        selector: 'ImportDeclaration[source.value=/\\.ts["\']$/]',
        message: 'Do not use .ts extensions in imports. Use .js extensions for ESM compatibility.',
      },
      {
        selector: 'CallExpression[callee.name="import"][arguments.0.value=/\\.ts["\']$/]',
        message: 'Do not use .ts extensions in dynamic imports. Use .js extensions for ESM compatibility.',
      },
    ],
  },
  ignorePatterns: ['dist', 'node_modules', '*.js', 'tests/**/*.ts'],
};
