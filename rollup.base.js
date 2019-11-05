const path = require('path');
const fs = require('fs');
const version = require('./package.json').version;
const { getRollupConfig } = require('@sifrr/dev');

const external = [
  'busboy',
  'mkdirp',
  'path',
  'fs',
  'cache-manager',
  'child_process',
  'graphql',
  'sequelize',
  'graphql-sequelize',
  'graphql-tools',
  '@sifrr/dom',
  '@sifrr/fetch',
  'puppeteer',
  'events',
  'uWebSockets.js',
  'stream',
  'zlib',
  'chokidar'
];
const globals = {
  '@sifrr/dom': 'Sifrr.Dom',
  '@sifrr/fetch': 'Sifrr.Fetch'
};
const footer = '/*! (c) @aadityataparia */';

function moduleConfig(name, root, minify = false, type) {
  const filename = name.toLowerCase();
  const banner = `/*! ${name} v${version} - sifrr project | MIT licensed | https://github.com/sifrr/sifrr */`;
  const mergeConfig = {
    output: {
      banner,
      footer,
      globals,
      exports: 'named'
    },
    external
  };

  if (type === 'browser') {
    mergeConfig.output.outro = 'if (exports.default) exports = exports.default;';
  }

  const isTs = fs.existsSync(path.join(root, `./src/${filename}.ts`));
  return getRollupConfig(
    {
      name,
      inputFile: isTs
        ? path.join(root, `./src/${filename}.ts`)
        : path.join(root, `./src/${filename}.js`),
      outputFolder: path.join(root, './dist'),
      outputFileName: filename,
      minify,
      type
    },
    mergeConfig
  );
}

module.exports = (name, __dirname, isBrowser = true) => {
  let ret = [];
  if (isBrowser) {
    ret = [
      moduleConfig(name, __dirname, true, 'browser'),
      moduleConfig(name, __dirname, false, 'browser')
    ];
  }
  ret.push(moduleConfig(name, __dirname, false, 'cjs'));
  ret.push(moduleConfig(name, __dirname, false, 'module'));

  return ret;
};
