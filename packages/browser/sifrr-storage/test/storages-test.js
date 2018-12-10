let Sifrr = {};
Sifrr.Storage = require('../src/sifrr.storage');
const chai = require('chai'),
  assert = chai.assert,
  should = chai.should(),
  expect = chai.expect,
  puppeteer = require('puppeteer');

let browser, page, server = require('./public/server');

for (let key in Sifrr.Storage.availableStores) {
  describe(`${key} in browser`, () => {
    before(async () => {
      server = server.listen(9999);
      browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      page = await browser.newPage();
      await page.setViewport( { width: 1280, height: 800} );
      await page.goto('http://localhost:9999/test.html');
      await page.addScriptTag({ path: './dist/sifrr.storage.js' });
      await page.addScriptTag({ url: 'http://localhost:9999/support.js' });
    });

    after(async () => {
      await browser.close();
      server.close();
    });

    it(`Setting priority to ${key} give ${key} instance`, async () => {
      const result = await page.evaluate(async (key) => {
        try {
          let storage = new Sifrr.Storage(key);
          return storage.type;
        } catch(e) {
          return e.message;
        }
      }, key);
      assert.equal(result, key);
    });

    it(`Giving options to ${key} give ${key} instance`, async () => {
      const result = await page.evaluate(async (key) => {
        try {
          let storage = new Sifrr.Storage(key);
          return storage.type;
        } catch(e) {
          return e.message;
        }
      }, key);
      assert.equal(result, key);
    });

    it(`Same table name for ${key} give same instance`, async () => {
      const result = await page.evaluate(async (key) => {
        try {
          let storage1 = new Sifrr.Storage(key);
          let storage2 = new Sifrr.Storage(key);
          return storage1 === storage2;
        } catch(e) {
          return e.message;
        }
      }, key);
      assert.equal(result, true);
    });

    it(`${key}.data gives all storage`, async () => {
      const result = await page.evaluate(async (key) => {
        try {
          eval(`save_${key}();`);
          let storage = new Sifrr.Storage(key);
          return storage.data();
        } catch(e) {
          return e.message;
        }
      }, key);
      assert.equal(result.a, 'b');
    });

    it(`${key}.select selects cookie`, async () => {
      const result = await page.evaluate(async (key) => {
        try {
          let storage = new Sifrr.Storage(key);
          await storage.insert('w', 'x');
          await storage.insert('y', 'z');
          return {
            y: await storage.select('y'),
            all: await storage.select(['w', 'y'])
          };
        } catch(e) {
          return e.message;
        }
      }, key);
      assert.equal(result.all.w, 'x');
      assert.equal(result.all.y, 'z');
      assert.equal(result.y.y, 'z');
    });

    it(`${key}.upsert updates or inserts cookie`, async () => {
      const result = await page.evaluate(async (key) => {
        try {
          let storage = new Sifrr.Storage(key);
          await storage.upsert('w', 'abc');
          await storage.upsert('y', 'abc');
          await storage.upsert('z', 'abc');
          await storage.upsert({ w: 'x', y: 'z' });
          return storage.data();
        } catch(e) {
          return e.message;
        }
      }, key);
      assert.equal(result['w'], 'x');
      assert.equal(result['y'], 'z');
      assert.equal(result['z'], 'abc');
    });

    it(`${key}.delete deletes cookie`, async () => {
      const result = await page.evaluate((key) => {
        try {
          let storage = new Sifrr.Storage(key);
          storage.insert('w', 'x');
          storage.insert('y', 'z');
          storage.insert('a', 'b');
          storage.delete('w');
          storage.delete(['y', 'a']);
          return storage.data();
        } catch(e) {
          return e.message;
        }
      }, key);
      expect(result['w']).to.be.an('undefined');
      expect(result['y']).to.be.an('undefined');
      expect(result['a']).to.be.an('undefined');
    });

    it('can handle multiple tables', async() => {
      const result = await page.evaluate(async (key) => {
        try {
          let st1 = new Sifrr.Storage({ priority: [key], name: 'first', version: 1 });
          let st2 = new Sifrr.Storage({ priority: [key], name: 'first', version: 2 });
          let st3 = new Sifrr.Storage({ priority: [key], name: 'third', version: 1 });
          await st1.insert('m', 'a');
          await st2.insert('m', 'b');
          await st3.insert('m', 'c');
          return [
            await st1.select('m'),
            await st2.select('m'),
            await st3.select('m')
          ];
        } catch(e) {
          return e.message;
        }
      }, key);
      assert.equal(result[0].m, 'a');
      assert.equal(result[1].m, 'b');
      assert.equal(result[2].m, 'c');
    });

    it(`${key}.insert works with json`, async () => {
      const result = await page.evaluate(async (key) => {
        try {
          let storage = new Sifrr.Storage(key);
          await storage.insert('aadi', { name: { first: 'aaditya' } });
          return storage.data();
        } catch(e) {
          return e.message;
        }
      }, key);
      assert.equal(result.aadi.name.first, 'aaditya');
    });

    it(`${key}.clear clears the storage`, async () => {
      const result = await page.evaluate(async (key) => {
        try {
          let storage = new Sifrr.Storage(key), ans = {};
          await storage.insert('a', 'b');
          ans.before = await storage.select('a');
          await storage.clear();
          ans.after = await storage.select('a');
          return ans;
        } catch(e) {
          return e.message;
        }
      }, key);
      assert.equal(result.before.a, 'b');
      assert.deepEqual(result.after, {});
    });
  });
}
