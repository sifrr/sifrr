const Mocha = require('mocha');
const mkdirp = require('mkdirp');
const listen = require('./server');
const testLoader = require('./testloader');
const inspector = require('inspector');

global.ENV = process.env.NODE_ENV = process.env.NODE_ENV || 'test';
global.fs = require('fs');
global.path = require('path');
global.chai = require('chai');
global.sinon = require('sinon').createSandbox();
global.assert = chai.assert;
global.expect = chai.expect;
global.should = chai.should();
global.puppeteer = require('puppeteer');
global.port = 8888;
global.PATH = `http://localhost:${port}`;
global.delay = (time) => {
  return new Promise(res => {
    setTimeout(function(){
      res();
    }, time * 1000);
  });
};

chai.use(require('chai-as-promised'));

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
      register: sinon.stub()
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

// check if should inspect or not
const shouldInspect = process.argv.indexOf('-i') > 0 || process.argv.indexOf('--inspect') > 0;
if (shouldInspect) inspector.open(undefined, undefined, true);

// Check if need coverage
const toCover = process.env.COVERAGE === 'true';
if (toCover) {
  const { createInstrumenter } = require('istanbul-lib-instrument');
  const instrumenter = createInstrumenter();
  const { hookRequire } = require('istanbul-lib-hook');
  hookRequire((filePath) => filePath.match(/packages\/[a-z]+\/sifrr-[a-z]+\/src/), (code, { filename }) => instrumenter.instrumentSync(code, filename));
}

const nycReport = path.join(__dirname, '../../.nyc_output');
const loadBrowser = async function() {
  if (global.browser && global.browser.current) await global.browser.close();
  // set browser and page global variables
  let pBrowser = await puppeteer.launch({
    // to make it work in circleci
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ],
    ignoreHTTPSErrors: true,
    headless: process.env.HEADLESS !== 'false',
    devtools: false
  });
  let page = await pBrowser.newPage();
  await page.setViewport( { width: 1280, height: 800 } );
  global.browser = {
    current: pBrowser,
    close: async () => {
      if (!toCover) return pBrowser.close();
      const jsCoverage = await page.evaluate(() => window.__coverage__);
      writeCoverage(jsCoverage, path.join(nycReport, `./${Date.now()}-browser-coverage.json`));
      return pBrowser.close();
    }
  };
  if (toCover) {
    page.goto = async (url, options) => {
      const jsCoverage = await page.evaluate(() => window.__coverage__ || {});
      writeCoverage(jsCoverage, path.join(nycReport, `./${Date.now()}-browser-coverage.json`));
      const ret = page.mainFrame().goto(url, options);
      return ret;
    };
  }
  global.page = page;

  return true;
};

const mochaOptions = {
  timeout: 10000
};

const useJunitReporter = process.argv.indexOf('-j') > 0 || process.argv.indexOf('--junit') > 0;
const junitXmlFile = path.join(__dirname, `../../test-results/${process.argv[2].split(path.sep).pop()}/results.xml`);

if (useJunitReporter) {
  mochaOptions.reporter = 'mocha-junit-reporter';
  mochaOptions.reporterOptions = {
    mochaFile: junitXmlFile
  };
}

const mocha = new Mocha(mochaOptions);

// check if run only unit test
const runUnitTests = process.argv.indexOf('-u') > 0 || process.argv.indexOf('--unit') > 0;

// check if run only browser tests
const runBrowserTests = process.argv.indexOf('-b') > 0 || process.argv.indexOf('--browser') > 0;

// check if run only browser tests
const serverOnly = process.argv.indexOf('-s') > 0 || process.argv.indexOf('--server') > 0;

// check if need to filter
let filterArray;
const filter = process.argv.indexOf('-f') || process.argv.indexOf('--filter');
if (filter > 0) {
  filterArray = process.argv[filter + 1].split(',');
}

(async function() {
  try {
    let ser = false;

    const dir = process.argv[2];
    const pubPath = await testLoader(dir, mocha, { runUnitTests, runBrowserTests }, filterArray);

    if (runBrowserTests || !runUnitTests) {
      let serverFile;
      if (pubPath) serverFile = path.join(pubPath, './server.js');
      if (pubPath && fs.existsSync(serverFile)) {
        ser = require(serverFile)(port);
      } else if (pubPath) {
        ser = listen(port, pubPath);
      }

      if (!serverOnly) await loadBrowser();
    }

    if (serverOnly) return;
    mocha.run(async (failures) => {
      // close server if open
      if (ser) {
        ser.close();
      }

      if (failures) {
        process.stdout.write(`---------- ${failures} FAILURES. ----------\n`);
        process.exitCode = 1;  // exit with non-zero status if there were failures
      }

      // close browser
      if (global.browser) await browser.close();

      // Get and write code coverage
      if (toCover) {
        writeCoverage(global.__coverage__, path.join(nycReport, `./${Date.now()}-unit-coverage.json`));
      }

      process.exit(process.exitCode);
    });
  } catch(e) {
    process.exitCode = 1;
    global.console.error(e);
  }
})();

// write coverage
function writeCoverage(coverage, file) {
  mkdirp.sync(path.dirname(file), (err) => {
    if (err) throw err;
  });

  const contents = JSON.stringify(coverage || {});
  if (contents !== '{}') {
    fs.writeFileSync(file, contents, err => {
      if(err) throw err;
    });
  }
}
