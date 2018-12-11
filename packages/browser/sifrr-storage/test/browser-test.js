let Sifrr = {};
Sifrr.Storage = require('../src/sifrr.storage');
const chai = require('chai'),
  assert = chai.assert,
  should = chai.should(),
  expect = chai.expect,
  puppeteer = require('puppeteer');

let browser, page, server = require('./public/server');

describe('Sifrr.Storage in browser', () => {

  before(async () => {
    server = server.listen(9999);
    browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    page = await browser.newPage();
    await page.setViewport( { width: 1280, height: 800} );
    await page.goto('http://localhost:9999/test.html');
    await page.addScriptTag({ url: 'http://localhost:9999/sifrr.storage.min.js' });
  });

  after(async () => {
    await browser.close();
    server.close();
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
