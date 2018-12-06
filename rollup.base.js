const version = require('./package.json').version;
const babel = require('rollup-plugin-babel');
const eslint = require('rollup-plugin-eslint').eslint;
const terser = require('rollup-plugin-terser').terser;
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const cleanup = require('rollup-plugin-cleanup');

module.exports = function getRollupConfig(name) {
  return [
    {
      input: `src/${name.toLowerCase()}.js`,
      output: {
        file: `dist/${name.toLowerCase()}.js`,
        format: 'umd',
        name: name
      },
      plugins: [
        resolve({
          browser: true
        }),
        commonjs(),
        eslint(),
        babel({
          // exclude: 'node_modules/**',
        }),
        cleanup()
      ]
    },
    {
      input: `src/${name.toLowerCase()}.js`,
      output: {
        file: `dist/${name.toLowerCase()}.min.js`,
        format: 'umd',
        name: name
      },
      plugins: [
        resolve({
          browser: true
        }),
        commonjs(),
        babel({
          // exclude: 'node_modules/**',
        }),
        terser()
      ]
    }
  ]
};
