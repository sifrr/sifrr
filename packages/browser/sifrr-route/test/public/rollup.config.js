'use strict';

const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const { terser } = require('rollup-plugin-terser');
const commonjs = require('rollup-plugin-commonjs');

module.exports = {
  input: 'index.js',
  output: {
    file: 'index.bundled.js',
    format: 'umd',
    name: 'SW',
    sourcemap: true
  },
  plugins: [
    resolve({
      browser: true
    }),
    commonjs(),
    babel(),
    terser()
  ],
};
