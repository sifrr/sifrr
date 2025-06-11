const pkg = require('../../package.json');
const path = require('path');
const fs = require('fs');
const stringify = require('./stringify');

module.exports = function (folder, isBrowser) {
  const pkgFileString = '../.' + folder + '/package.json',
    pkgFile = require(pkgFileString);
  const pkgFolder = folder.split('/')[folder.split('/').length - 1];
  const jsFileName = pkgFolder.replace('-', '.');
  const pkgName = '@' + jsFileName.replace('.', '/');
  const pkgToMerge = {
    name: pkgName,
    main: `src/${jsFileName}.js`,
    module: `dist/${jsFileName}.module.js`,
    version: pkg.version,
    license: pkg.license,
    repository: pkg.repository,
    author: pkg.author,
    bugs: pkg.bugs,
    homepage: pkg.homepage,
    devDependencies: orderedDependencies(pkg.devDependencies),
    scripts: {
      test: `node ../../../scripts/test/run.js ${folder}`,
      build: 'yarn rollup -c',
      'test-build': 'cd test/public && yarn build',
      'test-server': 'yarn test -s'
    },
    files: ['bin', 'dist', 'src']
  };

  if (fs.existsSync(path.join(folder, 'tsconfig.json'))) {
    pkgToMerge.module = `dist/${jsFileName}.module.js`;
    pkgToMerge.main = `dist/${jsFileName}.cjs.js`;
    pkgToMerge.types = `dist/types/${jsFileName}.d.ts`;
  }

  if (isBrowser) {
    pkgToMerge.browser = `dist/${jsFileName}.min.js`;
    pkgToMerge.browserslist = pkg.browserslist;
  }

  try {
    pkgToMerge.scripts = Object.assign(pkgFile.scripts, pkgToMerge.scripts);

    // change peerDependencies & dependencies
    pkgFile.peerDependencies = orderedDependencies(pkgFile.peerDependencies);
    pkgFile.dependencies = orderedDependencies(pkgFile.dependencies);

    Object.assign(pkgFile, pkgToMerge);
    fs.writeFileSync(__dirname + '/' + pkgFileString, stringify(pkgFile) + '\n');
    process.stdout.write('Done: package.json \n');
  } catch (e) {
    process.stdout.write('No package file in this folder \n');
  }

  const rollupConfigFileString = '../.' + folder + '/rollup.config.js';
  const config = `const getConfig = require('../../../rollup.base');

module.exports = getConfig('${jsFileName.replace(/(^|\.)(\S)/g, (s) =>
    s.toUpperCase()
  )}', __dirname, ${isBrowser});
`;
  fs.writeFileSync(__dirname + '/' + rollupConfigFileString, config);

  process.stdout.write('Done: rollup.config.js \n');
};

function orderedDependencies(dependencies) {
  const ordered = {};
  Object.keys(dependencies)
    .sort()
    .forEach(function (key) {
      ordered[key] = dependencies[key];
    });

  return ordered;
}
