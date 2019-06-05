const path = require('path');

// Stub window in unit tests
global.window = {
  document: {
    addEventListener: sinon.stub(),
    createElement: sinon.stub()
  },
  addEventListener: sinon.stub(),
  location: {
    href: '/',
    host: 'localhost'
  },
  Sifrr: {
    Dom: {
      Element: Object,
      html: sinon.stub(),
      register: sinon.stub(),
      Event: {
        add: sinon.stub()
      }
    }
  },
  history: { pushState: sinon.stub() },
  console: {
    log: sinon.stub(),
    error: sinon.stub(),
    warn: sinon.stub()
  },
  fetch: () => {}
};

// Check if need coverage
const coverage = process.env.COVERAGE === 'true';

// check if should inspect or not
const inspect = process.argv.indexOf('-i') > 0 || process.argv.indexOf('--inspect') > 0;

// check if need junit reporter
const useJunitReporter = process.argv.indexOf('-j') > 0 || process.argv.indexOf('--junit') > 0;

// check if run only unit test
const runUnitTests = process.argv.indexOf('-u') > 0 || process.argv.indexOf('--unit') > 0;

// check if run only browser tests
const runBrowserTests = process.argv.indexOf('-b') > 0 || process.argv.indexOf('--browser') > 0;

// check if run only browser tests
const serverOnly = process.argv.indexOf('-s') > 0 || process.argv.indexOf('--server') > 0;

// test port
let port = 8888;
const portIndex = Math.max(process.argv.indexOf('--test-port'), process.argv.indexOf('-tp'));
if (portIndex !== -1) {
  port = +process.argv[portIndex + 1];
}

// check if need to filter
let filters;
const filter = process.argv.indexOf('-f') || process.argv.indexOf('--filter');
if (filter > 0) {
  filters = process.argv[filter + 1].split(',');
}

// reporters
const reporters = ['html'];
if (process.env.LCOV === 'true') reporters.push('lcov');

const root = path.join(__dirname, '../../', process.argv[2]) || path.resolve('./');

const { runTests } = require('@sifrr/dev');

runTests({
  root,
  serverOnly,
  runUnitTests,
  runBrowserTests,
  coverage,
  filters,
  port,
  useJunitReporter,
  inspect,
  folders: {
    static: [path.join(__dirname, '../../dist')],
    coverage: path.join(__dirname, '../../.nyc_output'),
    source: path.join(__dirname, '../../packages')
  },
  sourceFileRegex: /sifrr-[a-z-]+\/src\/.*\.js$/,
  junitXmlFile: path.join(__dirname, `../../test-results/${path.basename(root)}/results.xml`),
  reporters
});
