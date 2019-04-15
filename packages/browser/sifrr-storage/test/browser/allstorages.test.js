for (let key in SifrrStorage.availableStores) {
  describe(`${key} in browser`, () => {
    before(async () => {
      await page.goto(`${PATH}/index.html`);
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

    it(`${key}.all gives all storage`, async () => {
      const result = await page.evaluate(async (key) => {
        try {
          (new Function(`save_${key}();`))();
          let storage = new Sifrr.Storage(key);
          return await storage.all();
        } catch(e) {
          return e.message;
        }
      }, key);
      assert.equal(result.a, 'b');
    });

    it(`${key}.get selects value`, async () => {
      const result = await page.evaluate(async (key) => {
        try {
          let storage = new Sifrr.Storage(key);
          await storage.set('w', 'x');
          await storage.set('y', 'z');
          return {
            y: await storage.get('y'),
            all: await storage.get(['w', 'y'])
          };
        } catch(e) {
          return e.message;
        }
      }, key);
      assert.equal(result.all.w, 'x');
      assert.equal(result.all.y, 'z');
      assert.equal(result.y.y, 'z');
    });

    it(`${key}.set updates or sets value`, async () => {
      const result = await page.evaluate(async (key) => {
        try {
          let storage = new Sifrr.Storage(key);
          await storage.set('w', 'abc');
          await storage.set('y', 'abc');
          await storage.set('z', 'abc');
          await storage.set({ w: 'x' });
          await storage.set({ y: 'z' });
          return storage.all();
        } catch(e) {
          return e.message;
        }
      }, key);
      assert.equal(result['w'], 'x');
      assert.equal(result['y'], 'z');
      assert.equal(result['z'], 'abc');
    });

    it(`${key}.del deletes value`, async () => {
      const result = await page.evaluate((key) => {
        try {
          let storage = new Sifrr.Storage(key);
          storage.set('w', 'x');
          storage.set('y', 'z');
          storage.set('a', 'b');
          storage.del('w');
          storage.del(['y', 'a']);
          return storage.all();
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
          await st1.set('m', 'a');
          await st2.set('m', 'b');
          await st3.set('m', 'c');
          return [
            await st1.get('m'),
            await st2.get('m'),
            await st3.get('m')
          ];
        } catch(e) {
          return e.message;
        }
      }, key);
      assert.equal(result[0].m, 'a');
      assert.equal(result[1].m, 'b');
      assert.equal(result[2].m, 'c');
    });

    it(`${key}.set works with json`, async () => {
      const result = await page.evaluate(async (key) => {
        try {
          let storage = new Sifrr.Storage(key);
          await storage.set('aadi', { name: { first: 'aaditya' } });
          return storage.all();
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
          await storage.set('a', 'b');
          ans.before = await storage.get('a');
          await storage.clear();
          ans.after = await storage.get('a');

          await storage.set('a', 'b');
          ans.before2 = await storage.get('a');
          await storage.clear();
          ans.after2 = await storage.get('a');
          return ans;
        } catch(e) {
          return e.message;
        }
      }, key);
      assert.equal(result.before.a, 'b');
      assert.equal(result.before2.a, 'b');
      assert.deepEqual(result.after, {});
      assert.deepEqual(result.after2, {});
    });

    it('gives all keys', async () => {
      const result = await page.evaluate(async (key) => {
        const storage = new Sifrr.Storage(key);
        await storage.set('a', 1);
        await storage.set('b', 2);
        return await storage.keys();
      }, key);

      expect(result).to.deep.equal(['a', 'b']);
    });

    it('saves value when it is falsy', async () => {
      const result = await page.evaluate(async (key) => {
        const storage = new Sifrr.Storage(key);
        await storage.set('a', 0);
        return (await storage.get('a')).a;
      }, key);

      expect(result).to.equal(0);
    });

    it('speed test', async () => {
      const result = await page.evaluate(async (key) => {
        return await bulkInsert(key, 'a', 0);
      }, key);

      global.console.log(key, result);
    });
  });
}
