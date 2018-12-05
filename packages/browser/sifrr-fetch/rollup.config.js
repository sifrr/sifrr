const version = require('../../../package.json').version;
const babel = require('rollup-plugin-babel');
const eslint = require('rollup-plugin-eslint').eslint;
const terser = require('rollup-plugin-terser').terser;
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const cleanup = require('rollup-plugin-cleanup');

export default [
  {
    input: 'src/sifrr.fetch.js',
    output: {
      file: 'dist/sifrr.fetch.js',
      format: 'iife',
      name: 'Sifrr.Fetch'
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
  },{
    input: 'src/sifrr.fetch.js',
    output: {
      file: 'dist/sifrr.fetch.min.js',
      format: 'iife',
      name: 'Sifrr.Fetch'
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
];
