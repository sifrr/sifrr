const pkg = require('../../package.json');
const fs = require('fs');
const stringify = require('./stringify');

module.exports = function(folder, isBrowser) {
  let pkgFileString = '../.' + folder + '/package.json',
    pkgFile = require(pkgFileString);
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
    devDependencies: Object.assign(pkgFile.devDependencies, pkg.devDependencies),
    scripts: {
      test: `node ../../../scripts/test/run.js ${folder}`,
      build: 'yarn rollup -c',
      'test-build': 'cd test/public && yarn build',
      'test-server': 'yarn test -s'
    },
    files: ['bin', 'dist', 'src']
  };

  if (isBrowser) {
    pkgToMerge.module = `src/${jsFileName}.js`;
    pkgToMerge.main = `dist/${jsFileName}.cjs.js`;
    pkgToMerge.browser = `dist/${jsFileName}.min.js`;
    pkgToMerge.browserslist = pkg.browserslist;
  }

  try {
    pkgToMerge.scripts = Object.assign(pkgFile.scripts, pkgToMerge.scripts);

    // change peerDependencies & dependencies
    pkgFile.peerDependencies = dependencyVersion(
      pkgFile.peerDependencies,
      pkgToMerge.devDependencies,
      pkg.version
    );
    pkgFile.dependencies = dependencyVersion(
      pkgFile.dependencies,
      pkgToMerge.devDependencies,
      pkg.version
    );

    Object.assign(pkgFile, pkgToMerge);
    fs.writeFileSync(__dirname + '/' + pkgFileString, stringify(pkgFile) + '\n');
    process.stdout.write('Done: package.json \n');
  } catch (e) {
    process.stdout.write('No package file in this folder \n');
  }

  let rollupConfigFileString = '../.' + folder + '/rollup.config.js';
  const config = `const getConfig = require('../../../rollup.base');

module.exports = getConfig('${jsFileName.replace(/(^|\.)(\S)/g, s =>
    s.toUpperCase()
  )}', __dirname, ${isBrowser});
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
