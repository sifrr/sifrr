const path = require('path');

module.exports = {
  root: true,
  extends: ['@sifrr/eslint-config/base.js', '@sifrr/eslint-config/typescript.js'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  },
  settings: {
    'import-x/resolver': {
      typescript: {
        project: [path.join(__dirname, './tsconfig.json')]
      }
    }
  }
};
