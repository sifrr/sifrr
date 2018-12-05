let Sifrr = {};
Sifrr.Storage = require('../src/sifrr.storage');
const chai = require('chai'),
  assert = chai.assert,
  should = chai.should(),
  expect = chai.expect,
  puppeteer = require('puppeteer'),
  fileUrl = require('file-url');

let browser, page;

describe('Sifrr.Storage in browser', () => {
  let browser, page;

  before(async () => {
    browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    page = await browser.newPage();
    await page.setViewport( { width: 1280, height: 800} );
    await page.goto(fileUrl('./test/support/test.html'));
    await page.addScriptTag({ path: './dist/sifrr.storage.min.js' });
  });

  after(async () => {
    await browser.close();
  });

  it('Website Should have Sifrr.Storage', async () => {
    const result = await page.evaluate(() => {
      try {
        return Sifrr.Storage.availableStores;
      } catch(e) {
        return e;
      }
    });
    expect(result).to.have.all.keys(Object.keys(Sifrr.Storage.availableStores));
  });

  it('Website Should have LocalStorage', async () => {
    const result = await page.evaluate(() => {
      try {
        let x = new Sifrr.Storage({ priority: ['localstorage'] });
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
        let x = new Sifrr.Storage({ priority: ['indexeddb'] });
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
        let x = new Sifrr.Storage({ priority: ['websql'] });
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
        let x = new Sifrr.Storage({ priority: ['cookies'] });
        x.store;
        return true;
      } catch(e) {
        return false;
      }
    });
    assert.equal(result, true);
  });

  it('Sifrr.Storage should be indexeddb by default', async () => {
    const result = await page.evaluate(() => {
      try {
        return new Sifrr.Storage().type;
      } catch(e) {
        return false;
      }
    });
    assert.equal(result, 'indexeddb');
  });
});
