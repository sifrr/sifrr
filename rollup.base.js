const version = require('./package.json').version;
const babel = require('rollup-plugin-babel');
const terser = require('rollup-plugin-terser').terser;
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const cleanup = require('rollup-plugin-cleanup');

const external = [
  'path',
  'fs',
  'graphql',
  'sequelize',
  'graphql-sequelize',
  'graphql-tools',
  '@sifrr/dom',
  '@sifrr/fetch',
  'puppeteer',
  'events'
];
const globals = {
  '@sifrr/dom': 'Sifrr.Dom',
  '@sifrr/fetch': 'Sifrr.Fetch'
};
const footer = '/*! (c) @aadityataparia */';

function moduleConfig(name, min = false, module = false) {
  const filename = name.toLowerCase();
  const banner = `/*! ${name} v${version} - sifrr project | MIT licensed | https://github.com/sifrr/sifrr */`;
  const ret = {
    input: `src/${filename}.js`,
    output: {
      file: `dist/${filename + (module ? '.module' : '') + (min ? '.min' : '')}.js`,
      format: module ? 'es' : 'umd',
      name: name,
      banner: banner,
      footer: footer,
      sourcemap: true,
      preferConst: true,
      globals: globals
    },
    external: external,
    plugins: [
      resolve({
        browser: !module
      }),
      commonjs()
    ]
  };

  ret.plugins.push(babel({
    exclude: 'node_modules/**',
  }));

  ret.plugins.push(cleanup());

  if (min) {
    ret.plugins.push(terser({
      output: {
        comments: 'all'
      }
    }));
  }

  return ret;
}

module.exports = function getRollupConfig(name, isBrowser = true) {
  let ret = [];
  if (isBrowser) {
    ret = [
      moduleConfig(name),
      moduleConfig(name, true)
    ];
  }
  ret.push(moduleConfig(name, false, true));

  return ret;
};
