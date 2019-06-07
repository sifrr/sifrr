const path = require('path');
const sinon = require('sinon');

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

// reporters
const reporters = ['html'];
if (process.env.LCOV === 'true') reporters.push('lcov');

const { runTests } = require('@sifrr/dev');

process.on('message', ({ root, i, argv }) => {
  global.console.log('\x1b[36m%s\x1b[0m', `RUNNING TEST IN ${root}, with options ${argv.join(' ')}`);

  // check if should inspect or not
  const inspect = argv.indexOf('-i') > -1 || argv.indexOf('--inspect') > -1;

  // check if need junit reporter
  const useJunitReporter = argv.indexOf('-j') > -1 || argv.indexOf('--junit') > -1;

  // check if run only unit test
  const runUnitTests = argv.indexOf('-u') > -1 || argv.indexOf('--unit') > -1;

  // check if run only browser tests
  const runBrowserTests = argv.indexOf('-b') > -1 || argv.indexOf('--browser') > -1;

  // check if run only browser tests
  const serverOnly = argv.indexOf('-s') > -1 || argv.indexOf('--server') > -1;

  // test port
  let port = 8888;

  // check if need to filter
  let filters;
  const filter = argv.indexOf('-f') > -1 ? argv.indexOf('-f') : argv.indexOf('--filter');
  if (filter > -1) {
    filters = argv[filter + 1].split(/[ ,\n]/g);
  }

  (async function() {
    await runTests({
      root,
      serverOnly,
      runUnitTests,
      runBrowserTests,
      coverage,
      filters,
      port: port + i,
      useJunitReporter,
      inspect,
      folders: {
        static: [path.join(__dirname, '../../packages/browser/sifrr-dom/dist'), path.join(__dirname, '../../packages/browser/sifrr-fetch/dist')],
        coverage: path.join(__dirname, '../../.nyc_output'),
        source: path.join(__dirname, '../../packages')
      },
      sourceFileRegex: /sifrr-[a-z-]+\/src\/.*\.js$/,
      junitXmlFile: path.join(__dirname, `../../test-results/${path.basename(root)}/results.xml`),
      reporters,
      mochaOptions: {
        timeout: 10000
      }
    }).catch(e => {
      process.exit(e);
    });

    process.exit(0);
  }());
});

