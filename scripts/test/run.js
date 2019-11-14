const fs = require('fs');
const path = require('path');

const before = function() {
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
          add: sinon.stub(),
          trigger: sinon.stub()
        }
      }
    },
    history: { pushState: sinon.stub() },
    console: {
      log: sinon.stub(),
      error: sinon.stub(),
      warn: sinon.stub()
    },
    Node: {
      TEXT_NODE: 2,
      COMMENT_NODE: 8,
      ELEMENT_NODE: 1
    }
  };
  global.fetch = () => {};
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

const dontRunPrecommand =
  process.argv.indexOf('-np') > 0 || process.argv.indexOf('--no-precommand') > 0;

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

const roots = (process.argv[2] || './')
  .split(/[ ,\n]/g)
  .map(p => path.join(__dirname, '../../', p));
const { runTests, exec } = require('@sifrr/dev');

const options = roots.map((root, i) => {
  const preCommand = [];
  if (!dontRunPrecommand) {
    if (root.indexOf('sifrr-dom') < 0) preCommand.push(`cd ${root} && yarn build`);
    if (fs.existsSync(path.join(root, './test/public/package.json'))) {
      preCommand.push(`cd ${path.join(root, './test/public')} && yarn && yarn build`);
    }
  }

  return {
    root,
    serverOnly,
    runUnitTests,
    runBrowserTests,
    coverage,
    filters,
    port: port + i,
    useJunitReporter,
    inspect,
    preCommand,
    before,
    folders: {
      static: [
        path.join(__dirname, '../../packages/browser/sifrr-dom/dist'),
        path.join(__dirname, '../../packages/browser/sifrr-fetch/dist')
      ],
      coverage: path.join(__dirname, '../../.nyc_output')
    },
    sourceFileRegex: /sifrr-[a-z-]+\/src\/.*\.js$/,
    junitXmlFile: path.join(__dirname, `../../test-results/${path.basename(root)}/results.xml`),
    reporters,
    mochaOptions: {
      timeout: 10000
    }
  };
});

async function run() {
  await exec(`cd ${path.join(__dirname, '../../packages/browser/sifrr-dom')} && yarn build`);
  runTests(options.length === 0 ? options[0] : options, process.env.PARALLEL === 'true').then(
    ({ failures, coverage }) => {
      console.table(coverage);
      if (failures > 0) {
        global.console.log(`${failures} tests failed!`);
        process.exit(1);
      }
      global.console.log(`All tests passed!`);
    }
  );
}

run();
