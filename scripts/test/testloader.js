const exec = require('../exec');
const loadDir = require('./loaddir');

module.exports = async (relativeDir, mocha, { runUnitTests, runBrowserTests }, filter = ['']) => {
  const dir = path.join(__dirname, '../../', relativeDir);
  const unitTestDir = path.join(dir, './test/unit');
  const browserTestDir = path.join(dir, './test/browser');
  const pkg = require(path.join(dir, './package.json'));
  const setGlobal = ['SifrrStorage'];

  // load package file to global
  const name = pkg.name.replace(/^@sifrr\/([a-z])(.*)$/, (m, l, r) => `Sifrr${l.toUpperCase()}${r}`);
  if (setGlobal.indexOf(name) > -1) global[name] = require(path.join(dir, pkg.main));

  // load test files
  if ((runUnitTests || !runBrowserTests) && fs.existsSync(unitTestDir)) {
    // Add unit test.js files to the mocha instance
    loadDir(unitTestDir, (filePath) => {
      if (filter.map(bf => filePath.indexOf(bf) >= 0).indexOf(true) >= 0) {
        if (filePath.endsWith('.test.js')) mocha.addFile(filePath);
      }
    });
  }

  const testPublicPath = path.join(dir, './test/public');
  if ((runBrowserTests || !runUnitTests) && fs.existsSync(browserTestDir)) {
    // Run yarn if there is a package.json in public folder
    if (fs.existsSync(path.join(testPublicPath, './package.json'))) {
      process.env.NODE_PATH = path.join(testPublicPath, './node_modules');
      require('module').Module._initPaths();
      await exec(`cd ${testPublicPath} && yarn`);
      await exec(`cd ${testPublicPath} && (yarn build || exit 0)`);
    }
    // Run yarn rollup if there is a rollup config in public folder
    if (fs.existsSync(path.join(testPublicPath, './rollup.config.js'))) await exec(`cd ${testPublicPath} && ../../node_modules/.bin/rollup -c`);

    // Add browser test.js files to the mocha instance
    loadDir(browserTestDir, (filePath) => {
      if (filter.map(bf => filePath.indexOf(bf) >= 0).indexOf(true) >= 0) {
        if (filePath.endsWith('.test.js')) mocha.addFile(filePath);
      }
    });
  }

  if (fs.existsSync(path.join(testPublicPath))) return testPublicPath;
  return null;
};
