import { parseGetData, parseSetValue } from '../../src/utils/dataparser';
const JSONP = require('../../src/utils/json');

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

describe('JSON', () => {
  it('returns value if not parsable', () => {
    expect(JSONP.parse(null)).toEqual(null);
    expect(JSONP.parse(undefined)).toEqual(undefined);
  });
});
