const babel = require('rollup-plugin-babel');
const eslint = require('rollup-plugin-eslint').eslint;
const terser = require('rollup-plugin-terser').terser;
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const cleanup = require('rollup-plugin-cleanup');

export default [
  {
    input: 'src/browserstorage.js',
    output: {
      file: 'dist/browserstorage.min.js',
      format: 'iife',
      name: 'BrowserStorage',
      sourceMap: true
    },
    plugins: [
      resolve({
        browser: true
      }),
      commonjs(),
      babel({
        exclude: 'node_modules/**',
      }),
      terser()
    ]
  },
  {
    input: 'src/browserstorage.js',
    output: {
      file: 'dist/browserstorage.js',
      format: 'iife',
      name: 'BrowserStorage'
    },
    plugins: [
      resolve({
        browser: true
      }),
      commonjs(),
      eslint(),
      babel({
        exclude: 'node_modules/**',
      }),
      cleanup()
    ]
  }
];
