/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['./base', './typescript'],
  plugins: ['only-warn'],
  env: {
    node: true
  },
  ignorePatterns: [
    // Ignore dotfiles
    '.*.js',
    'node_modules/',
    'dist/'
  ],
  overrides: [
    {
      files: ['*.js?(x)', '*.ts?(x)']
    }
  ]
};
