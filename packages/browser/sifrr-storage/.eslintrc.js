export default {
  root: true,
  extends: ['@sifrr/eslint-config/base.js', '@sifrr/eslint-config/typescript.js'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn'
  }
};
