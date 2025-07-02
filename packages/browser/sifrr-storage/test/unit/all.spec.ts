import { parseGetData, parseSetValue } from '@/utils/dataparser';
import * as JSONP from '@/utils/json';

describe('Parser', () => {
  describe('#parseSetValue', () => {
    it('should return data with ttl, created at and value', () => {
      expect(parseSetValue('a').value).toEqual('a');
      expect(parseSetValue('a', 100).ttl).toEqual(100);
      expect(Date.now() - parseSetValue('a').createdAt).toBeLessThanOrEqual(100);
    });
  });

  describe('#parseGetData', () => {
    it('returns value if present', () => {
      expect(parseGetData({ value: 'b', createdAt: Date.now(), ttl: 0 })).toEqual('b');
    });

    it('returns if not present', () => {
      expect(parseGetData(undefined)).toEqual(undefined);
    });
  });
});

const ab = new Int8Array([1, 2, 3, 4, 5, 6, 7, 8]).buffer;
const allTypes = {
  Array: [1, 2, 3, 'a', 'b', '1234', new Int8Array(ab)],
  ArrayBuffer: ab,
  Float32Array: new Float32Array(ab),
  Float64Array: new Float64Array(ab),
  Int8Array: new Int8Array(ab),
  Int16Array: new Int16Array(ab),
  Int32Array: new Int32Array(ab),
  Number: 1234,
  Object: { a: 'b' },
  Uint8Array: new Uint8Array(ab),
  Uint8ClampedArray: new Uint8ClampedArray(ab),
  Uint16Array: new Uint16Array(ab),
  Uint32Array: new Uint32Array(ab),
  String: `<html lang="en" dir="ltr"><head>
    <meta charset="utf-8">`,
  obj: {
    Array: [1, 2, 3, 'a', 'b', '1234', new Int8Array(ab)],
    ArrayBuffer: ab,
    Float32Array: new Float32Array(ab),
    Float64Array: new Float64Array(ab),
    Int8Array: new Int8Array(ab),
    Int16Array: new Int16Array(ab),
    Int32Array: new Int32Array(ab),
    Number: 1234,
    Object: { a: 'b' },
    Uint8Array: new Uint8Array(ab),
    Uint8ClampedArray: new Uint8ClampedArray(ab),
    Uint16Array: new Uint16Array(ab),
    Uint32Array: new Uint32Array(ab),
    String: `<html lang="en" dir="ltr"><head>
    <meta charset="utf-8">`,
    undef: undefined,
    null: null,
    bigint: BigInt(234325345345345)
  }
};

describe('JSON', () => {
  it('returns value if not parsable', () => {
    expect(JSONP.parse(null)).toEqual(null);
    expect(JSONP.parse(undefined)).toEqual(undefined);
  });

  it('should be able to parse and stringify all types', () => {
    console.log(JSONP.parse(JSONP.stringify(JSONP.parse(JSONP.stringify(allTypes)))));
    expect(JSONP.stringify(allTypes)).toEqual(
      JSONP.stringify(JSONP.parse(JSONP.stringify(allTypes)))
    );
  });
});
