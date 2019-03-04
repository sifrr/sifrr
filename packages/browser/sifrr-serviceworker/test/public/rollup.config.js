'use strict';

const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

module.exports = [{
  input: 'sw.js',
  output: {
    file: 'sw.bundled.js',
    format: 'umd',
    name: 'SW',
    sourcemap: true
  },
  plugins: [
    resolve({
      browser: true
    }),
    commonjs(),
    babel()
  ]
}, {
  input: 'sw2.js',
  output: {
    file: 'sw2.bundled.js',
    format: 'umd',
    name: 'SW',
    sourcemap: true
  },
  plugins: [
    resolve({
      browser: true
    }),
    commonjs(),
    babel()
  ]
}];
