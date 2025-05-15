module.exports = {
  root: true,
  extends: ['@sifrr/eslint-config/base.js', 'plugin:storybook/recommended'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  },
  overrides: [
    {
      files: ['./**/*.ts'],
      extends: ['@sifrr/eslint-config/typescript.js']
    }
  ]
};
