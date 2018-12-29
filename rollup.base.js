const version = require('./package.json').version;
const babel = require('rollup-plugin-babel');
const eslint = require('rollup-plugin-eslint').eslint;
const terser = require('rollup-plugin-terser').terser;
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const cleanup = require('rollup-plugin-cleanup');

module.exports = function getRollupConfig(name) {
  let fileName = name.toLowerCase();
  let banner = `/*! ${name} v${version} - sifrr project */`;
  let footer = '/*! (c) @aadityataparia */';
  return [
    {
      input: `src/${fileName}.js`,
      output: {
        file: `dist/${fileName}.js`,
        format: 'umd',
        name: name,
        banner: banner,
        footer: footer,
        sourcemap: true
      },
      preferConst: true,
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
    },
    {
      input: `src/${fileName}.js`,
      output: {
        file: `dist/${fileName}.min.js`,
        format: 'umd',
        name: name,
        banner: banner,
        footer: footer,
        sourcemap: true
      },
      preferConst: true,
      plugins: [
        resolve({
          browser: true
        }),
        commonjs(),
        babel({
          exclude: 'node_modules/**',
        }),
        cleanup(),
        terser({
          output: {
            comments: 'all'
          }
        })
      ]
    },
    {
      input: `src/${fileName}.js`,
      output: {
        file: `dist/${fileName}.module.js`,
        format: 'es',
        banner: banner,
        footer: footer,
      },
      preferConst: true,
      plugins: [
        commonjs(),
        babel({
          exclude: 'node_modules/**',
        })
      ]
    }
  ];
};
