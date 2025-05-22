const { availableStores } = require('../../src/sifrr.storage');

for (const key in availableStores) {
  describe(`${key} in browser`, () => {
    before(async () => {
      await page.goto(`${PATH}/index.html`);
    });

    it(`Setting priority to ${key} give ${key} instance`, async () => {
      const result = await page.evaluate(async (key) => {
        try {
          const storage = Sifrr.Storage.getStorage({ priority: [key] });
          return storage.type;
        } catch (e) {
          return e.message;
        }
      }, key);
      assert.equal(result, key);
    });

    it(`Giving options to ${key} give ${key} instance`, async () => {
      const result = await page.evaluate(async (key) => {
        try {
          const storage = Sifrr.Storage.getStorage(key);
          return storage.type;
        } catch (e) {
          return e.message;
        }
      }, key);
      assert.equal(result, key);
    });

    it(`Same table name for ${key} give same instance`, async () => {
      const result = await page.evaluate(async (key) => {
        try {
          const storage1 = Sifrr.Storage.getStorage(key);
          const storage2 = Sifrr.Storage.getStorage(key);
          return storage1 === storage2;
        } catch (e) {
          return e.message;
        }
      }, key);
      assert.equal(result, true);
    });

    it(`${key}.all gives all data`, async () => {
      const result = await page.evaluate(async (key) => {
        try {
          new Function(`save_${key}();`)();
          const storage = Sifrr.Storage.getStorage(key);
          return await storage.all();
        } catch (e) {
          return e.message;
        }
      }, key);
      assert.equal(result.a, 'b');
    });

    it(`${key}.get selects value`, async () => {
      const result = await page.evaluate(async (key) => {
        try {
          const storage = Sifrr.Storage.getStorage(key);
          await storage.set('w', 'x');
          await storage.set('y', 'z');
          return {
            y: await storage.get('y'),
            all: await storage.get(['w', 'y'])
          };
        } catch (e) {
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
          const storage = Sifrr.Storage.getStorage(key);
          await storage.set('w', 'abc');
          await storage.set('y', 'abc');
          await storage.set('z', 'abc');
          await storage.set({ w: 'x' });
          await storage.set({ y: 'z' });
          return storage.all();
        } catch (e) {
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
          const storage = Sifrr.Storage.getStorage(key);
          storage.set('w', 'x');
          storage.set('y', 'z');
          storage.set('a', 'b');
          storage.del('w');
          storage.del(['y', 'a']);
          return storage.all();
        } catch (e) {
          return e.message;
        }
      }, key);
      expect(result['w']).to.be.an('undefined');
      expect(result['y']).to.be.an('undefined');
      expect(result['a']).to.be.an('undefined');
    });

    it('can handle multiple tables', async () => {
      const result = await page.evaluate(async (key) => {
        try {
          const st1 = Sifrr.Storage.getStorage({ priority: [key], name: 'first', version: 1 });
          const st2 = Sifrr.Storage.getStorage({ priority: [key], name: 'first', version: 2 });
          const st3 = Sifrr.Storage.getStorage({ priority: [key], name: 'third', version: 1 });
          await st1.set('m', 'a');
          await st2.set('m', 'b');
          await st3.set('m', 'c');
          return [await st1.get('m'), await st2.get('m'), await st3.get('m')];
        } catch (e) {
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
          const storage = Sifrr.Storage.getStorage(key);
          await storage.set('aadi', { name: { first: 'aaditya' } });
          return storage.all();
        } catch (e) {
          return e.message;
        }
      }, key);
      assert.equal(result.aadi.name.first, 'aaditya');
    });

    it(`${key}.clear clears the storage`, async () => {
      const result = await page.evaluate(async (key) => {
        const storage = Sifrr.Storage.getStorage(key),
          ans = {};
        await storage.set('a', 'b');
        ans.before = await storage.get('a');
        await storage.clear();
        ans.after = await storage.get('a');

        await storage.set('a', 'b');
        ans.before2 = await storage.get('a');
        await storage.clear();
        ans.after2 = await storage.get('a');
        return ans;
      }, key);
      assert.equal(result.before.a, 'b');
      assert.equal(result.before2.a, 'b');
      assert.deepEqual(result.after, {});
      assert.deepEqual(result.after2, {});
    });

    it('gives all keys', async () => {
      const result = await page.evaluate(async (key) => {
        const storage = Sifrr.Storage.getStorage(key);
        await storage.set('a', 1);
        await storage.set('b', 2);
        return await storage.keys();
      }, key);

      expect(result).to.deep.equal(['a', 'b']);
    });

    it('saves value when it is falsy', async () => {
      const result = await page.evaluate(async (key) => {
        const storage = Sifrr.Storage.getStorage(key);
        await storage.set('a', 0);
        await storage.set('f', false);
        return {
          0: (await storage.get('a')).a,
          false: (await storage.get('f')).f
        };
      }, key);

      expect(result['0']).to.equal(0);
      expect(result['false']).to.equal(false);
    });

    it('works with ttl', async () => {
      const result = await page.evaluate(async (key) => {
        const storage = Sifrr.Storage.getStorage(key);
        await storage.set('ttl', { value: 1, ttl: 100 });
        const before = await storage.get('ttl');
        await delay(110);
        const after = await storage.get('ttl');
        return {
          before: before.ttl,
          after: after.ttl
        };
      }, key);

      expect(result.before).to.equal(1);
      expect(result.after).to.equal(undefined);
    });

    it('memoizes with first argument', async () => {
      const result = await page.evaluate(async (key) => {
        const storage = Sifrr.Storage.getStorage(key);
        let i = 0;
        const func = async () => i;
        const memoized = storage.memoize(func);
        const first = await memoized('some');
        i++;
        const second = await memoized('some', 'lol');
        const nonMemoized = await memoized('someNot');
        return {
          first,
          second,
          nonMemoized
        };
      }, key);

      expect(result).to.deep.equal({
        first: 0,
        second: 0,
        nonMemoized: 1
      });
    });

    it('memoizes with key function', async () => {
      const result = await page.evaluate(async (key) => {
        const storage = Sifrr.Storage.getStorage(key);
        let i = 0;
        const func = async () => i;
        const memoized = storage.memoize(func, (a, b) => a + b);
        const first = await memoized('some');
        i++;
        const second = await memoized('some', 'lol');
        return {
          first,
          second
        };
      }, key);

      expect(result).to.deep.equal({
        first: 0,
        second: 1
      });
    });

    describe('works with all types of data', async () => {
      const types = [
        'Array',
        'ArrayBuffer',
        'Blob',
        'Float32Array',
        'Float64Array',
        'Int8Array',
        'Int16Array',
        'Int32Array',
        'Number',
        'Object',
        'Uint8Array',
        'Uint16Array',
        'Uint32Array',
        'Uint8ClampedArray',
        'String'
      ];
      types.forEach((type) => {
        it(`works with ${type}`, async () => {
          await page.evaluate(
            async (key, type) => {
              const s = Sifrr.Storage.getStorage(key);
              await s.set(type, window.AllDataTypes[type]);
              await new Promise((res) => setTimeout(res, 50));
            },
            key,
            type
          );

          await page.goto(`${PATH}/index.html`);
          const result = await page.evaluate(
            async (key, type) => {
              const s = Sifrr.Storage.getStorage(key);
              const value = (await s.get(type))[type];
              return {
                sameInstance: value instanceof window[type],
                arrayEqual: arrayEqual(value, window.AllDataTypes[type]),
                exact: value === window.AllDataTypes[type],
                value,
                correctValue: window.AllDataTypes[type]
              };
            },
            key,
            type
          );

          if (key !== 'jsonstorage') {
            assert(
              result.exact || (result.sameInstance && result.arrayEqual),
              `${JSON.stringify(result)} was not as expected`
            );
          }
        });
      });
    });

    describe('speedtest', () => {
      it(key, async function () {
        this.timeout(0);

        const result = await page.evaluate(async (key) => {
          return {
            ss: await bulkInsert(key, 'a', 0, 50),
            lf: window.LF[key]
              ? await bulkInsert(window.LF[key], 'a', 0, 50, 'setItem')
              : 'not available',
            ssUpdate: await bulkInsert(key, 'a', 0, 50),
            lfUpdate: window.LF[key]
              ? await bulkInsert(window.LF[key], 'a', 0, 50, 'setItem')
              : 'not available'
          };
        }, key);

        global.console.table(result);
      });
    });
  });
}
