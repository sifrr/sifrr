const chai = require('chai'),
  assert = chai.assert,
  should = chai.should(),
  expect = chai.expect,
  BrowserStorage = require('../src/browserstorage'),
  puppeteer = require('puppeteer'),
  fileUrl = require('file-url');

let browser, page;

describe('BrowserStorage in browser', () => {
  let browser, page;

  before(async () => {
    browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    page = await browser.newPage();
    await page.setViewport( { width: 1280, height: 800} );
    await page.goto(fileUrl('./test/test.html'));
    await page.addScriptTag({ path: './dist/browserstorage.min.js' });
  });

  after(async () => {
    await browser.close();
  });

  it('Website Should have BrowserStorage', async () => {
    const result = await page.evaluate(() => {
      try {
        return BrowserStorage.availableStores;
      } catch(e) {
        return e;
      }
    });
    expect(result).to.have.all.keys(Object.keys(BrowserStorage.availableStores));
  });

  it('Website Should have LocalStorage', async () => {
    const result = await page.evaluate(() => {
      try {
        let x = new BrowserStorage({ priority: ['localstorage'] });
        x.store;
        return true;
      } catch(e) {
        return false;
      }
    });
    assert.equal(result, true);
  });

  it('Website Should have indexedDB', async () => {
    const result = await page.evaluate(() => {
      try {
        let x = new BrowserStorage({ priority: ['indexeddb'] });
        x.store;
        return true;
      } catch(e) {
        return false;
      }
    });
    assert.equal(result, true);
  });

  it('Website Should have websql', async () => {
    const result = await page.evaluate(() => {
      try {
        let x = new BrowserStorage({ priority: ['websql'] });
        x.store;
        return true;
      } catch(e) {
        return false;
      }
    });
    assert.equal(result, true);
  });

  it('Website Should have cookies', async () => {
    const result = await page.evaluate(() => {
      try {
        let x = new BrowserStorage({ priority: ['cookies'] });
        x.store;
        return true;
      } catch(e) {
        return false;
      }
    });
    assert.equal(result, true);
  });

  it('BrowserStorage should be indexeddb by default', async () => {
    const result = await page.evaluate(() => {
      try {
        return new BrowserStorage().type;
      } catch(e) {
        return false;
      }
    });
    assert.equal(result, 'indexeddb');
  });
});
