'use strict';

import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default [{
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
