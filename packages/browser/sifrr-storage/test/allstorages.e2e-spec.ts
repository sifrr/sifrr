import * as SifrrStorage from '@/index';
import { expect, test } from '@playwright/test';

const stores = ['LocalStorageStore', 'CookieStore', 'IndexedDBStore', 'MemoryStore'] as const;

declare global {
  interface Window {
    Sifrr: {
      Storage: typeof SifrrStorage;
    };
  }
}

for (const key of stores) {
  test.describe(`${key} in browser`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`index.html`);
    });

    test(`Setting priority to ${key} give ${key} instance`, async ({ page }) => {
      const result = await page.evaluate(async (key) => {
        const storage = new window.Sifrr.Storage.Storage({ stores: [window.Sifrr.Storage[key]] });
        return !!storage;
      }, key);
      expect(result).toEqual(true);
    });

    if (key !== 'MemoryStore') {
      test(`${key}.all gives all data`, async ({ page }) => {
        const result = await page.evaluate(async (key) => {
          new Function(`save_${key}();`)();
          const storage = new window.Sifrr.Storage.Storage({
            stores: [window.Sifrr.Storage[key]],
            prefix: 'ss/'
          });
          return await storage.all();
        }, key);
        expect(result).toEqual({ a: 'b' });
      });
    }

    test(`${key}.get selects value`, async ({ page }) => {
      const result = await page.evaluate(async (key) => {
        const storage = new window.Sifrr.Storage.Storage({
          stores: [window.Sifrr.Storage[key]]
        });
        await storage.set('w', 'x');
        await storage.set('y', 'z');
        return {
          y: await storage.get('y'),
          w: await storage.get('w')
        };
      }, key);
      expect(result.w).toEqual('x');
      expect(result.y).toEqual('z');
    });

    test(`${key}.set updates or sets value`, async ({ page }) => {
      const result = await page.evaluate(async (key) => {
        const storage = new window.Sifrr.Storage.Storage({
          stores: [window.Sifrr.Storage[key]]
        });
        await storage.set('w', 'abc');
        await storage.set('y', 'abc');
        await storage.set('z', 'abc');
        await storage.set('w', 'xxx');
        await storage.set('y', 'zzz');
        return storage.all();
      }, key);
      expect(result.w).toEqual('xxx');
      expect(result.y).toEqual('zzz');
      expect(result.z).toEqual('abc');
    });

    test(`${key}.delete deletes value`, async ({ page }) => {
      const result = await page.evaluate((key) => {
        const storage = new window.Sifrr.Storage.Storage({
          stores: [window.Sifrr.Storage[key]]
        });
        storage.set('w', 'x');
        storage.set('y', 'z');
        storage.set('a', 'b');
        storage.delete('w');
        storage.delete('y');
        storage.delete('a');
        return storage.all();
      }, key);
      expect(result['w']).toEqual(undefined);
      expect(result['y']).toEqual(undefined);
      expect(result['a']).toEqual(undefined);
    });

    test('can handle multiple tables', async ({ page }) => {
      const result = await page.evaluate(async (key) => {
        const st1 = new window.Sifrr.Storage.Storage({
          stores: [window.Sifrr.Storage[key]],
          prefix: 'st1/'
        });
        const st2 = new window.Sifrr.Storage.Storage({
          stores: [window.Sifrr.Storage[key]],
          prefix: 'st2/'
        });
        const st3 = new window.Sifrr.Storage.Storage({
          stores: [window.Sifrr.Storage[key]],
          prefix: 'st2/'
        });
        await st1.set('m', 'a');
        await st2.set('m', 'b');
        return [await st1.get('m'), await st2.get('m'), await st3.get('m')];
      }, key);
      expect(result[0]).toEqual('a');
      expect(result[1]).toEqual('b');
      expect(result[2]).toEqual('b');
    });

    test(`${key}.set works with json`, async ({ page }) => {
      const result = await page.evaluate(async (key) => {
        const storage = new window.Sifrr.Storage.Storage({
          stores: [window.Sifrr.Storage[key]]
        });
        await storage.set('aadi', { name: { first: 'aaditya' } });
        return storage.all();
      }, key);
      expect(result.aadi?.name?.first).toEqual('aaditya');
    });

    test(`${key}.clear clears the storage`, async ({ page }) => {
      const result = await page.evaluate(async (key) => {
        const storage = new window.Sifrr.Storage.Storage({
            stores: [window.Sifrr.Storage[key]]
          }),
          ans: Record<string, any> = {};
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
      expect(result).toEqual({
        before: 'b',
        after: undefined,
        before2: 'b',
        after2: undefined
      });
    });

    test('saves value when it is falsy', async ({ page }) => {
      const result = await page.evaluate(async (key) => {
        const storage = new window.Sifrr.Storage.Storage({
          stores: [window.Sifrr.Storage[key]]
        });
        await storage.set('a', 0);
        await storage.set('f', false);
        return {
          zero: await storage.get('a'),
          false: await storage.get('f')
        };
      }, key);
      expect(result).toEqual({
        zero: 0,
        false: false
      });
    });

    test('works with ttl', async ({ page }) => {
      const result = await page.evaluate(async (key) => {
        const storage = new window.Sifrr.Storage.Storage({
          stores: [window.Sifrr.Storage[key]]
        });
        await storage.set('ttl', 1, 100);
        const before = await storage.get('ttl');
        await new Promise((res) => setTimeout(res, 110));
        const after = await storage.get('ttl');
        return {
          before: before,
          after: after
        };
      }, key);

      expect(result.before).toEqual(1);
      expect(result.after).toEqual(undefined);
    });

    test('memoizes with first argument', async ({ page }) => {
      const result = await page.evaluate(async (key) => {
        const storage = new window.Sifrr.Storage.Storage({
          stores: [window.Sifrr.Storage[key]]
        });
        let i = 0;
        const func = async (a: any) => a.k + i;
        const memoized = storage.memoize(func);
        const first = await memoized({ k: 'some' });
        i++;
        const second = await memoized({ k: 'some' });
        const nonMemoized = await memoized({ k: 'someNot' });
        return {
          first,
          second,
          nonMemoized
        };
      }, key);

      expect(result).toEqual({
        first: 'some0',
        second: 'some0',
        nonMemoized: 'someNot1'
      });
    });

    test('memoizes with key function', async ({ page }) => {
      const result = await page.evaluate(async (key) => {
        const storage = new window.Sifrr.Storage.Storage({
          stores: [window.Sifrr.Storage[key]]
        });
        let i = 0;
        const func = async (_a: string, _b: string) => i;
        const memoized = storage.memoize(func, (a, b) => a + b);
        const first = await memoized('some', 'ok');
        i++;
        const second = await memoized('some', 'lol');
        i++;
        const third = await memoized('some', 'lol');
        return {
          first,
          second,
          third
        };
      }, key);

      expect(result).toEqual({
        first: 0,
        second: 1,
        third: 1
      });
    });

    test.describe('works with all types of data', async () => {
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
        test(`works with ${type}`, async ({ page }) => {
          await page.evaluate(
            async ({ key, type }) => {
              const s = new window.Sifrr.Storage.Storage({
                stores: [window.Sifrr.Storage[key]]
              });
              await s.set(type, (window as any).AllDataTypes[type]);
              await new Promise((res) => setTimeout(res, 50));
            },
            { key, type }
          );

          await page.goto(`index.html`);
          const result = await page.evaluate(
            async ({ key, type }) => {
              const s = new window.Sifrr.Storage.Storage({
                stores: [window.Sifrr.Storage[key]]
              });
              const value = await s.get(type);
              return {
                sameInstance: value instanceof (window as any)[type],
                arrayEqual: (window as any).arrayEqual(value, (window as any).AllDataTypes[type]),
                exact: value === (window as any).AllDataTypes[type],
                value,
                correctValue: (window as any).AllDataTypes[type]
              };
            },
            { key, type }
          );

          if (key !== 'MemoryStore') {
            expect(
              result.exact || (result.sameInstance && result.arrayEqual),
              `${JSON.stringify(result)} was not as expected`
            ).toEqual(true);
          }
        });
      });
    });

    test.describe('speedtest', () => {
      test(key, async function ({ page }) {
        const result = await page.evaluate(async (key) => {
          return {
            ss: await (window as any).bulkInsert(key, 'a', 0, 100),
            lf: (window as any).LF[key]
              ? await (window as any).bulkInsert((window as any).LF[key], 'a', 0, 50, 'setItem')
              : 'not available',
            ssUpdate: await (window as any).bulkInsert(key, 'a', 0, 100),
            lfUpdate: (window as any).LF[key]
              ? await (window as any).bulkInsert((window as any).LF[key], 'a', 0, 50, 'setItem')
              : 'not available'
          };
        }, key);

        global.console.table(result);
      });
    });
  });
}
