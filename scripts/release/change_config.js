const pkg = require('../../package.json');
const fs = require('fs');
const stringify = require('./stringify');

module.exports = function(folder, isBrowser) {
  let pkgFileString = '../.' + folder + '/package.json', pkgFile;
  let pkgFolder = folder.split('/')[folder.split('/').length - 1];
  let jsFileName = pkgFolder.replace('-', '.');
  let pkgName = '@' + jsFileName.replace('.', '/');
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
    devDependencies: pkg.devDependencies,
    scripts: {
      test: `rm -rf ../../../.nyc_output; node ../../../scripts/test/run.js ${folder}`,
      build: './node_modules/.bin/rollup -c',
      'test-build': 'cd test/public && ../../node_modules/.bin/rollup -c',
      'test-server-only': 'node ./test/public/server.js -p 1111',
      'test-server': 'yarn test-build; yarn test-server-only'
    },
    files: [
      'bin',
      'dist',
      'src'
    ]
  };

  if (isBrowser) {
    pkgToMerge.browser = `dist/${jsFileName}.js`;
    pkgToMerge.browserslist = pkg.browserslist;
    pkgToMerge.scripts['test-server-only'] = `node ../../../scripts/test/server.js -d ${folder}/test/public -p 1111`;
  }

  try {
    pkgFile  = require(pkgFileString);

    pkgToMerge.scripts = Object.assign(pkgFile.scripts, pkgToMerge.scripts);

    // change peerDependencies & dependencies
    pkgFile.peerDependencies = dependencyVersion(pkgFile.peerDependencies, pkgToMerge.devDependencies, pkg.version);
    pkgFile.dependencies = dependencyVersion(pkgFile.dependencies, pkgToMerge.devDependencies, pkg.version);

    Object.assign(pkgFile, pkgToMerge);
    fs.writeFileSync(__dirname + '/' + pkgFileString, stringify(pkgFile) + '\n');
    process.stdout.write('Done: package.json \n');
  } catch(e) {
    process.stdout.write('No package file in this folder \n');
  }

  let rollupConfigFileString = '../.' + folder + '/rollup.config.js';
  const config = `const getConfig = require('../../../rollup.base');

module.exports = getConfig('${jsFileName.replace(/(^|\.)(\S)/g, s => s.toUpperCase())}', __dirname, ${isBrowser});
`;
  fs.writeFileSync(__dirname + '/' + rollupConfigFileString, config);

  process.stdout.write('Done: rollup.config.js \n');
};

function dependencyVersion(dependencies, devDependencies, version) {
  for (let dep in dependencies) {
    if (dep.indexOf('@sifrr') >= 0) {
      dependencies[dep] = version;
    } else {
      dependencies[dep] = devDependencies[dep] || dependencies[dep];
    }
  }

  return dependencies;
}
