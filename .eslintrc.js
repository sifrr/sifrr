module.exports = {
  'env': {
    'browser': true,
    'node': true,
    'es6': true,
    'mocha': true
  },
  'globals': {
    'ENV': true,
    'fs': false,
    'path': false,
    'chai': false,
    'assert': false,
    'expect': false,
    'should': false,
    'puppeteer': false,
    'server': false,
    'port': false,
    'PATH': false,
    'loadBrowser': false,
    'page': false,
    'browser': false,
    'pti': false,
    'Sifrr': false,
    'SifrrStorage': false,
    'requireBase': false
  },
  'extends': 'eslint:recommended',
  'parserOptions': {
    'sourceType': 'module',
    'ecmaVersion': 2017,
    'esversion': 2017
  },
  'rules': {
    'indent': [
      'error',
      2
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: true
      }
    ],
    'semi': [
      'warn',
      'always'
    ],
    'quote-props': [
      'error',
      'as-needed'
    ]
  },
  'plugins': [
    'html'
  ],
  'settings': {
    'html/indent': '+2'
  }
};
