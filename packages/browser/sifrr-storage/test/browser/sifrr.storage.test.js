const { availableStores } = require('../../src/sifrr.storage');

describe('Sifrr.Storage in browser', () => {
  before(async () => {
    await page.goto(`${PATH}/index.html`);
  });

  it('Website Should have Sifrr.Storage', async () => {
    const result = await page.evaluate(() => {
      try {
        return Sifrr.Storage.availableStores;
      } catch (e) {
        return e;
      }
    });

    expect(result).to.have.all.keys(Object.keys(availableStores));
  });

  it('Website Should have LocalStorage', async () => {
    const result = await page.evaluate(() => {
      try {
        const x = Sifrr.Storage.getStorage({ priority: ['localstorage'] });
        x.store;
        return true;
      } catch (e) {
        return false;
      }
    });
    assert.equal(result, true);
  });

  it('Website Should have indexedDB', async () => {
    const result = await page.evaluate(() => {
      try {
        const x = Sifrr.Storage.getStorage({ priority: ['indexeddb'] });
        x.store;
        return true;
      } catch (e) {
        return false;
      }
    });
    assert.equal(result, true);
  });

  it('Website Should have websql', async () => {
    const result = await page.evaluate(() => {
      try {
        const x = Sifrr.Storage.getStorage({ priority: ['websql'] });
        x.store;
        return true;
      } catch (e) {
        return false;
      }
    });
    assert.equal(result, true);
  });

  it('Website Should have cookies', async () => {
    const result = await page.evaluate(() => {
      try {
        const x = Sifrr.Storage.getStorage({ priority: ['cookies'] });
        x.store;
        return true;
      } catch (e) {
        return false;
      }
    });
    assert.equal(result, true);
  });

  it('Sifrr.Storage should be indexeddb by default', async () => {
    const result = await page.evaluate(() => {
      try {
        return Sifrr.Storage.getStorage().type;
      } catch (e) {
        return false;
      }
    });
    assert.equal(result, 'indexeddb');
  });
});
