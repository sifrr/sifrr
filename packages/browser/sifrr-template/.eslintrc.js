module.exports = {
  root: true,
  extends: [
    '@sifrr/eslint-config/base.js',
    '@sifrr/eslint-config/typescript.js',
    'plugin:storybook/recommended'
  ],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  }
};
