/** @type {import("eslint").Linter.Config} */
module.exports = {
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['import-x'],
  extends: ['eslint:recommended', 'plugin:import-x/recommended', 'prettier'],
  ignorePatterns: [
    'node_modules/',
    'submodules/',
    'tests/**/*.js',
    'babel.config.js',
    'dist/',
  ],
  rules: {
    'no-console': 'error',
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-empty': ['error', { allowEmptyCatch: true }],
    'no-unused-vars': 'error',
    'no-nested-ternary': 'error',
    'no-warning-comments': 'error',
    'no-lonely-if': 'error',
    'no-unneeded-ternary': 'error',
    'no-restricted-imports': ['error', { patterns: ['../../*'] }],
    'import-x/no-named-export': 'off',
  },
  settings: {
    'import-x/resolver': {
      node: {
        extensions: ['.js'],
      },
    },
  },
}
